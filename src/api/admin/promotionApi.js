import apiClient from '../apiClient.js'
import { toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)

// ---------- Gói đẩy tin: /api/v1/admin/promotions/packages ----------
// PromotionPackageResponse: id, name, description, targetType (FACILITY | TOURNAMENT), durationDays, price, isActive, createdAt.
export const listPromotionPackages = async targetType => toList(unwrap((await apiClient.get('/api/v1/admin/promotions/packages', { params: clean({ targetType }) })).data)).items
// PromotionPackageRequest: name, description, targetType, durationDays, price, isActive.
export const createPromotionPackage = async payload => unwrap((await apiClient.post('/api/v1/admin/promotions/packages', payload)).data)
export const updatePromotionPackage = async (id, payload) => unwrap((await apiClient.put(`/api/v1/admin/promotions/packages/${path(id)}`, payload)).data)
export const deletePromotionPackage = async id => unwrap((await apiClient.delete(`/api/v1/admin/promotions/packages/${path(id)}`)).data)

// ---------- Lượt đẩy tin đã bán: GET /api/v1/admin/promotions?targetType&activeOnly&status&keyword&page&pageSize ----------
// status: ACTIVE | SCHEDULED | EXPIRED | CANCELLED. keyword: tên chủ sân / gói / cơ sở / giải.
// data.summary { active, scheduled, expired, cancelled, netRevenue, refundedAmount } theo targetType + keyword (không theo trang).
export async function listSoldPromotions(params) {
  const data = unwrap((await apiClient.get('/api/v1/admin/promotions', { params: clean(params) })).data)
  return { ...toList(data), summary: data?.summary || null }
}
// Gỡ 1 lượt đẩy tin (đang chạy / chờ chạy): kết thúc ngay, hoàn phần ngày chưa dùng cho chủ sân. Trả message của BE.
export async function endPromotion(id, reason) {
  const body = (await apiClient.patch(`/api/v1/admin/promotions/${path(id)}/end`, { reason })).data
  return { data: unwrap(body), message: body?.message || '' }
}
