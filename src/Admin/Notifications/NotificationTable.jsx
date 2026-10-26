import { CalendarClock, Megaphone } from 'lucide-react'
import { broadcastAction, formatNumber, formatPercent, formatTime, targetLabels } from './notificationHelpers.js'
import { EmptyState, StatusBadge } from './NotificationUI.jsx'

const columns = ['Đợt thông báo', 'Đối tượng nhận', 'Trạng thái', 'Thời gian', 'Đã đọc', 'Thao tác']

export default function NotificationTable({ rows, loading, error, selectedId, onSelect, onAction }) {
  return <>
    <div className="nt-table-scroll"><table className="nt-table nt-table-broadcasts"><thead><tr>{columns.map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
      {rows.map(row => {
        const action = broadcastAction(row.status)
        return <tr key={row.id} className={selectedId === row.id ? 'selected' : ''} onClick={() => onSelect(row.id)}>
          <td><button className="nt-row-button" onClick={() => onSelect(row.id)} aria-label={`Xem đợt thông báo ${row.title}`}><span className="nt-table-icon">{row.status === 'SCHEDULED' ? <CalendarClock size={15} /> : <Megaphone size={15} />}</span><span><strong>{row.title}</strong><small className="nt-table-excerpt">{row.body}</small></span></button></td>
          <td><strong>{targetLabels[row.target] || row.target}</strong><small>{formatNumber(row.recipientCount || row.targetUserCount)} người nhận</small></td>
          <td><StatusBadge status={row.status} /></td>
          <td>{row.status === 'SCHEDULED' ? <><strong>{formatTime(row.scheduledAt)}</strong><small>Hẹn gửi</small></> : <><strong>{formatTime(row.sentAt || row.createdAt)}</strong><small>{row.status === 'RECALLED' ? `Thu hồi ${formatTime(row.recalledAt)}` : row.status === 'CANCELLED' ? 'Đã hủy trước khi gửi' : 'Đã gửi'}</small></>}</td>
          <td>{row.status === 'SENT' || row.status === 'RECALLED' ? <><strong>{formatNumber(row.readCount)}/{formatNumber(row.recipientCount)}</strong><small>{formatPercent(row.readRate)}</small></> : '—'}</td>
          <td><div className="nt-table-actions">{action && <button className="nt-button compact danger" onClick={event => { event.stopPropagation(); onAction(action, row) }}>{action === 'cancel' ? 'Hủy hẹn giờ' : 'Thu hồi'}</button>}</div></td>
        </tr>
      })}
    </tbody></table></div>
    {!loading && error && <EmptyState title="Không thể tải lịch sử thông báo" message={error} />}
    {!loading && !error && !rows.length && <EmptyState title="Chưa có đợt thông báo nào" message="Bấm “Tạo thông báo” để gửi đợt đầu tiên, hoặc đổi bộ lọc trạng thái." />}
    {loading && !rows.length && <EmptyState title="Đang tải…" message="Lần tải đầu có thể mất 30–60 giây khi máy chủ khởi động." />}
  </>
}
