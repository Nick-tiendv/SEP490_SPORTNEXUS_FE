// Lý do hủy / rời kèo: BE trả danh sách cố định (GET /api/v1/lfgs/cancel-reasons), mục "Lý do khác" cho nhập tự do.
export const isOtherReason = (value) => !value || /khác/i.test(value)

// Lý do cuối cùng gửi lên BE: chọn "Lý do khác" (hoặc không có danh sách) thì lấy phần nhập tay
export const finalReason = (picked, custom) => (isOtherReason(picked) ? String(custom || '').trim() : picked)
