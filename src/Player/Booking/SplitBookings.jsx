import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js'
import { getBookingById, getMyBookings, joinBooking, payRemainingBooking } from '../../api/player/bookingApi.js'
import { getWallet } from '../../api/player/walletApi.js'
import { confirmDialog } from '../../components/common/confirm.js'
import { bookingIdOf, hasPaid, isPendingSplit, isSplitHost, needsMyPayment, parseVnTime } from './splitBooking.js'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} Điểm`
const when = (value) => {
  const at = parseVnTime(value)
  return Number.isFinite(at)
    ? new Date(at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    : ''
}
const minutesLeft = (value, now) => {
  const at = parseVnTime(value)
  return Number.isFinite(at) ? Math.max(0, Math.ceil((at - now) / 60000)) : null
}

// Chi tiết 1 đơn (GET /bookings/{id}): hạn góp, đã góp / còn thiếu, ai đã góp
function SplitDetail({ bookingId, reloadKey, now }) {
  const detail = useApi(() => getBookingById(bookingId), [bookingId, reloadKey])
  const d = detail.data
  if (detail.error) return <p className="snx-muted" style={{ margin: '6px 0 0' }}>Không tải được chi tiết đơn: {detail.error}</p>
  if (!d) return <p className="snx-muted" style={{ margin: '6px 0 0' }}>Đang tải chi tiết…</p>
  const left = minutesLeft(d.paymentDeadline, now)
  const people = Array.isArray(d.participants) ? d.participants : []
  return (
    <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
      <div className="snx-row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {d.paymentDeadline && (
          <span className={`snx-badge ${left != null && left <= 15 ? 'snx-badge--red' : 'snx-badge--amber'}`}>
            Hạn góp {when(d.paymentDeadline)}{left != null ? ` · còn ${left} phút` : ''}
          </span>
        )}
        <span className="snx-badge snx-badge--green">Đã góp {money(d.paidAmount)}</span>
        <span className="snx-badge snx-badge--gray">Còn thiếu {money(d.pendingAmount)}</span>
      </div>
      {people.map((p) => (
        <div key={p.userId} className="snx-row" style={{ gap: 8, fontSize: 13 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            {p.fullName || 'Người chơi'}{p.isHost ? ' (người tạo đơn)' : ''}
          </span>
          <span>{money(p.amountContributed)}</span>
          <span className={`snx-badge ${hasPaid(p.paymentStatus) ? 'snx-badge--green' : 'snx-badge--amber'}`}>
            {hasPaid(p.paymentStatus) ? 'Đã góp' : 'Chưa góp'}
          </span>
        </div>
      ))}
    </div>
  )
}

// Đơn chia tiền đang chờ góp của tôi (cả đơn mình tạo lẫn đơn được mời).
// GET /bookings/my-bookings?status=PENDING. Người được mời: "Góp tiền" (POST /bookings/{id}/join).
// Người tạo: "Trả nốt" phần người chưa góp (POST /bookings/{id}/pay-remaining).
// ?splitBooking=<id> (bấm thông báo mời góp tiền) thì mở sẵn đơn đó.
export default function SplitBookings() {
  const [params] = useSearchParams()
  const focusId = params.get('splitBooking') || ''
  const list = useApi(() => getMyBookings('PENDING'), [], { initialData: [] })
  const [openId, setOpenId] = useState(focusId)
  const [busyId, setBusyId] = useState(null)
  const [detailKey, setDetailKey] = useState(0)
  // Có thông báo mới (được mời, có người vừa góp…), quay lại tab → tải lại danh sách và chi tiết đang mở
  useLiveRefresh(() => {
    list.refresh()
    setDetailKey((value) => value + 1)
  })
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const items = (Array.isArray(list.data) ? list.data : []).filter(isPendingSplit)

  useEffect(() => {
    if (!focusId || !items.some((b) => bookingIdOf(b) === focusId)) return
    document.getElementById(`split-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId, items.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!items.length) return null

  const after = (result, fallback) => {
    toast.success(result?.message || fallback)
    getWallet().catch(() => {})
    list.refresh()
    setDetailKey((value) => value + 1)
  }
  const run = async (id, action, fallback) => {
    setBusyId(id)
    try {
      after(await action(), fallback)
    } catch (error) {
      toast.error(error?.message || 'Không thực hiện được, vui lòng thử lại.')
      list.refresh()
    } finally {
      setBusyId(null)
    }
  }
  const join = async (b) => {
    if (!(await confirmDialog(`Góp ${money(b.myAmount)} cho đơn ${b.courtName || ''} lúc ${when(b.startTime)}? Tiền được tạm giữ trong ví của bạn tới khi chơi xong.`, { confirmLabel: 'Góp tiền' }))) return
    run(bookingIdOf(b), () => joinBooking(bookingIdOf(b)), 'Đã góp tiền.')
  }
  const payRest = async (b) => {
    if (!(await confirmDialog('Trả nốt phần của những người chưa góp để xác nhận đơn ngay? Người chưa góp sẽ bị bỏ khỏi đơn.', { confirmLabel: 'Trả nốt' }))) return
    run(bookingIdOf(b), () => payRemainingBooking(bookingIdOf(b)), 'Đã trả nốt, đơn đặt sân đã được xác nhận.')
  }

  return (
    <section className="snx-card" style={{ marginBottom: 16, borderColor: '#fcd34d' }} aria-label="Đơn chia tiền đang chờ góp">
      <div className="snx-row" style={{ marginBottom: 4 }}>
        <span className="material-symbols-outlined" style={{ color: '#d97706' }}>group_add</span>
        <h2 className="snx-card-title" style={{ fontSize: 16 }}>Đơn chia tiền đang chờ góp ({items.length})</h2>
      </div>
      <p className="snx-muted" style={{ margin: '0 0 8px' }}>
        Quá hạn góp mà chưa đủ thì đơn tự hủy, hoàn tiền người đã góp và mở lại ca. Người tạo đơn có thể trả nốt để xác nhận ngay.
      </p>
      <div className="snx-list">
        {items.map((b) => {
          const id = bookingIdOf(b)
          const host = isSplitHost(b)
          const open = openId === id
          return (
            <div key={id} id={`split-${id}`} className="snx-list-item" style={{ display: 'block', ...(id === focusId ? { background: '#fffbeb', borderRadius: 12, padding: 10 } : {}) }}>
              <div className="snx-row" style={{ gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <strong style={{ fontSize: 14 }}>{[b.facilityName, b.courtName].filter(Boolean).join(' · ') || 'Đơn đặt sân'}</strong>
                  <div className="snx-muted">
                    {b.sportName ? `${b.sportName} · ` : ''}{when(b.startTime)} · {b.participantCount || '?'} người · {host ? 'Bạn tạo đơn' : 'Bạn được mời'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{money(b.myAmount)}</strong>
                  <div className="snx-muted" style={{ fontSize: 12 }}>{needsMyPayment(b) ? 'Bạn chưa góp' : 'Phần của bạn đã trả'}</div>
                </div>
                <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setOpenId(open ? '' : id)} aria-expanded={open}>
                  {open ? 'Ẩn chi tiết' : 'Ai đã góp?'}
                </button>
                {needsMyPayment(b) && (
                  <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={busyId === id} onClick={() => join(b)}>
                    {busyId === id ? 'Đang góp…' : 'Góp tiền'}
                  </button>
                )}
                {host && (
                  <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={busyId === id} onClick={() => payRest(b)}>
                    {busyId === id ? 'Đang trả…' : 'Trả nốt'}
                  </button>
                )}
              </div>
              {open && <SplitDetail bookingId={id} reloadKey={detailKey} now={now} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}
