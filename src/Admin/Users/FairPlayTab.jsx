import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, X, ShieldCheck, ShieldAlert, Ban, Gauge, Users, SlidersHorizontal, Check } from 'lucide-react'
import { UserAvatar, AccountStatus } from './UserDetails.jsx'
import { DemoDialog } from './UserDialogs.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { adjustFairPlay, claimBan, claimUnban, getFairPlayStatistics, getFairPlayUser, listFairPlayUsers } from '../../api/admin/fairPlayApi.js'

const PAGE_SIZE = 20
const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '—')
const dateTime = value => (value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }) : '—')
// BE không áp dụng điểm Fair Play cho Quản trị viên (docs 37.4) → ẩn thao tác với tài khoản admin.
const isAdminRole = role => /admin/i.test(role || '')
// Mỗi lần điều chỉnh tối đa 100 điểm (docs 37.4).
const MAX_ADJUST = 100
const sourceLabels = { ADMIN: 'Quản trị viên', RATING: 'Đánh giá', SYSTEM: 'Hệ thống', NO_SHOW: 'Vắng mặt' }
const noop = () => {}

// Trạng thái nhận slot: bị admin cấm (claimBanned) hoặc tự động chặn vì điểm dưới ngưỡng (claimBlocked).
function ClaimStatus({ user }) {
  if (user.claimBanned) return <span className="users-status suspended"><i />Bị cấm nhận slot</span>
  if (user.claimBlocked) return <span className="users-status inactive"><i />Dưới ngưỡng điểm</span>
  return <span className="users-status active"><i />Được nhận slot</span>
}

// Tab "Fair Play" trong Quản lý người dùng — /api/v1/admin/fair-play/users.
export default function FairPlayTab({ tabs }) {
  const [search, setSearch] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [claimBlocked, setClaimBlocked] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [stats, setStats] = useState({ key: -1, value: {}, error: '' })
  const keyword = useDebounced(search.trim())
  const params = useMemo(() => ({ keyword, maxScore, claimBlocked, page, pageSize: PAGE_SIZE }), [keyword, maxScore, claimBlocked, page])
  const list = usePagedList(listFairPlayUsers, params, reload)
  useEffect(() => {
    let cancelled = false
    getFairPlayStatistics().then(value => !cancelled && setStats({ key: reload, value, error: '' })).catch(error => !cancelled && setStats(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [reload])

  const s = stats.value
  const statsLoading = stats.key === -1
  const pages = Math.max(1, list.totalPages)
  const kpis = [
    { label: 'ĐIỂM FAIR PLAY TRUNG BÌNH', value: number(s.averageScore), trend: `Trên ${number(s.totalUsers)} người dùng`, tone: 'green', icon: Gauge },
    { label: 'NGƯỠNG NHẬN SLOT', value: number(s.minClaimScore), trend: 'Đổi trong Cài đặt hệ thống', tone: 'green', icon: ShieldCheck },
    { label: 'DƯỚI NGƯỠNG ĐIỂM', value: number(s.belowThresholdUsers), trend: 'Tự động bị chặn nhận slot', tone: 'red', icon: ShieldAlert },
    { label: 'BỊ CẤM NHẬN SLOT', value: number(s.claimBannedUsers), trend: 'Do quản trị viên cấm', tone: 'red', icon: Ban },
  ]
  const change = setter => value => { setter(value); setPage(1) }
  const done = message => { setDialog(null); setNotice(message); setReload(value => value + 1) }

  return <div className={`users-page ${detailId ? 'with-details' : ''}`}>
    <div className="users-main-content">
      <header className="users-page-heading admin-page-header"><div><h1>Fair Play <span>{number(list.total)} người dùng</span></h1><p>Theo dõi điểm uy tín, điều chỉnh điểm và cấm người chơi nhận slot ghép trận.</p></div><div className="users-heading-actions">{tabs}<button className="users-button" onClick={() => setReload(value => value + 1)} disabled={list.loading}><RefreshCw size={16} /><span>Làm mới</span></button></div></header>
      <div className="users-kpis">{kpis.map(stat => { const Icon = stat.icon; return <article key={stat.label} className={`users-kpi ${stat.tone}`}><small>{stat.label}</small><div><strong>{statsLoading ? '…' : stat.value}</strong><Icon size={23} /></div><p>{stat.trend}</p></article> })}</div>
      {!statsLoading && s.distribution?.length > 0 && <p className="users-demo-note">Phân bổ điểm: {s.distribution.map(item => `${item.range} điểm: ${number(item.count)}`).join(' · ')}</p>}
      {stats.error && <div className="users-notice" role="alert">Không tải được thống kê Fair Play: {stats.error}</div>}
      {list.error && <div className="users-notice" role="alert">Không tải được danh sách: {list.error}<button onClick={() => setReload(value => value + 1)} aria-label="Thử lại">↻</button></div>}
      {notice && <div className="users-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
      <section className="users-toolbar" aria-label="Bộ lọc Fair Play"><div className="users-filter-top"><label className="users-search"><Search size={15} /><input aria-label="Tìm người dùng" placeholder="Họ tên, tên đăng nhập…" value={search} onChange={event => change(setSearch)(event.target.value)} /></label><select aria-label="Lọc theo điểm" value={maxScore} onChange={event => change(setMaxScore)(event.target.value)}><option value="">Mọi mức điểm</option><option value="50">Từ 50 điểm trở xuống</option><option value="70">Từ 70 điểm trở xuống</option><option value="90">Từ 90 điểm trở xuống</option></select><select aria-label="Lọc theo trạng thái nhận slot" value={claimBlocked} onChange={event => change(setClaimBlocked)(event.target.value)}><option value="">Mọi trạng thái nhận slot</option><option value="true">Đang bị chặn nhận slot</option><option value="false">Được nhận slot</option></select></div></section>
      <section className="users-table-panel" aria-label="Danh sách điểm Fair Play" aria-busy={list.loading}><div className="users-table-scroll"><table><thead><tr><th>Người dùng</th><th>Điểm Fair Play</th><th>Lượt đánh giá</th><th>Nhận slot</th><th>Tài khoản</th></tr></thead>
        <tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(user => <tr key={user.userId} className={detailId === user.userId ? 'is-selected' : ''} onClick={() => setDetailId(user.userId)}><td><button className="users-table-profile" onClick={event => { event.stopPropagation(); setDetailId(user.userId) }}><UserAvatar user={user} /><span><strong>{user.name}</strong><small>{user.username ? `@${user.username}` : user.role}</small></span></button></td><td><strong style={Number.isFinite(s.minClaimScore) && user.score < s.minClaimScore ? { color: 'var(--sn-danger-text)' } : undefined}>{number(user.score)}</strong></td><td>{number(user.ratingCount)}{user.lowRatingCount > 0 && <small> ({user.lowRatingCount} thấp)</small>}</td><td><ClaimStatus user={user} /></td><td><AccountStatus status={user.isActive ? 'Active' : 'Suspended'} /></td></tr>)}</tbody></table></div>
        {list.loading && !list.items.length && <div className="users-empty"><Users size={25} /><h3>Đang tải…</h3></div>}
        {!list.loading && !list.items.length && <div className="users-empty"><Users size={25} /><h3>Không có người dùng phù hợp</h3></div>}
        <footer className="users-pagination"><span>Trang {page} / {pages} · {number(list.total)} người dùng</span><nav aria-label="Phân trang Fair Play"><button disabled={list.loading || page <= 1} onClick={() => setPage(page - 1)}>Trước</button><button disabled={list.loading || page >= pages} onClick={() => setPage(page + 1)}>Sau</button></nav></footer></section>
    </div>
    {detailId && <FairPlayDetails key={`${detailId}#${reload}`} userId={detailId} base={list.items.find(user => user.userId === detailId)} onClose={() => setDetailId(null)} onDialog={setDialog} />}
    {dialog?.type === 'adjust' && <AdjustDialog user={dialog.user} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'ban' && <BanDialog user={dialog.user} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'unban' && <UnbanDialog user={dialog.user} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}

function FairPlayDetails({ userId, base, onClose, onDialog }) {
  const [state, setState] = useState({ user: null, error: '' })
  useEffect(() => {
    let cancelled = false
    getFairPlayUser(userId).then(user => !cancelled && setState({ user, error: '' })).catch(error => !cancelled && setState({ user: null, error: error.message }))
    return () => { cancelled = true }
  }, [userId])
  const user = state.user || base
  if (!user) return <aside className="users-details"><header className="users-details-heading"><h2>Fair Play</h2><button onClick={onClose} aria-label="Đóng"><X size={18} /></button></header><div className="users-details-body"><p className="users-unavailable">{state.error || 'Đang tải…'}</p></div></aside>
  const detail = state.user
  return <aside className="users-details" aria-label={`Fair Play của ${user.name}`}>
    <header className="users-details-heading"><h2>Fair Play <small>{user.username ? `@${user.username}` : ''}</small></h2><button onClick={onClose} aria-label="Đóng chi tiết"><X size={18} /></button></header>
    <div className="users-details-body">
      {state.error && <p className="users-form-error" role="alert">Không tải được đầy đủ chi tiết: {state.error}</p>}
      <div className="users-profile-main"><UserAvatar user={user} /><div><h3>{user.name}</h3><p>{user.role}</p></div><ClaimStatus user={user} /></div>
      {user.claimBanned && <p className="users-form-error">Bị cấm nhận slot{user.bannedUntil ? ` đến ${dateTime(user.bannedUntil)}` : ' vô thời hạn'}{user.banReason ? ` · Lý do: ${user.banReason}` : ''}</p>}
      <section><h3 className="users-section-title">Điểm số</h3><dl className="users-activity-stats">{[
        ['Điểm Fair Play', number(user.score)],
        ['Điểm từ đánh giá', number(detail?.ratingScore)],
        ['Tổng điều chỉnh', detail?.totalAdjustment != null ? `${detail.totalAdjustment > 0 ? '+' : ''}${number(detail.totalAdjustment)}` : '—'],
        ['Ngưỡng nhận slot', number(detail?.minClaimScore)],
        ['Sao trung bình', detail?.averageRating != null ? `${number(detail.averageRating)} ★` : 'Chưa có'],
        ['Lượt được đánh giá', `${number(user.ratingCount)} (${number(user.lowRatingCount)} thấp)`],
        ['Đã đánh giá người khác', number(detail?.ratingsGiven)],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section><h3 className="users-section-title">Lịch sử điều chỉnh điểm</h3>{detail?.adjustments.length ? <ol className="users-timeline">{detail.adjustments.map(item => <li key={item.id}><strong style={{ color: item.delta < 0 ? 'var(--sn-danger-text)' : 'var(--sn-green-700)' }}>{item.delta > 0 ? '+' : ''}{number(item.delta)} điểm</strong> · {sourceLabels[item.source] || item.source}{item.by ? ` (${item.by})` : ''}<br /><small>{dateTime(item.createdAt)}{item.reason ? ` · ${item.reason}` : ''}</small></li>)}</ol> : <p className="users-unavailable">{detail ? 'Chưa có điều chỉnh nào.' : '…'}</p>}</section>
      {detail?.ratings.length > 0 && <section><h3 className="users-section-title">Đánh giá nhận được</h3><ol className="users-timeline">{detail.ratings.slice(0, 10).map(item => <li key={item.id}><strong>{item.stars ?? '—'} ★</strong> từ {item.rater}{item.hidden ? ' (đã ẩn)' : ''}<br /><small>{dateTime(item.createdAt)}{item.comment ? ` · ${item.comment}` : ''}</small></li>)}</ol></section>}
    </div>
    {isAdminRole(user.role) ? <footer className="users-details-actions"><p className="users-unavailable">Điểm Fair Play không áp dụng cho Quản trị viên.</p></footer> : <footer className="users-details-actions"><button className="users-button primary" onClick={() => onDialog({ type: 'adjust', user })}><SlidersHorizontal size={14} />Điều chỉnh điểm</button>{user.claimBanned ? <button className="users-button" onClick={() => onDialog({ type: 'unban', user })}><Check size={14} />Bỏ cấm nhận slot</button> : <button className="users-button users-danger" onClick={() => onDialog({ type: 'ban', user })}><Ban size={14} />Cấm nhận slot</button>}</footer>}
  </aside>
}

function useAction(onDone) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const run = async (task, message) => {
    setSubmitting(true); setError('')
    try { await task(); onDone(message) } catch (err) { setError(err.message); setSubmitting(false) }
  }
  return { submitting, error, setError, run }
}

// POST /api/v1/admin/fair-play/users/{userId}/adjust { delta, reason }.
function AdjustDialog({ user, onClose, onDone }) {
  const [direction, setDirection] = useState('subtract')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const { submitting, error, setError, run } = useAction(onDone)
  const value = Number(amount)
  const delta = direction === 'add' ? value : -value
  const submit = event => {
    event.preventDefault()
    if (!amount.trim() || !Number.isFinite(value) || value <= 0) return setError('Nhập số điểm lớn hơn 0.')
    if (value > MAX_ADJUST) return setError(`Mỗi lần chỉ điều chỉnh tối đa ${MAX_ADJUST} điểm.`)
    if (!/^\d+([.,]\d{1,2})?$/.test(amount.trim())) return setError('Số điểm chỉ được có tối đa 2 chữ số thập phân.')
    if (!reason.trim()) return setError('Vui lòng nhập lý do điều chỉnh.')
    run(() => adjustFairPlay(user.userId, { delta, reason: reason.trim() }), `Đã ${direction === 'add' ? 'cộng' : 'trừ'} ${number(value)} điểm Fair Play của ${user.name}.`)
  }
  return <DemoDialog title="Điều chỉnh điểm Fair Play" onClose={submitting ? noop : onClose}>
    <p><strong>{user.name}</strong> · điểm hiện tại {number(user.score)}</p>
    <form className="users-form" onSubmit={submit} noValidate>
      <label>Loại điều chỉnh<select value={direction} onChange={event => setDirection(event.target.value)}><option value="subtract">Trừ điểm (vi phạm)</option><option value="add">Cộng điểm (bồi hoàn / khen thưởng)</option></select></label>
      <label>Số điểm<input type="number" min="0.01" max={MAX_ADJUST} step="0.01" inputMode="decimal" placeholder={`Tối đa ${MAX_ADJUST}`} value={amount} onChange={event => setAmount(event.target.value)} required /></label>
      <label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Bỏ kèo không báo trước…" required /></label>
      {Number.isFinite(value) && value > 0 && Number.isFinite(user.score) && <p className="users-demo-note">Điểm sau điều chỉnh: {number(user.score + delta)}</p>}
      {error && <p className="users-form-error" role="alert">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${direction === 'add' ? 'primary' : 'users-danger'}`} disabled={submitting}>{submitting ? 'Đang lưu…' : 'Xác nhận'}</button></footer>
    </form>
  </DemoDialog>
}

// PATCH /api/v1/admin/fair-play/users/{userId}/claim-ban { reason, days } — days rỗng = vô thời hạn.
function BanDialog({ user, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [days, setDays] = useState('7')
  const { submitting, error, setError, run } = useAction(onDone)
  const submit = event => {
    event.preventDefault()
    const dayCount = days === '' ? null : Number(days)
    if (!reason.trim()) return setError('Vui lòng nhập lý do cấm.')
    if (dayCount != null && (!Number.isInteger(dayCount) || dayCount < 1)) return setError('Số ngày phải là số nguyên lớn hơn 0, hoặc để trống để cấm vô thời hạn.')
    run(() => claimBan(user.userId, { reason: reason.trim(), days: dayCount }), `Đã cấm ${user.name} nhận slot${dayCount ? ` trong ${dayCount} ngày` : ' vô thời hạn'}.`)
  }
  return <DemoDialog title="Cấm nhận slot ghép trận" onClose={submitting ? noop : onClose}>
    <p><strong>{user.name}</strong> sẽ không thể nhận slot trong các kèo ghép trận.</p>
    <form className="users-form" onSubmit={submit} noValidate>
      <label>Thời hạn<select value={days} onChange={event => setDays(event.target.value)}><option value="1">1 ngày</option><option value="3">3 ngày</option><option value="7">7 ngày</option><option value="14">14 ngày</option><option value="30">30 ngày</option><option value="">Vô thời hạn</option></select></label>
      <label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Nhiều lần nhận slot rồi vắng mặt…" required /></label>
      {error && <p className="users-form-error" role="alert">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button users-danger" disabled={submitting}>{submitting ? 'Đang lưu…' : 'Cấm nhận slot'}</button></footer>
    </form>
  </DemoDialog>
}

function UnbanDialog({ user, onClose, onDone }) {
  const { submitting, error, run } = useAction(onDone)
  return <DemoDialog title="Bỏ cấm nhận slot" onClose={submitting ? noop : onClose}>
    <p>Cho phép <strong>{user.name}</strong> nhận slot ghép trận trở lại?{user.banReason ? ` Lý do cấm trước đó: ${user.banReason}.` : ''}</p>
    {/* isClaimBlocked luôn true khi đang bị cấm, nên so trực tiếp điểm với ngưỡng nhận slot. */}
    {Number.isFinite(user.score) && Number.isFinite(user.minClaimScore) && user.score < user.minClaimScore && <p className="users-demo-note">Lưu ý: điểm Fair Play của người này vẫn dưới ngưỡng nên có thể tiếp tục bị chặn tự động.</p>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" onClick={() => run(() => claimUnban(user.userId), `Đã bỏ cấm nhận slot cho ${user.name}.`)} disabled={submitting}>{submitting ? 'Đang lưu…' : 'Bỏ cấm'}</button></footer>
  </DemoDialog>
}
