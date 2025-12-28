"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import styles from "./ProductCategories.module.css"

export default function ProductCategories() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const categories = [
    {
      name: "Aretes",
      description: "Desde sutiles hasta statement",
      emoji: "💎",
      count: "150+ diseños",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      link: "/productos?categoria=aretes"
    },
    {
      name: "Collares",
      description: "Elegancia en cada detalle",
      emoji: "📿",
      count: "120+ diseños",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      link: "/productos?categoria=collares"
    },
    {
      name: "Pulseras",
      description: "Complementa tu estilo",
      emoji: "✨",
      count: "80+ diseños",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      link: "/productos?categoria=pulseras"
    },
    {
      name: "Anillos",
      description: "Detalles que brillan",
      emoji: "💍",
      count: "90+ diseños",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      link: "/productos?categoria=anillos"
    }
  ]

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className={styles.header}
        >
          <h2 className={styles.title}>Explora Nuestras Colecciones</h2>
          <p className={styles.subtitle}>
            Cada categoría ofrece infinitas posibilidades de personalización
          </p>
        </motion.div>

        <div className={styles.grid}>
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link href={category.link} className={styles.categoryCard}>
                <motion.div 
                  className={styles.cardContent}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={styles.cardBackground}
                    style={{ background: category.gradient }}
                  >
                    <motion.div
                      className={styles.emojiWrapper}
                      animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <span className={styles.emoji}>{category.emoji}</span>
                    </motion.div>
                  </div>
                  
                  <div className={styles.cardInfo}>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                    <p className={styles.categoryDescription}>{category.description}</p>
                    <div className={styles.categoryCount}>{category.count}</div>
                  </div>

                  <motion.div 
                    className={styles.hoverArrow}
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                  >
                    →
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}