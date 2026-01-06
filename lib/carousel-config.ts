export interface CarouselImage {
  url: string
  alt: string
  title?: string
}

// ✅ Configuración centralizada del carrusel
export const carouselImages: CarouselImage[] = [
  {
    url: '/carousel/imagen-1.jpg',
    alt: 'Aretes arcoíris',
    title: 'Aretes aretesanales con forma de arcoíris'
  },
  {
    url: '/carousel/imagen-2.jpg',
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