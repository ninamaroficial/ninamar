/**
 * WhatsApp Bot - Message Handler
 * Orquesta el flujo de conversación según el estado del usuario
 */

import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  sendDocumentMessage,
  sendImageMessage,
  markAsRead,
  getProfilePictureUrl,
} from './client'
import { getSession, saveSession, type ConversationSession, type CartItem, type SelectedCustomization } from './session'
import { getProductsForWhatsApp, getCategoriesForWhatsApp, getProductsByCategory, formatProductDetail, getProductCustomizationsForWhatsApp } from './catalog'
import { createWhatsAppOrder, getOrderStatus } from './orders'
import { BOT_CONFIG } from './config'
import { getDepartments, getCitiesByDepartment } from '@/lib/data/colombia-locations'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://niñamar.com'

/**
 * Punto de entrada principal - procesa cada mensaje entrante
 */
export async function handleIncomingMessage(
  message: any,
  contact: any,
  metadata: any
) {
  const phone = message.from
  const messageId = message.id
  const contactName = contact?.profile?.name || ''
  
  // Marcar como leído
  await markAsRead(messageId).catch(() => {})
  
  // Obtener sesión del usuario
  const session = await getSession(phone)
  
  // Obtener y guardar foto de perfil si no la tenemos (NO BLOQUEANTE)
  if (!session.profile_picture_url) {
    getProfilePictureUrl(phone)
      .then(profilePicUrl => {
        if (profilePicUrl && session) {
          session.profile_picture_url = profilePicUrl
          saveSession(session).catch(() => {})
        }
      })
      .catch(() => {}) // Ignorar errores silenciosamente
  }
  
  // ✅ Si está en modo manual, no procesar con el bot
  if (session.mode === 'manual') {
    console.log(`💬 Sesión en modo manual, bot no responderá: ${phone}`)
    return
  }
  
  // Guardar nombre si es la primera vez
  if (!session.customer_name && contactName) {
    session.customer_name = contactName
  }

  // Si estamos esperando comprobante y llega imagen/documento
  if (
    session.state === 'AWAITING_PAYMENT_PROOF' &&
    (message.type === 'image' || message.type === 'document')
  ) {
    await handlePaymentProofMessage(session, message)
    return
  }
  
  // Extraer texto del mensaje según tipo
  const userInput = extractUserInput(message)
  
  if (!userInput) return
  
  try {
    await routeMessage(session, userInput)
  } catch (error) {
    console.error('❌ Error in WhatsApp handler:', error)
    await sendTextMessage(phone, BOT_CONFIG.errorMessage)
  }
}

function extractUserInput(message: any): string | null {
  switch (message.type) {
    case 'text':
      return message.text.body.trim()
    case 'interactive':
      if (message.interactive.type === 'button_reply') {
        return message.interactive.button_reply.id
      }
      if (message.interactive.type === 'list_reply') {
        return message.interactive.list_reply.id
      }
      return null
    default:
      return null
  }
}

/**
 * Router principal - dirige el mensaje al handler correcto según el estado
 */
async function routeMessage(session: ConversationSession, input: string) {
  const inputLower = input.toLowerCase().trim()
  
  // Comandos globales (funcionan en cualquier estado)
  if (['hola', 'menu', 'menú', 'inicio', 'hi', 'hello', 'hey'].includes(inputLower)) {
    session.state = 'MAIN_MENU'
    session.temp_data = undefined
    await saveSession(session)
    return sendMainMenu(session)
  }
  
  if (['carrito', '🛒'].includes(inputLower) || input === 'MENU_CART') {
    return showCart(session)
  }
  
  // Botones globales que funcionan desde cualquier estado
  if (input === 'START_CHECKOUT') {
    return startCheckout(session)
  }
  
  if (input === 'MENU_CATALOG') {
    return showAllProducts(session)
  }
  
  if (input === 'MENU_CATEGORIES') {
    return showCategories(session)
  }
  
  if (input === 'BACK_MENU') {
    session.state = 'MAIN_MENU'
    session.temp_data = undefined
    await saveSession(session)
    return sendMainMenu(session)
  }
  
  if (inputLower === 'cancelar' || inputLower === 'salir') {
    session.state = 'MAIN_MENU'
    session.temp_data = undefined
    await saveSession(session)
    return sendTextMessage(session.phone, '✅ Operación cancelada. Escribe *Menú* para ver el menú.')
  }
  
  // Routing basado en estado
  switch (session.state) {
    case 'MAIN_MENU':
      return handleMainMenu(session, input)
    
    case 'BROWSING_CATEGORIES':
      return handleCategorySelection(session, input)
    
    case 'BROWSING_PRODUCTS':
      return handleProductSelection(session, input)
    
    case 'VIEWING_PRODUCT':
      return handleProductAction(session, input)

    case 'AWAITING_PAYMENT_PROOF':
      return handleAwaitingPaymentProof(session, input)
    
    case 'CUSTOMIZING_PRODUCT':
      return handleCustomizationSelection(session, input)
    
    case 'ENTERING_QUANTITY':
      return handleQuantity(session, input)
    
    case 'CART_ACTIONS':
      return handleCartAction(session, input)
    
    case 'CHECKOUT_NAME':
      return handleCheckoutName(session, input)
    
    case 'CHECKOUT_EMAIL':
      return handleCheckoutEmail(session, input)
    
    case 'CHECKOUT_DOCUMENT':
      return handleCheckoutDocument(session, input)
    
    case 'CHECKOUT_ADDRESS':
      return handleCheckoutAddress(session, input)
    
    case 'CHECKOUT_CITY':
      return handleCheckoutCity(session, input)
    
    case 'CHECKOUT_STATE':
      return handleCheckoutState(session, input)
    
    case 'CHECKOUT_CONFIRM':
      return handleCheckoutConfirm(session, input)
    
    case 'TRACKING_ORDER_NUMBER':
      return handleTrackingOrderNumber(session, input)
    
    case 'TRACKING_EMAIL':
      return handleTrackingEmail(session, input)
    
    default:
      // Estado desconocido: enviar menú
      await sendTextMessage(session.phone, '🤔 No entendí tu mensaje. Escribe *Menú* para ver el menú.')
      return
  }
}

// ─── MENÚ PRINCIPAL ──────────────────────────────────────────

async function sendMainMenu(session: ConversationSession) {
  const greeting = session.customer_name ? `¡Hola ${session.customer_name}! 👋` : '¡Hola! 👋'
  const cartCount = session.cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartInfo = cartCount > 0 ? `\n\n🛒 Tienes *${cartCount}* producto(s) en tu carrito.` : ''
  
  await sendListMessage(
    session.phone,
    `${greeting}\n\nBienvenido/a a *Niñamar* ✨\nAccesorios personalizados hechos a mano con amor 💜${cartInfo}\n\n¿Qué te gustaría hacer?`,
    'Ver opciones',
    [
      {
        title: 'Menú Principal',
        rows: [
          { id: 'MENU_CATALOG', title: '📖 Ver Catálogo', description: 'Explora nuestros productos' },
          { id: 'MENU_CATEGORIES', title: '🏷️ Ver Categorías', description: 'Buscar por categoría' },
          { id: 'MENU_CART', title: `🛒 Mi Carrito (${cartCount})`, description: 'Ver y gestionar tu carrito' },
          { id: 'MENU_TRACK', title: '📦 Seguir Pedido', description: 'Consultar estado de tu orden' },
          { id: 'MENU_PDF', title: '📄 Catálogo PDF', description: 'Recibir catálogo completo' },
          { id: 'MENU_WEB', title: '🌐 Visitar Web', description: 'niñamar.com' },
        ],
      },
    ],
    'Niñamar ✨',
    'Escribe "Menú" en cualquier momento para volver aquí'
  )
}

async function handleMainMenu(session: ConversationSession, input: string) {
  switch (input) {
    case 'MENU_CATALOG':
      return showAllProducts(session)
    
    case 'MENU_CATEGORIES':
      return showCategories(session)
    
    case 'MENU_CART':
      return showCart(session)
    
    case 'MENU_TRACK':
      return startTracking(session)
    
    case 'MENU_PDF':
      return sendCatalogPDF(session)
    
    case 'MENU_WEB':
      await sendTextMessage(
        session.phone,
        `🌐 Visita nuestra tienda online:\n\n${SITE_URL}\n\n¡Ahí podrás realizar pagos por PSE, ver todos nuestros productos con fotos detalladas y mucho más! ✨`
      )
      return
    
    case 'START_CHECKOUT':
      return startCheckout(session)
    
    default:
      // No entendió: mostrar el menú de nuevo
      await sendTextMessage(
        session.phone,
        '🤔 No entendí tu mensaje. Aquí está el menú principal:'
      )
      return sendMainMenu(session)
  }
}

// ─── CATÁLOGO ────────────────────────────────────────────────

async function showCategories(session: ConversationSession) {
  const categories = await getCategoriesForWhatsApp()
  
  if (categories.length === 0) {
    await sendTextMessage(session.phone, 'No hay categorías disponibles en este momento.')
    return sendMainMenu(session)
  }
  
  session.state = 'BROWSING_CATEGORIES'
  await saveSession(session)
  
  await sendListMessage(
    session.phone,
    '🏷️ *Nuestras Categorías*\n\nSelecciona una categoría para ver los productos disponibles:',
    'Ver categorías',
    [
      {
        title: 'Categorías',
        rows: categories.map((cat: { id: string; name: string; description: string | null }) => ({
          id: `CAT_${cat.id}`,
          title: cat.name,
          description: cat.description || undefined,
        })),
      },
    ]
  )
}

async function handleCategorySelection(session: ConversationSession, input: string) {
  if (!input.startsWith('CAT_')) {
    await sendTextMessage(session.phone, '🤔 Por favor selecciona una categoría de la lista, o escribe *Menú* para volver.')
    return
  }
  
  const categoryId = input.replace('CAT_', '')
  const products = await getProductsByCategory(categoryId)
  
  if (products.length === 0) {
    await sendTextMessage(session.phone, 'No hay productos disponibles en esta categoría por ahora. 😔')
    return showCategories(session)
  }
  
  session.state = 'BROWSING_PRODUCTS'
  session.temp_data = { source: 'category', categoryId }
  await saveSession(session)
  
  await sendListMessage(
    session.phone,
    `✨ Encontramos *${products.length}* producto(s):\n\nSelecciona uno para ver los detalles:`,
    'Ver productos',
    [
      {
        title: 'Productos',
        rows: products.map((p: { id: string; name: string; price: number; category_name?: string }) => {
          // Construir título con categoría si cabe en 24 chars
          let title = p.name
          if (p.category_name) {
            const withCategory = `${p.category_name} - ${p.name}`
            if (withCategory.length <= 24) {
              title = withCategory
            } else {
              // Si no cabe, intentar solo con las primeras 2 letras de categoría
              const shortWithCategory = `${p.category_name.substring(0, 2)}. ${p.name}`
              if (shortWithCategory.length <= 24) {
                title = shortWithCategory
              }
              // Si aún no cabe, solo mostrar el nombre truncado
              title = p.name.substring(0, 24)
            }
          } else if (title.length > 24) {
            title = title.substring(0, 24)
          }
          
          return {
            id: `PROD_${p.id}`,
            title,
            description: `$${p.price.toLocaleString('es-CO')}`,
          }
        }),
      },
    ]
  )
}

async function showAllProducts(session: ConversationSession) {
  const products = await getProductsForWhatsApp()
  
  if (products.length === 0) {
    await sendTextMessage(session.phone, 'No hay productos disponibles en este momento. 😔')
    return sendMainMenu(session)
  }
  
  session.state = 'BROWSING_PRODUCTS'
  session.temp_data = { source: 'all' }
  await saveSession(session)
  
  // WhatsApp Lists soportan máx. 10 items por sección, títulos máx 24 chars
  const sections = []
  for (let i = 0; i < products.length; i += 10) {
    const chunk = products.slice(i, i + 10)
    sections.push({
      title: i === 0 ? 'Nuestros Productos' : `Más productos (${i + 1}-${i + chunk.length})`,
      rows: chunk.map((p: { id: string; name: string; price: number; category_name?: string }) => {
        // Construir título con categoría si cabe en 24 chars
        let title = p.name
        if (p.category_name) {
          const withCategory = `${p.category_name} - ${p.name}`
          if (withCategory.length <= 24) {
            title = withCategory
          } else {
            // Si no cabe, intentar solo con las primeras 2 letras de categoría
            const shortWithCategory = `${p.category_name.substring(0, 2)}. ${p.name}`
            if (shortWithCategory.length <= 24) {
              title = shortWithCategory
            }
            // Si aún no cabe, solo mostrar el nombre truncado
            title = p.name.substring(0, 24)
          }
        } else if (title.length > 24) {
          title = title.substring(0, 24)
        }
        
        return {
          id: `PROD_${p.id}`,
          title,
          description: `$${p.price.toLocaleString('es-CO')}`,
        }
      }),
    })
  }
  
  await sendListMessage(
    session.phone,
    `📖 *Catálogo Niñamar*\n\n✨ Tenemos *${products.length}* productos disponibles.\nSelecciona uno para ver detalles:`,
    'Ver productos',
    sections
  )
}

async function handleProductSelection(session: ConversationSession, input: string) {
  if (!input.startsWith('PROD_')) {
    await sendTextMessage(session.phone, '🤔 Por favor selecciona un producto de la lista, o escribe *Menú* para volver.')
    return
  }
  
  const productId = input.replace('PROD_', '')
  const detail = await formatProductDetail(productId)
  
  if (!detail) {
    await sendTextMessage(session.phone, 'No se encontró el producto. 😔')
    return showAllProducts(session)
  }
  
  session.state = 'VIEWING_PRODUCT'
  session.temp_data = { 
    ...session.temp_data,
    currentProduct: {
      id: detail.id,
      name: detail.name,
      slug: detail.slug,
      price: detail.price,
      images: detail.images,
    }
  }
  await saveSession(session)
  
  // Enviar todas las imágenes disponibles en paralelo (primero todas las imágenes)
  if (detail.images && detail.images.length > 0) {
    await Promise.all(
      detail.images.map(imageUrl => sendImageMessage(session.phone, imageUrl))
    )
  }
  
  // Enviar info del producto después de que todas las imágenes se enviaron
  await sendTextMessage(session.phone, detail.text)
  
  // Botones de acción
  await sendButtonMessage(
    session.phone,
    '¿Qué te gustaría hacer?',
    [
      { id: 'ADD_TO_CART', title: '🛒 Agregar' },
      { id: 'VIEW_WEB', title: '🌐 Ver en web' },
      { id: 'BACK_MENU', title: '↩️ Volver' },
    ]
  )
}

async function handleProductAction(session: ConversationSession, input: string) {
  const product = session.temp_data?.currentProduct
  
  switch (input) {
    case 'ADD_TO_CART':
      if (!product) return sendMainMenu(session)
      
      // Verificar si el producto tiene opciones de personalización
      const customizations = await getProductCustomizationsForWhatsApp(product.id)
      
      if (customizations.length > 0) {
        // Iniciar flujo de personalización
        session.state = 'CUSTOMIZING_PRODUCT'
        session.temp_data = {
          ...session.temp_data,
          customizations,
          currentCustomizationIndex: 0,
          selectedCustomizations: [],
          basePrice: product.price,
        }
        await saveSession(session)
        return showCustomizationOption(session)
      } else {
        // Producto sin personalización - ir directo a cantidad
        session.state = 'ENTERING_QUANTITY'
        await saveSession(session)
        await sendTextMessage(
          session.phone,
          `¿Cuántas unidades de *${product.name}* deseas agregar?\n\nEscribe un número (1-10):`
        )
      }
      return
    
    case 'VIEW_WEB':
      if (product?.slug) {
        await sendTextMessage(
          session.phone,
          `🌐 Mira este producto en nuestra web:\n\n${SITE_URL}/productos/${product.slug}/personalizar\n\n¡Ahí puedes personalizarlo a tu gusto! ✨`
        )
      }
      return
    
    case 'BACK_MENU':
      session.state = 'MAIN_MENU'
      session.temp_data = undefined
      await saveSession(session)
      return sendMainMenu(session)
    
    default:
      await sendTextMessage(session.phone, '🤔 Por favor usa los botones de arriba, o escribe *hola* para volver al menú.')
      return
  }
}

// ─── PERSONALIZACIÓN ─────────────────────────────────────────

async function showCustomizationOption(session: ConversationSession) {
  const customizations = session.temp_data?.customizations || []
  const currentIndex = session.temp_data?.currentCustomizationIndex || 0
  const selectedCustomizations = session.temp_data?.selectedCustomizations || []
  const product = session.temp_data?.currentProduct
  
  if (currentIndex >= customizations.length) {
    // Ya terminó todas las personalizaciones - ir a cantidad
    session.state = 'ENTERING_QUANTITY'
    await saveSession(session)
    
    // Mostrar resumen de personalizaciones y precio
    let summaryText = `✅ *Personalización completa*\n\n`
    summaryText += `📦 *${product?.name}*\n`
    summaryText += `💰 Precio base: $${session.temp_data.basePrice.toLocaleString('es-CO')}\n\n`
    
    if (selectedCustomizations.length > 0) {
      summaryText += `🎨 *Tu personalización:*\n\n`
      selectedCustomizations.forEach((custom: SelectedCustomization) => {
        summaryText += `• ${custom.optionName}: *${custom.valueName}*`
        if (custom.additionalPrice > 0) {
          summaryText += ` (+$${custom.additionalPrice.toLocaleString('es-CO')})`
        }
        summaryText += '\n'
      })
      
      const totalAdditional = selectedCustomizations.reduce((sum: number, c: SelectedCustomization) => sum + c.additionalPrice, 0)
      const totalPrice = session.temp_data.basePrice + totalAdditional
      
      if (totalAdditional > 0) {
        summaryText += `\n💵 *Precio total: $${totalPrice.toLocaleString('es-CO')}*\n`
      }
    }
    
    summaryText += `\n¿Cuántas unidades deseas agregar? (1-10):`
    
    await sendTextMessage(session.phone, summaryText)
    return
  }
  
  const currentOption = customizations[currentIndex]
  const progress = `[${currentIndex + 1}/${customizations.length}]`
  const requiredLabel = currentOption.is_required ? '(Requerido)' : '(Opcional)'
  
  let optionText = `${progress} 🎨 *${currentOption.display_name}* ${requiredLabel}\n\n`
  
  if (currentOption.description) {
    optionText += `${currentOption.description}\n\n`
  }
  
  optionText += `Selecciona una opción:`
  
  // Preparar opciones según el tipo y cantidad de valores
  const values = currentOption.values || []
  
  if (values.length === 0) {
    // No hay valores disponibles - saltar esta opción
    session.temp_data.currentCustomizationIndex++
    await saveSession(session)
    return showCustomizationOption(session)
  }
  
  // Si tiene 3 o menos valores, usar botones; si tiene más, usar lista
  if (values.length <= 3) {
    const buttons = values.map((v: any) => {
      let title = v.display_name || v.value
      if (v.additional_price > 0) {
        title += ` +$${v.additional_price.toLocaleString('es-CO')}`
      }
      // Truncar a 20 caracteres (límite de botones de WhatsApp)
      if (title.length > 20) title = title.substring(0, 17) + '...'
      
      return {
        id: `CUSTOM_${currentOption.id}_${v.id}`,
        title,
      }
    })
    
    // Si es opcional, agregar botón de "Saltar"
    if (!currentOption.is_required && buttons.length < 3) {
      buttons.push({ id: 'SKIP_CUSTOMIZATION', title: '⏭️ Omitir' })
    }
    
    await sendTextMessage(session.phone, optionText)
    await sendButtonMessage(session.phone, 'Elige:', buttons)
  } else {
    // Usar lista para más opciones
    const rows = values.map((v: any) => {
      let description = ''
      if (v.additional_price > 0) {
        description = `+$${v.additional_price.toLocaleString('es-CO')}`
      } else {
        description = 'Sin cargo extra'
      }
      
      return {
        id: `CUSTOM_${currentOption.id}_${v.id}`,
        title: (v.display_name || v.value).substring(0, 24),
        description,
      }
    })
    
    // Si es opcional, agregar opción de saltar
    if (!currentOption.is_required) {
      rows.push({
        id: 'SKIP_CUSTOMIZATION',
        title: '⏭️ Omitir esta opción',
        description: 'Continuar sin seleccionar',
      })
    }
    
    await sendListMessage(
      session.phone,
      optionText,
      'Ver opciones',
      [{ title: currentOption.display_name, rows }]
    )
  }
}

async function handleCustomizationSelection(session: ConversationSession, input: string) {
  if (input === 'SKIP_CUSTOMIZATION') {
    // Saltar opción actual (solo si es opcional)
    const currentOption = session.temp_data?.customizations?.[session.temp_data?.currentCustomizationIndex]
    if (currentOption && !currentOption.is_required) {
      session.temp_data.currentCustomizationIndex++
      await saveSession(session)
      return showCustomizationOption(session)
    } else {
      await sendTextMessage(session.phone, '⚠️ Esta opción es requerida, por favor selecciona un valor.')
      return
    }
  }
  
  // Parsear selección: CUSTOM_{optionId}_{valueId}
  if (!input.startsWith('CUSTOM_')) {
    await sendTextMessage(session.phone, '🤔 Por favor selecciona una opción de las mostradas arriba.')
    return
  }
  
  const parts = input.split('_')
  if (parts.length !== 3) {
    await sendTextMessage(session.phone, '🤔 Selección inválida. Por favor intenta de nuevo.')
    return
  }
  
  const optionId = parts[1]
  const valueId = parts[2]
  
  // Buscar la opción y el valor
  const currentOption = session.temp_data?.customizations?.find((opt: any) => opt.id === optionId)
  const selectedValue = currentOption?.values?.find((v: any) => v.id === valueId)
  
  if (!currentOption || !selectedValue) {
    await sendTextMessage(session.phone, '❌ Error al procesar la selección. Por favor intenta de nuevo.')
    return
  }
  
  // Guardar selección
  const customization: SelectedCustomization = {
    optionId: currentOption.id,
    optionName: currentOption.display_name,
    valueId: selectedValue.id,
    valueName: selectedValue.display_name || selectedValue.value,
    additionalPrice: selectedValue.additional_price || 0,
  }
  
  session.temp_data.selectedCustomizations.push(customization)
  
  // Avanzar a la siguiente opción
  session.temp_data.currentCustomizationIndex++
  await saveSession(session)
  
  // Confirmar selección y continuar
  let confirmText = `✅ Seleccionaste: *${customization.valueName}*`
  if (customization.additionalPrice > 0) {
    confirmText += ` (+$${customization.additionalPrice.toLocaleString('es-CO')})`
  }
  await sendTextMessage(session.phone, confirmText)
  
  return showCustomizationOption(session)
}

async function handleQuantity(session: ConversationSession, input: string) {
  const quantity = parseInt(input)
  const product = session.temp_data?.currentProduct
  const selectedCustomizations = session.temp_data?.selectedCustomizations || []
  const basePrice = session.temp_data?.basePrice || product?.price || 0
  
  if (!product) {
    return sendMainMenu(session)
  }
  
  if (isNaN(quantity) || quantity < 1 || quantity > 10) {
    await sendTextMessage(session.phone, 'Por favor ingresa un número entre 1 y 10.')
    return
  }
  
  // Calcular precio total con personalizaciones
  const additionalPrice = selectedCustomizations.reduce((sum: number, c: SelectedCustomization) => sum + c.additionalPrice, 0)
  const totalPrice = basePrice + additionalPrice
  
  // Crear item del carrito
  const cartItem: CartItem = {
    product_id: product.id,
    product_name: product.name,
    product_slug: product.slug,
    product_image: product.image,
    price: totalPrice,  // Precio con personalizaciones incluidas
    quantity,
  }
  
  // Agregar personalizaciones si existen
  if (selectedCustomizations.length > 0) {
    cartItem.selectedOptions = selectedCustomizations
  }
  
  // Agregar al carrito (sin fusionar con items existentes si tienen personalizaciones diferentes)
  session.cart.push(cartItem)
  
  session.state = 'MAIN_MENU'
  session.temp_data = undefined
  await saveSession(session)
  
  const totalItems = session.cart.reduce((sum, item) => sum + item.quantity, 0)
  
  let confirmText = `✅ *${quantity}x ${product.name}*`
  if (selectedCustomizations.length > 0) {
    confirmText += ' personalizado'
  }
  confirmText += ` agregado al carrito.\n\n🛒 Total de productos: *${totalItems}*`
  
  await sendButtonMessage(
    session.phone,
    confirmText,
    [
      { id: 'MENU_CART', title: '🛒 Ver Carrito' },
      { id: 'MENU_CATALOG', title: '📖 Seguir viendo' },
      { id: 'START_CHECKOUT', title: '💳 Hacer pedido' },
    ]
  )
}

// ─── CARRITO ─────────────────────────────────────────────────

async function showCart(session: ConversationSession) {
  if (session.cart.length === 0) {
    await sendButtonMessage(
      session.phone,
      '🛒 Tu carrito está vacío.\n\n¿Quieres explorar nuestros productos?',
      [
        { id: 'MENU_CATALOG', title: '📖 Ver Catálogo' },
        { id: 'MENU_CATEGORIES', title: '🏷️ Categorías' },
      ]
    )
    session.state = 'MAIN_MENU'
    await saveSession(session)
    return
  }
  
  let cartText = '🛒 *Tu Carrito*\n\n'
  let subtotal = 0
  
  session.cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity
    subtotal += itemTotal
    cartText += `${i + 1}. *${item.product_name}*\n`
    
    // Mostrar personalizaciones si existen
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      item.selectedOptions.forEach(opt => {
        cartText += `   • ${opt.optionName}: ${opt.valueName}`
        if (opt.additionalPrice > 0) {
          cartText += ` (+$${opt.additionalPrice.toLocaleString('es-CO')})`
        }
        cartText += '\n'
      })
    }
    
    cartText += `   ${item.quantity}x $${item.price.toLocaleString('es-CO')} = $${itemTotal.toLocaleString('es-CO')}\n\n`
  })
  
  cartText += `─────────────\n`
  cartText += `💰 *Subtotal: $${subtotal.toLocaleString('es-CO')}*\n`
  cartText += `📦 Envío: Se calcula al finalizar\n`
  
  session.state = 'CART_ACTIONS'
  await saveSession(session)
  
  await sendTextMessage(session.phone, cartText)
  
  await sendButtonMessage(
    session.phone,
    '¿Qué deseas hacer?',
    [
      { id: 'START_CHECKOUT', title: '💳 Hacer pedido' },
      { id: 'CLEAR_CART', title: '🗑️ Vaciar carrito' },
      { id: 'BACK_MENU', title: '↩️ Volver' },
    ]
  )
}

async function handleCartAction(session: ConversationSession, input: string) {
  switch (input) {
    case 'START_CHECKOUT':
      return startCheckout(session)
    
    case 'CLEAR_CART':
      session.cart = []
      session.state = 'MAIN_MENU'
      await saveSession(session)
      await sendTextMessage(session.phone, '🗑️ Carrito vaciado.')
      return sendMainMenu(session)
    
    case 'BACK_MENU':
      session.state = 'MAIN_MENU'
      await saveSession(session)
      return sendMainMenu(session)
    
    default:
      await sendTextMessage(session.phone, '🤔 Por favor usa los botones de arriba, o escribe *Menú* para volver.')
      return
  }
}

// ─── CHECKOUT ────────────────────────────────────────────────

async function startCheckout(session: ConversationSession) {
  if (session.cart.length === 0) {
    await sendTextMessage(session.phone, 'Tu carrito está vacío. Agrega productos primero. 🛒')
    return sendMainMenu(session)
  }
  
  session.state = 'CHECKOUT_NAME'
  await saveSession(session)
  
  const prefill = session.customer_name ? ` (¿es *${session.customer_name}*?)` : ''
  await sendTextMessage(
    session.phone,
    `📝 *Datos de Envío*\n\nVamos a completar tu pedido paso a paso.\n\n*1/6* ¿Cuál es tu nombre completo?${prefill}\n\nEscribe tu nombre o "sí" para confirmar:`
  )
}

async function handleCheckoutName(session: ConversationSession, input: string) {
  if (['sí', 'si', 'yes', 's'].includes(input.toLowerCase()) && session.customer_name) {
    // Usar nombre existente
  } else {
    session.customer_name = input
  }
  
  session.state = 'CHECKOUT_EMAIL'
  await saveSession(session)
  
  const prefill = session.customer_email ? ` (¿es *${session.customer_email}*?)` : ''
  await sendTextMessage(
    session.phone,
    `✅ Nombre: *${session.customer_name}*\n\n*2/6* ¿Cuál es tu email?${prefill}\n\nEscribe tu email o "sí" para confirmar:`
  )
}

async function handleCheckoutEmail(session: ConversationSession, input: string) {
  if (['sí', 'si', 'yes', 's'].includes(input.toLowerCase()) && session.customer_email) {
    // Usar email existente
  } else {
    // Validar email básico
    if (!input.includes('@') || !input.includes('.')) {
      await sendTextMessage(session.phone, '⚠️ Por favor ingresa un email válido (ejemplo: tu@correo.com)')
      return
    }
    session.customer_email = input.toLowerCase().trim()
  }
  
  session.state = 'CHECKOUT_DOCUMENT'
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Email: *${session.customer_email}*\n\n*3/6* ¿Cuál es tu número de cédula?`
  )
}

async function handleCheckoutDocument(session: ConversationSession, input: string) {
  session.customer_document = input.trim()
  session.state = 'CHECKOUT_STATE'
  session.temp_data = { ...session.temp_data, city_page: 0, dept_page: 0 }
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Documento: *${session.customer_document}*\n\n*4/6* Selecciona tu *departamento*:`
  )
  return showDepartmentList(session)
}

async function handleCheckoutState(session: ConversationSession, input: string) {
  const departments = getDepartments()
  let selectedDepartment = ''

  if (input.startsWith('DEPT_NEXT_') || input.startsWith('DEPT_PREV_')) {
    const page = parseInt(input.split('_').pop() || '0', 10)
    session.temp_data = { ...session.temp_data, dept_page: Math.max(0, page) }
    await saveSession(session)
    return showDepartmentList(session)
  }

  if (input.startsWith('DEPT_')) {
    const deptId = parseInt(input.replace('DEPT_', ''), 10)
    selectedDepartment = departments.find(d => d.id === deptId)?.name || ''
  } else {
    const match = departments.find(d => d.name.toLowerCase() === input.toLowerCase().trim())
    selectedDepartment = match?.name || ''
  }

  if (!selectedDepartment) {
    await sendTextMessage(session.phone, '🤔 Por favor selecciona un departamento de la lista.')
    return showDepartmentList(session)
  }

  session.customer_state = selectedDepartment
  session.state = 'CHECKOUT_CITY'
  session.temp_data = { ...session.temp_data, city_page: 0 }
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Departamento: *${session.customer_state}*\n\n*5/6* Selecciona tu *ciudad/municipio*:`
  )
  return showCityList(session)
}

async function handleCheckoutCity(session: ConversationSession, input: string) {
  if (!session.customer_state) {
    await sendTextMessage(session.phone, '⚠️ Primero debes seleccionar un departamento.')
    return showDepartmentList(session)
  }

  const cities = getCitiesByDepartment(session.customer_state)
  const inputLower = input.toLowerCase().trim()

  if (input.startsWith('CITY_NEXT_') || input.startsWith('CITY_PREV_')) {
    const page = parseInt(input.split('_').pop() || '0', 10)
    session.temp_data = { ...session.temp_data, city_page: Math.max(0, page) }
    await saveSession(session)
    return showCityList(session)
  }

  let selectedCity = ''
  if (input.startsWith('CITY_')) {
    const cityId = parseInt(input.replace('CITY_', ''), 10)
    selectedCity = cities.find(c => c.id === cityId)?.name || ''
  } else {
    const match = cities.find(c => c.name.toLowerCase() === inputLower)
    selectedCity = match?.name || ''
  }

  if (!selectedCity) {
    await sendTextMessage(session.phone, '🤔 Por favor selecciona una ciudad de la lista.')
    return showCityList(session)
  }

  session.customer_city = selectedCity
  session.state = 'CHECKOUT_ADDRESS'
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Ciudad: *${session.customer_city}*\n\n*6/6* ¿Cuál es tu dirección de envío completa?\n\n(Incluye barrio, calle, número, referencias)`
  )
}

async function showDepartmentList(session: ConversationSession) {
  const departments = getDepartments()
  const pageSize = 8
  const page = session.temp_data?.dept_page || 0

  const popularDepartments = [
    'Cauca',
    'Valle del Cauca',
    'Nariño',
    'Antioquia',
    'Cundinamarca',
    'Bogotá D.C.',
    'Atlántico',
    'Santander',
  ]

  const sortedDepartments = [...departments].sort((a, b) =>
    a.name.localeCompare(b.name, 'es-CO')
  )

  const popularList = popularDepartments
    .map(name => departments.find(d => d.name === name))
    .filter(Boolean) as { id: number; name: string }[]

  const popularNames = new Set(popularList.map(d => d.name))
  const alphabeticList = sortedDepartments.filter(d => !popularNames.has(d.name))

  const combinedList = page === 0
    ? [...popularList, ...alphabeticList]
    : alphabeticList

  const offset = page === 0 ? 0 : (page - 1) * pageSize
  const pageDepartments = combinedList.slice(offset, offset + pageSize)

  const rows: { id: string; title: string; description?: string }[] = pageDepartments.map((dept) => ({
    id: `DEPT_${dept.id}`,
    title: dept.name.substring(0, 24),
  }))

  if (page > 0) {
    rows.push({
      id: `DEPT_PREV_${page - 1}`,
      title: '⬅️ Anterior',
      description: 'Ver departamentos anteriores',
    })
  }

  const remainingCount = combinedList.length - (offset + pageSize)
  if (remainingCount > 0) {
    rows.push({
      id: `DEPT_NEXT_${page + 1}`,
      title: '➡️ Siguiente',
      description: 'Ver más departamentos',
    })
  }

  await sendListMessage(
    session.phone,
    'Selecciona tu departamento:',
    'Ver departamentos',
    [{ title: 'Departamentos', rows }]
  )
}

async function showCityList(session: ConversationSession) {
  if (!session.customer_state) return

  const cities = getCitiesByDepartment(session.customer_state)
  const pageSize = 8
  const page = session.temp_data?.city_page || 0
  const popularCitiesByDepartment: Record<string, string[]> = {
    'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'El Tambo', 'Patía', 'Guachené', 'Timbío'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga', 'Cartago', 'Jamundí', 'Yumbo'],
    'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'Samaniego', 'La Unión', 'Sandoná', 'Barbacoas'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Apartadó', 'Turbo', 'Sabaneta'],
    'Cundinamarca': ['Soacha', 'Zipaquirá', 'Chía', 'Facatativá', 'Girardot', 'Fusagasugá', 'Madrid', 'Mosquera'],
    'Bogotá D.C.': ['Bogotá D.C.'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 'Galapa', 'Sabanalarga', 'Sabanagrande', 'Baranoa'],
    'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Rionegro'],
  }

  const sortedCities = [...cities].sort((a, b) =>
    a.name.localeCompare(b.name, 'es-CO')
  )

  const popularCityNames = popularCitiesByDepartment[session.customer_state] || []
  const popularCityList = popularCityNames
    .map(name => cities.find(c => c.name === name))
    .filter(Boolean) as { id: number; name: string }[]

  const popularCitySet = new Set(popularCityList.map(c => c.name))
  const alphabeticCities = sortedCities.filter(c => !popularCitySet.has(c.name))

  const combinedCities = page === 0
    ? [...popularCityList, ...alphabeticCities]
    : alphabeticCities

  const offset = page === 0 ? 0 : (page - 1) * pageSize
  const pageCities = combinedCities.slice(offset, offset + pageSize)

  const rows: { id: string; title: string; description?: string }[] = pageCities.map((city) => ({
    id: `CITY_${city.id}`,
    title: city.name.substring(0, 24),
  }))

  if (page > 0) {
    rows.push({
      id: `CITY_PREV_${page - 1}`,
      title: '⬅️ Anterior',
      description: 'Ver ciudades anteriores',
    })
  }

  const remainingCount = combinedCities.length - (offset + pageSize)
  if (remainingCount > 0) {
    rows.push({
      id: `CITY_NEXT_${page + 1}`,
      title: '➡️ Siguiente',
      description: 'Ver más ciudades',
    })
  }

  await sendListMessage(
    session.phone,
    `Departamento: *${session.customer_state}*\nSelecciona tu ciudad:`,
    'Ver ciudades',
    [{ title: 'Ciudades', rows }]
  )
}

async function handleCheckoutAddress(session: ConversationSession, input: string) {
  session.customer_address = input.trim()
  session.state = 'CHECKOUT_CONFIRM'
  await saveSession(session)
  
  // Calcular costos
  let subtotal = 0
  session.cart.forEach(item => {
    subtotal += item.price * item.quantity
  })
  
  const { calculateShipping, FREE_SHIPPING_THRESHOLD } = await import('@/lib/shipping/rates')
  const shippingCost = calculateShipping(
    session.customer_state || '',
    session.customer_city || '',
    subtotal
  )
  const total = subtotal + shippingCost
  
  // Mostrar resumen
  let summary = '📋 *Resumen de tu Pedido*\n\n'
  summary += '👤 *Datos:*\n'
  summary += `• Nombre: ${session.customer_name}\n`
  summary += `• Email: ${session.customer_email}\n`
  summary += `• Cédula: ${session.customer_document}\n`
  summary += `• Teléfono: ${session.phone}\n\n`
  summary += '📍 *Dirección de envío:*\n'
  summary += `• ${session.customer_address}\n`
  summary += `• ${session.customer_city}, ${session.customer_state}\n\n`
  summary += '🛒 *Productos:*\n'
  
  session.cart.forEach(item => {
    const itemTotal = item.price * item.quantity
    summary += `• ${item.quantity}x ${item.product_name} - $${itemTotal.toLocaleString('es-CO')}\n`
  })
  
  summary += `\n💰 *Subtotal: $${subtotal.toLocaleString('es-CO')}*\n`
  
  if (shippingCost === 0) {
    summary += `🎉 *Envío: GRATIS* (¡Superaste $${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CO')}!)\n`
  } else {
    summary += `🚚 *Envío: $${shippingCost.toLocaleString('es-CO')}*\n`
  }
  
  summary += `\n💵 *TOTAL: $${total.toLocaleString('es-CO')}*`
  
  await sendTextMessage(session.phone, summary)
  
  await sendButtonMessage(
    session.phone,
    '¿Confirmas este pedido?',
    [
      { id: 'CONFIRM_ORDER', title: '✅ Confirmar' },
      { id: 'CANCEL_ORDER', title: '❌ Cancelar' },
    ]
  )
}

async function handleCheckoutConfirm(session: ConversationSession, input: string) {
  if (input === 'CONFIRM_ORDER') {
    try {
      const order = await createWhatsAppOrder(session)
      
      // Limpiar carrito y guardar estado de pago pendiente
      session.cart = []
      session.state = 'AWAITING_PAYMENT_PROOF'
      session.temp_data = {
        pending_payment: {
          order_id: order.id,
          order_number: order.order_number,
          total: order.total,
        },
        payment_proof_received: false,
      }
      await saveSession(session)
      
      await sendTextMessage(
        session.phone,
        `🎉 *¡Pedido creado exitosamente!*\n\n` +
        `📋 Número de orden: *${order.order_number}*\n` +
        `💰 Total: *$${order.total.toLocaleString('es-CO')}*\n\n` +
        `Para continuar, realiza el pago en una de estas cuentas:\n\n` +
        `✅ *Nequi:* 3187730058\n` +
        `✅ *Bancolombia:* 868-737560-14\n\n` +
        `Luego envíanos el *comprobante de pago* aquí mismo (foto).\n\n` +
        `Cuando validemos tu pago, te confirmaremos y enviaremos el correo. 💜`
      )
    } catch (error) {
      console.error('❌ Error creating order via WhatsApp:', error)
      await sendTextMessage(
        session.phone,
        '😔 Hubo un error creando tu pedido. Por favor intenta de nuevo o visita nuestra web.'
      )
    }
  } else {
    session.state = 'MAIN_MENU'
    await saveSession(session)
    await sendTextMessage(session.phone, '❌ Pedido cancelado. Tu carrito permanece intacto.')
    return sendMainMenu(session)
  }
}

async function handleAwaitingPaymentProof(session: ConversationSession, input: string) {
  const inputLower = input.toLowerCase().trim()

  if (inputLower.includes('ya pague') || inputLower.includes('pague')) {
    await sendTextMessage(
      session.phone,
      '✅ Gracias. Por favor envíanos el *comprobante de pago* (foto o PDF) para validar tu pedido.'
    )
    return
  }

  await sendTextMessage(
    session.phone,
    '📎 Para continuar, necesitamos el *comprobante de pago*. Envíalo como foto o PDF.'
  )
}

async function handlePaymentProofMessage(session: ConversationSession, message: any) {
  const mediaId = message.image?.id || message.document?.id || null

  session.temp_data = {
    ...session.temp_data,
    payment_proof_received: true,
    last_payment_media_id: mediaId,
    last_payment_message_id: message.id,
  }
  await saveSession(session)

  await sendTextMessage(
    session.phone,
    '✅ Recibimos tu comprobante. Lo revisaremos y te confirmaremos cuando el pago sea validado.'
  )
}

// ─── SEGUIMIENTO ─────────────────────────────────────────────

async function startTracking(session: ConversationSession) {
  session.state = 'TRACKING_ORDER_NUMBER'
  session.temp_data = {}
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    '📦 *Seguimiento de Pedido*\n\nPor favor ingresa tu *número de orden*:\n\n(Ejemplo: NM-001234)'
  )
}

async function handleTrackingOrderNumber(session: ConversationSession, input: string) {
  session.temp_data = { ...session.temp_data, orderNumber: input.trim().toUpperCase() }
  session.state = 'TRACKING_EMAIL'
  await saveSession(session)
  
  const prefill = session.customer_email ? `\n\n(¿es *${session.customer_email}*? Escribe "sí")` : ''
  await sendTextMessage(
    session.phone,
    `📋 Orden: *${session.temp_data.orderNumber}*\n\nAhora ingresa el *email* con el que hiciste el pedido:${prefill}`
  )
}

async function handleTrackingEmail(session: ConversationSession, input: string) {
  let email = input.trim().toLowerCase()
  
  if (['sí', 'si', 'yes', 's'].includes(email) && session.customer_email) {
    email = session.customer_email
  }
  
  const orderNumber = session.temp_data?.orderNumber
  
  if (!orderNumber) {
    return startTracking(session)
  }
  
  try {
    const status = await getOrderStatus(orderNumber, email)
    
    if (!status) {
      await sendTextMessage(
        session.phone,
        '❌ No encontramos una orden con esos datos.\n\nVerifica el número de orden y el email e intenta de nuevo.'
      )
      session.state = 'MAIN_MENU'
      await saveSession(session)
      return sendMainMenu(session)
    }
    
    await sendTextMessage(session.phone, status)
  } catch {
    await sendTextMessage(session.phone, '😔 Error consultando el pedido. Intenta de nuevo más tarde.')
  }
  
  session.state = 'MAIN_MENU'
  session.temp_data = undefined
  await saveSession(session)
}

// ─── CATÁLOGO PDF ────────────────────────────────────────────

async function sendCatalogPDF(session: ConversationSession) {
  await sendDocumentMessage(
    session.phone,
    `${SITE_URL}/catalogo/Catalogo2.pdf`,
    'Catalogo-Ninamar-2026.pdf',
    '📄 ¡Aquí tienes nuestro catálogo completo! ✨\n\nTambién puedes verlo interactivo en: niñamar.com/catalogo'
  )
}
