import { useEffect, useMemo, useState } from 'react'
import { Users, ShieldCheck, Lock, CircleX, Sparkles, Search, RefreshCw, X, Ban, Unlock, CircleAlert, ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { disbandTeam, getAdminTeam, getTeamStatistics, listAdminTeams, lockTeam, unlockTeam } from '../../api/admin/teamApi.js'
import '../Users/users.css'
import '../LFG/lfg.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'locked', label: 'Đang bị khóa' },
  { value: 'disbanded', label: 'Đã giải tán' },
]
const TOURNAMENT_STATUS = { OPEN: 'Đang mở đăng ký', IN_PROGRESS: 'Đang thi đấu', FINISHED: 'Đã kết thúc', CANCELLED: 'Đã hủy' }
const number = value => (Number.isFinite(Number(value)) ? Number(value).toLocaleString('vi-VN') : '—')
const money = value => `${number(value)} ₫`
const formatDate = value => (value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('vi-VN') : '—')
const noop = () => {}

function TeamStatus({ team }) {
  if (team.isDisbanded) return <StatusBadge status="Cancelled" label="Đã giải tán" />
  if (team.isLocked) return <StatusBadge status="Pending" label="Đang bị khóa" />
  return <StatusBadge status="Confirmed" label="Đang hoạt động" />
}

function TeamActionDialog({ type, team, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const needsReason = type !== 'unlock'
  const titles = { lock: 'Khóa đội', unlock: 'Mở khóa đội', disband: 'Giải tán đội' }
  const submit = async event => {
    event.preventDefault()
    if (needsReason && !reason.trim()) return setError('Vui lòng nhập lý do.')
    setSubmitting(true); setError('')
    try {
      if (type === 'lock') await lockTeam(team.id, reason.trim())
      else if (type === 'unlock') await unlockTeam(team.id)
      else await disbandTeam(team.id, reason.trim())
      onDone({ lock: `Đã khóa đội ${team.name}.`, unlock: `Đã mở khóa đội ${team.name}.`, disband: `Đã giải tán đội ${team.name}.` }[type])
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={titles[type]} onClose={submitting ? noop : onClose}>
    <p>
      {type === 'lock' && <>Khóa đội <strong>{team.name}</strong>? Đội sẽ không đăng ký giải, không mời hoặc nhận thành viên; lời mời đang chờ bị hủy và đội trưởng nhận thông báo.</>}
      {type === 'unlock' && <>Mở khóa đội <strong>{team.name}</strong> để đội hoạt động lại bình thường?</>}
      {type === 'disband' && <>Giải tán đội <strong>{team.name}</strong>? Lịch sử giải được giữ lại, toàn bộ thành viên nhận thông báo. Không giải tán được khi đội đang tham gia giải chưa kết thúc.</>}
    </p>
    <form className="users-form" noValidate onSubmit={submit}>
      {needsReason && <label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Đội vi phạm quy định thi đấu…" /></label>}
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Đóng</button><button className={`users-button ${type === 'unlock' ? '' : 'users-danger'}`} disabled={submitting}>{submitting ? 'Đang xử lý…' : titles[type]}</button></footer>
    </form>
  </DemoDialog>
}

function TeamDetails({ base, reload, onClose, onAction }) {
  const [state, setState] = useState({ detail: null, error: '' })
  useEffect(() => {
    let cancelled = false
    getAdminTeam(base.id)
      .then(detail => !cancelled && setState({ detail, error: '' }))
      .catch(error => !cancelled && setState({ detail: null, error: error.message }))
    return () => { cancelled = true }
  }, [base.id, reload])
  const team = { ...base, ...(state.detail || {}) }
  const loading = !state.detail && !state.error
  const members = team.members || []
  const tournaments = team.tournaments || []
  return <aside className="lfg-details" aria-label="Chi tiết đội" aria-busy={loading}><header><div><p><TeamStatus team={team} /></p><h2>{team.name}</h2></div><button aria-label="Đóng chi tiết đội" onClick={onClose}><X size={17} /></button></header><div className="lfg-detail-body">
    {loading && <p className="lfg-demo-note">Đang tải chi tiết…</p>}
    {state.error && <p className="users-form-error" role="alert">Không tải được đầy đủ chi tiết: {state.error}</p>}
    {team.isLocked && <section className="lfg-report-alert"><CircleAlert size={15} /><div><strong>Đội đang bị khóa{team.lockedByName ? ` bởi ${team.lockedByName}` : ''}</strong><p>{team.lockedReason || '—'}{team.lockedAt ? ` · ${formatDate(team.lockedAt)}` : ''}</p></div></section>}
    {team.description && <p className="lfg-demo-note">{team.description}</p>}
    <section className="lfg-info-card"><div className="lfg-match-grid">
      <div><small>Thành viên</small><strong>{number(team.totalMembers ?? members.length)}</strong><p>{team.pendingInvitations ? `${number(team.pendingInvitations)} lời mời đang chờ` : ''}</p></div>
      <div><small>Giải đấu</small><strong>{number(team.totalTournaments)}</strong><p>{team.activeTournamentCount ? `${number(team.activeTournamentCount)} giải đang tham gia` : ''}</p></div>
      <div><small>Ngày lập</small><strong>{formatDate(team.createAt)}</strong><p /></div>
    </div></section>
    <section className="lfg-organizer"><UserAvatar user={{ name: team.captainName || '—' }} /><div><strong>{team.captainName || '—'} <span>Đội trưởng</span></strong><small>{[team.captainPhone, team.captainEmail].filter(Boolean).join(' · ')}</small></div></section>
    <section className="lfg-claims"><h3>Thành viên <small>{members.length}</small></h3>{members.length ? <div><table><thead><tr>{['Thành viên', 'Số điện thoại', 'Tham gia'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{members.map(member => <tr key={member.accountId}><td>{member.fullName}{String(member.accountId) === String(team.captainId) && ' (đội trưởng)'}</td><td>{member.phone || '—'}</td><td>{formatDate(member.joinedAt)}</td></tr>)}</tbody></table></div> : <p className="lfg-demo-note">{loading ? '…' : 'Chưa có thành viên.'}</p>}</section>
    <section className="lfg-claims"><h3>Giải đã tham gia <small>{tournaments.length}</small></h3>{tournaments.length ? <div><table><thead><tr>{['Giải / bảng', 'Cơ sở', 'Trạng thái', 'Lệ phí'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{tournaments.map(item => <tr key={item.participantId}><td>{item.parentTournamentName ? `${item.parentTournamentName} · ` : ''}{item.tournamentName}</td><td>{item.facilityName || '—'}</td><td>{TOURNAMENT_STATUS[item.tournamentStatus] || item.tournamentStatus || '—'}{item.isCheckedIn ? ' · đã check-in' : ''}</td><td className={/paid/i.test(item.paymentStatus) && !/unpaid/i.test(item.paymentStatus) ? 'paid' : 'unpaid'}>{money(item.entryFee)}</td></tr>)}</tbody></table></div> : <p className="lfg-demo-note">{loading ? '…' : 'Đội chưa tham gia giải nào.'}</p>}</section>
  </div><footer>
    {!team.isDisbanded && (team.isLocked
      ? <button className="users-button" onClick={() => onAction('unlock', team)}><Unlock size={13} />Mở khóa đội</button>
      : <button className="users-button users-danger" onClick={() => onAction('lock', team)}><Lock size={13} />Khóa đội</button>)}
    {!team.isDisbanded && <button className="users-button users-danger" onClick={() => onAction('disband', team)}><Ban size={13} />Giải tán đội</button>}
  </footer></aside>
}

export default function TeamManagement() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [reload, setReload] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [stats, setStats] = useState({ key: -1, value: {}, error: '' })
  const keyword = useDebounced(search.trim())

  const params = useMemo(() => ({ keyword, status, page, pageSize }), [keyword, status, page, pageSize])
  const list = usePagedList(listAdminTeams, params, reload)
  useEffect(() => {
    let cancelled = false
    getTeamStatistics()
      .then(value => !cancelled && setStats({ key: reload, value, error: '' }))
      .catch(error => !cancelled && setStats(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [reload])

  const s = stats.value
  const statsLoading = stats.key === -1
  const kpis = [
    { icon: Users, className: 'total', label: 'Tổng số đội', value: s.totalTeams, note: `${number(s.newTeamsThisMonth)} đội mới trong tháng` },
    { icon: ShieldCheck, className: 'open', label: 'Đang hoạt động', value: s.activeTeams, note: `TB ${Number(s.averageMembersPerTeam || 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} thành viên/đội` },
    { icon: Sparkles, className: 'full', label: 'Đang thi đấu', value: s.teamsInActiveTournaments, note: 'Đội có giải chưa kết thúc' },
    { icon: Lock, className: 'completed', label: 'Đang bị khóa', value: s.lockedTeams, note: 'Không đăng ký giải được' },
    { icon: CircleX, className: 'cancelled', label: 'Đã giải tán', value: s.disbandedTeams, note: 'Giữ lại lịch sử giải' },
  ]
  const pages = Math.max(1, list.totalPages)
  const detail = list.items.find(item => String(item.id) === String(detailId))
  const done = message => { setDialog(null); setNotice(message); setReload(value => value + 1) }

  return <div className="lfg-page"><header className="lfg-page-heading admin-page-header"><div><h1>Quản lý đội <span>{statsLoading ? '…' : `${number(s.totalTeams)} đội`}</span></h1><p>Theo dõi các đội thi đấu, khóa đội vi phạm hoặc giải tán đội khi cần.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)}><RefreshCw size={13} />Làm mới</button></div></header>
    <div className="lfg-kpis">{kpis.map(({ icon: Icon, className, label, value, note }) => <article key={label} className={className}><div><small>{label}</small><Icon size={24} /></div><strong>{statsLoading ? '…' : number(value)}</strong><p>{note}</p></article>)}</div>
    {stats.error && <div className="users-notice" role="alert"><span>Không tải được thống kê đội: {stats.error}</span></div>}
    {list.error && <div className="users-notice" role="alert"><span>Không tải được danh sách đội: {list.error}</span><button aria-label="Thử lại" onClick={() => setReload(value => value + 1)}>↻</button></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <section className="lfg-toolbar" aria-label="Tìm kiếm và bộ lọc đội"><div className="lfg-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm đội" placeholder="Tên đội, tên hoặc SĐT đội trưởng…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label><label>Trạng thái<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>{STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div></section>
    <div className={`lfg-content-grid ${detail ? 'with-details' : ''}`}>
      <section className="lfg-table-panel" aria-label="Danh sách đội" aria-busy={list.loading}><header><h2>Danh sách đội <span>{number(list.total)} đội</span></h2></header><div className="lfg-table-scroll"><table><thead><tr>{['Đội', 'Đội trưởng', 'Thành viên', 'Giải đấu', 'Ngày lập', 'Trạng thái'].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(team => <tr key={team.id} className={String(detailId) === String(team.id) ? 'is-selected' : ''} onClick={() => setDetailId(team.id)}><td><button className="lfg-title-button" onClick={() => setDetailId(team.id)} aria-expanded={String(detailId) === String(team.id)}><strong>{team.name}</strong><small>{team.description?.slice(0, 40)}</small></button></td><td><div className="lfg-table-host"><UserAvatar user={{ name: team.captainName || '—' }} /><div><strong>{team.captainName || '—'}</strong><small>{team.captainPhone}</small></div></div></td><td>{number(team.totalMembers)}</td><td>{number(team.totalTournaments)}<small>{team.activeTournamentCount ? `${number(team.activeTournamentCount)} đang đấu` : ''}</small></td><td>{formatDate(team.createAt)}</td><td><TeamStatus team={team} /></td></tr>)}</tbody></table>
        {list.loading && !list.items.length && <p className="lfg-empty">Đang tải danh sách đội…</p>}
        {!list.loading && !list.items.length && <p className="lfg-empty">Không có đội phù hợp.</p>}</div>
        <footer className="lfg-pagination"><span>Trang {page} / {pages} · {number(list.total)} đội</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang đội"><button aria-label="Trang trước" disabled={list.loading || page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={13} /></button><button aria-label="Trang sau" disabled={list.loading || page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={13} /></button></nav></footer>
      </section>
      {detail && <TeamDetails base={detail} reload={reload} onClose={() => setDetailId(null)} onAction={(type, team) => setDialog({ type, team })} />}
    </div>
    {dialog && <TeamActionDialog type={dialog.type} team={dialog.team} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
