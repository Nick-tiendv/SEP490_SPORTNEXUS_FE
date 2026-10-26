import apiClient, { normalizeApiError } from '../apiClient.js'

// Swagger của BE chưa mô tả schema response, nên các hàm normalize bên dưới
// thử nhiều tên field phổ biến. Khi BE chốt schema, chỉ cần sửa trong file này.

export function unwrap(body) {
  if (body && typeof body === 'object' && 'statusCode' in body && 'data' in body) {
    if (body.statusCode < 200 || body.statusCode >= 300) throw normalizeApiError({ response: { status: body.statusCode, data: body } })
    return body.data
  }
  return body
}
async function get(url, params) {
  const clean = Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'All'))
  return unwrap((await apiClient.get(url, { params: clean })).data)
}

// Lấy giá trị đầu tiên khác null theo danh sách đường dẫn ("a.b.c").
export function pick(source, ...paths) {
  for (const path of paths) {
    const value = path.split('.').reduce((obj, key) => (obj == null ? undefined : obj[key]), source)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}
const toNumber = value => {
  const number = typeof value === 'string' ? Number(value.replace(/[^\d.-]/g, '')) : Number(value)
  return Number.isFinite(number) ? number : undefined
}

// Chuẩn hóa danh sách có / không phân trang về { items, total }.
export function toList(data) {
  const items = Array.isArray(data) ? data : pick(data, 'items', 'data', 'records', 'results', 'list', 'content') || []
  const total = toNumber(pick(data, 'totalCount', 'totalItems', 'totalRecords', 'total', 'count', 'pagination.totalCount', 'pagination.total')) ?? items.length
  const totalPages = toNumber(pick(data, 'totalPages', 'pageCount', 'pagination.totalPages'))
  return { items: Array.isArray(items) ? items : [], total, totalPages }
}

// Lấy đủ mọi trang của một danh sách (pageSize tối đa 100 theo docs 02), dừng ở maxPages để giới hạn số request.
// fetchPage(page, pageSize) phải trả { items, total, totalPages } như toList.
export const MAX_PAGE_SIZE = 100
export async function fetchAllPages(fetchPage, maxPages = 20) {
  const first = await fetchPage(1, MAX_PAGE_SIZE)
  const pages = Math.min(maxPages, first.totalPages || Math.ceil((first.total || 0) / MAX_PAGE_SIZE) || 1)
  const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, index) => fetchPage(index + 2, MAX_PAGE_SIZE)))
  return [first, ...rest].flatMap(result => result.items)
}

// ---------- Booking ----------
export function normalizeBooking(raw) {
  const start = pick(raw, 'startTime', 'slotStartTime', 'courtSlot.startTime', 'slot.startTime')
  const end = pick(raw, 'endTime', 'slotEndTime', 'courtSlot.endTime', 'slot.endTime')
  // Ngày của đơn = ngày chơi (startTime); ngày tạo đơn chỉ là phương án cuối.
  const date = pick(raw, 'bookingDate', 'date', 'slotDate', 'courtSlot.date', 'startTime', 'createdAt', 'createdDate')
  const user = pick(raw, 'hostName', 'host.fullName', 'customerName', 'userName', 'accountName', 'account.fullName', 'user.fullName', 'playerName') || '—'
  return {
    id: String(pick(raw, 'bookingCode', 'code', 'id', 'bookingId') ?? ''),
    user,
    initials: user.split(/\s+/).filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase() || '?',
    facility: pick(raw, 'facilityName', 'facility.name') || '—',
    court: pick(raw, 'courtName', 'court.name') || '',
    location: pick(raw, 'facilityAddress', 'address', 'facility.address') || '',
    sport: pick(raw, 'sportName', 'sport.name', 'categoryName', 'court.sportName', 'facility.sportName') || '',
    date,
    start,
    end,
    amount: toNumber(pick(raw, 'totalAmount', 'amount', 'totalPrice', 'price', 'finalAmount')) ?? 0,
    status: String(pick(raw, 'status', 'bookingStatus') ?? 'Pending'),
    payment: String(pick(raw, 'paymentStatus', 'payment.status') ?? ''),
    isWalkIn: pick(raw, 'isWalkIn') === true,
    participantCount: toNumber(pick(raw, 'participantCount')),
    checkedInCount: toNumber(pick(raw, 'checkedInCount')),
  }
}
export async function getAdminBookings(params) {
  const { items, total, totalPages } = toList(await get('/api/v1/bookings/admin', params))
  return { items: items.map(normalizeBooking), total, totalPages }
}
export async function getBookingStatistics({ DateFrom, DateTo, OwnerId, FacilityId } = {}) {
  const data = await get('/api/v1/bookings/admin/statistics', { DateFrom, DateTo, OwnerId, FacilityId }) || {}
  return {
    raw: data,
    totalBookings: toNumber(pick(data, 'totalBookings', 'totalBooking', 'bookingCount', 'total', 'count')),
    // activeRevenue = doanh thu đơn chưa hủy (docs 11: AdminBookingStatisticsResponse).
    totalRevenue: toNumber(pick(data, 'activeRevenue', 'grossBookingVolume', 'totalRevenue', 'revenue', 'totalAmount', 'grossRevenue', 'platformRevenue')),
    paid: toNumber(data.paidBookingsCount),
    checkedIn: toNumber(data.checkedInBookingsCount),
    cancelled: toNumber(data.cancelledBookingsCount),
    walkIn: toNumber(data.walkInBookingsCount),
    cancellationRate: toNumber(data.cancellationRatePercent),
    checkInRate: toNumber(data.checkInRatePercent),
    refunded: toNumber(data.totalRefundedAmount),
    penalty: toNumber(data.totalPenaltyRetainedAmount),
  }
}

// ---------- Admin dashboard: GET /api/v1/admin/dashboard?fromDate&toDate ----------
const numbers = (source, keys) => Object.fromEntries(keys.map(key => [key, toNumber(source?.[key])]))
// Layout (badge), trang Tổng quan và biểu đồ cùng gọi API này: gộp request trùng và cache ngắn hạn.
// Truyền { fresh: true } để bỏ qua cache (nút "Làm mới", tải lại badge sau khi chuyển trang).
const DASHBOARD_CACHE_MS = 15000
const dashboardCache = new Map()
export function getAdminDashboard({ fromDate, toDate } = {}, { fresh = false } = {}) {
  const key = `${fromDate || ''}|${toDate || ''}`
  const hit = dashboardCache.get(key)
  if (!fresh && hit && Date.now() - hit.at < DASHBOARD_CACHE_MS) return hit.promise
  const promise = loadAdminDashboard({ fromDate, toDate })
  dashboardCache.set(key, { at: Date.now(), promise })
  promise.catch(() => { if (dashboardCache.get(key)?.promise === promise) dashboardCache.delete(key) })
  return promise
}
async function loadAdminDashboard({ fromDate, toDate }) {
  const data = await get('/api/v1/admin/dashboard', { fromDate, toDate }) || {}
  return {
    from: data.from,
    to: data.to,
    users: numbers(data.users, ['total', 'players', 'owners', 'admins', 'locked', 'newInRange', 'claimBanned', 'belowFairPlayThreshold']),
    facilities: numbers(data.facilities, ['total', 'approved', 'pending', 'rejected', 'courts']),
    bookings: numbers(data.bookings, ['inRange', 'paid', 'checkedIn', 'cancelled', 'pending', 'cancelRate']),
    revenue: numbers(data.revenue, ['bookingGrossValue', 'platformRevenue', 'bookingCommissionRevenue', 'promotionRevenue', 'ownerBookingEarnings', 'totalDeposits', 'withdrawalsCompleted', 'totalWalletBalance', 'totalFrozenBalance', 'currentBookingFeePercent']),
    tournaments: numbers(data.tournaments, ['total', 'open', 'inProgress', 'finished', 'cancelled', 'locked']),
    lfg: numbers(data.lfg, ['createdInRange', 'open', 'filled', 'cancelled']),
    pending: numbers(data.pending, ['facilityApprovals', 'ownerVerifications', 'withdrawals', 'withdrawalAmount', 'openReports']),
    byDay: (Array.isArray(data.byDay) ? data.byDay : []).map(day => ({
      date: day.date,
      newUsers: toNumber(day.newUsers) ?? 0,
      bookings: toNumber(day.bookings) ?? 0,
      bookingGrossValue: toNumber(day.bookingGrossValue) ?? 0,
    })),
  }
}
