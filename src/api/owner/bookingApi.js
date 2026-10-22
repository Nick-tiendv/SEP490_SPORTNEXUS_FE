import { get, getList, path, post } from './request.js'

// Query: FacilityId, CourtId, Date, DateFrom, DateTo, Status, Search, Page, PageSize.
export const getOwnerBookings = params => getList('/api/v1/bookings/owner', params)
export const getOwnerBooking = bookingId => get(`/api/v1/bookings/owner/${path(bookingId)}`)
export const getFacilityBookings = (facilityId, { date, status } = {}) => get(`/api/v1/facilities/${path(facilityId)}/bookings`, { date, status })

// CreateWalkInBookingRequest: courtSlotId, numberOfSlots, courtSlotIds, customerAccountId, customerName, customerPhone, note, autoCheckIn.
export const createWalkInBooking = payload => post('/api/v1/bookings/owner/walk-in', payload)
// OwnerCancelBookingRequest: reasonCode, reason, lockSlotAfterCancel.
export const cancelOwnerBooking = (bookingId, { reasonCode, reason, lockSlotAfterCancel = false }) =>
  post(`/api/v1/bookings/owner/${path(bookingId)}/cancel`, { reasonCode, reason, lockSlotAfterCancel })
export const getCancellationReasons = async () => (await getList('/api/v1/bookings/cancellation-reasons')).items
