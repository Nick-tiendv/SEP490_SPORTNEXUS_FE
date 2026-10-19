import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const asArray = value => (Array.isArray(value) ? value : [])
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const nameOf = item => (typeof item === 'string' ? item : pick(item, 'name', 'sportName', 'categoryName', 'amenityName', 'title'))
const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const toClock = value => (value && /^\d{1,2}:\d{2}/.test(value) ? value.slice(0, 5) : '')
const path = value => encodeURIComponent(value)

export function toCourt(raw) {
  return {
    id: String(pick(raw, 'id', 'courtId') ?? ''),
    name: pick(raw, 'name', 'courtName') || '—',
    sport: nameOf(pick(raw, 'categoryName', 'sportName', 'category', 'sport')) || '',
    status: String(pick(raw, 'status', 'courtStatus') ?? 'Available'),
    price: toNumber(pick(raw, 'defaultPrice', 'price', 'pricePerHour')),
  }
}

// Trạng thái hiển thị gộp từ approvalStatus / isLocked / isDeleted / status của API admin.
function displayStatus({ approval, locked, deleted, status }) {
  if (deleted) return 'Deleted'
  if (locked) return 'Locked'
  if (/pending/i.test(approval)) return 'Pending'
  if (/reject/i.test(approval)) return 'Rejected'
  if (/inactive|disable/i.test(status)) return 'Inactive'
  return 'Active'
}

// Chuẩn hóa cơ sở từ GET /api/v1/admin/facilities và /{facilityId}. Swagger không mô tả schema response nên vẫn thử vài tên field.
export function toAdminFacility(input) {
  const raw = input?.facility && typeof input.facility === 'object' ? { ...input, ...input.facility } : input
  const courts = asArray(pick(raw, 'courts')).map(toCourt)
  const sports = [...new Set([...asArray(pick(raw, 'sports', 'sportNames', 'categories')).map(nameOf), ...courts.map(court => court.sport)].filter(Boolean))]
  const approval = String(pick(raw, 'approvalStatus') ?? '')
  const locked = pick(raw, 'isLocked') === true
  const deleted = pick(raw, 'isDeleted') === true
  const rawStatus = String(pick(raw, 'status', 'facilityStatus') ?? '')
  const thumbnail = pick(raw, 'thumbnailUrl', 'coverImageUrl', 'imageUrl')
  const images = asArray(pick(raw, 'imageUrls', 'images', 'photos')).map(item => (typeof item === 'string' ? item : pick(item, 'url', 'imageUrl'))).filter(Boolean)
  return {
    id: String(pick(raw, 'id', 'facilityId') ?? ''),
    name: pick(raw, 'name', 'facilityName') || '—',
    address: pick(raw, 'address', 'fullAddress', 'location') || '',
    description: pick(raw, 'description') || '',
    phone: pick(raw, 'phone') || '',
    latitude: toNumber(pick(raw, 'latitude', 'lat')),
    longitude: toNumber(pick(raw, 'longitude', 'lng', 'lon')),
    owner: {
      id: String(pick(raw, 'ownerId', 'owner.id') ?? ''),
      name: pick(raw, 'ownerName', 'owner.fullName', 'owner.name') || '',
      email: pick(raw, 'ownerEmail', 'owner.email') || '',
      phone: pick(raw, 'ownerPhone', 'owner.phone') || '',
    },
    approval,
    locked,
    deleted,
    rawStatus,
    status: displayStatus({ approval, locked, deleted, status: rawStatus }),
    lockReason: pick(raw, 'lockedReason', 'lockReason') || '',
    rejectReason: pick(raw, 'rejectedReason', 'rejectReason', 'rejectionReason') || '',
    sports,
    courtCount: toNumber(pick(raw, 'courtCount', 'totalCourts', 'numberOfCourts')) ?? (courts.length || null),
    courts,
    rating: toNumber(pick(raw, 'averageRating', 'rating', 'ratingAverage')),
    reviews: toNumber(pick(raw, 'reviewCount', 'totalReviews', 'ratingCount')),
    reports: toNumber(pick(raw, 'reportCount', 'openReportCount', 'totalReports')),
    images: [...new Set([thumbnail, ...images].filter(Boolean))],
    amenities: asArray(pick(raw, 'amenities')).map(item => ({ id: String(pick(item, 'id', 'amenityId') ?? ''), name: nameOf(item) })).filter(item => item.name),
    amenityIds: asArray(pick(raw, 'amenityIds')).map(String),
    opens: toClock(pick(raw, 'openTime', 'openingTime')),
    closes: toClock(pick(raw, 'closeTime', 'closingTime')),
    createdAt: pick(raw, 'createdAt', 'createdDate') || '',
    stats: pick(raw, 'stats', 'statistics') || null,
  }
}

// Query theo swagger: Keyword, OwnerId, Status, ApprovalStatus, IsLocked, IsDeleted, SortBy, Page, PageSize.
export async function listAdminFacilities(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/facilities', { params: clean(params) })).data))
  return { items: items.map(toAdminFacility), total, totalPages }
}
export async function getAdminFacility(id) {
  return toAdminFacility(unwrap((await apiClient.get(`/api/v1/admin/facilities/${path(id)}`)).data))
}
export async function getFacilityStatistics() {
  const data = unwrap((await apiClient.get('/api/v1/admin/facilities/statistics')).data) || {}
  const value = key => toNumber(data[key])
  return {
    total: value('totalFacilities'),
    public: value('publicFacilities'),
    inactive: value('inactiveFacilities'),
    pending: value('pendingApproval'),
    rejected: value('rejected'),
    locked: value('locked'),
    deleted: value('deleted'),
    newThisMonth: value('newThisMonth'),
    courts: value('totalCourts'),
    owners: value('totalOwners'),
    byArea: asArray(data.byArea).map(item => ({ area: item.area || '—', count: toNumber(item.count) ?? 0 })),
  }
}
export async function getFacilityCourts(facilityId) {
  return toList(unwrap((await apiClient.get(`/api/v1/facilities/${path(facilityId)}/courts`)).data)).items.map(toCourt)
}

export const approveFacility = async id => unwrap((await apiClient.patch(`/api/v1/admin/facilities/${path(id)}/approve`)).data)
export const rejectFacility = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/facilities/${path(id)}/reject`, { reason })).data)
export const lockFacility = async (id, { reason, cancelUpcomingBookings }) => unwrap((await apiClient.patch(`/api/v1/admin/facilities/${path(id)}/lock`, { reason, cancelUpcomingBookings: !!cancelUpcomingBookings })).data)
export const unlockFacility = async id => unwrap((await apiClient.patch(`/api/v1/admin/facilities/${path(id)}/unlock`)).data)

// PUT /api/v1/facilities/{id} (UpdateFacilityRequest): field nào null thì BE giữ nguyên.
export async function updateFacility(id, { name, address, latitude, longitude, amenityIds, imageUrls }) {
  return unwrap((await apiClient.put(`/api/v1/facilities/${path(id)}`, {
    name: name ?? null, address: address ?? null, latitude: latitude ?? null, longitude: longitude ?? null,
    status: null, amenityIds: amenityIds ?? null, imageUrls: imageUrls ?? null,
  })).data)
}
async function masterData(url) {
  return toList(unwrap((await apiClient.get(url)).data)).items
    .map(item => ({ id: String(pick(item, 'id', 'sportId', 'amenityId', 'categoryId') ?? ''), name: nameOf(item) }))
    .filter(item => item.id && item.name)
}
export const getSportOptions = () => masterData('/api/v1/master-data/sports')
export const getAmenityOptions = () => masterData('/api/v1/master-data/amenities')
