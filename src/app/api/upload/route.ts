import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'File nahi mili' }, { status: 400 })

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    // Dev mode — return placeholder
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        url: `https://placehold.co/400x200/2D6A4F/white?text=Shop+Banner`,
        publicId: 'dev_placeholder',
      })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const timestamp = Math.floor(Date.now() / 1000)
    const crypto = await import('crypto')
    const signature = crypto
      .createHash('sha1')
      .update(`folder=kiranalink&timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    const uploadData = new FormData()
    uploadData.append('file', dataUri)
    uploadData.append('api_key', apiKey)
    uploadData.append('timestamp', String(timestamp))
    uploadData.append('signature', signature)
    uploadData.append('folder', 'kiranalink')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData,
    })

    const data = await res.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })

    return NextResponse.json({ url: data.secure_url, publicId: data.public_id })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
