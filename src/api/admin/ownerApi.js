import { getBookingStatistics } from './dashboardApi.js'
import { listAccounts } from './accountApi.js'
import { listAdminFacilities } from './facilityApi.js'

export const isOwnerRole = role => /owner|chủ sân/i.test(role || '')

// Chủ sân = tài khoản có vai trò Owner (BE chưa có API riêng cho chủ sân).
export async function listOwners() {
  return (await listAccounts()).filter(account => isOwnerRole(account.role))
}

// Cơ sở của chủ sân lấy từ GET /api/v1/admin/facilities (gồm cả cơ sở chờ duyệt / bị khóa).
const FACILITY_PAGE_SIZE = 500
export async function listFacilities() {
  const { items } = await listAdminFacilities({ Page: 1, PageSize: FACILITY_PAGE_SIZE })
  return items.map(facility => ({
    id: facility.id,
    ownerId: facility.owner.id,
    name: facility.name,
    location: facility.address,
    courts: facility.courtCount || 0,
    sports: facility.sports.join(', '),
    status: facility.status,
    rating: facility.rating ? `${facility.rating.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}${facility.reviews ? ` (${facility.reviews} đánh giá)` : ''}` : null,
  }))
}

// Lượt đặt sân và doanh thu tháng này của một chủ sân.
export async function getOwnerMonthSummary(ownerId, now = new Date()) {
  const pad = value => String(value).padStart(2, '0')
  const DateFrom = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const DateTo = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const stats = await getBookingStatistics({ OwnerId: ownerId, DateFrom, DateTo })
  return { bookings: stats.totalBookings, revenue: stats.totalRevenue }
}
