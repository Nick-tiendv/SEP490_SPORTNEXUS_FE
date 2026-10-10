// Fictional monitoring prototype. Global snapshots are separate from table records.
export const bookingStats = [
  { label: 'Tổng đơn đặt sân', value: 94620, trend: '+23,6% so với tháng trước', icon: 'total' },
  { label: 'Đã xác nhận', value: 84120, trend: '88,9% tổng đơn minh họa', icon: 'confirmed' },
  { label: 'Hoàn thành', value: 78450, trend: '82,9% tổng đơn minh họa', icon: 'completed' },
  { label: 'Đã hủy', value: 3820, trend: '4,0% tỷ lệ hủy minh họa', icon: 'cancelled' },
  { label: 'Doanh thu đặt sân', value: 4850000000, trend: '+18,9% so với tháng trước', icon: 'revenue' },
]
export const bookingStatusLabels = { Confirmed: 'Đã xác nhận', Completed: 'Hoàn thành', Cancelled: 'Đã hủy', Pending: 'Chờ xác nhận' }
export const paymentStatusLabels = { Paid: 'Đã thanh toán', Partial: 'Thanh toán một phần', Unpaid: 'Chưa thanh toán' }
export const escrowLabels = { Held: 'Đang giữ tiền minh họa', Released: 'Đã đối soát minh họa', None: 'Chưa có tiền ký quỹ minh họa', Review: 'Chờ rà soát minh họa' }
export const sportLabels = { Pickleball: 'Pickleball', Badminton: 'Cầu lông', Tennis: 'Quần vợt', Football: 'Bóng đá' }
export const number = value => value.toLocaleString('vi-VN')
export const money = value => `${number(value)} đ`
export const date = value => value.split('-').reverse().join('/')
export function parseBookingDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const parsed = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null
}
export const bookingTotal = booking => booking.charges.reduce((total, charge) => total + charge.amount, 0)
export const paidTotal = booking => booking.members.reduce((total, member) => total + (member.paid ? member.amount : 0), 0)
export const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

const venues = [
  { id: 'DEMO-FAC-01', name: 'Sunrise Riverside Sport Hub', court: 'Sân Pickleball Pro 01', sport: 'Pickleball', address: 'Đường Nguyễn Hữu Thọ, Nhà Bè, TP. Hồ Chí Minh', owner: 'Nguyễn Văn A' },
  { id: 'DEMO-FAC-04', name: 'Bình Thạnh Arena', court: 'Sân cầu lông 03', sport: 'Badminton', address: 'Đường Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh', owner: 'Trần Quốc Bảo' },
  { id: 'DEMO-FAC-02', name: 'CLB Pickleball Phú Mỹ Hưng', court: 'Sân Pickleball 02', sport: 'Pickleball', address: 'Đường Tân Phú, Quận 7, TP. Hồ Chí Minh', owner: 'Nguyễn Văn A' },
  { id: 'DEMO-FAC-07', name: 'CLB quần vợt An Phú', court: 'Sân quần vợt 01', sport: 'Tennis', address: 'Đường Mai Chí Thọ, Thủ Đức, TP. Hồ Chí Minh', owner: 'Lê Thị Mỹ Hương' },
  { id: 'DEMO-FAC-06', name: 'Sân bóng đá Phú Thọ', court: 'Sân bóng đá 02', sport: 'Football', address: 'Đường Lý Thường Kiệt, Quận 11, TP. Hồ Chí Minh', owner: 'Trần Quốc Bảo' },
]
const players = [
  { id: 'DEMO-PLAYER-01', name: 'Lê Hoàng Nam', username: 'nam_le', email: 'nam.le@example.com' },
  { id: 'DEMO-PLAYER-02', name: 'Minh Minh Minh', username: 'minhminh', email: 'minh.minh@example.com' },
  { id: 'DEMO-PLAYER-03', name: 'Trần Đình Khang', username: 'khang_tran', email: 'khang.tran@example.com' },
  { id: 'DEMO-PLAYER-04', name: 'Nguyễn Minh Trí', username: 'tri_nguyen', email: 'tri.nguyen@example.com' },
  { id: 'DEMO-PLAYER-05', name: 'Vũ Thị Mai Anh', username: 'maianh_vu', email: 'mai.anh@example.com' },
]
const samples = [
  [0, 0, 'Confirmed', 'Paid', '2026-10-28'], [1, 1, 'Completed', 'Paid', '2026-10-26'],
  [2, 0, 'Confirmed', 'Partial', '2026-10-29'], [3, 2, 'Cancelled', 'Unpaid', '2026-10-27'],
  [4, 3, 'Pending', 'Unpaid', '2026-10-30'], [0, 4, 'Completed', 'Paid', '2026-10-24'],
  [1, 2, 'Confirmed', 'Paid', '2026-10-31'], [2, 1, 'Cancelled', 'Partial', '2026-11-01'],
  [3, 3, 'Confirmed', 'Partial', '2026-11-02'], [4, 4, 'Pending', 'Unpaid', '2026-11-03'],
  [0, 0, 'Completed', 'Paid', '2026-10-22'], [1, 1, 'Confirmed', 'Paid', '2026-11-05'],
  [2, 2, 'Cancelled', 'Paid', '2026-10-23'], [3, 3, 'Completed', 'Paid', '2026-10-25'],
  [4, 4, 'Confirmed', 'Partial', '2026-11-06'],
]
export const initialBookings = samples.map(([playerIndex, venueIndex, status, payment, bookedDate], index) => {
  const player = players[playerIndex], venue = venues[venueIndex]
  const charges = [
    { label: '18:00 – 19:00 · Tiền thuê sân', amount: 120000 },
    { label: '19:00 – 20:00 · Tiền thuê sân', amount: 120000 },
    { label: venue.sport === 'Pickleball' ? 'Thuê 2 vợt và 1 bộ bóng' : 'Thuê dụng cụ và nước uống', amount: 235000 },
    { label: 'Phí nền tảng minh họa', amount: 0 },
  ]
  const total = charges.reduce((sum, charge) => sum + charge.amount, 0)
  const memberNames = [player.name, ...players.filter(item => item.id !== player.id).slice(0, 3).map(item => item.name)]
  const members = memberNames.map((name, memberIndex) => ({ name, host: memberIndex === 0, amount: total / 4, paid: payment === 'Paid' || (payment === 'Partial' && memberIndex < 2) }))
  return { id: `SN-2026-${String(1245 - index).padStart(6, '0')}`, player, venue, status, payment, date: bookedDate,
    start: '18:00', end: '20:00', duration: 2, createdDate: '2026-10-20', createdTime: '15:10', charges, members,
    escrow: status === 'Cancelled' && payment !== 'Unpaid' ? 'Review' : payment === 'Unpaid' ? 'None' : status === 'Completed' ? 'Released' : 'Held',
    cancellationReason: status === 'Cancelled' ? (index === 3 ? 'Người đặt thay đổi lịch cá nhân (lý do minh họa).' : 'Nhóm không thể tham gia theo lịch đã chọn (lý do minh họa).') : null,
  }
})

export function exportBookings(bookings) {
  const escape = value => {
    const text = String(value)
    return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`
  }
  const rows = [['Mã đơn đặt sân', 'Người đặt', 'Cơ sở', 'Sân', 'Môn thể thao', 'Ngày đặt sân', 'Giờ bắt đầu', 'Giờ kết thúc', 'Trạng thái', 'Thanh toán', 'Tổng tiền (đ)', 'Đã thanh toán (đ)', 'Trạng thái ký quỹ'],
    ...bookings.map(booking => [booking.id, booking.player.name, booking.venue.name, booking.venue.court, sportLabels[booking.venue.sport], date(booking.date), booking.start, booking.end, bookingStatusLabels[booking.status], paymentStatusLabels[booking.payment], bookingTotal(booking), paidTotal(booking), escrowLabels[booking.escrow]])]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'don-dat-san-minh-hoa.csv'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
