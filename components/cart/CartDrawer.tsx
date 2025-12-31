"use client"

import { useCart } from "@/lib/context/CartContext"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import styles from "./CartDrawer.module.css"

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isOpen, closeCart, clearCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={closeCart} />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <ShoppingBag className={styles.headerIcon} />
            <h2 className={styles.title}>
              Tu Carrito
              {totalItems > 0 && (
                <span className={styles.itemCount}>({totalItems})</span>
              )}
            </h2>
          </div>
          <button onClick={closeCart} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h3 className={styles.emptyTitle}>Tu carrito está vacío</h3>
            <p className={styles.emptyText}>
              Agrega productos personalizados para comenzar
            </p>
            <button onClick={closeCart} className={styles.continueButton}>
              Seguir Comprando
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  {/* Image */}
                  <div className={styles.itemImage}>
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className={styles.image}
                        sizes="100px"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>💎</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.productName}</h3>
                    
                    {/* Options */}
                    <div className={styles.itemOptions}>
                      {item.selectedOptions.map((option) => (
                        <div key={option.optionId} className={styles.option}>
                          <span className={styles.optionName}>{option.optionName}:</span>
                          <span className={styles.optionValue}>{option.valueName}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Quantity */}
                    <div className={styles.itemFooter}>
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={styles.quantityButton}
                        >
                          <Minus size={16} />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={styles.quantityButton}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className={styles.priceAndDelete}>
                        <span className={styles.itemPrice}>
                          {formatPrice(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className={styles.deleteButton}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button onClick={clearCart} className={styles.clearButton}>
                Vaciar Carrito
              </button>
              
              <div className={styles.total}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalPrice}>{formatPrice(totalPrice)}</span>
              </div>

              <Link href="/checkout" className={styles.checkoutButton} onClick={closeCart}>
                Proceder al Pago
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}