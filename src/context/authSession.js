const key = 'sportnexus.auth'
export function tokenExpiry(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts.every(Boolean)) return 0
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!Number.isFinite(payload.exp)) return 0
    if (payload.nbf && payload.nbf * 1000 > Date.now()) return 0
    return payload.exp * 1000
  } catch { return 0 }
}
export function validSession(session) {
  return typeof session?.token === 'string' && typeof session?.role === 'string' && !!session.role && tokenExpiry(session.token) > Date.now()
}
export function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(key))
    if (validSession(session)) return session
    sessionStorage.removeItem(key)
  } catch { /* Storage may be unavailable. */ }
  return null
}
export function saveSession(session) {
  try {
    if (session) sessionStorage.setItem(key, JSON.stringify(session))
    else sessionStorage.removeItem(key)
  } catch { /* In-memory authentication still works. */ }
}
