import { del, get, patch, path, post, put } from './owner/request.js'

// ---------- Shop tại cơ sở: /api/v1/shop ----------
// Trả tiền tại quầy, KHÔNG qua ví.
const asList = data => (Array.isArray(data) ? data : data?.items || [])

// Sản phẩm: { id, facilityId, name, description, price, stock, imageUrl, isActive }
// includeInactive = true: chủ sân xem cả sản phẩm đang ẩn
export const getShopProducts = async (facilityId, includeInactive = false) =>
  asList(await get(`/api/v1/shop/facilities/${path(facilityId)}/products`, { includeInactive: includeInactive || undefined }))

// ---------- Chủ sân ----------
// UpsertProductRequest: name, description, price, stock, imageUrl, isActive
export const createShopProduct = (facilityId, payload) => post(`/api/v1/shop/facilities/${path(facilityId)}/products`, payload)
export const updateShopProduct = (productId, payload) => put(`/api/v1/shop/products/${path(productId)}`, payload)
export const deleteShopProduct = productId => del(`/api/v1/shop/products/${path(productId)}`)
// Đơn của cơ sở: { id, productId, productName, userId, customerName, customerPhone, quantity, totalAmount, status, note, createdAt }
export const getFacilityShopOrders = async (facilityId, status) => asList(await get(`/api/v1/shop/facilities/${path(facilityId)}/orders`, { status }))
// status: READY | PICKED_UP | CANCELLED
export const updateShopOrderStatus = (orderId, status) => patch(`/api/v1/shop/orders/${path(orderId)}/status`, { status })

// ---------- Người chơi ----------
// CreateProductOrderRequest: productId, quantity (1–50), note
export const createShopOrder = ({ productId, quantity, note }) => post('/api/v1/shop/orders', { productId, quantity, note: note || null })
// Đơn của tôi: { id, productId, productName, facilityId, facilityName, quantity, unitPrice, totalAmount, status, note, createdAt }
export const getMyShopOrders = async () => asList(await get('/api/v1/shop/orders/me'))
// Chỉ hủy được khi PENDING
export const cancelMyShopOrder = orderId => post(`/api/v1/shop/orders/${path(orderId)}/cancel`)

export const SHOP_ORDER_STATUS = {
  PENDING: ['Chờ chuẩn bị', 'amber'],
  READY: ['Sẵn sàng lấy', 'blue'],
  PICKED_UP: ['Đã nhận hàng', 'green'],
  CANCELLED: ['Đã hủy', 'gray'],
}
