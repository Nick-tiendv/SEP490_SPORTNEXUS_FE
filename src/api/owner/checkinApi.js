import apiClient from '../apiClient.js'
import { path, post, unwrap } from './request.js'

// Quét mã QR vé (đặt sân / kèo LFG) tại cơ sở: POST /api/v1/checkin/scan?facilityId&qrCode.
// Quét là check-in luôn. Trả kèm message của BE vì nó mô tả kết quả (Booking / LFG, số tiền chuyển...).
export async function scanQrCode({ facilityId, qrCode }) {
  const body = (await apiClient.post('/api/v1/checkin/scan', null, { params: { facilityId, qrCode } })).data
  return { data: unwrap(body), message: body?.message || '' }
}

// Check-in thủ công. Không truyền participantUserId thì check-in cả nhóm.
export const checkInBooking = (bookingId, { participantUserId = null, checkInAllParticipants = true } = {}) =>
  post(`/api/v1/bookings/owner/${path(bookingId)}/check-in`, { participantUserId, checkInAllParticipants })
