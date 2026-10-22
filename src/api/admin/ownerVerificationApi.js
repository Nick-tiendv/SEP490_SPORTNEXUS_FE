import apiClient from '../apiClient.js'
import { toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)

// Bản ghi KYC từ GET /api/v1/admin/owner-verifications và /{id}. status: PENDING | APPROVED | REJECTED.
export function toVerification(raw) {
  return {
    id: String(raw?.id ?? ''),
    userId: String(raw?.userId ?? ''),
    accountName: raw?.accountName || '',
    accountEmail: raw?.accountEmail || '',
    accountPhone: raw?.accountPhone || '',
    fullName: raw?.fullName || '',
    idNumber: raw?.idNumber || '',
    dateOfBirth: raw?.dateOfBirth || '',
    address: raw?.address || '',
    documents: [
      ['CCCD mặt trước', raw?.idFrontImageUrl],
      ['CCCD mặt sau', raw?.idBackImageUrl],
      ['Ảnh chân dung', raw?.selfieImageUrl],
      ['Giấy phép kinh doanh', raw?.businessLicenseUrl],
    ].map(([label, url]) => ({ label, url: url || '' })),
    status: String(raw?.status ?? 'PENDING').toUpperCase(),
    rejectReason: raw?.rejectReason || '',
    reviewedAt: raw?.reviewedAt || '',
    createdAt: raw?.createdAt || '',
  }
}

export async function listOwnerVerifications({ status, keyword, page = 1, pageSize = 20 } = {}) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/owner-verifications', { params: clean({ status, keyword, page, pageSize }) })).data))
  return { items: items.map(toVerification), total, totalPages }
}
export async function getOwnerVerification(id) {
  return toVerification(unwrap((await apiClient.get(`/api/v1/admin/owner-verifications/${path(id)}`)).data))
}
export const approveOwnerVerification = async id => unwrap((await apiClient.patch(`/api/v1/admin/owner-verifications/${path(id)}/approve`)).data)
export const rejectOwnerVerification = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/owner-verifications/${path(id)}/reject`, { reason: reason || null })).data)
