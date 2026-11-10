import { del, get, getList, path, post, put } from '../owner/request.js'

// ---------- Admin kiểm soát Elo: /api/v1/admin/ratings ----------
// SkillAssessmentResponse: id, userId, fullName, sportCategoryId, sportName, score, computedRating, assignedRating,
// skillLevel, flags[], evidenceUrls[], evidenceStatus (NONE | PENDING | APPROVED | REJECTED), reviewNote, createdAt
// evidenceStatus: ALL (mọi khảo sát) | NONE | PENDING | APPROVED | REJECTED; userId / sportCategoryId để lọc
export const listAssessments = async (evidenceStatus = 'PENDING', { userId, sportCategoryId } = {}) => {
  const data = await get('/api/v1/admin/ratings/assessments', { evidenceStatus, userId, sportCategoryId })
  return Array.isArray(data) ? data : data?.items || []
}
// Hồ sơ trình độ 1 người: { onboarding (khảo sát người chơi), ratings (Elo cá nhân / đội), assessments (mọi lần khảo sát toàn diện) }
export const getUserSkillProfile = userId => get(`/api/v1/admin/ratings/users/${path(userId)}`)

// ---------- Bộ câu hỏi khảo sát toàn diện (QĐ-E) ----------
// scoringRule: '' = tất cả | COMMON = câu chung | BADMINTON, ..., GENERIC = câu kỹ thuật của môn. Trả { formVersion, questions[] }
export const listSkillQuestions = scoringRule => get('/api/v1/admin/ratings/questions', scoringRule ? { scoringRule } : undefined)
// SkillQuestionRequest: code, text, type (SINGLE_CHOICE | SCALE_1_5), scoringRule (null = câu chung), maxPoints (SCALE_1_5),
// orderIndex, isActive, options[{ value, label, points }] (SINGLE_CHOICE)
export const createSkillQuestion = payload => post('/api/v1/admin/ratings/questions', payload)
export const updateSkillQuestion = (id, payload) => put(`/api/v1/admin/ratings/questions/${path(id)}`, payload)
export const deleteSkillQuestion = id => del(`/api/v1/admin/ratings/questions/${path(id)}`)
// Duyệt: Elo khởi đầu lên theo điểm khảo sát; từ chối: giữ Elo khởi đầu hiện tại
export const reviewAssessment = (assessmentId, { approve, note }) =>
  post(`/api/v1/admin/ratings/assessments/${path(assessmentId)}/review`, { approve, note: note || null })

// FlaggedRatingResponse: ratingId, ownerType, ownerId, ownerName, sportCategoryId, sportName, rating, ratedMatches, flagReason, flaggedAt
export const listFlaggedRatings = async () => (await getList('/api/v1/admin/ratings/flagged')).items
export const clearRatingFlag = (ratingId, note) => post(`/api/v1/admin/ratings/${path(ratingId)}/clear-flag`, { note: note || null })
// Phạt khai gian: đặt lại Elo (tùy chọn), trừ 20 Fair Play, khóa khảo sát môn này
export const penalizeRating = (ratingId, { newRating, reason, reportId }) =>
  post(`/api/v1/admin/ratings/${path(ratingId)}/penalize`, { newRating: newRating ?? null, reason, reportId: reportId || null })
