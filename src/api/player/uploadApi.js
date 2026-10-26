import { post } from '../owner/request.js'

// POST /api/v1/uploads/images?purpose= (multipart, field "file"; JPG/PNG/WEBP ≤ 5MB)
// purpose: report (bằng chứng khiếu nại) | review | tournament | general. Trả { url }.
export async function uploadImage(file, purpose = 'general') {
  const form = new FormData()
  form.append('file', file)
  const data = await post(`/api/v1/uploads/images?purpose=${encodeURIComponent(purpose)}`, form)
  return data?.url || ''
}
