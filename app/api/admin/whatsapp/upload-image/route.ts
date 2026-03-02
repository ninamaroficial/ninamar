import { NextRequest, NextResponse } from 'next/server'
import { sendImageMessage } from '@/lib/whatsapp/client'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * POST /api/admin/whatsapp/upload-image
 * Sube una imagen a Supabase Storage y la envía por WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[upload-image] Starting image upload...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const phone = formData.get('phone') as string
    const caption = formData.get('caption') as string

    console.log(`[upload-image] Received: file=${file?.name}, phone=${phone}, caption=${caption}`)

    if (!file || !phone) {
      console.error('[upload-image] Missing file or phone')
      return NextResponse.json(
        { error: 'File and phone are required' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo 10MB' 
      }, { status: 400 })
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `whatsapp-${timestamp}-${randomString}.${extension}`

    // Subir a Supabase Storage
    console.log(`[upload-image] Uploading to bucket 'whatsapp_images' as ${filename}`)
    const { data, error } = await supabaseAdmin.storage
      .from('whatsapp_images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 año
        upsert: false
      })

    if (error) {
      console.error('[upload-image] Supabase upload error:', error)
      
      // Si el bucket no existe, dar un mensaje más claro
      const errorMsg = JSON.stringify(error)
      if (errorMsg.includes('not found') || errorMsg.includes('Bucket not found') || errorMsg.includes('404')) {
        console.error('[upload-image] Bucket not found')
        return NextResponse.json(
          { error: 'El bucket "whatsapp_images" no existe en Supabase. Debes crearlo en Storage con acceso público.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Error al subir la imagen: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      )
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('whatsapp_images')
      .getPublicUrl(filename)

    console.log('[upload-image] ✅ Image uploaded to Supabase:', publicUrl)

    // Enviar a WhatsApp
    console.log(`[upload-image] Sending to WhatsApp: phone=${phone}, caption=${caption}`)
    await sendImageMessage(phone, publicUrl, caption || '')
    console.log('[upload-image] ✅ Sent to WhatsApp')

    // Guardar en base de datos
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const currentTimestamp = new Date().toISOString()

    await supabase
      .from('whatsapp_messages')
      .insert({
        phone,
        direction: 'outgoing',
        content: caption || '[Imagen enviada]',
        message_type: 'image',
        is_bot: false,
        timestamp: currentTimestamp,
        metadata: {
          filename: file.name,
          size: file.size,
          mime_type: file.type,
          storage_url: publicUrl
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Image sent successfully',
      url: publicUrl
    })
  } catch (error) {
    console.error('[upload-image] Error:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[upload-image] Error details:', errorMsg)
    return NextResponse.json(
      { error: `Error al enviar imagen: ${errorMsg}` },
      { status: 500 }
    )
  }
}

