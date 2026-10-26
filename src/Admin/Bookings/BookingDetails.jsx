import { X, MapPin, CalendarDays, Clock3, FileText, MessageSquare, Ban } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { bookingStatusLabels, bookingStatusTone, paymentStatusLabels, sportLabels, money, date, bookingTotal, canCancel } from './bookingData.js'

export function PaymentBadge({ status }) {
  if (!status) return <span className="bookings-payment">—</span>
  return <span className={`bookings-payment ${status.toLowerCase()}`}><i />{paymentStatusLabels[status] || status}</span>
}

export function BookingBreakdown({ booking }) {
  return <dl className="bookings-breakdown">{booking.charges.map((charge, index) => <div key={`${charge.label}-${index}`}><dt>{charge.label}</dt><dd>{money(charge.amount)}</dd></div>)}<div className="bookings-total"><dt>Tổng tiền thanh toán</dt><dd>{money(bookingTotal(booking))}</dd></div></dl>
}

export default function BookingDetails({ booking, loading, error, onClose, onProfile, onReceipt, onReason, onCancel }) {
  const paid = booking.members.filter(member => member.paid).length
  return <aside className="bookings-details" aria-label="Chi tiết đơn đặt sân" aria-busy={loading}><header><div><h2>#{booking.id} <StatusBadge status={bookingStatusTone[booking.status] || 'Pending'} label={bookingStatusLabels[booking.status] || booking.status} /></h2><p><PaymentBadge status={booking.payment} />{booking.createdDate && `Tạo lúc ${date(booking.createdDate)}${booking.createdTime ? ` · ${booking.createdTime}` : ''}`}</p></div><button aria-label="Đóng chi tiết đơn đặt sân" onClick={onClose}><X size={17} /></button></header>
    <div className="bookings-detail-body">
      {loading && <p className="bookings-demo-note">Đang tải chi tiết đơn…</p>}
      {error && <p className="users-form-error" role="alert">Không tải được chi tiết: {error}</p>}
      <section className="bookings-detail-card"><h3>Thông tin người đặt <button onClick={onProfile}>Xem hồ sơ</button></h3><div className="bookings-player"><UserAvatar user={booking.player} /><div><strong>{booking.player.name}</strong>{booking.player.username && <small>@{booking.player.username}</small>}{booking.player.email && <small>{booking.player.email}</small>}</div></div></section>
      <section className="bookings-detail-card"><h3>Cơ sở và sân {booking.venue.sport && <span className="bookings-sport">{sportLabels[booking.venue.sport] || booking.venue.sport}</span>}</h3><strong className="bookings-venue-name">{booking.venue.name}</strong>{booking.venue.court && <p><MapPin size={12} />{booking.venue.court}</p>}{booking.venue.address && <p>{booking.venue.address}</p>}{booking.venue.owner && <p>Chủ sân: <strong>{booking.venue.owner}</strong></p>}<div className="bookings-schedule"><p><CalendarDays size={12} />{date(booking.date)}</p>{booking.start && <p><Clock3 size={12} />{booking.start}{booking.end && ` – ${booking.end}`}{booking.duration && ` (${booking.duration.toLocaleString('vi-VN')} giờ)`}</p>}</div></section>
      <section className="bookings-detail-card"><h3>Chi tiết thanh toán</h3><BookingBreakdown booking={booking} /></section>
      {booking.members.length > 0 && <section className="bookings-detail-card"><h3>Chia tiền thanh toán <span>{paid}/{booking.members.length} đã thanh toán</span></h3><ul className="bookings-members">{booking.members.map((member, index) => <li key={`${member.name}-${index}`}><i className={member.paid ? 'paid' : 'unpaid'} /><span>{member.name}{member.host && <small> (Người đặt)</small>}</span><strong>{money(member.amount)}<small>{member.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</small></strong></li>)}</ul></section>}
    </div><footer><button className="users-button" onClick={onReceipt}><FileText size={13} />Xem phiếu đặt sân</button>{/cancel/i.test(booking.status) && <button className="users-button" onClick={onReason}><MessageSquare size={13} />Xem lý do hủy</button>}{canCancel(booking) && <button className="users-button users-danger" onClick={onCancel} disabled={loading}><Ban size={13} />Hủy đơn</button>}</footer>
  </aside>
}
