import apiClient from '../apiClient.js'
import { getBookingStatistics, pick, toList, unwrap } from './dashboardApi.js'
import { listAccounts } from './accountApi.js'

export const isOwnerRole = role => /owner|chủ sân/i.test(role || '')

// Chủ sân = tài khoản có vai trò Owner (BE chưa có API riêng cho chủ sân).
export async function listOwners() {
  return (await listAccounts()).filter(account => isOwnerRole(account.role))
}

const asArray = value => (Array.isArray(value) ? value : [])
export function toFacility(raw) {
  const courts = pick(raw, 'courtCount', 'numberOfCourts', 'totalCourts')
  const rating = Number(pick(raw, 'averageRating', 'rating', 'ratingAverage'))
  const reviews = Number(pick(raw, 'reviewCount', 'totalReviews', 'ratingCount'))
  const statusRaw = pick(raw, 'status', 'facilityStatus')
  const activeFlag = pick(raw, 'isActive')
  return {
    id: String(pick(raw, 'id', 'facilityId') ?? ''),
    ownerId: String(pick(raw, 'ownerId', 'owner.id', 'accountId', 'createdBy') ?? ''),
    name: pick(raw, 'name', 'facilityName') || '—',
    location: pick(raw, 'address', 'location', 'fullAddress') || '',
    courts: Number(courts ?? asArray(pick(raw, 'courts')).length) || 0,
    sports: asArray(pick(raw, 'sports', 'categories')).map(item => (typeof item === 'string' ? item : pick(item, 'name', 'sportName'))).filter(Boolean).join(', ') || pick(raw, 'sportName', 'categoryName') || '',
    status: statusRaw ? String(statusRaw) : activeFlag === false ? 'Inactive' : 'Active',
    rating: Number.isFinite(rating) && rating > 0 ? `${rating.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}${Number.isFinite(reviews) && reviews ? ` (${reviews} đánh giá)` : ''}` : null,
  }
}
export async function listFacilities() {
  return toList(unwrap((await apiClient.get('/api/v1/facilities')).data)).items.map(toFacility)
}

// Lượt đặt sân và doanh thu tháng này của một chủ sân.
export async function getOwnerMonthSummary(ownerId, now = new Date()) {
  const pad = value => String(value).padStart(2, '0')
  const DateFrom = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const DateTo = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const stats = await getBookingStatistics({ OwnerId: ownerId, DateFrom, DateTo })
  return { bookings: stats.totalBookings, revenue: stats.totalRevenue }
}
