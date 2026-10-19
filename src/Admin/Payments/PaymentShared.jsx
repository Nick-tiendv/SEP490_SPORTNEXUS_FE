import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { badgeOf, number } from './paymentData.js'

export function PaymentStatus({ status, labels }) {
  return <span className="payments-status"><StatusBadge status={badgeOf(status)} label={labels[status] || status} /></span>
}

export function Pager({ label, page, pageSize, total, totalPages, loading, onPage, onPageSize }) {
  const pages = Math.max(1, totalPages)
  return <footer className="payments-pagination"><span>Trang {page} / {pages} · {number(total)} {label}</span>{onPageSize && <label>Số dòng mỗi trang<select value={pageSize} onChange={event => onPageSize(Number(event.target.value))}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label>}<nav aria-label={`Phân trang ${label}`}><button aria-label="Trang trước" disabled={loading || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={13} /></button><button aria-label="Trang sau" disabled={loading || page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={13} /></button></nav></footer>
}
