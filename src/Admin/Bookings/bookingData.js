// Nhãn hiển thị và hàm tiện ích cho trang Quản lý đặt sân (dữ liệu thật lấy qua src/api/admin/bookingApi.js).

// BookingStatus của BE (cũng là giá trị Status gửi lên /api/v1/bookings/admin): PENDING | PAID | CHECKED_IN | CANCELLED.
export const bookingStatusLabels = { PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', CHECKED_IN: 'Đã check-in', CANCELLED: 'Đã hủy' }
// Màu badge (class admin-status-*) theo trạng thái.
export const bookingStatusTone = { PENDING: 'Pending', PAID: 'Confirmed', CHECKED_IN: 'Completed', CANCELLED: 'Cancelled' }
export const paymentStatusLabels = { Paid: 'Đã thanh toán', Partial: 'Thanh toán một phần', PartiallyPaid: 'Thanh toán một phần', Unpaid: 'Chưa thanh toán', Pending: 'Chờ thanh toán', Refunded: 'Đã hoàn tiền', Failed: 'Thất bại' }
export const sportLabels = { Pickleball: 'Pickleball', Badminton: 'Cầu lông', Tennis: 'Quần vợt', Football: 'Bóng đá', Basketball: 'Bóng rổ' }
export const canCancel = booking => ['PENDING', 'PAID'].includes(booking.status)

export const number = value => (Number(value) || 0).toLocaleString('vi-VN')
export const money = value => `${number(value)} ₫`
export const date = value => (value ? value.split('-').reverse().join('/') : '—')
export function parseBookingDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const parsed = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null
}
export const bookingTotal = booking => booking.amount || booking.charges.reduce((total, charge) => total + charge.amount, 0)
export const paidTotal = booking => booking.members.reduce((total, member) => total + (member.paid ? member.amount : 0), 0)

export function exportBookings(bookings) {
  const escape = value => {
    const text = String(value ?? '')
    return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`
  }
  const rows = [['Mã đơn đặt sân', 'Người đặt', 'Cơ sở', 'Sân', 'Môn thể thao', 'Ngày đặt sân', 'Giờ bắt đầu', 'Giờ kết thúc', 'Trạng thái', 'Thanh toán', 'Tổng tiền (đ)'],
    ...bookings.map(booking => [booking.id, booking.player.name, booking.venue.name, booking.venue.court, sportLabels[booking.venue.sport] || booking.venue.sport, date(booking.date), booking.start, booking.end, bookingStatusLabels[booking.status] || booking.status, paymentStatusLabels[booking.payment] || booking.payment, bookingTotal(booking)])]
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'don-dat-san.csv'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
