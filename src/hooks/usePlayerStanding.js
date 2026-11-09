import { useApi } from './useApi.js'
import { getMyFairPlay } from '../api/player/lfgApi.js'
import { getMyRatings } from '../api/player/ratingApi.js'

// Trình độ & uy tín thật của người chơi đang đăng nhập, thay cho các số viết cứng trên giao diện.
// - Fair Play: GET /api/v1/fair-play/me → { fairPlayScore, minClaimScore, isLfgBlocked, claimBanReason, ratingCount, averageRating }
// - Elo: GET /api/v1/ratings/me → [{ ownerType, ratingType, sportName, rating, rank, ratedMatches, isProvisional }]
export function usePlayerStanding() {
  const fairPlay = useApi(getMyFairPlay, [])
  const ratings = useApi(getMyRatings, [], { initialData: [] })
  const personal = (ratings.data || []).filter(
    (r) => String(r.ownerType).toUpperCase() !== 'TEAM' && String(r.ratingType).toUpperCase() !== 'TEAM',
  )
  // Elo cao nhất trong các môn để hiện 1 nhãn tóm tắt
  const best = personal.reduce((top, r) => (!top || Number(r.rating) > Number(top.rating) ? r : top), null)
  const ratedMatches = personal.reduce((sum, r) => sum + (Number(r.ratedMatches) || 0), 0)
  return { fairPlay: fairPlay.error ? null : fairPlay.data, best, personal, ratedMatches, loading: fairPlay.loading || ratings.loading }
}

// "Elo 1320 · Bạc · Cầu lông" hoặc "Chưa có Elo"
export const eloText = (rating) =>
  rating ? [`Elo ${rating.rating}${rating.isProvisional ? ' (tạm tính)' : ''}`, rating.rank, rating.sportName].filter(Boolean).join(' · ') : 'Chưa có Elo'

export const fairPlayScoreOf = (fairPlay) => {
  const score = Number(fairPlay?.fairPlayScore)
  return Number.isFinite(score) ? Math.round(score * 10) / 10 : null
}
