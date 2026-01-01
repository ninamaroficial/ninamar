import * as React from 'react'
import { Img, Section, Column } from '@react-email/components'

interface EmailHeaderProps {
  logoUrl?: string
}

export const EmailHeader = ({ 
  logoUrl = 'https://niñamar.com/logo.png' 
}: EmailHeaderProps) => {
  return (
    <Section style={header}>
      <Column align="center">
        {logoUrl && (
          <Img
            src={logoUrl}
            width="60"
            height="60"
            alt="Niñamar"
            style={logo}
          />
        )}
        <h1 style={title}>Niñamar</h1>
        <p style={subtitle}>Joyas Personalizadas</p>
      </Column>
    </Section>
  )
}

const header = {
  background: 'linear-gradient(135deg, #a6e8e4 0%, #8dd4cf 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto 16px',
  borderRadius: '50%',
}

const title = {
  margin: '0',
  color: '#0f172a',
  fontSize: '32px',
  fontWeight: '400',
  letterSpacing: '0.5px',
}

const subtitle = {
  margin: '10px 0 0',
  color: '#0f172a',
  fontSize: '16px',
}