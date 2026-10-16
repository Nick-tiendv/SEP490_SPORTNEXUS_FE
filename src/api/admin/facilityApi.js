import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const asArray = value => (Array.isArray(value) ? value : [])
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const nameOf = item => (typeof item === 'string' ? item : pick(item, 'name', 'sportName', 'categoryName', 'amenityName', 'title'))
const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const toClock = value => (value && /^\d{1,2}:\d{2}/.test(value) ? value.slice(0, 5) : '')

export function toCourt(raw) {
  return {
    id: String(pick(raw, 'id', 'courtId') ?? ''),
    name: pick(raw, 'name', 'courtName') || '—',
    sport: nameOf(pick(raw, 'categoryName', 'sportName', 'category', 'sport')) || '',
    status: String(pick(raw, 'status', 'courtStatus') ?? 'Available'),
    price: toNumber(pick(raw, 'defaultPrice', 'price', 'pricePerHour')),
  }
}

// Chuẩn hóa cơ sở. Swagger chưa mô tả schema response nên thử nhiều tên field.
export function toAdminFacility(raw) {
  const courts = asArray(pick(raw, 'courts')).map(toCourt)
  const sports = [...new Set([...asArray(pick(raw, 'sports', 'categories')).map(nameOf), ...courts.map(court => court.sport)].filter(Boolean))]
  const activeFlag = pick(raw, 'isActive')
  return {
    id: String(pick(raw, 'id', 'facilityId') ?? ''),
    name: pick(raw, 'name', 'facilityName') || '—',
    address: pick(raw, 'address', 'fullAddress', 'location') || '',
    latitude: toNumber(pick(raw, 'latitude', 'lat')),
    longitude: toNumber(pick(raw, 'longitude', 'lng', 'lon')),
    owner: {
      id: String(pick(raw, 'ownerId', 'owner.id', 'accountId') ?? ''),
      name: pick(raw, 'ownerName', 'owner.fullName', 'owner.name', 'ownerFullName') || '',
      phone: pick(raw, 'ownerPhone', 'owner.phone') || '',
    },
    status: String(pick(raw, 'status', 'facilityStatus') ?? (activeFlag === false ? 'Inactive' : 'Active')),
    sports,
    courtCount: toNumber(pick(raw, 'courtCount', 'numberOfCourts', 'totalCourts')) ?? (courts.length || null),
    courts,
    rating: toNumber(pick(raw, 'averageRating', 'rating', 'ratingAverage')),
    reviews: toNumber(pick(raw, 'reviewCount', 'totalReviews', 'ratingCount')),
    images: asArray(pick(raw, 'imageUrls', 'images', 'photos')).map(item => (typeof item === 'string' ? item : pick(item, 'url', 'imageUrl'))).filter(Boolean),
    amenities: asArray(pick(raw, 'amenities')).map(item => ({ id: String(pick(item, 'id', 'amenityId') ?? ''), name: nameOf(item) })).filter(item => item.name),
    amenityIds: asArray(pick(raw, 'amenityIds')).map(String),
    opens: toClock(pick(raw, 'openTime', 'openingTime', 'opens')),
    closes: toClock(pick(raw, 'closeTime', 'closingTime', 'closes')),
    createdAt: pick(raw, 'createdAt', 'createdDate') || '',
  }
}

// Tham số theo swagger: lat, lng, radius, categoryId, amenityId, status.
export async function listAdminFacilities(params) {
  return toList(unwrap((await apiClient.get('/api/v1/facilities', { params: clean(params) })).data)).items.map(toAdminFacility)
}
export async function getAdminFacility(id) {
  return toAdminFacility(unwrap((await apiClient.get(`/api/v1/facilities/${encodeURIComponent(id)}`)).data))
}
export async function getFacilityCourts(facilityId) {
  return toList(unwrap((await apiClient.get(`/api/v1/facilities/${encodeURIComponent(facilityId)}/courts`)).data)).items.map(toCourt)
}
// UpdateFacilityRequest: field nào null thì BE giữ nguyên.
export async function updateFacility(id, { name, address, latitude, longitude, status, amenityIds, imageUrls }) {
  return unwrap((await apiClient.put(`/api/v1/facilities/${encodeURIComponent(id)}`, {
    name: name ?? null, address: address ?? null, latitude: latitude ?? null, longitude: longitude ?? null,
    status: status ?? null, amenityIds: amenityIds ?? null, imageUrls: imageUrls ?? null,
  })).data)
}
export async function setFacilityStatus(id, status) {
  return updateFacility(id, { status })
}
async function masterData(path) {
  return toList(unwrap((await apiClient.get(path)).data)).items
    .map(item => ({ id: String(pick(item, 'id', 'sportId', 'amenityId', 'categoryId') ?? ''), name: nameOf(item) }))
    .filter(item => item.id && item.name)
}
export const getSportOptions = () => masterData('/api/v1/master-data/sports')
export const getAmenityOptions = () => masterData('/api/v1/master-data/amenities')
