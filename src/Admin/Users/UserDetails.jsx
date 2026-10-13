import { X, UserRound, Activity, Wallet, History, TriangleAlert, Pencil, Ban, Check } from 'lucide-react'

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


const money = value => value == null ? "Chưa có thông tin" : `${value.toLocaleString('vi-VN')} ₫`

export function UserAvatar({ user }) {
  return <span className="users-avatar" aria-hidden="true">{user.name.split(' ').filter(Boolean).slice(-2).map(word => word[0]).join('')}</span>
}

export function AccountStatus({ status }) {
  return <span className={`users-status ${status.toLowerCase()}`}><i />{adminDisplayLabels[status] || status}</span>
}

export default function UserDetails({ user, onClose, onEdit, onSuspend }) {
  return (
    <aside className="users-details" aria-label={`Chi tiết người dùng ${user.name}`}>
      <header className="users-details-heading"><h2>Chi tiết người dùng <small>{user.id}</small></h2><button onClick={onClose} aria-label="Đóng chi tiết người dùng"><X size={18} /></button></header>
      <div className="users-details-body">
        <section className="users-profile">
          <div className="users-profile-main"><UserAvatar user={user} /><div><h3>{user.name}</h3><p>@{user.username} • {adminDisplayLabels[user.role] || user.role}</p><small>{user.phone || "Chưa có số điện thoại"}</small><small>{user.email}</small></div><AccountStatus status={user.status} /></div>
          <div className="users-profile-dates"><div><small>Ngày tham gia</small><strong>{user.joined.split('-').reverse().join('/')}</strong></div><div><small>Hoạt động gần nhất</small><strong>{user.lastActive || "Chưa có thông tin"}</strong></div></div>
        </section>
        <section><h3 className="users-section-title"><UserRound size={15} />Hồ sơ thể thao và kỹ năng</h3><div className="users-skill-grid">
          <div><small>Điểm DUPR</small><strong className="users-rating">{user.dupr || '—'}</strong><p>{user.dupr ? "Pickleball • Điểm mẫu" : "Chưa có thông tin"}</p></div>
          <div><small>Điểm Elo</small><strong>{user.elo?.toLocaleString('vi-VN') || '—'}</strong><p>{user.elo ? "Dữ liệu mẫu trong phiên" : "Chưa có thông tin"}</p></div>
          <div><small>Điểm tinh thần thể thao</small><strong className="users-rating">{user.fairplay == null ? '—' : `${user.fairplay}%`}</strong><p>{user.fairplay == null ? "Chưa có thông tin" : "Điểm tinh thần thể thao mẫu"}</p></div>
          <div><small>Môn thể thao yêu thích</small><strong className="users-sport-name">{user.sport || "Chưa có thông tin"}</strong><p>Thông tin hồ sơ mẫu</p></div>
        </div></section>
        <section><h3 className="users-section-title"><Activity size={15} />Tổng quan hoạt động trên nền tảng</h3><div className="users-activity-stats">{[["Lượt đặt sân", user.bookings], ["Trận tìm nhóm chơi", user.lfg], ["Giải đấu", user.tournaments], ["Đánh giá", user.reviews]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong><small>tổng số mẫu</small></div>)}</div></section>
        <section className="users-wallet"><h3 className="users-section-title"><Wallet size={15} />Ví SportNexus <small>Số dư mẫu</small></h3><div><span><small>Số dư ký quỹ</small><strong>{money(user.wallet)}</strong></span><span><small>Tổng chi tiêu</small><strong>{money(user.totalSpent)}</strong></span></div><p>Ví mẫu chỉ để xem. Không thực hiện giao dịch ví.</p></section>
        <section><h3 className="users-section-title"><History size={15} />Lịch sử hoạt động gần đây</h3>{user.activities.length ? <ol className="users-timeline">{user.activities.map(item => <li key={item.title}><i /><strong>{item.title}</strong><p>{item.text}</p><small>{item.time}</small></li>)}</ol> : <p className="users-unavailable">Chưa có bản ghi hoạt động trong bản mẫu.</p>}</section>
        <section className="users-governance"><h3><TriangleAlert size={15} />Quản lý tài khoản</h3><p>{user.status === 'Suspended' ? "Tài khoản mẫu này đã bị tạm khóa. Có thể khôi phục quyền truy cập bằng nút bên dưới." : `Tài khoản có ${user.disputes} tranh chấp mẫu${user.fairplay == null ? '' : ` và ${user.fairplay}% điểm tinh thần thể thao`}.`} Tạm khóa chỉ thay đổi trạng thái trong phiên. Không thay đổi ví hoặc đơn đặt sân.</p></section>
      </div>
      <footer className="users-details-actions"><button className={user.status === 'Suspended' ? 'users-button' : 'users-button users-danger'} onClick={onSuspend}>{user.status === 'Suspended' ? <Check size={15} /> : <Ban size={15} />}{user.status === 'Suspended' ? "Khôi phục người dùng" : "Tạm khóa"}</button><button className="users-button" onClick={onEdit}><Pencil size={15} />Chỉnh sửa người dùng</button></footer>
    </aside>
  )
}
