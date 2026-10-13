import { X, AlertTriangle, MapPin, CalendarDays, Clock3, ShieldCheck, Ban } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { statusLabels, sportLabels, slotLabels, money, date, paidAmount, escrowLabel } from './lfgData.js'

export function LFGStatus({ status }) {
  const badge = { Open: 'Confirmed', Full: 'Pending', Completed: 'Completed', Cancelled: 'Cancelled' }[status]
  return <StatusBadge status={badge} label={statusLabels[status]} />
}

export function LFGFinances({ activity }) {
  const paid = paidAmount(activity)
  return <dl className="lfg-finances"><div><dt>Tổng tiền sân</dt><dd>{money(activity.courtFee)}</dd></div><div><dt>Đã thanh toán minh họa</dt><dd>{money(paid)}</dd></div><div><dt>Còn lại</dt><dd>{money(activity.courtFee - paid)}</dd></div><div><dt>Ký quỹ</dt><dd>{escrowLabel(activity)}</dd></div></dl>
}

export default function LFGDetails({ activity, onClose, onSlot, onReports, onFinance, onModerate }) {
  const occupied = activity.slots.filter(slot => slot.status === 'Occupied').length
  const pending = activity.slots.filter(slot => slot.status === 'Pending').length
  return <aside className="lfg-details" aria-label="Chi tiết kèo ghép trận"><header><div><p><span className="lfg-sport">{sportLabels[activity.venue.sport]}</span><LFGStatus status={activity.status} /></p><h2>#{activity.id}: {activity.title}</h2></div><button aria-label="Đóng chi tiết kèo" onClick={onClose}><X size={17} /></button></header><div className="lfg-detail-body">
    {activity.reports.length > 0 && <section className="lfg-report-alert"><AlertTriangle size={15} /><div><strong>{activity.reports.length} báo cáo cần rà soát</strong><p>{activity.reports.every(report => report.reviewed) ? 'Đã xem trong bản mẫu; chưa kết luận vi phạm.' : 'Thông tin minh họa; chưa kết luận vi phạm.'}</p></div><button onClick={onReports}>Xem báo cáo</button></section>}
    <section className="lfg-info-card"><div className="lfg-match-grid"><div><small>Lịch chơi</small><strong><CalendarDays size={11} />{date(activity.date)}</strong><p><Clock3 size={11} />{activity.start} – {activity.end}</p></div><div><small>Cơ sở / sân</small><strong>{activity.venue.name}</strong><p>{activity.venue.court}</p></div><div><small>Vị trí người chơi</small><strong>{occupied}/{activity.slots.length} đã xác nhận</strong><p>{pending} vị trí chờ xác nhận</p></div><div><small>Trình độ yêu cầu</small><strong>{activity.skill}</strong><p>{money(activity.courtFee / activity.slots.length)} / người</p></div></div><p className="lfg-address"><MapPin size={11} />{activity.venue.address}</p>{activity.bookingId && <p className="lfg-related-booking">Mã đặt sân minh họa: #{activity.bookingId}</p>}</section>
    <section className="lfg-organizer"><UserAvatar user={activity.host} /><div><strong>{activity.host.name} <span>Người tổ chức</span></strong><small>@{activity.host.username} · {activity.host.rating}</small><p><ShieldCheck size={11} />Độ tin cậy {activity.host.reliability} (minh họa)</p></div></section>
    <section className="lfg-slots"><h3>Sơ đồ vị trí người chơi <small>{activity.slots.length} vị trí</small></h3><div>{activity.slots.map(slot => <button key={slot.id} className={`lfg-slot ${slot.status.toLowerCase()} ${slot.id === 1 ? 'host' : ''}`} onClick={() => onSlot(slot)}><span>Vị trí {slot.id} {slot.id === 1 && '· Người tổ chức'}</span><strong>{slot.player?.name || 'Vị trí còn trống'}</strong><small>{slotLabels[slot.status]}{slot.player && ` · ${slot.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}`}</small></button>)}</div></section>
    <section className="lfg-claims"><h3>Danh sách người đã đăng ký</h3><div><table><thead><tr>{['Người chơi', 'Giờ đăng ký', 'Vị trí', 'Trạng thái', 'Thanh toán'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{activity.slots.filter(slot => slot.player).map(slot => <tr key={slot.id}><td>{slot.player.name}</td><td>{slot.claimTime}</td><td>{slot.id}</td><td>{slotLabels[slot.status]}</td><td className={slot.paid ? 'paid' : 'unpaid'}>{slot.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</td></tr>)}</tbody></table></div></section>
    <section className="lfg-finance-card"><h3>Thông tin tài chính <button onClick={onFinance}>Xem chi tiết</button></h3><LFGFinances activity={activity} /></section>
    <section className="lfg-history"><h3>Lịch sử hoạt động và ký quỹ</h3><p>Nhật ký mẫu ngày {date(activity.historyDate)}; cập nhật bản mẫu được ghi riêng.</p><ol>{activity.history.map(event => <li key={event.id}><strong>{event.date ? `${date(event.date)} · ` : ''}{event.time}</strong> · {event.text}</li>)}</ol></section>
    {activity.moderationReason && <p className="lfg-demo-note">Lý do hủy: {activity.moderationReason}</p>}
  </div><footer><button className="users-button users-danger" disabled={['Cancelled', 'Completed'].includes(activity.status)} onClick={onModerate}><Ban size={13} />{activity.status === 'Cancelled' ? 'Kèo đã hủy' : activity.status === 'Completed' ? 'Kèo đã hoàn thành' : 'Hủy kèo — Bản mẫu'}</button><p>Chỉ rà soát và thay đổi trạng thái minh họa. Không xử lý tiền, cấm tài khoản hoặc nhận vị trí người chơi.</p></footer></aside>
}
