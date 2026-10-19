import { useEffect, useState } from 'react'
import { X, MapPin, CalendarDays, Clock3, Ban, CircleAlert } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { getLfg } from '../../api/admin/lfgApi.js'
import { statusLabels, participantLabels, paymentLabels, sportLabels, money, number, playDate, playTime, titleOf, shortId, canCancel, formatDate } from './lfgData.js'

export function LFGStatus({ status }) {
  const badge = { OPEN: 'Confirmed', FILLED: 'Completed', CANCELLED: 'Cancelled', EXPIRED: 'Pending' }[status] || 'Pending'
  return <StatusBadge status={badge} label={statusLabels[status] || status || '—'} />
}

// Gộp bản ghi chi tiết vào dòng danh sách, bỏ qua field rỗng của API chi tiết.
const merge = (base, extra) => (extra ? { ...base, ...Object.fromEntries(Object.entries(extra).filter(([, value]) => value !== '' && value != null && value !== '—' && !(Array.isArray(value) && !value.length))), host: { ...base?.host, ...Object.fromEntries(Object.entries(extra.host || {}).filter(([, value]) => value && value !== '—')) } } : base)

export default function LFGDetails({ base, onClose, onCancel }) {
  const [state, setState] = useState({ detail: null, error: '' })
  useEffect(() => {
    let cancelled = false
    getLfg(base.id)
      .then(detail => !cancelled && setState({ detail, error: '' }))
      .catch(error => !cancelled && setState({ detail: null, error: error.message }))
    return () => { cancelled = true }
  }, [base.id])
  const lfg = merge(base, state.detail)
  const loading = !state.detail && !state.error
  return <aside className="lfg-details" aria-label="Chi tiết kèo ghép trận" aria-busy={loading}><header><div><p>{lfg.sport && <span className="lfg-sport">{sportLabels[lfg.sport] || lfg.sport}</span>}<LFGStatus status={lfg.status} /></p><h2>{shortId(lfg.id)}: {titleOf(lfg)}</h2></div><button aria-label="Đóng chi tiết kèo" onClick={onClose}><X size={17} /></button></header><div className="lfg-detail-body">
    {loading && <p className="lfg-demo-note">Đang tải chi tiết…</p>}
    {state.error && <p className="users-form-error" role="alert">Không tải được đầy đủ chi tiết: {state.error}</p>}
    {lfg.cancelReason && <section className="lfg-report-alert"><CircleAlert size={15} /><div><strong>Lý do hủy</strong><p>{lfg.cancelReason}</p></div></section>}
    <section className="lfg-info-card"><div className="lfg-match-grid">
      <div><small>Lịch chơi</small><strong><CalendarDays size={11} />{playDate(lfg) || '—'}</strong><p><Clock3 size={11} />{playTime(lfg) || '—'}</p></div>
      <div><small>Cơ sở / sân</small><strong>{lfg.facility || '—'}</strong><p>{lfg.court}</p></div>
      <div><small>Vị trí người chơi</small><strong>{lfg.totalSlots != null ? `${number(lfg.filled ?? 0)}/${number(lfg.totalSlots)} đã có` : '—'}</strong><p>{lfg.slotsNeeded != null ? `Còn cần ${number(lfg.slotsNeeded)} người` : ''}{lfg.sideSize ? ` · ${lfg.sideSize} người/đội` : ''}</p></div>
      <div><small>Trình độ / chi phí</small><strong>{lfg.skill || 'Không yêu cầu'}</strong><p>{lfg.pricePerPerson != null ? `${money(lfg.pricePerPerson)} / người` : ''}{lfg.requireApproval ? ' · Cần duyệt' : ''}</p></div>
    </div>{lfg.address && <p className="lfg-address"><MapPin size={11} />{lfg.address}</p>}{lfg.bookingId && <p className="lfg-related-booking">Mã đặt sân: {shortId(lfg.bookingId)}</p>}</section>
    {lfg.description && <p className="lfg-demo-note">{lfg.description}</p>}
    <section className="lfg-organizer"><UserAvatar user={lfg.host} /><div><strong>{lfg.host.name} <span>Người tổ chức</span></strong>{lfg.host.phone && <small>{lfg.host.phone}</small>}{lfg.createdAt && <p>Tạo kèo ngày {formatDate(lfg.createdAt)}</p>}</div></section>
    <section className="lfg-claims"><h3>Người tham gia <small>{lfg.participants.length}</small></h3>{lfg.participants.length ? <div><table><thead><tr>{['Người chơi', 'Tham gia lúc', 'Trạng thái', 'Thanh toán'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{lfg.participants.map(person => <tr key={person.id || person.name}><td>{person.name}{person.isHost && ' (chủ kèo)'}{person.side && ` · ${person.side}`}</td><td>{formatDate(person.joinedAt) || '—'}</td><td>{participantLabels[person.status?.toUpperCase()] || person.status || '—'}</td><td className={/paid/i.test(person.payment) && !/unpaid/i.test(person.payment) ? 'paid' : 'unpaid'}>{paymentLabels[person.payment?.toUpperCase()] || person.payment || '—'}{person.amount != null ? ` · ${money(person.amount)}` : ''}</td></tr>)}</tbody></table></div> : <p className="lfg-demo-note">{loading ? '…' : 'Chưa có người tham gia.'}</p>}</section>
    {(lfg.collected != null || lfg.held != null) && <section className="lfg-finance-card"><h3>Thông tin tài chính</h3><dl className="lfg-finances"><div><dt>Đã thu</dt><dd>{money(lfg.collected)}</dd></div><div><dt>Đang giữ</dt><dd>{money(lfg.held)}</dd></div></dl></section>}
  </div><footer><button className="users-button users-danger" disabled={!canCancel(lfg)} onClick={() => onCancel(lfg)}><Ban size={13} />{canCancel(lfg) ? 'Hủy kèo' : statusLabels[lfg.status] || 'Không thể hủy'}</button>{canCancel(lfg) && <p>Hủy kèo sẽ thông báo cho người tham gia; có thể hủy kèm đơn đặt sân và hoàn tiền.</p>}</footer></aside>
}
