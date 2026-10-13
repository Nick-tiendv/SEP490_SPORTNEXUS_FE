import { ArrowRight } from 'lucide-react'
import { activities } from './dashboardData.js'

export default function PlatformActivity() {
  return (
    <section className="admin-panel admin-activity">
      <div className="admin-panel-heading"><div><h2>Platform Activity Log</h2><p>Nhật ký hoạt động nền tảng mới nhất.</p></div><span className="admin-live-label"><i /> Trực tiếp</span></div>
      <ol className="admin-timeline">{activities.map(({ icon: Icon, text, meta, tone }) => <li key={text} className={`admin-activity-${tone}`}><span className="admin-timeline-icon"><Icon size={13} /></span><div><p>{text}</p><small>{meta}</small></div></li>)}</ol>
      <button className="admin-activity-link" disabled><span>Xem toàn bộ nhật ký hệ thống</span><ArrowRight size={15} /></button>
    </section>
  )
}
