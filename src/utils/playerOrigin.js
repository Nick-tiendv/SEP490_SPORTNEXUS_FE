// Đồng bộ vị trí xuất phát của người chơi giữa màn Đặt sân (MapBooking) và Ghép trận LFG (CommunityFeed / CreateMatch).
// Không gán cứng bất kỳ tỉnh/thành hay tọa độ mặc định nào.

export const BOOKING_ORIGIN_STORAGE_KEY = 'sportnexus_booking_origin'
export const PLAYER_ORIGIN_UPDATED_EVENT = 'player-origin-updated'
export const TRUSTED_GPS_ACCURACY_METERS = 1000

const toCoordOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const normalizeCoords = (latVal, lngVal) => {
  const lat = toCoordOrNull(latVal)
  const lng = toCoordOrNull(lngVal)
  if (lat == null || lng == null) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

const getStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

export function readProfileLocation(storage = getStorage()) {
  if (!storage) return { location: '', coords: null }
  try {
    const raw = storage.getItem('player_profile_data')
    if (!raw) return { location: '', coords: null }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { location: '', coords: null }
    return {
      location: String(parsed.location || '').trim(),
      coords: normalizeCoords(parsed.latitude ?? parsed.lat, parsed.longitude ?? parsed.lng),
    }
  } catch {
    return { location: '', coords: null }
  }
}

export function readSavedBookingOrigin(storage = getStorage()) {
  if (!storage) return null
  try {
    const raw = storage.getItem(BOOKING_ORIGIN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const label = String(parsed.label || '').trim()
    const customText = String(parsed.customText || '').trim()
    const coords = normalizeCoords(parsed.lat ?? parsed.latitude, parsed.lng ?? parsed.longitude)
    const source = String(parsed.source || '').trim()
    if (!label && !customText && !coords) return null
    return {
      label,
      customText,
      coords,
      source: source || (customText ? 'custom' : 'booking'),
    }
  } catch {
    return null
  }
}

export function saveBookingOrigin({ label = '', lat = null, lng = null, source = 'booking', customText = '' } = {}, storage = getStorage()) {
  if (!storage) return null
  const cleanLabel = String(label || '').trim()
  const cleanCustom = String(customText || '').trim()
  const coords = normalizeCoords(lat, lng)
  if (!cleanLabel && !cleanCustom && !coords) {
    clearBookingOrigin(storage)
    return null
  }

  const next = {
    label: cleanLabel,
    customText: cleanCustom,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    source: String(source || 'booking').trim() || 'booking',
  }

  const prev = readSavedBookingOrigin(storage)
  const unchanged =
    prev &&
    prev.label === next.label &&
    prev.customText === next.customText &&
    prev.source === next.source &&
    (prev.coords?.lat ?? null) === next.lat &&
    (prev.coords?.lng ?? null) === next.lng

  if (unchanged) return prev

  try {
    storage.setItem(BOOKING_ORIGIN_STORAGE_KEY, JSON.stringify({ ...next, updatedAt: Date.now() }))
  } catch {
    /* bỏ qua khi trình duyệt chặn localStorage */
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLAYER_ORIGIN_UPDATED_EVENT, { detail: next }))
  }
  return next
}

export function clearBookingOrigin(storage = getStorage()) {
  if (!storage) return
  const hadPrev = Boolean(readSavedBookingOrigin(storage))
  try {
    storage.removeItem(BOOKING_ORIGIN_STORAGE_KEY)
  } catch {
    /* bỏ qua khi trình duyệt chặn localStorage */
  }
  if (hadPrev && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLAYER_ORIGIN_UPDATED_EVENT, { detail: null }))
  }
}

export function subscribeBookingOrigin(onChange) {
  if (typeof window === 'undefined' || typeof onChange !== 'function') return () => {}
  const handleCustom = () => onChange(readSavedBookingOrigin())
  const handleStorage = event => {
    if (event.key === BOOKING_ORIGIN_STORAGE_KEY) onChange(readSavedBookingOrigin())
  }
  window.addEventListener(PLAYER_ORIGIN_UPDATED_EVENT, handleCustom)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(PLAYER_ORIGIN_UPDATED_EVENT, handleCustom)
    window.removeEventListener('storage', handleStorage)
  }
}

/**
 * Thứ tự ưu tiên đồng bộ giữa Đặt sân và Ghép trận LFG:
 * 1. Điểm xuất phát người chơi chủ động chọn/nhập ở Đặt sân (source === 'custom')
 * 2. GPS thiết bị đủ chính xác (sai số ≤ 1000m) — trực tiếp hoặc đã lưu từ Đặt sân
 * 3. Địa chỉ trong hồ sơ người chơi (player_profile_data.location)
 * 4. Khu vực từ khảo sát người chơi (GET /api/auth/me/onboarding)
 */
export function resolveEffectivePlayerOrigin({
  bookingOrigin = null,
  gpsCoords = null,
  gpsPlaceName = '',
  profileLocation = '',
  profileCoords = null,
  onboarding = null,
} = {}) {
  const onboardingCoords = normalizeCoords(onboarding?.coords?.lat ?? onboarding?.latitude, onboarding?.coords?.lng ?? onboarding?.longitude)
  const onboardingName = String(onboarding?.name || '').trim()
  const cleanProfileLocation = String(profileLocation || '').trim()
  const cleanProfileCoords = normalizeCoords(profileCoords?.lat, profileCoords?.lng)

  if (bookingOrigin?.source === 'custom') {
    const label = bookingOrigin.label || bookingOrigin.customText || ''
    if (label || bookingOrigin.coords) {
      return {
        label: label || `${bookingOrigin.coords.lat.toFixed(4)}, ${bookingOrigin.coords.lng.toFixed(4)}`,
        coords: bookingOrigin.coords || null,
        source: 'custom',
      }
    }
  }

  const liveGpsCoords = normalizeCoords(gpsCoords?.lat, gpsCoords?.lng)
  const isLiveGpsTrusted =
    Boolean(liveGpsCoords) && (gpsCoords?.accuracy == null || Number(gpsCoords.accuracy) <= TRUSTED_GPS_ACCURACY_METERS)

  if (isLiveGpsTrusted) {
    const cleanGpsName = String(gpsPlaceName || '').trim()
    return {
      label: cleanGpsName || cleanProfileLocation || onboardingName || 'Vị trí hiện tại của bạn',
      coords: liveGpsCoords,
      source: 'gps',
    }
  }

  if (bookingOrigin?.source === 'gps' && (bookingOrigin.label || bookingOrigin.coords)) {
    return {
      label:
        bookingOrigin.label ||
        (bookingOrigin.coords ? `${bookingOrigin.coords.lat.toFixed(4)}, ${bookingOrigin.coords.lng.toFixed(4)}` : 'Vị trí hiện tại của bạn'),
      coords: bookingOrigin.coords || null,
      source: 'gps',
    }
  }

  if (cleanProfileLocation) {
    return {
      label: cleanProfileLocation,
      coords: cleanProfileCoords || bookingOrigin?.coords || onboardingCoords || null,
      source: 'profile',
    }
  }

  if (onboardingName || onboardingCoords) {
    return {
      label: onboardingName || `${onboardingCoords.lat.toFixed(4)}, ${onboardingCoords.lng.toFixed(4)}`,
      coords: onboardingCoords,
      source: 'onboarding',
    }
  }

  if (bookingOrigin?.label || bookingOrigin?.coords) {
    return {
      label: bookingOrigin.label || `${bookingOrigin.coords.lat.toFixed(4)}, ${bookingOrigin.coords.lng.toFixed(4)}`,
      coords: bookingOrigin.coords || null,
      source: bookingOrigin.source || 'booking',
    }
  }

  return { label: '', coords: null, source: '' }
}
