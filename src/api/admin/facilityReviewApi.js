import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const path = value => encodeURIComponent(value)
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const asArray = value => (Array.isArray(value) ? value : [])

// Đánh giá cơ sở từ GET /api/v1/admin/facility-reviews. Chưa có response mẫu (danh sách rỗng);
// tên field dựa theo CreateFacilityReviewRequest (rating, comment) và ReplyFacilityReviewRequest (reply).
export function toFacilityReview(raw) {
  const hiddenFlag = pick(raw, 'isHidden', 'hidden')
  const status = String(pick(raw, 'status') ?? '')
  return {
    id: String(pick(raw, 'id', 'reviewId') ?? ''),
    facilityId: String(pick(raw, 'facilityId', 'facility.id') ?? ''),
    facility: pick(raw, 'facilityName', 'facility.name') || '—',
    userId: String(pick(raw, 'userId', 'user.id') ?? ''),
    user: pick(raw, 'userFullName', 'fullName', 'userName', 'reviewerName', 'user.fullName') || '—',
    rating: toNumber(pick(raw, 'rating', 'stars')),
    comment: pick(raw, 'comment', 'content') || '',
    reply: pick(raw, 'ownerReply', 'reply', 'replyContent') || '',
    repliedAt: pick(raw, 'repliedAt', 'ownerRepliedAt') || '',
    hidden: typeof hiddenFlag === 'boolean' ? hiddenFlag : /hidden/i.test(status),
    hiddenReason: pick(raw, 'hiddenReason', 'hideReason') || '',
    createdAt: pick(raw, 'createdAt') || '',
    // Chỉ có ở GET /admin/facility-reviews/{id} (AdminFacilityReviewResponse)
    userEmail: pick(raw, 'userEmail') || '',
    ownerName: pick(raw, 'facilityOwnerName') || '',
    hiddenAt: pick(raw, 'hiddenAt') || '',
    hiddenBy: pick(raw, 'hiddenByName') || '',
  }
}
// Query: FacilityId, UserId, Rating, Keyword, FromDate, ToDate, Status, Replied, Page, PageSize.
export async function listFacilityReviews(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/facility-reviews', { params: clean(params) })).data))
  return { items: items.map(toFacilityReview), total, totalPages }
}
export async function getFacilityReview(id) {
  return toFacilityReview(unwrap((await apiClient.get(`/api/v1/admin/facility-reviews/${path(id)}`)).data))
}
export async function getFacilityReviewStatistics() {
  const data = unwrap((await apiClient.get('/api/v1/admin/facility-reviews/statistics')).data) || {}
  const keys = ['totalReviews', 'visibleReviews', 'hiddenReviews', 'averageRating', 'newReviewsLast30Days', 'ownerReplyRate']
  const facilities = list => asArray(list).map(item => ({ name: pick(item, 'facilityName', 'name') || '—', rating: toNumber(pick(item, 'averageRating', 'rating')), count: toNumber(pick(item, 'reviewCount', 'count')) }))
  return {
    ...Object.fromEntries(keys.map(key => [key, toNumber(data[key])])),
    distribution: [5, 4, 3, 2, 1].map(star => ({ star, count: toNumber(data.ratingDistribution?.[star]) ?? 0 })),
    topRated: facilities(data.topRatedFacilities),
    lowestRated: facilities(data.lowestRatedFacilities),
  }
}
// HideFacilityReviewRequest: reason bắt buộc (1–500 ký tự).
export const hideFacilityReview = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/facility-reviews/${path(id)}/hide`, { reason })).data)
export const unhideFacilityReview = async id => unwrap((await apiClient.patch(`/api/v1/admin/facility-reviews/${path(id)}/unhide`)).data)
