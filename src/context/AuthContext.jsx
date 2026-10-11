import { useCallback, useEffect, useRef, useState } from 'react'
import { configureAuthentication } from '../api/apiClient.js'
import { AuthContext } from './authContext.js'
import { readSession, saveSession, tokenExpiry, validSession } from './authSession.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const sessionRef = useRef(session)
  const logout = useCallback(() => {
    sessionRef.current = null
    saveSession(null)
    setSession(null)
  }, [])
  const login = useCallback(({ token, role }) => {
    const next = { token, role }
    if (!validSession(next)) throw new Error('Token đăng nhập không hợp lệ hoặc đã hết hạn.')
    sessionRef.current = next
    saveSession(next)
    setSession(next)
  }, [])
  useEffect(() => configureAuthentication(() => {
    const current = sessionRef.current
    if (validSession(current)) return current.token
    if (current) logout()
    return null
  }, logout), [logout])
  useEffect(() => {
    if (!session) return
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
  return <AuthContext.Provider value={{ token: session?.token ?? null, role: session?.role ?? null, isAuthenticated: validSession(session), login, logout }}>{children}</AuthContext.Provider>
}
