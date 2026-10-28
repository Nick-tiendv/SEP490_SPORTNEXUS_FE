// aiBookingData.js — Dữ liệu vị trí, hồ sơ người chơi và lời chào cho Trợ lý AI SportNexus
// Gợi ý sân/ca/kèo đều lấy từ BE (POST /api/v1/ai/chat), FE không tự sinh câu trả lời.

export const DISTRICT_CENTERS = {
  q7: { name: 'Quận 7', address: 'Nguyễn Thị Thập, P. Tân Quy, Quận 7', lat: 10.734, lng: 106.7215 },
  thuduc: { name: 'TP. Thủ Đức', address: 'Lê Văn Việt, P. Tăng Nhơn Phú, TP. Thủ Đức', lat: 10.849, lng: 106.7537 },
  q10: { name: 'Quận 10', address: 'Cách Mạng Tháng 8, P. 12, Quận 10', lat: 10.7715, lng: 106.6672 },
  tanbinh: { name: 'Tân Bình', address: 'Hoàng Hoa Thám, P. 12, Tân Bình', lat: 10.8015, lng: 106.6534 },
  binhthanh: { name: 'Bình Thạnh', address: 'Điện Biên Phủ, P. 15, Bình Thạnh', lat: 10.8105, lng: 106.6975 },
  phunhuan: { name: 'Phú Nhuận', address: 'Hoa Phượng, P. 2, Phú Nhuận', lat: 10.7992, lng: 106.6803 },
  q1: { name: 'Quận 1', address: 'Huyền Trân Công Chúa, P. Bến Thành, Quận 1', lat: 10.7756, lng: 106.7004 },
  q3: { name: 'Quận 3', address: 'Hồ Xuân Hương, P. Võ Thị Sáu, Quận 3', lat: 10.7788, lng: 106.6852 },
  quan8: { name: 'Quận 8', address: 'Phạm Hùng, P. 4, Quận 8', lat: 10.7242, lng: 106.6286 },
  govap: { name: 'Gò Vấp', address: 'Quang Trung, P. 11, Gò Vấp', lat: 10.8388, lng: 106.6653 },
  tanphu: { name: 'Tân Phú', address: 'Celadon City, P. Sơn Kỳ, Tân Phú', lat: 10.7901, lng: 106.6281 },
  q5: { name: 'Quận 5', address: 'Nguyễn Trãi, P. 11, Quận 5', lat: 10.7538, lng: 106.6621 },
  binhtan: { name: 'Bình Tân', address: 'Lê Trọng Tấn, P. Bình Hưng Hòa, Bình Tân', lat: 10.7825, lng: 106.6085 },
}

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`

// Công thức Haversine tính khoảng cách chuẩn theo tọa độ GPS (km)
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(0.3, Math.round(R * c * 10) / 10)
}

// Nhận diện quận gần nhất từ GPS
export function detectClosestDistrict(lat, lng) {
  if (lat == null || lng == null) return DISTRICT_CENTERS.q7
  let closest = DISTRICT_CENTERS.q7
  let minDist = Infinity
  for (const key of Object.keys(DISTRICT_CENTERS)) {
    const item = DISTRICT_CENTERS[key]
    const d = haversineDistance(lat, lng, item.lat, item.lng) || 999
    if (d < minDist) {
      minDist = d
      closest = item
    }
  }
  return closest
}

export function getUserProfileContext() {
  let profile = {}
  let sports = []
  let user = {}
  try { profile = JSON.parse(localStorage.getItem('player_profile_data') || '{}') } catch {}
  try { sports = JSON.parse(localStorage.getItem('player_sports_data') || '[]') } catch {}
  try { user = JSON.parse(localStorage.getItem('user') || '{}') } catch {}

  const name = profile.name || user.fullName || user.username || ''
  const location = profile.location || ''

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
    } catch {}
  }

  let districtKey = null
  let districtCenter = null
  if (location) {
    const locLower = location.toLowerCase()
    if (locLower.includes('thủ đức') || locLower.includes('thu duc') || locLower.includes('quận 9') || locLower.includes('quận 2')) {
      districtKey = 'thuduc'
      districtCenter = DISTRICT_CENTERS.thuduc
    } else if (locLower.includes('quận 7') || locLower.includes('q7')) {
      districtKey = 'q7'
      districtCenter = DISTRICT_CENTERS.q7
    } else if (locLower.includes('quận 10') || locLower.includes('q10')) {
      districtKey = 'q10'
      districtCenter = DISTRICT_CENTERS.q10
    } else if (locLower.includes('tân bình') || locLower.includes('tan binh')) {
      districtKey = 'tanbinh'
      districtCenter = DISTRICT_CENTERS.tanbinh
    } else if (locLower.includes('bình thạnh') || locLower.includes('binh thanh')) {
      districtKey = 'binhthanh'
      districtCenter = DISTRICT_CENTERS.binhthanh
    } else if (locLower.includes('phú nhuận') || locLower.includes('phu nhuan')) {
      districtKey = 'phunhuan'
      districtCenter = DISTRICT_CENTERS.phunhuan
    } else if (locLower.includes('quận 1') || locLower.includes('q1')) {
      districtKey = 'q1'
      districtCenter = DISTRICT_CENTERS.q1
    } else if (locLower.includes('quận 3') || locLower.includes('q3')) {
      districtKey = 'q3'
      districtCenter = DISTRICT_CENTERS.q3
    } else if (locLower.includes('quận 8') || locLower.includes('q8')) {
      districtKey = 'quan8'
      districtCenter = DISTRICT_CENTERS.quan8
    } else if (locLower.includes('gò vấp') || locLower.includes('go vap')) {
      districtKey = 'govap'
      districtCenter = DISTRICT_CENTERS.govap
    } else if (locLower.includes('tân phú') || locLower.includes('tan phu')) {
      districtKey = 'tanphu'
      districtCenter = DISTRICT_CENTERS.tanphu
    } else if (locLower.includes('quận 5') || locLower.includes('q5')) {
      districtKey = 'q5'
      districtCenter = DISTRICT_CENTERS.q5
    } else if (locLower.includes('bình tân') || locLower.includes('binh tan')) {
      districtKey = 'binhtan'
      districtCenter = DISTRICT_CENTERS.binhtan
    }
  }

  return {
    name,
    rawLocation: location,
    districtKey,
    districtCenter,
    favoriteSports: favSportsNames,
    favoriteSportsLabel: favSportsNames.join(', '),
  }
}

// Tạo thông điệp chào mừng đồng bộ theo vị trí mới của người chơi
export function buildWelcomeMessage(userLocation, userProfile = null) {
  const profile = userProfile || getUserProfileContext()
  const loc = userLocation || profile.districtCenter || DISTRICT_CENTERS.thuduc
  const addressName = loc.address || loc.name || 'TP. Thủ Đức, TP.HCM'
  const nowTime = loc.updatedAt || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

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
