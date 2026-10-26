import { get, getList, post, toList } from './request.js'

// ---------- Gói đẩy tin (quảng bá cơ sở / giải đấu) ----------
// GET /api/v1/promotions/packages?targetType=FACILITY|TOURNAMENT: các gói đang bán.
export const getPromotionPackages = async targetType => toList(await get('/api/v1/promotions/packages', { targetType })).items
// PurchasePromotionRequest: packageId, targetId (cơ sở / giải của mình). Đang có lượt chạy thì BE nối thêm thời hạn.
export const purchasePromotion = ({ packageId, targetId }) => post('/api/v1/promotions', { packageId, targetId })
// Query: activeOnly, page, pageSize.
export const getMyPromotions = params => getList('/api/v1/promotions/mine', params)
