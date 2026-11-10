import { del, get, getList, pick, post, put, upload } from '../owner/request.js'

// ---------- Tài khoản: /api/auth/me ----------
const LOCAL_AVATAR_KEY = 'sportnexus_local_avatar'

export const readLocalAvatar = () => {
  try {
    const direct = localStorage.getItem(LOCAL_AVATAR_KEY)
    if (direct) return direct
    const localProfile = JSON.parse(localStorage.getItem('player_profile_data') || '{}')
    if (localProfile?.avatarUrl) return localProfile.avatarUrl
    const savedUser = JSON.parse(localStorage.getItem('sportnexus_current_user') || '{}')
    return savedUser?.avatarUrl || null
  } catch {
    return null
  }
}

export const saveLocalAvatar = (avatarUrl) => {
  if (!avatarUrl) return
  try {
    localStorage.setItem(LOCAL_AVATAR_KEY, avatarUrl)
    const localProfile = JSON.parse(localStorage.getItem('player_profile_data') || '{}')
    localStorage.setItem('player_profile_data', JSON.stringify({ ...localProfile, avatarUrl }))
    const savedUser = JSON.parse(localStorage.getItem('sportnexus_current_user') || '{}')
    if (Object.keys(savedUser).length > 0) {
      localStorage.setItem('sportnexus_current_user', JSON.stringify({ ...savedUser, avatarUrl }))
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('player-profile-updated'))
    }
  } catch {
    // bỏ qua lỗi bộ nhớ
  }
}

const compressImageToDataUrl = (file, maxSize = 256, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'))
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (typeof document === 'undefined' || typeof Image === 'undefined') {
        resolve(dataUrl)
        return
      }
      const img = new Image()
      img.onerror = () => resolve(dataUrl)
      img.onload = () => {
        try {
          let { width, height } = img
          if (width > maxSize || height > maxSize) {
            if (width >= height) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, width)
          canvas.height = Math.max(1, height)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })

export const getMyProfile = async () => {
  const data = await get('/api/auth/me')
  if (data && typeof data === 'object' && !data.avatarUrl) {
    const localAvatar = readLocalAvatar()
    if (localAvatar) return { ...data, avatarUrl: localAvatar }
  }
  return data
}
// UpdateProfileRequest: fullName, avatarUrl

export const updateMyProfile = ({ fullName, avatarUrl }) => {
  const safeRemoteAvatar = avatarUrl && !String(avatarUrl).startsWith('data:') ? avatarUrl : null
  if (avatarUrl) saveLocalAvatar(avatarUrl)
  return put('/api/auth/me', { fullName, avatarUrl: safeRemoteAvatar })
}
export async function uploadMyAvatar(file) {
  try {
    const res = await upload('/api/auth/me/avatar', 'file', file)
    const url = typeof res === 'string' ? res : (res?.avatarUrl || res?.url || res?.data?.avatarUrl || res?.data?.url)
    if (url) saveLocalAvatar(url)
    return res
  } catch (err) {
    try {
      const fallbackUpload = await upload('/api/v1/uploads/images?purpose=general', 'file', file)
      const fallbackUrl = typeof fallbackUpload === 'string' ? fallbackUpload : (fallbackUpload?.url || fallbackUpload?.avatarUrl)
      if (fallbackUrl) {
        saveLocalAvatar(fallbackUrl)
        await put('/api/auth/me', { avatarUrl: fallbackUrl }).catch(() => {})
        return { avatarUrl: fallbackUrl, url: fallbackUrl }
      }
    } catch {
      // bỏ qua để chuyển sang nén ảnh lưu cục bộ khi dịch vụ lưu trữ đám mây của BE gặp lỗi 500
    }
    if (!err?.status || err?.status >= 500) {
      const dataUrl = await compressImageToDataUrl(file)
      saveLocalAvatar(dataUrl)
      return { avatarUrl: dataUrl, url: dataUrl, isLocalFallback: true }
    }
    throw err
  }
}
// ChangePasswordRequest: oldPassword, newPassword, confirmPassword
export const changePassword = ({ oldPassword, newPassword, confirmPassword }) => post('/api/auth/change-password', { oldPassword, newPassword, confirmPassword })
export const logoutApi = () => post('/api/auth/logout')
// POST /api/auth/logout-all: thu hồi mọi phiên đăng nhập trên tất cả thiết bị
export const logoutAllDevices = () => post('/api/auth/logout-all')

// ---------- Môn thể thao của tôi: /api/auth/me/sports ----------
export const getSportCategories = async () => (await getList('/api/v1/master-data/sports')).items.map(item => ({
  id: String(pick(item, 'id', 'sportCategoryId')),
  name: pick(item, 'name', 'sportName', 'categoryName') || '',
}))

const toMySport = item => ({
  sportCategoryId: String(pick(item, 'sportCategoryId', 'sportId', 'id') ?? ''),
  name: pick(item, 'sportCategoryName', 'sportName', 'name', 'categoryName') || '',
  skillLevel: pick(item, 'skillLevel', 'level') || '',
})
export const getMySports = async () => {
  const data = await get('/api/auth/me/sports')
  const list = Array.isArray(data) ? data : pick(data, 'sports', 'items') || []
  return list.map(toMySport)
}
// skillLevel BE nhận: BEGINNER | INTERMEDIATE | ADVANCED | PROFESSIONAL. Giao diện hiển thị nhãn tiếng Việt.
export const SKILL_LABELS = {
  BEGINNER: 'Mới tập chơi',
  INTERMEDIATE: 'Trung bình - Khá',
  ADVANCED: 'Bán chuyên / Nâng cao',
  PROFESSIONAL: 'Chuyên nghiệp / Thi đấu giải',
}
export const skillLabel = value => SKILL_LABELS[String(value || '').toUpperCase()] || value || ''
export function toSkillEnum(label) {
  const text = String(label || '').toLowerCase()
  if (SKILL_LABELS[String(label || '').toUpperCase()]) return String(label).toUpperCase()
  if (text.includes('chuyên nghiệp') || text.includes('thi đấu giải')) return 'PROFESSIONAL'
  if (text.includes('bán chuyên') || text.includes('nâng cao') || text.includes('khá - đánh') || text.includes('chắc tay')) return 'ADVANCED'
  if (text.includes('trung bình')) return 'INTERMEDIATE'
  if (text.includes('mới')) return 'BEGINNER'
  return null
}

// UpdateUserSportsRequest: { sports: [{ sportCategoryId, skillLevel }] } (ghi đè toàn bộ, tối đa 10 môn)
export const updateMySports = sports => put('/api/auth/me/sports', {
  sports: sports.map(sport => ({ sportCategoryId: sport.sportCategoryId, skillLevel: toSkillEnum(sport.skillLevel) })),
})

// ---------- Bảo mật tài khoản (trang Hồ sơ) ----------
export const uploadAvatar = uploadMyAvatar
// AddPhoneRequest: phone, otpCode | firebaseIdToken
export const updatePhone = payload => post('/api/auth/me/phone', payload)
export const sendEmailOtp = () => post('/api/auth/me/email/send-otp', {})
export const verifyEmail = ({ otpCode }) => post('/api/auth/me/email/verify', { otpCode: String(otpCode || '').trim() })
// Đặt mật khẩu cho tài khoản đăng nhập Google / Facebook chưa có mật khẩu: newPassword, confirmPassword
export const setPassword = payload => post('/api/auth/set-password', payload)
export const deleteMyAccount = () => del('/api/auth/me')
