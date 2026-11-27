// Nhãn hiển thị và hàm tiện ích cho trang Đánh giá & Báo cáo (dữ liệu thật lấy qua src/api/admin/reportApi.js).
// Enum theo BE: ReportStatus, ReportTargetType (ReportEnums.cs) và Decision của AdminResolveReportRequest.

export const reportStatusLabels = { PENDING: 'Chờ xử lý', OWNER_RESPONDED: 'Chủ sân đã giải trình', RESOLVED_REFUNDED: 'Đã hoàn tiền', RESOLVED_NO_REFUND: 'Đã xử lý, không hoàn tiền', REJECTED: 'Đã bác bỏ', WITHDRAWN: 'Người báo cáo đã rút' }
export const targetTypeLabels = { BOOKING: 'Đặt sân', FACILITY: 'Cơ sở thể thao', USER: 'Người chơi', COMMUNITY_POST: 'Bài viết cộng đồng', POST_COMMENT: 'Bình luận', MATCH: 'Kết quả trận đấu', FACILITY_REVIEW: 'Đánh giá cơ sở' }
// Giá trị `decision` gửi lên POST /reports/admin/{id}/resolve: REFUND | RESOLVE_NO_REFUND | FORCE_MAJEURE | REJECT.
// bookingOnly: REFUND và FORCE_MAJEURE chỉ áp dụng cho khiếu nại đơn đặt sân (BE trả 400 với loại khác).
export const decisionOptions = [
  { value: 'REFUND', label: 'Chấp nhận, hoàn tiền cho người báo cáo', bookingOnly: true },
  { value: 'RESOLVE_NO_REFUND', label: 'Chấp nhận, không hoàn tiền' },
  { value: 'FORCE_MAJEURE', label: 'Bất khả kháng do thời tiết: không hoàn, tặng mã 5%', bookingOnly: true },
  { value: 'REJECT', label: 'Bác bỏ báo cáo (không vi phạm)' },
]
// 'OwnerResponded' / 'owner_responded' -> 'OWNER_RESPONDED'
export const toEnumKey = value => String(value ?? '').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
export const label = value => reportStatusLabels[value] || targetTypeLabels[value] || value || '—'
export const isActiveReport = report => ['PENDING', 'OWNER_RESPONDED'].includes(report.status)
export const hasPendingFairPlayPenalty = report => report?.pendingFairPlayDelta !== null && report?.pendingFairPlayDelta !== undefined
export const formatPendingFairPlayDelta = delta => {
  if (delta === null || delta === undefined || !Number.isFinite(Number(delta))) return ''
  const num = Number(delta)
  return `${num > 0 ? `+${num}` : num} điểm`
}

export const emptyFilters = { search: '', status: '', targetType: '', responded: '', from: '', to: '' }

export function toCsv(records) {
  const columns = [['id', 'Mã báo cáo'], ['reporter', 'Người báo cáo'], ['entity', 'Đối tượng'], ['targetType', 'Loại'], ['reason', 'Lý do'], ['status', 'Trạng thái'], ['date', 'Ngày tạo'], ['notes', 'Ghi chú quản trị']]
  const cell = value => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""')}"`
  return '﻿' + [columns.map(([, title]) => title), ...records.map(r => columns.map(([key]) => (key === 'status' || key === 'targetType' ? label(r[key]) : r[key])))].map(row => row.map(cell).join(',')).join('\r\n')
}

// ---------- Khiếu nại kết quả trận (targetType MATCH) ----------
// Quy trình: đấu thủ khiếu nại → trọng tài gửi biên bản → BTC quyết định → người khiếu nại chuyển Admin → Admin đóng.
// Admin chỉ phân xử khi đã được chuyển lên (isEscalatedToAdmin) và chưa đóng; trước đó là việc của BTC.
export const isMatchComplaint = report => report?.targetType === 'MATCH'
export const awaitingAdmin = report => isMatchComplaint(report) && report.escalated && !report.escalationClosed && isActiveReport(report)
// POST /reports/admin/{id}/resolve với khiếu nại trận: RESOLVE_NO_REFUND (khiếu nại đúng) | REJECT (bác)
export const matchDecisionOptions = [
  { value: 'RESOLVE_NO_REFUND', label: 'Khiếu nại đúng', hint: 'Kết luận khiếu nại có cơ sở. Cần đổi kết quả thì dùng "Sửa tỉ số & đóng".' },
  { value: 'REJECT', label: 'Bác, giữ nguyên kết quả', hint: 'Kết quả trận giữ nguyên.' },
]
