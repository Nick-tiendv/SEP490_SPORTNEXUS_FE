import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRepeatDates, bulkDiscount, findSameTimeSlot, formatRepeatDate, weekdayOf } from '../src/Player/Booking/Recurring/recurringBooking.js'

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

test('bulkDiscount: giảm 10% khi cơ sở bật và đơn từ 4 ca', () => {
  assert.deepEqual(bulkDiscount(400000, 4, true), { applies: true, amount: 40000, payable: 360000 })
  assert.deepEqual(bulkDiscount(300000, 3, true), { applies: false, amount: 0, payable: 300000 })
  assert.deepEqual(bulkDiscount(400000, 8, false), { applies: false, amount: 0, payable: 400000 })
})
