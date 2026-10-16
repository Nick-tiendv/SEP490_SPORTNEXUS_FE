import { useEffect, useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { BookingBreakdown, PaymentBadge } from './BookingDetails.jsx'
import { cancelAdminBooking, getCancellationReasons } from '../../api/admin/bookingApi.js'
import { date, money, bookingTotal, bookingStatusLabels } from './bookingData.js'

const OTHER = '__other__'

// POST /api/v1/bookings/admin/{bookingId}/cancel với body { reason, refundPercentage, lockSlotAfterCancel }.
function CancelDialog({ booking, onClose, onCancelled }) {
  const [reasons, setReasons] = useState([])
  const [choice, setChoice] = useState(OTHER)
  const [note, setNote] = useState('')
  const [refund, setRefund] = useState('100')
  const [lockSlot, setLockSlot] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getCancellationReasons().then(items => { if (!cancelled && items.length) { setReasons(items); setChoice(items[0]) } }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const reason = (choice === OTHER ? note : [choice, note].filter(Boolean).join(' - ')).trim()
  const refundPercentage = Number(refund)
  const submit = async event => {
    event.preventDefault()
    if (!reason) return setError('Vui lòng nhập lý do hủy đơn.')
    if (!Number.isFinite(refundPercentage) || refundPercentage < 0 || refundPercentage > 100) return setError('Tỷ lệ hoàn tiền phải từ 0 đến 100.')
    setSubmitting(true); setError('')
    try {
      await cancelAdminBooking(booking.uuid, { reason, refundPercentage, lockSlotAfterCancel: lockSlot })
      onCancelled(`Đã hủy đơn #${booking.id} (hoàn ${refundPercentage}%).`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }

  return <DemoDialog title={`Hủy đơn #${booking.id}`} onClose={submitting ? () => {} : onClose}><form className="users-form" onSubmit={submit}>
    <p>Đơn của <strong>{booking.player.name}</strong> tại {booking.venue.name}, ngày {date(booking.date)} · {money(bookingTotal(booking))}.</p>
    {reasons.length > 0 && <label>Lý do<select value={choice} onChange={event => setChoice(event.target.value)}>{reasons.map(item => <option key={item} value={item}>{item}</option>)}<option value={OTHER}>Lý do khác</option></select></label>}
    <label>{choice === OTHER ? 'Lý do hủy' : 'Ghi chú thêm (không bắt buộc)'}<textarea rows={3} maxLength={500} value={note} onChange={event => setNote(event.target.value)} required={choice === OTHER} /></label>
    <label>Tỷ lệ hoàn tiền cho người đặt (%)<input type="number" min={0} max={100} step={1} value={refund} onChange={event => setRefund(event.target.value)} required /></label>
    <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={lockSlot} onChange={event => setLockSlot(event.target.checked)} />Khóa khung giờ sau khi hủy (không cho người khác đặt lại)</label>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Đóng</button><button type="submit" className="users-button users-danger" disabled={submitting}>{submitting ? 'Đang hủy…' : 'Xác nhận hủy đơn'}</button></footer>
  </form></DemoDialog>
}

export default function BookingDialogs({ dialog, onClose, onCancelled }) {
  const booking = dialog.booking
  if (dialog.type === 'cancel') return <CancelDialog booking={booking} onClose={onClose} onCancelled={onCancelled} />
  if (dialog.type === 'profile') return <DemoDialog title="Hồ sơ người đặt" onClose={onClose}><div className="bookings-player"><UserAvatar user={booking.player} /><div><strong>{booking.player.name}</strong>{booking.player.username && <small>@{booking.player.username}</small>}{booking.player.email && <small>{booking.player.email}</small>}{booking.player.phone && <small>{booking.player.phone}</small>}</div></div><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
  if (dialog.type === 'reason') return <DemoDialog title="Lý do hủy đơn" onClose={onClose}><p className="bookings-dialog-id">#{booking.id}</p><p>{booking.cancellationReason || 'Đơn không có lý do hủy được ghi nhận.'}</p><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
  return <DemoDialog title="Phiếu đặt sân" onClose={onClose}><div className="bookings-receipt"><h3>SportNexus · Phiếu đặt sân</h3><dl className="bookings-summary">{[['Mã đơn đặt sân', booking.id], ['Người đặt', booking.player.name], ['Cơ sở', booking.venue.name], ['Sân', booking.venue.court || '—'], ['Ngày đặt sân', date(booking.date)], ['Giờ đặt sân', booking.start ? `${booking.start}${booking.end ? ` – ${booking.end}` : ''}` : '—'], ['Trạng thái', bookingStatusLabels[booking.status] || booking.status]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><PaymentBadge status={booking.payment} /><BookingBreakdown booking={booking} /></div><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
}
