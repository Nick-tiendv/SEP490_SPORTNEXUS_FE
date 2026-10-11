import { useCallback, useEffect, useRef, useState } from 'react'
import { configureAuthentication } from '../api/apiClient.js'
import { AuthContext } from './authContext.js'
import { createSession, readSession, saveSession, tokenExpiry, validSession } from './authSession.js'
import { mockAuthEnabled } from './mockAuth.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const sessionRef = useRef(session)
  const logout = useCallback(() => {
    sessionRef.current = null
    saveSession(null)
    setSession(null)
  }, [])
  const login = useCallback(({ token, role }) => {
    const next = createSession({ token, role })
    sessionRef.current = next
    saveSession(next)
    setSession(next)
  }, [])
  useEffect(() => configureAuthentication(() => {
    const current = sessionRef.current
    if (validSession(current)) return current.isMockSession ? null : current.token
    if (current) logout()
    return null
  }, logout, () => sessionRef.current?.isMockSession === true), [logout])
  useEffect(() => {
    if (!session || session.isMockSession) return
    let timer
    const check = () => {
      clearTimeout(timer)
      const remaining = tokenExpiry(session.token) - Date.now()
      if (remaining <= 0) logout()
      else timer = setTimeout(check, Math.min(remaining, 2147483647))
    }
    check()
    window.addEventListener('focus', check)
    return () => { clearTimeout(timer); window.removeEventListener('focus', check) }
  }, [session, logout])
  const isMockSession = mockAuthEnabled && session?.isMockSession === true && validSession(session)
  return <AuthContext.Provider value={{ token: session?.token ?? null, role: session?.role ?? null, isMockSession, isAuthenticated: validSession(session), login, logout }}>
    {children}
    {isMockSession && <div role="status" style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 10000, padding: '6px 10px', borderRadius: 8, background: '#fef3c7', color: '#92400e', fontSize: 12, pointerEvents: 'none' }}>DEV MODE – Mock Authentication</div>}
  </AuthContext.Provider>
}
