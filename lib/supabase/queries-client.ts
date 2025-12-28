import { createClient } from './client'

export async function getProductCustomizations(productId: string) {
  const supabase = createClient()
  
  // 1. Obtener las opciones asignadas al producto
  const { data: productCustoms, error: productError } = await supabase
    .from('product_customizations')
    .select('option_id, is_required')
    .eq('product_id', productId)

  if (productError || !productCustoms) {
    console.error('Error fetching product customizations:', productError)
    return []
  }

  // 2. Obtener los detalles de cada opción
  const optionsWithValues = await Promise.all(
    productCustoms.map(async (pc) => {
      // Obtener la opción
      const { data: option, error: optionError } = await supabase
        .from('customization_options')
        .select('id, name, type, description')
        .eq('id', pc.option_id)
        .single()

      if (optionError || !option) {
        console.error('Error fetching option:', optionError)
        return null
      }

      // Obtener los valores de la opción
      const { data: values, error: valuesError } = await supabase
        .from('customization_values')
        .select('id, value, additional_price, hex_color, image_url')
        .eq('option_id', option.id)

      if (valuesError) {
        console.error('Error fetching values:', valuesError)
        return null
      }

      return {
        id: option.id,
        name: option.name,
        type: option.type,
        is_required: pc.is_required,
        values: values || []
      }
    })
  )

  return optionsWithValues.filter(Boolean)
}