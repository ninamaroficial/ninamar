<Head>
  {/* Mejoras anti-spam */}
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
</Head>

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
  }>
  subtotal: number
  shipping_cost: number
  total: number
  shipping_address: string
  shipping_city: string
  shipping_state: string
}

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
      <Head />
      <Preview>
        Tu pedido {orderNumber} ha sido confirmado. Gracias por tu compra en Niñamar.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>💎 Niña Mar</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>¡Gracias por tu pedido, {customerName}!</Heading>
            <Text style={text}>
              Hemos recibido tu pedido <strong>{orderNumber}</strong> y estamos procesándolo.
              Te notificaremos cuando realicemos el envío.
            </Text>

            {/* Order Items */}
            <Section style={itemsSection}>
              <Heading style={h3}>Resumen de tu pedido</Heading>
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={itemName}>
                    <Text style={itemText}>
                      {item.product_name} x{item.quantity}
                    </Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text style={itemText}>{formatPrice(item.total_price)}</Text>
                  </Column>
                </Row>
              ))}

              <Hr style={hr} />

              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Subtotal:</Text>
                </Column>
                <Column>
                  <Text style={totalValue}>{formatPrice(subtotal)}</Text>
                </Column>
              </Row>

              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Envío:</Text>
                </Column>
                <Column>
                  <Text style={totalValue}>
                    {shipping_cost === 0 ? 'GRATIS' : formatPrice(shipping_cost)}
                  </Text>
                </Column>
              </Row>

              <Row style={totalRow}>
                <Column>
                  <Text style={finalTotal}>Total:</Text>
                </Column>
                <Column>
                  <Text style={finalTotal}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Info */}
            <Section style={shippingSection}>
              <Heading style={h3}>Dirección de envío</Heading>
              <Text style={text}>
                {shipping_address}<br />
                {shipping_city}, {shipping_state}<br />
                Colombia
              </Text>
            </Section>

            {/* Track Order Button */}
            <Section style={buttonSection}>
              <Link
                href={`${process.env.NEXT_PUBLIC_URL}/seguimiento`}
                style={button}
              >
                Rastrear mi pedido
              </Link>
            </Section>

            <Text style={footer}>
              Si tienes alguna pregunta, contáctanos respondiendo a este email.
            </Text>
          </Section>

        <Section style={footerSection}>
          <Text style={footerText}>
            Niña Mar - Joyería Personalizada
          </Text>
          <Text style={footerText}>
            Popayán, Cauca, Colombia
          </Text>
          <Text style={footerText}>
            © 2025 Niñamar. Todos los derechos reservados.
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
  background: 'linear-gradient(135deg, #a6e8e4, #8dd4cf)',
}

const h1 = {
  color: '#0f172a',
  fontSize: '32px',
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
  margin: '0 0 16px',
}

const itemsSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
}

const itemRow = {
  marginBottom: '8px',
}

const itemName = {
  width: '70%',
}

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
}

const itemText = {
  margin: '0',
  fontSize: '14px',
  color: '#525f7f',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '16px 0',
}

const totalRow = {
  marginBottom: '8px',
}

const totalLabel = {
  margin: '0',
  fontSize: '14px',
  color: '#525f7f',
}

const totalValue = {
  margin: '0',
  fontSize: '14px',
  color: '#0f172a',
  fontWeight: '600',
  textAlign: 'right' as const,
}

const finalTotal = {
  margin: '0',
  fontSize: '18px',
  color: '#0f172a',
  fontWeight: '700',
  textAlign: 'right' as const,
}

const shippingSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
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