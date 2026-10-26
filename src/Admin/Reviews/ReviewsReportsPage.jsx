import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, ShieldCheck, MessageSquare, TriangleAlert, CheckCircle2, Search, ArrowRight, ChevronLeft, ChevronRight, RefreshCw, CircleX } from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '../components/StatCard.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import '../Users/users.css'
import './reviews.css'
import ReviewsTab from './ReviewsTab.jsx'
import { countAdminReports, getAdminReport, getReportStatistics, listAdminReports, resolveAdminReport } from '../../api/admin/reportApi.js'
import { decisionOptions, emptyFilters, isActiveReport, label, reportStatusLabels, targetTypeLabels, toCsv, toEnumKey } from './reviewsData.js'

const PAGE_SIZE = 10
const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
const date = value => (value ? new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN') : '—')
const settled = result => (result.status === 'fulfilled' ? result.value : undefined)
function Badge({ value }) { return <span className={`rr-badge rr-${String(value || 'none').toLowerCase().replaceAll(' ', '-')}`}>{label(value)}</span> }

function GuidelinesDialog({ onClose }) {
  return <DemoDialog title="Hướng dẫn kiểm duyệt" onClose={onClose}><div className="rr-guidelines"><ol><li>Đối chiếu nội dung báo cáo với bằng chứng và phản hồi của chủ sân (nếu có).</li><li>Ưu tiên báo cáo có hành vi quấy rối, đe dọa hoặc tiết lộ thông tin cá nhân.</li><li>Chỉ hoàn tiền, trừ điểm fair-play hoặc xóa bài viết khi đã xác minh vi phạm.</li><li>Luôn ghi chú lý do quyết định để các bên có thể tra cứu.</li></ol><button className="rr-button" onClick={onClose}>Đóng hướng dẫn</button></div></DemoDialog>
}

// POST /api/v1/reports/admin/{reportId}/resolve
function ResolveDialog({ report, onClose, onDone }) {
  const [values, setValues] = useState({ decision: decisionOptions[0].value, adminNote: '', refund: report.requestedRefund ? String(report.requestedRefund) : '100', lockSlot: false, deduct: '', deletePost: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const set = (key, value) => setValues(previous => ({ ...previous, [key]: value }))
  // REFUND cần % hoàn (1-100); trừ điểm fair-play / xóa bài chỉ áp dụng khi không bác bỏ.
  const refunding = values.decision === 'REFUND'
  const approving = values.decision !== 'REJECT'
  const submit = async event => {
    event.preventDefault()
    const refund = values.refund === '' ? null : Number(values.refund)
    const deduct = values.deduct === '' ? null : Number(values.deduct)
    if (!values.adminNote.trim()) return setError('Vui lòng ghi chú lý do quyết định.')
    if (refunding && (refund == null || !Number.isInteger(refund) || refund < 1 || refund > 100)) return setError('Tỷ lệ hoàn tiền phải là số nguyên từ 1 đến 100.')
    if (deduct != null && (!Number.isFinite(deduct) || deduct < 0)) return setError('Số điểm fair-play bị trừ phải lớn hơn hoặc bằng 0.')
    setSubmitting(true); setError('')
    try {
      await resolveAdminReport(report.uuid, {
        decision: values.decision,
        adminNote: values.adminNote.trim(),
        refundPercentage: refunding ? refund : null,
        lockSlotForMaintenance: refunding && values.lockSlot,
        deductTargetUserFairPlayPoints: approving ? deduct : null,
        deleteCommunityPost: approving && report.targetType === 'COMMUNITY_POST' && values.deletePost,
      })
      onDone(`Đã xử lý báo cáo ${report.id}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  const check = { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }
  return <DemoDialog title={`Xử lý báo cáo ${report.id}`} onClose={submitting ? () => {} : onClose}><form className="rr-action-form" onSubmit={submit}>
    <p>{report.reporter} báo cáo <strong>{report.entity}</strong> · {report.reason}</p>
    <label>Quyết định<select value={values.decision} onChange={event => set('decision', event.target.value)}>{decisionOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <label>Ghi chú quản trị (bắt buộc)<textarea rows={3} maxLength={1000} value={values.adminNote} onChange={event => set('adminNote', event.target.value)} placeholder="Nhập nội dung xác minh hoặc lý do quyết định..." required /></label>
    {refunding && <>
      <label>Tỷ lệ hoàn tiền cho người báo cáo (%){report.requestedRefund != null && ` — người báo cáo yêu cầu ${report.requestedRefund}%`}<input type="number" min={1} max={100} step={1} value={values.refund} onChange={event => set('refund', event.target.value)} placeholder="1 – 100" /></label>
      <label style={check}><input type="checkbox" checked={values.lockSlot} onChange={event => set('lockSlot', event.target.checked)} />Khóa khung giờ để bảo trì sân</label>
    </>}
    {approving && <>
      <label>Trừ điểm fair-play của người bị báo cáo<input type="number" min={0} step={1} value={values.deduct} onChange={event => set('deduct', event.target.value)} placeholder="Để trống nếu không trừ" /></label>
      {report.targetType === 'COMMUNITY_POST' && <label style={check}><input type="checkbox" checked={values.deletePost} onChange={event => set('deletePost', event.target.checked)} />Xóa bài viết cộng đồng bị báo cáo</label>}
    </>}
    {error && <p className="rr-error" role="alert">{error}</p>}
    <footer><button type="button" className="rr-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`rr-button ${values.decision === 'REJECT' ? 'danger' : 'primary'}`} disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Xác nhận'}</button></footer>
  </form></DemoDialog>
}

function Inspector({ report, loading, error, onResolve }) {
  if (!report) return <aside className="rr-inspector rr-empty"><MessageSquare size={30} /><h2>Chưa chọn báo cáo</h2><p>Chọn một dòng để xem thông tin chi tiết.</p></aside>
  return <aside className="rr-inspector" aria-busy={loading}><header><div><h2><TriangleAlert size={17} /> Báo cáo chi tiết</h2><small title={report.uuid}>{report.id}</small></div><Badge value={report.status} /></header>
    {loading && <p className="rr-demo-note">Đang tải chi tiết…</p>}
    {error && <p className="rr-error" role="alert">Không tải được chi tiết: {error}</p>}
    <section className="rr-report-card"><dl><dt>Người báo cáo</dt><dd>{report.reporter}{report.reporterUsername && ` (@${report.reporterUsername})`}</dd><dt>Đối tượng</dt><dd>{report.entity}</dd><dt>Loại</dt><dd>{label(report.targetType)}</dd>{report.facility && <><dt>Cơ sở</dt><dd>{report.facility}</dd></>}{(report.bookingCode || report.bookingId) && <><dt>Đơn đặt sân</dt><dd>#{report.bookingCode || String(report.bookingId).slice(0, 8).toUpperCase()}</dd></>}<dt>Lý do</dt><dd>{report.reason}</dd>{report.requestedRefund != null && <><dt>Yêu cầu hoàn</dt><dd>{report.requestedRefund}%</dd></>}<dt>Ngày gửi</dt><dd>{date(report.date)}</dd></dl>{report.description && <p>{report.description}</p>}
      {report.evidence.length > 0 && <div className="rr-note"><small>Bằng chứng ({report.evidence.length})</small><p>{report.evidence.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>Ảnh {index + 1}</a>)}</p></div>}
    </section>
    <section className="rr-linked"><small>PHẢN HỒI CỦA CHỦ SÂN</small><p>{report.ownerResponse || (report.hasOwnerResponded ? 'Chủ sân đã phản hồi.' : 'Chủ sân chưa phản hồi.')}</p></section>
    {(report.notes || report.decision) && <div className="rr-note"><small>Quyết định của quản trị viên{report.resolvedAt && ` · ${report.resolvedAt}`}</small><p>{report.decision && <strong>{decisionOptions.find(option => option.value === report.decision)?.label || report.decision}. </strong>}{report.notes}</p></div>}
    {report.history.length > 0 && <section className="rr-history"><h3>Lịch sử xử lý</h3>{report.history.map((entry, i) => <p key={`${entry.time}-${i}`}><span>{entry.time}</span>{entry.text}</p>)}</section>}
    <div className="rr-actions"><button className="rr-button primary" disabled={!isActiveReport(report) || loading} onClick={onResolve}><CheckCircle2 size={14} />Xử lý báo cáo</button></div>
  </aside>
}

export default function ReviewsReportsPage() {
  const [tab, setTab] = useState('reports')
  // ?status=Pending (từ Dashboard) → mở sẵn bộ lọc trạng thái.
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, status: reportStatusLabels[toEnumKey(searchParams.get('status'))] ? toEnumKey(searchParams.get('status')) : '' }))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [list, setList] = useState({ key: '', items: [], total: 0, totalPages: 1, error: '' })
  const [stats, setStats] = useState({ key: -1 })
  const [selected, setSelected] = useState(null)
  const [detailState, setDetailState] = useState({ key: '', data: null, error: '' })
  const [dialog, setDialog] = useState(null)

  const invalidRange = filters.from && filters.to && filters.from > filters.to
  const params = invalidRange ? null : { SearchKeyword: search, Status: filters.status, TargetType: filters.targetType, HasOwnerResponded: filters.responded, FromDate: filters.from, ToDate: filters.to, PageIndex: page, PageSize: PAGE_SIZE }
  const listKey = params ? `${JSON.stringify(params)}#${reload}` : ''
  const loading = Boolean(params) && list.key !== listKey

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(filters.search.trim()); setPage(1) }, 400)
    return () => clearTimeout(timer)
  }, [filters.search])
  useEffect(() => {
    if (!listKey) return
    let cancelled = false
    listAdminReports(JSON.parse(listKey.split('#')[0]))
      .then(result => !cancelled && setList({ key: listKey, ...result, error: '' }))
      .catch(error => !cancelled && setList({ key: listKey, items: [], total: 0, totalPages: 1, error: error.message }))
    return () => { cancelled = true }
  }, [listKey])
  // Thống kê: ưu tiên /reports/admin/statistics, thiếu field nào thì đếm bằng danh sách theo trạng thái.
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getReportStatistics({}), countAdminReports({}), countAdminReports({ Status: 'PENDING' }), countAdminReports({ Status: 'RESOLVED_REFUNDED' }), countAdminReports({ Status: 'REJECTED' }), countAdminReports({ Status: 'RESOLVED_NO_REFUND' })])
      .then(results => {
        if (cancelled) return
        const [statistics, total, pending, refunded, rejected, noRefund] = results.map(settled)
        const resolved = Number.isFinite(refunded) || Number.isFinite(noRefund) ? (refunded || 0) + (noRefund || 0) : undefined
        setStats({ key: reload, total: statistics?.total ?? total, pending: statistics?.pending ?? pending, resolved: statistics?.resolved ?? resolved, rejected: statistics?.rejected ?? rejected })
      })
    return () => { cancelled = true }
  }, [reload])
  const detailKey = selected ? `${selected}#${reload}` : ''
  useEffect(() => {
    if (!detailKey) return
    let cancelled = false
    getAdminReport(detailKey.split('#')[0])
      .then(data => !cancelled && setDetailState({ key: detailKey, data, error: '' }))
      .catch(error => !cancelled && setDetailState({ key: detailKey, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [detailKey])

  const listItem = list.items.find(item => item.uuid === selected)
  const fetched = detailState.key === detailKey ? detailState.data : null
  const report = listItem || fetched ? { ...listItem, ...Object.fromEntries(Object.entries(fetched || {}).filter(([, value]) => value !== '' && value != null && value !== '—' && !(Array.isArray(value) && !value.length))) } : null
  const pages = Math.max(1, list.totalPages || Math.ceil(list.total / PAGE_SIZE))
  const statsLoading = stats.key !== reload
  const closedRate = Number.isFinite(stats.total) && stats.total ? (((stats.resolved || 0) + (stats.rejected || 0)) / stats.total) * 100 : null

  const change = (key, value) => { setFilters(f => ({ ...f, [key]: value })); if (key !== 'search') setPage(1) }
  const resetFilters = () => { setFilters({ ...emptyFilters }); setSearch(''); setPage(1) }
  const showPending = () => { setTab('reports'); setFilters({ ...emptyFilters, status: 'PENDING' }); setSearch(''); setPage(1) }
  const done = message => { setDialog(null); toast.success(message); setReload(value => value + 1) }
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(list.items)], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'sportnexus-reports.csv'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success(`Đã xuất ${list.items.length} báo cáo của trang hiện tại.`)
  }
  const selectFilter = (key, title, options) => <label>{title}<select value={filters[key]} onChange={e => change(key, e.target.value)}><option value="">Tất cả</option>{Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>

  return <div className="rr-page"><div className="rr-page-heading admin-page-header"><div><div className="rr-title"><h1>Đánh giá & Báo cáo</h1><span className="rr-badge rr-verified">{statsLoading ? '…' : number(stats.total)} Báo cáo</span></div><p>Theo dõi phản hồi của người chơi và hoạt động bị báo cáo trên SportNexus.</p></div><div className="rr-header-actions"><button className="rr-button" onClick={() => setReload(value => value + 1)}><RefreshCw size={14} />Làm mới</button><button className="rr-button" onClick={exportCsv} disabled={tab !== 'reports' || !list.items.length}><Download size={14} />Xuất CSV</button><button className="rr-button primary" onClick={() => setDialog({ type: 'rules' })}><ShieldCheck size={14} />Hướng dẫn kiểm duyệt</button></div></div>
    <div className="rr-tabs" role="tablist" aria-label="Đánh giá và báo cáo">{[['reports', 'Báo cáo vi phạm', statsLoading ? '…' : `${number(stats.pending)} chờ xử lý`], ['reviews', 'Đánh giá & Phản hồi', 'Cơ sở · Fair Play']].map(([key, text, count]) => <button key={key} id={`rr-tab-${key}`} role="tab" aria-selected={tab === key} aria-controls="rr-content" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{text}<span>{count}</span></button>)}</div>
    {tab === 'reports' && <div className="rr-stats">{[
      ['Tổng báo cáo', number(stats.total), TriangleAlert, 'Toàn nền tảng'],
      ['Đang chờ xử lý', number(stats.pending), MessageSquare, 'Cần quản trị viên xem xét'],
      ['Đã giải quyết', number(stats.resolved), CheckCircle2, 'Báo cáo được chấp nhận'],
      ['Đã bác bỏ', number(stats.rejected), CircleX, closedRate == null ? '' : `Tỷ lệ đóng: ${closedRate.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`],
    ].map(([title, value, icon, supporting]) => <StatCard key={title} label={title} value={statsLoading ? '…' : value} icon={icon} supporting={supporting} />)}</div>}
    {tab === 'reports' && !statsLoading && stats.pending > 0 && <div className="rr-priority"><TriangleAlert size={20} /><p><strong>{number(stats.pending)} báo cáo</strong> đang chờ xử lý</p><button className="rr-button" onClick={showPending}>Xử lý ngay <ArrowRight size={14} /></button></div>}

    {tab === 'reviews' ? <div id="rr-content" role="tabpanel" aria-labelledby="rr-tab-reviews"><ReviewsTab /></div>
      : <div className="rr-content" id="rr-content" role="tabpanel" aria-labelledby="rr-tab-reports"><section className="rr-list"><div className="rr-toolbar"><label className="rr-search"><Search size={16} /><input aria-label="Tìm kiếm" placeholder="Tìm người báo cáo, đối tượng, lý do..." value={filters.search} onChange={e => change('search', e.target.value)} /></label><details className="rr-filter-details" open><summary>Bộ lọc tìm kiếm</summary><div className="rr-filters">{selectFilter('status', 'Trạng thái', reportStatusLabels)}{selectFilter('targetType', 'Loại đối tượng', targetTypeLabels)}{selectFilter('responded', 'Chủ sân phản hồi', { true: 'Đã phản hồi', false: 'Chưa phản hồi' })}{[['from', 'Từ ngày'], ['to', 'Đến ngày']].map(([key, text]) => <label key={key}>{text}<input type="date" value={filters[key]} onChange={e => change(key, e.target.value)} /></label>)}<button className="rr-reset" onClick={resetFilters}>Đặt lại bộ lọc</button></div></details>{invalidRange && <p role="alert" className="rr-error">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}</div>
        <div className="rr-table-scroll"><table><thead><tr>{['Mã báo cáo', 'Người báo cáo', 'Đối tượng bị báo cáo', 'Loại', 'Lý do', 'Chủ sân', 'Trạng thái', 'Ngày tạo'].map(text => <th key={text}>{text}</th>)}</tr></thead><tbody style={loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.uuid} className={selected === item.uuid ? 'selected' : ''} onClick={() => setSelected(item.uuid)}><td><button className="rr-row-button" onClick={() => setSelected(item.uuid)}>{item.id}</button></td><td>{item.reporter}</td><td>{item.entity}</td><td><Badge value={item.targetType} /></td><td className="rr-excerpt" title={item.reason}>{item.reason}</td><td>{item.hasOwnerResponded ? 'Đã phản hồi' : '—'}</td><td><Badge value={item.status} /></td><td>{date(item.date)}</td></tr>)}</tbody></table></div>
        {loading && !list.items.length && <div className="rr-empty"><Search size={28} /><h3>Đang tải báo cáo…</h3></div>}
        {!loading && list.error && <div className="rr-empty" role="alert"><TriangleAlert size={28} /><h3>Không tải được báo cáo</h3><p>{list.error}</p></div>}
        {!loading && !list.error && !list.items.length && <div className="rr-empty"><Search size={28} /><h3>Không có báo cáo</h3><p>Thử thay đổi từ khóa hoặc đặt lại bộ lọc.</p></div>}
        <footer className="rr-pagination"><span>Hiển thị {list.items.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + list.items.length} trên {number(list.total)} kết quả</span><div><button className="rr-button" aria-label="Trang trước" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={15} /></button><span>{page} / {pages}</span><button className="rr-button" aria-label="Trang sau" disabled={loading || page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={15} /></button></div></footer>
      </section><Inspector report={report} loading={Boolean(selected) && detailState.key !== detailKey} error={detailState.key === detailKey ? detailState.error : ''} onResolve={() => setDialog({ type: 'resolve', report })} /></div>}
    {dialog?.type === 'rules' && <GuidelinesDialog onClose={() => setDialog(null)} />}
    {dialog?.type === 'resolve' && <ResolveDialog report={dialog.report} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
