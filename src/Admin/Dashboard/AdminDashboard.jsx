import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, CalendarDays, CircleAlert, LayoutDashboard, TrendingUp, Users, UserRoundCheck, Building2, Wallet, Network, Flag, ClipboardCheck, CircleDollarSign, TriangleAlert } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import TrendsChart from './TrendsChart.jsx'
import RecentBookings from './RecentBookings.jsx'
import PlatformActivity from './PlatformActivity.jsx'
import { getAdminBookings, getAdminDashboard, getCurrentUserName, getSports } from '../../api/admin/dashboardApi.js'
import { AGGREGATE_PAGE_SIZE, PERIODS, buildSportShares, formatCurrency, formatNumber, growth, periodRange } from './dashboardData.js'
import './dashboard.css'

const settledValue = result => (result.status === 'fulfilled' ? result.value : undefined)
const toDashboardRange = ({ DateFrom, DateTo }) => ({ fromDate: DateFrom, toDate: DateTo })
const formatPercent = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—')

export default function AdminDashboard() {
  const [period, setPeriod] = useState('Tháng này')
  const [base, setBase] = useState({})
  const [periodData, setPeriodData] = useState({})

  // Dữ liệu không phụ thuộc khoảng thời gian.
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getCurrentUserName(), getSports()])
      .then(results => {
        if (cancelled) return
        const [name, sports] = results.map(settledValue)
        setBase({ name, sports: sports || [] })
      })
    return () => { cancelled = true }
  }, [])

  // Dữ liệu theo khoảng thời gian: dashboard kỳ này + kỳ trước (tính % tăng trưởng), danh sách booking để tính môn phổ biến.
  useEffect(() => {
    let cancelled = false
    const { current, previous } = periodRange(period)
    Promise.allSettled([getAdminDashboard(toDashboardRange(current)), getAdminDashboard(toDashboardRange(previous)), getAdminBookings({ ...current, Page: 1, PageSize: AGGREGATE_PAGE_SIZE })])
      .then(results => {
        if (cancelled) return
        const [dashboard, previousDashboard, bookings] = results.map(settledValue)
        setPeriodData({ key: period, dashboard, previous: previousDashboard, bookings: bookings?.items || [], error: results[0].reason?.message })
      })
    return () => { cancelled = true }
  }, [period])

  const periodLoading = periodData.key !== period
  const sports = useMemo(() => buildSportShares(periodData.bookings || []), [periodData.bookings])
  const show = (format, value) => (periodLoading ? 'Đang tải…' : format(value))
  const { users = {}, facilities = {}, bookings = {}, revenue = {}, lfg = {}, pending = {} } = periodData.dashboard || {}
  const prev = periodData.previous
  const periodLabel = period.toLowerCase()

  const stats = [
    { label: 'Tổng người dùng', value: show(formatNumber, users.total), icon: Users, to: '/admin/users', trend: Number.isFinite(users.newInRange) ? `+${formatNumber(users.newInRange)} mới` : undefined, supporting: `${formatNumber(users.players)} người chơi · ${formatNumber(users.locked)} bị khóa` },
    { label: 'Chủ sân', value: show(formatNumber, users.owners), icon: UserRoundCheck, to: '/admin/court-owners', supporting: `${formatNumber(pending.ownerVerifications)} chờ xác minh` },
    { label: 'Cơ sở thể thao', value: show(formatNumber, facilities.total), icon: Building2, to: '/admin/facilities', supporting: `${formatNumber(facilities.approved)} đã duyệt · ${formatNumber(facilities.courts)} sân` },
    { label: 'Lượt đặt sân', value: show(formatNumber, bookings.inRange), icon: CalendarDays, to: '/admin/bookings', trend: growth(bookings.inRange, prev?.bookings.inRange), supporting: `${periodLabel} · tỉ lệ hủy ${formatPercent(bookings.cancelRate)}` },
    { label: 'Doanh thu nền tảng', value: show(formatCurrency, revenue.platformRevenue), icon: Wallet, to: '/admin/payments', trend: growth(revenue.platformRevenue, prev?.revenue.platformRevenue), supporting: `${periodLabel} · phí đặt sân ${formatPercent(revenue.currentBookingFeePercent)}` },
    { label: 'Nhóm chơi đang mở', value: show(formatNumber, lfg.open), icon: Network, to: '/admin/lfg', supporting: `${formatNumber(lfg.createdInRange)} nhóm tạo ${periodLabel}` },
  ]
  const attention = [
    { title: 'Chủ sân chờ xác minh', count: pending.ownerVerifications, text: 'Giấy tờ xác minh chưa đầy đủ hoặc đang chờ quản trị viên phê duyệt.', icon: ClipboardCheck, tone: 'green', detail: 'Đang chờ duyệt', action: 'Duyệt ngay', to: '/admin/court-owners?tab=kyc' },
    { title: 'Báo cáo vi phạm', count: pending.openReports, text: 'Có đơn đặt sân / đánh giá bị báo cáo cần được kiểm tra và xử lý.', icon: Flag, tone: 'red', detail: 'Đang chờ xử lý', action: 'Kiểm tra', to: '/admin/reviews-reports?status=Pending' },
    { title: 'Yêu cầu rút tiền', count: pending.withdrawals, text: 'Yêu cầu rút tiền từ ví đang chờ quản trị viên xác nhận.', icon: CircleDollarSign, tone: 'green', detail: `Tổng ${formatCurrency(pending.withdrawalAmount)}`, action: 'Xem xét', to: '/admin/payments?tab=withdrawals' },
    { title: 'Cơ sở chờ duyệt', count: pending.facilityApprovals, text: 'Cần rà soát thông tin cơ sở và xác nhận trước khi hiển thị.', icon: Building2, tone: 'green', detail: 'Trạng thái chờ duyệt', action: 'Thẩm định', to: '/admin/facilities?status=Pending' },
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

      {!periodLoading && periodData.error && <div className="admin-alert admin-alert--warning" role="alert"><TriangleAlert size={16} /><span>Không tải được số liệu tổng quan: {periodData.error}</span></div>}

      <section className="admin-stat-grid" aria-label="Thống kê nền tảng">{stats.map(item => <StatCard key={item.label} {...item} />)}</section>

      <div className="admin-analytics-grid">
        <TrendsChart />
        <section className="admin-panel admin-popular-sports">
          <div className="admin-panel-heading"><div><h2>Môn thể thao phổ biến</h2><p>Tỷ lệ lượt đặt sân theo môn thể thao ({periodLabel})</p></div></div>
          {sports.length
            ? <ol>{sports.map((item, index) => <li key={item.name}><div><strong><i className="admin-sport-rank">{index + 1}</i>{item.name}</strong><span>{item.count}</span></div><small>{item.bookings}</small><div className="admin-sport-track"><span style={{ width: `${item.width}%` }} /></div></li>)}</ol>
            : <p className="admin-empty">{periodLoading ? 'Đang tải…' : 'Chưa có dữ liệu đặt sân theo môn.'}</p>}
          <div className="admin-sports-footer"><span>Dựa trên {formatNumber(periodData.bookings?.length || 0)} lượt đặt</span><strong><TrendingUp size={14} /> {period}</strong></div>
        </section>
      </div>

      <section className="admin-attention">
        <div className="admin-attention-heading"><h2><CircleAlert size={18} /> Yêu cầu quản trị đang chờ xử lý <span>{formatNumber(attentionTotal)} mục</span></h2></div>
        <div className="admin-attention-grid">{attention.map(({ title, count, text, icon: Icon, tone, detail, action, to }) => <Link key={title} to={to} className={`admin-attention-card ${tone}`} aria-label={`${title}: ${formatNumber(count)}. ${action}`}><div className="admin-attention-body"><span className="admin-attention-icon"><Icon size={20} /></span><div><h3>{Number.isFinite(count) ? `${formatNumber(count)} ` : ''}{title}</h3><p>{text}</p></div></div><div className="admin-attention-footer"><small>{detail}</small><span className="admin-btn admin-btn--soft admin-btn--sm">{action}</span></div></Link>)}</div>
      </section>

      <div className="admin-bottom-grid"><RecentBookings sports={base.sports || []} /><PlatformActivity /></div>

      <footer className="admin-dashboard-footer"><span><CalendarDays size={14} /> Dữ liệu lấy trực tiếp từ hệ thống.</span><span>Quản trị SportNexus</span></footer>
    </div>
  )
}
