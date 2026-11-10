import { post } from '../owner/request.js'

const compressToDataUrl = (file, maxSize = 640, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'))
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (typeof document === 'undefined' || typeof Image === 'undefined') {
        resolve(dataUrl)
        return
      }
      const img = new Image()
      img.onerror = () => resolve(dataUrl)
      img.onload = () => {
        try {
          let { width, height } = img
          if (width > maxSize || height > maxSize) {
            if (width >= height) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, width)
          canvas.height = Math.max(1, height)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })

// POST /api/v1/uploads/images?purpose= (multipart, field "file"; JPG/PNG/WEBP ≤ 5MB)
// purpose: report (bằng chứng khiếu nại) | review | tournament | general. Trả { url }.
export async function uploadImage(file, purpose = 'general') {
  const form = new FormData()
  form.append('file', file)
  try {
    const data = await post(`/api/v1/uploads/images?purpose=${encodeURIComponent(purpose)}`, form, {
      headers: { 'Content-Type': undefined },
    })
    return data?.url || ''
  } catch (err) {
    if (!err?.status || err?.status >= 500) {
      return compressToDataUrl(file)
    }
    throw err
  }
}
