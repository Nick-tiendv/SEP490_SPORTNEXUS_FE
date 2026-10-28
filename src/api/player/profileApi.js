import { del, get, getList, pick, post, put, upload } from '../owner/request.js'

// ---------- Tài khoản: /api/auth/me ----------
export const getMyProfile = () => get('/api/auth/me')
// UpdateProfileRequest: fullName, avatarUrl
export const updateMyProfile = ({ fullName, avatarUrl }) => put('/api/auth/me', { fullName, avatarUrl })
export const uploadMyAvatar = file => upload('/api/auth/me/avatar', 'file', file)
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
export const uploadAvatar = file => upload('/api/auth/me/avatar', 'file', file)
// AddPhoneRequest: phone, otpCode | firebaseIdToken
export const updatePhone = payload => post('/api/auth/me/phone', payload)
export const sendEmailOtp = () => post('/api/auth/me/email/send-otp', {})
export const verifyEmail = ({ otpCode }) => post('/api/auth/me/email/verify', { otpCode: String(otpCode || '').trim() })
// Đặt mật khẩu cho tài khoản đăng nhập Google / Facebook chưa có mật khẩu: newPassword, confirmPassword
export const setPassword = payload => post('/api/auth/set-password', payload)
export const deleteMyAccount = () => del('/api/auth/me')
