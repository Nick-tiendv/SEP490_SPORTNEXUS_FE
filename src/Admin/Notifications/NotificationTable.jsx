import { Bell, CalendarClock, Eye, Power } from 'lucide-react'
import { formatTime } from './notificationHelpers.js'
import { EmptyState, NotificationBadge } from './NotificationUI.jsx'

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


const columns = {
  history: ["Nội dung thông báo", "Loại", "Người nhận", "Trạng thái", "Thời gian gửi"],
  triggers: ["Tên sự kiện kích hoạt", "Mã sự kiện", "Danh mục", "Kênh gửi", "Trạng thái", "Kích hoạt lần cuối", "Thao tác"],
  broadcasts: ["Tiêu đề thông báo hàng loạt", "Đối tượng nhận", "Kênh gửi", "Thời gian đã lên lịch", "Trạng thái", "Thao tác"],
}

export default function NotificationTable({ tab, rows, selectedId, onSelect, onToggle, onBroadcastAction }) {
  return <><div className="nt-table-scroll"><table className={`nt-table nt-table-${tab}`}><thead><tr>{columns[tab].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
    {rows.map(record => <tr key={record.id} className={selectedId === record.id ? 'selected' : ''} onClick={() => onSelect(record.id)}>
      {tab === 'history' ? <>
        <td><button className="nt-row-button" onClick={() => onSelect(record.id)} aria-label={`Xem thông báo ${record.id}`}><span className={`nt-table-icon ${record.status === 'Failed' ? 'failed' : ''}`}><Bell size={15} /></span><span><strong>{record.title}</strong><small className="nt-table-excerpt">{record.message}</small></span></button></td>
        <td><NotificationBadge value={record.type} /></td><td><strong>{record.recipient.name}</strong><small>{adminDisplayLabels[record.recipient.role] || record.recipient.role}</small></td><td><NotificationBadge value={record.status} /></td><td><time dateTime={record.sentAt}>{formatTime(record.sentAt)}</time></td>
      </> : tab === 'triggers' ? <>
        <td><button className="nt-row-button" onClick={() => onSelect(record.id)}><strong>{record.name}</strong></button></td><td><code>{record.eventKey}</code></td><td><NotificationBadge value={record.category} /></td><td>{record.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}</td><td><NotificationBadge value={record.status} /></td><td>{formatTime(record.lastTriggered)}</td><td><div className="nt-table-actions"><button className="nt-button compact" aria-label={`Xem chi tiết và mẫu thông báo ${record.name}`} onClick={() => onSelect(record.id)}><Eye size={14} />Xem chi tiết / Xem trước</button><button className="nt-button compact" onClick={event => { event.stopPropagation(); onToggle(record) }}><Power size={13} />{record.status === 'Active' ? "Tắt" : "Bật"}</button></div></td>
      </> : <>
        <td><button className="nt-row-button" onClick={() => onSelect(record.id)}><CalendarClock size={15} /><strong>{record.title}</strong></button></td><td>{adminDisplayLabels[record.audience] || record.audience}</td><td>{record.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}</td><td>{formatTime(record.scheduleAt)}</td><td><NotificationBadge value={record.status} /></td><td><div className="nt-table-actions"><button className="nt-button compact" onClick={() => onSelect(record.id)}>Xem chi tiết</button>{['Draft', 'Scheduled'].includes(record.status) && <button className="nt-button compact" onClick={event => { event.stopPropagation(); onBroadcastAction('edit', record) }}>{record.status === 'Draft' ? "Chỉnh sửa bản nháp" : "Chỉnh sửa lịch gửi"}</button>}<button className="nt-button compact" onClick={event => { event.stopPropagation(); onBroadcastAction('duplicate', record) }}>Nhân bản</button>{['Draft', 'Scheduled'].includes(record.status) && <button className="nt-button compact danger" onClick={event => { event.stopPropagation(); onBroadcastAction(record.status === 'Draft' ? 'delete' : 'cancel', record) }}>{record.status === 'Draft' ? "Xóa" : "Hủy"}</button>}</div></td>
      </>}
    </tr>)}
  </tbody></table></div>{!rows.length && <EmptyState />}</>
}
