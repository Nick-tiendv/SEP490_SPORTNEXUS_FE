import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { bookings } from './dashboardData.js'

export default function RecentBookings() {
  const [status, setStatus] = useState('All')
  const [sport, setSport] = useState('All')
  const visible = bookings.filter(item => (status === 'All' || item.status === status) && (sport === 'All' || item.sport === sport))
  return (
    <section className="admin-panel admin-bookings">
      <div className="admin-panel-heading">
        <div><h2>Đơn đặt sân gần đây<br /><span>(Recent Bookings)</span></h2><p>Theo dõi các giao dịch đặt sân và tình trạng thanh toán trên nền tảng.</p></div>
        <div className="admin-table-filters">
          <label><select aria-label="Filter booking status" value={status} onChange={event => setStatus(event.target.value)}><option value="All">Tất cả trạng thái</option>{['Confirmed', 'Pending', 'Cancelled', 'Completed'].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={12} /></label>
          <label><select aria-label="Filter sport" value={sport} onChange={event => setSport(event.target.value)}><option value="All">Tất cả môn thể thao</option>{[...new Set(bookings.map(item => item.sport))].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={12} /></label>
        </div>
      </div>
      <div className="admin-table-scroll">
        <table><thead><tr><th>Mã booking</th><th>Người đặt</th><th>Cơ sở &amp; sân</th><th>Thời gian</th><th>Số tiền</th><th>Trạng thái</th><th>Thanh toán</th></tr></thead>
          <tbody>{visible.map(item => <tr key={item.id}>
            <td className="admin-booking-id">{item.id}</td>
            <td><div className="admin-user-cell"><span className="admin-avatar admin-avatar-small">{item.initials}</span><strong>{item.user}</strong></div></td>
            <td><strong>{item.facility}</strong><small>{item.court}</small><small>{item.location}</small></td>
            <td><strong>{item.date}</strong><small>{item.time}</small><small>{item.sport}</small></td>
            <td className="admin-amount">{item.amount}</td><td><StatusBadge status={item.status} /></td><td><span className={`admin-payment ${item.status === 'Pending' ? 'pending' : ''}`}>{item.payment}</span></td>
          </tr>)}</tbody>
        </table>
        {!visible.length && <p className="admin-empty">Không có booking phù hợp với bộ lọc.</p>}
      </div>
      <div className="admin-table-footer"><span>Hiển thị {visible.length} đơn <span className="admin-footer-divider">•</span> Trang 1 / 24</span><div><button disabled>Trước</button><button disabled className="admin-button-primary">Sau</button></div></div>
    </section>
  )
}
