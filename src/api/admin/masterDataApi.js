import apiClient from '../apiClient.js'
import { toList, unwrap } from './dashboardApi.js'

const path = value => encodeURIComponent(value)
const count = value => (Number.isFinite(Number(value)) ? Number(value) : 0)

// Danh mục dùng chung (docs 33): môn thể thao và tiện ích. Xóa là xóa mềm, có thể khôi phục.
const RESOURCES = {
  sports: {
    url: '/api/v1/admin/master-data/sports',
    // AdminSportCategoryResponse
    map: raw => ({ id: String(raw?.id ?? ''), name: raw?.name || '', description: raw?.rulesDescription || '', isDeleted: Boolean(raw?.isDeleted), courtCount: count(raw?.courtCount), tournamentCount: count(raw?.tournamentCount) }),
    // SportCategoryRequest: name (≤ 100), rulesDescription (≤ 5000)
    body: ({ name, description }) => ({ name: name.trim(), rulesDescription: description.trim() || null }),
  },
  amenities: {
    url: '/api/v1/admin/master-data/amenities',
    // AdminAmenityResponse
    map: raw => ({ id: String(raw?.id ?? ''), name: raw?.name || '', iconCode: raw?.iconCode || '', isDeleted: Boolean(raw?.isDeleted), facilityCount: count(raw?.facilityCount) }),
    // AmenityRequest: name (≤ 100), iconCode (≤ 50)
    body: ({ name, iconCode }) => ({ name: name.trim(), iconCode: iconCode.trim() || null }),
  },
}

// Trả kèm message của BE để hiện nguyên văn ("Đã xóa tiện ích và gỡ khỏi N cơ sở"...).
const withMessage = (response, map) => ({ data: map ? map(unwrap(response)) : unwrap(response), message: response?.message || '' })

export async function listMasterData(kind, { includeDeleted = false } = {}) {
  const { url, map } = RESOURCES[kind]
  return toList(unwrap((await apiClient.get(url, { params: includeDeleted ? { includeDeleted: true } : {} })).data)).items.map(map)
}
export async function createMasterData(kind, values) {
  const { url, map, body } = RESOURCES[kind]
  return withMessage((await apiClient.post(url, body(values))).data, map)
}
export async function updateMasterData(kind, id, values) {
  const { url, map, body } = RESOURCES[kind]
  return withMessage((await apiClient.put(`${url}/${path(id)}`, body(values))).data, map)
}
export async function deleteMasterData(kind, id) {
  return withMessage((await apiClient.delete(`${RESOURCES[kind].url}/${path(id)}`)).data)
}
export async function restoreMasterData(kind, id) {
  const { url, map } = RESOURCES[kind]
  return withMessage((await apiClient.patch(`${url}/${path(id)}/restore`)).data, map)
}
