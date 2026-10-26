import { toBracket } from '../admin/tournamentApi.js'
import { del, get, getList, patch, path, post, put } from './request.js'

const url = id => `/api/v1/tournaments/${path(id)}`

// ---------- Giải đấu ----------
export const getMyTournaments = async () => (await getList('/api/v1/tournaments/my-tournaments')).items
export const getFacilityTournaments = async facilityId => (await getList(`/api/v1/facilities/${path(facilityId)}/tournaments`)).items
export const getTournament = id => get(url(id))
// CreateTournamentRequest: facilityId, categoryId, name, children[{ name, categoryType, maxParticipants, entryFee, prizes, minTeamSize, maxTeamSize }].
export const createTournament = payload => post('/api/v1/tournaments', payload)
// UpdateTournamentInfoRequest: name, startDate, endDate, registrationDeadline, imageUrl, rules (null = giữ nguyên). Dùng id giải mẹ hoặc bảng con.
export const updateTournamentInfo = (id, payload) => put(url(id), payload)
export const deleteTournament = id => del(url(id))
export const cancelTournament = (id, reason) => patch(`${url(id)}/cancel-tournament`, { reason })

// ---------- Người / đội tham gia ----------
export const getParticipants = async id => (await getList(`${url(id)}/participants`)).items
// AddTournamentParticipantRequest: userId, phone, teamId.
export const addParticipant = (id, payload) => post(`${url(id)}/participants`, payload)
export const removeParticipant = (id, participantId) => del(`${url(id)}/participants/${path(participantId)}`)
export const checkInParticipant = (id, { participantId, qrCode }) => post(`${url(id)}/check-in`, { participantId, qrCode })

// ---------- Bốc thăm & nhánh đấu ----------
export const executeRandomPairing = id => post(`${url(id)}/execute-random-pairing`)
export const generateBracket = id => post(`${url(id)}/generate-bracket`)
// Trả về [{ label, matches: [{ id, a, b, scoreA, scoreB, sets, winnerId, status, court, time }] }] (dùng chung mapper với Admin).
export const getBracket = async id => toBracket(await get(`${url(id)}/bracket`))

// ---------- Trận đấu ----------
export const getMatch = matchId => get(`/api/v1/matches/${path(matchId)}`)
// UpdateMatchScoreRequest: sets, scoreP1, scoreP2, winnerId, tiebreakP1, tiebreakP2.
export const updateMatchScore = (matchId, payload) => put(`/api/v1/matches/${path(matchId)}/score`, payload)
export const assignMatchCourt = (matchId, courtSlotId) => put(`/api/v1/matches/${path(matchId)}/assign-court`, { courtSlotId })

// ---------- Giữ sân cho giải ----------
// TournamentCourtBlockRequest: courtIds, dateFrom, dateTo, startTime, endTime.
export const blockCourts = (id, payload) => post(`${url(id)}/court-blocks`, payload)
export const releaseCourts = (id, payload) => post(`${url(id)}/court-blocks/release`, payload)
export const getCourtSchedule = id => get(`${url(id)}/court-schedule`)
