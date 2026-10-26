import { del, get, getList, path, post, put } from './request.js'

const courtsUrl = facilityId => `/api/v1/facilities/${path(facilityId)}/courts`

export const getCourts = async facilityId => (await getList(courtsUrl(facilityId))).items
export const getCourt = (facilityId, courtId) => get(`${courtsUrl(facilityId)}/${path(courtId)}`)
// CreateCourtRequest: categoryId, name, defaultPrice, courtType, isIndoor, surfaceType, maxPlayers.
export const createCourt = (facilityId, payload) => post(courtsUrl(facilityId), payload)
// UpdateCourtRequest: như trên + status (bật / bảo trì).
export const updateCourt = (facilityId, courtId, payload) => put(`${courtsUrl(facilityId)}/${path(courtId)}`, payload)
export const deleteCourt = (facilityId, courtId) => del(`${courtsUrl(facilityId)}/${path(courtId)}`)
