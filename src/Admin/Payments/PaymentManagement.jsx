import { useState } from 'react'
import { Banknote, CheckCircle2, Clock3, CircleX, RotateCcw, Download, ListFilter, ShieldCheck, ChevronRight, AlertTriangle, Search, X } from 'lucide-react'
import PaymentOverviewChart from './PaymentOverviewChart.jsx'
import TransactionBreakdown from './TransactionBreakdown.jsx'
import TransactionTable from './TransactionTable.jsx'
import TransactionDetails from './TransactionDetails.jsx'
import PaymentDialogs from './PaymentDialogs.jsx'
import { initialTransactions, paymentStats, statusLabels, typeLabels, methodLabels, normalize, parseDate, number, exportTransactions } from './paymentData.js'
import '../Users/users.css'
import './payment.css'

const emptyFilters = { search: '', status: '', type: '', method: '', from: '', to: '', issues: false }
const icons = { volume: Banknote, successful: CheckCircle2, pending: Clock3, failed: CircleX, refunded: RotateCcw }

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [filters, setFilters] = useState(emptyFilters)
  const [detailId, setDetailId] = useState(initialTransactions[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const from = parseDate(filters.from), to = parseDate(filters.to)
  const invalidDate = (filters.from && !from) || (filters.to && !to)
  const invalidRange = from && to && from > to
  const filtered = transactions.filter(t => !invalidDate && !invalidRange
    && normalize(`${t.id} ${t.booking?.id || ''} ${t.user.name}`).includes(normalize(filters.search.trim()))
    && (!filters.status || t.status === filters.status) && (!filters.type || t.type === filters.type) && (!filters.method || t.method === filters.method)
    && (!from || t.createdDate >= from) && (!to || t.createdDate <= to) && (!filters.issues || (t.issue && !t.issue.reviewed)))
  const issues = transactions.filter(t => t.issue && !t.issue.reviewed)
  const detail = transactions.find(t => t.id === detailId)
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const reviewIssues = () => { setFilters({ ...emptyFilters, issues: true }); setPage(1); if (issues[0]) setDetailId(issues[0].id) }
  const quick = () => {
    const active = filters.status === 'Successful' && filters.type === 'Split'
    setFilters(previous => ({ ...previous, status: active ? '' : 'Successful', type: active ? '' : 'Split' })); setPage(1)
  }
  const saveReview = values => {
    const id = dialog.transaction.id
    setTransactions(previous => previous.map(t => t.id === id ? { ...t, issue: { ...t.issue, ...values }, history: [...t.history, { id: `review-${t.history.length}`, text: `Ghi chú rà soát trong phiên mẫu: ${values.note}. Không thay đổi giao dịch hoặc xử lý tiền.` }] } : t))
    setDialog(null); setNotice('Đã lưu ghi chú rà soát trong bản mẫu. Không xác nhận đối soát và không lưu lên máy chủ.')
  }
  const chipLabels = { search: `Tìm: ${filters.search}`, status: statusLabels[filters.status], type: typeLabels[filters.type], method: methodLabels[filters.method], from: `Từ: ${filters.from}`, to: `Đến: ${filters.to}`, issues: 'Cần rà soát mẫu' }
  const open = type => setDialog({ type, transaction: detail })
  return <div className="payments-page"><header className="payments-page-heading"><div><h1>Quản lý thanh toán <span>Giao dịch minh họa</span></h1><p>Theo dõi giao dịch, chia tiền và các thông tin ký quỹ trên SportNexus.</p></div><div><button className="users-button" onClick={() => { exportTransactions(filtered); setNotice(`Đã xuất ${number(filtered.length)} giao dịch đang được lọc ra CSV minh họa.`) }}><Download size={13} />Xuất CSV</button><button className="users-button" onClick={quick} aria-pressed={filters.status === 'Successful' && filters.type === 'Split'}><ListFilter size={13} />Bộ lọc nhanh</button></div></header>
    <section className="payments-security"><ShieldCheck size={21} /><div><strong>Thông tin bảo vệ ký quỹ</strong><p>Minh họa theo dõi khoản đóng góp theo nhóm. Quản trị viên chỉ xem và ghi chú; không xử lý tiền tại đây.</p></div><button onClick={() => setDialog({ type: 'security' })}>Xem chi tiết <ChevronRight size={14} /></button></section>
    <div className="payments-kpis">{paymentStats.map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{number(stat.value)}{stat.currency && <span>đ</span>}</strong><p>{stat.note}</p></article> })}</div><p className="payments-demo-label">Chỉ số, biểu đồ và phân bổ là dữ liệu minh họa riêng, không tính từ {transactions.length} giao dịch mẫu. Không kết nối máy chủ; ghi chú sẽ mất khi tải lại trang.</p>
    <div className="payments-analytics"><PaymentOverviewChart /><TransactionBreakdown onType={type => change('type', type)} /></div>
    <section className="payments-warning"><AlertTriangle size={22} /><div><h2>{issues.length ? `${issues.length} giao dịch mẫu cần rà soát` : 'Không còn giao dịch mẫu chưa được xem'}</h2><ul>{issues.slice(0, 3).map(t => <li key={t.id}>#{t.id}: {t.issue.summary}</li>)}</ul><p>Trạng thái rà soát chỉ áp dụng trong phiên; chưa thực hiện đối soát thực tế.</p></div><button disabled={!issues.length} onClick={reviewIssues}>Xem giao dịch cần xử lý <ChevronRight size={14} /></button></section>
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <section className="payments-toolbar" aria-label="Tìm kiếm và bộ lọc giao dịch"><div className="payments-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm giao dịch" placeholder="Tìm mã giao dịch, mã đặt sân, người chơi…" value={filters.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Loại giao dịch<select value={filters.type} onChange={event => change('type', event.target.value)}><option value="">Tất cả loại</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Phương thức<select value={filters.method} onChange={event => change('method', event.target.value)}><option value="">Tất cả phương thức</option>{Object.entries(methodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div className="payments-filter-row">{[['from', 'Từ ngày'], ['to', 'Đến ngày']].map(([key, label]) => <label key={key}>{label}<input placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} value={filters[key]} onChange={event => change(key, event.target.value)} aria-describedby={invalidDate || invalidRange ? 'payments-filter-error' : undefined} /></label>)}<button className="payments-text-button" onClick={reset}>Đặt lại</button></div>
      {(invalidDate || invalidRange) && <p id="payments-filter-error" role="alert" className="users-form-error">{invalidDate ? 'Nhập ngày hợp lệ theo định dạng ngày/tháng/năm.' : 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.'}</p>}
      <div className="payments-filter-chips" aria-label="Bộ lọc đang áp dụng">{Object.entries(filters).filter(([, value]) => Boolean(value)).map(([key]) => <button key={key} onClick={() => change(key, key === 'issues' ? false : '')} aria-label={`Bỏ bộ lọc ${chipLabels[key]}`}>{chipLabels[key]}<X size={11} /></button>)}</div>
    </section>
    <div className={`payments-content-grid ${detail ? 'with-details' : ''}`}><TransactionTable transactions={filtered} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />{detail && <TransactionDetails transaction={detail} onClose={() => setDetailId(null)} onEscrow={() => open('escrow')} onRefund={() => open('refund')} onReview={() => open('review')} onUser={() => open('user')} onBooking={() => open('booking')} />}</div>
    {dialog && <PaymentDialogs dialog={dialog} onClose={() => setDialog(null)} onSaveReview={saveReview} />}
  </div>
}
