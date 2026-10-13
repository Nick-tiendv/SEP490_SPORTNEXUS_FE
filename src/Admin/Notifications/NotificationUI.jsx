import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { formatNumber } from './notificationHelpers.js'

const adminDisplayLabels = {
  "Confirmed": "Đã xác nhận",
  "Completed": "Đã hoàn thành",
  "Recruiting": "Đang tìm người",
  "Announcement": "Thông báo chung",
  "Maintenance": "Bảo trì",
  "General": "Chung",
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Booking": "Đặt sân",
  "Payment": "Thanh toán",
  "Tournament": "Giải đấu",
  "System": "Hệ thống",
  "Broadcast": "Thông báo hàng loạt",
  "LFG": "Tìm nhóm chơi",
  "Registration": "Đăng ký",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Pending": "Đang chờ xử lý",
  "Read": "Đã đọc",
  "Delivered": "Đã giao",
  "Failed": "Thất bại",
  "Sent": "Đã gửi",
  "Sending": "Đang gửi",
  "Draft": "Bản nháp",
  "Scheduled": "Đã lên lịch",
  "Cancelled": "Đã hủy",
  "In-App": "Trong ứng dụng",
  "Push Notification": "Thông báo đẩy",
  "All Users": "Tất cả người dùng",
  "Players": "Người chơi",
  "Court Owners": "Chủ sân",
  "Admins": "Quản trị viên",
  "Selected Users": "Người dùng được chọn",
  "All": "Tất cả"
}


export function NotificationBadge({ value }) {
  return <span className={`nt-badge nt-${value.toLowerCase().replaceAll(' ', '-')}`}><i />{adminDisplayLabels[value] || value}</span>
}

export function RecipientAvatar({ recipient }) {
  return <div className="nt-person"><span className="nt-avatar">{recipient.name.split(' ').slice(-2).map(part => part[0]).join('')}</span><span><strong>{recipient.name}</strong><small>@{recipient.username}</small></span></div>
}

export function EmptyState({ title = 'Không tìm thấy dữ liệu', message = 'Thử thay đổi từ khóa hoặc đặt lại bộ lọc.' }) {
  return <div className="nt-empty"><Search size={28} /><h3>{title}</h3><p>{message}</p></div>
}

export function NotificationPagination({ total, page, pages, pageSize, onPage, onPageSize }) {
  return <footer className="nt-pagination">
    <span>Hiển thị {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} / {formatNumber(total)} bản ghi mẫu</span>
    <div><label>Dòng/trang<select value={pageSize} onChange={event => onPageSize(Number(event.target.value))}>{[10, 20, 50].map(size => <option key={size}>{size}</option>)}</select></label>
      <button className="nt-button compact" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button>
      <span>{page} / {pages}</span>
      <button className="nt-button compact" aria-label="Trang sau" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button>
    </div>
  </footer>
}

export function NotificationFilters({ tab, filters, onChange, onReset, options }) {
  const labels = { search: 'Tìm kiếm', type: tab === 'triggers' ? "Danh mục" : "Loại", status: "Trạng thái", audience: "Đối tượng nhận", from: 'Từ ngày', to: 'Đến ngày' }
  const active = Object.entries(filters).filter(([, value]) => value)
  const invalidRange = filters.from && filters.to && filters.from > filters.to
  return <section className="nt-toolbar" aria-label="Tìm kiếm và bộ lọc">
    <label className="nt-search"><Search size={16} /><input aria-label={`Tìm kiếm ${tab}`} value={filters.search} onChange={event => onChange('search', event.target.value)} placeholder={tab === 'history' ? "Tìm thông báo, người nhận, ID thông báo..." : tab === 'triggers' ? "Tìm sự kiện kích hoạt, mã sự kiện..." : "Tìm tiêu đề, nội dung thông báo hàng loạt..."} /></label>
    <details className="nt-filter-details" open><summary>Bộ lọc</summary><div className="nt-filters">
      {Object.entries(options).map(([key, values]) => <label key={key}>{labels[key]}<select value={filters[key]} onChange={event => onChange(key, event.target.value)}><option value="">{key === 'audience' ? "Tất cả vai trò / đối tượng" : `Tất cả ${labels[key]}`}</option>{values.map(value => <option key={value} value={value}>{adminDisplayLabels[value] || value}</option>)}</select></label>)}
      {tab === 'history' && ['from', 'to'].map(key => <label key={key}>{labels[key]}<input type="date" value={filters[key]} aria-invalid={Boolean(invalidRange)} onChange={event => onChange(key, event.target.value)} /></label>)}
      <button className="nt-text-button" onClick={onReset}>Đặt lại bộ lọc</button>
    </div></details>
    {active.length > 0 && <div className="nt-filter-chips"><small>Active Filters ({active.length})</small>{active.map(([key, value]) => <button key={key} onClick={() => onChange(key, '')} aria-label={`Bỏ bộ lọc ${labels[key]}`}>{labels[key]}: {key === 'search' ? value : adminDisplayLabels[value] || value}<X size={11} /></button>)}</div>}
    {invalidRange && <p className="nt-error" role="alert">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}
  </section>
}
