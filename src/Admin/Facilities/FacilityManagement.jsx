import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, BadgeCheck, Wrench, Network, Search, Download, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminMenu } from '../adminMenu.js'
import FacilityDetails, { FacilityStatus } from './FacilityDetails.jsx'
import { FacilityFormDialog, FacilityStatusDialog, FacilityPhotoDialog } from './FacilityDialogs.jsx'
import { initialFacilities, facilityStats, facilityPhotos, sportLabels, statusLabels, formatNumber, makeCourts } from './facilityData.js'
import '../Users/users.css'
import './facility.css'

const emptyFilters = { search: '', status: '', sport: '', location: '', rating: '' }
const statIcons = { facilities: Building2, active: BadgeCheck, maintenance: Wrench, courts: Network }
const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState(initialFacilities)
  const [filters, setFilters] = useState(emptyFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(initialFacilities[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const filtered = facilities.filter(facility => {
    const searchable = normalize(`${facility.name} ${facility.owner.name} ${facility.location} ${facility.address}`)
    return searchable.includes(normalize(filters.search.trim())) && (!filters.status || facility.status === filters.status)
      && (!filters.sport || facility.sports.includes(filters.sport)) && (!filters.location || facility.location === filters.location)
      && (!filters.rating || facility.rating >= Number(filters.rating))
  })
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const detail = facilities.find(facility => facility.id === detailId)
  const allVisibleSelected = visible.length > 0 && visible.every(facility => selected.includes(facility.id))
  const activeFilters = Object.values(filters).filter(Boolean).length
  const changeFilter = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const selectVisible = () => setSelected(previous => allVisibleSelected ? previous.filter(id => !visible.some(facility => facility.id === id)) : [...new Set([...previous, ...visible.map(facility => facility.id)])])
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const closeDialog = () => setDialog(null)
  const saveFacility = values => {
    const existing = dialog.facility
    const id = existing?.id || `DEMO-FAC-${Math.max(0, ...facilities.map(facility => Number(facility.id.split('-').at(-1)))) + 1}`
    const { count, name, owner, location, address, sports, opens, closes, category } = values
    const data = { name, owner, location, address, sports, opens, closes, category }
    const updated = { ...(existing || { id, status: 'Active', rating: 0, reviews: 0, photos: facilityPhotos }), ...data, courts: makeCourts(count, data.sports, existing?.courts) }
    setFacilities(previous => existing ? previous.map(facility => facility.id === id ? updated : facility) : [updated, ...previous])
    setDetailId(id)
    if (!existing) reset()
    setNotice(existing ? 'Đã cập nhật cơ sở trong dữ liệu minh họa.' : 'Đã thêm cơ sở vào dữ liệu minh họa.')
    closeDialog()
  }
  const confirmStatus = () => {
    const ids = dialog.facilities.map(facility => facility.id)
    setFacilities(previous => previous.map(facility => ids.includes(facility.id) ? { ...facility, status: dialog.status } : facility))
    setNotice(`Đã cập nhật ${ids.length} cơ sở sang trạng thái “${statusLabels[dialog.status]}” trong bản mẫu.`)
    closeDialog()
  }
  const exportCsv = () => {
    const escape = value => {
      const text = String(value)
      // Keep locally entered names/addresses from becoming spreadsheet formulas.
      return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`
    }
    const rows = [['Mã cơ sở', 'Tên cơ sở', 'Chủ sân', 'Địa điểm', 'Môn thể thao', 'Số sân', 'Trạng thái', 'Đánh giá', 'Giờ mở cửa', 'Giờ đóng cửa'],
      ...filtered.map(facility => [facility.id, facility.name, facility.owner.name, facility.address, facility.sports.map(sport => sportLabels[sport]).join(', '), facility.courts.length, statusLabels[facility.status], facility.rating ? facility.rating.toLocaleString('vi-VN') : 'Chưa đánh giá', facility.opens, facility.closes])]
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'co-so-san-minh-hoa.csv'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${filtered.length} cơ sở đang được lọc ra CSV minh họa.`)
  }
  const viewBookings = () => {
    if (adminMenu.some(item => item.path === '/admin/bookings' && item.enabled)) navigate('/admin/bookings')
    else setNotice('Chức năng đang phát triển. Trang đơn đặt sân chưa được triển khai.')
  }

  return <div className={`facilities-page ${detail ? 'with-details' : ''}`}>
    <section className="facilities-main-content">
      <header className="facilities-page-heading"><div><h1>Quản lý cơ sở sân <span>3.890 cơ sở</span></h1><p>Theo dõi và quản lý cơ sở thể thao, cấu trúc sân và hoạt động trên SportNexus.</p></div><div><button className="users-button" onClick={exportCsv}><Download size={13} />Xuất CSV</button><button className="users-button primary" onClick={() => setDialog({ type: 'form', facility: null })}><Plus size={14} />Thêm cơ sở</button></div></header>
      <div className="facilities-kpis">{facilityStats.map(stat => { const Icon = statIcons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={26} /></div><strong>{formatNumber(stat.value)}</strong><p>{stat.trend}</p></article> })}</div>
      <p className="facilities-demo-label">Chỉ số và dữ liệu minh họa; chỉ số không tính từ {facilities.length} cơ sở mẫu. Thay đổi sẽ mất khi tải lại trang.</p>
      {notice && <div className="users-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
      <section className="facilities-toolbar" aria-label="Tìm kiếm và bộ lọc"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm cơ sở sân" placeholder="Tìm cơ sở, chủ sân, địa điểm…" value={filters.search} onChange={event => changeFilter('search', event.target.value)} /></label>
        <div className="facilities-filter-row">
          <label>Trạng thái<select value={filters.status} onChange={event => changeFilter('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Môn thể thao<select value={filters.sport} onChange={event => changeFilter('sport', event.target.value)}><option value="">Tất cả môn</option>{Object.entries(sportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Khu vực<select value={filters.location} onChange={event => changeFilter('location', event.target.value)}><option value="">Tất cả khu vực</option>{[...new Set(facilities.map(facility => facility.location))].sort((a, b) => a.localeCompare(b, 'vi')).map(location => <option key={location}>{location}</option>)}</select></label>
          <label>Đánh giá<select value={filters.rating} onChange={event => changeFilter('rating', event.target.value)}><option value="">Tất cả đánh giá</option><option value="4.5">Từ 4,5 sao</option><option value="4">Từ 4 sao</option><option value="3">Từ 3 sao</option></select></label>
          <span className="facilities-filter-count"><Filter size={12} />Bộ lọc {activeFilters}</span><button className="facilities-text-button" onClick={reset}>Đặt lại</button>
        </div>
        <div className="facilities-bulk-row"><select aria-label="Thao tác hàng loạt" value="" disabled={!selected.length} onChange={event => setDialog({ type: 'status', status: event.target.value, facilities: facilities.filter(facility => selected.includes(facility.id)) })}><option value="" disabled>Thao tác hàng loạt</option><option value="Disabled">Vô hiệu hóa cơ sở</option><option value="Active">Kích hoạt lại cơ sở</option><option value="Maintenance">Chuyển sang bảo trì</option></select><span>{selected.length ? `Đã chọn ${selected.length} cơ sở` : 'Chọn cơ sở để thao tác'}</span>{selected.length > 0 && <button className="facilities-text-button" onClick={() => setSelected([])}>Bỏ chọn tất cả</button>}</div>
      </section>
      <section className="facilities-table-panel" aria-label="Danh sách cơ sở"><div className="facilities-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả cơ sở trên trang" checked={allVisibleSelected} onChange={selectVisible} disabled={!visible.length} ref={node => { if (node) node.indeterminate = !allVisibleSelected && visible.some(facility => selected.includes(facility.id)) }} /></th>{['Tên cơ sở', 'Chủ sân', 'Địa điểm', 'Môn thể thao', 'Số sân', 'Trạng thái'].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{visible.map(facility => <tr key={facility.id} className={detailId === facility.id ? 'is-selected' : ''} onClick={() => setDetailId(facility.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${facility.name}`} checked={selected.includes(facility.id)} onChange={() => toggle(facility.id)} /></td><td><button className="facilities-table-profile" onClick={() => setDetailId(facility.id)} aria-expanded={detailId === facility.id}><img src={facility.photos[0].src} style={{ objectPosition: facility.photos[0].position }} alt="" /><span><strong>{facility.name}</strong><small>#{facility.id}</small></span></button></td><td><strong>{facility.owner.name}<i className={facility.owner.verified ? 'verified-dot' : ''} /></strong><small>#{facility.owner.id}</small></td><td>{facility.location}<small>TP. Hồ Chí Minh</small></td><td><div className="facilities-sports">{facility.sports.map(sport => <span key={sport} className={sport.toLowerCase()}>{sportLabels[sport]}</span>)}</div></td><td><strong>{facility.courts.length}</strong> sân</td><td><FacilityStatus status={facility.status} /></td></tr>)}</tbody></table>{!visible.length && <p className="facilities-empty">Không có cơ sở phù hợp. Hãy đặt lại bộ lọc hoặc thêm cơ sở minh họa.</p>}</div>
        <footer className="facilities-pagination"><span>Hiển thị {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length} cơ sở mẫu</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[5, 10, 15].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang cơ sở"><button aria-label="Trang trước" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={13} /></button>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} aria-label={`Trang ${number}`} aria-current={currentPage === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Trang sau" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={13} /></button></nav></footer>
      </section>
    </section>
    {detail && <FacilityDetails key={detail.id} facility={detail} onClose={() => setDetailId(null)} onEdit={() => setDialog({ type: 'form', facility: detail })} onStatus={() => setDialog({ type: 'status', facilities: [detail], status: detail.status === 'Disabled' ? 'Active' : 'Disabled' })} onBookings={viewBookings} onPhoto={photo => setDialog({ type: 'photo', photo })} />}
    {dialog?.type === 'form' && <FacilityFormDialog facility={dialog.facility} facilities={facilities} onClose={closeDialog} onSave={saveFacility} />}
    {dialog?.type === 'status' && <FacilityStatusDialog facilities={dialog.facilities} status={dialog.status} onClose={closeDialog} onConfirm={confirmStatus} />}
    {dialog?.type === 'photo' && <FacilityPhotoDialog photo={dialog.photo} onClose={closeDialog} />}
  </div>
}
