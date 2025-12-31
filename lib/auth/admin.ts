import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminUser {
  id?: string
  email: string
  name?: string
  role: string
}

export interface AdminData {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  last_login: string | null
}

// ==================== AUTENTICACIÓN ====================

/**
 * Verifica las credenciales de un administrador
 * @param email - Email del administrador
 * @param password - Contraseña sin encriptar
 * @returns AdminData si las credenciales son válidas, null si no
 */
export async function verifyAdminCredentials(
  email: string, 
  password: string
): Promise<AdminData | null> {
  const supabase = createAdminClient()
  
  try {
    // Buscar admin por email
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error || !admin) {
      console.error('Admin not found:', error)
      return null
    }
    
    // Verificar password
    const isValid = await bcrypt.compare(password, admin.password_hash)
    
    if (!isValid) {
      console.error('Invalid password')
      return null
    }
    
    // Actualizar último login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)
    
    // No devolver el hash de password
    const { password_hash, ...adminData } = admin
    
    return adminData as AdminData
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return null
  }
}

/**
 * Genera un hash de la contraseña
 * @param password - Contraseña sin encriptar
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, 10)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Error al encriptar contraseña')
  }
}

/**
 * Verifica si una contraseña coincide con su hash
 * @param password - Contraseña sin encriptar
 * @param hash - Hash de la contraseña
 * @returns true si coincide, false si no
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

// ==================== JWT ====================

/**
 * Genera un token JWT para un administrador
 * @param user - Datos del usuario a incluir en el token
 * @returns Token JWT
 */
export function generateAdminToken(user: AdminUser): string {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'admin',
        name: user.name,
      },
      JWT_SECRET,
      {
        expiresIn: '7d', // Token válido por 7 días
      }
    )
  } catch (error) {
    console.error('Error generating token:', error)
    throw new Error('Error al generar token')
  }
}

/**
 * Verifica y decodifica un token JWT
 * @param token - Token JWT a verificar
 * @returns Datos del usuario si el token es válido, null si no
 */
export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired:', error)
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error)
    } else {
      console.error('Error verifying token:', error)
    }
    return null
  }
}

/**
 * Decodifica un token JWT sin verificar su validez
 * @param token - Token JWT a decodificar
 * @returns Datos del token decodificado o null
 */
export function decodeAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.decode(token) as AdminUser
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// ==================== UTILIDADES ====================

/**
 * Obtiene datos de un admin por ID
 * @param adminId - ID del administrador
 * @returns AdminData si existe, null si no
 */
export async function getAdminById(adminId: string): Promise<AdminData | null> {
  const supabase = createAdminClient()
  
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, name, role, is_active, created_at, last_login')
      .eq('id', adminId)
      .single()
    
    if (error || !admin) {
      console.error('Admin not found:', error)
      return null
    }
    
    return admin as AdminData
  } catch (error) {
    console.error('Error fetching admin:', error)
    return null
  }
}

/**
 * Actualiza la contraseña de un administrador
 * @param adminId - ID del administrador
 * @param currentPassword - Contraseña actual
 * @param newPassword - Nueva contraseña
 * @returns true si se actualizó correctamente, false si no
 */
export async function updateAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const supabase = createAdminClient()
  
  try {
    // Obtener admin actual
    const { data: admin, error } = await supabase
      .from('admins')
      .select('password_hash')
      .eq('id', adminId)
      .single()
    
    if (error || !admin) {
      console.error('Admin not found:', error)
      return false
    }
    
    // Verificar contraseña actual
    const isValid = await verifyPassword(currentPassword, admin.password_hash)
    
    if (!isValid) {
      console.error('Current password is invalid')
      return false
    }
    
    // Generar nuevo hash
    const newHash = await hashPassword(newPassword)
    
    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: newHash })
      .eq('id', adminId)
    
    if (updateError) {
      console.error('Error updating password:', updateError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error updating admin password:', error)
    return false
  }
}

/**
 * Verifica si un email de admin ya existe
 * @param email - Email a verificar
 * @param excludeId - ID de admin a excluir (opcional, para edición)
 * @returns true si existe, false si no
 */
export async function adminEmailExists(
  email: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = createAdminClient()
  
  try {
    let query = supabase
      .from('admins')
      .select('id')
      .eq('email', email)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data, error } = await query.single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking email:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Error checking admin email:', error)
    return false
  }
}

/**
 * Crea un nuevo administrador
 * @param email - Email del nuevo admin
 * @param password - Contraseña sin encriptar
 * @param name - Nombre del admin
 * @param role - Rol del admin (default: 'admin')
 * @returns AdminData si se creó correctamente, null si no
 */
export async function createAdmin(
  email: string,
  password: string,
  name: string,
  role: string = 'admin'
): Promise<AdminData | null> {
  const supabase = createAdminClient()
  
  try {
    // Verificar si el email ya existe
    const exists = await adminEmailExists(email)
    
    if (exists) {
      console.error('Email already exists')
      return null
    }
    
    // Generar hash de contraseña
    const passwordHash = await hashPassword(password)
    
    // Crear admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role,
        is_active: true,
      })
      .select('id, email, name, role, is_active, created_at, last_login')
      .single()
    
    if (error || !admin) {
      console.error('Error creating admin:', error)
      return null
    }
    
    return admin as AdminData
  } catch (error) {
    console.error('Error creating admin:', error)
    return null
  }
}