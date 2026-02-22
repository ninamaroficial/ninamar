/**
 * WhatsApp Bot - Message Handler
 * Orquesta el flujo de conversación según el estado del usuario
 */

import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  sendDocumentMessage,
  markAsRead,
} from './client'
import { getSession, saveSession, type ConversationSession, type CartItem } from './session'
import { getProductsForWhatsApp, getCategoriesForWhatsApp, getProductsByCategory, formatProductDetail } from './catalog'
import { createWhatsAppOrder, getOrderStatus } from './orders'

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
  
  // Guardar nombre si es la primera vez
  if (!session.customer_name && contactName) {
    session.customer_name = contactName
  }
  
  // Extraer texto del mensaje según tipo
  const userInput = extractUserInput(message)
  
  if (!userInput) return
  
  try {
    await routeMessage(session, userInput)
  } catch (error) {
    console.error('❌ Error in WhatsApp handler:', error)
    await sendTextMessage(phone, '😔 Lo siento, ocurrió un error. Escribe *hola* para volver al menú principal.')
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
    return sendTextMessage(session.phone, '✅ Operación cancelada. Escribe *hola* para ver el menú.')
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
      await sendTextMessage(session.phone, '🤔 No entendí tu mensaje. Escribe *hola* para ver el menú.')
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
    'Escribe "hola" en cualquier momento para volver aquí'
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
        `🌐 Visita nuestra tienda online:\n\n${SITE_URL}\n\n¡Ahí puedes ver todos nuestros productos con fotos detalladas! ✨`
      )
      return
    
    case 'START_CHECKOUT':
      return startCheckout(session)
    
    default:
      // No entendió: decirle al usuario
      await sendTextMessage(
        session.phone,
        '🤔 No entendí tu mensaje. Por favor selecciona una opción del menú o escribe *hola* para volver al menú principal.'
      )
      return
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
    await sendTextMessage(session.phone, '🤔 Por favor selecciona una categoría de la lista, o escribe *hola* para volver al menú.')
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
        rows: products.map((p: { id: string; name: string; price: number }) => ({
          id: `PROD_${p.id}`,
          title: p.name,
          description: `$${p.price.toLocaleString('es-CO')}`,
        })),
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
  
  // WhatsApp Lists soportan máx. 10 items por sección
  const sections = []
  for (let i = 0; i < products.length; i += 10) {
    const chunk = products.slice(i, i + 10)
    sections.push({
      title: i === 0 ? 'Nuestros Productos' : `Más productos (${i + 1}-${i + chunk.length})`,
      rows: chunk.map((p: { id: string; name: string; price: number }) => ({
        id: `PROD_${p.id}`,
        title: p.name,
        description: `$${p.price.toLocaleString('es-CO')}`,
      })),
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
    await sendTextMessage(session.phone, '🤔 Por favor selecciona un producto de la lista, o escribe *hola* para volver al menú.')
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
      image: detail.image,
    }
  }
  await saveSession(session)
  
  // Enviar info del producto
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
      session.state = 'ENTERING_QUANTITY'
      await saveSession(session)
      await sendTextMessage(
        session.phone,
        `¿Cuántas unidades de *${product.name}* deseas agregar?\n\nEscribe un número (1-10):`
      )
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

async function handleQuantity(session: ConversationSession, input: string) {
  const quantity = parseInt(input)
  const product = session.temp_data?.currentProduct
  
  if (!product) {
    return sendMainMenu(session)
  }
  
  if (isNaN(quantity) || quantity < 1 || quantity > 10) {
    await sendTextMessage(session.phone, 'Por favor ingresa un número entre 1 y 10.')
    return
  }
  
  // Agregar al carrito
  const existingIndex = session.cart.findIndex(item => item.product_id === product.id)
  
  if (existingIndex >= 0) {
    session.cart[existingIndex].quantity += quantity
  } else {
    session.cart.push({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_image: product.image,
      price: product.price,
      quantity,
    })
  }
  
  session.state = 'MAIN_MENU'
  session.temp_data = undefined
  await saveSession(session)
  
  const totalItems = session.cart.reduce((sum, item) => sum + item.quantity, 0)
  
  await sendButtonMessage(
    session.phone,
    `✅ *${quantity}x ${product.name}* agregado al carrito.\n\n🛒 Total de productos: *${totalItems}*`,
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
      await sendTextMessage(session.phone, '🤔 Por favor usa los botones de arriba, o escribe *hola* para volver al menú.')
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
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Documento: *${session.customer_document}*\n\n*4/6* ¿En qué departamento te encuentras?\n\n(Ejemplo: Cauca, Valle del Cauca, Nariño...)`
  )
}

async function handleCheckoutState(session: ConversationSession, input: string) {
  session.customer_state = input.trim()
  session.state = 'CHECKOUT_CITY'
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Departamento: *${session.customer_state}*\n\n*5/6* ¿En qué ciudad/municipio?`
  )
}

async function handleCheckoutCity(session: ConversationSession, input: string) {
  session.customer_city = input.trim()
  session.state = 'CHECKOUT_ADDRESS'
  await saveSession(session)
  
  await sendTextMessage(
    session.phone,
    `✅ Ciudad: *${session.customer_city}*\n\n*6/6* ¿Cuál es tu dirección de envío completa?\n\n(Incluye barrio, calle, número, referencias)`
  )
}

async function handleCheckoutAddress(session: ConversationSession, input: string) {
  session.customer_address = input.trim()
  session.state = 'CHECKOUT_CONFIRM'
  await saveSession(session)
  
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
  
  let subtotal = 0
  session.cart.forEach(item => {
    const itemTotal = item.price * item.quantity
    subtotal += itemTotal
    summary += `• ${item.quantity}x ${item.product_name} - $${itemTotal.toLocaleString('es-CO')}\n`
  })
  
  summary += `\n💰 *Subtotal: $${subtotal.toLocaleString('es-CO')}*`
  
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
      
      // Limpiar carrito
      session.cart = []
      session.state = 'MAIN_MENU'
      session.temp_data = undefined
      await saveSession(session)
      
      await sendTextMessage(
        session.phone,
        `🎉 *¡Pedido creado exitosamente!*\n\n` +
        `📋 Número de orden: *${order.order_number}*\n` +
        `💰 Total: *$${order.total.toLocaleString('es-CO')}*\n\n` +
        `📧 Recibirás un email de confirmación en *${session.customer_email}*\n\n` +
        `Nos pondremos en contacto contigo para coordinar el pago y envío. 💜\n\n` +
        `¡Gracias por tu compra en *Niñamar*! ✨`
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
