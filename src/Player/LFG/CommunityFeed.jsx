import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getLfgs,
  getLfgById,
  getMyLfgCards,
  getJoinedLfgs,
  claimLfgSlot,
  getLfgQrTicket,
  approveLfgParticipant,
  rejectLfgParticipant,
  removeLfgParticipant,
  cancelLfg,
  describeLfgCancelResult,
  leaveLfg,
  getLfgCancelReasons,
  acceptLfgInvitation,
  declineLfgInvitation,
  removeLfgGroupMember,
  lfgSkillLabel,
  extractLfgTeamInfo,
  isCaptainOfTeam,
} from '../../api/player/lfgApi.js'
import { getMyTeams } from '../../api/player/teamApi.js'
import { RecommendedLfgSection } from './RecommendedLfg.jsx'
import LfgDetailModal from './LfgDetailModal.jsx'
import LfgReasonPicker from './LfgReasonPicker.jsx'
import { finalReason } from './lfgReason.js'
import { LFG_POLICY } from './lfgPolicy.js'

const TEAM_ONLY_CLAIM_TEXT = 'Kèo đội (Team vs Team): chỉ đội trưởng của một đội mới nhận được kèo này.'
// Số liệu chính sách chỉ để hiển thị chữ (xem lfgPolicy.js)
const { lockHours: LOCK_H, earlyHostFairPlay: EARLY_FP, lateHostPenaltyPercent: LATE_PCT, lateHostFairPlay: LATE_FP, leaveBlockHours: LEAVE_BLOCK_H, checkInGraceMinutes: GRACE_MIN, noShowFairPlay: NO_SHOW_FP } = LFG_POLICY

import { eloText, fairPlayScoreOf, usePlayerStanding } from '../../hooks/usePlayerStanding.js'
import { useSport } from '../Context/sportContext.js'
import { getWallet } from '../../api/player/walletApi.js'
import { initialsOf, useCurrentUser } from '../../hooks/useCurrentUser.js'
import { getBookingQrTicket } from '../../api/player/bookingApi.js'
import { vnClock } from '../../utils/vnTime.js'
import { getFacilities, transformFacilityToCourt } from '../../api/player/facilityApi.js'
import { getMySports, getSportCategories } from '../../api/player/profileApi.js'
import { getOnboarding } from '../../api/player/ratingApi.js'
import { createCommunityPost } from '../../api/player/communityApi.js'
import { reverseGeocode } from '../../utils/geolocation.js'
import {
  TRUSTED_GPS_ACCURACY_METERS,
  readProfileLocation,
  readSavedBookingOrigin,
  resolveEffectivePlayerOrigin,
  subscribeBookingOrigin,
} from '../../utils/playerOrigin.js'
import {
  SPORT_CATALOG,
  setSportCatalog,
  sportMetaOf,
  normalizeSportKey,
  normalizeSkillKey,
  loadProfileRegisteredSports,
  extractPlayerHabits,
  loadLearnedSearchDesires,
  recordNewPlayerDesire,
  buildPersonalizedLfgSuggestions,
  getDistanceRangeInfo,
} from './lfgSuggestionEngine.js'

// Helper to remove any leftover Elo or DUPR/DURP references from match data
const sanitizeMatch = (m) => {
  if (!m) return m
  const clean = (str) => {
    if (!str || typeof str !== 'string') return str
    return str
      .replace(/\s*\((?:Elo|DUPR|DURP)[^)]*\)/gi, '')
      .replace(/\b(?:Elo|DUPR|DURP)\s*[:•-]?\s*[\d.><+\s-]+/gi, '')
      .replace(/\b(?:Elo|DUPR|DURP)\b/gi, '')
      .replace(/•\s*•/g, '•')
      .replace(/\s*•\s*$/g, '')
      .replace(/^\s*•\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  const cleanedLevel = clean(m.levelTag)
  return {
    ...m,
    title: clean(m.title) || m.title,
    levelTag: cleanedLevel || 'Mọi trình độ',
    subBadge: clean(m.subBadge) || m.subBadge,
    groupDesc: clean(m.groupDesc) || m.groupDesc,
  }
}


const FEED_IMAGES = {
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop',
  pickleball: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
  football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
  tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=600&fit=crop',
  volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop',
  table_tennis: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=600&fit=crop',
}
const formatVnd = (n) => `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)} Điểm`

// Trạng thái người tham gia / của tôi trong kèo (LfgParticipantResponse.status, joined.myStatus)
const PARTICIPANT_STATUS_TEXT = {
  PENDING: 'Đang chờ duyệt',
  ACCEPTED: 'Đã vào kèo (giữ cọc)',
  REJECTED: 'Bị từ chối',
  LEFT: 'Đã rời kèo',
  REMOVED: 'Bị chủ kèo loại',
  CANCELLED: 'Đã hủy',
}

// Chuyển một thẻ LFG từ backend sang dạng thẻ hiển thị trên bảng tin.
const toFeedMatch = (card) => {
  const sportName = card.sportName || card.sportCategoryName || card.sport || ''
  // Không đoán môn: BE không trả môn thì để trống (thẻ hiện 'KÈO GHÉP')
  const sport = normalizeSportKey(sportName) || ''
  const start = card.startTime ? new Date(card.startTime) : null
  const end = card.endTime ? new Date(card.endTime) : null
  const hour = start ? start.getHours() : 18

  const participantsList = Array.isArray(card.participants) ? card.participants : []
  const hostFromParticipants = participantsList.find(
    (p) => p?.isHost || String(p?.role || '').toUpperCase() === 'HOST' || (card.hostId && String(p?.userId || p?.id) === String(card.hostId))
  ) || (card.remainingSlots != null && card.totalSlots != null && Number(card.remainingSlots) === Number(card.totalSlots) ? participantsList[0] : null)

  const resolvedHostName =
    card.hostName ||
    hostFromParticipants?.fullName ||
    hostFromParticipants?.name ||
    participantsList[0]?.fullName ||
    participantsList[0]?.name ||
    'Chủ kèo'
  // Không có điểm thì để trống (hiện "—"), không tự cho 100 điểm
  const resolvedHostFp = card.hostFairPlayScore ?? hostFromParticipants?.fairPlayScore ?? participantsList[0]?.fairPlayScore ?? null

  const nonHostParticipants = participantsList.filter((p) => {
    if (!p) return false
    if (p === hostFromParticipants) return false
    if (p.isHost || String(p.role || '').toUpperCase() === 'HOST') return false
    if (card.hostId && (p.userId || p.id)) return String(p.userId || p.id) !== String(card.hostId)
    const pName = (p.fullName || p.name || '').trim().toLowerCase()
    const hName = resolvedHostName.trim().toLowerCase()
    return !hName || pName !== hName
  })

  const recruitSlots = Number(card.totalSlots) || Number(card.slotsNeeded) || Number(card.remainingSlots) || 0
  const remainingSlots =
    card.remainingSlots != null
      ? Number(card.remainingSlots)
      : card.slotsNeeded != null
      ? Number(card.slotsNeeded)
      : Math.max(0, recruitSlots - nonHostParticipants.length)
  const currentSlots =
    card.remainingSlots != null && card.totalSlots != null
      ? Math.max(0, Number(card.totalSlots) - Number(card.remainingSlots))
      : nonHostParticipants.length
  const totalSlots = Math.max(recruitSlots, currentSlots + remainingSlots)
  const price = Number(card.pricePerPerson ?? card.price ?? 0)

  // Đội hình đầy đủ tính luôn cả chủ kèo: 1 Chủ kèo + người đã ghép + đủ số vị trí trống còn lại
  const hostSlot = {
    initials: resolvedHostName.slice(0, 2).toUpperCase(),
    bg: '#15803D',
    name: resolvedHostName,
    isHost: true,
    fairPlayScore: resolvedHostFp,
  }
  const joinedSlots = Array.from({ length: currentSlots }, (_, i) => {
    const p = nonHostParticipants[i]
    if (p) {
      const name = p.fullName || p.name || `Thành viên ${i + 1}`
      return {
        initials: name.slice(0, 2).toUpperCase(),
        bg: '#0D9488',
        name,
        side: p.side,
        status: p.status,
        fairPlayScore: p.fairPlayScore,
      }
    }
    return {
      initials: 'TV',
      bg: '#0D9488',
      name: `Thành viên đã ghép #${i + 1}`,
    }
  })
  const emptySlots = Array.from({ length: remainingSlots }, (_, i) => ({
    initials: '?',
    bg: 'empty',
    emptyIndex: i + 1,
    name: `Vị trí trống #${i + 1}`,
  }))
  const roster = [hostSlot, ...joinedSlots, ...emptySlots]

  const startClock = start ? start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
  const endClock = end ? end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
  const dateDisplay = start
    ? start.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''
  const fullTimeDisplay = start
    ? `${startClock}${endClock ? ` – ${endClock}` : ''} • ${dateDisplay}`
    : 'Chưa cập nhật thời gian'

  const rawDistanceKm = card.distanceKm ?? card.distance_km
  const distanceKm =
    rawDistanceKm !== null && rawDistanceKm !== undefined && rawDistanceKm !== '' && Number.isFinite(Number(rawDistanceKm))
      ? Number(rawDistanceKm)
      : null

  const teamInfo = extractLfgTeamInfo(card)
  const teamMatchupLabel = teamInfo.isTeamMatch
    ? `${teamInfo.hostTeamName || 'Đội chủ kèo'} vs ${teamInfo.challengerTeamName || 'Đang chờ đội đối thủ'}`
    : ''

  return {
    id: card.id || card.cardId,
    facilityId: card.facilityId || card.venueId || null,
    facilityName: card.facilityName || '',
    facilityAddress: card.facilityAddress || '',
    courtName: card.courtName || '',
    lat: card.latitude ?? card.lat ?? null,
    lng: card.longitude ?? card.lng ?? null,
    distanceKm,
    startTime: card.startTime || null,
    endTime: card.endTime || null,
    fullTimeDisplay,
    sportName: sportName || SPORT_CATALOG[sport]?.name || '',
    sport,
    sportBadge: sportName ? sportName.toUpperCase() : 'KÈO GHÉP',
    // Thể thức thật theo sideSize (số người mỗi phe); không có = giao lưu không chia phe
    format: card.format || (Number(card.sideSize) > 0 ? `${card.sideSize} vs ${card.sideSize}` : ''),
    sideSize: Number(card.sideSize) > 0 ? Number(card.sideSize) : null,
    status: card.status || 'OPEN',
    subBadge: [
      teamInfo.isTeamMatch
        ? 'Team vs Team'
        : card.format || (card.sideSize === undefined ? null : Number(card.sideSize) > 0 ? `${card.sideSize} vs ${card.sideSize}` : 'Giao lưu'),
      card.requireApproval ? 'Cần chủ kèo duyệt' : 'Tham gia ngay',
    ]
      .filter(Boolean)
      .join(' • '),
    levelTag: lfgSkillLabel(card.skillLevelTag || card.skillLevel) || 'Mọi trình độ',
    skillTag: String(card.skillLevelTag || '').toUpperCase(),
    slotTag: `Cần ${remainingSlots} người`,
    remainingSlots,
    time: start ? start.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—',
    timeSlot: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
    title: card.title || card.description || (teamInfo.isTeamMatch ? teamMatchupLabel : `Kèo ${sportName || 'ghép trận'}`),
    description: card.description || '',
    hostId: card.hostId || null,
    hostName: resolvedHostName,
    hostFairPlayScore: resolvedHostFp,
    ...teamInfo,
    teamMatchupLabel,
    location: [card.courtName, card.facilityName, card.facilityAddress].filter(Boolean).join(', ') || '—',
    groupDesc: teamInfo.isTeamMatch
      ? `Kèo đội: ${teamMatchupLabel}`
      : resolvedHostName
      ? `Chủ kèo: ${resolvedHostName}${resolvedHostFp != null ? ` (Fair Play ${resolvedHostFp})` : ''}`
      : card.description || '',
    requireApproval: Boolean(card.requireApproval),
    // Mốc khóa hủy kèo do BE trả (isLocked / hostCancelUntil); FE không tự tính
    isLocked: typeof card.isLocked === 'boolean' ? card.isLocked : undefined,
    hostCancelUntil: card.hostCancelUntil || null,
    participants: participantsList,
    roster,
    currentSlots,
    totalSlots,
    priceLabel: 'Tiền cọc mỗi người:',
    price,
    priceDisplay: formatVnd(price),
    buttonText: 'Chốt Slot Ngay',
    isFlashClaim: false,
    createdAt: card.createdAt || null,
    image: card.imageUrl || card.facilityImageUrl || FEED_IMAGES[sport] || FEED_IMAGES.badminton,
  }
}

function CommunityFeed() {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // 3-Tab Main Navigation: 'all' (Sàn ghép trận) | 'my_cards' (Kèo đã tạo - Chủ kèo) | 'joined' (Kèo đã tham gia)
  const [activeMainTab, setActiveMainTab] = useState(() => (searchParams.get('tab') === 'community_posts' ? 'all' : searchParams.get('tab') || 'all'))
  const [myStatusFilter, setMyStatusFilter] = useState('all') // 'all' | 'OPEN' | 'FILLED' | 'CANCELLED'
  // Elo & Fair Play thật cho thẻ hồ sơ ghép trận
  const standing = usePlayerStanding()
  const [myLfgCards, setMyLfgCards] = useState([])
  const [joinedLfgCards, setJoinedLfgCards] = useState([])
  // Đang tải sẵn khi trang mở thẳng vào tab tương ứng (?tab=my_cards | joined)
  const [isLoadingMyCards, setIsLoadingMyCards] = useState(() => activeMainTab === 'my_cards')
  const [isLoadingJoined, setIsLoadingJoined] = useState(() => activeMainTab === 'joined')
  const [isLoadingLfgs, setIsLoadingLfgs] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState(null)
  const [selectedClaimSide, setSelectedClaimSide] = useState('any')
  const [myTeams, setMyTeams] = useState([])
  const [claimMode, setClaimMode] = useState('solo') // 'solo' | 'team'
  const [selectedClaimTeamId, setSelectedClaimTeamId] = useState('')
  const [qrTicketModal, setQrTicketModal] = useState(null)
  const [detailCardId, setDetailCardId] = useState(null) // kèo đang xem chi tiết (LfgDetailModal)
  const [cancelMatchModal, setCancelMatchModal] = useState(null)
  const [leaveMatchModal, setLeaveMatchModal] = useState(null)
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveReasonPick, setLeaveReasonPick] = useState('')
  const [cancelReasonsList, setCancelReasonsList] = useState([])
  const [selectedCancelReason, setSelectedCancelReason] = useState('')
  const [customCancelReason, setCustomCancelReason] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Mốc T − 48 giờ (QĐ-D): dưới 48h trước giờ chơi (isLocked = true), hủy đơn phương qua POST /lfgs/{id}/cancel sẽ bị phạt 50% tiền sân bồi thường và -20 điểm FairPlay.
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15000)
    return () => clearInterval(timer)
  }, [])
  // Chỉ dùng dữ liệu BE: so giờ hiện tại với hostCancelUntil (cập nhật khi trang mở lâu), không có thì dùng isLocked.
  const isCardLocked = (card) => {
    if (card?.hostCancelUntil) return nowMs >= new Date(card.hostCancelUntil).getTime()
    return card?.isLocked === true
  }
  // Danh mục môn thật từ GET /api/v1/master-data/sports (bộ gợi ý kèo dùng để nhận diện môn, tên môn theo BE).
  // Nạp xong thì render lại để gợi ý dùng danh mục mới.
  const [, setSportCatalogVersion] = useState(0)
  useEffect(() => {
    let cancelled = false
    getSportCategories()
      .then((list) => {
        if (cancelled) return
        setSportCatalog(list)
        setSportCatalogVersion((v) => v + 1)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  // Lý do hủy / rời kèo lấy từ BE một lần (API công khai)
  useEffect(() => {
    let cancelled = false
    getLfgCancelReasons().then((list) => { if (!cancelled) setCancelReasonsList(list) })
    return () => { cancelled = true }
  }, [])

  // Bộ lọc môn thể thao dùng chung SportContext để đồng bộ với Sidebar & Hồ sơ ghép trận cá nhân
  const { selectedSports, selectOnlySport, selectAllSports, isAllActive, SPORTS_LIST } = useSport()
  const pickedSportKey = selectedSports.length === 1 ? selectedSports[0] : null
  const pickedSportMeta = pickedSportKey ? SPORTS_LIST.find((s) => s.key === pickedSportKey) : null
  const pickedSportName = pickedSportMeta?.label || pickedSportMeta?.name || ''
  const pickedStanding = pickedSportKey ? standing.forSport(pickedSportKey) : null
  const activeSportFilter = pickedSportKey || 'all'
  const [profileSports, setProfileSports] = useState(() => loadProfileRegisteredSports())
  const [facilitiesList, setFacilitiesList] = useState([])
  const [learnedDesires, setLearnedDesires] = useState(() => loadLearnedSearchDesires())
  const [includeLearnedDesires] = useState(true)
  const [desireSearchKeyword] = useState('')
  const [activeRangeId] = useState('all')
  const [selectedVenueFilter, setSelectedVenueFilter] = useState(null)
  const [levelFilter, setLevelFilter] = useState('all')
  const [distanceFilter, setDistanceFilter] = useState('all')

  // Advanced Filter Modal States
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(['morning', 'afternoon', 'evening']) // 'morning', 'afternoon', 'evening'
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all')
  const [selectedDistance, setSelectedDistance] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [filterMinFairPlay, setFilterMinFairPlay] = useState(false)


  // Modals state
  const [detailModal, setDetailModal] = useState(null) // match object or null (xem toàn bộ thông tin chi tiết kèo)
  const [bookingModal, setBookingModal] = useState(null) // match object or null
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [rulesModalOpen, setRulesModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Mở modal xem toàn bộ thông tin chi tiết về kèo ghép (GET /api/v1/lfgs/{cardId})
  const handleOpenMatchDetail = async (match) => {
    if (!match) return
    setDetailModal({ ...match, isLoadingDetail: Boolean(match.id) })
    if (!match.id) return
    try {
      const fullCard = await getLfgById(match.id)
      if (fullCard) {
        const mergedRaw = {
          ...match,
          ...fullCard,
          totalSlots: fullCard.totalSlots ?? match.totalSlots,
          remainingSlots: fullCard.remainingSlots ?? match.remainingSlots,
          hostName: fullCard.hostName || match.hostName,
          hostFairPlayScore: fullCard.hostFairPlayScore ?? match.hostFairPlayScore,
        }
        const adapted = sanitizeMatch(toFeedMatch(mergedRaw))
        setDetailModal((prev) =>
          prev && String(prev.id) === String(match.id)
            ? {
                ...prev,
                ...adapted,
                distanceKm: adapted.distanceKm ?? prev.distanceKm ?? null,
                rangeInfo: adapted.rangeInfo ?? prev.rangeInfo,
                isLoadingDetail: false,
              }
            : prev
        )
      } else {
        setDetailModal((prev) => (prev ? { ...prev, isLoadingDetail: false } : null))
      }
    } catch {
      setDetailModal((prev) => (prev ? { ...prev, isLoadingDetail: false } : null))
    }
  }

  // Wallet balance sync
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 0
  })
  // Số dư trong localStorage có thể cũ (hoặc của tài khoản trước): đồng bộ từ GET /api/v1/wallet khi vào trang
  useEffect(() => {
    let cancelled = false
    getWallet().then((w) => { if (!cancelled) setWalletBalance(w.balance) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Matches list
  // Danh sách kèo đang mở lấy từ GET /api/v1/lfgs
  const [matches, setMatches] = useState([])
  const [lfgListError, setLfgListError] = useState('')
  const [lfgReload, setLfgReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    // SideSize: lọc thể thức thật phía BE (1 = đơn 1 vs 1, 2 = đôi 2 vs 2)
    getLfgs({ page: 1, pageSize: 50, SideSize: selectedFormat === 'all' ? undefined : Number(selectedFormat) })
      .then((res) => {
        if (cancelled) return
        // Phòng hờ: sàn chỉ hiện kèo còn mở (không hủy, chưa tới giờ chơi, còn suất)
        const open = (res?.items || []).filter((c) => String(c.status || '').toUpperCase() !== 'CANCELLED' && !c.isStarted && (c.remainingSlots == null || Number(c.remainingSlots) > 0))
        setMatches(open.map(toFeedMatch).map(sanitizeMatch))
        setLfgListError('')
      })
      .catch((err) => !cancelled && setLfgListError(err?.message || 'Không tải được danh sách kèo.'))
      .finally(() => !cancelled && setIsLoadingLfgs(false))
    return () => { cancelled = true }
  }, [lfgReload, selectedFormat])

  // Vị trí thi đấu / ghép trận đồng bộ từ điểm xuất phát ở Đặt sân (custom / GPS / hồ sơ) và khảo sát người chơi.
  const [bookingOrigin, setBookingOrigin] = useState(() => readSavedBookingOrigin())
  const [profileOrigin, setProfileOrigin] = useState(() => readProfileLocation())
  const [liveGps, setLiveGps] = useState({ coords: null, name: '' })
  const [playerArea, setPlayerArea] = useState({ coords: null, radiusKm: null, name: '' })

  useEffect(() => subscribeBookingOrigin(setBookingOrigin), [])

  useEffect(() => {
    let cancelled = false
    getOnboarding()
      .then((o) => {
        if (cancelled || !o) return
        const coords = o.latitude != null && o.longitude != null ? { lat: Number(o.latitude), lng: Number(o.longitude) } : null
        setPlayerArea({ coords, radiusKm: Number(o.radiusKm) || null, name: '' })
        if (coords) {
          reverseGeocode(coords.lat, coords.lng).then((name) => {
            if (!cancelled && name) setPlayerArea((prev) => ({ ...prev, name }))
          })
        }
      })
      .catch((err) => console.warn('LFG: Không tải được khảo sát người chơi:', err))
    return () => { cancelled = true }
  }, [])

  // Nếu người chơi đã cấp quyền định vị ở Đặt sân, tự động cập nhật tọa độ GPS chính xác và giải mã tên khu vực
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return undefined
    let cancelled = false
    const fetchTrustedGps = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return
          const { latitude, longitude, accuracy } = position.coords
          if (accuracy != null && accuracy > TRUSTED_GPS_ACCURACY_METERS) return
          const coords = { lat: latitude, lng: longitude, accuracy: Math.round(accuracy || 8) }
          setLiveGps((prev) => ({ ...prev, coords }))
          reverseGeocode(coords.lat, coords.lng).then((name) => {
            if (!cancelled && name) setLiveGps((prev) => ({ ...prev, name }))
          })
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      )
    }
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (!cancelled && status.state === 'granted') fetchTrustedGps()
        })
        .catch(() => {})
    }
    return () => { cancelled = true }
  }, [])

  // Nếu điểm xuất phát lưu từ Đặt sân ở dạng GPS chưa có tên khu vực cụ thể, giải mã tọa độ sang tên khu vực
  useEffect(() => {
    if (bookingOrigin?.source !== 'gps' || !bookingOrigin.coords) return undefined
    if (bookingOrigin.label && bookingOrigin.label !== 'Vị trí hiện tại của bạn') return undefined
    let cancelled = false
    reverseGeocode(bookingOrigin.coords.lat, bookingOrigin.coords.lng).then((name) => {
      if (!cancelled && name) {
        setLiveGps((prev) => (prev.coords ? prev : { coords: bookingOrigin.coords, name }))
      }
    })
    return () => { cancelled = true }
  }, [bookingOrigin])

  const resolvedOrigin = resolveEffectivePlayerOrigin({
    bookingOrigin,
    gpsCoords: liveGps.coords,
    gpsPlaceName: liveGps.name,
    profileLocation: profileOrigin.location,
    profileCoords: profileOrigin.coords,
    onboarding: playerArea,
  })
  const userProfileLocation = resolvedOrigin.label
  const userLocationLabel = userProfileLocation || 'Chưa đặt khu vực'

  // Lắng nghe cập nhật khi người chơi chỉnh sửa vị trí / môn trong Profile
  useEffect(() => {
    const handleStorage = (e) => {
      if ((e.key === 'player_sports_data' || e.key === 'player_registered_sports') && e.newValue) {
        setProfileSports(loadProfileRegisteredSports())
      }
      if (e.key === 'player_profile_data') {
        setProfileOrigin(readProfileLocation())
      }
    }
    const handleSportsUpdate = () => setProfileSports(loadProfileRegisteredSports())
    const handleProfileUpdate = () => setProfileOrigin(readProfileLocation())
    window.addEventListener('player-sports-updated', handleSportsUpdate)
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('player-sports-updated', handleSportsUpdate)
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const isMatchNearUser = (matchLoc, userLoc) => {
    if (!matchLoc || !userLoc) return false
    const normM = matchLoc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    const normU = userLoc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    return normM.includes(normU) || normU.includes(normM)
  }
  // Kèo gần người chơi: đọc trực tiếp distanceKm từ API để so với bán kính khảo sát (mặc định 5 km), không thì so theo tên khu vực
  const isNearMe = (m) => {
    const km = m?.distanceKm != null && m.distanceKm !== '' && Number.isFinite(Number(m.distanceKm)) ? Number(m.distanceKm) : null
    if (km != null) return km <= (playerArea.radiusKm || 5)
    return isMatchNearUser(m?.location, userProfileLocation)
  }

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Load My Cards (Chủ kèo) - Bước 2
  // fetchX: chỉ gọi API và cập nhật kết quả; loadX: bật trạng thái đang tải rồi gọi fetchX
  // /my-cards không có participants: lấy thêm chi tiết từng kèo (GET /lfgs/{id}) để chủ kèo thấy người
  // xin vào / đã vào (duyệt, từ chối, loại). Lỗi chi tiết của 1 kèo thì giữ thẻ, danh sách thành viên trống.
  const withParticipants = async (card) => {
    try {
      const detail = await getLfgById(card.id)
      return {
        ...card,
        isLocked: typeof detail?.isLocked === 'boolean' ? detail.isLocked : card?.isLocked,
        hostCancelUntil: detail?.hostCancelUntil ?? card?.hostCancelUntil,
        bookingTotalAmount: detail?.bookingTotalAmount ?? card?.bookingTotalAmount,
        compensationTotal: detail?.compensationTotal ?? card?.compensationTotal,
        acceptedCount: detail?.acceptedCount,
        pendingCount: detail?.pendingCount,
        participants: (detail?.participants || []).map((p) => ({
          ...p,
          name: p.fullName || 'Người chơi',
          avatar: p.avatarUrl || '',
          status: String(p.status || '').toUpperCase(),
        })),
      }
    } catch {
      return { ...card, participants: [] }
    }
  }
  const fetchMyCards = (status = myStatusFilter) =>
    getMyLfgCards(status === 'all' ? undefined : status)
      .then((list) => Promise.all((Array.isArray(list) ? list : []).map(withParticipants)))
      .then((list) => setMyLfgCards(list))
      .catch((err) => console.warn('[CommunityFeed] Lỗi lấy kèo của tôi:', err))
      .finally(() => setIsLoadingMyCards(false))
  const loadMyCards = (status = myStatusFilter) => {
    setIsLoadingMyCards(true)
    return fetchMyCards(status)
  }

  // Load Joined Cards (Người tham gia)
  const fetchJoinedCards = () =>
    getJoinedLfgs()
      .then((list) => setJoinedLfgCards(Array.isArray(list) ? list : []))
      .catch((err) => console.warn('[CommunityFeed] Lỗi lấy kèo đã tham gia:', err))
      .finally(() => setIsLoadingJoined(false))
  const loadJoinedCards = () => {
    setIsLoadingJoined(true)
    return fetchJoinedCards()
  }


  // Tab switcher
  const handleTabChange = (newTab) => {
    setActiveMainTab(newTab)
    setSearchParams(newTab === 'all' ? {} : { tab: newTab })
    if (newTab === 'my_cards') {
      loadMyCards()
    } else if (newTab === 'joined') {
      loadJoinedCards()
    }
  }

  // Lời mời vào kèo: Chấp nhận POST /{cardId}/invitation/accept & Từ chối POST /{cardId}/invitation/decline
  const handleAcceptLfgInvite = async (cardId) => {
    try {
      await acceptLfgInvitation(cardId)
      setToastMessage({
        title: 'Đã Chấp Nhận Lời Mời',
        desc: 'Bạn đã tham gia kèo ghép thành công!',
        type: 'success',
      })
      loadJoinedCards()
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi chấp nhận lời mời:', err)
      toast.error(err.message || 'Không thể chấp nhận lời mời')
    }
  }

  const handleDeclineLfgInvite = async (cardId) => {
    try {
      await declineLfgInvitation(cardId)
      setToastMessage({
        title: 'Đã Từ Chối Lời Mời',
        desc: 'Đã từ chối tham gia kèo ghép.',
        type: 'info',
      })
      loadJoinedCards()
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi từ chối lời mời:', err)
      toast.error(err.message || 'Không thể từ chối lời mời')
    }
  }

  // Xóa thành viên nhóm: DELETE /api/v1/lfgs/{cardId}/group/{friendId}
  const handleRemoveGroupFriend = async (cardId, friendId, friendName) => {
    if (!(await confirmDialog(`Bạn có chắc muốn xóa thành viên ${friendName || ''} khỏi nhóm ghép trận?`))) return
    try {
      await removeLfgGroupMember(cardId, friendId)
      setToastMessage({
        title: 'Đã Xóa Thành Viên',
        desc: `Đã xóa ${friendName || 'thành viên'} khỏi nhóm ghép trận.`,
        type: 'success',
      })
      loadMyCards()
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi xóa thành viên nhóm:', err)
      toast.error(err.message || 'Không thể xóa thành viên khỏi nhóm')
    }
  }

  // Chia sẻ kèo đang tuyển lên Bảng tin cộng đồng: POST /api/v1/community/posts { content, lfgCardId }
  // (BE chỉ nhận kèo còn suất và chưa tới giờ chơi; bài viết hiện thẻ kèo để người khác bấm nhận suất)
  const [sharingCardId, setSharingCardId] = useState(null)
  const handleShareToFeed = async (card) => {
    const remaining = Number(card.remainingSlots ?? card.slotsNeeded) || 0
    const place = [card.courtName, card.facilityName].filter(Boolean).join(' - ')
    const when = card.startTime ? `${vnClock(card.startTime)} ngày ${new Date(card.startTime).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : ''
    const content = `Kèo ${card.sportName || 'thể thao'} còn ${remaining} suất${place ? ` tại ${place}` : ''}${when ? `, ${when}` : ''}. Ai rảnh vào nhận suất chơi cùng nhé!`
    if (!(await confirmDialog(`Đăng kèo này lên Bảng tin cộng đồng?\n\n"${content}"`))) return
    setSharingCardId(card.id)
    try {
      await createCommunityPost({ content, lfgCardId: card.id, sportCategoryId: card.sportCategoryId || null })
      toast.success('Đã đăng kèo lên Bảng tin cộng đồng.', { action: { label: 'Xem bảng tin', onClick: () => navigate('/feed') } })
    } catch (error) {
      toast.error(error?.message || 'Không đăng được kèo lên bảng tin.')
    } finally {
      setSharingCardId(null)
    }
  }

  // Tải dữ liệu tab mở sẵn từ URL khi vào trang; đổi tab / bộ lọc về sau do handler tự tải
  useEffect(() => {
    if (activeMainTab === 'my_cards') fetchMyCards('all')
    else if (activeMainTab === 'joined') fetchJoinedCards()
    else {
      fetchMyCards('all')
      fetchJoinedCards()
    }
    getMySports()
      .then((serverSports) => setProfileSports(loadProfileRegisteredSports(serverSports)))
      .catch(() => setProfileSports(loadProfileRegisteredSports()))
    getFacilities()
      .then((rawList) => {
        const transformed = (Array.isArray(rawList) ? rawList : [])
          .map(transformFacilityToCourt)
          .filter(Boolean)
        setFacilitiesList(transformed)
      })
      .catch((err) => console.warn('[CommunityFeed] Không tải được danh sách sân:', err))
    getMyTeams()
      .then((teams) => {
        if (Array.isArray(teams)) setMyTeams(teams)
      })
      .catch(() => {})
    // Chỉ chạy một lần khi mở trang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const captainTeams = myTeams.filter((team) => isCaptainOfTeam(team, currentUser?.id))
  const eligibleTeamsForMatch = (match) =>
    captainTeams.filter((team) => !team.isLocked && (!match?.hostTeamId || team.id !== match.hostTeamId))

  const openClaimModal = (match, preferredMode = null) => {
    if (!match) return
    const eligible = eligibleTeamsForMatch(match)
    const shouldUseTeam =
      preferredMode === 'team'
        ? eligible.length > 0
        : preferredMode === 'solo'
        ? false
        : Boolean(match.isTeamMatch && eligible.length > 0)
    setClaimError(null)
    setSelectedClaimSide('any')
    setClaimMode(shouldUseTeam ? 'team' : 'solo')
    setSelectedClaimTeamId(eligible[0]?.id || '')
    setBookingModal(match)
    // Lấy lại số dư thật từ BE mỗi lần mở modal nhận kèo
    getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {})
  }

  // Confirm Slot Claim Handler - 2.6 Người tham gia Bước 2
  const handleConfirmClaim = async () => {
    if (!bookingModal) return

    setIsClaiming(true)
    setClaimError(null)

    // Kèo đội (Team vs Team): chỉ đội trưởng nhận, bằng đội của mình; cả đội được tính vào kèo (BE báo cho thành viên)
    const teamOnly = Boolean(bookingModal.isTeamMatch)
    const claimTeams = eligibleTeamsForMatch(bookingModal)
    if (teamOnly && claimTeams.length === 0) {
      toast.error(TEAM_ONLY_CLAIM_TEXT)
      setIsClaiming(false)
      return
    }
    const claimTeamId = teamOnly || claimMode === 'team' ? selectedClaimTeamId || claimTeams[0]?.id || '' : null
    if ((teamOnly || claimMode === 'team') && !claimTeamId) {
      toast.error('Vui lòng chọn đội đại diện để nhận kèo bằng đội!')
      setIsClaiming(false)
      return
    }

    if (walletBalance < (bookingModal.price || 0)) {
      toast.error('Số dư ví hiện tại không đủ để giữ slot. Vui lòng nạp thêm tiền!')
      setIsClaiming(false)
      return
    }

    try {
      // Gọi API Claim Slot: POST /api/v1/lfgs/{cardId}/claim
      await claimLfgSlot(bookingModal.id, {
        side: bookingModal.sideSize > 0 && !bookingModal.isTeamMatch ? selectedClaimSide : undefined,
        friendIds: [],
        friendPayMode: 'me',
        challengerTeamId: claimTeamId,
      })

      // Image 2: Kèo không cần duyệt: trừ tiền ngay, vào kèo luôn. Kèo cần duyệt: chỉ gửi yêu cầu, tiền bị giữ khi chủ kèo duyệt.
      const isApprovalRequired = Boolean(bookingModal.requireApproval)
      if (!isApprovalRequired) {
        getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {})
      }

      setToastMessage({
        title: isApprovalRequired ? 'Đã Gửi Yêu Cầu Thành Công!' : 'Nhận Suất Thành Công!',
        desc: isApprovalRequired
          ? `Kèo này bật chế độ duyệt. Yêu cầu của bạn đã được gửi tới chủ kèo, tiền cọc sẽ được giữ an toàn khi chủ kèo duyệt.`
          : `Bạn đã vào đội hình trận "${bookingModal.title}". Khoản cọc ${bookingModal.priceDisplay} đã được bảo chứng Escrow.`,
        type: 'success',
      })

      setBookingModal(null)
      loadJoinedCards()
      setLfgReload((value) => value + 1) // kèo vừa nhận có thể đã đủ người: tải lại sàn
      handleTabChange('joined')
    } catch (err) {
      console.error('[CommunityFeed] Lỗi nhận suất:', err)
      // Image 2 spec: "Nhận suất có thể bị từ chối 403 khi điểm Fair Play thấp hơn ngưỡng Admin đặt (mặc định 50/100) hoặc đang bị Admin cấm nhận suất. Hiện nguyên câu message (có điểm hiện tại và ngưỡng)."
      const errMsg = err?.message || 'Không thể nhận suất kèo này. Vui lòng kiểm tra lại.'
      setClaimError(errMsg)
      setToastMessage({
        title: 'Không nhận được suất',
        desc: errMsg,
        type: 'error',
      })
    } finally {
      setIsClaiming(false)
    }
  }

  // Chủ kèo: Duyệt người tham gia - 2.6 Bước 3
  const handleApproveParticipant = async (cardId, userId, participantName) => {
    setActionLoadingId(`${cardId}-${userId}`)
    try {
      await approveLfgParticipant(cardId, userId)
      setToastMessage({
        title: 'Duyệt thành công!',
        desc: `Đã duyệt vận động viên ${participantName} vào kèo ghép. Tiền cọc của người tham gia đã được giữ bảo chứng.`,
        type: 'success',
      })
      loadMyCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi duyệt thành viên',
        desc: err.message || 'Không thể duyệt thành viên.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Chủ kèo: Từ chối người tham gia - 2.6 Bước 3
  const handleRejectParticipant = async (cardId, userId, participantName) => {
    setActionLoadingId(`${cardId}-${userId}`)
    try {
      await rejectLfgParticipant(cardId, userId)
      setToastMessage({
        title: 'Đã từ chối',
        desc: `Đã từ chối yêu cầu tham gia của ${participantName}.`,
        type: 'info',
      })
      loadMyCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi từ chối thành viên',
        desc: err.message || 'Không thể từ chối thành viên.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Chủ kèo: Loại người đã vào kèo - 2.6 Bước 4
  const handleRemoveParticipant = async (cardId, userId, participantName) => {
    if (!(await confirmDialog(`Xác nhận loại ${participantName} khỏi kèo?\n\nChính sách quy định: Hoàn 100% tiền cho họ và mở lại 1 suất trống cho kèo.`))) {
      return
    }
    setActionLoadingId(`${cardId}-${userId}`)
    try {
      await removeLfgParticipant(cardId, userId)
      setToastMessage({
        title: 'Đã loại thành viên',
        desc: `Đã loại ${participantName} khỏi kèo. Hệ thống đã hoàn 100% tiền cho người chơi và mở lại 1 suất trống.`,
        type: 'success',
      })
      loadMyCards()
      setLfgReload((value) => value + 1)
    } catch (err) {
      setToastMessage({
        title: 'Lỗi loại thành viên',
        desc: err.message || 'Không thể loại thành viên.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Chủ kèo: Mở modal hủy kèo - 2.6 Bước 5 (không còn bỏ phiếu; nếu isLocked = true thì hiện cảnh báo phạt dưới 48h)
  const handleOpenCancelModal = (card) => {
    const isLocked = isCardLocked(card)
    setCancelMatchModal({ ...card, isLocked })
    setSelectedCancelReason('')
    setCustomCancelReason('')
    if (card?.id && card?.compensationTotal == null) {
      getLfgById(card.id)
        .then((detail) => {
          if (!detail) return
          setCancelMatchModal((prev) =>
            prev && String(prev.id) === String(card.id)
              ? {
                  ...prev,
                  isLocked: typeof detail.isLocked === 'boolean' ? detail.isLocked : prev.isLocked,
                  hostCancelUntil: detail.hostCancelUntil ?? prev.hostCancelUntil,
                  bookingTotalAmount: detail.bookingTotalAmount ?? prev.bookingTotalAmount,
                  compensationTotal: detail.compensationTotal ?? prev.compensationTotal,
                }
              : prev
          )
        })
        .catch(() => {})
    }
  }

  // Chủ kèo: Xác nhận hủy kèo - 2.6 Bước 5 (POST /api/v1/lfgs/{cardId}/cancel)
  const handleConfirmCancelMatch = async () => {
    if (!cancelMatchModal) return
    const reason = finalReason(selectedCancelReason, customCancelReason)
    if (!reason) {
      toast.warning('Vui lòng chọn hoặc nhập lý do hủy kèo.')
      return
    }

    setActionLoadingId(cancelMatchModal.id)
    try {
      const res = await cancelLfg(cancelMatchModal.id, { reason })
      const isLockedCancel =
        typeof res?.isLocked === 'boolean' ? res.isLocked : Boolean(cancelMatchModal.isLocked)
      const compValue = res?.compensationTotal ?? cancelMatchModal.compensationTotal
      const compFormatted =
        compValue != null && compValue !== '' && Number.isFinite(Number(compValue))
          ? new Intl.NumberFormat('vi-VN').format(Number(compValue))
          : null

      if (isLockedCancel) {
        const extraSummary = describeLfgCancelResult(res)
        setToastMessage({
          title: `Đã Hủy Kèo Sát Giờ (< ${LOCK_H}h)`,
          desc: compFormatted != null
            ? `Hủy kèo sát giờ: Bạn bị trừ ${compFormatted} Điểm (${LATE_PCT}% tiền sân) bồi thường và -${LATE_FP} điểm FairPlay.`
            : extraSummary
              ? `Hủy kèo sát giờ: Bạn bị trừ ${LATE_PCT}% tiền sân bồi thường và -${LATE_FP} điểm FairPlay. ${extraSummary}`
              : `Hủy kèo sát giờ: Bạn bị trừ ${LATE_PCT}% tiền sân bồi thường và -${LATE_FP} điểm FairPlay.`,
          type: 'error',
        })
      } else {
        const summary = describeLfgCancelResult(res)
        setToastMessage({
          title: 'Hủy Kèo Ghép Thành Công',
          desc: summary
            ? `Đã hủy kèo. ${summary}`
            : 'Đã hủy kèo. Hoàn 100% Điểm cho người tham gia; tiền sân của chủ kèo hoàn theo chính sách hủy đặt sân.',
          type: 'success',
        })
      }
      setCancelMatchModal(null)
      getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {})
      window.dispatchEvent(new Event('escrow_balance_updated'))
      window.dispatchEvent(new Event('player-ratings-updated'))
      loadMyCards()
      setLfgReload((value) => value + 1) // kèo đã hủy phải biến khỏi sàn
    } catch (err) {
      setToastMessage({
        title: 'Lỗi hủy kèo',
        desc: err.message || 'Không thể hủy kèo ghép.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Người tham gia: Mở modal rời kèo - 2.6 Bước 4
  const handleOpenLeaveModal = (card) => {
    setLeaveMatchModal(card)
    setLeaveReason('')
    setLeaveReasonPick('')
  }

  // Người tham gia: Xác nhận rời kèo - 2.6 Bước 4
  const handleConfirmLeaveMatch = async () => {
    if (!leaveMatchModal) return

    // Kiểm tra quy định: Không rời được trong vòng 2 giờ trước giờ chơi
    if (leaveMatchModal.startTime) {
      const matchTime = new Date(leaveMatchModal.startTime).getTime()
      const now = Date.now()
      const diffHours = (matchTime - now) / (1000 * 60 * 60)
      if (diffHours < 2 && diffHours > 0) {
        toast.error('Quy định hệ thống: Không thể rời kèo trong vòng 2 giờ trước giờ chơi!')
        return
      }
    }

    setActionLoadingId(leaveMatchModal.id)
    try {
      await leaveLfg(leaveMatchModal.id, { reason: finalReason(leaveReasonPick, leaveReason) || undefined })
      setToastMessage({
        title: 'Rời Kèo Thành Công',
        desc: 'Đã rời kèo (hoàn 100% tiền) hoặc rút yêu cầu đang chờ.',
        type: 'success',
      })
      setLeaveMatchModal(null)
      loadJoinedCards()
      setLfgReload((value) => value + 1) // mở lại 1 suất trên sàn
    } catch (err) {
      setToastMessage({
        title: 'Lỗi rời kèo',
        desc: err.message || 'Không thể rời kèo (Lưu ý: Không rời được trong vòng 2 giờ trước giờ chơi).',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Mở vé QR Check-in - 2.6 Bước 3 & 2.7 Bước 1
  // Người tham gia: GET /lfgs/{cardId}/qr-ticket. Chủ kèo: BE trả 400, phải dùng vé của đơn đặt sân
  // GET /bookings/{bookingId}/qr-ticket. Sân / giờ lấy từ vé BE trả về, không dùng giá trị mẫu.
  const handleOpenQrTicket = async (cardId, card = {}, { asHost = false } = {}) => {
    const timeOf = (start, end) =>
      start ? `${vnClock(start)} - ${vnClock(end)}, ${new Date(start).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : '—'
    setQrTicketModal({
      isOpen: true,
      isLoading: true,
      cardId,
      title: card.description || card.title || `Kèo ${card.sportName || 'ghép trận'}`,
      courtName: [card.courtName, card.facilityName].filter(Boolean).join(' • ') || '—',
      time: timeOf(card.startTime, card.endTime),
      ticketCode: `LFG-${String(cardId).slice(0, 8).toUpperCase()}`,
      isCheckedIn: false,
      qrCode: null,
    })

    try {
      const res = asHost && card.bookingId ? await getBookingQrTicket(card.bookingId) : await getLfgQrTicket(cardId)
      setQrTicketModal((prev) => ({
        ...prev,
        isLoading: false,
        ticketData: res,
        qrCode: res?.qrCode || res?.code || (typeof res === 'string' ? res : null),
        courtName: [res?.courtName, res?.facilityName].filter(Boolean).join(' • ') || prev.courtName,
        time: res?.startTime ? timeOf(res.startTime, res.endTime) : prev.time,
        isCheckedIn: Boolean(res?.isCheckedIn),
      }))
    } catch (err) {
      // Không tạo mã giả: mã không có trên hệ thống thì chủ sân quét sẽ báo lỗi.
      toast.error(err?.message || 'Không lấy được vé QR của kèo.')
      setQrTicketModal((prev) => ({
        ...prev,
        isLoading: false,
        qrCode: null,
      }))
    }
  }

  // Toggle time slot selection
  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(slot)) {
        if (prev.length === 1) return prev // keep at least 1 slot selected
        return prev.filter((s) => s !== slot)
      }
      return [...prev, slot]
    })
  }

  // Reset filters
  const handleResetFilters = () => {
    selectAllSports()
    setSelectedTimeSlots(['morning', 'afternoon', 'evening'])
    setSelectedSkillLevel('all')
    setSelectedDistance('all')
    if (selectedFormat !== 'all') setIsLoadingLfgs(true)
    setSelectedFormat('all')
    setFilterMinFairPlay(false)

  }

  // Kèo đã tham gia: BE trả cả kèo đã hủy và kèo mình đã rời / bị loại / bị từ chối (myStatus).
  // Mặc định ẩn các kèo này, cho bấm xem lại; kèo còn hiệu lực xếp trước.
  const [showInactiveJoined, setShowInactiveJoined] = useState(false)
  const myStatusOf = (card) => String(card.myStatus || card.claimStatus || '').toUpperCase()
  const isJoinedInactive = (card) =>
    String(card.status || '').toUpperCase() === 'CANCELLED' || ['REJECTED', 'LEFT', 'REMOVED', 'CANCELLED'].includes(myStatusOf(card))
  const inactiveJoinedCount = joinedLfgCards.filter(isJoinedInactive).length
  // Sắp xếp kèo đã tham gia: giờ chơi gần nhất / vừa tham gia (myJoinedAt) / kèo tạo mới nhất (createdAt)
  const [joinedSort, setJoinedSort] = useState('play_time')
  const joinedOrder = (a, b) =>
    joinedSort === 'joined' ? new Date(b.myJoinedAt || 0) - new Date(a.myJoinedAt || 0)
      : joinedSort === 'created' ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      : new Date(a.startTime) - new Date(b.startTime)
  const visibleJoinedCards = joinedLfgCards
    .filter((card) => showInactiveJoined || !isJoinedInactive(card))
    .sort((a, b) => Number(isJoinedInactive(a)) - Number(isJoinedInactive(b)) || joinedOrder(a, b))

  // Filtered matches (ưu tiên hiển thị các kèo gần vị trí hồ sơ người chơi lên đầu)
  // Trích xuất thói quen ghép trận & tính toán bộ đề xuất cá nhân hóa (3 hạng mục: Sàn ghép trận, Kèo ghép, Bảng tin cộng đồng)
  const playerHabits = extractPlayerHabits({ myLfgCards, joinedLfgCards })
  const effectiveSkillFilter = levelFilter !== 'all' ? levelFilter : selectedSkillLevel
  const suggestionData = buildPersonalizedLfgSuggestions({
    userProfileLocation,
    profileSports,
    habits: playerHabits,
    learnedDesires,
    facilities: facilitiesList,
    matches,
    activeFilters: {
      sport: activeSportFilter === 'all' ? 'profile_matched' : activeSportFilter,
      timeSlots: selectedTimeSlots,
      skillLevel: effectiveSkillFilter,
      keyword: desireSearchKeyword,
      rangeId: activeRangeId,
    },
    includeLearnedDesires,
  })

  // Chọn bộ lọc môn thể thao kèm cơ chế tự học nhu cầu mới của người chơi
  const handleSelectSportFilterWithLearning = (sportKey) => {
    if (!sportKey || sportKey === 'all' || sportKey === 'profile_matched') {
      selectAllSports()
      return
    }
    selectOnlySport(sportKey)
    const updated = recordNewPlayerDesire({
      sportKey,
      source: 'Chọn bộ lọc môn thể thao mong muốn trên Sàn Ghép Trận',
    })
    setLearnedDesires(updated)
  }

  // Chọn bộ lọc trình độ kèm cơ chế tự học nhu cầu mới
  const handleLevelFilterWithLearning = (newLevel) => {
    setLevelFilter(newLevel)
    if (newLevel && newLevel !== 'all') {
      const updated = recordNewPlayerDesire({
        skillLevel: newLevel,
        source: 'Chọn bộ lọc trình độ mong muốn',
      })
      setLearnedDesires(updated)
    }
  }

  // Danh sách kèo hiển thị (lọc theo sở thích Profile + Thói quen + Mong muốn & sắp xếp theo khoảng cách từ gần đến xa)
  const allowedSportKeySet = new Set(
    Array.isArray(suggestionData?.allowedSportKeys)
      ? suggestionData.allowedSportKeys
      : suggestionData?.allowedSportKeys instanceof Set
      ? Array.from(suggestionData.allowedSportKeys)
      : []
  )

  const filteredMatches = matches
    .map((m) => {
      const distanceKm =
        m?.distanceKm != null && m.distanceKm !== '' && Number.isFinite(Number(m.distanceKm))
          ? Number(m.distanceKm)
          : null
      const rangeInfo = getDistanceRangeInfo(distanceKm)
      return {
        ...m,
        distanceKm,
        rangeInfo,
      }
    })
    .filter((m) => {
      if (activeSportFilter === 'profile_matched') {
        if (allowedSportKeySet.size > 0 && !allowedSportKeySet.has(m.sport)) return false
      } else if (!isAllActive && selectedSports.length > 0) {
        if (!selectedSports.includes(m.sport)) return false
      }
      if (m.timeSlot && !selectedTimeSlots.includes(m.timeSlot)) return false
      if (effectiveSkillFilter && effectiveSkillFilter !== 'all') {
        const matchSkill = normalizeSkillKey(m.levelTag)
        const targetSkill = normalizeSkillKey(effectiveSkillFilter)
        if (matchSkill && targetSkill && matchSkill !== targetSkill) return false
      }
      if (activeRangeId && activeRangeId !== 'all' && (m.rangeInfo?.id || m.rangeInfo?.key) !== activeRangeId) return false
      if ((distanceFilter === '5km' || selectedDistance === '5km') && (m.distanceKm == null || m.distanceKm > 5)) return false
      if ((distanceFilter === '10km' || selectedDistance === '10km') && (m.distanceKm == null || m.distanceKm > 10)) return false
      if ((distanceFilter === 'district' || selectedDistance === '3km') && (m.distanceKm == null || m.distanceKm > 3.5)) return false
      if (selectedVenueFilter) {
        const sameId = m.facilityId && String(m.facilityId) === String(selectedVenueFilter.id)
        const sameName = (m.location || '').toLowerCase().includes((selectedVenueFilter.name || '').toLowerCase())
        if (!sameId && !sameName) return false
      }
      if (desireSearchKeyword.trim()) {
        const kw = desireSearchKeyword.trim().toLowerCase()
        const hay = [m.title, m.location, m.groupDesc, m.sportBadge, m.levelTag].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(kw)) return false
      }
      // Chỉ kèo có chủ kèo Fair Play ≥ 90 (theo điểm BE trả; chưa có điểm thì không tính là đạt)
      if (filterMinFairPlay && !(Number(m.hostFairPlayScore) >= 90)) return false
      return true
    })
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))

  void matches
    .filter((m) => {
      if (!isAllActive && selectedSports.length > 0 && !selectedSports.includes(m.sport)) return false
      if (m.timeSlot && !selectedTimeSlots.includes(m.timeSlot)) return false
      if (levelFilter !== 'all' && m.skillTag && m.skillTag !== levelFilter) return false
      return true
    })
    .sort((a, b) => {
      const aNear = isNearMe(a) ? 1 : 0
      const bNear = isNearMe(b) ? 1 : 0
      return bNear - aNear
    })

  return (
    <div className="w-full min-h-screen text-[#1E293B] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-8 z-50 flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl shadow-2xl border animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 border-rose-400/60'
              : 'bg-[#1C3524] border-[#34D399]/40'
          }`}
        >
          <span
            className={`material-symbols-outlined text-2xl ${
              toastMessage.type === 'error' ? 'text-rose-300' : 'text-[#34D399]'
            }`}
          >
            {toastMessage.type === 'error' ? 'warning' : 'check_circle'}
          </span>
          <div>
            <p className="font-bold text-sm">{toastMessage.title}</p>
            <p className={`text-xs ${toastMessage.type === 'error' ? 'text-rose-100' : 'text-[#A7F3D0]'}`}>
              {toastMessage.desc}
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="snx-page">
        {/* Thanh trạng thái: vị trí ghép (từ hồ sơ) và số kèo đang mở thật */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-[11px] border border-[#FDE68A]">
            <span className="material-symbols-outlined text-[13px] text-[#D97706]">location_on</span>
            <span>Vị trí ghép: {userLocationLabel}</span>
          </div>
          {!isLoadingLfgs && !lfgListError && (
            <span className="text-gray-500 font-medium text-[12px]">{matches.length} kèo đang mở</span>
          )}
        </div>

        {/* Title & Actions */}
        <div className="snx-page-header">
          <div>
            <h1 className="snx-page-title">
              Sàn Ghép Trận &amp; Tranh Slot
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Bộ Lọc Nâng Cao Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#334155] font-semibold text-sm transition-all shadow-sm border border-gray-200/60 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#475569]">tune</span>
              <span>Bộ Lọc Nâng Cao</span>
            </button>

            {/* Đăng Kèo Ghép Mới Button */}
            <button
              onClick={() => navigate('/create-match')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(59,104,23,0.35)] cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Đăng Kèo Ghép Mới</span>
            </button>
          </div>
        </div>

        {/* ================= 3-TAB MAIN NAVIGATION (2.6 & 2.7) ================= */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200/80 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'all'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            <span>Sàn Ghép Trận (Tất Cả)</span>
          </button>

          <button
            onClick={() => handleTabChange('my_cards')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'my_cards'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            <span>Kèo Tôi Đã Tạo (Chủ Kèo)</span>
            {myLfgCards.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeMainTab === 'my_cards' ? 'bg-white text-[#3B6817]' : 'bg-[#EAF7EE] text-[#15803D]'}`}>
                {myLfgCards.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('joined')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'joined'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            <span>Kèo Tôi Đã Tham Gia</span>
            {joinedLfgCards.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeMainTab === 'joined' ? 'bg-white text-[#3B6817]' : 'bg-[#EAF7EE] text-[#15803D]'}`}>
                {joinedLfgCards.length}
              </span>
            )}
          </button>

        </div>

        {/* Filter Bar Chips (Hiển thị khi ở Tab Sàn Ghép Trận) */}
        {activeMainTab === 'all' && (
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-gray-200/80 shadow-sm mb-7 overflow-x-auto scrollbar-none flex-wrap">
          {selectedVenueFilter && (
            <button
              type="button"
              onClick={() => setSelectedVenueFilter(null)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shrink-0 cursor-pointer hover:bg-[#FDE68A]"
            >
              <span className="material-symbols-outlined text-[15px]">stadium</span>
              <span>Sân: {selectedVenueFilter.name}</span>
              <span className="ml-1 font-black">✕</span>
            </button>
          )}

          {/* Tất Cả Thể Thao */}
          <button
            onClick={() => selectAllSports()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              isAllActive
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">✨</span>
            <span>Tất Cả Thể Thao</span>
          </button>

          {/* Các môn lấy từ GET /api/v1/master-data/sports */}
          {Object.values(SPORT_CATALOG).map((s) => (
            <button
              key={s.key}
              onClick={() => handleSelectSportFilterWithLearning(s.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                !isAllActive && selectedSports.includes(s.key)
                  ? 'bg-[#3B6817] text-white shadow-sm'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-[15px] leading-none">{s.emoji}</span>
              <span>{s.name}</span>
            </button>
          ))}

          {/* Dropdown Trình độ */}
          <div className="relative shrink-0">
            <select
              value={levelFilter}
              onChange={(e) => handleLevelFilterWithLearning(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-gray-200 cursor-pointer focus:outline-none whitespace-nowrap"
            >
              <option value="all">Trình độ: Tất Cả Trình Độ</option>
              <option value="BEGINNER">Mới chơi</option>
              <option value="INTERMEDIATE">Trung bình</option>
              <option value="ADVANCED">Khá / Nâng cao</option>
              <option value="PROFESSIONAL">Chuyên nghiệp</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Dropdown Khoảng cách */}
          <div className="relative shrink-0">
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-gray-200 cursor-pointer focus:outline-none whitespace-nowrap"
            >
              <option value="all">Mọi khoảng cách</option>
              <option value="5km">Dưới 5 km</option>
              <option value="10km">Dưới 10 km</option>
              <option value="district">Gần bạn (dưới 3.5 km)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>
        </div>
        )}

        {/* 2-Column Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* ================= LEFT COLUMN: MATCHES FEED ================= */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activeMainTab === 'all' && (
              <>
            {/* Kèo phù hợp với bạn: GET /api/v1/lfgs/recommended (theo khảo sát người chơi) */}
            <RecommendedLfgSection />

            {/* Flash Queue Banner */}
            <div className="bg-[#EAF7E8] border border-[#C6E7BE] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#3B6817] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">sensors</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Kèo Tranh Slot Nóng (Flash Queue)
                  </h3>
                  <p className="text-xs text-[#4A6B45] mt-0.5">
                    Slot giải phóng tức thì khi có thành viên xin rút hoặc trễ giờ check-in {GRACE_MIN}p.
                  </p>
                </div>
              </div>
            </div>

            {/* Match Cards List */}
            {lfgListError ? (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                <p className="font-bold text-red-700">{lfgListError}</p>
                <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" style={{ marginTop: 10 }} onClick={() => {
                  setIsLoadingLfgs(true)
                  setLfgListError('')
                  setLfgReload((value) => value + 1)
                }}>Thử lại</button>
              </div>
            ) : isLoadingLfgs && matches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-sm text-gray-500">Đang tải danh sách kèo…</div>
            ) : filteredMatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                  search_off
                </span>
                <p className="font-bold text-gray-700">
                  {matches.length === 0 ? 'Hiện chưa có kèo nào đang mở' : 'Chưa tìm thấy kèo phù hợp bộ lọc'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {matches.length === 0 ? 'Vui lòng quay lại sau hoặc tự đăng kèo mới ngay!' : 'Vui lòng chọn bộ lọc khác hoặc tự đăng kèo mới ngay!'}
                </p>
                {/* BE không đưa lên sàn: kèo của chính bạn, kèo đã đủ người, kèo đã qua giờ chơi */}
                <p className="text-[11px] text-gray-400 mt-2">
                  Sàn chỉ hiện kèo của người khác còn suất và chưa tới giờ chơi. Kèo bạn tạo nằm ở tab{' '}
                  <button type="button" className="font-bold text-[#15803D] underline" onClick={() => handleTabChange('my_cards')}>Kèo của tôi</button>.
                </p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Left: Court Image with Overlays */}
                  <div className="sm:w-[40%] relative min-h-[220px] sm:min-h-[250px] overflow-hidden group">
                    <img
                      src={match.image}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top-left Sport Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-[#134E4A]/90 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                        <span className="text-[13px] leading-none">
                          {sportMetaOf(match.sport).emoji}
                        </span>
                        {match.sportBadge}
                      </span>
                    </div>

                    {/* Bottom-left Equipment / Surface Tag */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                        {match.sport === 'badminton' ? (
                          <>
                            <span className="material-symbols-outlined text-[13px] text-green-300">
                              sports_tennis
                            </span>
                            {match.subBadge}
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[13px] text-green-400 font-bold">
                              check
                            </span>
                            {match.subBadge}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right: Match Details */}
                  <div className="sm:w-[60%] p-5 sm:p-6 flex flex-col justify-between gap-4">
                    <div>
                      {/* Top Badges & Time */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                              match.sport === 'badminton'
                                ? 'bg-[#EFF6FF] text-[#1E40AF]'
                                : 'bg-[#EEF2FF] text-[#4338CA]'
                            }`}
                          >
                            {match.levelTag}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                              match.isFlashClaim
                                ? 'bg-[#FEE2E2] text-[#DC2626]'
                                : 'bg-[#E0F2FE] text-[#0369A1]'
                            }`}
                          >
                            {match.slotTag}
                          </span>
                          {match.isTeamMatch && (
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 whitespace-nowrap shrink-0">
                              Team vs Team
                            </span>
                          )}
                          {isNearMe(match) && (
                            <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0">
                              <span className="material-symbols-outlined text-[13px] text-[#16A34A]">near_me</span>
                              {match.distanceKm != null ? `Gần bạn (~${Number(match.distanceKm).toFixed(1)} km)` : `Gần bạn (${userProfileLocation})`}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenMatchDetail(match)}
                          title="Xem toàn bộ thông tin chi tiết về kèo này"
                          aria-label="Xem toàn bộ thông tin chi tiết về kèo này"
                          className="w-8 h-8 rounded-full bg-gray-100/90 hover:bg-[#EAF7EE] text-gray-600 hover:text-[#15803D] border border-gray-200/80 hover:border-[#86EFAC] flex items-center justify-center transition-all shrink-0 ml-auto cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>
                      </div>

                      {/* Title */}
                      <h2
                        onClick={() => handleOpenMatchDetail(match)}
                        className="text-[16px] font-bold text-[#111827] leading-snug hover:text-[#3B6817] transition-colors cursor-pointer truncate"
                        title={match.title}
                      >
                        {match.title}
                      </h2>

                      {/* Team vs Team Matchup Strip (hiển thị 2 tên đội thay vì cá nhân) */}
                      {match.isTeamMatch && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#F0FDF4] via-white to-[#EFF6FF] border border-[#BBF7D0] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="material-symbols-outlined text-[16px] text-[#15803D] shrink-0">shield</span>
                            <span className="font-extrabold text-xs text-[#14532D] truncate">
                              {match.hostTeamName || 'Đội chủ kèo'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-[#111827] text-white text-[10px] font-black tracking-wider shrink-0">
                            VS
                          </span>
                          <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
                            <span className={`font-extrabold text-xs truncate ${match.challengerTeamName ? 'text-[#1E40AF]' : 'text-amber-700 italic'}`}>
                              {match.challengerTeamName || 'Đang tìm đội đối thủ'}
                            </span>
                            <span className="material-symbols-outlined text-[16px] text-[#1E40AF] shrink-0">swords</span>
                          </div>
                        </div>
                      )}

                      {/* Location & Group Info */}
                      <div className="flex flex-col gap-1 mt-2.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 min-w-0" title={match.location}>
                          <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0">
                            location_on
                          </span>
                          <span className="truncate">{match.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0" title={match.groupDesc}>
                          <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0">
                            group
                          </span>
                          <span className="truncate">{match.groupDesc}</span>
                        </div>
                      </div>

                      {/* Rosters / Slots Row */}
                      <div className="flex items-center justify-between gap-2.5 mt-3 pt-2">
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          {(match.roster || []).map((player, idx) => (
                            <div
                              key={idx}
                              title={player.name}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold border-2 border-white shadow-xs ${
                                player.bg === 'empty'
                                  ? 'bg-gray-100 text-gray-400 border-dashed border-gray-300'
                                  : 'text-white'
                              }`}
                              style={{
                                backgroundColor:
                                  player.bg !== 'empty' ? player.bg : undefined,
                              }}
                            >
                              {player.initials}
                            </div>
                          ))}
                        </div>

                        {match.urgencyText ? (
                          <span className="text-xs text-[#B45309] font-medium flex items-center gap-1 whitespace-nowrap shrink-0">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {match.urgencyText}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium whitespace-nowrap shrink-0">
                            Đã ghép: {match.currentSlots}/{match.totalSlots} vị trí
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price & Action */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
                      <div className="whitespace-nowrap shrink-0">
                        <span className="text-[11px] text-gray-500 block">
                          {match.priceLabel}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[20px] font-black text-[#111827]">
                            {match.priceDisplay}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">/người</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {eligibleTeamsForMatch(match).length > 0 && (
                          <button
                            type="button"
                            onClick={() => openClaimModal(match, 'team')}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">groups</span>
                            <span>Nhận kèo bằng Đội</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openClaimModal(match)}
                          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                            match.isFlashClaim
                              ? 'bg-[#3B6817] hover:bg-[#315613] shadow-[0_4px_14px_rgba(59,104,23,0.35)]'
                              : 'bg-[#3B6817] hover:bg-[#315613] shadow-[0_4px_14px_rgba(59,104,23,0.35)]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]">bolt</span>
                          <span>{match.buttonText}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            </>
            )}

            {/* TAB 2: KÈO TÔI ĐÃ TẠO (CHỦ KÈO) - 2.6 CHỦ KÈO */}
            {activeMainTab === 'my_cards' && (
              <div className="flex flex-col gap-5">
                {/* Status Sub-filter Bar (OPEN / FILLED / CANCELLED) */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Lọc trạng thái:</span>
                    {[
                      { key: 'all', label: 'Tất Cả' },
                      { key: 'OPEN', label: 'Đang Tuyển (OPEN)' },
                      { key: 'FILLED', label: 'Đã Đủ Người (FILLED)' },
                      { key: 'CANCELLED', label: 'Đã Hủy (CANCELLED)' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => {
                          setMyStatusFilter(st.key)
                          loadMyCards(st.key)
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          myStatusFilter === st.key
                            ? 'bg-[#3B6817] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/create-match')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#EAF7EE] text-[#15803D] hover:bg-[#DCFCE7] text-xs font-black border border-[#86EFAC] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Tạo Kèo Mới</span>
                  </button>
                </div>

                {/* Policy Notice Box for Host */}
                <div className="bg-[#FAFBF9] rounded-2xl border border-gray-200 p-4 text-xs text-gray-600 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#3B6817] text-[18px] shrink-0 mt-0.5">info</span>
                  <div>
                    <span className="font-bold text-[#111827]">Quy chế Chủ Kèo (2.6):</span> Hệ thống tự đặt ca sân và trừ 100% tiền sân từ ví chủ kèo. Khi hủy kèo trước giờ chơi từ {LOCK_H} giờ trở lên: mọi người được hoàn 100% Điểm, chủ kèo bị trừ {EARLY_FP} điểm FairPlay. Nếu hủy dưới {LOCK_H} giờ trước giờ chơi: người tham gia được hoàn 100% Điểm và chủ kèo bị trừ {LATE_PCT}% tiền sân bồi thường cùng -{LATE_FP} điểm FairPlay.
                  </div>
                </div>

                {isLoadingMyCards ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#3B6817] animate-spin">progress_activity</span>
                    <p className="text-sm font-bold text-gray-700">Đang tải danh sách kèo đã tạo...</p>
                  </div>
                ) : myLfgCards.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                      <span className="material-symbols-outlined text-3xl">sports_score</span>
                    </div>
                    <p className="font-black text-gray-800 text-base">Bạn chưa tạo kèo ghép nào</p>
                    <p className="text-xs text-gray-500 max-w-md">
                      Hãy tạo ngay kèo ghép đầu tiên để hệ thống tự động tìm bạn chơi phù hợp trình độ và chia đều tiền sân qua Smart Escrow!
                    </p>
                    <button
                      onClick={() => navigate('/create-match')}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      Đăng Kèo Ghép Ngay
                    </button>
                  </div>
                ) : (
                  myLfgCards.map((card) => {
                    const statusColorMap = {
                      PENDING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      FILLED: 'bg-blue-50 text-blue-700 border-blue-200',
                      CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
                    }
                    const statusTextMap = {
                      PENDING: 'Đang Tuyển',
                      OPEN: 'Đang Tuyển',
                      FILLED: 'Đã Đủ Người',
                      CANCELLED: 'Đã Hủy',
                    }
                    // Kèo còn thao tác được: chưa hủy và chưa tới giờ chơi
                    const cardActive = card.status !== 'CANCELLED' && !card.isStarted
                    const acceptedCount = card.acceptedCount ?? (card.participants || []).filter((p) => p.status === 'ACCEPTED').length
                    const cardTeamInfo = extractLfgTeamInfo(card)

                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all"
                      >
                        {/* Header Row: Title, Status, Approval Mode */}
                        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 flex-wrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${statusColorMap[card.status] || 'bg-gray-100 text-gray-700'}`}>
                                {statusTextMap[card.status] || card.status}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#1E40AF]">
                                {card.sportName || card.sport?.toUpperCase() || 'THỂ THAO'}
                              </span>
                              {cardTeamInfo.isTeamMatch && (
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-purple-50 text-purple-800 border border-purple-200">
                                  {cardTeamInfo.hostTeamName || 'Đội chủ kèo'} vs {cardTeamInfo.challengerTeamName || 'Chờ đối thủ'}
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {card.requireApproval ? '🛡️ Cần Duyệt Người' : '⚡ Tự Động Vào'}
                              </span>
                            </div>
                            <h3 className="font-black text-base text-[#111827] mt-1">{card.description || card.title || `Kèo ${card.sportName || 'ghép trận'}`}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#3B6817]">location_on</span>
                              <span>{card.courtName} • {card.facilityAddress}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-gray-400 block font-semibold">Giá mỗi người</span>
                            <span className="text-lg font-black text-[#15803D]">
                              {card.pricePerPerson ? `${new Intl.NumberFormat('vi-VN').format(card.pricePerPerson)} Điểm` : 'Chia đều ca'}
                            </span>
                          </div>
                        </div>

                        {/* Mid Row: Participants List (2.6 Bước 3 & Bước 4) */}
                        <div className="bg-[#FAFBF9] rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-gray-800 uppercase tracking-wide">
                              Thành Viên: {acceptedCount} đã vào / cần {card.totalSlots ?? '—'}{card.pendingCount ? ` • ${card.pendingCount} chờ duyệt` : ''}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {card.status === 'CANCELLED' ? 'Kèo đã hủy' : card.isStarted ? 'Đã tới giờ chơi' : card.status === 'FILLED' ? 'Đã đủ người' : `Còn ${card.remainingSlots ?? '—'} suất`}
                            </span>
                          </div>

                          {(!card.participants || card.participants.length === 0) ? (
                            <p className="text-xs text-gray-400 italic py-2">Chưa có người chơi xin vào kèo này.</p>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              {card.participants.map((p) => {
                                const isPending = p.status === 'PENDING'
                                const isInactive = !['PENDING', 'ACCEPTED'].includes(p.status)
                                const loadingKey = `${card.id}-${p.userId}`
                                const isLoadingThis = actionLoadingId === loadingKey

                                return (
                                  <div
                                    key={p.userId}
                                    className={`p-2.5 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3 flex-wrap ${isInactive ? 'bg-gray-50 opacity-70' : 'bg-white'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {p.avatar ? (
                                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                      ) : (
                                        <span className="w-9 h-9 rounded-full bg-[#EAF7EE] text-[#15803D] text-xs font-black flex items-center justify-center border border-gray-200">{String(p.name || '?').slice(0, 2).toUpperCase()}</span>
                                      )}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-xs text-[#111827]">{p.name}</span>
                                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-[#EAF7EE] text-[#15803D]">
                                            Fair Play {p.fairPlayScore ?? '—'}
                                          </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 block">
                                          Trạng thái:{' '}
                                          <strong className={isPending ? 'text-amber-600' : isInactive ? 'text-gray-500' : 'text-emerald-700'}>
                                            {PARTICIPANT_STATUS_TEXT[p.status] || p.status || '—'}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>

                                    {/* Actions for Participant */}
                                    <div className="flex items-center gap-2">
                                      {/* Bước 3: Approve / Reject (chỉ khi requireApproval = true và pending) */}
                                      {isInactive || !cardActive ? null : isPending ? (
                                        <>
                                          <button
                                            disabled={isLoadingThis}
                                            onClick={() => handleApproveParticipant(card.id, p.userId, p.name)}
                                            className="px-3 py-1.5 rounded-lg bg-[#3B6817] hover:bg-[#315613] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">check</span>
                                            <span>Duyệt</span>
                                          </button>
                                          <button
                                            disabled={isLoadingThis}
                                            onClick={() => handleRejectParticipant(card.id, p.userId, p.name)}
                                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">close</span>
                                            <span>Từ chối</span>
                                          </button>
                                        </>
                                      ) : (
                                        /* Bước 4: Loại người đã vào kèo (hoàn 100% tiền, mở lại 1 suất) */
                                        card.status !== 'CANCELLED' && (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              disabled={isLoadingThis}
                                              onClick={() => handleRemoveParticipant(card.id, p.userId, p.name)}
                                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer disabled:opacity-50"
                                              title="Hoàn 100% tiền cho họ và mở lại 1 suất trống"
                                            >
                                              <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                              <span>Loại</span>
                                            </button>
                                            <button
                                              disabled={isLoadingThis}
                                              onClick={() => handleRemoveGroupFriend(card.id, p.userId, p.name)}
                                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1 border border-amber-200 cursor-pointer disabled:opacity-50"
                                              title="Xóa bạn khỏi nhóm"
                                            >
                                              <span className="material-symbols-outlined text-[14px]">group_remove</span>
                                              <span>Xóa bạn nhóm</span>
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 flex-wrap">
                          <span className="text-xs text-gray-500 font-medium">
                            Giờ chơi: <strong>{card.startTime ? new Date(card.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</strong>
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Xem chi tiết kèo: GET /api/v1/lfgs/{cardId} */}
                            <button
                              onClick={() => setDetailCardId(card.id)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-gray-300"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>Xem chi tiết</span>
                            </button>

                            {/* Sửa kèo: PUT /api/v1/lfgs/{cardId} */}
                            {cardActive && (
                              <button
                                onClick={() => navigate(`/create-match?cardId=${card.id}&mode=edit`)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span>Sửa Kèo</span>
                              </button>
                            )}

                            {/* Chia sẻ kèo còn suất lên Bảng tin cộng đồng */}
                            {cardActive && card.status !== 'FILLED' && Number(card.remainingSlots ?? card.slotsNeeded) > 0 && (
                              <button
                                onClick={() => handleShareToFeed(card)}
                                disabled={sharingCardId === card.id}
                                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-sky-200 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-[16px]">share</span>
                                <span>{sharingCardId === card.id ? 'Đang đăng…' : 'Đăng lên Bảng tin'}</span>
                              </button>
                            )}

                            {/* Mở vé QR Check-in (2.7 Bước 1): kèo đã hủy thì không còn vé */}
                            {card.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleOpenQrTicket(card.id, card, { asHost: true })}
                              className="px-4 py-2 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
                              <span>Vé QR Check-in</span>
                            </button>
                            )}

                            {/* Hủy kèo đơn phương (POST /lfgs/{id}/cancel): dưới 48h (isLocked = true) chịu phạt bồi thường & Fair Play; BE chặn khi đã có người check-in */}
                            {cardActive && (
                              <button
                                onClick={() => handleOpenCancelModal(card)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                                  isCardLocked(card)
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[17px]">cancel</span>
                                <span>Hủy Kèo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* TAB 3: KÈO TÔI ĐÃ THAM GIA (NGƯỜI THAM GIA) - 2.6 */}
            {activeMainTab === 'joined' && (
              <div className="flex flex-col gap-5">
                {/* Notice Box for Participants */}
                <div className="bg-[#EAF7EE] rounded-2xl border border-[#C6E7BE] p-4 text-xs text-[#1C3524] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">verified_user</span>
                  <div>
                    <span className="font-bold">Quy chế Người Tham Gia (2.6):</span> Tiền cọc được giữ an toàn trong ví Escrow của bạn và chỉ giải ngân cho chủ kèo khi check-in QR tại sân hoặc sau giờ chơi. Rời kèo trước giờ chơi từ {LOCK_H} giờ trở lên được hoàn 100% Điểm, sau mốc này không được hoàn (Lưu ý: Không được rời trong vòng {LEAVE_BLOCK_H} giờ trước giờ chơi).
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    Sắp xếp
                    <select
                      value={joinedSort}
                      onChange={(e) => setJoinedSort(e.target.value)}
                      className="px-2 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-700 text-xs font-bold cursor-pointer"
                    >
                      <option value="play_time">Giờ chơi gần nhất</option>
                      <option value="joined">Vừa tham gia</option>
                      <option value="created">Kèo tạo mới nhất</option>
                    </select>
                  </label>
                  {!isLoadingJoined && inactiveJoinedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowInactiveJoined((v) => !v)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-700 text-xs font-bold cursor-pointer hover:bg-gray-50"
                    >
                      {showInactiveJoined ? 'Ẩn' : 'Hiện'} kèo đã hủy / đã rời ({inactiveJoinedCount})
                    </button>
                  )}
                </div>

                {isLoadingJoined ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#3B6817] animate-spin">progress_activity</span>
                    <p className="text-sm font-bold text-gray-700">Đang tải danh sách kèo đã tham gia...</p>
                  </div>
                ) : visibleJoinedCards.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-3xl">sports_tennis</span>
                    </div>
                    <p className="font-black text-gray-800 text-base">{joinedLfgCards.length === 0 ? 'Bạn chưa tham gia kèo ghép nào' : 'Bạn không còn kèo nào đang tham gia'}</p>
                    <p className="text-xs text-gray-500 max-w-md">
                      Khám phá sàn ghép trận và chốt slot ngay để giao lưu thể thao cùng các vận động viên khác!
                    </p>
                    <button
                      onClick={() => handleTabChange('all')}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      Khám Phá Sàn Ghép Trận
                    </button>
                  </div>
                ) : (
                  visibleJoinedCards.map((card) => {
                    // myStatus (BE): PENDING | ACCEPTED | REJECTED | LEFT | REMOVED | CANCELLED
                    const myStatus = myStatusOf(card)
                    const isPending = myStatus === 'PENDING'
                    const isInvited = myStatus === 'INVITED' || card.invitationStatus === 'INVITED' || card.isInvitation
                    const cardCancelled = String(card.status || '').toUpperCase() === 'CANCELLED'
                    const inactive = isJoinedInactive(card)
                    const badgeText = cardCancelled
                      ? 'Kèo Đã Hủy'
                      : isInvited
                      ? 'Được Mời Vào Kèo'
                      : PARTICIPANT_STATUS_TEXT[myStatus] || 'Đã Vào Đội Hình'

                    return (
                      <div
                        key={card.id}
                        className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all ${inactive ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200/90 hover:shadow-md'}`}
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 flex-wrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${
                                  inactive
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isInvited
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : isPending
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {badgeText}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#1E40AF]">
                                {card.sportName || card.sport?.toUpperCase() || 'THỂ THAO'}
                              </span>
                            </div>
                            <h3 className="font-black text-base text-[#111827] mt-1">{card.description || card.title || `Kèo ${card.sportName || 'ghép trận'}`}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#3B6817]">location_on</span>
                              <span>{card.courtName} • {card.facilityAddress}</span>
                            </p>
                            {(card.myJoinedAt || card.createdAt) && (
                              <p className="text-[11px] text-gray-400 m-0">
                                {card.myJoinedAt && `Tham gia lúc ${new Date(card.myJoinedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`}
                                {card.myJoinedAt && card.createdAt && ' • '}
                                {card.createdAt && `Kèo tạo lúc ${new Date(card.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-gray-400 block font-semibold">Cọc giữ chỗ Escrow</span>
                            <span className="text-lg font-black text-[#15803D]">
                              {card.pricePerPerson != null ? `${new Intl.NumberFormat('vi-VN').format(card.pricePerPerson)} Điểm` : '—'}
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const joinedTeamInfo = extractLfgTeamInfo(card)
                          return (
                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-3 rounded-xl flex-wrap gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-gray-400">
                                  {joinedTeamInfo.isTeamMatch ? 'groups' : 'person'}
                                </span>
                                {joinedTeamInfo.isTeamMatch ? (
                                  <span>
                                    Kèo đội:{' '}
                                    <strong>
                                      {joinedTeamInfo.hostTeamName || 'Đội chủ kèo'} vs {joinedTeamInfo.challengerTeamName || 'Đang tìm đối thủ'}
                                    </strong>
                                  </span>
                                ) : (
                                  <span>Chủ kèo: <strong>{card.hostName || 'Chủ kèo'}</strong></span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-gray-400">schedule</span>
                                <span>Giờ thi đấu: <strong>{card.startTime ? new Date(card.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</strong></span>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Actions for Participant */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 flex-wrap">
                          <button
                            onClick={() => setDetailCardId(card.id)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-gray-300"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>Xem chi tiết</span>
                          </button>
                          {/* Lời mời tham gia: Chấp nhận POST /invitation/accept & Từ chối POST /invitation/decline */}
                          {inactive ? (
                            <span className="text-xs text-gray-500 font-semibold">
                              {cardCancelled ? 'Kèo đã bị hủy, tiền cọc được hoàn theo chính sách.' : 'Bạn không còn trong kèo này.'}
                            </span>
                          ) : isInvited ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptLfgInvite(card.id)}
                                className="px-4 py-2 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                <span>Chấp Nhận Lời Mời</span>
                              </button>
                              <button
                                onClick={() => handleDeclineLfgInvite(card.id)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                <span>Từ Chối</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Rời kèo (Bước 4): không rời được khi đã tới giờ chơi */}
                              {!card.isStarted && (
                              <button
                                onClick={() => handleOpenLeaveModal(card)}
                                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">logout</span>
                                <span>{isPending ? 'Rút yêu cầu' : 'Rời kèo'}</span>
                              </button>
                              )}

                              {/* Mở vé QR (Bước 3 & 2.7) */}
                              {!isPending && (
                                <button
                                  onClick={() => handleOpenQrTicket(card.id, card)}
                                  className="px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                  <span>Mở Vé QR Check-in</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: SIDEBAR CARDS ================= */}
          <div className="lg:col-span-4 flex flex-col gap-5 min-w-0">
            {/* Card 1: HỒ SƠ GHÉP TRẬN CÁ NHÂN (PROMINENT & HIGHLIGHTED) */}
            <div className="relative rounded-3xl bg-gradient-to-br from-white via-[#F7FCF8] to-[#EEF9F0] border-2 border-[#86EFAC] p-5 sm:p-6 shadow-[0_12px_36px_rgba(45,95,63,0.14)] hover:shadow-[0_16px_44px_rgba(45,95,63,0.2)] transition-all overflow-hidden group">
              {/* Top Glowing Color Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#10B981] via-[#22C55E] to-[#15803D]" />

              {/* Watermark Background Icon */}
              <div className="absolute -right-3 -bottom-5 text-[#86EFAC]/15 select-none pointer-events-none">
                <span className="material-symbols-outlined text-[130px]">sports_score</span>
              </div>

              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between mb-4 relative z-10 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">badge</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1F2937]">
                    Hồ Sơ Ghép Trận Cá Nhân
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#DCFCE7] to-[#BBF7D0] text-[#15803D] border border-[#86EFAC] text-[11px] font-black shadow-xs tracking-wide whitespace-nowrap shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#15803D]">military_tech</span>
                  {pickedSportKey
                    ? pickedStanding?.rank
                      ? `Hạng ${pickedStanding.rank}`
                      : 'Chưa xếp hạng'
                    : 'Chưa chọn môn'}
                </span>
              </div>

              {/* Avatar + Name + Level + Status */}
              <div className="flex items-start gap-3.5 mb-4 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-[58px] h-[58px] rounded-2xl bg-gradient-to-br from-[#1B4D2E] via-[#2D5F3F] to-[#15803D] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#2D5F3F]/35 ring-4 ring-[#86EFAC]/50 group-hover:scale-105 transition-transform">
                    {initialsOf(currentUser.name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[12px] font-black">check</span>
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-[17px] text-[#0F172A] leading-tight break-words min-w-0">
                      {currentUser.name || 'Bạn'}
                    </h4>
                    {pickedSportKey && (
                      <span className="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] font-extrabold text-[10.5px] whitespace-nowrap">
                        {eloText(pickedStanding, pickedSportName)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-1.5 mt-1 text-[12px] text-gray-700 font-bold">
                    <span className="material-symbols-outlined text-[15px] text-[#15803D] shrink-0">location_on</span>
                    <span className="min-w-0 break-words">
                      Vị trí thi đấu:{' '}
                      {userProfileLocation ? (
                        <strong className="text-[#15803D]">
                          {userProfileLocation}
                          {playerArea.radiusKm ? ` (bán kính ${playerArea.radiusKm} km)` : ''}
                        </strong>
                      ) : (
                        <button type="button" onClick={() => navigate('/onboarding')} className="text-[#B45309] underline cursor-pointer">
                          Chưa đặt khu vực – cập nhật khảo sát
                        </button>
                      )}
                    </span>
                  </div>

                  {standing.fairPlay && (
                    standing.fairPlay.isLfgBlocked ? (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold self-start whitespace-nowrap">
                        <span className="material-symbols-outlined text-[13px]">block</span>
                        <span>Đang bị chặn nhận kèo</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-[#EAF7EE] border border-[#86EFAC] text-[#15803D] text-[11px] font-bold self-start shadow-2xs whitespace-nowrap">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>Đủ điều kiện nhận kèo</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Fair Play Score Highlight Box */}
              <div className="mb-4 p-3.5 rounded-2xl bg-white border border-[#D1EBD0] shadow-2xs relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800 whitespace-nowrap shrink-0">
                    <span className="material-symbols-outlined text-[17px] text-red-500">
                      flag
                    </span>
                    <span>Chỉ Số Fair Play</span>
                  </div>
                  <div className="text-right flex items-baseline gap-1 whitespace-nowrap shrink-0">
                    <span className="text-[22px] font-black text-[#15803D] tracking-tight">{fairPlayScoreOf(standing.fairPlay) ?? '—'}</span>
                    <span className="text-xs text-gray-400 font-bold">/100</span>
                  </div>
                </div>

                {/* Glowing Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#10B981] via-[#22C55E] to-[#15803D] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.max(0, Math.min(100, fairPlayScoreOf(standing.fairPlay) ?? 0))}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 mt-2 pt-1.5 border-t border-gray-100 text-[10.5px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1 text-[#15803D] shrink-0">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Tối thiểu để nhận kèo: {standing.fairPlay?.minClaimScore ?? '—'}
                  </span>
                  {standing.fairPlay?.claimBanReason && <span className="text-red-600 truncate" title={standing.fairPlay.claimBanReason}>{standing.fairPlay.claimBanReason}</span>}
                </div>
              </div>

              {/* 2 Stats Mini Cards */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 rounded-2xl bg-white border border-[#DCEBDC] hover:border-[#86EFAC] transition-colors shadow-2xs flex flex-col justify-between min-w-0">
                  <span className="text-[10.5px] text-gray-500 font-semibold block mb-1">
                    Trận giải tính Elo:
                  </span>
                  <div className="flex items-center gap-1 text-[16px] font-black text-[#111827] whitespace-nowrap">
                    <span>{(pickedSportKey ? pickedStanding?.ratedMatches : standing.ratedMatches) ?? 0} Trận</span>
                    <span className="material-symbols-outlined text-[16px] text-[#15803D]">
                      verified_user
                    </span>
                  </div>
                  <span className="text-[11px] text-[#15803D] font-extrabold block mt-1">
                    {pickedSportKey
                      ? pickedStanding?.hasRating
                        ? `Elo ${pickedSportName}`
                        : `Chưa có Elo ${pickedSportName}`
                      : standing.personal.length
                        ? `Elo ${standing.personal.length} môn`
                        : 'Chưa có Elo môn nào'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#DCEBDC] hover:border-[#86EFAC] transition-colors shadow-2xs flex flex-col justify-between min-w-0">
                  <span className="text-[10.5px] text-gray-500 font-semibold block mb-1">
                    Đánh giá cộng đồng:
                  </span>
                  <div className="flex items-center gap-1 text-[16px] font-black text-[#111827] whitespace-nowrap">
                    <span>{standing.fairPlay?.ratingCount ? `${Number(standing.fairPlay.averageRating || 0).toFixed(2)} / 5.0` : '—'}</span>
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      star
                    </span>
                  </div>
                  <span className="text-[10.5px] text-gray-500 font-semibold block mt-1">
                    {standing.fairPlay?.ratingCount ? `${standing.fairPlay.ratingCount} lượt đánh giá` : 'Chưa có đánh giá'}
                  </span>
                </div>
              </div>

              {/* Quick Profile Footer Action */}
              <div className="mt-3.5 pt-3 border-t border-[#DCEBDC] flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold relative z-10">
                <span className="text-gray-500">Elo & khảo sát trình độ:</span>
                <button type="button" onClick={() => navigate('/assessment')} className="inline-flex items-center gap-1 text-[#15803D] bg-[#EAF7EE] px-2 py-0.5 rounded-full cursor-pointer">
                  Xem chi tiết
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 2: Cam Kết Chống Bùng Cọc & Quy Chế LFG */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <h3 className="font-bold text-[15px] text-[#111827]">
                  Cam Kết Chống Bùng Cọc &amp; Quy Chế LFG
                </h3>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setRulesModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EAF7EE] hover:bg-[#DCFCE7] text-[#15803D] font-bold text-xs transition-all border border-[#86EFAC]/70 flex items-center justify-between group active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    <span>Xem quy chế</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= MODAL: XEM CHI TIẾT TOÀN BỘ THÔNG TIN KÈO GHÉP ================= */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ảnh bìa sân + Huy hiệu trên cùng */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden shrink-0">
              <img
                src={detailModal.image}
                alt={detailModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

              <button
                type="button"
                onClick={() => setDetailModal(null)}
                aria-label="Đóng chi tiết kèo"
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="absolute top-3.5 left-4 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#134E4A]/95 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                  <span>
                    {sportMetaOf(detailModal.sport).emoji}
                  </span>
                  <span>{detailModal.sportBadge}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/90 text-[#1E40AF] text-xs font-bold shadow-xs">
                  {detailModal.levelTag}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs ${
                    detailModal.requireApproval
                      ? 'bg-amber-100/95 text-amber-800'
                      : 'bg-emerald-100/95 text-emerald-800'
                  }`}
                >
                  {detailModal.requireApproval ? '🛡️ Cần chủ kèo duyệt' : '⚡ Tham gia ngay'}
                </span>
              </div>

              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <h3 className="font-black text-lg sm:text-xl leading-snug drop-shadow-xs">
                  {detailModal.title}
                </h3>
                <p className="text-xs text-emerald-200 font-semibold mt-0.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">{detailModal.isTeamMatch ? 'groups' : 'person'}</span>
                  <span>
                    {detailModal.isTeamMatch ? (
                      <>
                        Kèo đội: <strong>{detailModal.hostTeamName || 'Đội chủ kèo'}</strong> vs{' '}
                        <strong>{detailModal.challengerTeamName || 'Đang tìm đối thủ'}</strong>
                      </>
                    ) : (
                      <>
                        Chủ kèo: <strong>{detailModal.hostName || 'Chủ kèo'}</strong>
                        {detailModal.hostFairPlayScore != null ? ` • Fair Play ${detailModal.hostFairPlayScore}/100` : ''}
                      </>
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Nội dung chi tiết cuộn được */}
            <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-xs text-gray-700">
              {detailModal.isLoadingDetail && (
                <div className="flex items-center gap-2 text-xs text-[#15803D] font-semibold bg-[#EAF7EE] px-3 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Đang đồng bộ thông tin chi tiết mới nhất của kèo...</span>
                </div>
              )}

              {/* Khối thông tin chính: Bố cục gọn gàng, không bị gãy dòng hay tràn chữ */}
              <div className="flex flex-col gap-3 bg-[#F8FAF9] p-4 rounded-2xl border border-gray-200/80">
                {/* Hàng 1: Thời gian thi đấu + Khung giờ */}
                <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-gray-200/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] text-[#15803D] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[19px]">schedule</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-gray-400 font-bold uppercase block">Thời gian thi đấu</span>
                      <span className="font-extrabold text-gray-900 text-[13px] sm:text-sm block mt-0.5">
                        {detailModal.fullTimeDisplay || detailModal.time}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[11px] font-bold whitespace-nowrap shrink-0">
                    Khung giờ: {detailModal.timeSlot === 'morning' ? 'Buổi sáng' : detailModal.timeSlot === 'afternoon' ? 'Buổi chiều' : 'Buổi tối'}
                  </span>
                </div>

                {/* Hàng 2: Sân & Địa điểm */}
                <div className="flex items-start justify-between gap-3 flex-wrap pb-3 border-b border-gray-200/60">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[19px]">location_on</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10.5px] text-gray-400 font-bold uppercase block">Sân &amp; Địa điểm</span>
                      <span className="font-extrabold text-gray-900 text-[13px] sm:text-sm block mt-0.5 leading-snug">
                        {detailModal.courtName
                          ? `${detailModal.courtName}${detailModal.facilityName ? ` • ${detailModal.facilityName}` : ''}`
                          : detailModal.location}
                      </span>
                      {detailModal.facilityAddress && (
                        <span className="text-xs text-gray-500 block mt-0.5 leading-snug">{detailModal.facilityAddress}</span>
                      )}
                    </div>
                  </div>
                  {detailModal.distanceKm != null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF7EE] text-[#15803D] text-[11px] font-bold whitespace-nowrap shrink-0">
                      <span className="material-symbols-outlined text-[14px]">near_me</span>
                      Cách bạn ~{Number(detailModal.distanceKm).toFixed(1)} km
                    </span>
                  )}
                </div>

                {/* Hàng 3: Môn & Trình độ + Tình trạng chỗ trống */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[19px]">sports_tennis</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-gray-400 font-bold uppercase block">Môn &amp; Trình độ yêu cầu</span>
                      <span className="font-extrabold text-gray-900 text-[13px] block mt-0.5 whitespace-nowrap">
                        {[detailModal.sportName, detailModal.levelTag].filter(Boolean).join(' • ') || '—'}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {detailModal.format ? `Thể thức: ${detailModal.format}` : 'Giao lưu thể thao'}
                        {detailModal.sideSize ? ` • ${detailModal.sideSize} người/đội` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[19px]">groups</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10.5px] text-gray-400 font-bold uppercase block">Tình trạng chỗ trống</span>
                      <span className="font-extrabold text-gray-900 text-[13px] block mt-0.5 whitespace-nowrap">
                        Đã ghép {detailModal.currentSlots}/{detailModal.totalSlots} vị trí • {detailModal.slotTag}
                      </span>
                      <span className="text-[11px] text-[#15803D] font-semibold block whitespace-nowrap">
                        Trạng thái kèo:{' '}
                        {detailModal.status === 'FILLED'
                          ? 'Đã đủ người'
                          : detailModal.status === 'CANCELLED'
                          ? 'Đã hủy'
                          : 'Đang mở tuyển thành viên'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mô tả / Ghi chú từ chủ kèo */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80">
                <div className="flex items-center gap-1.5 font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#3B6817]">description</span>
                  <span>Mô tả &amp; Ghi chú của Chủ Kèo</span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {detailModal.description || detailModal.title || 'Chủ kèo mời giao lưu vui vẻ, đúng giờ và tinh thần Fair Play.'}
                </p>
              </div>

              {/* Đội hình hiện tại (tính luôn cả chủ kèo) & Các vị trí trống */}
              {(() => {
                const rawRoster = Array.isArray(detailModal.roster) ? detailModal.roster : []
                const nonEmptyFromRoster = rawRoster.filter((p) => p && p.bg !== 'empty')
                const hostEntry = nonEmptyFromRoster[0] || {
                  initials: (detailModal.hostName || 'CK').slice(0, 2).toUpperCase(),
                  bg: '#15803D',
                  name: detailModal.hostName || 'Chủ kèo',
                  isHost: true,
                  fairPlayScore: detailModal.hostFairPlayScore ?? null,
                }
                const joinedEntries = nonEmptyFromRoster.slice(1)
                const parsedSlotTagCount = Number((String(detailModal.slotTag || '').match(/\d+/) || [])[0]) || 0
                const neededEmptySlots = Math.max(
                  Number(detailModal.remainingSlots) || 0,
                  parsedSlotTagCount,
                  Math.max(0, (Number(detailModal.totalSlots) || 3) - (Number(detailModal.currentSlots) || 0)),
                  rawRoster.filter((p) => p && p.bg === 'empty').length
                )
                const emptyEntries = Array.from({ length: neededEmptySlots }, (_, i) => ({
                  initials: '?',
                  bg: 'empty',
                  emptyIndex: i + 1,
                  name: `Vị trí trống #${i + 1}`,
                }))
                const rosterList = [{ ...hostEntry, isHost: true }, ...joinedEntries, ...emptyEntries]
                const emptyCount = emptyEntries.length
                const filledCount = 1 + joinedEntries.length
                return (
                  <div className="bg-white rounded-2xl p-4 border border-gray-200/80">
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px] text-[#3B6817]">badge</span>
                        <span>Danh sách Đội hình ({filledCount}/{rosterList.length} người)</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Còn {emptyCount} vị trí trống
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {rosterList.map((player, idx) => {
                        const isEmpty = player.bg === 'empty'
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                              isEmpty
                                ? 'border-dashed border-amber-300 bg-amber-50/40'
                                : 'border-gray-200 bg-[#F8FAF9]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                  isEmpty
                                    ? 'bg-amber-100 text-amber-700 border border-dashed border-amber-400'
                                    : 'text-white'
                                }`}
                                style={{ backgroundColor: !isEmpty ? player.bg : undefined }}
                              >
                                {isEmpty ? '?' : player.initials}
                              </div>
                              <div className="min-w-0">
                                <p className={`font-bold text-xs truncate ${isEmpty ? 'text-amber-800' : 'text-gray-900'}`}>
                                  {isEmpty ? `Vị trí trống #${player.emptyIndex || idx}` : player.name}
                                </p>
                                <span className="text-[10.5px] text-gray-500 block">
                                  {player.isHost || (idx === 0 && !isEmpty)
                                    ? 'Chủ kèo'
                                    : isEmpty
                                    ? 'Đang mở cho bạn chốt slot'
                                    : player.side
                                    ? `Thành viên • Đội ${player.side}`
                                    : 'Thành viên đã tham gia'}
                                </span>
                              </div>
                            </div>
                            {!isEmpty && player.fairPlayScore != null && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#EAF7EE] text-[#15803D] shrink-0">
                                FP {player.fairPlayScore}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Chi phí cọc giữ chỗ */}
              <div className="bg-gradient-to-r from-[#EAF7EE] to-[#F0FDF4] rounded-2xl p-4 border border-[#86EFAC] flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[11px] text-[#15803D] font-bold uppercase block">
                    Chi phí cọc giữ chỗ
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-[#111827]">{detailModal.priceDisplay}</span>
                    <span className="text-xs text-gray-600 font-semibold">/ người</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal: Đóng hoặc Chốt Slot Nhanh */}
            <div className="px-6 py-4 bg-[#F9FAF8] border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetMatch = detailModal
                  setDetailModal(null)
                  openClaimModal(targetMatch)
                }}
                className="px-6 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-extrabold text-xs shadow-md shadow-[#3B6817]/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">bolt</span>
                <span>Chốt Slot Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: XÁC NHẬN CHỌN SLOT NHANH ================= */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[22px]">bolt</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#111827] leading-tight">
                    Xác nhận chọn Slot nhanh
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Bảo chứng giữ chỗ an toàn qua Hợp đồng Escrow</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Chi Tiết Thông Tin Trận Đấu */}
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-gray-200/80 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      bookingModal.sport === 'badminton'
                        ? 'bg-[#EFF6FF] text-[#1E40AF]'
                        : 'bg-[#EEF2FF] text-[#4338CA]'
                    }`}
                  >
                    {bookingModal.sportBadge}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {bookingModal.levelTag}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {bookingModal.slotTag || `Đã ghép: ${bookingModal.currentSlots}/${bookingModal.totalSlots} chỗ`}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-[#111827] text-sm sm:text-base leading-snug">
                  {bookingModal.title}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600 pt-2 border-t border-gray-200/60">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">
                    location_on
                  </span>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Địa điểm sân</span>
                    <span className="text-gray-800 font-medium leading-tight">{bookingModal.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">
                    schedule
                  </span>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Thời gian thi đấu</span>
                    <span className="text-gray-800 font-semibold">{bookingModal.time}</span>
                  </div>
                </div>

                {bookingModal.groupDesc && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <span className="material-symbols-outlined text-[17px] text-gray-400 shrink-0 mt-0.5">
                      group
                    </span>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Thông tin nhóm / Host</span>
                      <span className="text-gray-700">{bookingModal.groupDesc}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Roster & Slot Status */}
              {bookingModal.roster && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-500">Đội hình ({bookingModal.currentSlots}/{bookingModal.totalSlots}):</span>
                    <div className="flex items-center -space-x-1.5">
                      {bookingModal.roster.map((player, idx) => (
                        <div
                          key={idx}
                          title={player.name}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[9.5px] font-bold border-2 border-white shadow-xs ${
                            player.bg === 'empty'
                              ? 'bg-amber-100 text-amber-600 border-dashed border-amber-300'
                              : 'text-white'
                          }`}
                          style={{
                            backgroundColor: player.bg !== 'empty' ? player.bg : undefined,
                          }}
                        >
                          {player.bg === 'empty' ? '?' : player.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#2D5F3F] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping"></span>
                    Slot còn lại mở khoá cho bạn
                  </span>
                </div>
              )}
            </div>

            {/* Financial Summary: Khung tiền */}
            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-gray-200/80 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium">Số dư ví hiện tại:</span>
                <span className="font-bold text-[#111827]">
                  {new Intl.NumberFormat('vi-VN').format(walletBalance)} Điểm
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#111827] pt-1.5 border-t border-gray-200/60">
                <span>Phí cọc giữ slot:</span>
                <span className="text-[#15803D] font-extrabold text-base">
                  {bookingModal.priceDisplay}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 pt-1.5 border-t border-gray-200/60">
                <span className="font-medium">Số dư còn lại:</span>
                <span
                  className={`font-bold ${
                    walletBalance - bookingModal.price < 0 ? 'text-red-600' : 'text-[#111827]'
                  }`}
                >
                  {new Intl.NumberFormat('vi-VN').format(walletBalance - bookingModal.price)} Điểm
                </span>
              </div>
            </div>

            {/* Chọn hình thức Nhận kèo: Cá nhân hoặc Nhận kèo bằng Đội (bắn challengerTeamId) */}
            {(() => {
              const eligibleTeams = eligibleTeamsForMatch(bookingModal)
              if (!eligibleTeams.length && !bookingModal.isTeamMatch) return null
              return (
                <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase text-[#14532D] tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#15803D]">groups</span>
                      Hình thức nhận kèo (Team vs Team)
                    </span>
                    {bookingModal.isTeamMatch && (
                      <span className="text-[10.5px] font-bold text-[#15803D] bg-white px-2 py-0.5 rounded-full border border-[#86EFAC]">
                        {bookingModal.hostTeamName || 'Đội chủ kèo'} vs {bookingModal.challengerTeamName || 'Đội thách đấu'}
                      </span>
                    )}
                  </div>

                  {bookingModal.isTeamMatch && (
                    <p className="text-[11px] text-[#166534] leading-relaxed m-0">
                      Kèo đội: chỉ <strong>đội trưởng</strong> nhận kèo bằng đội của mình. <strong>Toàn bộ thành viên trong đội</strong> sẽ nhận thông báo và được tính vào kèo.
                      Tiền sân <strong>chia đôi cho 2 đội trưởng</strong> (đội trưởng trả phần của đội), không chia tiền trong đội.
                    </p>
                  )}
                  {eligibleTeams.length > 0 ? (
                    <>
                      {!bookingModal.isTeamMatch && <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setClaimMode('solo')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            claimMode === 'solo'
                              ? 'bg-white text-[#111827] border-[#15803D] ring-2 ring-[#15803D]/20'
                              : 'bg-white/60 text-gray-600 border-gray-200 hover:bg-white'
                          }`}
                        >
                          Cá nhân
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClaimMode('team')
                            if (!selectedClaimTeamId && eligibleTeams[0]) setSelectedClaimTeamId(eligibleTeams[0].id)
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            claimMode === 'team'
                              ? 'bg-[#15803D] text-white border-[#15803D] shadow-xs'
                              : 'bg-white/60 text-[#15803D] border-[#86EFAC] hover:bg-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">shield</span>
                          <span>Nhận kèo bằng Đội</span>
                        </button>
                      </div>}

                      {(bookingModal.isTeamMatch || claimMode === 'team') && (
                        <div>
                          <label htmlFor="claim-challenger-team" className="block text-[11px] font-bold text-[#14532D] mb-1">
                            Chọn đội của bạn (bạn là Đội trưởng):
                          </label>
                          <select
                            id="claim-challenger-team"
                            value={selectedClaimTeamId}
                            onChange={(e) => setSelectedClaimTeamId(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[#86EFAC] bg-white text-xs font-bold text-[#111827] outline-none focus:ring-2 focus:ring-[#15803D]/25 cursor-pointer"
                          >
                            {eligibleTeams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                                {team.sportName ? ` — ${team.sportName}` : ''}
                                {team.totalMembers ? ` (${team.totalMembers} thành viên)` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
                      {TEAM_ONLY_CLAIM_TEXT} Tạo hoặc quản lý đội tại mục Giải đấu &amp; Đội.
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Chọn phe A / B: chỉ kèo đối kháng cá nhân; kèo đội thì đội nhận kèo là phe đối diện, kèo giao lưu không chia phe */}
            {bookingModal.sideSize > 0 && !bookingModal.isTeamMatch && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
                Chọn phe ({bookingModal.sideSize} vs {bookingModal.sideSize}):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'any', label: 'Hệ thống xếp' },
                  { key: 'A', label: 'Phe A' },
                  { key: 'B', label: 'Phe B' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedClaimSide(s.key)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedClaimSide === s.key
                        ? 'bg-[#EAF7EE] text-[#15803D] border-[#15803D]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Quy chế Duyệt Kèo (2.6 Người tham gia Bước 2) */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              bookingModal.requireApproval
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-[#EAF7EE] border-[#C6E7BE] text-[#1C3524]'
            }`}>
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                {bookingModal.requireApproval ? 'security' : 'bolt'}
              </span>
              <div className="leading-relaxed">
                {bookingModal.requireApproval ? (
                  <>
                    <strong className="block mb-0.5">Kèo Cần Chủ Kèo Duyệt (requireApproval = true):</strong>
                    Chỉ gửi yêu cầu tham gia tới Chủ Kèo. Tiền cọc sẽ được bảo chứng giữ an toàn từ ví khi chủ kèo chính thức duyệt.
                  </>
                ) : (
                  <>
                    <strong className="block mb-0.5">Kèo Vào Tự Động:</strong>
                    Trừ tiền cọc ngay lập tức từ ví Smart Escrow và bạn chính thức vào đội hình ngay bây giờ.
                  </>
                )}
              </div>
            </div>

            {/* Error Message Banner (403 Fair Play hoặc cấm nhận suất - Image 2) */}
            {claimError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0 mt-0.5">gavel</span>
                <div>
                  <strong className="block font-black text-rose-900 mb-1">
                    Không nhận được suất:
                  </strong>
                  <p className="font-semibold leading-relaxed whitespace-pre-wrap">{claimError}</p>
                  {/* Chỉ giải thích luật Fair Play khi BE thật sự từ chối vì Fair Play / cấm nhận suất */}
                  {/fair\s*play|cấm/i.test(claimError) && (
                    <p className="text-[11px] text-rose-600 mt-1.5 italic">
                      (Quy định: Nhận suất bị từ chối khi điểm Fair Play thấp hơn ngưỡng quy định hoặc đang bị cấm nhận suất)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setBookingModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                disabled={isClaiming || (bookingModal?.isTeamMatch && eligibleTeamsForMatch(bookingModal).length === 0)}
                onClick={handleConfirmClaim}
                className="flex-1 py-2.5 rounded-xl bg-[#2D5F3F] hover:bg-[#234A31] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[17px]">check_circle</span>
                    <span>{bookingModal.requireApproval ? 'Gửi Yêu Cầu Vào Kèo' : 'Xác Nhận Nhận Suất'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VÉ QR CHECK-IN TẠI SÂN (2.6 Bước 3 & 2.7 Bước 1) ================= */}
      {detailCardId && <LfgDetailModal cardId={detailCardId} onClose={() => setDetailCardId(null)} />}

      {qrTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 flex flex-col items-center gap-4 text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#15803D] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <h3 className="font-black text-base text-[#111827]">Vé QR Check-in LFG</h3>
              </div>
              <button
                onClick={() => setQrTicketModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center w-full">
              {qrTicketModal.isLoading ? (
                <div className="w-52 h-52 flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#3B6817] animate-spin">progress_activity</span>
                  <span className="text-xs text-gray-500 font-bold">Đang tải mã vé QR...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-52 h-52 bg-white rounded-xl p-3 border-2 border-[#15803D] shadow-sm flex items-center justify-center relative overflow-hidden">
                    {/* Mã QR thật từ GET /lfgs/{id}/qr-ticket; chủ sân quét mã này để check-in */}
                    {qrTicketModal.qrCode ? (
                      <QRCodeSVG value={qrTicketModal.qrCode} size={180} level="M" style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <span className="text-xs text-gray-500 font-bold text-center">Chưa lấy được mã vé. Vui lòng thử lại.</span>
                    )}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#16A34A] animate-pulse"></div>
                  </div>
                  <span className="font-mono text-xs font-black px-3 py-1 rounded-md bg-gray-200 text-gray-800 tracking-wider">
                    {qrTicketModal.ticketCode}{qrTicketModal.isCheckedIn ? ' • Đã check-in' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Info Details */}
            <div className="w-full bg-[#FAFBF9] rounded-xl p-3 border border-gray-100 text-xs text-left flex flex-col gap-1.5">
              <p className="font-black text-[#111827]">{qrTicketModal.title}</p>
              <p className="text-gray-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#3B6817]">stadium</span>
                <span>{qrTicketModal.courtName}</span>
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#3B6817]">schedule</span>
                <span>Khung giờ: {qrTicketModal.time}</span>
              </p>
            </div>

            {/* Check-in rules (2.7 Bước 2) */}
            <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed text-left flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px] text-amber-600 shrink-0 mt-0.5">schedule</span>
              <div>
                <strong>Quy định Check-in tại sân:</strong> Vé chỉ check-in được từ <strong>1 tiếng trước giờ chơi</strong> đến khi hết ca; quét sớm hoặc trễ hệ thống sẽ từ chối nhận check-in.
              </div>
            </div>

            <button
              onClick={() => setQrTicketModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white text-xs font-bold cursor-pointer"
            >
              Đóng Vé QR
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: HỦY KÈO GHÉP (POST /api/v1/lfgs/{id}/cancel) ================= */}
      {cancelMatchModal && (() => {
        const isLocked = typeof cancelMatchModal.isLocked === 'boolean'
          ? cancelMatchModal.isLocked
          : isCardLocked(cancelMatchModal)
        const rawComp = cancelMatchModal.compensationTotal
          ?? (Number(cancelMatchModal.bookingTotalAmount) > 0
            ? Math.round(Number(cancelMatchModal.bookingTotalAmount) * 0.5)
            : null)
        const compensationText = rawComp != null
          ? `${Number(rawComp).toLocaleString('vi-VN')} Điểm (${LATE_PCT}% tiền sân)`
          : `${LATE_PCT}% tiền sân`

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className={`bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 ${isLocked ? 'border-2 border-rose-500 ring-4 ring-rose-500/20' : 'border border-gray-200'}`}>
              <div className={`flex items-center justify-between pb-3 border-b ${isLocked ? 'bg-rose-50 border-rose-200 -mx-6 -mt-6 px-6 pt-5 rounded-t-3xl' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2 text-rose-700">
                  <span className="material-symbols-outlined text-2xl">{isLocked ? 'gpp_bad' : 'warning'}</span>
                  <h3 className={`font-black text-base ${isLocked ? 'text-rose-800' : 'text-[#111827]'}`}>
                    {isLocked ? `Cảnh Báo Hủy Kèo Sát Giờ (< ${LOCK_H}h)` : 'Xác Nhận Hủy Kèo Ghép'}
                  </h3>
                </div>
                <button
                  onClick={() => setCancelMatchModal(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {isLocked && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-600 border border-rose-700 text-white text-xs leading-relaxed flex items-start gap-2.5 shadow-md shadow-rose-600/25"
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">report</span>
                  <div>
                    <strong>Hủy kèo sát giờ:</strong> Bạn sẽ bị trừ <strong>{compensationText}</strong> bồi thường và <strong>-{LATE_FP} điểm FairPlay</strong>.
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600">
                Bạn đang hủy kèo: <strong>{cancelMatchModal.description || cancelMatchModal.title || 'Kèo ghép'}</strong>
              </p>

              {/* Lý do hủy: dropdown từ GET /lfgs/cancel-reasons */}
              <LfgReasonPicker
                label="Lý do hủy kèo"
                required
                reasons={cancelReasonsList}
                picked={selectedCancelReason}
                onPick={setSelectedCancelReason}
                custom={customCancelReason}
                onCustom={setCustomCancelReason}
              />
              <p className={`text-[11px] m-0 ${isLocked ? 'text-rose-600 font-semibold' : 'text-gray-500'}`}>
                {isLocked
                  ? `Kèo đã qua mốc khóa ${LOCK_H} tiếng trước giờ chơi. Nếu vẫn hủy đơn phương, hệ thống sẽ trừ tiền bồi thường và điểm FairPlay ngay khi xác nhận.`
                  : `Chủ kèo hủy trước giờ chơi từ ${LOCK_H} tiếng trở lên không bị phạt tiền sát giờ (chỉ trừ ${EARLY_FP} điểm FairPlay); không hủy được khi đã có người check-in.`}
              </p>

              {/* Refund policy note */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">policy</span>
                <div>
                  <strong>Chính sách hủy kèo (2.6 Bước 5):</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>Trước giờ chơi từ {LOCK_H} giờ trở lên: hoàn 100% Điểm cho các thành viên tham gia, hoàn tiền sân cho chủ kèo; chủ kèo bị trừ <strong>{EARLY_FP} điểm FairPlay</strong>.</li>
                    <li>Dưới {LOCK_H} giờ (sát giờ): người tham gia được hoàn 100% Điểm; chủ kèo bị trừ <strong>{LATE_PCT}% tiền sân bồi thường</strong> và <strong>-{LATE_FP} điểm FairPlay</strong>.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelMatchModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Giữ Kèo
                </button>
                <button
                  type="button"
                  disabled={actionLoadingId === cancelMatchModal.id}
                  onClick={handleConfirmCancelMatch}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === cancelMatchModal.id ? 'Đang hủy...' : (isLocked ? 'Chấp Nhận Phạt & Hủy Kèo' : 'Xác Nhận Hủy Kèo')}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ================= MODAL: RỜI KÈO (2.6 Bước 4) ================= */}
      {leaveMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="material-symbols-outlined text-2xl">logout</span>
                <h3 className="font-black text-base text-[#111827]">Xác Nhận Rời Kèo</h3>
              </div>
              <button
                onClick={() => setLeaveMatchModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Bạn có chắc chắn muốn rời kèo ghép <strong>{leaveMatchModal.description || leaveMatchModal.title || 'Kèo ghép'}</strong>?
            </p>

            <LfgReasonPicker
              label="Lý do rời kèo"
              reasons={cancelReasonsList}
              picked={leaveReasonPick}
              onPick={setLeaveReasonPick}
              custom={leaveReason}
              onCustom={setLeaveReason}
              placeholder="Nhập lý do rút khỏi trận..."
            />

            {/* 2-hour window rule (2.6 Bước 4) */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">timer</span>
              <div>
                <strong>Quy định hoàn Điểm:</strong> Rời kèo trước giờ chơi từ {LOCK_H} giờ trở lên được hoàn 100% Điểm, sau mốc này không được hoàn (rút yêu cầu đang chờ thì không mất Điểm). <em>Lưu ý: Hệ thống không cho phép rời kèo trong vòng {LEAVE_BLOCK_H} giờ trước giờ chơi để bảo vệ các vận động viên khác.</em>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeaveMatchModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Ở Lại Kèo
              </button>
              <button
                type="button"
                disabled={actionLoadingId === leaveMatchModal.id}
                onClick={handleConfirmLeaveMatch}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === leaveMatchModal.id ? 'Đang xử lý...' : 'Xác Nhận Rời'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUY CHẾ TRỌNG TÀI & PHÂN GIẢI ================= */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#15803D]">gavel</span>
                <h3 className="font-extrabold text-lg text-[#111827]">
                  Quy Chế Trọng Tài Số &amp; Phân Giải
                </h3>
              </div>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="text-xs text-gray-700 flex flex-col gap-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[#EAF7EE] border border-[#C6E7BE]">
                <strong className="text-[#15803D] block mb-1">
                  1. Hợp đồng thông minh Ký Quỹ Escrow
                </strong>
                Mọi khoản đặt cọc được giữ an toàn bởi hệ thống SportNexus. Tiền chỉ được giải phóng
                cho chủ sân hoặc host sau khi hoàn tất xác thực QR Check-in tại sân.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <strong className="text-gray-900 block mb-1">
                  2. Cơ chế xử phạt huỷ slot &amp; No-show
                </strong>
                - Rời kèo trước giờ chơi từ {LOCK_H} giờ trở lên: Hoàn 100% Điểm về Ví Escrow.<br />
                - Rời kèo trong vòng {LOCK_H} giờ trước giờ chơi hoặc vắng mặt: Không được hoàn Điểm.<br />
                - Chủ kèo hủy kèo: người tham gia luôn được hoàn 100% (trong vòng {LOCK_H} giờ còn được bồi thường thêm).
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <strong className="text-gray-900 block mb-1">
                  3. Xếp hạng uy tín Fair Play (0 - 100)
                </strong>
                Vận động viên đạt từ 95 điểm trở lên sẽ được cấp huy hiệu <strong>Kim Cương</strong>{' '}
                và ưu tiên tranh slot tức thì (Flash Claim) trong các giải đấu lớn.
              </div>
            </div>

            <button
              onClick={() => setRulesModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#3B6817] text-white font-bold text-xs mt-2"
            >
              Tôi Đã Hiểu &amp; Đồng Ý
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: BỘ LỌC NÂNG CAO (EXPANDED & PROMINENT) ================= */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden">
            {/* Top Glowing Color Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#22C55E] via-[#3B6817] to-[#15803D]" />

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gradient-to-b from-[#F9FAF8] to-white">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B6817] to-[#15803D] flex items-center justify-center text-white shadow-md shadow-[#3B6817]/25 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-[#111827] tracking-tight">
                      Bộ Lọc Ghép Trận Nâng Cao
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                      Realtime Filters
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tùy chỉnh tiêu chí tìm kiếm kèo thi đấu, khung giờ, chuẩn trình độ &amp; bảo chứng Escrow
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="px-6 py-5 overflow-y-auto flex flex-col gap-6 text-xs">
              {/* SECTION 1: KHUNG GIỜ THI ĐẤU (HIGH PRIORITY & PROMINENT) */}
              <div className="bg-[#F8FAF8] rounded-2xl p-4 sm:p-5 border border-[#DCEBDC]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B6817] text-[18px]">schedule</span>
                    <label className="font-extrabold text-sm text-[#111827] uppercase tracking-wide">
                      Khung Giờ Thi Đấu
                    </label>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    (Có thể chọn nhiều khung giờ)
                  </span>
                </div>

                {/* 3 Prominent Time Slot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Sáng: 06:00 - 12:00 */}
                  <div
                    onClick={() => toggleTimeSlot('morning')}
                    className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTimeSlots.includes('morning')
                        ? 'border-[#3B6817] bg-[#EAF7EE] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">🌅</span>
                      {selectedTimeSlots.includes('morning') ? (
                        <span className="w-5 h-5 rounded-full bg-[#3B6817] text-white flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Sáng</h4>
                      <p className="font-extrabold text-[12px] text-[#3B6817] mt-0.5">06:00 - 12:00</p>
                      <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                        Khởi động ngày mới, không khí mát mẻ &amp; tràn đầy năng lượng
                      </p>
                    </div>
                  </div>

                  {/* Chiều: 12:00 - 17:00 */}
                  <div
                    onClick={() => toggleTimeSlot('afternoon')}
                    className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTimeSlots.includes('afternoon')
                        ? 'border-[#3B6817] bg-[#EAF7EE] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">☀️</span>
                      {selectedTimeSlots.includes('afternoon') ? (
                        <span className="w-5 h-5 rounded-full bg-[#3B6817] text-white flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Chiều</h4>
                      <p className="font-extrabold text-[12px] text-[#3B6817] mt-0.5">12:00 - 17:00</p>
                      <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                        Giao lưu xả stress giữa giờ, rèn kỹ thuật &amp; sân vắng thoáng
                      </p>
                    </div>
                  </div>

                  {/* Tối: 17:00 - 22:00 */}
                  <div
                    onClick={() => toggleTimeSlot('evening')}
                    className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTimeSlots.includes('evening')
                        ? 'border-[#3B6817] bg-[#EAF7EE] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">🌙</span>
                      {selectedTimeSlots.includes('evening') ? (
                        <span className="w-5 h-5 rounded-full bg-[#3B6817] text-white flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Tối</h4>
                      <p className="font-extrabold text-[12px] text-[#3B6817] mt-0.5">17:00 - 22:00</p>
                      <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                        Giờ vàng thi đấu sôi động nhất, tập trung nhiều cao thủ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: MÔN THỂ THAO & THỂ THỨC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Môn thể thao */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">sports_tennis</span>
                    <label className="font-bold text-gray-800">Môn thể thao:</label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'all', label: 'Tất cả môn', emoji: '✨' },
                      ...Object.values(SPORT_CATALOG).map((c) => ({ key: c.key, label: c.name, emoji: c.emoji })),
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => (s.key === 'all' ? selectAllSports() : selectOnlySport(s.key))}
                        className={`py-2.5 px-2 rounded-xl border font-bold text-center flex flex-col items-center gap-1 transition-all ${
                          (s.key === 'all' ? isAllActive : !isAllActive && selectedSports.includes(s.key))
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D] shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-[18px] leading-none">{s.emoji}</span>
                        <span className="text-[11px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thể thức ghép */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">group</span>
                    <label className="font-bold text-gray-800">Thể thức (số người mỗi phe):</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'Tất cả thể thức' },
                      { key: '1', label: 'Đơn 1 vs 1' },
                      { key: '2', label: 'Đôi 2 vs 2' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => { if (f.key !== selectedFormat) { setIsLoadingLfgs(true); setSelectedFormat(f.key) } }}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          selectedFormat === f.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: TRÌNH ĐỘ KỸ NĂNG & KHOẢNG CÁCH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trình độ */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">military_tech</span>
                    <label className="font-bold text-gray-800">Trình độ kỹ năng:</label>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { key: 'all', label: 'Tất cả trình độ' },
                      { key: 'beginner', label: 'Phong trào / Mới chơi' },
                      { key: 'intermediate', label: 'Trung bình - Khá' },
                      { key: 'advanced', label: 'Khá - Nâng cao' },
                    ].map((lvl) => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setSelectedSkillLevel(lvl.key)}
                        className={`py-1.5 px-3 rounded-xl border text-left text-[11px] font-semibold transition-all flex items-center justify-between ${
                          selectedSkillLevel === lvl.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span>{lvl.label}</span>
                        {selectedSkillLevel === lvl.key && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bán kính khoảng cách */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">near_me</span>
                    <label className="font-bold text-gray-800">Khoảng cách sân thi đấu:</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'Mọi khoảng cách' },
                      { key: '3km', label: 'Dưới 3 km' },
                      { key: '5km', label: 'Dưới 5 km' },
                      { key: '10km', label: 'Dưới 10 km' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDistance(d.key)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          selectedDistance === d.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Escrow Guarantee Callout */}
                  <div className="mt-3 p-3 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] flex items-start gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                    <span>
                      Hệ thống tự động ưu tiên sân trong bán kính gần và có sẵn slot bảo chứng Escrow minh bạch.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: TIÊU CHÍ AN TOÀN & BẢO CHỨNG ESCROW */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <label className="font-bold text-gray-800 block mb-3 text-[12px]">
                  Tiêu chí Uy tín &amp; Bảo chứng Escrow:
                </label>
                <div className="flex flex-col gap-2.5">
                  {/* Switch 1 */}
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#15803D] text-[18px]">verified_user</span>
                      <div>
                        <p className="font-bold text-gray-800">Chỉ hiện Host có điểm Fair Play &ge; 90</p>
                        <p className="text-[10.5px] text-gray-500">Theo điểm Fair Play hệ thống ghi nhận của chủ kèo</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filterMinFairPlay}
                      onChange={(e) => setFilterMinFairPlay(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#3B6817] cursor-pointer"
                    />
                  </label>

                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="px-6 py-4 bg-[#F9FAF8] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="material-symbols-outlined text-[16px] text-[#3B6817]">filter_alt</span>
                <span>
                  Tìm thấy <strong className="text-[#111827] font-black">{filteredMatches.length}</strong> kèo phù hợp
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-white text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Đặt lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      (activeSportFilter && activeSportFilter !== 'all' && activeSportFilter !== 'profile_matched') ||
                      (selectedSkillLevel && selectedSkillLevel !== 'all') ||
                      (selectedTimeSlots && selectedTimeSlots.length < 3)
                    ) {
                      const updated = recordNewPlayerDesire({
                        sportKey: activeSportFilter !== 'all' && activeSportFilter !== 'profile_matched' ? activeSportFilter : null,
                        skillLevel: selectedSkillLevel !== 'all' ? selectedSkillLevel : null,
                        timeSlot: selectedTimeSlots.length === 1 ? selectedTimeSlots[0] : null,
                        source: 'Áp dụng Bộ Lọc Ghép Trận Nâng Cao',
                      })
                      setLearnedDesires(updated)
                    }
                    setFilterDrawerOpen(false)
                    setToastMessage({
                      title: 'Đã Cập Nhật Bộ Lọc!',
                      desc: `Tìm thấy ${filteredMatches.length} kèo ghép đấu tương thích với tiêu chí của bạn.`,
                      type: 'success',
                    })
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3B6817] to-[#2D5F3F] hover:from-[#315613] hover:to-[#244E33] text-white font-extrabold text-xs shadow-md shadow-[#3B6817]/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[17px]">check_circle</span>
                  <span>Áp Dụng Bộ Lọc ({filteredMatches.length} Kèo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUY CHẾ TRỌNG TÀI SỐ & PHÂN GIẢI TRANH CHẤP ================= */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[24px]">gavel</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#111827] leading-tight">
                    Quy Chế Trọng Tài Số &amp; Bảo Chứng Ghép Trận LFG
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Hệ thống điều phối minh bạch, chống bùng kèo và tính điểm Fair Play thể thao
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRulesModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Nội Dung Quy Chế Chi Tiết */}
            <div className="flex flex-col gap-3.5 text-xs text-gray-700">
              {/* Mục 1: Thang Điểm Fair Play & Chế Tài */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">verified</span>
                  <h4>1. Thang Điểm Fair Play &amp; Chế Tài Kỷ Luật</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    <strong className="text-red-700 font-bold">Dưới 30 điểm:</strong> Tài khoản bị cấm tham gia ghép trận (LFG) và không thể tạo kèo mới.
                  </li>
                  <li>
                    <strong className="text-gray-900 font-bold">Cơ chế tự hồi điểm:</strong> Điểm số sẽ tự động phục hồi dần theo thời gian cho đến khi đạt đủ <strong>40 điểm</strong>.
                  </li>
                  <li>
                    <strong className="text-[#15803D] font-bold">Tích lũy trên 40 điểm:</strong> Muốn cộng điểm vượt mốc 40 điểm, bắt buộc người chơi phải tham gia thi đấu thực tế và được người chơi khác đánh giá tốt.
                  </li>
                  <li>
                    <strong className="text-red-700 font-bold">Vắng mặt hoặc trễ giờ:</strong> Không có mặt check-in hoặc đến trễ quá <strong>{GRACE_MIN} phút</strong> sẽ bị <strong>trừ {NO_SHOW_FP} điểm</strong>.
                  </li>
                </ul>
              </div>

              {/* Mục 2: Điểm Đánh Giá Rating Sau Trận */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">star</span>
                  <h4>2. Thang Điểm Đánh Giá Chất Lượng Sau Trận (Rating)</h4>
                </div>
                <p className="text-gray-500 mb-2.5">
                  Điểm Fair Play được điều chỉnh theo điểm đánh giá trung bình từ các người chơi cùng trận:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-bold">
                  <div className="p-2.5 rounded-xl bg-white border border-red-200">
                    <span className="text-[11px] text-gray-500 block">Trung bình &lt; 1.5★</span>
                    <span className="text-sm font-black text-red-600">-5 Điểm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">Trung bình &lt; 2.5★</span>
                    <span className="text-sm font-black text-gray-500">0 Điểm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-[11px] text-gray-500 block">Trung bình &gt; 4.0★</span>
                    <span className="text-sm font-black text-[#15803D]">+3 Điểm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-300 bg-[#EAF7EE]/50">
                    <span className="text-[11px] text-gray-500 block">Trung bình &gt; 4.5★</span>
                    <span className="text-sm font-black text-[#15803D]">+5 Điểm</span>
                  </div>
                </div>
              </div>

              {/* Mục 3: Cơ Chế Chia Tiền Cọc Sân */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-[#0284C7] text-[18px]">payments</span>
                  <h4>3. Cơ Chế Chia Tiền &amp; Đặt Cọc Sân</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    Chủ kèo (Host) trả trước <strong className="text-gray-900 font-bold">100% tiền sân</strong>: hệ thống đặt ca và trừ ví chủ kèo ngay khi tạo kèo.
                  </li>
                  <li>
                    Mỗi người nhận slot trả đúng mức <strong className="text-gray-900 font-bold">"Giá mỗi người"</strong> hiển thị trên kèo (hệ thống tính, mặc định chia đều tiền sân cho tổng số người chơi). Khoản này được giữ trong Escrow.
                  </li>
                </ul>
              </div>

              {/* Mục 4: Chính Sách Hủy Kèo & Hoàn Cọc Escrow */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">assignment_return</span>
                  <h4>4. Chính Sách Hủy Kèo &amp; Hoàn Điểm Ký Quỹ Escrow</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    <strong className="text-gray-900 font-bold">Người tham gia rời kèo:</strong> trước giờ chơi từ <strong>{LOCK_H} giờ</strong> trở lên được <strong>hoàn 100% Điểm</strong>; trong vòng {LOCK_H} giờ <strong>không được hoàn</strong>.
                  </li>
                  <li>
                    <strong className="text-gray-900 font-bold">Hủy kèo trước mốc {LOCK_H} giờ:</strong> Chủ kèo hủy kèo trước giờ chơi từ <strong>{LOCK_H} giờ</strong> trở lên chỉ bị <strong>trừ {EARLY_FP} điểm FairPlay</strong>, không mất tiền sân; tiền cọc của các thành viên tham gia được hoàn 100% Điểm từ Escrow.
                  </li>
                  <li>
                    <strong className="text-red-700 font-bold">Hủy kèo đơn phương dưới {LOCK_H} giờ (sát giờ):</strong> Sau mốc <strong>{LOCK_H} giờ</strong> trước giờ chơi (kèo đã khóa), nếu chủ kèo vẫn hủy đơn phương sẽ bị trừ <strong>{LATE_PCT}% tiền sân bồi thường</strong> (tính theo Điểm, chia bồi thường cho người tham gia) và <strong>-{LATE_FP} điểm FairPlay</strong>.
                  </li>
                </ul>
              </div>

              {/* Mục 5: Thể Thức Bóng Đá & Bóng Rổ */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">groups</span>
                  <h4>5. Thể Thức Thi Đấu Bóng Đá &amp; Bóng Rổ (Team vs Team)</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    <strong className="text-gray-900 font-bold">Bóng đá:</strong> Hỗ trợ ghép theo định dạng <strong>team 5, team 7, team 11</strong> (5v5, 7v7, 11v11).
                  </li>
                  <li>
                    <strong className="text-gray-900 font-bold">Bóng rổ:</strong> Ghép theo thể thức <strong>team vs team</strong> với các quy mô <strong>team 3, team 5, team 7</strong>.
                  </li>
                  <li>
                    <strong className="text-purple-700 font-bold">Quy chế Fair Play đội:</strong> Đối với thể thức ghép team vs team, việc cộng hoặc trừ điểm Fair Play sẽ áp dụng trực tiếp cho <strong>người đại diện ghép đội</strong>.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setRulesModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md shadow-[#3B6817]/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Đã hiểu &amp; Đồng ý quy chế</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default CommunityFeed
