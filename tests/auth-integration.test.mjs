import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const loadSource = async path => readFile(new URL(path, import.meta.url), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const axiosUrl = new URL('../node_modules/axios/index.js', import.meta.url).href
const clientUrl = moduleUrl((await loadSource('../src/api/apiClient.js'))
  .replace("'axios'", JSON.stringify(axiosUrl))
  .replace('import.meta.env.VITE_API_BASE_URL', "'https://example.test'"))
const { default: client, configureAuthentication, normalizeApiError } = await import(clientUrl)
const { loginUser, registerUser, registerAdmin } = await import(moduleUrl(
  (await loadSource('../src/api/auth/authApi.js')).replace("'../apiClient.js'", JSON.stringify(clientUrl)),
))
const { tokenExpiry, validSession, readSession, saveSession } = await import('../src/context/authSession.js')
const jwt = payload => `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`
let sent
let responseBody
client.defaults.adapter = async config => {
  sent = config
  return { data: responseBody, status: 200, headers: {}, config }
}

test('login reads nested token and role and omits bearer credentials', async () => {
  configureAuthentication(() => 'existing-session', () => {})
  responseBody = { statusCode: 200, message: 'OK', data: { token: 'returned-token', role: 'backend-role' } }
  assert.deepEqual(await loginUser({ username: 'test', password: 'value', extra: true }), responseBody.data)
  assert.deepEqual(JSON.parse(sent.data), { username: 'test', password: 'value' })
  assert.equal(sent.headers.get('Authorization'), undefined)
})
test('registration sends exactly five fields; admin uses authenticated client', async () => {
  responseBody = { statusCode: 200, message: 'OK', data: null }
  const payload = { username: 'test', password: 'value', fullName: 'Test', phone: '0123', email: 'test@example.test', confirmPassword: 'value', sports: [] }
  await registerUser(payload)
  assert.deepEqual(Object.keys(JSON.parse(sent.data)), ['username', 'password', 'fullName', 'phone', 'email'])
  assert.equal(sent.headers.get('Authorization'), undefined)
  await registerAdmin(payload)
  assert.equal(sent.headers.get('Authorization'), 'Bearer existing-session')
})
test('malformed responses and logical duplicate errors reject', async () => {
  responseBody = { statusCode: 200, data: { role: 'backend-role' } }
  await assert.rejects(loginUser({ username: 'test', password: 'value' }))
  responseBody = '<html>Proxy error</html>'
  await assert.rejects(registerUser({}))
  responseBody = { statusCode: 400, message: 'Username or email already exists', data: null }
  await assert.rejects(registerUser({}), error => error.status === 400 && error.message === responseBody.message)
})
test('HTTP errors normalize and protected 401 clears auth without affecting failed login', async () => {
  let cleared = 0
  configureAuthentication(() => 'session', () => { cleared++ })
  const adapter = client.defaults.adapter
  client.defaults.adapter = async config => { throw { config, response: { status: 401, data: {} } } }
  await assert.rejects(loginUser({ username: 'test', password: 'wrong' }))
  assert.equal(cleared, 0)
  await assert.rejects(client.get('/private'))
  assert.equal(cleared, 1)
  client.defaults.adapter = adapter
  for (const status of [400, 401, 403, 404, 409, 500]) assert.equal(normalizeApiError({ response: { status } }).status, status)
  assert.match(normalizeApiError({ code: 'ECONNABORTED' }).message, /thời gian/)
  assert.equal(normalizeApiError({}).status, 0)
})
test('JWT expiration and invalid sessions reject; storage restores and clears sessions', () => {
  const token = jwt({ exp: Math.floor(Date.now() / 1000) + 300 })
  assert.equal(validSession({ token, role: 'backend-role' }), true)
  assert.equal(validSession({ token: jwt({ exp: 1 }), role: 'backend-role' }), false)
  assert.equal(tokenExpiry('invalid'), 0)
  assert.equal(tokenExpiry(jwt({})), 0)
  assert.equal(validSession({ token, role: '' }), false)
  const stored = new Map()
  globalThis.sessionStorage = {
    getItem: key => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: key => stored.delete(key),
  }
  saveSession({ token, role: 'backend-role' })
  assert.deepEqual(readSession(), { token, role: 'backend-role' })
  saveSession(null)
  assert.equal(readSession(), null)
  saveSession({ token: 'invalid', role: 'backend-role' })
  assert.equal(readSession(), null)
  assert.equal(stored.size, 0)
  delete globalThis.sessionStorage
})
test('only explicitly configured roles may access existing destinations', async () => {
  const source = await loadSource('../src/Auth/roleRoutes.js')
  const { roleDestination } = await import(moduleUrl(source.replace('import.meta.env.VITE_AUTH_ROLE_ROUTES', JSON.stringify('{"verified-test-role":"/dashboard"}'))))
  assert.equal(roleDestination('verified-test-role'), '/dashboard')
  assert.equal(roleDestination('unknown-role'), null)
  const empty = await import(moduleUrl(source.replace('import.meta.env.VITE_AUTH_ROLE_ROUTES', "'null'")))
  assert.equal(empty.roleDestination('unknown-role'), null)
})
