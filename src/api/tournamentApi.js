import apiClient, { normalizeApiError } from './apiClient.js'

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

export default {
  getTournamentQrTicket,
  checkInTournament,
}
