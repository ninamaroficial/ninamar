import * as React from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
  Row,
  Column,
} from '@react-email/components'
import { EmailHeader } from '../components/EmailHeader'
import { EmailFooter } from '../components/EmailFooter'
import { EmailButton } from '../components/EmailButton'

interface Product {
  name: string
  image: string
  price: string
  url: string
}

interface ProductAnnouncementProps {
  userName: string
  title: string
  description: string
  products: Product[]
  unsubscribeUrl: string
}

export const ProductAnnouncement = ({
  userName = 'Amigo/a',
  title,
  description,
  products,
  unsubscribeUrl,
}: ProductAnnouncementProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={content}>
            <Heading style={heading}>¡Hola {userName}! ✨</Heading>
            
            <Heading as="h2" style={subheading}>
              {title}
            </Heading>
            
            <Text style={description_text}>
              {description}
            </Text>

            {/* Grid de Productos */}
            <Section style={productsSection}>
              <Row>
                {products.map((product, index) => (
                  <Column key={index} style={productColumn}>
                    <div style={productCard}>
                      <Img
                        src={product.image}
                        alt={product.name}
                        style={productImage}
                      />
                      <Text style={productName}>{product.name}</Text>
                      <Text style={productPrice}>{product.price}</Text>
                      <EmailButton href={product.url}>
                        Ver Detalles
                      </EmailButton>
                    </div>
                  </Column>
                ))}
              </Row>
            </Section>

            <Section style={ctaSection}>
              <EmailButton href="https://niñamar.com/productos">
                Ver Toda la Colección
              </EmailButton>
            </Section>
          </Section>

          <EmailFooter unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  )
}

export default ProductAnnouncement

const main = {
  backgroundColor: '#f8fafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}

const content = {
  padding: '40px 30px',
}

const heading = {
  margin: '0 0 20px',
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '400',
}

const subheading = {
  margin: '0 0 16px',
  color: '#0f766e',
  fontSize: '28px',
  fontWeight: '600',
  textAlign: 'center' as const,
}

const description_text = {
  margin: '0 0 30px',
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
}

const productsSection = {
  margin: '30px 0',
}

const productColumn = {
  padding: '10px',
}

const productCard = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
}

const productImage = {
  width: '100%',
  maxWidth: '200px',
  height: 'auto',
  borderRadius: '8px',
  margin: '0 auto 16px',
}

const productName = {
  margin: '0 0 8px',
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: '600',
}

const productPrice = {
  margin: '0 0 16px',
  color: '#0f766e',
  fontSize: '20px',
  fontWeight: '600',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '40px 0 0',
}