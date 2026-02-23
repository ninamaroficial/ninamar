"use client"

import { usePathname } from 'next/navigation'

const phone = "573005469257"
const presetMessage = encodeURIComponent("Hola, quiero conocer los productos de Niñamar ❤️")

const whatsappUrl = `https://wa.me/${phone}?text=${presetMessage}`

export default function WhatsAppButton() {
  const pathname = usePathname()
  
  // Ocultar en rutas de administración
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <a
      href={whatsappUrl}
      className="whatsapp-floating"
      aria-label="Chatea con nosotros en WhatsApp"
      title="Escríbenos a nuestro WhatsApp"
      target="_blank"
      rel="noreferrer noopener"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        role="img"
        aria-hidden="true"
        className="whatsapp-icon"
      >
        <path
          fill="#25D366"
          d="M27.1 4.9A15.8 15.8 0 0 0 16 0 15.9 15.9 0 0 0 2.4 24.3L0 32l7.9-2.3A16 16 0 0 0 16 32h.1A15.9 15.9 0 0 0 32 16c0-4.3-1.7-8.3-4.9-11.1Z"
        />
        <path
          fill="#FFF"
          d="M16.1 29.3c-2.5 0-5-.7-7.1-2l-.5-.3-4.7 1.4 1.5-4.5-.3-.5a13 13 0 0 1 20.2-15.5 13 13 0 0 1-9.1 21.4Zm7.1-9.8c-.4-.2-2.5-1.2-2.9-1.3-.4-.1-.7-.2-1 .2l-.8 1c-.3.3-.5.3-1 0-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.5-2.2-2.9-.2-.4 0-.6.2-.8l.5-.6c.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8l-1.3-3c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.8.1-1.3.6-.4.4-1.7 1.6-1.7 3.8 0 2.2 1.7 4.3 2 4.6.2.3 3.3 5.2 8 7.1 1.1.5 2 .8 2.7 1 .9.3 1.7.2 2.3.1.7-.1 2.5-1 2.8-2 .3-1 .3-1.7.2-1.9-.1-.1-.3-.2-.7-.4Z"
        />
      </svg>
    </a>
  )
}
