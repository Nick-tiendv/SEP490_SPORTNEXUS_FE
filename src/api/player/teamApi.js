import { del, get, getList, post, put, upload } from '../owner/request.js'

// ---------- Đội / cặp đôi: /api/v1/teams ----------
const ENDPOINT = '/api/v1/teams'
const id = value => encodeURIComponent(value)

// TeamResponse: id, name, description, logoUrl, createdById (đội trưởng), createdByName, totalMembers, members[], isLocked
export const toTeam = raw => ({
  id: String(raw.id ?? ''),
  name: raw.name || 'Đội',
  description: raw.description || '',
  logoUrl: raw.logoUrl || null,
  captainId: String(raw.captainId ?? raw.createdById ?? ''),
  captainName: raw.captainName || raw.createdByName || '',
  createdAt: raw.createAt || raw.createdAt || null,
  isLocked: raw.isLocked === true,
  lockedReason: raw.lockedReason || '',
  totalMembers: Number(raw.totalMembers ?? raw.members?.length ?? 0),
  members: (raw.members || []).map(m => ({
    accountId: String(m.accountId),
    fullName: m.fullName || '—',
    phone: m.phone || '',
    avatarUrl: m.avatarUrl || null,
    joinedAt: m.joinedAt || null,
  })),
})

export const getMyTeams = async () => (await getList(`${ENDPOINT}/my-teams`)).items.map(toTeam)
export const getTeam = async teamId => toTeam(await get(`${ENDPOINT}/${id(teamId)}`))
export const searchTeams = async ({ keyword, page = 1, pageSize = 20 } = {}) => {
  const { items, total } = await getList(ENDPOINT, { keyword, page, pageSize })
  return { items: items.map(toTeam), total }
}
// CreateTeamRequest: name, description, logoUrl, memberAccountIds[], memberPhones[] (người được thêm sẽ nhận lời mời)
export const createTeam = async ({ name, description, memberPhones = [] }) =>
  toTeam(await post(ENDPOINT, { name, description: description || null, memberPhones }))
export const updateTeam = async (teamId, { name, description }) => toTeam(await put(`${ENDPOINT}/${id(teamId)}`, { name, description }))
export const deleteTeam = teamId => del(`${ENDPOINT}/${id(teamId)}`)
export const uploadTeamLogo = async (teamId, file) => toTeam(await upload(`${ENDPOINT}/${id(teamId)}/logo`, 'file', file))
export const removeTeamMember = (teamId, accountId) => del(`${ENDPOINT}/${id(teamId)}/members/${id(accountId)}`)
export const transferCaptain = async (teamId, newCaptainId) => toTeam(await put(`${ENDPOINT}/${id(teamId)}/captain`, { newCaptainId }))
export const leaveTeam = teamId => post(`${ENDPOINT}/${id(teamId)}/leave`)
export const getTeamMembers = async teamId => (await getList(`${ENDPOINT}/${id(teamId)}/members`)).items
// TeamTournamentHistoryResponse: tournamentName, parentTournamentName, facilityName, tournamentStatus, paymentStatus, entryFee
export const getTeamTournaments = async teamId => (await getList(`${ENDPOINT}/${id(teamId)}/tournaments`)).items

// ---------- Lời mời vào đội ----------
// TeamInvitationResponse: id, teamId, teamName, teamLogoUrl, inviteeName, invitedByName, message, status, createdAt, expiresAt
export const inviteToTeam = (teamId, { phone, message }) => post(`${ENDPOINT}/${id(teamId)}/invitations`, { phone, message: message || null })
export const getTeamInvitations = async (teamId, status = 'ALL') => (await getList(`${ENDPOINT}/${id(teamId)}/invitations`, { status })).items
export const getMyInvitations = async (status = 'PENDING') => (await getList(`${ENDPOINT}/invitations/me`, { status })).items
export const acceptInvitation = invitationId => post(`${ENDPOINT}/invitations/${id(invitationId)}/accept`)
export const declineInvitation = invitationId => post(`${ENDPOINT}/invitations/${id(invitationId)}/decline`)
export const cancelInvitation = invitationId => del(`${ENDPOINT}/invitations/${id(invitationId)}`)
