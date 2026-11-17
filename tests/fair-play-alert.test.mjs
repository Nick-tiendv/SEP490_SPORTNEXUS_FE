import test from 'node:test'
import assert from 'node:assert/strict'
import { decisionLabel, fairPlayDecisionOptions, formatDelta, isFairPlayAlert } from '../src/Admin/Reviews/reviewsData.js'

test('phiếu nghi đánh hội đồng nhận biết bằng pendingFairPlayDelta', () => {
  assert.equal(isFairPlayAlert({ pendingFairPlayDelta: -12 }), true)
  assert.equal(isFairPlayAlert({ pendingFairPlayDelta: 0 }), true)
  assert.equal(isFairPlayAlert({ pendingFairPlayDelta: null }), false)
  assert.equal(isFairPlayAlert({}), false)
  assert.equal(isFairPlayAlert(null), false)
})

test('phiếu nghi đánh hội đồng chỉ có 2 quyết định, không có hoàn tiền', () => {
  assert.deepEqual(fairPlayDecisionOptions.map(option => option.value), ['RESOLVE_NO_REFUND', 'REJECT'])
  assert.match(decisionLabel({ pendingFairPlayDelta: -12 }, 'REJECT'), /đánh hội đồng/)
  assert.match(decisionLabel({}, 'REJECT'), /Bác bỏ báo cáo/)
  assert.equal(decisionLabel({}, 'UNKNOWN'), 'UNKNOWN')
})

test('formatDelta hiển thị dấu trừ / cộng', () => {
  assert.equal(formatDelta(-12), '−12')
  assert.equal(formatDelta(3), '+3')
  assert.equal(formatDelta(0), '0')
})
