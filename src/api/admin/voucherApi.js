import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const path = value => encodeURIComponent(value)

// Trạng thái voucher của BE (bảng Vouchers): ACTIVE | USED | EXPIRED
export const VOUCHER_STATUSES = { ACTIVE: 'Còn hiệu lực', USED: 'Đã dùng', EXPIRED: 'Hết hạn' }

// Swagger chưa mô tả response nên đọc theo tên cột bảng Vouchers (Id, UserId, DiscountPercent, Status, ExpiredDate, SourceBookingId, CreatedAt)
export function toAdminVoucher(raw = {}) {
  const percent = Number(pick(raw, 'discountPercent', 'discountPercentage'))
  return {
    id: String(pick(raw, 'id', 'voucherId') ?? ''),
    userId: String(pick(raw, 'userId', 'user.id', 'accountId') ?? ''),
    userName: pick(raw, 'userFullName', 'userName', 'fullName', 'user.fullName', 'user.name') || '',
    userPhone: pick(raw, 'userPhone', 'phone', 'user.phone') || '',
    discountPercent: Number.isFinite(percent) ? percent : null,
    status: String(pick(raw, 'status') ?? '').toUpperCase(),
    expiredDate: pick(raw, 'expiredDate', 'expiresAt', 'expiredAt') || null,
    sourceBookingId: pick(raw, 'sourceBookingId') || null,
    createdAt: pick(raw, 'createdAt') || null,
  }
}

// GET /api/v1/admin/vouchers?status=
export async function listAdminVouchers({ status } = {}) {
  const params = status ? { status } : undefined
  return toList(unwrap((await apiClient.get('/api/v1/admin/vouchers', { params })).data)).items.map(toAdminVoucher)
}
// POST /api/v1/admin/vouchers — AdminCreateVoucherRequest { userId, discountPercent, status?, expiredDate }
export const createAdminVoucher = async ({ userId, discountPercent, status, expiredDate }) =>
  unwrap((await apiClient.post('/api/v1/admin/vouchers', { userId, discountPercent, status: status || null, expiredDate })).data)
// PUT /api/v1/admin/vouchers/{id} — AdminUpdateVoucherRequest { discountPercent, status?, expiredDate }
export const updateAdminVoucher = async (id, { discountPercent, status, expiredDate }) =>
  unwrap((await apiClient.put(`/api/v1/admin/vouchers/${path(id)}`, { discountPercent, status: status || null, expiredDate })).data)
// DELETE /api/v1/admin/vouchers/{id}
export const deleteAdminVoucher = async id => unwrap((await apiClient.delete(`/api/v1/admin/vouchers/${path(id)}`)).data)
