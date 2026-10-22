import { useEffect, useState } from 'react'
import { getMyProfile } from '../api/player/profileApi.js'
import { getMyFairPlay } from '../api/player/lfgApi.js'

// Thông tin người dùng đang đăng nhập (GET /api/auth/me), dùng chung cho TopBar, trang chủ, thanh toán...
// Gọi API một lần cho cả app; tải lại khi hồ sơ được sửa (sự kiện 'player-profile-updated').
// Chữ viết tắt từ họ tên (tối đa 3 chữ), dùng khi chưa có ảnh đại diện
export const initialsOf = name => (name || '?').trim().split(/\s+/).map(part => part[0]).slice(-3).join('').toUpperCase()

let cache = null
let pending = null

const fromLogin = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('sportnexus_current_user') || '{}')
    return { name: saved.fullName || '', username: saved.username ? `@${saved.username}` : '', phone: '', email: '', avatarUrl: null, fairPlayScore: null }
  } catch {
    return { name: '', username: '', phone: '', email: '', avatarUrl: null, fairPlayScore: null }
  }
}
const toUser = me => ({
  id: me.id || me.userId || null,
  name: me.fullName || '',
  username: me.username ? `@${me.username}` : '',
  phone: me.phone || '',
  email: me.email || '',
  avatarUrl: me.avatarUrl || null,
})
const load = (force = false) => {
  if (!force && (cache || pending)) return pending || Promise.resolve(cache)
  pending = Promise.all([getMyProfile(), getMyFairPlay().catch(() => null)])
    .then(([me, fairPlay]) => {
      const score = Number(fairPlay?.score ?? fairPlay?.fairPlayScore ?? fairPlay?.currentScore)
      cache = { ...toUser(me || {}), fairPlayScore: Number.isFinite(score) ? score : null }
      return cache
    })
    .finally(() => { pending = null })
  return pending
}

export function useCurrentUser() {
  const [user, setUser] = useState(() => cache || fromLogin())
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
