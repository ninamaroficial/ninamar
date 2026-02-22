"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Circle, Bot, User as UserIcon } from 'lucide-react'
import styles from './page.module.css'

interface Chat {
  phone: string
  customer_name: string
  state: string
  mode: 'bot' | 'manual'
  cart_items: number
  last_activity: string
  last_message: string
  last_message_time: string
  unread: boolean
  profile_picture_url?: string
}

export default function WhatsAppChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'bot' | 'manual'>('all')

  useEffect(() => {
    loadChats()
    // Actualizar cada 10 segundos
    const interval = setInterval(loadChats, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadChats = async () => {
    try {
      const res = await fetch('/api/admin/whatsapp')
      if (!res.ok) throw new Error('Failed to fetch chats')
      const data = await res.json()
      setChats(data)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
  }

  const formatPhone = (phone: string) => {
    // Formato: +57 300 546 9257
    if (phone.startsWith('57')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`
    }
    return phone
  }

  const filteredChats = chats.filter(chat => {
    if (filter === 'all') return true
    return chat.mode === filter
  })

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <MessageCircle size={48} className={styles.loadingIcon} />
          <p>Cargando chats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header estilo WhatsApp */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <MessageCircle size={32} className={styles.headerIcon} />
          <div className={styles.headerText}>
            <h1>Chats de WhatsApp</h1>
            <p>{chats.length} conversaciones</p>
          </div>
        </div>
        
        {/* Filtros */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({chats.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'bot' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('bot')}
          >
            <Bot size={16} /> Bot ({chats.filter(c => c.mode === 'bot').length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'manual' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('manual')}
          >
            <UserIcon size={16} /> Manual ({chats.filter(c => c.mode === 'manual').length})
          </button>
        </div>
      </div>

      {/* Lista de chats */}
      <div className={styles.chatList}>
        {filteredChats.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle size={64} />
            <h2>No hay chats {filter !== 'all' ? `en modo ${filter}` : ''}</h2>
            <p>Los chats aparecerán cuando alguien escriba por WhatsApp</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <Link
              key={chat.phone}
              href={`/admin/whatsapp/${chat.phone}`}
              className={styles.chatItem}
            >
              {/* Avatar */}
              <div className={styles.avatar}>
                {chat.profile_picture_url ? (
                  <img 
                    src={chat.profile_picture_url} 
                    alt={chat.customer_name} 
                    className={styles.avatarImage}
                  />
                ) : (
                  <UserIcon size={24} />
                )}
              </div>

              {/* Content */}
              <div className={styles.chatContent}>
                <div className={styles.chatHeader}>
                  <div className={styles.chatName}>
                    {chat.customer_name}
                    {chat.mode === 'manual' && (
                      <span className={styles.manualBadge}>
                        <UserIcon size={12} /> Manual
                      </span>
                    )}
                    {chat.mode === 'bot' && (
                      <span className={styles.botBadge}>
                        <Bot size={12} /> Bot
                      </span>
                    )}
                  </div>
                  <span className={styles.chatTime}>
                    {formatTime(chat.last_message_time)}
                  </span>
                </div>

                <div className={styles.chatPreview}>
                  <p className={styles.lastMessage}>{chat.last_message}</p>
                  {chat.cart_items > 0 && (
                    <span className={styles.cartBadge}>
                      🛒 {chat.cart_items}
                    </span>
                  )}
                </div>

                <div className={styles.chatMeta}>
                  <span className={styles.phone}>{formatPhone(chat.phone)}</span>
                  <span className={styles.state}>{chat.state}</span>
                </div>
              </div>

              {/* Unread indicator */}
              {chat.unread && (
                <div className={styles.unreadBadge}>
                  <Circle size={12} fill="currentColor" />
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
