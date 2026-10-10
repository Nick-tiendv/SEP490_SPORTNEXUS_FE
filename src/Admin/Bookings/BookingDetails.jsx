import { X, MapPin, CalendarDays, Clock3, FileText, MessageSquare } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { bookingStatusLabels, paymentStatusLabels, escrowLabels, sportLabels, money, date, bookingTotal } from './bookingData.js'

export function PaymentBadge({ status }) {
  return <span className={`bookings-payment ${status.toLowerCase()}`}><i />{paymentStatusLabels[status]}</span>
}

export function BookingBreakdown({ booking }) {
  return <dl className="bookings-breakdown">{booking.charges.map(charge => <div key={charge.label}><dt>{charge.label}</dt><dd>{money(charge.amount)}</dd></div>)}<div className="bookings-total"><dt>Tổng tiền thanh toán</dt><dd>{money(bookingTotal(booking))}</dd></div></dl>
}

export default function BookingDetails({ booking, onClose, onProfile, onReceipt, onReason }) {
  const paid = booking.members.filter(member => member.paid).length
  return <aside className="bookings-details" aria-label="Chi tiết đơn đặt sân"><header><div><h2>#{booking.id} <StatusBadge status={booking.status} label={bookingStatusLabels[booking.status]} /></h2><p><PaymentBadge status={booking.payment} />Tạo lúc {date(booking.createdDate)} · {booking.createdTime}</p></div><button aria-label="Đóng chi tiết đơn đặt sân" onClick={onClose}><X size={17} /></button></header>
    <div className="bookings-detail-body">
      <section className="bookings-detail-card"><h3>Thông tin người đặt <button onClick={onProfile}>Xem hồ sơ</button></h3><div className="bookings-player"><UserAvatar user={booking.player} /><div><strong>{booking.player.name}</strong><small>@{booking.player.username} · #{booking.player.id}</small><small>{booking.player.email}</small></div></div></section>
      <section className="bookings-detail-card"><h3>Cơ sở và sân <span className="bookings-sport">{sportLabels[booking.venue.sport]}</span></h3><strong className="bookings-venue-name">{booking.venue.name}</strong><p><MapPin size={12} />{booking.venue.court}</p><p>{booking.venue.address}</p><p>Chủ sân: <strong>{booking.venue.owner}</strong></p><div className="bookings-schedule"><p><CalendarDays size={12} />{date(booking.date)}</p><p><Clock3 size={12} />{booking.start} – {booking.end} ({booking.duration} giờ)</p></div></section>
      <section className="bookings-detail-card"><h3>Chi tiết thanh toán và dịch vụ</h3><BookingBreakdown booking={booking} /><p className="bookings-escrow-state"><i />{escrowLabels[booking.escrow]}</p></section>
      <section className="bookings-detail-card"><h3>Chia tiền thanh toán <span>{paid}/{booking.members.length} đã thanh toán</span></h3><ul className="bookings-members">{booking.members.map(member => <li key={member.name}><i className={member.paid ? 'paid' : 'unpaid'} /><span>{member.name}{member.host && <small> (Người đặt)</small>}</span><strong>{money(member.amount)}<small>{member.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</small></strong></li>)}</ul></section>
      <p className="bookings-demo-note">Dữ liệu bản mẫu. Các khoản tiền, trạng thái thanh toán và ký quỹ chỉ phục vụ minh họa giao diện.</p>
    </div><footer><button className="users-button" onClick={onReceipt}><FileText size={13} />Xem phiếu đặt sân</button>{booking.status === 'Cancelled' && <button className="users-button users-danger" onClick={onReason}><MessageSquare size={13} />Xem lý do hủy</button>}</footer>
  </aside>
}
