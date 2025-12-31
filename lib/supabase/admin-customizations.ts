import { createAdminClient } from './admin'

export interface CustomizationOption {
  id: string
  name: string
  type: string
  display_name: string
  description: string | null
  is_required: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CustomizationValue {
  id: string
  option_id: string
  value: string
  display_name: string
  additional_price: number
  hex_color: string | null
  image_url: string | null
  is_available: boolean
  display_order: number
  created_at: string
}

export interface CreateCustomizationOptionData {
  name: string
  type: string
  display_name: string
  description?: string
  is_required?: boolean
  display_order?: number
}

export interface CreateCustomizationValueData {
  option_id: string
  value: string
  display_name: string
  additional_price?: number
  hex_color?: string
  image_url?: string
  is_available?: boolean
  display_order?: number
}

// ==================== OPCIONES ====================

// Obtener todas las opciones
export async function getAllCustomizationOptions() {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('customization_options')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching options:', error)
    throw error
  }
  
  return data as CustomizationOption[]
}

// Obtener opción por ID con sus valores
export async function getCustomizationOptionById(optionId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('customization_options')
    .select(`
      *,
      values:customization_values(*)
    `)
    .eq('id', optionId)
    .single()
  
  if (error) {
    console.error('Error fetching option:', error)
    throw error
  }
  
  return data
}

// Crear opción
export async function createCustomizationOption(data: CreateCustomizationOptionData) {
  const supabase = createAdminClient()
  
  const { data: option, error } = await supabase
    .from('customization_options')
    .insert(data)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating option:', error)
    throw error
  }
  
  return option as CustomizationOption
}

// Actualizar opción
export async function updateCustomizationOption(
  optionId: string, 
  data: Partial<CreateCustomizationOptionData>
) {
  const supabase = createAdminClient()
  
  const { data: option, error } = await supabase
    .from('customization_options')
    .update(data)
    .eq('id', optionId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating option:', error)
    throw error
  }
  
  return option as CustomizationOption
}

// Eliminar opción
export async function deleteCustomizationOption(optionId: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('customization_options')
    .delete()
    .eq('id', optionId)
  
  if (error) {
    console.error('Error deleting option:', error)
    throw error
  }
  
  return true
}

// ==================== VALORES ====================

// Obtener valores de una opción
export async function getValuesByOptionId(optionId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('customization_values')
    .select('*')
    .eq('option_id', optionId)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching values:', error)
    throw error
  }
  
  return data as CustomizationValue[]
}

// Crear valor
export async function createCustomizationValue(data: CreateCustomizationValueData) {
  const supabase = createAdminClient()
  
  const { data: value, error } = await supabase
    .from('customization_values')
    .insert(data)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating value:', error)
    throw error
  }
  
  return value as CustomizationValue
}

// Actualizar valor
export async function updateCustomizationValue(
  valueId: string,
  data: Partial<CreateCustomizationValueData>
) {
  const supabase = createAdminClient()
  
  const { data: value, error } = await supabase
    .from('customization_values')
    .update(data)
    .eq('id', valueId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating value:', error)
    throw error
  }
  
  return value as CustomizationValue
}

// Eliminar valor
export async function deleteCustomizationValue(valueId: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('customization_values')
    .delete()
    .eq('id', valueId)
  
  if (error) {
    console.error('Error deleting value:', error)
    throw error
  }
  
  return true
}

// ==================== RELACIONES PRODUCTO-OPCIONES ====================

// Obtener opciones de un producto
export async function getProductCustomizations(productId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('product_customizations')
    .select(`
      id,
      product_id,
      option_id,
      is_required,
      display_order,
      created_at,
      customization_options!inner (
        id,
        name,
        display_name,
        type,
        description
      )
    `)
    .eq('product_id', productId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching product customizations:', error)
    throw error
  }

  return data || []
}

export async function assignCustomizationToProduct(
  productId: string,
  optionId: string,
  isRequired: boolean = false,
  displayOrder: number = 0
) {
  const supabase = createAdminClient()

  // Verificar que no esté ya asignada
  const { data: existing, error: checkError } = await supabase
    .from('product_customizations')
    .select('id')
    .eq('product_id', productId)
    .eq('option_id', optionId)
    .maybeSingle()  // ← Cambiado de .single() a .maybeSingle()

  // Si checkError y no es por que no existe, lanzar error
  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError
  }

  if (existing) {
    throw new Error('Esta opción ya está asignada al producto')
  }

  const { data, error } = await supabase
    .from('product_customizations')
    .insert({
      product_id: productId,
      option_id: optionId,
      is_required: isRequired,
      display_order: displayOrder,
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning customization:', error)
    throw error
  }

  return data
}

export async function removeCustomizationFromProduct(
  productId: string,
  customizationId: string
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('product_customizations')
    .delete()
    .eq('id', customizationId)
    .eq('product_id', productId)

  if (error) {
    console.error('Error removing customization:', error)
    throw error
  }
}

// ← AGREGAR AL FINAL DEL ARCHIVO

export async function getNewsletterSubscribers() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching newsletter subscribers:', error)
    throw error
  }

  return data || []
}

export async function unsubscribeFromNewsletter(email: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      is_active: false,
      unsubscribed_at: new Date().toISOString()
    })
    .eq('email', email)

  if (error) {
    console.error('Error unsubscribing:', error)
    throw error
  }
}