import { BarChart3, Megaphone } from 'lucide-react'
import { broadcastAction, formatNumber, formatPercent, formatTime, referenceTypes, targetLabels, typeLabels } from './notificationHelpers.js'
import { EmptyState, StatusBadge } from './NotificationUI.jsx'

export function BroadcastInspector({ broadcast, loading, error, onAction }) {
  if (!broadcast) return <aside className="nt-panel"><EmptyState title={loading ? 'Đang tải…' : 'Chưa chọn đợt thông báo'} message={error || 'Chọn một dòng trong bảng để xem chi tiết.'} /></aside>
  const action = broadcastAction(broadcast.status)
  return <aside className="nt-panel nt-inspector">
    <header className="nt-panel-header"><div><h2>Chi tiết đợt thông báo</h2><small>{broadcast.id}</small></div><StatusBadge status={broadcast.status} /></header>
    <section className="nt-content-preview"><div className="nt-preview-heading"><Megaphone size={17} /><strong>{broadcast.title}</strong></div><p>{broadcast.body}</p></section>
    <section className="nt-inspector-section"><h3>Phân phối</h3><dl className="nt-details">
      <dt>Đối tượng nhận</dt><dd>{targetLabels[broadcast.target] || broadcast.target}</dd>
      <dt>Số người nhận</dt><dd>{formatNumber(broadcast.recipientCount || broadcast.targetUserCount)}</dd>
      <dt>Đã đọc</dt><dd>{formatNumber(broadcast.readCount)} ({formatPercent(broadcast.readRate)})</dd>
      {broadcast.referenceType && <><dt>Liên kết tới</dt><dd>{referenceTypes[broadcast.referenceType] || broadcast.referenceType} · <code>{broadcast.referenceId}</code></dd></>}
    </dl></section>
    <section className="nt-inspector-section"><h3>Thời gian (UTC+7)</h3><dl className="nt-details">
      <dt>Tạo lúc</dt><dd>{formatTime(broadcast.createdAt)}</dd>
      {broadcast.scheduledAt && <><dt>Hẹn gửi</dt><dd>{formatTime(broadcast.scheduledAt)}</dd></>}
      {broadcast.sentAt && <><dt>Đã gửi</dt><dd>{formatTime(broadcast.sentAt)}</dd></>}
      {broadcast.recalledAt && <><dt>Thu hồi</dt><dd>{formatTime(broadcast.recalledAt)}</dd></>}
      <dt>Người tạo</dt><dd>{broadcast.createdByName}</dd>
    </dl></section>
    {action && <div className="nt-inspector-actions"><button className="nt-button danger" onClick={() => onAction(action, broadcast)}>{action === 'cancel' ? 'Hủy đợt hẹn giờ' : 'Thu hồi khỏi hộp thư người nhận'}</button></div>}
  </aside>
}

// Tỷ lệ đọc theo nhóm thông báo trong kỳ thống kê (byType).
export function TypeStats({ stats, loading, error }) {
  const rows = (stats?.byType || []).filter(item => item.total > 0)
  return <section className="nt-panel nt-inspector">
    <header className="nt-panel-header"><div><h2><BarChart3 size={16} /> Tỷ lệ đọc theo nhóm</h2><small>{stats ? `${stats.days} ngày gần nhất` : ' '}</small></div></header>
    {loading ? <p className="nt-muted">Đang tải thống kê…</p> : error ? <p className="nt-error">{error}</p> : !rows.length ? <p className="nt-muted">Chưa có thông báo nào trong kỳ này.</p> :
      <dl className="nt-details">{rows.map(item => <div className="nt-detail-row" key={item.type}><dt>{typeLabels[item.type] || item.type}</dt><dd>{formatNumber(item.read)}/{formatNumber(item.total)} · {formatPercent(item.readRate)}</dd></div>)}</dl>}
  </section>
}
