import { useEffect, useMemo, useState } from 'react'
import { Users, UserRoundSearch, BadgeCheck, Hourglass, CircleX, Download, Search, RefreshCw } from 'lucide-react'
import LFGTable from './LFGTable.jsx'
import LFGDetails from './LFGDetails.jsx'
import CancelLfgDialog from './LFGDialogs.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { getLfgStatistics, listLfgs } from '../../api/admin/lfgApi.js'
import { getSportOptions, listAdminFacilities } from '../../api/admin/facilityApi.js'
import { fetchAllPages } from '../../api/admin/dashboardApi.js'
import { statusLabels, sportLabels, number, money, percent, exportLfgs } from './lfgData.js'
import '../Users/users.css'
import './lfg.css'

const emptyFilters = { search: '', status: '', sport: '', facility: '', from: '', to: '' }
const icons = { total: Users, open: UserRoundSearch, full: BadgeCheck, completed: Hourglass, cancelled: CircleX }

export default function LFGManagement() {
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [reload, setReload] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [notice, setNotice] = useState('')
  const [stats, setStats] = useState({ key: -1, value: {}, error: '' })
  const [options, setOptions] = useState({ sports: [], facilities: [] })
  const keyword = useDebounced(filters.search.trim())
  const invalidRange = filters.from && filters.to && filters.from > filters.to

  // GET /api/v1/admin/lfgs — lọc, tìm kiếm, phân trang phía server.
  const params = useMemo(() => ({ Keyword: keyword, Status: filters.status, CategoryId: filters.sport, FacilityId: filters.facility, FromDate: invalidRange ? '' : filters.from, ToDate: invalidRange ? '' : filters.to, Page: page, PageSize: pageSize }), [keyword, filters.status, filters.sport, filters.facility, filters.from, filters.to, invalidRange, page, pageSize])
  const list = usePagedList(listLfgs, params, reload)
  useEffect(() => {
    let cancelled = false
    getLfgStatistics()
      .then(value => !cancelled && setStats({ key: reload, value, error: '' }))
      .catch(error => !cancelled && setStats(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [reload])
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getSportOptions(), fetchAllPages((Page, PageSize) => listAdminFacilities({ ApprovalStatus: 'APPROVED', Page, PageSize }))]).then(([sports, facilities]) => {
      if (!cancelled) setOptions({ sports: sports.value || [], facilities: facilities.value || [] })
    })
    return () => { cancelled = true }
  }, [])

  const s = stats.value
  const statsLoading = stats.key === -1
  const kpis = [
    { icon: 'total', label: 'Tổng kèo ghép trận', value: s.totalCards, note: `${number(s.newCardsThisMonth)} kèo mới trong tháng` },
    { icon: 'open', label: 'Kèo đang mở', value: s.openCards, note: `${number(s.activeParticipants)} người đang tham gia` },
    { icon: 'full', label: 'Đã đủ người', value: s.filledCards, note: `Tỉ lệ đủ người ${percent(s.fillRate)} · lấp vị trí ${percent(s.slotFillRate)}` },
    { icon: 'completed', label: 'Đã hết hạn', value: s.expiredCards, note: 'Kèo quá giờ chơi chưa đủ người' },
    { icon: 'cancelled', label: 'Đã hủy', value: s.cancelledCards, note: 'Bởi chủ kèo hoặc quản trị viên' },
  ]
  const detail = list.items.find(item => item.id === detailId)
  const activeFilters = Object.values(filters).filter(Boolean).length
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const download = () => { exportLfgs(list.items); setNotice(`Đã xuất ${number(list.items.length)} kèo của trang hiện tại ra CSV.`) }
  const cancelled = message => { setCancelling(null); setNotice(message); setReload(value => value + 1) }

  return <div className="lfg-page"><header className="lfg-page-heading admin-page-header"><div><h1>Quản lý ghép trận <span>{statsLoading ? '…' : `${number(s.totalCards)} kèo`}</span></h1><p>Theo dõi hoạt động tìm người chơi và các kèo ghép trận trên SportNexus.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)}><RefreshCw size={13} />Làm mới</button><button className="users-button" onClick={download} disabled={!list.items.length}><Download size={13} />Xuất CSV</button></div></header>
    <div className="lfg-kpis">{kpis.map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{statsLoading ? '…' : number(stat.value)}</strong><p>{stat.note}</p></article> })}</div>
    <p className="lfg-demo-label">Tiền qua kèo: đã thu {money(s.totalCollected)} · đang giữ {money(s.totalHeld)} · đã giải ngân {money(s.totalReleased)}{s.topSports?.length ? ` · Môn nhiều kèo nhất: ${s.topSports.slice(0, 3).map(item => `${sportLabels[item.name] || item.name} (${number(item.count)})`).join(', ')}` : ''}</p>
    {stats.error && <div className="users-notice" role="alert"><span>Không tải được thống kê ghép trận: {stats.error}</span></div>}
    {list.error && <div className="users-notice" role="alert"><span>Không tải được danh sách kèo: {list.error}</span><button aria-label="Thử lại" onClick={() => setReload(value => value + 1)}>↻</button></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <section className="lfg-toolbar" aria-label="Tìm kiếm và bộ lọc kèo"><div className="lfg-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm kèo ghép trận" placeholder="Người tổ chức, cơ sở, mô tả…" value={filters.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Môn thể thao<select value={filters.sport} onChange={event => change('sport', event.target.value)}><option value="">Tất cả môn</option>{options.sports.map(sport => <option key={sport.id} value={sport.id}>{sportLabels[sport.name] || sport.name}</option>)}</select></label></div>
      <div className="lfg-filter-row"><label>Cơ sở<select value={filters.facility} onChange={event => change('facility', event.target.value)}><option value="">Tất cả cơ sở</option>{options.facilities.map(facility => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></label><label>Từ ngày<input type="date" value={filters.from} onChange={event => change('from', event.target.value)} /></label><label>Đến ngày<input type="date" value={filters.to} onChange={event => change('to', event.target.value)} /></label><button type="button" className="lfg-text-button" onClick={reset} disabled={!activeFilters}>Đặt lại</button></div>
      {invalidRange && <p className="users-form-error" role="alert">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}
    </section>
    <div className={`lfg-content-grid ${detail ? 'with-details' : ''}`}><LFGTable lfgs={list.items} total={list.total} totalPages={list.totalPages} loading={list.loading} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />{detail && <LFGDetails key={`${detail.id}#${reload}`} base={detail} onClose={() => setDetailId(null)} onCancel={setCancelling} />}</div>
    {cancelling && <CancelLfgDialog lfg={cancelling} onClose={() => setCancelling(null)} onDone={cancelled} />}
  </div>
}
