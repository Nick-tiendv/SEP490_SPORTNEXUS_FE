import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatNumber } from './dashboardData.js'

// Tài chính & hoạt động trong kỳ, lấy từ các khối revenue / tournaments / lfg của GET /api/v1/admin/dashboard.
export default function PlatformSummary({ dashboard, loading, periodLabel }) {
  const { revenue = {}, tournaments = {}, lfg = {} } = dashboard || {}
  const groups = [
    { title: `Dòng tiền ${periodLabel}`, rows: [
      ['Giá trị đặt sân', formatCurrency(revenue.bookingGrossValue)],
      ['Phí đặt sân thu được', formatCurrency(revenue.bookingCommissionRevenue)],
      ['Doanh thu gói đẩy tin', formatCurrency(revenue.promotionRevenue)],
      ['Chủ sân nhận', formatCurrency(revenue.ownerBookingEarnings)],
      ['Nạp vào ví', formatCurrency(revenue.totalDeposits)],
      ['Rút tiền đã chi', formatCurrency(revenue.withdrawalsCompleted)],
    ] },
    { title: 'Ví người dùng (hiện tại)', rows: [
      ['Tổng số dư', formatCurrency(revenue.totalWalletBalance)],
      ['Đang tạm giữ', formatCurrency(revenue.totalFrozenBalance)],
    ] },
    { title: 'Giải đấu & ghép kèo', rows: [
      ['Giải đang mở đăng ký', formatNumber(tournaments.open)],
      ['Giải đang diễn ra', formatNumber(tournaments.inProgress)],
      ['Giải đã kết thúc', formatNumber(tournaments.finished)],
      [`Kèo đủ người ${periodLabel}`, formatNumber(lfg.filled)],
      [`Kèo bị hủy ${periodLabel}`, formatNumber(lfg.cancelled)],
    ] },
  ]
  return (
    <section className="admin-panel admin-platform-summary" aria-busy={loading}>
      <div className="admin-panel-heading"><div><h2>Tài chính &amp; hoạt động</h2><p>Dòng tiền, số dư ví và hoạt động giải đấu, ghép kèo.</p></div></div>
      {!dashboard
        ? <p className="admin-empty">{loading ? 'Đang tải…' : 'Không tải được số liệu.'}</p>
        : <div className="admin-summary-groups">{groups.map(group => <div key={group.title} className="admin-summary-group">
          <h3>{group.title}</h3>
          <dl>{group.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>)}</div>}
      <Link className="admin-activity-link admin-summary-link" to="/admin/payments"><span>Xem chi tiết dòng tiền</span><ArrowRight size={15} /></Link>
    </section>
  )
}
