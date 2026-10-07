import { useState } from 'react'
import { Download, ChevronDown, CalendarDays, ArrowRight, CircleAlert } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import TrendsChart from './TrendsChart.jsx'
import RecentBookings from './RecentBookings.jsx'
import PlatformActivity from './PlatformActivity.jsx'
import { stats, sports, attention } from './dashboardData.js'

export default function AdminDashboard() {
  const [period, setPeriod] = useState('Tháng này')
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-heading">
        <div><div className="admin-title-row"><h1>Dashboard</h1><span className="admin-overview-badge">Tổng quan</span></div><p>Overview of the SportNexus platform – Real-time metrics and operations.</p></div>
        <div className="admin-dashboard-controls"><div className="admin-period-tabs">{['Hôm nay', 'Tháng này', 'Quý này', 'Tùy chỉnh'].map(item => <button key={item} aria-pressed={period === item} className={period === item ? 'selected' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div><button className="admin-outline-button" disabled><Download size={14} /> Xuất báo cáo (PDF/CSV)</button></div>
      </div>
      <section className="admin-stat-grid" aria-label="Platform statistics">{stats.map(item => <StatCard key={item.label} {...item} />)}</section>
      <div className="admin-analytics-grid">
        <TrendsChart />
        <section className="admin-panel admin-popular-sports">
          <div className="admin-panel-heading"><div><h2>Popular Sports</h2><p>Tỷ lệ lượt đặt sân theo môn thể thao</p></div></div>
          <ol>{sports.map(item => <li key={item.name}><div><strong><i />{item.name}</strong><span>{item.count}</span></div><small>{item.bookings}</small><div className="admin-sport-track"><span style={{ width: `${item.width}%` }} /></div></li>)}</ol>
          <div className="admin-sports-footer"><span>Tỷ lệ đặt sân gần nhất</span><strong>+8.6% tăng trưởng</strong></div>
        </section>
      </div>
      <section className="admin-attention">
        <div className="admin-attention-heading"><h2><CircleAlert size={16} /> Yêu cầu quản trị đang chờ xử lý <span>28 mục</span></h2><button disabled>Xem tất cả danh mục <ArrowRight size={13} /></button></div>
        <div className="admin-attention-grid">{attention.map(({ title, text, icon: Icon, tone, detail, action }) => <article key={title} className={`admin-attention-card ${tone}`}><div className="admin-attention-body"><span className="admin-attention-icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div></div><div className="admin-attention-footer"><small>{detail}</small><button disabled>{action}</button></div></article>)}</div>
      </section>
      <div className="admin-bottom-grid"><RecentBookings /><PlatformActivity /></div>
      <footer className="admin-dashboard-footer"><span><CalendarDays size={13} /> Dữ liệu hiển thị là dữ liệu mẫu.</span><span>SportNexus Admin</span><ChevronDown size={12} /></footer>
    </div>
  )
}
