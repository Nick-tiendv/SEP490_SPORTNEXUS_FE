import test from 'node:test'
import assert from 'node:assert/strict'
import { awaitingAdmin, isMatchComplaint } from '../src/Admin/Reviews/reviewsData.js'

test('admin: chỉ phân xử khiếu nại trận đã chuyển Admin và chưa đóng', () => {
  const base = { targetType: 'MATCH', status: 'OWNER_RESPONDED', escalated: true, escalationClosed: false }
  assert.equal(isMatchComplaint(base), true)
  assert.equal(awaitingAdmin(base), true)
  assert.equal(awaitingAdmin({ ...base, status: 'PENDING' }), true, 'BTC quá hạn chưa xử lý rồi chuyển lên')
  assert.equal(awaitingAdmin({ ...base, escalated: false }), false, 'BTC đang xử lý')
  assert.equal(awaitingAdmin({ ...base, escalationClosed: true }), false, 'Admin đã đóng')
  assert.equal(awaitingAdmin({ ...base, status: 'REJECTED' }), false)
  assert.equal(awaitingAdmin({ ...base, targetType: 'BOOKING' }), false)
})
