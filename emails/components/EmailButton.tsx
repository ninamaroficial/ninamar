import * as React from 'react'
import { Button } from '@react-email/components'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
}

export const EmailButton = ({ href, children }: EmailButtonProps) => {
  return (
    <Button href={href} style={button}>
      {children}
    </Button>
  )
}

const button = {
  background: 'linear-gradient(135deg, #a6e8e4, #8dd4cf)',
  color: '#0f172a',
  padding: '16px 40px',
  borderRadius: '50px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
}