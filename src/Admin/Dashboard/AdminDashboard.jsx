import { useState } from 'react'
import { Download, CalendarDays, ArrowRight, CircleAlert, LayoutDashboard, TrendingUp } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import TrendsChart from './TrendsChart.jsx'
import RecentBookings from './RecentBookings.jsx'
import PlatformActivity from './PlatformActivity.jsx'
import { stats, sports, attention } from './dashboardData.js'
import './dashboard.css'

export default function AdminDashboard() {
  const [period, setPeriod] = useState('Tháng này')
  return (
    <div className="admin-page admin-dashboard">
      <header className="admin-page-header">
        <div className="admin-page-header__main">
          <span className="admin-page-header__eyebrow"><LayoutDashboard size={14} /> Bảng điều khiển</span>
          <h1 className="admin-page-header__title">Tổng quan</h1>
          <p className="admin-page-header__desc">Xin chào, Alex Tran. Theo dõi các chỉ số và hoạt động của nền tảng SportNexus.</p>        </div>
        <div className="admin-page-header__actions">
          <div className="admin-segmented" role="group" aria-label="Khoảng thời gian thống kê">{['Hôm nay', 'Tháng này', 'Quý này', 'Tùy chỉnh'].map(item => <button key={item} type="button" aria-pressed={period === item} className={period === item ? 'selected' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div>
          <button className="admin-btn" disabled><Download size={16} /> Xuất báo cáo (PDF/CSV)</button>
        </div>
      </header>

      <section className="admin-stat-grid" aria-label="Thống kê nền tảng">{stats.map(item => <StatCard key={item.label} {...item} />)}</section>

      <div className="admin-analytics-grid">
        <TrendsChart />
        <section className="admin-panel admin-popular-sports">
          <div className="admin-panel-heading"><div><h2>Môn thể thao phổ biến</h2><p>Tỷ lệ lượt đặt sân theo môn thể thao</p></div></div>
          <ol>{sports.map((item, index) => <li key={item.name}><div><strong><i className="admin-sport-rank">{index + 1}</i>{item.name}</strong><span>{item.count}</span></div><small>{item.bookings}</small><div className="admin-sport-track"><span style={{ width: `${item.width}%` }} /></div></li>)}</ol>
          <div className="admin-sports-footer"><span>Tỷ lệ đặt sân gần nhất</span><strong><TrendingUp size={14} /> +8,6% tăng trưởng</strong></div>
        </section>
      </div>

      <section className="admin-attention">
        <div className="admin-attention-heading"><h2><CircleAlert size={18} /> Yêu cầu quản trị đang chờ xử lý <span>28 mục</span></h2><button className="admin-btn admin-btn--ghost admin-btn--sm" disabled>Xem tất cả danh mục <ArrowRight size={14} /></button></div>
        <div className="admin-attention-grid">{attention.map(({ title, text, icon: Icon, tone, detail, action }) => <article key={title} className={`admin-attention-card ${tone}`}><div className="admin-attention-body"><span className="admin-attention-icon"><Icon size={20} /></span><div><h3>{title}</h3><p>{text}</p></div></div><div className="admin-attention-footer"><small>{detail}</small><button className="admin-btn admin-btn--soft admin-btn--sm" disabled>{action}</button></div></article>)}</div>
      </section>

      <div className="admin-bottom-grid"><RecentBookings /><PlatformActivity /></div>

      <footer className="admin-dashboard-footer"><span><CalendarDays size={14} /> Dữ liệu hiển thị là dữ liệu mẫu.</span><span>Quản trị SportNexus</span></footer>
    </div>
  )
}
