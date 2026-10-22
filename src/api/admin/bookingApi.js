import apiClient from '../apiClient.js'
import { getBookingStatistics, normalizeBooking, pick, toList, unwrap } from './dashboardApi.js'

export { getBookingStatistics }

const toIsoDate = value => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const toClock = value => {
  if (!value) return ''
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toTimeString().slice(0, 5)
}
const minutesOf = clock => (clock ? Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5)) : NaN)
const asArray = value => (Array.isArray(value) ? value : [])

// Chuẩn hóa booking về dạng trang Quản lý đặt sân đang dùng.
// Schema response chưa được BE mô tả nên mỗi field thử nhiều tên phổ biến.
export function toAdminBooking(raw) {
  const base = normalizeBooking(raw)
  const start = toClock(base.start), end = toClock(base.end)
  const duration = (minutesOf(end) - minutesOf(start)) / 60
  const created = pick(raw, 'createdAt', 'createdDate', 'bookingTime', 'createdOn')
  const slots = asArray(pick(raw, 'slots', 'courtSlots', 'bookingSlots', 'bookingDetails', 'items'))
  const charges = slots.length
    ? slots.map((slot, index) => ({
      label: `${toClock(pick(slot, 'startTime', 'courtSlot.startTime')) || `Khung ${index + 1}`}${pick(slot, 'endTime', 'courtSlot.endTime') ? ` – ${toClock(pick(slot, 'endTime', 'courtSlot.endTime'))}` : ''} · Tiền thuê sân`,
      amount: Number(pick(slot, 'price', 'amount', 'totalPrice', 'courtSlot.price')) || 0,
    }))
    : [{ label: 'Tiền thuê sân', amount: base.amount }]
  const members = asArray(pick(raw, 'participants', 'members', 'bookingParticipants', 'players')).map(member => ({
    name: pick(member, 'fullName', 'name', 'account.fullName', 'user.fullName', 'userName') || '—',
    host: Boolean(pick(member, 'isHost', 'host')),
    amount: Number(pick(member, 'amount', 'shareAmount', 'amountToPay')) || 0,
    paid: /paid|success|completed/i.test(String(pick(member, 'paymentStatus', 'status') ?? '')) || pick(member, 'isPaid', 'paid') === true,
  }))
  return {
    uuid: String(pick(raw, 'id', 'bookingId') ?? base.id),
    id: base.id,
    player: {
      id: pick(raw, 'hostId', 'host.id', 'accountId', 'userId', 'account.id') || '',
      name: base.user,
      username: pick(raw, 'hostUsername', 'host.username', 'username', 'account.username') || '',
      email: pick(raw, 'hostEmail', 'host.email', 'email', 'account.email') || '',
      phone: pick(raw, 'hostPhone', 'host.phone', 'phone', 'account.phone') || '',
    },
    venue: {
      id: String(pick(raw, 'facilityId', 'facility.id') ?? ''),
      name: base.facility,
      court: base.court,
      sport: base.sport,
      address: base.location,
      owner: pick(raw, 'ownerName', 'facility.ownerName', 'owner.fullName', 'facility.owner.fullName') || '',
    },
    status: base.status,
    payment: base.payment,
    date: toIsoDate(base.date),
    start,
    end,
    duration: Number.isFinite(duration) && duration > 0 ? duration : null,
    createdDate: toIsoDate(created),
    createdTime: toClock(created),
    amount: base.amount,
    charges,
    members,
    isWalkIn: pick(raw, 'isWalkIn') === true,
    cancellationReason: pick(raw, 'cancellationReason', 'cancelReason', 'cancelledReason', 'reason') || '',
  }
}

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))

// Tham số theo swagger: FacilityId, OwnerId, CourtId, HostId, IsWalkIn, Date, DateFrom, DateTo, Status, Search, Page, PageSize.
export async function listAdminBookings(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/bookings/admin', { params: clean(params) })).data))
  return { items: items.map(toAdminBooking), total, totalPages }
}
export async function countAdminBookings(params) {
  return (await listAdminBookings({ ...params, Page: 1, PageSize: 1 })).total
}
export async function getAdminBooking(bookingId) {
  return toAdminBooking(unwrap((await apiClient.get(`/api/v1/bookings/admin/${encodeURIComponent(bookingId)}`)).data))
}
// Body theo swagger AdminCancelBookingRequest.
export async function cancelAdminBooking(bookingId, { reason, refundPercentage, lockSlotAfterCancel }) {
  return unwrap((await apiClient.post(`/api/v1/bookings/admin/${encodeURIComponent(bookingId)}/cancel`, { reason, refundPercentage, lockSlotAfterCancel })).data)
}
export async function getCancellationReasons() {
  const data = unwrap((await apiClient.get('/api/v1/bookings/cancellation-reasons')).data)
  return toList(data).items.map(item => (typeof item === 'string' ? item : pick(item, 'reason', 'name', 'label', 'text', 'description'))).filter(Boolean)
}
export async function getFacilityOptions() {
  const data = unwrap((await apiClient.get('/api/v1/facilities')).data)
  return toList(data).items.map(item => ({ id: String(pick(item, 'id', 'facilityId') ?? ''), name: pick(item, 'name', 'facilityName') || '—' })).filter(item => item.id)
}
