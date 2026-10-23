import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { formatNumber, statusLabels } from './notificationHelpers.js'

export function StatusBadge({ status }) {
  const meta = statusLabels[status] || { label: status || '—', tone: 'draft' }
  return <span className={`nt-badge nt-${meta.tone}`}><i />{meta.label}</span>
}

export function EmptyState({ title = 'Không tìm thấy dữ liệu', message = 'Thử đổi bộ lọc trạng thái.' }) {
  return <div className="nt-empty"><Search size={28} /><h3>{title}</h3><p>{message}</p></div>
}

// Phân trang phía server (page bắt đầu từ 1).
export function NotificationPagination({ total, page, pages, pageSize, loading, onPage, onPageSize }) {
  return <footer className="nt-pagination">
    <span>Hiển thị {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} / {formatNumber(total)} đợt thông báo</span>
    <div><label>Dòng/trang<select value={pageSize} onChange={event => onPageSize(Number(event.target.value))}>{[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
      <button className="nt-button compact" aria-label="Trang trước" disabled={loading || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button>
      <span>{page} / {pages}</span>
      <button className="nt-button compact" aria-label="Trang sau" disabled={loading || page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button>
    </div>
  </footer>
}
