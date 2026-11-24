import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addMonths,
  canOrganizerCancel,
  dateLimits,
  defaultDeadline,
  estimateMatches,
  buildScorePayload,
  canEscalateComplaint,
  formatError,
  formatWarning,
  normalizeFormat,
  suggestFormat,
  validateSchedule,
  validateTournamentDates,
} from '../src/CourtOwner/Tournament/tournamentRules.js'

const today = '2026-11-23'
const check = (dates, options) => validateTournamentDates(dates, { today, ...options })

test('giải đấu: cộng 1 tháng kẹp ngày cuối tháng', () => {
  assert.equal(addMonths('2026-11-25', 1), '2026-12-25')
  assert.equal(addMonths('2027-01-31', 1), '2027-02-28')
  assert.equal(addMonths('2026-12-15', 1), '2027-01-15')
})

test('giải đấu: giới hạn ô ngày và hạn đăng ký mặc định 48 giờ', () => {
  const limits = dateLimits('2026-12-10', today)
  assert.equal(limits.minStart, '2026-11-25')
  assert.equal(limits.maxDeadline, '2026-12-08')
  assert.equal(limits.maxEnd, '2027-01-10')
  assert.equal(defaultDeadline('2026-12-10'), '2026-12-08')
  assert.equal(defaultDeadline(''), '')
})

test('giải đấu: kiểm tra ngày khi tạo giải', () => {
  const ok = { startDate: '2026-12-10', endDate: '2026-12-12', registrationDeadline: '2026-12-08' }
  assert.equal(check(ok), '')
  assert.match(check({ ...ok, startDate: '', endDate: '' }), /chọn ngày bắt đầu/)
  assert.match(check({ ...ok, startDate: '2026-11-24', endDate: '2026-11-25', registrationDeadline: '' }), /ít nhất 2 ngày/)
  assert.equal(check({ ...ok, startDate: '2026-11-25', endDate: '2026-11-25', registrationDeadline: '2026-11-23' }), '', 'bắt đầu đúng mốc 2 ngày, hạn đăng ký hôm nay')
  assert.match(check({ ...ok, endDate: '2026-12-09' }), /từ ngày bắt đầu/)
  assert.match(check({ ...ok, endDate: '2027-01-11' }), /tối đa 1 tháng/)
  assert.equal(check({ ...ok, endDate: '2027-01-10' }), '', 'đúng 1 tháng vẫn hợp lệ')
  assert.match(check({ ...ok, registrationDeadline: '2026-12-09' }), /ít nhất 48 giờ/)
  assert.match(check({ ...ok, registrationDeadline: '2026-11-22' }), /quá khứ/)
})

test('giải đấu: sửa giải chỉ chặn quá khứ ở ô vừa đổi', () => {
  const old = { startDate: '2026-11-20', endDate: '2026-11-30', registrationDeadline: '2026-11-18' }
  assert.equal(check(old, { requireDates: false, changed: new Set() }), '', 'giải cũ không đổi ngày vẫn lưu được')
  assert.match(check(old, { requireDates: false, changed: new Set(['startDate']) }), /ít nhất 2 ngày/)
  assert.equal(check({ startDate: '', endDate: '', registrationDeadline: '' }, { requireDates: false, changed: new Set() }), '')
  const oldRule = { startDate: '2026-12-10', endDate: '2026-12-11', registrationDeadline: '2026-12-09' }
  assert.equal(check(oldRule, { requireDates: false, changed: new Set() }), '', 'giải hạn đăng ký 24 giờ theo luật cũ vẫn sửa được tên')
  assert.match(check(oldRule, { requireDates: false, changed: new Set(['registrationDeadline']) }), /ít nhất 48 giờ/)
  assert.match(check({ ...oldRule, registrationDeadline: '2026-12-11' }, { requireDates: false, changed: new Set() }), /trước ngày bắt đầu/)
})

test('giải đấu: BTC chỉ hủy được tới 24 giờ trước hạn đăng ký', () => {
  const deadline = '2026-12-08T00:00:00+07:00'
  assert.equal(canOrganizerCancel(deadline, new Date('2026-12-06T23:59:00+07:00')), true)
  assert.equal(canOrganizerCancel(deadline, new Date('2026-12-07T00:00:00+07:00')), false, 'đúng mốc 24 giờ là khóa')
  assert.equal(canOrganizerCancel(deadline, new Date('2026-12-09T00:00:00+07:00')), false, 'sau hạn đăng ký')
  assert.equal(canOrganizerCancel(null), true, 'không có hạn đăng ký')
})

test('giải đấu: gợi ý thể thức và số trận', () => {
  assert.equal(suggestFormat(8), 'KNOCKOUT')
  assert.equal(suggestFormat(9), 'GROUP_KNOCKOUT')
  assert.equal(estimateMatches('KNOCKOUT', 7), 6)
  assert.equal(estimateMatches('ROUND_ROBIN', 12), 66)
  assert.equal(estimateMatches('GROUP_KNOCKOUT', 9), 12)
  assert.equal(estimateMatches('GROUP_KNOCKOUT', 10), 15)
  assert.equal(estimateMatches('GROUP_KNOCKOUT', 16), 31)
  assert.equal(estimateMatches('GROUP_KNOCKOUT', 32), 63)
  assert.equal(estimateMatches('KNOCKOUT', 1), 0)
})

test('giải đấu: cảnh báo thể thức lệch số người', () => {
  assert.equal(formatWarning('KNOCKOUT', 8), '')
  assert.match(formatWarning('KNOCKOUT', 12), /vòng bảng/)
  assert.match(formatWarning('ROUND_ROBIN', 12), /66 trận/)
  assert.equal(formatWarning('ROUND_ROBIN', 6), '')
  assert.match(formatWarning('GROUP_KNOCKOUT', 6), /loại trực tiếp/)
  assert.equal(formatWarning('GROUP_KNOCKOUT', 0), '')
})

test('giải đấu: đọc thể thức BE trả về', () => {
  assert.equal(normalizeFormat('Knockout'), 'KNOCKOUT')
  assert.equal(normalizeFormat('RoundRobin'), 'ROUND_ROBIN')
  assert.equal(normalizeFormat('GroupKnockout'), 'GROUP_KNOCKOUT')
  assert.equal(normalizeFormat('ROUND_ROBIN'), 'ROUND_ROBIN')
  assert.equal(normalizeFormat(null), '')
  assert.equal(normalizeFormat('Swiss'), '')
})

test('giải đấu: giới hạn số đấu thủ theo thể thức', () => {
  assert.equal(formatError('ROUND_ROBIN', 8), '')
  assert.match(formatError('ROUND_ROBIN', 9), /tối đa 8/)
  assert.match(formatError('ROUND_ROBIN', 2), /ít nhất 3/)
  assert.match(formatError('GROUP_KNOCKOUT', 5), /ít nhất 6/)
  assert.equal(formatError('GROUP_KNOCKOUT', 6), '')
  assert.equal(formatError('KNOCKOUT', 64), '')
  assert.match(formatError('KNOCKOUT', 1), /ít nhất 2/)
})

test('giải đấu: kiểm tra lịch sân yêu cầu', () => {
  const range = { startDate: '2026-12-10', endDate: '2026-12-12' }
  assert.equal(validateSchedule([], range), '')
  assert.equal(validateSchedule([{ date: '2026-12-10', session: 'MORNING', courtCount: 2 }, { date: '2026-12-10', session: 'EVENING', courtCount: 1 }], range), '')
  assert.match(validateSchedule([{ date: '2026-12-13', session: 'MORNING', courtCount: 1 }], range), /ngoài thời gian/)
  assert.match(validateSchedule([{ date: '2026-12-10', session: 'MORNING', courtCount: 0 }], range), /từ 1/)
  assert.match(validateSchedule([{ date: '2026-12-11', session: 'FULL_DAY', courtCount: 1 }, { date: '2026-12-11', session: 'EVENING', courtCount: 1 }], range), /trùng buổi/)
  assert.match(validateSchedule([{ date: '', session: 'MORNING', courtCount: 1 }], range), /Chọn ngày/)
  assert.match(validateSchedule([{ date: '2026-12-10', session: 'MORNING', courtCount: 1 }], { startDate: '' }), /ngày bắt đầu/)
  assert.equal(validateSchedule([{ date: '2026-12-10', session: 'FULL_DAY', courtCount: 3 }], { startDate: '2026-12-10', endDate: '' }), '', 'giải 1 ngày')
})

test('giải đấu: dựng body nhập tỉ số', () => {
  const sets = [{ a: '21', b: '18' }, { a: '', b: '' }, { a: '19', b: '21' }]
  const { payload } = buildScorePayload({ sets })
  assert.deepEqual(payload.sets, [{ setNumber: 1, scoreP1: 21, scoreP2: 18 }, { setNumber: 2, scoreP1: 19, scoreP2: 21 }])
  assert.equal(payload.resultType, 'NORMAL')
  assert.equal(payload.tiebreakP1, null)
  assert.match(buildScorePayload({ sets: [{ a: '', b: '' }] }).error, /ít nhất 1 hiệp/)
  assert.match(buildScorePayload({ resultType: 'WALKOVER' }).error, /xử thắng/)
  assert.deepEqual(buildScorePayload({ resultType: 'WALKOVER', winnerId: 'p1', sets }).payload.sets, [], 'xử thắng không gửi tỉ số')
  assert.match(buildScorePayload({ resultType: 'RETIRED', sets }).error, /bỏ cuộc/)
  assert.equal(buildScorePayload({ resultType: 'RETIRED', sets, winnerId: 'p2' }).payload.winnerId, 'p2')
  const football = buildScorePayload({ sets: [{ a: '1', b: '1' }], tiebreak: { a: '4', b: '3' } }).payload
  assert.equal(football.tiebreakP1, 4)
  assert.match(buildScorePayload({ sets: [{ a: '1', b: '1' }], tiebreak: { a: '3', b: '3' } }).error, /luân lưu/)
  assert.match(buildScorePayload({ sets: [{ a: '-1', b: '2' }] }).error, /âm/)
})

test('giải đấu: khi nào người khiếu nại được chuyển Admin', () => {
  const now = new Date('2026-12-10T12:00:00Z')
  const base = { targetType: 'MATCH', status: 'PENDING', createdAt: '2026-12-10T10:00:00Z' }
  assert.equal(canEscalateComplaint(base, now), false, 'BTC còn trong hạn xử lý')
  assert.equal(canEscalateComplaint({ ...base, createdAt: '2026-12-09T11:00:00Z' }, now), true, 'BTC quá 24 giờ chưa xử lý')
  const decided = { ...base, status: 'REJECTED', organizerDecidedAt: '2026-12-09T13:00:00Z' }
  assert.equal(canEscalateComplaint(decided, now), true, 'trong 24 giờ sau quyết định')
  assert.equal(canEscalateComplaint({ ...decided, organizerDecidedAt: '2026-12-09T11:00:00Z' }, now), false, 'quá 24 giờ sau quyết định')
  assert.equal(canEscalateComplaint({ ...decided, isEscalatedToAdmin: true }, now), false, 'chỉ chuyển 1 lần')
  assert.equal(canEscalateComplaint({ ...decided, targetType: 'BOOKING' }, now), false)
  assert.equal(canEscalateComplaint({ ...base, createdAt: '2026-12-09T11:00:00Z', status: 'WITHDRAWN' }, now), false)
})
