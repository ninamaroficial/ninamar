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
      emoji: '📦',
      icon: '⚙️',
      title: 'Tu pedido está siendo procesado',
      message: 'Estamos preparando tu pedido con mucho cuidado y atención a cada detalle.',
      submessage: 'Te notificaremos cuando lo enviemos.',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#3b82f6',
      illustration: '🎨',
    },
    shipped: {
      emoji: '🚚',
      icon: '✈️',
      title: '¡Tu pedido está en camino!',
      message: 'Tu pedido ha salido de nuestras instalaciones y está viajando hacia ti.',
      submessage: 'Pronto lo tendrás en tus manos.',
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      borderColor: '#8b5cf6',
      illustration: '📮',
    },
    delivered: {
      emoji: '🎉',
      icon: '✅',
      title: '¡Tu pedido ha sido entregado!',
      message: '¡Felicidades! Tu pedido ha llegado a su destino.',
      submessage: 'Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!',
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#10b981',
      illustration: '🎁',
    },
  }

  const config = statusConfig[status]

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
              width="70"
              height="70"
              alt="Niña Mar Logo"
              style={logo}
            />
            <Heading style={headerTitle}>Niña Mar</Heading>
          </Section>

          {/* Status Hero Section */}
          <Section style={{...heroSection, backgroundColor: config.bgColor, borderTopColor: config.borderColor}}>
            <div style={{...statusIcon, backgroundColor: config.color}}>
              {config.icon}
            </div>
            <Heading style={{...heroTitle, color: config.color}}>
              {config.title}
            </Heading>
            <div style={illustrationContainer}>
              <span style={illustration}>{config.illustration}</span>
            </div>
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

            {/* Progress Bar */}
            <Section style={progressSection}>
              <Text style={progressTitle}>Progreso del Pedido</Text>
              <div style={progressContainer}>
                <div style={progressBar}>
                  <div style={{
                    ...progressFill,
                    width: status === 'processing' ? '33%' : status === 'shipped' ? '66%' : '100%',
                    backgroundColor: config.color,
                  }}></div>
                </div>
              </div>
              
              <div style={milestonesContainer}>
                <div style={milestone}>
                  <div style={{
                    ...milestoneIcon,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                  }}>✓</div>
                  <Text style={milestoneLabel}>Recibido</Text>
                </div>
                
                <div style={milestone}>
                  <div style={{
                    ...milestoneIcon,
                    backgroundColor: status === 'processing' || status === 'shipped' || status === 'delivered' ? '#3b82f6' : '#e2e8f0',
                    color: status === 'processing' || status === 'shipped' || status === 'delivered' ? '#ffffff' : '#94a3b8',
                  }}>
                    {status === 'processing' || status === 'shipped' || status === 'delivered' ? '✓' : '⏳'}
                  </div>
                  <Text style={milestoneLabel}>Procesando</Text>
                </div>
                
                <div style={milestone}>
                  <div style={{
                    ...milestoneIcon,
                    backgroundColor: status === 'shipped' || status === 'delivered' ? '#8b5cf6' : '#e2e8f0',
                    color: status === 'shipped' || status === 'delivered' ? '#ffffff' : '#94a3b8',
                  }}>
                    {status === 'shipped' || status === 'delivered' ? '✓' : '📦'}
                  </div>
                  <Text style={milestoneLabel}>Enviado</Text>
                </div>
                
                <div style={milestone}>
                  <div style={{
                    ...milestoneIcon,
                    backgroundColor: status === 'delivered' ? '#10b981' : '#e2e8f0',
                    color: status === 'delivered' ? '#ffffff' : '#94a3b8',
                  }}>
                    {status === 'delivered' ? '✓' : '🏠'}
                  </div>
                  <Text style={milestoneLabel}>Entregado</Text>
                </div>
              </div>
            </Section>

            {/* Track Order Button */}
            <Section style={buttonSection}>
              <Link
                href={trackingUrl || `${process.env.NEXT_PUBLIC_URL}/seguimiento`}
                style={{...trackButton, backgroundColor: config.color}}
              >
                {status === 'delivered' ? 'Ver Detalles del Pedido' : 'Rastrear mi Pedido'}
              </Link>
            </Section>

            {/* Help Section */}
            {status !== 'delivered' && (
              <Section style={helpSection}>
                <Text style={helpTitle}>📱 Mantente Informado</Text>
                <Text style={helpText}>
                  Te enviaremos actualizaciones por email en cada etapa del proceso.
                  Puedes rastrear tu pedido en cualquier momento usando el botón de arriba.
                </Text>
              </Section>
            )}

            {/* Thank You Section for Delivered */}
            {status === 'delivered' && (
              <Section style={thanksSection}>
                <Heading style={thanksTitle}>¡Gracias por tu compra!</Heading>
                <Text style={thanksText}>
                  Esperamos que estés encantada con tu joya personalizada.
                  Si tienes alguna pregunta o comentario, no dudes en contactarnos.
                </Text>
                <Text style={thanksText}>
                  💝 Nos encantaría ver cómo luce tu joya. ¡Etiquétanos en redes sociales!
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
  border: '3px solid #a6e8e4',
  boxShadow: '0 4px 12px rgba(166, 232, 228, 0.3)',
}

const headerTitle = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '900',
  margin: '16px 0 0',
}

// Hero Section
const heroSection = {
  padding: '48px 32px',
  textAlign: 'center' as const,
  borderTop: '4px solid',
  position: 'relative' as const,
}

const statusIcon = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '40px',
  lineHeight: '80px',
  margin: '0 auto 24px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
}

const heroTitle = {
  fontSize: '28px',
  fontWeight: '900',
  margin: '0 0 16px',
  lineHeight: '1.2',
}

const illustrationContainer = {
  marginTop: '24px',
}

const illustration = {
  fontSize: '64px',
  display: 'inline-block',
  animation: 'bounce 2s ease-in-out infinite',
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
  fontStyle: 'italic' as const,
}

// Order Card
const orderCard = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center' as const,
  marginBottom: '32px',
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

// Progress Section
const progressSection = {
  marginBottom: '32px',
}

const progressTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const progressContainer = {
  marginBottom: '24px',
}

const progressBar = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e2e8f0',
  borderRadius: '9999px',
  overflow: 'hidden' as const,
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
}

const progressFill = {
  height: '100%',
  borderRadius: '9999px',
  transition: 'width 0.3s ease',
  boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
}

const milestonesContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '16px',
}

const milestone = {
  textAlign: 'center' as const,
  flex: '1',
}

const milestoneIcon = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  fontSize: '18px',
  lineHeight: '40px',
  margin: '0 auto 8px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
}

const milestoneLabel = {
  fontSize: '11px',
  color: '#64748b',
  margin: '0',
  fontWeight: '600',
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
  transition: 'transform 0.2s ease',
}

// Help Section
const helpSection = {
  backgroundColor: '#eff6ff',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: '2px solid #bfdbfe',
}

const helpTitle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#1e40af',
  margin: '0 0 12px',
}

const helpText = {
  fontSize: '14px',
  color: '#1e40af',
  lineHeight: '1.6',
  margin: '0',
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
  margin: '0 0 12px',
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