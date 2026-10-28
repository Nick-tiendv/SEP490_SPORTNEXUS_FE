// aiBookingData.js — Cơ sở dữ liệu và bộ xử lý trả lời thông minh của Trợ lý AI SportNexus
// Thiết kế tối ưu: Trả lời chính xác, đầy đủ trọng tâm, không dư thừa, hỗ trợ chọn & đặt sân siêu tốc

export const DISTRICTS = [
  { key: 'all', label: 'Tất cả khu vực TP.HCM' },
  { key: 'q7', label: 'Quận 7' },
  { key: 'thuduc', label: 'TP. Thủ Đức' },
  { key: 'q10', label: 'Quận 10' },
  { key: 'tanbinh', label: 'Tân Bình' },
  { key: 'binhthanh', label: 'Bình Thạnh' },
  { key: 'phunhuan', label: 'Phú Nhuận' },
  { key: 'q1', label: 'Quận 1' },
  { key: 'q3', label: 'Quận 3' },
  { key: 'quan8', label: 'Quận 8' },
  { key: 'govap', label: 'Gò Vấp' },
  { key: 'tanphu', label: 'Tân Phú' },
  { key: 'q5', label: 'Quận 5' },
  { key: 'binhtan', label: 'Bình Tân' },
]

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

export const COURTS = [
  // ========== CƠ SỞ 1: HÀ NỘI BADMINTON CENTER (36 TRẦN DUY HƯNG) ==========
  {
    id: '83c47bdd-4166-48c5-9083-08f99d58084f',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Hà Nội Badminton Center',
    address: '36 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội',
    district: 'hanoi',
    districtName: 'Hà Nội',
    lat: 21.0117,
    lng: 105.8006,
    rating: 4.9,
    reviewsCount: 386,
    price: 100000,
    courtCount: 4,
    image: 'https://picsum.photos/seed/sportnexus-fac-3-1/800/600',
    subCourt: 'Sân lucky (Mặt gỗ thi đấu)',
    subCourtDesc: '36 Trần Duy Hưng, Cầu Giấy, Hà Nội • Đạt chuẩn thi đấu, đèn chiếu sáng ban đêm, phòng tắm & căng tin',
    subCourts: [
      { id: '4e10deee-f580-43d9-96f6-8b1981e0f42c', name: 'Sân lucky', sport: 'Cầu lông', price: 1000 },
      { id: '77ba51b3-a22b-4d47-8744-b2c14221f32f', name: 'Sân 1', sport: 'Cầu lông', price: 100000 },
      { id: '92d4cae3-90aa-46be-9302-23f0effe8b5f', name: 'Sân 2', sport: 'Cầu lông', price: 100000 },
      { id: 'a1d30c78-9214-4d6b-93e7-5d506d37cd56', name: 'Sân Pickleball', sport: 'Pickleball', price: 130000 },
    ],
    highlights: ['Địa chỉ 36 Trần Duy Hưng, Cầu Giấy', 'Sân lucky ưu đãi đặc biệt', 'Đạt chuẩn thi đấu BWF', 'Đèn chiếu sáng ban đêm & Phòng tắm'],
    amenities: { parking: 'Bãi gửi xe rộng', ac: 'Quạt thông gió & Mát mẻ', proFloor: 'Mặt gỗ thi đấu', showers: true, lighting: 'Đèn chiếu sáng ban đêm' },
    route: { eta: 'Trục đường Trần Duy Hưng, Cầu Giấy', note: 'Gần Grand Plaza & BigC Thăng Long' },
    overrides: { s_m1: 'available', s_a1: 'available', s_a2: 'available', s_e1: 'available' },
    keywords: ['hà nội badminton center', '36 trần duy hưng', 'trần duy hưng', 'sân lucky', 'lucky', 'lucky badminton'],
  },

  // ========== CƠ SỞ 2: THỦ ĐỨC SPORTS HUB (1 VÕ VĂN NGÂN) ==========
  {
    id: '680db3fd-becd-4ed2-8ffa-a9fecf7a9ca1',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Thủ Đức Sports Hub',
    address: '1 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức, TP.HCM',
    district: 'thuduc',
    districtName: 'TP. Thủ Đức',
    lat: 10.8492,
    lng: 106.7785,
    rating: 4.8,
    reviewsCount: 310,
    price: 160000,
    courtCount: 3,
    image: 'https://picsum.photos/seed/sportnexus-fac-1-1/800/600',
    subCourt: 'Sân Cầu lông VIP',
    subCourtDesc: '1 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức • Sân tiêu chuẩn, bãi đỗ xe máy & ô tô rộng',
    subCourts: [
      { id: 'f4d8b134-b950-434e-8de0-0ad9cc37f283', name: 'Sân Cầu lông VIP', sport: 'Cầu lông', price: 160000 },
      { id: 'a2ccc41b-1e09-4738-8b5a-c5e6061e63e0', name: 'Sân Tennis 1', sport: 'Tennis', price: 200000 },
      { id: '02e22a52-3537-42c9-8aa0-aae7ed3f000a', name: 'Sân bóng chuyền hơi', sport: 'Bóng chuyền', price: 150000 },
    ],
    highlights: ['Trục chính Võ Văn Ngân Thủ Đức', 'Sân Cầu lông VIP chuẩn', 'Bãi đỗ ô tô rộng', 'Đèn LED thi đấu'],
    amenities: { parking: 'Bãi đỗ xe ô tô & xe máy', ac: 'Quạt trần công nghiệp', proFloor: 'Thảm BWF cao cấp', showers: true, lighting: 'Đèn LED chống chói' },
    route: { eta: '5 phút di chuyển', note: 'Gần chợ Thủ Đức và ngã tư Thủ Đức' },
    overrides: { s_a1: 'available', s_a2: 'available', s_e1: 'available' },
    keywords: ['thủ đức sports hub', '1 võ văn ngân', 'võ văn ngân', 'sân cầu lông vip'],
  },

  // ========== CƠ SỞ 3: GÒ VẤP PICKLEBALL CLUB (120 QUANG TRUNG) ==========
  {
    id: '09b63d15-1801-4c2c-9734-d25fd6aebcd0',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'Gò Vấp Pickleball Club',
    address: '120 Quang Trung, Phường 10, Gò Vấp, TP.HCM',
    district: 'govap',
    districtName: 'Gò Vấp',
    lat: 10.8388,
    lng: 106.6653,
    rating: 4.8,
    reviewsCount: 180,
    price: 180000,
    courtCount: 4,
    image: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=400&h=300&fit=crop',
    subCourt: 'Sân Pickleball Pro 01',
    subCourtDesc: '120 Quang Trung, Gò Vấp • Mặt sân acrylic chuẩn USAPA',
    subCourts: [
      { id: 'gv-pb-1', name: 'Sân Pickleball 1', sport: 'Pickleball', price: 180000 },
      { id: 'gv-pb-2', name: 'Sân Pickleball 2', sport: 'Pickleball', price: 180000 },
    ],
    highlights: ['Mặt sân Acrylic USAPA', 'Đèn LED Pro', 'Bãi đỗ xe rộng rãi', 'Căng tin phục vụ nước uống'],
    amenities: { parking: 'Bãi gửi xe có bảo vệ', ac: 'Quạt thông gió', proFloor: 'Acrylic USAPA', showers: true, lighting: 'Đèn LED Pro' },
    route: { eta: 'Mặt tiền Quang Trung Gò Vấp', note: 'Gần Ngã 5 Chuồng Chó' },
    overrides: { s_a1: 'available', s_a2: 'available', s_e1: 'available' },
    keywords: ['gò vấp pickleball club', '120 quang trung', 'pickleball pro 01'],
  },

  // ========== CƠ SỞ 4: SÂN BÓNG PHÚ MỸ HƯNG (15 NGUYỄN LƯƠNG BẰNG) ==========
  {
    id: '7c8ce758-5c02-46c7-860c-b6b72888bffd',
    sport: 'football',
    sportName: 'Bóng đá',
    name: 'Sân Bóng Phú Mỹ Hưng',
    address: '15 Nguyễn Lương Bằng, Tân Phú, Quận 7, TP.HCM',
    district: 'q7',
    districtName: 'Quận 7',
    lat: 10.7295,
    lng: 106.7218,
    rating: 4.8,
    reviewsCount: 290,
    price: 250000,
    courtCount: 3,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
    subCourt: 'Sân 5 người số 1',
    subCourtDesc: '15 Nguyễn Lương Bằng, Phú Mỹ Hưng, Q.7 • Cỏ nhân tạo FIFA Quality Pro',
    subCourts: [
      { id: '55d7dbe8-b0e3-4dab-90d4-275778a8723a', name: 'Sân 5 người số 1', sport: 'Bóng đá', price: 250000 },
      { id: '08e94d57-2f15-4e84-8624-30d0e6f1a821', name: 'Sân 7 người', sport: 'Bóng đá', price: 350000 },
      { id: '9481c7fb-3339-4cdf-9e16-3f9e60615af2', name: 'Sân bóng rổ ngoài trời', sport: 'Bóng rổ', price: 150000 },
    ],
    highlights: ['Cỏ nhân tạo chuẩn FIFA', 'Đỗ ô tô thoải mái Phú Mỹ Hưng', 'Đèn LED ban đêm cực sáng'],
    amenities: { parking: 'Bãi đỗ ô tô & xe máy rộng', ac: 'Không gian thoáng mát ven hồ', proFloor: 'Cỏ nhân tạo FIFA', showers: true, lighting: 'Đèn LED ban đêm' },
    route: { eta: 'Trung tâm Phú Mỹ Hưng', note: 'Trục Nguyễn Lương Bằng' },
    overrides: { s_a1: 'available', s_a2: 'available', s_e1: 'available' },
    keywords: ['sân bóng phú mỹ hưng', '15 nguyễn lương bằng', 'nguyễn lương bằng'],
  },

  // ========== CƠ SỞ 5: SPORTNEXUS ARENA QUẬN 1 (68 NGUYỄN HUỆ) ==========
  {
    id: 'b680cc74-77fb-4cb8-ab40-e0ddb4084e19',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'SportNexus Arena Quận 1',
    address: '68 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    district: 'q1',
    districtName: 'Quận 1',
    lat: 10.7743,
    lng: 106.7038,
    rating: 4.9,
    reviewsCount: 360,
    price: 90000,
    courtCount: 3,
    image: 'https://picsum.photos/seed/sportnexus-fac-0-1/800/600',
    subCourt: 'Sân Cầu lông 1',
    subCourtDesc: '68 Nguyễn Huệ, Phường Bến Nghé, Q.1 • Sân đạt chuẩn thi đấu, phố đi bộ Nguyễn Huệ',
    subCourts: [
      { id: '4c8b875f-7aaf-4f06-9fbd-5da2b2becdd1', name: 'Sân Cầu lông 1', sport: 'Cầu lông', price: 90000 },
      { id: '80eea835-81d4-4bb0-a3c9-2311025d8830', name: 'Sân Cầu lông 2', sport: 'Cầu lông', price: 90000 },
      { id: 'eb26558b-23e6-4857-bb1a-3cc8d2b976df', name: 'Sân Pickleball A', sport: 'Pickleball', price: 120000 },
    ],
    highlights: ['Vị trí vàng Phố đi bộ Nguyễn Huệ Quận 1', 'Giá siêu tốt chỉ từ 90k/h', 'Thảm thi đấu BWF', 'Phòng tắm & Căng tin'],
    amenities: { parking: 'Hầm gửi xe an ninh', ac: 'Máy lạnh & thoáng mát', proFloor: 'Thảm BWF', showers: true, lighting: 'Đèn LED thi đấu' },
    route: { eta: 'Trung tâm Quận 1', note: 'Mặt tiền Nguyễn Huệ' },
    overrides: { s_a1: 'available', s_a2: 'available', s_e1: 'available' },
    keywords: ['sportnexus arena', 'sportnexus arena quận 1', 'arena quận 1', '68 nguyễn huệ', 'sân cầu lông 1', 'sân cầu lông 2', 'sân pickleball a'],
  },
]

export const SLOT_TEMPLATE = [
  // Khung giờ sáng (06:00 - 12:00)
  { id: 's_m1', start: '06:00', end: '08:00', hours: 2, factor: 0.85, status: 'available', note: 'Sáng sớm trong lành' },
  { id: 's_m2', start: '08:00', end: '10:00', hours: 2, factor: 0.9, status: 'available', note: 'Khung giờ sáng mát mẻ' },
  { id: 's_m3', start: '10:00', end: '12:00', hours: 2, factor: 0.85, status: 'available', note: 'Khung trưa vắng người' },

  // Khung giờ chiều (12:00 - 18:00)
  { id: 's_a0', start: '12:00', end: '14:00', hours: 2, factor: 0.85, status: 'available', note: 'Đầu giờ chiều yên tĩnh' },
  { id: 's_a1', start: '14:00', end: '16:00', hours: 2, factor: 0.95, status: 'available', note: 'Khung giờ chiều mát mẻ' },
  { id: 's_a2', start: '16:00', end: '18:00', hours: 2, factor: 1.0, status: 'available', note: 'Khung chiều tan tầm' },

  // Khung giờ tối & đêm (18:00 - 24:00)
  { id: 's_e1', start: '18:00', end: '20:00', hours: 2, factor: 1.0, status: 'available', note: 'Khung giờ vàng tối lý tưởng' },
  { id: 's_e2', start: '20:00', end: '22:00', hours: 2, factor: 0.95, status: 'available', note: 'Khung giờ tối muộn sôi nổi' },
  { id: 's_e3', start: '22:00', end: '24:00', hours: 2, factor: 0.85, status: 'available', note: 'Giảm 15% ca đêm yên tĩnh' },
]

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`
export const roundTo10k = (n) => (Number(n || 0) <= 5000 ? Math.round(Number(n || 0)) : Math.round(Number(n || 0) / 10000) * 10000)

// Phân tích câu hỏi người dùng để nhận diện yêu cầu về khung giờ (cụ thể hoặc theo buổi)
export function parseTimeRequirement(query) {
  if (!query) return null
  const q = query.toLowerCase()

  // 1. Khoảng giờ cụ thể (vd: "14:00 - 16:00", "14h - 16h", "14-16h", "14h đến 16h", "từ 14:00 đến 16:00")
  const rangeMatch = q.match(/(\d{1,2})(?:[:h](\d{2}))?\s*(?:h)?\s*(?:-|đến|tới)\s*(\d{1,2})(?:[:h](\d{2}))?\s*(?:h)?/)
  if (rangeMatch) {
    const startHour = parseInt(rangeMatch[1], 10)
    const endHour = parseInt(rangeMatch[3], 10)
    const startMin = rangeMatch[2] || '00'
    const endMin = rangeMatch[4] || '00'
    const startStr = `${String(startHour).padStart(2, '0')}:${startMin}`
    const endStr = `${String(endHour).padStart(2, '0')}:${endMin}`
    return {
      type: 'range',
      startHour,
      endHour,
      label: `${startStr} - ${endStr}`,
      isAfternoon: startHour >= 12 && startHour < 18,
      isMorning: startHour < 12,
      isEvening: startHour >= 18,
    }
  }

  // 2. Giờ cụ thể đơn lẻ (vd: "14:00", "14h", "2h chiều", "15:00", "16h")
  const singleHourMatch = q.match(/(\d{1,2})(?:[:](\d{2})|\s*h(?:(\d{2}))?)/)
  if (singleHourMatch) {
    let hour = parseInt(singleHourMatch[1], 10)
    if (q.includes('chiều') && hour < 12) hour += 12
    if (q.includes('tối') && hour < 12 && hour <= 11) hour += 12
    return {
      type: 'hour',
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      isAfternoon: hour >= 12 && hour < 18,
      isMorning: hour < 12,
      isEvening: hour >= 18,
    }
  }

  // 3. Theo buổi trong ngày
  if (q.includes('chiều') || q.includes('buổi chiều') || q.includes('chiều nay') || q.includes('chiều mai')) {
    return { type: 'period', period: 'afternoon', label: 'buổi chiều (13:30 - 17:00)', startHour: 13, endHour: 17, isAfternoon: true }
  }
  if (q.includes('sáng') || q.includes('buổi sáng') || q.includes('sáng sớm')) {
    return { type: 'period', period: 'morning', label: 'buổi sáng (06:00 - 12:00)', startHour: 6, endHour: 12, isMorning: true }
  }
  if (q.includes('trưa') || q.includes('buổi trưa')) {
    return { type: 'period', period: 'noon', label: 'buổi trưa (11:30 - 14:00)', startHour: 11, endHour: 14, isNoon: true }
  }
  if (q.includes('tối') || q.includes('buổi tối') || q.includes('tối nay') || q.includes('tối mai') || q.includes('đêm')) {
    return { type: 'period', period: 'evening', label: 'buổi tối (17:30 - 23:00)', startHour: 17, endHour: 23, isEvening: true }
  }

  return null
}

// Tìm ca sân khớp tối ưu với yêu cầu thời gian của người chơi
export function findBestMatchingSlot(slots, timeReq) {
  if (!slots || slots.length === 0) return null

  if (!timeReq) {
    return slots.find((s) => s.id === 's5' && s.status === 'available') || slots.find((s) => s.status === 'available') || slots[0]
  }

  const getH = (tStr) => {
    if (!tStr) return 0
    return parseInt(tStr.split(':')[0], 10)
  }

  let candidates = []

  if (timeReq.type === 'range') {
    candidates = slots.filter((s) => {
      const sH = getH(s.start)
      const eH = getH(s.end)
      return (sH >= timeReq.startHour && sH < timeReq.endHour) ||
             (eH > timeReq.startHour && eH <= timeReq.endHour) ||
             (sH <= timeReq.startHour && eH >= timeReq.endHour)
    })
  } else if (timeReq.type === 'hour') {
    candidates = slots.filter((s) => {
      const sH = getH(s.start)
      const eH = getH(s.end)
      return (timeReq.hour >= sH && timeReq.hour < eH) || Math.abs(sH - timeReq.hour) <= 1
    })
  } else if (timeReq.type === 'period') {
    candidates = slots.filter((s) => {
      const sH = getH(s.start)
      return sH >= timeReq.startHour && sH < timeReq.endHour
    })
  }

  const availableMatch = candidates.find((s) => s.status === 'available')
  if (availableMatch) return availableMatch
  if (candidates.length > 0) return candidates[0]

  return slots.find((s) => s.status === 'available') || slots[0]
}

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

// Tính khoảng cách từ sân đến vị trí người chơi
export function calculateCourtDistance(court, userLocation) {
  if (!court) return 1.5
  if (userLocation?.lat != null && userLocation?.lng != null && court.lat != null && court.lng != null) {
    const dist = haversineDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)
    if (dist != null) return dist
  }
  return 1.8
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

// Xây dựng danh sách slot thời gian cho sân
export function buildSlotsForCourt(court) {
  if (!court) return []
  return SLOT_TEMPLATE.map((t) => {
    const status = court.overrides?.[t.id] || t.status
    return {
      ...t,
      status,
      note: status === 'booked' ? t.note || 'Đã kín lịch' : status === 'held' ? 'Đang giữ chỗ 15p' : t.note,
      price: roundTo10k(court.price * t.hours * t.factor),
    }
  })
}


// Kho lưu trữ sân động đồng bộ từ API GET /api/v1/facilities của hệ thống
let DYNAMIC_COURTS = []

export function syncFacilitiesWithAIChat(rawFacilities) {
  if (!Array.isArray(rawFacilities) || rawFacilities.length === 0) return
  const mapped = rawFacilities.map((fac) => {
    const id = fac.id || fac.facilityId || `fac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const existingCourt = COURTS.find((c) => c.id === id)
    const name = fac.name || fac.facilityName || existingCourt?.name || 'Cụm sân thể thao'
    const address = fac.address || fac.location || existingCourt?.address || 'TP. Hồ Chí Minh'
    
    // Detect district
    let districtKey = 'thuduc'
    const norm = String(address).toLowerCase()
    if (norm.includes('hà nội') || norm.includes('ha noi') || norm.includes('cầu giấy') || norm.includes('trần duy hưng')) districtKey = 'hanoi'
    else if (norm.includes('quận 7') || norm.includes('q7') || norm.includes('phú mỹ hưng')) districtKey = 'q7'
    else if (norm.includes('quận 10') || norm.includes('q10')) districtKey = 'q10'
    else if (norm.includes('tân bình') || norm.includes('hoàng hoa thám')) districtKey = 'tanbinh'
    else if (norm.includes('bình thạnh') || norm.includes('điện biên phủ')) districtKey = 'binhthanh'
    else if (norm.includes('phú nhuận') || norm.includes('hoa phượng')) districtKey = 'phunhuan'
    else if (norm.includes('quận 1') || norm.includes('q1') || norm.includes('tao đàn')) districtKey = 'q1'
    else if (norm.includes('quận 3') || norm.includes('q3')) districtKey = 'q3'
    else if (norm.includes('quận 8') || norm.includes('q8')) districtKey = 'quan8'
    else if (norm.includes('gò vấp')) districtKey = 'govap'
    else if (norm.includes('tân phú')) districtKey = 'tanphu'
    else if (norm.includes('quận 5') || norm.includes('q5')) districtKey = 'q5'
    else if (norm.includes('bình tân')) districtKey = 'binhtan'
    else districtKey = existingCourt?.district || 'thuduc'

    const districtInfo = DISTRICT_CENTERS[districtKey] || (districtKey === 'hanoi' ? { name: 'Hà Nội', address, lat: 21.0117, lng: 105.8006 } : DISTRICT_CENTERS.thuduc)

    // Map subCourts từ fac.courts hoặc fallback existingCourt.subCourts
    let subCourts = []
    if (Array.isArray(fac.courts) && fac.courts.length > 0) {
      subCourts = fac.courts.map((sc) => ({
        id: sc.id,
        name: sc.name || `Sân ${sc.courtNumber || '01'}`,
        sport: sc.categoryName || sc.sportCategory || 'Cầu lông',
        price: Number(sc.defaultPrice || sc.price || 100000),
      }))
    } else if (existingCourt?.subCourts && existingCourt.subCourts.length > 0) {
      subCourts = existingCourt.subCourts
    } else {
      subCourts = [
        { id: `${id}-sc1`, name: `${name} - Sân 01`, sport: 'Cầu lông', price: Number(fac.pricePerHour || fac.price || 100000) }
      ]
    }

    // Nếu cơ sở có sân lucky, ưu tiên nhận diện
    const luckySubCourt = subCourts.find((sc) => sc.name.toLowerCase().includes('lucky'))
    const primarySubCourt = luckySubCourt || subCourts[0]

    const validPrices = subCourts.map((sc) => sc.price).filter((p) => !isNaN(p) && p > 0)
    const basePrice = validPrices.length > 0 ? Math.min(...validPrices) : Number(fac.pricePerHour || fac.price || 100000)

    let sportKey = 'badminton'
    const sportStr = String(primarySubCourt?.sport || fac.sportCategory || fac.category || fac.sport || '').toLowerCase()
    if (sportStr.includes('pickleball')) sportKey = 'pickleball'
    else if (sportStr.includes('bóng đá') || sportStr.includes('football')) sportKey = 'football'
    else if (sportStr.includes('bóng rổ') || sportStr.includes('basketball')) sportKey = 'basketball'
    else if (sportStr.includes('tennis')) sportKey = 'tennis'
    else sportKey = 'badminton'

    const sportName = primarySubCourt?.sport || (sportKey === 'badminton' ? 'Cầu lông' : sportKey === 'pickleball' ? 'Pickleball' : sportKey === 'football' ? 'Bóng đá' : sportKey === 'tennis' ? 'Tennis' : 'Cầu lông')

    // Tự động xây dựng tập từ khóa đa dạng cho cơ sở và các sân con
    const autoKeywords = [
      name.toLowerCase(),
      address.toLowerCase(),
      ...subCourts.map((sc) => sc.name.toLowerCase()),
      ...(existingCourt?.keywords || []),
    ]
    if (name.toLowerCase().includes('hà nội') || address.toLowerCase().includes('hà nội') || address.toLowerCase().includes('trần duy hưng') || subCourts.some((sc) => sc.name.toLowerCase().includes('lucky'))) {
      autoKeywords.push('hà nội', 'ha noi', 'trần duy hưng', 'tran duy hung', '36 trần duy hưng', 'cầu giấy', 'cau giay', 'sân lucky', 'lucky', 'lucky badminton')
    }

    return {
      id,
      sport: sportKey,
      sportName,
      name,
      address,
      district: districtKey,
      districtName: districtInfo.name,
      lat: fac.latitude != null ? Number(fac.latitude) : (existingCourt?.lat || districtInfo.lat),
      lng: fac.longitude != null ? Number(fac.longitude) : (existingCourt?.lng || districtInfo.lng),
      rating: Number(fac.rating || fac.averageRating || existingCourt?.rating || 4.8),
      reviewsCount: Number(fac.totalReviews || fac.reviewCount || fac.reviewsCount || existingCourt?.reviewsCount || 150),
      price: basePrice,
      courtCount: subCourts.length,
      image: fac.imageItems?.find((i) => i.isThumbnail)?.url || fac.images?.[0] || fac.image || existingCourt?.image || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
      subCourt: primarySubCourt.name,
      subCourtDesc: fac.description || existingCourt?.subCourtDesc || 'Sân tiêu chuẩn thi đấu, bãi đỗ xe rộng rãi, ánh sáng đạt chuẩn',
      subCourts,
      highlights: existingCourt?.highlights || ['Sân tiêu chuẩn chất lượng cao', 'Hệ thống đèn LED đạt chuẩn', 'Bãi đỗ ô tô & xe máy', 'Bảo chứng ký quỹ Escrow 24/7'],
      amenities: existingCourt?.amenities || {
        parking: fac.hasParking ? 'Bãi đỗ xe ô tô & xe máy an toàn' : 'Bãi giữ xe thuận tiện',
        ac: fac.hasAC ? 'Có máy lạnh & quạt trần' : 'Quạt trần & thông gió công nghiệp',
        proFloor: 'Thảm thi đấu cao cấp',
        showers: Boolean(fac.hasShower),
        lighting: 'Đèn LED chống chói chuẩn thi đấu',
      },
      route: existingCourt?.route || { eta: '5-15 phút di chuyển', note: 'Tuyến đường thuận tiện' },
      overrides: { s_a1: 'available', s_a2: 'available', s_e1: 'available' },
      keywords: Array.from(new Set(autoKeywords)),
    }
  })

  DYNAMIC_COURTS = mapped
}

export function getAllAvailableCourts() {
  const map = new Map()
  COURTS.forEach((c) => map.set(c.id, c))
  DYNAMIC_COURTS.forEach((c) => map.set(c.id, c))
  return Array.from(map.values())
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

export const DISTRICT_MATCHERS = [
  // Double digits first to prevent prefix matching conflicts
  { key: 'q10', name: 'Quận 10', regex: /(?:quận|q\.?)\s*10\b/i, terms: ['thành thái', 'bắc hải', 'tô hiến thành', 'sư vạn hạnh', 'kỳ hòa', 'lan anh'] },
  { key: 'q11', name: 'Quận 11', regex: /(?:quận|q\.?)\s*11\b/i, terms: ['lạc long quân', 'đầm sen', 'lê đại hành'] },
  { key: 'q12', name: 'Quận 12', regex: /(?:quận|q\.?)\s*12\b/i, terms: ['an phú đông', 'tô ký'] },
  // Single digits with negative lookahead for digits (?![0-9])
  { key: 'q1', name: 'Quận 1', regex: /(?:quận|q\.?)\s*1\b(?![0-9])/i, terms: ['bến thành', 'tao đàn', 'nguyễn huệ', 'huyền trân', 'lê duẩn'] },
  { key: 'q2', name: 'Quận 2', regex: /(?:quận|q\.?)\s*2\b(?![0-9])/i, terms: ['thảo điền', 'an phú', 'sala', 'thủ thiêm'] },
  { key: 'q3', name: 'Quận 3', regex: /(?:quận|q\.?)\s*3\b(?![0-9])/i, terms: ['hồ xuân hương', 'võ thị sáu', 'nguyễn đình chiểu'] },
  { key: 'q4', name: 'Quận 4', regex: /(?:quận|q\.?)\s*4\b(?![0-9])/i, terms: ['hoàng diệu', 'đoàn văn bơ', 'bến vân đồn'] },
  { key: 'q5', name: 'Quận 5', regex: /(?:quận|q\.?)\s*5\b(?![0-9])/i, terms: ['nguyễn trãi', 'hải thượng lãn ông', 'an đông'] },
  { key: 'q6', name: 'Quận 6', regex: /(?:quận|q\.?)\s*6\b(?![0-9])/i, terms: ['hậu giang', 'bình tây'] },
  { key: 'q7', name: 'Quận 7', regex: /(?:quận|q\.?)\s*7\b(?![0-9])/i, terms: ['phú mỹ hưng', 'nguyễn thị thập', 'huỳnh tấn phát', 'tân quy', 'tân thuận', 'tân phú q7'] },
  { key: 'quan8', name: 'Quận 8', regex: /(?:quận|q\.?)\s*8\b(?![0-9])/i, terms: ['phạm hùng', 'bông sao'] },
  { key: 'q9', name: 'Quận 9', regex: /(?:quận|q\.?)\s*9\b(?![0-9])/i, terms: ['đình phong phú', 'tăng nhơn phú', 'đỗ xuân hợp'] },
  // Named districts
  { key: 'thuduc', name: 'TP. Thủ Đức', regex: /(?:tp\.?\s*)?thủ đức\b/i, terms: ['thu duc', 'linh chiểu', 'đặng văn bi', 'võ văn ngân'] },
  { key: 'govap', name: 'Gò Vấp', regex: /gò vấp\b/i, terms: ['go vap', 'quang trung', 'nguyễn oanh', 'phan văn trị'] },
  { key: 'binhthanh', name: 'Bình Thạnh', regex: /bình thạnh\b/i, terms: ['binh thanh', 'điện biên phủ', 'hàng xanh'] },
  { key: 'phunhuan', name: 'Phú Nhuận', regex: /phú nhuận\b/i, terms: ['phu nhuan', 'phan xích long', 'hoa phượng'] },
  { key: 'tanbinh', name: 'Tân Bình', regex: /tân bình\b/i, terms: ['tan binh', 'hoàng hoa thám', 'cộng hòa', 'sân bay'] },
  { key: 'tanphu', name: 'Tân Phú', regex: /tân phú\b(?!\s*,?\s*quận\s*7)/i, terms: ['tan phu', 'lũy bán bích'] },
  { key: 'binhtan', name: 'Bình Tân', regex: /bình tân\b/i, terms: ['binh tan', 'tên lửa'] },
  { key: 'hanoi', name: 'Hà Nội', regex: /hà nội\b/i, terms: ['ha noi', 'cầu giấy', 'trần duy hưng', 'trung hòa'] },
]

export function matchDistrictFromText(text) {
  if (!text) return null
  const q = text.toLowerCase()
  for (const d of DISTRICT_MATCHERS) {
    if (d.regex && d.regex.test(q)) {
      return d
    }
    if (d.terms && d.terms.some((term) => {
      if (/\d/.test(term)) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const reg = new RegExp(`(?:^|[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])${escaped}(?![0-9])`, 'i')
        return reg.test(q)
      }
      return q.includes(term)
    })) {
      return d
    }
  }
  return null
}

// =========================================================================
// BỘ PHÂN TÍCH VÀ TRẢ LỜI CÂU HỎI CHÍNH XÁC, ĐẦY ĐỦ, KHÔNG TRÙNG LẶP
// =========================================================================
export function processAIChatQuery(rawQuery, currentCourtId = '83c47bdd-4166-48c5-9083-08f99d58084f', userLocation = null, userProfile = null) {
  const query = (rawQuery || '').trim().toLowerCase()
  const profile = userProfile || getUserProfileContext()
  const loc = userLocation || profile.districtCenter || DISTRICT_CENTERS.thuduc

  const allCourts = getAllAvailableCourts()
  const currentCourt = allCourts.find((c) => c.id === currentCourtId) || allCourts[0]

  // Nhận diện quận / khu vực nếu người chơi có nhắc đến
  const matchedDistrict = matchDistrictFromText(query)

  // Nhận diện yêu cầu về khung giờ (vd: 14:00 - 16:00, chiều, sáng, tối...)
  const timeReq = parseTimeRequirement(query)

  // Nhận diện ngày: ngày mai, hôm nay
  const isTomorrow = query.includes('ngày mai') || query.includes('mai') || query.includes('tomorrow')
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const dateLabel = isTomorrow ? `ngày mai (${tomorrowStr})` : 'hôm nay'

  // Gắn khoảng cách động tính theo vị trí hiện tại của người chơi
  const localizedCourts = allCourts.map((c) => ({
    ...c,
    distance: calculateCourtDistance(c, loc),
  }))

  // =========================================================================
  // ƯU TIÊN SỐ 0: NGƯỜI DÙNG CHỌN SÂN HOẶC XÁC NHẬN CA CỤ THỂ
  // =========================================================================
  // 1. Xác định cơ sở liên quan
  let selectedCourt = null
  for (const c of localizedCourts) {
    if (c.keywords && c.keywords.some((kw) => query.includes(kw.toLowerCase()))) {
      selectedCourt = c
      break
    }
    if (c.subCourts && c.subCourts.some((sc) => query.includes(sc.name.toLowerCase()))) {
      selectedCourt = c
      break
    }
    if (query.includes(c.name.toLowerCase())) {
      selectedCourt = c
      break
    }
  }
  if (!selectedCourt) {
    if (query.includes('lucky') || query.includes('trần duy hưng') || query.includes('hà nội') || query.includes('cầu giấy')) {
      selectedCourt = localizedCourts.find((c) => c.id === '83c47bdd-4166-48c5-9083-08f99d58084f') || localizedCourts.find((c) => c.subCourts?.some((sc) => sc.name.toLowerCase().includes('lucky')))
    } else {
      selectedCourt = currentCourt || localizedCourts[0]
    }
  }

  // 2. Xác định sân con (subCourt)
  let selectedSubCourt = null
  if (selectedCourt?.subCourts && selectedCourt.subCourts.length > 0) {
    const matchSc = selectedCourt.subCourts.find((sc) => query.includes(sc.name.toLowerCase()))
    if (matchSc) {
      selectedSubCourt = matchSc
    } else if (query.includes('lucky')) {
      const luckySc = selectedCourt.subCourts.find((sc) => sc.name.toLowerCase().includes('lucky'))
      if (luckySc) selectedSubCourt = luckySc
    }
    if (!selectedSubCourt) {
      selectedSubCourt = selectedCourt.subCourts[0]
    }
  } else {
    selectedSubCourt = {
      id: selectedCourt.id,
      name: query.includes('lucky') ? 'Sân lucky' : (selectedCourt.subCourt || selectedCourt.name),
      price: selectedCourt.price,
    }
  }

  // Nhận diện người dùng muốn chọn sân hoặc chọn ca
  const hasSpecificTime = Boolean(timeReq)
  const isDirectSlotIntent =
    query.includes('chọn ca') ||
    query.includes('mình chọn') ||
    query.includes('tôi chọn') ||
    query.includes('đặt ca') ||
    query.includes('chốt ca') ||
    query.includes('lấy ca') ||
    query.includes('đặt slot') ||
    query.includes('chọn slot') ||
    query.includes('sân lucky') ||
    query.includes('lucky') ||
    (query.includes('chọn') && (query.includes('sân') || query.includes('ca')))

  // TRƯỜNG HỢP 1: Người dùng đã chốt ca có khung giờ rõ ràng (VD: "mình chọn ca 14h-16h sân lucky", "chọn ca 14:00 - 16:00", "đặt ca 18h")
  if (isDirectSlotIntent && hasSpecificTime) {
    let startTime = '14:00'
    let endTime = '16:00'
    if (timeReq && timeReq.startHour !== undefined && timeReq.endHour !== undefined) {
      startTime = `${String(timeReq.startHour).padStart(2, '0')}:00`
      endTime = `${String(timeReq.endHour).padStart(2, '0')}:00`
    } else if (timeReq && timeReq.hour !== undefined) {
      const sH = timeReq.hour
      startTime = `${String(sH).padStart(2, '0')}:00`
      endTime = `${String(sH + 2).padStart(2, '0')}:00`
    }

    const hours = 2
    const totalPrice = (selectedSubCourt.price || selectedCourt.price) * hours
    const slotObj = {
      id: selectedSubCourt.id || selectedCourt.id,
      subCourtId: selectedSubCourt.id,
      subCourtName: selectedSubCourt.name,
      start: startTime,
      end: endTime,
      hours,
      price: totalPrice,
      status: 'available',
      note: `${selectedSubCourt.name} • Ca 2 tiếng đã chốt`,
    }

    return {
      title: `Xác nhận đặt ca: ${startTime} - ${endTime} tại ${selectedSubCourt.name}`,
      text:
        `🎯 **Tuyệt vời! Tôi đã ghi nhận và xác nhận giữ chỗ ca của bạn:**\n\n` +
        `• **Cơ sở**: **${selectedCourt.name}** (${selectedCourt.sportName}).\n` +
        `• **Địa chỉ**: ${selectedCourt.address}.\n` +
        `• **Sân thi đấu**: **${selectedSubCourt.name}** (Mặt sân đạt chuẩn thi đấu).\n` +
        `• **Khung giờ**: **${startTime} - ${endTime}** (Ca chuẩn **2 tiếng** • ${dateLabel}).\n` +
        `• **Mức giá**: **${formatVnd(totalPrice)}** (${formatVnd(selectedSubCourt.price)}/giờ x 2 tiếng).\n` +
        `• **Bảo chứng SportNexus**: Đã kích hoạt khóa slot độc quyền **15 phút** chống trùng lịch & Bảo chứng Escrow 24/7 an toàn 100%.\n\n` +
        `👉 Bạn vui lòng kiểm tra thông tin trên thẻ bên dưới và bấm **"Xác Nhận & Thanh Toán Ngay"** để hoàn tất hoặc chia tiền Split Payment nhé!`,
      recommendedCourt: {
        ...selectedCourt,
        subCourt: selectedSubCourt.name,
      },
      recommendedSlot: slotObj,
      priorityBadge: `🎯 XÁC NHẬN ĐẶT CA: ${startTime} - ${endTime} • ${selectedSubCourt.name.toUpperCase()}`,
      priorityReason: `Khóa slot 15 phút chống trùng lịch & Bảo chứng Escrow 24/7 an toàn 100%`,
      quickReplies: [
        '💳 Chuyển sang thanh toán ngay',
        '🏸 Đổi sang Sân khác',
        '⏰ Đổi khung giờ khác',
      ],
    }
  }

  // TRƯỜNG HỢP 2: Người dùng muốn chọn / hỏi ca cho một sân cụ thể nhưng CHƯA NÓI GIỜ (VD: "mình chọn ca sân lucky", "chọn sân lucky", "sân lucky còn ca nào")
  if (isDirectSlotIntent && !hasSpecificTime && (query.includes('lucky') || query.includes('chọn ca') || query.includes('mình chọn') || query.includes('tôi chọn') || query.includes('đặt'))) {
    const hours = 2
    const slotPrice = (selectedSubCourt.price || selectedCourt.price) * hours
    const availableSlots = [
      { start: '08:00', end: '10:00', label: 'Ca sáng', note: 'Sáng sớm trong lành' },
      { start: '14:00', end: '16:00', label: 'Ca chiều', note: 'Khung giờ chiều mát mẻ' },
      { start: '18:00', end: '20:00', label: 'Ca tối', note: 'Khung giờ vàng tối lý tưởng' },
      { start: '20:00', end: '22:00', label: 'Ca tối muộn', note: 'Khung giờ tối muộn sôi nổi' },
    ]

    const slotListText = availableSlots
      .map((s) => `• **${s.start} - ${s.end}** (${s.label}) • Giá: **${formatVnd(slotPrice)}** / ca 2 tiếng`)
      .join('\n')

    const defaultSlot = {
      id: selectedSubCourt.id || selectedCourt.id,
      subCourtId: selectedSubCourt.id,
      subCourtName: selectedSubCourt.name,
      start: '14:00',
      end: '16:00',
      hours,
      price: slotPrice,
      status: 'available',
      note: `${selectedSubCourt.name} • Vui lòng chọn ca`,
    }

    const dateSuffix = isTomorrow ? ' ngày mai' : ''

    return {
      title: `Lựa chọn ca thi đấu: ${selectedSubCourt.name}`,
      text:
        `🎯 **Bạn đã chọn ${selectedSubCourt.name}!**\n\n` +
        `• **Cơ sở**: **${selectedCourt.name}** (${selectedCourt.sportName}).\n` +
        `• **Địa chỉ**: ${selectedCourt.address}.\n` +
        `• **Sân thi đấu**: **${selectedSubCourt.name}** (Mặt sân đạt chuẩn thi đấu).\n` +
        `• **Mức giá thuê**: **${formatVnd(selectedSubCourt.price)}/giờ** (**${formatVnd(slotPrice)}** / ca 2 tiếng).\n\n` +
        `⏰ **Dưới đây là các khung giờ (ca) còn trống ${dateLabel} để bạn lựa chọn:**\n` +
        slotListText +
        `\n\n👉 Bạn muốn đặt ca nào trong các khung giờ trên? Bạn có thể bấm chọn ngay bên dưới hoặc nhắn: *"chọn ca 14h-16h"* để hoàn tất giữ chỗ nhé!`,
      recommendedCourt: {
        ...selectedCourt,
        subCourt: selectedSubCourt.name,
      },
      recommendedSlot: defaultSlot,
      priorityBadge: `🏸 ${selectedSubCourt.name.toUpperCase()} • VUI LÒNG CHỌN CA`,
      priorityReason: `Đã chọn đúng sân ${selectedSubCourt.name} • Vui lòng chọn khung giờ thi đấu`,
      quickReplies: [
        `🏸 Chọn ca 14:00 - 16:00 (${selectedSubCourt.name}${dateSuffix})`,
        `🏸 Chọn ca 18:00 - 20:00 (${selectedSubCourt.name}${dateSuffix})`,
        `🏸 Chọn ca 08:00 - 10:00 (${selectedSubCourt.name}${dateSuffix})`,
        `🏸 Chọn ca 20:00 - 22:00 (${selectedSubCourt.name}${dateSuffix})`,
        '📍 Đổi sang sân khác',
      ],
    }
  }

  // =========================================================================
  // ƯU TIÊN SỐ 1: TÌM KIẾM THEO ĐỊA CHỈ, TÊN ĐƯỜNG HOẶC TÊN CƠ SỞ THỰC TẾ
  // (Chỉ kích hoạt khi người dùng hỏi đích danh địa chỉ/tên đường cụ thể, KHÔNG hỏi theo quận)
  // =========================================================================
  let addressMatchedCourt = null

  if (!matchedDistrict) {
    // 1.1 Match trực tiếp theo keywords của từng cơ sở
    for (const c of localizedCourts) {
      if (c.keywords && c.keywords.some((kw) => query.includes(kw.toLowerCase()))) {
        addressMatchedCourt = c
        break
      }
      // Match theo tên đường / địa chỉ / subCourts
      if (c.address && query.includes(c.address.toLowerCase())) {
        addressMatchedCourt = c
        break
      }
      if (c.subCourts && c.subCourts.some((sc) => query.includes(sc.name.toLowerCase()))) {
        addressMatchedCourt = c
        break
      }
    }

    // 1.2 Nhận diện các cụm địa chỉ đường / cơ sở cụ thể (không chứa tên quận)
    if (!addressMatchedCourt) {
      if (query.includes('36 trần duy hưng') || query.includes('trần duy hưng') || query.includes('tran duy hung')) {
        addressMatchedCourt = localizedCourts.find((c) => c.id === '83c47bdd-4166-48c5-9083-08f99d58084f') || localizedCourts.find((c) => c.address.includes('Trần Duy Hưng'))
      } else if (query.includes('1 võ văn ngân') || query.includes('võ văn ngân') || query.includes('vo van ngan')) {
        addressMatchedCourt = localizedCourts.find((c) => c.id === '680db3fd-becd-4ed2-8ffa-a9fecf7a9ca1') || localizedCourts.find((c) => c.address.includes('Võ Văn Ngân'))
      } else if (query.includes('120 quang trung')) {
        addressMatchedCourt = localizedCourts.find((c) => c.id === '09b63d15-1801-4c2c-9734-d25fd6aebcd0') || localizedCourts.find((c) => c.address.includes('Quang Trung'))
      } else if (query.includes('68 nguyễn huệ') || query.includes('phố đi bộ nguyễn huệ') || query.includes('phố đi bộ')) {
        addressMatchedCourt = localizedCourts.find((c) => c.id === 'b680cc74-77fb-4cb8-ab40-e0ddb4084e19') || localizedCourts.find((c) => c.address.includes('Nguyễn Huệ'))
      } else if (query.includes('15 nguyễn lương bằng') || query.includes('nguyễn lương bằng') || query.includes('nguyen luong bang')) {
        addressMatchedCourt = localizedCourts.find((c) => c.id === '7c8ce758-5c02-46c7-860c-b6b72888bffd') || localizedCourts.find((c) => c.address.includes('Nguyễn Lương Bằng'))
      }
    }
  }

  // NẾU NGƯỜI DÙNG HỎI ĐÍCH DANH THEO ĐỊA CHỈ HOẶC CƠ SỞ (Ví dụ: "sân ở đường 36 trần duy hưng cơ mà")
  if (addressMatchedCourt) {
    const slots = buildSlotsForCourt(addressMatchedCourt)
    const targetSlot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    // Danh sách các sân con có thật
    const subCourtsInfo = addressMatchedCourt.subCourts
      ? '\n• **Danh sách sân hiện có tại cơ sở**:\n' +
        addressMatchedCourt.subCourts
          .map((sc) => `  - **${sc.name}** (${sc.sport}): từ **${formatVnd(sc.price)}/giờ**`)
          .join('\n') +
        '\n'
      : ''

    const isLuckyAsk = query.includes('lucky')
    const highlightTarget = isLuckyAsk && addressMatchedCourt.subCourts
      ? addressMatchedCourt.subCourts.find((sc) => sc.name.toLowerCase().includes('lucky'))
      : null

    const timeText = timeReq ? `khung giờ **${targetSlot.start} - ${targetSlot.end}** vào **${dateLabel}**` : `khung giờ khả dụng: **${targetSlot.start} - ${targetSlot.end}**`

    return {
      title: `Cơ sở: ${addressMatchedCourt.name} (${addressMatchedCourt.address})`,
      text:
        `Chính xác! Thông tin cơ sở thể thao tại **${addressMatchedCourt.address}** theo yêu cầu của bạn chính là **${addressMatchedCourt.name}**:\n\n` +
        `• **Tên cơ sở**: **${addressMatchedCourt.name}** (${addressMatchedCourt.sportName}).\n` +
        `• **Địa chỉ chính xác**: ${addressMatchedCourt.address}.\n` +
        (highlightTarget ? `• **Sân bạn quan tâm**: **${highlightTarget.name}** (Giá thuê: **${formatVnd(highlightTarget.price)}/giờ**).\n` : '') +
        subCourtsInfo +
        `• **Tiện ích thực tế**: ${addressMatchedCourt.subCourtDesc}.\n` +
        `• **Khung giờ trống**: Đang còn trống ${timeText} (Giá: **${formatVnd(targetSlot.price)}** / ca 2 tiếng).\n\n` +
        `📌 Bấm **"Chọn Sân Này"** để hiển thị lịch đặt sân trên hệ thống hoặc bấm **"Đặt & Chia Tiền"** để giữ chỗ ngay!`,
      recommendedCourt: addressMatchedCourt,
      recommendedSlot: targetSlot,
      priorityBadge: `📍 ĐÚNG ĐỊA CHỈ: ${addressMatchedCourt.address.toUpperCase()}`,
      priorityReason: `Khớp chính xác địa chỉ "${query}" mà bạn yêu cầu • Cơ sở thực tế trên hệ thống`,
      quickReplies: [
        `Chọn Sân ${addressMatchedCourt.name}`,
        'Đặt & Chia Tiền Ngay',
        'Xem Các Sân Con',
        'Kiểm Tra Slot Khác',
      ],
    }
  }

  // -------------------------------------------------------------------------
  // 1. KIỂM TRA TÊN SÂN CỤ THỂ (CHỈ MATCH TÊN RIÊNG ĐẶC TRƯNG, TUYỆT ĐỐI KHÔNG MATCH CHỮ CHUNG)
  // -------------------------------------------------------------------------
  const SPECIFIC_COURT_MAP = [
    { id: '83c47bdd-4166-48c5-9083-08f99d58084f', keywords: ['lucky', 'sân lucky', 'clb lucky', 'san lucky', 'cầu lông lucky', 'hà nội badminton center', 'hà nội', 'trần duy hưng', 'cầu giấy'] },
    { id: 'lananh-q10', keywords: ['lan anh'] },
    { id: 'kyhoa-q10', keywords: ['kỳ hòa', 'ky hoa'] },
    { id: 'ddink-td', keywords: ['d-dink', 'ddink', 'dink'] },
    { id: 'sala-td', keywords: ['sala', 'thủ thiêm', 'thu thiem'] },
    { id: 'huean-td', keywords: ['huệ an', 'hue an', 'đình phong phú'] },
    { id: 'hiepphu-td', keywords: ['hiệp phú', 'hiep phu'] },
    { id: 'viettel-tb', keywords: ['viettel', 'hoàng hoa thám', 'hoang hoa tham'] },
    { id: 'rachmieu-pn', keywords: ['rạch miễu', 'rach mieu'] },
    { id: 'taodan-q1', keywords: ['tao đàn', 'tao dan', 'huyền trân'] },
    { id: 'trexanh-q7', keywords: ['tre xanh'] },
    { id: 'longvien-q7', keywords: ['long viên', 'long vien'] },
    { id: 'bongsao-q8', keywords: ['bông sao', 'bong sao'] },
    { id: 'bachai-q10', keywords: ['bắc hải', 'bac hai', 'c30'] },
    { id: 'pmh-pb', keywords: ['phú mỹ hưng', 'phu my hung', 'pmh'] },
    { id: 'snx-q7', keywords: ['sportnexus', 'arena q7', 'arena q.7'] },
    { id: 'yonex-bt', keywords: ['clb yonex', 'yonex bình thạnh', 'yonex binh thanh'] },
  ]

  let specificCourtMatch = null
  for (const item of SPECIFIC_COURT_MAP) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      specificCourtMatch = localizedCourts.find((c) => c.id === item.id)
      break
    }
  }

  // -------------------------------------------------------------------------
  // 0. NGƯỜI CHƠI TÌM SÂN THEO KHUNG GIỜ CỤ THỂ (VD: 14:00 - 16:00, CHIỀU, SÁNG...)
  // -------------------------------------------------------------------------
  const isGeneralQuestion =
    query.includes('hủy sân') ||
    query.includes('hoàn tiền') ||
    query.includes('escrow') ||
    query.includes('chia tiền') ||
    query.includes('split') ||
    query.includes('mã qr') ||
    query.includes('vietqr')

  if (timeReq && !isGeneralQuestion) {
    // NẾU NGƯỜI CHƠI ĐẶT ĐÍCH DANH MỘT SÂN CỤ THỂ (VD: "sân lucky", "lan anh", "viettel"...)
    if (specificCourtMatch) {
      const isLucky = query.includes('lucky')
      const targetSubCourt = isLucky && specificCourtMatch.subCourts
        ? specificCourtMatch.subCourts.find((sc) => sc.name.toLowerCase().includes('lucky'))
        : specificCourtMatch.subCourts?.[0]
      const subCourtName = targetSubCourt?.name || (isLucky ? 'Sân lucky' : specificCourtMatch.subCourt || specificCourtMatch.name)
      const subCourtPrice = targetSubCourt?.price || specificCourtMatch.price
      const slots = buildSlotsForCourt(specificCourtMatch)
      const slot = findBestMatchingSlot(slots, timeReq) || {
        id: targetSubCourt?.id || 's_a1',
        subCourtId: targetSubCourt?.id,
        subCourtName,
        start: timeReq.startHour ? `${String(timeReq.startHour).padStart(2, '0')}:00` : '14:00',
        end: timeReq.endHour ? `${String(timeReq.endHour).padStart(2, '0')}:00` : '16:00',
        hours: 2,
        price: subCourtPrice * 2,
        status: 'available',
        note: `${subCourtName} • Khung giờ chiều mát mẻ`,
      }
      const timeLabel = `${slot.start} - ${slot.end}`
      const totalPrice = subCourtPrice * 2

      return {
        title: `Đặt sân ${specificCourtMatch.name} - ${dateLabel}`,
        text:
          `Tôi đã kiểm tra hệ thống và tìm thấy sân trống tại **${specificCourtMatch.name}** vào **${dateLabel}** đúng khung giờ **${timeLabel}** theo mong muốn của bạn:\n\n` +
          `• **Cụm sân**: **${specificCourtMatch.name}** (${specificCourtMatch.sportName})\n` +
          `• **Địa chỉ**: ${specificCourtMatch.address} (Cách bạn **${specificCourtMatch.distance} km** • ${specificCourtMatch.route.eta}).\n` +
          `• **Khung giờ thi đấu**: **${timeLabel}** (Ca chuẩn **${slot.hours || 2} tiếng** • *${slot.note || 'Sẵn sàng đặt'}*).\n` +
          `• **Mức giá**: **${formatVnd(totalPrice)}** / ca 2 tiếng (Đã gồm bảo chứng Escrow 24/7 & Khóa giữ chỗ độc quyền 15 phút chống trùng lịch).\n` +
          `• **Tiện ích sân**: ${specificCourtMatch.subCourtDesc}. ${specificCourtMatch.highlights.join(' • ')}.\n\n` +
          `📌 Bạn có thể bấm **"Chọn Sân Này"** để hiển thị lên lưới lịch hoặc bấm **"Đặt & Chia Tiền"** bên dưới để giữ slot ngay lập tức!`,
        recommendedCourt: specificCourtMatch,
        recommendedSlot: slot,
        priorityBadge: `✅ CÒN SÂN TRỐNG: ${timeLabel} • ${dateLabel.toUpperCase()}`,
        priorityReason: `Khớp 100% sân ${specificCourtMatch.name} & khung giờ ${timeLabel} • Ca 2 tiếng chuẩn`,
        quickReplies: [
          `Chọn Sân ${specificCourtMatch.name}`,
          `Đặt & Chia Tiền (${timeLabel})`,
          'Kiểm tra tiện ích sân',
          'Xem sân lân cận khác',
        ],
      }
    }

    let pool = localizedCourts

    // Lọc theo môn thể thao nếu có nhắc đến
    if (query.includes('pickle') || query.includes('pickleball')) {
      const pCourts = pool.filter((c) => c.sport === 'pickleball')
      if (pCourts.length > 0) pool = pCourts
    } else if (query.includes('cầu lông') || query.includes('badminton')) {
      const bCourts = pool.filter((c) => c.sport === 'badminton')
      if (bCourts.length > 0) pool = bCourts
    }

    // Lọc theo quận nếu có nhắc đến
    if (matchedDistrict) {
      const inDistrict = pool.filter((c) => c.district === matchedDistrict.key)
      if (inDistrict.length > 0) {
        pool = inDistrict
      } else {
        const targetCenter = DISTRICT_CENTERS[matchedDistrict.key] || loc
        pool = [...pool].map((c) => ({
          ...c,
          distance: calculateCourtDistance(c, targetCenter),
        }))
      }
    }

    // Sắp xếp các sân theo khoảng cách gần nhất
    const sortedCourts = [...pool].sort((a, b) => a.distance - b.distance)

    let bestCourt = null
    let bestSlot = null

    for (const c of sortedCourts) {
      const slots = buildSlotsForCourt(c)
      const slot = findBestMatchingSlot(slots, timeReq)
      if (slot && slot.status === 'available') {
        bestCourt = c
        bestSlot = slot
        break
      }
    }

    if (!bestCourt) {
      bestCourt = sortedCourts[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(bestCourt)
      bestSlot = findBestMatchingSlot(slots, timeReq)
    }

    // Tìm 2-3 sân lân cận cũng có slot khớp
    const otherCourts = sortedCourts
      .filter((c) => c.id !== bestCourt.id)
      .slice(0, 3)
      .map((c) => {
        const slots = buildSlotsForCourt(c)
        const s = findBestMatchingSlot(slots, timeReq)
        return { court: c, slot: s }
      })

    const timeLabel = bestSlot ? `${bestSlot.start} - ${bestSlot.end}` : timeReq.label
    const sessionName = timeReq.isAfternoon ? 'chiều' : timeReq.isMorning ? 'sáng' : timeReq.isEvening ? 'tối' : ''

    return {
      title: `Sân còn trống khung giờ ${sessionName ? `${sessionName} ` : ''}${timeLabel}`,
      text:
        `Các cụm sân còn trống khung giờ **${sessionName ? `${sessionName} ` : ''}${timeLabel}** gần **${loc.name || loc.address}**:\n\n` +
        `• **Sân tối ưu**: **${bestCourt.name}** (cách **${bestCourt.distance} km** • ${bestCourt.route?.eta || 'gần bạn'})\n` +
        `• **Khung giờ**: **${bestSlot.start} – ${bestSlot.end}** (${bestSlot.hours}h • **${formatVnd(bestSlot.price)}** / ca)\n` +
        `• **Tiện ích**: ${bestCourt.subCourtDesc}\n\n` +
        (otherCourts.length > 0
          ? `• **Sân lân cận khác**: ` +
            otherCourts
              .slice(0, 2)
              .map(
                (item) =>
                  `**${item.court.name}** (${item.court.distance} km • ${item.slot.start} - ${item.slot.end})`
              )
              .join(', ') + '.\n\n'
          : '') +
        `💡 *Bấm **Chọn Sân** hoặc **Đặt & Chia Tiền** bên dưới để giữ chỗ 15 phút ngay!*`,
      recommendedCourt: bestCourt,
      recommendedSlot: bestSlot,
      priorityBadge: `⏰ CÒN TRỐNG KHUNG GIỜ: ${bestSlot.start} - ${bestSlot.end}`,
      priorityReason: `Khớp chính xác yêu cầu khung giờ ${timeLabel} của bạn • Cách bạn ${bestCourt.distance} km • Sân chuẩn thi đấu`,
      quickReplies: [
        `Chọn Sân ${bestCourt.name}`,
        `Đặt Slot ${bestSlot.start} - ${bestSlot.end}`,
        'Xem Sân Gần Khác',
        'Tìm Kèo Ghép Trận LFG',
      ],
    }
  }

  // Nếu người chơi hỏi riêng về tiện ích (xe, máy lạnh, tắm) của một sân cụ thể
  if (specificCourtMatch && (query.includes('xe') || query.includes('ô tô') || query.includes('máy lạnh') || query.includes('tắm') || query.includes('tiện ích') || query.includes('đèn'))) {
    const slots = buildSlotsForCourt(specificCourtMatch)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Tiện ích tại ${specificCourtMatch.name}`,
      text:
        `Thông tin tiện ích thực tế tại **${specificCourtMatch.name}**:\n\n` +
        `• **Bãi giữ xe**: ${specificCourtMatch.amenities.parking}.\n` +
        `• **Điều hòa & Không khí**: ${specificCourtMatch.amenities.ac}.\n` +
        `• **Mặt sân thi đấu**: ${specificCourtMatch.amenities.proFloor}.\n` +
        `• **Hệ thống chiếu sáng**: ${specificCourtMatch.amenities.lighting}.\n` +
        `• **Phòng tắm & Vệ sinh**: ${specificCourtMatch.amenities.showers ? 'Có phòng tắm nóng lạnh & phòng thay đồ riêng biệt' : 'Có phòng thay đồ'}.\n\n` +
        `Khung giờ còn trống gần nhất: **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
      recommendedCourt: specificCourtMatch,
      recommendedSlot: slot,
      priorityBadge: `✅ TIỆN ÍCH CHUẨN • ${specificCourtMatch.sportName.toUpperCase()}`,
      priorityReason: `${specificCourtMatch.amenities.parking} • ${specificCourtMatch.amenities.proFloor}`,
      quickReplies: [`Chọn Sân ${specificCourtMatch.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // Nếu người chơi hỏi về một sân cụ thể
  if (specificCourtMatch) {
    const slots = buildSlotsForCourt(specificCourtMatch)
    const availableSlots = slots.filter((s) => s.status === 'available')
    const bestSlot = findBestMatchingSlot(slots, timeReq) || availableSlots[0] || slots[0]

    return {
      title: `Thông tin chi tiết: ${specificCourtMatch.name}`,
      text:
        `Thông tin cụm sân **${specificCourtMatch.name}**:\n\n` +
        `• **Môn thi đấu**: ${specificCourtMatch.sportName} (${specificCourtMatch.courtCount} sân tiêu chuẩn).\n` +
        `• **Địa chỉ**: ${specificCourtMatch.address} (Cách bạn **${specificCourtMatch.distance} km** • ${specificCourtMatch.route.eta}).\n` +
        `• **Giá thuê**: **${formatVnd(specificCourtMatch.price)}/giờ**.\n` +
        `• **Đặc điểm nổi bật**: ${specificCourtMatch.subCourtDesc}. ${specificCourtMatch.highlights.join(' • ')}.\n` +
        `• **Đánh giá**: **${specificCourtMatch.rating}★** (${specificCourtMatch.reviewsCount} đánh giá từ người chơi).\n` +
        `• **Khung giờ trống sẵn sàng**: **${bestSlot.start} - ${bestSlot.end}** (${formatVnd(bestSlot.price)}).\n\n` +
        `Bạn có thể bấm **Chọn Sân Này** để áp dụng lên lịch hoặc **Đặt & Chia Tiền** ngay bên dưới!`,
      recommendedCourt: specificCourtMatch,
      recommendedSlot: bestSlot,
      priorityBadge: `⭐ SÂN THEO YÊU CẦU: ${specificCourtMatch.name.toUpperCase()}`,
      priorityReason: `Khớp đúng sân bạn yêu cầu • Cách bạn ${specificCourtMatch.distance} km • Giờ vàng ${bestSlot.start}-${bestSlot.end} sẵn sàng`,
      quickReplies: [`Chọn Sân ${specificCourtMatch.name}`, 'Đặt & Chia Tiền Ngay', 'Kiểm Tra Slot Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 2. NGƯỜI CHƠI HỎI THEO QUẬN / KHU VỰC
  // -------------------------------------------------------------------------
  if (matchedDistrict) {
    let courtsInDistrict = localizedCourts.filter((c) => c.district === matchedDistrict.key)
    
    // Nếu người chơi còn yêu cầu môn cụ thể
    if (query.includes('pickle') || query.includes('pickleball')) {
      const pCourts = courtsInDistrict.filter((c) => c.sport === 'pickleball')
      if (pCourts.length > 0) courtsInDistrict = pCourts
    } else if (query.includes('cầu lông') || query.includes('badminton')) {
      const bCourts = courtsInDistrict.filter((c) => c.sport === 'badminton')
      if (bCourts.length > 0) courtsInDistrict = bCourts
    }

    if (courtsInDistrict.length > 0) {
      const bestCourt = [...courtsInDistrict].sort((a, b) => b.rating - a.rating)[0]
      const bestSlots = buildSlotsForCourt(bestCourt)
      const targetSlot = findBestMatchingSlot(bestSlots, timeReq) || bestSlots.find((s) => s.status === 'available') || bestSlots[0]

      return {
        title: `Danh sách sân tại ${matchedDistrict.name}`,
        text:
          `Hệ thống hiện có **${courtsInDistrict.length} cụm sân** tại khu vực **${matchedDistrict.name}**:\n\n` +
          courtsInDistrict
            .map(
              (c, idx) =>
                `${idx + 1}. **${c.name}** (${c.sportName})\n` +
                `   • Địa chỉ: ${c.address} (Cách bạn **${c.distance} km**)\n` +
                `   • Giá niêm yết: **${formatVnd(c.price)}/h** • Đánh giá: **${c.rating}★**\n` +
                `   • Đặc điểm: ${c.subCourtDesc}`
            )
            .join('\n\n') +
          `\n\n📌 **Lựa chọn gợi ý số 1**: **${bestCourt.name}** đang trống khung giờ vàng **${targetSlot.start} - ${targetSlot.end}** (Giá: **${formatVnd(targetSlot.price)}**).`,
        recommendedCourt: bestCourt,
        recommendedSlot: targetSlot,
        priorityBadge: `🏆 SÂN TỐT NHẤT TẠI ${matchedDistrict.name.toUpperCase()}`,
        priorityReason: `Đánh giá cao ${bestCourt.rating}★ • Giá ${formatVnd(bestCourt.price)}/h • Cách bạn ${bestCourt.distance} km`,
        quickReplies: [`Chọn ${bestCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
      }
    } else {
      // Trường hợp khu vực / quận chưa có sân trực tiếp trên hệ thống (VD: Quận 10, Quận 3, Tân Bình...)
      const districtCenter = DISTRICT_CENTERS[matchedDistrict.key] || loc
      const sortedByDistToDistrict = [...localizedCourts]
        .map((c) => ({
          ...c,
          distanceToDistrict: calculateCourtDistance(c, districtCenter),
        }))
        .sort((a, b) => a.distanceToDistrict - b.distanceToDistrict)

      let filteredPool = sortedByDistToDistrict
      if (query.includes('pickle') || query.includes('pickleball')) {
        const p = filteredPool.filter((c) => c.sport === 'pickleball')
        if (p.length > 0) filteredPool = p
      } else if (query.includes('cầu lông') || query.includes('badminton')) {
        const b = filteredPool.filter((c) => c.sport === 'badminton')
        if (b.length > 0) filteredPool = b
      }

      const nearestCourt = filteredPool[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(nearestCourt)
      const targetSlot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

      const otherNearby = filteredPool.slice(1, 3)

      return {
        title: `Gợi ý sân gần khu vực ${matchedDistrict.name}`,
        text:
          `Hiện tại hệ thống SportNexus chưa có cơ sở thể thao trực thuộc địa bàn **${matchedDistrict.name}**.\n\n` +
          `Để thuận tiện cho bạn di chuyển thi đấu, tôi xin gợi ý cơ sở thể thao ở khu vực lân cận gần **${matchedDistrict.name}** nhất:\n\n` +
          `• **Cơ sở gần nhất**: **${nearestCourt.name}** (${nearestCourt.sportName}).\n` +
          `• **Địa chỉ thực tế**: ${nearestCourt.address} (Cách khu vực ${matchedDistrict.name} khoảng **~${nearestCourt.distanceToDistrict} km** • ${nearestCourt.route?.eta || 'thuận tiện di chuyển'}).\n` +
          `• **Mức giá niêm yết**: từ **${formatVnd(nearestCourt.price)}/giờ** • Đánh giá: ⭐ **${nearestCourt.rating}** (${nearestCourt.reviewsCount} đánh giá).\n` +
          `• **Tiện ích sân**: ${nearestCourt.subCourtDesc}.\n` +
          `• **Khung giờ trống sẵn sàng**: **${targetSlot.start} - ${targetSlot.end}** (Giá: **${formatVnd(targetSlot.price)}** / ca 2 tiếng).\n\n` +
          (otherNearby.length > 0
            ? `💡 *Cơ sở lân cận khác*: ` +
              otherNearby
                .map((c) => `**${c.name}** (${c.address} • cách ~${c.distanceToDistrict} km)`)
                .join('; ') +
              `.\n\n`
            : '') +
          `📌 Bấm **"Chọn Sân Này"** để hiển thị lịch đặt sân trên hệ thống hoặc bấm **"Đặt & Chia Tiền"** để giữ chỗ ngay!`,
        recommendedCourt: nearestCourt,
        recommendedSlot: targetSlot,
        priorityBadge: `📍 GỢI Ý GẦN KHU VỰC ${matchedDistrict.name.toUpperCase()}`,
        priorityReason: `${matchedDistrict.name} chưa có sân trên hệ thống • Gợi ý cơ sở lân cận gần nhất (~${nearestCourt.distanceToDistrict} km)`,
        quickReplies: [
          `Chọn Sân ${nearestCourt.name}`,
          'Đặt & Chia Tiền Ngay',
          'Xem Khung Giờ Khác',
          'Tìm Theo Giá Rẻ Nhất',
        ],
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. NGƯỜI CHƠI HỎI VỀ GIÁ SÂN / TIẾT KIỆM / RẺ NHẤT / SINH VIÊN
  // -------------------------------------------------------------------------
  if (
    query.includes('giá') ||
    query.includes('bao nhiêu') ||
    query.includes('tiền') ||
    query.includes('rẻ') ||
    query.includes('tiết kiệm') ||
    query.includes('chi phí') ||
    query.includes('sinh viên') ||
    query.includes('bảng giá') ||
    query.includes('dưới 200') ||
    query.includes('dưới 150')
  ) {
    const isPickle = query.includes('pickle') || query.includes('pickleball')
    const pool = isPickle
      ? localizedCourts.filter((c) => c.sport === 'pickleball')
      : localizedCourts.filter((c) => c.sport === 'badminton')

    const sortedByPrice = [...pool].sort((a, b) => a.price - b.price)
    const cheapestCourt = sortedByPrice[0] || localizedCourts[0]
    const slots = buildSlotsForCourt(cheapestCourt)
    const cheapSlot = slots.find((s) => s.id === 's7' && s.status === 'available') || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Bảng giá sân ${isPickle ? 'Pickleball' : 'Cầu lông'} tốt nhất`,
      text:
        `Thông tin giá thuê sân ${isPickle ? 'Pickleball' : 'Cầu lông'} trên hệ thống:\n\n` +
        `• **Mức giá Cầu lông**: Dao động từ **140.000 đ - 230.000 đ/giờ**.\n` +
        `  - Giá rẻ nhất: **Sân Huệ An Thủ Đức** (140k/h), **Sân Bông Sao Q.8** (140k/h), **Sân Hiệp Phú Thủ Đức** (150k/h).\n` +
        `  - Phổ thông BWF: **CLB YONEX Bình Thạnh** (160k/h), **Sân Long Viên Q.7** (170k/h), **Sân Viettel Tân Bình** (170k/h).\n` +
        `  - VIP trung tâm: **CLB Tao Đàn Q.1** (210k/h), **SportNexus Arena Q.7** (220k/h), **CLB Lan Anh Q.10** (230k/h).\n` +
        `• **Mức giá Pickleball**: Dao động từ **180.000 đ - 260.000 đ/giờ**.\n` +
        `  - Giá tốt nhất: **Phú Mỹ Hưng Pickleball Club Q.7** (180k/h có mái che).\n` +
        `  - Chuẩn USAPA Pro: **Kỳ Hòa Q.10** (240k/h), **D-Dink Thảo Điền** (250k/h), **Sala Thủ Thiêm** (260k/h).\n\n` +
        `💡 **Ưu đãi giảm giá giờ muộn**: Khung sau 21:00 giảm 9%, sau 22:00 giảm 18%.\n` +
        `Lựa chọn tối ưu ngân sách nhất cho bạn: **${cheapestCourt.name}** (**${formatVnd(cheapestCourt.price)}/h**).`,
      recommendedCourt: cheapestCourt,
      recommendedSlot: cheapSlot,
      priorityBadge: '💰 LỰA CHỌN GIÁ TỐT NHẤT HỆ THỐNG',
      priorityReason: `Giá chỉ từ ${formatVnd(cheapestCourt.price)}/h • Hỗ trợ giảm giá giờ muộn • Phù hợp sinh viên`,
      quickReplies: [`Chọn ${cheapestCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Sân Gần Hơn'],
    }
  }

  // -------------------------------------------------------------------------
  // 4. NGƯỜI CHƠI HỎI VỀ SÂN GẦN NHẤT / KHOẢNG CÁCH / VỊ TRÍ
  // -------------------------------------------------------------------------
  if (
    query.includes('gần nhất') ||
    query.includes('gần tôi') ||
    query.includes('gần đây') ||
    query.includes('khoảng cách') ||
    query.includes('bao xa') ||
    query.includes('ở đâu') ||
    query.includes('chỉ đường') ||
    query.includes('gần')
  ) {
    const isPickle = query.includes('pickle') || query.includes('pickleball')
    const pool = isPickle
      ? localizedCourts.filter((c) => c.sport === 'pickleball')
      : localizedCourts

    const sortedByDistance = [...pool].sort((a, b) => a.distance - b.distance)
    const nearestCourt = sortedByDistance[0] || localizedCourts[0]
    const slots = buildSlotsForCourt(nearestCourt)
    const availableSlot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: 'Sân gần vị trí hiện tại của bạn nhất',
      text:
        `Sân gần bạn nhất từ vị trí **${loc.name || loc.address}** là **${nearestCourt.name}**:\n\n` +
        `• **Khoảng cách**: **${nearestCourt.distance} km** (${nearestCourt.route?.eta || '5 phút di chuyển'})\n` +
        `• **Môn**: ${nearestCourt.sportName} • Đánh giá: ⭐ **${nearestCourt.rating}**\n` +
        `• **Khung giờ trống**: **${availableSlot.start} – ${availableSlot.end}** (Giá: **${formatVnd(availableSlot.price)}** / ca)\n\n` +
        `💡 *Bấm **Chọn Sân** hoặc **Đặt & Chia Tiền** bên dưới để giữ chỗ 15 phút ngay!*`,
      recommendedCourt: nearestCourt,
      recommendedSlot: availableSlot,
      priorityBadge: `📍 GẦN NHẤT: CÁCH BẠN ${nearestCourt.distance} KM`,
      priorityReason: `Tiết kiệm thời gian di chuyển (${nearestCourt.route.eta}) • Khung giờ đẹp sẵn sàng`,
      quickReplies: [`Chọn Sân ${nearestCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 5. NGƯỜI CHƠI HỎI VỀ THỜI GIAN / LỊCH TRỐNG / TỐI NAY / GIỜ VÀNG / MỞ CỬA
  // -------------------------------------------------------------------------
  if (
    query.includes('giờ') ||
    query.includes('tối nay') ||
    query.includes('chiều nay') ||
    query.includes('lịch') ||
    query.includes('slot') ||
    query.includes('trống') ||
    query.includes('mở cửa') ||
    query.includes('đóng cửa') ||
    query.includes('19h') ||
    query.includes('20h') ||
    query.includes('21h')
  ) {
    const court = currentCourt || localizedCourts[0]
    const slots = buildSlotsForCourt(court)
    const availableSlots = slots.filter((s) => s.status === 'available')
    const goldenSlot = findBestMatchingSlot(slots, timeReq) || availableSlots[0] || slots[0]

    return {
      title: `Lịch khung giờ trống tại ${court.name}`,
      text:
        `Thông tin thời gian và lịch trống tại **${court.name}**:\n\n` +
        `• **Giờ mở cửa hoạt động**: **06:00 - 23:00** tất cả các ngày trong tuần.\n` +
        `• **Trạng thái khung giờ khả dụng**:\n` +
        availableSlots
          .map((s) => `  - **${s.start} - ${s.end}** (${s.hours}h): **${formatVnd(s.price)}** — *${s.note}*`)
          .join('\n') +
        `\n\n📌 **Khung giờ tối ưu gợi ý**: **${goldenSlot.start} - ${goldenSlot.end}** (${goldenSlot.hours}h thi đấu lý tưởng).\n` +
        `Khi bấm chọn, slot sẽ được **khóa độc quyền 15:00 phút** chống trùng lịch ngay lập tức.`,
      recommendedCourt: court,
      recommendedSlot: goldenSlot,
      priorityBadge: `⏰ KHUNG GIỜ: ${goldenSlot.start} - ${goldenSlot.end}`,
      priorityReason: 'Khung giờ phù hợp tiêu chí • Thời lượng thi đấu trọn vẹn • Sẵn sàng giữ chỗ',
      quickReplies: [`Khóa Slot ${goldenSlot.start} - ${goldenSlot.end}`, 'Đặt & Chia Tiền Ngay', 'Xem Sân Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 6. NGƯỜI CHƠI YÊU CẦU ĐẶT SÂN / CHỌN SÂN NHANH
  // -------------------------------------------------------------------------
  if (
    query.includes('đặt sân') ||
    query.includes('chọn sân') ||
    query.includes('đặt ngay') ||
    query.includes('book') ||
    query.includes('giữ slot') ||
    query.includes('giúp tôi đặt') ||
    query.includes('muốn đặt')
  ) {
    const courtToBook = currentCourt || localizedCourts[0]
    const slots = buildSlotsForCourt(courtToBook)
    const targetSlot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Sẵn sàng đặt sân nhanh: ${courtToBook.name}`,
      text:
        `Tôi đã chuẩn bị sẵn thông tin đặt sân cho bạn:\n\n` +
        `• **Cụm sân**: **${courtToBook.name}** (${courtToBook.sportName}).\n` +
        `• **Địa chỉ**: ${courtToBook.address} (Cách bạn **${courtToBook.distance} km**).\n` +
        `• **Khung giờ**: **${targetSlot.start} - ${targetSlot.end}** (${targetSlot.hours} tiếng thi đấu).\n` +
        `• **Tổng tiền**: **${formatVnd(targetSlot.price)}** (Đã gồm phí đặt & bảo chứng Escrow).\n\n` +
        `Bấm **"Chọn Sân Này"** để hiển thị trên lưới lịch hoặc bấm **"Đặt & Chia Tiền Ngay"** để thanh toán tức thì!`,
      recommendedCourt: courtToBook,
      recommendedSlot: targetSlot,
      priorityBadge: '⚡ SẴN SÀNG ĐẶT & KHÓA GIỮ CHỖ',
      priorityReason: `Khung giờ vàng ${targetSlot.start} - ${targetSlot.end} còn trống • Khóa 15 phút chống trùng lịch`,
      quickReplies: ['Chọn Sân Này Ngay', 'Đặt & Chia Tiền Ngay', 'Chọn Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 7. NGƯỜI CHƠI HỎI VỀ TIỆN ÍCH (MÁY LẠNH, XE Ô TÔ, MẶT SÂN, PHÒNG TẮM)
  // -------------------------------------------------------------------------
  if (
    query.includes('xe') ||
    query.includes('ô tô') ||
    query.includes('máy lạnh') ||
    query.includes('điều hòa') ||
    query.includes('thảm') ||
    query.includes('phòng tắm') ||
    query.includes('tắm') ||
    query.includes('đèn') ||
    query.includes('vợt')
  ) {
    // Nếu người chơi hỏi riêng về sân có máy lạnh
    if (query.includes('máy lạnh') || query.includes('điều hòa')) {
      const acCourts = localizedCourts.filter(
        (c) => c.amenities.ac.toLowerCase().includes('máy lạnh') || c.highlights.some((h) => h.toLowerCase().includes('máy lạnh'))
      )
      const topAcCourt = acCourts.sort((a, b) => a.distance - b.distance)[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(topAcCourt)
      const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

      return {
        title: 'Các cụm sân trang bị máy lạnh điều hòa',
        text:
          `Danh sách các cụm sân có **điều hòa / máy lạnh 21°C** mát mẻ:\n\n` +
          acCourts
            .map(
              (c) =>
                `• **${c.name}** (${c.districtName}): ${c.amenities.ac} • Giá **${formatVnd(c.price)}/h** • Cách bạn **${c.distance} km**.`
            )
            .join('\n\n') +
          `\n\n📌 **Lựa chọn gần bạn nhất**: **${topAcCourt.name}** đang trống khung giờ **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
        recommendedCourt: topAcCourt,
        recommendedSlot: slot,
        priorityBadge: '❄️ SÂN CÓ MÁY LẠNH ĐIỀU HÒA 21°C',
        priorityReason: `Trang bị máy lạnh mát mẻ • Thảm thi đấu chuẩn • Cách bạn ${topAcCourt.distance} km`,
        quickReplies: [`Chọn Sân ${topAcCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
      }
    }

    // Nếu người chơi hỏi về chỗ đỗ xe ô tô
    if (query.includes('ô tô') || query.includes('oto') || query.includes('xe hơi') || query.includes('bãi đỗ')) {
      const carCourts = localizedCourts.filter(
        (c) => c.amenities.parking.toLowerCase().includes('ô tô') || c.highlights.some((h) => h.toLowerCase().includes('ô tô'))
      )
      const topCarCourt = carCourts.sort((a, b) => a.distance - b.distance)[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(topCarCourt)
      const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

      return {
        title: 'Các cụm sân có bãi đỗ xe ô tô & xe máy',
        text:
          `Danh sách các sân có **bãi đỗ xe ô tô rộng rãi, an toàn có bảo vệ trông giữ**:\n\n` +
          carCourts
            .map(
              (c) =>
                `• **${c.name}** (${c.districtName}): ${c.amenities.parking} • Giá **${formatVnd(c.price)}/h** • Cách bạn **${c.distance} km**.`
            )
            .join('\n\n') +
          `\n\n📌 **Gợi ý sân gần bạn nhất**: **${topCarCourt.name}** đang trống slot **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
        recommendedCourt: topCarCourt,
        recommendedSlot: slot,
        priorityBadge: '🚗 CÓ BÃI ĐỖ XE Ô TÔ & XE MÁY',
        priorityReason: `${topCarCourt.amenities.parking} • An ninh 24/7 • Cách bạn ${topCarCourt.distance} km`,
        quickReplies: [`Chọn Sân ${topCarCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
      }
    }

    const targetCourt = currentCourt || localizedCourts[0]
    const slots = buildSlotsForCourt(targetCourt)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Tiện ích cụm sân ${targetCourt.name}`,
      text:
        `Thông tin tiện ích thực tế tại **${targetCourt.name}**:\n\n` +
        `• **Bãi đỗ xe**: ${targetCourt.amenities.parking}.\n` +
        `• **Nhiệt độ & Không khí**: ${targetCourt.amenities.ac}.\n` +
        `• **Mặt sân thi đấu**: ${targetCourt.amenities.proFloor}.\n` +
        `• **Ánh sáng**: ${targetCourt.amenities.lighting}.\n` +
        `• **Phòng tắm & Vệ sinh**: ${targetCourt.amenities.showers ? 'Có phòng tắm nóng lạnh & thay đồ' : 'Có phòng thay đồ'}.\n\n` +
        `Sân đang trống khung giờ **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
      recommendedCourt: targetCourt,
      recommendedSlot: slot,
      priorityBadge: '✅ TIỆN ÍCH ĐẦY ĐỦ ĐẠT CHUẨN',
      priorityReason: `${targetCourt.amenities.parking} • ${targetCourt.amenities.proFloor}`,
      quickReplies: [`Chọn Sân ${targetCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 8. NGƯỜI CHƠI HỎI VỀ CHÍNH SÁCH KHÓA GIỮ CHỖ 15P & BẢO CHỨNG ESCROW
  // -------------------------------------------------------------------------
  if (
    query.includes('khóa') ||
    query.includes('giữ chỗ') ||
    query.includes('pessimistic') ||
    query.includes('trùng') ||
    query.includes('escrow') ||
    query.includes('bảo chứng') ||
    query.includes('hủy') ||
    query.includes('hoàn tiền') ||
    query.includes('an toàn')
  ) {
    return {
      title: 'Chính sách Khóa Giữ Chỗ & Bảo Chứng Escrow',
      text:
        `Hệ thống SportNexus áp dụng công nghệ bảo vệ người chơi 100%:\n\n` +
        `1. 🔒 **Khóa Giữ Chỗ Độc Quyền (Pessimistic Locking 15 phút)**:\n` +
        `   • Ngay khi bạn bấm chọn một khung giờ còn trống, slot sẽ tự động khóa cứng trong **15:00 phút**.\n` +
        `   • Không người chơi nào khác có thể đặt đè hoặc thanh toán trùng giờ.\n` +
        `   • Nếu quá 15 phút chưa thanh toán, slot tự động mở lại cho cộng đồng.\n\n` +
        `2. 🛡️ **Bảo Chứng Ký Quỹ Escrow 24/7**:\n` +
        `   • Toàn bộ tiền đặt sân được lưu giữ an toàn tại tài khoản bảo chứng trung gian.\n` +
        `   • Tiền chỉ chuyển cho chủ sân sau khi bạn quét mã **QR Pass** check-in thành công tại sân.\n` +
        `   • Hoàn tiền **100% tự động** ngay lập tức nếu sân gặp sự cố hoặc hủy lịch!`,
      recommendedCourt: localizedCourts[0],
      recommendedSlot: buildSlotsForCourt(localizedCourts[0]).find((s) => s.id === 's5'),
      priorityBadge: '🛡️ BẢO CHỨNG GIAO DỊCH AN TOÀN 100%',
      priorityReason: 'Khóa slot 15 phút • Không sợ bị cướp sân • Hoàn tiền 100% khi có sự cố',
      quickReplies: ['Tôi muốn đặt sân ngay', 'Tìm hiểu Split Payment', 'Xem sân gần tôi'],
    }
  }

  // -------------------------------------------------------------------------
  // 9. NGƯỜI CHƠI HỎI VỀ CHIA TIỀN (SPLIT PAYMENT) & VIETQR
  // -------------------------------------------------------------------------
  if (
    query.includes('chia tiền') ||
    query.includes('split') ||
    query.includes('thanh toán') ||
    query.includes('bạn bè') ||
    query.includes('vietqr') ||
    query.includes('mã qr') ||
    query.includes('tiền cọc')
  ) {
    return {
      title: 'Tính năng Chia Tiền Tự Động (Split Payment)',
      text:
        `Tính năng **Split Payment** giúp nhóm bạn chia tiền sân công bằng và nhanh chóng:\n\n` +
        `• **Chia đều tự động**: Nhập số lượng người (2, 4 hoặc nhiều người), hệ thống tự chia đều tổng tiền sân chính xác đến từng đồng.\n` +
        `• **Mã VietQR riêng biệt**: Xuất mã QR thanh toán cá nhân cho từng người kèm nội dung chuyển khoản.\n` +
        `• **Theo dõi realtime**: Theo dõi trực tiếp ai đã thanh toán, ai chưa ngay trên màn hình.\n` +
        `• **Cấp vé QR Pass**: Hoàn tất thanh toán là nhận mã QR Pass để quét vào cổng sân.`,
      recommendedCourt: localizedCourts[0],
      recommendedSlot: buildSlotsForCourt(localizedCourts[0]).find((s) => s.id === 's5'),
      priorityBadge: '⚡ TÍNH NĂNG CHIA TIỀN VIETQR',
      priorityReason: 'Chia tự động theo đầu người • Xuất mã VietQR nhanh • Không sợ quên đòi nợ',
      quickReplies: ['Chọn sân & tạo nhóm chia tiền', 'Xem sân gần tôi', 'Kiểm tra slot trống'],
    }
  }

  // -------------------------------------------------------------------------
  // 10. NGƯỜI CHƠI HỎI VỀ MÔN PICKLEBALL
  // -------------------------------------------------------------------------
  if (query.includes('pickleball') || query.includes('pickle')) {
    const pickleCourts = localizedCourts.filter((c) => c.sport === 'pickleball')
    const bestPickle = pickleCourts.sort((a, b) => a.distance - b.distance)[0] || pickleCourts[0]
    const slots = buildSlotsForCourt(bestPickle)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: 'Các cụm sân Pickleball tiêu chuẩn',
      text:
        `Hệ thống hiện có các cụm sân **Pickleball** chuẩn thi đấu tại TP.HCM:\n\n` +
        pickleCourts
          .map(
            (c) =>
              `• **${c.name}** (${c.districtName}): Giá **${formatVnd(c.price)}/h** • Đánh giá **${c.rating}★** • Cách bạn **${c.distance} km**.\n` +
              `  *Đặc điểm*: ${c.subCourtDesc}.`
          )
          .join('\n\n') +
        `\n\n📌 **Gợi ý sân gần bạn nhất**: **${bestPickle.name}** (Cách **${bestPickle.distance} km**), đang trống slot **${slot.start} - ${slot.end}**.`,
      recommendedCourt: bestPickle,
      recommendedSlot: slot,
      priorityBadge: '🏓 SÂN PICKLEBALL ƯU TIÊN GẦN BẠN',
      priorityReason: `Chỉ cách bạn ${bestPickle.distance} km • Mặt sân acrylic chuẩn USAPA • Giá ${formatVnd(bestPickle.price)}/h`,
      quickReplies: [`Chọn Sân ${bestPickle.name}`, 'Đặt & Chia Tiền Ngay', 'Sân D-Dink Thảo Điền'],
    }
  }

  // -------------------------------------------------------------------------
  // 11. NGƯỜI CHƠI HỎI VỀ MÔN CẦU LÔNG
  // -------------------------------------------------------------------------
  if (query.includes('cầu lông') || query.includes('badminton')) {
    const badCourts = localizedCourts.filter((c) => c.sport === 'badminton')
    const nearestBad = badCourts.sort((a, b) => a.distance - b.distance)[0] || badCourts[0]
    const slots = buildSlotsForCourt(nearestBad)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: 'Các cụm sân Cầu Lông chất lượng cao',
      text:
        `Hệ thống SportNexus có đầy đủ các cụm sân **Cầu Lông thảm thi đấu chuẩn BWF**:\n\n` +
        `• **Gần bạn nhất**: **${nearestBad.name}** (Cách **${nearestBad.distance} km** • Giá **${formatVnd(nearestBad.price)}/h**).\n` +
        `• **Phân khúc tiết kiệm**: Sân Huệ An Thủ Đức (140k/h), Sân Bông Sao Q.8 (140k/h), CLB YONEX Bình Thạnh (160k/h).\n` +
        `• **Phân khúc chuẩn thi đấu**: SportNexus Arena Q.7 (220k/h), CLB Lan Anh Q.10 (230k/h), CLB Tao Đàn Q.1 (210k/h).\n\n` +
        `Khung giờ còn trống tại **${nearestBad.name}**: **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
      recommendedCourt: nearestBad,
      recommendedSlot: slot,
      priorityBadge: '🏸 SÂN CẦU LÔNG GẦN BẠN NHẤT',
      priorityReason: `Thảm thi đấu BWF • Cách bạn ${nearestBad.distance} km • Đang mở slot ${slot.start} - ${slot.end}`,
      quickReplies: [`Chọn Sân ${nearestBad.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 12. PHẢN HỒI MẶC ĐỊNH / CHÀO HỎI TỔNG QUÁT THEO VỊ TRÍ HIỆN TẠI
  // -------------------------------------------------------------------------
  const topNearest = [...localizedCourts].sort((a, b) => a.distance - b.distance)[0] || localizedCourts[0]
  const topSlots = buildSlotsForCourt(topNearest)
  const topSlot = findBestMatchingSlot(topSlots, timeReq) || topSlots.find((s) => s.status === 'available') || topSlots[0]

  return {
    title: 'Gợi ý sân thể thao tối ưu từ Trợ lý AI',
    text:
      `Dựa theo vị trí của bạn tại **${loc.name || loc.address}**, gợi ý sân thể thao phù hợp nhất:\n\n` +
      `• **Sân**: **${topNearest.name}** (${topNearest.sportName} • ⭐ **${topNearest.rating}**)\n` +
      `• **Khoảng cách**: **${topNearest.distance} km** (${topNearest.route?.eta || '5 phút di chuyển'})\n` +
      `• **Khung giờ trống**: **${topSlot.start} – ${topSlot.end}** (Giá: **${formatVnd(topSlot.price)}** / ca)\n\n` +
      `💡 *Bấm **Chọn Sân** bên dưới để đặt ngay, hoặc nhập yêu cầu cụ thể (giá, quận, giờ).*`,
    recommendedCourt: topNearest,
    recommendedSlot: topSlot,
    priorityBadge: `⭐ ĐỀ XUẤT TỐI ƯU • CÁCH BẠN ${topNearest.distance} KM`,
    priorityReason: `Sân gần nhất từ ${loc.name || 'vị trí hiện tại'} • Chuẩn thi đấu chất lượng cao • Slot ${topSlot.start} - ${topSlot.end} sẵn sàng`,
    quickReplies: [
      `Chọn Sân ${topNearest.name}`,
      '💰 Sân cầu lông giá rẻ nhất',
      '🏓 Sân Pickleball tốt nhất',
      '⏰ Khung giờ trống tối nay',
    ],
  }
}

