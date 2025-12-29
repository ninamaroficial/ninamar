import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function verifyAdminCredentials(email: string, password: string) {
  const supabase = createAdminClient()
  
  // Buscar admin por email
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()
  
  if (error || !admin) {
    return null
  }
  
  // Verificar password
  const isValid = await bcrypt.compare(password, admin.password_hash)
  
  if (!isValid) {
    return null
  }
  
  // Actualizar último login
  await supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', admin.id)
  
  // No devolver el hash de password
  const { password_hash, ...adminData } = admin
  
  return adminData
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}