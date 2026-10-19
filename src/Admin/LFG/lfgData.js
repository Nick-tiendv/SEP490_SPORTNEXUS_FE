// Nhãn hiển thị và hàm tiện ích cho trang Quản lý ghép trận (dữ liệu thật lấy qua src/api/admin/lfgApi.js).

// Trạng thái kèo theo thống kê BE: open / filled / cancelled / expired.
export const statusLabels = { OPEN: 'Đang mở', FILLED: 'Đã đủ người', CANCELLED: 'Đã hủy', EXPIRED: 'Đã hết hạn' }
export const participantLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã xác nhận', CONFIRMED: 'Đã xác nhận', JOINED: 'Đã tham gia', REJECTED: 'Bị từ chối', CANCELLED: 'Đã hủy', LEFT: 'Đã rời' }
export const paymentLabels = { PAID: 'Đã thanh toán', UNPAID: 'Chưa thanh toán', PENDING: 'Chờ thanh toán', REFUNDED: 'Đã hoàn tiền', HELD: 'Đang giữ' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Tennis: 'Quần vợt', Football: 'Bóng đá', Basketball: 'Bóng rổ' }
export const canCancel = lfg => lfg.status === 'OPEN' || lfg.status === 'FILLED'

export const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const money = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} ₫` : '—')
// Tỉ lệ BE có thể trả 0–1 hoặc 0–100.
export const percent = value => (Number.isFinite(value) ? `${(value <= 1 ? value * 100 : value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—')
export const formatDate = value => (value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('vi-VN') : '')
export function formatTime(value) {
  if (!value) return ''
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
// Ngày chơi lấy từ `date` hoặc từ `start` nếu start là date-time đầy đủ.
export const playDate = lfg => formatDate(lfg.date || (/T/.test(lfg.start) ? lfg.start : ''))
export const playTime = lfg => [formatTime(lfg.start), formatTime(lfg.end)].filter(Boolean).join(' – ')
export const titleOf = lfg => lfg.title || [sportLabels[lfg.sport] || lfg.sport, lfg.facility].filter(Boolean).join(' · ') || 'Kèo ghép trận'
export const shortId = id => (id ? `#${id.slice(0, 8).toUpperCase()}` : '')

export function exportLfgs(lfgs) {
  const escape = value => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const rows = [['Mã kèo', 'Tiêu đề', 'Môn thể thao', 'Người tổ chức', 'Cơ sở', 'Sân', 'Ngày', 'Giờ', 'Đã có / tổng vị trí', 'Giá mỗi người (đ)', 'Trạng thái'],
    ...lfgs.map(lfg => [lfg.id, titleOf(lfg), sportLabels[lfg.sport] || lfg.sport, lfg.host.name, lfg.facility, lfg.court, playDate(lfg), playTime(lfg), `${lfg.filled ?? '?'} / ${lfg.totalSlots ?? '?'}`, lfg.pricePerPerson ?? '', statusLabels[lfg.status] || lfg.status])]
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'keo-ghep-tran.csv'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
