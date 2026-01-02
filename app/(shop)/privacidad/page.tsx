import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Niñamar',
  description: 'Política de privacidad y protección de datos personales de Niñamar. Conoce cómo recopilamos, usamos y protegemos tu información.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacidadPage() {
  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.content}>
          <h1 className={styles.title}>Política de Privacidad</h1>
          <p className={styles.updated}>Última actualización: 1 de enero de 2026</p>

          <section className={styles.section}>
            <h2 className={styles.heading}>1. Información que Recopilamos</h2>
            <p className={styles.text}>
              En Niñamar, recopilamos la siguiente información personal cuando utilizas nuestros servicios:
            </p>
            <ul className={styles.list}>
              <li><strong>Información de contacto:</strong> nombre, correo electrónico, número de teléfono y dirección de envío.</li>
              <li><strong>Información de pedidos:</strong> detalles de los productos que compras, personalizaciones solicitadas y preferencias.</li>
              <li><strong>Información de pago:</strong> procesada de forma segura a través de MercadoPago. No almacenamos información completa de tarjetas de crédito.</li>
              <li><strong>Información de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas y tiempo de navegación.</li>
              <li><strong>Newsletter:</strong> correo electrónico si te suscribes a nuestro boletín informativo.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>2. Cómo Usamos tu Información</h2>
            <p className={styles.text}>
              Utilizamos tu información personal para los siguientes propósitos:
            </p>
            <ul className={styles.list}>
              <li>Procesar y gestionar tus pedidos de accesorios personalizados.</li>
              <li>Comunicarnos contigo sobre el estado de tus pedidos y envíos.</li>
              <li>Personalizar tu experiencia de compra según tus preferencias.</li>
              <li>Enviarte información sobre nuevos productos, ofertas y promociones (solo si te has suscrito).</li>
              <li>Mejorar nuestros productos y servicios mediante análisis de datos.</li>
              <li>Cumplir con obligaciones legales y fiscales.</li>
              <li>Prevenir fraudes y garantizar la seguridad de nuestro sitio web.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>3. Base Legal para el Tratamiento de Datos</h2>
            <p className={styles.text}>
              Procesamos tus datos personales bajo las siguientes bases legales:
            </p>
            <ul className={styles.list}>
              <li><strong>Ejecución de contrato:</strong> para procesar tus pedidos y entregas.</li>
              <li><strong>Consentimiento:</strong> cuando te suscribes a nuestro newsletter o aceptas cookies.</li>
              <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y prevenir fraudes.</li>
              <li><strong>Cumplimiento legal:</strong> para cumplir con obligaciones fiscales y legales en Colombia.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>4. Compartir tu Información</h2>
            <p className={styles.text}>
              No vendemos ni alquilamos tu información personal. Compartimos tu información solo en los siguientes casos:
            </p>
            <ul className={styles.list}>
              <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar nuestro negocio, como procesadores de pago (MercadoPago), servicios de envío y plataformas de email.</li>
              <li><strong>Cumplimiento legal:</strong> cuando sea requerido por ley o para proteger nuestros derechos legales.</li>
              <li><strong>Transferencia de negocio:</strong> en caso de fusión, adquisición o venta de activos.</li>
            </ul>
            <p className={styles.text}>
              Todos nuestros proveedores están obligados contractualmente a proteger tu información y usarla solo para los fines especificados.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>5. Seguridad de tus Datos</h2>
            <p className={styles.text}>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal:
            </p>
            <ul className={styles.list}>
              <li>Encriptación SSL/TLS para todas las transmisiones de datos.</li>
              <li>Almacenamiento seguro en servidores protegidos.</li>
              <li>Acceso limitado solo a personal autorizado.</li>
              <li>Revisiones periódicas de nuestras prácticas de seguridad.</li>
            </ul>
            <p className={styles.text}>
              Sin embargo, ningún método de transmisión por Internet es 100% seguro. Hacemos nuestro mejor esfuerzo para proteger tu información, pero no podemos garantizar su seguridad absoluta.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>6. Tus Derechos</h2>
            <p className={styles.text}>
              De acuerdo con la Ley 1581 de 2012 de Colombia y normativas de protección de datos, tienes los siguientes derechos:
            </p>
            <ul className={styles.list}>
              <li><strong>Acceso:</strong> solicitar una copia de los datos personales que tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos personales.</li>
              <li><strong>Oposición:</strong> oponerte al procesamiento de tus datos para ciertos fines.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</li>
              <li><strong>Revocación del consentimiento:</strong> retirar tu consentimiento en cualquier momento.</li>
            </ul>
            <p className={styles.text}>
              Para ejercer cualquiera de estos derechos, contáctanos en: <a href="mailto:ninamar.oficial@gmail.com" className={styles.link}>ninamar.oficial@gmail.com</a>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>7. Cookies</h2>
            <p className={styles.text}>
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web:
            </p>
            <ul className={styles.list}>
              <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento del sitio.</li>
              <li><strong>Cookies de rendimiento:</strong> nos ayudan a entender cómo los visitantes usan nuestro sitio.</li>
              <li><strong>Cookies de funcionalidad:</strong> recuerdan tus preferencias.</li>
              <li><strong>Cookies de marketing:</strong> para mostrarte contenido relevante (solo con tu consentimiento).</li>
            </ul>
            <p className={styles.text}>
              Puedes gestionar tus preferencias de cookies en la configuración de tu navegador. Para más información, consulta nuestra <a href="/cookies" className={styles.link}>Política de Cookies</a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>8. Retención de Datos</h2>
            <p className={styles.text}>
              Conservamos tu información personal durante el tiempo necesario para:
            </p>
            <ul className={styles.list}>
              <li>Cumplir con los fines para los que fue recopilada.</li>
              <li>Cumplir con obligaciones legales, contables y fiscales (generalmente 5 años en Colombia).</li>
              <li>Resolver disputas y hacer cumplir nuestros acuerdos.</li>
            </ul>
            <p className={styles.text}>
              Cuando tus datos ya no sean necesarios, los eliminaremos o anonimizaremos de forma segura.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>9. Newsletter</h2>
            <p className={styles.text}>
              Si te suscribes a nuestro newsletter, usaremos tu correo electrónico para enviarte:
            </p>
            <ul className={styles.list}>
              <li>Información sobre nuevas colecciones y productos.</li>
              <li>Ofertas exclusivas y promociones.</li>
              <li>Tips de cuidado de accesorios y contenido relevante.</li>
            </ul>
            <p className={styles.text}>
              Puedes cancelar tu suscripción en cualquier momento haciendo clic en el enlace "Cancelar suscripción" al final de cualquier email que recibas, o contactándonos directamente.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>10. Menores de Edad</h2>
            <p className={styles.text}>
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado datos de un menor sin consentimiento parental, eliminaremos esa información de inmediato.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>11. Enlaces a Terceros</h2>
            <p className={styles.text}>
              Nuestro sitio web puede contener enlaces a sitios de terceros (como redes sociales o procesadores de pago). No somos responsables de las prácticas de privacidad de estos sitios. Te recomendamos leer sus políticas de privacidad.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>12. Cambios a esta Política</h2>
            <p className={styles.text}>
              Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas o por razones legales. Te notificaremos sobre cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
            </p>
            <p className={styles.text}>
              Te recomendamos revisar esta página periódicamente para estar informado sobre cómo protegemos tu información.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>13. Contacto</h2>
            <p className={styles.text}>
              Si tienes preguntas, inquietudes o deseas ejercer tus derechos sobre tus datos personales, contáctanos:
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Niñamar</strong></p>
              <p>Popayán, Cauca, Colombia</p>
              <p>Email: <a href="mailto:ninamar.oficial@gmail.com" className={styles.link}>ninamar.oficial@gmail.com</a></p>
              <p>Teléfono: <a href="tel:+573001234567" className={styles.link}>+57 300 123 4567</a></p>
            </div>
          </section>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Al utilizar nuestro sitio web y servicios, aceptas esta Política de Privacidad.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}