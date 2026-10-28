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

// ---------- Lượt đẩy tin đã bán: GET /api/v1/admin/promotions?targetType&activeOnly&page&pageSize ----------
export async function listSoldPromotions(params) {
  return toList(unwrap((await apiClient.get('/api/v1/admin/promotions', { params: clean(params) })).data))
}
