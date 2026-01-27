// Tarifas de envío por departamento y ciudad (en COP)
export const SHIPPING_RATES: Record<string, number> = {
  // Principales ciudades - más económico
  'Bogotá D.C.': 18000,
  'Cundinamarca': 18000,
  'Antioquia': 18000,
  'Valle del Cauca': 10000,
  
  // Región Andina
  'Boyacá': 18000,
  'Santander': 18000,
  'Norte de Santander': 18000,
  'Tolima': 18000,
  'Huila': 16000,
  'Caldas': 18000,
  'Risaralda': 18000,
  'Quindío': 18000,
  
  // Región Caribe
  'Atlántico': 18000,
  'Bolívar': 22000,
  'Magdalena': 20000,
  'Cesar': 20000,
  'La Guajira': 25000,
  'Córdoba': 20000,
  'Sucre': 20000,
  'San Andrés y Providencia': 35000,
  
  // Región Pacífica
  'Cauca': 10000, // Tarifa general del departamento
  'Nariño': 18000,
  'Chocó': 25000,
  
  // Región Orinoquía
  'Meta': 18000,
  'Casanare': 22000,
  'Arauca': 25000,
  'Vichada': 30000,
  
  // Región Amazonía
  'Caquetá': 25000,
  'Putumayo': 28000,
  'Amazonas': 35000,
  'Guainía': 35000,
  'Guaviare': 30000,
  'Vaupés': 35000,
}

// Tarifas especiales por ciudad (sobrescribe la tarifa del departamento)
export const CITY_SHIPPING_RATES: Record<string, number> = {
  'Popayán': 5000, // Tarifa especial para Popayán (sede principal)
}

export const FREE_SHIPPING_THRESHOLD = 120000 // $120,000 COP

export function calculateShipping(state: string, city: string, total: number): number {
  // Envío gratis si el total es mayor o igual al umbral
  if (total >= FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  // Verificar si hay tarifa especial para la ciudad
  if (city && CITY_SHIPPING_RATES[city]) {
    return CITY_SHIPPING_RATES[city]
  }

  // Obtener tarifa del departamento
  const rate = SHIPPING_RATES[state] || 15000 // Tarifa por defecto

  return rate
}

export function getShippingMessage(state: string, city: string, total: number): string {
  if (total >= FREE_SHIPPING_THRESHOLD) {
    return '¡Envío GRATIS!'
  }

  const remaining = FREE_SHIPPING_THRESHOLD - total
  return `Agrega ${new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(remaining)} más para envío gratis`
}