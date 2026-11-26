import apiClient, { normalizeApiError } from '../apiClient.js'

export const AI_CHAT_ENDPOINT = '/api/v1/ai/chat'
export const AI_SESSIONS_ENDPOINT = '/api/v1/ai/sessions'

/**
 * Gửi tin nhắn đến Trợ lý AI (Google Gemini)
 * POST /api/v1/ai/chat
 * @param {Object} params
 * @param {string} params.message - Nội dung câu hỏi (1 - 1000 ký tự)
 * @param {string} [params.sessionId] - ID phiên hội thoại (bỏ qua ở câu hỏi đầu tiên)
 * @param {number} [params.lat] - Vĩ độ hiện tại (không bắt buộc)
 * @param {number} [params.lng] - Kinh độ hiện tại (không bắt buộc)
 * @returns {Promise<Object>} { sessionId, userMessage, reply: { intent, message, facilities, lfgCards } }
 */
export async function sendChatMessage({ message, sessionId, lat, lng }) {
  if (!message || !message.trim()) {
    throw new Error('Nội dung tin nhắn không được để trống')
  }

  const payload = {
    message: message.trim(),
  }

  if (sessionId) {
    payload.sessionId = sessionId
  }

  addCoords(payload, lat, lng)

  try {
    const response = await apiClient.post(AI_CHAT_ENDPOINT, payload)
    const body = response.data
    // Handle both wrapped { statusCode, data } and raw data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[aiApi] Lỗi khi gửi tin nhắn đến Trợ lý AI:', error)
    throw normalizeApiError(error)
  }
}

// BE chỉ dùng vị trí khi có đủ cả lat và lng hợp lệ: thiếu / sai một trong hai thì không gửi cả hai
function addCoords(payload, lat, lng) {
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    payload.lat = lat
    payload.lng = lng
  }
}

/**
 * Tạo một phiên hội thoại mới với AI
 * POST /api/v1/ai/sessions
 * BE trả lại phiên trống đang có (200) thay vì tạo thêm phiên rỗng (201).
 * @returns {Promise<{ session: Object, reused: boolean }>} session { id, title, createdAt, ... }; reused = phiên trống có sẵn
 */
export async function createAiSession() {
  try {
    const response = await apiClient.post(AI_SESSIONS_ENDPOINT, {})
    const body = response.data
    const reused = (Number(body?.statusCode) || response.status) === 200
    return { session: body?.data || body?.result || body, reused }
  } catch (error) {
    console.warn('[aiApi] Không thể tạo phiên AI mới:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách các cuộc trò chuyện đã lưu (mới nhất trước)
 * GET /api/v1/ai/sessions?page=&pageSize=
 * @param {Object} [params] - page bắt đầu từ 1, pageSize 1–50; không truyền thì BE trả hết. Trả ít hơn pageSize = đã hết.
 * @returns {Promise<Array>} Danh sách session: [{ id, title, lastMessage, createdAt, ... }]
 */
export async function getAiSessions({ page, pageSize } = {}) {
  try {
    const params = page ? { page, pageSize } : undefined
    const response = await apiClient.get(AI_SESSIONS_ENDPOINT, { params })
    const body = response.data
    if (Array.isArray(body?.data)) return body.data
    if (Array.isArray(body)) return body
    return []
  } catch (error) {
    console.warn('[aiApi] Không thể lấy danh sách sessions:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy lịch sử tin nhắn của một cuộc trò chuyện (cũ trước, mới sau)
 * GET /api/v1/ai/sessions/{id}/messages?limit=&before=
 * @param {string} sessionId - UUID của session
 * @param {Object} [params] - limit 1–100: lấy các tin gần nhất; before = id tin cũ nhất đang hiện để lấy tin cũ hơn.
 *   Trả ít hơn limit = đã tới đầu cuộc trò chuyện. Không truyền thì BE trả hết.
 * @returns {Promise<Array>} Danh sách tin nhắn kèm reply.facilities và reply.lfgCards
 */
export async function getAiSessionMessages(sessionId, { limit, before } = {}) {
  if (!sessionId) return []
  try {
    const params = {}
    if (limit) params.limit = limit
    if (before) params.before = before
    const response = await apiClient.get(`${AI_SESSIONS_ENDPOINT}/${sessionId}/messages`, { params })
    const body = response.data
    if (Array.isArray(body?.data)) return body.data
    if (Array.isArray(body)) return body
    return []
  } catch (error) {
    console.warn(`[aiApi] Không thể lấy tin nhắn của session ${sessionId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Gửi tin nhắn trong một cuộc trò chuyện cụ thể
 * POST /api/v1/ai/sessions/{id}/chat
 * @param {string} sessionId - UUID của session
 * @param {Object} params
 * @param {string} params.message - Nội dung tin nhắn
 * @param {number} [params.lat] - Vĩ độ
 * @param {number} [params.lng] - Kinh độ
 * @returns {Promise<Object>} Phản hồi từ trợ lý AI
 */
export async function sendSessionChatMessage(sessionId, { message, lat, lng } = {}) {
  if (!sessionId) throw new Error('sessionId không được để trống')
  if (!message || !message.trim()) throw new Error('Nội dung tin nhắn không được để trống')

  const payload = { message: message.trim() }
  addCoords(payload, lat, lng)

  try {
    const response = await apiClient.post(`${AI_SESSIONS_ENDPOINT}/${sessionId}/chat`, payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[aiApi] Lỗi khi gửi tin nhắn vào session ${sessionId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa một cuộc trò chuyện
 * DELETE /api/v1/ai/sessions/{id}
 * @param {string} sessionId - UUID của session
 * @returns {Promise<boolean>}
 */
export async function deleteAiSession(sessionId) {
  if (!sessionId) return false
  try {
    await apiClient.delete(`${AI_SESSIONS_ENDPOINT}/${sessionId}`)
    return true
  } catch (error) {
    console.warn(`[aiApi] Lỗi khi xóa session ${sessionId}:`, error)
    throw normalizeApiError(error)
  }
}

// Phiên AI đang dùng được chia sẻ giữa modal chat và trang /ai-chat để hai nơi đồng bộ cùng một cuộc trò chuyện
const CURRENT_SESSION_KEY = 'snx-ai-current-session'

export function getStoredAiSessionId() {
  try {
    return localStorage.getItem(CURRENT_SESSION_KEY) || null
  } catch {
    return null
  }
}

export function storeAiSessionId(sessionId) {
  try {
    if (sessionId) localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
    else localStorage.removeItem(CURRENT_SESSION_KEY)
  } catch {
    // Bỏ qua nếu trình duyệt chặn storage
  }
}

/**
 * Chuyển lịch sử từ GET /sessions/{id}/messages sang tin nhắn hiển thị.
 * Lịch sử là mảng phẳng AiMessageResponse (sender USER/BOT, message); dạng cặp chỉ dùng cho response gửi tin.
 */
export function mapAiHistoryToMessages(items = []) {
  // Giờ gửi theo giờ Việt Nam; tin của ngày khác thì ghi thêm ngày
  const toTime = (iso) => {
    if (!iso) return 'Vừa xong'
    const day = (d) => d.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' })
    const at = new Date(iso)
    const clock = at.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false })
    return day(at) === day(new Date()) ? clock : `${clock} ${day(at)}`
  }
  const result = []
  items.forEach((m, idx) => {
    // Dạng cặp chỉ có ở response gửi tin (AiChatResponse): userMessage và reply đều là AiMessageResponse
    if (m?.userMessage && m?.reply) {
      result.push(mapAiMessage(m.userMessage, `${idx}-u`, toTime))
      result.push(mapAiMessage(m.reply, `${idx}-b`, toTime))
      return
    }
    result.push(mapAiMessage(m, `msg-${idx}`, toTime))
  })
  return result
}

// AiMessageResponse: { id, sender: 'USER' | 'BOT', message, intent { intent, slotsNeeded, ... }, facilities, lfgCards, tournaments, createdAt }
function mapAiMessage(m, fallbackId, toTime) {
  const isUser = String(m?.sender || '').toUpperCase() === 'USER'
  return {
    id: m?.id || fallbackId,
    sender: isUser ? 'user' : 'bot',
    text: m?.message || '',
    time: toTime(m?.createdAt),
    intent: isUser ? undefined : m?.intent,
    facilities: isUser ? undefined : m?.facilities,
    lfgCards: isUser ? undefined : m?.lfgCards,
    tournaments: isUser ? undefined : m?.tournaments,
    messageId: isUser ? undefined : m?.id,
  }
}

// POST /api/v1/ai/messages/{messageId}/book: đặt ca AI vừa gợi ý (luồng đặt sân chuẩn: trừ ví, gửi vé QR).
// Chỉ ca gốc phải nằm trong gợi ý; numberOfSlots (ca liên tiếp), voucherId, isSplitPayment + participantIds
// được BE kiểm tra như POST /api/v1/bookings. Kết quả cùng dạng với POST /api/v1/bookings.
export async function confirmAiBooking(messageId, { courtSlotId, numberOfSlots = 1, voucherId = null, isSplitPayment = false, participantIds = [] }) {
  try {
    const payload = { courtSlotId, numberOfSlots, voucherId, isSplitPayment, participantIds: isSplitPayment ? participantIds : [] }
    const body = (await apiClient.post(`/api/v1/ai/messages/${encodeURIComponent(messageId)}/book`, payload)).data
    if (body && typeof body === 'object' && 'statusCode' in body && (body.statusCode < 200 || body.statusCode >= 300)) throw normalizeApiError({ response: { status: body.statusCode, data: body } })
    return body?.data ?? body
  } catch (error) {
    throw normalizeApiError(error)
  }
}

// POST /api/v1/ai/messages/{messageId}/lfg { courtSlotId, slotsNeeded, skillLevelTag?, description? } (ý định CREATE_LFG)
export async function confirmAiLfg(messageId, { courtSlotId, slotsNeeded, skillLevelTag, description }) {
  try {
    const body = (await apiClient.post(`/api/v1/ai/messages/${encodeURIComponent(messageId)}/lfg`, { courtSlotId, slotsNeeded, skillLevelTag: skillLevelTag || null, description: description || null })).data
    if (body && typeof body === 'object' && 'statusCode' in body && (body.statusCode < 200 || body.statusCode >= 300)) throw normalizeApiError({ response: { status: body.statusCode, data: body } })
    return body?.data ?? body
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export default {
  sendChatMessage,
  createAiSession,
  getAiSessions,
  getAiSessionMessages,
  sendSessionChatMessage,
  deleteAiSession,
}
