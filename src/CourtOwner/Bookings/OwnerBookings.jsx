import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getFacilityBookings, getOwnerBooking, getOwnerBookingsPage } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { addDays, formatDateTime, formatTime, formatVND, statusBadge, toDateKey } from '../shared.js'

const PAGE_SIZE = 15
// BookingStatus của BE: PENDING | PAID | CHECKED_IN | CANCELLED
const STATUSES = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'CHECKED_IN', label: 'Đã check-in' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

function Badge({ status }) {
  const b = statusBadge(status)
  return <span className={b.className}>{b.label}</span>
}

function BookingDetailModal({ bookingId, onClose }) {
  const detail = useApi(() => getOwnerBooking(bookingId), [bookingId])
  const b = detail.data
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
            <div className="snx-row"><Badge status={b.bookingStatus} />{b.isWalkIn && <span className="snx-badge snx-badge--gray">Khách vãng lai</span>}{b.lfg && <span className="snx-badge snx-badge--blue">Kèo ghép LFG</span>}</div>
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
              <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>Người chơi ({(b.participants || []).length})</h3>
              <div className="snx-list">
                {(b.participants || []).map((p) => (
                  <div key={p.userId || p.fullName} className="snx-list-item">
                    <span className="snx-avatar-sm">{p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : (p.fullName || '?').slice(0, 1)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><strong>{p.fullName}</strong>{p.isHost && <span className="snx-muted"> • Chủ đơn</span>}<div className="snx-muted">{p.phone}</div></div>
                    <span className="snx-muted">{formatVND(p.amountContributed)}</span>
                    <Badge status={p.paymentStatus} />
                    {p.isCheckedIn ? <span className="snx-badge snx-badge--green">Đã vào sân</span> : <span className="snx-badge snx-badge--gray">Chưa vào</span>}
                  </div>
                ))}
              </div>
            </div>
            {b.lfg && (
              <div className="snx-muted">
                Kèo LFG: {b.lfg.acceptedCount}/{b.lfg.totalSlots} người • {formatVND(b.lfg.pricePerPerson)}/người • còn {b.lfg.remainingSlots} chỗ
              </div>
            )}
          </div>
        )}
        <div className="snx-modal-foot">
          <Link to="/owner/schedule" className="snx-btn snx-btn--secondary">Mở lịch đặt sân</Link>
          <button type="button" className="snx-btn snx-btn--primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

function ListView({ facilityId, onOpen }) {
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState(addDays(toDateKey(), -7))
  const [dateTo, setDateTo] = useState(addDays(toDateKey(), 7))
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const list = useApi(
    () => getOwnerBookingsPage({ facilityId, status, dateFrom, dateTo, search, page, pageSize: PAGE_SIZE }),
    [facilityId, status, dateFrom, dateTo, search, page],
    { enabled: !!facilityId, initialData: { items: [], total: 0 } },
  )
  const d = list.data
  const totalPages = d.totalPages || Math.max(1, Math.ceil((d.total || 0) / PAGE_SIZE))
  const reset = (setter) => (e) => { setter(e.target.value); setPage(1) }

  return (
    <div className="snx-stack">
      <div className="snx-stats">
        <div className="snx-stat"><div className="snx-stat-label">Số đơn</div><div className="snx-stat-value">{d.total ?? 0}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Doanh thu (đơn còn hiệu lực)</div><div className="snx-stat-value" style={{ fontSize: 18 }}>{formatVND(d.revenue)}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Đã thanh toán</div><div className="snx-stat-value">{d.paidCount ?? 0}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Đã check-in</div><div className="snx-stat-value">{d.checkedInCount ?? 0}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Đã hủy</div><div className="snx-stat-value">{d.cancelledCount ?? 0}</div></div>
      </div>
      <form className="snx-row" onSubmit={(e) => { e.preventDefault(); setSearch(keyword.trim()); setPage(1) }}>
        <label className="snx-row snx-muted">Từ <input className="snx-input" style={{ width: 'auto' }} type="date" value={dateFrom} onChange={reset(setDateFrom)} /></label>
        <label className="snx-row snx-muted">đến <input className="snx-input" style={{ width: 'auto' }} type="date" value={dateTo} min={dateFrom} onChange={reset(setDateTo)} /></label>
        <select className="snx-select" style={{ width: 'auto' }} value={status} onChange={reset(setStatus)} aria-label="Trạng thái">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
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
              <thead><tr><th>Khách</th><th>Sân</th><th>Ca</th><th>Tiền</th><th>Người chơi</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {d.items.map((b) => (
                  <tr key={b.bookingId}>
                    <td><strong>{b.customerName || '—'}</strong><div className="snx-muted">{b.customerPhone}{b.isWalkIn ? ' • Vãng lai' : ''}</div></td>
                    <td>{b.courtName}<div className="snx-muted">{b.sportName}</div></td>
                    <td>{formatDateTime(b.startTime)}<div className="snx-muted">đến {formatTime(b.endTime)}</div></td>
                    <td>{formatVND(b.totalAmount)}</td>
                    <td>{b.checkedInCount ?? 0}/{b.participantCount ?? 0} đã vào</td>
                    <td><Badge status={b.bookingStatus} /></td>
                    <td><button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => onOpen(b.bookingId)}>Chi tiết</button></td>
                  </tr>
                ))}
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

function DayView({ facilityId, onOpen }) {
  const [date, setDate] = useState(toDateKey())
  const [status, setStatus] = useState('')
  const day = useApi(() => getFacilityBookings(facilityId, { date, status }), [facilityId, date, status], { enabled: !!facilityId, initialData: [] })
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
  const { facilityId, facility } = useOwnerContext()
  const [view, setView] = useState('list')
  const [openId, setOpenId] = useState(null)

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
        <div className="snx-empty"><span className="material-symbols-outlined">domain_add</span>Bạn chưa có cơ sở. <Link to="/owner/facilities">Tạo cơ sở</Link></div>
      ) : view === 'list' ? (
        <ListView facilityId={facilityId} onOpen={setOpenId} />
      ) : (
        <DayView facilityId={facilityId} onOpen={setOpenId} />
      )}
      {openId && <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
