import { getOnboarding } from '../api/player/ratingApi.js'
import { detectClosestDistrict, haversineDistance } from '../Player/Booking/AIChat/aiBookingData.js'

// Khu vực chơi của người chơi lấy từ khảo sát người chơi (toạ độ lưu ở BE: GET /api/auth/me/onboarding),
// không còn là ô chữ chỉ lưu trên trình duyệt. Tên quận = quận gần toạ độ nhất.
// Các trang cũ (LFG, tìm sân, trợ lý AI, Hồ sơ) vẫn đọc 'player_profile_data'.location và nghe
// sự kiện 'player-profile-updated', nên ở đây chỉ cần ghi lại giá trị và phát sự kiện.
const STORAGE_KEY = 'player_profile_data'
const MAX_DISTRICT_KM = 15

export function locationLabelOf(latitude, longitude) {
  if (latitude == null || longitude == null) return ''
  const district = detectClosestDistrict(latitude, longitude)
  const distance = haversineDistance(latitude, longitude, district.lat, district.lng)
  return distance != null && distance <= MAX_DISTRICT_KM ? district.name : 'Vị trí đã khai trong khảo sát'
}

export function applyPlayerLocation(label) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (saved.location === label) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, location: label }))
  } catch { /* localStorage bị chặn: các trang hiện 'Chưa đặt khu vực' */ }
  window.dispatchEvent(new CustomEvent('player-profile-updated', { detail: { location: label } }))
}

// Tải khảo sát và đồng bộ tên khu vực; trả '' khi chưa khai toạ độ.
export async function syncPlayerLocation() {
  try {
    const onboarding = await getOnboarding()
    const label = locationLabelOf(onboarding?.latitude, onboarding?.longitude)
    if (label) applyPlayerLocation(label)
    return label
  } catch {
    return ''
  }
}
