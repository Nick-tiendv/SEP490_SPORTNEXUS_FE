import { get, getList, path, post, toList } from './request.js'

// Query: FacilityId, CourtId, Date, DateFrom, DateTo, Status, Search, Page, PageSize.
export const getOwnerBookings = params => getList('/api/v1/bookings/owner', params)
// Như trên nhưng giữ cả số liệu tổng (totalActiveRevenue, paidCount, checkedInCount, cancelledCount).
export async function getOwnerBookingsPage(params) {
  const data = await get('/api/v1/bookings/owner', params)
  return {
    ...toList(data),
    revenue: Number(data?.totalActiveRevenue) || 0,
    paidCount: Number(data?.paidCount) || 0,
    checkedInCount: Number(data?.checkedInCount) || 0,
    cancelledCount: Number(data?.cancelledCount) || 0,
  }
}
export const getOwnerBooking = bookingId => get(`/api/v1/bookings/owner/${path(bookingId)}`)
export const getFacilityBookings = (facilityId, { date, status } = {}) => get(`/api/v1/facilities/${path(facilityId)}/bookings`, { date, status })

// CreateWalkInBookingRequest: courtSlotId, numberOfSlots, courtSlotIds, customerAccountId, customerName, customerPhone, note, autoCheckIn.
export const createWalkInBooking = payload => post('/api/v1/bookings/owner/walk-in', payload)
// OwnerCancelBookingRequest: reasonCode, reason, lockSlotAfterCancel.
export const cancelOwnerBooking = (bookingId, { reasonCode, reason, lockSlotAfterCancel = false }) =>
  post(`/api/v1/bookings/owner/${path(bookingId)}/cancel`, { reasonCode, reason, lockSlotAfterCancel })
export const getCancellationReasons = async () => (await getList('/api/v1/bookings/cancellation-reasons')).items
