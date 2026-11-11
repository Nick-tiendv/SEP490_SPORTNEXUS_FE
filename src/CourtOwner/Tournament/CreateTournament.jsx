import { useEffect, useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import {
  addParticipant,
  cancelTournament,
  cancelTournamentInvitation,
  checkInParticipant,
  createTournament,
  deleteTournament,
  executeRandomPairing,
  generateBracket,
  getBracket,
  getMyTournaments,
  getParticipants,
  getSports,
  getTournamentInvitations,
  removeParticipant,
  updateMatchScore,
  updateTournamentInfo,
} from '../../api/owner'
import { getFacilities as getPublicFacilities } from '../../api/player/facilityApi.js'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import TournamentManagePanel from './TournamentManagePanel.jsx'

// categoryType trong body tạo giải phải gửi dạng SỐ (docs/api/02).
const CATEGORY_TYPES = [
  { code: 0, key: 'SINGLES', label: 'Đấu đơn (cá nhân)', hint: 'Người chơi đăng ký cá nhân' },
  { code: 1, key: 'PREMADE_TEAMS', label: 'Đội / đôi cố định', hint: 'Đăng ký theo đội (teamId)' },
  { code: 2, key: 'RANDOM_DOUBLES', label: 'Đôi bốc thăm', hint: 'Đăng ký cá nhân, BTC bốc thăm ghép cặp' },
]
const CATEGORY_TYPE_LABEL = Object.fromEntries(CATEGORY_TYPES.map((type) => [type.key, type.label]))

// Cấp giải: điều kiện Elo mặc định (có thể ghi đè bằng minRating / maxRating / minRatedMatches)
const TIERS = [
  { key: 'AMATEUR', label: 'Phong trào (Amateur)', hint: 'Không xét Elo.' },
  { key: 'SEMI_PRO', label: 'Bán chuyên (Semi-pro)', hint: 'Mặc định Elo ≥ 1200 và ≥ 3 trận giải.' },
  { key: 'PRO', label: 'Chuyên nghiệp (Pro)', hint: 'Mặc định Elo ≥ 1500 và ≥ 10 trận giải.' },
]
const TIER_LABEL = Object.fromEntries(TIERS.map((tier) => [tier.key, tier.label]))
const PURPOSES = [
  { key: 'EXCHANGE', label: 'Giao lưu' },
  { key: 'COMMERCIAL', label: 'Thương mại' },
  { key: 'DEVELOPMENT', label: 'Phát triển chuyên môn (từ Bán chuyên)' },
  { key: 'INTERNAL', label: 'Nội bộ (chỉ người được mời, BTC được thi đấu)' },
]
const INVITATION_STATUS = { PENDING: 'Chờ phản hồi', ACCEPTED: 'Đã nhận', DECLINED: 'Từ chối', CANCELLED: 'Đã thu hồi' }
const BRACKET_FORMATS = [
  { key: '', label: 'Tự chọn thể thức' },
  { key: 'KNOCKOUT', label: 'Loại trực tiếp' },
  { key: 'ROUND_ROBIN', label: 'Vòng tròn' },
  { key: 'GROUP_KNOCKOUT', label: 'Vòng bảng + loại trực tiếp' },
]
const RESULT_TYPES = [
  { key: 'NORMAL', label: 'Thi đấu bình thường' },
  { key: 'WALKOVER', label: 'Xử thắng (đối thủ không ra sân)' },
  { key: 'RETIRED', label: 'Bỏ cuộc giữa trận' },
]
const APPROVAL = {
  PENDING: { label: 'Chờ Admin duyệt', bg: '#FEF3C7', color: '#B45309' },
  REJECTED: { label: 'Bị từ chối', bg: '#FEE2E2', color: '#B91C1C' },
}
const fold = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
const isFootball = (name) => /bong da|futsal|football|soccer/.test(fold(name))
const optionalInt = (value) => (value === '' || value == null ? null : Number(value))

const STATUS = {
  OPEN: { label: 'Đang nhận đăng ký', bg: '#DCFCE7', color: '#15803D' },
  IN_PROGRESS: { label: 'Đang thi đấu', bg: '#DBEAFE', color: '#1D4ED8' },
  FINISHED: { label: 'Đã kết thúc', bg: '#F3E8FF', color: '#7E22CE' },
  CANCELLED: { label: 'Đã hủy', bg: '#FEE2E2', color: '#B91C1C' },
}
const statusOf = (value) => STATUS[String(value || '').toUpperCase()] || { label: value || '—', bg: '#F1F5F9', color: '#475569' }

const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' đ'
const parseAmount = (text) => Number(String(text).replace(/\D/g, '')) || 0
const formatAmountInput = (text) => {
  const amount = parseAmount(text)
  return amount ? new Intl.NumberFormat('vi-VN').format(amount) : ''
}
const prizeTotal = (prizes) => (prizes || []).reduce((sum, prize) => sum + (Number(prize.rewardAmount) || 0), 0)

const emptyChild = () => ({ name: '', categoryType: 0, maxParticipants: 8, minParticipants: '', entryFee: '', prizes: [{ position: 'Vô địch', rewardAmount: '' }] })

// Tải dữ liệu theo khóa: đổi khóa thì tải lại, giữ dữ liệu cũ trong lúc chờ.
function useLoad(load, key, enabled = true) {
  const [state, setState] = useState(null) // { key, data, error }
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    load()
      .then((data) => !cancelled && setState({ key, data, error: '' }))
      .catch((error) => !cancelled && setState({ key, data: null, error: error.message }))
    return () => { cancelled = true }
    // `key` mã hóa mọi tham số của `load`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])
  return { data: state?.data ?? null, error: state?.key === key ? state.error : '', loading: state?.key !== key, key: state?.key }
}

// Trang của chủ sân (/owner/tournament): giải của cơ sở đang chọn
export default function CreateAutomatedTournament() {
  const { facilityId, facility, refreshWallet, loading } = useOwnerContext()
  return <TournamentWorkspace mode="owner" facilityId={facilityId} facility={facility} refreshWallet={refreshWallet} layoutLoading={loading} />
}

// Màn tổ chức giải dùng chung cho chủ sân và người chơi.
// mode = "player": người chơi làm Ban tổ chức — xem mọi giải mình tạo, chọn cơ sở khi tạo, giải chờ Admin duyệt,
// không giữ sân (court-blocks chỉ dành cho chủ sân / Admin).
export function TournamentWorkspace({ mode = 'owner', facilityId: ownerFacilityId, facility: ownerFacility, refreshWallet: refreshOwnerWallet, layoutLoading = false, embedded = false }) {
  const isPlayer = mode === 'player'
  const refreshWallet = refreshOwnerWallet || (async () => {})
  const facilityId = isPlayer ? '' : ownerFacilityId
  const facility = isPlayer ? null : ownerFacility
  const [listToken, setListToken] = useState(0)
  const [childToken, setChildToken] = useState(0)
  const [selectedTournamentId, setSelectedTournamentId] = useState(null)
  const [selectedChildId, setSelectedChildId] = useState(null)

  const [sportsToken, setSportsToken] = useState(0)
  // Chủ sân: 'mine' = giải mình tổ chức; 'facility' = giải người khác tổ chức tại cơ sở (chỉ xem và giữ sân)
  const [scope, setScope] = useState('mine')
  const facilityScope = !isPlayer && scope === 'facility'
  const tournamentsLoad = useLoad(() => getMyTournaments(facilityScope ? 'facility' : undefined), `${listToken}|${scope}`)
  const sportsLoad = useLoad(() => getSports(), `sports|${sportsToken}`)
  const sports = sportsLoad.data || []

  // Giải của cơ sở đang chọn, mới nhất lên trước
  const tournaments = (tournamentsLoad.data || []).filter((item) => isPlayer || String(item.facilityId) === String(facilityId))
  // Người chơi chọn cơ sở tổ chức khi tạo giải
  const facilitiesLoad = useLoad(() => getPublicFacilities(), 'facilities', isPlayer)
  const publicFacilities = (facilitiesLoad.data || []).filter((f) => !f.approvalStatus || String(f.approvalStatus).toUpperCase() === 'APPROVED')
  const tournament = tournaments.find((item) => item.id === selectedTournamentId) || tournaments[0] || null
  const children = tournament?.children || []
  const child = children.find((item) => item.id === selectedChildId) || children[0] || null
  const childStatus = String(child?.status || '').toUpperCase()
  const childId = child?.id || ''
  // Giải người khác tổ chức tại sân mình: chủ sân chỉ xem và giữ sân, không thao tác thi đấu
  const canManage = isPlayer || tournament?.isOrganizer !== false
  const isInternal = String(tournament?.purpose || '').toUpperCase() === 'INTERNAL'
  const [invitationsToken, setInvitationsToken] = useState(0)
  const invitationsLoad = useLoad(() => getTournamentInvitations(childId), `inv|${childId}|${invitationsToken}`, !!childId && isInternal && canManage)
  const invitations = invitationsLoad.key?.startsWith(`inv|${childId}`) ? invitationsLoad.data || [] : []
  const [feeInput, setFeeInput] = useState('')

  const participantsLoad = useLoad(() => getParticipants(childId), `${childId}|${childToken}`, !!childId)
  const bracketLoad = useLoad(() => getBracket(childId), `${childId}|${childToken}`, !!childId)
  const participants = participantsLoad.key?.startsWith(childId) ? participantsLoad.data || [] : []
  const rounds = bracketLoad.key?.startsWith(childId) ? bracketLoad.data || [] : []

  const [busy, setBusy] = useState(false)
  const [newParticipant, setNewParticipant] = useState('')
  const [scoreMatch, setScoreMatch] = useState(null) // match đang nhập điểm
  const [scoreSets, setScoreSets] = useState([])
  const [scoreResultType, setScoreResultType] = useState('NORMAL')
  const [scoreWinnerId, setScoreWinnerId] = useState('')
  const [tiebreak, setTiebreak] = useState({ a: '', b: '' })
  const [bracketFormat, setBracketFormat] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState({ name: '', categoryId: '', children: [emptyChild()] })

  const showToast = (msg, type = 'success') => (type === 'error' ? toast.error(msg) : toast.success(msg))

  const runAction = async (action, successMessage, { reloadList = false, reloadChild = true, after } = {}) => {
    setBusy(true)
    try {
      await action()
      showToast(successMessage)
      if (reloadList) setListToken((value) => value + 1)
      if (reloadChild) setChildToken((value) => value + 1)
      after?.()
      return true
    } catch (error) {
      showToast(error.message, 'error')
      return false
    } finally {
      setBusy(false)
    }
  }

  // ---------- Người tham gia ----------
  const isTeamCategory = child?.categoryType === 'PREMADE_TEAMS'
  // Giải nội bộ: BTC gửi lời mời (BE không thêm thẳng); người được mời chấp nhận mới vào bảng và đóng lệ phí
  const handleAddParticipant = (event) => {
    event.preventDefault()
    const value = newParticipant.trim()
    if (!value) return
    runAction(
      () => addParticipant(childId, isTeamCategory ? { userId: null, phone: null, teamId: value } : { userId: null, phone: value, teamId: null }),
      isTeamCategory ? 'Đã gửi lời mời tới đội trưởng.' : 'Đã gửi lời mời tới vận động viên.',
      { reloadChild: false, after: () => { setNewParticipant(''); setInvitationsToken((v) => v + 1) } },
    )
  }
  const handleCancelInvitation = (invitation) =>
    runAction(() => cancelTournamentInvitation(invitation.id), 'Đã thu hồi lời mời.', { reloadChild: false, after: () => setInvitationsToken((v) => v + 1) })
  // Lệ phí bảng đấu: chỉ sửa khi bảng còn mở và chưa có ai đăng ký (gửi id bảng con)
  const handleSaveFee = (event) => {
    event.preventDefault()
    runAction(() => updateTournamentInfo(childId, { entryFee: parseAmount(feeInput) }), 'Đã cập nhật lệ phí bảng đấu.', { reloadList: true, after: () => setFeeInput('') })
  }
  const handleRemoveParticipant = async (participant) => {
    const name = participant.teamName || participant.fullName
    if (!(await confirmDialog(`Xóa "${name}" khỏi bảng đấu?`))) return
    runAction(() => removeParticipant(childId, participant.participantId), `Đã xóa "${name}" khỏi bảng đấu.`, { reloadList: true })
  }
  const handleCheckIn = (participant) =>
    runAction(() => checkInParticipant(childId, { participantId: participant.participantId, qrCode: null }), `Đã điểm danh "${participant.teamName || participant.fullName}".`)

  // ---------- Bốc thăm & chốt nhánh ----------
  const handleRandomPairing = () => runAction(() => executeRandomPairing(childId), 'Bốc thăm ghép đôi hoàn tất, các cặp đấu đã được tạo.', { reloadList: true })
  const handleGenerateBracket = async () => {
    if (!(await confirmDialog('Chốt danh sách và sinh sơ đồ nhánh đấu? Sau bước này không thể thêm / xóa người tham gia.'))) return
    runAction(() => generateBracket(childId, bracketFormat || undefined), 'Đã chốt danh sách và sinh sơ đồ nhánh đấu. Bảng đấu chuyển sang Đang thi đấu.', { reloadList: true })
  }

  // ---------- Nhập tỉ số ----------
  const openScoreModal = (match) => {
    setScoreMatch(match)
    setScoreSets(match.sets?.length ? match.sets.map((set) => ({ a: String(set.a ?? ''), b: String(set.b ?? '') })) : [{ a: '', b: '' }])
    setScoreResultType(['WALKOVER', 'RETIRED'].includes(match.resultType) ? match.resultType : 'NORMAL')
    setScoreWinnerId(match.winnerId || '')
    setTiebreak({ a: match.tiebreakA != null ? String(match.tiebreakA) : '', b: match.tiebreakB != null ? String(match.tiebreakB) : '' })
  }
  // Tổng tỉ số các hiệp đang nhập (để biết trận hòa → luân lưu / hòa vòng bảng)
  const scoreTotals = scoreSets.reduce((sum, set) => ({ a: sum.a + (Number(set.a) || 0), b: sum.b + (Number(set.b) || 0) }), { a: 0, b: 0 })
  const scoreFilled = scoreSets.some((set) => set.a !== '' || set.b !== '')
  const footballMatch = isFootball(tournament?.categoryName)
  const groupStageMatch = scoreMatch?.stage === 'GROUP' || (rounds.length > 0 && rounds.every((round) => round.stage === 'GROUP'))
  const scoreLevel = scoreResultType === 'NORMAL' && scoreFilled && scoreTotals.a === scoreTotals.b
  const needsTiebreak = scoreLevel && footballMatch && !groupStageMatch
  const isDrawResult = scoreLevel && footballMatch && groupStageMatch
  const handleSaveScore = (event) => {
    event.preventDefault()
    const sets = scoreSets
      .filter((set) => set.a !== '' || set.b !== '')
      .map((set, index) => ({ setNumber: index + 1, scoreP1: Number(set.a) || 0, scoreP2: Number(set.b) || 0 }))
    const payload = { sets: [], scoreP1: null, scoreP2: null, winnerId: null, tiebreakP1: null, tiebreakP2: null, resultType: scoreResultType }
    if (scoreResultType === 'WALKOVER') {
      // Không ra sân: chỉ cần người thắng
      if (!scoreWinnerId) { showToast('Chọn bên được xử thắng.', 'error'); return }
      payload.winnerId = scoreWinnerId
    } else {
      if (!sets.length) { showToast('Vui lòng nhập tỉ số ít nhất 1 hiệp.', 'error'); return }
      payload.sets = sets
      if (scoreResultType === 'RETIRED') {
        if (!scoreWinnerId) { showToast('Chọn bên thắng (bên còn lại bỏ cuộc).', 'error'); return }
        payload.winnerId = scoreWinnerId
      } else if (needsTiebreak) {
        // Loại trực tiếp hòa vẫn phải có luân lưu
        if (tiebreak.a === '' || tiebreak.b === '' || tiebreak.a === tiebreak.b) { showToast('Trận loại trực tiếp hòa: nhập tỉ số luân lưu (không được bằng nhau).', 'error'); return }
        payload.tiebreakP1 = Number(tiebreak.a)
        payload.tiebreakP2 = Number(tiebreak.b)
      }
    }
    runAction(
      () => updateMatchScore(scoreMatch.id, payload),
      isDrawResult ? 'Đã ghi nhận trận hòa.' : 'Đã cập nhật tỉ số. Elo sẽ được cập nhật sau khi hết hạn khiếu nại (15 – 20 phút).',
      { reloadList: true, after: () => { setScoreMatch(null); refreshWallet().catch(() => {}) } },
    )
  }

  // ---------- Hủy / xóa giải ----------
  const handleCancelTournament = (event) => {
    event.preventDefault()
    if (!cancelReason.trim()) {
      showToast('Vui lòng nhập lý do hủy giải.', 'error')
      return
    }
    runAction(() => cancelTournament(tournament.id, cancelReason.trim()), 'Đã hủy giải, hoàn lệ phí cho người tham gia.', {
      reloadList: true,
      after: () => { setShowCancelModal(false); setCancelReason(''); refreshWallet().catch(() => {}) },
    })
  }
  const handleDeleteTournament = async () => {
    if (!(await confirmDialog(`Xóa vĩnh viễn giải "${tournament.name}"?`))) return
    runAction(() => deleteTournament(tournament.id), 'Đã xóa giải đấu.', {
      reloadList: true,
      reloadChild: false,
      after: () => { setSelectedTournamentId(null); setSelectedChildId(null); refreshWallet().catch(() => {}) },
    })
  }

  // ---------- Tạo giải ----------
  // Môn mặc định: môn của giải gần nhất tại cơ sở, nếu không có thì môn đầu tiên.
  const defaultSportId = () => String(tournaments[0]?.categoryId || sports[0]?.id || '')
  const openCreateModal = () => {
    // Lần tải môn trước đó lỗi (vd server khởi động chậm) thì tải lại.
    if (!sports.length) setSportsToken((value) => value + 1)
    setForm({ name: '', facilityId: '', categoryId: defaultSportId(), startDate: '', endDate: '', registrationDeadline: '', rules: '', tier: 'AMATEUR', purpose: 'EXCHANGE', minRating: '', maxRating: '', minRatedMatches: '', children: [emptyChild()] })
    setShowCreateModal(true)
  }
  // Danh sách môn về sau khi form đã mở: chọn sẵn môn mặc định.
  const selectedSportId = form.categoryId || defaultSportId()
  const updateChild = (index, changes) => setForm((prev) => ({ ...prev, children: prev.children.map((item, i) => (i === index ? { ...item, ...changes } : item)) }))
  const updatePrize = (childIndex, prizeIndex, changes) =>
    updateChild(childIndex, { prizes: form.children[childIndex].prizes.map((prize, i) => (i === prizeIndex ? { ...prize, ...changes } : prize)) })

  const handleCreateTournament = (event) => {
    event.preventDefault()
    if (form.children.some((item) => !item.name.trim() || Number(item.maxParticipants) < 2)) {
      showToast('Mỗi bảng đấu cần có tên và tối thiểu 2 người / đội.', 'error')
      return
    }
    if (!selectedSportId) {
      showToast('Vui lòng chọn bộ môn.', 'error')
      return
    }
    if (isPlayer && !form.facilityId) {
      showToast('Vui lòng chọn cơ sở tổ chức giải.', 'error')
      return
    }
    if (form.purpose === 'DEVELOPMENT' && (form.tier || 'AMATEUR') === 'AMATEUR') {
      showToast('Mục đích "Phát triển chuyên môn" chỉ áp dụng cho giải từ Bán chuyên.', 'error')
      return
    }
    if (form.children.some((item) => item.minParticipants !== '' && item.minParticipants != null && (Number(item.minParticipants) < 2 || Number(item.minParticipants) > Number(item.maxParticipants)))) {
      showToast('Số tối thiểu của bảng phải từ 2 và không quá số tối đa.', 'error')
      return
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      showToast('Ngày kết thúc phải sau ngày bắt đầu.', 'error')
      return
    }
    if (form.startDate && form.registrationDeadline && form.registrationDeadline > form.startDate) {
      showToast('Hạn đăng ký phải trước ngày bắt đầu.', 'error')
      return
    }
    const payload = {
      facilityId: isPlayer ? form.facilityId : facilityId,
      categoryId: selectedSportId,
      name: form.name.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      registrationDeadline: form.registrationDeadline || null,
      rules: form.rules?.trim() || null,
      tier: form.tier || 'AMATEUR',
      purpose: form.purpose || 'EXCHANGE',
      minRating: form.tier && form.tier !== 'AMATEUR' ? optionalInt(form.minRating) : null,
      maxRating: form.tier && form.tier !== 'AMATEUR' ? optionalInt(form.maxRating) : null,
      minRatedMatches: form.tier && form.tier !== 'AMATEUR' ? optionalInt(form.minRatedMatches) : null,
      children: form.children.map((item) => ({
        name: item.name.trim(),
        categoryType: Number(item.categoryType),
        maxParticipants: Number(item.maxParticipants),
        minParticipants: optionalInt(item.minParticipants),
        entryFee: parseAmount(item.entryFee),
        prizes: item.prizes
          .filter((prize) => prize.position.trim() && parseAmount(prize.rewardAmount) > 0)
          .map((prize) => ({ position: prize.position.trim(), rewardAmount: parseAmount(prize.rewardAmount) })),
      })),
    }
    runAction(
      () => createTournament(payload),
      isPlayer ? 'Đã gửi giải, chờ Admin duyệt trước khi công khai và nhận đăng ký.' : 'Tạo giải thành công.',
      { reloadList: true, reloadChild: false, after: () => { setShowCreateModal(false); setSelectedTournamentId(null); setSelectedChildId(null) } },
    )
  }

  // Nhà vô địch: người thắng trận cuối cùng khi bảng đã kết thúc
  const finalMatch = rounds.length ? rounds[rounds.length - 1].matches[0] : null
  const champion = childStatus === 'FINISHED' && finalMatch?.winnerId
    ? [finalMatch.a, finalMatch.b].find((side) => side.id && side.id === finalMatch.winnerId)
    : null

  const panelStyle = {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
  }
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box', background: '#FFFFFF' }
  const smallButton = (bg, color, border = 'none') => ({ padding: '6px 12px', borderRadius: '8px', border, background: bg, color, fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 })
  const badge = (status) => {
    const s = statusOf(status)
    return <span style={{ background: s.bg, color: s.color, fontSize: '11.5px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{s.label}</span>
  }
  const modalBackdrop = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }

  return (
    <div className={embedded ? '' : 'snx-page'}>

      {/* HEADER */}
      <div className="snx-page-header">
        {isPlayer ? (
          <div>
            <h2 className="snx-page-title" style={{ fontSize: 22 }}>Giải tôi tổ chức</h2>
            <p className="snx-page-subtitle">Bạn làm Ban tổ chức: tạo giải tại một cơ sở, chờ Admin duyệt, rồi quản lý người tham gia, nhánh đấu, tỉ số và trọng tài. Lệ phí về ví của bạn khi bảng đấu kết thúc.</p>
          </div>
        ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="snx-page-eyebrow">
              Kinh doanh
            </span>
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>{facility?.name || ''}</span>
          </div>
          <h1 className="snx-page-title">Giải đấu</h1>
          <p className="snx-page-subtitle">
            Tạo giải với nhiều bảng đấu, quản lý người tham gia, bốc thăm ghép đôi, chốt nhánh loại trực tiếp và nhập tỉ số từng trận.
          </p>
        </div>
        )}
        <button
          onClick={openCreateModal}
          disabled={!isPlayer && (!facilityId || facility?.approvalStatus !== 'APPROVED')}
          title={facility && facility.approvalStatus !== 'APPROVED' ? 'Cơ sở chưa được duyệt, chưa thể tạo giải' : undefined}
          className="snx-btn snx-btn--primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add_circle</span>
          Tạo giải đấu mới
        </button>
      </div>

      {!isPlayer && !layoutLoading && !facilityId && <div style={{ marginBottom: 24 }}><NoFacilityState what="tổ chức giải đấu" /></div>}
      {facility && facility.approvalStatus !== 'APPROVED' && <div className="snx-alert snx-alert--info" style={{ marginBottom: 16 }}>Cơ sở {facility.name} chưa được Admin duyệt nên chưa tạo được giải.</div>}

      {/* DANH SÁCH GIẢI CỦA CƠ SỞ */}
      <div style={{ ...panelStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{isPlayer ? 'Giải tôi tạo' : facilityScope ? 'Giải người khác tổ chức tại cơ sở' : 'Giải đấu của cơ sở'} ({tournaments.length})</h3>
          {!isPlayer && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {[['mine', 'Tôi tổ chức'], ['facility', 'Giải tại sân của tôi']].map(([key, label]) => (
                <button key={key} type="button" onClick={() => { setScope(key); setSelectedTournamentId(null); setSelectedChildId(null) }}
                  style={smallButton(scope === key ? '#1D4ED8' : '#FFFFFF', scope === key ? '#FFFFFF' : '#1D4ED8', '1px solid #BFDBFE')}>{label}</button>
              ))}
            </div>
          )}
        </div>
        {tournamentsLoad.error ? (
          <div style={{ color: '#B91C1C', fontWeight: 700 }}>{tournamentsLoad.error}</div>
        ) : !tournamentsLoad.data ? (
          <div style={{ color: '#475569', fontWeight: 600 }}>Đang tải danh sách giải...</div>
        ) : tournaments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{facilityScope ? 'Chưa có giải nào do người khác tổ chức tại cơ sở này.' : `${isPlayer ? 'Bạn chưa tạo giải nào' : 'Cơ sở chưa có giải đấu nào'}. Bấm "Tạo giải đấu mới" để bắt đầu.`}</div>
        ) : (
          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
            {tournaments.map((item) => {
              const active = item.id === tournament?.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setSelectedTournamentId(item.id); setSelectedChildId(null) }}
                  style={{
                    minWidth: '260px',
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: active ? '2px solid #D97706' : '1px solid #E2E8F0',
                    background: active ? '#FFFBEB' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>{item.categoryName || 'Giải đấu'}</span>
                    {APPROVAL[String(item.approvalStatus || '').toUpperCase()]
                      ? <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: APPROVAL[String(item.approvalStatus).toUpperCase()].bg, color: APPROVAL[String(item.approvalStatus).toUpperCase()].color }}>{APPROVAL[String(item.approvalStatus).toUpperCase()].label}</span>
                      : badge(item.status)}
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
                    {item.totalChildren} bảng đấu • {item.totalParticipants} người / đội tham gia
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {tournament && (
        <>
          {/* THÔNG TIN GIẢI & BẢNG ĐẤU */}
          <div style={{ ...panelStyle, marginBottom: '24px' }}>
            {tournament.imageUrl && <img src={tournament.imageUrl} alt={`Ảnh bìa giải ${tournament.name}`} style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{tournament.name}</h2>
                  {badge(tournament.status)}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  {[tournament.categoryName, tournament.facilityName, `${tournament.totalChildren} bảng đấu`, TIER_LABEL[String(tournament.tier || '').toUpperCase()]].filter(Boolean).join(' • ')}
                </div>
                {!canManage && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '10px', background: '#EFF6FF', color: '#1E40AF', fontSize: '12.5px', fontWeight: 600 }}>
                    Giải do {tournament.organizerName || 'người khác'} tổ chức tại cơ sở của bạn: bạn xem lịch và giữ khung giờ sân cho giải ở phần bên dưới.
                  </div>
                )}
                {isInternal && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '10px', background: '#F5F3FF', color: '#5B21B6', fontSize: '12.5px', fontWeight: 600 }}>
                    Giải nội bộ: không hiện công khai, người chơi chỉ tham gia qua lời mời của Ban tổ chức.
                  </div>
                )}
                {String(tournament.approvalStatus || '').toUpperCase() === 'PENDING' && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '10px', background: '#FEF3C7', color: '#92400E', fontSize: '12.5px', fontWeight: 600 }}>
                    Giải đang chờ Admin duyệt: chưa hiện công khai và chưa nhận đăng ký.
                  </div>
                )}
                {String(tournament.approvalStatus || '').toUpperCase() === 'REJECTED' && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '10px', background: '#FEE2E2', color: '#991B1B', fontSize: '12.5px', fontWeight: 600 }}>
                    Admin đã từ chối giải{tournament.approvalNote ? `: ${tournament.approvalNote}` : '.'}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {canManage && !['CANCELLED', 'FINISHED'].includes(String(tournament.status).toUpperCase()) && (
                  <button onClick={() => setShowCancelModal(true)} disabled={busy} style={smallButton('#FFF7ED', '#C2410C', '1px solid #FED7AA')}>Hủy giải</button>
                )}
                {canManage && (String(tournament.status).toUpperCase() === 'CANCELLED' || tournament.totalParticipants === 0) && (
                  <button onClick={handleDeleteTournament} disabled={busy} style={smallButton('#FEE2E2', '#B91C1C')}>Xóa giải</button>
                )}
              </div>
            </div>

            {/* Tabs bảng đấu con */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {children.map((item) => {
                const active = item.id === child?.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedChildId(item.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: active ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                      background: active ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{item.name}</span>
                      {badge(item.status)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                      {CATEGORY_TYPE_LABEL[item.categoryType] || item.categoryTypeName} • {item.currentParticipants}/{item.maxParticipants} • Lệ phí {formatVND(item.entryFee)}
                    </div>
                  </button>
                )
              })}
            </div>

            {child && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', padding: '12px 16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>
                <span>📋 {child.registrationGuide || child.categoryTypeName}</span>
                <span>
                  🏆 Giải thưởng (BTC trao ngoài hệ thống):{' '}
                  {child.prizes?.length ? child.prizes.map((prize) => `${prize.position} ${formatVND(prize.rewardAmount)}`).join(' • ') : 'Không có'}
                  {child.prizes?.length > 0 && ` (tổng ${formatVND(prizeTotal(child.prizes))})`}
                </span>
              </div>
            )}
            {child && canManage && childStatus === 'OPEN' && participants.length === 0 && (
              <form onSubmit={handleSaveFee} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>Lệ phí bảng "{child.name}" (chưa có ai đăng ký):</span>
                <input inputMode="numeric" value={feeInput} onChange={(event) => setFeeInput(formatAmountInput(event.target.value))} placeholder={formatVND(child.entryFee)} style={{ ...inputStyle, width: '160px' }} />
                <button type="submit" disabled={busy || feeInput === ''} style={smallButton('#1D4ED8', '#FFFFFF')}>Lưu lệ phí</button>
              </form>
            )}
          </div>

          {child && champion && (
            <div style={{ borderRadius: '20px', padding: '22px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(180, 83, 9, 0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>emoji_events</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Nhà vô địch {child.name}</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{champion.name}</div>
              </div>
            </div>
          )}

          {child && canManage && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
              {/* NGƯỜI THAM GIA */}
              <div style={panelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                    {isTeamCategory ? 'Đội' : 'Vận động viên'} Tham Gia ({participants.length}/{child.maxParticipants})
                  </h3>
                  {childStatus === 'OPEN' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {child.categoryType === 'RANDOM_DOUBLES' && (
                        <button onClick={handleRandomPairing} disabled={busy} style={smallButton('#EFF6FF', '#1D4ED8', '1px solid #BFDBFE')}>🎲 Bốc thăm ghép đôi</button>
                      )}
                      <select value={bracketFormat} onChange={(event) => setBracketFormat(event.target.value)} aria-label="Thể thức thi đấu" style={{ ...inputStyle, width: 'auto', padding: '6px 8px', fontSize: '12.5px' }}>
                        {BRACKET_FORMATS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                      </select>
                      <button onClick={handleGenerateBracket} disabled={busy || participants.length < 2} style={smallButton('#D97706', '#FFFFFF')}>Chốt danh sách & sinh nhánh</button>
                    </div>
                  )}
                </div>

                {childStatus === 'OPEN' && isInternal && (
                  <>
                    <form onSubmit={handleAddParticipant} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input
                        value={newParticipant}
                        onChange={(event) => setNewParticipant(event.target.value)}
                        placeholder={isTeamCategory ? 'Nhập mã đội (teamId) để mời' : 'Nhập số điện thoại VĐV để mời'}
                        style={inputStyle}
                      />
                      <button type="submit" disabled={busy || !newParticipant.trim()} style={{ ...smallButton('#10B981', '#FFFFFF'), whiteSpace: 'nowrap' }}>+ Mời</button>
                    </form>
                    {invitations.length > 0 && (
                      <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>Lời mời đã gửi ({invitations.length})</div>
                        {invitations.map((invitation) => (
                          <div key={invitation.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12.5px' }}>
                            <span style={{ flex: 1, fontWeight: 600, color: '#0F172A' }}>{invitation.teamName ? `${invitation.teamName} (${invitation.inviteeName})` : invitation.inviteeName}</span>
                            <span style={{ color: '#475569' }}>{INVITATION_STATUS[invitation.status] || invitation.status}</span>
                            {invitation.status === 'PENDING' && (
                              <button type="button" onClick={() => handleCancelInvitation(invitation)} disabled={busy} style={smallButton('#FEE2E2', '#B91C1C')}>Thu hồi</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {childStatus === 'OPEN' && !isInternal && (
                  <div style={{ marginBottom: '14px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                    Giải công khai: người chơi tự đăng ký. Muốn mời người, hãy tạo giải với mục đích "Nội bộ".
                  </div>
                )}

                {participantsLoad.error ? (
                  <div style={{ color: '#B91C1C', fontWeight: 700 }}>{participantsLoad.error}</div>
                ) : participantsLoad.loading && participants.length === 0 ? (
                  <div style={{ color: '#475569', fontWeight: 600 }}>Đang tải...</div>
                ) : participants.length === 0 ? (
                  <div style={{ padding: '18px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Chưa có người đăng ký.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
                    {participants.map((participant) => (
                      <div key={participant.participantId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: participant.isCheckedIn ? '#F0FDF4' : '#FFFFFF' }}>
                        {participant.avatarUrl ? (
                          <img src={participant.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#475569' }}>
                            {(participant.teamName || participant.fullName || '?').charAt(0)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{participant.teamName || participant.fullName}</div>
                          <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {participant.teamName
                              ? participant.teamMembers?.map((member) => member.fullName).join(', ')
                              : `@${participant.username || ''}`}
                            {' • '}
                            {participant.paymentStatus === 'PAID' ? 'Đã đóng lệ phí' : participant.paymentStatus}
                          </div>
                        </div>
                        {participant.isCheckedIn ? (
                          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#15803D' }}>✓ Đã điểm danh</span>
                        ) : (
                          childStatus !== 'CANCELLED' && childStatus !== 'FINISHED' && (
                            <button onClick={() => handleCheckIn(participant)} disabled={busy} style={smallButton('#F0FDF4', '#15803D', '1px solid #BBF7D0')}>Điểm danh</button>
                          )
                        )}
                        {childStatus === 'OPEN' && (
                          <button onClick={() => handleRemoveParticipant(participant)} disabled={busy} title="Xóa khỏi bảng đấu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SƠ ĐỒ NHÁNH ĐẤU */}
              <div style={{ ...panelStyle, minWidth: 0 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Sơ đồ nhánh đấu</h3>
                <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                  {childStatus === 'IN_PROGRESS' ? 'Bấm vào trận đã đủ 2 đấu thủ để nhập tỉ số.' : childStatus === 'OPEN' ? 'Sơ đồ được sinh khi chốt danh sách.' : ''}
                </p>
                {bracketLoad.error ? (
                  <div style={{ color: '#B91C1C', fontWeight: 700 }}>{bracketLoad.error}</div>
                ) : rounds.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600, border: '1px dashed #CBD5E1', borderRadius: '12px' }}>
                    {bracketLoad.loading ? 'Đang tải...' : 'Chưa có sơ đồ nhánh đấu.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {rounds.map((round) => (
                      <div key={round.label} style={{ minWidth: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '14px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', textAlign: 'center', textTransform: 'uppercase' }}>{round.label}</div>
                        {round.matches.map((match) => {
                          const ready = childStatus === 'IN_PROGRESS' && match.a.id && match.b.id
                          const setText = match.sets?.length ? match.sets.map((set) => `${set.a}-${set.b}`).join(', ') : ''
                          return (
                            <div
                              key={match.id}
                              onClick={() => ready && openScoreModal(match)}
                              style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px', background: '#FFFFFF', cursor: ready ? 'pointer' : 'default', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            >
                              {[['a', match.scoreA], ['b', match.scoreB]].map(([side, score]) => {
                                const info = match[side]
                                const won = match.winnerId && info.id === match.winnerId
                                return (
                                  <div
                                    key={side}
                                    style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '6px 8px', borderRadius: '6px', marginBottom: side === 'a' ? '6px' : 0, background: won ? '#DCFCE7' : '#F8FAFC', border: '1px solid #E2E8F0' }}
                                  >
                                    <span style={{ fontSize: '13px', fontWeight: won ? 900 : 700, color: info.name ? '#0F172A' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {info.name || 'Chờ xác định'}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{score ?? ''}</span>
                                  </div>
                                )
                              })}
                              {(setText || match.court || match.isDraw || ['WALKOVER', 'RETIRED'].includes(match.resultType)) && (
                                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '6px' }}>
                                  {match.isDraw && <span style={{ color: '#1D4ED8', fontWeight: 700 }}>Hòa • </span>}
                                  {match.resultType === 'WALKOVER' && <span style={{ color: '#B45309', fontWeight: 700 }}>Xử thắng • </span>}
                                  {match.resultType === 'RETIRED' && <span style={{ color: '#B45309', fontWeight: 700 }}>Bỏ cuộc • </span>}
                                  {setText && <span>Hiệp: {setText}</span>}
                                  {match.tiebreakA != null && match.tiebreakB != null && <span> (luân lưu {match.tiebreakA}-{match.tiebreakB})</span>}
                                  {match.court && <span>{setText ? ' • ' : ''}{match.court}</span>}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <TournamentManagePanel
            tournament={tournament}
            child={child}
            rounds={rounds}
            facilityId={isPlayer ? tournament.facilityId : facilityId}
            mode={mode}
            courtOnly={!canManage}
            onChanged={() => { setListToken((value) => value + 1); setChildToken((value) => value + 1) }}
          />
        </>
      )}

      {/* MODAL: NHẬP TỈ SỐ */}
      {scoreMatch && (
        <div style={modalBackdrop}>
          <form onSubmit={handleSaveScore} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Nhập tỉ số trận đấu</h3>
              <button type="button" onClick={() => setScoreMatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
              Nhập điểm từng hiệp. Hệ thống tự kiểm tra luật điểm của môn {tournament?.categoryName} và tự xác định người thắng. Elo cập nhật sau khi hết hạn khiếu nại (15 – 20 phút).
            </p>
            <select value={scoreResultType} onChange={(event) => setScoreResultType(event.target.value)} aria-label="Kiểu kết quả" style={{ ...inputStyle, marginBottom: '12px' }}>
              {RESULT_TYPES.map((type) => <option key={type.key} value={type.key}>{type.label}</option>)}
            </select>
            {scoreResultType !== 'NORMAL' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[scoreMatch.a, scoreMatch.b].map((side) => (
                  <button key={side.id} type="button" onClick={() => setScoreWinnerId(side.id)}
                    style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: scoreWinnerId === side.id ? '2px solid #15803D' : '1px solid #CBD5E1', background: scoreWinnerId === side.id ? '#DCFCE7' : '#FFFFFF', color: '#0F172A' }}>
                    {scoreWinnerId === side.id ? '✓ ' : ''}{side.name} thắng
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 32px', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
              <span />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreMatch.a.name}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreMatch.b.name}</span>
              <span />
            </div>
            {scoreResultType !== 'WALKOVER' && scoreSets.map((set, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 32px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Hiệp {index + 1}</span>
                {['a', 'b'].map((side) => (
                  <input
                    key={side}
                    inputMode="numeric"
                    maxLength={3}
                    value={set[side]}
                    onChange={(event) => setScoreSets((prev) => prev.map((item, i) => (i === index ? { ...item, [side]: event.target.value.replace(/\D/g, '') } : item)))}
                    style={{ ...inputStyle, textAlign: 'center', fontWeight: 600, fontSize: '15px' }}
                  />
                ))}
                {scoreSets.length > 1 ? (
                  <button type="button" onClick={() => setScoreSets((prev) => prev.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                ) : <span />}
              </div>
            ))}
            {scoreResultType !== 'WALKOVER' && scoreSets.length < 5 && (
              <button type="button" onClick={() => setScoreSets((prev) => [...prev, { a: '', b: '' }])} style={{ ...smallButton('#FFFFFF', '#334155', '1px dashed #CBD5E1'), marginBottom: '18px' }}>
                + Thêm hiệp
              </button>
            )}
            {needsTiebreak && (
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 32px', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>Luân lưu</span>
                {['a', 'b'].map((side) => (
                  <input key={side} inputMode="numeric" maxLength={2} value={tiebreak[side]}
                    onChange={(event) => setTiebreak((prev) => ({ ...prev, [side]: event.target.value.replace(/\D/g, '') }))}
                    style={{ ...inputStyle, textAlign: 'center', fontWeight: 600, fontSize: '15px' }} />
                ))}
                <span />
              </div>
            )}
            {isDrawResult && (
              <div style={{ marginBottom: '14px', padding: '8px 12px', borderRadius: '10px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '12.5px', fontWeight: 600 }}>
                Tỉ số bằng nhau ở vòng bảng / vòng tròn: trận được ghi nhận là Hòa (không có người thắng).
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setScoreMatch(null)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#1D4ED8', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Đang lưu...' : 'Lưu tỉ số'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: HỦY GIẢI */}
      {showCancelModal && tournament && (
        <div style={modalBackdrop}>
          <form onSubmit={handleCancelTournament} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>Hủy giải "{tournament.name}"</h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#B45309', fontWeight: 600 }}>
              Mọi bảng đấu chưa kết thúc sẽ bị hủy: hoàn lệ phí cho người tham gia và trả lại ca sân.
            </p>
            <textarea
              required
              maxLength={500}
              rows={3}
              placeholder="Lý do hủy giải (bắt buộc)"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '18px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowCancelModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Đóng</button>
              <button type="submit" disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#DC2626', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Đang hủy...' : 'Xác nhận hủy giải'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: TẠO GIẢI */}
      {showCreateModal && (
        <div style={{ ...modalBackdrop, alignItems: 'flex-start', overflowY: 'auto' }}>
          <form onSubmit={handleCreateTournament} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '760px', width: '100%', padding: '26px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Tạo giải đấu mới</h3>
                {isPlayer ? (
                  <select value={form.facilityId || ''} onChange={(event) => setForm((prev) => ({ ...prev, facilityId: event.target.value }))} style={{ ...inputStyle, marginTop: '6px', minWidth: '260px' }} aria-label="Cơ sở tổ chức">
                    <option value="">{facilitiesLoad.loading ? 'Đang tải cơ sở…' : '— Chọn cơ sở tổ chức —'}</option>
                    {publicFacilities.map((f) => <option key={f.id} value={f.id}>{f.name}{f.address ? ` — ${f.address}` : ''}</option>)}
                  </select>
                ) : (
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Tại {facility?.name}</div>
                )}
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Tên giải đấu</label>
                <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="VD: Giải cầu lông mùa đông 2026" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Bộ môn</label>
                <select
                  required
                  value={selectedSportId}
                  disabled={!sports.length}
                  onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  style={inputStyle}
                >
                  {!sports.length && <option value="">{sportsLoad.error ? 'Không tải được' : 'Đang tải...'}</option>}
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>{sport.name}</option>
                  ))}
                </select>
                {sportsLoad.error && !sports.length && (
                  <button type="button" onClick={() => setSportsToken((value) => value + 1)} style={{ marginTop: '4px', background: 'none', border: 'none', padding: 0, color: '#1D4ED8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Tải lại danh sách môn
                  </button>
                )}
              </div>
            </div>

            {/* Lịch giải (không bắt buộc): bỏ trống hạn đăng ký thì BE lấy 24h trước ngày bắt đầu */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              {[['startDate', 'Ngày bắt đầu'], ['endDate', 'Ngày kết thúc'], ['registrationDeadline', 'Hạn đăng ký']].map(([key, label]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>{label}</label>
                  <input type="date" value={form[key] || ''} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Cấp giải</label>
                <select value={form.tier || 'AMATEUR'} onChange={(event) => setForm((prev) => ({ ...prev, tier: event.target.value, purpose: event.target.value === 'AMATEUR' && prev.purpose === 'DEVELOPMENT' ? 'EXCHANGE' : prev.purpose }))} style={inputStyle}>
                  {TIERS.map((tier) => <option key={tier.key} value={tier.key}>{tier.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Mục đích</label>
                <select value={form.purpose || 'EXCHANGE'} onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))} style={inputStyle}>
                  {PURPOSES.map((purpose) => <option key={purpose.key} value={purpose.key} disabled={purpose.key === 'DEVELOPMENT' && (form.tier || 'AMATEUR') === 'AMATEUR'}>{purpose.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, marginBottom: '10px' }}>{TIERS.find((tier) => tier.key === (form.tier || 'AMATEUR'))?.hint}</div>
            {form.tier && form.tier !== 'AMATEUR' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                {[['minRating', 'Elo tối thiểu'], ['maxRating', 'Elo tối đa'], ['minRatedMatches', 'Số trận giải tối thiểu']].map(([key, label]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>{label}</label>
                    <input type="number" min={0} max={key === 'minRatedMatches' ? 500 : 3000} placeholder="Theo cấp giải" value={form[key] ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} style={inputStyle} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Điều lệ giải (không bắt buộc)</label>
              <textarea rows={2} maxLength={4000} value={form.rules || ''} onChange={(event) => setForm((prev) => ({ ...prev, rules: event.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>Bảng đấu ({form.children.length})</div>
            {form.children.map((item, index) => (
              <div key={index} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px', marginBottom: '12px', background: '#F8FAFC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 130px 1fr 32px', gap: '10px', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Tên bảng</label>
                    <input required value={item.name} onChange={(event) => updateChild(index, { name: event.target.value })} placeholder="VD: Đơn nam" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Thể thức</label>
                    <select value={item.categoryType} onChange={(event) => updateChild(index, { categoryType: Number(event.target.value) })} style={inputStyle}>
                      {CATEGORY_TYPES.map((type) => (
                        <option key={type.code} value={type.code}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Tối thiểu / tối đa</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input type="number" min={2} max={item.maxParticipants || 128} placeholder="2" title="Số tối thiểu để thi đấu" value={item.minParticipants ?? ''} onChange={(event) => updateChild(index, { minParticipants: event.target.value })} style={inputStyle} />
                      <input required type="number" min={2} max={128} title="Số tối đa" value={item.maxParticipants} onChange={(event) => updateChild(index, { maxParticipants: event.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Lệ phí (đ)</label>
                    <input inputMode="numeric" value={item.entryFee} onChange={(event) => updateChild(index, { entryFee: formatAmountInput(event.target.value) })} placeholder="0" style={inputStyle} />
                  </div>
                  {form.children.length > 1 ? (
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, children: prev.children.filter((_, i) => i !== index) }))} title="Xóa bảng" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', paddingBottom: '8px' }}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  ) : <span />}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, margin: '6px 0 10px' }}>{CATEGORY_TYPES[item.categoryType]?.hint}</div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giải thưởng (chỉ hiển thị, BTC tự trao ngoài hệ thống)</div>
                {item.prizes.map((prize, prizeIndex) => (
                  <div key={prizeIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: '8px', marginBottom: '6px' }}>
                    <input value={prize.position} onChange={(event) => updatePrize(index, prizeIndex, { position: event.target.value })} placeholder="Hạng (VD: Vô địch)" style={inputStyle} />
                    <input inputMode="numeric" value={prize.rewardAmount} onChange={(event) => updatePrize(index, prizeIndex, { rewardAmount: formatAmountInput(event.target.value) })} placeholder="Tiền thưởng (đ)" style={inputStyle} />
                    <button type="button" onClick={() => updateChild(index, { prizes: item.prizes.filter((_, i) => i !== prizeIndex) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateChild(index, { prizes: [...item.prizes, { position: ['Vô địch', 'Á quân', 'Hạng ba'][item.prizes.length] || '', rewardAmount: '' }] })}
                  style={smallButton('#FFFFFF', '#334155', '1px dashed #CBD5E1')}
                >
                  + Thêm giải thưởng
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, children: [...prev.children, emptyChild()] }))} style={{ ...smallButton('#EFF6FF', '#1D4ED8', '1px solid #BFDBFE'), marginBottom: '18px' }}>
              + Thêm bảng đấu
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '11px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={busy} style={{ padding: '11px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Đang tạo...' : 'Tạo giải đấu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
