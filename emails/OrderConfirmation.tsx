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
  Hr,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    customization_details?: any
    engraving?: string
  }>
  subtotal: number
  shipping_cost: number
  total: number
  shipping_address: string
  shipping_city: string
  shipping_state: string
}

const LOGO_URL = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/logo.png`
  : 'https://xn--niamar-xwa.com/logo.png' // Actualiza con tu URL

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping_cost,
  total,
  shipping_address,
  shipping_city,
  shipping_state,
}: OrderConfirmationEmailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>Tu pedido {orderNumber} ha sido confirmado. ¡Gracias por confiar en Niña Mar!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header con Logo y Gradiente */}
          <Section style={header}>
            <Img
              src={LOGO_URL}
              width="90"
              height="90"
              alt="Niña Mar Logo"
              style={logo}
            />
            <Heading style={headerTitle}>Niña Mar</Heading>
            <Text style={headerSubtitle}>Joyería Personalizada</Text>
          </Section>

          {/* Confirmación Badge */}
          <Section style={confirmationBadge}>
            <div style={checkmarkCircle}>✓</div>
            <Heading style={confirmationTitle}>¡Pedido Confirmado!</Heading>
            <Text style={confirmationText}>
              Gracias por tu compra, <strong>{customerName}</strong>
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Order Number Card */}
            <Section style={orderCard}>
              <Row>
                <Column style={orderCardLeft}>
                  <Text style={orderCardLabel}>Número de Pedido</Text>
                  <Text style={orderCardNumber}>{orderNumber}</Text>
                </Column>
                <Column style={orderCardRight}>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_URL}/seguimiento`}
                    style={trackButton}
                  >
                    Rastrear Pedido
                  </Link>
                </Column>
              </Row>
            </Section>

            {/* Status Timeline */}
            <Section style={timelineSection}>
              <Text style={timelineTitle}>Estado de tu pedido</Text>
              <div style={timeline}>
                <div style={timelineStep}>
                  <div style={{ ...timelineIcon, ...timelineIconActive }}>✓</div>
                  <Text style={timelineLabel}>Pedido Recibido</Text>
                </div>
                <div style={timelineLine}></div>
                <div style={timelineStep}>
                  <div style={timelineIcon}>⏳</div>
                  <Text style={timelineLabel}>Procesando</Text>
                </div>
                <div style={timelineLine}></div>
                <div style={timelineStep}>
                  <div style={timelineIcon}>📦</div>
                  <Text style={timelineLabel}>Enviado</Text>
                </div>
                <div style={timelineLine}></div>
                <div style={timelineStep}>
                  <div style={timelineIcon}>🏠</div>
                  <Text style={timelineLabel}>Entregado</Text>
                </div>
              </div>
            </Section>

            {/* Order Items con diseño mejorado */}
            <Section style={itemsSection}>
              <Heading style={sectionTitle}>Tu Pedido</Heading>

              {items.map((item, index) => (
                <div key={index} style={itemCard}>
                  <Row>
                    <Column style={itemImageCol}>
                      <div style={itemImagePlaceholder}>💎</div>
                    </Column>
                    <Column style={itemDetailsCol}>
                      <Text style={itemName}>{item.product_name}</Text>
                      <Text style={itemQuantity}>Cantidad: {item.quantity}</Text>
                      {item.customization_details && Array.isArray(item.customization_details) && item.customization_details.length > 0 && (
                        <div style={customizationsContainer}>
                          {item.customization_details.map((custom: any, idx: number) => (
                            <span key={idx} style={customBadge}>
                              {custom.optionName}: {custom.valueName}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.engraving && (
                        <div style={engravingContainer}>
                          <Text style={engravingText}>✍️ "{item.engraving}"</Text>
                        </div>
                      )}
                    </Column>
                    <Column style={itemPriceCol}>
                      <Text style={itemPrice}>{formatPrice(item.total_price)}</Text>
                    </Column>
                  </Row>
                </div>
              ))}

              <Hr style={divider} />

              {/* Totals */}
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Subtotal</Text>
                </Column>
                <Column style={totalValueCol}>
                  <Text style={totalValue}>{formatPrice(subtotal)}</Text>
                </Column>
              </Row>

              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Envío</Text>
                </Column>
                <Column style={totalValueCol}>
                  <Text style={totalValue}>
                    {shipping_cost === 0 ? (
                      <span style={freeShipping}>GRATIS ✨</span>
                    ) : (
                      formatPrice(shipping_cost)
                    )}
                  </Text>
                </Column>
              </Row>

              <Row style={grandTotalRow}>
                <Column>
                  <Text style={grandTotalLabel}>Total</Text>
                </Column>
                <Column style={totalValueCol}>
                  <Text style={grandTotalValue}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Info */}
            <Section style={shippingSection}>
              <Row>
                <Column style={shippingIconCol}>
                  <div style={shippingIcon}>📍</div>
                </Column>
                <Column>
                  <Heading style={shippingSectionTitle}>Dirección de Envío</Heading>
                  <Text style={shippingText}>
                    {shipping_address}<br />
                    {shipping_city}, {shipping_state}<br />
                    Colombia
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Help Section */}
            <Section style={helpSection}>
              <Text style={helpTitle}>💡 Asegura recibir nuestras actualizaciones</Text>
              <Text style={helpText}>
                • Agrega <strong>pedidos@niñamar.com</strong> a tus contactos<br />
                • Si este email está en Spam, márcalo como "No es spam"
              </Text>
            </Section>

            {/* CTA Section */}
            <Section style={ctaSection}>
              <Text style={ctaText}>
                ¿Tienes preguntas sobre tu pedido?
              </Text>
              <Link href={`mailto:${process.env.EMAIL_TO_ADMIN}`} style={ctaButton}>
                Contáctanos
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              <strong>Niña Mar</strong> - Joyería Personalizada
            </Text>
            <Text style={footerText}>
              Popayán, Cauca, Colombia
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Niña Mar. Todos los derechos reservados.
            </Text>
            <Text style={footerLink}>
              <Link href={`${process.env.NEXT_PUBLIC_URL}`} style={link}>
                Visitar tienda
              </Link>
              {' · '}
              <Link href={`${process.env.NEXT_PUBLIC_URL}/seguimiento`} style={link}>
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
  background: 'linear-gradient(135deg, #a6e8e4 0%, #8dd4cf 50%, #6ec1bc 100%)',
  padding: '48px 32px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto 16px',
  borderRadius: '50%',
  border: '4px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  display: 'block',
  width: '100px',
  height: '100px',
  objectFit: 'cover' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '900',
  margin: '16px 0 8px',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  letterSpacing: '1px',
}

// Confirmation Badge
const confirmationBadge = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#f0fdf4',
  borderBottom: '3px solid #10b981',
}

const checkmarkCircle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  lineHeight: '60px',
  margin: '0 auto 16px',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
}

const confirmationTitle = {
  color: '#065f46',
  fontSize: '28px',
  fontWeight: '800',
  margin: '0 0 8px',
}

const confirmationText = {
  color: '#047857',
  fontSize: '16px',
  margin: '0',
}

// Content
const content = {
  padding: '32px',
}

// Order Card
const orderCard = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
  border: '2px solid #fbbf24',
}

const orderCardLeft = {
  verticalAlign: 'middle' as const,
}

const orderCardLabel = {
  color: '#92400e',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const orderCardNumber = {
  color: '#78350f',
  fontSize: '24px',
  fontWeight: '900',
  margin: '0',
  fontFamily: 'monospace',
}

const orderCardRight = {
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
}

const trackButton = {
  backgroundColor: '#fbbf24',
  color: '#78350f',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '14px',
  display: 'inline-block',
  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
}

// Timeline
const timelineSection = {
  marginBottom: '32px',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
}

const timelineTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const timeline = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '0 auto',
  maxWidth: '500px',
}

const timelineStep = {
  textAlign: 'center' as const,
  flex: '1',
}

const timelineIcon = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#e2e8f0',
  color: '#64748b',
  fontSize: '18px',
  lineHeight: '40px',
  margin: '0 auto 8px',
  fontWeight: 'bold',
}

const timelineIconActive = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
}

const timelineLine = {
  flex: '1',
  height: '2px',
  backgroundColor: '#e2e8f0',
  margin: '0 8px 20px',
}

const timelineLabel = {
  fontSize: '11px',
  color: '#64748b',
  margin: '0',
  fontWeight: '600',
}

// Items Section
const itemsSection = {
  marginBottom: '32px',
}

const sectionTitle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 20px',
}

const itemCard = {
  padding: '16px',
  marginBottom: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const itemImageCol = {
  width: '60px',
  verticalAlign: 'top' as const,
}

const itemImagePlaceholder = {
  width: '50px',
  height: '50px',
  borderRadius: '8px',
  backgroundColor: '#a6e8e4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
}

const itemDetailsCol = {
  verticalAlign: 'top' as const,
  paddingLeft: '12px',
}

const itemName = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 4px',
}

const itemQuantity = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 8px',
}

const customizationsContainer = {
  marginTop: '8px',
}

const customBadge = {
  display: 'inline-block',
  padding: '4px 10px',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  marginRight: '6px',
  marginBottom: '4px',
}

const engravingContainer = {
  marginTop: '8px',
  padding: '8px 12px',
  backgroundColor: '#f3e8ff',
  borderRadius: '6px',
  borderLeft: '3px solid #8b5cf6',
}

const engravingText = {
  fontSize: '13px',
  color: '#6b21a8',
  fontStyle: 'italic' as const,
  margin: '0',
}

const itemPriceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
}

const itemPrice = {
  fontSize: '18px',
  fontWeight: '800',
  color: '#0f172a',
  margin: '0',
}

// Totals
const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const totalRow = {
  marginBottom: '12px',
}

const totalLabel = {
  fontSize: '15px',
  color: '#64748b',
  margin: '0',
}

const totalValueCol = {
  textAlign: 'right' as const,
}

const totalValue = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0',
}

const freeShipping = {
  color: '#10b981',
  fontWeight: '700',
}

const grandTotalRow = {
  backgroundColor: '#f0fdf4',
  padding: '16px',
  borderRadius: '8px',
  marginTop: '16px',
}

const grandTotalLabel = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#065f46',
  margin: '0',
}

const grandTotalValue = {
  fontSize: '24px',
  fontWeight: '900',
  color: '#047857',
  margin: '0',
}

// Shipping
const shippingSection = {
  marginBottom: '24px',
  padding: '20px',
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  border: '2px solid #3b82f6',
}

const shippingIconCol = {
  width: '60px',
  verticalAlign: 'top' as const,
}

const shippingIcon = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontSize: '24px',
  lineHeight: '48px',
  textAlign: 'center' as const,
}

const shippingSectionTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#1e40af',
  margin: '0 0 8px',
}

const shippingText = {
  fontSize: '14px',
  color: '#1e40af',
  margin: '0',
  lineHeight: '1.6',
}

// Help Section
const helpSection = {
  marginBottom: '24px',
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  border: '2px dashed #fbbf24',
}

const helpTitle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 12px',
}

const helpText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  lineHeight: '1.8',
}

// CTA
const ctaSection = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const ctaText = {
  fontSize: '16px',
  color: '#64748b',
  margin: '0 0 16px',
}

const ctaButton = {
  backgroundColor: '#a6e8e4',
  color: '#0f172a',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '16px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(166, 232, 228, 0.4)',
}

// Footer
const footer = {
  padding: '32px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
}

const footerDivider = {
  borderColor: '#e2e8f0',
  margin: '0 0 24px',
}

const footerText = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 8px',
  lineHeight: '1.6',
}

const footerLink = {
  fontSize: '13px',
  margin: '16px 0 0',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}