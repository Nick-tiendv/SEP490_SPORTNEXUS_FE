import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

const memoryStorage = () => {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}
const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const jwt = (sub) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`

test('Thanh trên cùng: đổi tài khoản không tải lại trang thì hiện đúng người đang đăng nhập', async (t) => {
  globalThis.localStorage = memoryStorage()
  globalThis.sessionStorage = memoryStorage()
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })
  t.after(async () => {
    await server.close()
    delete globalThis.localStorage
    delete globalThis.sessionStorage
  })

  const [{ loadCurrentUser }, { saveSession, createSession }, { clearUserData }, clientMod] = await Promise.all([
    server.ssrLoadModule('/src/hooks/useCurrentUser.js'),
    server.ssrLoadModule('/src/context/authSession.js'),
    server.ssrLoadModule('/src/context/userStorage.js'),
    server.ssrLoadModule('/src/api/apiClient.js'),
  ])

  let me = { fullName: 'Minh Minh', fairPlayScore: 90 }
  let calls = 0
  const prevAdapter = clientMod.default.defaults.adapter
  clientMod.default.defaults.adapter = async (config) => {
    calls++
    return { status: 200, data: { statusCode: 200, data: me }, headers: {}, config }
  }
  t.after(() => { clientMod.default.defaults.adapter = prevAdapter })

  saveSession(createSession({ token: jwt('minh'), role: 'Player' }))
  assert.equal((await loadCurrentUser()).name, 'Minh Minh')
  assert.equal((await loadCurrentUser()).name, 'Minh Minh')
  assert.equal(calls, 1, 'cùng phiên: dùng cache, không gọi lại API')

  // Đăng xuất Minh Minh, đăng nhập Trần Bình (không F5)
  localStorage.setItem('sportnexus_local_avatar', 'data:image/png;base64,minh')
  clearUserData()
  assert.equal(localStorage.getItem('sportnexus_local_avatar'), null, 'xóa avatar tạm của tài khoản trước')
  me = { fullName: 'Trần Bình', fairPlayScore: 100 }
  saveSession(createSession({ token: jwt('binh'), role: 'Player' }))
  const user = await loadCurrentUser()
  assert.equal(user.name, 'Trần Bình')
  assert.equal(user.fairPlayScore, 100)
  assert.equal(user.avatarUrl, null, 'không mượn avatar của Minh Minh')
  assert.equal(calls, 2)
})
