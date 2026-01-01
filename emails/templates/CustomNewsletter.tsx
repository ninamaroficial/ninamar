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
  Column,
  Row,
} from '@react-email/components'
import { EmailHeader } from '../components/EmailHeader'
import { EmailFooter } from '../components/EmailFooter'
import { EmailButton } from '../components/EmailButton'

interface CustomNewsletterProps {
  userName: string
  subject: string
  preheader?: string
  content: string
  images?: Array<{
    url: string
    alt: string
    caption?: string
  }>
  ctaText?: string
  ctaUrl?: string
  unsubscribeUrl: string
}

export const CustomNewsletter = ({
  userName = 'Amigo/a',
  subject,
  preheader,
  content,
  images = [],
  ctaText = 'Ver Productos',
  ctaUrl = 'https://niñamar.com/productos',
  unsubscribeUrl,
}: CustomNewsletterProps) => {
  // Convertir saltos de línea a párrafos
  const paragraphs = content.split('\n').filter(p => p.trim())

  return (
    <Html>
      <Head />
      {preheader && <Preview>{preheader}</Preview>}
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={content_section}>
            <Heading style={heading}>¡Hola {userName}!</Heading>

            {paragraphs.map((paragraph, index) => (
              <Text key={index} style={paragraph_style}>
                {paragraph}
              </Text>
            ))}

            {/* Imágenes */}
            {images.length > 0 && (
              <Section style={imagesSection}>
                {images.length === 1 ? (
                  // Una sola imagen - full width
                  <div style={imageWrapper}>
                    <Img
                      src={images[0].url}
                      alt={images[0].alt}
                      style={imageFull}
                    />
                    {images[0].caption && (
                      <Text style={imageCaption}>{images[0].caption}</Text>
                    )}
                  </div>
                ) : (
                  // Múltiples imágenes - grid
                  <Row>
                    {images.map((image, index) => (
                      <Column key={index} style={imageColumn}>
                        <Img
                          src={image.url}
                          alt={image.alt}
                          style={imageGrid}
                        />
                        {image.caption && (
                          <Text style={imageCaption}>{image.caption}</Text>
                        )}
                      </Column>
                    ))}
                  </Row>
                )}
              </Section>
            )}

            {/* Call to Action */}
            {ctaText && ctaUrl && (
              <Section style={ctaSection}>
                <EmailButton href={ctaUrl}>{ctaText}</EmailButton>
              </Section>
            )}
          </Section>

          <EmailFooter unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  )
}

export default CustomNewsletter

// Estilos
const main = {
  backgroundColor: '#f8fafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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

const content_section = {
  padding: '40px 30px',
}

const heading = {
  margin: '0 0 20px',
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '400',
}

const paragraph_style = {
  margin: '0 0 16px',
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '1.6',
}

const imagesSection = {
  margin: '30px 0',
}

const imageWrapper = {
  textAlign: 'center' as const,
}

const imageFull = {
  width: '100%',
  maxWidth: '540px',
  height: 'auto',
  borderRadius: '8px',
  margin: '0 auto',
}

const imageGrid = {
  width: '100%',
  maxWidth: '260px',
  height: 'auto',
  borderRadius: '8px',
}

const imageColumn = {
  padding: '0 5px',
  textAlign: 'center' as const,
}

const imageCaption = {
  margin: '8px 0 0',
  color: '#94a3b8',
  fontSize: '14px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
}