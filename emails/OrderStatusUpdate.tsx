import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components'

interface OrderStatusUpdateEmailProps {
  orderNumber: string
  customerName: string
  status: 'processing' | 'shipped' | 'delivered'
  trackingUrl?: string
}

const LOGO_URL = 'https://xn--niamar-xwa.com/logo.png'

export default function OrderStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  trackingUrl,
}: OrderStatusUpdateEmailProps) {
  const statusConfig = {
    processing: {
      title: 'Tu pedido está siendo procesado',
      message: 'Estamos preparando tu pedido con mucho cuidado y atención a cada detalle.',
      submessage: 'Te notificaremos cuando lo enviemos.',
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    shipped: {
      title: '¡Tu pedido está en camino!',
      message: 'Tu pedido ha salido de nuestras instalaciones y está viajando hacia ti.',
      submessage: 'Pronto lo tendrás en tus manos.',
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
    },
    delivered: {
      title: '¡Tu pedido ha sido entregado!',
      message: '¡Felicidades! Tu pedido ha llegado a su destino.',
      submessage: 'Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
  }

  const config = statusConfig[status]

  // Determinar qué pasos están completados
  const steps = [
    {
      name: 'Pedido Recibido',
      completed: true,
      description: 'Tu pedido ha sido registrado'
    },
    {
      name: 'Procesando',
      completed: status === 'processing' || status === 'shipped' || status === 'delivered',
      description: 'Preparando tu pedido',
      current: status === 'processing'
    },
    {
      name: 'Enviado',
      completed: status === 'shipped' || status === 'delivered',
      description: 'En camino a tu dirección',
      current: status === 'shipped'
    },
    {
      name: 'Entregado',
      completed: status === 'delivered',
      description: 'Pedido recibido',
      current: status === 'delivered'
    },
  ]

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>
        {config.title} - Pedido {orderNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header con Logo */}
          <Section style={header}>
            <Img
              src={LOGO_URL}
              width="90"
              height="90"
              alt="Niña Mar Logo"
              style={logo}
            />
            <Heading style={headerTitle}>Niña Mar</Heading>
          </Section>

          {/* Status Banner */}
          <Section style={{ ...statusBanner, backgroundColor: config.bgColor, borderLeftColor: config.color }}>
            <Heading style={{ ...bannerTitle, color: config.color }}>
              {config.title}
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Greeting */}
            <Heading style={greeting}>Hola {customerName},</Heading>

            {/* Message */}
            <Text style={messageText}>
              {config.message}
            </Text>
            <Text style={submessageText}>
              {config.submessage}
            </Text>

            {/* Order Number Card */}
            <Section style={orderCard}>
              <Text style={orderCardLabel}>Número de Pedido</Text>
              <Text style={orderCardNumber}>{orderNumber}</Text>
            </Section>

            {/* NUEVA TIMELINE VERTICAL CLARA */}
            <Section style={timelineSection}>
              <Heading style={timelineTitle}>Estado de tu Pedido</Heading>

              {steps.map((step, index) => (
                <div key={index}>
                  <Row style={timelineRow}>
                    {/* Indicador (círculo) */}
                    <Column style={indicatorCol}>
                      <div style={{
                        ...indicator,
                        backgroundColor: step.completed ? config.color : '#e2e8f0',
                        borderColor: step.current ? config.color : 'transparent',
                      }}>
                        {step.completed && (
                          <span style={checkmark}>✓</span>
                        )}
                      </div>
                      {/* Línea conectora */}
                      {index < steps.length - 1 && (
                        <div style={{
                          ...connector,
                          backgroundColor: step.completed ? config.color : '#e2e8f0',
                        }}></div>
                      )}
                    </Column>

                    {/* Contenido del paso */}
                    <Column style={stepContentCol}>
                      <div style={{
                        ...stepCard,
                        backgroundColor: step.current ? config.bgColor : '#ffffff',
                        borderColor: step.current ? config.color : '#e2e8f0',
                        borderWidth: step.current ? '3px' : '2px',
                      }}>
                        <Text style={{
                          ...stepName,
                          color: step.completed ? config.color : '#94a3b8',
                          fontWeight: step.current ? '800' : '700',
                        }}>
                          {step.name}
                        </Text>
                        <Text style={{
                          ...stepDescription,
                          color: step.completed ? '#475569' : '#94a3b8',
                        }}>
                          {step.description}
                        </Text>
                        {step.current && (
                          <div style={currentBadge}>
                            <span style={currentBadgeText}>Estado Actual</span>
                          </div>
                        )}
                      </div>
                    </Column>
                  </Row>
                </div>
              ))}
            </Section>

            {/* Track Order Button */}
            <Section style={buttonSection}>
              <Link
                href={trackingUrl || `${process.env.NEXT_PUBLIC_URL}/seguimiento`}
                style={{ ...trackButton, backgroundColor: config.color }}
              >
                {status === 'delivered' ? 'Ver Detalles del Pedido' : 'Rastrear mi Pedido'}
              </Link>
            </Section>

            {/* Thank You Section for Delivered */}
            {status === 'delivered' && (
              <Section style={thanksSection}>
                <Heading style={thanksTitle}>¡Gracias por tu compra!</Heading>
                <Text style={thanksText}>
                  Esperamos que estés encantada con tu joya personalizada.
                  Si tienes alguna pregunta o comentario, no dudes en contactarnos.
                </Text>
              </Section>
            )}

            {/* Contact Section */}
            <Section style={contactSection}>
              <Text style={contactTitle}>¿Necesitas Ayuda?</Text>
              <Text style={contactText}>
                Si tienes alguna pregunta sobre tu pedido, estamos aquí para ayudarte.
              </Text>
              <Link href={`mailto:${process.env.EMAIL_TO_ADMIN}`} style={contactButton}>
                Contáctanos
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Niña Mar</strong> - Joyería Personalizada
            </Text>
            <Text style={footerText}>
              Popayán, Cauca, Colombia
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Niña Mar. Todos los derechos reservados.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${process.env.NEXT_PUBLIC_URL}`} style={footerLink}>
                Visitar tienda
              </Link>
              {' · '}
              <Link href={`${process.env.NEXT_PUBLIC_URL}/seguimiento`} style={footerLink}>
                Rastrear pedido
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ==================== ESTILOS ====================

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '32px',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

// Header
const header = {
  padding: '32px 32px 24px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #f1f5f9',
}

const logo = {
  margin: '0 auto',
  borderRadius: '50%',
  border: '3px solid #8e4603',
  boxShadow: '0 4px 12px rgba(166, 232, 228, 0.3)',
  display: 'block',
  width: '90px',
  height: '90px',
  objectFit: 'cover' as const,
}

const headerTitle = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '900',
  margin: '16px 0 0',
}

// Status Banner
const statusBanner = {
  padding: '32px',
  textAlign: 'center' as const,
  borderLeft: '6px solid',
}

const bannerTitle = {
  fontSize: '26px',
  fontWeight: '900',
  margin: '0',
  lineHeight: '1.3',
}

// Content
const content = {
  padding: '32px',
}

const greeting = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 24px',
}

const messageText = {
  fontSize: '16px',
  color: '#475569',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const submessageText = {
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 32px',
}

// Order Card
const orderCard = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center' as const,
  marginBottom: '40px',
  border: '2px solid #e2e8f0',
}

const orderCardLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const orderCardNumber = {
  fontSize: '20px',
  fontWeight: '900',
  color: '#0f172a',
  margin: '0',
  fontFamily: 'monospace',
}

// NUEVA TIMELINE VERTICAL
const timelineSection = {
  marginBottom: '40px',
}

const timelineTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 32px',
}

const timelineRow = {
  marginBottom: '0',
  position: 'relative' as const,
}

const indicatorCol = {
  width: '50px',
  position: 'relative' as const,
  paddingRight: '0',
}

const indicator = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '4px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative' as const,
  zIndex: 2,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}

const checkmark = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '1',
}

const connector = {
  width: '4px',
  height: '60px',
  marginLeft: '14px',
  marginTop: '4px',
  borderRadius: '2px',
}

const stepContentCol = {
  paddingLeft: '16px',
  paddingBottom: '24px',
}

const stepCard = {
  padding: '20px',
  borderRadius: '12px',
  border: '2px solid',
  transition: 'all 0.3s ease',
  position: 'relative' as const,
}

const stepName = {
  fontSize: '16px',
  margin: '0 0 6px',
  lineHeight: '1.3',
}

const stepDescription = {
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.5',
}

const currentBadge = {
  marginTop: '12px',
  display: 'inline-block',
}

const currentBadgeText = {
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  color: '#1e40af',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

// Button Section
const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const trackButton = {
  color: '#ffffff',
  padding: '16px 40px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '16px',
  display: 'inline-block',
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
}

// Thanks Section
const thanksSection = {
  backgroundColor: '#f0fdf4',
  padding: '24px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: '2px solid #86efac',
  textAlign: 'center' as const,
}

const thanksTitle = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#065f46',
  margin: '0 0 16px',
}

const thanksText = {
  fontSize: '15px',
  color: '#047857',
  lineHeight: '1.7',
  margin: '0',
}

// Contact Section
const contactSection = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
}

const contactTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 8px',
}

const contactText = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 16px',
}

const contactButton = {
  backgroundColor: '#a6e8e4',
  color: '#0f172a',
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '14px',
  display: 'inline-block',
}

// Footer
const footer = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
  borderTop: '2px solid #e2e8f0',
}

const footerText = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 8px',
  lineHeight: '1.6',
}

const footerLinks = {
  fontSize: '13px',
  margin: '16px 0 0',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}
