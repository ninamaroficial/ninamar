/**
 * Script de diagnóstico de conexión a Supabase
 * Ejecutar con: node scripts/test-supabase-connection.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env.local') })

console.log('🔍 Probando conectividad con Supabase...\n')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Configuración:')
console.log('  URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ NO CONFIGURADO')
console.log('  Service Role Key:', serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}... (${serviceRoleKey.length} caracteres)` : '❌ NO CONFIGURADO')
console.log('')

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno. Verifica tu archivo .env.local\n')
  process.exit(1)
}

try {
  console.log('🔌 Creando cliente de Supabase...')
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('✅ Cliente creado\n')

  console.log('🔎 Probando consulta a la tabla "admins" (timeout 15s)...')
  const startTime = Date.now()

  const { data, error, count } = await Promise.race([
    supabase.from('admins').select('email, is_active', { count: 'exact' }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('⏱️ TIMEOUT: Supabase no respondió en 15 segundos')), 15000)
    )
  ])

  const responseTime = Date.now() - startTime

  if (error) {
    console.error(`❌ Error en la consulta (${responseTime}ms):`)
    console.error('  Mensaje:', error.message)
    console.error('  Detalles:', error.details || 'N/A')
    console.error('  Código:', error.code || 'N/A')
    console.error('  Hint:', error.hint || 'N/A')
    console.log('\n💡 Sugerencias:')
    console.log('  - Verifica que la tabla "admins" exista en tu base de datos')
    console.log('  - Verifica que el Service Role Key sea correcto')
    console.log('  - Ve a app.supabase.com y verifica que el proyecto esté activo')
    process.exit(1)
  }

  console.log(`✅ Conexión exitosa en ${responseTime}ms\n`)
  console.log('📊 Resultados:')
  console.log(`  Total de admins: ${count || 0}`)
  
  if (data && data.length > 0) {
    console.log('\n👥 Admins encontrados:')
    data.forEach((admin, i) => {
      console.log(`  ${i + 1}. ${admin.email} (${admin.is_active ? 'Activo' : 'Inactivo'})`)
    })
  } else {
    console.log('\n⚠️  No se encontraron admins. Necesitas crear uno primero.')
  }

  console.log('\n🎉 ¡Todo funciona correctamente!')

} catch (err) {
  console.error('\n❌ Error crítico:', err.message)
  console.log('\n💡 Posibles causas:')
  console.log('  1. Tu proyecto de Supabase está pausado (plan gratuito)')
  console.log('     → Ve a app.supabase.com y reactívalo')
  console.log('  2. Problemas de red/firewall bloqueando la conexión')
  console.log('  3. La URL de Supabase es incorrecta')
  console.log('  4. El Service Role Key es incorrecto')
  process.exit(1)
}
