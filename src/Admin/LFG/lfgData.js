// Independent platform snapshots and fictional local monitoring records.
export const lfgStats = [
  { label: 'Tổng kèo ghép trận', value: 1845, note: '+18,5% so với tháng trước', icon: 'total' },
  { label: 'Kèo đang mở', value: 486, note: 'Đang tìm người tham gia', icon: 'open' },
  { label: 'Nhóm đã đủ người', value: 1120, note: 'Số liệu minh họa riêng', icon: 'full' },
  { label: 'Kèo đã hoàn thành', value: 1620, note: 'Theo dõi hoạt động mẫu', icon: 'completed' },
  { label: 'Kèo đã hủy', value: 64, note: 'Số liệu minh họa riêng', icon: 'cancelled' },
]
export const statusLabels = { Open: 'Đang mở', Full: 'Đã đủ người', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Tennis: 'Quần vợt', Football: 'Bóng đá' }
export const slotLabels = { Occupied: 'Đã xác nhận', Pending: 'Chờ xác nhận', Available: 'Còn trống' }
export const number = value => value.toLocaleString('vi-VN')
export const money = value => `${number(value)} đ`
export const date = value => value.split('-').reverse().join('/')
export const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
export function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const iso = `${match[3]}-${match[2]}-${match[1]}`, parsed = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null
}
export const paidAmount = activity => activity.slots.reduce((sum, slot) => sum + (slot.paid ? activity.courtFee / activity.slots.length : 0), 0)
export const escrowLabel = activity => activity.status === 'Cancelled' ? 'Chờ rà soát minh họa; chưa xử lý tiền' : activity.status === 'Completed' ? 'Đã đối soát minh họa' : 'Đang giữ ký quỹ minh họa'

const players = [
  { id: 'DEMO-LFG-P1', name: 'Lê Hoàng Nam', username: 'nam_le', rating: 'Elo 1.650', reliability: '99,4%' },
  { id: 'DEMO-LFG-P2', name: 'Minh Minh Minh', username: 'minhminh', rating: 'Elo 1.420', reliability: '98,1%' },
  { id: 'DEMO-LFG-P3', name: 'Trần Đình Khang', username: 'khang_tran', rating: 'Elo 1.380', reliability: '97,5%' },
  { id: 'DEMO-LFG-P4', name: 'Vũ Thị Mai Anh', username: 'maianh_vu', rating: 'Elo 1.510', reliability: '98,7%' },
  { id: 'DEMO-LFG-P5', name: 'Nguyễn Văn An', username: 'an_nguyen', rating: 'Elo 1.350', reliability: '96,2%' },
]
const venues = [
  { id: 'LFG-VENUE-01', name: 'Sunrise Riverside Sport Hub', court: 'Sân cầu lông 04', sport: 'Badminton', address: 'Nguyễn Hữu Thọ, Nhà Bè, TP. Hồ Chí Minh' },
  { id: 'LFG-VENUE-02', name: 'Trung tâm thể thao Thảo Điền', court: 'Sân Pickleball 01', sport: 'Pickleball', address: 'Quốc Hương, Thủ Đức, TP. Hồ Chí Minh' },
  { id: 'LFG-VENUE-01', name: 'Sunrise Riverside Sport Hub', court: 'Sân cầu lông 02', sport: 'Badminton', address: 'Nguyễn Hữu Thọ, Nhà Bè, TP. Hồ Chí Minh' },
  { id: 'LFG-VENUE-04', name: 'CLB quần vợt An Phú', court: 'Sân quần vợt 01', sport: 'Tennis', address: 'Mai Chí Thọ, Thủ Đức, TP. Hồ Chí Minh' },
  { id: 'LFG-VENUE-05', name: 'Sân bóng đá Phú Thọ', court: 'Sân bóng đá 02', sport: 'Football', address: 'Lý Thường Kiệt, Quận 11, TP. Hồ Chí Minh' },
]
const samples = [
  [0, 0, 'Open', '2026-10-15'], [1, 1, 'Full', '2026-10-16'], [2, 2, 'Completed', '2026-10-17'],
  [3, 3, 'Open', '2026-10-14'], [4, 1, 'Cancelled', '2026-10-13'], [0, 4, 'Full', '2026-10-18'],
  [1, 0, 'Open', '2026-10-20'], [2, 1, 'Cancelled', '2026-10-21'], [3, 2, 'Completed', '2026-10-22'],
  [4, 3, 'Full', '2026-10-23'], [0, 4, 'Open', '2026-10-24'], [1, 0, 'Completed', '2026-10-25'],
  [2, 1, 'Open', '2026-10-26'], [3, 2, 'Full', '2026-10-27'], [4, 3, 'Cancelled', '2026-10-28'],
]
export const initialActivities = samples.map(([hostIndex, venueIndex, status, bookedDate], index) => {
  const host = players[hostIndex], venue = venues[venueIndex]
  const capacity = venue.sport === 'Football' ? 10 : 4
  const members = [host, ...players.filter(player => player.id !== host.id)]
  const slots = Array.from({ length: capacity }, (_, slotIndex) => {
    const filled = status === 'Full' || status === 'Completed'
    const slotStatus = filled || slotIndex < 2 ? 'Occupied' : slotIndex === 2 ? 'Pending' : 'Available'
    const player = slotStatus === 'Available' ? null : members[slotIndex] || { id: `DEMO-LFG-GUEST-${index}-${slotIndex}`, name: `Người chơi mẫu ${slotIndex + 1}`, username: `nguoi_choi_${slotIndex + 1}`, rating: 'Elo 1.300', reliability: '97,0%' }
    return { id: slotIndex + 1, status: slotStatus, player, paid: slotStatus === 'Occupied' && (status === 'Completed' || slotIndex < 2), claimTime: player ? `18:${String(30 + slotIndex * 2).padStart(2, '0')}` : null }
  })
  const reports = [0, 4, 7].includes(index) ? [{ id: `DEMO-REPORT-${index + 1}`, reason: 'Người chơi báo thông tin trình độ chưa rõ ràng.', description: 'Nội dung báo cáo minh họa để kiểm tra giao diện rà soát; chưa kết luận vi phạm.', time: '18:50', reviewed: false }] : []
  return { id: `LFG-${1842 - index}`, title: `${sportLabels[venue.sport]} ${index === 0 ? 'buổi tối' : 'giao lưu'} · ${venue.name}`, host, venue, status, date: bookedDate,
    start: '19:00', end: '21:00', skill: venue.sport === 'Pickleball' ? 'DUPR 3,0 – 4,0' : 'Trình độ trung bình', courtFee: venue.sport === 'Football' ? 600000 : 240000,
    slots, reports, bookingId: index === 0 ? 'SN-2026-001245' : null,
    history: [{ id: 'created', time: '18:30', text: `${host.name} tạo kèo minh họa.` }, ...slots.filter(slot => slot.player).map(slot => ({ id: `claim-${slot.id}`, time: slot.claimTime, text: `${slot.player.name} ${slot.status === 'Pending' ? 'yêu cầu vị trí' : 'nhận vị trí'} ${slot.id}.` })),
      ...slots.filter(slot => slot.paid).map(slot => ({ id: `paid-${slot.id}`, time: '18:48', text: `Ghi nhận thanh toán minh họa của ${slot.player.name}.` })),
      ...reports.map(report => ({ id: report.id, time: report.time, text: 'Nhận báo cáo minh họa; chưa có kết luận.' })),
      ...(status === 'Completed' || status === 'Cancelled' ? [{ id: 'status', ...(status === 'Completed' ? { date: bookedDate } : {}), time: status === 'Completed' ? '21:05' : '18:55', text: `Trạng thái mẫu: ${statusLabels[status]}.` }] : [])],
    historyDate: '2026-10-10', moderationReason: status === 'Cancelled' ? 'Người tổ chức thay đổi lịch (dữ liệu minh họa).' : null,
  }
})

export function exportActivities(activities) {
  const escape = value => { const text = String(value); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const rows = [['Mã kèo', 'Tiêu đề', 'Môn thể thao', 'Người tổ chức', 'Cơ sở', 'Sân', 'Ngày', 'Giờ bắt đầu', 'Giờ kết thúc', 'Trạng thái', 'Sức chứa', 'Vị trí đã xác nhận', 'Tổng tiền sân (đ)', 'Đã thanh toán (đ)', 'Còn lại (đ)', 'Số báo cáo'],
    ...activities.map(activity => [activity.id, activity.title, sportLabels[activity.venue.sport], activity.host.name, activity.venue.name, activity.venue.court, date(activity.date), activity.start, activity.end, statusLabels[activity.status], activity.slots.length, activity.slots.filter(slot => slot.status === 'Occupied').length, activity.courtFee, paidAmount(activity), activity.courtFee - paidAmount(activity), activity.reports.length])]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'keo-ghep-tran-minh-hoa.csv'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
