

const adminDisplayLabels = {
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
// Local demo data only. Replace the initializer with a confirmed API adapter later.
const people = ['Lê Hoàng Nam', 'Nguyễn Văn A', 'Vũ Thị Mai Anh', 'Phạm Hùng Cường', 'Đỗ Quốc Tuấn', 'Trần Minh Bình', 'Hoàng Ngọc Linh', 'Bùi Anh Khoa']
const targets = ['Pickleball Pro 01', 'Trần Minh Bình', 'Sân Tennis Thảo Điền', 'Lê Hoàng Nam', 'SkySport Badminton']
export const initialReviews = Array.from({ length: 2418 }, (_, i) => ({
  id: `REV-${2026}-${String(i + 1).padStart(4, '0')}`, name: people[i % people.length], username: `player_${i + 1}`,
  type: i % 5 === 1 || i % 5 === 3 ? 'Fair-play' : 'Facility', target: targets[i % targets.length],
  rating: i < 8 ? [4.5, 5, 4, 2, 5, 3, 1, 4][i] : i % 5 === 1 || i % 5 === 3 ? (i % 100 < 5 ? 2 : 5) : i % 100 === 0 ? 1 : i % 100 === 5 ? 3 : i % 3 === 0 ? 5 : 4.5,
  status: i < 5 ? 'Flagged' : i % 19 === 0 ? 'Hidden' : 'Published',
  date: `2026-10-${String(26 - i % 26).padStart(2, '0')}`, verified: i % 3 === 0,
  content: i % 5 === 3 ? 'Người chơi đến muộn và tranh cãi về kết quả. Mong ban quản lý kiểm tra để đảm bảo tinh thần fair-play.' : 'Sân chất lượng chuẩn, đèn rất sáng và mặt sân bám tốt. Tuy nhiên nhân viên quầy giải khát tính nhầm tiền nước vào cuối trận với nhóm mình.',
  targetInfo: i % 5 === 1 || i % 5 === 3 ? 'Người chơi • Thành viên cộng đồng SportNexus' : 'Sunrise Riverside Sport Hub • Bình Thạnh, TP. HCM', notes: '',
}))
export const initialReports = Array.from({ length: 184 }, (_, i) => ({
  id: `RPT-2026-${String(i + 192).padStart(4, '0')}`, reviewId: i < 5 ? initialReviews[i].id : null,
  reporter: people[(i + 1) % people.length], entity: i < 5 ? initialReviews[i].target : targets[i % targets.length],
  category: i < 5 ? 'Review' : ['Player', 'Facility', 'Other'][i % 3],
  reason: i % 2 ? 'Hành vi thiếu fair-play' : 'Cáo buộc sai sự thật / Tranh chấp thanh toán',
  description: 'Đề nghị kiểm tra nội dung và đối chiếu thông tin từ các bên liên quan trước khi đưa ra quyết định.',
  priority: i < 3 ? 'High' : i % 2 ? 'Medium' : 'Low', status: i < 18 ? (i < 16 ? 'Open' : 'In Review') : i % 4 ? 'Resolved' : 'Dismissed',
  date: i < 5 ? '2026-10-26' : `2026-10-${String(25 - i % 25).padStart(2, '0')}`, notes: i === 0 ? 'Đã đối chiếu camera quầy giải khát. Đang liên hệ hai bên để xác minh.' : '',
  history: [{ text: 'Báo cáo đã được gửi và ghi nhận.', time: '09:10' }],
}))
export const emptyFilters = { search: '', type: '', rating: '', status: '', priority: '', category: '', from: '', to: '' }
export const isActiveReport = report => ['Open', 'In Review'].includes(report.status)
export function getSummary(reviews, reports) {
  const facilities = reviews.filter(r => r.type === 'Facility')
  const fairPlay = reviews.filter(r => r.type === 'Fair-play')
  return { total: reviews.length, reports: reports.length, average: facilities.reduce((sum, r) => sum + r.rating, 0) / (facilities.length || 1), positive: fairPlay.filter(r => r.rating >= 4).length / (fairPlay.length || 1) * 100, open: reports.filter(isActiveReport).length, resolved: reports.filter(r => !isActiveReport(r)).length, high: reports.filter(r => isActiveReport(r) && r.priority === 'High').length, flagged: reviews.filter(r => r.status === 'Flagged').length, today: reports.filter(r => isActiveReport(r) && r.date === '2026-10-26').length }
}
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase()
export function filterRecords(records, filters, tab) {
  return records.filter(r => (!filters.search || normalize([r.id, r.name, r.username, r.target, r.content, r.reporter, r.entity, r.reason].filter(Boolean).join(' ')).includes(normalize(filters.search.trim()))) && (!filters.status || (filters.status === 'Active' ? isActiveReport(r) : r.status === filters.status)) && (!filters.from || r.date >= filters.from) && (!filters.to || r.date <= filters.to) && (tab === 'reviews' ? (!filters.type || r.type === filters.type) && (!filters.rating || Math.floor(r.rating) === Number(filters.rating)) : (!filters.priority || r.priority === filters.priority) && (!filters.category || r.category === filters.category)))
}
export function updateReview(records, id, status, notes = '') { return records.map(r => r.id === id ? { ...r, status, notes: notes || r.notes } : r) }
export function updateReport(records, id, status, notes = '') { return records.map(r => r.id === id ? { ...r, status, notes: notes || r.notes, history: [...r.history, { text: `Quản trị viên: ${adminDisplayLabels[status] || status}${notes ? ` — ${notes}` : ''}`, time: new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }) }] } : r) }
export function toCsv(records, tab) {
  const columns = tab === 'reviews' ? ['id', 'name', 'username', 'type', 'target', 'rating', 'content', 'status', 'date'] : ['id', 'reporter', 'entity', 'category', 'reason', 'priority', 'status', 'date', 'notes']
  const cell = value => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`
  return '\uFEFF' + [columns, ...records.map(r => columns.map(c => r[c]))].map(row => row.map(cell).join(',')).join('\r\n')
}
