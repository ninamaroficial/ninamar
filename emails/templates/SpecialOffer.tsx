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
} from '@react-email/components'
import { EmailHeader } from '../components/EmailHeader'
import { EmailFooter } from '../components/EmailFooter'
import { EmailButton } from '../components/EmailButton'

interface SpecialOfferProps {
  userName: string
  offerTitle: string
  offerSubtitle: string
  discount: string
  description: string
  bannerImage?: string
  expiryDate: string
  couponCode?: string
  ctaUrl: string
  unsubscribeUrl: string
}

export const SpecialOffer = ({
  userName = 'Amigo/a',
  offerTitle,
  offerSubtitle,
  discount,
  description,
  bannerImage,
  expiryDate,
  couponCode,
  ctaUrl,
  unsubscribeUrl,
}: SpecialOfferProps) => {
  return (
    <Html>
      <Head />
      <Preview>{offerTitle} - {discount} de descuento</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Section style={content}>
            <Heading style={greeting}>¡Hola {userName}! 🎉</Heading>

            {/* Banner de oferta */}
            {bannerImage && (
              <Img
                src={bannerImage}
                alt={offerTitle}
                style={bannerImg}
              />
            )}

            {/* Título de la oferta */}
            <Section style={offerBox}>
              <Heading as="h2" style={offerTitleStyle}>
                {offerTitle}
              </Heading>
              <Text style={offerSubtitleStyle}>
                {offerSubtitle}
              </Text>
              <div style={discountBadge}>
                {discount}
              </div>
            </Section>

            <Text style={description_text}>
              {description}
            </Text>

            {/* Código de cupón */}
            {couponCode && (
              <Section style={couponSection}>
                <Text style={couponLabel}>Usa el código:</Text>
                <div style={couponCode_style}>
                  {couponCode}
                </div>
                <Text style={couponHint}>
                  Copia este código al momento de pagar
                </Text>
              </Section>
            )}

            {/* CTA */}
            <Section style={ctaSection}>
              <EmailButton href={ctaUrl}>
                Aprovechar Oferta
              </EmailButton>
            </Section>

            {/* Expiración */}
            <Text style={expiryText}>
              ⏰ Oferta válida hasta: <strong>{expiryDate}</strong>
            </Text>
          </Section>

          <EmailFooter unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  )
}

export default SpecialOffer

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

const greeting = {
  margin: '0 0 24px',
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '400',
}

const bannerImg = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  margin: '0 0 24px',
}

const offerBox = {
  textAlign: 'center' as const,
  padding: '30px',
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  borderRadius: '12px',
  margin: '0 0 24px',
}

const offerTitleStyle = {
  margin: '0 0 8px',
  color: '#92400e',
  fontSize: '28px',
  fontWeight: '700',
}

const offerSubtitleStyle = {
  margin: '0 0 16px',
  color: '#78350f',
  fontSize: '16px',
}

const discountBadge = {
  display: 'inline-block',
  padding: '12px 32px',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  borderRadius: '50px',
  margin: '0 auto',
}

const description_text = {
  margin: '0 0 24px',
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
}

const couponSection = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '2px dashed #a6e8e4',
  margin: '0 0 24px',
}

const couponLabel = {
  margin: '0 0 8px',
  color: '#64748b',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const couponCode_style = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#0f172a',
  color: '#a6e8e4',
  fontSize: '24px',
  fontWeight: '700',
  borderRadius: '8px',
  letterSpacing: '0.1em',
  fontFamily: 'monospace',
  margin: '0 auto 8px',
}

const couponHint = {
  margin: '0',
  color: '#94a3b8',
  fontSize: '12px',
  fontStyle: 'italic',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const expiryText = {
  margin: '24px 0 0',
  color: '#dc2626',
  fontSize: '14px',
  textAlign: 'center' as const,
}