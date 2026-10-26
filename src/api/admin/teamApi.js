import apiClient from '../apiClient.js'
import { toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)

// ---------- Admin quản lý đội: /api/v1/admin/teams ----------
// Query: keyword (tên đội, tên / SĐT đội trưởng), captainId, status (all | active | locked | disbanded), page, pageSize.
export async function listAdminTeams(params) {
  return toList(unwrap((await apiClient.get('/api/v1/admin/teams', { params: clean(params) })).data))
}
// AdminTeamStatisticsResponse: totalTeams, activeTeams, lockedTeams, disbandedTeams, newTeamsThisMonth, teamsInActiveTournaments, averageMembersPerTeam.
export const getTeamStatistics = async () => unwrap((await apiClient.get('/api/v1/admin/teams/statistics')).data) || {}
// AdminTeamDetailResponse: thông tin đội + members[], tournaments[], lockedByName, pendingInvitations.
export const getAdminTeam = async teamId => unwrap((await apiClient.get(`/api/v1/admin/teams/${path(teamId)}`)).data)
// Khóa bắt buộc lý do; đội bị khóa không đăng ký giải, không mời / nhận thành viên.
export const lockTeam = async (teamId, reason) => unwrap((await apiClient.patch(`/api/v1/admin/teams/${path(teamId)}/lock`, { reason })).data)
export const unlockTeam = async teamId => unwrap((await apiClient.patch(`/api/v1/admin/teams/${path(teamId)}/unlock`)).data)
// Giải tán (xóa mềm, giữ lịch sử giải). DELETE có body AdminDisbandTeamRequest { reason }.
export const disbandTeam = async (teamId, reason) => unwrap((await apiClient.delete(`/api/v1/admin/teams/${path(teamId)}`, { data: { reason } })).data)
