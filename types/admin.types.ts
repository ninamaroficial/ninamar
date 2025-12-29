export interface Admin {
  id: string
  email: string
  password_hash: string
  name: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  paid_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  total_revenue: number
  today_orders: number
  today_revenue: number
}

export interface OrderListItem {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  payment_status: string
  payment_method?: string
  created_at: string
  items_count: number
}