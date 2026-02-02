import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
  Hr,
  Link,
} from '@react-email/components'

interface NewsletterTemplateProps {
  subject: string
  preheader?: string
  content: string
  ctaText?: string
  ctaUrl?: string
  unsubscribeUrl: string
  appUrl?: string
}

export default function NewsletterTemplate({
  subject,
  preheader,
  content,
  ctaText,
  ctaUrl,
  unsubscribeUrl,
  appUrl = 'https://niñamar.com',
}: NewsletterTemplateProps) {
  return (
    <Html>
      <Head />
      {preheader && <Preview>{preheader}</Preview>}
      <Body style={main}>
        {/* Borde decorativo superior con degradado */}
        <div style={topBorder} />
        
        <Container style={container}>
          {/* Header con Logo y decoración */}
          <Section style={header}>
            <div style={headerDecoration}>
              <Img
                src="https://niñamar.com/images/gif-logo2.gif"
                alt="Niñamar"
                width="140"
                height="auto"
                style={logo}
              />
            </div>
            <Text style={tagline}>Accesorios Creativos y Coloridos Hechos a Mano ✨</Text>
          </Section>

          {/* Contenido Principal con borde decorativo */}
          <Section style={contentSection}>
            <div style={contentBorder}>
              <Heading style={h1}>{subject}</Heading>
              
              <div dangerouslySetInnerHTML={{ __html: content }} />

              {/* CTA Button con estilo Niñamar */}
              {ctaText && ctaUrl && (
                <Section style={buttonContainer}>
                  <Link href={ctaUrl} style={button}>
                    {ctaText} 💫
                  </Link>
                </Section>
              )}
            </div>
          </Section>

          {/* Decoración de emojis/iconos */}
          <Section style={decorationSection}>
          </Section>

          {/* Footer con gradiente */}
          <Section style={footer}>
            <div style={footerGradient}>
              <Text style={footerTextBold}>
                Niñamar
              </Text>
              <Text style={footerText}>
                Popayán, Cauca, Colombia 🇨🇴
              </Text>
              <Text style={footerText}>
                📧 ninamar.oficial@gmail.com
              </Text>
              
              {/* Redes Sociales con iconos */}
              <Section style={socialSection}>
                <table style={socialTable}>
                  <tr>
                    <td style={socialCell}>
                      <Link href="https://www.instagram.com/ninamar_oficial/" style={socialLink}>
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                          alt="Instagram"
                          width="32"
                          height="32"
                          style={socialIcon}
                        />
                      </Link>
                    </td>
                    <td style={socialCell}>
                      <Link href="https://www.facebook.com/profile.php?id=61571296265803" style={socialLink}>
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                          alt="Facebook"
                          width="32"
                          height="32"
                          style={socialIcon}
                        />
                      </Link>
                    </td>
                    <td style={socialCell}>
                      <Link href="https://www.tiktok.com/@ninamar.oficial" style={socialLink}>
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
                          alt="TikTok"
                          width="32"
                          height="32"
                          style={socialIcon}
                        />
                      </Link>
                    </td>
                    <td style={socialCell}>
                      <Link href="https://niñamar.com" style={socialLink}>
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png"
                          alt="Website"
                          width="32"
                          height="32"
                          style={socialIcon}
                        />
                      </Link>
                    </td>
                  </tr>
                </table>
              </Section>
              
              <Hr style={footerDivider} />
              
              <Text style={footerTextSmall}>
                © {new Date().getFullYear()} Niñamar. Todos los derechos reservados.
              </Text>
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Cancelar suscripción
              </Link>
            </div>
          </Section>
        </Container>
        
        {/* Borde decorativo inferior con degradado */}
        <div style={bottomBorder} />
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#fef5ff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '0',
}

const topBorder = {
  height: '8px',
  background: 'linear-gradient(90deg, #ffb3f9 0%, #ff8bf5 33%, #ffdb31 66%, #ffb3f9 100%)',
}

const bottomBorder = {
  height: '8px',
  background: 'linear-gradient(90deg, #ffb3f9 0%, #ffdb31 33%, #ff8bf5 66%, #ffb3f9 100%)',
}

const container = {
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
}

const header = {
  padding: '40px 32px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  position: 'relative' as const,
}

const headerDecoration = {
  position: 'relative' as const,
  display: 'inline-block',
  padding: '20px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(255, 179, 249, 0.1) 0%, rgba(255, 219, 49, 0.1) 100%)',
  border: '3px solid transparent',
  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #ffb3f9, #ff8bf5, #ffdb31)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
}

const logo = {
  margin: '0 auto',
  display: 'block',
}

const tagline = {
  margin: '16px 0 0',
  fontSize: '14px',
  color: '#ff8bf5',
  fontWeight: '600',
  textAlign: 'center' as const,
}

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '0 32px 32px',
}

const contentBorder = {
  borderLeft: '4px solid #ffb3f9',
  borderRight: '4px solid #ffdb31',
  padding: '32px 24px',
  borderRadius: '12px',
  backgroundColor: '#fefefe',
}

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
  background: 'linear-gradient(135deg, #ff8bf5 0%, #ffb3f9 50%, #ffdb31 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const button = {
  background: 'linear-gradient(135deg, #ffb3f9 0%, #ff8bf5 100%)',
  borderRadius: '30px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
  boxShadow: '0 4px 15px rgba(255, 139, 245, 0.3)',
  border: '2px solid #ff8bf5',
}

const decorationSection = {
  padding: '24px 0',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
}

const decorationText = {
  fontSize: '24px',
  margin: '0',
  letterSpacing: '8px',
}

const footer = {
  backgroundColor: '#ffffff',
  padding: '0 32px 40px',
}

const footerGradient = {
  background: 'linear-gradient(135deg, rgba(255, 179, 249, 0.1) 0%, rgba(255, 219, 49, 0.1) 100%)',
  borderRadius: '12px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  border: '2px solid #ffb3f9',
}

const footerTextBold = {
  color: '#ff8bf5',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '20px',
  margin: '0 0 16px',
}

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const footerTextSmall = {
  color: '#999',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0 4px',
}

const footerDivider = {
  borderColor: '#ffb3f9',
  margin: '24px 0 16px',
  opacity: 0.3,
}

const unsubscribeLink = {
  color: '#ff8bf5',
  fontSize: '12px',
  textDecoration: 'underline',
  marginTop: '8px',
  display: 'inline-block',
}

const socialSection = {
  margin: '24px 0 16px',
}

const socialTable = {
  margin: '0 auto',
  borderSpacing: '0',
  borderCollapse: 'separate' as const,
}

const socialCell = {
  padding: '0 8px',
}

const socialLink = {
  textDecoration: 'none',
  display: 'inline-block',
}

const socialIcon = {
  borderRadius: '50%',
  display: 'block',
  transition: 'transform 0.2s',
}
