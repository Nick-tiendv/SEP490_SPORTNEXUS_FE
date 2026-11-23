import { del, getList, path, post, put } from './request.js'
import { toPricePeriod } from './pricePeriodModel.js'

export { findOverlappingPeriods, toPricePeriod } from './pricePeriodModel.js'

// Đợt giá đặc biệt / tuần lễ vàng (giá cố định theo khoảng ngày: lễ, sale cuối năm, phụ thu Tết).
// ⚠️ Làm sẵn theo đặc tả FE đề xuất cho BE (chưa có trên swagger 22/11/2026). BE chốt tên khác thì sửa ở file này.
// SpecialPricePeriod: { id, facilityId, name, fromDate, toDate (yyyy-MM-dd, giờ VN), courtIds (rỗng = mọi sân),
//                       startTime?, endTime? (null = cả ngày), price (giá cố định mỗi ca), createdAt }
const periodsUrl = facilityId => `/api/v1/facilities/${path(facilityId)}/price-periods`

// GET ?from&to&courtId
export const getPricePeriods = async (facilityId, { from, to, courtId } = {}) =>
  (await getList(periodsUrl(facilityId), { from, to, courtId })).items.map(toPricePeriod)
// Body: { name, fromDate, toDate, courtIds?, startTime?, endTime?, price }
// Response kèm { updatedSlots, skippedBookedSlots } (số ca trống đã đổi giá / số ca có khách giữ nguyên)
export const createPricePeriod = (facilityId, payload) => post(periodsUrl(facilityId), payload)
export const updatePricePeriod = (facilityId, id, payload) => put(`${periodsUrl(facilityId)}/${path(id)}`, payload)
export const deletePricePeriod = (facilityId, id) => del(`${periodsUrl(facilityId)}/${path(id)}`)
