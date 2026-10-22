import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const asArray = value => (Array.isArray(value) ? value : [])

// ---------- Người dùng Fair Play: GET /api/v1/admin/fair-play/users, /{userId} ----------
export function toFairPlayUser(raw) {
  return {
    userId: String(raw?.userId ?? ''),
    name: raw?.fullName || raw?.username || '—',
    username: raw?.username || '',
    avatarUrl: raw?.avatarUrl || '',
    role: raw?.role || '',
    score: toNumber(raw?.fairPlayScore),
    ratingCount: toNumber(raw?.ratingCount) ?? 0,
    lowRatingCount: toNumber(raw?.lowRatingCount) ?? 0,
    // isClaimBlocked: điểm dưới ngưỡng (tự động); isClaimBanned: admin cấm thủ công.
    claimBlocked: raw?.isClaimBlocked === true,
    claimBanned: raw?.isClaimBanned === true,
    banReason: raw?.claimBanReason || '',
    bannedUntil: raw?.claimBannedUntil || '',
    isActive: raw?.isActive !== false,
  }
}
function toAdjustment(raw) {
  return {
    id: String(raw?.id ?? ''),
    delta: toNumber(raw?.delta) ?? 0,
    reason: raw?.reason || '',
    source: raw?.source || '',
    by: raw?.createdByName || '',
    createdAt: raw?.createdAt || '',
  }
}
// Query: keyword, maxScore, claimBlocked, sortBy, page, pageSize.
export async function listFairPlayUsers(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/fair-play/users', { params: clean(params) })).data))
  return { items: items.map(toFairPlayUser), total, totalPages }
}
export async function getFairPlayUser(userId) {
  const data = unwrap((await apiClient.get(`/api/v1/admin/fair-play/users/${path(userId)}`)).data) || {}
  return {
    ...toFairPlayUser(data),
    averageRating: toNumber(data.averageRating),
    ratingScore: toNumber(data.ratingScore),
    totalAdjustment: toNumber(data.totalAdjustment),
    minClaimScore: toNumber(data.minClaimScore),
    ratingsGiven: toNumber(data.ratingsGiven),
    ratings: asArray(data.ratings).map(toRating),
    adjustments: asArray(data.adjustments).map(toAdjustment),
  }
}
// delta dương cộng điểm, âm trừ điểm.
export const adjustFairPlay = async (userId, { delta, reason }) => unwrap((await apiClient.post(`/api/v1/admin/fair-play/users/${path(userId)}/adjust`, { delta, reason: reason || null })).data)
// days = null → cấm vô thời hạn.
export const claimBan = async (userId, { reason, days }) => unwrap((await apiClient.patch(`/api/v1/admin/fair-play/users/${path(userId)}/claim-ban`, { reason: reason || null, days: days || null })).data)
export const claimUnban = async userId => unwrap((await apiClient.patch(`/api/v1/admin/fair-play/users/${path(userId)}/claim-unban`)).data)

// ---------- Đánh giá Fair Play giữa người chơi: GET /api/v1/admin/fair-play/ratings ----------
// Chưa có response mẫu (danh sách rỗng) nên thử vài tên field phổ biến.
export function toRating(raw) {
  return {
    id: String(pick(raw, 'id', 'ratingId') ?? ''),
    rater: pick(raw, 'raterName', 'reviewerName', 'fromUserName', 'rater.fullName', 'reviewer.fullName') || '—',
    target: pick(raw, 'targetName', 'ratedUserName', 'toUserName', 'revieweeName', 'targetUser.fullName', 'ratedUser.fullName') || '—',
    targetId: String(pick(raw, 'targetUserId', 'ratedUserId', 'toUserId', 'revieweeId') ?? ''),
    stars: toNumber(pick(raw, 'stars', 'rating', 'score')),
    comment: pick(raw, 'comment', 'content', 'note') || '',
    hidden: pick(raw, 'isHidden', 'hidden') === true,
    hiddenReason: pick(raw, 'hiddenReason', 'hideReason') || '',
    context: pick(raw, 'lfgTitle', 'matchName', 'tournamentName', 'context') || '',
    createdAt: pick(raw, 'createdAt') || '',
  }
}
// Query: userId, maxStars, hidden, page, pageSize.
export async function listFairPlayRatings(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/fair-play/ratings', { params: clean(params) })).data))
  return { items: items.map(toRating), total, totalPages }
}
export const hideFairPlayRating = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/fair-play/ratings/${path(id)}/hide`, { reason: reason || null })).data)
export const unhideFairPlayRating = async id => unwrap((await apiClient.patch(`/api/v1/admin/fair-play/ratings/${path(id)}/unhide`)).data)

// ---------- Thống kê & cài đặt ----------
export async function getFairPlayStatistics() {
  const data = unwrap((await apiClient.get('/api/v1/admin/fair-play/statistics')).data) || {}
  const keys = ['minClaimScore', 'averageScore', 'totalUsers', 'belowThresholdUsers', 'claimBannedUsers', 'totalRatings', 'hiddenRatings', 'ratingsLast30Days']
  return { ...Object.fromEntries(keys.map(key => [key, toNumber(data[key])])), distribution: Object.entries(data.scoreDistribution || {}).map(([range, count]) => ({ range, count: toNumber(count) ?? 0 })) }
}
export async function getFairPlaySettings() {
  return { minClaimScore: toNumber(unwrap((await apiClient.get('/api/v1/admin/fair-play/settings')).data)?.minClaimScore) }
}
export const updateFairPlaySettings = async minClaimScore => unwrap((await apiClient.put('/api/v1/admin/fair-play/settings', { minClaimScore })).data)
