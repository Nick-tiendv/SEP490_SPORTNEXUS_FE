import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, BadgeCheck, Wrench, Network, Search, Download, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import FacilityDetails, { FacilityStatus } from './FacilityDetails.jsx'
import { FacilityFormDialog, FacilityStatusDialog, FacilityPhotoDialog } from './FacilityDialogs.jsx'
import { statusLabels, sportLabels, formatNumber, filterFacilities, facilityStats, facilitiesCsv, fallbackPhoto, isPending } from './facilityData.js'
import { getSportOptions, listAdminFacilities } from '../../api/admin/facilityApi.js'
import { listAccounts } from '../../api/admin/accountApi.js'
import '../Users/users.css'
import './facility.css'

const emptyFilters = { search: '', status: '', sport: '', rating: '' }
const statIcons = { facilities: Building2, active: BadgeCheck, maintenance: Wrench, courts: Network }

export default function FacilityManagement() {
  const [filters, setFilters] = useState(emptyFilters)
  const [reload, setReload] = useState(0)
  const [data, setData] = useState({ key: '', facilities: [], error: '' })
  const [owners, setOwners] = useState({})
  const [sports, setSports] = useState([])
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  // GET /api/v1/facilities lọc phía server theo status và categoryId (môn); tìm kiếm, đánh giá, phân trang ở FE.
  const listKey = `${filters.status}|${filters.sport}#${reload}`
  const loading = data.key !== listKey
  useEffect(() => {
    let cancelled = false
    const [query] = listKey.split('#')
    const [status, categoryId] = query.split('|')
    listAdminFacilities({ status, categoryId })
      .then(facilities => !cancelled && setData({ key: listKey, facilities, error: '' }))
      .catch(error => !cancelled && setData(previous => ({ key: listKey, facilities: previous.facilities, error: error.message })))
    return () => { cancelled = true }
  }, [listKey])
  // Tên chủ sân lấy từ danh sách tài khoản (phòng khi response cơ sở chỉ có ownerId).
  useEffect(() => {
    let cancelled = false
    listAccounts().then(accounts => !cancelled && setOwners(Object.fromEntries(accounts.map(account => [account.id, account.name])))).catch(() => {})
    getSportOptions().then(items => !cancelled && setSports(items)).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const facilities = data.facilities.map(facility => (facility.owner.name || !owners[facility.owner.id] ? facility : { ...facility, owner: { ...facility.owner, name: owners[facility.owner.id] } }))
  const filtered = filterFacilities(facilities, filters)
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const detail = facilities.find(facility => facility.id === detailId)
  const allVisibleSelected = visible.length > 0 && visible.every(facility => selected.includes(facility.id))
  const activeFilters = Object.values(filters).filter(Boolean).length
  const pendingCount = facilities.filter(isPending).length
  const changeFilter = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const selectVisible = () => setSelected(previous => allVisibleSelected ? previous.filter(id => !visible.some(facility => facility.id === id)) : [...new Set([...previous, ...visible.map(facility => facility.id)])])
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const closeDialog = () => setDialog(null)
  const done = (message, keepOpen = false) => {
    setReload(value => value + 1)
    if (keepOpen) return
    setDialog(null); setSelected([])
    if (message) setNotice(message)
  }
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([facilitiesCsv(filtered)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'co-so-the-thao.csv'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${filtered.length} cơ sở đang được lọc ra CSV.`)
  }

  return <div className={`facilities-page ${detail ? 'with-details' : ''}`}>
    <section className="facilities-main-content">
      <header className="facilities-page-heading admin-page-header"><div><h1>Quản lý cơ sở sân <span>{loading && !facilities.length ? '…' : `${formatNumber(facilities.length)} cơ sở`}</span></h1><p>Theo dõi, xét duyệt và quản lý cơ sở thể thao trên SportNexus.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)} disabled={loading}><RefreshCw size={13} />Làm mới</button><button className="users-button" onClick={exportCsv} disabled={!filtered.length}><Download size={13} />Xuất CSV</button>{pendingCount > 0 && <button className="users-button primary" onClick={() => changeFilter('status', 'Pending')}><BadgeCheck size={14} />{pendingCount} chờ duyệt</button>}</div></header>
      <div className="facilities-kpis">{facilityStats(facilities).map(stat => { const Icon = statIcons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={26} /></div><strong>{loading && !facilities.length ? '…' : formatNumber(stat.value)}</strong><p>{stat.trend}</p></article> })}</div>
      {data.error && <div className="users-notice" role="alert"><span>Không tải được danh sách cơ sở: {data.error}</span><button onClick={() => setReload(value => value + 1)} aria-label="Thử lại">↻</button></div>}
      {notice && <div className="users-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
      <section className="facilities-toolbar" aria-label="Tìm kiếm và bộ lọc"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm cơ sở sân" placeholder="Tên cơ sở, chủ sân, địa chỉ…" value={filters.search} onChange={event => changeFilter('search', event.target.value)} /></label>
        <div className="facilities-filter-row">
          <label>Trạng thái<select value={filters.status} onChange={event => changeFilter('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
          <label>Môn thể thao<select value={filters.sport} onChange={event => changeFilter('sport', event.target.value)} disabled={!sports.length}><option value="">{sports.length ? 'Tất cả môn' : 'Chưa có dữ liệu môn'}</option>{sports.map(sport => <option key={sport.id} value={sport.id}>{sportLabels[sport.name] || sport.name}</option>)}</select></label>
          <label>Đánh giá<select value={filters.rating} onChange={event => changeFilter('rating', event.target.value)}><option value="">Tất cả đánh giá</option><option value="4.5">Từ 4,5 sao</option><option value="4">Từ 4 sao</option><option value="3">Từ 3 sao</option></select></label>
          <span className="facilities-filter-count"><Filter size={12} />Bộ lọc {activeFilters}</span><button className="facilities-text-button" onClick={reset}>Đặt lại</button>
        </div>
        <div className="facilities-bulk-row"><select aria-label="Thao tác hàng loạt" value="" disabled={!selected.length} onChange={event => setDialog({ type: 'status', status: event.target.value, facilities: facilities.filter(facility => selected.includes(facility.id)) })}><option value="" disabled>Thao tác hàng loạt</option><option value="Active">Duyệt / kích hoạt cơ sở</option><option value="Inactive">Vô hiệu hóa cơ sở</option><option value="Maintenance">Chuyển sang bảo trì</option><option value="Rejected">Từ chối cơ sở</option></select><span>{selected.length ? `Đã chọn ${selected.length} cơ sở` : 'Chọn cơ sở để thao tác'}</span>{selected.length > 0 && <button className="facilities-text-button" onClick={() => setSelected([])}>Bỏ chọn tất cả</button>}</div>
      </section>
      <section className="facilities-table-panel" aria-label="Danh sách cơ sở" aria-busy={loading}><div className="facilities-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả cơ sở trên trang" checked={allVisibleSelected} onChange={selectVisible} disabled={!visible.length} ref={node => { if (node) node.indeterminate = !allVisibleSelected && visible.some(facility => selected.includes(facility.id)) }} /></th>{['Tên cơ sở', 'Chủ sân', 'Địa chỉ', 'Môn thể thao', 'Số sân', 'Trạng thái'].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody style={loading ? { opacity: 0.5 } : undefined}>{visible.map(facility => <tr key={facility.id} className={detailId === facility.id ? 'is-selected' : ''} onClick={() => setDetailId(facility.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${facility.name}`} checked={selected.includes(facility.id)} onChange={() => toggle(facility.id)} /></td><td><button className="facilities-table-profile" onClick={() => setDetailId(facility.id)} aria-expanded={detailId === facility.id}><img src={facility.images[0] || fallbackPhoto} alt="" /><span><strong>{facility.name}</strong><small>#{facility.id.slice(0, 8).toUpperCase()}</small></span></button></td><td><strong>{facility.owner.name || '—'}</strong>{facility.owner.id && <small>#{facility.owner.id.slice(0, 8).toUpperCase()}</small>}</td><td>{facility.address || '—'}</td><td><div className="facilities-sports">{facility.sports.length ? facility.sports.map(sport => <span key={sport} className={sport.toLowerCase()}>{sportLabels[sport] || sport}</span>) : '—'}</div></td><td>{facility.courtCount != null ? <><strong>{facility.courtCount}</strong> sân</> : '—'}</td><td><FacilityStatus status={facility.status} /></td></tr>)}</tbody></table>
        {loading && !facilities.length && <p className="facilities-empty">Đang tải cơ sở…</p>}
        {!loading && !visible.length && <p className="facilities-empty">{facilities.length ? 'Không có cơ sở phù hợp. Hãy đặt lại bộ lọc.' : 'Chưa có cơ sở thể thao nào trên hệ thống.'}</p>}</div>
        <footer className="facilities-pagination"><span>Hiển thị {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length} cơ sở</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang cơ sở"><button aria-label="Trang trước" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={13} /></button>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} aria-label={`Trang ${number}`} aria-current={currentPage === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Trang sau" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={13} /></button></nav></footer>
      </section>
    </section>
    {detail && <FacilityDetails key={`${detail.id}#${reload}`} facility={detail} ownerName={owners[detail.owner.id]} onClose={() => setDetailId(null)} onEdit={facility => setDialog({ type: 'form', facility })} onStatus={status => setDialog({ type: 'status', facilities: [detail], status })} onBookings={() => navigate('/admin/bookings')} onPhoto={photo => setDialog({ type: 'photo', photo })} />}
    {dialog?.type === 'form' && <FacilityFormDialog facility={dialog.facility} onClose={closeDialog} onDone={done} />}
    {dialog?.type === 'status' && <FacilityStatusDialog facilities={dialog.facilities} status={dialog.status} onClose={closeDialog} onDone={done} />}
    {dialog?.type === 'photo' && <FacilityPhotoDialog photo={dialog.photo} onClose={closeDialog} />}
  </div>
}
