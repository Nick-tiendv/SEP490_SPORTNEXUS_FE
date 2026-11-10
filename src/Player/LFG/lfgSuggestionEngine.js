// lfgSuggestionEngine.js — Hệ thống Đề xuất Thông minh Cá nhân hóa cho trang Ghép trận LFG
// Đề xuất 3 hạng mục: Sàn ghép trận (Venues), Kèo ghép (LFG Matches), Bảng tin cộng đồng (Community Posts)
// Nguyên tắc cốt lõi:
// 1. Khởi tạo dựa theo môn thể thao & trình độ người chơi đã điền trong Profile khi đăng ký tài khoản.
// 2. Theo thời gian, khi người chơi sử dụng tìm kiếm / bộ lọc theo mong muốn mới, tự động học và cho phép
//    suggest bổ sung các nhu cầu thay đổi mới đó.
// 3. Tuyệt đối KHÔNG đề xuất ngoài sở thích cá nhân (Profile), thói quen (Habits) và đặc biệt là mong muốn (Desires) của người chơi.
// 4. Sắp xếp từ trên xuống dưới theo Range khoảng cách: từ nơi gần địa chỉ đã đăng ký nhất đến nơi xa nhất.

const LEARNED_DESIRES_STORAGE_KEY = 'player_lfg_learned_desires'

export const SPORT_CATALOG = {
  badminton: {
    key: 'badminton',
    name: 'Cầu Lông',
    shortName: 'Cầu lông',
    emoji: '🏸',
    color: '#15803D',
    bgColor: '#DCFCE7',
    keywords: ['cau long', 'cầu lông', 'badminton', 'yonex', 'lining', 'victor', 'cau'],
  },
  pickleball: {
    key: 'pickleball',
    name: 'Pickleball',
    shortName: 'Pickleball',
    emoji: '🏓',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    keywords: ['pickleball', 'pickle', 'pck', 'joola', 'selkirk', 'dink', 'kitchen', 'dupr'],
  },
  football: {
    key: 'football',
    name: 'Bóng Đá',
    shortName: 'Bóng đá',
    emoji: '⚽',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    keywords: ['bong da', 'bóng đá', 'football', 'soccer', 'san 5', 'san 7', 'futsal'],
  },
  basketball: {
    key: 'basketball',
    name: 'Bóng Rổ',
    shortName: 'Bóng rổ',
    emoji: '🏀',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    keywords: ['bong ro', 'bóng rổ', 'basketball', '3x3', '5v5', 'fiba', 'nba'],
  },
  tennis: {
    key: 'tennis',
    name: 'Tennis',
    shortName: 'Tennis',
    emoji: '🎾',
    color: '#65A30D',
    bgColor: '#F7FEE7',
    keywords: ['tennis', 'quan vot', 'quần vợt', 'wilson', 'babolat', 'atp'],
  },
  volleyball: {
    key: 'volleyball',
    name: 'Bóng Chuyền',
    shortName: 'Bóng chuyền',
    emoji: '🏐',
    color: '#D97706',
    bgColor: '#FEF3C7',
    keywords: ['bong chuyen', 'bóng chuyền', 'volleyball'],
  },
  table_tennis: {
    key: 'table_tennis',
    name: 'Bóng Bàn',
    shortName: 'Bóng bàn',
    emoji: '🏓',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    keywords: ['bong ban', 'bóng bàn', 'table tennis', 'ping pong'],
  },
}

export const TIME_SLOT_META = {
  morning: { key: 'morning', label: 'Sáng (06:00 - 12:00)', shortLabel: 'Ca Sáng', icon: '🌅' },
  afternoon: { key: 'afternoon', label: 'Chiều (12:00 - 17:00)', shortLabel: 'Ca Chiều', icon: '☀️' },
  evening: { key: 'evening', label: 'Tối (17:00 - 22:00)', shortLabel: 'Ca Tối', icon: '🌙' },
}

export const SKILL_LEVEL_META = {
  beginner: {
    key: 'beginner',
    label: 'Mới chơi / Nhập môn',
    aliases: ['moi', 'mới', 'beginner', 'nhap mon', 'nhập môn', 'phong trao', 'cơ bản', 'co ban'],
  },
  intermediate: {
    key: 'intermediate',
    label: 'Trung bình - Khá',
    aliases: ['trung binh', 'trung bình', 'intermediate', 'tb', 'tb-kha', 'đều tay', 'deu tay'],
  },
  advanced: {
    key: 'advanced',
    label: 'Khá - Nâng cao',
    aliases: ['nang cao', 'nâng cao', 'advanced', 'ban chuyen', 'bán chuyên', 'chuyên nghiệp', 'professional', 'kha', 'khá'],
  },
}

// Bỏ dấu tiếng Việt + chữ thường để so khớp chính xác
export function normalizeVi(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
}

// Chuẩn hóa tên môn thể thao sang sportKey chuẩn
export function normalizeSportKey(raw = '') {
  const norm = normalizeVi(raw)
  if (!norm) return null
  if (SPORT_CATALOG[norm]) return norm
  if (norm.includes('pickle')) return 'pickleball'
  if (norm.includes('cau long') || norm.includes('badminton')) return 'badminton'
  if (norm.includes('bong da') || norm.includes('football') || norm.includes('soccer') || norm.includes('futsal')) return 'football'
  if (norm.includes('bong ro') || norm.includes('basket')) return 'basketball'
  if (norm.includes('tennis') || norm.includes('quan vot')) return 'tennis'
  if (norm.includes('bong chuyen') || norm.includes('volley')) return 'volleyball'
  if (norm.includes('bong ban') || norm.includes('table tennis') || norm.includes('table_tennis')) return 'table_tennis'
  return null
}

// Phát hiện tất cả môn thể thao được nhắc đến trong văn bản (từ khóa tìm kiếm hoặc nội dung bài viết)
export function detectSportsInText(text = '') {
  const norm = normalizeVi(text)
  if (!norm) return []
  const detected = []
  Object.values(SPORT_CATALOG).forEach((sport) => {
    if (sport.keywords.some((kw) => norm.includes(normalizeVi(kw)))) {
      detected.push(sport.key)
    }
  })
  return Array.from(new Set(detected))
}

// Chuẩn hóa trình độ sang key ('beginner' | 'intermediate' | 'advanced')
export function normalizeSkillKey(raw = '') {
  const norm = normalizeVi(raw)
  if (!norm || norm === 'all' || norm.includes('moi trinh do') || norm.includes('tat ca')) return 'all'
  if (norm === 'beginner' || norm.includes('moi tap') || norm.includes('moi choi') || norm.includes('nhap mon')) return 'beginner'
  if (norm === 'intermediate' || norm.includes('trung binh')) return 'intermediate'
  if (norm === 'advanced' || norm === 'professional' || norm.includes('nang cao') || norm.includes('ban chuyen') || norm.includes('chuyen nghiep') || norm.includes('kha')) {
    return 'advanced'
  }
  return 'intermediate'
}

// Phát hiện khung giờ được nhắc đến trong từ khóa tìm kiếm
export function detectTimeSlotInText(text = '') {
  const norm = normalizeVi(text)
  if (!norm) return null
  if (/\b(sang|buoi sang|ca sang|morning|6h|7h|8h|9h|10h|11h)\b/.test(norm)) return 'morning'
  if (/\b(chieu|buoi chieu|ca chieu|afternoon|13h|14h|15h|16h|17h)\b/.test(norm)) return 'afternoon'
  if (/\b(toi|buoi toi|ca toi|dem|evening|night|18h|19h|20h|21h|22h)\b/.test(norm)) return 'evening'
  return null
}

// Phát hiện trình độ được nhắc đến trong từ khóa tìm kiếm
export function detectSkillInText(text = '') {
  const norm = normalizeVi(text)
  if (!norm) return null
  if (norm.includes('moi choi') || norm.includes('moi tap') || norm.includes('nhap mon')) return 'beginner'
  if (norm.includes('trung binh')) return 'intermediate'
  if (norm.includes('nang cao') || norm.includes('ban chuyen') || norm.includes('trinh kha') || norm.includes('chuyen nghiep')) return 'advanced'
  return null
}

// ============================================================================
// HỆ THỐNG ĐỊA LÝ & KHOẢNG CÁCH (TỪ ĐỊA CHỈ ĐĂNG KÝ ĐẾN SÂN / KÈO / BÀI VIẾT)
// ============================================================================
export const DISTRICT_INFO = {
  thuduc: {
    key: 'thuduc',
    name: 'TP. Thủ Đức',
    lat: 10.8490,
    lng: 106.7537,
    aliases: ['thu duc', 'thao dien', 'quan 2', 'q2', 'q.2', 'quan 9', 'q9', 'q.9', 'linh chieu', 'vo van ngan', 'tang nhon phu', 'le van viet', 'binh trieu', 'hiepbinh', 'hiep phu', 'linh tay', 'linh dong', 'linh trung', 'sala', 'an phu', 'cat lai'],
  },
  binhthanh: {
    key: 'binhthanh',
    name: 'Quận Bình Thạnh',
    lat: 10.8105,
    lng: 106.6975,
    aliases: ['binh thanh', 'q.bt', 'dinh bo linh', 'dien bien phu', 'hang xanh', 'bach dang', 'thanh da', 'chu van an', 'ung van khiem', 'xo viet nghe tinh', ' no trang long', 'nguyen huu canh'],
  },
  q7: {
    key: 'q7',
    name: 'Quận 7',
    lat: 10.7340,
    lng: 106.7215,
    aliases: ['quan 7', 'q7', 'q.7', 'phu my hung', 'tan thuan', 'huynh tan phat', 'nguyen van linh', 'nguyen luong bang', 'nguyen thi thap', 'tre xanh', 'long vien', 'tan phong', 'tan quy', 'him lam'],
  },
  q1: {
    key: 'q1',
    name: 'Quận 1',
    lat: 10.7756,
    lng: 106.7004,
    aliases: ['quan 1', 'q1', 'q.1', 'ben thanh', 'ben nghe', 'tao dan', 'nguyen hue', 'nguyen thi minh khai', 'huyen tran cong chua', 'lao dong', 'da kao'],
  },
  q3: {
    key: 'q3',
    name: 'Quận 3',
    lat: 10.7788,
    lng: 106.6852,
    aliases: ['quan 3', 'q3', 'q.3', 'ho xuan huong', 'vo thi sau', 'nam ky khoi nghia', 'ky dong', 'nguyen dinh chieu'],
  },
  q5: {
    key: 'q5',
    name: 'Quận 5',
    lat: 10.7538,
    lng: 106.6621,
    aliases: ['quan 5', 'q5', 'q.5', 'tinh vo', 'dai the gioi', 'nguyen trai', 'tran hung dao', '안 dong', 'cholon'],
  },
  q10: {
    key: 'q10',
    name: 'Quận 10',
    lat: 10.7715,
    lng: 106.6672,
    aliases: ['quan 10', 'q10', 'q.10', 'ky hoa', '3 thang 2', 'ba thang hai', 'to hien thanh', 'lan anh', 'cach mang thang 8', 'bac hai', 'thanh thai', 'su van hanh'],
  },
  q11: {
    key: 'q11',
    name: 'Quận 11',
    lat: 10.7652,
    lng: 106.6578,
    aliases: ['quan 11', 'q11', 'q.11', 'phu tho', 'ly thuong kiet', 'lac long quan', 'dam sen', 'hoa binh', 'binh thoi'],
  },
  q12: {
    key: 'q12',
    name: 'Quận 12',
    lat: 10.8524,
    lng: 106.6542,
    aliases: ['quan 12', 'q12', 'q.12', 'thoi an', 'le van khuong', 'cau vong', 'nguyen van qua', 'tan chanh hiep'],
  },
  phunhuan: {
    key: 'phunhuan',
    name: 'Quận Phú Nhuận',
    lat: 10.7992,
    lng: 106.6803,
    aliases: ['phu nhuan', 'q.pn', 'rach mieu', 'phan xich long', 'hoa phuong', 'hoang dieu', 'nguyen van troi', 'hoang van thu'],
  },
  tanbinh: {
    key: 'tanbinh',
    name: 'Quận Tân Bình',
    lat: 10.8015,
    lng: 106.6534,
    aliases: ['tan binh', 'q.tb', 'hoang hoa tham', 'ga truc thang', 'cong hoa', 'viettel', 'tan son', 'truong chinh', 'pho quang', 'bau cat'],
  },
  quan8: {
    key: 'quan8',
    name: 'Quận 8',
    lat: 10.7242,
    lng: 106.6286,
    aliases: ['quan 8', 'q8', 'q.8', 'chanh hung', 'bong sao', 'pham hung', 'ta quang buu', 'dong dieu', 'cao lo'],
  },
  tanphu: {
    key: 'tanphu',
    name: 'Quận Tân Phú',
    lat: 10.7901,
    lng: 106.6281,
    aliases: ['tan phu', 'q.tp', 'celadon', 'bo bao tan thang', 'luy ban bich', 'thien van', 'thoai ngoc hau', 'tan ky tan quy'],
  },
  govap: {
    key: 'govap',
    name: 'Quận Gò Vấp',
    lat: 10.8388,
    lng: 106.6653,
    aliases: ['go vap', 'q.gv', 'quang trung', 'phan van tri', 'nguyen oanh', 'khang an', 'ben cat', 'an hoi', 'pham van chieu', 'le duc tho'],
  },
  binhtan: {
    key: 'binhtan',
    name: 'Quận Bình Tân',
    lat: 10.7825,
    lng: 106.6085,
    aliases: ['binh tan', 'q.btn', 'le trong tan', 'binh hung hoa', 'ten lua', 'aeon binh tan'],
  },
}

const DISTRICT_DISTANCE_MATRIX = {
  thuduc: { thuduc: 1.2, binhthanh: 4.2, q1: 7.5, phunhuan: 7.8, q3: 8.5, govap: 8.8, tanbinh: 9.5, q10: 10.2, q7: 11.8, q5: 11.5, q11: 12.2, q12: 12.8, quan8: 13.2, tanphu: 13.8, binhtan: 15.2 },
  binhthanh: { binhthanh: 1.1, phunhuan: 2.6, q1: 3.4, q3: 3.9, govap: 4.1, thuduc: 4.2, tanbinh: 4.6, q10: 5.8, q5: 6.4, q11: 7.1, q7: 7.5, q12: 8.0, tanphu: 8.4, quan8: 8.9, binhtan: 10.2 },
  q7: { q7: 1.1, quan8: 4.3, q1: 5.4, q5: 6.2, q3: 6.8, binhthanh: 7.5, q10: 7.9, tanbinh: 9.1, phunhuan: 9.3, q11: 9.5, binhtan: 10.5, tanphu: 11.0, thuduc: 11.8, govap: 12.4, q12: 14.0 },
  q1: { q1: 1.0, q3: 2.0, binhthanh: 3.4, q5: 3.5, phunhuan: 3.8, q10: 4.0, tanbinh: 5.0, q7: 5.4, q11: 5.5, quan8: 6.0, govap: 7.0, thuduc: 7.5, tanphu: 8.0, binhtan: 9.0, q12: 11.0 },
  q3: { q3: 1.0, q1: 2.0, q10: 2.4, phunhuan: 2.5, q5: 3.0, binhthanh: 3.9, tanbinh: 4.0, q11: 4.1, quan8: 5.5, govap: 6.0, tanphu: 6.5, q7: 6.8, binhtan: 7.5, thuduc: 8.5, q12: 9.5 },
  q5: { q5: 1.0, q10: 2.0, q11: 2.5, q3: 3.0, quan8: 3.0, q1: 3.5, tanbinh: 4.5, phunhuan: 5.0, tanphu: 5.0, binhtan: 5.5, q7: 6.2, binhthanh: 6.4, govap: 8.0, q12: 10.0, thuduc: 11.5 },
  q10: { q10: 1.0, q5: 2.0, q3: 2.4, q11: 2.5, tanbinh: 3.5, q1: 4.0, quan8: 4.0, phunhuan: 4.5, tanphu: 5.0, binhthanh: 5.8, govap: 6.5, binhtan: 6.5, q7: 7.9, q12: 8.5, thuduc: 10.2 },
  phunhuan: { phunhuan: 1.0, q3: 2.5, binhthanh: 2.6, tanbinh: 3.0, govap: 3.5, q1: 3.8, q10: 4.5, q5: 5.0, q11: 5.5, tanphu: 6.0, quan8: 7.5, thuduc: 7.8, q12: 8.0, binhtan: 8.5, q7: 9.3 },
  tanbinh: { tanbinh: 1.0, phunhuan: 3.0, tanphu: 3.0, q10: 3.5, govap: 3.5, q11: 3.8, q3: 4.0, q5: 4.5, binhthanh: 4.6, q1: 5.0, binhtan: 5.0, q12: 6.0, quan8: 6.5, q7: 9.1, thuduc: 9.5 },
  quan8: { quan8: 1.1, q5: 3.0, q10: 4.0, q7: 4.3, q11: 5.0, q3: 5.5, q1: 6.0, binhtan: 6.0, tanbinh: 6.5, tanphu: 7.0, phunhuan: 7.5, binhthanh: 8.9, govap: 11.0, q12: 12.0, thuduc: 13.2 },
  tanphu: { tanphu: 1.1, tanbinh: 3.0, binhtan: 3.5, q11: 4.5, q10: 5.0, q5: 5.0, govap: 6.0, phunhuan: 6.0, q3: 6.5, q12: 6.5, quan8: 7.0, q1: 8.0, binhthanh: 8.4, q7: 11.0, thuduc: 13.8 },
  govap: { govap: 1.1, tanbinh: 3.5, phunhuan: 3.5, binhthanh: 4.1, q12: 4.5, q3: 6.0, tanphu: 6.0, q10: 6.5, q1: 7.0, q11: 7.5, binhtan: 7.5, q5: 8.0, thuduc: 8.8, quan8: 11.0, q7: 12.4 },
  q11: { q11: 1.0, q10: 2.5, q5: 2.5, tanbinh: 3.8, q3: 4.1, tanphu: 4.5, binhtan: 4.5, quan8: 5.0, q1: 5.5, phunhuan: 5.5, binhthanh: 7.1, govap: 7.5, q12: 7.5, q7: 9.5, thuduc: 12.2 },
  q12: { q12: 1.2, govap: 4.5, tanbinh: 6.0, tanphu: 6.5, q11: 7.5, binhthanh: 8.0, binhtan: 8.0, q10: 8.5, q3: 9.5, q5: 10.0, q1: 11.0, quan8: 12.0, thuduc: 12.8, q7: 14.0 },
  binhtan: { binhtan: 1.2, tanphu: 3.5, q11: 4.5, tanbinh: 5.0, q5: 5.5, quan8: 6.0, q10: 6.5, q3: 7.5, govap: 7.5, q12: 8.0, q1: 9.0, binhthanh: 10.2, q7: 10.5, thuduc: 15.2 },
}

export function detectDistrictKey(addressOrText = '') {
  const norm = normalizeVi(addressOrText)
  if (!norm) return null
  for (const [key, info] of Object.entries(DISTRICT_INFO)) {
    if (info.aliases.some((alias) => norm.includes(normalizeVi(alias)))) {
      return key
    }
  }
  return null
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const nLat1 = Number(lat1)
  const nLng1 = Number(lng1)
  const nLat2 = Number(lat2)
  const nLng2 = Number(lng2)
  if (!Number.isFinite(nLat1) || !Number.isFinite(nLng1) || !Number.isFinite(nLat2) || !Number.isFinite(nLng2)) {
    return null
  }
  if (Math.abs(nLat1) < 1 || Math.abs(nLat2) < 1) return null
  const R = 6371
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180
  const dLng = ((nLng2 - nLng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// Tính khoảng cách (km) từ địa chỉ đăng ký của người chơi đến một địa điểm (Sàn / Kèo / Bài viết)
export function calculateDistanceFromRegisteredAddress(arg1 = {}, arg2 = 'TP. Thủ Đức', arg3 = null) {
  let registeredAddress
  let targetAddress
  let targetLat = null
  let targetLng = null
  let itemSeed

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    registeredAddress = arg1.registeredAddress || 'TP. Thủ Đức'
    targetAddress = arg1.targetAddress || ''
    targetLat = arg1.targetLat ?? null
    targetLng = arg1.targetLng ?? null
    itemSeed = arg1.itemSeed || ''
  } else {
    targetAddress = String(arg1 || '')
    registeredAddress = String(arg2 || 'TP. Thủ Đức')
    if (arg3 && typeof arg3 === 'object') {
      targetLat = arg3.lat ?? arg3.targetLat ?? null
      targetLng = arg3.lng ?? arg3.targetLng ?? null
    }
    itemSeed = targetAddress
  }
  const userDistrictKey = detectDistrictKey(registeredAddress) || 'thuduc'
  const userDistrict = DISTRICT_INFO[userDistrictKey] || DISTRICT_INFO.thuduc
  const targetDistrictKey = detectDistrictKey(targetAddress)

  // Deterministic small offset (0.0 - 0.7 km) để các địa điểm cùng quận có khoảng cách thực tế phân bổ tự nhiên
  const seedStr = String(itemSeed || targetAddress || '')
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 1000
  }
  const microOffset = Math.round(((hash % 7) * 0.12) * 10) / 10

  // 1. Nếu địa chỉ mục tiêu trùng khớp trực tiếp đường/phường với địa chỉ người chơi đăng ký
  const normUser = normalizeVi(registeredAddress)
  const normTarget = normalizeVi(targetAddress)
  const userTokens = normUser.split(/[,.-]/).map((s) => s.trim()).filter((s) => s.length >= 4)
  const hasExactStreetOrWardMatch =
    userTokens.length > 0 &&
    userTokens.some((tok) => tok !== normalizeVi(userDistrict.name) && tok !== 'thu duc' && normTarget.includes(tok))

  if (hasExactStreetOrWardMatch) {
    return Math.max(0.4, Math.round((0.6 + microOffset * 0.7) * 10) / 10)
  }

  // 2. Nếu có tọa độ GPS thực của sân khác tọa độ mặc định của Thủ Đức
  const isDefaultFallbackCoord =
    targetLat != null &&
    targetLng != null &&
    Math.abs(Number(targetLat) - 10.849) < 0.0005 &&
    Math.abs(Number(targetLng) - 106.7537) < 0.0005

  if (targetLat != null && targetLng != null && !isDefaultFallbackCoord) {
    const gpsDist = haversineKm(userDistrict.lat, userDistrict.lng, targetLat, targetLng)
    if (gpsDist != null && gpsDist > 0.1 && gpsDist < 50) {
      return Math.max(0.5, Math.round((gpsDist + microOffset * 0.3) * 10) / 10)
    }
  }

  // 3. Nếu xác định được Quận/Huyện của mục tiêu -> tra ma trận khoảng cách giữa các Quận
  if (targetDistrictKey) {
    const baseDist = DISTRICT_DISTANCE_MATRIX[userDistrictKey]?.[targetDistrictKey] ?? 6.5
    return Math.max(0.5, Math.round((baseDist + microOffset) * 10) / 10)
  }

  // 4. Nếu không rõ quận nhưng có tên khu vực chung
  return Math.round((4.5 + microOffset) * 10) / 10
}

// Phân tầng Range khoảng cách từ trên xuống dưới (Gần nhất -> Xa nhất)
export const DISTANCE_RANGES = [
  {
    id: 'range_1',
    key: 'range_1',
    tier: 1,
    minKm: 0,
    maxKm: 3.0,
    title: 'Range 1 • Rất gần địa chỉ đăng ký (0 – 3 km)',
    shortTitle: '0 – 3 km (Gần nhất)',
    desc: 'Cùng khu vực đăng ký, di chuyển chỉ 3 – 8 phút',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    headerClass: 'from-emerald-600 to-green-700',
  },
  {
    id: 'range_2',
    key: 'range_2',
    tier: 2,
    minKm: 3.0,
    maxKm: 6.5,
    title: 'Range 2 • Khu vực lân cận (3 – 6.5 km)',
    shortTitle: '3 – 6.5 km (Lân cận)',
    desc: 'Giáp ranh khu vực đăng ký, di chuyển 8 – 15 phút',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-300',
    headerClass: 'from-teal-600 to-emerald-700',
  },
  {
    id: 'range_3',
    key: 'range_3',
    tier: 3,
    minKm: 6.5,
    maxKm: 10.5,
    title: 'Range 3 • Bán kính trung bình (6.5 – 10.5 km)',
    shortTitle: '6.5 – 10.5 km (Trung bình)',
    desc: 'Di chuyển nội thành khoảng 15 – 25 phút',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300',
    headerClass: 'from-sky-600 to-cyan-700',
  },
  {
    id: 'range_4',
    key: 'range_4',
    tier: 4,
    minKm: 10.5,
    maxKm: Infinity,
    title: 'Range 4 • Bán kính mở rộng (> 10.5 km)',
    shortTitle: '> 10.5 km (Xa hơn)',
    desc: 'Các khu vực xa hơn trong thành phố để bạn có thêm lựa chọn',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    headerClass: 'from-amber-600 to-orange-700',
  },
]

export function getDistanceRangeInfo(distanceKm = 0) {
  const d = Number(distanceKm) || 0
  return (
    DISTANCE_RANGES.find((r) => d >= r.minKm && d <= r.maxKm) ||
    DISTANCE_RANGES[DISTANCE_RANGES.length - 1]
  )
}

// ============================================================================
// QUẢN LÝ SỞ THÍCH HỒ SƠ (PROFILE) + THÓI QUEN (HABITS) + NHU CẦU MỚI (DESIRES)
// ============================================================================

// Đọc danh sách môn thể thao người chơi đã đăng ký trong Profile
export function loadProfileRegisteredSports(serverSports = []) {
  const map = new Map()

  const addSportItem = (rawNameOrKey, rawLevel, categoryId = null) => {
    const sportKey = normalizeSportKey(rawNameOrKey)
    if (!sportKey) return
    const meta = SPORT_CATALOG[sportKey]
    const skillKey = normalizeSkillKey(rawLevel)
    const skillLabel =
      SKILL_LEVEL_META[skillKey]?.label ||
      (rawLevel && !/BEGINNER|INTERMEDIATE|ADVANCED|PROFESSIONAL/i.test(rawLevel) ? rawLevel : 'Trung bình - Khá')

    if (!map.has(sportKey)) {
      map.set(sportKey, {
        sportKey,
        name: meta?.name || rawNameOrKey,
        emoji: meta?.emoji || '🏅',
        skillKey: skillKey === 'all' ? 'intermediate' : skillKey,
        skillLabel,
        sportCategoryId: categoryId || null,
        source: 'profile',
      })
    }
  }

  // 1. Ưu tiên từ API GET /api/auth/me/sports
  if (Array.isArray(serverSports) && serverSports.length > 0) {
    serverSports.forEach((s) => {
      addSportItem(s.name || s.sportName || s.sportCategoryName || s.id, s.skillLevel || s.level, s.sportCategoryId || s.id)
    })
  }

  // 2. Bổ sung / fallback từ localStorage 'player_sports_data' (lưu khi đăng ký hoặc cập nhật Profile)
  try {
    const savedSports = JSON.parse(localStorage.getItem('player_sports_data') || '[]')
    if (Array.isArray(savedSports)) {
      savedSports.forEach((s) => {
        addSportItem(s.name || s.id || s.sportKey, s.level || s.skillLevel, s.sportCategoryId || s.id)
      })
    }
  } catch { /* ignore */ }

  // 3. Fallback từ 'player_registered_sports' (lưu trực tiếp tại trang Register.jsx)
  try {
    const regSports = JSON.parse(localStorage.getItem('player_registered_sports') || '[]')
    if (Array.isArray(regSports)) {
      regSports.forEach((s) => {
        addSportItem(s.name || s.sportKey || s.id, s.skillLevel || s.level, s.sportCategoryId || s.id)
      })
    }
  } catch { /* ignore */ }

  // Mặc định nếu tài khoản mới chưa có dữ liệu nào trên cả server lẫn local
  if (map.size === 0) {
    addSportItem('badminton', 'Trung bình - Khá')
  }

  return Array.from(map.values())
}

// Phân tích thói quen của người chơi từ Kèo đã tạo, Kèo đã tham gia
export function extractPlayerHabits({ myLfgCards = [], joinedLfgCards = [] }) {
  const sportCounts = {}
  const timeSlotCounts = { morning: 0, afternoon: 0, evening: 0 }
  const skillCounts = {}
  const facilityNames = new Set()

  const allHistoryCards = [
    ...(Array.isArray(myLfgCards) ? myLfgCards : []),
    ...(Array.isArray(joinedLfgCards) ? joinedLfgCards : []),
  ]

  allHistoryCards.forEach((card) => {
    const sKey = normalizeSportKey(card.sportName || card.sportCategoryName || card.sport || card.title)
    if (sKey) {
      sportCounts[sKey] = (sportCounts[sKey] || 0) + 1
    }
    if (card.startTime) {
      const hr = new Date(card.startTime).getHours()
      const slot = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening'
      timeSlotCounts[slot] = (timeSlotCounts[slot] || 0) + 1
    }
    const sk = normalizeSkillKey(card.skillLevelTag || card.skillLevel)
    if (sk && sk !== 'all') {
      skillCounts[sk] = (skillCounts[sk] || 0) + 1
    }
    if (card.facilityName) {
      facilityNames.add(normalizeVi(card.facilityName))
    }
  })

  const habitSports = Object.keys(sportCounts).sort((a, b) => sportCounts[b] - sportCounts[a])
  const favoriteTimeSlots = Object.entries(timeSlotCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([slot]) => slot)

  return {
    habitSports,
    favoriteTimeSlots: favoriteTimeSlots.length > 0 ? favoriteTimeSlots : ['evening'],
    habitSkillLevels: Object.keys(skillCounts),
    visitedFacilities: Array.from(facilityNames),
    totalHistoricalMatches: allHistoryCards.length,
  }
}

// Đọc các nhu cầu mới mà người chơi đã tìm kiếm / thay đổi theo thời gian
export function loadLearnedSearchDesires() {
  try {
    const raw = localStorage.getItem(LEARNED_DESIRES_STORAGE_KEY)
    if (!raw) {
      return { sports: [], timeSlots: [], skillLevels: [], districts: [], keywords: [] }
    }
    const parsed = JSON.parse(raw)
    return {
      sports: Array.isArray(parsed.sports) ? parsed.sports : [],
      timeSlots: Array.isArray(parsed.timeSlots) ? parsed.timeSlots : [],
      skillLevels: Array.isArray(parsed.skillLevels) ? parsed.skillLevels : [],
      districts: Array.isArray(parsed.districts) ? parsed.districts : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    }
  } catch {
    return { sports: [], timeSlots: [], skillLevels: [], districts: [], keywords: [] }
  }
}

// Lưu bổ sung nhu cầu mới khi người chơi sử dụng tìm kiếm hoặc bộ lọc theo mong muốn
export function recordNewPlayerDesire({
  keyword = '',
  sportKey = null,
  timeSlot = null,
  skillLevel = null,
  districtKey = null,
  profileSportKeys = [],
}) {
  const current = loadLearnedSearchDesires()
  const nowIso = new Date().toISOString()
  let changed = false

  // 1. Phát hiện môn thể thao từ bộ lọc hoặc từ khóa tìm kiếm
  const detectedSports = new Set()
  if (sportKey && sportKey !== 'all' && sportKey !== 'profile_matched' && SPORT_CATALOG[sportKey]) {
    detectedSports.add(sportKey)
  }
  detectSportsInText(keyword).forEach((sk) => detectedSports.add(sk))

  detectedSports.forEach((sk) => {
    const existing = current.sports.find((item) => item.key === sk)
    if (existing) {
      existing.count = (existing.count || 1) + 1
      existing.updatedAt = nowIso
      changed = true
    } else if (!profileSportKeys.includes(sk)) {
      // Chỉ ghi nhận là "nhu cầu bổ sung mới" nếu môn này chưa có sẵn trong Profile gốc
      const meta = SPORT_CATALOG[sk]
      if (meta) {
        current.sports.unshift({
          key: sk,
          label: meta.name,
          emoji: meta.emoji,
          addedAt: nowIso,
          updatedAt: nowIso,
          count: 1,
        })
        changed = true
      }
    }
  })

  // 2. Phát hiện khung giờ mong muốn mới
  const targetTimeSlot = timeSlot || detectTimeSlotInText(keyword)
  if (targetTimeSlot && TIME_SLOT_META[targetTimeSlot]) {
    const existingSlot = current.timeSlots.find((t) => t.key === targetTimeSlot)
    if (existingSlot) {
      existingSlot.count = (existingSlot.count || 1) + 1
      existingSlot.updatedAt = nowIso
    } else {
      current.timeSlots.unshift({
        key: targetTimeSlot,
        label: TIME_SLOT_META[targetTimeSlot].shortLabel,
        icon: TIME_SLOT_META[targetTimeSlot].icon,
        addedAt: nowIso,
        updatedAt: nowIso,
        count: 1,
      })
    }
    changed = true
  }

  // 3. Phát hiện trình độ mong muốn mới
  const normSkill = (skillLevel && skillLevel !== 'all' ? skillLevel : null) || detectSkillInText(keyword)
  if (normSkill && SKILL_LEVEL_META[normSkill]) {
    const existingSkill = current.skillLevels.find((s) => s.key === normSkill)
    if (existingSkill) {
      existingSkill.count = (existingSkill.count || 1) + 1
      existingSkill.updatedAt = nowIso
    } else {
      current.skillLevels.unshift({
        key: normSkill,
        label: SKILL_LEVEL_META[normSkill].label,
        addedAt: nowIso,
        updatedAt: nowIso,
        count: 1,
      })
    }
    changed = true
  }

  // 4. Phát hiện khu vực / quận mong muốn trong tìm kiếm
  const detectedDistrict = districtKey || detectDistrictKey(keyword)
  if (detectedDistrict && DISTRICT_INFO[detectedDistrict]) {
    const existingDist = current.districts.find((d) => d.key === detectedDistrict)
    if (existingDist) {
      existingDist.count = (existingDist.count || 1) + 1
      existingDist.updatedAt = nowIso
    } else {
      current.districts.unshift({
        key: detectedDistrict,
        label: DISTRICT_INFO[detectedDistrict].name,
        addedAt: nowIso,
        updatedAt: nowIso,
        count: 1,
      })
    }
    changed = true
  }

  // 5. Lưu từ khóa mong muốn cụ thể
  const cleanKw = String(keyword || '').trim()
  if (cleanKw.length >= 2) {
    const normKw = normalizeVi(cleanKw)
    const existingKw = current.keywords.find((k) => normalizeVi(k.text) === normKw)
    if (existingKw) {
      existingKw.count = (existingKw.count || 1) + 1
      existingKw.updatedAt = nowIso
    } else {
      current.keywords.unshift({
        id: `kw_${Date.now()}`,
        text: cleanKw,
        addedAt: nowIso,
        updatedAt: nowIso,
        count: 1,
      })
      current.keywords = current.keywords.slice(0, 8)
    }
    changed = true
  }

  if (changed) {
    try {
      localStorage.setItem(LEARNED_DESIRES_STORAGE_KEY, JSON.stringify(current))
    } catch { /* ignore */ }
  }

  return current
}

// Xóa một nhu cầu bổ sung cụ thể hoặc xóa toàn bộ nhu cầu bổ sung
export function removeLearnedDesireItem(category, keyOrId) {
  const current = loadLearnedSearchDesires()
  if (!category || category === 'all') {
    const empty = { sports: [], timeSlots: [], skillLevels: [], districts: [], keywords: [] }
    try {
      localStorage.setItem(LEARNED_DESIRES_STORAGE_KEY, JSON.stringify(empty))
    } catch { /* ignore */ }
    return empty
  }
  if (Array.isArray(current[category])) {
    current[category] = current[category].filter((item) => (item.key || item.id || item.text) !== keyOrId)
    try {
      localStorage.setItem(LEARNED_DESIRES_STORAGE_KEY, JSON.stringify(current))
    } catch { /* ignore */ }
  }
  return current
}

export function clearAllLearnedDesires() {
  return removeLearnedDesireItem('all')
}

// ============================================================================
// ENGINE ĐỀ XUẤT & LỌC NGHIÊM NGẶT CHO 3 HẠNG MỤC:
// 1. SÀN GHÉP TRẬN (VENUES)
// 2. KÈO GHÉP (LFG MATCHES)
// 3. BẢNG TIN CỘNG ĐỒNG (COMMUNITY POSTS)
// ============================================================================
export function buildPersonalizedLfgSuggestions({
  profileSports = [],
  userProfileLocation = 'TP. Thủ Đức',
  habits = {},
  learnedDesires = { sports: [], timeSlots: [], skillLevels: [], districts: [], keywords: [] },
  includeLearnedDesires = true,
  activeFilters = {
    sport: 'profile_matched', // 'profile_matched' | 'all_allowed' | specific sportKey
    keyword: '',
    level: 'all',
    timeSlots: ['morning', 'afternoon', 'evening'],
    distanceRangeKey: 'all', // 'all' | 'range_1' | 'range_2' | 'range_3' | 'range_4'
    maxDistanceKm: null,
  },
  facilities = [],
  matches = [],
  communityPosts = [],
}) {
  // 1. Xác định tập hợp MÔN THỂ THAO được phép đề xuất (Strict Whitelist)
  // Không bao giờ đề xuất môn nằm ngoài (Hồ sơ cá nhân + Thói quen + Mong muốn tìm kiếm của người chơi)
  const profileSportKeys = profileSports.map((s) => s.sportKey).filter(Boolean)
  const habitSportKeys = Array.isArray(habits.habitSports) ? habits.habitSports : []
  const learnedSportKeys = includeLearnedDesires
    ? (learnedDesires.sports || []).map((s) => s.key).filter(Boolean)
    : []

  const allAllowedSportSet = new Set([
    ...profileSportKeys,
    ...habitSportKeys,
    ...learnedSportKeys,
  ])
  if (allAllowedSportSet.size === 0) {
    allAllowedSportSet.add('badminton')
  }

  // Nếu người chơi đang chủ động chọn 1 môn cụ thể hoặc gõ tên môn trong ô tìm kiếm -> ưu tiên tuyệt đối mong muốn hiện tại
  const keywordSports = detectSportsInText(activeFilters.keyword)
  let activeSportSet = new Set(allAllowedSportSet)

  if (
    activeFilters.sport &&
    activeFilters.sport !== 'all' &&
    activeFilters.sport !== 'profile_matched' &&
    SPORT_CATALOG[activeFilters.sport]
  ) {
    activeSportSet = new Set([activeFilters.sport])
  } else if (activeFilters.sport === 'profile_matched' && !includeLearnedDesires) {
    activeSportSet = new Set(profileSportKeys.length > 0 ? profileSportKeys : ['badminton'])
  } else if (keywordSports.length > 0) {
    activeSportSet = new Set(keywordSports)
  }

  // 2. Xác định các tiêu chí mong muốn hiện tại từ thanh tìm kiếm & bộ lọc
  const normKeyword = normalizeVi(activeFilters.keyword)
  const keywordTimeSlot = detectTimeSlotInText(activeFilters.keyword)
  const keywordSkill = detectSkillInText(activeFilters.keyword)
  const keywordDistrict = detectDistrictKey(activeFilters.keyword)

  // Lọc bỏ các từ chỉ môn/khung giờ/trình độ để lấy từ khóa tìm kiếm nội dung/địa điểm còn lại
  const remainingKeywordTokens = normKeyword
    .split(/\s+/)
    .filter((tok) => tok.length >= 2)
    .filter((tok) => !['keo', 'ghep', 'san', 'tim', 'choi', 'giao', 'luu', 'ca', 'buoi', 'trinh', 'do'].includes(tok))

  const matchesRangeFilter = (distanceKm) => {
    if (activeFilters.maxDistanceKm != null && distanceKm > Number(activeFilters.maxDistanceKm)) {
      return false
    }
    if (!activeFilters.distanceRangeKey || activeFilters.distanceRangeKey === 'all') {
      return true
    }
    const rangeInfo = getDistanceRangeInfo(distanceKm)
    return rangeInfo.key === activeFilters.distanceRangeKey
  }

  // ----------------------------------------------------------------------------
  // HẠNG MỤC 1: SUGGEST SÀN GHÉP TRẬN (FACILITIES / VENUES)
  // ----------------------------------------------------------------------------
  const suggestedVenues = (Array.isArray(facilities) ? facilities : [])
    .map((fac) => {
      // Trích xuất các môn thể thao của sàn
      const rawSports = new Set()
      if (Array.isArray(fac.sports)) {
        fac.sports.forEach((s) => {
          const k = normalizeSportKey(typeof s === 'string' ? s : s?.name || s?.sportName)
          if (k) rawSports.add(k)
        })
      }
      if (Array.isArray(fac.courts)) {
        fac.courts.forEach((c) => {
          const k = normalizeSportKey(c.categoryName || c.sportName || c.name)
          if (k) rawSports.add(k)
        })
      }
      if (fac.sport) {
        const k = normalizeSportKey(fac.sport)
        if (k) rawSports.add(k)
      }
      const nameDetected = detectSportsInText(`${fac.name || ''} ${fac.description || ''}`)
      nameDetected.forEach((k) => rawSports.add(k))
      if (rawSports.size === 0) rawSports.add('badminton')

      const venueSports = Array.from(rawSports)
      // Chỉ giữ các môn nằm trong phạm vi sở thích / mong muốn của người chơi
      const matchedSports = venueSports.filter((sk) => activeSportSet.has(sk))
      if (matchedSports.length === 0) return null

      const address = fac.address || fac.street || ''
      const distanceKm = calculateDistanceFromRegisteredAddress({
        registeredAddress: userProfileLocation,
        targetAddress: `${fac.name || ''} ${address}`,
        targetLat: fac.lat ?? fac.latitude,
        targetLng: fac.lng ?? fac.longitude,
        itemSeed: fac.id || fac.name,
      })

      if (!matchesRangeFilter(distanceKm)) return null

      // Kiểm tra từ khóa tìm kiếm mong muốn (nếu người chơi đang nhập từ khóa)
      if (normKeyword) {
        const searchable = normalizeVi(
          `${fac.name || ''} ${address} ${matchedSports.map((k) => SPORT_CATALOG[k]?.name).join(' ')} ${fac.description || ''}`
        )
        if (keywordDistrict) {
          const facDist = detectDistrictKey(`${fac.name || ''} ${address}`)
          if (facDist !== keywordDistrict && !searchable.includes(normKeyword)) return null
        } else if (
          remainingKeywordTokens.length > 0 &&
          keywordSports.length === 0 &&
          !remainingKeywordTokens.some((tok) => searchable.includes(tok))
        ) {
          return null
        }
      }

      // Tính số kèo đang mở tại sàn này (đúng môn của người chơi)
      const openMatchesAtVenue = (Array.isArray(matches) ? matches : []).filter((m) => {
        if (!activeSportSet.has(m.sport)) return false
        const mLoc = normalizeVi(m.location || '')
        const fName = normalizeVi(fac.name || '')
        return (fName && mLoc.includes(fName)) || (fac.id && m.facilityId === fac.id)
      })

      // Xây dựng nhãn lý do đề xuất (Match Reasons)
      const reasons = []
      let relevanceScore = 0

      const matchedProfileSports = matchedSports.filter((sk) => profileSportKeys.includes(sk))
      const matchedLearnedSports = matchedSports.filter(
        (sk) => !profileSportKeys.includes(sk) && learnedSportKeys.includes(sk)
      )

      if (matchedProfileSports.length > 0) {
        const names = matchedProfileSports.map((sk) => `${SPORT_CATALOG[sk]?.emoji} ${SPORT_CATALOG[sk]?.name}`).join(', ')
        reasons.push({ type: 'profile', label: `Đúng môn Hồ sơ: ${names}` })
        relevanceScore += 30
      }
      if (matchedLearnedSports.length > 0) {
        const names = matchedLearnedSports.map((sk) => `${SPORT_CATALOG[sk]?.emoji} ${SPORT_CATALOG[sk]?.name}`).join(', ')
        reasons.push({ type: 'learned', label: `Bổ sung theo tìm kiếm mới: ${names}` })
        relevanceScore += 25
      }
      if (habits.visitedFacilities?.some((vf) => vf && normalizeVi(fac.name || '').includes(vf))) {
        reasons.push({ type: 'habit', label: 'Sàn quen thuộc trong thói quen của bạn' })
        relevanceScore += 20
      }
      if (openMatchesAtVenue.length > 0) {
        reasons.push({ type: 'active_lfg', label: `Đang có ${openMatchesAtVenue.length} kèo ghép mở` })
        relevanceScore += 15
      }

      const rangeInfo = getDistanceRangeInfo(distanceKm)
      const primarySportKey = matchedSports[0]
      const primarySportMeta = SPORT_CATALOG[primarySportKey] || SPORT_CATALOG.badminton

      return {
        id: fac.id || fac.facilityId,
        name: fac.name,
        address: address || 'TP. Hồ Chí Minh',
        image:
          fac.image ||
          fac.imageItems?.find((i) => i.isThumbnail)?.url ||
          fac.images?.[0] ||
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop',
        matchedSports,
        primarySportKey,
        primarySportMeta,
        price: Number(fac.price || fac.minPrice || 100000),
        courtCount: fac.courtCount || fac.courts?.length || 4,
        rating: fac.rating || fac.averageRating || 4.8,
        reviewCount: fac.reviewCount || 36,
        openTime: fac.openTime?.slice(0, 5) || '06:00',
        closeTime: fac.closeTime?.slice(0, 5) || '22:00',
        openMatchesCount: openMatchesAtVenue.length,
        distanceKm,
        etaMinutes: Math.max(3, Math.round(distanceKm * 2.5)),
        rangeInfo,
        reasons,
        relevanceScore,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sắp xếp từ trên xuống dưới theo khoảng cách: nơi gần địa chỉ đăng ký nhất -> nơi xa nhất
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm
      return b.relevanceScore - a.relevanceScore
    })

  // ----------------------------------------------------------------------------
  // HẠNG MỤC 2: SUGGEST KÈO GHÉP (LFG MATCHES)
  // ----------------------------------------------------------------------------
  const suggestedMatches = (Array.isArray(matches) ? matches : [])
    .map((m) => {
      const mSport = normalizeSportKey(m.sport || m.sportBadge || m.title) || 'badminton'
      // Ràng buộc nghiêm ngặt: Không bao giờ đề xuất kèo ngoài sở thích, thói quen và mong muốn
      if (!activeSportSet.has(mSport)) return null

      // Kiểm tra khung giờ người chơi mong muốn
      const mTimeSlot = m.timeSlot || 'evening'
      if (keywordTimeSlot && mTimeSlot !== keywordTimeSlot) return null
      if (
        Array.isArray(activeFilters.timeSlots) &&
        activeFilters.timeSlots.length > 0 &&
        !activeFilters.timeSlots.includes(mTimeSlot)
      ) {
        return null
      }

      // Kiểm tra trình độ nếu người chơi đang lọc trình độ cụ thể
      const mSkillKey = normalizeSkillKey(m.levelTag)
      const desiredSkill =
        keywordSkill ||
        (activeFilters.level && activeFilters.level !== 'all' ? activeFilters.level : null)
      if (desiredSkill && mSkillKey !== 'all' && mSkillKey !== desiredSkill) {
        return null
      }

      // Tính khoảng cách từ địa chỉ đã đăng ký đến sân của kèo
      const distanceKm = calculateDistanceFromRegisteredAddress({
        registeredAddress: userProfileLocation,
        targetAddress: m.location || m.title || '',
        targetLat: m.lat ?? null,
        targetLng: m.lng ?? null,
        itemSeed: m.id || m.title,
      })

      if (!matchesRangeFilter(distanceKm)) return null

      // Kiểm tra từ khóa tìm kiếm mong muốn
      if (normKeyword) {
        const searchable = normalizeVi(
          `${m.title || ''} ${m.location || ''} ${m.groupDesc || ''} ${m.sportBadge || ''} ${m.levelTag || ''}`
        )
        if (keywordDistrict) {
          const mDist = detectDistrictKey(m.location || m.title || '')
          if (mDist !== keywordDistrict && !searchable.includes(normKeyword)) return null
        } else if (
          remainingKeywordTokens.length > 0 &&
          keywordSports.length === 0 &&
          ! keywordTimeSlot &&
          !keywordSkill &&
          !remainingKeywordTokens.some((tok) => searchable.includes(tok))
        ) {
          return null
        }
      }

      // Xây dựng nhãn lý do đề xuất (Match Reasons)
      const reasons = []
      let relevanceScore = 0
      const profileSportObj = profileSports.find((ps) => ps.sportKey === mSport)
      const learnedSportObj = (learnedDesires.sports || []).find((ls) => ls.key === mSport)

      if (profileSportObj) {
        reasons.push({
          type: 'profile',
          label: `Môn Hồ sơ: ${SPORT_CATALOG[mSport]?.emoji} ${SPORT_CATALOG[mSport]?.name}`,
        })
        relevanceScore += 35

        if (mSkillKey === profileSportObj.skillKey || mSkillKey === 'all') {
          reasons.push({
            type: 'skill',
            label: `Khớp trình độ Hồ sơ (${profileSportObj.skillLabel})`,
          })
          relevanceScore += 20
        }
      } else if (learnedSportObj) {
        reasons.push({
          type: 'learned',
          label: `Bổ sung theo tìm kiếm mới: ${learnedSportObj.emoji} ${learnedSportObj.label}`,
        })
        relevanceScore += 30
      } else if (habitSportKeys.includes(mSport)) {
        reasons.push({
          type: 'habit',
          label: `Theo thói quen ghép trận: ${SPORT_CATALOG[mSport]?.name}`,
        })
        relevanceScore += 25
      }

      if (habits.favoriteTimeSlots?.includes(mTimeSlot)) {
        reasons.push({
          type: 'habit_time',
          label: `Đúng thói quen ${TIME_SLOT_META[mTimeSlot]?.shortLabel}`,
        })
        relevanceScore += 15
      } else if (
        includeLearnedDesires &&
        (learnedDesires.timeSlots || []).some((t) => t.key === mTimeSlot)
      ) {
        reasons.push({
          type: 'learned_time',
          label: `Khung giờ tìm kiếm mới (${TIME_SLOT_META[mTimeSlot]?.shortLabel})`,
        })
        relevanceScore += 15
      }

      const rangeInfo = getDistanceRangeInfo(distanceKm)

      return {
        ...m,
        sport: mSport,
        distanceKm,
        etaMinutes: Math.max(3, Math.round(distanceKm * 2.5)),
        rangeInfo,
        reasons,
        relevanceScore,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sắp xếp từ trên xuống dưới theo khoảng cách: nơi gần địa chỉ đăng ký nhất -> nơi xa nhất
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm
      return b.relevanceScore - a.relevanceScore
    })

  // ----------------------------------------------------------------------------
  // HẠNG MỤC 3: SUGGEST BẢNG TIN CỘNG ĐỒNG (COMMUNITY POSTS)
  // ----------------------------------------------------------------------------
  const suggestedPosts = (Array.isArray(communityPosts) ? communityPosts : [])
    .map((post) => {
      const explicitSport = normalizeSportKey(
        post.sportName || post.sportBadge || post.sharedLfg?.sportName || ''
      )
      const textSports = detectSportsInText(
        `${post.content || ''} ${post.sharedLfg?.facilityName || ''} ${post.sharedTournament?.name || ''}`
      )
      const postSports = Array.from(new Set([explicitSport, ...textSports].filter(Boolean)))

      // Ràng buộc nghiêm ngặt:
      // Bài viết cộng đồng phải thuộc môn thể thao trong sở thích/thói quen/mong muốn của người chơi.
      // Nếu bài viết gắn môn khác hoặc nhắc tới môn ngoài phạm vi -> loại bỏ hoàn toàn.
      const matchedPostSports = postSports.filter((sk) => activeSportSet.has(sk))
      if (postSports.length > 0 && matchedPostSports.length === 0) {
        return null
      }
      // Nếu bài viết không gắn môn rõ ràng, kiểm tra xem nội dung có khớp từ khóa mong muốn của người chơi không;
      // nếu không, gắn với môn chính trong hồ sơ khi bài viết mang tính giao lưu cùng khu vực
      const effectiveSportKey =
        matchedPostSports[0] ||
        (profileSportKeys[0] && activeSportSet.has(profileSportKeys[0])
          ? profileSportKeys[0]
          : Array.from(activeSportSet)[0] || 'badminton')

      if (!activeSportSet.has(effectiveSportKey)) return null

      const postLocationText =
        post.location ||
        post.sharedLfg?.facilityAddress ||
        post.sharedLfg?.facilityName ||
        post.sharedTournament?.facilityName ||
        post.content ||
        userProfileLocation

      const distanceKm = calculateDistanceFromRegisteredAddress({
        registeredAddress: userProfileLocation,
        targetAddress: postLocationText,
        targetLat: post.sharedLfg?.latitude ?? null,
        targetLng: post.sharedLfg?.longitude ?? null,
        itemSeed: post.id || post.postId || post.content?.slice(0, 24),
      })

      if (!matchesRangeFilter(distanceKm)) return null

      if (normKeyword) {
        const searchable = normalizeVi(
          `${post.content || ''} ${post.authorName || ''} ${post.sportName || ''} ${post.sharedLfg?.facilityName || ''}`
        )
        if (
          remainingKeywordTokens.length > 0 &&
          keywordSports.length === 0 &&
          !remainingKeywordTokens.some((tok) => searchable.includes(tok))
        ) {
          return null
        }
      }

      const reasons = []
      let relevanceScore = 0
      const sportMeta = SPORT_CATALOG[effectiveSportKey] || SPORT_CATALOG.badminton

      if (profileSportKeys.includes(effectiveSportKey)) {
        reasons.push({
          type: 'profile',
          label: `Cộng đồng môn Hồ sơ: ${sportMeta.emoji} ${sportMeta.name}`,
        })
        relevanceScore += 30
      } else if (learnedSportKeys.includes(effectiveSportKey)) {
        reasons.push({
          type: 'learned',
          label: `Theo tìm kiếm mới: ${sportMeta.emoji} ${sportMeta.name}`,
        })
        relevanceScore += 25
      } else {
        reasons.push({
          type: 'habit',
          label: `Theo thói quen: ${sportMeta.emoji} ${sportMeta.name}`,
        })
        relevanceScore += 20
      }

      if (post.sharedLfg) {
        reasons.push({ type: 'shared_lfg', label: 'Có đính kèm Kèo ghép đang tuyển' })
        relevanceScore += 15
      }

      const rangeInfo = getDistanceRangeInfo(distanceKm)
      const detectedDistKey = detectDistrictKey(postLocationText)
      const areaLabel = detectedDistKey
        ? DISTRICT_INFO[detectedDistKey]?.name
        : post.sharedLfg?.facilityName || userProfileLocation

      return {
        ...post,
        id: post.id || post.postId,
        effectiveSportKey,
        sportMeta,
        sportDisplayBadge: post.sportName || post.sportBadge || sportMeta.name,
        areaLabel,
        distanceKm,
        etaMinutes: Math.max(3, Math.round(distanceKm * 2.5)),
        rangeInfo,
        reasons,
        relevanceScore,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sắp xếp từ trên xuống dưới theo khoảng cách: nơi gần địa chỉ đăng ký nhất -> nơi xa nhất
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm
      return b.relevanceScore - a.relevanceScore
    })

  // Gom nhóm theo Range từ trên xuống dưới (Range 1 -> Range 2 -> Range 3 -> Range 4)
  const groupByRange = (items) =>
    DISTANCE_RANGES.map((range) => ({
      range,
      items: items.filter((item) => item.rangeInfo?.key === range.key),
    })).filter((group) => group.items.length > 0)

  const allowedSportKeysArr = Array.from(allAllowedSportSet)
  Object.defineProperty(allowedSportKeysArr, 'has', {
    value: (key) => allAllowedSportSet.has(key),
    enumerable: false,
  })
  const activeSportKeysArr = Array.from(activeSportSet)
  Object.defineProperty(activeSportKeysArr, 'has', {
    value: (key) => activeSportSet.has(key),
    enumerable: false,
  })

  return {
    allowedSportKeys: allowedSportKeysArr,
    activeSportKeys: activeSportKeysArr,
    profileSportKeys,
    learnedSportKeys,
    suggestedVenues,
    suggestedMatches,
    suggestedPosts,
    venuesByRange: groupByRange(suggestedVenues),
    matchesByRange: groupByRange(suggestedMatches),
    postsByRange: groupByRange(suggestedPosts),
  }
}

