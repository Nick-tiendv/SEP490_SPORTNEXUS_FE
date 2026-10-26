import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, BadgeCheck, CircleX, Banknote, Download, Search, Filter, RefreshCw } from 'lucide-react'
import BookingTable from './BookingTable.jsx'
import BookingDetails from './BookingDetails.jsx'
import BookingDialogs from './BookingDialogs.jsx'
import { getAdminBooking, getBookingStatistics, getFacilityOptions, listAdminBookings } from '../../api/admin/bookingApi.js'
import { bookingStatusLabels, number, exportBookings, parseBookingDate } from './bookingData.js'
import '../Users/users.css'
import './booking.css'

const emptyFilters = { search: '', status: '', facility: '', from: '', to: '' }

export default function BookingManagement() {
  const [filters, setFilters] = useState(emptyFilters)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const [list, setList] = useState({ key: '', items: [], total: 0, totalPages: 1, error: '' })
  const [stats, setStats] = useState({ key: -1 })
  const [facilities, setFacilities] = useState([])
  const [detailState, setDetailState] = useState({ key: '', data: null, error: '' })

  const fromDate = parseBookingDate(filters.from), toDate = parseBookingDate(filters.to)
  const invalidDate = (filters.from && !fromDate) || (filters.to && !toDate)
  const invalidRange = fromDate && toDate && fromDate > toDate
  const params = invalidDate || invalidRange ? null : { Search: search, Status: filters.status, FacilityId: filters.facility, DateFrom: fromDate, DateTo: toDate, Page: page, PageSize: pageSize }
  const listKey = params ? `${JSON.stringify(params)}#${reload}` : ''
  const listLoading = Boolean(params) && list.key !== listKey

  // Chờ người dùng gõ xong rồi mới gửi từ khóa tìm kiếm.
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(filters.search.trim()); setPage(1) }, 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    if (!listKey) return
    let cancelled = false
    listAdminBookings(JSON.parse(listKey.split('#')[0]))
      .then(result => !cancelled && setList({ key: listKey, ...result, error: '' }))
      .catch(error => !cancelled && setList({ key: listKey, items: [], total: 0, totalPages: 1, error: error.message }))
    return () => { cancelled = true }
  }, [listKey])

  // Chỉ số toàn nền tảng: GET /api/v1/bookings/admin/statistics (đã có sẵn số đơn theo từng trạng thái).
  useEffect(() => {
    let cancelled = false
    getBookingStatistics({})
      .then(statistics => !cancelled && setStats({ key: reload, total: statistics.totalBookings, paid: statistics.paid, checkedIn: statistics.checkedIn, cancelled: statistics.cancelled, revenue: statistics.totalRevenue, extra: statistics, errors: [] }))
      .catch(error => !cancelled && setStats({ key: reload, errors: [`Thống kê đặt sân: ${error.message}`] }))
    return () => { cancelled = true }
  }, [reload])

  useEffect(() => {
    let cancelled = false
    getFacilityOptions().then(items => !cancelled && setFacilities(items)).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const detailKey = detailId ? `${detailId}#${reload}` : ''
  useEffect(() => {
    if (!detailKey) return
    let cancelled = false
    getAdminBooking(detailKey.split('#')[0])
      .then(data => !cancelled && setDetailState({ key: detailKey, data, error: '' }))
      .catch(error => !cancelled && setDetailState({ key: detailKey, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [detailKey])
  // Trong lúc tải chi tiết, hiển thị tạm dữ liệu từ danh sách.
  const listItem = list.items.find(booking => booking.uuid === detailId)
  const detail = detailId ? (detailState.key === detailKey && detailState.data) || listItem || null : null

  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); if (key !== 'search') setPage(1) }
  const reset = () => { setFilters(emptyFilters); setSearch(''); setPage(1) }
  const download = () => { exportBookings(list.items); setNotice(`Đã xuất ${number(list.items.length)} đơn của trang hiện tại ra CSV.`) }
  const afterCancel = message => { setDialog(null); setNotice(message); setReload(value => value + 1) }
  const statsLoading = stats.key !== reload
  const kpis = [
    { label: 'Tổng đơn đặt sân', value: stats.total, icon: CalendarDays, className: 'total' },
    { label: 'Đã thanh toán', value: stats.paid, icon: CheckCircle2, className: 'confirmed' },
    { label: 'Đã check-in', value: stats.checkedIn, icon: BadgeCheck, className: 'completed' },
    { label: 'Đã hủy', value: stats.cancelled, icon: CircleX, className: 'cancelled' },
    { label: 'Doanh thu đặt sân', value: stats.revenue, icon: Banknote, className: 'revenue' },
  ]
  const ratio = value => (Number.isFinite(value) && stats.total ? `${((value / stats.total) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% tổng đơn` : '')

  return <div className={`bookings-page ${detail ? 'with-details' : ''}`}><section className="bookings-main-content">
    <header className="bookings-page-heading admin-page-header"><div><h1>Quản lý đặt sân <span>{Number.isFinite(stats.total) ? `${number(stats.total)} đơn` : '…'}</span></h1><p>Theo dõi đơn đặt sân, lịch sử sử dụng và thông tin thanh toán trên SportNexus.</p></div><div className="bookings-heading-actions"><button className="users-button" onClick={() => setReload(value => value + 1)}><RefreshCw size={14} />Làm mới</button><button className="users-button" onClick={download} disabled={!list.items.length}><Download size={14} />Xuất CSV</button></div></header>
    <div className="bookings-kpis">{kpis.map(({ label, value, icon: Icon, className }) => <article key={label} className={className}><div><small>{label}</small><Icon size={23} /></div><strong>{statsLoading ? '…' : Number.isFinite(value) ? number(value) : '—'}{className === 'revenue' && Number.isFinite(value) && <span className="bookings-currency">đ</span>}</strong><p>{className === 'total' || className === 'revenue' ? 'Toàn nền tảng' : ratio(value)}</p></article>)}</div>
    {!statsLoading && stats.extra && <p className="bookings-stats-hint">Tỉ lệ hủy {number(stats.extra.cancellationRate)}% · tỉ lệ check-in {number(stats.extra.checkInRate)}% · {number(stats.extra.walkIn)} đơn tại quầy · đã hoàn {number(stats.extra.refunded)} ₫ · giữ phạt {number(stats.extra.penalty)} ₫</p>}
    {!statsLoading && stats.errors?.length > 0 && <div className="users-notice" role="alert"><span>Một số chỉ số không tải được — {stats.errors.join(' · ')}</span></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <section className="bookings-toolbar" aria-label="Tìm kiếm và bộ lọc đơn đặt sân"><div className="bookings-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm đơn đặt sân" placeholder="Mã đơn, người đặt, cơ sở…" value={filters.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(bookingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Cơ sở<select value={filters.facility} onChange={event => change('facility', event.target.value)}><option value="">Tất cả cơ sở</option>{facilities.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label></div>
      <div className="bookings-filter-row bookings-date-row"><label>Từ ngày<input type="text" inputMode="numeric" maxLength={10} placeholder="dd/mm/yyyy" aria-invalid={Boolean(invalidDate)} aria-describedby={invalidDate || invalidRange ? 'bookings-date-error' : undefined} value={filters.from} onChange={event => change('from', event.target.value)} /></label><label>Đến ngày<input type="text" inputMode="numeric" maxLength={10} placeholder="dd/mm/yyyy" aria-invalid={Boolean(invalidDate || invalidRange)} aria-describedby={invalidDate || invalidRange ? 'bookings-date-error' : undefined} value={filters.to} onChange={event => change('to', event.target.value)} /></label><span className="bookings-filter-count"><Filter size={12} />Bộ lọc {Object.values(filters).filter(Boolean).length}</span><button className="bookings-text-button" onClick={reset}>Đặt lại</button></div>
      {(invalidDate || invalidRange) && <p className="users-form-error" id="bookings-date-error" role="alert">{invalidDate ? 'Nhập ngày hợp lệ theo định dạng ngày/tháng/năm (ví dụ: 26/10/2026).' : 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.'}</p>}
      {selected.length > 0 && <div className="bookings-selection"><span>Đã chọn {selected.length} đơn</span><button className="bookings-text-button" onClick={() => setSelected([])}>Bỏ chọn tất cả</button></div>}
    </section>
    <BookingTable bookings={list.items} total={list.total} totalPages={list.totalPages || Math.max(1, Math.ceil(list.total / pageSize))} loading={listLoading} error={list.error} selected={selected} setSelected={setSelected} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />
  </section>{detail && <BookingDetails booking={detail} loading={detailState.key !== detailKey} error={detailState.key === detailKey ? detailState.error : ''} onClose={() => setDetailId(null)} onProfile={() => setDialog({ type: 'profile', booking: detail })} onReceipt={() => setDialog({ type: 'receipt', booking: detail })} onReason={() => setDialog({ type: 'reason', booking: detail })} onCancel={() => setDialog({ type: 'cancel', booking: detail })} />}{dialog && <BookingDialogs dialog={dialog} onClose={() => setDialog(null)} onCancelled={afterCancel} />}</div>
}
