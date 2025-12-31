"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import CartDrawer from '@/components/cart/CartDrawer'

export interface CartItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage: string
  basePrice: number
  selectedOptions: {
    optionId: string
    optionName: string
    valueId: string
    valueName: string
    additionalPrice: number
  }[]
  quantity: number
  totalPrice: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem('ninamar-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ninamar-cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.productId}-${Date.now()}-${Math.random()}`
    }
    setItems(prev => [...prev, newItem])
    setIsOpen(true) // Abrir carrito automáticamente
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const totalPrice = (item.basePrice + 
          item.selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0)
        ) * quantity
        return { ...item, quantity, totalPrice }
      }
      return item
    }))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('ninamar-cart')
  }

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isOpen,
      openCart,
      closeCart
    }}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}