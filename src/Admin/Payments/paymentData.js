// Fictional monitoring data. Global snapshots/chart/breakdown are not table aggregates.
export const paymentStats = [
  { label: 'Tổng giá trị giao dịch', value: 245800000, currency: true, note: '+12,4% so với tháng trước', icon: 'volume' },
  { label: 'Thành công', value: 5420, note: 'Giao dịch minh họa', icon: 'successful' },
  { label: 'Đang xử lý', value: 48, note: 'Đang chờ cập nhật mẫu', icon: 'pending' },
  { label: 'Thất bại', value: 26, note: 'Số liệu minh họa', icon: 'failed' },
  { label: 'Đã hoàn tiền', value: 18450000, currency: true, note: 'Lịch sử hoàn tiền minh họa', icon: 'refunded' },
]
export const statusLabels = { Successful: 'Thành công', Pending: 'Đang xử lý', Failed: 'Thất bại', Refunded: 'Đã hoàn tiền' }
export const typeLabels = { Booking: 'Thanh toán đặt sân', Split: 'Chia tiền thanh toán', Tournament: 'Phí tham gia giải đấu', Topup: 'Nạp ví SportNexus', Refund: 'Hoàn tiền và điều chỉnh' }
export const methodLabels = { Wallet: 'Ví SportNexus', QR: 'Mã QR minh họa', Bank: 'Chuyển khoản minh họa' }
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
const breakdownTotal = 245800000
export const transactionBreakdown = [
  ['Booking', 65, '#287b4c'], ['Split', 25, '#60b582'], ['Tournament', 5, '#a1d9b8'], ['Topup', 3, '#d2eadb'], ['Refund', 2, '#f5a6b0'],
].map(([type, percentage, color]) => ({ type, percentage, color, value: breakdownTotal * percentage / 100 }))
const successful = [6200000, 7100000, 5300000, 4100000, 7600000, 7900000, 8600000]
export const chartPeriods = Object.fromEntries([
  ['day', 'Ngày', ['20/10', '21/10', '22/10', '23/10', '24/10', '25/10', '26/10'], 1],
  ['week', 'Tuần', ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7'], 4],
  ['month', 'Tháng', ['Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'], 12],
].map(([key, label, labels, multiplier]) => [key, { label, context: key === 'day' ? 'Ngày trong tháng 10/2026' : key === 'week' ? '7 tuần mẫu liên tiếp' : 'Tháng trong năm 2026', points: labels.map((point, index) => ({ label: point, successful: successful[index] * multiplier, pending: (900000 + index * 100000) * multiplier, trend: (successful[index] + (index % 2 ? 400000 : -400000)) * multiplier })) }]))

const users = [
  { id: 'DEMO-PAY-U1', name: 'Lê Hoàng Nam', username: 'nam_le', role: 'Người chơi', balance: 420000 },
  { id: 'DEMO-PAY-U2', name: 'Trần Minh Bình', username: 'binh_tran', role: 'Người chơi', balance: 150000 },
  { id: 'DEMO-PAY-U3', name: 'Lê Hoàng Cường', username: 'cuong_le', role: 'Người chơi', balance: null },
  { id: 'DEMO-PAY-U4', name: 'Nguyễn Văn An', username: 'an_nguyen', role: 'Người chơi', balance: 300000 },
  { id: 'DEMO-PAY-U5', name: 'Vũ Thị Mai Anh', username: 'maianh_vu', role: 'Người chơi', balance: 600000 },
]
const samples = [
  ['Split', 'Successful', 'Wallet', 60000, '2026-10-26'], ['Split', 'Successful', 'Wallet', 60000, '2026-10-26'],
  ['Split', 'Successful', 'QR', 60000, '2026-10-25'], ['Booking', 'Successful', 'Wallet', 240000, '2026-10-24'],
  ['Refund', 'Refunded', 'Bank', 150000, '2026-10-23'], ['Booking', 'Pending', 'Bank', 240000, '2026-10-22'],
  ['Split', 'Failed', 'QR', 60000, '2026-10-21'], ['Tournament', 'Successful', 'Wallet', 150000, '2026-10-20'],
  ['Topup', 'Successful', 'Bank', 500000, '2026-10-19'], ['Split', 'Pending', 'QR', 60000, '2026-10-18'],
  ['Booking', 'Successful', 'QR', 300000, '2026-10-17'], ['Tournament', 'Successful', 'Bank', 200000, '2026-10-16'],
  ['Topup', 'Successful', 'Wallet', 100000, '2026-10-15'], ['Refund', 'Refunded', 'Wallet', 240000, '2026-10-14'],
  ['Booking', 'Successful', 'Bank', 180000, '2026-10-13'],
]
export const initialTransactions = samples.map(([type, status, method, amount, createdDate], index) => {
  const user = users[index % users.length]
  const id = `PAY-${289102 + index}`
  const booking = ['Split', 'Booking', 'Refund'].includes(type) ? { id: `DEMO-PAY-BOOK-${index + 1}`, facility: 'Sunrise Riverside Sport Hub', court: type === 'Split' ? 'Sân Pickleball 01' : 'Sân cầu lông 02', date: '2026-10-28', start: '19:00', end: '21:00', status: type === 'Refund' ? 'Đã hủy (minh họa)' : 'Đã xác nhận (minh họa)' } : null
  const members = type === 'Split' ? [user, ...users.filter(item => item.id !== user.id).slice(0, 3)].map((member, memberIndex) => ({ id: member.id, name: member.name, amount: 60000, paid: memberIndex === 0 ? status === 'Successful' : memberIndex < 3 })) : []
  const issue = [5, 6, 9].includes(index) ? { summary: index === 5 ? 'Đang chờ xác nhận trạng thái mẫu.' : index === 6 ? 'Mã QR thanh toán đã hết hạn trong dữ liệu mẫu.' : 'Thiếu cập nhật chia tiền trong dữ liệu mẫu.', reviewed: false, note: '' } : null
  return { id, type, status, method, amount, createdDate, createdTime: '17:40', processedTime: status === 'Pending' ? null : '17:42', user, booking, members, reference: type === 'Split' ? `DEMO-LFG-${1842 - index}` : type === 'Tournament' ? `DEMO-TRN-${index + 1}` : booking?.id || `DEMO-WALLET-${index + 1}`,
    escrow: ['Split', 'Booking'].includes(type) ? status === 'Successful' ? 'Đang giữ ký quỹ minh họa' : 'Chưa ghi nhận tiền của giao dịch này' : 'Không áp dụng cho giao dịch này', issue,
    refund: type === 'Refund' ? { originalId: `DEMO-ORIGINAL-${index + 1}`, amount, reason: 'Đơn mẫu đã hủy; bản ghi hoàn tiền có sẵn để xem giao diện.', date: createdDate } : null,
    history: [{ id: 'created', text: 'Tạo bản ghi giao dịch mẫu.' }, { id: 'initiated', text: `Khởi tạo thanh toán bằng ${methodLabels[method]} trong dữ liệu mẫu.` }, { id: 'status', text: `Trạng thái mẫu: ${statusLabels[status]}.` }, ...(['Split', 'Booking'].includes(type) ? [{ id: 'escrow', text: 'Thông tin ký quỹ minh họa; không thực hiện chuyển hoặc giữ tiền thật.' }] : []), ...(type === 'Refund' ? [{ id: 'refund', text: 'Sự kiện hoàn tiền đã có trong dữ liệu minh họa; không thực hiện yêu cầu hoàn tiền.' }] : [])],
  }
})
export function exportTransactions(transactions) {
  const escape = value => { const text = String(value); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const rows = [['Mã giao dịch', 'Người dùng', 'Loại giao dịch', 'Mã tham chiếu', 'Mã đặt sân', 'Số tiền (đ)', 'Trạng thái', 'Phương thức', 'Ngày tạo', 'Giờ tạo', 'Vấn đề minh họa', 'Ghi chú rà soát'], ...transactions.map(t => [t.id, t.user.name, typeLabels[t.type], t.reference, t.booking?.id || '', t.amount, statusLabels[t.status], methodLabels[t.method], date(t.createdDate), t.createdTime, t.issue?.summary || '', t.issue?.note || ''])]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'giao-dich-minh-hoa.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
