import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import styles from '../privacidad/page.module.css'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Niñamar',
  description: 'Términos y condiciones de uso de Niñamar. Lee nuestras políticas de compra, envío y devoluciones.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TerminosPage() {
  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.content}>
          <h1 className={styles.title}>Términos y Condiciones</h1>
          <p className={styles.updated}>Última actualización: 1 de enero de 2026</p>

          <section className={styles.section}>
            <h2 className={styles.heading}>1. Aceptación de los Términos</h2>
            <p className={styles.text}>
              Al acceder y utilizar el sitio web de Niñamar, aceptas cumplir con estos Términos y Condiciones. 
              Si no estás de acuerdo con alguno de estos términos, por favor no utilices nuestros servicios.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>2. Sobre Niñamar</h2>
            <p className={styles.text}>
              Niñamar es una marca de joyería artesanal personalizada con sede en Popayán, Cauca, Colombia. 
              Nos especializamos en la creación de joyas únicas hechas a mano.
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Información de Contacto:</strong></p>
              <p>Nombre comercial: Niñamar</p>
              <p>Ubicación: Popayán, Cauca, Colombia</p>
              <p>Email: ninamar.oficial@gmail.com</p>
              <p>Teléfono: +57 300 123 4567</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>3. Uso del Sitio Web</h2>
            <p className={styles.text}>
              Al utilizar nuestro sitio web, te comprometes a:
            </p>
            <ul className={styles.list}>
              <li>Proporcionar información veraz y actualizada.</li>
              <li>No usar el sitio para fines ilegales o no autorizados.</li>
              <li>No intentar acceder a áreas restringidas del sitio.</li>
              <li>No interferir con el funcionamiento del sitio.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>4. Productos y Precios</h2>
            <p className={styles.text}>
              <strong>Descripción de productos:</strong> Nos esforzamos por mostrar los productos con la mayor precisión posible. 
              Sin embargo, las imágenes son representativas y pueden variar ligeramente del producto final, especialmente 
              en joyas personalizadas hechas a mano.
            </p>
            <p className={styles.text}>
              <strong>Precios:</strong> Todos los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplique. 
              Los precios pueden cambiar sin previo aviso, pero los pedidos confirmados mantendrán el precio al momento de la compra.
            </p>
            <p className={styles.text}>
              <strong>Disponibilidad:</strong> Los productos están sujetos a disponibilidad. Si un producto no está disponible 
              después de realizar el pedido, te contactaremos para ofrecerte alternativas o un reembolso completo.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>5. Proceso de Compra</h2>
            <p className={styles.text}>
              <strong>Pedidos:</strong> Al realizar un pedido, estás haciendo una oferta de compra. Nos reservamos el derecho 
              de aceptar o rechazar cualquier pedido por cualquier motivo.
            </p>
            <p className={styles.text}>
              <strong>Confirmación:</strong> Recibirás un email de confirmación cuando se procese tu pedido. Esta confirmación 
              no constituye la aceptación de tu pedido, solo confirma que lo hemos recibido.
            </p>
            <p className={styles.text}>
              <strong>Personalización:</strong> Para joyas personalizadas, te contactaremos para confirmar los detalles 
              específicos antes de iniciar la producción.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>6. Pago</h2>
            <p className={styles.text}>
              Aceptamos los siguientes métodos de pago a través de MercadoPago:
            </p>
            <ul className={styles.list}>
              <li>Tarjetas de crédito y débito</li>
              <li>PSE (Pagos Seguros en Línea)</li>
              <li>Efectivo en puntos autorizados</li>
              <li>Transferencias bancarias</li>
            </ul>
            <p className={styles.text}>
              El pago debe completarse antes de que comencemos la producción de tu joya personalizada.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>7. Envíos y Entregas</h2>
            <p className={styles.text}>
              <strong>Tiempo de producción:</strong> Las joyas personalizadas requieren tiempo de elaboración. 
              El tiempo estimado de producción es de 7 a 15 días hábiles, dependiendo de la complejidad del diseño.
            </p>
            <p className={styles.text}>
              <strong>Costos de envío:</strong> Los costos de envío se calculan según la ubicación y el peso del paquete. 
              Ofrecemos envío gratis para compras superiores a $100.000 COP.
            </p>
            <p className={styles.text}>
              <strong>Tiempo de entrega:</strong> Una vez enviado el pedido, el tiempo de entrega es de 2 a 5 días hábiles 
              dentro de Colombia, dependiendo de la ciudad.
            </p>
            <p className={styles.text}>
              <strong>Seguimiento:</strong> Recibirás un número de seguimiento cuando se despache tu pedido.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>8. Devoluciones y Cambios</h2>
            <p className={styles.text}>
              <strong>Productos estándar:</strong> Tienes 15 días calendario desde la recepción del producto para solicitar 
              una devolución o cambio, siempre que el producto esté en perfectas condiciones, sin usar y en su empaque original.
            </p>
            <p className={styles.text}>
              <strong>Productos personalizados:</strong> Debido a la naturaleza personalizada de nuestras joyas, 
              NO aceptamos devoluciones de productos personalizados, excepto en caso de defectos de fabricación.
            </p>
            <p className={styles.text}>
              <strong>Defectos de fabricación:</strong> Si encuentras un defecto de fabricación, contáctanos dentro de 
              los 7 días siguientes a la recepción del producto. Evaluaremos el caso y, si procede, repararemos, 
              reemplazaremos o reembolsaremos el producto.
            </p>
            <p className={styles.text}>
              Para solicitar una devolución, contacta a: <a href="mailto:ninamar.oficial@gmail.com
" className={styles.link}>ninamar.oficial@gmail.com</a>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>9. Garantía</h2>
            <p className={styles.text}>
              Todas nuestras joyas cuentan con garantía de 6 meses contra defectos de fabricación, que incluye:
            </p>
            <ul className={styles.list}>
              <li>Roturas por defectos en la soldadura o ensamblaje</li>
              <li>Pérdida de piedras por montaje defectuoso</li>
              <li>Descoloración por materiales de baja calidad</li>
            </ul>
            <p className={styles.text}>
              La garantía NO cubre:
            </p>
            <ul className={styles.list}>
              <li>Daños por uso inadecuado o negligencia</li>
              <li>Desgaste natural de los materiales</li>
              <li>Modificaciones realizadas por terceros</li>
              <li>Pérdida o robo</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>10. Propiedad Intelectual</h2>
            <p className={styles.text}>
              Todo el contenido del sitio web de Niñamar, incluyendo textos, imágenes, logos, diseños y código, 
              está protegido por derechos de autor y otras leyes de propiedad intelectual. No puedes reproducir, 
              distribuir o modificar ningún contenido sin nuestro permiso expreso por escrito.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>11. Limitación de Responsabilidad</h2>
            <p className={styles.text}>
              Niñamar no será responsable de:
            </p>
            <ul className={styles.list}>
              <li>Daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios.</li>
              <li>Retrasos en la entrega causados por terceros (empresas de envío, aduanas, etc.).</li>
              <li>Pérdida de datos o interrupciones del servicio del sitio web.</li>
              <li>Decisiones tomadas basándose en la información del sitio web.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>12. Derecho de Retracto</h2>
            <p className={styles.text}>
              Según la Ley 1480 de 2011 (Estatuto del Consumidor en Colombia), tienes derecho a retractarte de 
              la compra dentro de los 5 días hábiles siguientes a la entrega del producto, siempre que se cumplan 
              las condiciones establecidas en el punto 8 (Devoluciones y Cambios).
            </p>
            <p className={styles.text}>
              Para ejercer este derecho, envía un correo a: <a href="mailto:ninamar.oficial@gmail.com
" className={styles.link}>ninamar.oficial@gmail.com
</a>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>13. Protección de Datos Personales</h2>
            <p className={styles.text}>
              El tratamiento de tus datos personales se rige por nuestra{' '}
              <a href="/privacidad" className={styles.link}>Política de Privacidad</a>, 
              que cumple con la Ley 1581 de 2012 de Colombia.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>14. Modificaciones</h2>
            <p className={styles.text}>
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. 
              Tu uso continuado del sitio después de dichos cambios constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>15. Ley Aplicable y Jurisdicción</h2>
            <p className={styles.text}>
              Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. 
              Cualquier disputa derivada de estos términos será resuelta en los tribunales competentes 
              de Popayán, Cauca, Colombia.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>16. Contacto</h2>
            <p className={styles.text}>
              Si tienes preguntas sobre estos Términos y Condiciones, contáctanos:
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Niñamar</strong></p>
              <p>Email: <a href="mailto:ninamar.oficial@gmail.com
" className={styles.link}>ninamar.oficial@gmail.com
</a></p>
              <p>Teléfono: <a href="tel:+573001234567" className={styles.link}>+57 300 123 4567</a></p>
              <p>Dirección: Popayán, Cauca, Colombia</p>
            </div>
          </section>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Al realizar una compra o utilizar nuestros servicios, confirmas que has leído, 
              comprendido y aceptado estos Términos y Condiciones.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}