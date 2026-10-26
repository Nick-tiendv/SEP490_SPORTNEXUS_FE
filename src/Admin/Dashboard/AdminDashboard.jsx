import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Download, CalendarDays, CircleAlert, Clock3, LayoutDashboard, RefreshCw, TrendingUp, Users, UserRoundCheck, Building2, Wallet, Network, Flag, ClipboardCheck, CircleDollarSign, TriangleAlert } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import TrendsChart from './TrendsChart.jsx'
import RecentBookings from './RecentBookings.jsx'
import PlatformSummary from './PlatformSummary.jsx'
import { MAX_PAGE_SIZE, getAdminBookings, getAdminDashboard } from '../../api/admin/dashboardApi.js'
import { AGGREGATE_MAX_PAGES, PERIODS, buildSportShares, dashboardCsvRows, downloadCsv, formatCurrency, formatDateTime, formatNumber, formatPercent, growth, periodRange } from './dashboardData.js'
import './dashboard.css'

const settledValue = result => (result.status === 'fulfilled' ? result.value : undefined)
const isCancelled = booking => /cancel/i.test(booking.status)

// Lấy tối đa AGGREGATE_MAX_PAGES trang booking trong kỳ để tính môn phổ biến; trả kèm tổng số đơn để biết có bị cắt bớt không.
async function loadBookingSample({ fromDate, toDate }) {
  const fetchPage = Page => getAdminBookings({ DateFrom: fromDate, DateTo: toDate, Page, PageSize: MAX_PAGE_SIZE })
  const first = await fetchPage(1)
  const pages = Math.min(AGGREGATE_MAX_PAGES, first.totalPages || Math.ceil(first.total / MAX_PAGE_SIZE) || 1)
  const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, index) => fetchPage(index + 2)))
  return { items: [first, ...rest].flatMap(result => result.items), total: first.total }
}

export default function AdminDashboard() {
  const { profile } = useOutletContext() || {}
  const [period, setPeriod] = useState('Tháng này')
  const [reloadKey, setReloadKey] = useState(0)
  const [periodData, setPeriodData] = useState({})
  const requestKey = `${period}|${reloadKey}`

  // Dashboard kỳ này + kỳ trước (tính % tăng trưởng), mẫu booking để tính môn phổ biến.
  useEffect(() => {
    let cancelled = false
    const { current, previous } = periodRange(period)
    const fresh = reloadKey > 0
    Promise.allSettled([getAdminDashboard(current, { fresh }), getAdminDashboard(previous, { fresh }), loadBookingSample(current)])
      .then(results => {
        if (cancelled) return
        const [dashboard, previousDashboard, sample] = results.map(settledValue)
        setPeriodData({ key: requestKey, range: current, dashboard, previous: previousDashboard, sample: sample || { items: [], total: 0 }, error: results[0].reason?.message, loadedAt: new Date() })
      })
    return () => { cancelled = true }
  }, [period, reloadKey, requestKey])

  const periodLoading = periodData.key !== requestKey
  const ready = !periodLoading && Boolean(periodData.dashboard)
  const activeBookings = useMemo(() => (periodData.sample?.items || []).filter(booking => !isCancelled(booking)), [periodData.sample])
  const sports = useMemo(() => buildSportShares(activeBookings), [activeBookings])
  const sampleTruncated = (periodData.sample?.items.length || 0) < (periodData.sample?.total || 0)
  const show = (format, value) => (periodLoading ? 'Đang tải…' : format(value))
  // Dòng phụ / xu hướng chỉ hiện khi đã có số liệu (tránh "— người chơi · — bị khóa").
  const when = text => (ready ? text : undefined)
  const { users = {}, facilities = {}, bookings = {}, revenue = {}, lfg = {}, pending = {} } = periodData.dashboard || {}
  const prev = periodData.previous
  const periodLabel = period.toLowerCase()
  // "Hôm nay" mới qua một phần ngày, so % với cả ngày hôm qua là không công bằng → hiện số của hôm qua để tham khảo.
  const isToday = period === 'Hôm nay'
  const versus = (format, value) => (isToday && prev ? ` · hôm qua ${format(value)}` : '')

  const stats = [
    { label: 'Tổng người dùng', value: show(formatNumber, users.total), icon: Users, to: '/admin/users', trend: when(Number.isFinite(users.newInRange) ? `+${formatNumber(users.newInRange)} mới` : undefined), supporting: when(`${formatNumber(users.players)} người chơi · ${formatNumber(users.locked)} bị khóa`) },
    { label: 'Chủ sân', value: show(formatNumber, users.owners), icon: UserRoundCheck, to: '/admin/court-owners', supporting: when(`${formatNumber(pending.ownerVerifications)} chờ xác minh`) },
    { label: 'Cơ sở thể thao', value: show(formatNumber, facilities.total), icon: Building2, to: '/admin/facilities', supporting: when(`${formatNumber(facilities.approved)} đã duyệt · ${formatNumber(facilities.courts)} sân`) },
    { label: 'Lượt đặt sân', value: show(formatNumber, bookings.inRange), icon: CalendarDays, to: '/admin/bookings', trend: when(isToday ? undefined : growth(bookings.inRange, prev?.bookings.inRange)), supporting: when(`${periodLabel} · tỉ lệ hủy ${formatPercent(bookings.cancelRate)}${versus(formatNumber, prev?.bookings.inRange)}`) },
    { label: 'Doanh thu nền tảng', value: show(formatCurrency, revenue.platformRevenue), icon: Wallet, to: '/admin/payments', trend: when(isToday ? undefined : growth(revenue.platformRevenue, prev?.revenue.platformRevenue)), supporting: when(`${periodLabel} · phí đặt sân ${formatPercent(revenue.currentBookingFeePercent)}${versus(formatCurrency, prev?.revenue.platformRevenue)}`) },
    { label: 'Nhóm chơi đang mở', value: show(formatNumber, lfg.open), icon: Network, to: '/admin/lfg', supporting: when(`${formatNumber(lfg.createdInRange)} nhóm tạo ${periodLabel}`) },
  ]
  const attention = [
    { title: 'Chủ sân chờ xác minh', count: pending.ownerVerifications, text: 'Giấy tờ xác minh chưa đầy đủ hoặc đang chờ quản trị viên phê duyệt.', icon: ClipboardCheck, tone: 'green', detail: 'Đang chờ duyệt', action: 'Duyệt ngay', to: '/admin/court-owners?tab=kyc' },
    { title: 'Báo cáo vi phạm', count: pending.openReports, text: 'Có đơn đặt sân / đánh giá bị báo cáo cần được kiểm tra và xử lý.', icon: Flag, tone: 'red', detail: 'Đang chờ xử lý', action: 'Kiểm tra', to: '/admin/reviews-reports?status=Pending' },
    { title: 'Yêu cầu rút tiền', count: pending.withdrawals, text: 'Yêu cầu rút tiền từ ví đang chờ quản trị viên xác nhận.', icon: CircleDollarSign, tone: 'green', detail: `Tổng ${formatCurrency(pending.withdrawalAmount)}`, action: 'Xem xét', to: '/admin/payments?tab=withdrawals' },
    { title: 'Cơ sở chờ duyệt', count: pending.facilityApprovals, text: 'Cần rà soát thông tin cơ sở và xác nhận trước khi hiển thị.', icon: Building2, tone: 'green', detail: 'Trạng thái chờ duyệt', action: 'Thẩm định', to: '/admin/facilities?status=Pending' },
  ]
  const attentionTotal = attention.reduce((sum, item) => sum + (Number.isFinite(item.count) ? item.count : 0), 0)

  const exportCsv = () => {
    if (!ready) return
    const { range } = periodData
    downloadCsv(`bao-cao-tong-quan_${range.fromDate}_${range.toDate}.csv`, dashboardCsvRows(periodData.dashboard, period, range))
  }

  return (
    <div className="admin-page admin-dashboard">
      <header className="admin-page-header">
        <div className="admin-page-header__main">
          <span className="admin-page-header__eyebrow"><LayoutDashboard size={14} /> Bảng điều khiển</span>
          <h1 className="admin-page-header__title">Tổng quan</h1>
          <p className="admin-page-header__desc">Xin chào{profile?.name ? `, ${profile.name}` : ''}. Theo dõi các chỉ số và hoạt động của nền tảng SportNexus.</p>
        </div>
        <div className="admin-page-header__actions">
          <div className="admin-segmented" role="group" aria-label="Khoảng thời gian thống kê">{PERIODS.map(item => <button key={item} type="button" aria-pressed={period === item} className={period === item ? 'selected' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div>
          <button type="button" className="admin-btn admin-dashboard-refresh" onClick={() => setReloadKey(key => key + 1)} disabled={periodLoading} title="Tải lại số liệu mới nhất"><RefreshCw size={16} className={periodLoading ? 'is-spinning' : ''} /> Làm mới</button>
          <button type="button" className="admin-btn" onClick={exportCsv} disabled={!ready} title={ready ? `Xuất số liệu ${periodLabel} ra file CSV` : 'Chờ tải xong số liệu'}><Download size={16} /> Xuất CSV</button>
        </div>
      </header>

      {!periodLoading && periodData.error && <div className="admin-alert admin-alert--warning" role="alert"><TriangleAlert size={16} /><span>Không tải được số liệu tổng quan: {periodData.error}</span></div>}

      <section className="admin-stat-grid" aria-label="Thống kê nền tảng" aria-busy={periodLoading}>{stats.map(item => <StatCard key={item.label} {...item} />)}</section>

      <div className="admin-analytics-grid">
        <TrendsChart reloadKey={reloadKey} />
        <section className="admin-panel admin-popular-sports">
          <div className="admin-panel-heading"><div><h2>Môn thể thao phổ biến</h2><p>Tỷ lệ lượt đặt sân theo môn thể thao ({periodLabel}, không tính đơn hủy)</p></div></div>
          {sports.length && !periodLoading
            ? <ol>{sports.map((item, index) => <li key={item.name}><div><strong><i className="admin-sport-rank">{index + 1}</i>{item.name}</strong><span>{item.count}</span></div><small>{item.bookings}</small><div className="admin-sport-track"><span style={{ width: `${item.width}%` }} /></div></li>)}</ol>
            : <p className="admin-empty">{periodLoading ? 'Đang tải…' : 'Chưa có dữ liệu đặt sân theo môn.'}</p>}
          <div className="admin-sports-footer">
            <span>{periodLoading ? '…' : sampleTruncated
              ? `Dựa trên ${formatNumber(activeBookings.length)} đơn trong ${formatNumber(periodData.sample.items.length)} / ${formatNumber(periodData.sample.total)} đơn gần nhất`
              : `Dựa trên ${formatNumber(activeBookings.length)} lượt đặt`}</span>
            <strong><TrendingUp size={14} /> {period}</strong>
          </div>
        </section>
      </div>

      <section className="admin-attention">
        <div className="admin-attention-heading"><h2><CircleAlert size={18} /> Yêu cầu quản trị đang chờ xử lý <span>{periodLoading ? '…' : `${formatNumber(attentionTotal)} mục`}</span></h2></div>
        <div className="admin-attention-grid">{attention.map(({ title, count, text, icon: Icon, tone, detail, action, to }) => <Link key={title} to={to} className={`admin-attention-card ${tone}`} aria-label={`${title}: ${formatNumber(count)}. ${action}`}><div className="admin-attention-body"><span className="admin-attention-icon"><Icon size={20} /></span><div><h3>{Number.isFinite(count) ? `${formatNumber(count)} ` : ''}{title}</h3><p>{text}</p></div></div><div className="admin-attention-footer"><small>{ready ? detail : ''}</small><span className="admin-btn admin-btn--soft admin-btn--sm">{action}</span></div></Link>)}</div>
      </section>

      <div className="admin-bottom-grid"><RecentBookings reloadKey={reloadKey} /><PlatformSummary dashboard={ready ? periodData.dashboard : null} loading={periodLoading} periodLabel={periodLabel} /></div>

      <footer className="admin-dashboard-footer">
        <span><Clock3 size={14} /> {periodData.loadedAt ? `Cập nhật lúc ${formatDateTime(periodData.loadedAt)} (giờ Việt Nam)` : 'Đang tải dữ liệu…'}</span>
        <span>Quản trị SportNexus</span>
      </footer>
    </div>
  )
}
