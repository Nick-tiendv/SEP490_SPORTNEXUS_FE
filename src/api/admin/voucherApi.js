import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const path = value => encodeURIComponent(value)

// Trạng thái voucher của BE (bảng Vouchers): ACTIVE | USED | EXPIRED. BE đã quy đổi ACTIVE quá hạn thành EXPIRED.
export const VOUCHER_STATUSES = { ACTIVE: 'Còn hiệu lực', USED: 'Đã dùng', EXPIRED: 'Hết hạn' }
// Admin tạo / sửa chỉ chọn được ACTIVE hoặc EXPIRED (thu hồi); USED do hệ thống đặt khi dùng cho đơn.
export const VOUCHER_EDITABLE_STATUSES = { ACTIVE: 'Còn hiệu lực', EXPIRED: 'Hết hạn (thu hồi)' }
// Nguồn cấp voucher (source)
export const VOUCHER_SOURCES = { OWNER_CANCEL: 'Chủ sân hủy đơn', FORCE_MAJEURE: 'Bất khả kháng', ADMIN: 'Admin tặng' }

// AdminVoucherResponse: id, userId, userName, userEmail, discountPercent, status, source, expiredDate, sourceBookingId, usedBookingId, createdAt
export function toAdminVoucher(raw = {}) {
  const percent = Number(pick(raw, 'discountPercent', 'discountPercentage'))
  return {
    id: String(pick(raw, 'id', 'voucherId') ?? ''),
    userId: String(pick(raw, 'userId', 'user.id', 'accountId') ?? ''),
    userName: pick(raw, 'userName', 'userFullName', 'fullName', 'user.fullName', 'user.name') || '',
    userEmail: pick(raw, 'userEmail', 'email', 'user.email') || '',
    userPhone: pick(raw, 'userPhone', 'phone', 'user.phone') || '',
    discountPercent: Number.isFinite(percent) ? percent : null,
    status: String(pick(raw, 'status') ?? '').toUpperCase(),
    source: String(pick(raw, 'source') ?? '').toUpperCase(),
    expiredDate: pick(raw, 'expiredDate', 'expiresAt', 'expiredAt') || null,
    sourceBookingId: pick(raw, 'sourceBookingId') || null,
    // Đơn đang giữ voucher: khác null thì BE không cho sửa / xóa
    usedBookingId: pick(raw, 'usedBookingId') || null,
    // Admin tạo mã (null với mã hệ thống cấp / mã tạo trước khi BE lưu người tạo)
    createdByName: pick(raw, 'createdByName') || '',
    createdAt: pick(raw, 'createdAt') || null,
  }
}

// GET /api/v1/admin/vouchers?status&keyword&userId&source&page&pageSize → data { page, pageSize, totalItems, items, summary }
// keyword: tên / email / SĐT người nhận. summary { active, used, expired } theo keyword / userId / source (không theo status / trang).
export async function listAdminVouchers({ status, keyword, source, page = 1, pageSize = 20 } = {}) {
  const params = { page, pageSize, ...(status ? { status } : {}), ...(keyword ? { keyword } : {}), ...(source ? { source } : {}) }
  const data = unwrap((await apiClient.get('/api/v1/admin/vouchers', { params })).data)
  const { items, total, totalPages } = toList(data)
  return { items: items.map(toAdminVoucher), total, totalPages: totalPages || Math.max(1, Math.ceil(total / pageSize)), summary: data?.summary || null }
}
// POST /api/v1/admin/vouchers — AdminCreateVoucherRequest { userId, discountPercent, status?, expiredDate }
export const createAdminVoucher = async ({ userId, discountPercent, status, expiredDate }) =>
  unwrap((await apiClient.post('/api/v1/admin/vouchers', { userId, discountPercent, status: status || null, expiredDate })).data)
// PUT /api/v1/admin/vouchers/{id} — AdminUpdateVoucherRequest { discountPercent, status?, expiredDate }
export const updateAdminVoucher = async (id, { discountPercent, status, expiredDate }) =>
  unwrap((await apiClient.put(`/api/v1/admin/vouchers/${path(id)}`, { discountPercent, status: status || null, expiredDate })).data)
// DELETE /api/v1/admin/vouchers/{id}
export const deleteAdminVoucher = async id => unwrap((await apiClient.delete(`/api/v1/admin/vouchers/${path(id)}`)).data)
