import { get, getList, path, post, postWithMessage, toList } from './request.js'

// Query: FacilityId, CourtId, Date, DateFrom, DateTo, Status, Search, Page, PageSize.
export const getOwnerBookings = params => getList('/api/v1/bookings/owner', params)
// Như trên nhưng giữ cả số liệu tổng. total / items theo mọi bộ lọc; các ô đếm (pending / paid / checkedIn / cancelled,
// totalActiveRevenue) theo mọi bộ lọc TRỪ status → dùng làm số trên tab trạng thái.
export async function getOwnerBookingsPage(params) {
  const data = await get('/api/v1/bookings/owner', params)
  return {
    ...toList(data),
    revenue: Number(data?.totalActiveRevenue) || 0,
    pendingCount: Number(data?.pendingCount) || 0,
    paidCount: Number(data?.paidCount) || 0,
    checkedInCount: Number(data?.checkedInCount) || 0,
    cancelledCount: Number(data?.cancelledCount) || 0,
  }
}
export const getOwnerBooking = bookingId => get(`/api/v1/bookings/owner/${path(bookingId)}`)
export const getFacilityBookings = (facilityId, { date, status } = {}) => get(`/api/v1/facilities/${path(facilityId)}/bookings`, { date, status })

// CreateWalkInBookingRequest: courtSlotId, numberOfSlots, courtSlotIds, customerAccountId, customerName, customerPhone, note, autoCheckIn.
// Trả { data: { autoCheckedIn, autoCheckedInSlots, bookings[].status, ... }, message }: "Check-in ngay" chỉ check-in
// ca đang trong khung check-in, message báo số ca đã check-in.
export const createWalkInBooking = payload => postWithMessage('/api/v1/bookings/owner/walk-in', payload)
// OwnerCancelBookingRequest: cancelReasonId (mã lý do 1-8 từ cancellation-reasons), reason, lockSlotAfterCancel.
// Khác API hủy của người chơi (vẫn dùng reasonCode).
export const cancelOwnerBooking = (bookingId, { reasonCode, reason, lockSlotAfterCancel = false }) =>
  post(`/api/v1/bookings/owner/${path(bookingId)}/cancel`, { cancelReasonId: reasonCode, reason, lockSlotAfterCancel })
export const getCancellationReasons = async () => (await getList('/api/v1/bookings/cancellation-reasons')).items
// Kết thúc ca sớm: check-out mọi người chơi đang check-in của đơn (kể cả vé kèo LFG). Không hoàn tiền.
export const endOwnerBookingSession = bookingId => post(`/api/v1/bookings/owner/${path(bookingId)}/end`)
