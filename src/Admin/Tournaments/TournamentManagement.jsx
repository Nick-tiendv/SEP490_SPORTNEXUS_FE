import { useEffect, useMemo, useState } from 'react'
import { Trophy, UserRoundPlus, Clock3, BadgeCheck, Users, Download, ListFilter, Search, RefreshCw } from 'lucide-react'
import TournamentTable from './TournamentTable.jsx'
import TournamentDetails from './TournamentDetails.jsx'
import { TournamentActionDialog, ParticipantDialog, AddParticipantDialog, ScoreDialog } from './TournamentDialogs.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { tournamentStats, statusLabels, statusFilterOptions, number, money, exportTournaments } from './tournamentData.js'
import { getTournamentStatistics, listAdminTournaments } from '../../api/admin/tournamentApi.js'
import { listAdminFacilities } from '../../api/admin/facilityApi.js'
import { fetchAllPages } from '../../api/admin/dashboardApi.js'
import '../Users/users.css'
import './tournament.css'

const emptyFilters = { search: '', status: '', facility: '', locked: '' }
const icons = { total: Trophy, open: UserRoundPlus, upcoming: Clock3, completed: BadgeCheck, participants: Users }

export default function TournamentManagement() {
  const [filters, setFilters] = useState(emptyFilters)
  const [reload, setReload] = useState(0)
  const [stats, setStats] = useState({ key: -1, value: {}, error: '' })
  const [facilities, setFacilities] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const keyword = useDebounced(filters.search.trim())

  // GET /api/v1/admin/tournaments — tìm kiếm, lọc và phân trang phía server.
  const params = useMemo(() => ({ keyword, status: filters.status, facilityId: filters.facility, isLocked: filters.locked, page, pageSize }), [keyword, filters.status, filters.facility, filters.locked, page, pageSize])
  const list = usePagedList(listAdminTournaments, params, reload)
  useEffect(() => {
    let cancelled = false
    getTournamentStatistics()
      .then(value => !cancelled && setStats({ key: reload, value, error: '' }))
      .catch(error => !cancelled && setStats(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [reload])
  useEffect(() => {
    let cancelled = false
    fetchAllPages((Page, PageSize) => listAdminFacilities({ ApprovalStatus: 'APPROVED', IsLocked: false, Page, PageSize })).then(items => !cancelled && setFacilities(items)).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const s = stats.value
  const statsLoading = stats.key === -1
  const tournaments = list.items
  const detail = tournaments.find(t => t.id === detailId)
  const activeFilters = Object.values(filters).filter(Boolean).length
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const quick = () => change('status', filters.status === 'OPEN' ? '' : 'OPEN')
  const done = message => { setDialog(null); if (message) setNotice(message); setReload(value => value + 1) }
  const onAction = (type, context) => setDialog({ type, context })

  return <div className="tournaments-page"><header className="tournaments-page-heading admin-page-header"><div><h1>Quản lý giải đấu <span>{statsLoading ? '…' : `${number(s.totalTournaments)} giải`}</span></h1><p>Theo dõi đăng ký, nhánh đấu và tiến độ các giải thể thao trên SportNexus.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)} disabled={list.loading}><RefreshCw size={13} />Làm mới</button><button className="users-button" disabled={!tournaments.length} onClick={() => { exportTournaments(tournaments); setNotice(`Đã xuất ${number(tournaments.length)} giải của trang hiện tại ra CSV.`) }}><Download size={13} />Xuất CSV</button><button className="users-button" onClick={quick} aria-pressed={filters.status === 'OPEN'}><ListFilter size={13} />Đang mở đăng ký</button></div></header>
    <div className="tournaments-kpis">{tournamentStats(s).map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{statsLoading ? '…' : number(stat.value)}</strong><p>{stat.note}</p></article> })}</div>
    {!statsLoading && <p className="tournaments-filter-hint">Quỹ giải thưởng đang giữ {money(s.prizeFundsHeld)} · đã trả thưởng {money(s.prizesPaid)} · phí đã hoàn {money(s.entryFeesRefunded)}{s.topFacilities?.length ? ` · Cơ sở tổ chức nhiều nhất: ${s.topFacilities.slice(0, 3).map(item => `${item.name} (${item.count})`).join(', ')}` : ''}</p>}
    {stats.error && <div className="users-notice" role="alert"><span>Không tải được thống kê giải đấu: {stats.error}</span></div>}
    {list.error && <div className="users-notice" role="alert"><span>Không tải được danh sách giải đấu: {list.error}</span><button aria-label="Thử lại" onClick={() => setReload(value => value + 1)}>↻</button></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <section className="tournaments-toolbar" aria-label="Bộ lọc giải đấu"><div className="tournaments-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm giải đấu" placeholder="Tên giải, cơ sở, ban tổ chức…" value={filters.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{statusFilterOptions.map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label></div>
      <div className="tournaments-filter-row"><label>Cơ sở<select value={filters.facility} onChange={event => change('facility', event.target.value)} disabled={!facilities.length}><option value="">{facilities.length ? 'Tất cả cơ sở' : 'Chưa có cơ sở'}</option>{facilities.map(facility => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></label><label>Khóa<select value={filters.locked} onChange={event => change('locked', event.target.value)}><option value="">Tất cả</option><option value="true">Đang bị khóa</option><option value="false">Không bị khóa</option></select></label><button type="button" className="tournaments-text-button" onClick={reset} disabled={!activeFilters}>Đặt lại</button></div>
    </section>
    <div className={`tournaments-content-grid ${detail ? 'with-details' : ''}`}><TournamentTable tournaments={tournaments} total={list.total} totalPages={list.totalPages} loading={list.loading} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />{detail && <TournamentDetails key={`${detail.id}#${reload}`} tournament={detail} onClose={() => setDetailId(null)} onAction={onAction} />}</div>
    {['generate', 'pair', 'cancel', 'lock', 'unlock'].includes(dialog?.type) && <TournamentActionDialog type={dialog.type} context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'add' && <AddParticipantDialog context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'participant' && <ParticipantDialog context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'score' && <ScoreDialog context={dialog.context} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
