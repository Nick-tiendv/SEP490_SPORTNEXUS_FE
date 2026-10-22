import { del, get, getList, patch, path, post, put, upload } from './request.js'

// ---------- Cơ sở của chủ sân ----------
export const getMyFacilities = async () => (await getList('/api/v1/facilities/my-facilities')).items
export const getFacility = id => get(`/api/v1/facilities/${path(id)}`)
// CreateFacilityRequest: name, address, latitude, longitude, description, phone, openTime, closeTime, amenityIds, imageUrls.
export const createFacility = payload => post('/api/v1/facilities', payload)
// UpdateFacilityRequest: như trên + status. Field null thì BE giữ nguyên.
export const updateFacility = (id, payload) => put(`/api/v1/facilities/${path(id)}`, payload)
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
