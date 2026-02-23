/**
 * Script para enviar encuesta de satisfacción manualmente
 * Uso: node scripts/send-survey.js "3213326705"
 */

const phone = process.argv[2]

if (!phone) {
  console.error('❌ Error: Debes proporcionar el número de teléfono')
  console.log('Uso: node scripts/send-survey.js "3213326705"')
  process.exit(1)
}

// Importar dependencias
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE')
  process.exit(1)
}

console.log(`🔍 Buscando pedido entregado para: ${phone}`)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendSurvey() {
  try {
    // Buscar pedido entregado
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !order) {
      console.error('❌ Pedido no encontrado:', fetchError?.message)
      process.exit(1)
    }

    console.log(`✅ Pedido encontrado:`)
    console.log(`   - Número: #${order.order_number}`)
    console.log(`   - Cliente: ${order.customer_name}`)
    console.log(`   - Teléfono: ${order.customer_phone}`)

    // Enviar encuesta por WhatsApp
    console.log(`\n📱 Enviando encuesta de satisfacción...`)

    const message = 
      `📊 *Encuesta de Satisfacción*\n\n` +
      `Hola ${order.customer_name}, queremos saber sobre tu experiencia con Niñamar 💜\n\n` +
      `*Por favor califica tu pedido #${order.order_number}:*\n\n` +
      `⭐ Excelente - Escribe *5*\n` +
      `⭐ Muy bueno - Escribe *4*\n` +
      `⭐ Bueno - Escribe *3*\n` +
      `⭐ Regular - Escribe *2*\n` +
      `⭐ Malo - Escribe *1*\n\n` +
      `Solo escribe el número de tu calificación 😊`

    // Aquí iría la llamada a sendTextMessage, pero como esto es un script
    // vamos a simular y loguear lo que se enviaría
    console.log(`✅ Encuesta lista para enviar:`)
    console.log(message)
    console.log(`\n📤 Para enviar realmente esta encuesta, inicia tu servidor:`)
    console.log(`   npm run dev`)
    console.log(`\nLuego abre en el navegador:`)
    console.log(`   http://localhost:3000/api/admin/test-survey?phone=${phone}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

sendSurvey()
