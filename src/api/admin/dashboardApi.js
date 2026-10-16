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

// ---------- Booking ----------
export function normalizeBooking(raw) {
  const start = pick(raw, 'startTime', 'slotStartTime', 'courtSlot.startTime', 'slot.startTime')
  const end = pick(raw, 'endTime', 'slotEndTime', 'courtSlot.endTime', 'slot.endTime')
  const date = pick(raw, 'bookingDate', 'date', 'slotDate', 'courtSlot.date', 'createdAt', 'createdDate')
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
    totalRevenue: toNumber(pick(data, 'totalRevenue', 'revenue', 'totalAmount', 'grossRevenue', 'platformRevenue')),
  }
}

// ---------- Accounts / Facilities / Reports / Master data ----------
const isOwner = account => /owner|chủ sân/i.test(String(pick(account, 'role', 'roleName', 'role.name') ?? ''))
const isActive = account => {
  const flag = pick(account, 'isActive', 'active')
  if (typeof flag === 'boolean') return flag
  const status = String(pick(account, 'status', 'accountStatus') ?? 'active')
  return !/inactive|lock|ban|suspend|disable|deleted/i.test(status)
}
export async function getAccountSummary() {
  const { items, total } = toList(await get('/api/accounts'))
  return { totalUsers: total, activeOwners: items.filter(account => isOwner(account) && isActive(account)).length }
}
export async function getFacilityCount(status) {
  return toList(await get('/api/v1/facilities', { status })).total
}
export async function getPendingReportCount() {
  return toList(await get('/api/v1/reports/admin', { Status: 'Pending', PageIndex: 1, PageSize: 1 })).total
}
export async function getSports() {
  return toList(await get('/api/v1/master-data/sports')).items
    .map(sport => ({ id: pick(sport, 'id', 'sportId'), name: pick(sport, 'name', 'sportName', 'title') }))
    .filter(sport => sport.name)
}
export async function getCurrentUserName() {
  return pick(await get('/api/auth/me'), 'fullName', 'name', 'username', 'userName') || ''
}
