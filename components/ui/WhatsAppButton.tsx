import { MessageCircle } from "lucide-react"

const phone = "573005469257"
const presetMessage = encodeURIComponent("Hola, quisiera más información sobre Niñamar ✨")
const whatsappUrl = `https://wa.me/${phone}?text=${presetMessage}`

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      className="whatsapp-floating"
      aria-label="Chatea con nosotros en WhatsApp"
      target="_blank"
      rel="noreferrer noopener"
    >
      <MessageCircle size={24} strokeWidth={2.2} />
    </a>
  )
}
