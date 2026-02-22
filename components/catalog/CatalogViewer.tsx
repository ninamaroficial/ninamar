'use client'

import { useEffect, useRef, useState, useCallback, forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from 'lucide-react'
import styles from './CatalogViewer.module.css'

// Configure PDF.js worker (served from public/)
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

interface PageProps {
  pageImage: string
  pageNumber: number
  totalPages: number
}

const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
  { pageImage, pageNumber, totalPages },
  ref
) {
  return (
    <div className={styles.page} ref={ref}>
      <div className={styles.pageContent}>
        <img
          src={pageImage}
          alt={`Página ${pageNumber} de ${totalPages}`}
          className={styles.pageImage}
          draggable={false}
        />
      </div>
      <div className={styles.pageNumber}>{pageNumber}</div>
    </div>
  )
})

interface CatalogViewerProps {
  pdfUrl: string
}

export default function CatalogViewer({ pdfUrl }: CatalogViewerProps) {
  const [pages, setPages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 400, height: 566 })
  const [isMobile, setIsMobile] = useState(false)

  const flipBookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate book dimensions based on viewport
  const updateDimensions = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mobile = vw < 768

    setIsMobile(mobile)

    let pageWidth: number
    let pageHeight: number

    if (mobile) {
      // Mobile: single page, fill entire screen
      pageWidth = vw
      pageHeight = vh - 110 // leave room for controls + nav
      // Maintain aspect ratio if needed
      const aspectHeight = pageWidth * 1.414
      if (aspectHeight < pageHeight) {
        pageHeight = aspectHeight
      } else {
        pageWidth = pageHeight / 1.414
      }
    } else {
      // Desktop: two-page spread
      const maxWidth = Math.min(vw * 0.42, 550)
      const maxHeight = vh - 260
      pageWidth = maxWidth
      pageHeight = pageWidth * 1.414

      if (pageHeight > maxHeight) {
        pageHeight = maxHeight
        pageWidth = pageHeight / 1.414
      }
    }

    setDimensions({
      width: Math.round(pageWidth),
      height: Math.round(pageHeight),
    })
  }, [])

  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [updateDimensions])

  // Load PDF and convert pages to images
  useEffect(() => {
    let cancelled = false

    async function loadPDF() {
      try {
        setLoading(true)
        setLoadingProgress(0)

        const pdf = await getDocument(pdfUrl).promise
        const totalPages = pdf.numPages
        const pageImages: string[] = []

        // Render resolution: higher for better quality
        const scale = window.devicePixelRatio >= 2 ? 2 : 1.5

        for (let i = 1; i <= totalPages; i++) {
          if (cancelled) return

          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height

          const ctx = canvas.getContext('2d')!
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise

          pageImages.push(canvas.toDataURL('image/jpeg', 0.92))
          setLoadingProgress(Math.round((i / totalPages) * 100))
        }

        if (!cancelled) {
          setPages(pageImages)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading PDF catalog:', error)
        setLoading(false)
      }
    }

    loadPDF()
    return () => { cancelled = true }
  }, [pdfUrl])

  // Navigation
  const goToPrev = () => {
    flipBookRef.current?.pageFlip()?.flipPrev()
  }

  const goToNext = () => {
    flipBookRef.current?.pageFlip()?.flipNext()
  }

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data)
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(() => {})
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      // Recalculate after fullscreen change
      setTimeout(updateDimensions, 100)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [updateDimensions])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, toggleFullscreen])

  // Display total pages based on mode
  const totalDisplayPages = pages.length
  const getCurrentDisplay = () => {
    if (isMobile) {
      return `${currentPage + 1} / ${totalDisplayPages}`
    }
    const left = currentPage + 1
    const right = Math.min(currentPage + 2, totalDisplayPages)
    if (left === right) return `${left} / ${totalDisplayPages}`
    return `${left}-${right} / ${totalDisplayPages}`
  }

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loader}>
          <div className={styles.bookLoader}>
            <div className={styles.bookPage}></div>
            <div className={styles.bookPage}></div>
            <div className={styles.bookPage}></div>
          </div>
          <p className={styles.loaderText}>Cargando catálogo...</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className={styles.progressText}>{loadingProgress}%</span>
        </div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className={styles.loaderContainer}>
        <p>No se pudo cargar el catálogo. Inténtalo de nuevo.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}
    >
      {/* Hint for mobile */}
      {isMobile && (
        <div className={styles.swipeHint}>
          <ChevronLeft size={16} />
          <span>Desliza para pasar páginas</span>
          <ChevronRight size={16} />
        </div>
      )}

      <div className={styles.bookWrapper}>
        {/* Left arrow - desktop only */}
        {!isMobile && (
          <button
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={goToPrev}
            aria-label="Página anterior"
            disabled={currentPage === 0}
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div className={styles.bookContainer}>
          <HTMLFlipBook
            ref={flipBookRef}
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            minWidth={200}
            maxWidth={800}
            minHeight={300}
            maxHeight={1200}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className={styles.flipBook}
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={600}
            usePortrait={isMobile}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.5}
            showPageCorners={true}
            disableFlipByClick={false}
            swipeDistance={30}
            clickEventForward={true}
            useMouseEvents={true}
          >
            {pages.map((pageImg, index) => (
              <Page
                key={index}
                pageImage={pageImg}
                pageNumber={index + 1}
                totalPages={pages.length}
              />
            ))}
          </HTMLFlipBook>
        </div>

        {/* Right arrow - desktop only */}
        {!isMobile && (
          <button
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={goToNext}
            aria-label="Página siguiente"
            disabled={currentPage >= pages.length - 1}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Controls bar */}
      <div className={styles.controls}>
        <div className={styles.pageIndicator}>
          {getCurrentDisplay()}
        </div>

        <div className={styles.controlButtons}>
          <button
            className={styles.controlBtn}
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <a
            href={pdfUrl}
            download
            className={styles.controlBtn}
            aria-label="Descargar catálogo"
            title="Descargar PDF"
          >
            <Download size={18} />
          </a>
        </div>
      </div>

      {/* Mobile navigation buttons */}
      {isMobile && (
        <div className={styles.mobileNav}>
          <button
            className={styles.mobileNavBtn}
            onClick={goToPrev}
            disabled={currentPage === 0}
            aria-label="Página anterior"
          >
            <ChevronLeft size={22} />
            <span>Anterior</span>
          </button>
          <button
            className={styles.mobileNavBtn}
            onClick={goToNext}
            disabled={currentPage >= pages.length - 1}
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  )
}
