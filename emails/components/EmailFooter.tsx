import * as React from 'react'
import { Section, Text, Link, Hr } from '@react-email/components'

interface EmailFooterProps {
  unsubscribeUrl: string
}

export const EmailFooter = ({ unsubscribeUrl }: EmailFooterProps) => {
  return (
    <Section style={footer}>
      <Hr style={divider} />
      <Text style={socialText}>Síguenos en redes sociales</Text>
      <Text style={socialLinks}>
        <Link href="https://www.instagram.com/ninamar_oficial" style={link}>Instagram</Link>
        {' · '}
        <Link href="https://www.facebook.com/profile.php?id=61585522993204" style={link}>Facebook</Link>
      </Text>
      <Text style={copyright}>
        © {new Date().getFullYear()} Niñamar. Popayán, Cauca, Colombia
      </Text>
      <Text style={unsubscribe}>
        <Link href={unsubscribeUrl} style={unsubscribeLink}>
          Cancelar suscripción
        </Link>
      </Text>
    </Section>
  )
}

const footer = {
  backgroundColor: '#f8fafc',
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
}

const divider = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
}

const socialText = {
  margin: '0 0 10px',
  color: '#94a3b8',
  fontSize: '14px',
}

const socialLinks = {
  margin: '0 0 16px',
  fontSize: '14px',
}

const link = {
  color: '#a6e8e4',
  textDecoration: 'none',
}

const copyright = {
  margin: '0',
  color: '#94a3b8',
  fontSize: '12px',
}

const unsubscribe = {
  margin: '8px 0 0',
  color: '#94a3b8',
  fontSize: '12px',
}

const unsubscribeLink = {
  color: '#94a3b8',
  textDecoration: 'underline',
}