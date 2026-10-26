import apiClient, { normalizeApiError } from '../apiClient.js'
import { get, getList, post } from '../owner/request.js'
import { toTournament } from '../admin/tournamentApi.js'

const TOURNAMENTS_ENDPOINT = '/api/v1/tournaments'

/**
 * Lấy vé QR tham gia giải đấu (Bước 1)
 * GET /api/v1/tournaments/{id}/qr-ticket
 * @param {string|number} tournamentId - ID giải đấu
 * @returns {Promise<Object>}
 */
export async function getTournamentQrTicket(tournamentId) {
  if (!tournamentId) throw new Error('tournamentId không được để trống')
  try {
    const response = await apiClient.get(`${TOURNAMENTS_ENDPOINT}/${tournamentId}/qr-ticket`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[tournamentApi] Lỗi khi lấy vé QR giải đấu ${tournamentId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Check-in giải đấu (Bước 2)
 * POST /api/v1/tournaments/{id}/check-in
 * @param {string|number} tournamentId - ID giải đấu
 * @param {Object} [payload] - Dữ liệu kèm theo (facilityId, teamId, participantId, ...)
 * @returns {Promise<Object>}
 */
export async function checkInTournament(tournamentId, payload = {}) {
  if (!tournamentId) throw new Error('tournamentId không được để trống')
  try {
    const response = await apiClient.post(`${TOURNAMENTS_ENDPOINT}/${tournamentId}/check-in`, payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[tournamentApi] Lỗi khi check-in giải đấu ${tournamentId}:`, error)
    throw normalizeApiError(error)
  }
}

// ---------- Danh sách & đăng ký giải (phía Player) ----------
// GET /api/v1/tournaments/search: Keyword, Status, RegistrationOpen, Page, PageSize
export async function searchTournaments({ keyword, registrationOpen, page = 1, pageSize = 20 } = {}) {
  const { items, total } = await getList(`${TOURNAMENTS_ENDPOINT}/search`, { Keyword: keyword, RegistrationOpen: registrationOpen, Page: page, PageSize: pageSize })
  return { items: items.map(toTournament), total }
}
// GET /api/v1/tournaments/{id} trả về MẢNG TournamentDetailResponse (giải mẹ kèm children)
export const getTournament = async id => {
  const data = await get(`${TOURNAMENTS_ENDPOINT}/${encodeURIComponent(id)}`)
  const list = Array.isArray(data) ? data : [data]
  return toTournament(list.find(item => !item?.parentTournamentId) || list[0] || {})
}
// GET /api/v1/tournaments/my-registrations: các giải tôi đã đăng ký
export async function getMyRegistrations() {
  const { items } = await getList(`${TOURNAMENTS_ENDPOINT}/my-registrations`)
  // MyTournamentRegistrationResponse: tournamentId (bảng đã đăng ký), parentTournamentId/Name, paymentStatus, tournamentStatus, qrCode
  return items.map(raw => ({
    ...toTournament(raw),
    id: String(raw.tournamentId),
    parentId: String(raw.parentTournamentId || raw.tournamentId),
    name: raw.parentTournamentName ? `${raw.parentTournamentName} — ${raw.tournamentName}` : raw.tournamentName,
    status: raw.tournamentStatus || '',
    registrationStatus: raw.tournamentStatus || '',
    paymentStatus: raw.paymentStatus || '',
    teamName: raw.teamName || '',
    qrCode: raw.qrCode || '',
  }))
}
// POST /api/v1/tournaments/{id}/join?teamId= (teamId chỉ cần với nội dung thi đấu theo đội)
export const joinTournament = (id, teamId) => post(`${TOURNAMENTS_ENDPOINT}/${encodeURIComponent(id)}/join${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ''}`)
// POST /api/v1/tournaments/{id}/cancel: hủy đăng ký của tôi
export const cancelTournamentRegistration = id => post(`${TOURNAMENTS_ENDPOINT}/${encodeURIComponent(id)}/cancel`)
// GET /api/v1/teams/my-teams: đội của tôi (để đăng ký nội dung đôi / đội)
export async function getMyTeams() {
  const { items } = await getList('/api/v1/teams/my-teams')
  return items.map(raw => ({ id: String(raw.id ?? raw.teamId ?? ''), name: raw.name || raw.teamName || 'Đội' }))
}

export default {
  getTournamentQrTicket,
  checkInTournament,
}
