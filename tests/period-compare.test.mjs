import test from 'node:test'
import assert from 'node:assert/strict'
import { buildComparisonRows, comparePeriods, summarizeComparison } from '../src/utils/periodCompare.js'

// 16/11/2026 10:00 giờ Việt Nam
const NOW = new Date('2026-11-16T03:00:00Z')

test('Khoảng tháng này / tháng trước theo giờ Việt Nam', () => {
  const { current, previous } = comparePeriods('month', NOW)
  assert.deepEqual([current.from, current.to, current.length, current.elapsed, current.label], ['2026-11-01', '2026-11-16', 30, 16, 'Tháng 11/2026'])
  assert.deepEqual([previous.from, previous.to, previous.length, previous.label], ['2026-10-01', '2026-10-31', 31, 'Tháng 10/2026'])
})

test('Khoảng quý này / quý trước, kể cả khi lùi sang năm trước', () => {
  const q = comparePeriods('quarter', NOW)
  assert.deepEqual([q.current.from, q.current.label, q.previous.from, q.previous.to, q.previous.label], ['2026-10-01', 'Quý 4/2026', '2026-07-01', '2026-09-30', 'Quý 3/2026'])
  const jan = comparePeriods('quarter', new Date('2026-01-05T03:00:00Z'))
  assert.deepEqual([jan.previous.from, jan.previous.to, jan.previous.label], ['2025-10-01', '2025-12-31', 'Quý 4/2025'])
  // 23:30 ngày 31/10 giờ UTC đã là 01/11 ở Việt Nam
  assert.equal(comparePeriods('month', new Date('2026-10-31T17:30:00Z')).current.from, '2026-11-01')
})

test('Cộng dồn số đơn theo ngày và so sánh cùng mốc ngày', () => {
  const periods = comparePeriods('month', NOW)
  const previousDays = [{ date: '2026-10-02T00:00:00', bookings: 3 }, { date: '2026-10-20', bookings: 5 }, { date: '2026-09-30', bookings: 99 }]
  const currentDays = [{ date: '2026-11-01', bookings: 2 }, { date: '2026-11-16', bookings: 4 }]
  const rows = buildComparisonRows(periods, previousDays, currentDays)
  assert.equal(rows.length, 31)
  assert.deepEqual(rows[0], { day: 1, previous: 0, current: 2 })
  assert.deepEqual(rows[15], { day: 16, previous: 3, current: 6 })
  assert.deepEqual(rows[16], { day: 17, previous: 3, current: null })
  assert.equal(rows[30].previous, 8)
  assert.deepEqual(summarizeComparison(rows, periods), { current: 6, previousTotal: 8, previousSameDay: 3, change: 100 })
})
