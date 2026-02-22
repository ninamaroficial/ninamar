"use client"

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User as UserIcon,
  ShoppingCart,
  MapPin,
  Mail,
  Phone
} from 'lucide-react'
import styles from './page.module.css'

interface Message {
  id: string
  direction: 'incoming' | 'outgoing'
  content: string
  timestamp: string
  is_bot: boolean
  message_type: string
  metadata?: any
}

interface SessionData {
  state: string
  mode: 'bot' | 'manual'
  cart: any[]
  customer_name?: string
  customer_email?: string
  customer_city?: string
  customer_state?: string
  last_activity: string
  profile_picture_url?: string
  temp_data?: any
}

export default function WhatsAppConversationPage({ 
  params 
}: { 
  params: Promise<{ phone: string }> 
}) {
  const resolvedParams = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [session, setSession] = useState<SessionData | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isValidatingPayment, setIsValidatingPayment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)

  useEffect(() => {
    loadConversation()
    // Actualizar cada 5 segundos
    const interval = setInterval(loadConversation, 5000)
    return () => clearInterval(interval)
  }, [resolvedParams.phone])

  useEffect(() => {
    // Solo hacer scroll si se agregó un nuevo mensaje
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom()
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  const loadConversation = async () => {
    try {
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}`)
      if (!res.ok) throw new Error('Failed to fetch conversation')
      const data = await res.json()
      setMessages(data.messages)
      setSession(data.session)
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleMode = async () => {
    if (!session) return
    
    const newMode = session.mode === 'bot' ? 'manual' : 'bot'
    
    try {
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}/mode`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update mode')
      }
      
      // Actualizar estado local
      setSession({ ...session, mode: newMode })
      
      // Recargar conversación para reflejar cambios
      await loadConversation()
      
      // Mostrar confirmación
      alert(`Modo cambiado a: ${newMode === 'bot' ? '🤖 Bot (respuestas automáticas)' : '👤 Manual (tú respondes)'}`)
    } catch (error: any) {
      console.error('Error toggling mode:', error)
      alert(`Error al cambiar modo: ${error.message}`)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      })

      if (!res.ok) throw new Error('Failed to send message')

      setNewMessage('')
      // Recargar conversación inmediatamente
      await loadConversation()
      
      // Hacer scroll después de enviar
      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const handleValidatePayment = async () => {
    if (!session || isValidatingPayment) return
    setIsValidatingPayment(true)

    try {
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}/validate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al validar pago')
      }

      alert('Pago validado y confirmación enviada')
      await loadConversation()
    } catch (error: any) {
      console.error('Error validating payment:', error)
      alert(`Error al validar pago: ${error.message}`)
    } finally {
      setIsValidatingPayment(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone: string) => {
    if (phone.startsWith('57')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`
    }
    return phone
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Cargando conversación...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Conversación no encontrada</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header estilo WhatsApp */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <Link href="/admin/whatsapp" className={styles.backButton}>
            <ArrowLeft size={24} />
          </Link>

          <div className={styles.avatar}>
            {session.profile_picture_url ? (
              <img 
                src={session.profile_picture_url} 
                alt={session.customer_name || 'Cliente'} 
                className={styles.avatarImage}
              />
            ) : (
              <UserIcon size={24} />
            )}
          </div>

          <div className={styles.headerInfo}>
            <h1 className={styles.contactName}>{session.customer_name || 'Cliente'}</h1>
            <p className={styles.contactPhone}>{formatPhone(resolvedParams.phone)}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={toggleMode}
            className={`${styles.modeToggle} ${session.mode === 'manual' ? styles.modeManual : styles.modeBot}`}
          >
            {session.mode === 'bot' ? (
              <>
                <Bot size={18} />
                <span>Modo Bot</span>
              </>
            ) : (
              <>
                <UserIcon size={18} />
                <span>Modo Manual</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar con info del cliente */}
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3>Información del Cliente</h3>
            {session.customer_email && (
              <div className={styles.infoItem}>
                <Mail size={16} />
                <span>{session.customer_email}</span>
              </div>
            )}
            {session.customer_city && (
              <div className={styles.infoItem}>
                <MapPin size={16} />
                <span>{session.customer_city}, {session.customer_state}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <Phone size={16} />
              <span>{formatPhone(resolvedParams.phone)}</span>
            </div>
          </div>

          {session.cart.length > 0 && (
            <div className={styles.sidebarSection}>
              <h3>
                <ShoppingCart size={18} />
                Carrito ({session.cart.length})
              </h3>
              <div className={styles.cartItems}>
                {session.cart.map((item, idx) => (
                  <div key={idx} className={styles.cartItem}>
                    <span className={styles.cartItemName}>{item.product_name}</span>
                    <span className={styles.cartItemQty}>x{item.quantity}</span>
                    <span className={styles.cartItemPrice}>
                      ${(item.price * item.quantity).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
                <div className={styles.cartTotal}>
                  <span>Total:</span>
                  <span>
                    ${session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.sidebarSection}>
            <h3>Estado del Bot</h3>
            <div className={styles.stateBadge}>{session.state}</div>
            <p className={styles.lastActivity}>
              Última actividad: {new Date(session.last_activity).toLocaleString('es-CO')}
            </p>
          </div>

          {session.temp_data?.pending_payment && (
            <div className={styles.sidebarSection}>
              <h3>Pago Pendiente</h3>
              <div className={styles.infoItem}>
                <span>Orden:</span>
                <strong>{session.temp_data.pending_payment.order_number}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Total:</span>
                <strong>
                  ${Number(session.temp_data.pending_payment.total || 0).toLocaleString('es-CO')}
                </strong>
              </div>
              <div className={styles.infoItem}>
                <span>Comprobante:</span>
                <strong>
                  {session.temp_data.payment_proof_received ? 'Recibido' : 'Pendiente'}
                </strong>
              </div>
              <button
                onClick={handleValidatePayment}
                disabled={isValidatingPayment || !session.temp_data?.payment_proof_received}
                className={styles.submitButton}
                style={{ marginTop: '0.5rem' }}
              >
                {isValidatingPayment ? 'Validando...' : 'Validar Pago'}
              </button>
            </div>
          )}
        </div>

        {/* Área de mensajes */}
        <div className={styles.chatArea}>
          {/* Mensajes */}
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.emptyMessages}>
                <p>📭 No hay mensajes guardados todavía</p>
                <p style={{ fontSize: '0.875rem', color: '#8696a0', marginTop: '0.5rem' }}>
                  Los mensajes empezarán a guardarse cuando el cliente escriba nuevamente
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${
                    msg.direction === 'incoming' ? styles.incoming : styles.outgoing
                  }`}
                >
                  <div className={styles.messageBubble}>
                    {msg.message_type === 'image' && msg.metadata?.media_id ? (
                      <div>
                        <img
                          src={`/api/admin/whatsapp/media/${msg.metadata.media_id}`}
                          alt="Comprobante"
                          style={{ maxWidth: '240px', borderRadius: '8px', display: 'block' }}
                        />
                        {msg.content && <p className={styles.messageText}>{msg.content}</p>}
                      </div>
                    ) : msg.message_type === 'document' && msg.metadata?.media_id ? (
                      <div>
                        <a
                          href={`/api/admin/whatsapp/media/${msg.metadata.media_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.messageText}
                        >
                          {msg.content || 'Documento recibido'}
                        </a>
                      </div>
                    ) : (
                      <p className={styles.messageText}>{msg.content}</p>
                    )}
                    <div className={styles.messageFooter}>
                      <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
                      {msg.direction === 'outgoing' && (
                        <span className={styles.messageType}>
                          {msg.is_bot ? '🤖' : '👤'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <form onSubmit={handleSendMessage} className={styles.inputArea}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                session.mode === 'bot' 
                  ? '🤖 Bot activo - Cambia a Manual para escribir'
                  : '💬 Escribe tu mensaje aquí...'
              }
              disabled={session.mode === 'bot' || isSending}
              className={styles.messageInput}
              autoFocus={session.mode === 'manual'}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || session.mode === 'bot' || isSending}
              className={styles.sendButton}
              title={session.mode === 'bot' ? 'Cambia a modo manual para enviar' : 'Enviar mensaje'}
            >
              <Send size={20} />
            </button>
          </form>
          
          {/* Indicador de modo activo */}
          {session.mode === 'manual' && (
            <div className={styles.manualModeIndicator}>
              👤 Modo Manual Activo - El bot NO responderá a este chat
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
