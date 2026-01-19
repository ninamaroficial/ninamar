export interface CarouselImage {
  url: string
  urlMobile?: string // ← Agregar URL para móvil
  alt: string
  title?: string
}

// ✅ Configuración centralizada del carrusel
export const carouselImages: CarouselImage[] = [
  {
    url: '/carousel/imagen-inicial.png',
    urlMobile: '/carousel/mobile/imagen-inicial-mobile.png', // ← Versión vertical
    alt: 'Aretes arcoíris',
    title: 'Aretes aretesanales con forma de arcoíris'
  },
    {
    url: '/carousel/imagen-inicial-arcoiris.png',
    urlMobile: '/carousel/mobile/imagen-mobile-2.jpg',
    alt: 'Aretes bananita',
    title: 'Aretes artesanales con forma de banana'
  },
  {
    url: '/carousel/imagen-inicial22.png',
    urlMobile: '/carousel/mobile/imagen-inicial-mobile-2.png',
    alt: 'Aretes bananita',
    title: 'Aretes artesanales con forma de banana'
  },

]

// ✅ Configuración del carrusel
export const carouselConfig = {
  autoPlayInterval: 5000, // 5 segundos
  transitionDuration: 800, // 0.8 segundos
  showThumbnails: false,
  showCounter: true,
  showDots: true,
  showNavButtons: true,
  pauseOnHover: true,
}