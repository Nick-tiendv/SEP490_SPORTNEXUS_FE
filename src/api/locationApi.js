// Dịch vụ Geocoding / Reverse Geocoding dùng chung cho SportNexus.
// Hỗ trợ uỷ quyền qua Backend Proxy (`VITE_GEOCODE_PROXY_URL`) để BE gọi Nominatim, giấu logic
// và kiểm soát rate-limit tập trung; khi chưa cấu hình proxy BE, tự động giới hạn tốc độ (≥ 1.1s/req),
// gộp request trùng, cache theo phiên và tự tạm dừng khi gặp HTTP 429/503 theo Nominatim Usage Policy.

const STORAGE_KEY = 'snx_geocode_cache_v1'
const MAX_CACHE_ENTRIES = 80
const DEFAULT_MIN_INTERVAL_MS = 1100
const DEFAULT_COOLDOWN_MS = 60_000

const readEnv = env => {
  if (env && typeof env === 'object') return env
  return (typeof import.meta !== 'undefined' && import.meta.env) || {}
}

const getDefaultStorage = () => {
  try {
    return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null
  } catch {
    return null
  }
}

const defaultDelay = ms => new Promise(resolve => setTimeout(resolve, ms))

export function resolveGeocodeProxyBase(env) {
  const safeEnv = readEnv(env)
  const raw = String(safeEnv.VITE_GEOCODE_PROXY_URL || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '')
  const apiBase = String(safeEnv.VITE_API_BASE_URL || 'https://sep490-sportnexus-be.onrender.com')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/, '')
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `${apiBase}${path}`.replace(/\/+$/, '')
}

const toFiniteNumber = value => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const parseBounds = bounds => {
  if (Array.isArray(bounds) && bounds.length === 4) {
    const nums = bounds.map(Number)
    return nums.every(Number.isFinite) ? { south: nums[0], north: nums[1], west: nums[2], east: nums[3] } : null
  }
  if (bounds && typeof bounds === 'object') {
    const south = toFiniteNumber(bounds.south)
    const north = toFiniteNumber(bounds.north)
    const west = toFiniteNumber(bounds.west)
    const east = toFiniteNumber(bounds.east)
    if (south != null && north != null && west != null && east != null) return { south, north, west, east }
  }
  return null
}

export function normalizeGeocodeSearchPayload(payload) {
  const unwrapped = payload && typeof payload === 'object' && 'data' in payload && !Array.isArray(payload) ? payload.data : payload
  const item = Array.isArray(unwrapped) ? unwrapped[0] : unwrapped
  if (!item || typeof item !== 'object') return null
  const lat = toFiniteNumber(item.lat ?? item.latitude)
  const lng = toFiniteNumber(item.lon ?? item.lng ?? item.longitude)
  if (lat == null || lng == null) return null
  const bounds = parseBounds(item.bounds ?? item.boundingbox)
  return { lat, lng, bounds }
}

export function normalizeReverseGeocodePayload(payload) {
  const unwrapped = payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
  if (typeof unwrapped === 'string') return unwrapped.trim()
  if (!unwrapped || typeof unwrapped !== 'object') return ''
  if (typeof unwrapped.name === 'string' && unwrapped.name.trim()) return unwrapped.name.trim()
  if (typeof unwrapped.displayName === 'string' && unwrapped.displayName.trim()) return unwrapped.displayName.trim()

  const a = unwrapped.address && typeof unwrapped.address === 'object' ? unwrapped.address : {}
  const parts = [a.quarter || a.suburb || a.village || a.hamlet, a.city_district || a.county || a.town || a.district, a.city || a.state || a.province].filter(
    Boolean,
  )

  return [...new Set(parts)].join(', ') || String(unwrapped.display_name || '').trim()
}

export function createLocationClient({
  env,
  fetchImpl = (...args) => globalThis.fetch(...args),
  storage = getDefaultStorage(),
  now = () => Date.now(),
  delay = defaultDelay,
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
} = {}) {
  const memoryCache = new Map()
  const inFlight = new Map()
  let queueTail = Promise.resolve()
  let nextAllowedAt = 0
  let blockedUntil = 0

  const readPersistedCache = key => {
    if (!storage) return { hit: false, value: undefined }
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return { hit: false, value: undefined }
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && Object.hasOwn(parsed, key)) {
        return { hit: true, value: parsed[key] }
      }
    } catch {
      /* bỏ qua lỗi đọc sessionStorage */
    }
    return { hit: false, value: undefined }
  }

  const writePersistedCache = (key, value) => {
    if (!storage) return
    try {
      const raw = storage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      const entries = Object.entries(parsed && typeof parsed === 'object' ? parsed : {}).filter(([k]) => k !== key)
      entries.push([key, value])
      const trimmed = entries.slice(-MAX_CACHE_ENTRIES)
      storage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(trimmed)))
    } catch {
      /* bỏ qua khi trình duyệt chặn lưu trữ */
    }
  }

  const scheduleNominatim = task => {
    const run = queueTail.then(async () => {
      if (now() < blockedUntil) return { skipped: true }
      const waitMs = nextAllowedAt - now()
      if (waitMs > 0) await delay(waitMs)
      if (now() < blockedUntil) return { skipped: true }
      try {
        return await task()
      } finally {
        nextAllowedAt = now() + minIntervalMs
      }
    })
    queueTail = run.catch(() => {})
    return run
  }

  const requestJson = async (url, { useNominatimLimit }) => {
    const execute = async () => {
      const response = await fetchImpl(url, { headers: { Accept: 'application/json' } })
      if (!response.ok) {
        if (useNominatimLimit && (response.status === 429 || response.status === 503)) {
          const retryAfterSec = Number(response.headers?.get?.('retry-after'))
          const cooldownMs =
            Number.isFinite(retryAfterSec) && retryAfterSec > 0 ? Math.min(Math.max(retryAfterSec * 1000, 30_000), 300_000) : DEFAULT_COOLDOWN_MS
          blockedUntil = Math.max(blockedUntil, now() + cooldownMs)
        }
        return { ok: false, data: null }
      }
      return { ok: true, data: await response.json() }
    }

    if (!useNominatimLimit) return execute()
    const scheduled = await scheduleNominatim(execute)
    return scheduled?.skipped ? { ok: false, data: null } : scheduled
  }

  const geocodeAddress = async text => {
    const query = String(text || '').trim()
    if (!query) return null

    const key = `geo:${query.toLowerCase()}`
    if (memoryCache.has(key)) return memoryCache.get(key)

    const stored = readPersistedCache(key)
    if (stored.hit) {
      memoryCache.set(key, stored.value)
      return stored.value
    }

    if (inFlight.has(key)) return inFlight.get(key)

    const proxyBase = resolveGeocodeProxyBase(env)
    const useProxy = Boolean(proxyBase)
    const url = useProxy
      ? `${proxyBase}/search?q=${encodeURIComponent(query)}&countrycodes=vn&accept-language=vi`
      : `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=vn&accept-language=vi&viewbox=106.35,11.20,107.05,10.35&q=${encodeURIComponent(query)}`

    const promise = (async () => {
      try {
        const res = await requestJson(url, { useNominatimLimit: !useProxy })
        if (!res.ok) return null
        const normalized = normalizeGeocodeSearchPayload(res.data)
        memoryCache.set(key, normalized)
        writePersistedCache(key, normalized)
        return normalized
      } catch {
        return null
      } finally {
        inFlight.delete(key)
      }
    })()

    inFlight.set(key, promise)
    return promise
  }

  const reverseGeocode = async (latitude, longitude) => {
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''

    const key = `rev:${lat.toFixed(3)},${lng.toFixed(3)}`
    if (memoryCache.has(key)) return memoryCache.get(key)

    const stored = readPersistedCache(key)
    if (stored.hit) {
      memoryCache.set(key, stored.value)
      return stored.value
    }

    if (inFlight.has(key)) return inFlight.get(key)

    const proxyBase = resolveGeocodeProxyBase(env)
    const useProxy = Boolean(proxyBase)
    const url = useProxy
      ? `${proxyBase}/reverse?lat=${lat}&lon=${lng}&accept-language=vi`
      : `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&accept-language=vi&lat=${lat}&lon=${lng}`

    const promise = (async () => {
      try {
        const res = await requestJson(url, { useNominatimLimit: !useProxy })
        if (!res.ok) return ''
        const name = normalizeReverseGeocodePayload(res.data)
        memoryCache.set(key, name)
        writePersistedCache(key, name)
        return name
      } catch {
        return ''
      } finally {
        inFlight.delete(key)
      }
    })()

    inFlight.set(key, promise)
    return promise
  }

  return { geocodeAddress, reverseGeocode }
}

const defaultLocationClient = createLocationClient()

export const geocodeViaService = text => defaultLocationClient.geocodeAddress(text)
export const reverseGeocodeViaService = (latitude, longitude) => defaultLocationClient.reverseGeocode(latitude, longitude)
