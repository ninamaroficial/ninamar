import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface OrderSatisfactionSurveyEmailProps {
  customerName: string
  orderNumber: string
  surveyUrl: string
}

const LOGO_URL = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/logo.png`
  : 'https://xn--niamar-xwa.com/logo.png'

export default function OrderSatisfactionSurveyEmail({
  customerName,
  orderNumber,
  surveyUrl,
}: OrderSatisfactionSurveyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Ayúdanos a confirmar cómo recibiste tu pedido {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={hero}>
            <Img
              src={LOGO_URL}
              width="90"
              height="90"
              alt="Niña Mar Logo"
              style={logo}
            />
            <Text style={eyebrow}>Niña Mar</Text>
            <Heading style={title}>Tu opinión nos ayuda a mejorar</Heading>
            <Text style={subtitle}>
              Hola {customerName}, esperamos que ya estés disfrutando tu pedido {orderNumber}.
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Queremos confirmar cómo fue tu experiencia con el pedido, el producto y la entrega.
              La encuesta toma menos de un minuto.
            </Text>

            <Section style={highlights}>
              <Text style={highlightItem}>Califica tu experiencia general de 1 a 5 estrellas</Text>
              <Text style={highlightItem}>Califica el producto recibido</Text>
              <Text style={highlightItem}>Califica la entrega y el estado del pedido</Text>
            </Section>

            <Section style={buttonWrap}>
              <Button href={surveyUrl} style={button}>
                Responder encuesta
              </Button>
            </Section>

            <Text style={helpText}>
              Si el botón no funciona, copia este enlace en tu navegador:
            </Text>
            <Text style={urlText}>{surveyUrl}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>Síguenos</Text>
            <Text style={footerText}>
              <Link href="https://www.instagram.com/ninamar_oficial" style={socialLink}>Instagram</Link>
              {'  '}
              <Link href="https://www.facebook.com/profile.php?id=61585970772454" style={socialLink}>Facebook</Link>
            </Text>
            <Text style={footerText}>📧 ninamar.oficial@gmail.com</Text>
            <Text style={footerText}>📍 Popayán, Cauca, Colombia</Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Niñamar. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Helvetica, Arial, sans-serif',
  margin: '0',
  padding: '24px 12px',
}

const container = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '0 auto',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #eadfce',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const hero = {
  background: 'linear-gradient(135deg, #ffeafdff 0%, #d3aacfff 50%, #6ec1bc 100%)',
  padding: '44px 32px 32px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto 16px',
  borderRadius: '50%',
  border: '4px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  display: 'block',
  width: '90px',
  height: '90px',
  objectFit: 'cover' as const,
}

const eyebrow = {
  margin: '0 0 10px',
  color: 'rgba(255, 255, 255, 0.92)',
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
}

const title = {
  margin: '0 0 12px',
  color: '#ffffff',
  fontSize: '34px',
  fontWeight: '800',
  lineHeight: '1.15',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

const subtitle = {
  margin: '0',
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '16px',
  lineHeight: '1.6',
}

const content = {
  padding: '32px',
}

const paragraph = {
  margin: '0 0 20px',
  color: '#47362e',
  fontSize: '16px',
  lineHeight: '1.7',
}

const highlights = {
  backgroundColor: '#fbf3e7',
  borderRadius: '18px',
  padding: '18px 20px',
  border: '1px solid #eedfc9',
}

const highlightItem = {
  margin: '0 0 10px',
  color: '#5d453b',
  fontSize: '15px',
  lineHeight: '1.6',
}

const buttonWrap = {
  textAlign: 'center' as const,
  padding: '28px 0 20px',
}

const button = {
  backgroundColor: '#1f6f63',
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '700',
  padding: '15px 28px',
  textDecoration: 'none',
}

const helpText = {
  margin: '0 0 8px',
  color: '#7a655d',
  fontSize: '13px',
}

const urlText = {
  margin: '0',
  color: '#1f6f63',
  fontSize: '13px',
  lineHeight: '1.6',
  wordBreak: 'break-all' as const,
}

const footer = {
  borderTop: '1px solid #efe5d8',
  padding: '20px 32px 28px',
}

const footerText = {
  margin: '0 0 6px',
  color: '#7a655d',
  fontSize: '13px',
}

const socialLink = {
  color: '#1f6f63',
  textDecoration: 'none',
}