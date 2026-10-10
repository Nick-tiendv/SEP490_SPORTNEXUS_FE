import { useState } from 'react'
import { Users, UserRoundSearch, BadgeCheck, Trophy, CircleX, Download, ListFilter, Search, Filter } from 'lucide-react'
import LFGTable from './LFGTable.jsx'
import LFGDetails from './LFGDetails.jsx'
import LFGDialogs from './LFGDialogs.jsx'
import { initialActivities, lfgStats, statusLabels, sportLabels, number, normalize, parseDate, exportActivities } from './lfgData.js'
import '../Users/users.css'
import './lfg.css'

const emptyFilters = { search: '', status: '', sport: '', facility: '', from: '', to: '', reported: false }
const icons = { total: Users, open: UserRoundSearch, full: BadgeCheck, completed: Trophy, cancelled: CircleX }

export default function LFGManagement() {
  const [activities, setActivities] = useState(initialActivities)
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [detailId, setDetailId] = useState(initialActivities[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const fromDate = parseDate(filters.from), toDate = parseDate(filters.to)
  const filtered = activities.filter(activity => normalize(`${activity.id} ${activity.title} ${sportLabels[activity.venue.sport]} ${activity.host.name} ${activity.venue.name}`).includes(normalize(filters.search.trim()))
    && (!filters.status || activity.status === filters.status) && (!filters.sport || activity.venue.sport === filters.sport)
    && (!filters.facility || activity.venue.id === filters.facility) && (!fromDate || activity.date >= fromDate) && (!toDate || activity.date <= toDate)
    && (!filters.reported || activity.reports.length > 0))
  const detail = activities.find(activity => activity.id === detailId)
  const venues = [...new Map(activities.map(activity => [activity.venue.id, activity.venue])).values()]
  const change = (key, value) => { setDraft(previous => ({ ...previous, [key]: value })); setError('') }
  const apply = event => {
    event.preventDefault()
    const from = parseDate(draft.from), to = parseDate(draft.to)
    if ((draft.from && !from) || (draft.to && !to)) return setError('Nhập ngày hợp lệ theo định dạng ngày/tháng/năm (ví dụ: 15/10/2026).')
    if (from && to && from > to) return setError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.')
    setFilters(draft); setPage(1); setError('')
  }
  const reset = () => { setDraft(emptyFilters); setFilters(emptyFilters); setPage(1); setError('') }
  const toggleReports = () => {
    const reported = !filters.reported
    setDraft(previous => ({ ...previous, reported })); setFilters(previous => ({ ...previous, reported })); setPage(1)
  }
  const reviewReports = () => {
    const id = dialog.activity.id
    setActivities(previous => previous.map(activity => activity.id === id ? { ...activity, reports: activity.reports.map(report => ({ ...report, reviewed: true })), history: [...activity.history, { id: `review-${activity.history.length}`, time: 'Phiên hiện tại', text: 'Đã xem báo cáo trong bản mẫu; chưa kết luận hoặc xử phạt.' }] } : activity))
    setNotice('Đã đánh dấu báo cáo là đã xem trong bản mẫu. Không lưu lên máy chủ.'); setDialog(null)
  }
  const moderate = reason => {
    const id = dialog.activity.id
    setActivities(previous => previous.map(activity => activity.id === id && !['Completed', 'Cancelled'].includes(activity.status) ? { ...activity, status: 'Cancelled', moderationReason: reason, history: [...activity.history, { id: `moderation-${activity.history.length}`, time: 'Phiên hiện tại', text: `Hủy kèo trong bản mẫu. Lý do: ${reason}` }] } : activity))
    setNotice(`Đã đổi trạng thái kèo #${id} thành “Đã hủy” trong bản mẫu. Không thay đổi khoản tiền hoặc dữ liệu máy chủ.`); setDialog(null)
  }
  const download = () => { exportActivities(filtered); setNotice(`Đã xuất ${number(filtered.length)} kèo đang được lọc ra CSV minh họa.`) }
  const draftChanged = Object.keys(emptyFilters).some(key => draft[key] !== filters[key])
  return <div className="lfg-page"><header className="lfg-page-heading"><div><h1>Quản lý ghép trận <span>1.845 kèo mẫu</span></h1><p>Theo dõi hoạt động tìm người chơi và các kèo ghép trận trên SportNexus.</p></div><div><button className="users-button" onClick={download}><Download size={13} />Xuất CSV</button><button className="users-button" aria-pressed={filters.reported} onClick={toggleReports}><ListFilter size={13} />{filters.reported ? 'Hiện tất cả kèo' : 'Lọc kèo có báo cáo'}</button></div></header>
    <div className="lfg-kpis">{lfgStats.map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{number(stat.value)}</strong><p>{stat.note}</p></article> })}</div>
    <p className="lfg-demo-label">Chỉ số toàn nền tảng là số liệu minh họa độc lập; không tính từ {activities.length} kèo mẫu và không cộng các nhóm thành tổng. Thay đổi sẽ mất khi tải lại trang.</p>
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <form className="lfg-toolbar" aria-label="Tìm kiếm và bộ lọc kèo" onSubmit={apply} noValidate><div className="lfg-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm kèo ghép trận" placeholder="Tìm mã kèo, môn, cơ sở, người tổ chức…" value={draft.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={draft.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Môn thể thao<select value={draft.sport} onChange={event => change('sport', event.target.value)}><option value="">Tất cả môn</option>{Object.entries(sportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <div className="lfg-filter-row"><label>Cơ sở<select value={draft.facility} onChange={event => change('facility', event.target.value)}><option value="">Tất cả cơ sở</option>{venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label><label>Từ ngày<input placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} value={draft.from} onChange={event => change('from', event.target.value)} aria-describedby={error ? 'lfg-filter-error' : undefined} /></label><label>Đến ngày<input placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} value={draft.to} onChange={event => change('to', event.target.value)} aria-describedby={error ? 'lfg-filter-error' : undefined} /></label><button className="users-button primary"><Filter size={12} />Áp dụng bộ lọc</button><button type="button" className="lfg-text-button" onClick={reset}>Đặt lại</button></div>
      {error && <p className="users-form-error" id="lfg-filter-error" role="alert">{error}</p>}{draftChanged && <p className="lfg-filter-hint">Bộ lọc đã thay đổi. Nhấn “Áp dụng bộ lọc” để cập nhật kết quả và CSV.</p>}
    </form>
    <div className={`lfg-content-grid ${detail ? 'with-details' : ''}`}><LFGTable activities={filtered} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />{detail && <LFGDetails activity={detail} onClose={() => setDetailId(null)} onSlot={slot => setDialog({ type: 'slot', activity: detail, slot })} onReports={() => setDialog({ type: 'reports', activity: detail })} onFinance={() => setDialog({ type: 'finance', activity: detail })} onModerate={() => setDialog({ type: 'moderation', activity: detail })} />}</div>
    {dialog && <LFGDialogs dialog={dialog} onClose={() => setDialog(null)} onReview={reviewReports} onModerate={moderate} />}
  </div>
}
