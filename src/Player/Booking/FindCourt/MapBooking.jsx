import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSport } from '../../Context/SportContext.jsx'
import { getFacilities, searchFacilities, getFacilityLocations, transformFacilityToCourt } from '../../../api/player/facilityApi.js'
import { getCourtSlots } from '../../../api/player/bookingApi.js'
import AIChatModal from '../AIChat/AIChatModal.jsx'
import InteractiveCourtMap from './InteractiveCourtMap.jsx'
import './MapBooking.css'

const PRICE_MIN = 40000
const PRICE_MAX = 500000
const PRICE_STEP = 10000
const HOLD_SECONDS = 15 * 60

// Thông tin quận — dùng cho tìm kiếm & đồng bộ vị trí
const DISTRICTS = {
  thuduc: { name: 'TP. Thủ Đức', aliases: 'thu duc td q2 q.2 quan 2 quan 9 q9 thao dien tang nhon phu le van viet binh trieu hiep phu dinh phong phu hue an hue an linh tay sala' },
  q1: { name: 'Quận 1', aliases: 'q1 q.1 quan1 quan 1 ben thanh tao dan nguyen thi minh khai huyen tran cong chua lao dong' },
  q3: { name: 'Quận 3', aliases: 'q3 q.3 quan3 quan 3 ho xuan huong nam ky khoi nghia vo thi sau ban co ga sai gon' },
  q5: { name: 'Quận 5', aliases: 'q5 q.5 quan5 quan 5 tinh vo dai the gioi nguyen trai tran hung dao' },
  q7: { name: 'Quận 7', aliases: 'q7 q.7 quan7 quan 7 phu my hung tan thuan huynh tan phat nguyen van linh nguyen luong bang tre xanh long vien' },
  quan8: { name: 'Quận 8', aliases: 'q8 q.8 quan8 quan 8 chanh hung bong sao pham hung ta quang buu dong dieu cao lo' },
  q10: { name: 'Quận 10', aliases: 'q10 q.10 quan10 quan 10 ky hoa 3 thang 2 ba thang hai to hien thanh lan anh cach mang thang 8 bac hai thanh thai' },
  q11: { name: 'Quận 11', aliases: 'q11 q.11 quan11 quan 11 phu tho ly thuong kiet lac long quan dam sen hoa binh' },
  q12: { name: 'Quận 12', aliases: 'q12 q.12 quan12 quan 12 thoi an le van khuong cau vong nguyen van qua' },
  binhthanh: { name: 'Bình Thạnh', aliases: 'binh thanh q.bt qbt dien bien phu hang xanh bach dang thanh da chu van an' },
  phunhuan: { name: 'Phú Nhuận', aliases: 'phu nhuan pn q.pn quan phu nhuan rach mieu phan xich long hoa phuong hoang dieu' },
  tanbinh: { name: 'Tân Bình', aliases: 'tan binh q.tb qtb hoang hoa tham ga truc thang cong hoa viettel tan son truong chinh' },
  tanphu: { name: 'Tân Phú', aliases: 'tan phu q.tp qtp celadon bo bao tan thang luy ban bich thien van thoai ngoc hau' },
  govap: { name: 'Gò Vấp', aliases: 'go vap q.gv qgv quang trung phan van tri nguyen oanh khang an ben cat an hoi pham van chieu' },
  binhtan: { name: 'Bình Tân', aliases: 'binh tan q.btn qbtn le trong tan binh hung hoa' },
}

// Bỏ dấu tiếng Việt + chữ thường để tìm kiếm không phân biệt dấu
const normalizeText = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

// Xác định key quận từ vị trí hồ sơ hoặc địa chỉ người chơi cung cấp
const detectDistrictKey = (loc = '') => {
  const norm = normalizeText(loc)
  if (norm.includes('thu duc') || norm.includes('thao dien') || norm.includes('quan 2') || norm.includes('q2') || norm.includes('quan 9') || norm.includes('q9') || norm.includes('le van viet') || norm.includes('tang nhon phu') || norm.includes('binh trieu') || norm.includes('hiep phu') || norm.includes('dinh phong phu') || norm.includes('hue an') || norm.includes('linh tay') || norm.includes('sala')) return 'thuduc'
  if (norm.includes('binh thanh') || norm.includes('dinh bo linh') || norm.includes('dien bien phu') || norm.includes('hang xanh') || norm.includes('chu van an') || norm.includes('thanh da')) return 'binhthanh'
  if (norm.includes('quan 7') || norm.includes('q7') || norm.includes('phu my hung') || norm.includes('huynh tan phat') || norm.includes('nguyen thi thap') || norm.includes('nguyen luong bang') || norm.includes('tre xanh') || norm.includes('long vien')) return 'q7'
  if (norm.includes('quan 1') || norm.includes('q1') || norm.includes('ben thanh') || norm.includes('tao dan') || norm.includes('huyen tran') || norm.includes('lao dong')) return 'q1'
  if (norm.includes('quan 3') || norm.includes('q3') || norm.includes('ho xuan huong') || norm.includes('vo thi sau') || norm.includes('ga sai gon')) return 'q3'
  if (norm.includes('quan 5') || norm.includes('q5') || norm.includes('tinh vo') || norm.includes('dai the gioi')) return 'q5'
  if (norm.includes('quan 10') || norm.includes('q10') || norm.includes('ky hoa') || norm.includes('lan anh') || norm.includes('ba thang hai') || norm.includes('3 thang 2') || norm.includes('bac hai')) return 'q10'
  if (norm.includes('phu nhuan') || norm.includes('rach mieu') || norm.includes('phan xich long') || norm.includes('hoa phuong')) return 'phunhuan'
  if (norm.includes('tan binh') || norm.includes('hoang hoa tham') || norm.includes('ga truc thang') || norm.includes('viettel') || norm.includes('tan son')) return 'tanbinh'
  if (norm.includes('quan 8') || norm.includes('q8') || norm.includes('chanh hung') || norm.includes('bong sao') || norm.includes('dong dieu')) return 'quan8'
  if (norm.includes('tan phu') || norm.includes('celadon') || norm.includes('thien van')) return 'tanphu'
  if (norm.includes('go vap') || norm.includes('quang trung') || norm.includes('khang an') || norm.includes('ben cat') || norm.includes('an hoi')) return 'govap'
  if (norm.includes('quan 11') || norm.includes('q11') || norm.includes('phu tho') || norm.includes('dam sen')) return 'q11'
  if (norm.includes('quan 12') || norm.includes('q12') || norm.includes('thoi an') || norm.includes('cau vong')) return 'q12'
  if (norm.includes('binh tan') || norm.includes('le trong tan')) return 'binhtan'
  return 'thuduc'
}

// Ma trận khoảng cách ước tính giữa các quận (km)
const DISTRICT_DISTANCES = {
  thuduc: { thuduc: 1.0, binhthanh: 4.2, q1: 7.5, phunhuan: 8.0, q10: 10.5, q7: 12.0, tanbinh: 9.5, quan8: 13.0, tanphu: 14.0, govap: 9.0, q3: 8.5, q11: 12.0, q5: 11.5, q12: 13.0, binhtan: 15.0 },
  binhthanh: { binhthanh: 1.0, phunhuan: 2.8, q1: 3.5, thuduc: 4.2, q10: 6.0, q7: 7.5, tanbinh: 4.5, quan8: 9.0, tanphu: 8.5, govap: 4.0, q3: 4.0, q11: 7.0, q5: 6.5, q12: 8.0, binhtan: 10.0 },
  q7: { q7: 1.0, q1: 5.5, binhthanh: 7.5, q10: 8.0, phunhuan: 9.5, thuduc: 12.0, quan8: 4.5, tanbinh: 9.0, tanphu: 11.0, govap: 12.5, q3: 7.0, q11: 9.5, q5: 6.5, q12: 14.0, binhtan: 10.5 },
  q1: { q1: 1.0, binhthanh: 3.5, phunhuan: 3.8, q10: 4.0, q7: 5.5, thuduc: 7.5, tanbinh: 5.0, quan8: 6.0, tanphu: 8.0, govap: 7.0, q3: 2.0, q11: 5.5, q5: 3.5, q12: 11.0, binhtan: 9.0 },
  q3: { q3: 1.0, q1: 2.0, q10: 2.5, phunhuan: 2.5, binhthanh: 4.0, tanbinh: 4.0, q7: 7.0, quan8: 5.5, tanphu: 6.5, govap: 6.0, thuduc: 8.5, q11: 4.0, q5: 3.0, q12: 9.5, binhtan: 7.5 },
  q5: { q5: 1.0, q10: 2.0, q1: 3.5, q3: 3.0, quan8: 3.0, q11: 2.5, tanbinh: 4.5, tanphu: 5.0, q7: 6.5, binhthanh: 6.5, phunhuan: 5.0, govap: 8.0, thuduc: 11.5, q12: 10.0, binhtan: 5.5 },
  q10: { q10: 1.0, q1: 4.0, phunhuan: 4.5, binhthanh: 6.0, q7: 8.0, thuduc: 10.5, tanbinh: 3.5, quan8: 4.0, tanphu: 5.0, govap: 6.5, q3: 2.5, q11: 2.5, q5: 2.0, q12: 8.5, binhtan: 6.5 },
  phunhuan: { phunhuan: 1.0, binhthanh: 2.8, q1: 3.8, q10: 4.5, thuduc: 8.0, q7: 9.5, tanbinh: 3.0, quan8: 7.5, tanphu: 6.0, govap: 3.5, q3: 2.5, q11: 5.5, q5: 5.0, q12: 8.0, binhtan: 8.5 },
  tanbinh: { tanbinh: 1.0, phunhuan: 3.0, q10: 3.5, q1: 5.0, govap: 3.5, tanphu: 3.0, binhthanh: 4.5, thuduc: 9.5, q7: 9.0, quan8: 6.5, q3: 4.0, q11: 3.8, q5: 4.5, q12: 6.0, binhtan: 5.0 },
  quan8: { quan8: 1.0, q7: 4.5, q10: 4.0, q1: 6.0, tanbinh: 6.5, tanphu: 7.0, binhthanh: 9.0, phunhuan: 7.5, thuduc: 13.0, govap: 11.0, q3: 5.5, q11: 5.0, q5: 3.0, q12: 12.0, binhtan: 6.0 },
  tanphu: { tanphu: 1.0, tanbinh: 3.0, q10: 5.0, quan8: 7.0, q1: 8.0, govap: 6.0, phunhuan: 6.0, binhthanh: 8.5, thuduc: 14.0, q7: 11.0, q3: 6.5, q11: 4.5, q5: 5.0, q12: 6.5, binhtan: 3.5 },
  govap: { govap: 1.0, tanbinh: 3.5, phunhuan: 3.5, binhthanh: 4.0, q1: 7.0, q10: 6.5, thuduc: 9.0, tanphu: 6.0, quan8: 11.0, q7: 12.5, q3: 6.0, q11: 7.5, q5: 8.0, q12: 4.5, binhtan: 7.5 },
  q11: { q11: 1.0, q10: 2.5, tanbinh: 3.8, tanphu: 4.5, quan8: 5.0, q1: 5.5, q3: 4.0, phunhuan: 5.5, binhthanh: 7.0, thuduc: 12.0, q7: 9.5, govap: 7.5, q5: 2.5, q12: 7.5, binhtan: 4.5 },
  q12: { q12: 1.0, govap: 4.5, tanbinh: 6.0, tanphu: 6.5, binhthanh: 8.0, thuduc: 13.0, q10: 8.5, q11: 7.5, q1: 11.0, q3: 9.5, q5: 10.0, quan8: 12.0, q7: 14.0, binhtan: 8.0 },
  binhtan: { binhtan: 1.0, tanphu: 3.5, q11: 4.5, q5: 5.5, tanbinh: 5.0, quan8: 6.0, q10: 6.5, q1: 9.0, q3: 7.5, govap: 7.5, q12: 8.0, binhthanh: 10.0, q7: 10.5, thuduc: 15.0 },
}

// Công thức tính khoảng cách Haversine chính xác theo tọa độ GPS (km)
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371 // Bán kính Trái Đất theo km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// Tọa độ trung tâm các quận trên Google Maps TP. Hồ Chí Minh
const DISTRICT_COORDS = {
  thuduc: { lat: 10.8490, lng: 106.7537, name: 'TP. Thủ Đức' },
  binhthanh: { lat: 10.8105, lng: 106.6975, name: 'Bình Thạnh' },
  q7: { lat: 10.7340, lng: 106.7215, name: 'Quận 7' },
  q1: { lat: 10.7756, lng: 106.7004, name: 'Quận 1' },
  q3: { lat: 10.7788, lng: 106.6852, name: 'Quận 3' },
  q5: { lat: 10.7538, lng: 106.6621, name: 'Quận 5' },
  q10: { lat: 10.7715, lng: 106.6672, name: 'Quận 10' },
  q11: { lat: 10.7652, lng: 106.6578, name: 'Quận 11' },
  q12: { lat: 10.8524, lng: 106.6542, name: 'Quận 12' },
  phunhuan: { lat: 10.7992, lng: 106.6803, name: 'Phú Nhuận' },
  tanbinh: { lat: 10.8015, lng: 106.6534, name: 'Tân Bình' },
  quan8: { lat: 10.7242, lng: 106.6286, name: 'Quận 8' },
  tanphu: { lat: 10.7901, lng: 106.6281, name: 'Tân Phú' },
  govap: { lat: 10.8388, lng: 106.6653, name: 'Gò Vấp' },
  binhtan: { lat: 10.7825, lng: 106.6085, name: 'Bình Tân' },
}

// Tính khoảng cách sân linh hoạt theo vị trí người chơi và tọa độ vệ tinh GPS trực tiếp từ Google Maps
const getDistanceForCourt = (court, playerLocation, liveCoords = null) => {
  if (liveCoords && liveCoords.lat && liveCoords.lng && court.lat && court.lng) {
    const d = haversineDistanceKm(liveCoords.lat, liveCoords.lng, court.lat, court.lng)
    if (d != null) return Math.max(0.2, d)
  }
  const userDistrict = detectDistrictKey(playerLocation)
  const userCoords = DISTRICT_COORDS[userDistrict]
  if (userCoords && court.lat && court.lng) {
    const d = haversineDistanceKm(userCoords.lat, userCoords.lng, court.lat, court.lng)
    if (d != null) return Math.max(0.4, d)
  }
  const courtDistrict = court.district || 'thuduc'
  const base = DISTRICT_DISTANCES[userDistrict]?.[courtDistrict] ?? 5.0
  const offset = (court.id.charCodeAt(0) % 5) * 0.2
  return Math.max(0.6, Math.round((base + offset) * 10) / 10)
}

// Mẫu khung giờ — giá được tính theo giá/giờ của từng cụm sân (sân mở cửa 06:00 - 22:00)
const SLOT_TEMPLATE = [
  { id: 's1', start: '16:00', end: '17:00', hours: 1, factor: 1, status: 'booked', note: 'Đã qua giờ' },
  { id: 's2', start: '17:00', end: '18:00', hours: 1, factor: 1, status: 'booked', note: 'Đã qua giờ' },
  { id: 's3', start: '18:00', end: '19:00', hours: 1, factor: 1, status: 'booked', note: 'Đã qua giờ' },
  { id: 's4', start: '19:00', end: '20:00', hours: 1, factor: 1, status: 'available' },
  { id: 's5', start: '20:00', end: '21:00', hours: 1, factor: 1, status: 'available' },
  { id: 's6', start: '21:00', end: '22:00', hours: 1, factor: 0.91, status: 'available' },
]

const formatVnd = (n) => `${n.toLocaleString('vi-VN')} đ`
const formatK = (n) => `${n / 1000}k`
const roundTo10k = (n) => Math.round(n / 10000) * 10000

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
      c.mapQuery,
      c.subCourt,
      c.subCourtDesc,
      DISTRICTS[c.district]?.name,
      DISTRICTS[c.district]?.aliases,
      SPORT_SEARCH_TEXT[c.sport] || '',
    ].join(' ')
  )

// Các từ dừng thông dụng khi người dùng tìm kiếm sân cầu lông/pickleball
const STOP_WORDS = new Set([
  'san', 'clb', 'cum', 'khu', 'tim', 'dat', 'o', 'tai', 'gan', 'cho',
  'the', 'thao', 'tt', 'phuong', 'quan', 'tp', 'thanh', 'pho', 'duong',
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

  // 1. Khớp chuỗi trực tiếp (vd: "lan anh", "viettel", "chanh hung", "q10", "dien bien phu")
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

  // 3. Khớp theo tỷ lệ các từ khóa cốt lõi (tên riêng như "lan", "anh", "viettel", "bong", "sao", "celadon")
  const matchedCount = meaningfulTokens.filter((token) => compactIndex.includes(token)).length
  return matchedCount >= Math.ceil(meaningfulTokens.length * 0.5)
}

// Phân loại kết quả tìm kiếm thông minh: Tên sân, Tuyến đường hay Quận/Khu vực
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

  // 3. Khớp tên quận / khu vực
  const districtObj = DISTRICTS[court.district]
  if (districtObj) {
    const distNameCompact = normalizeText(districtObj.name).replace(/[^a-z0-9]/g, '')
    const distAliasCompact = normalizeText(districtObj.aliases).replace(/[^a-z0-9]/g, '')
    if (distNameCompact.includes(compactQuery) || distAliasCompact.includes(compactQuery)) {
      return { type: 'district', label: 'Quận / Khu vực', className: 'mb-badge-district', icon: 'map' }
    }
  }

  return { type: 'general', label: 'Gần bạn', className: 'mb-badge-general', icon: 'near_me' }
}

// Tính lộ trình và thời gian di chuyển động dựa theo điểm xuất phát của người chơi
const calculateRoute = (court, origin) => {
  if (!court) return { eta: 'Chưa xác định', note: '' }
  const dist = court.distance || 1.0
  const mins = Math.max(3, Math.round(dist * 2.6))
  return {
    eta: `~${mins} phút di chuyển xe máy (${dist.toFixed(1)} km)`,
    note: `Tuyến đường tối ưu từ “${origin}” đến ${court.name}`,
  }
}

const formatHours = (h) => `${String(h).replace('.', ',')} giờ`
const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function buildSlots(court) {
  return SLOT_TEMPLATE.map((t) => {
    const status = court.overrides[t.id] || t.status
    return {
      ...t,
      status,
      note: status === 'booked' ? t.note || 'Đã kín lịch' : null,
      price: roundTo10k(court.price * t.hours * t.factor),
    }
  })
}

function MapBooking() {
  const navigate = useNavigate()
  const { isSportActive, toggleSport, selectAllSports, SPORTS_LIST } = useSport()

  // Vị trí người chơi lấy từ Hồ sơ cá nhân (mặc định 'Thủ Đức')
  const [userProfileLocation, setUserProfileLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.location) return parsed.location
      }
    } catch {}
    return 'Thủ Đức'
  })

  // Điểm xuất phát tùy chỉnh (cho phép người chơi nhập vị trí cụ thể bất kỳ để chỉ đường)
  const [customOrigin, setCustomOrigin] = useState('')
  const [isEditingOrigin, setIsEditingOrigin] = useState(false)

  // Tọa độ GPS thiết bị người chơi (lấy ngầm để tính khoảng cách và định vị chính xác)
  const [gpsCoords, setGpsCoords] = useState(null)

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
        const key = detectDistrictKey(userProfileLocation)
        const fallback = DISTRICT_COORDS[key] || DISTRICT_COORDS.thuduc
        setGpsCoords({
          lat: fallback.lat,
          lng: fallback.lng,
          accuracy: 12,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    )
  }, [userProfileLocation])

  // Vị trí hiệu lực: ưu tiên địa chỉ người dùng tự nhập, sau đó đến hồ sơ hoặc Thủ Đức
  const effectiveOrigin = useMemo(() => {
    if (customOrigin.trim()) return customOrigin.trim()
    return userProfileLocation || 'Thủ Đức'
  }, [customOrigin, userProfileLocation])

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
        } catch {}
      }
    }
    const handleStorage = (e) => {
      if (e.key === 'player_profile_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.location) setUserProfileLocation(parsed.location)
        } catch {}
      }
    }
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Lấy dữ liệu cơ sở thực tế từ Backend API /api/v1/facilities
  const [apiFacilities, setApiFacilities] = useState([])
  const [isLoadingApi, setIsLoadingApi] = useState(true)
  const [apiStatus, setApiStatus] = useState('connecting')
  const [apiLocations, setApiLocations] = useState([])

  // Lấy danh sách địa điểm / khu vực từ GET /api/v1/facilities/locations
  useEffect(() => {
    let isMounted = true
    async function loadLocations() {
      try {
        const locs = await getFacilityLocations()
        if (isMounted && Array.isArray(locs) && locs.length > 0) {
          setApiLocations(locs)
        }
      } catch (e) {
        console.warn('MapBooking: Không thể tải locations:', e)
      }
    }
    loadLocations()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    async function loadBackendFacilities() {
      try {
        setIsLoadingApi(true)
        const rawFacilities = await getFacilities()
        if (isMounted && Array.isArray(rawFacilities) && rawFacilities.length > 0) {
          const transformed = rawFacilities.map(transformFacilityToCourt).filter(Boolean)
          setApiFacilities(transformed)
          setApiStatus('connected')
          if (transformed.length > 0) {
            setSelectedCourtId((prev) => {
              const exists = transformed.some((fac) => fac.id === prev)
              return exists ? prev : transformed[0].id
            })
          }
        } else {
          if (isMounted) setApiStatus('fallback')
        }
      } catch (err) {
        console.warn('API /api/v1/facilities không phản hồi:', err)
        if (isMounted) setApiStatus('fallback')
      } finally {
        if (isMounted) setIsLoadingApi(false)
      }
    }
    loadBackendFacilities()
    return () => { isMounted = false }
  }, [])

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


  // Danh sách cụm sân trực tiếp từ Backend API GET /api/v1/facilities (fallback sang COURTS nếu API chưa tải xong hoặc rỗng)
  const localizedCourts = useMemo(() => {
    const list = apiFacilities

    return list.map((c) => ({
      ...c,
      distance: getDistanceForCourt(c, effectiveOrigin, gpsCoords),
    }))
  }, [apiFacilities, effectiveOrigin, gpsCoords])

  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX])
  const [priceEdit, setPriceEdit] = useState(null) // { idx, text } khi đang gõ giá

  // Mặc định chọn cụm sân gần nhất với vị trí xuất phát hoặc tọa độ vệ tinh
  const [selectedCourtId, setSelectedCourtId] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      const loc = saved ? JSON.parse(saved).location : 'Thủ Đức'
      const key = detectDistrictKey(loc)
      if (key === 'thuduc') return 'ddink-td'
      if (key === 'binhthanh') return 'yonex-bt'
      if (key === 'q7') return 'trexanh-q7'
      if (key === 'q1') return 'taodan-q1'
      if (key === 'q10') return 'lananh-q10'
      if (key === 'phunhuan') return 'rachmieu-pn'
      if (key === 'tanbinh') return 'viettel-tb'
      if (key === 'quan8') return 'chanhhung-q8'
      if (key === 'tanphu') return 'celadon-tp'
      if (key === 'govap') return 'quangtrung-gv'
      if (key === 'q3') return 'hoxuanhuong-q3'
      if (key === 'q11') return 'phutho-q11'
    } catch {}
    return 'lananh-q10'
  })

  // Tự động chuyển sân ưu tiên khi vị trí thay đổi (nếu người dùng chưa tìm kiếm cụ thể)
  useEffect(() => {
    if (query.trim()) return
    const key = detectDistrictKey(effectiveOrigin)
    const courtList = apiFacilities
    if (key === 'thuduc') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'thuduc') ? prev : courtList.find((c) => c.district === 'thuduc')?.id || prev))
    else if (key === 'binhthanh') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'binhthanh') ? prev : courtList.find((c) => c.district === 'binhthanh')?.id || prev))
    else if (key === 'q7') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'q7') ? prev : courtList.find((c) => c.district === 'q7')?.id || prev))
    else if (key === 'q1') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'q1') ? prev : courtList.find((c) => c.district === 'q1')?.id || prev))
    else if (key === 'q10') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'q10') ? prev : courtList.find((c) => c.district === 'q10')?.id || prev))
    else if (key === 'phunhuan') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'phunhuan') ? prev : courtList.find((c) => c.district === 'phunhuan')?.id || prev))
    else if (key === 'tanbinh') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'tanbinh') ? prev : courtList.find((c) => c.district === 'tanbinh')?.id || prev))
    else if (key === 'quan8') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'quan8') ? prev : courtList.find((c) => c.district === 'quan8')?.id || prev))
    else if (key === 'tanphu') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'tanphu') ? prev : courtList.find((c) => c.district === 'tanphu')?.id || prev))
    else if (key === 'govap') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'govap') ? prev : courtList.find((c) => c.district === 'govap')?.id || prev))
    else if (key === 'q3') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'q3') ? prev : courtList.find((c) => c.district === 'q3')?.id || prev))
    else if (key === 'q11') setSelectedCourtId((prev) => (courtList.some((c) => c.id === prev && c.district === 'q11') ? prev : courtList.find((c) => c.district === 'q11')?.id || prev))
  }, [effectiveOrigin, query, apiFacilities])

  const courtMatchesSport = (c) => {
    if (Array.isArray(c.sports) && c.sports.length > 0) {
      return c.sports.some((s) => isSportActive(s))
    }
    return isSportActive(c.sport)
  }

  // Lọc cụm sân:
  // - Khi không gõ tìm kiếm: lọc theo môn và khoảng giá (sắp xếp theo khoảng cách từ người chơi)
  // - Khi người chơi gõ tìm kiếm (tên sân, tuyến đường, quận):
  //   1. Ưu tiên tìm trong danh sách các cụm sân có sẵn. Không ép lọc theo môn/giá để tránh làm biến mất kết quả sân người chơi đang tìm kiếm!
  //   2. Nếu tên sân người chơi tìm không có trong danh mục mẫu, tự động tạo kết quả Sân Tìm Kiếm Động
  //      để Google Maps & giao diện lập tức hiển thị, ghim và dẫn đường trực tiếp đến sân đó!
  const filteredCourts = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return localizedCourts
        .filter(
          (c) =>
            courtMatchesSport(c) &&
            c.price >= priceRange[0] &&
            c.price <= priceRange[1]
        )
        .sort((a, b) => a.distance - b.distance)
    }

    const matched = localizedCourts.filter((c) => matchesQuery(c, trimmed))

    if (matched.length > 0) {
      return matched.sort((a, b) => {
        // Ưu tiên sân đúng môn thể thao đang chọn lên trước
        const aFitSport = courtMatchesSport(a) ? 1 : 0
        const bFitSport = courtMatchesSport(b) ? 1 : 0
        if (aFitSport !== bFitSport) return bFitSport - aFitSport
        return a.distance - b.distance
      })
    }

    // Nếu người chơi gõ một tên sân thực tế khác (vd: "Sân Cầu Lông Trường Chinh", "Sân Cầu Lông Sky", v.v.)
    // Tự sinh cụm sân tìm kiếm động để bản đồ Google Maps và danh sách hiển thị đúng kết quả người chơi muốn
    const norm = normalizeText(trimmed)
    const guessedSport = norm.includes('pickleball') ? 'pickleball' : 'badminton'
    const detectedDist = detectDistrictKey(trimmed)
    const distCenter = DISTRICT_COORDS[detectedDist] || { lat: 10.7769, lng: 106.7009 }
    const dynamicLat = distCenter.lat + 0.005
    const dynamicLng = distCenter.lng + 0.005
    const dynamicDist = (gpsCoords?.lat && gpsCoords?.lng)
      ? (haversineDistanceKm(gpsCoords.lat, gpsCoords.lng, dynamicLat, dynamicLng) || 2.5)
      : (DISTRICT_DISTANCES[detectDistrictKey(effectiveOrigin)]?.[detectedDist] ?? 2.5)

    const dynamicCourt = {
      id: `custom-search-${trimmed.replace(/[^a-z0-9]/gi, '_')}`,
      sport: guessedSport,
      name: trimmed,
      street: trimmed,
      address: `${trimmed}, TP. Hồ Chí Minh`,
      mapQuery: `${trimmed}, TP. Hồ Chí Minh`,
      district: detectedDist,
      lat: dynamicLat,
      lng: dynamicLng,
      rating: 5.0,
      price: 180000,
      courtCount: 6,
      image:
        guessedSport === 'pickleball'
          ? 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=300&h=300&fit=crop'
          : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=300&fit=crop',
      subCourt: `${trimmed} - Sân 01`,
      subCourtDesc: 'Định vị trực tiếp từ Google Maps TP.HCM theo yêu cầu tìm kiếm',
      isCustomSearch: true,
      distance: dynamicDist,
      overrides: {},
    }
    return [dynamicCourt]
  }, [localizedCourts, isSportActive, query, priceRange, gpsCoords])

  // TỰ ĐỘNG ĐỒNG BỘ HIỂN THỊ TRÊN BẢN ĐỒ KHI SEARCH (quận, tên đường hoặc tên sân)
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    if (filteredCourts.length > 0) {
      if (!filteredCourts.some((m) => m.id === selectedCourtId)) {
        setSelectedCourtId(filteredCourts[0].id)
      }
    }
  }, [query, filteredCourts, selectedCourtId])

  const [selectedSlotId, setSelectedSlotId] = useState('s5')
  const [detailSlot, setDetailSlot] = useState(null)
  const [holdLeft, setHoldLeft] = useState(8 * 60 + 42)
  const [mapType, setMapType] = useState('m')
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const summaryRef = useRef(null)

  // Lắng nghe sự kiện từ Trợ lý AI SportNexus
  useEffect(() => {
    const handleSelectFromAI = (e) => {
      const { courtId, slotId } = e.detail || {}
      if (courtId) {
        setSelectedCourtId(courtId)
        if (slotId) {
          setSelectedSlotId(slotId)
          setHoldLeft(HOLD_SECONDS)
        }
        setTimeout(() => {
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 250)
      }
    }
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
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 8)
        : [],
    [localizedCourts, query]
  )
  const showSuggest = searchFocused && query.trim().length > 0

  const selectedCourt =
    filteredCourts.find((c) => c.id === selectedCourtId) || filteredCourts[0] || null

  // Danh sách các sân con trong cụm sân hiện tại
  const venueSubCourts = useMemo(() => {
    if (!selectedCourt) return []

    // Nếu cơ sở từ API có danh sách sân con thật (courts), ưu tiên hiển thị đúng danh sách sân thật
    if (Array.isArray(selectedCourt.courts) && selectedCourt.courts.length > 0) {
      return selectedCourt.courts.map((child, idx) => {
        const isBooked = child.status !== 'ACTIVE'
        return {
          id: child.id,
          number: String(idx + 1).padStart(2, '0'),
          name: child.name,
          type: `${child.categoryName} • ${Number(child.defaultPrice || 100000).toLocaleString('vi-VN')} đ/h`,
          isBooked,
          note: isBooked ? (child.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Tạm ngưng') : 'Đang trống',
          price: child.defaultPrice,
          categoryName: child.categoryName,
        }
      })
    }

    const count = selectedCourt.courtCount || 6
    const basePrefix = selectedCourt.subCourt
      ? selectedCourt.subCourt.replace(/\s*\d+$/, '').trim()
      : selectedCourt.sport === 'pickleball'
      ? 'Sân Pickleball'
      : selectedCourt.sport === 'football'
      ? 'Sân Bóng Đá'
      : selectedCourt.sport === 'basketball'
      ? 'Sân Bóng Rổ'
      : selectedCourt.sport === 'tennis'
      ? 'Sân Tennis'
      : 'Sân Cầu Lông'

    return Array.from({ length: count }, (_, idx) => {
      const num = String(idx + 1).padStart(2, '0')
      const id = `court-sub-${idx + 1}`
      // Giả lập trạng thái đã kín lịch cho 1 số sân theo slot để giao diện phong phú, chân thực
      const isBooked =
        (selectedSlotId === 's5' && idx === 2) ||
        (selectedSlotId === 's4' && idx === 3) ||
        (selectedSlotId === 's6' && idx === 1) ||
        (selectedSlotId === 's7' && idx === 4)

      return {
        id,
        number: num,
        name: `${basePrefix} ${num}`,
        type:
          idx === count - 1
            ? 'Sân VIP Trung Tâm'
            : selectedCourt.sport === 'pickleball'
            ? 'Mặt sân Acrylic Pro chống lóa'
            : selectedCourt.sport === 'football'
            ? 'Cỏ nhân tạo 50mm chuẩn FIFA'
            : selectedCourt.sport === 'basketball'
            ? 'Sàn gỗ phong Maple Pro FIBA'
            : selectedCourt.sport === 'tennis'
            ? 'Mặt sân cứng DecoTurf US Open'
            : 'Thảm PVC chuẩn thi đấu BWF',
        isBooked,
        note: isBooked ? 'Đã kín lịch' : 'Đang trống',
      }
    })
  }, [selectedCourt, selectedSlotId])

  // Trạng thái các sân được chọn trong khung giờ (cho phép chọn nhiều sân cùng một khung giờ)
  const [selectedSubCourtIds, setSelectedSubCourtIds] = useState(['court-sub-1'])

  // Tự động giữ ít nhất 1 sân khả dụng khi đổi cụm sân hoặc khung giờ
  useEffect(() => {
    if (!venueSubCourts.length) return
    setSelectedSubCourtIds((prev) => {
      const valid = prev.filter((id) => {
        const found = venueSubCourts.find((c) => c.id === id)
        return found && !found.isBooked
      })
      if (valid.length > 0) return valid
      const firstAvail = venueSubCourts.find((c) => !c.isBooked)
      return firstAvail ? [firstAvail.id] : []
    })
  }, [selectedCourtId, selectedSlotId, venueSubCourts])

  const handleToggleSubCourt = (courtId) => {
    const courtItem = venueSubCourts.find((c) => c.id === courtId)
    if (!courtItem || courtItem.isBooked) return
    setSelectedSubCourtIds((prev) => {
      if (prev.includes(courtId)) {
        if (prev.length <= 1) return prev // Giữ tối thiểu 1 sân
        return prev.filter((id) => id !== courtId)
      } else {
        return [...prev, courtId]
      }
    })
  }

  const handleSelectAllSubCourts = () => {
    const availableIds = venueSubCourts.filter((c) => !c.isBooked).map((c) => c.id)
    if (availableIds.length > 0) {
      setSelectedSubCourtIds(availableIds)
    }
  }

  const handleSelectSingleSubCourt = (courtId) => {
    const courtItem = venueSubCourts.find((c) => c.id === courtId)
    if (!courtItem || courtItem.isBooked) return
    setSelectedSubCourtIds([courtId])
  }

  const activeSubCourts = useMemo(
    () => venueSubCourts.filter((c) => selectedSubCourtIds.includes(c.id)),
    [venueSubCourts, selectedSubCourtIds]
  )
  const courtQuantity = activeSubCourts.length || 1

  // Tải danh sách ca thật từ API cho sân con đang chọn
  const [liveCourtSlots, setLiveCourtSlots] = useState([])
  const activeSubCourtId = useMemo(() => {
    const isGuid = (val) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim())

    const fromActive = activeSubCourts.find((c) => isGuid(c.id))
    if (fromActive) return fromActive.id
    const fromVenue = venueSubCourts.find((c) => isGuid(c.id) && !c.isBooked)
    if (fromVenue) return fromVenue.id
    if (Array.isArray(selectedCourt?.courts) && selectedCourt.courts.length > 0) {
      const activeCourt = selectedCourt.courts.find((c) => c.status === 'ACTIVE' && isGuid(c.id))
      if (activeCourt) return activeCourt.id
      const anyCourt = selectedCourt.courts.find((c) => isGuid(c.id))
      if (anyCourt) return anyCourt.id
    }
    return null
  }, [activeSubCourts, venueSubCourts, selectedCourt])

  useEffect(() => {
    let isMounted = true
    async function loadSubCourtSlots() {
      const isGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!activeSubCourtId || !isGuidRegex.test(activeSubCourtId)) {
        setLiveCourtSlots([])
        return
      }
      try {
        const todayStr = new Date().toISOString().slice(0, 10)
        const apiSlots = await getCourtSlots(activeSubCourtId, todayStr)
        if (isMounted && Array.isArray(apiSlots) && apiSlots.length > 0) {
          setLiveCourtSlots(apiSlots)
        } else if (isMounted) {
          setLiveCourtSlots([])
        }
      } catch (err) {
        console.warn('[MapBooking] Lỗi khi tải ca sân:', err)
        if (isMounted) setLiveCourtSlots([])
      }
    }
    loadSubCourtSlots()
    return () => { isMounted = false }
  }, [activeSubCourtId])

  const slots = useMemo(() => {
    if (!selectedCourt) return []
    if (Array.isArray(liveCourtSlots) && liveCourtSlots.length > 0) {
      return liveCourtSlots.map((s) => {
        const start = s.startTime?.slice(11, 16) || '00:00'
        const end = s.endTime?.slice(11, 16) || '00:00'
        const isAvail = s.status === 'Available' && !s.isPast && s.isBookable
        return {
          id: s.id,
          start,
          end,
          hours: 1,
          price: Number(s.price) || selectedCourt.price,
          status: isAvail ? 'available' : 'booked',
          note: s.isPast ? 'Đã qua giờ' : (s.status !== 'Available' ? 'Đã kín lịch' : null),
          rawSlot: s,
        }
      })
    }
    return buildSlots(selectedCourt)
  }, [selectedCourt, liveCourtSlots])

  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status !== 'booked') || null

  // Tự động chọn ca khả dụng đầu tiên khi danh sách ca thay đổi
  useEffect(() => {
    if (slots.length > 0) {
      const isCurrentValid = slots.some((s) => s.id === selectedSlotId && s.status === 'available')
      if (!isCurrentValid) {
        const firstAvail = slots.find((s) => s.status === 'available')
        if (firstAvail) setSelectedSlotId(firstAvail.id)
      }
    }
  }, [slots, selectedSlotId])

  const totalBookingPrice = selectedSlot ? selectedSlot.price * courtQuantity : 0

  // Đếm ngược thời gian khóa giữ chỗ
  useEffect(() => {
    if (!selectedSlot) return undefined
    const timer = setInterval(() => setHoldLeft((t) => Math.max(t - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [selectedSlot])

  // Hết thời gian giữ chỗ → tự động nhả khung giờ
  useEffect(() => {
    if (holdLeft === 0 && selectedSlotId) setSelectedSlotId(null)
  }, [holdLeft, selectedSlotId])

  const handleSelectCourt = (court) => {
    if (court.id === selectedCourt?.id) return
    setSelectedCourtId(court.id)
    setSelectedSlotId(null)
    setDetailSlot(null)
  }

  const handleSelectSlot = (slot) => {
    if (slot.status === 'booked') return
    setSelectedSlotId(slot.id)
    setHoldLeft(HOLD_SECONDS)
  }

  const handleSlotClick = (slot) => {
    if (slot.status === 'booked') return
    handleSelectSlot(slot)
    setDetailSlot(slot)
  }

  // Phím Esc đóng modal chi tiết khung giờ
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailSlot(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClearFilters = () => {
    setQuery('')
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setPriceEdit(null)
    selectAllSports()
  }

  const handlePickSuggestion = (court) => {
    setQuery(court.name)
    setSearchFocused(false)
    handleSelectCourt(court)
  }



  // Ô nhập giá: gõ tự do (tự thêm dấu chấm), chốt khi blur / Enter
  const priceInputValue = (idx) =>
    priceEdit?.idx === idx ? priceEdit.text : priceRange[idx].toLocaleString('vi-VN')

  const handlePriceType = (idx, raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 7)
    setPriceEdit({ idx, text: digits ? Number(digits).toLocaleString('vi-VN') : '' })
  }

  const commitPrice = (idx) => {
    if (priceEdit?.idx !== idx) return
    const num = Number(priceEdit.text.replace(/\D/g, ''))
    setPriceEdit(null)
    if (!num) return
    const clamped = Math.min(Math.max(Math.round(num / PRICE_STEP) * PRICE_STEP, PRICE_MIN), PRICE_MAX)
    if (idx === 0) {
      if (clamped >= priceRange[1]) {
        setPriceRange([clamped, Math.min(clamped + PRICE_STEP, PRICE_MAX)])
      } else {
        setPriceRange(([, max]) => [clamped, max])
      }
    } else {
      if (clamped <= priceRange[0]) {
        setPriceRange([Math.max(clamped - PRICE_STEP, PRICE_MIN), clamped])
      } else {
        setPriceRange(([min]) => [min, clamped])
      }
    }
  }

  const isFullPrice = priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX

  const handleConfirm = () => {
    if (!selectedCourt || !selectedSlot || activeSubCourts.length === 0) return
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
        slot: `${selectedSlot.start} - ${selectedSlot.end}`,
        hours: selectedSlot.hours || 1,
        total: totalBookingPrice,
        unitPrice: selectedSlot.price,
        hourlyRate: selectedSlot.hourlyRate || Math.round(selectedSlot.price / (selectedSlot.hours || 1)),
        courtSlotId: slotId,
        courtSlotIds: [slotId],
        selectedSlots: [selectedSlot.rawSlot || selectedSlot],
        numberOfSlots: 1,
      },
    })
  }

  const scrollToSummary = () => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })


  const sportOf = (key) => SPORTS_LIST.find((s) => s.key === key)
  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="mb-page">
      {/* ===================== HEADER ===================== */}
      <header className="mb-header">
        <div>
          <h1 className="mb-title">Đặt Sân Trực Tuyến &amp; Giữ Chỗ Thời Gian Thực</h1>
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
                  aria-label="Tìm kiếm sân theo quận, tên đường hoặc tên sân"
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
                                {c.address} • {DISTRICTS[c.district]?.name}
                              </small>
                            </span>
                            <div className="mb-suggest-right">
                              <em>{c.distance} km</em>
                              <span className="mb-suggest-subdist">gần bạn</span>
                            </div>
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
              <span className={`mb-price-readout ${isFullPrice ? '' : 'is-on'}`}>
                {isFullPrice
                  ? 'Mọi mức giá'
                  : `${formatVnd(priceRange[0])} – ${formatVnd(priceRange[1])}`}
              </span>
            </div>

            {/* Ô nhập Từ — Đến */}
            <div className="mb-price-inputs">
              {[0, 1].map((idx) => (
                <label key={idx} className="mb-price-field" htmlFor={`mb-price-input-${idx}`}>
                  <small>{idx === 0 ? 'Từ' : 'Đến'}</small>
                  <input
                    id={`mb-price-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    value={priceInputValue(idx)}
                    onChange={(e) => handlePriceType(idx, e.target.value)}
                    onBlur={() => commitPrice(idx)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    aria-label={idx === 0 ? 'Giá tối thiểu' : 'Giá tối đa'}
                  />
                  <span>đ</span>
                </label>
              ))}
            </div>
          </section>

          {/* Court list */}
          <div className="mb-section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Cụm Sân Gần Bạn</h2>
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
                  title="Dữ liệu kết nối trực tiếp từ Backend API GET /api/v1/facilities"
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  Live API ({apiFacilities.length} cụm sân)
                </span>
              )}
            </div>
            <small>{filteredCourts.length} cụm sân khả dụng</small>
          </div>

          {filteredCourts.length === 0 && (
            <div className="mb-card mb-empty">
              <span className="material-symbols-outlined">search_off</span>
              Không tìm thấy sân phù hợp. Hãy thử từ khóa khác hoặc mở rộng tầm giá.
            </div>
          )}

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
                        {court.rating}
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
                      {Array.isArray(court.amenities) && court.amenities.slice(0, 2).map((a) => (
                        <span key={a.id || a.name} className="mb-tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                          {a.name}
                        </span>
                      ))}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span className="material-symbols-outlined">directions_car</span>
                        {court.distance} km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-court-bottom">
                  <span className="mb-price">
                    {court.price.toLocaleString('vi-VN')} đ<small>/h</small>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="mb-btn mb-btn--ghost"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/court', { state: { facility: court.rawFacility || court, facilityId: court.id } })
                      }}
                      title="Xem trang chi tiết cụm sân, hình ảnh và sân con"
                    >
                      Chi Tiết
                    </button>
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

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="mb-col">
          {/* Map */}
          {/* Real Interactive Google Map */}
          <section className="mb-card mb-map-section" aria-label="Bản đồ sân">
            <InteractiveCourtMap
              courts={filteredCourts}
              selectedCourt={selectedCourt}
              onSelectCourt={handleSelectCourt}
              effectiveOrigin={effectiveOrigin}
              originCoords={gpsCoords || DISTRICT_COORDS[detectDistrictKey(effectiveOrigin)] || DISTRICT_COORDS.thuduc}
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
              const originForDirections = gpsCoords
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
                        <span className="mb-route-pill">~{selectedCourt.distance} km</span>
                      </div>
                      <div className="mb-route-sub">
                        Từ <strong>{effectiveOrigin}</strong> đến <strong>{selectedCourt.name}</strong> ({selectedCourt.address})
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

          {/* Slot grid */}
          <section className="mb-card" aria-label="Lịch sân">
            <div className="mb-slots-head">
              <div>
                <h2>Lưới Lịch Sân Trực Quan: {selectedCourt ? selectedCourt.name : '—'}</h2>
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

            {!selectedCourt ? (
              <div className="mb-empty">
                <span className="material-symbols-outlined">event_busy</span>
                Chọn một cụm sân để xem lịch trống.
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

                  const isSelected = slot.id === selectedSlot?.id

                  // Ô ĐANG CHỌN hoặc ĐANG TRỐNG (Kích thước nhỏ gọn đồng nhất 52px, click để xem popup chi tiết)
                  return (
                    <button
                      key={slot.id}
                      id={`mb-slot-${slot.id}`}
                      type="button"
                      className={`mb-slot ${isSelected ? 'mb-slot--selected-compact' : 'mb-slot--available'}`}
                      style={delay}
                      onClick={() => handleSlotClick(slot)}
                      title={`Khung giờ: ${slot.start} - ${slot.end} (${formatVnd(slot.price)}) - Bấm để xem chi tiết`}
                    >
                      <div className="mb-slot-compact-head">
                        <span className="mb-slot-time">{slot.start} - {slot.end}</span>
                        {isSelected ? (
                          <span className="material-symbols-outlined mb-slot-check-ic">check</span>
                        ) : (
                          <span className="mb-slot-chip-avail">Trống</span>
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
                      onClick={() => handleSelectSingleSubCourt('court-sub-1')}
                      title="Chỉ chọn 1 sân duy nhất"
                    >
                      Chỉ chọn 1 sân
                    </button>
                  </div>
                </div>

                <div className="mb-subcourts-tip">
                  <span className="material-symbols-outlined">tips_and_updates</span>
                  <span>
                    💡 <strong>Tính năng Đa Sân:</strong> Bạn có thể bấm chọn <strong>nhiều sân cùng lúc</strong> trong khung giờ {selectedSlot.start} - {selectedSlot.end} cho nhóm bạn đông người, giao lưu câu lạc bộ hoặc tổ chức giải đấu.
                  </span>
                </div>

                <div className="mb-subcourts-grid">
                  {venueSubCourts.map((court) => {
                    const isSelected = selectedSubCourtIds.includes(court.id)
                    const isBooked = court.isBooked

                    return (
                      <div
                        key={court.id}
                        className={`mb-subcourt-card ${
                          isBooked ? 'is-booked' : isSelected ? 'is-selected' : 'is-available'
                        }`}
                        onClick={() => handleToggleSubCourt(court.id)}
                        role="button"
                        tabIndex={isBooked ? -1 : 0}
                        aria-disabled={isBooked}
                        title={
                          isBooked
                            ? `${court.name} đã kín lịch trong khung giờ này`
                            : isSelected
                            ? `Đang chọn ${court.name}. Bấm để bỏ chọn`
                            : `Bấm để chọn ${court.name} (+${formatVnd(selectedSlot.price)})`
                        }
                      >
                        <div className="mb-subcourt-row-top">
                          <div className="mb-subcourt-checkbox">
                            {isSelected ? (
                              <span className="material-symbols-outlined">check_circle</span>
                            ) : isBooked ? (
                              <span className="material-symbols-outlined">lock</span>
                            ) : (
                              <span className="material-symbols-outlined">radio_button_unchecked</span>
                            )}
                          </div>
                          <strong className="mb-subcourt-name" title={court.name}>{court.name}</strong>
                        </div>

                        <div className="mb-subcourt-row-bottom">
                          <span
                            className={`mb-subcourt-status ${
                              isBooked ? 'status-booked' : isSelected ? 'status-selected' : 'status-avail'
                            }`}
                          >
                            {isBooked ? 'Đã kín' : isSelected ? 'Đang chọn' : 'Trống'}
                          </span>
                          <span className="mb-subcourt-rate">{formatVnd(selectedSlot.price)}/sân</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
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
                    ? `${selectedSlot.start} - ${selectedSlot.end} (Hôm nay, ${todayStr}) • ${formatHours(
                        selectedSlot.hours
                      )} • ${selectedCourt?.name}`
                    : 'Vui lòng chọn một khung giờ còn trống trên lưới lịch'}
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
                <small>Tổng tiền {courtQuantity} sân:</small>
                <strong>{selectedSlot ? formatVnd(totalBookingPrice) : '0 đ'}</strong>
                {courtQuantity > 1 && (
                  <span className="mb-summary-unit-calc">
                    ({courtQuantity} sân × {formatVnd(selectedSlot.price)})
                  </span>
                )}
              </div>
            </div>

            <button
              id="mb-confirm-booking"
              type="button"
              className="mb-btn mb-btn--primary mb-confirm"
              disabled={!selectedSlot || activeSubCourts.length === 0}
              onClick={handleConfirm}
            >
              Xác Nhận Đặt {courtQuantity} Sân
            </button>
            <p className="mb-secure-note">
              <span className="material-symbols-outlined">verified_user</span>
              Hệ thống giữ chỗ độc quyền trong 15:00 phút để bạn tiến hành thanh toán an toàn cho toàn bộ {courtQuantity} sân.
            </p>
          </section>
        </div>
      </div>

      {/* ===================== POPUP CHI TIẾT KHUNG GIỜ ===================== */}
      {detailSlot && selectedCourt && typeof document !== 'undefined' && createPortal(
        <div
          className="mb-slot-modal-backdrop"
          onClick={() => setDetailSlot(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="slot-modal-title"
        >
          <div className="mb-slot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mb-slot-modal-head">
              <div className="mb-slot-modal-head-left">
                <div className="mb-slot-modal-head-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 id="slot-modal-title" className="mb-slot-modal-title">
                    Chi Tiết Khung Giờ: {detailSlot.start} - {detailSlot.end}
                  </h3>
                  <p className="mb-slot-modal-sub">
                    {selectedCourt.name} • {String(detailSlot.hours).replace('.', ',')} giờ thi đấu
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mb-slot-modal-close"
                onClick={() => setDetailSlot(null)}
                title="Đóng popup"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-slot-modal-body">
              <div className="mb-slot-modal-badges">
                <span className="mb-slot-modal-badge-status">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    check_circle
                  </span>
                  Đang chọn khung giờ này
                </span>
                {holdLeft > 0 && (
                  <span className="mb-slot-modal-badge-timer">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      timer
                    </span>
                    Tạm khóa giữ chỗ: {formatTimer(holdLeft)}
                  </span>
                )}
              </div>

              <div className="mb-slot-modal-info-grid">
                <div className="mb-slot-modal-info-row">
                  <span className="material-symbols-outlined">stadium</span>
                  <div>
                    <strong>Cụm sân:</strong> {selectedCourt.name}
                  </div>
                </div>
                {selectedCourt.address && (
                  <div className="mb-slot-modal-info-row">
                    <span className="material-symbols-outlined">location_on</span>
                    <div>
                      <strong>Địa chỉ:</strong> {selectedCourt.address}
                    </div>
                  </div>
                )}
                {selectedCourt.subCourtDesc && (
                  <div className="mb-slot-modal-info-row">
                    <span className="material-symbols-outlined">sports_tennis</span>
                    <div>
                      <strong>Mô tả sân:</strong> {selectedCourt.subCourtDesc}
                    </div>
                  </div>
                )}
                <div className="mb-slot-modal-info-row">
                  <span className="material-symbols-outlined">group</span>
                  <div>
                    <strong>Sân áp dụng ({courtQuantity} sân):</strong>{' '}
                    {activeSubCourts.map((c) => c.name).join(', ')}
                  </div>
                </div>
              </div>

              <div className="mb-slot-modal-price-card">
                <div>
                  <span className="mb-slot-modal-price-label">
                    Đơn giá: {formatVnd(detailSlot.price)}/sân ({courtQuantity} sân)
                  </span>
                  <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
                    Đã bao gồm thuế và phí dịch vụ Escrow
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mb-slot-modal-price-val">
                    {formatVnd(detailSlot.price * courtQuantity)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-slot-modal-foot">
              <button
                type="button"
                className="mb-slot-modal-btn-close"
                onClick={() => setDetailSlot(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="mb-slot-modal-btn-confirm"
                onClick={() => {
                  setDetailSlot(null)
                  setTimeout(() => {
                    summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 120)
                }}
              >
                Chốt sân
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===================== AI CHAT ASSISTANT MODAL ===================== */}
      <AIChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentCourtId={selectedCourtId}
        onSelectCourtSlot={({ courtId, slotId }) => {
          if (courtId) setSelectedCourtId(courtId)
          if (slotId) {
            setSelectedSlotId(slotId)
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
