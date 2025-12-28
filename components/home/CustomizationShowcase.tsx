"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import styles from "./CustomizationShowcase.module.css"

export default function CustomizationShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const customizations = [
    {
      icon: "💎",
      title: "Elige tus Piedras",
      description: "Selecciona entre una amplia variedad de gemas preciosas y semipreciosas",
      color: "#fbbf24"
    },
    {
      icon: "🎨",
      title: "Personaliza el Diseño",
      description: "Combina formas, tamaños y estilos para crear algo único",
      color: "#a6e8e4"
    },
    {
      icon: "✨",
      title: "Añade Detalles",
      description: "Grabados personalizados, acabados especiales y más",
      color: "#c084fc"
    }
  ]

  return (
    <section className={styles.section} id="personalizacion" ref={ref}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className={styles.header}
        >
          <h2 className={styles.title}>Diseña Tu Joya Perfecta</h2>
          <p className={styles.subtitle}>
            Tres simples pasos para crear una pieza única que refleje tu personalidad
          </p>
        </motion.div>

        <div className={styles.grid}>
          {customizations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={styles.card}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className={styles.cardInner}>
                <motion.div 
                  className={styles.iconWrapper}
                  style={{ backgroundColor: item.color }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className={styles.icon}>{item.icon}</span>
                </motion.div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
              
              {/* Número del paso */}
              <div className={styles.stepNumber}>{index + 1}</div>
            </motion.div>
          ))}
        </div>

        {/* Visualización interactiva */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className={styles.preview}
        >
          <div className={styles.previewContent}>
            <motion.div 
              className={styles.jewelryPreview}
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              💍
            </motion.div>
            <p className={styles.previewText}>Vista previa en tiempo real</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}