import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const asArray = value => (Array.isArray(value) ? value : [])
const num = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const toIsoDate = value => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}
const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = id => encodeURIComponent(id)

// Swagger chưa mô tả schema response nên các hàm toXxx thử nhiều tên field.
function toPrize(raw) {
  return { position: String(pick(raw, 'position', 'rank', 'name') ?? ''), amount: num(pick(raw, 'rewardAmount', 'amount', 'value')) ?? 0 }
}
function toChild(raw) {
  const prizes = asArray(pick(raw, 'prizes')).map(toPrize)
  return {
    id: String(pick(raw, 'id', 'tournamentId') ?? ''),
    name: pick(raw, 'name', 'categoryName') || '—',
    categoryType: pick(raw, 'categoryType', 'type'),
    capacity: num(pick(raw, 'maxParticipants', 'capacity')),
    registered: num(pick(raw, 'currentParticipants', 'participantCount', 'registeredCount', 'totalParticipants')),
    entryFee: num(pick(raw, 'entryFee', 'fee')),
    prizes,
    status: String(pick(raw, 'status') ?? ''),
  }
}
export function toTournament(raw) {
  const children = asArray(pick(raw, 'children', 'childTournaments', 'categories', 'subTournaments')).map(toChild)
  const sum = key => (children.length && children.every(child => child[key] != null) ? children.reduce((total, child) => total + child[key], 0) : null)
  const prizes = asArray(pick(raw, 'prizes')).map(toPrize)
  const prizeTotal = [...prizes, ...children.flatMap(child => child.prizes)].reduce((total, prize) => total + prize.amount, 0)
  return {
    id: String(pick(raw, 'id', 'tournamentId') ?? ''),
    name: pick(raw, 'name', 'title') || '—',
    // Ảnh bìa giải (Ban tổ chức tải lên ở "Sửa thông tin giải")
    imageUrl: pick(raw, 'imageUrl', 'coverImageUrl', 'bannerUrl') || '',
    sport: pick(raw, 'categoryName', 'sportName', 'category.name', 'sport.name') || '',
    facility: pick(raw, 'facilityName', 'facility.name') || '',
    facilityId: String(pick(raw, 'facilityId', 'facility.id') ?? ''),
    organizer: pick(raw, 'organizerName', 'ownerName', 'createdByName', 'owner.fullName', 'hostName') || '',
    organizerId: String(pick(raw, 'organizerId', 'ownerId', 'owner.id') ?? ''),
    ownerId: String(pick(raw, 'ownerId', 'owner.id') ?? ''),
    sportId: String(pick(raw, 'categoryId', 'sportCategoryId') ?? ''),
    // Giải do người chơi tạo cần Admin duyệt: APPROVED | PENDING | REJECTED
    approvalStatus: String(pick(raw, 'approvalStatus') ?? '').toUpperCase(),
    approvalNote: pick(raw, 'approvalNote') || '',
    tier: String(pick(raw, 'tier') ?? '').toUpperCase(),
    purpose: String(pick(raw, 'purpose') ?? '').toUpperCase(),
    minRating: num(pick(raw, 'minRating')),
    maxRating: num(pick(raw, 'maxRating')),
    minRatedMatches: num(pick(raw, 'minRatedMatches')),
    categoryType: pick(raw, 'categoryType') ?? '',
    subTournamentCount: num(pick(raw, 'subTournamentCount')) ?? (children.length || null),
    // null khi response không có isLocked (API giải đấu công khai) để không ghi đè giá trị từ API admin.
    locked: typeof pick(raw, 'isLocked') === 'boolean' ? pick(raw, 'isLocked') : null,
    lockReason: pick(raw, 'lockReason', 'lockedReason') || '',
    prizePaid: num(pick(raw, 'prizePaidAmount')),
    cancelledAt: pick(raw, 'cancelledAt') || '',
    settledAt: pick(raw, 'settledAt') || '',
    starts: toIsoDate(pick(raw, 'startDate', 'startTime', 'startsAt')),
    ends: toIsoDate(pick(raw, 'endDate', 'endTime', 'endsAt')),
    deadline: toIsoDate(pick(raw, 'registrationDeadline', 'registrationEndDate', 'deadline')),
    status: String(pick(raw, 'status', 'tournamentStatus') ?? ''),
    capacity: num(pick(raw, 'maxParticipants', 'capacity')) ?? sum('capacity'),
    registered: num(pick(raw, 'currentParticipants', 'participantCount', 'registeredCount', 'totalParticipants')) ?? sum('registered'),
    entryFee: num(pick(raw, 'entryFee', 'fee')) ?? (children.length === 1 ? children[0].entryFee : null),
    prize: prizeTotal || num(pick(raw, 'prizeFundAmount', 'totalPrize', 'prizePool')),
    format: pick(raw, 'format', 'bracketType', 'tournamentFormat') || '',
    cancellationReason: pick(raw, 'cancellationReason', 'cancelReason') || '',
    children,
  }
}
export function toParticipant(raw) {
  const name = pick(raw, 'fullName', 'userName', 'user.fullName', 'account.fullName', 'teamName', 'team.name', 'name', 'playerName') || '—'
  const paidRaw = pick(raw, 'isPaid', 'paid')
  return {
    id: String(pick(raw, 'id', 'participantId') ?? ''),
    userId: String(pick(raw, 'userId', 'accountId', 'user.id') ?? ''),
    teamId: String(pick(raw, 'teamId', 'team.id') ?? ''),
    name,
    phone: pick(raw, 'phone', 'user.phone', 'account.phone') || '',
    seed: num(pick(raw, 'seed', 'seedNumber')),
    status: String(pick(raw, 'status') ?? ''),
    checkedIn: Boolean(pick(raw, 'isCheckedIn', 'checkedIn') ?? /checked/i.test(String(pick(raw, 'checkInStatus', 'status') ?? ''))),
    paid: typeof paidRaw === 'boolean' ? paidRaw : /paid|success|completed/i.test(String(pick(raw, 'paymentStatus') ?? '')),
    registered: toIsoDate(pick(raw, 'registeredAt', 'createdAt', 'joinedAt')),
  }
}
function toSide(raw, prefix) {
  return {
    id: String(pick(raw, `${prefix}Id`, `${prefix}.id`, `${prefix}ParticipantId`) ?? ''),
    name: pick(raw, `${prefix}Name`, `${prefix}.name`, `${prefix}.fullName`, `${prefix}.teamName`) || '',
  }
}
export function toMatch(raw) {
  // Hỗ trợ cả kiểu player1/player2 và participant1/participant2, team1/team2.
  const prefixA = ['player1', 'participant1', 'team1', 'home'].find(prefix => pick(raw, `${prefix}Id`, `${prefix}Name`, prefix)) || 'player1'
  const prefixB = ['player2', 'participant2', 'team2', 'away'].find(prefix => pick(raw, `${prefix}Id`, `${prefix}Name`, prefix)) || 'player2'
  const sets = asArray(pick(raw, 'sets', 'setScores')).map(set => ({ set: num(pick(set, 'setNumber')), a: num(pick(set, 'scoreP1')), b: num(pick(set, 'scoreP2')) }))
  return {
    id: String(pick(raw, 'id', 'matchId') ?? ''),
    round: num(pick(raw, 'roundNumber', 'round', 'roundIndex')) ?? 1,
    roundName: pick(raw, 'roundName', 'stage') || '',
    order: num(pick(raw, 'matchNumber', 'matchOrder', 'order', 'position')) ?? 0,
    a: toSide(raw, prefixA),
    b: toSide(raw, prefixB),
    scoreA: num(pick(raw, 'scoreP1', 'score1', 'player1Score', 'homeScore')),
    scoreB: num(pick(raw, 'scoreP2', 'score2', 'player2Score', 'awayScore')),
    sets,
    // winnerId null khi trận hòa (resultType = DRAW, chỉ vòng bảng / vòng tròn bóng đá)
    winnerId: String(pick(raw, 'winnerId', 'winner.id') ?? ''),
    winnerName: pick(raw, 'winnerName', 'winner.name') || '',
    resultType: String(pick(raw, 'resultType') ?? '').toUpperCase(),
    isDraw: String(pick(raw, 'resultType') ?? '').toUpperCase() === 'DRAW',
    stage: String(pick(raw, 'stage') ?? '').toUpperCase(),
    groupName: pick(raw, 'groupName') || '',
    tiebreakA: num(pick(raw, 'tiebreakP1')),
    tiebreakB: num(pick(raw, 'tiebreakP2')),
    status: String(pick(raw, 'status', 'matchStatus') ?? ''),
    court: pick(raw, 'courtName', 'court.name') || '',
    time: pick(raw, 'scheduledTime', 'startTime', 'courtSlot.startTime') || '',
  }
}
// Bracket có thể trả về dạng { rounds: [{ matches }] } hoặc danh sách trận phẳng — gom về rounds.
export function toBracket(data) {
  const rounds = asArray(pick(data, 'rounds'))
  const matches = rounds.length
    ? rounds.flatMap((round, index) => asArray(pick(round, 'matches')).map(match => ({ ...toMatch(match), round: num(pick(round, 'roundNumber', 'round')) ?? index + 1, roundName: pick(round, 'name', 'roundName') || toMatch(match).roundName })))
    : toList(data).items.length ? toList(data).items.map(toMatch) : asArray(pick(data, 'matches')).map(toMatch)
  // Vòng bảng (stage = GROUP) gom theo bảng; vòng loại trực tiếp gom theo vòng.
  const keyOf = match => (match.stage === 'GROUP' ? `0|${match.groupName}|${String(match.round).padStart(3, '0')}` : `1||${String(match.round).padStart(3, '0')}`)
  const byRound = new Map()
  for (const match of matches) byRound.set(keyOf(match), [...(byRound.get(keyOf(match)) || []), match])
  const knockoutKeys = [...byRound.keys()].filter(key => key.startsWith('1|')).sort()
  return [...byRound.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, items]) => {
    const first = items[0] || {}
    let label
    if (first.stage === 'GROUP') label = [first.groupName ? `Bảng ${first.groupName}` : 'Vòng bảng', first.roundName].filter(Boolean).join(' · ')
    else {
      const remaining = knockoutKeys.length - knockoutKeys.indexOf(key)
      label = first.roundName || (remaining === 1 && items.length === 1 ? 'Chung kết' : remaining === 2 && items.length === 2 ? 'Bán kết' : remaining === 3 && items.length === 4 ? 'Tứ kết' : `Vòng ${first.round}`)
    }
    return { label, stage: first.stage, groupName: first.groupName, matches: items.sort((x, y) => x.order - y.order) }
  })
}

// GET /api/v1/admin/tournaments — query: keyword, status, facilityId, ownerId, isLocked, page, pageSize.
export async function listAdminTournaments(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/tournaments', { params: clean(params) })).data))
  return { items: items.map(toTournament), total, totalPages }
}
export async function getTournamentStatistics() {
  const data = unwrap((await apiClient.get('/api/v1/admin/tournaments/statistics')).data) || {}
  const keys = ['totalTournaments', 'open', 'inProgress', 'finished', 'cancelled', 'locked', 'subTournaments', 'totalParticipants', 'entryFeesToOwners', 'entryFeesRefunded', 'prizeFundsHeld', 'prizesPaid']
  return {
    ...Object.fromEntries(keys.map(key => [key, num(data[key])])),
    topFacilities: asArray(data.topFacilities).map(item => ({ id: String(item.facilityId ?? ''), name: item.facilityName || '—', count: num(item.tournamentCount) ?? 0 })),
  }
}
// PATCH /api/v1/admin/tournaments/{id}/lock | unlock | cancel — ReasonRequest { reason }.
export const lockTournament = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/tournaments/${path(id)}/lock`, { reason: reason || null })).data)
export const unlockTournament = async id => unwrap((await apiClient.patch(`/api/v1/admin/tournaments/${path(id)}/unlock`)).data)
export const cancelTournament = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/tournaments/${path(id)}/cancel`, { reason: reason || null })).data)
export async function getTournament(id) {
  return toTournament(unwrap((await apiClient.get(`/api/v1/tournaments/${path(id)}`)).data))
}
export async function getParticipants(id) {
  return toList(unwrap((await apiClient.get(`/api/v1/tournaments/${path(id)}/participants`)).data)).items.map(toParticipant)
}
export async function getBracket(id) {
  return toBracket(unwrap((await apiClient.get(`/api/v1/tournaments/${path(id)}/bracket`)).data))
}
// Admin duyệt giải do người chơi tạo (giải PENDING không hiện công khai, không nhận đăng ký)
export const approveTournament = async id => unwrap((await apiClient.patch(`/api/v1/admin/tournaments/${path(id)}/approve`)).data)
export const rejectTournament = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/tournaments/${path(id)}/reject`, { reason })).data)
