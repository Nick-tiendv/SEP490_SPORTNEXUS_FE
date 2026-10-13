import { TrendingUp } from 'lucide-react'

export default function StatCard({ label, value, icon: Icon, trend, supporting }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-heading"><span>{label}</span><span className="admin-stat-icon"><Icon size={18} /></span></div>
      <strong className="admin-stat-value">{value}</strong>
      <div className="admin-stat-trend"><TrendingUp size={13} /><span>{trend}</span><small>{supporting}</small></div>
    </article>
  )
}
