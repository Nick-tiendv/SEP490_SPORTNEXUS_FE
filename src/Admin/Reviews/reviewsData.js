// Nhãn hiển thị và hàm tiện ích cho trang Đánh giá & Báo cáo (dữ liệu thật lấy qua src/api/admin/reportApi.js).
// Enum theo BE: ReportStatus, ReportTargetType (ReportEnums.cs) và Decision của AdminResolveReportRequest.

export const reportStatusLabels = { PENDING: 'Chờ xử lý', OWNER_RESPONDED: 'Chủ sân đã giải trình', RESOLVED_REFUNDED: 'Đã hoàn tiền', RESOLVED_NO_REFUND: 'Đã xử lý, không hoàn tiền', REJECTED: 'Đã bác bỏ', WITHDRAWN: 'Người báo cáo đã rút' }
export const targetTypeLabels = { BOOKING: 'Đặt sân', FACILITY: 'Cơ sở thể thao', USER: 'Người chơi', COMMUNITY_POST: 'Bài viết cộng đồng' }
// Giá trị `decision` gửi lên POST /reports/admin/{id}/resolve: REFUND | RESOLVE_NO_REFUND | REJECT.
export const decisionOptions = [
  { value: 'REFUND', label: 'Chấp nhận, hoàn tiền cho người báo cáo' },
  { value: 'RESOLVE_NO_REFUND', label: 'Chấp nhận, không hoàn tiền' },
  { value: 'REJECT', label: 'Bác bỏ báo cáo (không vi phạm)' },
]
// 'OwnerResponded' / 'owner_responded' -> 'OWNER_RESPONDED'
export const toEnumKey = value => String(value ?? '').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
export const label = value => reportStatusLabels[value] || targetTypeLabels[value] || value || '—'
export const isActiveReport = report => ['PENDING', 'OWNER_RESPONDED'].includes(report.status)

export const emptyFilters = { search: '', status: '', targetType: '', responded: '', from: '', to: '' }

export function toCsv(records) {
  const columns = [['id', 'Mã báo cáo'], ['reporter', 'Người báo cáo'], ['entity', 'Đối tượng'], ['targetType', 'Loại'], ['reason', 'Lý do'], ['status', 'Trạng thái'], ['date', 'Ngày tạo'], ['notes', 'Ghi chú quản trị']]
  const cell = value => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`
  return '﻿' + [columns.map(([, title]) => title), ...records.map(r => columns.map(([key]) => (key === 'status' || key === 'targetType' ? label(r[key]) : r[key])))].map(row => row.map(cell).join(',')).join('\r\n')
}
