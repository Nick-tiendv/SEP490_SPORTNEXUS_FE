import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import './fairPlayAlerts.css'

// Băng đỏ ở Tổng quan Admin: báo có ticket cảnh báo bạo lực mạng chờ xử lý, dẫn tới trang Đánh giá & Báo cáo.
export function FairPlayAlertBanner({ count, to }) {
  if (!count) return null
  return (
    <div className="admin-alert admin-alert--danger fp-alert-banner" role="alert">
      <ShieldAlert size={18} />
      <p><strong>{count} ticket cảnh báo bạo lực mạng</strong> đang chờ xử lý: người chơi bị rớt hơn 10 điểm Fair Play trong 1 trận, điểm đang treo chưa trừ.</p>
      <Link className="fp-alert-action" to={to}><span>Review ngay</span><ArrowRight size={14} /></Link>
    </div>
  )
}
