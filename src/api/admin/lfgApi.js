import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const asArray = value => (Array.isArray(value) ? value : [])

function toParticipant(raw) {
  const paid = pick(raw, 'isPaid', 'paid')
  return {
    id: String(pick(raw, 'id', 'participantId', 'userId') ?? ''),
    userId: String(pick(raw, 'userId', 'user.id') ?? ''),
    name: pick(raw, 'fullName', 'userName', 'name', 'user.fullName') || '—',
    status: String(pick(raw, 'status', 'claimStatus') ?? ''),
    payment: typeof paid === 'boolean' ? (paid ? 'PAID' : 'UNPAID') : String(pick(raw, 'paymentStatus', 'payStatus') ?? ''),
    amount: toNumber(pick(raw, 'amount', 'amountPaid', 'pricePerPerson')),
    side: pick(raw, 'side', 'team') || '',
    isHost: pick(raw, 'isHost') === true,
    joinedAt: pick(raw, 'joinedAt', 'claimedAt', 'createdAt') || '',
  }
}

// Kèo LFG từ GET /api/v1/admin/lfgs và /{cardId}. Chưa có response mẫu (danh sách rỗng) nên thử nhiều tên field;
// tên dựa theo CreateLfgRequest (slotsNeeded, sideSize, pricePerPerson, skillLevelTag, description, requireApproval).
export function toLfg(input) {
  const raw = input?.card && typeof input.card === 'object' ? { ...input, ...input.card } : input
  const participants = asArray(pick(raw, 'participants', 'members', 'claims', 'players')).map(toParticipant)
  const totalSlots = toNumber(pick(raw, 'totalSlots', 'capacity', 'maxPlayers'))
  const slotsNeeded = toNumber(pick(raw, 'slotsNeeded', 'neededSlots'))
  const filled = toNumber(pick(raw, 'filledSlots', 'joinedCount', 'participantCount', 'currentPlayers')) ?? (participants.length || null)
  return {
    id: String(pick(raw, 'id', 'cardId', 'lfgId') ?? ''),
    title: pick(raw, 'title', 'name') || '',
    status: String(pick(raw, 'status') ?? '').toUpperCase(),
    host: {
      id: String(pick(raw, 'hostId', 'host.id', 'creatorId') ?? ''),
      name: pick(raw, 'hostName', 'host.fullName', 'host.name', 'creatorName') || '—',
      phone: pick(raw, 'hostPhone', 'host.phone') || '',
    },
    sport: pick(raw, 'sportName', 'categoryName', 'sport.name', 'category.name') || '',
    facility: pick(raw, 'facilityName', 'facility.name') || '',
    facilityId: String(pick(raw, 'facilityId', 'facility.id') ?? ''),
    court: pick(raw, 'courtName', 'court.name') || '',
    address: pick(raw, 'facilityAddress', 'address', 'facility.address') || '',
    start: pick(raw, 'startTime', 'slotStartTime', 'playTime', 'courtSlot.startTime') || '',
    end: pick(raw, 'endTime', 'slotEndTime', 'courtSlot.endTime') || '',
    date: pick(raw, 'slotDate', 'playDate', 'date', 'courtSlot.date') || '',
    totalSlots: totalSlots ?? (slotsNeeded != null && filled != null ? slotsNeeded + filled : null),
    slotsNeeded,
    filled,
    sideSize: toNumber(pick(raw, 'sideSize')),
    pricePerPerson: toNumber(pick(raw, 'pricePerPerson', 'price')),
    skill: pick(raw, 'skillLevelTag', 'skillLevel') || '',
    description: pick(raw, 'description') || '',
    requireApproval: pick(raw, 'requireApproval') === true,
    bookingId: String(pick(raw, 'bookingId', 'booking.id') ?? ''),
    collected: toNumber(pick(raw, 'totalCollected', 'collectedAmount')),
    held: toNumber(pick(raw, 'totalHeld', 'heldAmount', 'escrowAmount')),
    cancelReason: pick(raw, 'cancelReason', 'cancellationReason', 'cancelledReason') || '',
    createdAt: pick(raw, 'createdAt') || '',
    participants,
  }
}

// Query: Status, HostId, FacilityId, CategoryId, FromDate, ToDate, Keyword, Page, PageSize.
export async function listLfgs(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/lfgs', { params: clean(params) })).data))
  return { items: items.map(toLfg), total, totalPages }
}
export async function getLfg(id) {
  return toLfg(unwrap((await apiClient.get(`/api/v1/admin/lfgs/${path(id)}`)).data))
}
export async function getLfgStatistics() {
  const data = unwrap((await apiClient.get('/api/v1/admin/lfgs/statistics')).data) || {}
  const keys = ['totalCards', 'openCards', 'filledCards', 'cancelledCards', 'expiredCards', 'fillRate', 'slotFillRate', 'activeParticipants', 'totalCollected', 'totalHeld', 'totalReleased', 'newCardsThisMonth']
  return {
    ...Object.fromEntries(keys.map(key => [key, toNumber(data[key])])),
    topSports: asArray(data.topSports).map(item => ({ name: pick(item, 'sportName', 'name', 'categoryName') || '—', count: toNumber(pick(item, 'count', 'cards', 'total')) ?? 0 })),
  }
}
// AdminCancelLfgRequest: reason bắt buộc; cancelBooking + bookingRefundPercentage (0–100) khi hủy cả đơn đặt sân.
export const cancelLfg = async (id, { reason, cancelBooking, bookingRefundPercentage }) =>
  unwrap((await apiClient.post(`/api/v1/admin/lfgs/${path(id)}/cancel`, { reason, cancelBooking: !!cancelBooking, bookingRefundPercentage: cancelBooking ? bookingRefundPercentage : 0 })).data)
