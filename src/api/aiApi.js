import apiClient, { normalizeApiError } from './apiClient.js'

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

export default {
  sendChatMessage,
  getAiSessions,
  getAiSessionMessages,
  deleteAiSession,
}
