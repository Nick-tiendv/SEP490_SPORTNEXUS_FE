import { useEffect, useMemo, useState } from 'react'
import { useApi } from './useApi.js'
import { getMyFairPlay } from '../api/player/lfgApi.js'
import { getMySports } from '../api/player/profileApi.js'
import { getMyAssessments, getMyRatings } from '../api/player/ratingApi.js'

const SPORT_CANONICAL_NAMES = {
  badminton: 'Cầu lông',
  pickleball: 'Pickleball',
  football: 'Bóng đá',
  basketball: 'Bóng rổ',
  tennis: 'Tennis',
}

export const normalizeSportIdentifier = (raw) => {
  const s = String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
  if (!s) return ''
  if (s === 'badminton' || s.includes('cau long') || s.includes('badminton')) return 'badminton'
  if (s === 'pickleball' || s.includes('pickleball')) return 'pickleball'
  if (s === 'football' || s.includes('bong da') || s.includes('soccer') || s.includes('futsal')) return 'football'
  if (s === 'basketball' || s.includes('bong ro') || s.includes('basketball')) return 'basketball'
  if (s === 'tennis' || s.includes('tennis') || s.includes('quan vot')) return 'tennis'
  return s
}

const sameSportItem = (a, b) => {
  if (!a || !b) return false
  if (a.sportCategoryId != null && b.sportCategoryId != null && String(a.sportCategoryId) === String(b.sportCategoryId)) {
    return true
  }
  const keyA = normalizeSportIdentifier(a.sportName ?? a.name ?? a.sportKey ?? a.sport)
  const keyB = normalizeSportIdentifier(b.sportName ?? b.name ?? b.sportKey ?? b.sport)
  return Boolean(keyA && keyB && keyA === keyB)
}

const isPersonalRating = (r) =>
  r != null &&
  String(r.ownerType || '').toUpperCase() !== 'TEAM' &&
  String(r.ratingType || '').toUpperCase() !== 'TEAM'

/**
 * Đồng bộ danh sách môn thể thao, Elo và Rank từ Hồ sơ cá nhân (/api/auth/me/sports)
 * kết hợp cùng điểm Elo (/api/v1/ratings/me) và khảo sát đầu vào (/api/v1/ratings/assessments/me).
 */
export function buildProfileStandings({ ratings = [], mySports = [], assessments = [], useMySports = true } = {}) {
  const personalRatings = (Array.isArray(ratings) ? ratings : []).filter(isPersonalRating)
  const validAssessments = Array.isArray(assessments) ? assessments : []
  const validMySports = Array.isArray(mySports) ? mySports : []

  const mergeMatches = (target, ratingRows, assessedRow, sportMeta = null) => {
    const sorted = [...ratingRows].sort((a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0))
    const primary = sorted[0] || null
    const ratedMatches = ratingRows.reduce((sum, r) => sum + (Number(r?.ratedMatches) || 0), 0)
    const numericPrimaryRating = primary?.rating != null && primary.rating !== '' ? Number(primary.rating) : NaN
    const numericAssessedRating =
      assessedRow?.assignedRating != null && assessedRow.assignedRating !== ''
        ? Number(assessedRow.assignedRating)
        : NaN

    const hasPrimary = Number.isFinite(numericPrimaryRating)
    const hasAssessed = Number.isFinite(numericAssessedRating)
    const rating = hasPrimary ? numericPrimaryRating : hasAssessed ? numericAssessedRating : null
    const sportName =
      sportMeta?.name ||
      primary?.sportName ||
      assessedRow?.sportName ||
      SPORT_CANONICAL_NAMES[normalizeSportIdentifier(target)] ||
      ''
    const sportKey = normalizeSportIdentifier(sportName || primary?.sportName || assessedRow?.sportName)

    return {
      sportCategoryId: sportMeta?.sportCategoryId ?? primary?.sportCategoryId ?? assessedRow?.sportCategoryId ?? null,
      sportKey,
      sportName,
      skillLevel: sportMeta?.skillLevel ?? assessedRow?.skillLevel ?? null,
      rating,
      rank: hasPrimary ? primary?.rank || null : assessedRow?.rank || null,
      ratedMatches,
      isProvisional: hasPrimary ? Boolean(primary?.isProvisional) : hasAssessed,
      inProfile: Boolean(sportMeta),
      hasRating: rating != null,
    }
  }

  const sports = useMySports
    ? validMySports.map((ms) => {
        const matchingRatings = personalRatings.filter((r) => sameSportItem(ms, r))
        const matchingAssessment = validAssessments.find((a) => sameSportItem(ms, a)) || null
        return mergeMatches(ms.name, matchingRatings, matchingAssessment, ms)
      })
    : (() => {
        // Fallback chỉ dùng khi API /api/auth/me/sports lỗi
        const grouped = []
        for (const r of personalRatings) {
          const existing = grouped.find((g) => sameSportItem(g.anchor, r))
          if (existing) existing.rows.push(r)
          else grouped.push({ anchor: r, rows: [r] })
        }
        return grouped.map(({ anchor, rows }) => {
          const matchingAssessment = validAssessments.find((a) => sameSportItem(anchor, a)) || null
          return mergeMatches(anchor.sportName, rows, matchingAssessment, null)
        })
      })()

  const personal = sports.filter((s) => s.hasRating)
  const best = personal.reduce((top, r) => (!top || Number(r.rating) > Number(top.rating) ? r : top), null)
  const ratedMatches = personal.reduce((sum, r) => sum + (Number(r.ratedMatches) || 0), 0)

  return { sports, personal, best, ratedMatches }
}

export function findStandingForSport(sports = [], target) {
  if (!target || !Array.isArray(sports) || sports.length === 0) return null
  if (typeof target === 'object') {
    return sports.find((s) => sameSportItem(s, target)) || null
  }
  const targetStr = String(target).trim()
  if (!targetStr) return null
  const byId = sports.find((s) => s.sportCategoryId != null && String(s.sportCategoryId) === targetStr)
  if (byId) return byId
  const normalizedTarget = normalizeSportIdentifier(targetStr)
  if (!normalizedTarget) return null
  return sports.find((s) => s.sportKey === normalizedTarget || normalizeSportIdentifier(s.sportName) === normalizedTarget) || null
}

async function fetchProfileStandingSources() {
  const [ratingsRes, sportsRes, assessmentsRes] = await Promise.allSettled([
    getMyRatings(),
    getMySports(),
    getMyAssessments(),
  ])
  return {
    ratings: ratingsRes.status === 'fulfilled' && Array.isArray(ratingsRes.value) ? ratingsRes.value : [],
    mySports: sportsRes.status === 'fulfilled' && Array.isArray(sportsRes.value) ? sportsRes.value : [],
    assessments: assessmentsRes.status === 'fulfilled' && Array.isArray(assessmentsRes.value) ? assessmentsRes.value : [],
    useMySports: sportsRes.status === 'fulfilled',
  }
}

const EMPTY_SOURCES = { ratings: [], mySports: [], assessments: [], useMySports: false }

// Trình độ & uy tín thật của người chơi đang đăng nhập, đồng bộ từ Hồ sơ cá nhân.
export function usePlayerStanding() {
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleSync = () => setReloadTick((prev) => prev + 1)
    window.addEventListener('player-sports-updated', handleSync)
    window.addEventListener('player-profile-updated', handleSync)
    window.addEventListener('player-ratings-updated', handleSync)
    return () => {
      window.removeEventListener('player-sports-updated', handleSync)
      window.removeEventListener('player-profile-updated', handleSync)
      window.removeEventListener('player-ratings-updated', handleSync)
    }
  }, [])

  const fairPlay = useApi(getMyFairPlay, [reloadTick])
  const sources = useApi(fetchProfileStandingSources, [reloadTick], { initialData: EMPTY_SOURCES })

  const computed = useMemo(
    () => buildProfileStandings(sources.data || EMPTY_SOURCES),
    [sources.data],
  )

  const forSport = useMemo(
    () => (target) => findStandingForSport(computed.sports, target),
    [computed.sports],
  )

  return {
    fairPlay: fairPlay.error ? null : fairPlay.data,
    sports: computed.sports,
    best: computed.best,
    personal: computed.personal,
    ratedMatches: computed.ratedMatches,
    forSport,
    loading: fairPlay.loading || sources.loading,
  }
}

// "Elo 1320 · Bạc · Cầu lông" hoặc "Chưa có Elo · Cầu lông" / "Chưa có Elo"
export const eloText = (rating, fallbackSportName = '') => {
  const hasNumericRating =
    rating?.rating != null && rating.rating !== '' && Number.isFinite(Number(rating.rating))
  if (hasNumericRating) {
    return [
      `Elo ${rating.rating}${rating.isProvisional ? ' (tạm tính)' : ''}`,
      rating.rank,
      rating.sportName || fallbackSportName,
    ]
      .filter(Boolean)
      .join(' · ')
  }
  const sportLabel = rating?.sportName || fallbackSportName
  return sportLabel ? `Chưa có Elo · ${sportLabel}` : 'Chưa có Elo'
}

export const fairPlayScoreOf = (fairPlay) => {
  const score = Number(fairPlay?.fairPlayScore)
  return Number.isFinite(score) ? Math.round(score * 10) / 10 : null
}
