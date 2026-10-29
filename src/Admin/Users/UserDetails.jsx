import { useState } from 'react'
import { X, UserRound, Wallet, TriangleAlert, Ban, Check, Trash2 } from 'lucide-react'
import { roleLabel } from './usersData.js'

const adminDisplayLabels = {
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
const dateTime = value => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }) : 'Chưa có thông tin'
}

// Ảnh đại diện (avatarUrl) nếu có; lỗi tải ảnh hoặc không có ảnh → chữ viết tắt.
export function UserAvatar({ user }) {
  const [failedUrl, setFailedUrl] = useState('')
  const initials = String(user.name || '?').split(' ').filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase()
  if (user.avatarUrl && failedUrl !== user.avatarUrl) return <span className="users-avatar has-image" aria-hidden="true"><img src={user.avatarUrl} alt="" loading="lazy" onError={() => setFailedUrl(user.avatarUrl)} /></span>
  return <span className="users-avatar" aria-hidden="true">{initials}</span>
}

export function AccountStatus({ status }) {
  return <span className={`users-status ${status.toLowerCase()}`}><i />{adminDisplayLabels[status] || status}</span>
}

export default function UserDetails({ user, loading, error, isSelf, onClose, onSuspend, onDelete }) {
  return (
    <aside className="users-details" aria-label={`Chi tiết người dùng ${user.name}`} aria-busy={loading}>
      <header className="users-details-heading"><h2>Chi tiết người dùng <small title={user.id}>{user.id.slice(0, 8).toUpperCase()}</small></h2><button onClick={onClose} aria-label="Đóng chi tiết người dùng"><X size={18} /></button></header>
      <div className="users-details-body">
        {loading && <p className="users-unavailable">Đang tải chi tiết…</p>}
        {error && <p className="users-form-error" role="alert">Không tải được chi tiết: {error}</p>}
        <section className="users-profile">
          <div className="users-profile-main"><UserAvatar user={user} /><div><h3>{user.name}</h3><p>{user.username && `@${user.username} • `}{roleLabel(user.role)}</p><small>{user.phone || "Chưa có số điện thoại"}</small><small>{user.email || 'Chưa có email'}</small></div><AccountStatus status={user.status} /></div>
          <div className="users-profile-dates"><div><small>Ngày tham gia</small><strong>{user.joined ? user.joined.split('-').reverse().join('/') : 'Chưa có thông tin'}</strong></div><div><small>Cập nhật lần cuối</small><strong>{dateTime(user.modifiedAt)}</strong></div></div>
        </section>
        <section><h3 className="users-section-title"><UserRound size={15} />Hồ sơ thể thao</h3><div className="users-skill-grid">
          <div><small>Điểm tinh thần thể thao</small><strong className="users-rating">{user.fairplay == null ? '—' : user.fairplay.toLocaleString('vi-VN')}</strong><p>Fair-play score</p></div>
          <div><small>Vai trò</small><strong className="users-sport-name">{roleLabel(user.role)}</strong><p>Quyền truy cập trên nền tảng</p></div>
        </div></section>
        <section className="users-wallet"><h3 className="users-section-title"><Wallet size={15} />Ví SportNexus</h3><div><span><small>Số dư ví</small><strong>{money(user.wallet)}</strong></span></div></section>
        <section className="users-governance"><h3><TriangleAlert size={15} />Quản lý tài khoản</h3><p>{isSelf ? 'Đây là tài khoản bạn đang đăng nhập, không thể tạm khóa hoặc xóa.' : user.status === 'Suspended' ? 'Tài khoản đang bị tạm khóa. Người dùng không thể đăng nhập cho tới khi được khôi phục.' : 'Tạm khóa sẽ chặn người dùng đăng nhập. Xóa tài khoản không thể hoàn tác.'}</p></section>
      </div>
      <footer className="users-details-actions">
        <button className={user.status === 'Suspended' ? 'users-button' : 'users-button users-danger'} onClick={onSuspend} disabled={isSelf || loading}>{user.status === 'Suspended' ? <Check size={15} /> : <Ban size={15} />}{user.status === 'Suspended' ? "Khôi phục" : "Tạm khóa"}</button>
        <button className="users-button users-danger" onClick={onDelete} disabled={isSelf || loading} aria-label="Xóa tài khoản"><Trash2 size={15} />Xóa</button>
      </footer>
    </aside>
  )
}
