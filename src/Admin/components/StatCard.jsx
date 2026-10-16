import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

// Truyền `to` để cả thẻ trở thành link điều hướng sang trang tương ứng.
export default function StatCard({ label, value, icon: Icon, trend, supporting, to }) {
  const content = <>
    <div className="admin-stat-heading"><span>{label}</span><span className="admin-stat-icon"><Icon size={18} /></span></div>
    <strong className="admin-stat-value">{value}</strong>
    <div className="admin-stat-trend">{trend && <><TrendingUp size={13} /><span>{trend}</span></>}<small>{supporting}</small></div>
  </>
  return to
    ? <Link to={to} className="admin-stat-card admin-stat-card--link" aria-label={`${label}: ${value}. Mở trang chi tiết`}>{content}</Link>
    : <article className="admin-stat-card">{content}</article>
}
