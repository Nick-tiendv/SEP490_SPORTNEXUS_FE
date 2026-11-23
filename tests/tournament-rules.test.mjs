import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addMonths,
  canOrganizerCancel,
  dateLimits,
  defaultDeadline,
  estimateMatches,
  formatWarning,
  suggestFormat,
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
