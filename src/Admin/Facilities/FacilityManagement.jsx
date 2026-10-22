import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, BadgeCheck, Wrench, Network, Search, Download, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import FacilityDetails, { FacilityStatus } from './FacilityDetails.jsx'
import { FacilityFormDialog, FacilityActionDialog, FacilityPhotoDialog } from './FacilityDialogs.jsx'
import { statusLabels, statusFilters, sportLabels, formatNumber, facilityStats, facilitiesCsv, fallbackPhoto, facilityActions } from './facilityData.js'
import { getFacilityStatistics, listAdminFacilities } from '../../api/admin/facilityApi.js'
import '../Users/users.css'
import './facility.css'

const emptyFilters = { search: '', status: '' }
const statIcons = { facilities: Building2, active: BadgeCheck, maintenance: Wrench, courts: Network }

export default function FacilityManagement() {
  // ?status=Pending (từ Dashboard) → mở sẵn bộ lọc tương ứng.
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, status: statusFilters[searchParams.get('status')] ? searchParams.get('status') : '' }))
  const [keyword, setKeyword] = useState('')
  const [reload, setReload] = useState(0)
  const [data, setData] = useState({ key: '', facilities: [], total: 0, totalPages: 1, error: '' })
  const [stats, setStats] = useState({ key: -1, value: {}, error: '' })
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  // Chờ người dùng ngừng gõ rồi mới gửi Keyword lên server.
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(filters.search.trim()), 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  // GET /api/v1/admin/facilities: lọc, tìm kiếm và phân trang phía server.
  const listKey = JSON.stringify([keyword, filters.status, page, pageSize, reload])
  const loading = data.key !== listKey
  useEffect(() => {
    let cancelled = false
    listAdminFacilities({ Keyword: keyword, ...statusFilters[filters.status], Page: page, PageSize: pageSize })
      .then(({ items, total, totalPages }) => !cancelled && setData({ key: listKey, facilities: items, total, totalPages: totalPages || Math.max(1, Math.ceil(total / pageSize)), error: '' }))
      .catch(error => !cancelled && setData(previous => ({ ...previous, key: listKey, error: error.message })))
    return () => { cancelled = true }
  }, [listKey, keyword, filters.status, page, pageSize])
  useEffect(() => {
    let cancelled = false
    getFacilityStatistics()
      .then(value => !cancelled && setStats({ key: reload, value, error: '' }))
      .catch(error => !cancelled && setStats(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [reload])

  const { facilities } = data
  const pages = Math.max(1, data.totalPages)
  const detail = facilities.find(facility => facility.id === detailId)
  const selectedFacilities = facilities.filter(facility => selected.includes(facility.id))
  const allVisibleSelected = facilities.length > 0 && facilities.every(facility => selected.includes(facility.id))
  const activeFilters = Object.values(filters).filter(Boolean).length
  const pendingCount = stats.value.pending
  const changeFilter = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1); setSelected([]) }
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const selectVisible = () => setSelected(allVisibleSelected ? [] : facilities.map(facility => facility.id))
  const reset = () => { setFilters(emptyFilters); setPage(1); setSelected([]) }
  const closeDialog = () => setDialog(null)
  const done = (message, keepOpen = false) => {
    setReload(value => value + 1)
    if (keepOpen) return
    setDialog(null); setSelected([])
    if (message) setNotice(message)
  }
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([facilitiesCsv(facilities)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'co-so-the-thao.csv'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${facilities.length} cơ sở của trang hiện tại ra CSV.`)
  }
  const statsLoading = stats.key === -1

  return <div className={`facilities-page ${detail ? 'with-details' : ''}`}>
    <section className="facilities-main-content">
      <header className="facilities-page-heading admin-page-header"><div><h1>Quản lý cơ sở sân <span>{statsLoading ? '…' : `${formatNumber(stats.value.total)} cơ sở`}</span></h1><p>Theo dõi, xét duyệt và quản lý cơ sở thể thao trên SportNexus.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)} disabled={loading}><RefreshCw size={13} />Làm mới</button><button className="users-button" onClick={exportCsv} disabled={!facilities.length}><Download size={13} />Xuất CSV</button>{pendingCount > 0 && <button className="users-button primary" onClick={() => changeFilter('status', 'Pending')}><BadgeCheck size={14} />{pendingCount} chờ duyệt</button>}</div></header>
      <div className="facilities-kpis">{facilityStats(stats.value).map(stat => { const Icon = statIcons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={26} /></div><strong>{statsLoading ? '…' : formatNumber(stat.value)}</strong><p>{stat.trend}</p></article> })}</div>
      {stats.error && <div className="users-notice" role="alert"><span>Không tải được thống kê cơ sở: {stats.error}</span></div>}
      {data.error && <div className="users-notice" role="alert"><span>Không tải được danh sách cơ sở: {data.error}</span><button onClick={() => setReload(value => value + 1)} aria-label="Thử lại">↻</button></div>}
      {notice && <div className="users-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
      <section className="facilities-toolbar" aria-label="Tìm kiếm và bộ lọc"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm cơ sở sân" placeholder="Tên cơ sở, chủ sân, địa chỉ…" value={filters.search} onChange={event => changeFilter('search', event.target.value)} /></label>
        <div className="facilities-filter-row">
          <label>Trạng thái<select value={filters.status} onChange={event => changeFilter('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.keys(statusFilters).map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label>
          <span className="facilities-filter-count"><Filter size={12} />Bộ lọc {activeFilters}</span><button className="facilities-text-button" onClick={reset}>Đặt lại</button>
        </div>
        <div className="facilities-bulk-row"><select aria-label="Thao tác hàng loạt" value="" disabled={!selected.length} onChange={event => setDialog({ type: 'action', action: event.target.value, facilities: selectedFacilities })}><option value="" disabled>Thao tác hàng loạt</option>{Object.entries(facilityActions).map(([key, action]) => <option key={key} value={key}>{action.label}</option>)}</select><span>{selected.length ? `Đã chọn ${selected.length} cơ sở` : 'Chọn cơ sở để thao tác'}</span>{selected.length > 0 && <button className="facilities-text-button" onClick={() => setSelected([])}>Bỏ chọn tất cả</button>}</div>
      </section>
      <section className="facilities-table-panel" aria-label="Danh sách cơ sở" aria-busy={loading}><div className="facilities-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả cơ sở trên trang" checked={allVisibleSelected} onChange={selectVisible} disabled={!facilities.length} ref={node => { if (node) node.indeterminate = !allVisibleSelected && facilities.some(facility => selected.includes(facility.id)) }} /></th>{['Tên cơ sở', 'Chủ sân', 'Địa chỉ', 'Môn thể thao', 'Số sân', 'Trạng thái'].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody style={loading ? { opacity: 0.5 } : undefined}>{facilities.map(facility => <tr key={facility.id} className={detailId === facility.id ? 'is-selected' : ''} onClick={() => setDetailId(facility.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${facility.name}`} checked={selected.includes(facility.id)} onChange={() => toggle(facility.id)} /></td><td><button className="facilities-table-profile" onClick={() => setDetailId(facility.id)} aria-expanded={detailId === facility.id}><img src={facility.images[0] || fallbackPhoto} alt="" /><span><strong>{facility.name}</strong><small>#{facility.id.slice(0, 8).toUpperCase()}</small></span></button></td><td><strong>{facility.owner.name || '—'}</strong>{(facility.owner.email || facility.owner.id) && <small>{facility.owner.email || `#${facility.owner.id.slice(0, 8).toUpperCase()}`}</small>}</td><td>{facility.address || '—'}</td><td><div className="facilities-sports">{facility.sports.length ? facility.sports.map(sport => <span key={sport} className={sport.toLowerCase()}>{sportLabels[sport] || sport}</span>) : '—'}</div></td><td>{facility.courtCount != null ? <><strong>{facility.courtCount}</strong> sân</> : '—'}</td><td><FacilityStatus status={facility.status} /></td></tr>)}</tbody></table>
        {loading && !facilities.length && <p className="facilities-empty">Đang tải cơ sở…</p>}
        {!loading && !facilities.length && <p className="facilities-empty">{activeFilters ? 'Không có cơ sở phù hợp. Hãy đặt lại bộ lọc.' : 'Chưa có cơ sở thể thao nào trên hệ thống.'}</p>}</div>
        <footer className="facilities-pagination"><span>Hiển thị {data.total ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + facilities.length} / {formatNumber(data.total)} cơ sở</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); setSelected([]) }}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang cơ sở"><button aria-label="Trang trước" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={13} /></button>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} aria-label={`Trang ${number}`} aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Trang sau" disabled={loading || page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={13} /></button></nav></footer>
      </section>
    </section>
    {detail && <FacilityDetails key={`${detail.id}#${reload}`} facility={detail} onClose={() => setDetailId(null)} onEdit={facility => setDialog({ type: 'form', facility })} onAction={action => setDialog({ type: 'action', action, facilities: [detail] })} onBookings={() => navigate('/admin/bookings')} onPhoto={photo => setDialog({ type: 'photo', photo })} />}
    {dialog?.type === 'form' && <FacilityFormDialog facility={dialog.facility} onClose={closeDialog} onDone={done} />}
    {dialog?.type === 'action' && <FacilityActionDialog facilities={dialog.facilities} action={dialog.action} onClose={closeDialog} onDone={done} />}
    {dialog?.type === 'photo' && <FacilityPhotoDialog photo={dialog.photo} onClose={closeDialog} />}
  </div>
}
