"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Button from "@/components/ui/Button"
import Link from "next/link"
import styles from "./HeroParallax.module.css"

export default function HeroParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  return (
    <div ref={containerRef} className={styles.hero}>
      {/* Fondo con capas parallax */}
      <div className={styles.backgroundLayers}>
        <motion.div 
          className={`${styles.layer} ${styles.layer1}`}
          style={{ y: y3 }}
        >
          <div className={styles.wave}>🌊</div>
          <div className={styles.wave}>🌊</div>
          <div className={styles.wave}>🌊</div>
        </motion.div>
        
        <motion.div 
          className={`${styles.layer} ${styles.layer2}`}
          style={{ y: y2 }}
        >
          <div className={styles.sparkle}>✨</div>
          <div className={styles.sparkle}>💎</div>
          <div className={styles.sparkle}>✨</div>
          <div className={styles.sparkle}>💎</div>
        </motion.div>
        
        <motion.div 
          className={`${styles.layer} ${styles.layer3}`}
          style={{ y: y1 }}
        >
          <div className={styles.shell}>🐚</div>
          <div className={styles.shell}>⭐</div>
          <div className={styles.shell}>🐚</div>
        </motion.div>
      </div>

      {/* Contenido principal */}
      <motion.div 
        className={styles.content}
        style={{ opacity, scale }}
      >
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          accesorios Únicas
          <br />
          <span className={styles.titleAccent}>Hechas para Ti</span>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Diseña tus propios aretes y collares. 
          <br />
          Cada pieza cuenta tu historia.
        </motion.p>

        <motion.div 
          className={styles.buttons}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/productos">
            <Button size="lg" variant="primary" className={styles.ctaButton}>
              Personaliza tu Accesorio
            </Button>
          </Link>
          <Link href="#como-funciona">
            <Button size="lg" variant="outline" className={styles.secondaryButton}>
              Descubre Cómo
            </Button>
          </Link>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div 
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <span className={styles.scrollText}>Desliza para explorar</span>

        </motion.div>
                  <motion.div
            className={styles.scrollArrow}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↓
          </motion.div>
      </motion.div>
    </div>
  )
}