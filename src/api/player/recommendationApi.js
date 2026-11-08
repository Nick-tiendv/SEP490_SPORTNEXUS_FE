import { get } from '../owner/request.js'
import { getRecommendedLfgs } from './lfgApi.js'

const asList = data => (Array.isArray(data) ? data : data?.items || [])

// Gợi ý dựa trên khảo sát người chơi (môn, trình độ, lịch rảnh, khu vực, mức giá) và Elo.
// GET /api/v1/recommendations/courts → [{ facilityId, facilityName, address, sportName, distanceKm, courtSlotId, courtId, courtName, startTime, endTime, price }]
export const getRecommendedCourts = async (limit = 10) => asList(await get('/api/v1/recommendations/courts', { limit }))
// GET /api/v1/recommendations/tournaments → [{ tournamentId, name, sportName, facilityName, tier, purpose, startDate, registrationDeadline, reason }]
export const getRecommendedTournaments = async (limit = 10) => asList(await get('/api/v1/recommendations/tournaments', { limit }))
// GET /api/v1/lfgs/recommended → [{ card, score (0–100), reasons[] }]
export { getRecommendedLfgs }
