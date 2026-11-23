// Luật ngày và gợi ý thể thức khi tạo / sửa giải (nhóm chốt 20–23/11/2026).
// Ngày dạng 'YYYY-MM-DD' theo giờ máy (ô <input type="date">), nên 48 giờ quy thành 2 ngày.
import { addDays, toDateKey } from '../shared.js'

export const DEADLINE_GAP_DAYS = 2 // hạn đăng ký trước ngày bắt đầu ít nhất 48 giờ
export const MAX_DURATION_MONTHS = 1 // giải kéo dài tối đa 1 tháng kể từ ngày bắt đầu

// Cộng tháng, ngày cuối tháng được kẹp lại (31/01 + 1 tháng = 28/02 hoặc 29/02).
export const addMonths = (dateKey, months) => {
  const [y, m, d] = dateKey.split('-').map(Number)
  const lastDay = new Date(y, m - 1 + months + 1, 0).getDate()
  return toDateKey(new Date(y, m - 1 + months, Math.min(d, lastDay)))
}

// Giới hạn min / max cho từng ô ngày.
export const dateLimits = (startDate, today = toDateKey()) => ({
  minStart: addDays(today, DEADLINE_GAP_DAYS),
  minEnd: startDate || addDays(today, DEADLINE_GAP_DAYS),
  maxEnd: startDate ? addMonths(startDate, MAX_DURATION_MONTHS) : undefined,
  minDeadline: today,
  maxDeadline: startDate ? addDays(startDate, -DEADLINE_GAP_DAYS) : undefined,
})

// Hạn đăng ký mặc định: đúng 48 giờ trước ngày bắt đầu.
export const defaultDeadline = (startDate) => (startDate ? addDays(startDate, -DEADLINE_GAP_DAYS) : '')

// Trả về câu lỗi đầu tiên, hoặc '' nếu hợp lệ.
// changed: khi sửa giải, chỉ kiểm tra các luật mới với ô vừa đổi (giải tạo theo luật cũ, vd hạn đăng ký 24 giờ,
// vẫn lưu được tên / điều lệ). Thứ tự ngày (kết thúc ≥ bắt đầu, hạn đăng ký ≤ bắt đầu) luôn kiểm tra.
export function validateTournamentDates({ startDate, endDate, registrationDeadline }, { today = toDateKey(), requireDates = true, changed } = {}) {
  const isChanged = (...keys) => !changed || keys.some((key) => changed.has(key))
  if (requireDates && (!startDate || !endDate)) return 'Vui lòng chọn ngày bắt đầu và ngày kết thúc.'
  const limits = dateLimits(startDate, today)
  if (startDate && isChanged('startDate') && startDate < limits.minStart) return 'Ngày bắt đầu phải cách hôm nay ít nhất 2 ngày (để còn 48 giờ cho hạn đăng ký).'
  if (endDate && isChanged('endDate') && endDate < today) return 'Ngày kết thúc không được ở quá khứ.'
  if (startDate && endDate && endDate < startDate) return 'Ngày kết thúc phải từ ngày bắt đầu trở đi.'
  if (startDate && endDate && isChanged('startDate', 'endDate') && endDate > limits.maxEnd) return 'Giải kéo dài tối đa 1 tháng kể từ ngày bắt đầu.'
  if (registrationDeadline && isChanged('registrationDeadline') && registrationDeadline < today) return 'Hạn đăng ký không được ở quá khứ.'
  if (registrationDeadline && startDate && registrationDeadline > startDate) return 'Hạn đăng ký phải trước ngày bắt đầu.'
  if (registrationDeadline && startDate && isChanged('startDate', 'registrationDeadline') && registrationDeadline > limits.maxDeadline) return 'Hạn đăng ký phải trước ngày bắt đầu ít nhất 48 giờ.'
  return ''
}

// BTC tự hủy giải được tới 24 giờ trước hạn đăng ký. Sau mốc đó chỉ hủy qua quyết định "thiếu người"
// (sau hạn đăng ký) hoặc do Admin. Không có hạn đăng ký thì không chặn.
export const CANCEL_LOCK_HOURS = 24
export const canOrganizerCancel = (registrationDeadline, now = new Date()) => {
  if (!registrationDeadline) return true
  const deadline = new Date(registrationDeadline)
  if (Number.isNaN(deadline.getTime())) return true
  return now.getTime() < deadline.getTime() - CANCEL_LOCK_HOURS * 3600 * 1000
}

// ---------- Thể thức ----------
export const FORMAT_LABEL = {
  KNOCKOUT: 'Loại trực tiếp',
  ROUND_ROBIN: 'Vòng tròn',
  GROUP_KNOCKOUT: 'Vòng bảng + loại trực tiếp',
}

// Gợi ý: đến 8 đấu thủ loại trực tiếp, từ 9 vòng bảng rồi loại trực tiếp.
export const suggestFormat = (count) => (Number(count) >= 9 ? 'GROUP_KNOCKOUT' : 'KNOCKOUT')

const largestPowerOfTwoAtMost = (n) => 2 ** Math.floor(Math.log2(n))

// Số trận ước tính (chưa tính tranh hạng 3). Vòng bảng: số bảng = ceil(n/4), chia đều người vào các bảng,
// vào vòng loại = lũy thừa 2 lớn nhất ≤ 2 × số bảng. BE có thể chia khác đôi chút.
export function estimateMatches(format, count) {
  const n = Number(count)
  if (!Number.isFinite(n) || n < 2) return 0
  if (format === 'ROUND_ROBIN') return (n * (n - 1)) / 2
  if (format === 'GROUP_KNOCKOUT') {
    const groups = Math.ceil(n / 4)
    const base = Math.floor(n / groups)
    const bigger = n % groups // số bảng có thêm 1 người
    const pairs = (k) => (k * (k - 1)) / 2
    const groupMatches = bigger * pairs(base + 1) + (groups - bigger) * pairs(base)
    return groupMatches + largestPowerOfTwoAtMost(2 * groups) - 1
  }
  return n - 1
}

// Cảnh báo khi thể thức đã chọn không hợp với số đấu thủ ('' = không có gì cần cảnh báo).
export function formatWarning(format, count) {
  const n = Number(count)
  if (!Number.isFinite(n) || n < 2) return ''
  if (format === 'ROUND_ROBIN' && n > 6) return `Vòng tròn với ${n} đấu thủ là ${estimateMatches(format, n)} trận, quá nhiều cho một giải.`
  if (format === 'GROUP_KNOCKOUT' && n < 9) return `Dưới 9 đấu thủ nên chọn loại trực tiếp; chia bảng sẽ có bảng quá ít người.`
  if (format === 'KNOCKOUT' && n >= 9) return `Từ 9 đấu thủ, loại trực tiếp làm một nửa số người chỉ đấu 1 trận; nên chọn vòng bảng + loại trực tiếp.`
  return ''
}
