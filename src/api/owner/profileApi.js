import { get, post, put, upload } from './request.js'

// ---------- Hồ sơ cá nhân: /api/auth/me ----------
export const getMyProfile = () => get('/api/auth/me')
export const updateMyProfile = payload => put('/api/auth/me', payload)
export const uploadMyAvatar = file => upload('/api/auth/me/avatar', 'file', file)
export const logout = () => post('/api/auth/logout')
// ChangePasswordRequest: oldPassword, newPassword (>= 6 ký tự), confirmPassword.
export const changePassword = ({ oldPassword, newPassword, confirmPassword }) => post('/api/auth/change-password', { oldPassword, newPassword, confirmPassword })

// ---------- Xác minh chủ sân (KYC): /api/v1/owner/verification ----------
export const getMyVerification = () => get('/api/v1/owner/verification')
// SubmitOwnerVerificationRequest: fullName, idNumber, dateOfBirth, address, idFrontImageUrl, idBackImageUrl, selfieImageUrl, businessLicenseUrl.
export const submitVerification = payload => post('/api/v1/owner/verification', payload)
// Upload từng ảnh trước, lấy URL trả về để gửi kèm submitVerification.
export const uploadVerificationImage = file => upload('/api/v1/owner/verification/images', 'file', file)
