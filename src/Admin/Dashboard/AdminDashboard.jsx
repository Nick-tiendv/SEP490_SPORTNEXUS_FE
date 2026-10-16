import { useEffect, useMemo, useState } from 'react'
import { Download, CalendarDays, ArrowRight, CircleAlert, LayoutDashboard, TrendingUp, Users, UserRoundCheck, Building2, Wallet, Network, Flag, ClipboardCheck, CircleDollarSign, TriangleAlert } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import TrendsChart from './TrendsChart.jsx'
import RecentBookings from './RecentBookings.jsx'
import PlatformActivity from './PlatformActivity.jsx'
import { getAccountSummary, getAdminBookings, getBookingStatistics, getCurrentUserName, getFacilityCount, getPendingReportCount, getSports } from '../../api/admin/dashboardApi.js'
import { AGGREGATE_PAGE_SIZE, PERIODS, buildSportShares, formatCurrency, formatNumber, growth, periodRange } from './dashboardData.js'
import './dashboard.css'

const settledValue = result => (result.status === 'fulfilled' ? result.value : undefined)

export default function AdminDashboard() {
  const [period, setPeriod] = useState('Tháng này')
  const [base, setBase] = useState({})
  const [periodData, setPeriodData] = useState({})

  // Dữ liệu không phụ thuộc khoảng thời gian.
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getCurrentUserName(), getAccountSummary(), getFacilityCount(), getFacilityCount('Pending'), getPendingReportCount(), getSports()])
      .then(results => {
        if (cancelled) return
        const [name, accounts, facilities, pendingFacilities, pendingReports, sports] = results.map(settledValue)
        const failed = results.find(result => result.status === 'rejected')
        setBase({ name, accounts, facilities, pendingFacilities, pendingReports, sports: sports || [], error: failed?.reason?.message })
      })
    return () => { cancelled = true }
  }, [])

  // Dữ liệu theo khoảng thời gian: thống kê booking kỳ này + kỳ trước, danh sách booking để tính môn phổ biến.
  useEffect(() => {
    let cancelled = false
    const { current, previous } = periodRange(period)
    Promise.allSettled([getBookingStatistics(current), getBookingStatistics(previous), getAdminBookings({ ...current, Page: 1, PageSize: AGGREGATE_PAGE_SIZE })])
      .then(results => {
        if (cancelled) return
        const [stats, prevStats, bookings] = results.map(settledValue)
        const items = bookings?.items || []
        // Nếu API thống kê không trả được số liệu, tính tạm từ danh sách booking.
        const fallbackRevenue = items.filter(item => !/cancel/i.test(item.status)).reduce((sum, item) => sum + item.amount, 0)
        setPeriodData({
          key: period,
          totalBookings: stats?.totalBookings ?? bookings?.total,
          totalRevenue: stats?.totalRevenue ?? (bookings ? fallbackRevenue : undefined),
          prevBookings: prevStats?.totalBookings,
          prevRevenue: prevStats?.totalRevenue,
          bookings: items,
        })
      })
    return () => { cancelled = true }
  }, [period])

  const periodLoading = periodData.key !== period
  const sports = useMemo(() => buildSportShares(periodData.bookings || []), [periodData.bookings])
  const loadingText = periodLoading ? 'Đang tải…' : undefined
  const stats = [
    { label: 'Tổng người dùng', value: formatNumber(base.accounts?.totalUsers), icon: Users, to: '/admin/users', supporting: 'tài khoản trên hệ thống' },
    { label: 'Chủ sân đang hoạt động', value: formatNumber(base.accounts?.activeOwners), icon: UserRoundCheck, to: '/admin/court-owners', supporting: 'tài khoản chủ sân' },
    { label: 'Cơ sở thể thao', value: formatNumber(base.facilities), icon: Building2, to: '/admin/facilities', supporting: 'cơ sở trên nền tảng' },
    { label: 'Tổng lượt đặt sân', value: loadingText || formatNumber(periodData.totalBookings), icon: CalendarDays, to: '/admin/bookings', trend: growth(periodData.totalBookings, periodData.prevBookings), supporting: `${period.toLowerCase()}` },
    { label: 'Doanh thu nền tảng', value: loadingText || formatCurrency(periodData.totalRevenue), icon: Wallet, to: '/admin/payments', trend: growth(periodData.totalRevenue, periodData.prevRevenue), supporting: `${period.toLowerCase()}` },
    { label: 'Nhóm chơi đang hoạt động', value: '—', icon: Network, to: '/admin/lfg', supporting: 'chưa có API danh sách nhóm' },
  ]
  const attention = [
    { title: 'Chủ sân chờ KYC', count: undefined, text: 'Giấy tờ xác minh chưa đầy đủ hoặc đang chờ quản trị viên phê duyệt.', icon: ClipboardCheck, tone: 'green', detail: 'Chưa có API', action: 'Duyệt ngay' },
    { title: 'Báo cáo vi phạm', count: base.pendingReports, text: 'Có đơn đặt sân / đánh giá bị báo cáo cần được kiểm tra và xử lý.', icon: Flag, tone: 'red', detail: 'Đang chờ xử lý', action: 'Kiểm tra' },
    { title: 'Khiếu nại Escrow', count: undefined, text: 'Yêu cầu hoàn tiền / tranh chấp thanh toán đang chờ xác minh.', icon: CircleDollarSign, tone: 'green', detail: 'Chưa có API', action: 'Xem xét' },
    { title: 'Cơ sở chờ duyệt', count: base.pendingFacilities, text: 'Cần rà soát thông tin cơ sở và xác nhận trước khi hiển thị.', icon: Building2, tone: 'green', detail: 'Trạng thái chờ duyệt', action: 'Thẩm định' },
  ]
  const attentionTotal = attention.reduce((sum, item) => sum + (Number.isFinite(item.count) ? item.count : 0), 0)

  return (
    <div className="admin-page admin-dashboard">
      <header className="admin-page-header">
        <div className="admin-page-header__main">
          <span className="admin-page-header__eyebrow"><LayoutDashboard size={14} /> Bảng điều khiển</span>
          <h1 className="admin-page-header__title">Tổng quan</h1>
          <p className="admin-page-header__desc">Xin chào{base.name ? `, ${base.name}` : ''}. Theo dõi các chỉ số và hoạt động của nền tảng SportNexus.</p>
        </div>
        <div className="admin-page-header__actions">
          <div className="admin-segmented" role="group" aria-label="Khoảng thời gian thống kê">{PERIODS.map(item => <button key={item} type="button" aria-pressed={period === item} className={period === item ? 'selected' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div>
          <button className="admin-btn" disabled title="Chưa có API xuất báo cáo"><Download size={16} /> Xuất báo cáo (PDF/CSV)</button>
        </div>
      </header>

      {base.error && <div className="admin-alert admin-alert--warning" role="alert"><TriangleAlert size={16} /><span>Một số dữ liệu không tải được: {base.error}</span></div>}

      <section className="admin-stat-grid" aria-label="Thống kê nền tảng">{stats.map(item => <StatCard key={item.label} {...item} />)}</section>

      <div className="admin-analytics-grid">
        <TrendsChart />
        <section className="admin-panel admin-popular-sports">
          <div className="admin-panel-heading"><div><h2>Môn thể thao phổ biến</h2><p>Tỷ lệ lượt đặt sân theo môn thể thao ({period.toLowerCase()})</p></div></div>
          {sports.length
            ? <ol>{sports.map((item, index) => <li key={item.name}><div><strong><i className="admin-sport-rank">{index + 1}</i>{item.name}</strong><span>{item.count}</span></div><small>{item.bookings}</small><div className="admin-sport-track"><span style={{ width: `${item.width}%` }} /></div></li>)}</ol>
            : <p className="admin-empty">{periodLoading ? 'Đang tải…' : 'Chưa có dữ liệu đặt sân theo môn.'}</p>}
          <div className="admin-sports-footer"><span>Dựa trên {formatNumber(periodData.bookings?.length || 0)} lượt đặt</span><strong><TrendingUp size={14} /> {period}</strong></div>
        </section>
      </div>

      <section className="admin-attention">
        <div className="admin-attention-heading"><h2><CircleAlert size={18} /> Yêu cầu quản trị đang chờ xử lý <span>{formatNumber(attentionTotal)} mục</span></h2><button className="admin-btn admin-btn--ghost admin-btn--sm" disabled>Xem tất cả danh mục <ArrowRight size={14} /></button></div>
        <div className="admin-attention-grid">{attention.map(({ title, count, text, icon: Icon, tone, detail, action }) => <article key={title} className={`admin-attention-card ${tone}`}><div className="admin-attention-body"><span className="admin-attention-icon"><Icon size={20} /></span><div><h3>{Number.isFinite(count) ? `${formatNumber(count)} ` : ''}{title}</h3><p>{text}</p></div></div><div className="admin-attention-footer"><small>{detail}</small><button className="admin-btn admin-btn--soft admin-btn--sm" disabled>{action}</button></div></article>)}</div>
      </section>

      <div className="admin-bottom-grid"><RecentBookings sports={base.sports || []} /><PlatformActivity /></div>

      <footer className="admin-dashboard-footer"><span><CalendarDays size={14} /> Dữ liệu lấy trực tiếp từ hệ thống.</span><span>Quản trị SportNexus</span></footer>
    </div>
  )
}
