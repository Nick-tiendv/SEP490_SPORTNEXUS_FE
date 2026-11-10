import { get, getList, path, post } from '../owner/request.js'

// ---------- Admin kiểm soát Elo: /api/v1/admin/ratings ----------
// SkillAssessmentResponse: id, userId, fullName, sportCategoryId, sportName, score, computedRating, assignedRating,
// skillLevel, flags[], evidenceUrls[], evidenceStatus (NONE | PENDING | APPROVED | REJECTED), reviewNote, createdAt
export const listAssessments = async (evidenceStatus = 'PENDING') => {
  const data = await get('/api/v1/admin/ratings/assessments', { evidenceStatus })
  return Array.isArray(data) ? data : data?.items || []
}
// Duyệt: Elo khởi đầu lên theo điểm khảo sát; từ chối: giữ Elo khởi đầu hiện tại
export const reviewAssessment = (assessmentId, { approve, note }) =>
  post(`/api/v1/admin/ratings/assessments/${path(assessmentId)}/review`, { approve, note: note || null })

// FlaggedRatingResponse: ratingId, ownerType, ownerId, ownerName, sportCategoryId, sportName, rating, ratedMatches, flagReason, flaggedAt
export const listFlaggedRatings = async () => (await getList('/api/v1/admin/ratings/flagged')).items
export const clearRatingFlag = (ratingId, note) => post(`/api/v1/admin/ratings/${path(ratingId)}/clear-flag`, { note: note || null })
// Phạt khai gian: đặt lại Elo (tùy chọn), trừ 20 Fair Play, khóa khảo sát môn này
export const penalizeRating = (ratingId, { newRating, reason, reportId }) =>
  post(`/api/v1/admin/ratings/${path(ratingId)}/penalize`, { newRating: newRating ?? null, reason, reportId: reportId || null })
