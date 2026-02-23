import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ NO CONFIGURADO',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ NO CONFIGURADO',
        jwtSecret: process.env.JWT_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO',
      },
      database: {
        status: 'checking...',
        error: null as string | null
      }
    }

    // Intentar conectar a Supabase
    console.log('🔍 Probando conexión a Supabase...')
    try {
      const supabase = createAdminClient()
      
      console.log('⏱️  Esperando respuesta de Supabase (máx 10s)...')
      const startTime = Date.now()
      
      const { data, error, count } = await Promise.race([
        supabase.from('admins').select('*', { count: 'exact', head: true }),
        new Promise<{ data: null; error: any; count: null }>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout after 10s - Supabase may be paused')), 10000)
        )
      ])

      const responseTime = Date.now() - startTime

      if (error) {
        checks.database.status = '❌ Error'
        checks.database.error = `${error.message} (Response time: ${responseTime}ms)`
        console.error('❌ Error de base de datos:', error)
      } else {
        checks.database.status = '✅ Conectado'
        checks.database.error = `Response time: ${responseTime}ms | Admins count: ${count || 0}`
        console.log(`✅ Conexión exitosa en ${responseTime}ms`)
      }
    } catch (dbError: any) {
      checks.database.status = '❌ Timeout o error crítico'
      checks.database.error = dbError.message
      console.error('❌ Error crítico:', dbError.message)
      
      // Agregar sugerencias
      if (dbError.message.includes('timeout') || dbError.message.includes('paused')) {
        checks.database.error += '\n\n💡 Sugerencia: Tu proyecto de Supabase puede estar pausado. Ve a app.supabase.com y reactívalo.'
      }
    }

    return NextResponse.json(checks)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Error al realizar health check',
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      },
      { status: 500 }
    )
  }
}
