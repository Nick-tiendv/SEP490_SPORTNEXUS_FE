import { X, Building2, ShieldCheck, ExternalLink, Pencil, Ban, Check } from 'lucide-react'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'

const adminDisplayLabels = {
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Suspended": "Đã tạm khóa",
  "Verified": "Đã xác minh",
  "Pending": "Đang chờ xử lý",
  "Rejected": "Đã từ chối",
  "Unverified": "Chưa xác minh",
  "All": "Tất cả"
}


export function VerificationBadge({ status }) {
  return <span className={`owners-verification ${status.toLowerCase()}`}>{status === 'Verified' && <ShieldCheck size={11} />}{adminDisplayLabels[status] || status}</span>
}

export default function CourtOwnerDetails({ owner, onClose, onEdit, onReview, onSuspend, onFacility }) {
  const courts = owner.facilities.reduce((sum, facility) => sum + facility.courts, 0)
  return <aside className="owners-details" aria-label={`Chi tiết chủ sân ${owner.name}`}>
    <header className="owners-details-heading"><h2><Building2 size={17} />Chi tiết chủ sân <small>#{owner.id}</small></h2><button onClick={onClose} aria-label="Đóng chi tiết chủ sân"><X size={16} /></button></header>
    <div className="owners-details-body">
      <section className="owners-profile"><UserAvatar user={owner} /><div><h3>{owner.name} <span className="owners-pro-badge">Chủ sân</span></h3><p>@{owner.username} • ID #{owner.id}</p><div className="owners-profile-status"><VerificationBadge status={owner.verification} /><AccountStatus status={owner.status} /></div><small>Tham gia từ {owner.joined.split('-').reverse().join('/')}</small><small>{owner.email}</small><small>{owner.phone || "Chưa có số điện thoại"}</small></div></section>
      <section className="owners-kyc"><dl><div><dt>Đơn vị pháp nhân</dt><dd>{owner.legalName || "Chưa có thông tin"}</dd></div><div><dt>Mã số thuế / GPKD</dt><dd>{owner.registration || "Chưa có thông tin"}</dd></div><div><dt>Xác minh</dt><dd><VerificationBadge status={owner.verification} /></dd></div><div><dt>Điểm tín nhiệm ký quỹ</dt><dd className="owners-trust">{owner.trust == null ? "Chưa đánh giá" : `${owner.trust}% (Điểm mẫu)`}</dd></div></dl><small>Thông tin KYC mẫu • Không phải giấy đăng ký thực tế</small></section>
      <section><h3 className="owners-section-label">Hiệu quả kinh doanh</h3><div className="owners-performance">{[["Cơ sở", owner.facilities.length], ["Tổng số sân", courts], ["Lượt đặt sân tháng này", owner.monthlyBookings.toLocaleString('vi-VN')], ["Tổng giá trị giao dịch tháng", `${(owner.monthlyGmv / 1000000).toLocaleString('vi-VN')} triệu ₫`]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div></section>
      <section><div className="owners-facilities-heading"><h3 className="owners-section-label">Cơ sở trực thuộc ({owner.facilities.length})</h3><small>Cơ sở mẫu</small></div><div className="owners-facilities">{owner.facilities.map(facility => <article key={facility.id}><div><h4>{facility.name}</h4><AccountStatus status={facility.status} /></div><p>{facility.location} • {facility.courts} sân ({facility.sports})</p><footer><span>{facility.rating ? `★ ${facility.rating}` : "Chưa có điểm đánh giá"}</span><button onClick={() => onFacility(facility)}>Xem cơ sở <ExternalLink size={11} /></button></footer></article>)}{!owner.facilities.length && <p className="owners-empty-facilities">Chưa có cơ sở trực thuộc trong bản mẫu.</p>}</div></section>
    </div>
    <footer className="owners-details-actions"><button className={`users-button ${owner.status === 'Suspended' ? '' : 'users-danger'}`} onClick={onSuspend}>{owner.status === 'Suspended' ? <Check size={13} /> : <Ban size={13} />}{owner.status === 'Suspended' ? "Khôi phục hoạt động" : "Tạm khóa chủ sân"}</button><button className="users-button" onClick={onEdit}><Pencil size={13} />Chỉnh sửa chủ sân</button><button className="users-button primary" onClick={onReview}><ShieldCheck size={13} />{owner.verification === 'Verified' ? "Xem xét KYC" : "Xác minh / Xem xét"}</button></footer>
  </aside>
}
