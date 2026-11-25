import { get, post } from './request.js'
import { getMyProfile as getPlayerOrOwnerProfile, updateMyProfile as updatePlayerOrOwnerProfile, uploadMyAvatar as uploadPlayerOrOwnerAvatar } from '../player/profileApi.js'

// ---------- Hồ sơ cá nhân: /api/auth/me ----------
export const getMyProfile = getPlayerOrOwnerProfile
export const updateMyProfile = updatePlayerOrOwnerProfile
export const uploadMyAvatar = uploadPlayerOrOwnerAvatar
export const logout = () => post('/api/auth/logout')
// Điểm Fair Play của tôi + lịch sử cộng / trừ (history.items hoặc adjustments): GET /api/v1/fair-play/me
export const getMyFairPlay = () => get('/api/v1/fair-play/me')
// ChangePasswordRequest: oldPassword, newPassword (>= 6 ký tự), confirmPassword.
export const changePassword = ({ oldPassword, newPassword, confirmPassword }) => post('/api/auth/change-password', { oldPassword, newPassword, confirmPassword })

// ---------- Xác minh chủ sân (KYC): API chung /api/v1/me/verification ----------
export { getMyVerification, submitVerification, uploadVerificationImage } from '../player/verificationApi.js'
