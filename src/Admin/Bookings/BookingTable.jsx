import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { PaymentBadge } from './BookingDetails.jsx'
import { bookingStatusLabels, bookingStatusTone, sportLabels, money, number, date, bookingTotal } from './bookingData.js'

// Hiển thị tối đa 5 nút số trang quanh trang hiện tại.
const pageWindow = (current, pages) => {
  const start = Math.max(1, Math.min(current - 2, pages - 4))
  return Array.from({ length: Math.min(5, pages) }, (_, index) => start + index)
}

// `bookings` là dữ liệu của trang hiện tại do server trả về (đã phân trang).
export default function BookingTable({ bookings, total, totalPages, loading, error, selected, setSelected, detailId, onDetail, page, pageSize, onPage, onPageSize }) {
  const pages = Math.max(1, totalPages)
  const allSelected = bookings.length > 0 && bookings.every(booking => selected.includes(booking.uuid))
  const selectAll = () => setSelected(previous => allSelected ? previous.filter(id => !bookings.some(booking => booking.uuid === id)) : [...new Set([...previous, ...bookings.map(booking => booking.uuid)])])
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const shortId = id => (id.length > 14 ? id.slice(0, 8).toUpperCase() : id)
  return <section className="bookings-table-panel" aria-label="Danh sách đơn đặt sân" aria-busy={loading}><div className="bookings-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả đơn trên trang" disabled={!bookings.length} checked={allSelected} onChange={selectAll} ref={node => { if (node) node.indeterminate = !allSelected && bookings.some(booking => selected.includes(booking.uuid)) }} /></th>{['Mã đơn đặt sân', 'Người đặt', 'Cơ sở / sân', 'Môn thể thao', 'Ngày / giờ', 'Trạng thái', 'Thanh toán', 'Tổng tiền'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody style={loading ? { opacity: 0.5 } : undefined}>{bookings.map(booking => <tr key={booking.uuid} className={detailId === booking.uuid ? 'is-selected' : ''} onClick={() => onDetail(booking.uuid)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn đơn ${booking.id}`} checked={selected.includes(booking.uuid)} onChange={() => toggle(booking.uuid)} /></td><td><button className="bookings-id-button" onClick={() => onDetail(booking.uuid)} aria-expanded={detailId === booking.uuid} title={booking.id}>#{shortId(booking.id)}</button><small>{booking.isWalkIn ? 'Đặt tại quầy' : 'Đơn đặt sân'}</small></td><td><div className="bookings-table-player"><UserAvatar user={booking.player} /><div><strong>{booking.player.name}</strong>{booking.player.username && <small>@{booking.player.username}</small>}</div></div></td><td><strong>{booking.venue.name}</strong><small>{booking.venue.court}</small></td><td>{booking.venue.sport ? <span className={`bookings-sport ${booking.venue.sport.toLowerCase()}`}>{sportLabels[booking.venue.sport] || booking.venue.sport}</span> : '—'}</td><td>{date(booking.date)}<small>{booking.start}{booking.end && ` – ${booking.end}`}</small></td><td><StatusBadge status={bookingStatusTone[booking.status] || 'Pending'} label={bookingStatusLabels[booking.status] || booking.status} /></td><td><PaymentBadge status={booking.payment} /></td><td><strong className="bookings-table-amount">{money(bookingTotal(booking))}</strong></td></tr>)}</tbody></table>
    {loading && !bookings.length && <p className="bookings-empty">Đang tải đơn đặt sân…</p>}
    {!loading && error && <p className="bookings-empty" role="alert">{error}</p>}
    {!loading && !error && !bookings.length && <p className="bookings-empty">Không có đơn đặt sân phù hợp. Hãy đặt lại hoặc điều chỉnh bộ lọc.</p>}</div>
    <footer className="bookings-pagination"><span>Hiển thị {bookings.length ? number((page - 1) * pageSize + 1) : 0}–{number((page - 1) * pageSize + bookings.length)} / {number(total)} đơn</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => onPageSize(Number(event.target.value))}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang đơn đặt sân"><button aria-label="Trang trước" disabled={loading || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={13} /></button>{pageWindow(page, pages).map(value => <button key={value} aria-label={`Trang ${value}`} aria-current={page === value ? 'page' : undefined} disabled={loading} onClick={() => onPage(value)}>{value}</button>)}<button aria-label="Trang sau" disabled={loading || page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={13} /></button></nav></footer></section>
}
