// Lấy vị trí người dùng và tên khu vực (dùng được ở mọi tỉnh thành).
//
// Máy tính thường không có GPS: trình duyệt đoán vị trí theo Wi-Fi / IP (lệch vài km) và nếu bật
// enableHighAccuracy thì hay quá thời gian chờ. Vì vậy thử chế độ nhanh trước, lỗi mới thử GPS chính xác cao,
// và trả kèm sai số (accuracy) để giao diện cho người dùng chỉnh lại trên bản đồ khi cần.

const FAST = { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 }
const PRECISE = { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }

const ERROR_MESSAGES = {
  1: 'Bạn đã chặn quyền truy cập vị trí. Hãy bấm biểu tượng ổ khóa cạnh thanh địa chỉ, cho phép "Vị trí" rồi thử lại.',
  2: 'Không xác định được vị trí của thiết bị. Hãy bật dịch vụ định vị / Wi-Fi hoặc chọn vị trí trên bản đồ.',
  3: 'Lấy vị trí quá thời gian chờ. Vui lòng thử lại hoặc chọn vị trí trên bản đồ.',
}

const toError = (code, message) => Object.assign(new Error(message || ERROR_MESSAGES[code] || ERROR_MESSAGES[2]), { code })

const requestPosition = (options) =>
  new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options))

// Trả { latitude, longitude, accuracy (mét) }. Lỗi ném Error tiếng Việt (code: 1 chặn quyền, 2 không xác định, 3 quá giờ).
export async function getCurrentLocation() {
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    throw toError(0, 'Trình duyệt chỉ cho lấy vị trí trên trang HTTPS. Vui lòng chọn vị trí trên bản đồ.')
  }
  if (!navigator.geolocation) throw toError(0, 'Trình duyệt không hỗ trợ định vị. Vui lòng chọn vị trí trên bản đồ.')
  let position
  try {
    position = await requestPosition(FAST)
  } catch (error) {
    if (error?.code === 1) throw toError(1)
    try {
      position = await requestPosition(PRECISE)
    } catch (retryError) {
      throw toError(retryError?.code)
    }
  }
  const { latitude, longitude, accuracy } = position.coords
  return { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)), accuracy: Math.round(accuracy || 0) }
}

// Sai số lớn (> 1 km) thường là vị trí đoán theo IP / Wi-Fi trên máy tính.
export const isApproximate = (accuracy) => Number(accuracy) > 1000
export const formatAccuracy = (accuracy) =>
  Number(accuracy) >= 1000 ? `${(accuracy / 1000).toFixed(1).replace('.0', '')} km` : `${Math.round(accuracy)} m`

// Tọa độ từ địa chỉ / tên khu vực người dùng nhập (vd "quận 2", "Thảo Điền", "Cầu Giấy, Hà Nội").
// Ưu tiên kết quả quanh TP.HCM (viewbox, không giới hạn cứng) vì đa số cụm sân ở đây.
// Trả { lat, lng, bounds: { south, north, west, east } | null }. Không tìm thấy → null.
const geocodeCache = new Map()
export async function geocodeAddress(text) {
  const query = String(text || '').trim()
  if (!query) return null
  const key = query.toLowerCase()
  if (geocodeCache.has(key)) return geocodeCache.get(key)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=vn&accept-language=vi&viewbox=106.35,11.20,107.05,10.35&q=${encodeURIComponent(query)}`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return null
    const [first] = await response.json()
    // boundingbox của Nominatim: [nam, bắc, tây, đông] — ranh giới khu vực (quận, phường…)
    const box = Array.isArray(first?.boundingbox) ? first.boundingbox.map(Number) : null
    const result = first
      ? { lat: Number(first.lat), lng: Number(first.lon), bounds: box && box.every(Number.isFinite) ? { south: box[0], north: box[1], west: box[2], east: box[3] } : null }
      : null
    geocodeCache.set(key, result)
    return result
  } catch {
    return null
  }
}

// Tên khu vực từ tọa độ (OpenStreetMap Nominatim, tiếng Việt): "Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh".
// Không tra được → '' (giao diện hiển thị tọa độ).
const placeCache = new Map()
export async function reverseGeocode(latitude, longitude) {
  const key = `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}`
  if (placeCache.has(key)) return placeCache.get(key)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&accept-language=vi&lat=${latitude}&lon=${longitude}`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return ''
    const body = await response.json()
    const a = body?.address || {}
    const parts = [
      a.quarter || a.suburb || a.village || a.hamlet,
      a.city_district || a.county || a.town || a.district,
      a.city || a.state || a.province,
    ].filter(Boolean)
    const name = [...new Set(parts)].join(', ') || body?.display_name || ''
    placeCache.set(key, name)
    return name
  } catch {
    return ''
  }
}
