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

const LOGO_URL = 'https://xn--niamar-xwa.com/logo.png'

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
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>🔔 Nueva orden {orderNumber} de {customerName} - Total: {formatPrice(total)}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Admin */}
          <Section style={header}>
            <Row>
              <Column style={logoCol}>
                <Img
                  src={LOGO_URL}
                  width="60"
                  height="60"
                  alt="Niña Mar Logo"
                  style={logo}
                />
              </Column>
              <Column style={headerTextCol}>
                <Heading style={headerTitle}>Nueva Orden Recibida</Heading>
                <Text style={headerSubtitle}>Panel de Administración</Text>
              </Column>
            </Row>
          </Section>

          {/* Alert Badge */}
          <Section style={alertBadge}>
            <div style={alertIcon}>🔔</div>
            <Heading style={alertTitle}>¡Nuevo Pedido!</Heading>
            <Text style={alertOrderNumber}>{orderNumber}</Text>
            <Text style={alertTotal}>{formatPrice(total)}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Customer Info Card */}
            <Section style={infoCard}>
              <div style={cardHeader}>
                <div style={cardIcon}>👤</div>
                <Heading style={cardTitle}>Información del Cliente</Heading>
              </div>
              <div style={cardBody}>
                <Row style={infoRow}>
                  <Column style={infoLabel}>
                    <Text style={infoLabelText}>Nombre:</Text>
                  </Column>
                  <Column>
                    <Text style={infoValue}>{customerName}</Text>
                  </Column>
                </Row>
                <Row style={infoRow}>
                  <Column style={infoLabel}>
                    <Text style={infoLabelText}>Email:</Text>
                  </Column>
                  <Column>
                    <Link href={`mailto:${customerEmail}`} style={infoLink}>
                      {customerEmail}
                    </Link>
                  </Column>
                </Row>
                <Row style={infoRow}>
                  <Column style={infoLabel}>
                    <Text style={infoLabelText}>Teléfono:</Text>
                  </Column>
                  <Column>
                    <Link href={`tel:${customerPhone}`} style={infoLink}>
                      {customerPhone}
                    </Link>
                  </Column>
                </Row>
              </div>
            </Section>

            {/* Products Card */}
            <Section style={infoCard}>
              <div style={cardHeader}>
                <div style={cardIcon}>📦</div>
                <Heading style={cardTitle}>Productos ({items.length})</Heading>
              </div>
              <div style={cardBody}>
                {items.map((item, index) => (
                  <div key={index} style={productItem}>
                    <Text style={productName}>
                      <strong>{item.product_name}</strong> × {item.quantity}
                    </Text>
                    
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
                        <Text style={engravingText}>
                          ✍️ Grabado: <strong>"{item.engraving}"</strong>
                        </Text>
                      </div>
                    )}
                    
                    {index < items.length - 1 && <Hr style={productDivider} />}
                  </div>
                ))}
              </div>
            </Section>

            {/* Shipping Card */}
            <Section style={infoCard}>
              <div style={cardHeader}>
                <div style={cardIcon}>🚚</div>
                <Heading style={cardTitle}>Dirección de Envío</Heading>
              </div>
              <div style={cardBody}>
                <Text style={shippingAddress}>
                  {shipping_address}<br />
                  {shipping_city}, {shipping_state}<br />
                  Colombia
                </Text>
              </div>
            </Section>

            {/* Total Card */}
            <Section style={totalCard}>
              <Row>
                <Column>
                  <Text style={totalLabel}>Total del Pedido</Text>
                </Column>
                <Column style={totalValueCol}>
                  <Text style={totalValue}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Action Buttons */}
            <Section style={actionsSection}>
              <Link
                href={`${process.env.NEXT_PUBLIC_URL}/admin/dashboard`}
                style={primaryButton}
              >
                Ver en Panel Admin
              </Link>
              <Link
                href={`mailto:${customerEmail}`}
                style={secondaryButton}
              >
                Contactar Cliente
              </Link>
            </Section>

            {/* Quick Actions */}
            <Section style={quickActionsSection}>
              <Text style={quickActionsTitle}>Acciones Rápidas</Text>
              <div style={quickActionsGrid}>
                <div style={quickAction}>
                  <div style={quickActionIcon}>✅</div>
                  <Text style={quickActionText}>Marcar como Procesando</Text>
                </div>
                <div style={quickAction}>
                  <div style={quickActionIcon}>📋</div>
                  <Text style={quickActionText}>Imprimir Orden</Text>
                </div>
                <div style={quickAction}>
                  <div style={quickActionIcon}>📧</div>
                  <Text style={quickActionText}>Enviar Email al Cliente</Text>
                </div>
              </div>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              Esta es una notificación automática del sistema Niña Mar
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_URL}/admin/dashboard`} style={footerLink}>
                Panel de Administración
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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '32px',
}

const logoCol = {
  width: '70px',
  verticalAlign: 'middle' as const,
}

const logo = {
  borderRadius: '50%',
  border: '3px solid rgba(255, 255, 255, 0.3)',
}

const headerTextCol = {
  verticalAlign: 'middle' as const,
  paddingLeft: '16px',
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '900',
  margin: '0 0 4px',
}

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
}

// Alert Badge
const alertBadge = {
  padding: '32px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  borderBottom: '3px solid #f59e0b',
}

const alertIcon = {
  fontSize: '48px',
  marginBottom: '12px',
}

const alertTitle = {
  color: '#78350f',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0 0 12px',
}

const alertOrderNumber = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
  fontFamily: 'monospace',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  padding: '8px 16px',
  borderRadius: '6px',
  display: 'inline-block',
}

const alertTotal = {
  color: '#065f46',
  fontSize: '32px',
  fontWeight: '900',
  margin: '0',
}

// Content
const content = {
  padding: '32px',
}

// Info Cards
const infoCard = {
  marginBottom: '24px',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden' as const,
}

const cardHeader = {
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  borderBottom: '2px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
}

const cardIcon = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: '#667eea',
  color: '#ffffff',
  fontSize: '18px',
  lineHeight: '36px',
  textAlign: 'center' as const,
  marginRight: '12px',
  flexShrink: 0,
}

const cardTitle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0',
}

const cardBody = {
  padding: '20px',
}

const infoRow = {
  marginBottom: '12px',
}

const infoLabel = {
  width: '100px',
}

const infoLabelText = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  margin: '0',
}

const infoValue = {
  fontSize: '14px',
  color: '#0f172a',
  margin: '0',
}

const infoLink = {
  fontSize: '14px',
  color: '#3b82f6',
  textDecoration: 'underline',
}

// Products
const productItem = {
  marginBottom: '16px',
}

const productName = {
  fontSize: '15px',
  color: '#0f172a',
  margin: '0 0 8px',
}

const customizationsContainer = {
  marginTop: '8px',
  marginBottom: '8px',
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
  padding: '10px 12px',
  backgroundColor: '#f3e8ff',
  borderRadius: '6px',
  borderLeft: '3px solid #8b5cf6',
}

const engravingText = {
  fontSize: '13px',
  color: '#6b21a8',
  margin: '0',
}

const productDivider = {
  borderColor: '#e2e8f0',
  margin: '16px 0',
}

const shippingAddress = {
  fontSize: '14px',
  color: '#0f172a',
  lineHeight: '1.8',
  margin: '0',
}

// Total Card
const totalCard = {
  backgroundColor: '#d1fae5',
  padding: '24px',
  borderRadius: '12px',
  marginBottom: '24px',
  border: '2px solid #10b981',
}

const totalLabel = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#065f46',
  margin: '0',
}

const totalValueCol = {
  textAlign: 'right' as const,
}

const totalValue = {
  fontSize: '28px',
  fontWeight: '900',
  color: '#047857',
  margin: '0',
}

// Action Buttons
const actionsSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const primaryButton = {
  backgroundColor: '#667eea',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '15px',
  display: 'inline-block',
  marginRight: '12px',
  marginBottom: '12px',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
}

const secondaryButton = {
  backgroundColor: '#f8fafc',
  color: '#667eea',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '15px',
  display: 'inline-block',
  border: '2px solid #667eea',
  marginBottom: '12px',
}

// Quick Actions
const quickActionsSection = {
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  marginBottom: '24px',
}

const quickActionsTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#64748b',
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const quickActionsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
}

const quickAction = {
  textAlign: 'center' as const,
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const quickActionIcon = {
  fontSize: '24px',
  marginBottom: '8px',
}

const quickActionText = {
  fontSize: '11px',
  color: '#64748b',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.4',
}

// Footer
const footer = {
  padding: '24px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
}

const footerDivider = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px',
}

const footerText = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}