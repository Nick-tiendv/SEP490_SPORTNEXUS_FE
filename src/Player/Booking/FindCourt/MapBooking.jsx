import { useCallback, useEffect, useMemo, useRef, useState, useEffectEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSlotOpen, normalizeCourtSlots } from '../Recurring/courtSlots.js'
import { useRepeatBooking } from '../Recurring/useRepeatBooking.js'
import RepeatBookingPanel from '../Recurring/RepeatBookingPanel.jsx'
import MonthCalendarPicker from './MonthCalendarPicker.jsx'
import { BULK_DISCOUNT_PERCENT, BULK_MIN_SLOTS, bulkDiscount } from '../Recurring/recurringBooking.js'
import { toast } from 'sonner'
import { useSport } from '../../Context/sportContext.js'
import { getFacilities, getFacilityLocations, searchFacilities, transformFacilityToCourt, getAmenityOptions } from '../../../api/player/facilityApi.js'
import { getOnboarding } from '../../../api/player/ratingApi.js'
import { getCourtSlots } from '../../../api/player/bookingApi.js'
import { GEOCODE_DEBOUNCE_MS, geocodeAddress, reverseGeocode } from '../../../utils/geolocation.js'
import { clearBookingOrigin, readSavedBookingOrigin, saveBookingOrigin } from '../../../utils/playerOrigin.js'
import { vnClock } from '../../../utils/vnTime.js'
import AIChatModal from '../AIChat/AIChatModal.jsx'
import InteractiveCourtMap from './InteractiveCourtMap.jsx'
import './MapBooking.css'

const HOLD_SECONDS = 15 * 60

// Bỏ dấu tiếng Việt + chữ thường để tìm kiếm không phân biệt dấu
const normalizeText = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const parseCoord = (v) => {
  if (v === null || v === undefined || v === '') return null
  const num = Number(v)
  return Number.isFinite(num) ? num : null
}

// Công thức tính khoảng cách Haversine chính xác theo tọa độ GPS (km)
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const nLat1 = parseCoord(lat1)
  const nLon1 = parseCoord(lon1)
  const nLat2 = parseCoord(lat2)
  const nLon2 = parseCoord(lon2)
  if (nLat1 == null || nLon1 == null || nLat2 == null || nLon2 == null) return null
  const R = 6371 // Bán kính Trái Đất theo km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// Bán kính tìm sân quanh một địa chỉ cụ thể (khi không có ranh giới khu vực)
const AREA_RADIUS_KM = 3
// Sai số GPS tối đa còn dùng làm điểm xuất phát (vị trí đoán theo IP / Wi-Fi thường > 1 km)
const GPS_TRUST_METERS = 1000
// Lọc khung giờ: 05:00 → 23:00, bước 15 phút (ca sân là bội số 15 phút) và các buổi chọn nhanh
const HOUR_OPTIONS = Array.from({ length: 18 * 4 + 1 }, (_, i) => {
  const minutes = 5 * 60 + i * 15
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})
const TIME_PRESETS = [
  { label: 'Sáng', from: '05:00', to: '11:00' },
  { label: 'Chiều', from: '11:00', to: '17:00' },
  { label: 'Tối', from: '17:00', to: '23:00' },
]

// Số nút khu vực gợi ý tối đa ở ô "Khu vực" (nút tỉnh / thành luôn hiện đủ)
const MAX_AREA_CHIPS = 10

// Gộp các cách ghi tỉnh / thành (BE có dữ liệu ghi khác nhau, vd "TP.HCM", "Hồ Chí Minh")
const PROVINCE_ALIASES = [
  { label: 'TP. Hồ Chí Minh', test: /ho chi|hcm|sai gon/ },
  { label: 'Hà Nội', test: /ha noi/ },
  { label: 'Đà Nẵng', test: /da nang/ },
]
// Tỉnh / phường (khu vực) của cơ sở: ưu tiên trường của BE, thiếu thì lấy từ địa chỉ "…, Phường, Tỉnh"
const areaOfCourt = (court) => {
  const parts = String(court.address || '').split(',').map((p) => p.trim()).filter(Boolean)
  const lastPart = parts[parts.length - 1] || ''
  const known = [court.provinceName, lastPart].map((p) => p && PROVINCE_ALIASES.find((a) => a.test.test(normalizeText(p)))?.label).find(Boolean)
  const province = known || court.provinceName || lastPart
  const district = String(court.districtName || (parts.length >= 3 ? parts[parts.length - 2] : '')).trim()
  return { province, district: normalizeText(district) === normalizeText(province) ? '' : district }
}
// Khung bao quanh các điểm (nới rộng một chút để ghim không nằm sát mép)
const boundsOfPoints = (points) => {
  if (!points?.length) return null
  const lats = points.map((p) => p[0])
  const lngs = points.map((p) => p[1])
  const pad = 0.01
  return [[Math.min(...lats) - pad, Math.min(...lngs) - pad], [Math.max(...lats) + pad, Math.max(...lngs) + pad]]
}

// Tính khoảng cách thực (km) từ điểm xuất phát của người chơi tới sân bằng Haversine; thiếu tọa độ trả null
const getDistanceForCourt = (court, liveCoords = null) => {
  if (!liveCoords || liveCoords.lat == null || liveCoords.lng == null || court?.lat == null || court?.lng == null) {
    return null
  }
  const d = haversineDistanceKm(liveCoords.lat, liveCoords.lng, court.lat, court.lng)
  return d != null ? Math.max(0.2, d) : null
}

const formatVnd = (n) => `${(Number(n) || 0).toLocaleString('vi-VN')} Điểm`

const SPORT_SEARCH_TEXT = {
  badminton: 'cầu lông cau long badminton',
  pickleball: 'pickleball',
}

// Chuỗi tìm kiếm tổng hợp của mỗi cụm sân
const searchIndexOf = (c) =>
  normalizeText(
    [
      c.name,
      c.street,
      c.address,
      c.provinceName,
      c.districtName,
      c.mapQuery,
      c.subCourt,
      c.subCourtDesc,
      SPORT_SEARCH_TEXT[c.sport] || '',
    ].join(' ')
  )

// Các từ dừng thông dụng khi người dùng tìm kiếm sân cầu lông/pickleball
const STOP_WORDS = new Set([
  'san', 'clb', 'cum', 'khu', 'tim', 'dat', 'o', 'tai', 'gan', 'cho',
  'the', 'thao', 'tt', 'phuong', 'xa', 'tinh', 'quan', 'tp', 'thanh', 'pho', 'duong',
  'gia', 're', 'dep', 'tot', 'gan', 'day', 'nhat', 'kiem'
])

const cleanSearchTokens = (text = '') => {
  const norm = normalizeText(text)
  return norm
    .split(/[\s,._\-+/]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
}

const matchesQuery = (court, query) => {
  const qClean = (query || '').trim()
  if (!qClean) return true

  const rawIndex = searchIndexOf(court)
  const compactIndex = rawIndex.replace(/[^a-z0-9]/g, '')
  const compactQuery = normalizeText(qClean).replace(/[^a-z0-9]/g, '')

  // 1. Khớp chuỗi trực tiếp
  if (compactIndex.includes(compactQuery) || compactQuery.includes(compactIndex)) return true

  // 2. Lọc bỏ các từ đệm ("sân", "clb", "tìm", "đặt", "ở", "gần"...)
  const meaningfulTokens = cleanSearchTokens(qClean)
  if (!meaningfulTokens.length) {
    // Nếu người dùng chỉ gõ "sân" hoặc "clb", trả về true
    return true
  }

  // Khớp chuỗi token ghép liền (vd: "lananh" khớp "clb the thao lan anh")
  const joinedTokens = meaningfulTokens.join('')
  if (compactIndex.includes(joinedTokens)) return true

  // 3. Khớp theo tỷ lệ các từ khóa cốt lõi
  const matchedCount = meaningfulTokens.filter((token) => compactIndex.includes(token)).length
  return matchedCount >= Math.ceil(meaningfulTokens.length * 0.5)
}

// Phân loại kết quả tìm kiếm: Tên sân, Tuyến đường hay Khu vực
const getMatchBadge = (court, q = '') => {
  const qClean = normalizeText(q).trim()
  if (!qClean) return null
  const compactQuery = qClean.replace(/[^a-z0-9]/g, '')
  const meaningfulTokens = cleanSearchTokens(qClean)

  // 1. Khớp tên sân
  const courtNameCompact = normalizeText(court.name).replace(/[^a-z0-9]/g, '')
  if (
    courtNameCompact.includes(compactQuery) ||
    meaningfulTokens.some((t) => courtNameCompact.includes(t))
  ) {
    return { type: 'court', label: 'Tên sân', className: 'mb-badge-court', icon: 'sports_tennis' }
  }

  // 2. Khớp tuyến đường
  const streetCompact = normalizeText(court.street || '').replace(/[^a-z0-9]/g, '')
  const addressCompact = normalizeText(court.address).replace(/[^a-z0-9]/g, '')
  if (
    (streetCompact && (streetCompact.includes(compactQuery) || compactQuery.includes(streetCompact))) ||
    addressCompact.includes(compactQuery)
  ) {
    return { type: 'street', label: 'Tuyến đường', className: 'mb-badge-street', icon: 'add_road' }
  }

  // 3. Khớp phường / tỉnh / khu vực
  const areaCompact = normalizeText([court.districtName, court.provinceName, court.address].filter(Boolean).join(' ')).replace(/[^a-z0-9]/g, '')
  if (areaCompact && (areaCompact.includes(compactQuery) || meaningfulTokens.some((t) => areaCompact.includes(t)))) {
    return { type: 'district', label: 'Khu vực', className: 'mb-badge-district', icon: 'map' }
  }

  return { type: 'general', label: 'Gần bạn', className: 'mb-badge-general', icon: 'near_me' }
}

// Tính lộ trình và thời gian di chuyển khi có khoảng cách thực theo tọa độ
const calculateRoute = (court, origin) => {
  if (!court) return { eta: 'Chưa xác định', note: '' }
  const dist = court.distance
  if (dist == null || !Number.isFinite(dist)) {
    return {
      eta: 'Chưa xác định khoảng cách (hãy bật GPS hoặc nhập vị trí xuất phát)',
      note: origin ? `Chỉ đường từ “${origin}” đến ${court.name}` : `Chỉ đường đến ${court.name}`,
    }
  }
  const mins = Math.max(3, Math.round(dist * 2.6))
  return {
    eta: `~${mins} phút di chuyển xe máy (${dist.toFixed(1)} km)`,
    note: origin ? `Tuyến đường tối ưu từ “${origin}” đến ${court.name}` : `Chỉ đường đến ${court.name}`,
  }
}

const splitHours = (h) => {
  const total = Math.round((Number(h) || 0) * 60)
  return { hh: Math.floor(total / 60), mm: total % 60 }
}
// "2 giờ", "30 phút", "1 giờ 30 phút"
const formatHours = (h) => {
  const { hh, mm } = splitHours(h)
  return [hh && `${hh} giờ`, mm && `${mm} phút`].filter(Boolean).join(' ') || '0 phút'
}
// Dạng gọn cho ô lưới: "2h", "30p", "1h30"
const shortHours = (h) => {
  const { hh, mm } = splitHours(h)
  if (!hh) return `${mm}p`
  return mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`
}
const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const pad2 = (n) => String(n).padStart(2, '0')
const localDateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

// Dải 7 ngày trên lưới ca = tuần (Thứ 2 → Chủ nhật) chứa ngày đang chọn. Ngày đã qua đánh dấu isPast.
function getWeekDays(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7))
  const now = new Date()
  const todayKey = localDateKey(now)
  const tomorrowKey = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const key = localDateKey(day)
    const dd = pad2(day.getDate())
    const mm = pad2(day.getMonth() + 1)
    const isToday = key === todayKey
    const isTomorrow = key === tomorrowKey
    const dayOfWeek = isToday ? 'Hôm nay' : isTomorrow ? 'Ngày mai' : dayNames[day.getDay()]
    return {
      dateStr: key,
      dayNum: day.getDate(),
      monthNum: day.getMonth() + 1,
      year: day.getFullYear(),
      dayOfWeek,
      shortLabel: isToday || isTomorrow ? dayOfWeek : `${day.getDay() === 0 ? 'CN' : `T${day.getDay() + 1}`}, ${dd}/${mm}`,
      fullLabel: `${dayOfWeek} (${dd}/${mm}/${day.getFullYear()})`,
      isToday,
      isTomorrow,
      isPast: key < todayKey,
    }
  })
}

function MapBooking() {
  const navigate = useNavigate()
  const { isSportActive, isAllActive, toggleSport, selectAllSports, SPORTS_LIST } = useSport()

  // Vị trí người chơi lấy từ Hồ sơ cá nhân hoặc khảo sát (không mặc định về Thủ Đức/TP.HCM)
  const [userProfileLocation, setUserProfileLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.location) return parsed.location
      }
    } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
    return ''
  })
  const [onboardingArea, setOnboardingArea] = useState({ coords: null, name: '' })
  const [onboardingLoaded, setOnboardingLoaded] = useState(false)
  useEffect(() => {
    let cancelled = false
    getOnboarding()
      .then((o) => {
        if (cancelled || o?.latitude == null || o?.longitude == null) return
        const coords = { lat: Number(o.latitude), lng: Number(o.longitude) }
        setOnboardingArea((prev) => ({ ...prev, coords }))
        reverseGeocode(coords.lat, coords.lng).then((name) => {
          if (!cancelled && name) setOnboardingArea((prev) => ({ ...prev, name }))
        })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOnboardingLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  // Điểm xuất phát tùy chỉnh (được đồng bộ với Ghép trận LFG qua playerOrigin)
  const [customOrigin, setCustomOrigin] = useState(() => {
    const saved = readSavedBookingOrigin()
    return saved?.source === 'custom' ? saved.customText || saved.label || '' : ''
  })
  const [isEditingOrigin, setIsEditingOrigin] = useState(false)

  // Tọa độ GPS thiết bị người chơi (lấy ngầm để tính khoảng cách và định vị chính xác)
  const [gpsCoords, setGpsCoords] = useState(null)
  const [gpsPlace, setGpsPlace] = useState({ key: '', name: '' })

  // Tìm kiếm & Lọc
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [isAllPrices, setIsAllPrices] = useState(true)
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')

  // Chọn ngày đặt sân (Hôm nay, Ngày mai, và các ngày tiếp theo)
  const todayIsoDate = useMemo(() => localDateKey(new Date()), [])
  const [selectedDateStr, setSelectedDateStr] = useState(() => todayIsoDate)
  const weekDays = useMemo(() => getWeekDays(selectedDateStr), [selectedDateStr])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const selectedDateInfo = useMemo(() => {
    const found = weekDays.find((d) => d.dateStr === selectedDateStr)
    if (found) return found
    try {
      const parts = selectedDateStr.split('-').map(Number)
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
      const dayOfWeek = dayNames[d.getDay()]
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      return {
        dateStr: selectedDateStr,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dayOfWeek,
        shortLabel: `${dayOfWeek}, ${day}/${month}`,
        fullLabel: `${dayOfWeek} (${day}/${month}/${d.getFullYear()})`,
        isToday: selectedDateStr === todayIsoDate,
        isTomorrow: false,
      }
    } catch {
      return {
        dateStr: selectedDateStr,
        dayNum: '',
        monthNum: '',
        dayOfWeek: '',
        shortLabel: selectedDateStr,
        fullLabel: selectedDateStr,
        isToday: selectedDateStr === todayIsoDate,
        isTomorrow: false,
      }
    }
  }, [weekDays, selectedDateStr, todayIsoDate])

  // Lấy dữ liệu cơ sở và khu vực thực tế từ Backend API (/api/v1/facilities, /api/v1/facilities/locations)
  const [apiFacilities, setApiFacilities] = useState([])
  const [apiLocations, setApiLocations] = useState([])
  const [apiStatus, setApiStatus] = useState('connecting')
  const isLoadingApi = apiStatus === 'connecting'

  // Cụm sân người dùng chủ động chọn, kèm vị trí xuất phát lúc chọn (sân hiển thị được suy ra bên dưới)
  const [courtPick, setCourtPick] = useState({ id: null, origin: null })

  // Ca người dùng chọn: null = tự chọn ca trống đầu tiên, '' = đã nhả chỗ khi hết giờ giữ
  // Các ca đang chọn trong ngày (chọn nhiều ca liền nhau / rời nhau). null = tự chọn ca trống đầu tiên, [] = đã bỏ chọn hết
  const [pickedSlotIds, setPickedSlotIds] = useState(null)
  const [holdLeft, setHoldLeft] = useState(HOLD_SECONDS)
  const [mapType, setMapType] = useState('m')
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const summaryRef = useRef(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setGpsCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 8),
        })
      },
      () => {
        setGpsCoords(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    )
  }, [])

  // Khu vực gợi ý kết hợp GET /api/v1/facilities/locations và các cơ sở đang hiển thị:
  // nút tỉnh / thành trước, sau đó các phường/quận có sân. Mỗi nút biết đúng danh sách cơ sở thuộc khu vực đó.
  const areaChips = useMemo(() => {
    const provinces = new Map()
    const canonProvince = (raw) => {
      const cleaned = String(raw || '').trim()
      if (!cleaned) return ''
      return PROVINCE_ALIASES.find((a) => a.test.test(normalizeText(cleaned)))?.label || cleaned
    }
    const ensureProvince = (name) => {
      const key = canonProvince(name)
      if (!key) return null
      if (!provinces.has(key)) provinces.set(key, { label: key, value: key, ids: new Set(), points: [], courts: [], districts: new Map() })
      return provinces.get(key)
    }
    const ensureDistrict = (prov, distName) => {
      const district = String(distName || '').trim()
      if (!prov || !district || normalizeText(district) === normalizeText(prov.label)) return null
      const value = `${district}, ${prov.label}`
      if (!prov.districts.has(value)) prov.districts.set(value, { label: district, value, province: prov.label, ids: new Set(), points: [], courts: [] })
      return prov.districts.get(value)
    }

    for (const loc of apiLocations) {
      const p = ensureProvince(loc?.province)
      if (!p) continue
      for (const dist of Array.isArray(loc?.districts) ? loc.districts : []) {
        ensureDistrict(p, dist)
      }
    }

    for (const court of apiFacilities) {
      const { province, district } = areaOfCourt(court)
      const p = ensureProvince(province)
      if (!p) continue
      const id = String(court.id)
      if (!p.ids.has(id)) {
        p.ids.add(id)
        p.courts.push(court)
        if (court.lat && court.lng) p.points.push([court.lat, court.lng])
      }
      const d = ensureDistrict(p, district)
      if (d && !d.ids.has(id)) {
        d.ids.add(id)
        d.courts.push(court)
        if (court.lat && court.lng) d.points.push([court.lat, court.lng])
      }
    }
    const provinceList = [...provinces.values()]
      .filter((p) => p.ids.size > 0)
      .sort((a, b) => b.ids.size - a.ids.size)
    const districtList = provinceList
      .flatMap((p) => [...p.districts.values()])
      .filter((d) => d.ids.size > 0)
      .sort((a, b) => b.ids.size - a.ids.size)
      .slice(0, MAX_AREA_CHIPS)
    return { provinces: provinceList, districts: districtList, all: [...provinceList, ...districtList] }
  }, [apiFacilities, apiLocations])
  const selectedAreaChip = useMemo(() => {
    const text = normalizeText(customOrigin.trim())
    return text ? areaChips.all.find((chip) => normalizeText(chip.value) === text) || null : null
  }, [areaChips, customOrigin])

  // Tọa độ của vị trí người dùng tự nhập (debounce 1 giây sau khi dừng gõ mới gọi API); chọn nút khu vực thì không cần tra
  const [customGeo, setCustomGeo] = useState(() => {
    const saved = readSavedBookingOrigin()
    const key = saved?.source === 'custom' ? saved.customText || saved.label || '' : ''
    return key && saved?.coords ? { key, coords: saved.coords } : { key: '', coords: null }
  })
  useEffect(() => {
    const text = customOrigin.trim()
    if (text.length < 2 || selectedAreaChip) return undefined
    let cancelled = false
    const timer = setTimeout(() => {
      geocodeAddress(text).then((coords) => { if (!cancelled) setCustomGeo({ key: text, coords }) })
    }, GEOCODE_DEBOUNCE_MS)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [customOrigin, selectedAreaChip])

  // Điểm xuất phát dùng cho ghim bản đồ, khoảng cách và chỉ đường:
  // vị trí tự nhập > GPS thiết bị > tọa độ khảo sát; thiếu cả ba trả null (không gán cứng tọa độ TP.HCM)
  const trustedGps = gpsCoords && gpsCoords.accuracy <= GPS_TRUST_METERS ? gpsCoords : null
  const gpsKey = trustedGps ? `${trustedGps.lat.toFixed(4)},${trustedGps.lng.toFixed(4)}` : ''
  useEffect(() => {
    if (!trustedGps) return undefined
    let cancelled = false
    reverseGeocode(trustedGps.lat, trustedGps.lng).then((name) => {
      if (!cancelled && name) setGpsPlace({ key: gpsKey, name })
    })
    return () => { cancelled = true }
  }, [trustedGps, gpsKey])
  const gpsLabel = gpsKey && gpsPlace.key === gpsKey ? gpsPlace.name : ''

  // Vị trí hiệu lực: ưu tiên địa chỉ người dùng tự nhập, sau đó đến GPS chính xác, hồ sơ hoặc khảo sát
  const effectiveOrigin = useMemo(() => {
    if (customOrigin.trim()) return customOrigin.trim()
    if (trustedGps && gpsLabel) return gpsLabel
    return userProfileLocation || onboardingArea.name || ''
  }, [customOrigin, trustedGps, gpsLabel, userProfileLocation, onboardingArea.name])

  const originPoint = useMemo(() => {
    const text = customOrigin.trim()
    // Nút khu vực: tâm của các cơ sở trong khu vực
    if (selectedAreaChip) {
      const pts = selectedAreaChip.points
      if (!pts.length) return null
      return { lat: pts.reduce((sum, p) => sum + p[0], 0) / pts.length, lng: pts.reduce((sum, p) => sum + p[1], 0) / pts.length }
    }
    const typed = text && customGeo.key === text ? customGeo.coords : null
    if (typed) return typed
    // Chỉ tin GPS khi đủ chính xác: máy tính không có GPS thường bị đoán theo IP, lệch hàng chục km
    if (trustedGps) return trustedGps
    return onboardingArea.coords || null
  }, [customOrigin, customGeo, trustedGps, onboardingArea.coords, selectedAreaChip])
  // Tên điểm xuất phát hiển thị: khớp với tọa độ đang dùng để tính khoảng cách
  const originLabel = customOrigin.trim()
    ? selectedAreaChip?.label && selectedAreaChip.province ? `${selectedAreaChip.label}, ${selectedAreaChip.province}` : customOrigin.trim()
    : trustedGps ? (gpsLabel || 'Vị trí hiện tại của bạn') : userProfileLocation || onboardingArea.name || 'Chưa xác định vị trí'

  // Đồng bộ điểm xuất phát hiện tại sang Ghép trận LFG (Hồ sơ ghép trận & Tạo kèo)
  useEffect(() => {
    const trimmedCustom = customOrigin.trim()
    if (trimmedCustom) {
      if (!selectedAreaChip && trimmedCustom.length >= 2 && customGeo.key !== trimmedCustom) return
      saveBookingOrigin({
        label: originLabel,
        lat: originPoint?.lat ?? null,
        lng: originPoint?.lng ?? null,
        source: 'custom',
        customText: trimmedCustom,
      })
      return
    }
    if (trustedGps) {
      saveBookingOrigin({
        label: gpsLabel || userProfileLocation || onboardingArea.name || 'Vị trí hiện tại của bạn',
        lat: trustedGps.lat,
        lng: trustedGps.lng,
        source: 'gps',
        customText: '',
      })
      return
    }
    if (!onboardingLoaded) return
    if (userProfileLocation || onboardingArea.coords || onboardingArea.name) {
      saveBookingOrigin({
        label: userProfileLocation || onboardingArea.name || '',
        lat: onboardingArea.coords?.lat ?? null,
        lng: onboardingArea.coords?.lng ?? null,
        source: userProfileLocation ? 'profile' : 'onboarding',
        customText: '',
      })
      return
    }
    clearBookingOrigin()
  }, [
    customOrigin,
    selectedAreaChip,
    customGeo,
    originLabel,
    originPoint,
    trustedGps,
    gpsLabel,
    userProfileLocation,
    onboardingArea,
    onboardingLoaded,
  ])

  // Khu vực người dùng nhập ở ô "Vị trí" → chỉ hiện sân trong khu vực đó.
  // Có ranh giới khu vực (tra địa chỉ) thì lọc theo ranh giới; địa chỉ cụ thể → bán kính quanh điểm đó.
  const [areaOffFor, setAreaOffFor] = useState('') // khu vực người dùng đã bấm "Xem tất cả"
  const searchArea = useMemo(() => {
    const label = customOrigin.trim()
    if (!label || areaOffFor === label) return null
    // Nút khu vực: lọc đúng các cơ sở thuộc khu vực theo dữ liệu, khung bản đồ bao quanh các cơ sở đó
    if (selectedAreaChip) {
      return { label: originLabel, ids: selectedAreaChip.ids, bounds: boundsOfPoints(selectedAreaChip.points) }
    }
    const typedPoint = customGeo.key === label ? customGeo.coords : null
    if (!typedPoint) return null // chưa tra được địa chỉ: chưa lọc
    const bounds = customGeo.key === label ? customGeo.coords?.bounds : null
    // Ranh giới ≥ ~1 km mới là khu vực; nhỏ hơn là một địa chỉ cụ thể
    if (bounds && (bounds.north - bounds.south > 0.009 || bounds.east - bounds.west > 0.009)) {
      return { label, bounds: [[bounds.south, bounds.west], [bounds.north, bounds.east]] }
    }
    return { label, center: { lat: typedPoint.lat, lng: typedPoint.lng }, radiusKm: AREA_RADIUS_KM }
  }, [customOrigin, customGeo, areaOffFor, selectedAreaChip, originLabel])
  const inSearchArea = useCallback((court) => {
    if (!searchArea) return true
    if (searchArea.ids) return searchArea.ids.has(String(court.id))
    if (!court.lat || !court.lng) return false
    if (searchArea.center) return haversineDistanceKm(searchArea.center.lat, searchArea.center.lng, court.lat, court.lng) <= searchArea.radiusKm
    const [[south, west], [north, east]] = searchArea.bounds
    return court.lat >= south && court.lat <= north && court.lng >= west && court.lng <= east
  }, [searchArea])

  // Lắng nghe cập nhật khi người chơi chỉnh sửa vị trí trong Profile
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const loc = e.detail?.location
      if (loc) setUserProfileLocation(loc)
      else {
        try {
          const saved = localStorage.getItem('player_profile_data')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.location) setUserProfileLocation(parsed.location)
          }
        } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
      }
    }
    const handleStorage = (e) => {
      if (e.key === 'player_profile_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.location) setUserProfileLocation(parsed.location)
        } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
      }
    }
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])


  useEffect(() => {
    let isMounted = true
    async function loadBackendFacilities() {
      try {
        const [rawFacilities, rawLocations] = await Promise.all([
          getFacilities(),
          getFacilityLocations().catch(() => []),
        ])
        if (isMounted && Array.isArray(rawLocations)) {
          setApiLocations(rawLocations)
        }
        if (isMounted && Array.isArray(rawFacilities) && rawFacilities.length > 0) {
          const transformed = rawFacilities.map(transformFacilityToCourt).filter(Boolean)
          setApiFacilities(transformed)
          setApiStatus('connected')
        } else {
          if (isMounted) setApiStatus('empty')
        }
      } catch (err) {
        console.warn('API /api/v1/facilities không phản hồi:', err)
        if (isMounted) setApiStatus('error')
      }
    }
    loadBackendFacilities()
    return () => { isMounted = false }
  }, [])

  // Lọc khung giờ còn trống theo ngày đang chọn. BE: GET /api/v1/facilities/search?date=&fromTime=&toTime=
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const hasTimeFilter = Boolean(fromTime || toTime)
  const timeFilterError = fromTime && toTime && fromTime >= toTime ? 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.' : ''
  // Kết quả lọc giờ gần nhất; freeFacilityIds = null khi không lọc theo giờ, Set = các cơ sở còn ca trống trong khung giờ
  const [freeResult, setFreeResult] = useState({ ids: null, counts: {} })
  const freeFacilityIds = hasTimeFilter && !timeFilterError ? freeResult.ids : null
  const freeSlotCounts = freeResult.counts
  useEffect(() => {
    if (!hasTimeFilter || timeFilterError) return
    let isMounted = true
    const timer = setTimeout(async () => {
      try {
        const res = await searchFacilities({ date: selectedDateStr, fromTime: fromTime || undefined, toTime: toTime || undefined, pageSize: 50 })
        if (!isMounted) return
        const items = res?.items || []
        const transformed = items.map(transformFacilityToCourt).filter(Boolean)
        setApiFacilities((prev) => {
          const foundIds = new Set(transformed.map((t) => t.id))
          return [...transformed, ...prev.filter((p) => !foundIds.has(p.id))]
        })
        setFreeResult({
          ids: new Set(items.map((i) => String(i.id))),
          counts: Object.fromEntries(items.map((i) => [String(i.id), i.availableSlotCount ?? 0])),
        })
      } catch (e) {
        console.warn('MapBooking: Lọc khung giờ trống thất bại:', e)
        if (isMounted) setFreeResult({ ids: new Set(), counts: {} })
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      isMounted = false
    }
  }, [hasTimeFilter, timeFilterError, selectedDateStr, fromTime, toTime])

  // Tìm kiếm cơ sở trực tiếp bằng API GET /api/v1/facilities/search khi người chơi gõ từ khóa
  useEffect(() => {
    if (!query || query.trim().length < 2) return
    let isMounted = true
    const timer = setTimeout(async () => {
      try {
        const searchRes = await searchFacilities({
          Keyword: query.trim(),
          PageSize: 15,
        })
        const items = searchRes?.items || (Array.isArray(searchRes) ? searchRes : [])
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const transformed = items.map(transformFacilityToCourt).filter(Boolean)
          setApiFacilities((prev) => {
            const foundIds = new Set(transformed.map((t) => t.id))
            const remaining = prev.filter((p) => !foundIds.has(p.id))
            return [...transformed, ...remaining]
          })
        }
      } catch (e) {
        console.warn('MapBooking: Tìm kiếm sân qua API notice:', e)
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      isMounted = false
    }
  }, [query])


  // Danh sách cụm sân trực tiếp từ Backend API GET /api/v1/facilities
  const localizedCourts = useMemo(() => {
    const list = apiFacilities

    return list.map((c) => ({
      ...c,
      distance: getDistanceForCourt(c, originPoint),
    }))
  }, [apiFacilities, originPoint])

  const courtMatchesSport = useCallback((c) => {
    if (Array.isArray(c.sports) && c.sports.length > 0) {
      return c.sports.some((s) => isSportActive(s))
    }
    return isSportActive(c.sport)
  }, [isSportActive])

  // Mỗi nút khu vực: số cơ sở có môn đang chọn + số cơ sở theo từng môn (hiện ở tooltip)
  const areaChipStats = useMemo(() => {
    const stats = new Map()
    for (const chip of areaChips.all) {
      const bySport = SPORTS_LIST
        .map((s) => ({ ...s, count: chip.courts.filter((c) => (c.sports?.length ? c.sports : [c.sport]).includes(s.key)).length }))
        .filter((s) => s.count > 0)
      stats.set(chip.value, { matched: chip.courts.filter(courtMatchesSport).length, bySport })
    }
    return stats
  }, [areaChips, courtMatchesSport, SPORTS_LIST])

  // Lọc theo tầm giá: nhập tự do hoặc chọn "Mọi mức giá"
  const courtMatchesPrice = useCallback((court) => {
    if (isAllPrices) return true
    const minVal = minPriceInput ? Number(minPriceInput.replace(/\D/g, '')) : 0
    const maxVal = maxPriceInput ? Number(maxPriceInput.replace(/\D/g, '')) : Infinity

    // Nếu không nhập cả 2 ô hoặc min = 0 và max = Infinity thì tính là xem tất cả
    if (minVal === 0 && (maxVal === Infinity || maxVal === 0)) return true

    const p = Number(court.price) || 0
    const matchesMain = p > 0 && (minVal === 0 || p >= minVal) && (maxVal === Infinity || maxVal === 0 || p <= maxVal)
    if (matchesMain) return true

    // Hoặc kiểm tra xem cụm sân có sân con nào nằm trong tầm giá người chơi chọn không
    if (Array.isArray(court.courts) && court.courts.length > 0) {
      return court.courts.some((sub) => {
        const subP = Number(sub.defaultPrice) || 0
        return subP > 0 && (minVal === 0 || subP >= minVal) && (maxVal === Infinity || maxVal === 0 || subP <= maxVal)
      })
    }
    return false
  }, [isAllPrices, minPriceInput, maxPriceInput])

  // Lọc cụm sân:
  // - Khi không gõ tìm kiếm: lọc theo môn và khoảng giá (sắp xếp theo khoảng cách từ người chơi)
  // - Khi người chơi gõ tìm kiếm (tên sân, tuyến đường, phường, tỉnh):
  //   1. Ưu tiên tìm trong danh sách các cụm sân có sẵn. Không ép lọc theo môn/giá để tránh làm biến mất kết quả sân người chơi đang tìm kiếm!
  //   2. Không có sân nào khớp thì trả danh sách rỗng
  const baseFilteredCourts = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return localizedCourts
        .filter(
          (c) =>
            courtMatchesSport(c) &&
            courtMatchesPrice(c)
        )
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    }

    const matched = localizedCourts.filter((c) => matchesQuery(c, trimmed) && courtMatchesPrice(c))

    if (matched.length > 0) {
      return matched.sort((a, b) => {
        // Ưu tiên sân đúng môn thể thao đang chọn lên trước
        const aFitSport = courtMatchesSport(a) ? 1 : 0
        const bFitSport = courtMatchesSport(b) ? 1 : 0
        if (aFitSport !== bFitSport) return bFitSport - aFitSport
        return (a.distance ?? Infinity) - (b.distance ?? Infinity)
      })
    }

    // Không có sân thật khớp từ khóa: không tự tạo "sân" từ chữ người dùng gõ
    return []
  }, [localizedCourts, courtMatchesSport, courtMatchesPrice, query])

  // Lọc theo tiện ích (danh mục lấy từ GET /api/v1/master-data/amenities): sân phải có đủ các tiện ích đã chọn
  const [amenityOptions, setAmenityOptions] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])
  useEffect(() => {
    let cancelled = false
    getAmenityOptions().then((list) => !cancelled && setAmenityOptions(list)).catch(() => {})
    return () => { cancelled = true }
  }, [])
  const toggleAmenity = (id) => setSelectedAmenities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const filteredCourts = useMemo(() => {
    const byTime = freeFacilityIds ? baseFilteredCourts.filter((c) => freeFacilityIds.has(String(c.id))) : baseFilteredCourts
    const byArea = byTime.filter(inSearchArea)
    if (!selectedAmenities.length) return byArea
    return byArea.filter((c) => {
      const ids = (c.amenities || []).map((a) => String(a.id ?? a.amenityId ?? ''))
      return selectedAmenities.every((id) => ids.includes(id))
    })
  }, [baseFilteredCourts, selectedAmenities, freeFacilityIds, inSearchArea])



  // Lắng nghe sự kiện từ Trợ lý AI SportNexus
  const onSelectFromAI = useEffectEvent((detail) => {
    const { courtId, slotId } = detail || {}
    if (!courtId) return
    setCourtPick({ id: courtId, origin: effectiveOrigin })
    if (slotId) {
      setPickedSlotIds([slotId])
      setHoldLeft(HOLD_SECONDS)
    }
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 250)
  })
  useEffect(() => {
    const handleSelectFromAI = (e) => onSelectFromAI(e.detail)
    const handleOpenAi = () => setIsAiModalOpen(true)

    window.addEventListener('sportnexus-select-court-slot', handleSelectFromAI)
    window.addEventListener('open-sportnexus-ai-chat', handleOpenAi)
    return () => {
      window.removeEventListener('sportnexus-select-court-slot', handleSelectFromAI)
      window.removeEventListener('open-sportnexus-ai-chat', handleOpenAi)
    }
  }, [])

  // Gợi ý khi gõ: chỉ lọc theo từ khóa để người dùng luôn thấy kết quả
  const suggestions = useMemo(
    () =>
      query.trim()
        ? localizedCourts.filter((c) => matchesQuery(c, query))
            .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
            .slice(0, 8)
        : [],
    [localizedCourts, query]
  )
  const showSuggest = searchFocused && query.trim().length > 0

  // Sân đang hiển thị: giữ sân người dùng chọn nếu vẫn nằm trong kết quả lọc và (khi vị trí đổi) cùng khu vực;
  // nếu không thì ưu tiên sân gần khu vực xuất phát (khi không gõ tìm kiếm), cuối cùng là sân đầu danh sách
  const originAreaNorm = !query.trim() && effectiveOrigin ? normalizeText(effectiveOrigin) : ''
  const matchesOriginArea = (court) => {
    if (!originAreaNorm) return false
    const { district, province } = areaOfCourt(court)
    return [district, province]
      .map((item) => normalizeText(item || ''))
      .some((token) => token && (originAreaNorm.includes(token) || token.includes(originAreaNorm)))
  }
  const pickedCourt = filteredCourts.find((c) => c.id === courtPick.id)
  const isPickedCourtValid =
    pickedCourt && (courtPick.origin === effectiveOrigin || !originAreaNorm || matchesOriginArea(pickedCourt))
  const selectedCourt =
    (isPickedCourtValid ? pickedCourt : null) ||
    (originAreaNorm && filteredCourts.find(matchesOriginArea)) ||
    filteredCourts[0] ||
    null
  const selectedCourtId = selectedCourt?.id || null
  const selectCourt = (courtId) => setCourtPick({ id: courtId, origin: effectiveOrigin })

  // Danh sách các sân con trong cụm sân hiện tại
  const venueSubCourts = useMemo(() => {
    if (!selectedCourt) return []

    // Nếu cơ sở từ API có danh sách sân con thật (courts), ưu tiên hiển thị đúng danh sách sân thật
    if (Array.isArray(selectedCourt.courts) && selectedCourt.courts.length > 0) {
      return selectedCourt.courts.map((child, idx) => {
        const isBooked = child.status !== 'ACTIVE'
        const subPrice = Number(child.defaultPrice) > 0 ? Number(child.defaultPrice) : (Number(selectedCourt.price) || 0)
        return {
          id: child.id,
          number: String(idx + 1).padStart(2, '0'),
          name: child.name,
          type: `${child.categoryName}${subPrice > 0 ? ` • ${subPrice.toLocaleString('vi-VN')} Điểm/h` : ''}`,
          isBooked,
          note: isBooked ? (child.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Tạm ngưng') : 'Đang trống',
          price: subPrice,
          categoryName: child.categoryName,
        }
      })
    }

    // Không có danh sách sân con thật từ API: không tự tạo sân giả.
    return []
  }, [selectedCourt])

  // Trạng thái các sân được chọn trong khung giờ (cho phép chọn nhiều sân cùng một khung giờ)
  const [selectedSubCourtIds, setSelectedSubCourtIds] = useState([])

  // Luôn giữ ít nhất 1 sân khả dụng khi đổi cụm sân hoặc khung giờ (suy ra khi render)
  const effectiveSubCourtIds = useMemo(() => {
    const valid = selectedSubCourtIds.filter((id) => venueSubCourts.some((c) => c.id === id && !c.isBooked))
    if (valid.length > 0) return valid
    const firstAvail = venueSubCourts.find((c) => !c.isBooked)
    return firstAvail ? [firstAvail.id] : []
  }, [selectedSubCourtIds, venueSubCourts])

  const handleToggleSubCourt = (courtId) => {
    const courtItem = venueSubCourts.find((c) => c.id === courtId)
    if (!courtItem || courtItem.isBooked) return
    const current = effectiveSubCourtIds
    if (current.includes(courtId)) {
      if (current.length <= 1) return // Giữ tối thiểu 1 sân
      setSelectedSubCourtIds(current.filter((id) => id !== courtId))
    } else {
      setSelectedSubCourtIds([...current, courtId])
    }
  }

  // Chọn sân chính + mọi sân cùng môn có ca trống đúng giờ đã chọn
  const handleSelectAllSubCourts = () => {
    if (!primaryCourt) return
    const okIds = venueSubCourts
      .filter((c) => c.id !== primaryCourt.id && c.categoryName === primaryCourt.categoryName && courtCheck(c).state === 'ok')
      .map((c) => c.id)
    setSelectedSubCourtIds([primaryCourt.id, ...okIds])
  }

  // Chọn đúng 1 sân (đổi sân chính → lưới ca chuyển sang sân đó, bỏ các ca đã chọn của sân cũ)
  const handleSelectSingleSubCourt = (courtId) => {
    const courtItem = venueSubCourts.find((c) => c.id === courtId)
    if (!courtItem || courtItem.isBooked) return
    if (courtId !== effectiveSubCourtIds[0]) setPickedSlotIds(null)
    setSelectedSubCourtIds([courtId])
  }

  // Sân chính = sân chọn đầu tiên: lưới ca hiển thị theo sân này.
  // Sân thêm (đặt nhiều sân cùng giờ) phải cùng môn và có ca trống đúng giờ đã chọn (kiểm tra bên dưới).
  const primaryCourt = venueSubCourts.find((c) => c.id === effectiveSubCourtIds[0]) || null

  // Tải danh sách ca thật từ API cho sân con đang chọn
  const [liveCourtSlots, setLiveCourtSlots] = useState([])
  const [slotsError, setSlotsError] = useState('')
  const activeSubCourtId = (() => {
    const isGuid = (val) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim())

    if (primaryCourt && isGuid(primaryCourt.id)) return primaryCourt.id
    const fromVenue = venueSubCourts.find((c) => isGuid(c.id) && !c.isBooked)
    if (fromVenue) return fromVenue.id
    if (Array.isArray(selectedCourt?.courts) && selectedCourt.courts.length > 0) {
      const activeCourt = selectedCourt.courts.find((c) => c.status === 'ACTIVE' && isGuid(c.id))
      if (activeCourt) return activeCourt.id
      const anyCourt = selectedCourt.courts.find((c) => isGuid(c.id))
      if (anyCourt) return anyCourt.id
    }
    return null
  })()

  // Lưới ca của các sân cùng môn khác trong cụm (để kiểm tra có ca trống đúng giờ đã chọn hay không)
  const sameSportCourtIds = primaryCourt
    ? venueSubCourts.filter((c) => c.id !== primaryCourt.id && !c.isBooked && c.categoryName === primaryCourt.categoryName).map((c) => c.id)
    : []
  const extraKey = sameSportCourtIds.length ? `${selectedDateStr}|${sameSportCourtIds.join(',')}` : ''
  const [extraSlots, setExtraSlots] = useState({ key: '', byCourt: {} })
  useEffect(() => {
    if (!extraKey) return undefined
    let cancelled = false
    const [date, ids] = extraKey.split('|')
    Promise.all(ids.split(',').map((id) =>
      getCourtSlots(id, date)
        .then((raw) => [id, normalizeCourtSlots(Array.isArray(raw) ? raw : [], 0)])
        .catch(() => [id, null])))
      .then((entries) => !cancelled && setExtraSlots({ key: extraKey, byCourt: Object.fromEntries(entries) }))
    return () => { cancelled = true }
  }, [extraKey])
  const extrasLoading = Boolean(extraKey) && extraSlots.key !== extraKey

  useEffect(() => {
    let isMounted = true
    async function loadSubCourtSlots() {
      const isGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!activeSubCourtId || !isGuidRegex.test(activeSubCourtId)) {
        setLiveCourtSlots([])
        if (isMounted) {
          setSlotsError('')
          setIsLoadingSlots(false)
        }
        return
      }
      try {
        setIsLoadingSlots(true)
        if (isMounted) setSlotsError('')
        const apiSlots = await getCourtSlots(activeSubCourtId, selectedDateStr)
        if (isMounted && Array.isArray(apiSlots) && apiSlots.length > 0) {
          setLiveCourtSlots(apiSlots)
        } else if (isMounted) {
          setLiveCourtSlots([])
        }
      } catch (err) {
        console.warn('[MapBooking] Lỗi khi tải ca sân:', err)
        if (isMounted) {
          setLiveCourtSlots([])
          setSlotsError(err?.message || 'Không tải được lịch ca sân từ máy chủ.')
        }
      } finally {
        if (isMounted) setIsLoadingSlots(false)
      }
    }
    loadSubCourtSlots()
    return () => { isMounted = false }
  }, [activeSubCourtId, selectedDateStr])

  // Đơn giá của sân con đang chọn (đồng bộ chính xác theo từng sân con hoặc cụm sân)
  const currentSubCourtPrice =
    primaryCourt && Number(primaryCourt.price) > 0 ? Number(primaryCourt.price) : Number(selectedCourt?.price) || 0

  const slots = (() => {
    if (!selectedCourt) return []
    // Kiểm tra xem liveCourtSlots có thuộc về đúng sân con hiện tại không
    const isMatchingCurrentCourt =
      Array.isArray(liveCourtSlots) &&
      liveCourtSlots.length > 0 &&
      (!activeSubCourtId || liveCourtSlots[0]?.courtId === activeSubCourtId)

    if (!isMatchingCurrentCourt) return []

    const grouped2h = normalizeCourtSlots(liveCourtSlots, currentSubCourtPrice)
    // Đang lọc khung giờ: chỉ hiện các ca nằm trọn trong khung
    const inWindow = (s) => {
      const start = s.formattedStart || vnClock(s.startTime) || '00:00'
      const end = s.formattedEnd || vnClock(s.endTime) || '00:00'
      return (!fromTime || start >= fromTime) && (!toTime || (end === '00:00' ? '24:00' : end) <= toTime)
    }
    return grouped2h.filter(inWindow).map((s) => {
      const start = s.formattedStart || vnClock(s.startTime) || '00:00'
      const end = s.formattedEnd || vnClock(s.endTime) || '00:00'
      const isAvail = s.isBookable || (s.status === 'Available' && !s.isPast)
      return {
        id: s.id,
        slotIds: s.slotIds || [s.id],
        start,
        end,
        hours: s.durationHours,
        price: s.price,
        status: isAvail ? 'available' : 'booked',
        note: s.isPast ? 'Đã qua giờ' : (s.note || (s.status !== 'Available' ? 'Đã kín lịch' : null)),
        rawSlot: s.rawSlots ? s.rawSlots[0] : s,
        allRawSlots: s.rawSlots || [s],
      }
    })
  })()

  // Nhãn độ dài ca trên tiêu đề lưới: theo ca thật; các ca dài khác nhau thì không ghi 1 con số chung
  const slotDurationLabel = useMemo(() => {
    const durations = new Set(slots.map((s) => Math.round((Number(s.hours) || 0) * 60)).filter((m) => m > 0))
    if (durations.size === 0) return ''
    if (durations.size > 1) return 'Độ dài ca khác nhau'
    return `${formatHours([...durations][0] / 60)} / ca`
  }, [slots])

  const firstAvailableSlotId = slots.find((s) => s.status === 'available')?.id || null
  const pickedIds = pickedSlotIds === null ? (firstAvailableSlotId ? [firstAvailableSlotId] : []) : pickedSlotIds
  // Ca đang chọn theo thứ tự giờ (tự bỏ ca vừa bị người khác đặt)
  const selectedSlots = slots.filter((s) => pickedIds.includes(s.id) && s.status === 'available')
  const selectedSlot = selectedSlots[0] || null
  const selectedHours = selectedSlots.reduce((sum, s) => sum + (Number(s.hours) || 0), 0)
  const selectedTimeText = selectedSlots.map((s) => `${s.start} - ${s.end}`).join(', ')
  // Sân cùng môn: có ca trống đúng giờ của mọi ca đã chọn ở sân chính không. state: 'loading' | 'ok' | 'none'
  const courtCheck = (court) => {
    if (extrasLoading) return { state: 'loading', slots: [] }
    const list = extraSlots.byCourt[court.id]
    const matched = selectedSlots.map((s) => (list || []).find((x) => x.formattedStart === s.start && x.formattedEnd === s.end))
    if (!list || !selectedSlots.length || matched.some((m) => !isSlotOpen(m))) return { state: 'none', slots: [] }
    return { state: 'ok', slots: matched.map((m) => ({ ...m, price: Number(m.price) > 0 ? Number(m.price) : court.price })) }
  }
  // Sân thêm đã chọn và còn hợp lệ (cùng môn, có ca trống đúng giờ)
  const extraCourts = effectiveSubCourtIds
    .slice(1)
    .map((id) => venueSubCourts.find((c) => c.id === id))
    .filter((c) => c && primaryCourt && c.categoryName === primaryCourt.categoryName)
    .map((c) => ({ ...c, check: courtCheck(c) }))
    .filter((c) => c.check.state === 'ok')
  const activeSubCourts = primaryCourt ? [primaryCourt, ...extraCourts] : []
  const courtQuantity = activeSubCourts.length || 1
  const extraCourtSlots = extraCourts.flatMap((c) => c.check.slots)
  const totalBookingPrice =
    selectedSlots.reduce((sum, s) => sum + (Number(s.price) || 0), 0) + extraCourtSlots.reduce((sum, s) => sum + (Number(s.price) || 0), 0)

  // Đặt định kỳ (lặp lại mỗi tuần): áp dụng cho 1 sân con, là sân đang xem lưới ca
  const repeat = useRepeatBooking(
    courtQuantity === 1 && activeSubCourtId
      ? selectedSlots.map((s) => ({ courtId: activeSubCourtId, courtName: activeSubCourts[0]?.name || selectedCourt?.name || '', sportName: selectedCourt?.sport || '', start: s.start, end: s.end, price: currentSubCourtPrice }))
      : [],
    selectedSlots.length ? selectedDateStr : null,
  )
  const orderSlotCount = selectedSlots.length + extraCourtSlots.length + repeat.slots.length
  const orderTotal = totalBookingPrice + repeat.slots.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
  // Giảm giá đặt gói: cơ sở bật isBulkDiscountEnabled và đơn từ 4 ca (FE hiển thị tạm tính, BE tính lại khi đặt)
  const orderDiscount = bulkDiscount(orderTotal, orderSlotCount, selectedCourt?.rawFacility?.isBulkDiscountEnabled)

  // Đếm ngược thời gian khóa giữ chỗ
  // Hết thời gian giữ chỗ → tự động nhả khung giờ (không tự chọn lại ca khác)
  const readHoldLeft = useEffectEvent(() => holdLeft)
  const selectedSlotKey = selectedSlot?.id || null
  useEffect(() => {
    if (!selectedSlotKey) return undefined
    let remaining = readHoldLeft()
    const timer = setInterval(() => {
      remaining = Math.max(remaining - 1, 0)
      setHoldLeft(remaining)
      if (remaining === 0) {
        clearInterval(timer)
        setPickedSlotIds([])
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [selectedSlotKey])

  const handleSelectCourt = (court) => {
    const isSameCourt = court.id === selectedCourt?.id
    if (!isSameCourt) {
      selectCourt(court.id)
      setPickedSlotIds(null)
      setLiveCourtSlots([]) // Reset ngay ca của sân cũ để đồng bộ ngay giá mới
      setIsLoadingSlots(true)

      // Đồng bộ ngay sân con khả dụng đầu tiên của cụm sân vừa chọn
      const children = Array.isArray(court.courts) ? court.courts : []
      const matchingPriceChild = children.find(
        (c) => c.status === 'ACTIVE' && Number(c.defaultPrice) === Number(court.price)
      )
      const firstActiveChild =
        matchingPriceChild || children.find((c) => c.status === 'ACTIVE') || children[0]
      setSelectedSubCourtIds(firstActiveChild ? [firstActiveChild.id] : [])
    }
  }

  // Bấm ca: chọn thêm / bỏ chọn (chọn nhiều ca liền nhau để chơi lâu hơn, hoặc ca rời nhau trong ngày)
  const handleSelectSlot = (slot) => {
    if (slot.status === 'booked') return
    const current = pickedSlotIds ?? []
    setPickedSlotIds(current.includes(slot.id) ? current.filter((id) => id !== slot.id) : [...current, slot.id])
    setHoldLeft(HOLD_SECONDS)
  }


  // Quản lý giá tự do & nút chọn "Mọi mức giá"
  const handleSelectAllPrices = () => {
    setIsAllPrices(true)
    setMinPriceInput('')
    setMaxPriceInput('')
  }


  const handleMinPriceChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 8)
    const formatted = digits ? Number(digits).toLocaleString('vi-VN') : ''
    setMinPriceInput(formatted)
    if (!formatted && !maxPriceInput) {
      setIsAllPrices(true)
    } else {
      setIsAllPrices(false)
    }
  }

  const handleMaxPriceChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 8)
    const formatted = digits ? Number(digits).toLocaleString('vi-VN') : ''
    setMaxPriceInput(formatted)
    if (!minPriceInput && !formatted) {
      setIsAllPrices(true)
    } else {
      setIsAllPrices(false)
    }
  }

  const handlePriceBlur = () => {
    if (!minPriceInput || !maxPriceInput) return
    const minVal = Number(minPriceInput.replace(/\D/g, ''))
    const maxVal = Number(maxPriceInput.replace(/\D/g, ''))
    if (minVal > maxVal && maxVal > 0) {
      setMinPriceInput(Number(maxVal).toLocaleString('vi-VN'))
      setMaxPriceInput(Number(minVal).toLocaleString('vi-VN'))
    }
  }

  const displayPriceText = useMemo(() => {
    if (isAllPrices || (!minPriceInput && !maxPriceInput)) {
      return 'Mọi mức giá'
    }
    if (minPriceInput && !maxPriceInput) {
      return `Từ ${minPriceInput} Điểm`
    }
    if (!minPriceInput && maxPriceInput) {
      return `Đến ${maxPriceInput} Điểm`
    }
    return `${minPriceInput} Điểm – ${maxPriceInput} Điểm`
  }, [isAllPrices, minPriceInput, maxPriceInput])

  const handleClearFilters = () => {
    setQuery('')
    handleSelectAllPrices()
    setFromTime('')
    setToTime('')
    selectAllSports()
  }

  const handlePickSuggestion = (court) => {
    setQuery(court.name)
    setSearchFocused(false)
    handleSelectCourt(court)
  }

  const handleConfirm = () => {
    if (!selectedCourt || !selectedSlot || activeSubCourts.length === 0) return
    if (repeat.enabled && !repeat.ready) {
      toast.warning(repeat.loading ? 'Đang kiểm tra lịch các tuần tiếp theo, vui lòng chờ.' : 'Có buổi lặp lại không đặt được. Vui lòng đổi giờ hoặc bỏ bớt thứ / số tuần.')
      return
    }
    const subCourtNames = activeSubCourts.map((c) => c.name)
    const isGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    // Chỉ cho đặt khi ca lấy từ API (id là GUID thật), không tự gán ca mặc định.
    const slotId = isGuidRegex.test(selectedSlot.id) ? selectedSlot.id : null

    const firstRealCourtId =
      activeSubCourts.find((c) => isGuidRegex.test(c.id))?.id ||
      selectedCourt?.courts?.find((c) => isGuidRegex.test(c.id) && c.status === 'ACTIVE')?.id ||
      selectedCourt?.courts?.find((c) => isGuidRegex.test(c.id))?.id ||
      null
    if (!slotId || !firstRealCourtId) {
      toast.error('Ca này chưa có dữ liệu đặt sân từ hệ thống. Vui lòng chọn ca khác hoặc thử lại sau.')
      return
    }

    navigate('/split-payment', {
      state: {
        facilityId: selectedCourt.id,
        courtId: firstRealCourtId,
        court: selectedCourt.name,
        address: selectedCourt.address,
        district: selectedCourt.district,
        subCourt: subCourtNames.join(', '),
        subCourts: subCourtNames,
        courtCount: subCourtNames.length,
        subCourtDesc: selectedCourt.subCourtDesc,
        image: selectedCourt.image,
        sport: selectedCourt.sport,
        date: selectedDateStr,
        dateLabel: selectedDateInfo.fullLabel,
        slot: selectedTimeText,
        hours: selectedHours + repeat.slots.reduce((sum, s) => sum + (s.durationHours || 1), 0),
        total: orderTotal,
        slotCount: orderSlotCount,
        // Giảm giá đặt gói và đặt định kỳ: trang thanh toán tự trừ % và liệt kê các buổi
        bulkDiscountEnabled: Boolean(selectedCourt?.rawFacility?.isBulkDiscountEnabled),
        recurring: repeat.recurring,
        unitPrice: selectedSlot.price,
        hourlyRate: selectedSlot.hourlyRate || Math.round(selectedSlot.price / (selectedSlot.hours || 2)),
        courtSlotId: slotId,
        // Ca của sân chính + ca cùng giờ ở các sân thêm + ca các tuần lặp lại
        courtSlotIds: [...selectedSlots.flatMap((s) => s.slotIds), ...extraCourtSlots.map((s) => s.id), ...repeat.slots.map((s) => s.id)].filter((id) => isGuidRegex.test(id)),
        selectedSlots: [...selectedSlots.flatMap((s) => s.allRawSlots), ...extraCourtSlots.flatMap((s) => s.rawSlots), ...repeat.slots.flatMap((s) => s.rawSlots)],
        numberOfSlots: selectedSlots.length + extraCourtSlots.length + repeat.slots.length,
        ...(repeat.recurring ? { isConsecutive: false } : {}),
      },
    })
  }



  const sportOf = (key) => SPORTS_LIST.find((s) => s.key === key)

  return (
    <div className="mb-page">
      {/* ===================== HEADER ===================== */}
      <header className="mb-header snx-page-header">
        <div>
          <h1 className="snx-page-title">Đặt Sân Trực Tuyến &amp; Giữ Chỗ Thời Gian Thực</h1>
        </div>
        <div className="mb-header-chips">
          {/* Nút Hỏi Trợ Lý AI */}
          <button
            id="mb-ask-ai-btn"
            type="button"
            className="mb-chip mb-chip--ai"
            onClick={() => setIsAiModalOpen(true)}
            title="Mở trợ lý AI tư vấn và gợi ý lựa chọn sân ưu tiên"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
              smart_toy
            </span>
            <strong>Hỏi Trợ Lý AI</strong>
            <span className="mb-ai-sub-pill">Gợi ý ưu tiên</span>
          </button>

          <span className={`mb-chip mb-chip--timer ${selectedSlot && holdLeft < 120 ? 'is-urgent' : ''}`}>
            <span className="material-symbols-outlined">lock</span>
            {selectedSlot ? `Khóa giữ chỗ: ${formatTimer(holdLeft)}` : 'Chưa giữ chỗ'}
          </span>
        </div>
      </header>

      <div className="mb-grid">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="mb-col">
          {/* AI Assistant Banner */}
          <div
            className="mb-ai-helper-banner"
            onClick={() => setIsAiModalOpen(true)}
            role="button"
            tabIndex={0}
          >
            <div className="mb-ai-helper-ic">🤖</div>
            <div className="mb-ai-helper-content">
              <strong>Hỏi Trợ Lý AI Tìm Sân &amp; Giờ Vàng</strong>
              <span>Tự động phân tích giá, khoảng cách &amp; gợi ý slot tối ưu nhất</span>
            </div>
            <button type="button" className="mb-ai-helper-btn">
              Tư Vấn Ngay <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Filter card */}
          <section className="mb-card" aria-label="Tìm kiếm và lọc sân">
            {amenityOptions.length > 0 && (
              <div className="snx-row" style={{ gap: 6, marginBottom: 12 }} aria-label="Lọc theo tiện ích">
                <span className="snx-muted" style={{ fontWeight: 600 }}>Tiện ích:</span>
                {amenityOptions.map((a) => (
                  <button key={a.id} type="button" aria-pressed={selectedAmenities.includes(a.id)} className={`snx-btn snx-btn--sm ${selectedAmenities.includes(a.id) ? 'snx-btn--primary' : 'snx-btn--secondary'}`} onClick={() => toggleAmenity(a.id)}>{a.name}</button>
                ))}
                {selectedAmenities.length > 0 && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setSelectedAmenities([])}>Bỏ lọc</button>}
              </div>
            )}

            {/* Thanh tìm kiếm địa chỉ / tên sân */}
            <div className="mb-search">
              <div className={`mb-search-box ${searchFocused ? 'is-focused' : ''}`}>
                <span className="material-symbols-outlined mb-search-ic">search</span>
                <input
                  id="mb-search-input"
                  type="text"
                  className="mb-search-input"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
                  }}
                  placeholder="Tìm tên sân, tên đường, phường, tỉnh…"
                  aria-label="Tìm kiếm sân theo tên sân, tên đường, phường, tỉnh"
                />
                {query && (
                  <button
                    id="mb-search-clear"
                    type="button"
                    className="mb-search-clear"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery('')}
                    aria-label="Xóa từ khóa"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>

              {showSuggest && (
                <ul className="mb-suggest" role="listbox">
                  {suggestions.length ? (
                    suggestions.map((c) => {
                      const badge = getMatchBadge(c, query)
                      return (
                        <li key={c.id}>
                          <button
                            id={`mb-suggest-${c.id}`}
                            type="button"
                            className="mb-suggest-item"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handlePickSuggestion(c)}
                          >
                            <span className="mb-suggest-ic">{sportOf(c.sport)?.emoji}</span>
                            <span className="mb-suggest-text">
                              <div className="mb-suggest-title-row">
                                <strong>{c.name}</strong>
                                {badge && (
                                  <span className={`mb-suggest-badge ${badge.className}`}>
                                    <span className="material-symbols-outlined">{badge.icon}</span>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <small>
                                {c.address || [c.districtName, c.provinceName].filter(Boolean).join(', ')}
                              </small>
                            </span>
                            {c.distance != null && (
                              <div className="mb-suggest-right">
                                <em>{c.distance} km</em>
                                <span className="mb-suggest-subdist">gần bạn</span>
                              </div>
                            )}
                          </button>
                        </li>
                      )
                    })
                  ) : (
                    <li className="mb-suggest-empty">
                      <span className="material-symbols-outlined">search_off</span>
                      Không tìm thấy sân cho “{query}”
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Khu vực: nhập tên đường / phường / tỉnh → chỉ hiện sân trong khu vực đó trên danh sách và bản đồ */}
            <div className="mb-label-row">
              <span className="mb-label">Khu vực</span>
              {customOrigin && (
                <button type="button" className="mb-link-btn" onClick={() => setCustomOrigin('')}>Bỏ chọn</button>
              )}
            </div>
            <div className="mb-search" style={{ marginBottom: 8 }}>
              <div className="mb-search-box">
                <span className="material-symbols-outlined mb-search-ic">location_on</span>
                <input
                  id="mb-area-input"
                  type="text"
                  className="mb-search-input"
                  autoComplete="off"
                  placeholder="Tên đường, phường, tỉnh..."
                  value={customOrigin}
                  onChange={(e) => { setCustomOrigin(e.target.value); setAreaOffFor('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur() }}
                  aria-label="Khu vực tìm sân"
                />
                {customOrigin && (
                  <button type="button" className="mb-search-clear" onClick={() => setCustomOrigin('')} aria-label="Bỏ chọn khu vực">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            </div>
            {/* Gợi ý khu vực từ các cơ sở đang có: tỉnh / thành (đậm) rồi các quận có sân.
                Số trong ngoặc = số cơ sở có môn đang chọn; khu vực không có môn đang chọn bị làm mờ. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {areaChips.all.map((chip) => {
                const active = selectedAreaChip?.value === chip.value
                const isProvince = !chip.province
                const { matched = 0, bySport = [] } = areaChipStats.get(chip.value) || {}
                const name = chip.province ? `${chip.label}, ${chip.province}` : chip.label
                const breakdown = bySport.map((s) => `${s.emoji} ${s.label}: ${s.count}`).join(' • ')
                const stateClass = matched === 0 ? 'is-empty' : !isAllActive ? 'has-match' : ''
                return (
                  <button
                    key={chip.value}
                    type="button"
                    className={`mb-origin-chip ${stateClass}`}
                    aria-pressed={active}
                    title={`${name}\n${matched} cơ sở có môn đang chọn${breakdown ? `\n${breakdown}` : ''}`}
                    style={active ? { background: '#2D5F3F', color: '#fff', borderColor: '#2D5F3F', opacity: 1 } : isProvince ? { fontWeight: 800 } : undefined}
                    onClick={() => { setCustomOrigin(active ? '' : chip.value); setAreaOffFor('') }}
                  >
                    {chip.label} ({matched})
                  </button>
                )
              })}
            </div>

            <div className="mb-label-row">
              <span className="mb-label">Môn thể thao</span>
              <button id="mb-clear-filter" type="button" className="mb-link-btn" onClick={handleClearFilters}>
                Xóa Lọc
              </button>
            </div>
            <div className="mb-sport-toggle">
              {SPORTS_LIST.map((s) => (
                <button
                  key={s.key}
                  id={`mb-sport-${s.key}`}
                  type="button"
                  className={`mb-sport-btn ${isSportActive(s.key) ? 'is-active' : ''}`}
                  onClick={() => toggleSport(s.key)}
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>

            <div className="mb-label-row">
              <span className="mb-label">Tầm giá / giờ</span>
              <button
                id="mb-price-all-toggle"
                type="button"
                className={`mb-price-readout-btn ${isAllPrices ? 'is-active' : 'is-filtered'}`}
                onClick={handleSelectAllPrices}
                title={isAllPrices ? 'Đang hiển thị tất cả các sân ở mọi mức giá' : 'Bấm để xóa lọc giá và xem mọi mức giá'}
              >
                {isAllPrices ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, marginRight: 2 }}>check</span>
                    Mọi mức giá
                  </>
                ) : (
                  <>
                    <span>{displayPriceText}</span>
                    <span className="mb-price-reset-chip">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
                      Xóa lọc
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Ô nhập Từ — Đến tự do */}
            <div className="mb-price-inputs">
              <label className="mb-price-field" htmlFor="mb-price-input-min">
                <small>Từ</small>
                <input
                  id="mb-price-input-min"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={minPriceInput}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  onBlur={handlePriceBlur}
                  aria-label="Giá tối thiểu"
                />
                <span>Điểm</span>
              </label>

              <label className="mb-price-field" htmlFor="mb-price-input-max">
                <small>Đến</small>
                <input
                  id="mb-price-input-max"
                  type="text"
                  inputMode="numeric"
                  placeholder="Không giới hạn"
                  value={maxPriceInput}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  onBlur={handlePriceBlur}
                  aria-label="Giá tối đa"
                />
                <span>Điểm</span>
              </label>
            </div>

            <div className="mb-label-row">
              <span className="mb-label">Khung giờ còn trống</span>
              <span className={`mb-price-readout ${hasTimeFilter ? 'is-on' : ''}`}>
                {hasTimeFilter ? `${fromTime || '00:00'} – ${toTime || '24:00'}` : 'Mọi khung giờ'}
              </span>
            </div>
            {/* Chọn nhanh buổi trong ngày */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {TIME_PRESETS.map((preset) => {
                const active = fromTime === preset.from && toTime === preset.to
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className="mb-origin-chip"
                    aria-pressed={active}
                    style={active ? { background: '#2D5F3F', color: '#fff', borderColor: '#2D5F3F' } : undefined}
                    onClick={() => { setFromTime(active ? '' : preset.from); setToTime(active ? '' : preset.to) }}
                  >
                    {preset.label} ({preset.from.slice(0, 2)}h–{preset.to.slice(0, 2)}h)
                  </button>
                )
              })}
              {hasTimeFilter && (
                <button type="button" className="mb-origin-chip" onClick={() => { setFromTime(''); setToTime('') }}>Bỏ lọc giờ</button>
              )}
            </div>
            {/* Giờ 24h bước 15 phút (dropdown, không dùng ô time của trình duyệt vì khó chọn phút / AM-PM) */}
            <div className="mb-price-inputs">
              <label className="mb-price-field" htmlFor="mb-from-time">
                <small>Từ</small>
                <select id="mb-from-time" className="mb-time-select" value={fromTime} onChange={(e) => { const v = e.target.value; setFromTime(v); if (v && toTime && toTime <= v) setToTime('') }} aria-label="Giờ bắt đầu">
                  <option value="">--:--</option>
                  {HOUR_OPTIONS.slice(0, -1).map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
              <label className="mb-price-field" htmlFor="mb-to-time">
                <small>Đến</small>
                <select id="mb-to-time" className="mb-time-select" value={toTime} onChange={(e) => setToTime(e.target.value)} aria-label="Giờ kết thúc">
                  <option value="">--:--</option>
                  {HOUR_OPTIONS.slice(1).filter((h) => !fromTime || h > fromTime).map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            </div>
            {timeFilterError && <p role="alert" style={{ color: '#dc2626', fontSize: 12, margin: '6px 0 0' }}>{timeFilterError}</p>}
          </section>

        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="mb-col">
          {/* Map */}
          {/* Bản đồ tương tác Leaflet / OpenStreetMap */}
          <section className="mb-card mb-map-section" aria-label="Bản đồ sân">
            <InteractiveCourtMap
              courts={filteredCourts}
              selectedCourt={selectedCourt}
              onSelectCourt={handleSelectCourt}
              effectiveOrigin={originLabel}
              originCoords={originPoint}
              searchArea={searchArea}
              isEditingOrigin={isEditingOrigin}
              setIsEditingOrigin={setIsEditingOrigin}
              customOrigin={customOrigin}
              setCustomOrigin={setCustomOrigin}
              userProfileLocation={userProfileLocation}
              mapType={mapType}
              setMapType={setMapType}
            />

            {/* Thanh thông tin lộ trình & chỉ đường Google Maps gọn gàng, tách biệt bên dưới bản đồ */}
            {selectedCourt && (() => {
              const routeInfo = calculateRoute(selectedCourt, effectiveOrigin)
              const originForDirections = customOrigin.trim() ? customOrigin.trim() : trustedGps
                ? `${gpsCoords.lat},${gpsCoords.lng}`
                : effectiveOrigin

              return (
                <div className="mb-map-footer-route">
                  <div className="mb-route-left">
                    <div className="mb-route-icon-box">
                      <span className="material-symbols-outlined">two_wheeler</span>
                    </div>
                    <div className="mb-route-text-box">
                      <div className="mb-route-headline">
                        <strong>{routeInfo.eta}</strong>
                        {selectedCourt.distance != null && (
                          <span className="mb-route-pill">~{selectedCourt.distance} km</span>
                        )}
                      </div>
                      <div className="mb-route-sub">
                        Từ <strong>{originLabel}</strong> đến <strong>{selectedCourt.name}</strong> ({selectedCourt.address})
                      </div>
                    </div>
                  </div>

                  <a
                    id="mb-directions"
                    className="mb-btn mb-btn--primary mb-route-btn"
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                      originForDirections
                    )}&destination=${encodeURIComponent(
                      selectedCourt.lat && selectedCourt.lng
                        ? `${selectedCourt.lat},${selectedCourt.lng}`
                        : selectedCourt.mapQuery
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Mở ứng dụng Google Maps chính thức để chỉ đường từng bước"
                  >
                    <span>Chỉ Đường Google Maps</span>
                    <span className="material-symbols-outlined">open_in_new</span>
                  </a>
                </div>
              )
            })()}
          </section>

          {/* Danh sách cụm sân hợp bộ lọc: ngay dưới bản đồ để thấy kết quả lọc liền */}
          <div className="mb-section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Cụm Sân Phù Hợp Bộ Lọc</h2>
              {apiStatus === 'connected' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  title="Dữ liệu đồng bộ trực tiếp từ hệ thống"
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  Trực tuyến ({apiFacilities.length} cụm sân)
                </span>
              )}
            </div>
            <small>{filteredCourts.length} cụm sân khả dụng</small>
          </div>

          {searchArea && (
            <div className="mb-card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#16a34a' }}>location_on</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                Đang xem sân trong khu vực <strong>{searchArea.label}</strong>
                {searchArea.center && ` (bán kính ${searchArea.radiusKm} km)`}
              </span>
              <button type="button" className="mb-origin-chip" onClick={() => setAreaOffFor(customOrigin.trim())}>Xem tất cả</button>
            </div>
          )}

          {isLoadingApi ? (
            <div className="mb-card mb-empty">
              <span className="material-symbols-outlined mb-spin" style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>sync</span>
              Đang kết nối và tải danh sách sân thể thao...
            </div>
          ) : filteredCourts.length === 0 ? (
            <div className="mb-card mb-empty">
              <span className="material-symbols-outlined">search_off</span>
              {apiStatus === 'error'
                ? 'Không thể kết nối máy chủ để tải danh sách cụm sân. Vui lòng thử lại sau.'
                : apiStatus === 'empty' && !query.trim() && !searchArea && !hasTimeFilter
                ? 'Hệ thống chưa có cụm sân nào khả dụng.'
                : searchArea
                ? `Không có sân phù hợp trong khu vực “${searchArea.label}”. Bấm “Xem tất cả” hoặc nhập khu vực khác.`
                : hasTimeFilter
                ? 'Không còn sân trống trong khung giờ này. Hãy thử ngày hoặc khung giờ khác.'
                : 'Không tìm thấy sân phù hợp. Hãy thử từ khóa khác hoặc mở rộng tầm giá.'}
            </div>
          ) : null}

          {filteredCourts.length > 0 && (
          <div className="mb-court-grid">
          {filteredCourts.map((court, i) => {
            const active = court.id === selectedCourt?.id
            const sport = sportOf(court.sport)
            return (
              <article
                key={court.id}
                id={`mb-court-${court.id}`}
                className={`mb-card mb-court ${active ? 'is-active' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleSelectCourt(court)}
              >
                <div className="mb-court-top">
                  <img className="mb-court-img" src={court.image} alt={court.name} loading="lazy" />
                  <div className="mb-court-info">
                    <div className="mb-court-name-row">
                      <h3 className="mb-court-name">{court.name}</h3>
                      <span className="mb-rating">
                        <span className="material-symbols-outlined">star</span>
                        {court.rating > 0 ? court.rating : 'Chưa có'}
                      </span>
                    </div>
                    <p className="mb-court-addr">
                      <span className="material-symbols-outlined">location_on</span>
                      {court.address}
                    </p>
                    <div className="mb-court-meta" style={{ flexWrap: 'wrap', gap: 5 }}>
                      {court.isFromApi && (
                        <span className="mb-tag" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}>
                          ✦ Cụm sân hệ thống
                        </span>
                      )}
                      {query.trim() && (() => {
                        const badge = getMatchBadge(court, query)
                        return badge ? (
                          <span className={`mb-tag ${badge.className}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, marginRight: 2 }}>{badge.icon}</span>
                            {badge.label}
                          </span>
                        ) : null
                      })()}
                      <span className="mb-tag">
                        {sport?.emoji} {sport?.label}
                      </span>
                      {freeFacilityIds && freeSlotCounts[String(court.id)] > 0 && (
                        <span className="mb-tag" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                          {freeSlotCounts[String(court.id)]} ca trống
                        </span>
                      )}
                      {Array.isArray(court.amenities) && court.amenities.slice(0, 2).map((a) => (
                        <span key={a.id || a.name} className="mb-tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                          {a.name}
                        </span>
                      ))}
                      {court.distance != null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <span className="material-symbols-outlined">directions_car</span>
                          {court.distance} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-court-bottom">
                  <span className="mb-price">
                    {court.price > 0 ? (
                      <>
                        {court.price.toLocaleString('vi-VN')} Điểm<small>/h</small>
                      </>
                    ) : (
                      <small>Liên hệ</small>
                    )}
                  </span>
                  <div>
                    {active ? (
                      <button type="button" className="mb-btn mb-btn--primary">
                        Đang Chọn
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mb-btn mb-btn--ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectCourt(court)
                        }}
                      >
                        Chọn Nhanh
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
          </div>
          )}

          {/* Slot grid */}
          <section className="mb-card" aria-label="Lịch sân">
            <div className="mb-slots-head">
              <div>
                <h2>
                  Lưới Lịch Sân Trực Quan: {selectedCourt ? selectedCourt.name : '—'}{' '}
                  {slotDurationLabel && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', marginLeft: '6px', verticalAlign: 'middle' }}>
                      {slotDurationLabel}
                    </span>
                  )}
                </h2>
                <p className="mb-slots-sub-desc">
                  Xem lịch trống và đặt sân theo ngày: <strong>{selectedDateInfo.fullLabel}</strong>
                </p>
              </div>
              <div className="mb-legend">
                <span>
                  <i style={{ background: 'var(--mb-red-bg)', border: '1.5px solid var(--mb-red-line)' }} /> Đã Đặt
                </span>
                <span>
                  <i style={{ background: 'var(--mb-amber-bg)', border: '1.5px solid var(--mb-amber-line)' }} /> Đang Trống
                </span>
                <span>
                  <i style={{ background: '#255510', border: '1.5px solid #4a8e22' }} /> Đang Chọn
                </span>
              </div>
            </div>

            {/* Thanh chọn ngày trực quan: Hôm nay, Ngày mai, và các ngày tiếp theo */}
            <div className="mb-date-bar">
              <div className="mb-date-scroll">
                {weekDays.map((d) => {
                  const isSelected = d.dateStr === selectedDateStr
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      className={`mb-date-pill ${isSelected ? 'is-active' : ''}`}
                      disabled={d.isPast}
                      title={d.isPast ? 'Ngày đã qua' : undefined}
                      onClick={() => {
                        setSelectedDateStr(d.dateStr)
                        setPickedSlotIds(null)
                      }}
                    >
                      <span className="mb-date-pill-day">{d.dayOfWeek}</span>
                      <span className="mb-date-pill-num">{d.dayNum}</span>
                      <span className="mb-date-pill-month">Tháng {d.monthNum}</span>
                      {d.isTomorrow && <span className="mb-date-pill-tag">Ngày mai</span>}
                    </button>
                  )
                })}
              </div>
              <MonthCalendarPicker
                value={selectedDateStr}
                minDate={todayIsoDate}
                onChange={(dateStr) => {
                  setSelectedDateStr(dateStr)
                  setPickedSlotIds(null)
                }}
              />
            </div>

            {isLoadingSlots ? (
              <div className="mb-slots-loading">
                <div className="mb-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                <span>Đang kiểm tra lịch trống ngày {selectedDateInfo.fullLabel}...</span>
              </div>
            ) : !selectedCourt ? (
              <div className="mb-empty">
                <span className="material-symbols-outlined">event_busy</span>
                Chọn một cụm sân để xem lịch trống.
              </div>
            ) : slots.length === 0 ? (
              <div className="mb-empty">
                <span className="material-symbols-outlined">event_busy</span>
                {slotsError || `Ngày ${selectedDateInfo.fullLabel} hiện chưa có ca trống nào khả dụng. Vui lòng chọn ngày khác.`}
              </div>
            ) : (
              <div className="mb-slots">
                {slots.map((slot, i) => {
                  const delay = { animationDelay: `${i * 35}ms` }

                  // Ô ĐÃ ĐẶT (Màu đỏ, kích thước nhỏ gọn — Không cho phép click)
                  if (slot.status === 'booked') {
                    return (
                      <div
                        key={slot.id}
                        className="mb-slot mb-slot--booked"
                        style={{ ...delay, pointerEvents: 'none', cursor: 'not-allowed' }}
                        aria-disabled="true"
                        title={`Khung giờ ${slot.start} - ${slot.end} đã được đặt kín (${slot.note || 'Đã kín lịch'})`}
                      >
                        <div className="mb-slot-compact-head">
                          <span className="mb-slot-time">{slot.start} - {slot.end}</span>
                          <span className="material-symbols-outlined mb-slot-lock">lock</span>
                        </div>
                        <div className="mb-slot-compact-sub">
                          <span className="mb-slot-note">{slot.note || 'Đã kín lịch'}</span>
                        </div>
                      </div>
                    )
                  }

                  const isSelected = selectedSlots.some((s) => s.id === slot.id)

                  // Ô ĐANG CHỌN hoặc ĐANG TRỐNG (Kích thước nhỏ gọn đồng nhất 52px, click để xem popup chi tiết)
                  return (
                    <button
                      key={slot.id}
                      id={`mb-slot-${slot.id}`}
                      type="button"
                      className={`mb-slot ${isSelected ? 'mb-slot--selected-compact' : 'mb-slot--available'}`}
                      style={delay}
                      onClick={() => handleSelectSlot(slot)}
                      title={`Khung giờ: ${slot.start} - ${slot.end} (${formatVnd(slot.price)}) - Bấm để chọn / bỏ chọn`}
                    >
                      <div className="mb-slot-compact-head">
                        <span className="mb-slot-time">{slot.start} - {slot.end}</span>
                        {isSelected ? (
                          <span className="material-symbols-outlined mb-slot-check-ic">check</span>
                        ) : (
                          <span className="mb-slot-chip-avail">Trống • {shortHours(slot.hours)}</span>
                        )}
                      </div>
                      <div className="mb-slot-compact-sub">
                        <span className="mb-slot-price">{formatVnd(slot.price)}</span>
                        {isSelected && (
                          <span className="mb-slot-chip-selected">Đang chọn</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* BẢNG CHỌN SÂN TRONG CỤM (CHO PHÉP CHỌN VÀ ĐẶT NHIỀU SÂN CÙNG KHUNG GIỜ) */}
            {selectedCourt && selectedSlot && (
              <div className="mb-subcourts-container">
                <div className="mb-subcourts-head">
                  <div className="mb-subcourts-title-group">
                    <span className="material-symbols-outlined mb-subcourts-ic">grid_view</span>
                    <div>
                      <h3 className="mb-subcourts-title">
                        Chọn Sân Trong Cụm (Cho phép chọn và đặt nhiều sân cùng khung giờ)
                      </h3>
                      <p className="mb-subcourts-sub">
                        Khung giờ: <strong>{selectedSlot.start} - {selectedSlot.end}</strong> • Đang chọn{' '}
                        <strong className="mb-subcourts-highlight">{courtQuantity} sân</strong>
                      </p>
                    </div>
                  </div>
                  <div className="mb-subcourts-actions">
                    <button
                      type="button"
                      className="mb-subcourt-action-btn"
                      onClick={handleSelectAllSubCourts}
                      title="Chọn toàn bộ các sân còn trống trong khung giờ này"
                    >
                      <span className="material-symbols-outlined">select_all</span>
                      Chọn tất cả sân trống
                    </button>
                    <button
                      type="button"
                      className="mb-subcourt-action-btn mb-subcourt-action-btn--ghost"
                      onClick={() => primaryCourt && setSelectedSubCourtIds([primaryCourt.id])}
                      title="Chỉ chọn 1 sân duy nhất"
                    >
                      Chỉ chọn 1 sân
                    </button>
                  </div>
                </div>

                <div className="mb-subcourts-tip">
                  <span className="material-symbols-outlined">tips_and_updates</span>
                  <span>
                    💡 <strong>Tính năng Đa Sân:</strong> Bạn có thể chọn thêm <strong>các sân cùng môn {primaryCourt?.categoryName || ''}</strong> còn trống trong khung giờ {selectedSlot.start} - {selectedSlot.end} cho nhóm bạn đông người, giao lưu câu lạc bộ hoặc tổ chức giải đấu.
                  </span>
                </div>

                <div className="mb-subcourts-grid">
                  {venueSubCourts.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: 13, color: '#6b7280' }}>Cơ sở chưa công bố danh sách sân con.</p>
                  )}
                  {/* Chỉ các sân cùng môn với sân chính; sân thêm phải có ca trống đúng giờ đã chọn */}
                  {venueSubCourts.filter((court) => primaryCourt && court.categoryName === primaryCourt.categoryName).map((court) => {
                    const isPrimary = court.id === primaryCourt.id
                    const check = isPrimary ? { state: 'ok', slots: selectedSlots } : courtCheck(court)
                    const isSelected = isPrimary || extraCourts.some((c) => c.id === court.id)
                    const isBlocked = court.isBooked || check.state !== 'ok'
                    const statusText = court.isBooked
                      ? court.note
                      : isPrimary
                        ? 'Sân đang xem lịch'
                        : isSelected
                          ? 'Đang chọn'
                          : check.state === 'loading'
                            ? 'Đang kiểm tra…'
                            : check.state === 'ok'
                              ? 'Trống'
                              : 'Không có ca trống giờ này'

                    return (
                      <div
                        key={court.id}
                        className={`mb-subcourt-card ${isSelected ? 'is-selected' : isBlocked ? 'is-booked' : 'is-available'}`}
                        onClick={() => !isPrimary && !isBlocked && handleToggleSubCourt(court.id)}
                        role="button"
                        tabIndex={isPrimary || isBlocked ? -1 : 0}
                        aria-disabled={isPrimary || isBlocked}
                        title={
                          isPrimary
                            ? `${court.name} là sân đang xem lịch. Đổi sân ở mục "Xem lịch sân khác" bên dưới`
                            : isBlocked
                              ? `${court.name}: ${statusText}`
                              : isSelected
                                ? `Đang chọn ${court.name}. Bấm để bỏ chọn`
                                : `Bấm để chọn thêm ${court.name}`
                        }
                      >
                        <div className="mb-subcourt-row-top">
                          <div className="mb-subcourt-checkbox">
                            {isSelected ? (
                              <span className="material-symbols-outlined">check_circle</span>
                            ) : isBlocked ? (
                              <span className="material-symbols-outlined">lock</span>
                            ) : (
                              <span className="material-symbols-outlined">radio_button_unchecked</span>
                            )}
                          </div>
                          <strong className="mb-subcourt-name" title={court.name}>{court.name}</strong>
                        </div>

                        <div className="mb-subcourt-row-bottom">
                          <span className={`mb-subcourt-status ${isSelected ? 'status-selected' : isBlocked ? 'status-booked' : 'status-avail'}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Đổi sân đang xem lịch (kể cả sân khác môn: không đặt chung được với sân khác môn) */}
                {primaryCourt && venueSubCourts.some((c) => c.id !== primaryCourt.id && !c.isBooked) && (
                  <div className="mb-subcourts-other">
                    <span>Xem lịch sân khác:</span>
                    {venueSubCourts
                      .filter((c) => c.id !== primaryCourt.id && !c.isBooked)
                      .map((c) => (
                        <button key={c.id} type="button" onClick={() => handleSelectSingleSubCourt(c.id)}>
                          {c.name} · {c.categoryName}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Summary */}
          <section className="mb-card" ref={summaryRef} aria-label="Xác nhận chọn sân">
            <div className="mb-summary-box">
              <div className="mb-summary-ic">
                <span style={{ fontSize: 22 }}>{sportOf(selectedCourt?.sport)?.emoji || '🏸'}</span>
              </div>
              <div className="mb-summary-info">
                <h3>
                  {selectedCourt
                    ? `${courtQuantity} Sân: ${activeSubCourts.map((c) => c.name).join(', ')}`
                    : 'Chưa chọn sân'}
                  {selectedSlot && (
                    <span className="mb-pill-green">Đã khóa Giữ ({courtQuantity} sân)</span>
                  )}
                </h3>
                <p>
                  <span className="material-symbols-outlined">schedule</span>
                  {selectedSlot
                    ? `${selectedTimeText} (${selectedDateInfo.fullLabel}) • ${selectedSlots.length} ca, ${formatHours(selectedHours)} • ${selectedCourt?.name}`
                    : 'Vui lòng chọn khung giờ còn trống trên lưới lịch (bấm nhiều ca để đặt liên tiếp)'}
                </p>
                {courtQuantity > 1 && (
                  <div className="mb-summary-multicourt-note">
                    <span className="material-symbols-outlined">layers</span>
                    <span>
                      Đang chọn <strong>{courtQuantity} sân cùng khung giờ</strong> ({formatVnd(selectedSlot.price)}/sân)
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-summary-total">
                <small>{repeat.slots.length ? `Tổng tiền ${orderSlotCount} ca:` : `Tổng tiền ${courtQuantity} sân:`}</small>
                <strong>{selectedSlot ? formatVnd(orderDiscount.payable) : '0 Điểm'}</strong>
                {orderDiscount.applies && (
                  <span className="mb-summary-unit-calc">
                    Tạm tính {formatVnd(orderTotal)} · Giảm {BULK_DISCOUNT_PERCENT}% khi đặt gói tháng (−{formatVnd(orderDiscount.amount)})
                  </span>
                )}
                {courtQuantity > 1 && (
                  <span className="mb-summary-unit-calc">
                    ({courtQuantity} sân × {formatVnd(selectedSlot.price)})
                  </span>
                )}
              </div>
            </div>

            {selectedSlot && (
              <RepeatBookingPanel repeat={repeat} disabledReason={courtQuantity > 1 ? 'Đặt định kỳ áp dụng khi chọn 1 sân. Vui lòng bỏ bớt sân trong cụm.' : ''} />
            )}
            {selectedSlot && !orderDiscount.applies && selectedCourt?.rawFacility?.isBulkDiscountEnabled && (
              <p className="mb-secure-note">Đặt từ {BULK_MIN_SLOTS} ca trở lên (vd lặp lại mỗi tuần) để được giảm {BULK_DISCOUNT_PERCENT}%.</p>
            )}
            <button
              id="mb-confirm-booking"
              type="button"
              className="mb-btn mb-btn--primary mb-confirm"
              disabled={!selectedSlot || activeSubCourts.length === 0 || (repeat.enabled && !repeat.ready)}
              onClick={handleConfirm}
            >
              {orderSlotCount > 1 ? `Xác Nhận Đặt ${orderSlotCount} Ca` : `Xác Nhận Đặt ${courtQuantity} Sân`}
            </button>
            <p className="mb-secure-note">
              <span className="material-symbols-outlined">verified_user</span>
              Hệ thống giữ chỗ độc quyền trong 15:00 phút để bạn tiến hành thanh toán an toàn cho toàn bộ {courtQuantity} sân.
            </p>
          </section>
        </div>
      </div>

      {/* ===================== AI CHAT ASSISTANT MODAL ===================== */}
      <AIChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentCourtId={selectedCourtId}
        onSelectCourtSlot={({ courtId, slotId }) => {
          if (courtId) selectCourt(courtId)
          if (slotId) {
            setPickedSlotIds([slotId])
            setHoldLeft(HOLD_SECONDS)
          }
          setTimeout(() => {
            summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 250)
        }}
      />
    </div>
  )
}

export default MapBooking
