import { get, post, upload } from '../owner/request.js'

// ---------- Xác minh danh tính (eKYC): /api/v1/me/verification, dùng chung cho người chơi và chủ sân ----------
// Chủ sân: được duyệt mới tạo được cơ sở. Người chơi: được duyệt mới tổ chức được giải (BE chặn khi tạo giải).
// GET trả hồ sơ gần nhất (null nếu chưa nộp): status (PENDING | APPROVED | REJECTED), fullName, idNumber, dateOfBirth,
// address, rejectReason, createdAt, reviewedAt.
export const getMyVerification = () => get('/api/v1/me/verification')
// SubmitOwnerVerificationRequest: fullName, idNumber, dateOfBirth, address, idFrontImageUrl, idBackImageUrl, selfieImageUrl,
// businessLicenseUrl (chỉ chủ sân, người chơi để null).
export const submitVerification = payload => post('/api/v1/me/verification', payload)
// Tải từng ảnh trước, lấy URL trả về để gửi kèm submitVerification.
export const uploadVerificationImage = file => upload('/api/v1/me/verification/images', 'file', file)

// Trạng thái xác minh: chưa nộp hồ sơ = NOT_SUBMITTED
export const verificationStatusOf = data => String(data?.status || 'NOT_SUBMITTED').toUpperCase()
