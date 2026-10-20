import { useEffect, useState } from 'react'
import {
  addParticipant,
  cancelTournament,
  checkInParticipant,
  createTournament,
  deleteTournament,
  executeRandomPairing,
  generateBracket,
  getBracket,
  getMyTournaments,
  getParticipants,
  getSports,
  removeParticipant,
  updateMatchScore,
} from '../api/owner'
import { useOwnerContext } from './ownerContext.js'

// categoryType trong body tạo giải phải gửi dạng SỐ (docs/api/02).
const CATEGORY_TYPES = [
  { code: 0, key: 'SINGLES', label: 'Đấu đơn (cá nhân)', hint: 'Người chơi đăng ký cá nhân' },
  { code: 1, key: 'PREMADE_TEAMS', label: 'Đội / đôi cố định', hint: 'Đăng ký theo đội (teamId)' },
  { code: 2, key: 'RANDOM_DOUBLES', label: 'Đôi bốc thăm', hint: 'Đăng ký cá nhân, BTC bốc thăm ghép cặp' },
]
const CATEGORY_TYPE_LABEL = Object.fromEntries(CATEGORY_TYPES.map((type) => [type.key, type.label]))

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

const emptyChild = () => ({ name: '', categoryType: 0, maxParticipants: 8, entryFee: '', prizes: [{ position: 'Vô địch', rewardAmount: '' }] })

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

export default function CreateAutomatedTournament() {
  const { facilityId, facility, wallet, refreshWallet } = useOwnerContext()
  const [listToken, setListToken] = useState(0)
  const [childToken, setChildToken] = useState(0)
  const [selectedTournamentId, setSelectedTournamentId] = useState(null)
  const [selectedChildId, setSelectedChildId] = useState(null)

  const [sportsToken, setSportsToken] = useState(0)
  const tournamentsLoad = useLoad(() => getMyTournaments(), `${listToken}`)
  const sportsLoad = useLoad(() => getSports(), `sports|${sportsToken}`)
  const sports = sportsLoad.data || []

  // Giải của cơ sở đang chọn, mới nhất lên trước
  const tournaments = (tournamentsLoad.data || []).filter((item) => String(item.facilityId) === String(facilityId))
  const tournament = tournaments.find((item) => item.id === selectedTournamentId) || tournaments[0] || null
  const children = tournament?.children || []
  const child = children.find((item) => item.id === selectedChildId) || children[0] || null
  const childStatus = String(child?.status || '').toUpperCase()
  const childId = child?.id || ''

  const participantsLoad = useLoad(() => getParticipants(childId), `${childId}|${childToken}`, !!childId)
  const bracketLoad = useLoad(() => getBracket(childId), `${childId}|${childToken}`, !!childId)
  const participants = participantsLoad.key?.startsWith(childId) ? participantsLoad.data || [] : []
  const rounds = bracketLoad.key?.startsWith(childId) ? bracketLoad.data || [] : []

  const [busy, setBusy] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [newParticipant, setNewParticipant] = useState('')
  const [scoreMatch, setScoreMatch] = useState(null) // match đang nhập điểm
  const [scoreSets, setScoreSets] = useState([])
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState({ name: '', categoryId: '', children: [emptyChild()] })

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

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
  const handleAddParticipant = (event) => {
    event.preventDefault()
    const value = newParticipant.trim()
    if (!value) return
    runAction(
      () => addParticipant(childId, isTeamCategory ? { userId: null, phone: null, teamId: value } : { userId: null, phone: value, teamId: null }),
      isTeamCategory ? 'Đã thêm đội vào bảng đấu.' : 'Đã thêm vận động viên vào bảng đấu.',
      { reloadList: true, after: () => setNewParticipant('') },
    )
  }
  const handleRemoveParticipant = (participant) => {
    const name = participant.teamName || participant.fullName
    if (!window.confirm(`Xóa "${name}" khỏi bảng đấu?`)) return
    runAction(() => removeParticipant(childId, participant.participantId), `Đã xóa "${name}" khỏi bảng đấu.`, { reloadList: true })
  }
  const handleCheckIn = (participant) =>
    runAction(() => checkInParticipant(childId, { participantId: participant.participantId, qrCode: null }), `Đã điểm danh "${participant.teamName || participant.fullName}".`)

  // ---------- Bốc thăm & chốt nhánh ----------
  const handleRandomPairing = () => runAction(() => executeRandomPairing(childId), 'Bốc thăm ghép đôi hoàn tất, các cặp đấu đã được tạo.', { reloadList: true })
  const handleGenerateBracket = () => {
    if (!window.confirm('Chốt danh sách và sinh sơ đồ nhánh đấu? Sau bước này không thể thêm / xóa người tham gia.')) return
    runAction(() => generateBracket(childId), 'Đã chốt danh sách và sinh sơ đồ nhánh đấu. Bảng đấu chuyển sang Đang thi đấu.', { reloadList: true })
  }

  // ---------- Nhập tỉ số ----------
  const openScoreModal = (match) => {
    setScoreMatch(match)
    setScoreSets(match.sets?.length ? match.sets.map((set) => ({ a: String(set.a ?? ''), b: String(set.b ?? '') })) : [{ a: '', b: '' }])
  }
  const handleSaveScore = (event) => {
    event.preventDefault()
    const sets = scoreSets
      .filter((set) => set.a !== '' || set.b !== '')
      .map((set, index) => ({ setNumber: index + 1, scoreP1: Number(set.a) || 0, scoreP2: Number(set.b) || 0 }))
    if (!sets.length) {
      showToast('Vui lòng nhập tỉ số ít nhất 1 hiệp.', 'error')
      return
    }
    runAction(
      () => updateMatchScore(scoreMatch.id, { sets, scoreP1: null, scoreP2: null, winnerId: null }),
      'Đã cập nhật tỉ số, đấu thủ thắng được đưa lên vòng sau.',
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
    runAction(() => cancelTournament(tournament.id, cancelReason.trim()), 'Đã hủy giải, hoàn lệ phí cho người tham gia và trả quỹ thưởng chưa dùng.', {
      reloadList: true,
      after: () => { setShowCancelModal(false); setCancelReason(''); refreshWallet().catch(() => {}) },
    })
  }
  const handleDeleteTournament = () => {
    if (!window.confirm(`Xóa vĩnh viễn giải "${tournament.name}"?`)) return
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
    setForm({ name: '', categoryId: defaultSportId(), children: [emptyChild()] })
    setShowCreateModal(true)
  }
  // Danh sách môn về sau khi form đã mở: chọn sẵn môn mặc định.
  const selectedSportId = form.categoryId || defaultSportId()
  const updateChild = (index, changes) => setForm((prev) => ({ ...prev, children: prev.children.map((item, i) => (i === index ? { ...item, ...changes } : item)) }))
  const updatePrize = (childIndex, prizeIndex, changes) =>
    updateChild(childIndex, { prizes: form.children[childIndex].prizes.map((prize, i) => (i === prizeIndex ? { ...prize, ...changes } : prize)) })
  const formPrizeFund = form.children.reduce((sum, item) => sum + item.prizes.reduce((s, prize) => s + parseAmount(prize.rewardAmount), 0), 0)
  const availableBalance = Number(wallet?.availableBalance ?? wallet?.balance ?? 0)

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
    const payload = {
      facilityId,
      categoryId: selectedSportId,
      name: form.name.trim(),
      children: form.children.map((item) => ({
        name: item.name.trim(),
        categoryType: Number(item.categoryType),
        maxParticipants: Number(item.maxParticipants),
        entryFee: parseAmount(item.entryFee),
        prizes: item.prizes
          .filter((prize) => prize.position.trim() && parseAmount(prize.rewardAmount) > 0)
          .map((prize) => ({ position: prize.position.trim(), rewardAmount: parseAmount(prize.rewardAmount) })),
      })),
    }
    runAction(
      () => createTournament(payload),
      formPrizeFund ? `Tạo giải thành công. Đã giữ ${formatVND(formPrizeFund)} trong ví làm quỹ thưởng.` : 'Tạo giải thành công.',
      { reloadList: true, reloadChild: false, after: () => { setShowCreateModal(false); setSelectedTournamentId(null); setSelectedChildId(null); refreshWallet().catch(() => {}) } },
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
    return <span style={{ background: s.bg, color: s.color, fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{s.label}</span>
  }
  const modalBackdrop = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: toastMessage.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '440px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{toastMessage.type === 'error' ? 'error' : 'check_circle'}</span>
          {toastMessage.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ ...panelStyle, padding: '26px 32px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Tournament Manager
            </span>
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>{facility?.name || ''}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>Giải Đấu & Sơ Đồ Nhánh Đấu</h1>
          <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
            Tạo giải với nhiều bảng đấu, quản lý người tham gia, bốc thăm ghép đôi, chốt nhánh loại trực tiếp và nhập tỉ số từng trận.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!facilityId || facility?.approvalStatus !== 'APPROVED'}
          title={facility && facility.approvalStatus !== 'APPROVED' ? 'Cơ sở chưa được duyệt, chưa thể tạo giải' : undefined}
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 24px',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(217, 119, 6, 0.3)',
            opacity: !facilityId || facility?.approvalStatus !== 'APPROVED' ? 0.5 : 1,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add_circle</span>
          Tạo Giải Đấu Mới
        </button>
      </div>

      {/* DANH SÁCH GIẢI CỦA CƠ SỞ */}
      <div style={{ ...panelStyle, marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Giải Đấu Của Cơ Sở ({tournaments.length})</h3>
        {tournamentsLoad.error ? (
          <div style={{ color: '#B91C1C', fontWeight: 700 }}>{tournamentsLoad.error}</div>
        ) : !tournamentsLoad.data ? (
          <div style={{ color: '#475569', fontWeight: 600 }}>Đang tải danh sách giải...</div>
        ) : tournaments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Cơ sở chưa có giải đấu nào. Bấm "Tạo Giải Đấu Mới" để bắt đầu.</div>
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
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309' }}>{item.categoryName || 'Giải đấu'}</span>
                    {badge(item.status)}
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>{item.name}</div>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{tournament.name}</h2>
                  {badge(tournament.status)}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                  {tournament.categoryName} • {tournament.facilityName} • {tournament.totalChildren} bảng đấu • Loại trực tiếp (Knockout)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!['CANCELLED', 'FINISHED'].includes(String(tournament.status).toUpperCase()) && (
                  <button onClick={() => setShowCancelModal(true)} disabled={busy} style={smallButton('#FFF7ED', '#C2410C', '1px solid #FED7AA')}>Hủy giải</button>
                )}
                {(String(tournament.status).toUpperCase() === 'CANCELLED' || tournament.totalParticipants === 0) && (
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
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{item.name}</span>
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
                  🏆 Giải thưởng:{' '}
                  {child.prizes?.length ? child.prizes.map((prize) => `${prize.position} ${formatVND(prize.rewardAmount)}`).join(' • ') : 'Không có'}
                  {child.prizes?.length > 0 && ` (tổng ${formatVND(prizeTotal(child.prizes))})`}
                </span>
              </div>
            )}
          </div>

          {child && champion && (
            <div style={{ borderRadius: '20px', padding: '22px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(180, 83, 9, 0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>emoji_events</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>Nhà vô địch {child.name}</div>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{champion.name}</div>
              </div>
            </div>
          )}

          {child && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
              {/* NGƯỜI THAM GIA */}
              <div style={panelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {isTeamCategory ? 'Đội' : 'Vận Động Viên'} Tham Gia ({participants.length}/{child.maxParticipants})
                  </h3>
                  {childStatus === 'OPEN' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {child.categoryType === 'RANDOM_DOUBLES' && (
                        <button onClick={handleRandomPairing} disabled={busy} style={smallButton('#EFF6FF', '#1D4ED8', '1px solid #BFDBFE')}>🎲 Bốc thăm ghép đôi</button>
                      )}
                      <button onClick={handleGenerateBracket} disabled={busy || participants.length < 2} style={smallButton('#D97706', '#FFFFFF')}>Chốt danh sách & sinh nhánh</button>
                    </div>
                  )}
                </div>

                {childStatus === 'OPEN' && (
                  <form onSubmit={handleAddParticipant} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input
                      value={newParticipant}
                      onChange={(event) => setNewParticipant(event.target.value)}
                      placeholder={isTeamCategory ? 'Nhập mã đội (teamId) để thêm' : 'Nhập số điện thoại VĐV để thêm'}
                      style={inputStyle}
                    />
                    <button type="submit" disabled={busy || !newParticipant.trim()} style={{ ...smallButton('#10B981', '#FFFFFF'), whiteSpace: 'nowrap' }}>+ Thêm</button>
                  </form>
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
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569' }}>
                            {(participant.teamName || participant.fullName || '?').charAt(0)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{participant.teamName || participant.fullName}</div>
                          <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {participant.teamName
                              ? participant.teamMembers?.map((member) => member.fullName).join(', ')
                              : `@${participant.username || ''}`}
                            {' • '}
                            {participant.paymentStatus === 'PAID' ? 'Đã đóng lệ phí' : participant.paymentStatus}
                          </div>
                        </div>
                        {participant.isCheckedIn ? (
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#15803D' }}>✓ Đã điểm danh</span>
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
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Sơ Đồ Nhánh Đấu</h3>
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
                        <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#0F172A', textAlign: 'center', textTransform: 'uppercase' }}>{round.label}</div>
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
                                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{score ?? ''}</span>
                                  </div>
                                )
                              })}
                              {(setText || match.court) && (
                                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '6px' }}>
                                  {setText && <span>Hiệp: {setText}</span>}
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
        </>
      )}

      {/* MODAL: NHẬP TỈ SỐ */}
      {scoreMatch && (
        <div style={modalBackdrop}>
          <form onSubmit={handleSaveScore} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Nhập Tỉ Số Trận Đấu</h3>
              <button type="button" onClick={() => setScoreMatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
              Nhập điểm từng hiệp. Hệ thống tự kiểm tra luật điểm của môn {tournament?.categoryName} và tự xác định người thắng.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 32px', gap: '8px', alignItems: 'center', marginBottom: '8px', fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>
              <span />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreMatch.a.name}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scoreMatch.b.name}</span>
              <span />
            </div>
            {scoreSets.map((set, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 32px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Hiệp {index + 1}</span>
                {['a', 'b'].map((side) => (
                  <input
                    key={side}
                    inputMode="numeric"
                    maxLength={3}
                    value={set[side]}
                    onChange={(event) => setScoreSets((prev) => prev.map((item, i) => (i === index ? { ...item, [side]: event.target.value.replace(/\D/g, '') } : item)))}
                    style={{ ...inputStyle, textAlign: 'center', fontWeight: 800, fontSize: '15px' }}
                  />
                ))}
                {scoreSets.length > 1 ? (
                  <button type="button" onClick={() => setScoreSets((prev) => prev.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                ) : <span />}
              </div>
            ))}
            {scoreSets.length < 5 && (
              <button type="button" onClick={() => setScoreSets((prev) => [...prev, { a: '', b: '' }])} style={{ ...smallButton('#FFFFFF', '#334155', '1px dashed #CBD5E1'), marginBottom: '18px' }}>
                + Thêm hiệp
              </button>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setScoreMatch(null)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#1D4ED8', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Đang lưu...' : 'Lưu Tỉ Số'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: HỦY GIẢI */}
      {showCancelModal && tournament && (
        <div style={modalBackdrop}>
          <form onSubmit={handleCancelTournament} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Hủy Giải "{tournament.name}"</h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#B45309', fontWeight: 600 }}>
              Mọi bảng đấu chưa kết thúc sẽ bị hủy: hoàn lệ phí cho người tham gia, trả quỹ thưởng chưa dùng về ví và trả lại ca sân.
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
                {busy ? 'Đang hủy...' : 'Xác Nhận Hủy Giải'}
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
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>Tạo Giải Đấu Mới</h3>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Tại {facility?.name}</div>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Tên giải đấu</label>
                <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="VD: Giải Cầu lông Mùa Đông 2026" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Bộ môn</label>
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

            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', marginBottom: '10px' }}>Bảng đấu ({form.children.length})</div>
            {form.children.map((item, index) => (
              <div key={index} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px', marginBottom: '12px', background: '#F8FAFC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 90px 1fr 32px', gap: '10px', alignItems: 'end' }}>
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
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Tối đa</label>
                    <input required type="number" min={2} max={128} value={item.maxParticipants} onChange={(event) => updateChild(index, { maxParticipants: event.target.value })} style={inputStyle} />
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

                <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Giải thưởng</div>
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

            <div style={{ padding: '12px 16px', borderRadius: '12px', background: formPrizeFund > availableBalance ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${formPrizeFund > availableBalance ? '#FECACA' : '#BBF7D0'}`, fontSize: '13px', fontWeight: 700, color: formPrizeFund > availableBalance ? '#B91C1C' : '#166534', marginBottom: '18px' }}>
              <div>
                Quỹ thưởng cần đặt trước: {formatVND(formPrizeFund)} <span style={{ fontWeight: 600 }}>(tổng tiền thưởng của mọi bảng)</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>
                {formPrizeFund > availableBalance
                  ? `Số dư khả dụng chỉ có ${formatVND(availableBalance)} — hãy nạp thêm tiền vào ví hoặc giảm tiền thưởng.`
                  : formPrizeFund > 0
                    ? `Số tiền này sẽ bị tạm giữ trong ví (số dư khả dụng: ${formatVND(availableBalance)}), trả cho người thắng khi giải kết thúc và hoàn lại nếu hủy giải.`
                    : 'Giải không có tiền thưởng nên không cần đặt quỹ. Có thể để trống ô tiền thưởng.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '11px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={busy || formPrizeFund > availableBalance} style={{ padding: '11px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFFFFF', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: busy || formPrizeFund > availableBalance ? 0.6 : 1 }}>
                {busy ? 'Đang tạo...' : 'Tạo Giải Đấu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
