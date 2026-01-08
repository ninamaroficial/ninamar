"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import styles from "./ProcessSteps.module.css"

export default function ProcessSteps() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const steps = [
    {
      number: "01",
      title: "Elige tu Base",
      description: "Selecciona el tipo de accesorio que quieres crear: aretes, collar, pulsera o anillo",
      icon: "🎯",
      color: "#fbbf24"
    },
    {
      number: "02",
      title: "Personaliza el Diseño",
      description: "Escoge materiales, colores, piedras y acabados. Visualiza en tiempo real",
      icon: "🎨",
      color: "#ffeafdff"
    },
    {
      number: "03",
      title: "Añade Detalles Únicos",
      description: "Grabados personalizados, mensajes especiales o símbolos significativos",
      icon: "✍️",
      color: "#c084fc"
    },
    {
      number: "04",
      title: "Creación Artesanal",
      description: "Nuestros artesanos crean tu pieza única con dedicación y calidad",
      icon: "⚒️",
      color: "#fb923c"
    },
    {
      number: "05",
      title: "Recibe tu Accesorio",
      description: "Empaque premium y envío seguro directo a tu puerta",
      icon: "🎁",
      color: "#ec4899"
    }
  ]

  return (
    <section className={styles.section} id="como-funciona" ref={ref}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className={styles.header}
        >
          <h2 className={styles.title}>¿Cómo Funciona?</h2>
          <p className={styles.subtitle}>
            De la idea a la realidad en 5 simples pasos
          </p>
        </motion.div>

        <div className={styles.timeline}>
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={styles.stepWrapper}
            >
              <div className={`${styles.step} ${index % 2 === 0 ? styles.stepLeft : styles.stepRight}`}>
                <motion.div 
                  className={styles.stepCard}
                  whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? -2 : 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={styles.iconCircle}
                    style={{ backgroundColor: step.color }}
                  >
                    <span className={styles.icon}>{step.icon}</span>
                  </div>
                  
                  <div className={styles.stepContent}>
                    <div className={styles.stepNumber}>{step.number}</div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                </motion.div>
              </div>

              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <motion.div 
                  className={styles.connector}
                  initial={{ scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}