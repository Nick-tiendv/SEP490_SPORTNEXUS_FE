import { del, get, getList, patch, path, post, put, putWithMessage, upload } from './request.js'
import { withLegacyAddress } from '../../utils/vnAddress.js'

// ---------- Cơ sở của chủ sân ----------
export const getMyFacilities = async () => (await getList('/api/v1/facilities/my-facilities')).items.map(withLegacyAddress)
export const getFacility = async id => withLegacyAddress(await get(`/api/v1/facilities/${path(id)}`))
// CreateFacilityRequest: name, streetAddress, provinceCode, wardCode, latitude, longitude, description, phone, openTime, closeTime, amenityIds, imageUrls.
export const createFacility = payload => post('/api/v1/facilities', payload)
// Mã tỉnh / phường theo tên đã chọn trong form: GET /api/v1/master-data/provinces và /provinces/{code}/wards
export async function resolveAreaCodes(provinceName, wardName) {
  const province = (await getList('/api/v1/master-data/provinces')).items.find(p => p.name === provinceName)
  const ward = province && (await getList(`/api/v1/master-data/provinces/${path(province.code)}/wards`)).items.find(w => w.name === wardName)
  if (!ward) throw new Error('Không tìm thấy mã tỉnh / phường đã chọn, vui lòng chọn lại.')
  return { provinceCode: province.code, wardCode: ward.code }
}
// UpdateFacilityRequest: như trên + status. Field null thì BE giữ nguyên.
// Trả { data: { ...facility, courts, slotConfigChanged }, message }.
export const updateFacility = (id, payload) => putWithMessage(`/api/v1/facilities/${path(id)}`, payload)
export const deleteFacility = id => del(`/api/v1/facilities/${path(id)}`)

// ---------- Ảnh & tiện ích ----------
export const uploadFacilityImages = (id, files) => upload(`/api/v1/facilities/${path(id)}/images`, 'files', files)
export const deleteFacilityImage = (id, imageId) => del(`/api/v1/facilities/${path(id)}/images/${path(imageId)}`)
export const setFacilityThumbnail = (id, imageId) => patch(`/api/v1/facilities/${path(id)}/images/${path(imageId)}/thumbnail`)
export const updateFacilityAmenities = (id, amenityIds) => put(`/api/v1/facilities/${path(id)}/amenities`, { amenityIds })

// ---------- Master data ----------
export const getSports = async () => (await getList('/api/v1/master-data/sports')).items
export const getAmenities = async () => (await getList('/api/v1/master-data/amenities')).items

// ---------- Tổng quan: GET /api/v1/owner/dashboard?FacilityId&From&To ----------
export const getOwnerDashboard = ({ facilityId, from, to } = {}) => get('/api/v1/owner/dashboard', { FacilityId: facilityId, From: from, To: to })
