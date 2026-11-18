import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRepeatDates, bulkDiscount, findSameTimeSlot, formatRepeatDate, isBulkPackage, weekdayOf } from '../src/Player/Booking/Recurring/recurringBooking.js'

test('buildRepeatDates: các thứ đã chọn trong N tuần tính từ ngày gốc (không gồm ngày gốc)', () => {
  // 16/11/2026 là Thứ 2 (getDay = 1), 17/11/2026 là Thứ 3 (getDay = 2)
  assert.equal(weekdayOf('2026-11-16'), 1)
  assert.equal(weekdayOf('2026-11-17'), 2)
  assert.deepEqual(buildRepeatDates('2026-11-16', [1, 5], 3), ['2026-11-20', '2026-11-23', '2026-11-27', '2026-11-30', '2026-12-04'])
  assert.deepEqual(buildRepeatDates('2026-11-16', [1], 4), ['2026-11-23', '2026-11-30', '2026-12-07'])
  assert.deepEqual(buildRepeatDates('2026-11-16', [1], 1), [])
  assert.deepEqual(buildRepeatDates('', [1], 4), [])
})

test('formatRepeatDate hiện thứ + ngày/tháng', () => {
  assert.equal(formatRepeatDate('2026-11-16'), 'T2 16/11')
  assert.equal(formatRepeatDate('2026-11-22'), 'CN 22/11')
})

test('findSameTimeSlot tìm ca cùng giờ bắt đầu và kết thúc', () => {
  const slots = [{ id: 'a', formattedStart: '06:00', formattedEnd: '07:00' }, { id: 'b', formattedStart: '18:00', formattedEnd: '19:00' }]
  assert.equal(findSameTimeSlot(slots, { start: '18:00', end: '19:00' })?.id, 'b')
  assert.equal(findSameTimeSlot(slots, { start: '18:00', end: '20:00' }), null)
})

// Ca 18:00-19:30 giờ VN = 11:00-12:30 UTC
const slotOn = (date, courtId = 'c1') => ({ courtId, startTime: `${date}T11:00:00Z`, endTime: `${date}T12:30:00Z` })

test('isBulkPackage: cùng ca, cùng sân, cùng thứ, ≥ 4 tuần liên tiếp mới là gói định kỳ', () => {
  const fourWeeks = ['2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08'].map((d) => slotOn(d))
  assert.equal(isBulkPackage(fourWeeks), true)
  // 3 tuần: chưa đủ
  assert.equal(isBulkPackage(fourWeeks.slice(0, 3)), false)
  // 4 ca cùng ngày (khác giờ) không phải gói
  const sameDay = [11, 12, 13, 14].map((h) => ({ courtId: 'c1', startTime: `2026-11-17T${h}:00:00Z`, endTime: `2026-11-17T${h}:30:00Z` }))
  assert.equal(isBulkPackage(sameDay), false)
  // Đứt tuần (bỏ 1 tuần) không liên tiếp
  assert.equal(isBulkPackage(['2026-11-17', '2026-11-24', '2026-12-08', '2026-12-15'].map((d) => slotOn(d))), false)
  // 2 thứ (T3 + T5) mỗi thứ đủ 4 tuần: là gói
  const tueThu = ['2026-11-17', '2026-11-19', '2026-11-24', '2026-11-26', '2026-12-01', '2026-12-03', '2026-12-08', '2026-12-10'].map((d) => slotOn(d))
  assert.equal(isBulkPackage(tueThu), true)
  // Đơn trộn thêm 1 ca lẻ: không tính là gói
  assert.equal(isBulkPackage([...fourWeeks, slotOn('2026-11-18', 'c2')]), false)
})

test('bulkDiscount: giảm 10% khi là gói định kỳ và cơ sở bật giảm giá', () => {
  assert.deepEqual(bulkDiscount(400000, true, true), { applies: true, amount: 40000, payable: 360000 })
  assert.deepEqual(bulkDiscount(400000, false, true), { applies: false, amount: 0, payable: 400000 })
  assert.deepEqual(bulkDiscount(400000, true, false), { applies: false, amount: 0, payable: 400000 })
})
