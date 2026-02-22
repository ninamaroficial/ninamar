import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface BotSettings {
  name: string
  description: string
  welcomeMessage: string
  errorMessage: string
  closingMessage: string
}

// Almacenamiento en memoria (en producción usar base de datos)
let botSettings: BotSettings = {
  name: process.env.WHATSAPP_BOT_NAME || '🤖 Niña Mar Bot',
  description: process.env.WHATSAPP_BOT_DESCRIPTION || 'Tu asistente de compra virtual',
  welcomeMessage: process.env.WHATSAPP_BOT_WELCOME || '¡Hola! 👋\n\nSoy tu asistente de Niña Mar.',
  errorMessage: process.env.WHATSAPP_BOT_ERROR || '😔 Lo siento, ocurrió un error.',
  closingMessage: process.env.WHATSAPP_BOT_CLOSING || 'Gracias por tu compra. 💚',
}

/**
 * GET /api/admin/settings/bot
 * Obtener las configuraciones actuales del bot
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que es admin
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    return NextResponse.json(botSettings)
  } catch (error) {
    console.error('Error getting bot settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/settings/bot
 * Guardar las configuraciones del bot
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que es admin
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar que tengan los campos requeridos
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      )
    }

    // Actualizar configuración
    botSettings = {
      name: body.name || botSettings.name,
      description: body.description || botSettings.description,
      welcomeMessage: body.welcomeMessage || botSettings.welcomeMessage,
      errorMessage: body.errorMessage || botSettings.errorMessage,
      closingMessage: body.closingMessage || botSettings.closingMessage,
    }

    console.log('✅ Bot settings updated:', botSettings.name)

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente',
      settings: botSettings
    })
  } catch (error) {
    console.error('Error updating bot settings:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

/**
 * Exportar la función para obtener los settings desde otros módulos
 */
export function getBotSettings(): BotSettings {
  return botSettings
}

export function updateBotSettings(newSettings: Partial<BotSettings>): void {
  botSettings = {
    ...botSettings,
    ...newSettings
  }
}
