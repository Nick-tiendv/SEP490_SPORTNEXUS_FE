import { useState } from 'react'
import { CalendarDays, CheckCircle2, BadgeCheck, CircleX, Banknote, Download, ListFilter, Search, Filter } from 'lucide-react'
import BookingTable from './BookingTable.jsx'
import BookingDetails from './BookingDetails.jsx'
import BookingDialogs from './BookingDialogs.jsx'
import { initialBookings, bookingStats, bookingStatusLabels, paymentStatusLabels, sportLabels, number, exportBookings, normalize, parseBookingDate } from './bookingData.js'
import '../Users/users.css'
import './booking.css'

const emptyFilters = { search: '', status: '', payment: '', sport: '', facility: '', from: '', to: '' }
const icons = { total: CalendarDays, confirmed: CheckCircle2, completed: BadgeCheck, cancelled: CircleX, revenue: Banknote }

export default function BookingManagement() {
  const [filters, setFilters] = useState(emptyFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(initialBookings[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const fromDate = parseBookingDate(filters.from), toDate = parseBookingDate(filters.to)
  const invalidDate = (filters.from && !fromDate) || (filters.to && !toDate)
  const invalidRange = fromDate && toDate && fromDate > toDate
  const filtered = initialBookings.filter(booking => !invalidRange && !invalidDate
    && normalize(`${booking.id} ${booking.player.name} ${booking.venue.name} ${booking.venue.court}`).includes(normalize(filters.search.trim()))
    && (!filters.status || booking.status === filters.status) && (!filters.payment || booking.payment === filters.payment)
    && (!filters.sport || booking.venue.sport === filters.sport) && (!filters.facility || booking.venue.id === filters.facility)
    && (!fromDate || booking.date >= fromDate) && (!toDate || booking.date <= toDate))
  const detail = initialBookings.find(booking => booking.id === detailId)
  const venues = [...new Map(initialBookings.map(booking => [booking.venue.id, booking.venue])).values()]
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const download = () => { exportBookings(filtered); setNotice(`Đã xuất ${number(filtered.length)} đơn đang được lọc ra CSV minh họa.`) }
  return <div className={`bookings-page ${detail ? 'with-details' : ''}`}><section className="bookings-main-content">
    <header className="bookings-page-heading"><div><h1>Quản lý đặt sân <span>94.620 đơn</span></h1><p>Theo dõi đơn đặt sân, lịch sử sử dụng và thông tin thanh toán trên SportNexus.</p></div><div className="bookings-heading-actions"><button className="users-button" onClick={download}><Download size={14} />Xuất CSV</button><button className="users-button bookings-summary-action" onClick={() => setDialog({ type: 'summary', bookings: filtered })}><ListFilter size={14} />Tổng hợp ký quỹ</button></div></header>
    <div className="bookings-kpis">{bookingStats.map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={23} /></div><strong>{number(stat.value)}{stat.icon === 'revenue' && <span className="bookings-currency">đ</span>}</strong><p>{stat.trend}</p></article> })}</div>
    <p className="bookings-demo-label">Chỉ số toàn nền tảng là số liệu minh họa riêng; không tính từ {initialBookings.length} đơn mẫu bên dưới. Không kết nối máy chủ.</p>
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <section className="bookings-toolbar" aria-label="Tìm kiếm và bộ lọc đơn đặt sân"><div className="bookings-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm đơn đặt sân" placeholder="Tìm mã đơn, người đặt, cơ sở, sân…" value={filters.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(bookingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Thanh toán<select value={filters.payment} onChange={event => change('payment', event.target.value)}><option value="">Tất cả thanh toán</option>{Object.entries(paymentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <div className="bookings-filter-row"><label>Môn thể thao<select value={filters.sport} onChange={event => change('sport', event.target.value)}><option value="">Tất cả môn</option>{Object.entries(sportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Cơ sở<select value={filters.facility} onChange={event => change('facility', event.target.value)}><option value="">Tất cả cơ sở</option>{venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label></div>
      <div className="bookings-filter-row bookings-date-row"><label>Từ ngày<input type="text" inputMode="numeric" placeholder="dd/mm/yyyy" maxLength={10} aria-invalid={Boolean(invalidDate)} aria-describedby={invalidDate || invalidRange ? 'bookings-date-error' : undefined} value={filters.from} onChange={event => change('from', event.target.value)} /></label><label>Đến ngày<input type="text" inputMode="numeric" placeholder="dd/mm/yyyy" maxLength={10} aria-invalid={Boolean(invalidDate || invalidRange)} aria-describedby={invalidDate || invalidRange ? 'bookings-date-error' : undefined} value={filters.to} onChange={event => change('to', event.target.value)} /></label><span className="bookings-filter-count"><Filter size={12} />Bộ lọc {Object.values(filters).filter(Boolean).length}</span><button className="bookings-text-button" onClick={reset}>Đặt lại</button></div>
      {(invalidDate || invalidRange) && <p className="users-form-error" id="bookings-date-error" role="alert">{invalidDate ? 'Nhập ngày hợp lệ theo định dạng ngày/tháng/năm (ví dụ: 26/10/2026).' : 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.'}</p>}
      {selected.length > 0 && <div className="bookings-selection"><span>Đã chọn {selected.length} đơn (bao gồm các trang khác)</span><button className="bookings-text-button" onClick={() => setSelected([])}>Bỏ chọn tất cả</button></div>}
    </section>
    <BookingTable bookings={filtered} selected={selected} setSelected={setSelected} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />
  </section>{detail && <BookingDetails booking={detail} onClose={() => setDetailId(null)} onProfile={() => setDialog({ type: 'profile', booking: detail })} onReceipt={() => setDialog({ type: 'receipt', booking: detail })} onReason={() => setDialog({ type: 'reason', booking: detail })} />}{dialog && <BookingDialogs dialog={dialog} onClose={() => setDialog(null)} />}</div>
}
