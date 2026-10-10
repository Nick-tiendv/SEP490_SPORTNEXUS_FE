import { X, ShieldCheck, CalendarDays, Clock3 } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { statusLabels, typeLabels, methodLabels, money, date } from './paymentData.js'

export function TransactionStatus({ status }) {
  const style = { Successful: 'Confirmed', Pending: 'Pending', Failed: 'Cancelled', Refunded: 'Completed' }[status]
  return <span className={`payments-status ${status.toLowerCase()}`}><StatusBadge status={style} label={statusLabels[status]} /></span>
}
export function SplitSummary({ transaction }) {
  const paid = transaction.members.filter(member => member.paid)
  const total = transaction.members.reduce((sum, member) => sum + member.amount, 0)
  const paidAmount = paid.reduce((sum, member) => sum + member.amount, 0)
  return <><ul className="payments-members">{transaction.members.map(member => <li key={member.id}><span>{member.name}</span><strong>{money(member.amount)}<small>{member.paid ? 'Đã thanh toán mẫu' : 'Chưa thanh toán mẫu'}</small></strong></li>)}</ul><progress className="payments-split-progress" value={paid.length} max={transaction.members.length} aria-label="Tiến độ thanh toán của nhóm" /><p className="payments-muted">{paid.length}/{transaction.members.length} người đã thanh toán · {money(paidAmount)} / {money(total)}</p></>
}
export default function TransactionDetails({ transaction: t, onClose, onEscrow, onRefund, onReview, onUser, onBooking }) {
  return <aside className="payments-details" aria-label="Chi tiết giao dịch"><header><div><small>Chi tiết giao dịch</small><h2>#{t.id} <TransactionStatus status={t.status} /></h2></div><div><strong>{money(t.amount)}</strong><button onClick={onClose} aria-label="Đóng chi tiết giao dịch"><X size={17} /></button></div></header><div className="payments-detail-body"><p className="payments-ledger"><ShieldCheck size={15} /><span>Nhật ký giao dịch mẫu, chỉ dùng để theo dõi giao diện; không xác nhận giao dịch thực tế.</span></p>
    <section className="payments-detail-section"><h3>Thông tin giao dịch</h3><dl className="payments-metadata">{[['Loại giao dịch', typeLabels[t.type]], ['Phương thức', methodLabels[t.method]], ['Thời gian tạo', `${date(t.createdDate)} · ${t.createdTime}`], ['Cập nhật mẫu', t.processedTime || 'Đang chờ'], ['Mã tham chiếu', t.reference], ['Mã đặt sân', t.booking?.id || 'Không áp dụng'], ['Ký quỹ', t.escrow]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <section className="payments-detail-section"><h3>Thông tin người dùng <button onClick={onUser}>Xem hồ sơ</button></h3><div className="payments-user"><UserAvatar user={t.user} /><div><strong>{t.user.name}</strong><small>@{t.user.username} · {t.user.role}</small><p>{t.user.balance === null ? 'Chưa có số dư ví trong mẫu' : `Số dư ví mẫu: ${money(t.user.balance)}`}</p></div></div></section>
    {t.booking && <section className="payments-detail-section"><h3>Đơn đặt sân liên quan <button onClick={onBooking}>Xem đơn mẫu</button></h3><div className="payments-booking"><strong>{t.booking.facility}</strong><small>{t.booking.court} · {t.booking.status}</small><p><CalendarDays size={11} />{date(t.booking.date)} <Clock3 size={11} />{t.booking.start} – {t.booking.end}</p></div></section>}
    {t.members.length > 0 && <section className="payments-detail-section"><h3>Chia tiền thanh toán <button onClick={onEscrow}>Xem ký quỹ</button></h3><SplitSummary transaction={t} /></section>}
    {!t.members.length && ['Booking'].includes(t.type) && <button className="users-button" onClick={onEscrow}>Xem thông tin ký quỹ</button>}
    {t.refund && <section className="payments-detail-section"><h3>Bản ghi hoàn tiền mẫu</h3><p className="payments-muted">Đã có trong dữ liệu minh họa: {money(t.refund.amount)}</p><button className="users-button" onClick={onRefund}>Xem bản ghi hoàn tiền</button></section>}
    {t.issue && <section className="payments-issue-detail"><h3>Vấn đề cần rà soát</h3><p>{t.issue.summary}</p><small>{t.issue.reviewed ? 'Đã xem trong phiên mẫu; chưa đối soát thực tế' : 'Chưa xem trong phiên mẫu'}</small>{t.issue.note && <p>Ghi chú: {t.issue.note}</p>}<button className="users-button" onClick={onReview}>Ghi chú rà soát — Bản mẫu</button></section>}
    <section className="payments-detail-section"><h3>Lịch sử giao dịch mẫu</h3><ol className="payments-history">{t.history.map(event => <li key={event.id}>{event.text}</li>)}</ol></section>
    <p className="payments-muted">Không kết nối API. Các khoản tiền và thông tin người dùng đều là dữ liệu minh họa.</p>
  </div></aside>
}
