import { Bell, CalendarDays, CheckCircle2, Circle, Mail, Megaphone, ShieldCheck, TriangleAlert } from 'lucide-react'
import { broadcastPreview } from './notificationData.js'
import { deliveryTimeline, formatNumber, formatTime } from './notificationHelpers.js'
import { EmptyState, NotificationBadge, RecipientAvatar } from './NotificationUI.jsx'

const adminDisplayLabels = {
  "Confirmed": "Đã xác nhận",
  "Completed": "Đã hoàn thành",
  "Recruiting": "Đang tìm người",
  "Announcement": "Thông báo chung",
  "Maintenance": "Bảo trì",
  "General": "Chung",
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Booking": "Đặt sân",
  "Payment": "Thanh toán",
  "Tournament": "Giải đấu",
  "System": "Hệ thống",
  "Broadcast": "Thông báo hàng loạt",
  "LFG": "Tìm nhóm chơi",
  "Registration": "Đăng ký",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Pending": "Đang chờ xử lý",
  "Read": "Đã đọc",
  "Delivered": "Đã giao",
  "Failed": "Thất bại",
  "Sent": "Đã gửi",
  "Sending": "Đang gửi",
  "Draft": "Bản nháp",
  "Scheduled": "Đã lên lịch",
  "Cancelled": "Đã hủy",
  "In-App": "Trong ứng dụng",
  "Push Notification": "Thông báo đẩy",
  "All Users": "Tất cả người dùng",
  "Players": "Người chơi",
  "Court Owners": "Chủ sân",
  "Admins": "Quản trị viên",
  "Selected Users": "Người dùng được chọn",
  "All": "Tất cả"
}


export function BroadcastPreview({ onCreate }) {
  return <section className="nt-broadcast-preview"><header><h2><Megaphone size={16} />Xem trước thông báo hàng loạt (mẫu giao diện)</h2><NotificationBadge value="Draft" /></header>
    <p className="nt-muted">Bản nháp minh họa cho thông báo hàng loạt trên SportNexus.</p>
    <div className="nt-broadcast-message"><strong>{broadcastPreview.title}</strong><p>{broadcastPreview.message}</p></div>
    <dl className="nt-details"><dt>Đối tượng nhận</dt><dd>{adminDisplayLabels[broadcastPreview.audience] || broadcastPreview.audience}</dd><dt>Kênh gửi</dt><dd>{broadcastPreview.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}</dd><dt>Ước tính minh họa</dt><dd>{formatNumber(broadcastPreview.estimatedRecipients)} người dùng</dd></dl>
    <button className="nt-button primary" onClick={() => onCreate(broadcastPreview)}>Tạo từ bản xem trước</button>
  </section>
}

export function NotificationInspector({ notification }) {
  if (!notification) return <aside className="nt-panel"><EmptyState title="Chưa chọn thông báo" message="Chọn một dòng lịch sử để xem chi tiết." /></aside>
  const timeline = deliveryTimeline(notification)
  return <aside className="nt-panel nt-inspector"><header className="nt-panel-header"><div><h2>Chi tiết thông báo</h2><small>{notification.id}</small></div><NotificationBadge value={notification.status} /></header>
    <section className="nt-content-preview"><div className="nt-preview-heading"><Bell size={17} /><strong>{notification.title}</strong></div><p>{notification.message}</p><div className="nt-inline-badges"><NotificationBadge value={notification.type} />{notification.subtype && <NotificationBadge value={notification.subtype} />}<small>Kênh gửi: {notification.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}</small></div><small>{formatTime(notification.sentAt)} (UTC+7)</small></section>
    <section className="nt-inspector-section"><h3>Thông tin người nhận</h3><div className="nt-recipient-card"><RecipientAvatar recipient={notification.recipient} /><dl className="nt-details"><dt>ID người nhận</dt><dd>{notification.recipient.id}</dd><dt>Email</dt><dd>{notification.recipient.email}</dd><dt>Vai trò</dt><dd>{adminDisplayLabels[notification.recipient.role] || notification.recipient.role}</dd><dt>Đã đọc</dt><dd>{notification.status === 'Read' ? 'Đã đọc' : notification.status === 'Failed' ? 'Không giao được' : 'Chưa đọc'}</dd></dl></div></section>
    <section className="nt-inspector-section"><h3>Đối tượng liên quan</h3>{notification.related ? <div className="nt-related-card"><strong><CalendarDays size={17} />{notification.related.label} #{notification.related.id}</strong><dl className="nt-details">{Object.entries(notification.related.details).map(([key, value]) => <div className="nt-detail-row" key={key}><dt>{key}</dt><dd>{key === 'Trạng thái' ? adminDisplayLabels[value] || value : value}</dd></div>)}</dl></div> : <p className="nt-no-related">Thông báo này không có thực thể liên kết.</p>}</section>
    <section className="nt-inspector-section"><h3>Tiến trình gửi thông báo</h3><ol className="nt-timeline">{timeline.map(entry => <li key={entry.title} className={`nt-timeline-${entry.tone}`}><span className="nt-timeline-icon">{entry.tone === 'danger' ? <TriangleAlert size={14} /> : entry.tone === 'success' ? <CheckCircle2 size={14} /> : <Circle size={14} />}</span><div><strong>{formatTime(entry.at).split(' ')[0]} · {entry.title}</strong><p>{entry.detail}</p></div></li>)}</ol></section>
    <div className="nt-demo-note"><ShieldCheck size={15} /><span>Dòng thời gian và thông tin phân phối là dữ liệu mẫu. Thông báo mới ở trạng thái Đã gửi chưa có xác nhận giao hoặc đọc.</span></div>
  </aside>
}

export function TriggerInspector({ trigger, onToggle }) {
  if (!trigger) return <aside className="nt-panel"><EmptyState title="Chưa chọn sự kiện kích hoạt" /></aside>
  return <aside className="nt-panel nt-inspector"><header className="nt-panel-header"><div><h2>Chi tiết sự kiện kích hoạt</h2><small>{trigger.id}</small></div><NotificationBadge value={trigger.status} /></header>
    <section className="nt-inspector-section"><h3>{trigger.name}</h3><p>{trigger.description}</p><dl className="nt-details"><dt>Mã sự kiện</dt><dd><code>{trigger.eventKey}</code></dd><dt>Danh mục</dt><dd>{adminDisplayLabels[trigger.category] || trigger.category}</dd><dt>Kênh gửi</dt><dd>{trigger.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}</dd><dt>Kích hoạt lần cuối</dt><dd>{formatTime(trigger.lastTriggered)}</dd><dt>Số lần kích hoạt hôm nay</dt><dd>{trigger.triggeredToday} (mẫu)</dd></dl></section>
    <section className="nt-content-preview"><h3><Mail size={16} /> Xem trước mẫu thông báo</h3><p>{trigger.template}</p><small>Biến thay thế được giữ nguyên trong mẫu thông báo.</small></section>
    <div className="nt-demo-note">Bật/tắt chỉ thay đổi cấu hình mẫu. Các sự kiện máy chủ hiện tại không bị tác động.</div>
    <button className={`nt-button ${trigger.status === 'Active' ? 'danger' : 'primary'}`} onClick={() => onToggle(trigger)}>{trigger.status === 'Active' ? "Tắt sự kiện kích hoạt" : "Bật sự kiện kích hoạt"}</button>
  </aside>
}

export function BroadcastInspector({ broadcast, onAction }) {
  if (!broadcast) return <aside className="nt-panel"><EmptyState title="Chưa chọn thông báo hàng loạt" /></aside>
  return <aside className="nt-panel nt-inspector"><header className="nt-panel-header"><div><h2>Chi tiết thông báo hàng loạt</h2><small>{broadcast.id}</small></div><NotificationBadge value={broadcast.status} /></header>
    <section className="nt-content-preview"><h3>{broadcast.title}</h3><p>{broadcast.message}</p><NotificationBadge value={broadcast.type} /></section>
    <dl className="nt-details"><dt>Đối tượng nhận</dt><dd>{adminDisplayLabels[broadcast.audience] || broadcast.audience}</dd><dt>Kênh gửi</dt><dd>{broadcast.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}</dd><dt>Thời gian gửi</dt><dd>{formatTime(broadcast.scheduleAt)} (UTC+7)</dd><dt>Ước tính mẫu</dt><dd>{formatNumber(broadcast.estimatedRecipients)} người nhận</dd>{broadcast.audience === 'Selected Users' && <><dt>ID người nhận</dt><dd>{broadcast.selectedUsers.join(', ')}</dd></>}</dl>
    <div className="nt-demo-note">Thông báo hàng loạt chỉ là dữ liệu mô phỏng. Trang không tự gửi theo thời gian; chưa có bộ lập lịch trên máy chủ.</div>
    <div className="nt-inspector-actions">{broadcast.status === 'Draft' && <><button className="nt-button primary" onClick={() => onAction('edit', broadcast)}>Chỉnh sửa bản nháp</button><button className="nt-button danger" onClick={() => onAction('delete', broadcast)}>Xóa bản nháp</button></>}{broadcast.status === 'Scheduled' && <><button className="nt-button primary" onClick={() => onAction('edit', broadcast)}>Chỉnh sửa lịch gửi</button><button className="nt-button danger" onClick={() => onAction('cancel', broadcast)}>Hủy lịch gửi</button></>}<button className="nt-button" onClick={() => onAction('duplicate', broadcast)}>Nhân bản thông báo hàng loạt</button></div>
  </aside>
}
