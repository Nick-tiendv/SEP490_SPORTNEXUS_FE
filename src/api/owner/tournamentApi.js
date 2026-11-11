import { toBracket } from '../admin/tournamentApi.js'
import { del, get, getList, patch, path, post, put } from './request.js'

const url = id => `/api/v1/tournaments/${path(id)}`

// ---------- Giải đấu ----------
// scope = 'facility': giải người khác tổ chức tại cơ sở của tôi (chủ sân xem và giữ sân); mặc định: giải tôi tổ chức.
// Mỗi giải có organizerId, organizerName, isOrganizer, purpose (INTERNAL = giải nội bộ), tier.
export const getMyTournaments = async (scope) => (await getList('/api/v1/tournaments/my-tournaments', scope ? { scope } : undefined)).items
export const getFacilityTournaments = async facilityId => (await getList(`/api/v1/facilities/${path(facilityId)}/tournaments`)).items
export const getTournament = id => get(url(id))
// CreateTournamentRequest: facilityId, categoryId, name, startDate, endDate, registrationDeadline, rules,
// tier (AMATEUR | SEMI_PRO | PRO), purpose (EXCHANGE | COMMERCIAL | DEVELOPMENT | INTERNAL), minRating, maxRating, minRatedMatches,
// children[{ name, categoryType, maxParticipants, minParticipants, entryFee, prizes, minTeamSize, maxTeamSize }].
// Giải thưởng chỉ để hiển thị (BTC trao ngoài hệ thống), không giữ quỹ trong ví. Owner hoặc Player tạo; giải của Player chờ Admin duyệt.
export const createTournament = payload => post('/api/v1/tournaments', payload)
// UpdateTournamentInfoRequest: name, startDate, endDate, registrationDeadline, imageUrl, rules (null = giữ nguyên). Dùng id giải mẹ hoặc bảng con.
// entryFee: lệ phí bảng đấu, gửi với id bảng con, chỉ khi bảng còn mở và chưa có ai đăng ký.
export const updateTournamentInfo = (id, payload) => put(url(id), payload)
export const deleteTournament = id => del(url(id))
export const cancelTournament = (id, reason) => patch(`${url(id)}/cancel-tournament`, { reason })

// ---------- Người / đội tham gia ----------
export const getParticipants = async id => (await getList(`${url(id)}/participants`)).items
// AddTournamentParticipantRequest: userId, phone, teamId. Không còn thêm thẳng: BE gửi lời mời (chỉ giải nội bộ).
export const addParticipant = (id, payload) => post(`${url(id)}/participants`, payload)

// ---------- Lời mời giải nội bộ (purpose = INTERNAL) ----------
// Mời VĐV (userId / phone) hoặc đội (teamId; đội trưởng nhận lời mời) vào bảng đấu; người được mời chấp nhận mới được đăng ký
export const inviteToTournament = (childId, { userId, phone, teamId, message }) =>
  post(`${url(childId)}/invitations`, { userId: userId || null, phone: phone || null, teamId: teamId || null, message: message || null })
export const getTournamentInvitations = async childId => (await getList(`${url(childId)}/invitations`)).items
export const cancelTournamentInvitation = invitationId => del(`/api/v1/tournaments/invitations/${path(invitationId)}`)
export const removeParticipant = (id, participantId) => del(`${url(id)}/participants/${path(participantId)}`)
export const checkInParticipant = (id, { participantId, qrCode }) => post(`${url(id)}/check-in`, { participantId, qrCode })

// ---------- Bốc thăm & nhánh đấu ----------
export const executeRandomPairing = id => post(`${url(id)}/execute-random-pairing`)
// format: KNOCKOUT | ROUND_ROBIN | GROUP_KNOCKOUT (trống = tự chọn). Loại trực tiếp có miễn đấu (bye).
export const generateBracket = (id, format) => post(`${url(id)}/generate-bracket${format ? `?format=${encodeURIComponent(format)}` : ''}`)
// GET /standings: [{ group, rows[{ rank, participantId, name, played, won, drawn, lost, points, diff, scored }] }]
export const getStandings = async id => {
  const data = await get(`${url(id)}/standings`)
  return Array.isArray(data) ? data : data ? [data] : []
}
// Trả về [{ label, matches: [{ id, a, b, scoreA, scoreB, sets, winnerId, status, court, time }] }] (dùng chung mapper với Admin).
export const getBracket = async id => toBracket(await get(`${url(id)}/bracket`))

// ---------- Trận đấu ----------
export const getMatch = matchId => get(`/api/v1/matches/${path(matchId)}`)
// UpdateMatchScoreRequest: sets, scoreP1, scoreP2, winnerId, tiebreakP1, tiebreakP2,
// resultType: NORMAL (mặc định) | WALKOVER (không ra sân, chỉ cần winnerId) | RETIRED (bỏ cuộc, tỉ số dở dang + winnerId).
// Hòa (chỉ vòng bảng / vòng tròn bóng đá): tỉ số bằng nhau, không gửi luân lưu → trận trả resultType = DRAW, winnerId = null.
export const updateMatchScore = (matchId, payload) => put(`/api/v1/matches/${path(matchId)}/score`, payload)
export const assignMatchCourt = (matchId, courtSlotId) => put(`/api/v1/matches/${path(matchId)}/assign-court`, { courtSlotId })

// ---------- Giữ sân cho giải ----------
// TournamentCourtBlockRequest: courtIds, dateFrom, dateTo, startTime, endTime.
export const blockCourts = (id, payload) => post(`${url(id)}/court-blocks`, payload)
export const releaseCourts = (id, payload) => post(`${url(id)}/court-blocks/release`, payload)
export const getCourtSchedule = id => get(`${url(id)}/court-schedule`)

// PUT /api/v1/matches/{matchId}/officials: phân trọng tài cho trận
export const assignMatchOfficials = (matchId, staffIds) => put(`/api/v1/matches/${path(matchId)}/officials`, { staffIds })

// ---------- Nhân sự giải (trọng tài, người ghi điểm): người có accountId nhập được tỉ số ----------
export const getTournamentStaff = async id => (await getList(`${url(id)}/staff`)).items
// { fullName, phone, role: REFEREE | SCORER | OTHER, accountId?, note? }
export const addTournamentStaff = (id, payload) => post(`${url(id)}/staff`, payload)
export const removeTournamentStaff = (id, staffId) => del(`${url(id)}/staff/${path(staffId)}`)
// PUT /api/v1/tournaments/{id}/staff/{staffId}: body giống thêm nhân sự (ghi đè toàn bộ)
export const updateTournamentStaff = (id, staffId, payload) => put(`${url(id)}/staff/${path(staffId)}`, payload)

// POST /auto-schedule: tự xếp ca + đề xuất trọng tài
export const autoScheduleTournament = id => post(`${url(id)}/auto-schedule`)
// Thiếu người khi hết hạn đăng ký: BTC chọn trong 24 giờ { decision: CANCEL | EXTEND | CONTINUE, newDeadline?, reason? }
export const decideRegistration = (id, payload) => post(`${url(id)}/registration-decision`, payload)
