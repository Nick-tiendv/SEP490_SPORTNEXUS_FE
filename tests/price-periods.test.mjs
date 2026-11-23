import test from 'node:test'
import assert from 'node:assert/strict'
import { findOverlappingPeriods, toPricePeriod } from '../src/api/owner/pricePeriodModel.js'

const tet = toPricePeriod({ id: 'p1', name: 'Phụ thu Tết', fromDate: '2027-02-05T00:00:00', toDate: '2027-02-09', courtIds: ['c1'], startTime: '17:00:00', endTime: '22:00:00', price: 130000 })
const sale = toPricePeriod({ id: 'p2', name: 'Sale cuối năm', fromDate: '2026-12-28', toDate: '2026-12-31', courtIds: [], price: 80000 })

test('đợt giá: chuẩn hóa dữ liệu BE', () => {
  assert.equal(tet.fromDate, '2027-02-05')
  assert.equal(tet.startTime, '17:00')
  assert.deepEqual(sale.courtIds, [])
})

test('đợt giá: tìm đợt trùng phạm vi đổi giá', () => {
  const all = [tet, sale]
  const range = (o) => findOverlappingPeriods(all, { dateFrom: '2027-02-01', dateTo: '2027-02-10', ...o }).map((p) => p.id)
  assert.deepEqual(range({ courtIds: ['c1'] }), ['p1'], 'cùng sân, trùng ngày')
  assert.deepEqual(range({ courtIds: ['c2'] }), [], 'sân khác')
  assert.deepEqual(range({ courtIds: [] }), ['p1'], 'đổi giá mọi sân')
  assert.deepEqual(range({ courtIds: ['c1'], startTime: '06:00', endTime: '12:00' }), [], 'khung giờ không giao nhau')
  assert.deepEqual(range({ courtIds: ['c1'], startTime: '20:00', endTime: '23:00' }), ['p1'], 'khung giờ giao nhau')
  assert.deepEqual(findOverlappingPeriods(all, { courtIds: ['c9'], dateFrom: '2026-12-30', dateTo: '2026-12-30' }).map((p) => p.id), ['p2'], 'đợt áp dụng mọi sân')
})
