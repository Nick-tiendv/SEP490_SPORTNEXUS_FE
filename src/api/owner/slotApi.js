import { delWithMessage, get, path, post, postWithMessage, put, putWithMessage } from './request.js'

// priceRules: [{ daysOfWeek, startTime, endTime, price }] — dùng cho giờ cao điểm / giờ vàng.

// ---------- Slot theo cơ sở ----------
export const getFacilitySlots = (facilityId, date) => get(`/api/v1/facilities/${path(facilityId)}/slots`, { date })
export const getFacilitySlotsRange = (facilityId, { from, to }) => get(`/api/v1/facilities/${path(facilityId)}/slots/range`, { from, to })
export const getFacilityAvailability = (facilityId, { date, categoryId } = {}) => get(`/api/v1/facilities/${path(facilityId)}/availability`, { date, categoryId })
// GenerateFacilitySlotsRequest: dateFrom, dateTo, openTime, closeTime, durationMinutes, price, priceRules, courtIds.
export const generateFacilitySlots = (facilityId, payload) => post(`/api/v1/facilities/${path(facilityId)}/slots/generate`, payload)
// BulkUpdateSlotsRequest: courtIds, dateFrom, dateTo, startTime, endTime, daysOfWeek, action, price.
// Trả { data: { matchedSlots, affectedSlots, skippedSlots }, message }.
export const bulkUpdateSlots = (facilityId, payload) => putWithMessage(`/api/v1/facilities/${path(facilityId)}/slots/bulk`, payload)
// BulkSlotFilterRequest: courtIds, dateFrom, dateTo, startTime, endTime, daysOfWeek.
// Trả { data: { matchedSlots, affectedSlots, skippedSlots, willRegenerate, regenerateDates }, message }.
export const bulkDeleteSlots = (facilityId, payload) => postWithMessage(`/api/v1/facilities/${path(facilityId)}/slots/bulk-delete`, payload)

// ---------- Slot theo sân ----------
export const getCourtSlots = (courtId, date) => get(`/api/v1/courts/${path(courtId)}/slots`, { date })
// GenerateCourtSlotsRequest: dateFrom, dateTo, openTime, closeTime, durationMinutes, price, priceRules.
export const generateCourtSlots = (courtId, payload) => post(`/api/v1/courts/${path(courtId)}/slots/generate`, payload)
// RegenerateSlotsRequest { fromDate? } (bỏ trống = từ ngày mai): xóa các ca còn trống từ fromDate rồi sinh lại theo
// slotMinutes + priceRules hiện tại của sân; ca đã có khách đặt / đang giữ được giữ nguyên.
export const regenerateCourtSlotsFrom = (courtId, fromDate = null) => post(`/api/v1/courts/${path(courtId)}/slots/regenerate-from`, { fromDate })
// status bỏ trống = BE giữ trạng thái hiện tại (đổi giá ca đang khóa thì ca vẫn khóa). Phải có status hoặc price.
export const updateSlotStatus = (slotId, { status, price }) => put(`/api/v1/slots/${path(slotId)}/status`, { status, price })
// Trả { data: { willRegenerate, regenerateDates }, message }.
export const deleteSlot = slotId => delWithMessage(`/api/v1/slots/${path(slotId)}`)
