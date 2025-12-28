"use client"

import { useEffect, useState } from "react"
import Container from "@/components/ui/Container"
import Logo from "@/components/ui/Logo"
import Navbar from "./navbar"
import styles from "./header.module.css"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animación de entrada al cargar la página
    setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Detectar scroll para hacer el header más pequeño
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header 
      className={`${styles.header} ${isVisible ? styles.visible : ''} ${isScrolled ? styles.scrolled : ''} ${isScrolled ? 'scrolled' : ''}`}
    >
      <Container>
        <div className={styles.container}>
          <Logo />
          <Navbar />
        </div>
      </Container>
    </header>
  )
}