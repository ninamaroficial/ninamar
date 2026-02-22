/**
 * WhatsApp Bot - Configuration
 * Personaliza el nombre, foto y otros detalles del chatbot
 */

export const BOT_CONFIG = {
  // Nombre del chatbot
  name: process.env.WHATSAPP_BOT_NAME || '🤖 Niña Mar Bot',
  
  // Descripción/slogan
  description: process.env.WHATSAPP_BOT_DESCRIPTION || 'Tu asistente de compra virtual',
  
  // URL de la foto del bot (opcional, para panel admin)
  profileImage: process.env.WHATSAPP_BOT_PROFILE_URL || '/images/bot-avatar.png',
  
  // Mensaje de bienvenida personalizado
  welcomeMessage: process.env.WHATSAPP_BOT_WELCOME || 
    '¡Hola! 👋\n\nSoy tu asistente de Niña Mar. ' +
    'Aquí puedes:\n' +
    '• Ver nuestros productos\n' +
    '• Personalizar tus compras\n' +
    '• Hacer pedidos\n\n' +
    'Escribe *Menú* para comenzar.',
  
  // Respuesta cuando hay error
  errorMessage: process.env.WHATSAPP_BOT_ERROR ||
    '😔 Lo siento, ocurrió un error. Escribe *Menú* para volver al menú principal.',
  
  // Mensaje de cierre
  closingMessage: process.env.WHATSAPP_BOT_CLOSING ||
    'Gracias por tu compra. Estamos aquí si necesitas ayuda. 💚',
}
