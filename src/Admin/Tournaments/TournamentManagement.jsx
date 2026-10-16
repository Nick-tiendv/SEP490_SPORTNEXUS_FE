import { useEffect, useState } from 'react'
import { Trophy, UserRoundPlus, Clock3, BadgeCheck, Users, Download, ListFilter, Plus, Search, Filter, RefreshCw } from 'lucide-react'
import TournamentTable from './TournamentTable.jsx'
import TournamentDetails from './TournamentDetails.jsx'
import { TournamentForm, TournamentActionDialog, ParticipantDialog, AddParticipantDialog, ScoreDialog } from './TournamentDialogs.jsx'
import { tournamentStats, statusLabels, statusFilterOptions, sportLabels, normalize, parseDate, number, exportTournaments } from './tournamentData.js'
import { listTournaments } from '../../api/admin/tournamentApi.js'
import { getSportOptions, listAdminFacilities } from '../../api/admin/facilityApi.js'
import '../Users/users.css'
import './tournament.css'

const emptyFilters = { search: '', status: '', sport: '', facility: '', from: '', to: '' }
const icons = { total: Trophy, open: UserRoundPlus, upcoming: Clock3, completed: BadgeCheck, participants: Users }

export default function TournamentManagement() {
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [reload, setReload] = useState(0)
  const [data, setData] = useState({ key: '', tournaments: [], error: '' })
  const [facilities, setFacilities] = useState([])
  const [sports, setSports] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  // GET /api/v1/tournaments lọc phía server theo status, categoryId (môn), facilityId; tìm kiếm và ngày lọc ở FE.
  const listKey = `${filters.status}|${filters.sport}|${filters.facility}#${reload}`
  const loading = data.key !== listKey
  useEffect(() => {
    let cancelled = false
    const [status, categoryId, facilityId] = listKey.split('#')[0].split('|')
    listTournaments({ status, categoryId, facilityId })
      .then(tournaments => !cancelled && setData({ key: listKey, tournaments, error: '' }))
      .catch(err => !cancelled && setData(previous => ({ key: listKey, tournaments: previous.tournaments, error: err.message })))
    return () => { cancelled = true }
  }, [listKey])
  useEffect(() => {
    let cancelled = false
    listAdminFacilities().then(items => !cancelled && setFacilities(items)).catch(() => {})
    getSportOptions().then(items => !cancelled && setSports(items)).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const tournaments = data.tournaments
  const from = parseDate(filters.from), to = parseDate(filters.to)
  const filtered = tournaments.filter(t => normalize(`${t.name} ${t.id} ${t.facility} ${t.organizer}`).includes(normalize(filters.search.trim()))
    && (!from || !t.ends || t.ends >= from) && (!to || !t.starts || t.starts <= to))
  const detail = tournaments.find(t => t.id === detailId)
  const change = (key, value) => { setDraft(previous => ({ ...previous, [key]: value })); setError('') }
  const apply = event => {
    event.preventDefault()
    const start = parseDate(draft.from), end = parseDate(draft.to)
    if ((draft.from && !start) || (draft.to && !end)) return setError('Nhập ngày hợp lệ theo định dạng ngày/tháng/năm.')
    if (start && end && start > end) return setError('Ngày kết thúc bộ lọc phải bằng hoặc sau ngày bắt đầu.')
    setFilters(draft); setPage(1); setError('')
  }
  const reset = () => { setDraft(emptyFilters); setFilters(emptyFilters); setPage(1); setError('') }
  const quick = () => {
    const status = filters.status === 'Registration' ? '' : 'Registration'
    setDraft(previous => ({ ...previous, status })); setFilters(previous => ({ ...previous, status })); setPage(1)
  }
  const done = message => { setDialog(null); if (message) setNotice(message); setReload(value => value + 1) }
  const onAction = (type, context) => setDialog({ type, context })

  return <div className="tournaments-page"><header className="tournaments-page-heading admin-page-header"><div><h1>Quản lý giải đấu <span>{loading && !tournaments.length ? '…' : `${number(tournaments.length)} giải`}</span></h1><p>Theo dõi đăng ký, nhánh đấu và tiến độ các giải thể thao trên SportNexus.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)} disabled={loading}><RefreshCw size={13} />Làm mới</button><button className="users-button" disabled={!filtered.length} onClick={() => { exportTournaments(filtered); setNotice(`Đã xuất ${number(filtered.length)} giải đang được lọc ra CSV.`) }}><Download size={13} />Xuất CSV</button><button className="users-button" onClick={quick} aria-pressed={filters.status === 'Registration'}><ListFilter size={13} />Đang mở đăng ký</button><button className="users-button primary" onClick={() => setDialog({ type: 'form' })} disabled={!facilities.length || !sports.length} title={facilities.length && sports.length ? undefined : 'Cần có cơ sở và môn thể thao trên hệ thống'}><Plus size={13} />Tạo giải đấu</button></div></header>
    <div className="tournaments-kpis">{tournamentStats(tournaments).map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{loading && !tournaments.length ? '…' : number(stat.value)}</strong><p>{stat.note}</p></article> })}</div>
    {data.error && <div className="users-notice" role="alert"><span>Không tải được danh sách giải đấu: {data.error}</span><button aria-label="Thử lại" onClick={() => setReload(value => value + 1)}>↻</button></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <form className="tournaments-toolbar" onSubmit={apply} noValidate aria-label="Bộ lọc giải đấu"><div className="tournaments-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm giải đấu" placeholder="Tên giải, cơ sở, ban tổ chức…" value={draft.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={draft.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{statusFilterOptions.map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label><label>Môn thể thao<select value={draft.sport} onChange={event => change('sport', event.target.value)} disabled={!sports.length}><option value="">{sports.length ? 'Tất cả môn' : 'Chưa có dữ liệu môn'}</option>{sports.map(sport => <option key={sport.id} value={sport.id}>{sportLabels[sport.name] || sport.name}</option>)}</select></label></div><div className="tournaments-filter-row"><label>Cơ sở<select value={draft.facility} onChange={event => change('facility', event.target.value)} disabled={!facilities.length}><option value="">{facilities.length ? 'Tất cả cơ sở' : 'Chưa có cơ sở'}</option>{facilities.map(facility => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></label>{[['from', 'Từ ngày'], ['to', 'Đến ngày']].map(([key, label]) => <label key={key}>{label}<input value={draft[key]} placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} onChange={event => change(key, event.target.value)} aria-describedby={error ? 'tournament-filter-error' : undefined} /></label>)}<button className="users-button primary"><Filter size={12} />Áp dụng bộ lọc</button><button type="button" className="tournaments-text-button" onClick={reset}>Đặt lại</button></div>{error && <p className="users-form-error" id="tournament-filter-error" role="alert">{error}</p>}<p className="tournaments-filter-hint">{Object.keys(emptyFilters).some(key => draft[key] !== filters[key]) ? 'Nhấn “Áp dụng bộ lọc” để cập nhật kết quả và CSV.' : 'Lọc ngày theo khoảng diễn ra giải; bao gồm giải giao với khoảng ngày đã chọn.'}</p></form>
    <div className={`tournaments-content-grid ${detail ? 'with-details' : ''}`}><TournamentTable tournaments={filtered} loading={loading} error={data.error} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />{detail && <TournamentDetails key={`${detail.id}#${reload}`} tournament={detail} onClose={() => setDetailId(null)} onAction={onAction} />}</div>
    {dialog?.type === 'form' && <TournamentForm facilities={facilities} sports={sports} onClose={() => setDialog(null)} onDone={done} />}
    {['generate', 'pair', 'cancel'].includes(dialog?.type) && <TournamentActionDialog type={dialog.type} context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'add' && <AddParticipantDialog context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'participant' && <ParticipantDialog context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'score' && <ScoreDialog context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
