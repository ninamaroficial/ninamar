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
  Row,
  Column,
  Hr,
} from '@react-email/components'

interface NewOrderAdminEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    product_name: string
    quantity: number
    customization_details?: any
    engraving?: string
  }>
  total: number
  shipping_address: string
  shipping_city: string
  shipping_state: string
}

export default function NewOrderAdminEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  items,
  total,
  shipping_address,
  shipping_city,
  shipping_state,
}: NewOrderAdminEmailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <Html>
      <Head />
      <Preview>Nueva orden recibida: {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🔔 Nueva Orden Recibida</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>Orden {orderNumber}</Heading>
            
            {/* Customer Info */}
            <Section style={infoSection}>
              <Heading style={h3}>Información del Cliente</Heading>
              <Text style={text}>
                <strong>Nombre:</strong> {customerName}<br />
                <strong>Email:</strong> {customerEmail}<br />
                <strong>Teléfono:</strong> {customerPhone}
              </Text>
            </Section>

            {/* Items */}
            <Section style={itemsSection}>
              <Heading style={h3}>Productos ({items.length})</Heading>
              {items.map((item, index) => (
                <div key={index} style={itemContainer}>
                  <Text style={itemText}>
                    <strong>{item.product_name}</strong> x{item.quantity}
                  </Text>
                  {item.customization_details && Array.isArray(item.customization_details) && (
                    <Text style={customText}>
                      {item.customization_details.map((custom: any) => 
                        `${custom.optionName}: ${custom.valueName}`
                      ).join(', ')}
                    </Text>
                  )}
                  {item.engraving && (
                    <Text style={engravingText}>
                      ✍️ Grabado: "{item.engraving}"
                    </Text>
                  )}
                </div>
              ))}
            </Section>

            {/* Shipping */}
            <Section style={shippingSection}>
              <Heading style={h3}>Dirección de Envío</Heading>
              <Text style={text}>
                {shipping_address}<br />
                {shipping_city}, {shipping_state}<br />
                Colombia
              </Text>
            </Section>

            {/* Total */}
            <Section style={totalSection}>
              <Text style={finalTotal}>
                Total: {formatPrice(total)}
              </Text>
            </Section>

            {/* Admin Panel Button */}
            <Section style={buttonSection}>
              <Link
                href={`${process.env.NEXT_PUBLIC_URL}/admin/dashboard`}
                style={button}
              >
                Ver en Panel de Admin
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Esta es una notificación automática del sistema Niña Mar
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
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
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

const h3 = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const infoSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
}

const itemsSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
}

const itemContainer = {
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e2e8f0',
}

const itemText = {
  margin: '0 0 8px',
  fontSize: '15px',
  color: '#0f172a',
}

const customText = {
  margin: '0 0 4px',
  fontSize: '13px',
  color: '#64748b',
}

const engravingText = {
  margin: '0',
  fontSize: '13px',
  color: '#8b5cf6',
  fontStyle: 'italic' as const,
}

const shippingSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
}

const totalSection = {
  margin: '24px 0',
  padding: '20px',
  textAlign: 'center' as const,
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
}

const finalTotal = {
  margin: '0',
  fontSize: '24px',
  color: '#065f46',
  fontWeight: '900',
}

const buttonSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
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