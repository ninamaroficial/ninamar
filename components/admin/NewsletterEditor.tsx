"use client"

import { useState, useEffect, useRef } from 'react'
import { Eye, Code, Image as ImageIcon, Link2, Type, List, Upload, Trash2 } from 'lucide-react'
import styles from './NewsletterEditor.module.css'

interface NewsletterEditorProps {
  value: string
  onChange: (value: string) => void
  onPreview?: (html: string) => void
}

type EditorMode = 'visual' | 'html'

interface SavedImage {
  filename: string
  url: string
  size: number
  createdAt: string
}

export default function NewsletterEditor({ value, onChange, onPreview }: NewsletterEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [htmlContent, setHtmlContent] = useState(value)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [savedImages, setSavedImages] = useState<SavedImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editableRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    setHtmlContent(value)
    // Solo establecer el innerHTML en el montaje inicial o cuando cambia externamente
    if (editableRef.current && isInitialMount.current) {
      editableRef.current.innerHTML = value
      isInitialMount.current = false
    }
  }, [value])

  // Cargar imágenes guardadas cuando se abre el diálogo
  useEffect(() => {
    if (showImageDialog) {
      loadSavedImages()
    }
  }, [showImageDialog])

  const loadSavedImages = async () => {
    setLoadingImages(true)
    try {
      const response = await fetch('/api/admin/newsletter/images')
      if (response.ok) {
        const data = await response.json()
        setSavedImages(data.images || [])
      }
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoadingImages(false)
    }
  }

  const deleteImage = async (filename: string) => {
    if (!confirm('¿Estás segura de eliminar esta imagen?')) return

    try {
      const response = await fetch(`/api/admin/newsletter/images?filename=${filename}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Recargar la lista de imágenes
        loadSavedImages()
        alert('✅ Imagen eliminada')
      } else {
        alert('Error al eliminar la imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error al eliminar la imagen')
    }
  }

  const selectSavedImage = (url: string) => {
    if (editableRef.current) {
      const imageHtml = `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${url}" alt="Imagen del newsletter" style="max-width: 100%; height: auto; border-radius: 12px; border: 3px solid #ffb3f9;" />
        </div>
      `
      
      editableRef.current.innerHTML += imageHtml
      handleContentChange(editableRef.current.innerHTML)
      editableRef.current.focus()
    }
    
    setShowImageDialog(false)
    setImageUrl('')
  }

  const handleContentChange = (newContent: string) => {
    setHtmlContent(newContent)
    onChange(newContent)
  }

  const insertElement = (element: string) => {
    if (!editableRef.current) return
    
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) {
      // Si no hay selección, agregar al final del contenido
      editableRef.current.innerHTML += element
      handleContentChange(editableRef.current.innerHTML)
      return
    }

    const range = selection.getRangeAt(0)
    const fragment = range.createContextualFragment(element)
    range.deleteContents()
    range.insertNode(fragment)
    
    handleContentChange(editableRef.current.innerHTML)
  }

  const insertHeading = () => {
    insertElement('<h2 style="color: #ff8bf5; font-size: 28px; margin: 20px 0; font-weight: 700;">Título</h2>')
  }

  const insertParagraph = () => {
    insertElement('<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">Escribe tu texto aquí...</p>')
  }

  const insertButton = () => {
    insertElement(`
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://niñamar.com" style="background: linear-gradient(135deg, #ffb3f9 0%, #ff8bf5 100%); color: white; padding: 14px 36px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: 700; box-shadow: 0 4px 15px rgba(255, 139, 245, 0.3); border: 2px solid #ff8bf5;">
          Haz Click Aquí 💫
        </a>
      </div>
    `)
  }

  const insertImage = () => {
    if (!imageUrl) {
      setShowImageDialog(true)
      return
    }
    insertElement(`
      <div style="text-align: center; margin: 20px 0;">
        <img src="${imageUrl}" alt="Imagen" style="max-width: 100%; height: auto; border-radius: 12px; border: 3px solid #ffb3f9;" />
      </div>
    `)
    setImageUrl('')
    setShowImageDialog(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/newsletter/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir la imagen')
      }

      const data = await response.json()
      console.log('✅ Imagen subida:', data.url)
      
      // Insertar la imagen en el editor
      if (editableRef.current) {
        const imageHtml = `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${data.url}" alt="Imagen del newsletter" style="max-width: 100%; height: auto; border-radius: 12px; border: 3px solid #ffb3f9;" />
          </div>
        `
        
        // Agregar al final del contenido actual
        editableRef.current.innerHTML += imageHtml
        
        // Actualizar el estado
        handleContentChange(editableRef.current.innerHTML)
        
        // Enfocar el editor
        editableRef.current.focus()
      }
      
      setShowImageDialog(false)
      alert('✅ Imagen subida correctamente')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const insertLink = () => {
    if (!linkUrl || !linkText) {
      setShowLinkDialog(true)
      return
    }
    insertElement(`<a href="${linkUrl}" style="color: #ff8bf5; text-decoration: underline; font-weight: 600;">${linkText}</a>`)
    setLinkUrl('')
    setLinkText('')
    setShowLinkDialog(false)
  }

  const insertDivider = () => {
    insertElement('<hr style="border: none; border-top: 3px solid #ffb3f9; margin: 30px 0; opacity: 0.3;" />')
  }

  const execCommand = (command: string, value?: string) => {
    if (!editableRef.current) return
    
    editableRef.current.focus()
    document.execCommand(command, false, value)
    handleContentChange(editableRef.current.innerHTML)
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(htmlContent)
    }
  }

  return (
    <div className={styles.editor}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolbarButton} ${mode === 'visual' ? styles.active : ''}`}
            onClick={() => setMode('visual')}
            title="Editor Visual"
          >
            <Type size={18} />
          </button>
          <button
            className={`${styles.toolbarButton} ${mode === 'html' ? styles.active : ''}`}
            onClick={() => setMode('html')}
            title="HTML"
          >
            <Code size={18} />
          </button>
        </div>

        {mode === 'visual' && (
          <>
            <div className={styles.toolbarGroup}>
              <button
                className={styles.toolbarButton}
                onClick={() => execCommand('bold')}
                title="Negrita"
              >
                <strong>B</strong>
              </button>
              <button
                className={styles.toolbarButton}
                onClick={() => execCommand('italic')}
                title="Cursiva"
              >
                <em>I</em>
              </button>
              <button
                className={styles.toolbarButton}
                onClick={() => execCommand('underline')}
                title="Subrayado"
              >
                <u>U</u>
              </button>
            </div>

            <div className={styles.toolbarGroup}>
              <button
                className={styles.toolbarButton}
                onClick={insertHeading}
                title="Título"
              >
                <Type size={18} />
              </button>
              <button
                className={styles.toolbarButton}
                onClick={insertParagraph}
                title="Párrafo"
              >
                <List size={18} />
              </button>
            </div>

            <div className={styles.toolbarGroup}>
              <button
                className={styles.toolbarButton}
                onClick={() => setShowImageDialog(true)}
                title="Insertar Imagen"
              >
                <ImageIcon size={18} />
              </button>
              <button
                className={styles.toolbarButton}
                onClick={() => setShowLinkDialog(true)}
                title="Insertar Enlace"
              >
                <Link2 size={18} />
              </button>
              <button
                className={styles.toolbarButton}
                onClick={insertButton}
                title="Insertar Botón"
              >
                CTA
              </button>
              <button
                className={styles.toolbarButton}
                onClick={insertDivider}
                title="Insertar Divisor"
              >
                ─
              </button>
            </div>
          </>
        )}

        <div className={styles.toolbarGroup}>
          <button
            className={styles.previewButton}
            onClick={handlePreview}
            title="Vista Previa"
          >
            <Eye size={18} />
            Preview
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className={styles.editorArea}>
        {mode === 'visual' ? (
          <div
            ref={editableRef}
            id="editable-content"
            className={styles.editableContent}
            contentEditable
            onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
            suppressContentEditableWarning
            dir="ltr"
          />
        ) : (
          <textarea
            className={styles.htmlEditor}
            value={htmlContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Escribe o pega tu HTML aquí..."
            dir="ltr"
          />
        )}
      </div>

      {/* Image Dialog */}
      {showImageDialog && (
        <div className={styles.dialog} onClick={() => setShowImageDialog(false)}>
          <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <h3>Insertar Imagen</h3>
            
            {/* Imágenes guardadas */}
            {savedImages.length > 0 && (
              <div className={styles.savedImagesSection}>
                <h4 className={styles.sectionTitle}>📁 Imágenes Guardadas</h4>
                {loadingImages ? (
                  <p className={styles.loadingText}>Cargando...</p>
                ) : (
                  <div className={styles.imageGrid}>
                    {savedImages.map((image) => (
                      <div key={image.filename} className={styles.imageCard}>
                        <img 
                          src={image.url} 
                          alt={image.filename}
                          className={styles.thumbnailImage}
                          onClick={() => selectSavedImage(image.url)}
                        />
                        <div className={styles.imageInfo}>
                          <span className={styles.imageSize}>
                            {(image.size / 1024).toFixed(0)} KB
                          </span>
                          <button
                            onClick={() => deleteImage(image.filename)}
                            className={styles.deleteImageButton}
                            title="Eliminar imagen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={styles.dividerText}>
              <span>Subir nueva imagen</span>
            </div>

            {/* Upload desde PC */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                <Upload size={24} />
                <span>Subir desde mi PC</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <p className={styles.uploadingText}>Subiendo imagen...</p>
              )}
            </div>

            <div className={styles.dividerText}>
              <span>o</span>
            </div>

            {/* URL externa */}
            <div className={styles.urlSection}>
              <label className={styles.inputLabel}>Insertar desde URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className={styles.dialogInput}
                disabled={isUploading}
              />
            </div>

            <div className={styles.dialogActions}>
              <button 
                onClick={() => {
                  setShowImageDialog(false)
                  setImageUrl('')
                }} 
                className={styles.cancelButton}
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button 
                onClick={insertImage} 
                className={styles.confirmButton}
                disabled={isUploading || !imageUrl}
              >
                Insertar desde URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className={styles.dialog}>
          <div className={styles.dialogContent}>
            <h3>Insertar Enlace</h3>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Texto del enlace"
              className={styles.dialogInput}
            />
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL (https://...)"
              className={styles.dialogInput}
            />
            <div className={styles.dialogActions}>
              <button onClick={() => setShowLinkDialog(false)} className={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={insertLink} className={styles.confirmButton}>
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
