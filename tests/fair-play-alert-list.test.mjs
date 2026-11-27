import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

// listFairPlayAlertReports: 1 lệnh gọi GET /reports/admin với FairPlayHold=true (BE chỉ trả ticket đang treo điểm Fair Play).
test('listFairPlayAlertReports lấy ticket cảnh báo bạo lực mạng bằng bộ lọc FairPlayHold', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })
  t.after(() => server.close())

  const [reportApi, clientMod] = await Promise.all([
    server.ssrLoadModule('/src/api/admin/reportApi.js'),
    server.ssrLoadModule('/src/api/apiClient.js'),
  ])
  const prevAdapter = clientMod.default.defaults.adapter
  t.after(() => { clientMod.default.defaults.adapter = prevAdapter })

  const calls = []
  const items = [
    { id: 'r1', reporterName: 'Hệ thống SportNexus', targetUserName: 'Nam', targetUserId: 'u1', pendingFairPlayDelta: -12, status: 'PENDING' },
    { id: 'r3', reporterName: 'Hệ thống SportNexus', targetUserName: 'Bình', pendingFairPlayDelta: -15, status: 'PENDING' },
  ]
  clientMod.default.defaults.adapter = async (config) => {
    calls.push(config.params)
    return { status: 200, data: { statusCode: 200, data: { items, totalCount: 2, totalPages: 1 } }, headers: {}, config }
  }

  const alerts = await reportApi.listFairPlayAlertReports()
  assert.deepEqual(alerts.map(item => item.uuid), ['r1', 'r3'])
  assert.equal(alerts[0].pendingFairPlayDelta, -12)
  assert.equal(alerts[0].targetUserId, 'u1')
  assert.equal(calls.length, 1)
  assert.equal(calls[0].FairPlayHold, true)
  assert.equal(calls[0].Status, 'PENDING')
})
