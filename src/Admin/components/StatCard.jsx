import { Link } from 'react-router-dom'
import { TrendingDown, TrendingUp } from 'lucide-react'

// Truyền `to` để cả thẻ trở thành link điều hướng sang trang tương ứng.
// `trend` bắt đầu bằng dấu "-" (vd. "-12%") được hiển thị là xu hướng giảm (mũi tên xuống, màu đỏ).
export default function StatCard({ label, value, icon: Icon, trend, supporting, to }) {
  const down = typeof trend === 'string' && /^[-−]/.test(trend.trim())
  const TrendIcon = down ? TrendingDown : TrendingUp
  const content = <>
    <div className="admin-stat-heading"><span>{label}</span><span className="admin-stat-icon"><Icon size={18} /></span></div>
    <strong className="admin-stat-value">{value}</strong>
    <div className={`admin-stat-trend ${down ? 'is-down' : ''}`}>{trend && <><TrendIcon size={13} /><span>{trend}</span></>}<small>{supporting}</small></div>
  </>
  return to
    ? <Link to={to} className="admin-stat-card admin-stat-card--link" aria-label={`${label}: ${value}${trend ? ` (${trend})` : ''}. Mở trang chi tiết`}>{content}</Link>
    : <article className="admin-stat-card">{content}</article>
}
