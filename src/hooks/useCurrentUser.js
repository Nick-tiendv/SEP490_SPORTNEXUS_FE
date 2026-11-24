import { useEffect, useState } from 'react'
import { getMyProfile, readLocalAvatar } from '../api/player/profileApi.js'
import { readSession } from '../context/authSession.js'

// Thông tin người dùng đang đăng nhập (GET /api/auth/me), dùng chung cho TopBar, trang chủ, thanh toán...
// Gọi API một lần cho cả app; tải lại khi hồ sơ được sửa (sự kiện 'player-profile-updated').
// Chữ viết tắt từ họ tên (tối đa 3 chữ), dùng khi chưa có ảnh đại diện
export const initialsOf = name => (name || '?').trim().split(/\s+/).map(part => part[0]).slice(-3).join('').toUpperCase()

// Cache theo phiên đăng nhập (token): đăng xuất rồi đăng nhập tài khoản khác mà không tải lại trang
// thì phải tải lại /api/auth/me, không được dùng hồ sơ của tài khoản trước.
let cache = null // { key, user }
let pending = null // { key, promise }
const sessionKey = () => readSession()?.token || ''

const fromLogin = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sportnexus_current_user') || '{}')
    return {
      id: saved.id || saved.userId || null,
      name: saved.fullName || saved.name || '',
      username: saved.username ? `@${saved.username}` : '',
      phone: saved.phone || '',
      email: saved.email || '',
      avatarUrl: saved.avatarUrl || readLocalAvatar() || null,
      fairPlayScore: saved.fairPlayScore ?? null,
    }
  } catch {
    return { id: null, name: '', username: '', phone: '', email: '', avatarUrl: readLocalAvatar() || null, fairPlayScore: null }
  }
}
const toUser = me => ({
  id: me.id || me.userId || null,
  name: me.fullName || '',
  username: me.username ? `@${me.username}` : '',
  phone: me.phone || '',
  email: me.email || '',
  avatarUrl: me.avatarUrl || readLocalAvatar() || null,
  fairPlayScore: me.fairPlayScore ?? null,
})
export const loadCurrentUser = (force = false) => load(force)
const load = (force = false) => {
  const key = sessionKey()
  if (!force && cache?.key === key) return Promise.resolve(cache.user)
  if (!force && pending?.key === key) return pending.promise
  const promise = getMyProfile()
    .then(me => {
      const user = toUser(me || {})
      if (sessionKey() === key) cache = { key, user } // phiên đã đổi trong lúc tải thì bỏ kết quả cũ
      return user
    })
    .finally(() => { if (pending?.promise === promise) pending = null })
  pending = { key, promise }
  return promise
}

export function useCurrentUser() {
  const [user, setUser] = useState(() => (cache?.key === sessionKey() ? cache.user : fromLogin()))
  useEffect(() => {
    let active = true
    load().then(value => active && setUser(value)).catch(() => {})
    const refresh = () => load(true).then(value => active && setUser(value)).catch(() => {})
    window.addEventListener('player-profile-updated', refresh)
    return () => {
      active = false
      window.removeEventListener('player-profile-updated', refresh)
    }
  }, [])
  return user
}
