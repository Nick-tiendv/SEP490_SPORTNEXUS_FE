import { useState, useEffect, useMemo } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { createLfg, updateLfg, getLfgById, isCaptainOfTeam } from '../../api/player/lfgApi.js'
import { getMyTeams } from '../../api/player/teamApi.js'
import { getWallet } from '../../api/player/walletApi.js'
import { searchFacilities } from '../../api/player/facilityApi.js'
import { initialsOf, useCurrentUser } from '../../hooks/useCurrentUser.js'
import { getFacilities, transformFacilityToCourt } from '../../api/player/facilityApi.js'
import { eloText, fairPlayScoreOf, usePlayerStanding } from '../../hooks/usePlayerStanding.js'
import { getCourtSlots } from '../../api/player/bookingApi.js'
import FacilityAreaMap from '../../components/common/FacilityAreaMap.jsx'
import { reverseGeocode } from '../../utils/geolocation.js'
import {
  readProfileLocation,
  readSavedBookingOrigin,
  resolveEffectivePlayerOrigin,
  subscribeBookingOrigin,
} from '../../utils/playerOrigin.js'
import {
  SPORT_CATALOG,
  normalizeSportKey,
  recordNewPlayerDesire,
  setSportCatalog,
} from './lfgSuggestionEngine.js'
import { getSportCategories } from '../../api/player/profileApi.js'
import { isSlotOpen, normalizeCourtSlots } from '../Booking/Recurring/courtSlots.js'
import { LFG_POLICY } from './lfgPolicy.js'
import MonthCalendarPicker from '../Booking/FindCourt/MonthCalendarPicker.jsx'

// Môn trên giao diện -> tên môn trong danh mục BE
const calculateDurationHours = (rangeStr) => {
  if (!rangeStr) return 2
  const parts = rangeStr.split('-').map((s) => s.trim())
  if (parts.length < 2) return 2
  const [startH, startM] = parts[0].split(':').map(Number)
  const [endH, endM] = parts[1].split(':').map(Number)
  if (isNaN(startH) || isNaN(endH)) return 2
  const diffMinutes = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0))
  const diffHours = diffMinutes / 60
  return diffHours > 0 ? diffHours : 2
}

// Định dạng ngày theo giờ địa phương YYYY-MM-DD
// Thể thức kèo theo sideSize của BE (số người mỗi phe)
// Số ca liên tiếp tối đa của 1 kèo (BE: numberOfSlots 1 - 6)
const MAX_LFG_COURT_SLOTS = 6

// Thể thức theo loại môn:
// - Môn đồng đội (LFG_POLICY.teamSportKeys: bóng đá, bóng rổ, bóng chuyền): bắt buộc Đội vs Đội, số người mỗi đội = teamSize của sân.
// - Môn khác (cầu lông, pickleball, tennis…): đánh đơn 1 vs 1 hoặc đôi 2 vs 2 (sân đơn chỉ 1 vs 1).
// keepValue: giữ thể thức cũ khi sửa kèo.
function buildSideSizeOptions(court, keepValue, isTeamSport) {
  const size = Number(court?.teamSize) || 0
  if (isTeamSport) {
    return [{ value: size > 0 ? size : null, label: size > 0 ? `Đội ${size} vs ${size}` : 'Đội đấu đội', hint: 'Team vs Team (bắt buộc)' }]
  }
  const sizes = size === 1 ? [1] : [1, 2]
  if (Number(keepValue) > 0 && !sizes.includes(Number(keepValue))) sizes.push(Number(keepValue))
  return sizes.map((n) => ({ value: n, label: n === 1 ? 'Đơn 1 vs 1' : n === 2 ? 'Đôi 2 vs 2' : `${n} vs ${n}`, hint: 'Chia phe A / B' }))
}

const SKILL_LEVEL_CARDS = [
  { key: 'intermediate', label: 'Trung bình - Khá', desc: 'Đánh chắc tay, giao lưu đều đặn' },
  { key: 'beginner', label: 'Mới tập chơi', desc: 'Phong trào, vừa tập vừa giao lưu' },
  { key: 'pro', label: 'Bán chuyên / Nâng cao', desc: 'Thi đấu cọ xát, kỹ chiến thuật tốt' },
]

const toCreateMatchSkillTag = (level) => {
  if (level === 'beginner') return 'BEGINNER'
  if (level === 'pro') return 'ADVANCED'
  if (level === 'intermediate') return 'INTERMEDIATE'
  return undefined
}

const fromCreateMatchSkillTag = (tag) => {
  const upper = String(tag || '').trim().toUpperCase()
  if (upper === 'BEGINNER') return 'beginner'
  if (upper === 'ADVANCED' || upper === 'PROFESSIONAL') return 'pro'
  if (upper === 'INTERMEDIATE') return 'intermediate'
  return ''
}

function formatLocalDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Dải 7 ngày của lịch tạo kèo = tuần (Thứ 2 → Chủ nhật) chứa ngày đang chọn, giống trang đặt sân.
// Ngày đã qua đánh dấu isPast (không chọn được). Cho tạo kèo từ hôm nay (BE vẫn kiểm tra luật thời gian khi tạo).
function getLfgWeekDays(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() - ((base.getDay() + 6) % 7))
  const todayStr = formatLocalDate(new Date())
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const shortDayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const dayStr = formatLocalDate(day)
    const dayNum = String(day.getDate()).padStart(2, '0')
    const monthNum = String(day.getMonth() + 1).padStart(2, '0')
    const dateFormatted = `${dayNum}/${monthNum}/${day.getFullYear()}`
    return {
      dateStr: dayStr,
      dayNum,
      monthNum,
      year: day.getFullYear(),
      dayOfWeek: dayNames[day.getDay()],
      shortDay: dayStr === todayStr ? 'Hôm nay' : shortDayNames[day.getDay()],
      dateFormatted,
      fullLabel: `${dayNames[day.getDay()]}, ${dateFormatted}`,
      isPast: dayStr < todayStr,
    }
  })
}

// Lưới ca: hiện đúng từng ca BE trả về (độ dài ca do chủ sân cấu hình), giống trang đặt sân
function buildLfgSlots(rawSlots, defaultPrice = 0) {
  return normalizeCourtSlots(rawSlots, defaultPrice).map((s) => ({
    ...s,
    start: s.formattedStart,
    end: s.formattedEnd,
    timeRange: `${s.formattedStart} - ${s.formattedEnd}`,
    isAvailable: isSlotOpen(s),
    isPast: Boolean(s.isPast),
  }))
}

const normalize = (t = '') => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Gom cơ sở thật (GET /api/v1/facilities/search) theo khu vực để chọn sân ghép trận
const groupByDistrict = (facilities) => {
  const map = {}
  facilities.forEach((f) => {
    const name = f.district || f.province || 'Khác'
    const key = normalize(name).replace(/[^a-z0-9]/g, '') || 'khac'
    if (!map[key]) map[key] = { name, label: name, courts: [] }
    const computedDist =
      f.distanceKm != null && f.distanceKm !== '' && Number.isFinite(Number(f.distanceKm))
        ? Number(f.distanceKm)
        : null
    map[key].courts.push({
      id: f.id,
      name: f.name,
      address: f.address || '',
      distance: computedDist != null ? `${computedDist.toFixed(1)} km` : '',
      distanceKm: computedDist,
      courtCount: `${f.courtCount || 0} sân`,
      price: f.minPrice ? `${Math.round(f.minPrice / 1000)}k/h` : '—',
      rating: f.averageRating,
      lat: f.latitude,
      lng: f.longitude,
      sports: (f.sports || []).map((x) => normalize(x.name)),
    })
  })
  Object.values(map).forEach((d) => {
    d.courts.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
  })
  return map
}

function CreateMatch() {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()

  // State management (mặc định không chọn sẵn bộ môn hay tiêu chí ghép trận để người chơi tự chọn)
  const [sport, setSport] = useState('')
  const [radius, setRadius] = useState(8.5)
  // Vị trí người chơi đồng bộ từ điểm xuất phát ở Đặt sân, hồ sơ cá nhân và khảo sát (không gán cứng tỉnh/quận mặc định)
  const [bookingOrigin, setBookingOrigin] = useState(() => readSavedBookingOrigin())
  const [profileOrigin, setProfileOrigin] = useState(() => readProfileLocation())
  const [onboardingArea, setOnboardingArea] = useState({ coords: null, name: '' })
  const [rawFacilitiesForDistricts, setRawFacilitiesForDistricts] = useState([])

  useEffect(() => subscribeBookingOrigin(setBookingOrigin), [])

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'player_profile_data') setProfileOrigin(readProfileLocation())
    }
    const handleProfileUpdate = () => setProfileOrigin(readProfileLocation())
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const resolvedOrigin = resolveEffectivePlayerOrigin({
    bookingOrigin,
    profileLocation: profileOrigin.location,
    profileCoords: profileOrigin.coords,
    onboarding: onboardingArea,
  })
  const userProfileLocation = resolvedOrigin.label
  const userOriginCoords = resolvedOrigin.coords

  // Cơ sở thật theo khu vực
  useEffect(() => {
    let active = true
    Promise.all([
      searchFacilities({ pageSize: 100 }),
      import('../../api/player/ratingApi.js').then((m) => m.getOnboarding().catch(() => null)).catch(() => null),
    ])
      .then(([res, onboarding]) => {
        if (!active) return
        setRawFacilitiesForDistricts(res.items || [])
        if (onboarding?.latitude != null && onboarding?.longitude != null) {
          const coords = { lat: Number(onboarding.latitude), lng: Number(onboarding.longitude) }
          setOnboardingArea({ coords, name: '' })
          reverseGeocode(coords.lat, coords.lng).then((name) => {
            if (active && name) setOnboardingArea((prev) => ({ ...prev, name }))
          })
        }
      })
      .catch(() => active && toast.error('Không tải được danh sách cơ sở.'))
    return () => { active = false }
  }, [])

  const districtData = useMemo(
    () => groupByDistrict(rawFacilitiesForDistricts),
    [rawFacilitiesForDistricts]
  )
  const districtKeys = Object.keys(districtData)
  const userDistrictKey =
    (userProfileLocation &&
      districtKeys.find(
        (k) =>
          normalize(userProfileLocation).includes(k) ||
          k.includes(normalize(userProfileLocation).replace(/[^a-z0-9]/g, ''))
      )) ||
    districtKeys[0]
  const [pickedDistrict, setSelectedDistrict] = useState(null)
  const selectedDistrict = pickedDistrict && districtData[pickedDistrict] ? pickedDistrict : userDistrictKey
  const [districtSearchQuery, setDistrictSearchQuery] = useState('')
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false)
  const [pickedCourtId, setSelectedCourtId] = useState(() => {
    return districtData[userDistrictKey]?.courts[0]?.id || null
  })
  // Ngày sớm nhất được chọn: hôm nay (cho tạo kèo sát giờ nếu sân còn trống)
  const firstEligibleDayStr = useMemo(() => formatLocalDate(new Date()), [])
  // Ngày mặc định: hôm nay
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()))
  const [preferredTimeRange, setPreferredTimeRange] = useState('20:00 - 22:00')

  const preferredDurationHours = useMemo(() => {
    const hours = calculateDurationHours(preferredTimeRange)
    return Number.isInteger(hours) ? hours : hours.toFixed(1)
  }, [preferredTimeRange])

  // Thể thức (sideSize của BE): undefined = chưa chọn, null = giao lưu không chia phe, 1 = đơn 1 vs 1, 2 = đôi 2 vs 2
  const [sideSize, setSideSize] = useState(undefined)

  // Skill Level (chưa chọn sẵn để người chơi tự chọn)
  const [skillLevel, setSkillLevel] = useState('') // '', 'intermediate', 'beginner', 'pro'

  // Play Styles (checkboxes — không tự tick sẵn)
  const [playStyles, setPlayStyles] = useState({
    fun: false,
    fairplay: false,
    competitive: false,
  })

  // Court Standards (checkboxes — không tự tick sẵn)
  const [courtStandards, setCourtStandards] = useState({
    acCourt: false,
    proBall: false,
    splitBill: false,
  })

  // Auto court lock checkbox

  // Escrow reassurance pill state
  const [showEscrowPill, setShowEscrowPill] = useState(true)

  // Wallet balance synchronized with localStorage
  // Elo & Fair Play thật của chủ kèo (thẻ xem trước kèo)
  const standing = usePlayerStanding()

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 0
  })

  // LFG Specific State - 2.6 Chủ kèo Bước 1
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const editCardId = searchParams.get('cardId') || searchParams.get('editId')
  const isEditMode = Boolean(editCardId)
  // Kèo LFG phải gắn với một ca sân thật, truyền sang từ màn hình chọn ca.
  const initialSlotId = location.state?.courtSlotId || location.state?.slotId || null
  const [courtSlotId, setCourtSlotId] = useState(initialSlotId)
  // Số người chủ kèo đã có (tính cả chủ kèo). Số suất cần tìm = tổng người của thể thức − số người đã có.
  const [havePlayers, setHavePlayers] = useState(1)
  const [pricePerPerson, setPricePerPerson] = useState('')
  const [requireApproval, setRequireApproval] = useState(false)
  const [description, setDescription] = useState('')
  const [courtFee, setCourtFee] = useState(() => Number(location.state?.total || location.state?.price) || 0) // 100% tiền sân của ca đã chọn
  const [createError, setCreateError] = useState(null)
  const [myTeams, setMyTeams] = useState([])
  const [hostTeamId, setHostTeamId] = useState('')

  useEffect(() => {
    let active = true
    getMyTeams()
      .then((list) => {
        if (active && Array.isArray(list)) setMyTeams(list)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const captainTeams = useMemo(
    () => myTeams.filter((team) => isCaptainOfTeam(team, currentUser?.id)),
    [myTeams, currentUser?.id],
  )


  // Danh sách cơ sở thể thao & ca sân khả dụng
  // Chỉ dùng cơ sở thật từ API; không có facilityId/courtId truyền sang thì để người dùng tự chọn
  const [facilities, setFacilities] = useState([])
  const [facilitiesStatus, setFacilitiesStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [facilitiesReload, setFacilitiesReload] = useState(0)
  const [selectedFacilityId, setSelectedFacilityId] = useState(() => location.state?.facilityId || null)
  const [selectedSubCourtId, setSelectedSubCourtId] = useState(() => location.state?.courtId || null)
  // Ca trống đã tải, gắn với khoá (sân con | ngày | giá); đang tải khi khoá hiện tại chưa có kết quả
  const [slotsResult, setSlotsResult] = useState({ key: null, slots: [] })

  // Tải danh sách cơ sở từ API GET /api/v1/facilities
  useEffect(() => {
    let isMounted = true
    getFacilities()
      .then((raw) => {
        if (!isMounted) return
        setFacilitiesStatus('ready')
        if (Array.isArray(raw) && raw.length > 0) {
          const transformed = raw.map(transformFacilityToCourt).filter(Boolean)
          // Ưu tiên cơ sở có sân con
          const validFacilities = transformed.filter((f) => Array.isArray(f.courts) && f.courts.length > 0)
          const mergedFacilities = validFacilities.length > 0 ? validFacilities : transformed
          setFacilities(mergedFacilities)

          const stateFacId = location.state?.facilityId
          const stateCourtId = location.state?.courtId
          if (stateFacId && mergedFacilities.some((f) => f.id === stateFacId)) {
            setSelectedFacilityId(stateFacId)
            const targetFac = mergedFacilities.find((f) => f.id === stateFacId)
            if (stateCourtId && targetFac?.courts?.some((c) => c.id === stateCourtId)) {
              setSelectedSubCourtId(stateCourtId)
            } else if (targetFac?.courts?.[0]?.id) {
              setSelectedSubCourtId(targetFac.courts[0].id)
            }
          }
        }
      })
      .catch((err) => {
        console.warn('[CreateMatch] Không thể tải facilities từ BE:', err)
        if (isMounted) setFacilitiesStatus('error')
      })
    return () => {
      isMounted = false
    }
  }, [location.state, facilitiesReload])

  // Ghi nhận bộ môn người chơi chủ động chọn khi tạo kèo ghép trận
  useEffect(() => {
    if (sport) recordNewPlayerDesire({ sportKey: sport, source: 'Chọn môn khi tạo kèo ghép trận' })
  }, [sport])

  const filteredFacilities = useMemo(() => {
    if (!facilities.length) return []
    if (!sport) return facilities
    return facilities.filter((f) => {
      if (Array.isArray(f.sports) && f.sports.length > 0) {
        return f.sports.includes(sport)
      }
      return f.sport === sport
    })
  }, [facilities, sport])

  // Sắp xếp ưu tiên cơ sở tại khu vực đang chọn rồi theo khoảng cách distanceKm từ API (nếu có)
  const sortedFacilities = useMemo(() => {
    return [...filteredFacilities].sort((a, b) => {
      const aInDist = a.district === selectedDistrict ? 1 : 0
      const bInDist = b.district === selectedDistrict ? 1 : 0
      if (aInDist !== bInDist) return bInDist - aInDist
      const aDistKm = a.distanceKm != null && Number.isFinite(Number(a.distanceKm)) ? Number(a.distanceKm) : null
      const bDistKm = b.distanceKm != null && Number.isFinite(Number(b.distanceKm)) ? Number(b.distanceKm) : null
      return (aDistKm ?? Infinity) - (bDistKm ?? Infinity)
    })
  }, [filteredFacilities, selectedDistrict])

  // Cơ sở đang chọn
  const selectedFacility = useMemo(() => {
    return facilities.find((f) => f.id === selectedFacilityId) || null
  }, [facilities, selectedFacilityId])

  // Danh sách sân con của cơ sở đang chọn, chỉ lấy sân đúng môn đang chọn (cơ sở có thể có nhiều môn)
  const availableSubCourts = useMemo(() => {
    if (!selectedFacility || !Array.isArray(selectedFacility.courts)) return []
    if (!sport) return selectedFacility.courts
    return selectedFacility.courts.filter((c) => normalizeSportKey(c.categoryName || '') === sport)
  }, [selectedFacility, sport])

  // Sân con đang chọn
  const selectedSubCourt = useMemo(() => {
    // Sân con người dùng chọn nếu còn thuộc cơ sở này; nếu không, lấy sân đang hoạt động đầu tiên
    return (
      availableSubCourts.find((c) => c.id === selectedSubCourtId) ||
      availableSubCourts.find((c) => c.status === 'ACTIVE') ||
      availableSubCourts[0] ||
      null
    )
  }, [availableSubCourts, selectedSubCourtId])

  // Môn của sân con đang chọn (theo danh mục BE); môn đồng đội bắt buộc kèo đội
  const courtSportKey = normalizeSportKey(selectedSubCourt?.categoryName || '') || normalizeSportKey(sport || '')
  const isTeamSport = LFG_POLICY.teamSportKeys.includes(courtSportKey)
  // Đội của tôi (đội trưởng) cùng môn với sân để làm đội chủ kèo
  const sportTeams = captainTeams.filter((team) => !team.sportName || normalizeSportKey(team.sportName) === courtSportKey)
  const sideSizeOptions = buildSideSizeOptions(selectedSubCourt, isEditMode ? sideSize : null, isTeamSport)
  // Thể thức không hợp với sân / môn mới chọn thì coi như chưa chọn; chỉ có 1 lựa chọn thì tự chọn
  const validSideSize = sideSizeOptions.some((o) => o.value === sideSize)
    ? sideSize
    : sideSizeOptions.length === 1
      ? sideSizeOptions[0].value
      : undefined
  // Đội chủ kèo: bắt buộc với môn đồng đội; môn vợt đánh đôi 2 vs 2 được chọn đội (không bắt buộc)
  const canPickTeam = isTeamSport || Number(validSideSize) === 2
  const hostTeam = canPickTeam ? sportTeams.find((team) => team.id === hostTeamId) || null : null
  // Kèo đội (Team vs Team): một đội nhận kèo, tiền chia đôi 2 đội trưởng
  const isTeamMatch = isTeamSport || Boolean(hostTeam)
  // Tổng người trên sân theo thể thức (đơn 1 vs 1 = 2, đôi 2 vs 2 = 4…); chưa chọn thể thức thì chưa tính được
  const totalPlayers = Number(validSideSize) > 0 ? Number(validSideSize) * 2 : null
  // slotsNeeded gửi BE (POST /lfgs: số người cần tìm, không tính chủ kèo, 1 - 20)
  const slotsNeeded = totalPlayers ? Math.max(0, totalPlayers - havePlayers) : 0

  // Tính ngày theo định dạng YYYY-MM-DD
  const currentDateStr = useMemo(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      return selectedDate
    }
    return firstEligibleDayStr || ''
  }, [selectedDate, firstEligibleDayStr])
  const lfgWeekDays = useMemo(() => getLfgWeekDays(currentDateStr || firstEligibleDayStr), [currentDateStr, firstEligibleDayStr])

  const formattedDateLabel = useMemo(() => {
    const found = lfgWeekDays.find((d) => d.dateStr === currentDateStr)
    if (found) return found.fullLabel
    if (currentDateStr) {
      const parts = currentDateStr.split('-').map(Number)
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2])
        const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
        const dayName = dayNames[d.getDay()] || ''
        const dateFormatted = `${String(parts[2]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[0]}`
        return `${dayName}, ${dateFormatted}`
      }
    }
    return currentDateStr
  }, [currentDateStr, lfgWeekDays])

  // Tải danh sách ca từ API getCourtSlots (độ dài ca theo BE)
  const defaultCourtPrice = Number(selectedSubCourt?.defaultPrice) || Number(selectedFacility?.price) || 0
  const slotsKey = selectedSubCourt?.id ? `${selectedSubCourt.id}|${currentDateStr}|${defaultCourtPrice}` : null
  const courtSlots = slotsKey && slotsResult.key === slotsKey ? slotsResult.slots : []
  const isLoadingSlots = Boolean(slotsKey) && slotsResult.key !== slotsKey

  useEffect(() => {
    if (!slotsKey) return undefined
    let isMounted = true
    const [subCourtId, dateStr] = slotsKey.split('|')
    getCourtSlots(subCourtId, dateStr)
      .then((rawSlots) => {
        if (!isMounted) return
        const slots = buildLfgSlots(rawSlots, defaultCourtPrice)
        setSlotsResult({ key: slotsKey, slots })
      })
      .catch((err) => {
        console.warn('[CreateMatch] Lỗi khi tải ca sân:', err)
        if (isMounted) setSlotsResult({ key: slotsKey, slots: [] })
      })
    return () => {
      isMounted = false
    }
  }, [slotsKey, defaultCourtPrice])

  // Chọn ca sân trống
  const handleSelectSlot = (slot) => {
    if (!slot.isAvailable) return
    setCourtSlotId(slot.id)
    setSlotCount(1)
    setPreferredTimeRange(slot.timeRange)
    setCourtFee(slot.price)
    setCreateError(null)
  }

  // Buổi chơi nhiều ca liên tiếp (QĐ-C): chọn ca bắt đầu rồi chọn số ca.
  // BE gộp các ca thành 1 ca dài, giá mỗi người = tổng tiền sân / số người.
  const [slotCount, setSlotCount] = useState(1)
  const consecutiveRun = useMemo(() => {
    const list = slotsKey && slotsResult.key === slotsKey ? slotsResult.slots : []
    const i = list.findIndex((s) => s.id === courtSlotId)
    if (i < 0) return []
    const run = [list[i]]
    for (let j = i + 1; j < list.length && run.length < MAX_LFG_COURT_SLOTS; j++) {
      const prevEnd = run[run.length - 1].rawSlots.at(-1)?.endTime
      if (!list[j].isAvailable || list[j].rawSlots[0]?.startTime !== prevEnd) break
      run.push(list[j])
    }
    return run
  }, [slotsKey, slotsResult, courtSlotId])
  const applySlotCount = (count) => {
    const picked = consecutiveRun.slice(0, count)
    if (!picked.length) return
    setSlotCount(picked.length)
    setCourtFee(picked.reduce((sum, s) => sum + s.price, 0))
    setPreferredTimeRange(`${picked[0].start} - ${picked[picked.length - 1].end}`)
  }
  // Số ca gửi BE (numberOfSlots)
  const dbSlotCount = consecutiveRun.slice(0, slotCount).reduce((n, s) => n + (s.slotIds?.length || 1), 0) || 1

  // Chọn / bỏ chọn bộ môn thể thao (nếu cơ sở đang chọn không hỗ trợ môn mới thì xóa chọn sân/ca cũ)
  const handleSelectSport = (sportKey) => {
    const nextSport = sport === sportKey ? '' : sportKey
    setSport(nextSport)
    if (nextSport && selectedFacility) {
      const supportsSport =
        Array.isArray(selectedFacility.sports) && selectedFacility.sports.length > 0
          ? selectedFacility.sports.includes(nextSport)
          : selectedFacility.sport === nextSport
      if (!supportsSport) {
        setSelectedFacilityId(null)
        setSelectedSubCourtId(null)
        setCourtSlotId(null)
        setCourtFee(0)
      }
    }
  }

  // Tải dữ liệu kèo cũ khi ở chế độ chỉnh sửa: GET /api/v1/lfgs/{cardId}
  useEffect(() => {
    if (editCardId) {
      getLfgById(editCardId)
        .then((res) => {
          if (res) {
            const needed = Number(res.totalSlots ?? res.slotsNeeded) || 0
            const side = Number(res.sideSize) > 0 ? Number(res.sideSize) : 0
            if (side && needed) setHavePlayers(Math.max(1, side * 2 - needed))
            if (res.pricePerPerson) setPricePerPerson(String(res.pricePerPerson))
            if (res.description) setDescription(res.description)
            setSideSize(res.sideSize != null && Number(res.sideSize) > 0 ? Number(res.sideSize) : null)
            const mappedSkill = fromCreateMatchSkillTag(res.skillLevelTag)
            if (mappedSkill) setSkillLevel(mappedSkill)
            const mappedSport = normalizeSportKey(res.sportName || res.sportCategoryName || res.sport)
            if (mappedSport) setSport(mappedSport)
            if (res.requireApproval !== undefined) setRequireApproval(Boolean(res.requireApproval))
          }
        })
        .catch((e) => console.warn('[CreateMatch] Không thể tải thông tin kèo cũ để sửa:', e))
    }
  }, [editCardId])

  // Danh sách môn thật từ GET /api/v1/master-data/sports (không ghi cứng ở FE)
  const [sportOptions, setSportOptions] = useState(() => Object.values(SPORT_CATALOG))
  const [sportOptionsError, setSportOptionsError] = useState('')
  useEffect(() => {
    let cancelled = false
    getSportCategories()
      .then((list) => {
        if (cancelled) return
        setSportCatalog(list)
        setSportOptions(Object.values(SPORT_CATALOG))
      })
      .catch((err) => { if (!cancelled) setSportOptionsError(err?.message || 'Không tải được danh sách môn.') })
    return () => { cancelled = true }
  }, [])

  // Toast / Submission state
  const [submitting, setSubmitting] = useState(false)

  // Lấy số dư ví thật khi mở trang
  useEffect(() => {
    getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {})
  }, [])

  // Listen for balance updates from anywhere in app
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleUpdate)
  }, [])

  // Khu vực & cơ sở đang chọn
  const currentDistrictData = districtData[selectedDistrict] || { name: 'Đang tải…', courts: [] }
  const currentCourt =
    currentDistrictData.courts.find((c) => c.id === pickedCourtId) || currentDistrictData.courts[0] || { name: '—', distance: '', courtCount: '', price: '' }
  const mapFacilities = useMemo(() => {
    const base = sortedFacilities.length > 0 ? sortedFacilities : currentDistrictData.courts
    if (!selectedFacility) return base
    return base.some((f) => f.id === selectedFacility.id) ? base : [selectedFacility, ...base]
  }, [sortedFacilities, currentDistrictData.courts, selectedFacility])
  const handleSelectFacility = (fac) => {
    if (!fac?.id) return
    const matched = facilities.find((f) => f.id === fac.id) || fac
    setSelectedFacilityId(matched.id)
    const firstCourt = matched.courts?.find((c) => c.status === 'ACTIVE') || matched.courts?.[0]
    if (firstCourt) setSelectedSubCourtId(firstCourt.id)
  }

  // Lọc khu vực theo tên khu vực hoặc tên / địa chỉ cơ sở & sắp xếp theo khoảng cách distanceKm từ API (nếu có)
  const filteredDistricts = Object.entries(districtData)
    .sort(([, a], [, b]) => {
      const distA = a.courts?.[0]?.distanceKm ?? null
      const distB = b.courts?.[0]?.distanceKm ?? null
      return (distA ?? Infinity) - (distB ?? Infinity)
    })
    .filter(([, item]) => {
    if (!districtSearchQuery.trim()) return true
    const q = districtSearchQuery.toLowerCase().trim()
    const matchName = item.name.toLowerCase().includes(q)
    const matchCourts = item.courts.some(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    )
    return matchName || matchCourts
  })

  const handleSelectDistrict = (key) => {
    if (districtData[key]?.name) {
      recordNewPlayerDesire({ keyword: districtData[key].name, source: 'Chọn khu vực sân ghép trận' })
    }
    setSelectedDistrict(key)
    setSelectedCourtId(null)
    setDistrictSearchQuery('')
    setIsDistrictDropdownOpen(false)
  }

  // Handle Match Publishing & save into feed
  // 2.6 Chủ kèo Bước 1: POST /api/v1/lfgs
  const handlePublishMatch = async () => {
    setSubmitting(true)
    setCreateError(null)

    if (!isEditMode && !sport) {
      setCreateError('Chưa chọn bộ môn thể thao. Vui lòng chọn bộ môn ở mục 01 trước khi tạo kèo.')
      setSubmitting(false)
      document.getElementById('section-sport')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (!isEditMode && !courtSlotId) {
      setCreateError('Chưa chọn ca sân. Vui lòng chọn cơ sở và một ca trống ở mục 03 trước khi tạo kèo.')
      setSubmitting(false)
      document.getElementById('section-court-slots')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Kèo cá nhân: phải chọn thể thức và còn thiếu ít nhất 1 người
    if (!isEditMode && !isTeamMatch && !totalPlayers) {
      setCreateError('Chưa chọn thể thức (đơn / đôi). Vui lòng chọn ở mục 04 để hệ thống tính số người còn thiếu.')
      setSubmitting(false)
      return
    }
    if (!isTeamMatch && totalPlayers && slotsNeeded < 1) {
      setCreateError('Bạn đã đủ người cho thể thức này nên không cần đăng kèo tìm thêm người.')
      setSubmitting(false)
      return
    }

    // Kèo đội cần số người mỗi đội = teamSize của sân con (BE bắt buộc sideSize); sân chưa khai báo thì chưa tạo được
    if (!isEditMode && isTeamSport && !validSideSize) {
      setCreateError('Sân này chưa khai báo số người mỗi đội nên chưa tạo được kèo đội. Vui lòng chọn sân khác hoặc báo chủ sân cập nhật thông tin sân.')
      setSubmitting(false)
      document.getElementById('section-court-slots')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Môn đồng đội: bắt buộc chọn đội (chủ kèo là đội trưởng)
    if (!isEditMode && isTeamSport && !hostTeam) {
      setCreateError('Môn đồng đội chỉ ghép kèo theo đội. Vui lòng chọn đội bạn làm đội trưởng ở mục 04.')
      setSubmitting(false)
      document.getElementById('section-host-team')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }


    // Kiểm tra số dư ví chủ sân (FE Xử lý: Hệ thống tự đặt ca sân và trừ 100% tiền sân từ ví chủ kèo)
    if (walletBalance < courtFee) {
      toast.error(`Số dư ví Escrow hiện tại không đủ để trừ 100% tiền sân (${new Intl.NumberFormat('vi-VN').format(courtFee)} Điểm). Vui lòng nạp thêm tiền!`)
      setSubmitting(false)
      return
    }

    const skillTag = toCreateMatchSkillTag(skillLevel)

    // Nếu đang sửa kèo: Gọi PUT /api/v1/lfgs/{cardId}
    if (isEditMode) {
      try {
        // UpdateLfgRequest: totalSlots (số người cần tìm), skillLevelTag, description, requireApproval. Không có giá.
        await updateLfg(editCardId, {
          // Kèo cũ chưa có thể thức thì không tính được số suất: không gửi để giữ nguyên trên BE
          totalSlots: slotsNeeded > 0 ? slotsNeeded : undefined,
          skillLevelTag: skillTag,
          description: description.trim() || undefined,
          requireApproval: Boolean(requireApproval),
        })
        setTimeout(() => {
          navigate('/community?tab=my_cards')
        }, 500)
        return
      } catch (apiErr) {
        console.warn('[CreateMatch] API updateLfg lỗi:', apiErr)
        setCreateError(apiErr?.message || 'Không thể cập nhật kèo ghép.')
        setSubmitting(false)
        return
      }
    }

    // Tạo mới: BE đặt ca và trừ 100% tiền sân ngay khi gọi POST /api/v1/lfgs,
    // nên phải cho chủ kèo xem trước số tiền và xác nhận (modal bên dưới gọi confirmCreateLfg).
    setSubmitting(false)
    setPaymentConfirm({ open: true, wallet: null, walletError: '' })
    getWallet()
      .then((w) => {
        setWalletBalance(w.balance)
        setPaymentConfirm((prev) => (prev.open ? { ...prev, wallet: w } : prev))
      })
      .catch((err) => setPaymentConfirm((prev) => (prev.open ? { ...prev, walletError: err?.message || 'Không tải được số dư ví.' } : prev)))
  }

  // Modal xác nhận thanh toán trước khi tạo kèo
  const [paymentConfirm, setPaymentConfirm] = useState({ open: false, wallet: null, walletError: '' })
  const closePaymentConfirm = () => { if (!submitting) setPaymentConfirm({ open: false, wallet: null, walletError: '' }) }

  const confirmCreateLfg = async () => {
    setSubmitting(true)
    setCreateError(null)
    const skillTag = toCreateMatchSkillTag(skillLevel)
    try {
      await createLfg({
        courtSlotId,
        numberOfSlots: dbSlotCount,
        // Kèo đội: chờ BE chốt — tạm gửi 1 suất cho 1 đội nhận kèo (đội trưởng nhận thay cả đội)
        slotsNeeded: isTeamMatch ? 1 : slotsNeeded,
        // Không gửi pricePerPerson: chủ kèo không tự đặt giá, BE chia đều tiền sân
        skillLevelTag: skillTag,
        description: description.trim() || undefined,
        requireApproval: Boolean(requireApproval),
        sideSize: validSideSize || undefined,
        hostTeamId: hostTeam?.id || null,
      })
    } catch (apiErr) {
      console.warn('[CreateMatch] API createLfg lỗi:', apiErr)
      setCreateError(apiErr?.message || 'Không thể tạo kèo ghép trên hệ thống.')
      setSubmitting(false)
      setPaymentConfirm({ open: false, wallet: null, walletError: '' })
      return
    }

    // Backend đã đặt ca và trừ tiền sân: tải lại ví để hiển thị số dư thật.
    getWallet().catch(() => {})

    setTimeout(() => {
      navigate('/community?tab=my_cards')
    }, 600)
  }

  // Handle Cancel Match Creation
  const handleCancel = async () => {
    if ((await confirmDialog('Bạn có chắc chắn muốn huỷ bỏ đăng kèo ghép trận này không?'))) {
      navigate('/community')
    }
  }

  return (
    <div className="w-full min-h-screen text-[#1E293B] pb-16">
      <div className="snx-page">
        {/* Main Large White Card Container */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 md:p-10 shadow-sm">
          {/* Header Section */}
          <div className="flex flex-col gap-3 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#2D5F3F] flex items-center justify-center text-white shadow-md shadow-[#2D5F3F]/30 shrink-0">
                <span className="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-[28px] font-black text-[#111827] tracking-tight">
                    {isEditMode ? 'Chỉnh Sửa Kèo Ghép' : 'Tạo Kèo Ghép Mới (LFG Matchmaking)'}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EAF7EE] text-[#15803D] border border-[#C6E7BE] text-[11px] font-extrabold uppercase tracking-wide">
                    Realtime Engine
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kết nối vận động viên cùng đẳng cấp &amp; tối ưu giờ sân theo thời gian thực
                </p>
              </div>
            </div>

            {/* Escrow Reassurance Badge */}
            {showEscrowPill && (
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#EAF7EE] border border-[#C6E7BE] text-[#15803D] text-xs font-bold shadow-2xs mt-1">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Bảo Chứng Escrow 100% Chống Bùng Kèo</span>
                <button
                  type="button"
                  onClick={() => setShowEscrowPill(false)}
                  className="w-4 h-4 rounded-full hover:bg-green-200 flex items-center justify-center text-[#15803D] ml-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* 2-Column Main Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            {/* ================= LEFT COLUMN: CONFIGURATION FORM ================= */}
            <div className="lg:col-span-8 flex flex-col gap-7">
              {/* 01. CHỌN BỘ MÔN THỂ THAO */}
              <div id="section-sport">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide">
                    01. CHỌN BỘ MÔN THỂ THAO
                  </label>
                  <span className="text-[11px] font-extrabold text-[#15803D] uppercase tracking-wider">
                    ĐỒNG BỘ TRÌNH ĐỘ
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {sportOptions.map((s) => (
                    <div
                      key={s.key}
                      onClick={() => handleSelectSport(s.key)}
                      className={`relative p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
                        sport === s.key
                          ? 'bg-[#2D5F3F] text-white shadow-md shadow-[#2D5F3F]/30 border-2 border-[#2D5F3F]'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          sport === s.key ? 'bg-white/20 text-white scale-105' : 'bg-gray-100'
                        }`}
                      >
                        <span className="text-[22px] leading-none select-none" role="img" aria-label={s.name}>
                          {s.emoji}
                        </span>
                      </div>
                      <div className="w-full">
                        <div className="flex items-center justify-center gap-1">
                          <h3 className="font-extrabold text-[13px] truncate">{s.name}</h3>
                          {sport === s.key && (
                            <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399] shrink-0"></span>
                          )}
                        </div>
                        {s.rulesDescription && (
                          <p title={s.rulesDescription} className={`text-[10px] mt-0.5 truncate ${sport === s.key ? 'text-green-100' : 'text-gray-400'}`}>
                            {s.rulesDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {sportOptionsError && <p className="text-xs text-rose-600 mt-2">{sportOptionsError}</p>}
              </div>

              {/* 02. BÁN KÍNH & KHU VỰC MUỐN CHƠI */}
              <div className="bg-[#FAFBF9] rounded-2xl p-5 border border-gray-200/80">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide">
                    02. BÁN KÍNH &amp; KHU VỰC MUỐN CHƠI
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#111827] shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                    Bán kính: {radius} km
                  </span>
                </div>

                {/* Range Slider Với 2 Nút Tăng Chỉnh Gần - Xa Ở 2 Đầu */}
                <div className="py-2 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {/* Nút giảm khoảng cách (Gần hơn) */}
                    <button
                      type="button"
                      onClick={() => setRadius((prev) => Math.max(1, +(prev - 0.5).toFixed(1)))}
                      disabled={radius <= 1}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-[#2D5F3F] hover:bg-[#EAF7EE] text-[#1E293B] hover:text-[#2D5F3F] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs transition-all cursor-pointer shrink-0"
                      title="Giảm bán kính (Gần hơn: -0.5km)"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>

                    {/* Range Track */}
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="0.5"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D5F3F]"
                      />
                    </div>

                    {/* Nút tăng khoảng cách (Xa hơn) */}
                    <button
                      type="button"
                      onClick={() => setRadius((prev) => Math.min(25, +(prev + 0.5).toFixed(1)))}
                      disabled={radius >= 25}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-[#2D5F3F] hover:bg-[#EAF7EE] text-[#1E293B] hover:text-[#2D5F3F] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs transition-all cursor-pointer shrink-0"
                      title="Tăng bán kính (Xa hơn: +0.5km)"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 font-semibold px-0.5">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-gray-400">near_me</span>
                      Gần nhất (1 km)
                    </span>
                    <span className="text-[#2D5F3F] font-bold">Tiêu chuẩn đề xuất (8 - 10 km)</span>
                    <span className="flex items-center gap-1">
                      Mở rộng (25 km)
                      <span className="material-symbols-outlined text-[13px] text-gray-400">explore</span>
                    </span>
                  </div>
                </div>

                {/* Thanh Tìm Kiếm Khu Vực Sân (Quận / Địa Điểm) Thay Cho Các Nút Chọn Nhanh */}
                <div className="mt-4 pt-3.5 border-t border-gray-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11.5px] font-bold text-gray-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#2D5F3F]">
                        search_insights
                      </span>
                      Tìm kiếm khu vực sân (tên đường, phường, tỉnh):
                    </span>
                    {/* Active Selected Area Pill */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-extrabold bg-[#EAF7EE] border border-[#C6E7BE] px-2.5 py-0.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                        Đang chọn: {currentDistrictData.name} ({currentDistrictData.courts.length} sân)
                      </span>
                      {userProfileLocation && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-extrabold bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded-lg">
                          <span className="material-symbols-outlined text-[13px] text-[#16A34A]">person_pin_circle</span>
                          Đồng bộ hồ sơ: {userProfileLocation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Search Bar Input Container */}
                  <div className="relative">
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 material-symbols-outlined text-gray-400 text-[19px] pointer-events-none">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Tên đường, phường, tỉnh..."
                        value={districtSearchQuery}
                        onChange={(e) => {
                          setDistrictSearchQuery(e.target.value)
                          setIsDistrictDropdownOpen(true)
                        }}
                        onFocus={() => setIsDistrictDropdownOpen(true)}
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-gray-800 font-medium transition-all outline-none shadow-2xs"
                      />
                      {districtSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setDistrictSearchQuery('')
                            setIsDistrictDropdownOpen(false)
                          }}
                          className="absolute right-3 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-[11px] cursor-pointer"
                          title="Xóa tìm kiếm"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Autocomplete / Dropdown Results List */}
                    {isDistrictDropdownOpen && (
                      <>
                        {/* Overlay backdrop to close dropdown when clicking outside */}
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsDistrictDropdownOpen(false)}
                        />

                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-gray-100">
                          <div className="p-2.5 bg-gray-50/90 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                            <span>
                              {districtSearchQuery.trim()
                                ? `Kết quả tìm kiếm (${filteredDistricts.length} khu vực)`
                                : 'Chọn nhanh hoặc tìm kiếm khu vực sân:'}
                            </span>
                            <span className="text-gray-400 font-normal">Click để chọn</span>
                          </div>

                          {filteredDistricts.length > 0 ? (
                            filteredDistricts.map(([key, item]) => {
                              const isSelected = selectedDistrict === key
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleSelectDistrict(key)}
                                  className={`w-full p-3 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#EAF7EE] hover:bg-[#dff3e5]'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? 'bg-[#2D5F3F] text-white'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[17px]">
                                        location_on
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4
                                          className={`text-xs font-bold ${
                                            isSelected ? 'text-[#15803D]' : 'text-gray-900'
                                          }`}
                                        >
                                          {item.name}
                                        </h4>
                                        {isSelected && (
                                          <span className="px-1.5 py-0.2 rounded bg-[#15803D] text-white text-[9.5px] font-extrabold uppercase">
                                            Đang Chọn
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10.5px] text-gray-500 truncate mt-0.5">
                                        {item.courts.map((c) => c.name).join(' • ')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span
                                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                                        isSelected
                                          ? 'bg-[#2D5F3F] text-white'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {item.courts.length} sân
                                    </span>
                                  </div>
                                </button>
                              )
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-gray-500">
                              <span className="material-symbols-outlined text-[24px] text-gray-400 block mb-1">
                                search_off
                              </span>
                              Không tìm thấy khu vực phù hợp với &quot;{districtSearchQuery}&quot;
                              <p className="text-[11px] text-gray-400 mt-1">
                                Hãy thử tìm theo tên đường, phường, tỉnh hoặc tên sân...
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Active selected tag and shortcut trigger */}
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-[#15803D]">
                        check_circle
                      </span>
                      <span>
                        Khu vực áp dụng bản đồ:{' '}
                        <strong className="text-[#111827]">{currentDistrictData.name}</strong> •{' '}
                        {currentDistrictData.courts.length} sân trong bán kính {radius} km
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDistrictDropdownOpen((prev) => !prev)}
                      className="text-[11px] font-bold text-[#15803D] hover:underline cursor-pointer"
                    >
                      {isDistrictDropdownOpen ? 'Đóng danh sách' : 'Xem tất cả khu vực ▾'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 03. CHỌN SÂN & CA TRỐNG KHẢ DỤNG (BẮT BUỘC ĐỂ ĐĂNG KÈO) */}
              <div
                id="section-court-slots"
                className="relative rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAFBF8] to-[#F2F9F3] border-2 border-[#86EFAC] p-5 sm:p-6 shadow-[0_8px_30px_rgba(45,95,63,0.08)] overflow-hidden"
              >
                {/* Glowing neon accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#2D5F3F]" />

                {/* Section Header & Date Selector */}
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#F59E0B] text-[22px] animate-bounce">
                        stadium
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="text-[13px] font-black text-[#111827] uppercase tracking-wide">
                            03. CHỌN SÂN &amp; CA TRỐNG KHẢ DỤNG
                          </label>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#15803D] text-[10px] font-black uppercase border border-[#C6E7BE]">
                            Bắt Buộc Để Đăng Kèo
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Chọn cơ sở, sân đấu và nhấp vào ca còn trống bên dưới để hệ thống giữ chỗ tự động
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#EAF7EE] px-3 py-1 rounded-xl border border-[#C6E7BE] text-xs font-bold text-[#15803D]">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>Độ dài ca theo cấu hình của sân</span>
                    </div>
                  </div>

                  {/* Bộ Chọn Ngày Thi Đấu - Calendar Strip & Picker */}
                  <div className="bg-white/85 p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#2D5F3F]">calendar_month</span>
                          Chọn ngày thi đấu:
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#EAF7EE] text-[#15803D] text-xs font-extrabold border border-[#C6E7BE]">
                          {formattedDateLabel}
                        </span>
                      </div>

                      {/* Lịch tháng (giống trang đặt sân): chọn ngày thì dải tuần bên dưới đổi theo */}
                      <MonthCalendarPicker
                        value={currentDateStr}
                        minDate={firstEligibleDayStr}
                        label="Mở lịch tháng"
                        triggerClassName="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-[#EAF7EE] border border-gray-300 hover:border-[#2D5F3F] text-gray-700 hover:text-[#15803D] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        onChange={(dateStr) => {
                          setSelectedDate(dateStr)
                          setCourtSlotId(null)
                        }}
                      />
                    </div>

                    {/* Dải thẻ ngày trượt ngang dạng Calendar Strip */}
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                      {lfgWeekDays.map((item) => {
                        const isSelected = item.dateStr === currentDateStr
                        return (
                          <button
                            key={item.dateStr}
                            type="button"
                            disabled={item.isPast}
                            title={item.isPast ? 'Ngày đã qua' : undefined}
                            onClick={() => {
                              setSelectedDate(item.dateStr)
                              setCourtSlotId(null)
                            }}
                            className={`min-w-[82px] sm:min-w-[88px] py-2.5 px-2 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                              isSelected
                                ? 'bg-[#2D5F3F] text-white shadow-md shadow-[#2D5F3F]/25 ring-2 ring-[#2D5F3F]/40 scale-[1.02]'
                                : 'bg-white border border-gray-200 hover:border-[#2D5F3F] hover:bg-[#F0FDF4] text-gray-700 shadow-2xs'
                            }`}
                          >
                            {/* Thứ */}
                            <span className={`text-[11.5px] font-bold ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                              {item.shortDay}
                            </span>

                            {/* Ngày số to rõ */}
                            <span className={`text-[20px] font-black leading-none ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {item.dayNum}
                            </span>

                            {/* Tháng / Năm */}
                            <span className={`text-[10px] font-extrabold ${isSelected ? 'text-emerald-200' : 'text-gray-500'}`}>
                              {item.monthNum}/{item.year}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Bước 1: Chọn Cơ Sở Thể Thao */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11.5px] font-black uppercase tracking-wider text-gray-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#2D5F3F]">location_on</span>
                      1. Chọn cơ sở thể thao:
                    </span>
                    <span className="text-[10.5px] font-bold text-gray-500">
                      Hiển thị {sortedFacilities.length} cơ sở trong khu vực
                    </span>
                  </div>
                  {facilitiesStatus === 'loading' && (
                    <p className="text-xs text-gray-500 py-3">Đang tải danh sách cơ sở…</p>
                  )}
                  {facilitiesStatus === 'error' && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3">
                      <span>Không tải được danh sách cơ sở. Vui lòng thử lại.</span>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-white border border-red-200 font-bold cursor-pointer"
                        onClick={() => {
                          setFacilitiesStatus('loading')
                          setFacilitiesReload((n) => n + 1)
                        }}
                      >
                        Thử lại
                      </button>
                    </div>
                  )}
                  {facilitiesStatus === 'ready' && sortedFacilities.length === 0 && (
                    <p className="text-xs text-gray-500 py-3">
                      {sport ? 'Hiện chưa có cơ sở nào trên hệ thống cho môn này.' : 'Hiện chưa có cơ sở nào trên hệ thống.'}
                    </p>
                  )}
                  {facilitiesStatus === 'ready' && sortedFacilities.length > 0 && !selectedFacility && (
                    <p className="text-xs text-amber-700 pb-2">Chọn một cơ sở bên dưới để xem sân con và ca trống.</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {sortedFacilities.map((fac) => {
                      const isFacSelected = fac.id === selectedFacilityId
                      const facCourtsCount = fac.courts?.length || 0
                      return (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => {
                            setSelectedFacilityId(fac.id)
                            const firstCourt = fac.courts?.find((c) => c.status === 'ACTIVE') || fac.courts?.[0]
                            if (firstCourt) setSelectedSubCourtId(firstCourt.id)
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isFacSelected
                              ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-sm ring-2 ring-[#2D5F3F]/20'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 w-full">
                            <h4 className="font-extrabold text-xs line-clamp-1 text-gray-900">{fac.name}</h4>
                            {isFacSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_6px_#16A34A] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[10.5px] text-gray-500 line-clamp-1">{fac.address}</p>
                          <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] w-full">
                            <span className="font-semibold text-gray-500">{facCourtsCount} sân đấu</span>
                            <span className="font-extrabold text-[#15803D]">
                              {Number(fac.price) > 0
                                ? `từ ${new Intl.NumberFormat('vi-VN').format(fac.price)} Điểm/h`
                                : 'Liên hệ'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bước 2: Chọn Sân Con trong cơ sở */}
                {availableSubCourts.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11.5px] font-black uppercase tracking-wider text-gray-700 block mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#2D5F3F]">sports_tennis</span>
                      2. Chọn sân đấu cụ thể:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableSubCourts.map((court) => {
                        const isCourtSelected = court.id === selectedSubCourt?.id
                        const isCourtActive = court.status === 'ACTIVE'
                        return (
                          <button
                            key={court.id}
                            type="button"
                            disabled={!isCourtActive}
                            onClick={() => setSelectedSubCourtId(court.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              isCourtSelected
                                ? 'bg-[#2D5F3F] text-white shadow-xs'
                                : isCourtActive
                                ? 'bg-white border border-gray-200 text-gray-700 hover:border-[#2D5F3F]'
                                : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isCourtSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                            <span>{court.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                                isCourtSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {Number(court.defaultPrice) > 0
                                ? `${new Intl.NumberFormat('vi-VN').format(Number(court.defaultPrice))} Điểm/h`
                                : 'Chưa có giá'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Bước 3: Lưới Ca Trống Khả Dụng */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11.5px] font-black uppercase tracking-wider text-gray-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#2D5F3F]">calendar_month</span>
                      3. Lưới ca sân ngày {formattedDateLabel}:
                    </span>
                    <span className="text-[11px] font-bold text-[#15803D]">
                      {courtSlots.filter((s) => s.isAvailable).length} ca trống khả dụng
                    </span>
                  </div>

                  {isLoadingSlots ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 bg-white/70 rounded-2xl border border-gray-200/80">
                      <div className="w-7 h-7 border-3 border-[#2D5F3F] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-500 font-medium">Đang kiểm tra ca trống thời gian thực...</p>
                    </div>
                  ) : courtSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2.5">
                      {courtSlots.map((slot) => {
                        const isSlotSelected = slot.id === courtSlotId
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => handleSelectSlot(slot)}
                            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                              isSlotSelected
                                ? 'bg-[#2D5F3F] text-white border-2 border-[#2D5F3F] shadow-md shadow-[#2D5F3F]/30 scale-[1.02]'
                                : slot.isAvailable
                                ? 'bg-white border-gray-200 hover:border-[#2D5F3F] hover:bg-[#F0FDF4] text-gray-800 cursor-pointer shadow-2xs'
                                : 'bg-gray-100/80 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span className={`text-[13px] font-black tracking-tight ${isSlotSelected ? 'text-white' : 'text-gray-900'}`}>
                                {slot.start} - {slot.end}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                  isSlotSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {Number.isInteger(slot.durationHours) ? slot.durationHours : slot.durationHours.toFixed(1)} TIẾNG
                                </span>
                                {isSlotSelected && (
                                  <span className="material-symbols-outlined text-white text-[16px]">check_circle</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10.5px] w-full pt-1 border-t border-black/5">
                              <span className={`font-black ${isSlotSelected ? 'text-green-100' : 'text-[#15803D]'}`}>
                                {new Intl.NumberFormat('vi-VN').format(slot.price)} Điểm
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase ${
                                  isSlotSelected
                                    ? 'bg-white text-[#2D5F3F]'
                                    : slot.isAvailable
                                    ? 'bg-[#EAF7EE] text-[#15803D]'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                {isSlotSelected ? 'ĐANG CHỌN' : slot.isAvailable ? 'TRỐNG' : slot.isPast ? 'QUA GIỜ' : 'ĐÃ KÍN'}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 px-4 bg-white/70 rounded-2xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                      <span className="material-symbols-outlined text-[28px] text-gray-400 block mb-1">event_busy</span>
                      Chưa có ca trống cho sân này vào ngày {formattedDateLabel}.
                      <div className="mt-2 flex items-center justify-center gap-3">
                        <span className="text-gray-500 font-medium">Vui lòng chọn ngày khác trên thanh lịch phía trên</span>
                        <span className="text-gray-300">|</span>
                        <Link to="/court-finder" className="text-[#2D5F3F] font-bold hover:underline">
                          Mở Bản đồ đặt sân ↗
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Banner Xác Nhận Ca Sân Đã Chọn */}
                {courtSlotId ? (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#EAF7EE] to-[#DCFCE7] border border-[#86EFAC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] text-white flex items-center justify-center font-black shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-[#15803D]">
                            ĐÃ CHỌN CA SÂN THÀNH CÔNG
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#15803D] text-white text-[9px] font-black uppercase">
                            Sẵn sàng đăng kèo
                          </span>
                        </div>
                        <p className="font-extrabold text-sm text-[#111827] mt-0.5">
                          {selectedFacility?.name} • {selectedSubCourt?.name || 'Sân tiêu chuẩn'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Khung giờ: <strong>{preferredTimeRange}</strong> ({preferredDurationHours} giờ) • Giá sân: <strong className="text-[#15803D]">{new Intl.NumberFormat('vi-VN').format(courtFee)} Điểm</strong>
                        </p>
                        {!isEditMode && consecutiveRun.length > 1 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-bold text-gray-700">Số ca liên tiếp:</span>
                            {consecutiveRun.map((s, i) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => applySlotCount(i + 1)}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${slotCount === i + 1 ? 'bg-[#15803D] text-white border-[#15803D]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#15803D]'}`}
                              >
                                {i + 1} ca (đến {s.end})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-[#15803D] font-bold block">100% Tiền sân trừ từ ví Escrow</span>
                      <span className="text-base font-black text-[#111827]">{new Intl.NumberFormat('vi-VN').format(courtFee)} Điểm</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs">
                    <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0">touch_app</span>
                    <span>
                      <strong>Chưa chọn ca sân:</strong> Vui lòng click chọn 1 ca giờ còn trống màu xanh ở bảng trên để kích hoạt nút Đăng Kèo Ngay!
                    </span>
                  </div>
                )}
              </div>

              {/* 04. TIÊU CHÍ GHÉP TRẬN & CẤU HÌNH KÈO */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide">
                    04. TIÊU CHÍ GHÉP TRẬN &amp; CẤU HÌNH KÈO
                  </label>
                </div>

                {/* Thể thức thi đấu: sideSize của BE (số người mỗi phe). Bỏ trống = giao lưu, không chia phe A/B.
                    BE không có trường giới tính (Đôi Nam / Nữ / Nam Nữ) nên không cho chọn. */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Thể thức thi đấu:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {sideSizeOptions.map((fmt) => (
                      <button
                        key={fmt.label}
                        type="button"
                        disabled={isEditMode}
                        aria-pressed={validSideSize === fmt.value}
                        onClick={() => {
                          setSideSize(validSideSize === fmt.value ? undefined : fmt.value)
                          if (fmt.value) setHavePlayers((prev) => Math.min(prev, fmt.value * 2 - 1))
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center flex flex-col items-center justify-center gap-0.5 transition-all ${isEditMode ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${
                          validSideSize === fmt.value
                            ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span>{fmt.label}</span>
                        <span className="text-[10px] font-medium text-gray-500">{fmt.hint}</span>
                      </button>
                    ))}
                  </div>
                  {isEditMode && <p className="text-[10.5px] text-gray-500 mt-1">Không đổi được thể thức sau khi đã tạo kèo.</p>}
                  {!isEditMode && isTeamSport && (
                    <p className="text-[10.5px] text-[#166534] mt-1">
                      Môn đồng đội: bắt buộc ghép kèo Đội vs Đội.
                      {!(Number(selectedSubCourt?.teamSize) > 0) && ' Sân này chưa khai báo số người mỗi đội.'}
                    </p>
                  )}
                </div>

                {/* Kèo đội (Team vs Team): bắt buộc với môn đồng đội; đánh đôi 2 vs 2 được chọn đội (không bắt buộc).
                    Chủ kèo phải là đội trưởng của một đội cùng môn. */}
                {!isEditMode && canPickTeam && (
                  <div id="section-host-team" className="mb-4 p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC]">
                    <label htmlFor="create-match-host-team" className="text-xs font-extrabold text-[#14532D] flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-[17px] text-[#15803D]">groups</span>
                      <span>{isTeamSport ? 'Chọn Đội Đại Diện (bắt buộc với môn đồng đội)' : 'Chọn Đội Đại Diện cho kèo đôi (không bắt buộc)'}</span>
                    </label>
                    {sportTeams.length === 0 && !isTeamSport ? (
                      <p className="text-[11px] text-gray-600 leading-relaxed m-0">
                        Bạn chưa là đội trưởng của đội nào cùng môn, kèo sẽ tìm người lẻ.{' '}
                        <Link to="/tournament" className="font-bold text-[#15803D] underline">Tạo đội tại Giải đấu &amp; Đội</Link> để ghép kèo đôi theo đội.
                      </p>
                    ) : sportTeams.length === 0 ? (
                      <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed m-0">
                        Môn đồng đội chỉ ghép kèo theo đội. Bạn cần là <strong>đội trưởng</strong> của một đội cùng môn để tạo kèo.{' '}
                        <Link to="/tournament" className="font-bold text-[#15803D] underline">Tạo / quản lý đội tại Giải đấu &amp; Đội</Link>
                      </p>
                    ) : (
                      <>
                        <select
                          id="create-match-host-team"
                          value={hostTeam?.id || ''}
                          onChange={(e) => setHostTeamId(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#86EFAC] bg-white text-xs font-bold text-[#111827] outline-none focus:ring-2 focus:ring-[#15803D]/25 cursor-pointer"
                        >
                          <option value="">{isTeamSport ? '-- Chọn đội của bạn --' : 'Không chọn đội (tìm người lẻ)'}</option>
                          {sportTeams.map((team) => (
                            <option key={team.id} value={team.id} disabled={team.isLocked}>
                              {team.name}
                              {team.totalMembers ? ` (${team.totalMembers} thành viên)` : ''}
                              {team.isLocked ? ' [Đang khóa]' : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-[#166534] mt-1.5 leading-relaxed m-0">
                          Đội khác nhận kèo bằng đội (do đội trưởng nhận); <strong>toàn bộ thành viên đội</strong> được thông báo và tính vào kèo.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Yêu cầu Trình độ Người chơi */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Yêu cầu Trình độ:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SKILL_LEVEL_CARDS.map((card) => {
                      const isSelected = skillLevel === card.key
                      return (
                        <div
                          key={card.key}
                          onClick={() => setSkillLevel((prev) => (prev === card.key ? '' : card.key))}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-2xs'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-black text-xs">
                            <span className="material-symbols-outlined text-[16px]">
                              {isSelected ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            <span>{card.label}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 pl-5">{card.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Phong cách thi đấu & Tiêu chuẩn sân */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Phong cách thi đấu */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 text-xs">
                    <p className="font-extrabold text-gray-900 mb-2.5">Phong cách thi đấu:</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playStyles.fun}
                          onChange={(e) => setPlayStyles({ ...playStyles, fun: e.target.checked })}
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Giao lưu vui vẻ, rèn luyện sức khỏe
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playStyles.fairplay}
                          onChange={(e) =>
                            setPlayStyles({ ...playStyles, fairplay: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Có tính điểm xếp hạng Fairplay
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playStyles.competitive}
                          onChange={(e) =>
                            setPlayStyles({ ...playStyles, competitive: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Thi đấu cạnh tranh gắt gao
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Tiêu chuẩn sân & Chi phí */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 text-xs">
                    <p className="font-extrabold text-gray-900 mb-2.5">Tiêu chuẩn sân &amp; Chi phí:</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courtStandards.acCourt}
                          onChange={(e) =>
                            setCourtStandards({ ...courtStandards, acCourt: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Sân thảm cao cấp có máy lạnh
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courtStandards.proBall}
                          onChange={(e) =>
                            setCourtStandards({ ...courtStandards, proBall: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Cầu Yonex AS-40 / Franklin X-40
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courtStandards.splitBill}
                          onChange={(e) =>
                            setCourtStandards({ ...courtStandards, splitBill: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-bold text-[#15803D]">
                          Chia đều qua ví Escrow (Split bill)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 05. CẤU HÌNH SUẤT & DUYỆT NGƯỜI THAM GIA (LFG SPEC) */}
              <div className="bg-[#FAFBF9] rounded-2xl p-5 border border-gray-200/80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#2D5F3F]">group_add</span>
                    05. CẤU HÌNH SUẤT &amp; DUYỆT NGƯỜI THAM GIA
                  </label>
                </div>

                {/* Kèo đội: 1 đội nhận kèo; tiền sân chia đôi cho 2 đội trưởng, không chia tiền trong đội */}
                {isTeamMatch && !isEditMode && (
                  <div className="p-3.5 rounded-xl bg-white border border-[#86EFAC] text-xs text-[#14532D] leading-relaxed">
                    <p className="font-extrabold m-0 mb-1">Tiền sân kèo đội</p>
                    <p className="m-0">
                      Chia đôi cho 2 đội trưởng: mỗi đội trưởng trả <strong>{courtFee > 0 ? `${new Intl.NumberFormat('vi-VN').format(Math.round(courtFee / 2))} Điểm` : '½ tiền sân'}</strong>.
                      Không chia tiền trong đội; thành viên đội không bị trừ tiền.
                    </p>
                  </div>
                )}

                {/* Số người cần tìm & Giá mỗi người (kèo cá nhân) */}
                {!isTeamMatch && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Số người đã có → hệ thống tự tính số suất còn thiếu (slotsNeeded gửi BE) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Số người bạn đã có (tính cả bạn):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHavePlayers((prev) => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-300 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={totalPlayers ? totalPlayers - 1 : undefined}
                        value={havePlayers}
                        onChange={(e) => setHavePlayers(Math.max(1, Math.min(totalPlayers ? totalPlayers - 1 : 20, Number(e.target.value) || 1)))}
                        className="flex-1 h-10 px-3 text-center bg-white border border-gray-300 rounded-xl font-black text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]"
                      />
                      <button
                        type="button"
                        onClick={() => setHavePlayers((prev) => Math.min(totalPlayers ? totalPlayers - 1 : 20, prev + 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-300 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10.5px] text-gray-500 mt-1 block">
                      {totalPlayers
                        ? <>Thể thức cần <strong>{totalPlayers} người</strong> · bạn đã có {havePlayers} · <strong className="text-[#15803D]">cần tìm thêm {slotsNeeded} suất</strong></>
                        : 'Chọn thể thức (đơn / đôi) ở mục 04 để hệ thống tính số suất còn thiếu.'}
                    </span>
                  </div>

                  {/* Giá mỗi người: chủ kèo không tự đặt, hệ thống tự chia đều tiền sân (BE tính pricePerPerson) */}
                  <div>
                    <span className="block text-xs font-bold text-gray-700 mb-1.5">Tiền mỗi người đóng:</span>
                    <div className="w-full min-h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#111827] flex items-center">
                      {isEditMode && pricePerPerson
                        ? `${new Intl.NumberFormat('vi-VN').format(Number(pricePerPerson))} Điểm / người`
                        : courtFee > 0 && slotsNeeded > 0
                          ? `≈ ${new Intl.NumberFormat('vi-VN').format(Math.round(courtFee / (slotsNeeded + 1)))} Điểm / người`
                          : 'Hệ thống tự chia đều tiền sân'}
                    </div>
                    <span className="text-[10.5px] text-gray-500 mt-1 block">
                      Hệ thống chia tiền sân cho số suất cần tìm + chủ kèo. Giá chính xác hiển thị trên kèo sau khi tạo.
                      {havePlayers > 1 && <strong className="block text-amber-700 mt-0.5">Lưu ý: {havePlayers - 1} người bạn mang theo chưa được tính khi chia tiền, phần của họ do bạn trả.</strong>}
                    </span>
                  </div>
                </div>}

                {/* Require Approval Switch */}
                <div className="p-3.5 rounded-xl bg-white border border-gray-200">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs text-[#111827] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">verified</span>
                        Chế độ duyệt người tham gia
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        {requireApproval
                          ? 'BẬT: Người tham gia gửi yêu cầu, tiền cọc được giữ trong ví họ và bạn có quyền Duyệt (Approve) hoặc Từ chối (Reject).'
                          : 'TẮT: Người tham gia chọn slot là trừ tiền và vào kèo ngay (Kèo công khai trực tiếp).'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded accent-[#2D5F3F] cursor-pointer shrink-0"
                    />
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Ghi chú mô tả trận đấu:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Giao lưu 2-3 set vui vẻ, đề nghị đến đúng giờ, nước uống tự chuẩn bị..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]"
                  />
                </div>

              </div>
            </div>

            {/* ================= RIGHT COLUMN: DYNAMIC MAP & SUMMARY ================= */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Card 1: CỤM SÂN TRONG BÁN KÍNH (DYNAMIC MAP PREVIEW) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-black text-gray-800 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[16px] text-[#2D5F3F]">
                      map
                    </span>
                    <span>CỤM SÂN TRONG BÁN KÍNH</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#15803D]">
                    {currentDistrictData.courts.length} CƠ SỞ TRONG KHU VỰC
                  </span>
                </div>

                {/* Dynamic Leaflet Map Frame with Selected Location */}
                <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-inner">
                  <div className="relative h-56 bg-slate-100">
                    <FacilityAreaMap
                      facilities={mapFacilities}
                      selectedFacilityId={selectedFacility?.id ?? null}
                      onSelectFacility={handleSelectFacility}
                      userOriginCoords={userOriginCoords}
                      radiusKm={radius}
                      height={224}
                    />

                    {/* Radius Overlay Indicator */}
                    <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none max-w-[65%]">
                      <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[10.5px] font-extrabold text-gray-800 shadow-xs border border-gray-200 flex items-center gap-1 truncate">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0"></span>
                        <span className="truncate">{selectedFacility?.name || currentDistrictData.name} • {radius}km</span>
                      </span>
                    </div>

                    {/* Top-right Status Pill */}
                    <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-lg bg-[#2D5F3F] text-white text-[10px] font-bold shadow-xs">
                        Lưới Trực Tuyến
                      </span>
                    </div>
                  </div>

                  {/* Selected Court Summary Bar (below map so OSM attribution stays unobstructed) */}
                  <div className="p-2.5 bg-white border-t border-gray-200 flex items-center justify-between gap-2">
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-xs text-[#111827] flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0"></span>
                        <span className="truncate">{selectedFacility?.name || currentCourt.name}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                        {selectedFacility?.address || currentCourt.address || 'Chưa chọn cơ sở'} •{' '}
                        {selectedFacility ? `${selectedFacility.courts?.length || 0} sân` : currentCourt.courtCount || '0 sân'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF7EE] text-[#15803D] font-black text-xs shrink-0">
                      {Number(selectedFacility?.price) > 0
                        ? `từ ${new Intl.NumberFormat('vi-VN').format(selectedFacility.price)} Điểm`
                        : 'Chưa có giá'}
                    </span>
                  </div>
                </div>

                {/* List of Nearest Facilities in this Area */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                  <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                    Sân khả dụng gần bạn nhất:
                  </span>
                  {sortedFacilities.slice(0, 4).map((fac) => {
                    const isSelected = fac.id === selectedFacilityId
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => {
                          setSelectedFacilityId(fac.id)
                          const firstCourt = fac.courts?.find((c) => c.status === 'ACTIVE') || fac.courts?.[0]
                          if (firstCourt) setSelectedSubCourtId(firstCourt.id)
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] font-bold'
                            : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="material-symbols-outlined text-[14px]">
                            {isSelected ? 'check_circle' : 'location_on'}
                          </span>
                          <span className="truncate">{fac.name}</span>
                        </div>
                        <span className="text-[10.5px] text-gray-400 shrink-0 font-semibold ml-2">
                          {fac.courts?.length || 0} sân
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Card 2: Host Info Card (SYNCHRONIZED WITH ESCROW WALLET) */}
              <div className="bg-[#FAFBF9] rounded-2xl border border-gray-200 p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white font-black text-xs shadow-xs">
                    {initialsOf(currentUser.name)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#111827]">
                      {currentUser.name || 'Bạn'} (Chủ Kèo)
                    </h4>
                    <p className="text-[10.5px] text-gray-500">
                      {sport
                        ? `${eloText(standing.forSport(sport), { badminton: 'Cầu lông', pickleball: 'Pickleball', football: 'Bóng đá', basketball: 'Bóng rổ', tennis: 'Tennis' }[sport] || '')} • `
                        : ''}
                      <span className="text-[#15803D] font-bold">Fair Play {fairPlayScoreOf(standing.fairPlay) ?? '—'}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-semibold">Ví Escrow</span>
                  <span className="text-xs font-black text-[#15803D]">
                    {new Intl.NumberFormat('vi-VN').format(walletBalance)} Điểm
                  </span>
                </div>
              </div>

              {/* Card 4: Thông tin ca sân đã chọn / Nhắc nhở chọn ca */}
              {courtSlotId ? (
                <div className="bg-[#EAF7EE] border border-[#86EFAC] rounded-2xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#15803D] uppercase text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Ca sân đã chọn
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#15803D] text-white text-[9.5px] font-black uppercase">
                      Khả dụng
                    </span>
                  </div>
                  <p className="font-black text-gray-900 mt-2 text-xs">
                    {selectedFacility?.name}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {selectedSubCourt?.name || 'Sân tiêu chuẩn'} • {selectedFacility?.address}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-green-200/80 flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#2D5F3F]">schedule</span>
                      {preferredTimeRange} ({preferredDurationHours}h)
                    </span>
                    <span className="font-black text-[#15803D]">
                      {new Intl.NumberFormat('vi-VN').format(courtFee)} Điểm
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 shadow-2xs flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                    info
                  </span>
                  <div>
                    <span className="font-black block text-xs text-amber-950">Chưa chọn ca sân &amp; giờ chơi</span>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Vui lòng click chọn 1 ca giờ trống ở mục <strong>03</strong> bên trái trước khi nhấn Đăng Kèo.
                    </p>
                  </div>
                </div>
              )}

              {/* Error banner if any */}
              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-600 text-[16px] shrink-0 mt-0.5">error</span>
                  <span>{createError}</span>
                </div>
              )}

              {/* Card 6: Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => navigate('/community')}
                    className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Lưu Bản Nháp
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-700 transition-colors cursor-pointer font-bold"
                  >
                    Hủy Bỏ
                  </button>
                </div>

                {/* Primary Publish Button */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePublishMatch}
                  className="px-6 py-3.5 rounded-2xl bg-[#2D5F3F] hover:bg-[#234A31] text-white font-black text-sm shadow-md shadow-[#2D5F3F]/35 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>{submitting ? 'Đang Xử Lý...' : isEditMode ? 'LƯU THAY ĐỔI KÈO' : 'ĐĂNG KÈO NGAY'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal xác nhận thanh toán: BE đặt ca và trừ 100% tiền sân từ ví ngay khi tạo kèo */}
      {paymentConfirm.open && (() => {
        const vnd = (n) => `${new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0))} Điểm`
        const players = totalPlayers || slotsNeeded + 1
        const wallet = paymentConfirm.wallet
        const available = wallet ? Number(wallet.availableBalance ?? wallet.balance) : null
        const after = available != null ? available - courtFee : null
        const notEnough = after != null && after < 0
        const dateLabel = currentDateStr
          ? new Date(`${currentDateStr}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
          : '—'
        const rows = [
          ['Cơ sở', selectedFacility?.name || '—'],
          ['Sân', selectedSubCourt?.name || '—'],
          ['Ngày', dateLabel],
          ['Giờ chơi', preferredTimeRange || '—'],
          ['Số ca', `${slotCount} ca`],
          ...(hostTeam ? [['Đội đại diện', hostTeam.name]] : []),
        ]
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closePaymentConfirm}>
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lfg-pay-title"
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#15803D]">account_balance_wallet</span>
                <h3 id="lfg-pay-title" className="font-black text-[17px] text-[#0F172A]">Xác nhận đặt sân &amp; thanh toán</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Khi xác nhận, hệ thống đặt ca sân và trừ 100% tiền sân từ ví của bạn. Người tham gia sẽ trả lại phần của họ khi nhận suất.
              </p>

              {hostTeam && (
                <p className="mb-3 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[11.5px] text-[#14532D] leading-relaxed">
                  Kèo đội <strong>{hostTeam.name}</strong>: khi đội đối thủ nhận kèo, đội trưởng đội đó trả ½ tiền sân; tiền không chia cho thành viên trong đội.
                </p>
              )}

              <dl className="text-[13px] divide-y divide-gray-100 border border-gray-100 rounded-xl px-3.5 mb-3">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="text-gray-500 shrink-0">{k}</dt>
                    <dd className="font-bold text-[#111827] text-right break-words min-w-0">{v}</dd>
                  </div>
                ))}
              </dl>

              <dl className="text-[13px] divide-y divide-gray-100 border border-gray-100 rounded-xl px-3.5 mb-3">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-gray-500">Tổng tiền sân (trừ ngay)</dt>
                  <dd className="font-black text-[#B91C1C]">{vnd(courtFee)}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-gray-500">Phần mỗi người (dự kiến)</dt>
                  <dd className="font-bold text-[#111827] text-right">
                    ≈ {vnd(courtFee / players)}
                    <span className="block text-[10.5px] font-medium text-gray-500">chia đều cho {players} người (gồm bạn)</span>
                  </dd>
                </div>
              </dl>

              <dl className="text-[13px] divide-y divide-gray-100 border border-gray-100 rounded-xl px-3.5 mb-3">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-gray-500">Số dư ví hiện tại</dt>
                  <dd className="font-bold text-[#111827]">
                    {available != null ? vnd(available) : paymentConfirm.walletError ? '—' : 'Đang tải...'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-gray-500">Số dư sau khi trừ</dt>
                  <dd className={`font-black ${notEnough ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>{after != null ? vnd(after) : '—'}</dd>
                </div>
              </dl>

              {paymentConfirm.walletError && (
                <p role="alert" className="text-xs text-red-600 mb-3">{paymentConfirm.walletError}</p>
              )}
              {notEnough && (
                <p role="alert" className="text-xs text-red-600 mb-3">
                  Số dư ví không đủ để trả tiền sân. Vui lòng nạp thêm {vnd(-after)}.
                </p>
              )}
              <p className="text-[10.5px] text-gray-500 mb-4">
                Phần mỗi người là ước tính; số tiền chính xác do hệ thống tính và hiển thị trên kèo sau khi tạo.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePaymentConfirm}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={confirmCreateLfg}
                  disabled={submitting || available == null || notEnough}
                  className="px-4 py-2.5 rounded-xl bg-[#2D5F3F] hover:bg-[#234A31] text-white text-sm font-black disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận & thanh toán'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default CreateMatch
