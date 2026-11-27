import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from '../admin/dashboardApi.js'

export { pick, toList, unwrap }

// Bỏ các query rỗng để không gửi "?Status=&Page=" lên BE.
export const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
export const path = value => encodeURIComponent(value)

export const get = async (url, params) => unwrap((await apiClient.get(url, { params: clean(params) })).data)
export const post = async (url, body, config) => unwrap((await apiClient.post(url, body, config)).data)
export const put = async (url, body) => unwrap((await apiClient.put(url, body)).data)
export const patch = async (url, body) => unwrap((await apiClient.patch(url, body)).data)
export const del = async url => unwrap((await apiClient.delete(url)).data)

// Trả { data, message }: dùng khi message của BE có câu nhắc cần hiện nguyên văn
// (vd "Lưu ý: ngày ... đã hết ca nên hệ thống sẽ tự sinh lại ca").
const withMessage = body => ({ data: unwrap(body), message: body?.message || '' })
export const postWithMessage = async (url, body) => withMessage((await apiClient.post(url, body)).data)
export const putWithMessage = async (url, body) => withMessage((await apiClient.put(url, body)).data)
export const delWithMessage = async url => withMessage((await apiClient.delete(url)).data)

// Danh sách có phân trang: trả về { items, total, totalPages } dù BE trả mảng hay object phân trang.
export const getList = async (url, params) => toList(await get(url, params))

// Upload multipart: field là tên field form theo swagger ("file" hoặc "files").
// Không tự đặt Content-Type: Axios bỏ header JSON mặc định để trình duyệt tự thêm boundary.
export function upload(url, field, files) {
  const form = new FormData()
  for (const file of [].concat(files)) form.append(field, file)
  return post(url, form, { headers: { 'Content-Type': undefined } })
}
