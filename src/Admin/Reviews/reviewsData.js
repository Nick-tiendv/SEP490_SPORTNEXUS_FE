// Nhãn hiển thị và hàm tiện ích cho trang Đánh giá & Báo cáo (dữ liệu thật lấy qua src/api/admin/reportApi.js).
// Các giá trị enum (trạng thái, loại đối tượng, quyết định) là phỏng đoán — cần đối chiếu với BE.

export const reportStatusLabels = { Pending: 'Đang chờ xử lý', InReview: 'Đang xem xét', OwnerResponded: 'Chủ sân đã phản hồi', Resolved: 'Đã giải quyết', Rejected: 'Đã bác bỏ', Withdrawn: 'Đã rút' }
export const targetTypeLabels = { Booking: 'Đặt sân', Facility: 'Cơ sở thể thao', User: 'Người chơi', Player: 'Người chơi', CommunityPost: 'Bài viết cộng đồng', Post: 'Bài viết cộng đồng', Review: 'Đánh giá', Other: 'Khác' }
// Giá trị `decision` gửi lên POST /reports/admin/{id}/resolve.
export const decisionOptions = [
  { value: 'Approved', label: 'Chấp nhận báo cáo (xác nhận vi phạm)' },
  { value: 'Rejected', label: 'Bác bỏ báo cáo (không vi phạm)' },
]
export const label = value => reportStatusLabels[value] || targetTypeLabels[value] || value || '—'
export const isActiveReport = report => !/resolv|reject|dismiss|withdraw|closed/i.test(report.status)

export const emptyFilters = { search: '', status: '', targetType: '', responded: '', from: '', to: '' }

export function toCsv(records) {
  const columns = [['id', 'Mã báo cáo'], ['reporter', 'Người báo cáo'], ['entity', 'Đối tượng'], ['targetType', 'Loại'], ['reason', 'Lý do'], ['status', 'Trạng thái'], ['date', 'Ngày tạo'], ['notes', 'Ghi chú quản trị']]
  const cell = value => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`
  return '﻿' + [columns.map(([, title]) => title), ...records.map(r => columns.map(([key]) => (key === 'status' || key === 'targetType' ? label(r[key]) : r[key])))].map(row => row.map(cell).join(',')).join('\r\n')
}
