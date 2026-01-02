"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import styles from "./Testimonials.module.css"

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "María González",
      role: "Cliente feliz",
      text: "¡Increíble experiencia! Pude diseñar los aretes perfectos para mi boda. El proceso fue super fácil y el resultado superó mis expectativas.",
      rating: 5,
      image: "👰"
    },
    {
      name: "Laura Martínez",
      role: "Diseñadora",
      text: "La personalización es impresionante. Cada detalle se puede ajustar y el equipo me ayudó en todo el proceso. ¡100% recomendado!",
      rating: 5,
      image: "🎨"
    },
    {
      name: "Ana Silva",
      role: "Amante de accesorios",
      text: "Compré un collar personalizado como regalo y fue un éxito total. La calidad es excepcional y el empaque hermoso.",
      rating: 5,
      image: "💝"
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className={styles.header}
        >
          <h2 className={styles.title}>Lo Que Dicen Nuestras Clientas</h2>
          <p className={styles.subtitle}>
            Historias reales de personas que crearon sus accesorios únicas
          </p>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <button 
            onClick={prevTestimonial}
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            aria-label="Anterior"
          >
            ←
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className={styles.testimonialCard}
            >
              <div className={styles.quote}>"</div>
              
              <div className={styles.avatar}>
                {testimonials[currentIndex].image}
              </div>

              <div className={styles.stars}>
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <span key={i} className={styles.star}>⭐</span>
                ))}
              </div>

              <p className={styles.testimonialText}>
                {testimonials[currentIndex].text}
              </p>

              <div className={styles.authorInfo}>
                <h4 className={styles.authorName}>{testimonials[currentIndex].name}</h4>
                <p className={styles.authorRole}>{testimonials[currentIndex].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button 
            onClick={nextTestimonial}
            className={`${styles.navButton} ${styles.navButtonRight}`}
            aria-label="Siguiente"
          >
            →
          </button>
        </div>

        {/* Indicadores */}
        <div className={styles.indicators}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
              aria-label={`Ir a testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}