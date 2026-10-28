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
// GET /api/v1/tournaments?facilityId&categoryId&status: danh sách giải công khai
export async function getTournaments({ facilityId, categoryId, status } = {}) {
  const { items } = await getList(TOURNAMENTS_ENDPOINT, { facilityId, categoryId, status })
  return items.map(toTournament)
}
// GET /api/v1/facilities/{facilityId}/tournaments: giải tổ chức tại một cơ sở
export const getFacilityTournaments = async facilityId =>
  (await getList(`/api/v1/facilities/${encodeURIComponent(facilityId)}/tournaments`)).items.map(toTournament)

// GET /api/v1/tournaments/my-matches?from&to: lịch thi đấu của tôi
// MyMatchResponse: matchId, tournamentName, parentTournamentName, roundName, status, startTime, endTime, courtName, facilityName, mySideName, opponentName, winnerName
export const getMyMatches = async ({ from, to } = {}) => (await getList(`${TOURNAMENTS_ENDPOINT}/my-matches`, { from, to })).items

// GET /api/v1/tournaments/{id}/court-schedule: các khung giờ sân đã giữ và các trận đã xếp sân
export const getCourtSchedule = id => get(`${TOURNAMENTS_ENDPOINT}/${encodeURIComponent(id)}/court-schedule`)

// GET /api/v1/tournaments/{id}/participants (công khai, id là bảng đấu): VĐV / đội đã đăng ký
// TournamentParticipantResponse: participantId, fullName, avatarUrl, teamName, isCheckedIn, teamMembers[]
export const getTournamentParticipants = async id => (await getList(`${TOURNAMENTS_ENDPOINT}/${encodeURIComponent(id)}/participants`)).items

// GET /api/v1/tournaments/{id}/bracket (công khai): danh sách trận { id, matchIndex, roundName, status, startTime, courtName, p1, p2, winner, scores[] }
// Gom theo vòng đấu, giữ thứ tự BE trả về.
export async function getTournamentBracket(id) {
  const data = await get(`${TOURNAMENTS_ENDPOINT}/${encodeURIComponent(id)}/bracket`)
  const matches = Array.isArray(data) ? data : data?.items || data?.matches || []
  const rounds = []
  for (const m of [...matches].sort((a, b) => (a.matchIndex ?? 0) - (b.matchIndex ?? 0))) {
    const name = m.roundName || 'Vòng đấu'
    let round = rounds.find(r => r.name === name)
    if (!round) rounds.push(round = { name, matches: [] })
    round.matches.push(m)
  }
  return rounds
}

// GET /api/v1/matches/{matchId}: BE trả MẢNG MatchDetailResponse (lấy phần tử đầu)
export async function getMatch(matchId) {
  const data = await get(`/api/v1/matches/${encodeURIComponent(matchId)}`)
  return Array.isArray(data) ? data[0] || null : data
}

export default {
  getTournamentQrTicket,
  checkInTournament,
}
