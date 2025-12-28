import Link from "next/link"
import Image from "next/image"
import styles from "./Logo.module.css"

export default function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <Image 
        src="/images/logo.png" 
        alt="Niña Mar" 
        width={150} 
        height={60}
        priority
        className={styles.logoImage}
      />
    </Link>
  )
}