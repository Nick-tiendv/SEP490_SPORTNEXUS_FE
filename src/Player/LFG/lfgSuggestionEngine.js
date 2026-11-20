// lfgSuggestionEngine.js — Hệ thống Đề xuất Thông minh Cá nhân hóa cho trang Ghép trận LFG
// Đề xuất 3 hạng mục: Sàn ghép trận (Venues), Kèo ghép (LFG Matches), Bảng tin cộng đồng (Community Posts)
// Nguyên tắc cốt lõi:
// 1. Khởi tạo dựa theo môn thể thao & trình độ người chơi đã điền trong Profile khi đăng ký tài khoản.
// 2. Theo thời gian, khi người chơi sử dụng tìm kiếm / bộ lọc theo mong muốn mới, tự động học và cho phép
//    suggest bổ sung các nhu cầu thay đổi mới đó.
// 3. Tuyệt đối KHÔNG đề xuất ngoài sở thích cá nhân (Profile), thói quen (Habits) và đặc biệt là mong muốn (Desires) của người chơi.
// 4. Sắp xếp từ trên xuống dưới theo Range khoảng cách: từ nơi gần địa chỉ đã đăng ký nhất đến nơi xa nhất.

const LEARNED_DESIRES_STORAGE_KEY = 'player_lfg_learned_desires'

// Phần trang trí theo khóa môn (emoji, màu, từ khóa nhận diện trong câu tìm kiếm). KHÔNG phải danh sách môn:
// danh sách môn thật lấy từ GET /api/v1/master-data/sports qua setSportCatalog().
const SPORT_DECOR = {
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

// Danh mục môn thật của hệ thống (rỗng cho tới khi setSportCatalog nạp từ API). Giữ cùng 1 object để các hàm đọc lúc gọi.
export const SPORT_CATALOG = {}
// Trang trí mặc định cho môn chưa có trong SPORT_DECOR (vd Admin vừa thêm môn mới)
const DEFAULT_SPORT_DECOR = { emoji: '🏅', color: '#475569', bgColor: '#F1F5F9', keywords: [] }

// Nạp danh mục môn từ GET /api/v1/master-data/sports: tên môn theo BE, trang trí theo khóa môn nếu FE đã biết.
export function setSportCatalog(apiSports = []) {
  for (const key of Object.keys(SPORT_CATALOG)) delete SPORT_CATALOG[key]
  for (const sport of apiSports) {
    const name = String(sport?.name || '').trim()
    if (!name) continue
    const key = normalizeSportKey(name) || normalizeVi(name).replace(/\s+/g, '_')
    const decor = SPORT_DECOR[key] || DEFAULT_SPORT_DECOR
    SPORT_CATALOG[key] = {
      ...decor,
      key,
      id: sport.id,
      name,
      shortName: name,
      rulesDescription: sport.rulesDescription || '',
      keywords: [...new Set([...decor.keywords, name])],
    }
  }
}

// Thông tin hiển thị (tên, emoji, màu) của một khóa môn; môn lạ dùng trang trí mặc định
export const sportMetaOf = (key) => SPORT_CATALOG[key] || SPORT_DECOR[key] || DEFAULT_SPORT_DECOR

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
// KHOẢNG CÁCH & PHÂN TẦNG RANGE (ĐỌC TRỰC TIẾP distanceKm TỪ API, KHÔNG TỰ TÍNH Ở FE)
// ============================================================================
const readApiDistanceKm = (item) => {
  if (!item || typeof item !== 'object') return null
  const raw = item.distanceKm ?? item.distance_km
  if (raw === null || raw === undefined || raw === '') return null
  const num = Number(raw)
  return Number.isFinite(num) && num >= 0 ? num : null
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

export function getDistanceRangeInfo(distanceKm = null) {
  if (distanceKm === null || distanceKm === undefined || distanceKm === '') {
    return {
      id: 'range_unknown',
      key: 'unknown',
      tier: 99,
      minKm: null,
      maxKm: Infinity,
      title: 'Chưa xác định khoảng cách',
      shortTitle: 'Chưa rõ khoảng cách',
      desc: 'Cập nhật vị trí khảo sát hoặc chọn cơ sở có tọa độ để tính khoảng cách chính xác',
      badgeClass: 'bg-gray-50 text-gray-600 border-gray-200',
      headerClass: 'from-slate-600 to-slate-700',
    }
  }
  const d = Number(distanceKm)
  if (!Number.isFinite(d)) {
    return {
      id: 'range_unknown',
      key: 'unknown',
      tier: 99,
      minKm: null,
      maxKm: Infinity,
      title: 'Chưa xác định khoảng cách',
      shortTitle: 'Chưa rõ khoảng cách',
      desc: 'Cập nhật vị trí khảo sát hoặc chọn cơ sở có tọa độ để tính khoảng cách chính xác',
      badgeClass: 'bg-gray-50 text-gray-600 border-gray-200',
      headerClass: 'from-slate-600 to-slate-700',
    }
  }
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

  // 4. Lưu khu vực tìm kiếm nếu người dùng chọn/truyền khu vực cụ thể (không tự gán cứng danh sách quận TP.HCM)
  const rawDistrict = typeof districtKey === 'string' ? districtKey.trim() : ''
  if (rawDistrict) {
    const distSlug = normalizeVi(rawDistrict).replace(/[^a-z0-9]/g, '') || rawDistrict
    const existingDist = current.districts.find((d) => d.key === distSlug)
    if (existingDist) {
      existingDist.count = (existingDist.count || 1) + 1
      existingDist.updatedAt = nowIso
    } else {
      current.districts.unshift({
        key: distSlug,
        label: rawDistrict,
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
  userProfileLocation = '',
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
  // Người chơi chưa có môn nào (hồ sơ / thói quen / tìm kiếm): không giới hạn theo môn, dùng mọi môn của hệ thống
  if (allAllowedSportSet.size === 0) {
    Object.keys(SPORT_CATALOG).forEach((key) => allAllowedSportSet.add(key))
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
    activeSportSet = new Set(profileSportKeys.length > 0 ? profileSportKeys : allAllowedSportSet)
  } else if (keywordSports.length > 0) {
    activeSportSet = new Set(keywordSports)
  }

  // 2. Xác định các tiêu chí mong muốn hiện tại từ thanh tìm kiếm & bộ lọc
  const normKeyword = normalizeVi(activeFilters.keyword)
  const keywordTimeSlot = detectTimeSlotInText(activeFilters.keyword)
  const keywordSkill = detectSkillInText(activeFilters.keyword)

  // Lọc bỏ các từ chỉ môn/khung giờ/trình độ để lấy từ khóa tìm kiếm nội dung/địa điểm còn lại
  const remainingKeywordTokens = normKeyword
    .split(/\s+/)
    .filter((tok) => tok.length >= 2)
    .filter((tok) => !['keo', 'ghep', 'san', 'tim', 'choi', 'giao', 'luu', 'ca', 'buoi', 'trinh', 'do'].includes(tok))

  const matchesRangeFilter = (distanceKm) => {
    if (activeFilters.maxDistanceKm != null) {
      if (distanceKm == null || distanceKm > Number(activeFilters.maxDistanceKm)) return false
    }
    if (!activeFilters.distanceRangeKey || activeFilters.distanceRangeKey === 'all') {
      return true
    }
    if (distanceKm == null) return false
    const rangeInfo = getDistanceRangeInfo(distanceKm)
    return rangeInfo.key === activeFilters.distanceRangeKey
  }

  const compareByDistanceAndRelevance = (a, b) => {
    const ad = a.distanceKm ?? Infinity
    const bd = b.distanceKm ?? Infinity
    if (ad !== bd) return ad - bd
    return (b.relevanceScore || 0) - (a.relevanceScore || 0)
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

      const venueSports = Array.from(rawSports)
      // Chỉ giữ các môn nằm trong phạm vi sở thích / mong muốn của người chơi
      const matchedSports = venueSports.filter((sk) => activeSportSet.has(sk))
      if (matchedSports.length === 0) return null

      const address = fac.address || fac.street || ''
      const distanceKm = readApiDistanceKm(fac)

      if (!matchesRangeFilter(distanceKm)) return null

      // Kiểm tra từ khóa tìm kiếm mong muốn (nếu người chơi đang nhập từ khóa)
      if (normKeyword) {
        const searchable = normalizeVi(
          `${fac.name || ''} ${address} ${fac.provinceName || fac.province || ''} ${fac.districtName || fac.district || ''} ${matchedSports.map((k) => SPORT_CATALOG[k]?.name).join(' ')} ${fac.description || ''}`
        )
        if (
          remainingKeywordTokens.length > 0 &&
          keywordSports.length === 0 &&
          !searchable.includes(normKeyword) &&
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
      const primarySportMeta = SPORT_CATALOG[primarySportKey] || { ...DEFAULT_SPORT_DECOR, key: primarySportKey || '', name: '' }

      return {
        id: fac.id || fac.facilityId,
        name: fac.name,
        address: address || fac.provinceName || fac.province || '',
        image:
          fac.image ||
          fac.imageItems?.find((i) => i.isThumbnail)?.url ||
          fac.images?.[0] ||
          '/sports-bg.jpg',
        matchedSports,
        primarySportKey,
        primarySportMeta,
        price: Number(fac.price || fac.minPrice || 0),
        courtCount: fac.courtCount ?? fac.courts?.length ?? 0,
        rating: fac.rating ?? (fac.averageRating > 0 ? fac.averageRating : null),
        reviewCount: Number(fac.reviewCount) || 0,
        openTime: fac.openTime ? fac.openTime.slice(0, 5) : '',
        closeTime: fac.closeTime ? fac.closeTime.slice(0, 5) : '',
        openMatchesCount: openMatchesAtVenue.length,
        distanceKm,
        etaMinutes: distanceKm != null ? Math.max(3, Math.round(distanceKm * 2.5)) : null,
        rangeInfo,
        reasons,
        relevanceScore,
      }
    })
    .filter(Boolean)
    .sort(compareByDistanceAndRelevance)

  // ----------------------------------------------------------------------------
  // HẠNG MỤC 2: SUGGEST KÈO GHÉP (LFG MATCHES)
  // ----------------------------------------------------------------------------
  const suggestedMatches = (Array.isArray(matches) ? matches : [])
    .map((m) => {
      const mSport = normalizeSportKey(m.sport || m.sportBadge || m.title) || ''
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

      // Đọc trực tiếp khoảng cách distanceKm mà API trả về trên từng kèo
      const distanceKm = readApiDistanceKm(m)

      if (!matchesRangeFilter(distanceKm)) return null

      // Kiểm tra từ khóa tìm kiếm mong muốn
      if (normKeyword) {
        const searchable = normalizeVi(
          `${m.title || ''} ${m.location || ''} ${m.groupDesc || ''} ${m.sportBadge || ''} ${m.levelTag || ''}`
        )
        if (
          remainingKeywordTokens.length > 0 &&
          keywordSports.length === 0 &&
          !keywordTimeSlot &&
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
        etaMinutes: distanceKm != null ? Math.max(3, Math.round(distanceKm * 2.5)) : null,
        rangeInfo,
        reasons,
        relevanceScore,
      }
    })
    .filter(Boolean)
    .sort(compareByDistanceAndRelevance)

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
          : Array.from(activeSportSet)[0] || '')

      if (!activeSportSet.has(effectiveSportKey)) return null

      const distanceKm = readApiDistanceKm(post) ?? readApiDistanceKm(post.sharedLfg)

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
      const sportMeta = SPORT_CATALOG[effectiveSportKey] || { ...DEFAULT_SPORT_DECOR, key: effectiveSportKey || '', name: '' }

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
      const areaLabel =
        post.location ||
        post.sharedLfg?.facilityAddress ||
        post.sharedLfg?.facilityName ||
        post.sharedTournament?.facilityName ||
        userProfileLocation ||
        ''

      return {
        ...post,
        id: post.id || post.postId,
        effectiveSportKey,
        sportMeta,
        sportDisplayBadge: post.sportName || post.sportBadge || sportMeta.name,
        areaLabel,
        distanceKm,
        etaMinutes: distanceKm != null ? Math.max(3, Math.round(distanceKm * 2.5)) : null,
        rangeInfo,
        reasons,
        relevanceScore,
      }
    })
    .filter(Boolean)
    .sort(compareByDistanceAndRelevance)

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

