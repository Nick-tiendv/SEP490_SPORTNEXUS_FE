import { ArrowRight, History } from 'lucide-react'

// BE chưa có API nhật ký hệ thống (audit log) cho admin.
export default function PlatformActivity() {
  return (
    <section className="admin-panel admin-activity">
      <div className="admin-panel-heading"><div><h2>Nhật ký hoạt động nền tảng</h2><p>Nhật ký hoạt động nền tảng mới nhất.</p></div></div>
      <div className="admin-empty-state"><History size={28} /><h3>Chưa có dữ liệu</h3><p>Hệ thống chưa cung cấp API nhật ký hoạt động.</p></div>
      <button className="admin-activity-link" disabled><span>Xem toàn bộ nhật ký hệ thống</span><ArrowRight size={15} /></button>
    </section>
  )
}
