import { isBackendMockToken, mockAuthEnabled } from './mockAuth.js'

const key = 'sportnexus.auth'
export function createSession({ token, role }) {
  const session = { token, role }

  if (mockAuthEnabled && isBackendMockToken(token)) session.isMockSession = true
  if (!validSession(session)) throw new Error('Token đăng nhập không hợp lệ hoặc đã hết hạn.')
  return session
}
export function tokenExpiry(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts.every(part => /^[A-Za-z0-9_-]+$/.test(part)) || isBackendMockToken(token)) return 0
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!Number.isFinite(payload.exp)) return 0
    if (payload.nbf && payload.nbf * 1000 > Date.now()) return 0
    return payload.exp * 1000
  } catch { return 0 }
}
export function validSession(session) {
  if (typeof session?.token !== 'string' || typeof session?.role !== 'string' || !session.role.trim()) return false
  if (session.isMockSession === true) return mockAuthEnabled && isBackendMockToken(session.token)
  return tokenExpiry(session.token) > Date.now()
}
export function readSession() {
  try {
    let raw = sessionStorage.getItem(key)
    if (!raw) raw = localStorage.getItem(key)
    if (raw) {
      const session = JSON.parse(raw)
      if (validSession(session)) return session
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    }
  } catch { /* Storage may be unavailable. */ }
  return null
}
export function saveSession(session) {
  try {
    if (session) {
      const serialized = JSON.stringify(session)
      sessionStorage.setItem(key, serialized)
      localStorage.setItem(key, serialized)
    } else {
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    }
  } catch { /* In-memory authentication still works. */ }
}
