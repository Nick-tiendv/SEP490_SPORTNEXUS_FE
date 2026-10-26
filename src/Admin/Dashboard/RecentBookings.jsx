import { useEffect, useState } from 'react'
import StatusBadge from '../components/StatusBadge.jsx'
import { getAdminBookings } from '../../api/admin/dashboardApi.js'
import { formatCurrency, formatDate, formatTime } from './dashboardData.js'

const PAGE_SIZE = 5
const STATUSES = { Confirmed: 'Đã xác nhận', Pending: 'Đang chờ xử lý', Cancelled: 'Đã hủy', Completed: 'Đã hoàn thành' }
const PAYMENTS = { Paid: 'Đã thanh toán', Unpaid: 'Chưa thanh toán', Pending: 'Chờ thanh toán', Refunded: 'Đã hoàn tiền', Failed: 'Thất bại' }

export default function RecentBookings({ sports }) {
  const [status, setStatus] = useState('All')
  const [sport, setSport] = useState('All')
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ key: '', error: '', items: [], total: 0, totalPages: 1 })
  const requestKey = `${status}|${page}`
  const loading = state.key !== requestKey

  useEffect(() => {
    let cancelled = false
    getAdminBookings({ Status: status, Page: page, PageSize: PAGE_SIZE })
      .then(({ items, total, totalPages }) => !cancelled && setState({ key: requestKey, error: '', items, total, totalPages: totalPages || Math.max(1, Math.ceil(total / PAGE_SIZE)) }))
      .catch(error => !cancelled && setState({ key: requestKey, error: error.message, items: [], total: 0, totalPages: 1 }))
    return () => { cancelled = true }
  }, [status, page, requestKey])

  // API admin chưa có tham số lọc theo môn, nên lọc môn trên trang hiện tại.
  const visible = state.items.filter(item => sport === 'All' || item.sport === sport)
  const sportOptions = sports.length ? sports.map(item => item.name) : [...new Set(state.items.map(item => item.sport).filter(Boolean))]
  const changeStatus = value => { setStatus(value); setPage(1) }

  return (
    <section className="admin-panel admin-bookings">
      <div className="admin-panel-heading">
        <div><h2>Đơn đặt sân gần đây</h2><p>Theo dõi các giao dịch đặt sân và tình trạng thanh toán trên nền tảng.</p></div>
        <div className="admin-table-filters">
          <select className="admin-select" aria-label="Lọc trạng thái đặt sân" value={status} onChange={event => changeStatus(event.target.value)}><option value="All">Tất cả trạng thái</option>{Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select className="admin-select" aria-label="Lọc môn thể thao" value={sport} onChange={event => setSport(event.target.value)}><option value="All">Tất cả môn thể thao</option>{sportOptions.map(item => <option key={item} value={item}>{item}</option>)}</select>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table"><thead><tr><th>Mã đặt sân</th><th>Người đặt</th><th>Cơ sở &amp; sân</th><th>Thời gian</th><th className="is-num">Số tiền</th><th>Trạng thái</th><th>Thanh toán</th></tr></thead>
          <tbody>{visible.map(item => <tr key={item.id}>
            <td className="admin-booking-id">{item.id.length > 12 ? `#${item.id.slice(0, 8).toUpperCase()}` : item.id}</td>
            <td><div className="admin-user-cell"><span className="admin-avatar admin-avatar-small">{item.initials}</span><strong>{item.user}</strong></div></td>
            <td><strong>{item.facility}</strong><small>{[item.court, item.location].filter(Boolean).join(' · ')}</small></td>
            <td><strong>{formatDate(item.date)}</strong><small>{[item.start && `${formatTime(item.start)}${item.end ? ` – ${formatTime(item.end)}` : ''}`, item.sport].filter(Boolean).join(' · ')}</small></td>
            <td className="is-num admin-amount">{formatCurrency(item.amount)}</td><td><StatusBadge status={item.status} /></td><td><span className={`admin-payment ${/pending|unpaid/i.test(item.payment) ? 'pending' : ''}`}>{PAYMENTS[item.payment] || item.payment || '—'}</span></td>
          </tr>)}</tbody>
        </table>
        {loading ? <p className="admin-empty">Đang tải đơn đặt sân…</p>
          : state.error ? <p className="admin-empty">{state.error}</p>
            : !visible.length && <p className="admin-empty">Không có đơn đặt sân phù hợp với bộ lọc.</p>}
      </div>
      <div className="admin-table-footer"><span>Hiển thị {visible.length} / {state.total.toLocaleString('vi-VN')} đơn <span className="admin-footer-divider">•</span> Trang {page} / {state.totalPages}</span><div><button className="admin-btn admin-btn--sm" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Trước</button><button className="admin-btn admin-btn--primary admin-btn--sm" disabled={loading || page >= state.totalPages} onClick={() => setPage(page + 1)}>Sau</button></div></div>
    </section>
  )
}
