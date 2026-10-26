import { del, get, getList, path, post, put } from './request.js'

// ---------- Đánh giá của khách về các cơ sở của tôi: /api/v1/owner/facility-reviews ----------
// Query: facilityId, rating (1-5), replied (true/false), page, pageSize.
export const getOwnerReviews = params => getList('/api/v1/owner/facility-reviews', params)
// OwnerReviewStatisticsResponse: totalReviews, averageRating, repliedCount, unrepliedCount, replyRate, newReviewsLast30Days, ratingDistribution, facilities[].
export const getOwnerReviewStats = facilityId => get('/api/v1/owner/facility-reviews/statistics', { facilityId })

// Mỗi đánh giá chỉ có 1 phản hồi: lần đầu POST, sửa dùng PUT, xóa phản hồi dùng DELETE.
export const replyReview = (reviewId, reply) => post(`/api/v1/owner/facility-reviews/${path(reviewId)}/reply`, { reply })
export const updateReviewReply = (reviewId, reply) => put(`/api/v1/owner/facility-reviews/${path(reviewId)}/reply`, { reply })
export const deleteReviewReply = reviewId => del(`/api/v1/owner/facility-reviews/${path(reviewId)}/reply`)
