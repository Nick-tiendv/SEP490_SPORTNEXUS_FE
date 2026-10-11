import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { transformWithOxc } from 'vite'
import { AuthContext } from '../src/context/authContext.js'

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
const { tokenExpiry, validSession, readSession, saveSession } = await sessionModule({ DEV: false, VITE_ALLOW_MOCK_AUTH: 'false' })
const jwt = payload => `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`
let sent
let responseBody
let httpStatus = 200
client.defaults.adapter = async config => {
  sent = config
  return { data: responseBody, status: httpStatus, headers: {}, config }
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

async function sessionModule(env) {
  const mockUrl = moduleUrl((await loadSource('../src/context/mockAuth.js')).replaceAll('import.meta.env', `(${JSON.stringify(env)})`))
  return import(moduleUrl((await loadSource('../src/context/authSession.js')).replace("'./mockAuth.js'", JSON.stringify(mockUrl))))
}
const mockToken = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.MockPayload.MockSignature_${'0'.repeat(32)}`

test('mock sessions require development AND exact flag, preserve backend role and reject malformed tokens', async () => {
  for (const env of [
    { DEV: true, VITE_ALLOW_MOCK_AUTH: 'true' },
    { DEV: true, VITE_ALLOW_MOCK_AUTH: 'false' },
    { DEV: false, VITE_ALLOW_MOCK_AUTH: 'true' },
    { DEV: true, VITE_ALLOW_MOCK_AUTH: 'TRUE' },
  ]) {
    const sessions = await sessionModule(env)
    const enabled = env.DEV && env.VITE_ALLOW_MOCK_AUTH === 'true'
    if (enabled) {
      const session = sessions.createSession({ token: mockToken, role: 'Admin' })
      assert.equal(session.isMockSession, true)
      assert.equal(session.role, 'Admin')
      const routeSource = await loadSource('../src/Auth/roleRoutes.js')
      const { roleDestination } = await import(moduleUrl(routeSource.replace('import.meta.env.VITE_AUTH_ROLE_ROUTES', JSON.stringify('{"Admin":"/admin/dashboard","Player":"/dashboard"}'))))
      assert.equal(roleDestination(session.role), '/admin/dashboard')
      const playerSession = sessions.createSession({ token: mockToken, role: 'Player' })
      assert.equal(sessions.validSession(playerSession), true)
      assert.equal(roleDestination(playerSession.role), '/dashboard')
      assert.equal(sessions.validSession(session), true)
      assert.equal(sessions.tokenExpiry(mockToken), 0)
      for (const token of ['invalid', 'header.MockPayload.MockSignature', mockToken + '.extra', mockToken.replace('MockSignature', 'other'), jwt({ exp: 1 })]) {
        assert.throws(() => sessions.createSession({ token, role: 'Admin' }))
      }
      assert.throws(() => sessions.createSession({ token: mockToken, role: ' ' }))
      const stored = new Map()
      globalThis.sessionStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) }
      sessions.saveSession(session)
      assert.deepEqual(sessions.readSession(), session)
      sessions.saveSession(null)
      assert.equal(sessions.readSession(), null)
      delete globalThis.sessionStorage
    } else {
      assert.throws(() => sessions.createSession({ token: mockToken, role: 'Admin' }))
      assert.equal(sessions.validSession({ token: mockToken, role: 'Admin', isMockSession: true }), false)
      let removed = false
      globalThis.sessionStorage = {
        getItem: () => JSON.stringify({ token: mockToken, role: 'Admin', isMockSession: true }),
        removeItem: () => { removed = true },
      }
      assert.equal(sessions.readSession(), null)
      assert.equal(removed, true)
      delete globalThis.sessionStorage
    }
    const real = sessions.createSession({ token: jwt({ exp: Math.floor(Date.now() / 1000) + 300 }), role: 'Admin' })
    assert.equal(real.isMockSession, undefined)
    assert.equal(sessions.validSession(real), true)
  }
})

test('mock login still requires exact HTTP 200, body 200, nonempty token and role', async () => {
  configureAuthentication(() => null, () => {})
  responseBody = { statusCode: 200, data: { token: mockToken, role: 'Admin', fullName: 'Admin' } }
  assert.equal((await loginUser({ username: 'test', password: 'value' })).role, 'Admin')
  for (const status of [201, 204, 401]) {
    httpStatus = status
    await assert.rejects(loginUser({ username: 'test', password: 'value' }))
  }
  httpStatus = 200
  for (const data of [{ token: '', role: 'Admin' }, { token: mockToken, role: ' ' }, { role: 'Admin' }, { token: mockToken }]) {
    responseBody = { statusCode: 200, data }
    await assert.rejects(loginUser({ username: 'test', password: 'value' }))
  }
  responseBody = { statusCode: 201, data: { token: mockToken, role: 'Admin' } }
  await assert.rejects(loginUser({ username: 'test', password: 'value' }))
})

test('mock sessions cannot send protected requests or Admin mutations, but public login remains real', async () => {
  let dispatched = 0
  const adapter = client.defaults.adapter
  client.defaults.adapter = async config => {
    dispatched++
    assert.equal(config.headers.get('Authorization'), undefined)
    return { data: { statusCode: 200, data: { token: mockToken, role: 'Admin' } }, status: 200, headers: {}, config }
  }
  const dispose = configureAuthentication(() => mockToken, () => {}, () => true)
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    await assert.rejects(client[method]('/protected'), error => error.code === 'MOCK_AUTH_BLOCKED')
  }
  await assert.rejects(registerAdmin({}), error => error.code === 'MOCK_AUTH_BLOCKED')
  assert.equal(dispatched, 0)
  await loginUser({ username: 'test', password: 'value' })
  assert.equal(dispatched, 1)
  dispose()
  client.defaults.adapter = adapter
})

test('direct Admin URLs render only for Admin, including restored sessions and bad role mapping', async () => {
  const routeSource = await loadSource('../src/Auth/roleRoutes.js')
  for (const mapping of [
    { Admin: '/admin/dashboard', Player: '/dashboard' },
    { Admin: '/admin/dashboard', Player: '/admin/dashboard' },
  ]) {
    const roleUrl = moduleUrl(routeSource.replace('import.meta.env.VITE_AUTH_ROLE_ROUTES', JSON.stringify(JSON.stringify(mapping))))
    const source = (await loadSource('../src/Auth/ProtectedRoute.jsx'))
      .replace("'react-router-dom'", JSON.stringify(new URL('../node_modules/react-router-dom/dist/index.mjs', import.meta.url).href))
      .replace("'../context/authContext.js'", JSON.stringify(new URL('../src/context/authContext.js', import.meta.url).href))
      .replace("'./roleRoutes.js'", JSON.stringify(roleUrl))
    const compiled = await transformWithOxc(source, 'ProtectedRoute.jsx', { jsx: { runtime: 'automatic' } })
    const { default: Guard } = await import(moduleUrl(compiled.code.replace('"react/jsx-runtime"', JSON.stringify(new URL('../node_modules/react/jsx-runtime.js', import.meta.url).href))))
    for (const path of ['/admin', '/admin/dashboard', '/admin/users']) {
      for (const auth of [{ isAuthenticated: false, role: null }, { isAuthenticated: true, role: 'Player', isMockSession: true }, { isAuthenticated: true, role: 'Admin' }]) {
        const markup = renderToString(createElement(AuthContext.Provider, { value: auth },
          createElement(MemoryRouter, { initialEntries: [path] },
            createElement(Routes, null,
              createElement(Route, { element: createElement(Guard, { destination: '/admin/dashboard', requiredRole: 'Admin' }) },
                createElement(Route, { path: '/admin/*', element: createElement('div', null, 'ADMIN_CONTENT') }))))))
        assert.equal(markup.includes('ADMIN_CONTENT'), auth.isAuthenticated && auth.role === 'Admin')
      }
    }
  }
})
