// Nhãn hiển thị và hàm tiện ích cho trang Quản lý giải đấu (dữ liệu thật lấy qua src/api/admin/tournamentApi.js).
// Các giá trị enum là phỏng đoán — cần đối chiếu với BE.

export const statusLabels = { Draft: 'Bản nháp', Registration: 'Đang mở đăng ký', Open: 'Đang mở đăng ký', Upcoming: 'Sắp diễn ra', Ongoing: 'Đang diễn ra', InProgress: 'Đang diễn ra', Completed: 'Đã hoàn thành', Cancelled: 'Đã hủy' }
// Bộ lọc trạng thái gửi lên GET /api/v1/tournaments?status=
export const statusFilterOptions = ['Draft', 'Registration', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled']
// TournamentCategoryType (enum số 0, 1, 2 trong swagger).
export const categoryTypeLabels = { 0: 'Đơn', 1: 'Đôi', 2: 'Đồng đội' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Football: 'Bóng đá', Basketball: 'Bóng rổ', Tennis: 'Quần vợt' }
export const matchLabels = { Scheduled: 'Đã lên lịch', Pending: 'Chờ thi đấu', Ongoing: 'Đang thi đấu', InProgress: 'Đang thi đấu', Completed: 'Đã hoàn thành', Finished: 'Đã hoàn thành', Bye: 'Miễn vòng', Waiting: 'Chờ kết quả vòng trước' }

export const isLocked = tournament => /complete|cancel|finish/i.test(tournament.status)
export const statusBadge = status => (/cancel/i.test(status) ? 'Cancelled' : /complete|finish/i.test(status) ? 'Completed' : /regist|open/i.test(status) ? 'Confirmed' : 'Pending')

export const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const money = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} ₫` : '—')
export const date = value => (value ? value.split('-').reverse().join('/') : '—')
export const normalize = value => String(value ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
export function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const iso = `${match[3]}-${match[2]}-${match[1]}`, parsed = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null
}

export function tournamentStats(tournaments) {
  const count = pattern => tournaments.filter(t => pattern.test(t.status)).length
  const participants = tournaments.reduce((sum, t) => sum + (t.registered || 0), 0)
  return [
    { label: 'Tổng giải đấu', value: tournaments.length, note: 'Theo bộ lọc hiện tại', icon: 'total' },
    { label: 'Đang mở đăng ký', value: count(/regist|open/i), note: 'Đang nhận người tham gia', icon: 'open' },
    { label: 'Sắp / đang diễn ra', value: count(/upcoming|ongoing|progress/i), note: 'Chuẩn bị hoặc đang thi đấu', icon: 'upcoming' },
    { label: 'Đã hoàn thành', value: count(/complete|finish/i), note: 'Đã có kết quả', icon: 'completed' },
    { label: 'Tổng người tham gia', value: tournaments.some(t => t.registered != null) ? participants : NaN, note: 'Cộng từ các giải', icon: 'participants' },
  ]
}

export function exportTournaments(tournaments) {
  const escape = value => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const rows = [['Mã giải', 'Tên giải', 'Môn thể thao', 'Cơ sở', 'Ban tổ chức', 'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', 'Đã đăng ký', 'Sức chứa', 'Phí tham gia (đ)', 'Giải thưởng (đ)'],
    ...tournaments.map(t => [t.id, t.name, sportLabels[t.sport] || t.sport, t.facility, t.organizer, date(t.starts), date(t.ends), statusLabels[t.status] || t.status, t.registered ?? '', t.capacity ?? '', t.entryFee ?? '', t.prize ?? ''])]
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'giai-dau.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
