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

// BE trả thể thức kiểu 'Knockout' / 'RoundRobin' / 'GroupKnockout' (body tạo giải dùng 'KNOCKOUT'...). '' = không rõ.
export const normalizeFormat = (value) => {
  const key = String(value || '').trim().replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
  return FORMAT_LABEL[key] ? key : ''
}

// Giới hạn cứng của BE: vòng tròn 3–8 đấu thủ, vòng bảng từ 6, loại trực tiếp từ 2.
export const FORMAT_RANGE = { KNOCKOUT: [2, Infinity], ROUND_ROBIN: [3, 8], GROUP_KNOCKOUT: [6, Infinity] }
export function formatError(format, count) {
  const range = FORMAT_RANGE[format]
  const n = Number(count)
  if (!range || !Number.isFinite(n)) return ''
  const [min, max] = range
  if (n > max) return `${FORMAT_LABEL[format]} chỉ cho tối đa ${max} đấu thủ.`
  if (n < min) return `${FORMAT_LABEL[format]} cần ít nhất ${min} đấu thủ.`
  return ''
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

// ---------- Lịch sân BTC yêu cầu (requestedSchedule) ----------
export const SESSIONS = {
  MORNING: 'Sáng (06:00–12:00)',
  AFTERNOON: 'Chiều (12:00–18:00)',
  EVENING: 'Tối (18:00–22:00)',
  FULL_DAY: 'Cả ngày (06:00–22:00)',
}
const showDate = (dateKey) => dateKey.split('-').reverse().join('/')

// rows: [{ date, session, courtCount }]. Trả câu lỗi đầu tiên hoặc ''. Số sân tối đa do BE kiểm tra theo cơ sở.
export function validateSchedule(rows, { startDate, endDate }) {
  if (!rows?.length) return ''
  if (!startDate) return 'Chọn ngày bắt đầu trước khi nhập lịch sân.'
  const lastDate = endDate || startDate
  const seen = []
  for (const row of rows) {
    if (!row.date) return 'Chọn ngày cho từng dòng lịch sân.'
    if (row.date < startDate || row.date > lastDate) return `Ngày ${showDate(row.date)} nằm ngoài thời gian diễn ra giải.`
    if (!SESSIONS[row.session]) return 'Chọn buổi cho từng dòng lịch sân.'
    if (!Number.isInteger(Number(row.courtCount)) || Number(row.courtCount) < 1) return 'Số sân mỗi dòng phải từ 1 trở lên.'
    // Cả ngày trùng mọi buổi trong cùng ngày
    if (seen.some((other) => other.date === row.date && (other.session === row.session || other.session === 'FULL_DAY' || row.session === 'FULL_DAY'))) {
      return `Ngày ${showDate(row.date)} bị trùng buổi.`
    }
    seen.push(row)
  }
  return ''
}

// ---------- Tỉ số trận (PUT /matches/{id}/score, dùng lại cho khiếu nại UPDATE_SCORE) ----------
// sets: [{ a, b }] dạng chuỗi từ ô nhập; tiebreak: { a, b } (luân lưu, để trống nếu không có).
// Trả { payload } hoặc { error }.
export function buildScorePayload({ resultType = 'NORMAL', sets = [], winnerId = '', tiebreak = { a: '', b: '' } }) {
  const filled = sets
    .filter((set) => set.a !== '' || set.b !== '')
    .map((set, index) => ({ setNumber: index + 1, scoreP1: Number(set.a) || 0, scoreP2: Number(set.b) || 0 }))
  if (filled.some((set) => set.scoreP1 < 0 || set.scoreP2 < 0)) return { error: 'Tỉ số không được âm.' }
  const payload = { sets: [], winnerId: null, tiebreakP1: null, tiebreakP2: null, resultType }
  if (resultType === 'WALKOVER') {
    if (!winnerId) return { error: 'Chọn bên được xử thắng.' }
    return { payload: { ...payload, winnerId } }
  }
  if (!filled.length) return { error: 'Nhập tỉ số ít nhất 1 hiệp.' }
  payload.sets = filled
  if (resultType === 'RETIRED') {
    if (!winnerId) return { error: 'Chọn bên thắng (bên còn lại bỏ cuộc).' }
    payload.winnerId = winnerId
    return { payload }
  }
  const hasTiebreak = tiebreak.a !== '' || tiebreak.b !== ''
  if (hasTiebreak) {
    if (tiebreak.a === '' || tiebreak.b === '' || Number(tiebreak.a) === Number(tiebreak.b)) return { error: 'Tỉ số luân lưu phải đủ hai bên và không bằng nhau.' }
    payload.tiebreakP1 = Number(tiebreak.a)
    payload.tiebreakP2 = Number(tiebreak.b)
  }
  return { payload }
}

// ---------- Khiếu nại trận: người khiếu nại chuyển Admin (POST /match-complaints/{id}/escalate) ----------
// Được chuyển 1 lần khi: BTC đã quyết định và chưa quá 24 giờ, hoặc BTC chưa xử lý và đã quá 24 giờ kể từ lúc gửi.
export const ESCALATE_WINDOW_HOURS = 24
export function canEscalateComplaint(report, now = new Date()) {
  if (String(report?.targetType || '').toUpperCase() !== 'MATCH') return false
  if (report.isEscalatedToAdmin || report.resolvedByAdminId) return false
  if (String(report.status || '').toUpperCase() === 'WITHDRAWN') return false
  const hours = (value) => (now.getTime() - new Date(value).getTime()) / 3600000
  if (report.organizerDecidedAt) return hours(report.organizerDecidedAt) < ESCALATE_WINDOW_HOURS
  return String(report.status || '').toUpperCase() === 'PENDING' && !!report.createdAt && hours(report.createdAt) >= ESCALATE_WINDOW_HOURS
}
