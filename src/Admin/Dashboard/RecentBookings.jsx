import { useEffect, useState } from 'react'
import StatusBadge from '../components/StatusBadge.jsx'
import { getAdminBookings } from '../../api/admin/dashboardApi.js'
import { formatCurrency, formatDate, formatTime } from './dashboardData.js'

const PAGE_SIZE = 5
// Giá trị lọc hợp lệ của GET /api/v1/bookings/admin (docs 11.16): PENDING, PAID, CHECKED_IN, CANCELLED.
const STATUSES = { PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', CHECKED_IN: 'Đã check-in', CANCELLED: 'Đã hủy' }
// Màu badge dùng lại các kiểu sẵn có của StatusBadge.
const BADGE_TONES = { PENDING: 'Pending', PAID: 'Confirmed', CHECKED_IN: 'Completed', CANCELLED: 'Cancelled' }

export default function RecentBookings({ reloadKey = 0 }) {
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ key: '', error: '', items: [], total: 0, totalPages: 1 })
  const requestKey = `${status}|${page}|${reloadKey}`
  const loading = state.key !== requestKey

  useEffect(() => {
    let cancelled = false
    getAdminBookings({ Status: status, Page: page, PageSize: PAGE_SIZE })
      .then(({ items, total, totalPages }) => !cancelled && setState({ key: requestKey, error: '', items, total, totalPages: totalPages || Math.max(1, Math.ceil(total / PAGE_SIZE)) }))
      .catch(error => !cancelled && setState({ key: requestKey, error: error.message, items: [], total: 0, totalPages: 1 }))
    return () => { cancelled = true }
  }, [status, page, requestKey])

  const changeStatus = value => { setStatus(value); setPage(1) }
  const items = loading ? [] : state.items

  return (
    <section className="admin-panel admin-bookings">
      <div className="admin-panel-heading">
        <div><h2>Đơn đặt sân gần đây</h2><p>Theo dõi các đơn đặt sân, trạng thái và check-in trên nền tảng.</p></div>
        <div className="admin-table-filters">
          <select className="admin-select" aria-label="Lọc trạng thái đặt sân" value={status} onChange={event => changeStatus(event.target.value)}><option value="All">Tất cả trạng thái</option>{Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table"><thead><tr><th>Mã đặt sân</th><th>Người đặt</th><th>Cơ sở &amp; sân</th><th>Thời gian chơi</th><th className="is-num">Số tiền</th><th>Trạng thái</th><th>Hình thức</th></tr></thead>
          <tbody>{items.map(item => {
            const statusKey = item.status.toUpperCase()
            const checkIn = Number.isFinite(item.participantCount) && item.participantCount > 0 ? `${item.checkedInCount ?? 0}/${item.participantCount} đã check-in` : ''
            return <tr key={item.id}>
              <td className="admin-booking-id" title={item.id}>{item.id.length > 12 ? `#${item.id.slice(0, 8).toUpperCase()}` : item.id}</td>
              <td><div className="admin-user-cell"><span className="admin-avatar admin-avatar-small">{item.initials}</span><strong>{item.user}</strong></div></td>
              <td><strong>{item.facility}</strong><small>{[item.court, item.location].filter(Boolean).join(' · ')}</small></td>
              <td><strong>{formatDate(item.start || item.date)}</strong><small>{[item.start && `${formatTime(item.start)}${item.end ? ` – ${formatTime(item.end)}` : ''}`, item.sport].filter(Boolean).join(' · ')}</small></td>
              <td className="is-num admin-amount">{formatCurrency(item.amount)}</td>
              <td><StatusBadge status={BADGE_TONES[statusKey] || 'Pending'} label={STATUSES[statusKey] || item.status} /></td>
              <td><span className={`admin-booking-channel ${item.isWalkIn ? 'walk-in' : ''}`}>{item.isWalkIn ? 'Tại quầy' : 'Đặt online'}</span>{checkIn && <small>{checkIn}</small>}</td>
            </tr>
          })}</tbody>
        </table>
        {loading ? <p className="admin-empty">Đang tải đơn đặt sân…</p>
          : state.error ? <p className="admin-empty">{state.error}</p>
            : !items.length && <p className="admin-empty">Không có đơn đặt sân phù hợp với bộ lọc.</p>}
      </div>
      <div className="admin-table-footer"><span>Hiển thị {items.length} / {state.total.toLocaleString('vi-VN')} đơn <span className="admin-footer-divider">•</span> Trang {page} / {state.totalPages}</span><div><button className="admin-btn admin-btn--sm" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Trước</button><button className="admin-btn admin-btn--primary admin-btn--sm" disabled={loading || page >= state.totalPages} onClick={() => setPage(page + 1)}>Sau</button></div></div>
    </section>
  )
}
