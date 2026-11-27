import { useState } from 'react'
import { toast } from 'sonner'
import { confirmDialog } from '../../components/common/confirm.js'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js'
import { checkInBooking, endOwnerBookingSession, getFacilityBookings, getOwnerBooking, getOwnerBookingsPage } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import OwnerCancelBookingModal from './OwnerCancelBookingModal.jsx'
import { addDays, formatDateTime, formatTime, formatVND, statusBadge, toDateKey } from '../shared.js'

const PAGE_SIZE = 15
// Trạng thái người chơi trong kèo LFG (BookingLfgParticipantInfo.status)
const LFG_PLAYER_STATUS = { PENDING: 'Chờ duyệt', ACCEPTED: 'Đã vào kèo', REJECTED: 'Bị từ chối', LEFT: 'Đã rời', REMOVED: 'Bị loại', CANCELLED: 'Đã hủy' }
// BookingStatus của BE: PENDING | PAID | CHECKED_IN | CANCELLED. count = ô đếm của GET /bookings/owner (không lọc theo status).
const STATUSES = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'PENDING', label: 'Chờ góp', count: 'pendingCount' },
  { value: 'PAID', label: 'Đã thanh toán', count: 'paidCount' },
  { value: 'CHECKED_IN', label: 'Đã check-in', count: 'checkedInCount' },
  { value: 'CANCELLED', label: 'Đã hủy', count: 'cancelledCount' },
]

function Badge({ status }) {
  const b = statusBadge(status)
  return <span className={b.className}>{b.label}</span>
}

// Chip giờ vào / ra của 1 người chơi (checkedInAt, isLate, checkedOutAt, checkOutType)
function AttendanceChips({ p }) {
  if (p.checkedOutAt) {
    return <span className="snx-badge snx-badge--gray">{String(p.checkOutType).toUpperCase() === 'OWNER' ? 'Chủ sân kết thúc ca' : 'Đã ra'} · {formatTime(p.checkedOutAt)}</span>
  }
  if (!p.isCheckedIn) return <span className="snx-badge snx-badge--gray">Chưa tới</span>
  return (
    <>
      <span className="snx-badge snx-badge--green">Đã vào{p.checkedInAt ? ` · ${formatTime(p.checkedInAt)}` : ''}</span>
      {p.isLate && <span className="snx-badge snx-badge--amber">Trễ</span>}
    </>
  )
}

function BookingDetailModal({ bookingId, onClose, onRequestCancel }) {
  const detail = useApi(() => getOwnerBooking(bookingId), [bookingId])
  const b = detail.data
  const [ending, setEnding] = useState(false)
  const [checkingIn, setCheckingIn] = useState(null) // 'all' | userId
  // Cờ của BE (chỉ có nghĩa với chủ sân): còn điểm danh / kết thúc ca / hủy được không.
  const canCheckIn = !!b?.canCheckIn
  const canEndEarly = !!b?.canEndSession
  const canCancel = !!b?.canCancel
  const lfgPlayers = b?.lfg?.participants || []
  const acceptedLfg = lfgPlayers.filter((p) => String(p.status || '').toUpperCase() === 'ACCEPTED')
  // Đã tới X/Y: vé đơn + người chơi kèo đã vào kèo
  const arrived = (b?.participants || []).filter((p) => p.isCheckedIn).length + acceptedLfg.filter((p) => p.isCheckedIn).length
  const expected = (b?.participants || []).length + (Number(b?.lfg?.acceptedCount) || acceptedLfg.length)
  const refunded = b && String(b.bookingStatus).toUpperCase() !== 'CANCELLED' && Number(b.refundedAmount) > 0

  // POST /bookings/owner/{id}/check-in: cả nhóm vé đơn (không gồm người chơi kèo), hoặc 1 người chơi kèo (participantUserId).
  const checkIn = async (participantUserId = null) => {
    setCheckingIn(participantUserId || 'all')
    try {
      const { message } = await checkInBooking(bookingId, participantUserId ? { participantUserId, checkInAllParticipants: false } : { checkInAllParticipants: true })
      toast.success(message || 'Đã điểm danh.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setCheckingIn(null)
      detail.refresh()
    }
  }
  const endEarly = async () => {
    if (!(await confirmDialog('Kết thúc ca sớm? Mọi người chơi đang trong sân sẽ được check-out. Không hoàn tiền cho phần thời gian còn lại.', { title: 'Kết thúc ca sớm', confirmLabel: 'Kết thúc ca' }))) return
    setEnding(true)
    try {
      await endOwnerBookingSession(bookingId)
      toast.success('Đã kết thúc ca, check-out mọi người chơi.')
    } catch (error) {
      toast.error(error?.message || 'Không kết thúc được ca.')
    } finally {
      setEnding(false)
      detail.refresh()
    }
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="snx-modal-head">
          <div>
            <h2 id="booking-title" className="snx-card-title">Chi tiết đơn đặt sân</h2>
            <p className="snx-card-subtitle">{b ? `${b.courtName} • ${b.sportName || ''} • ${formatDateTime(b.startTime)} – ${formatTime(b.endTime)}` : 'Đang tải…'}</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        {detail.error && <div className="snx-alert snx-alert--error">{detail.error}</div>}
        {b && (
          <div className="snx-stack">
            <div className="snx-row"><Badge status={b.bookingStatus} />{b.isWalkIn && <span className="snx-badge snx-badge--gray">Khách vãng lai</span>}{b.lfg && <span className="snx-badge snx-badge--blue">Kèo ghép LFG</span>}{b.isNoShow && <span className="snx-badge snx-badge--red">Không đến (no-show)</span>}<span className="snx-spacer" /><strong>Đã tới {arrived}/{expected} người</strong></div>
            {refunded && <div className="snx-alert snx-alert--warning">Đã hoàn {formatVND(b.refundedAmount)} do khiếu nại.</div>}
            {Number(b.voucherDiscountAmount) > 0 && (
              <div className="snx-alert snx-alert--info">
                Khách dùng voucher giảm {formatVND(b.voucherDiscountAmount)}: phần giảm do hệ thống bù, bạn vẫn nhận đủ tiền.{b.voucherReturned ? ' Voucher đã được trả lại ví khách.' : ''}
              </div>
            )}
            {b.sessionEndedAt && <div className="snx-alert snx-alert--info">Ca đã kết thúc lúc {formatTime(b.sessionEndedAt)}.</div>}
            {!canCheckIn && !b.sessionEndedAt && b.checkInOpensAt && new Date(b.checkInOpensAt) > new Date() && String(b.bookingStatus).toUpperCase() !== 'CANCELLED' && (
              <div className="snx-alert snx-alert--info">Mở check-in lúc {formatDateTime(b.checkInOpensAt)}.</div>
            )}
            <div className="snx-form-grid">
              <div><div className="snx-muted">Người đặt</div><strong>{b.hostName || '—'}</strong><div className="snx-muted">{b.hostPhone}</div></div>
              <div><div className="snx-muted">Tổng tiền</div><strong>{formatVND(b.totalAmount)}</strong></div>
              <div><div className="snx-muted">Đã thanh toán</div><strong>{formatVND(b.paidAmount)}</strong></div>
              <div><div className="snx-muted">Còn chờ</div><strong>{formatVND(b.pendingAmount)}</strong></div>
              <div><div className="snx-muted">Tạo lúc</div><strong>{formatDateTime(b.createdAt)}</strong></div>
            </div>
            {b.customerNote && <div><div className="snx-muted">Ghi chú của khách</div><p style={{ margin: '4px 0 0' }}>{b.customerNote}</p></div>}
            {b.cancellation && (
              <div className="snx-alert snx-alert--error">
                Đã hủy lúc {formatDateTime(b.cancellation.cancelledAt)}: {b.cancellation.reason || '—'} • Hoàn {formatVND(b.cancellation.refundAmount)} • Phạt {formatVND(b.cancellation.penaltyAmount)}
              </div>
            )}
            <div>
              <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>{b.lfg ? 'Người đặt sân' : 'Người chơi'} ({(b.participants || []).length})</h3>
              <div className="snx-list">
                {(b.participants || []).map((p) => (
                  <div key={p.userId || p.fullName} className="snx-list-item">
                    <span className="snx-avatar-sm">{p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : (p.fullName || '?').slice(0, 1)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><strong>{p.fullName}</strong>{p.isHost && <span className="snx-muted"> • Chủ đơn</span>}<div className="snx-muted">{p.phone}</div></div>
                    <span className="snx-muted">{formatVND(p.amountContributed)}</span>
                    <Badge status={p.paymentStatus} />
                    <AttendanceChips p={p} />
                  </div>
                ))}
              </div>
            </div>
            {b.lfg && (
              // Người chơi kèo LFG nằm ở lfg.participants (không phải participants của đơn): chỉ người ACCEPTED sẽ đến sân;
              // người chờ duyệt / đã rời / bị loại vẫn liệt kê nhưng không tính vào số người.
              <div>
                <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>
                  Người chơi kèo ({b.lfg.checkedInCount ?? 0}/{b.lfg.acceptedCount ?? 0} đã check-in)
                </h3>
                {canCheckIn && <div className="snx-muted" style={{ marginBottom: 6 }}>"Điểm danh tất cả" không gồm người chơi kèo: bấm "Điểm danh" từng người khi họ tới sân.</div>}
                <div className="snx-muted" style={{ marginBottom: 6 }}>
                  {String(b.lfg.status).toUpperCase() === 'CANCELLED'
                    ? `Kèo đã hủy${b.lfg.cancelReason ? `: ${b.lfg.cancelReason}` : ''}`
                    : `Cần ${b.lfg.totalSlots ?? '—'} người • còn ${b.lfg.remainingSlots ?? '—'} suất • ${formatVND(b.lfg.pricePerPerson)}/người`}
                  {' • '}Tổng dự kiến tại sân: {1 + (Number(b.lfg.acceptedCount) || 0)} người (gồm chủ kèo)
                </div>
                {(b.lfg.participants || []).length === 0 ? (
                  <div className="snx-muted">Chưa có người chơi nhận suất.</div>
                ) : (
                  <div className="snx-list">
                    {b.lfg.participants.map((p) => {
                      const status = String(p.status || '').toUpperCase()
                      return (
                        <div key={p.userId || p.fullName} className="snx-list-item" style={status === 'ACCEPTED' ? undefined : { opacity: 0.6 }}>
                          <span className="snx-avatar-sm">{p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : (p.fullName || '?').slice(0, 1)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}><strong>{p.fullName}</strong><div className="snx-muted">{p.phone && <a href={`tel:${p.phone}`}>{p.phone}</a>}</div></div>
                          <span className="snx-muted">{LFG_PLAYER_STATUS[status] || status || '—'}</span>
                          <span className="snx-muted">{formatVND(p.amountPaid)}</span>
                          {status === 'ACCEPTED' && <AttendanceChips p={p} />}
                          {status === 'ACCEPTED' && !p.isCheckedIn && canCheckIn && p.userId && (
                            <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={!!checkingIn} onClick={() => checkIn(p.userId)}>
                              {checkingIn === p.userId ? 'Đang điểm danh…' : 'Điểm danh'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="snx-modal-foot">
          {b && !canCancel && !b.isWalkIn && ['PAID', 'CHECKED_IN'].includes(String(b.bookingStatus).toUpperCase()) && (
            <span className="snx-muted" style={{ marginRight: 'auto' }}>Ca đã bắt đầu / đã check-in, khách cần gửi khiếu nại.</span>
          )}
          <Link to="/owner/schedule" className="snx-btn snx-btn--secondary">Mở lịch đặt sân</Link>
          {canCheckIn && <button type="button" className="snx-btn snx-btn--primary" disabled={!!checkingIn} onClick={() => checkIn()}>{checkingIn === 'all' ? 'Đang điểm danh…' : 'Điểm danh tất cả'}</button>}
          {canCancel && (
            <button
              type="button"
              className="snx-btn snx-btn--danger"
              onClick={() => onRequestCancel({ ...b, bookingId: b.bookingId || b.id || bookingId })}
            >
              Hủy đơn
            </button>
          )}
          {canEndEarly && <button type="button" className="snx-btn snx-btn--danger" disabled={ending} onClick={endEarly}>{ending ? 'Đang kết thúc…' : 'Kết thúc ca sớm'}</button>}
          <button type="button" className="snx-btn snx-btn--primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

function ListView({ facilityId, reloadKey, onOpen, onRequestCancel }) {
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState(addDays(toDateKey(), -7))
  const [dateTo, setDateTo] = useState(addDays(toDateKey(), 7))
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const list = useApi(
    () => getOwnerBookingsPage({ facilityId, status, dateFrom, dateTo, search, page, pageSize: PAGE_SIZE }),
    [facilityId, status, dateFrom, dateTo, search, page, reloadKey],
    { enabled: !!facilityId, initialData: { items: [], total: 0 } },
  )
  const d = list.data
  const totalPages = d.totalPages || Math.max(1, Math.ceil((d.total || 0) / PAGE_SIZE))
  const reset = (setter) => (e) => { setter(e.target.value); setPage(1) }
  // Ô đếm không bị lọc theo status → dùng làm số trên tab; "Tất cả" = tổng 4 trạng thái.
  const allCount = (d.pendingCount || 0) + (d.paidCount || 0) + (d.checkedInCount || 0) + (d.cancelledCount || 0)

  return (
    <div className="snx-stack">
      <div className="snx-stats snx-stats--lg">
        <div className="snx-stat"><div className="snx-stat-label">Số đơn (theo bộ lọc)</div><div className="snx-stat-value">{d.total ?? 0}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Doanh thu (đơn còn hiệu lực)</div><div className="snx-stat-value" style={{ fontSize: 18 }}>{formatVND(d.revenue)}</div></div>
      </div>
      <div className="snx-tabs" role="tablist" aria-label="Trạng thái đơn">
        {STATUSES.map((s) => (
          <button key={s.value} type="button" role="tab" aria-selected={status === s.value} className="snx-tab" onClick={() => { setStatus(s.value); setPage(1) }}>
            {s.value ? s.label : 'Tất cả'}<span className="snx-tab-count">{s.count ? d[s.count] ?? 0 : allCount}</span>
          </button>
        ))}
      </div>
      <form className="snx-row" onSubmit={(e) => { e.preventDefault(); setSearch(keyword.trim()); setPage(1) }}>
        <label className="snx-row snx-muted">Từ <input className="snx-input" style={{ width: 'auto' }} type="date" value={dateFrom} onChange={reset(setDateFrom)} /></label>
        <label className="snx-row snx-muted">đến <input className="snx-input" style={{ width: 'auto' }} type="date" value={dateTo} min={dateFrom} onChange={reset(setDateTo)} /></label>
        <input className="snx-input" style={{ width: 220 }} placeholder="Tên hoặc SĐT khách" value={keyword} onChange={(e) => setKeyword(e.target.value)} aria-label="Tìm khách" />
        <button type="submit" className="snx-btn snx-btn--secondary snx-btn--sm">Tìm</button>
      </form>
      {list.error && <div className="snx-alert snx-alert--error">{list.error}</div>}
      <div className="snx-card" style={{ padding: 0 }}>
        {list.loading && !d.items.length ? (
          <p className="snx-muted" style={{ padding: 20 }}>Đang tải đơn…</p>
        ) : d.items.length === 0 ? (
          <div className="snx-empty" style={{ border: 0 }}><span className="material-symbols-outlined">event_busy</span>Không có đơn nào trong khoảng này.</div>
        ) : (
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Khách</th><th>Sân</th><th>Ca</th><th>Tiền</th><th>Đã tới</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {d.items.map((b) => {
                  const canCancel = ['PENDING', 'PAID'].includes(String(b.bookingStatus || '').toUpperCase())
                  return (
                    <tr key={b.bookingId}>
                      <td><strong>{b.customerName || '—'}</strong><div className="snx-muted">{b.customerPhone}{b.isWalkIn ? ' • Vãng lai' : ''}</div></td>
                      <td>{b.courtName}<div className="snx-muted">{b.sportName}</div></td>
                      <td>{formatDateTime(b.startTime)}<div className="snx-muted">đến {formatTime(b.endTime)}</div></td>
                      <td>{formatVND(b.totalAmount)}{String(b.bookingStatus).toUpperCase() !== 'CANCELLED' && Number(b.refundedAmount) > 0 && <div className="snx-muted">Đã hoàn {formatVND(b.refundedAmount)} do khiếu nại</div>}</td>
                      {/* Vé đơn + người chơi kèo LFG (người chơi kèo không nằm trong participantCount) */}
                      <td>{(Number(b.checkedInCount) || 0) + (Number(b.lfgCheckedInCount) || 0)}/{(Number(b.participantCount) || 0) + (Number(b.lfgAcceptedCount) || 0)}</td>
                      <td><Badge status={b.bookingStatus} />{b.lfgCardId && <span className="snx-badge snx-badge--blue" style={{ marginLeft: 4 }}>Kèo LFG</span>}{b.isNoShow && <div><span className="snx-badge snx-badge--red" style={{ marginTop: 4 }}>Vắng</span></div>}</td>
                      <td>
                        <div className="snx-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => onOpen(b.bookingId)}>Chi tiết</button>
                          {canCancel && (
                            <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={() => onRequestCancel(b)}>Hủy đơn</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="snx-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
          <span className="snx-muted">Trang {page} / {totalPages}</span>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      )}
    </div>
  )
}

function DayView({ facilityId, reloadKey, onOpen }) {
  const [date, setDate] = useState(toDateKey())
  const [status, setStatus] = useState('')
  const day = useApi(() => getFacilityBookings(facilityId, { date, status }), [facilityId, date, status, reloadKey], { enabled: !!facilityId, initialData: [] })
  const items = Array.isArray(day.data) ? day.data : []
  return (
    <div className="snx-stack">
      <div className="snx-row">
        <button type="button" className="snx-btn snx-btn--secondary snx-btn--icon" onClick={() => setDate(addDays(date, -1))} aria-label="Ngày trước"><span className="material-symbols-outlined">chevron_left</span></button>
        <input className="snx-input" style={{ width: 'auto' }} type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Ngày" />
        <button type="button" className="snx-btn snx-btn--secondary snx-btn--icon" onClick={() => setDate(addDays(date, 1))} aria-label="Ngày sau"><span className="material-symbols-outlined">chevron_right</span></button>
        <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setDate(toDateKey())}>Hôm nay</button>
        <select className="snx-select" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Trạng thái">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="snx-spacer" />
        <span className="snx-muted">{items.length} đơn</span>
      </div>
      {day.error && <div className="snx-alert snx-alert--error">{day.error}</div>}
      {items.length === 0 ? (
        <div className="snx-empty"><span className="material-symbols-outlined">event_available</span>{day.loading ? 'Đang tải…' : 'Không có đơn nào trong ngày.'}</div>
      ) : (
        <div className="snx-grid snx-grid--3">
          {[...items].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((b) => (
            <button key={b.bookingId} type="button" className="snx-card" style={{ padding: 14, textAlign: 'left', cursor: 'pointer' }} onClick={() => onOpen(b.bookingId)}>
              <div className="snx-row"><strong>{formatTime(b.startTime)} – {formatTime(b.endTime)}</strong><span className="snx-spacer" /><Badge status={b.status} /></div>
              <div style={{ marginTop: 4 }}>{b.courtName} <span className="snx-muted">• {b.sportName}</span></div>
              <div className="snx-muted">{b.hostName || 'Khách'} {b.hostPhone ? `• ${b.hostPhone}` : ''}{b.isWalkIn ? ' • Vãng lai' : ''}</div>
              <div className="snx-row" style={{ marginTop: 6 }}>
                <span className="snx-muted">{(b.participants || []).filter((p) => p.isCheckedIn).length}/{b.participantCount ?? 0} đã vào</span>
                <span className="snx-spacer" /><strong>{formatVND(b.totalAmount)}</strong>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OwnerBookings() {
  const { facilityId, facility, refreshWallet } = useOwnerContext()
  const [view, setView] = useState('list')
  const [openId, setOpenId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  // Có đơn mới / bị hủy, quay lại tab → tự tải lại danh sách (bảng giữ dữ liệu cũ trong lúc tải)
  useLiveRefresh(() => setReloadKey((value) => value + 1), { enabled: !!facilityId })

  const handleRequestCancel = (b) => {
    setCancelTarget({
      bookingId: b.bookingId || b.id,
      customerName: b.customerName ?? b.hostName,
      courtName: b.courtName,
      startTime: b.startTime,
      endTime: b.endTime,
      totalAmount: b.totalAmount,
      isWalkIn: b.isWalkIn,
    })
  }

  return (
    <div className="snx-stack">
      <PageHeader
        eyebrow="Vận hành"
        eyebrowIcon="receipt_long"
        title="Đơn đặt sân"
        subtitle={facility ? `Tất cả đơn đặt tại ${facility.name}.` : 'Chọn cơ sở ở thanh bên để xem đơn.'}
        actions={<Link to="/owner/schedule" className="snx-btn snx-btn--secondary"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>Lịch đặt sân</Link>}
      />
      <div className="snx-tabs" role="tablist" aria-label="Kiểu xem">
        <button type="button" role="tab" aria-selected={view === 'list'} className="snx-tab" onClick={() => setView('list')}>Danh sách</button>
        <button type="button" role="tab" aria-selected={view === 'day'} className="snx-tab" onClick={() => setView('day')}>Theo ngày</button>
      </div>
      {!facilityId ? (
        <NoFacilityState what="nhận đơn đặt sân" />
      ) : view === 'list' ? (
        <ListView facilityId={facilityId} reloadKey={reloadKey} onOpen={setOpenId} onRequestCancel={handleRequestCancel} />
      ) : (
        <DayView facilityId={facilityId} reloadKey={reloadKey} onOpen={setOpenId} />
      )}
      {openId && <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} onRequestCancel={handleRequestCancel} />}
      {cancelTarget && (
        <OwnerCancelBookingModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => {
            setCancelTarget(null)
            setOpenId(null)
            setReloadKey((k) => k + 1)
            refreshWallet().catch(() => {})
          }}
        />
      )}
    </div>
  )
}
