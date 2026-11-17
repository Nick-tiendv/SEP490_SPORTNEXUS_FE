import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

// listFairPlayAlertReports: lấy báo cáo PENDING (mọi trang) rồi chỉ giữ phiếu có pendingFairPlayDelta.
test('listFairPlayAlertReports lọc ticket cảnh báo bạo lực mạng từ báo cáo PENDING', async (t) => {
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
  const pages = {
    1: [{ id: 'r1', reporterName: 'Hệ thống SportNexus', targetUserName: 'Nam', targetUserId: 'u1', pendingFairPlayDelta: -12, status: 'PENDING' }, { id: 'r2', reporterName: 'An', status: 'PENDING' }],
    2: [{ id: 'r3', reporterName: 'Hệ thống SportNexus', targetUserName: 'Bình', pendingFairPlayDelta: -15, status: 'PENDING' }],
  }
  clientMod.default.defaults.adapter = async (config) => {
    calls.push(config.params)
    const items = pages[config.params.PageIndex] || []
    return { status: 200, data: { statusCode: 200, data: { items, totalCount: 3, totalPages: 2 } }, headers: {}, config }
  }

  const alerts = await reportApi.listFairPlayAlertReports()
  assert.deepEqual(alerts.map(item => item.uuid), ['r1', 'r3'])
  assert.equal(alerts[0].pendingFairPlayDelta, -12)
  assert.equal(alerts[0].targetUserId, 'u1')
  assert.ok(calls.every(params => params.Status === 'PENDING'))
  assert.equal(calls.length, 2)
})
