import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

// GET /api/v1/facility-reviews/eligibility/{facilityId} trả { canReview, reason, existingReviewId } (docs 14.1).
test('checkFacilityReviewEligibility đọc canReview / reason và không tự cho phép khi lỗi', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })
  t.after(() => server.close())

  const [reviewApi, clientMod] = await Promise.all([
    server.ssrLoadModule('/src/api/player/reviewApi.js'),
    server.ssrLoadModule('/src/api/apiClient.js'),
  ])
  const prevAdapter = clientMod.default.defaults.adapter
  t.after(() => { clientMod.default.defaults.adapter = prevAdapter })

  let reply
  clientMod.default.defaults.adapter = async (config) => {
    if (reply instanceof Error) throw reply
    return { status: 200, data: { statusCode: 200, message: 'Success', data: reply }, headers: {}, config }
  }

  reply = { canReview: true, reason: null, existingReviewId: null }
  assert.deepEqual(await reviewApi.checkFacilityReviewEligibility('fac-1'), { isEligible: true, message: '', existingReviewId: null })

  reply = { canReview: false, reason: 'Bạn đã đánh giá cơ sở này', existingReviewId: 'rv-1' }
  const reviewed = await reviewApi.checkFacilityReviewEligibility('fac-1')
  assert.equal(reviewed.isEligible, false)
  assert.equal(reviewed.message, 'Bạn đã đánh giá cơ sở này')
  assert.equal(reviewed.existingReviewId, 'rv-1')

  const err = new Error('Network Error')
  err.response = { status: 500, data: { statusCode: 500, message: 'Lỗi hệ thống' } }
  reply = err
  const failed = await reviewApi.checkFacilityReviewEligibility('fac-1')
  assert.equal(failed.isEligible, false)
  assert.ok(failed.message)
})
