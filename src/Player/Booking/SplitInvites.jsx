import { useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { getMyBookings, joinBooking } from '../../api/player/bookingApi.js'
import { getWallet } from '../../api/player/walletApi.js'
import { confirmDialog } from '../../components/common/confirm.js'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`
const when = (value) => (value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '')

// Lời mời góp tiền sân (đơn chia tiền người khác tạo và mời mình).
// GET /bookings/my-bookings?status=PENDING -> myRole = Participant, myPaymentStatus chưa trả -> POST /bookings/{id}/join
export default function SplitInvites() {
  const list = useApi(() => getMyBookings('PENDING'), [], { initialData: [] })
  const [busyId, setBusyId] = useState(null)
  const invites = (list.data || []).filter((b) => /participant/i.test(b.myRole || '') && !/PAID|HELD|CHECKED_IN/i.test(b.myPaymentStatus || ''))
  if (!invites.length) return null

  const pay = async (booking) => {
    if (!(await confirmDialog(`Góp ${money(booking.myAmount)} cho đơn ${booking.courtName} lúc ${when(booking.startTime)}? Tiền được giữ trong ví của bạn tới khi chơi xong.`, { confirmLabel: 'Góp tiền' }))) return
    setBusyId(booking.bookingId)
    try {
      const result = await joinBooking(booking.bookingId)
      toast.success(String(result?.status || '').toUpperCase() === 'PAID' ? 'Đã góp tiền. Mọi người đã góp đủ, đơn đã được xác nhận.' : 'Đã góp tiền, đang chờ những người còn lại.')
      getWallet().catch(() => {})
      list.refresh()
    } catch (error) {
      toast.error(error?.message || 'Không góp được tiền.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="snx-card" style={{ marginBottom: 16, borderColor: '#fcd34d' }} aria-label="Lời mời góp tiền sân">
      <div className="snx-row" style={{ marginBottom: 8 }}>
        <span className="material-symbols-outlined" style={{ color: '#d97706' }}>group_add</span>
        <h2 className="snx-card-title" style={{ fontSize: 16 }}>Bạn được mời góp tiền sân ({invites.length})</h2>
      </div>
      <p className="snx-muted" style={{ margin: '0 0 8px' }}>Đơn tự hủy nếu quá 30 phút mà chưa đủ người góp.</p>
      <div className="snx-list">
        {invites.map((b) => (
          <div key={b.bookingId} className="snx-list-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{b.facilityName} · {b.courtName}</strong>
              <div className="snx-muted">{b.sportName ? `${b.sportName} · ` : ''}{when(b.startTime)} · {b.participantCount} người</div>
            </div>
            <strong>{money(b.myAmount)}</strong>
            <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={busyId === b.bookingId} onClick={() => pay(b)}>{busyId === b.bookingId ? 'Đang góp…' : 'Góp tiền'}</button>
          </div>
        ))}
      </div>
    </section>
  )
}
