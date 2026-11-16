// aiBookingData.js — Dữ liệu vị trí, hồ sơ người chơi và lời chào cho Trợ lý AI SportNexus
// Gợi ý sân/ca/kèo đều lấy từ BE (POST /api/v1/ai/chat), FE không tự sinh câu trả lời.
import { reverseGeocode } from '../../../utils/geolocation.js'

const toCoord = (v) => {
  if (v === null || v === undefined || v === '') return null
  const num = Number(v)
  return Number.isFinite(num) ? num : null
}

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} Điểm`

// Công thức Haversine tính khoảng cách chuẩn theo tọa độ GPS (km)
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const nLat1 = toCoord(lat1)
  const nLon1 = toCoord(lon1)
  const nLat2 = toCoord(lat2)
  const nLon2 = toCoord(lon2)
  if (nLat1 == null || nLon1 == null || nLat2 == null || nLon2 == null) return null
  const R = 6371
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(0.3, Math.round(R * c * 10) / 10)
}

// Tên khu vực thật từ GPS (mọi tỉnh thành). Trả { name: ngắn, address: đầy đủ }.
export async function describeArea(lat, lng) {
  const place = await reverseGeocode(lat, lng)
  if (!place) return { name: 'Vị trí hiện tại', address: `Vị trí hiện tại (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})` }
  const parts = place.split(', ')
  return { name: parts.slice(-2).join(', '), address: place }
}

export function getUserProfileContext() {
  let profile = {}
  let sports = []
  let user = {}
  try { profile = JSON.parse(localStorage.getItem('player_profile_data') || '{}') } catch { /* dữ liệu hỏng trong localStorage → dùng mặc định */ }
  try { sports = JSON.parse(localStorage.getItem('player_sports_data') || '[]') } catch { /* dữ liệu hỏng trong localStorage → dùng mặc định */ }
  try { user = JSON.parse(localStorage.getItem('user') || '{}') } catch { /* dữ liệu hỏng trong localStorage → dùng mặc định */ }

  const name = profile.name || user.fullName || user.username || ''
  const location = String(profile.location || '').trim()
  const lat = toCoord(profile.latitude ?? profile.lat)
  const lng = toCoord(profile.longitude ?? profile.lng)

  let favSportsNames = []
  if (Array.isArray(sports) && sports.length > 0) {
    favSportsNames = sports.map((s) => s.sportName || s.name).filter(Boolean)
  }
  if (favSportsNames.length === 0) {
    try {
      const selected = JSON.parse(localStorage.getItem('sportnexus_selected_sports') || '[]')
      if (Array.isArray(selected) && selected.length > 0) {
        favSportsNames = selected.map((k) => k === 'badminton' ? 'Cầu lông' : k === 'pickleball' ? 'Pickleball' : k === 'football' ? 'Bóng đá' : k === 'tennis' ? 'Tennis' : k)
      }
    } catch { /* dữ liệu hỏng trong localStorage → dùng mặc định */ }
  }

  return {
    name,
    rawLocation: location,
    lat,
    lng,
    favoriteSports: favSportsNames,
    favoriteSportsLabel: favSportsNames.join(', '),
  }
}

// Tạo thông điệp chào mừng đồng bộ theo vị trí thực của người chơi
export function buildWelcomeMessage(userLocation, userProfile = null) {
  const profile = userProfile || getUserProfileContext()
  const addressName =
    userLocation?.address ||
    (userLocation?.name && userLocation.name !== 'Chưa xác định vị trí' ? userLocation.name : '') ||
    profile.rawLocation ||
    'Chưa xác định (bật GPS hoặc nhập khu vực trong câu hỏi)'
  const nowTime = userLocation?.updatedAt || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const greeting = profile.name ? `Xin chào **${profile.name}**!` : 'Xin chào bạn!'
  const sportsNote = profile.favoriteSportsLabel ? `• **Môn thể thao trong hồ sơ**: **${profile.favoriteSportsLabel}**.\n` : ''

  return {
    id: `welcome-${Date.now()}`,
    sender: 'bot',
    time: nowTime,
    text:
      `${greeting} Tôi là **SportNexus AI Concierge** — trợ lý đặt sân thể thao thời gian thực.\n\n` +
      `📍 **Khu vực của bạn**: **${addressName}** *(lúc ${nowTime})*.\n` +
      sportsNote +
      `\n💡 *Gõ hoặc bấm Micro để nói (VD: "sân cầu lông tối nay gần tôi", "sân dưới 150k chiều mai", "tìm kèo pickleball cuối tuần").* ` +
      `Mình chỉ gợi ý sân và ca còn trống thật trên hệ thống; bấm vào ca để chuyển sang thanh toán.`,
    quickReplies: [
      'Sân trống tối nay gần tôi',
      'Sân cầu lông giá rẻ nhất chiều mai',
      'Tìm kèo pickleball cuối tuần',
      'Chính sách hủy sân và hoàn tiền',
    ],
  }
}
