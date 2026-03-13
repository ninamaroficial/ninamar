import { toBlob } from 'html-to-image'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type CopyAsImageOptions = {
  expandContent?: boolean
}

function normalizeCloneForExport(clonedNode: HTMLElement, options: CopyAsImageOptions) {
  // Reset scroll positions so the export always starts from the top.
  const scrollables = clonedNode.querySelectorAll<HTMLElement>('*')
  scrollables.forEach((el) => {
    el.scrollTop = 0
    el.scrollLeft = 0
  })

  if (options.expandContent) {
    const itemsList = clonedNode.querySelector<HTMLElement>("[class*='itemsList']")
    if (itemsList) {
      itemsList.style.overflow = 'visible'
      itemsList.style.maxHeight = 'none'
      itemsList.style.height = 'auto'
    }

    const itemsBlock = clonedNode.querySelector<HTMLElement>("[class*='itemsBlock']")
    if (itemsBlock) {
      itemsBlock.style.overflow = 'visible'
      itemsBlock.style.minHeight = 'auto'
    }
  }
}

async function writeImageBlobToClipboard(blob: Blob) {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Tu navegador no soporta copiar imágenes al portapapeles')
  }

  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Ensure focus before attempting write
      if (!document.hasFocus()) {
        window.focus()
      }
      
      // Increase wait time with each retry
      const waitTime = 100 + (attempt * 150)
      await wait(waitTime)

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])
      
      // Success - exit
      return
    } catch (error: any) {
      lastError = error
      
      const isFocusError =
        error?.name === 'NotAllowedError' ||
        String(error?.message || '').toLowerCase().includes('document is not focused')

      if (!isFocusError) {
        // Not a focus error, throw immediately
        throw error
      }

      // Is focus error - retry if we have attempts left
      if (attempt < maxRetries - 1) {
        window.focus()
        await wait(250)
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('No se pudo copiar la guía al portapapeles')
}

export async function copyElementAsImage(node: HTMLElement, options: CopyAsImageOptions = {}) {
  let exportHost: HTMLDivElement | null = null

  try {
    exportHost = document.createElement('div')
    exportHost.dataset.orderGuideExport = 'true'
    exportHost.style.position = 'fixed'
    exportHost.style.left = '-10000px'
    exportHost.style.top = '0'
    exportHost.style.pointerEvents = 'none'
    exportHost.style.opacity = '1'
    exportHost.style.zIndex = '-1'

    const clonedNode = node.cloneNode(true) as HTMLElement
    clonedNode.style.width = '8in'
    clonedNode.style.maxWidth = '8in'
    clonedNode.style.height = options.expandContent ? 'auto' : '5in'
    clonedNode.style.maxHeight = options.expandContent ? 'none' : '5in'
    clonedNode.style.margin = '0'
    clonedNode.style.transform = 'none'
    clonedNode.style.overflow = options.expandContent ? 'visible' : 'hidden'
    normalizeCloneForExport(clonedNode, options)

    exportHost.appendChild(clonedNode)
    document.body.appendChild(exportHost)

    const rect = clonedNode.getBoundingClientRect()
    const exportWidth = Math.ceil(rect.width)
    const exportHeight = Math.ceil(rect.height)

    const blob = await toBlob(clonedNode, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      width: exportWidth,
      height: exportHeight,
      canvasWidth: exportWidth * 2,
      canvasHeight: exportHeight * 2,
      style: {
        margin: '0',
        transform: 'none',
      },
    })

    if (!blob) {
      throw new Error('No se pudo generar la imagen')
    }

    await writeImageBlobToClipboard(blob)
  } finally {
    if (exportHost?.parentNode) {
      exportHost.parentNode.removeChild(exportHost)
    }
  }
}