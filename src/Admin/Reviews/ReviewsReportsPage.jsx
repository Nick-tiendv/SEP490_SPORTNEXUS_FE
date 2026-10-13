import { useState } from 'react'
import { Download, ShieldCheck, MessageSquare, Star, Handshake, TriangleAlert, CheckCircle2, Search, ArrowRight, Building2, UserRound, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '../components/StatCard.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import '../Users/users.css'
import './reviews.css'
import { initialReviews, initialReports, emptyFilters, filterRecords, getSummary, isActiveReport, updateReview, updateReport, toCsv } from './reviewsData.js'

const adminDisplayLabels = {
  "Player": "Người chơi",
  "Active": "Đang hoạt động",
  "Facility": "Cơ sở thể thao",
  "Fair-play": "Tinh thần thể thao",
  "Review": "Đánh giá",
  "Report": "Báo cáo",
  "Other": "Khác",
  "Booking": "Đặt sân",
  "Payment": "Thanh toán",
  "Tournament": "Giải đấu",
  "Published": "Đã đăng",
  "Flagged": "Bị gắn cờ",
  "Hidden": "Đã ẩn",
  "Open": "Đang mở",
  "In Review": "Đang xem xét",
  "Resolved": "Đã giải quyết",
  "Dismissed": "Đã bỏ qua",
  "Verified": "Đã xác minh",
  "High": "Cao",
  "Medium": "Trung bình",
  "Low": "Thấp",
  "All": "Tất cả",
  "Reviews": "Đánh giá",
  "Ratings": "Điểm đánh giá",
  "Statuses": "Trạng thái",
  "Priorities": "Mức ưu tiên",
  "Categories": "Danh mục"
}


const number = value => value.toLocaleString('vi-VN')
const date = value => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN')
function Badge({ value }) { return <span className={`rr-badge rr-${value.toLowerCase().replaceAll(' ', '-')}`}>{adminDisplayLabels[value] || value}</span> }
function Person({ name, username }) { return <div className="rr-person"><span className="rr-avatar">{name.split(' ').slice(-2).map(n => n[0]).join('')}</span><span><strong>{name}</strong>{username && <small>@{username}</small>}</span></div> }
function ActionDialog({ action, onClose, onConfirm }) {
  const [note, setNote] = useState('')
  const titles = { hide: 'Ẩn đánh giá', resolve: 'Xử lý báo cáo', dismiss: 'Bỏ qua báo cáo', inReview: 'Bắt đầu rà soát' }
  if (action === 'rules') return <DemoDialog title="Hướng dẫn kiểm duyệt — Bản mẫu" onClose={onClose}><div className="rr-guidelines"><p>Hướng dẫn minh họa, chưa phải chính sách chính thức của SportNexus.</p><ol><li>Đối chiếu nội dung đánh giá với bằng chứng và thông tin của các bên.</li><li>Ưu tiên báo cáo có hành vi quấy rối, đe dọa hoặc tiết lộ thông tin cá nhân.</li><li>Giữ đánh giá mang tính góp ý. Chỉ ẩn nội dung vi phạm sau khi ghi rõ lý do.</li><li>Ghi chú quyết định; xử lý hoặc bỏ qua từng báo cáo dựa trên kết quả xác minh.</li></ol><button className="rr-button" onClick={onClose}>Đóng hướng dẫn</button></div></DemoDialog>
  return <DemoDialog title={titles[action]} onClose={onClose}><form className="rr-action-form" onSubmit={event => { event.preventDefault(); onConfirm(note.trim()) }}><p>{action === 'hide' ? 'Đánh giá sẽ được chuyển sang trạng thái Đã ẩn. Vui lòng ghi rõ lý do.' : action === 'dismiss' ? 'Đóng báo cáo mà không thay đổi trạng thái đánh giá liên quan?' : 'Xác nhận cập nhật trạng thái báo cáo trong phiên dữ liệu mẫu.'}</p><label>{action === 'hide' ? 'Lý do ẩn (bắt buộc)' : 'Ghi chú quản trị'}<input autoFocus value={note} onChange={e => setNote(e.target.value)} required={action === 'hide'} pattern={action === 'hide' ? '.*[^ ].*' : undefined} maxLength={1000} placeholder="Nhập nội dung xác minh hoặc quyết định..." /></label><footer><button type="button" className="rr-button" onClick={onClose}>Hủy</button><button className={`rr-button ${action === 'hide' ? 'danger' : 'primary'}`}>Xác nhận</button></footer></form></DemoDialog>
}

function ReportInformation({ report }) {
  return <section className="rr-report-card"><div className="rr-card-title"><strong><TriangleAlert size={14} /> Báo cáo {report.id}</strong><Badge value={report.priority} /></div><dl><dt>Người báo cáo</dt><dd>{report.reporter}</dd><dt>Đối tượng</dt><dd>{report.entity}</dd><dt>Danh mục</dt><dd>{adminDisplayLabels[report.category] || report.category}</dd><dt>Lý do</dt><dd>{report.reason}</dd><dt>Trạng thái</dt><dd><Badge value={report.status} /></dd><dt>Ngày gửi</dt><dd>{date(report.date)}</dd></dl><p>{report.description}</p><div className="rr-note"><small>Ghi chú bởi quản trị viên</small><p>{report.notes || 'Chưa có ghi chú. Thêm ghi chú khi xử lý báo cáo.'}</p></div></section>
}

function Inspector({ tab, review, report, related, onAction, onKeep }) {
  const item = tab === 'reviews' ? review : report
  if (!item) return <aside className="rr-inspector rr-empty"><MessageSquare size={30} /><h2>Chưa chọn nội dung</h2><p>Chọn một dòng để xem thông tin chi tiết.</p></aside>
  const actionable = (tab === 'reviews' ? related : [report]).filter(isActiveReport)
  return <aside className="rr-inspector"><header><div><h2><MessageSquare size={17} /> {tab === 'reviews' ? "Đánh giá" : "Báo cáo"} chi tiết</h2><small>{item.id}</small></div><Badge value={item.status} /></header>
    {tab === 'reviews' ? <>
      {review.status === 'Flagged' && <div className="rr-warning"><TriangleAlert size={16} /><span>Đánh giá bị gắn cờ · {related.length} báo cáo<br />{related[0]?.reason || 'Nội dung cần được kiểm tra'}{related[0] && <><br />Ưu tiên: {adminDisplayLabels[related[0].priority] || related[0].priority}</>}</span></div>}
      <section className="rr-reviewer"><div className="rr-card-title"><small>NGƯỜI ĐÁNH GIÁ</small>{review.verified && <Badge value="Verified" />}</div><Person name={review.name} username={review.username} /><small>Người chơi • Thành viên cộng đồng SportNexus</small></section>
      <section className="rr-target"><small>{review.type === 'Facility' ? 'CƠ SỞ ĐƯỢC ĐÁNH GIÁ' : 'NGƯỜI CHƠI ĐƯỢC ĐÁNH GIÁ'}</small><div>{review.type === 'Facility' ? <Building2 size={24} /> : <UserRound size={24} />}<span><strong>{review.target}</strong><small>{review.targetInfo}</small></span></div></section>
      <div className="rr-rating"><span aria-label={`${review.rating} trên 5 sao`}>★★★★★</span><strong>{review.rating.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <small>/ 5,0</small></strong><small>{date(review.date)}</small></div><blockquote>“{review.content}”</blockquote>
      {review.notes && <div className="rr-note"><small>Lý do / ghi chú kiểm duyệt</small><p>{review.notes}</p></div>}
      {related.map(r => <ReportInformation key={r.id} report={r} />)}
    </> : <><ReportInformation report={report} />{review && <section className="rr-linked"><small>ĐÁNH GIÁ LIÊN QUAN · {review.id}</small><Person name={review.name} username={review.username} /><p>{review.content}</p><Badge value={review.status} /></section>}<section className="rr-history"><h3>Lịch sử xử lý</h3>{report.history.map((entry, i) => <p key={`${entry.time}-${i}`}><span>{entry.time}</span>{entry.text}</p>)}</section></>}
    <div className="rr-demo-note"><ShieldCheck size={15} /> Dữ liệu mẫu, thay đổi chỉ lưu trong phiên hiện tại và đặt lại khi tải trang.</div>
    <div className="rr-actions">{tab === 'reviews' && <><button className="rr-button mint" disabled={review.status === 'Published'} onClick={onKeep}><CheckCircle2 size={14} />Giữ đánh giá</button><button className="rr-button danger" disabled={review.status === 'Hidden'} onClick={() => onAction('hide')}><ShieldCheck size={14} />Ẩn đánh giá</button></>}{tab === 'reports' && <button className="rr-button mint" disabled={report.status !== 'Open'} onClick={() => onAction('inReview', report.id)}>Đánh dấu đang xem xét</button>}{actionable.length > 0 && <><button className="rr-button primary" onClick={() => onAction('resolve', actionable[0].id)}>Giải quyết báo cáo</button><button className="rr-button" onClick={() => onAction('dismiss', actionable[0].id)}>Bỏ qua báo cáo</button></>}</div>
  </aside>
}

export default function ReviewsReportsPage() {
  const [reviews, setReviews] = useState(() => initialReviews)
  const [reports, setReports] = useState(() => initialReports)
  const [tab, setTab] = useState('reviews')
  const [filters, setFilters] = useState({ ...emptyFilters })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(initialReviews[0].id)
  const [dialog, setDialog] = useState(null)
  const [exporting, setExporting] = useState(false)
  const summary = getSummary(reviews, reports)
  const invalidRange = filters.from && filters.to && filters.from > filters.to
  const filtered = invalidRange ? [] : filterRecords(tab === 'reviews' ? reviews : reports, filters, tab)
  const pages = Math.max(1, Math.ceil(filtered.length / 10)), currentPage = Math.min(page, pages)
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  const selectedItem = filtered.find(r => r.id === selected) || rows[0]
  const report = tab === 'reports' ? selectedItem : null
  const review = tab === 'reviews' ? selectedItem : reviews.find(r => r.id === report?.reviewId)
  const related = reports.filter(r => r.reviewId === review?.id)
  const change = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1) }
  const switchTab = next => { setTab(next); setFilters({ ...emptyFilters }); setPage(1); setSelected(null) }
  const priority = () => { setTab('reports'); setFilters({ ...emptyFilters, priority: 'High', status: 'Active' }); setPage(1); setSelected(reports.find(r => r.priority === 'High' && isActiveReport(r))?.id) }
  const openAction = (action, reportId) => setDialog({ action, reportId, reviewId: review?.id })
  const confirm = note => {
    if (dialog.action === 'hide') setReviews(data => updateReview(data, dialog.reviewId, 'Hidden', note))
    else setReports(data => updateReport(data, dialog.reportId, { resolve: 'Resolved', dismiss: 'Dismissed', inReview: 'In Review' }[dialog.action], note))
    setDialog(null); toast.success('Đã cập nhật dữ liệu mẫu.')
  }
  const exportCsv = async () => {
    setExporting(true)
    try { const blob = new Blob([toCsv(filtered, tab)], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sportnexus-${tab}-demo.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast.success(`Đã xuất ${filtered.length} dòng dữ liệu mẫu.`) } catch { toast.error('Không thể xuất CSV. Vui lòng thử lại.') } finally { setExporting(false) }
  }
  const selectFilter = (key, label, options) => <label>{label}<select value={filters[key]} onChange={e => change(key, e.target.value)}><option value="">Tất cả {label.toLowerCase()}</option>{options.map(value => <option key={value} value={value}>{key === 'rating' ? `${value} sao` : adminDisplayLabels[value] || value}</option>)}</select></label>
  return <div className="rr-page"><div className="rr-page-heading"><div><div className="rr-title"><h1>Đánh giá & Báo cáo</h1><span className="rr-badge rr-verified">{number(summary.total)} Đánh giá &amp; {summary.reports} Báo cáo</span></div><p>Theo dõi đánh giá, phản hồi của người chơi và hoạt động bị báo cáo trên SportNexus.</p></div><div className="rr-header-actions"><button className="rr-button" onClick={exportCsv} disabled={exporting || invalidRange || !filtered.length}><Download size={14} />{exporting ? "Đang xuất…" : "Xuất CSV"}</button><button className="rr-button primary" onClick={() => openAction('rules')}><ShieldCheck size={14} />Hướng dẫn kiểm duyệt</button></div></div>
    <div className="rr-tabs" role="tablist" aria-label="Đánh giá và báo cáo">{[['reviews', "Đánh giá & Phản hồi", number(summary.total)], ['reports', "Báo cáo vi phạm", `${summary.open} chưa xử lý`]].map(([key, label, count]) => <button key={key} id={`rr-tab-${key}`} role="tab" aria-selected={tab === key} aria-controls="rr-content" className={tab === key ? 'active' : ''} onClick={() => switchTab(key)}>{label}<span>{count}</span></button>)}<small>Dữ liệu mẫu · Tháng 10/2026</small></div>
    <div className="rr-stats">{[
      ["Tổng đánh giá", number(summary.total), MessageSquare, '+16,8% so với tháng trước'], ["Điểm cơ sở trung bình", `${summary.average.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5,0`, Building2, 'Dựa trên toàn bộ đánh giá sân'], ["Điểm tinh thần thể thao", `${summary.positive.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, Handshake, 'Tỷ lệ đánh giá tích cực (≥ 4 sao)'], ["Báo cáo chưa xử lý", summary.open, TriangleAlert, `${summary.today} báo cáo mới trong ngày mẫu`], ["Báo cáo đã giải quyết / đóng", summary.resolved, CheckCircle2, `Tỷ lệ đóng: ${(summary.resolved / (summary.reports || 1) * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`],
    ].map(([label, value, icon, trend]) => <StatCard key={label} label={label} value={value} icon={icon} trend={trend} />)}</div>
    <div className="rr-priority"><TriangleAlert size={20} /><p><strong>{summary.open} Báo cáo đang mở</strong> · <b>{summary.high} Báo cáo ưu tiên cao </b> · {summary.flagged} Đánh giá bị gắn cờ </p><button className="rr-button" onClick={priority} disabled={!summary.high}>Xử lý ưu tiên ngay <ArrowRight size={14} /></button></div>
    <div className="rr-content" id="rr-content" role="tabpanel" aria-labelledby={`rr-tab-${tab}`}><section className="rr-list"><div className="rr-toolbar"><label className="rr-search"><Search size={16} /><input aria-label="Tìm kiếm" placeholder={tab === 'reviews' ? "Tìm người chơi, cơ sở, đánh giá..." : "Tìm ID báo cáo, người báo cáo, người bị báo cáo..."} value={filters.search} onChange={e => change('search', e.target.value)} /></label><details className="rr-filter-details" open><summary>Bộ lọc tìm kiếm</summary><div className="rr-filters">{tab === 'reviews' ? <>{selectFilter('type', "Đánh giá", ['Facility', 'Fair-play'])}{selectFilter('rating', "Điểm đánh giá", ['5', '4', '3', '2', '1'])}{selectFilter('status', "Trạng thái", ['Published', 'Flagged', 'Hidden'])}</> : <>{selectFilter('priority', "Mức ưu tiên", ['High', 'Medium', 'Low'])}{selectFilter('status', "Trạng thái", ['Active', 'Open', 'In Review', 'Resolved', 'Dismissed'])}{selectFilter('category', "Danh mục", ['Review', 'Player', 'Facility', 'Other'])}</>}{[['from', 'Từ ngày'], ['to', 'Đến ngày']].map(([key, label]) => <label key={key}>{label}<input type="date" value={filters[key]} onChange={e => change(key, e.target.value)} /></label>)}<button className="rr-reset" onClick={() => { setFilters({ ...emptyFilters }); setPage(1) }}>Đặt lại bộ lọc</button></div></details>{invalidRange && <p role="alert" className="rr-error">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}</div>
      <div className="rr-table-scroll"><table><thead><tr>{(tab === 'reviews' ? ['Người đánh giá', 'Loại', 'Đối tượng', 'Đánh giá', 'Nhận xét gần nhất', 'Trạng thái'] : ["ID báo cáo", "Người báo cáo", "Đối tượng bị báo cáo", "Danh mục", "Lý do", "Mức ưu tiên", "Trạng thái", "Ngày tạo"]).map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(item => <tr key={item.id} className={selectedItem?.id === item.id ? 'selected' : ''} onClick={() => setSelected(item.id)}>{tab === 'reviews' ? <><td><button className="rr-row-button" aria-label={`Xem ${item.id}`} onClick={() => setSelected(item.id)}><Person name={item.name} username={item.username} /></button></td><td><Badge value={item.type} /></td><td>{item.target}</td><td><span className={`rr-table-rating ${item.rating < 3 ? 'low' : ''}`}><Star size={12} fill="currentColor" />{item.rating.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span><small>{date(item.date)}</small></td><td className="rr-excerpt" title={item.content}>{item.content}</td><td><Badge value={item.status} /></td></> : <><td><button className="rr-row-button" onClick={() => setSelected(item.id)}>{item.id}</button></td><td>{item.reporter}</td><td>{item.entity}</td><td><Badge value={item.category} /></td><td className="rr-excerpt" title={item.reason}>{item.reason}</td><td><Badge value={item.priority} /></td><td><Badge value={item.status} /></td><td>{date(item.date)}</td></>}</tr>)}</tbody></table></div>
      {!rows.length && <div className="rr-empty"><Search size={28} /><h3>Không tìm thấy dữ liệu</h3><p>Thử thay đổi từ khóa hoặc đặt lại bộ lọc.</p></div>}
      <footer className="rr-pagination"><span>Hiển thị {filtered.length ? (currentPage - 1) * 10 + 1 : 0}–{Math.min(currentPage * 10, filtered.length)} trên {number(filtered.length)} kết quả</span><div><button className="rr-button" aria-label="Trang trước" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button><span>{currentPage} / {pages}</span><button className="rr-button" aria-label="Trang sau" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button></div></footer>
    </section><Inspector tab={tab} review={review} report={report} related={related} onAction={openAction} onKeep={() => { setReviews(data => updateReview(data, review.id, 'Published')); toast.success('Đã giữ đánh giá ở trạng thái Đã đăng trong dữ liệu mẫu.') }} /></div>
    {dialog && <ActionDialog action={dialog.action} onClose={() => setDialog(null)} onConfirm={confirm} />}
  </div>
}
