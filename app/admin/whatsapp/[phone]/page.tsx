"use client"

import { useState, useEffect, useRef, use } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User as UserIcon,
  ShoppingCart,
  MapPin,
  Mail,
  Phone,
  Info,
  X,
  RefreshCw,
  Image as ImageIcon
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
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isValidatingPayment, setIsValidatingPayment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalMessages, setTotalMessages] = useState(0)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const prevMessagesLengthRef = useRef(0)

  useEffect(() => {
    loadConversation()
    // Actualizar cada 2 segundos para mejor tiempo real (solo mensajes nuevos)
    const interval = setInterval(() => {
      loadNewMessages()
    }, 2000)
    return () => clearInterval(interval)
  }, [resolvedParams.phone])

  // Prevenir scroll cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  useEffect(() => {
    // Solo hacer scroll si se agregó un nuevo mensaje
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom()
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  // Cerrar modal de imagen con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedImage) {
        setExpandedImage(null)
      }
    }
    
    // Bloquear scroll cuando el modal está abierto
    if (expandedImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [expandedImage])

  const loadConversation = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setIsRefreshing(true)
      }
      
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}?limit=20&offset=0`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!res.ok) throw new Error('Failed to fetch conversation')
      const data = await res.json()
      
      setMessages(data.messages)
      setSession(data.session)
      setHasMore(data.hasMore)
      setTotalMessages(data.totalMessages)
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Solo cargar mensajes nuevos (sin recargar todo)
  const loadNewMessages = async () => {
    try {
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}?limit=20&offset=0`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!res.ok) return
      const data = await res.json()
      
      // Solo actualizar si hay mensajes nuevos
      if (data.messages.length > 0) {
        const lastCurrentMessageId = messages[messages.length - 1]?.id
        const lastNewMessageId = data.messages[data.messages.length - 1]?.id
        
        if (lastCurrentMessageId !== lastNewMessageId) {
          setMessages(prevMessages => {
            // Mantener mensajes antiguos cargados y agregar nuevos
            const oldMessages = prevMessages.slice(0, -20)
            return [...oldMessages, ...data.messages]
          })
        }
      }
      
      // Actualizar sesión siempre
      setSession(data.session)
      setTotalMessages(data.totalMessages)
    } catch (error) {
      console.error('Error loading new messages:', error)
    }
  }

  // Cargar mensajes más antiguos
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      const currentOffset = messages.length
      const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}?limit=20&offset=${currentOffset}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!res.ok) throw new Error('Failed to fetch more messages')
      const data = await res.json()
      
      // Guardar posición del scroll antes de agregar mensajes
      const container = messagesContainerRef.current
      const scrollHeightBefore = container?.scrollHeight || 0
      
      // Agregar mensajes antiguos al inicio
      setMessages(prevMessages => [...data.messages, ...prevMessages])
      setHasMore(data.hasMore)
      
      // Restaurar posición del scroll (evitar salto)
      setTimeout(() => {
        if (container) {
          const scrollHeightAfter = container.scrollHeight
          container.scrollTop = scrollHeightAfter - scrollHeightBefore
        }
      }, 0)
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoadingMore(false)
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
    if ((!newMessage.trim() && !newImageFile) || isSending) return

    setIsSending(true)
    try {
      // Si hay imagen, enviarla directamente
      if (newImageFile) {
        const formData = new FormData()
        formData.append('file', newImageFile)
        formData.append('phone', resolvedParams.phone)
        formData.append('caption', newMessage.trim() || '')
        
        const uploadRes = await fetch('/api/admin/whatsapp/upload-image', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) {
          let errorMessage = 'Error al enviar imagen'
          try {
            const errorData = await uploadRes.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            // Si no es JSON válido, usar el status text
            errorMessage = uploadRes.statusText || errorMessage
            console.error('Response text:', await uploadRes.text())
          }
          throw new Error(errorMessage)
        }
        
        setNewImageFile(null)
        setImagePreview(null)
      }
      
      // Si hay mensaje de texto sin imagen
      if (newMessage.trim() && !newImageFile) {
        const res = await fetch(`/api/admin/whatsapp/${resolvedParams.phone}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage })
        })

        if (!res.ok) throw new Error('Failed to send message')
      }

      setNewMessage('')
      // Recargar conversación inmediatamente
      await loadConversation()
      
      // Hacer scroll después de enviar
      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar mensaje: ' + (error instanceof Error ? error.message : 'Desconocido'))
    } finally {
      setIsSending(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }
    
    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen debe ser menor a 10MB')
      return
    }
    
    setNewImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setNewImageFile(null)
    setImagePreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
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
            onClick={() => loadConversation()}
            className={styles.refreshButton}
            disabled={isRefreshing}
            title="Refrescar mensajes"
          >
            <RefreshCw size={20} className={isRefreshing ? styles.spinning : ''} />
          </button>
          
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
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={styles.infoButton}
            title="Información del cliente"
          >
            {isSidebarOpen ? <X size={22} /> : <Info size={22} />}
          </button>
        </div>
      </div>

      {/* Overlay cuando el sidebar está abierto en móvil */}
      {isSidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar con info del cliente */}
      <div className={styles.container}>
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2>Información</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className={styles.sidebarClose}
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
          
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
          <div className={styles.messages} ref={messagesContainerRef}>
            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button 
                  onClick={loadMoreMessages}
                  disabled={isLoadingMore}
                  className={styles.loadMoreButton}
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw size={16} className={styles.spinning} />
                      Cargando...
                    </>
                  ) : (
                    <>
                      ⬆️ Ver mensajes anteriores ({totalMessages - messages.length} más)
                    </>
                  )}
                </button>
              </div>
            )}
            
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
                          alt="Imagen"
                          className={styles.messageImage}
                          onClick={() => setExpandedImage(`/api/admin/whatsapp/media/${msg.metadata.media_id}`)}
                          title="Click para expandir"
                        />
                        {msg.content && <p className={styles.messageText}>{msg.content}</p>}
                      </div>
                    ) : msg.message_type === 'image' && msg.metadata?.image_url ? (
                      <div>
                        <img
                          src={msg.metadata.image_url}
                          alt="Imagen enviada"
                          className={styles.messageImage}
                          onClick={() => setExpandedImage(msg.metadata.image_url)}
                          title="Click para expandir"
                        />
                        {msg.content && msg.content !== '[Imagen enviada]' && <p className={styles.messageText}>{msg.content}</p>}
                      </div>
                    ) : msg.message_type === 'audio' && msg.metadata?.media_id ? (
                      <div className={styles.audioMessage}>
                        <audio
                          controls
                          className={styles.audioPlayer}
                          src={`/api/admin/whatsapp/media/${msg.metadata.media_id}`}
                        />
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
            {/* Preview de imagen */}
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={clearImage}
                  className={styles.clearImageButton}
                  disabled={isSending}
                  title="Eliminar imagen"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            
            <div className={styles.inputRow}>
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
              
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={session.mode === 'bot' || isSending}
                className={styles.fileInput}
                style={{ display: 'none' }}
              />
              
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={session.mode === 'bot' || isSending}
                className={styles.imageButton}
                title="Adjuntar imagen"
              >
                <ImageIcon size={20} />
              </button>
              
              <button
                type="submit"
                disabled={(!newMessage.trim() && !newImageFile) || session.mode === 'bot' || isSending}
                className={styles.sendButton}
                title={session.mode === 'bot' ? 'Cambia a modo manual para enviar' : 'Enviar mensaje'}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          
          {/* Indicador de modo activo */}
          {session.mode === 'manual' && (
            <div className={styles.manualModeIndicator}>
              👤 Modo Manual Activo - El bot NO responderá a este chat
            </div>
          )}
        </div>
      </div>

      {/* Modal para expandir imagen - Renderizado con Portal */}
      {expandedImage && typeof document !== 'undefined' && createPortal(
        <div className={styles.imageModal} onClick={() => setExpandedImage(null)}>
          <div className={styles.imageModalContent}>
            <button
              className={styles.imageModalClose}
              onClick={() => setExpandedImage(null)}
              title="Cerrar (ESC)"
            >
              <X size={32} />
            </button>
            <img
              src={expandedImage}
              alt="Imagen expandida"
              className={styles.imageModalImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
