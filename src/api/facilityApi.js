import apiClient, { normalizeApiError } from './apiClient.js'
import { ENDPOINTS } from './apiConfig.js'

export const FACILITIES_ENDPOINT = '/api/v1/facilities'

/**
 * Lấy danh sách toàn bộ cơ sở thể thao từ Backend API /api/v1/facilities
 * @returns {Promise<Array>} Danh sách cơ sở thể thao
 */
export async function getFacilities() {
  try {
    const response = await apiClient.get(FACILITIES_ENDPOINT, { skipAuth: true })
    const body = response.data
    if (body?.statusCode === 200 && Array.isArray(body?.data)) {
      return body.data
    }
    if (Array.isArray(body)) {
      return body
    }
    return []
  } catch (error) {
    console.warn('[facilityApi] Không thể kết nối API /api/v1/facilities:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy chi tiết một cơ sở thể thao theo ID
 * @param {string} facilityId - UUID của cơ sở
 * @returns {Promise<Object>} Chi tiết cơ sở thể thao
 */
export async function getFacilityById(facilityId) {
  if (!facilityId) return null
  try {
    const response = await apiClient.get(`${FACILITIES_ENDPOINT}/${facilityId}`, { skipAuth: true })
    const body = response.data
    if (body?.statusCode === 200 && body?.data) {
      return body.data
    }
    return body
  } catch (error) {
    console.warn(`[facilityApi] Không thể tải chi tiết cơ sở ${facilityId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Ánh xạ tên môn thể thao tiếng Việt sang key môn trong hệ thống
 */
export function categoryToSportKey(cat = '') {
  const norm = String(cat).toLowerCase()
  if (norm.includes('cầu lông') || norm.includes('badminton')) return 'badminton'
  if (norm.includes('pickleball')) return 'pickleball'
  if (norm.includes('bóng đá') || norm.includes('football') || norm.includes('soccer')) return 'football'
  if (norm.includes('bóng rổ') || norm.includes('basketball')) return 'basketball'
  if (norm.includes('tennis') || norm.includes('quần vợt')) return 'tennis'
  if (norm.includes('bóng chuyền') || norm.includes('volleyball')) return 'volleyball'
  return 'badminton'
}

/**
 * Xác định quận/huyện từ chuỗi địa chỉ
 */
export function detectDistrictFromAddress(loc = '') {
  const norm = String(loc)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

  if (norm.includes('thu duc') || norm.includes('thao dien') || norm.includes('quan 2') || norm.includes('q2') || norm.includes('quan 9') || norm.includes('q9') || norm.includes('linh chieu') || norm.includes('vo van ngan') || norm.includes('tang nhon phu') || norm.includes('sala')) return 'thuduc'
  if (norm.includes('binh thanh') || norm.includes('dinh bo linh') || norm.includes('dien bien phu') || norm.includes('hang xanh')) return 'binhthanh'
  if (norm.includes('quan 7') || norm.includes('q7') || norm.includes('phu my hung') || norm.includes('nguyen luong bang') || norm.includes('huynh tan phat') || norm.includes('tan phu, quan 7') || norm.includes('tan phu, q7')) return 'q7'
  if (norm.includes('quan 1') || norm.includes('q1') || norm.includes('nguyen hue') || norm.includes('ben nghe') || norm.includes('ben thanh') || norm.includes('tao dan')) return 'q1'
  if (norm.includes('quan 3') || norm.includes('q3') || norm.includes('ho xuan huong') || norm.includes('vo thi sau')) return 'q3'
  if (norm.includes('quan 5') || norm.includes('q5')) return 'q5'
  if (norm.includes('quan 10') || norm.includes('q10') || norm.includes('lan anh') || norm.includes('3 thang 2')) return 'q10'
  if (norm.includes('phu nhuan') || norm.includes('rach mieu')) return 'phunhuan'
  if (norm.includes('tan binh') || norm.includes('hoang hoa tham')) return 'tanbinh'
  if (norm.includes('quan 8') || norm.includes('q8')) return 'quan8'
  if (norm.includes('tan phu') || norm.includes('celadon')) return 'tanphu'
  if (norm.includes('go vap') || norm.includes('quang trung')) return 'govap'
  if (norm.includes('quan 11') || norm.includes('q11') || norm.includes('phu tho')) return 'q11'
  if (norm.includes('quan 12') || norm.includes('q12')) return 'q12'
  if (norm.includes('binh tan')) return 'binhtan'
  return 'thuduc'
}

/**
 * Chuyển đổi Facility từ backend API thành đối tượng Court tương thích với giao diện Player
 */
export function transformFacilityToCourt(fac) {
  if (!fac) return null

  const thumbnail =
    fac.imageItems?.find((img) => img.isThumbnail)?.url ||
    fac.images?.[0] ||
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop'

  const rawImages = Array.isArray(fac.images)
    ? fac.images
    : typeof fac.images === 'string'
    ? fac.images.split(/\s+/).filter(Boolean)
    : [thumbnail]

  // Trích xuất danh sách môn thể thao tại cơ sở này
  const childCourts = Array.isArray(fac.courts) ? fac.courts : []
  const sports = Array.from(new Set(childCourts.map((c) => categoryToSportKey(c.categoryName))))
  const primarySport = sports[0] || 'badminton'

  // Tìm mức giá sàn thấp nhất từ các sân con đang ACTIVE
  const activeCourts = childCourts.filter((c) => c.status === 'ACTIVE')
  const validPrices = activeCourts.map((c) => Number(c.defaultPrice)).filter((p) => !isNaN(p) && p > 0)
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : (childCourts[0]?.defaultPrice || 100000)

  const streetPart = fac.address?.split(',')?.[0]?.trim() || fac.name
  const districtKey = detectDistrictFromAddress(fac.address)

  const openStr = fac.openTime ? fac.openTime.slice(0, 5) : '06:00'
  const closeStr = fac.closeTime ? fac.closeTime.slice(0, 5) : '22:00'

  const amenitiesList = Array.isArray(fac.amenities) ? fac.amenities : []
  const amenitiesSummary = amenitiesList.map((a) => a.name).slice(0, 3).join(' • ') || 'Đèn ban đêm • Bãi giữ xe'

  return {
    id: fac.id,
    facilityId: fac.id,
    ownerId: fac.ownerId,
    name: fac.name,
    street: streetPart,
    address: fac.address,
    mapQuery: fac.address,
    district: districtKey,
    lat: Number(fac.latitude) || 10.8490,
    lng: Number(fac.longitude) || 106.7537,
    latitude: Number(fac.latitude) || 10.8490,
    longitude: Number(fac.longitude) || 106.7537,
    rating: fac.averageRating > 0 ? fac.averageRating : 4.9,
    reviewCount: fac.reviewCount || 128,
    price: minPrice,
    courtCount: childCourts.length || 4,
    image: thumbnail,
    images: rawImages.length ? rawImages : [thumbnail],
    imageItems: Array.isArray(fac.imageItems) ? fac.imageItems : [],
    amenities: amenitiesList,
    courts: childCourts,
    sports,
    sport: primarySport,
    subCourt: childCourts[0]?.name || `${fac.name} - Sân 01`,
    subCourtDesc: `${openStr} - ${closeStr} • ${amenitiesSummary}`,
    description: fac.description,
    phone: fac.phone,
    openTime: openStr,
    closeTime: closeStr,
    status: fac.status || 'ACTIVE',
    approvalStatus: fac.approvalStatus || 'APPROVED',
    isFromApi: true,
    overrides: {},
    rawFacility: fac,
  }
}
