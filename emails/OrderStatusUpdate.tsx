import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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

export default function OrderStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  trackingUrl,
}: OrderStatusUpdateEmailProps) {
  const statusConfig = {
    processing: {
      emoji: '📦',
      title: 'Tu pedido está siendo procesado',
      message: 'Estamos preparando tu pedido con mucho cuidado. Te notificaremos cuando lo enviemos.',
      color: '#3b82f6',
    },
    shipped: {
      emoji: '🚚',
      title: '¡Tu pedido ha sido enviado!',
      message: 'Tu pedido está en camino. Pronto lo tendrás en tus manos.',
      color: '#8b5cf6',
    },
    delivered: {
      emoji: '✅',
      title: '¡Tu pedido ha sido entregado!',
      message: 'Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!',
      color: '#10b981',
    },
  }

  const config = statusConfig[status]

  return (
    <Html>
      <Head />
      <Preview>
        Actualización de tu pedido {orderNumber} - {config.title}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={{ ...header, backgroundColor: config.color }}>
            <Heading style={h1}>
              {config.emoji} {config.title}
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>Hola {customerName},</Heading>
            <Text style={text}>{config.message}</Text>

            <Section style={orderSection}>
              <Text style={orderText}>
                <strong>Número de orden:</strong> {orderNumber}
              </Text>
            </Section>

            {/* Track Order Button */}
            <Section style={buttonSection}>
              <Link
                href={trackingUrl || `${process.env.NEXT_PUBLIC_URL}/seguimiento`}
                style={button}
              >
                Rastrear mi pedido
              </Link>
            </Section>

            <Text style={footer}>
              Si tienes alguna pregunta, no dudes en contactarnos.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © 2024 Niña Mar. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 48px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '900',
  margin: '0',
  padding: '0',
}

const content = {
  padding: '0 48px',
}

const h2 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '32px 0 16px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const orderSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
}

const orderText = {
  margin: '0',
  fontSize: '16px',
  color: '#0f172a',
}

const buttonSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#a6e8e4',
  borderRadius: '8px',
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
}

const footerSection = {
  padding: '24px 48px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
}