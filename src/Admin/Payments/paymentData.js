// Nhãn hiển thị và hàm tiện ích cho trang Quản lý thanh toán (dữ liệu thật lấy qua src/api/admin/walletApi.js).

// Loại giao dịch BE trả về dạng chữ hoa (ví dụ DEPOSIT). Loại chưa có trong bảng sẽ hiển thị nguyên giá trị.
// BE (TransactionType) chỉ có 5 loại: DEPOSIT, FREEZE, PAYOUT, REFUND, RELEASE; các nhãn còn lại để hiển thị dữ liệu cũ.
export const typeLabels = {
  DEPOSIT: 'Nạp tiền', FREEZE: 'Tạm giữ', PAYOUT: 'Chi trả', REFUND: 'Hoàn tiền', RELEASE: 'Chuyển tiền giữ',
  WITHDRAWAL: 'Rút tiền', WITHDRAW: 'Rút tiền', PAYMENT: 'Thanh toán', BOOKING_PAYMENT: 'Thanh toán đặt sân',
  EARNING: 'Doanh thu chủ sân', COMMISSION: 'Hoa hồng nền tảng', ADJUSTMENT: 'Điều chỉnh', TOURNAMENT_FEE: 'Phí giải đấu', PRIZE: 'Tiền thưởng',
}
// Bộ lọc loại giao dịch: chỉ gửi các giá trị GET /api/v1/admin/wallets/transactions?type= chấp nhận
export const TRANSACTION_TYPE_FILTERS = ['DEPOSIT', 'FREEZE', 'PAYOUT', 'REFUND', 'RELEASE']
export const transactionStatusLabels = { SUCCESS: 'Thành công', PENDING: 'Đang xử lý', FAILED: 'Thất bại', CANCELLED: 'Đã hủy' }
export const withdrawalStatusLabels = { PENDING: 'Chờ duyệt', COMPLETED: 'Đã chuyển tiền', REJECTED: 'Đã từ chối' }
export const roleLabels = { Player: 'Người chơi', Owner: 'Chủ sân', Admin: 'Quản trị viên' }
// Map trạng thái → kiểu StatusBadge (Confirmed xanh, Pending vàng, Cancelled đỏ, Completed xanh dương).
export const badgeOf = status => (/success|complete|approved/i.test(status) ? 'Confirmed' : /pending|processing/i.test(status) ? 'Pending' : /refund/i.test(status) ? 'Completed' : 'Cancelled')

export const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const money = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} ₫` : '—')
export const signedMoney = value => (Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toLocaleString('vi-VN')} ₫` : '—')
export const dateTime = value => (value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—')
export const shortId = id => (id ? `#${id.slice(0, 8).toUpperCase()}` : '—')

export const CHART_RANGES = { '7 ngày': 7, '30 ngày': 30, '90 ngày': 90 }
const toApiDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
// Khoảng N ngày gần nhất cho API thống kê.
export function lastDays(days, now = new Date()) {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - (days - 1))
  return { from: toApiDate(from), to: toApiDate(to) }
}

export function downloadCsv(filename, header, rows) {
  const escape = value => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const url = URL.createObjectURL(new Blob(['﻿' + [header, ...rows].map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
