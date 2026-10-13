import { DemoDialog } from '../Users/UserDialogs.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { BookingBreakdown, PaymentBadge } from './BookingDetails.jsx'
import { money, number, date, bookingTotal, paidTotal, bookingStatusLabels, escrowLabels } from './bookingData.js'

export default function BookingDialogs({ dialog, onClose }) {
  const booking = dialog.booking
  if (dialog.type === 'summary') {
    const bookings = dialog.bookings
    const total = bookings.reduce((sum, item) => sum + bookingTotal(item), 0)
    const paid = bookings.reduce((sum, item) => sum + paidTotal(item), 0)
    const held = bookings.filter(item => item.escrow === 'Held').reduce((sum, item) => sum + paidTotal(item), 0)
    const review = bookings.filter(item => item.escrow === 'Review').reduce((sum, item) => sum + paidTotal(item), 0)
    return <DemoDialog title="Tổng hợp ký quỹ — Bản mẫu" closeLabel="Đóng hộp thoại" onClose={onClose}><p className="users-demo-note">Tổng hợp từ {number(bookings.length)} đơn đang được lọc, không phải chỉ số toàn nền tảng. Không thực hiện thanh toán, hoàn tiền hay chuyển tiền.</p><dl className="bookings-summary">{[['Tổng giá trị đơn', total], ['Đã thanh toán minh họa', paid], ['Chưa thanh toán minh họa', total - paid], ['Đang giữ ký quỹ minh họa', held], ['Chờ rà soát sau hủy minh họa', review]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{money(value)}</dd></div>)}</dl>{!bookings.length && <p className="bookings-demo-note">Không có đơn phù hợp với bộ lọc hiện tại.</p>}<footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
  }
  if (dialog.type === 'profile') return <DemoDialog title="Hồ sơ người đặt — Bản mẫu" closeLabel="Đóng hộp thoại" onClose={onClose}><div className="bookings-player"><UserAvatar user={booking.player} /><div><strong>{booking.player.name}</strong><small>@{booking.player.username}</small><small>{booking.player.email}</small></div></div><p className="users-demo-note">Hồ sơ minh họa của người đặt trong đơn #{booking.id}. Không tra cứu tài khoản thực tế.</p><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
  if (dialog.type === 'reason') return <DemoDialog title="Lý do hủy đơn — Bản mẫu" closeLabel="Đóng hộp thoại" onClose={onClose}><p className="bookings-dialog-id">#{booking.id}</p><p>{booking.cancellationReason}</p><p className="users-demo-note">Chỉ xem lý do hủy minh họa đã có trong dữ liệu mẫu. Không hủy đơn hoặc xử lý hoàn tiền.</p><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
  return <DemoDialog title="Phiếu đặt sân — Xem trước bản mẫu" closeLabel="Đóng hộp thoại" onClose={onClose}><p className="users-demo-note">Đây là phiếu xem trước bằng dữ liệu minh họa, không phải hóa đơn, biên lai thanh toán hay xác nhận giao dịch chính thức.</p><div className="bookings-receipt"><h3>SportNexus · Phiếu minh họa</h3><dl className="bookings-summary">{[['Mã đơn đặt sân', booking.id], ['Người đặt', booking.player.name], ['Cơ sở', booking.venue.name], ['Sân', booking.venue.court], ['Ngày đặt sân', date(booking.date)], ['Giờ đặt sân', `${booking.start} – ${booking.end} (${booking.duration} giờ)`], ['Trạng thái', bookingStatusLabels[booking.status]], ['Ký quỹ', escrowLabels[booking.escrow]]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><PaymentBadge status={booking.payment} /><BookingBreakdown booking={booking} /></div><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
}
