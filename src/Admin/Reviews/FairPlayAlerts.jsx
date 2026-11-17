import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import { formatDelta } from './reviewsData.js'
import './fairPlayAlerts.css'

const date = value => (value ? new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN') : '—')

// Băng đỏ báo có ticket cảnh báo bạo lực mạng chờ xử lý. Truyền `to` (link) hoặc `onAction` (nút).
export function FairPlayAlertBanner({ count, to, onAction }) {
  if (!count) return null
  const action = <><span>Review ngay</span><ArrowRight size={14} /></>
  return (
    <div className="admin-alert admin-alert--danger fp-alert-banner" role="alert">
      <ShieldAlert size={18} />
      <p><strong>{count} ticket cảnh báo bạo lực mạng</strong> đang chờ xử lý: người chơi bị rớt hơn 10 điểm Fair Play trong 1 trận, điểm đang treo chưa trừ.</p>
      {to ? <Link className="fp-alert-action" to={to}>{action}</Link> : <button type="button" className="fp-alert-action" onClick={onAction}>{action}</button>}
    </div>
  )
}

// Bảng "Các Ticket Cảnh Báo Bạo Lực Mạng" (chỉ phiếu đang chờ). Bấm một dòng để mở hộp chi tiết xử lý.
export function FairPlayAlertTable({ alerts, loading, error, onOpen }) {
  return (
    <section id="fairplay-alerts" className="fp-alert-table" aria-busy={loading}>
      <header>
        <h2><ShieldAlert size={17} />Các Ticket Cảnh Báo Bạo Lực Mạng</h2>
        <span className="fp-alert-count">{loading ? '…' : `${alerts.length} chờ xử lý`}</span>
      </header>
      {error ? <p className="fp-alert-empty" role="alert">Không tải được ticket cảnh báo: {error}</p>
        : loading && !alerts.length ? <p className="fp-alert-empty">Đang tải ticket cảnh báo…</p>
          : !alerts.length ? <p className="fp-alert-empty">Không có ticket cảnh báo nào đang chờ xử lý.</p>
            : <div className="fp-alert-scroll"><table>
              <thead><tr>{['Mã ticket', 'Người bị xem xét', 'Điểm đang treo', 'Nội dung', 'Ngày tạo', ''].map(text => <th key={text}>{text}</th>)}</tr></thead>
              <tbody>{alerts.map(item => <tr key={item.uuid} onClick={() => onOpen(item)}>
                <td><strong>{item.id}</strong></td>
                <td>{item.entity}</td>
                <td><span className="fp-alert-delta">{formatDelta(item.pendingFairPlayDelta)} điểm</span></td>
                <td className="fp-alert-desc" title={item.description}>{item.description || '—'}</td>
                <td>{date(item.date)}</td>
                <td><button type="button" className="rr-button primary" onClick={event => { event.stopPropagation(); onOpen(item) }}>Review</button></td>
              </tr>)}</tbody>
            </table></div>}
    </section>
  )
}
