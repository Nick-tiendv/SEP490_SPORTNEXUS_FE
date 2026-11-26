// useAiHistory.js — Lịch sử chat AI theo trang: lần đầu lấy 20 tin gần nhất, cuộn lên đầu thì lấy tin cũ hơn (before)
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { getAiSessionMessages, mapAiHistoryToMessages } from '../../../api/player/aiApi.js'

export const AI_HISTORY_LIMIT = 20

export function useAiHistory({ bodyRef, messages, isTyping, active = true, setMessages }) {
  const [older, setOlder] = useState({ oldestId: null, hasMore: false, loading: false })
  const sessionRef = useRef(null) // phiên đang hiện, tránh chèn tin cũ vào phiên khác khi người dùng đổi phiên
  const keepFromBottom = useRef(null) // khoảng cách tới đáy trước khi chèn tin cũ

  // Có tin mới → cuộn xuống cuối; vừa chèn tin cũ → giữ nguyên đoạn đang xem
  useLayoutEffect(() => {
    const el = bodyRef.current
    if (!active || !el) return
    if (keepFromBottom.current != null) {
      el.scrollTop = el.scrollHeight - keepFromBottom.current
      keepFromBottom.current = null
    } else {
      el.scrollTop = el.scrollHeight
    }
  }, [bodyRef, messages, isTyping, active])

  // Tải 20 tin gần nhất của phiên, trả về tin nhắn đã map (lỗi ném ra cho nơi gọi xử lý)
  const loadLatest = useCallback(async (sessionId) => {
    sessionRef.current = sessionId
    const items = await getAiSessionMessages(sessionId, { limit: AI_HISTORY_LIMIT })
    if (sessionRef.current !== sessionId) return null
    setOlder({ oldestId: items[0]?.id || null, hasMore: items.length >= AI_HISTORY_LIMIT, loading: false })
    return mapAiHistoryToMessages(items)
  }, [])

  // Phiên mới / làm mới: không còn tin cũ để tải
  const resetHistory = useCallback((sessionId = null) => {
    sessionRef.current = sessionId
    setOlder({ oldestId: null, hasMore: false, loading: false })
  }, [])

  const loadOlder = async () => {
    const sessionId = sessionRef.current
    if (!sessionId || !older.hasMore || older.loading || !older.oldestId) return
    setOlder((o) => ({ ...o, loading: true }))
    try {
      const items = await getAiSessionMessages(sessionId, { limit: AI_HISTORY_LIMIT, before: older.oldestId })
      if (sessionRef.current !== sessionId) return
      const el = bodyRef.current
      if (el) keepFromBottom.current = el.scrollHeight - el.scrollTop
      setMessages((prev) => [...mapAiHistoryToMessages(items), ...prev])
      setOlder({ oldestId: items[0]?.id || older.oldestId, hasMore: items.length >= AI_HISTORY_LIMIT, loading: false })
    } catch {
      setOlder((o) => ({ ...o, loading: false }))
    }
  }

  // Đặt sân / mở kèo thất bại (ca vừa bị đặt, gợi ý không còn…): tải lại tin gần nhất để cập nhật isAvailable
  // của ca / kèo / giải, thay đúng tin theo id và giữ nguyên chỗ đang xem
  const refreshLatest = async () => {
    const sessionId = sessionRef.current
    if (!sessionId) return
    try {
      const items = await getAiSessionMessages(sessionId, { limit: AI_HISTORY_LIMIT })
      if (sessionRef.current !== sessionId) return
      // Tin bot vừa gửi trong phiên có id tạm, id của BE nằm ở messageId
      const fresh = new Map(mapAiHistoryToMessages(items).filter((m) => m.messageId).map((m) => [m.messageId, m]))
      const el = bodyRef.current
      if (el) keepFromBottom.current = el.scrollHeight - el.scrollTop
      setMessages((prev) => prev.map((m) => {
        const next = m.messageId ? fresh.get(m.messageId) : null
        return next ? { ...m, facilities: next.facilities, lfgCards: next.lfgCards, tournaments: next.tournaments } : m
      }))
    } catch {
      // Không tải lại được thì giữ nguyên, lỗi đặt sân đã được báo bằng toast
    }
  }

  // Gắn vào onScroll của khung chat: gần chạm đầu thì tải thêm
  const onScroll = (e) => {
    if (e.currentTarget.scrollTop < 60) loadOlder()
  }

  return { hasOlder: older.hasMore, loadingOlder: older.loading, loadLatest, loadOlder, refreshLatest, resetHistory, onScroll }
}
