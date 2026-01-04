import { createClient } from '@supabase/supabase-js'
import type { Shipment, CreateShipmentData } from "@/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Crear un nuevo envío
 */
export async function createShipment(shipmentData: CreateShipmentData) {
  const { data, error } = await supabase
    .from('shipments')
    .insert(shipmentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating shipment:', error)
    throw error
  }

  return data as Shipment
}

/**
 * Obtener envíos de una orden
 */
export async function getShipmentsByOrderId(orderId: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shipments:', error)
    throw error
  }

  return data as Shipment[]
}

/**
 * Obtener un envío por número de seguimiento
 */
export async function getShipmentByTrackingNumber(trackingNumber: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      orders (
        order_number,
        customer_name,
        customer_email,
        status
      )
    `)
    .eq('tracking_number', trackingNumber)
    .single()

  if (error) {
    console.error('Error fetching shipment:', error)
    throw error
  }

  return data
}

/**
 * Actualizar información de envío
 */
export async function updateShipment(
  shipmentId: string,
  updates: Partial<CreateShipmentData>
) {
  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', shipmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating shipment:', error)
    throw error
  }

  return data as Shipment
}

/**
 * Eliminar un envío
 */
export async function deleteShipment(shipmentId: string) {
  const { error } = await supabase
    .from('shipments')
    .delete()
    .eq('id', shipmentId)

  if (error) {
    console.error('Error deleting shipment:', error)
    throw error
  }

  return true
}