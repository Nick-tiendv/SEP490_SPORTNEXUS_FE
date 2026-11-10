import apiClient from '../apiClient.js'
import { get, getList, path, post, put, unwrap } from '../owner/request.js'

// ---------- Khảo sát người chơi (lần đăng nhập đầu): /api/auth/me/onboarding ----------
// OnboardingResponse: isCompleted, completedAt, gender, sports[{ sportCategoryId, sportName, skillLevel, preferredFormats[] }],
// availability[{ dayOfWeek, startTime, endTime }], latitude, longitude, radiusKm, maxPricePerHour, goal, frequency
export const getOnboarding = () => get('/api/auth/me/onboarding')
// PUT thay toàn bộ khảo sát
export const saveOnboarding = payload => put('/api/auth/me/onboarding', payload)

export const GENDERS = [['MALE', 'Nam'], ['FEMALE', 'Nữ']]
export const GOALS = [['EXCHANGE', 'Giao lưu, vui là chính'], ['TRAINING', 'Tập luyện nâng trình'], ['COMPETITION', 'Thi đấu, cọ xát giải']]
export const FREQUENCIES = [['RARELY', 'Thỉnh thoảng'], ['WEEKLY_1_2', '1 – 2 buổi / tuần'], ['WEEKLY_3_PLUS', 'Từ 3 buổi / tuần']]
export const SKILL_LEVELS = [['BEGINNER', 'Mới chơi'], ['INTERMEDIATE', 'Trung bình'], ['ADVANCED', 'Khá / Nâng cao'], ['PROFESSIONAL', 'Chuyên nghiệp']]
export const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Nội dung hay chơi theo môn: môn đồng đội gửi số người mỗi đội, môn vợt gửi SINGLES / DOUBLES
const fold = text => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
export function formatOptionsFor(sportName) {
  const n = fold(sportName)
  if (n.includes('bong da') || n.includes('football') || n.includes('soccer')) return [['5', 'Sân 5'], ['7', 'Sân 7'], ['11', 'Sân 11']]
  if (n.includes('bong ro') || n.includes('basketball')) return [['3', '3x3'], ['5', '5x5']]
  if (n.includes('bong chuyen') || n.includes('volleyball')) return [['6', '6 người']]
  return [['SINGLES', 'Đánh đơn'], ['DOUBLES', 'Đánh đôi']]
}
export const isTeamSport = sportName => !formatOptionsFor(sportName).some(([value]) => value === 'SINGLES')

// ---------- Khảo sát toàn diện theo môn (Elo khởi đầu): /api/v1/ratings/assessments ----------
// AssessmentFormResponse: sportCategoryId, sportName, questions[{ code, question, type: SINGLE_CHOICE | SCALE_1_5, options[{ value, label }] }], current, blockedReason
export const getAssessmentForm = sportId => get(`/api/v1/ratings/assessments/questions/${path(sportId)}`)
export const getMyAssessments = async () => (await getList('/api/v1/ratings/assessments/me')).items
// Body: { answers: { CODE: value }, techniques: { TECH_n: 1..5 }, evidenceUrls[] }. Trả cả message của BE để hiện cho người dùng.
export async function submitAssessment(sportId, { answers, techniques, evidenceUrls }) {
  const body = (await apiClient.post(`/api/v1/ratings/assessments/${path(sportId)}`, { answers, techniques, evidenceUrls })).data
  return { result: unwrap(body), message: body?.message || '' }
}
// Câu kỹ thuật riêng của môn có mã TECH_1..TECH_5 (gửi trong "techniques"), còn lại là câu chung ("answers")
export const isTechniqueCode = code => /^TECH_/i.test(String(code || ''))

export const EVIDENCE_STATUS = {
  NONE: ['Không có bằng chứng', 'gray'],
  PENDING: ['Bằng chứng chờ duyệt', 'amber'],
  APPROVED: ['Bằng chứng đã duyệt', 'green'],
  REJECTED: ['Bằng chứng bị từ chối', 'red'],
}

// ---------- Elo ----------
// RatingResponse: ownerType (USER | TEAM), ownerId, ownerName, sportCategoryId, sportName, ratingType (PERSONAL | TEAM), rating, rank, ratedMatches, isProvisional
export async function getMyRatings() {
  const data = await get('/api/v1/ratings/me')
  return Array.isArray(data) ? data : data?.items || [...(data?.personal || []), ...(data?.teams || [])]
}
// ratingType chỉ nhận PERSONAL | TEAM (SINGLES / DOUBLES đã bỏ → 400)
export const getLeaderboard = ({ sportCategoryId, ratingType = 'PERSONAL', page = 1, pageSize = 20 }) =>
  getList('/api/v1/ratings/leaderboard', { sportCategoryId, ratingType, page, pageSize })

// ---------- Đánh giá trình độ sau trận ----------
// contextId: id kèo LFG, đơn sân (cùng check-in) hoặc trận giải đã có kết quả; trong 72 giờ sau trận
export const SKILL_VERDICTS = [['LOWER', 'Thấp hơn Elo'], ['ACCURATE', 'Đúng với Elo'], ['HIGHER', 'Cao hơn Elo']]
export const submitSkillFeedback = ({ revieweeId, contextId, verdict }) => post('/api/v1/ratings/feedback', { revieweeId, contextId, verdict })
