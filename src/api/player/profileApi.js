import { get, getList, pick, post, put, upload } from '../owner/request.js'

// ---------- Tài khoản: /api/auth/me ----------
export const getMyProfile = () => get('/api/auth/me')
// UpdateProfileRequest: fullName, avatarUrl
export const updateMyProfile = ({ fullName, avatarUrl }) => put('/api/auth/me', { fullName, avatarUrl })
export const uploadMyAvatar = file => upload('/api/auth/me/avatar', 'file', file)
// ChangePasswordRequest: oldPassword, newPassword, confirmPassword
export const changePassword = ({ oldPassword, newPassword, confirmPassword }) => post('/api/auth/change-password', { oldPassword, newPassword, confirmPassword })
export const logoutApi = () => post('/api/auth/logout')

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
// UpdateUserSportsRequest: { sports: [{ sportCategoryId, skillLevel }] } (ghi đè toàn bộ danh sách)
export const updateMySports = sports => put('/api/auth/me/sports', {
  sports: sports.map(sport => ({ sportCategoryId: sport.sportCategoryId, skillLevel: sport.skillLevel || null })),
})
