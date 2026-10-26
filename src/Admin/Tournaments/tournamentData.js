// Nhãn hiển thị và hàm tiện ích cho trang Quản lý giải đấu (dữ liệu thật lấy qua src/api/admin/tournamentApi.js).
// BE trả trạng thái chữ hoa (OPEN đã thấy trong response); IN_PROGRESS / FINISHED / CANCELLED suy ra từ thống kê.

export const statusLabels = { DRAFT: 'Bản nháp', OPEN: 'Đang mở đăng ký', IN_PROGRESS: 'Đang diễn ra', INPROGRESS: 'Đang diễn ra', FINISHED: 'Đã kết thúc', COMPLETED: 'Đã kết thúc', CANCELLED: 'Đã hủy' }
// Bộ lọc trạng thái gửi lên GET /api/v1/admin/tournaments?status=
export const statusFilterOptions = ['OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']
// Loại hạng mục: khi tạo giải gửi số (0, 1, 2); response trả chữ (SINGLES…).
export const categoryTypeLabels = { 0: 'Đơn', 1: 'Đôi', 2: 'Đồng đội', SINGLES: 'Đơn', DOUBLES: 'Đôi', TEAM: 'Đồng đội' }
export const formatLabels = { Knockout: 'Loại trực tiếp', RoundRobin: 'Vòng tròn', DoubleElimination: 'Nhánh thắng – thua' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Football: 'Bóng đá', Basketball: 'Bóng rổ', Tennis: 'Quần vợt' }
export const matchLabels = { Scheduled: 'Đã lên lịch', Pending: 'Chờ thi đấu', Ongoing: 'Đang thi đấu', InProgress: 'Đang thi đấu', Completed: 'Đã hoàn thành', Finished: 'Đã hoàn thành', Bye: 'Miễn vòng', Waiting: 'Chờ kết quả vòng trước' }

// Giải đã kết thúc / đã hủy thì không thao tác nhánh đấu, người tham gia nữa.
export const isClosed = tournament => /complete|cancel|finish/i.test(tournament.status)
export const statusBadge = status => (/cancel/i.test(status) ? 'Cancelled' : /complete|finish/i.test(status) ? 'Completed' : /regist|open/i.test(status) ? 'Confirmed' : 'Pending')

export const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const money = value => (Number.isFinite(value) ? `${value.toLocaleString('vi-VN')} ₫` : '—')
export const date = value => (value ? value.split('-').reverse().join('/') : '—')

// Thẻ KPI từ GET /api/v1/admin/tournaments/statistics.
export function tournamentStats(stats) {
  return [
    { label: 'Tổng giải đấu', value: stats.totalTournaments, note: `${number(stats.subTournaments)} hạng mục · ${number(stats.locked)} bị khóa`, icon: 'total' },
    { label: 'Đang mở đăng ký', value: stats.open, note: 'Đang nhận người tham gia', icon: 'open' },
    { label: 'Đang diễn ra', value: stats.inProgress, note: 'Đang thi đấu', icon: 'upcoming' },
    { label: 'Đã kết thúc', value: stats.finished, note: `${number(stats.cancelled)} giải đã hủy`, icon: 'completed' },
    { label: 'Tổng người tham gia', value: stats.totalParticipants, note: `Phí trả chủ sân ${money(stats.entryFeesToOwners)}`, icon: 'participants' },
  ]
}

export function exportTournaments(tournaments) {
  const escape = value => { const text = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const rows = [['Mã giải', 'Tên giải', 'Môn thể thao', 'Cơ sở', 'Ban tổ chức', 'Thể thức', 'Số hạng mục', 'Trạng thái', 'Đã khóa', 'Người tham gia', 'Quỹ giải thưởng (đ)', 'Đã trả thưởng (đ)'],
    ...tournaments.map(t => [t.id, t.name, sportLabels[t.sport] || t.sport, t.facility, t.organizer, formatLabels[t.format] || t.format, t.subTournamentCount ?? '', statusLabels[t.status] || t.status, t.locked ? `Có — ${t.lockReason}` : 'Không', t.registered ?? '', t.prize ?? '', t.prizePaid ?? ''])]
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'giai-dau.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
