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

  if (typeof lat === 'number' && !isNaN(lat)) {
    payload.lat = lat
  }
  if (typeof lng === 'number' && !isNaN(lng)) {
    payload.lng = lng
  }

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

/**
 * Tạo một phiên hội thoại mới với AI
 * POST /api/v1/ai/sessions
 * @returns {Promise<Object>} Session mới { id, title, createdAt, ... }
 */
export async function createAiSession() {
  try {
    const response = await apiClient.post(AI_SESSIONS_ENDPOINT, {})
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[aiApi] Không thể tạo phiên AI mới:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách các cuộc trò chuyện đã lưu
 * GET /api/v1/ai/sessions
 * @returns {Promise<Array>} Danh sách session: [{ id, title, lastMessage, createdAt, ... }]
 */
export async function getAiSessions() {
  try {
    const response = await apiClient.get(AI_SESSIONS_ENDPOINT)
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
 * Lấy lịch sử tin nhắn của một cuộc trò chuyện
 * GET /api/v1/ai/sessions/{id}/messages
 * @param {string} sessionId - UUID của session
 * @returns {Promise<Array>} Danh sách tin nhắn kèm reply.facilities và reply.lfgCards
 */
export async function getAiSessionMessages(sessionId) {
  if (!sessionId) return []
  try {
    const response = await apiClient.get(`${AI_SESSIONS_ENDPOINT}/${sessionId}/messages`)
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
  if (typeof lat === 'number' && !isNaN(lat)) payload.lat = lat
  if (typeof lng === 'number' && !isNaN(lng)) payload.lng = lng

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
  const toTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
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

// AiMessageResponse: { id, sender: 'USER' | 'BOT', message, intent, facilities, lfgCards, createdAt }
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
