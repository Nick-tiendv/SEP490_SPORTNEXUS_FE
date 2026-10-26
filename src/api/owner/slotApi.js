import { del, get, path, post, put } from './request.js'

// priceRules: [{ daysOfWeek, startTime, endTime, price }] — dùng cho giờ cao điểm / giờ vàng.

// ---------- Slot theo cơ sở ----------
export const getFacilitySlots = (facilityId, date) => get(`/api/v1/facilities/${path(facilityId)}/slots`, { date })
export const getFacilitySlotsRange = (facilityId, { from, to }) => get(`/api/v1/facilities/${path(facilityId)}/slots/range`, { from, to })
export const getFacilityAvailability = (facilityId, { date, categoryId } = {}) => get(`/api/v1/facilities/${path(facilityId)}/availability`, { date, categoryId })
// GenerateFacilitySlotsRequest: dateFrom, dateTo, openTime, closeTime, durationMinutes, price, priceRules, courtIds.
export const generateFacilitySlots = (facilityId, payload) => post(`/api/v1/facilities/${path(facilityId)}/slots/generate`, payload)
// BulkUpdateSlotsRequest: courtIds, dateFrom, dateTo, startTime, endTime, daysOfWeek, action, price.
export const bulkUpdateSlots = (facilityId, payload) => put(`/api/v1/facilities/${path(facilityId)}/slots/bulk`, payload)
// BulkSlotFilterRequest: courtIds, dateFrom, dateTo, startTime, endTime, daysOfWeek.
export const bulkDeleteSlots = (facilityId, payload) => post(`/api/v1/facilities/${path(facilityId)}/slots/bulk-delete`, payload)

// ---------- Slot theo sân ----------
export const getCourtSlots = (courtId, date) => get(`/api/v1/courts/${path(courtId)}/slots`, { date })
// GenerateCourtSlotsRequest: dateFrom, dateTo, openTime, closeTime, durationMinutes, price, priceRules.
export const generateCourtSlots = (courtId, payload) => post(`/api/v1/courts/${path(courtId)}/slots/generate`, payload)
export const updateSlotStatus = (slotId, { status, price }) => put(`/api/v1/slots/${path(slotId)}/status`, { status, price })
export const deleteSlot = slotId => del(`/api/v1/slots/${path(slotId)}`)
