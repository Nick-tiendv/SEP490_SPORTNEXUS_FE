// Cổng khảo sát (BE Review 2):
// - Khảo sát người chơi: LoginResponse.needsOnboarding = true → bắt buộc làm trước khi vào app.
// - Khảo sát toàn diện theo môn: chưa có Elo môn đó thì không tạo / vào đội, không đăng ký giải (403).
// apiClient gọi detectSurveyGate khi gặp 403 → phát sự kiện, <SurveyGateListener /> (App.jsx) chuyển sang màn khảo sát.
import { setForbiddenHandler } from '../api/apiClient.js'

const FLAG_KEY = 'sportnexus_needs_onboarding'
export const ONBOARDING_EVENT = 'sportnexus:onboarding-required'
export const ASSESSMENT_EVENT = 'sportnexus:assessment-required'

export function setNeedsOnboarding(value) {
  try {
    if (value) localStorage.setItem(FLAG_KEY, '1')
    else localStorage.removeItem(FLAG_KEY)
  } catch { /* localStorage bị chặn: BE vẫn chặn bằng 403 */ }
}
export function needsOnboarding() {
  try { return localStorage.getItem(FLAG_KEY) === '1' } catch { return false }
}

const fold = text => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Tìm id môn trong request bị chặn (body hoặc query) để mở đúng khảo sát môn đó
function sportIdFromRequest(config) {
  let body = config?.data
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
  const candidates = [config?.gateSportId, body?.sportCategoryId, body?.categoryId, config?.params?.sportCategoryId, config?.params?.categoryId]
  return candidates.map(value => String(value ?? '')).find(value => GUID.test(value)) || ''
}

// Gọi từ interceptor của apiClient với lỗi 403 đã có message của BE
export function detectSurveyGate(status, message, config) {
  if (status !== 403 || typeof window === 'undefined') return
  const text = fold(message)
  if (text.includes('khao sat nguoi choi')) {
    setNeedsOnboarding(true)
    window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT, { detail: { message } }))
  } else if (text.includes('khao sat toan dien') || text.includes('chua co elo')) {
    window.dispatchEvent(new CustomEvent(ASSESSMENT_EVENT, { detail: { message, sportId: sportIdFromRequest(config) } }))
  }
}

setForbiddenHandler(detectSurveyGate)
