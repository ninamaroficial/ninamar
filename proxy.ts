import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

// ✅ Cambiar el nombre de la función de "middleware" a "proxy"
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas /admin/* excepto /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Verificar token
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      // Token inválido o expirado
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  // Si está en /admin/login y ya tiene token válido, redirigir a dashboard
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value

    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL('/admin', request.url))
      } catch (error) {
        // Token inválido, permitir acceso a login
        return NextResponse.next()
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}