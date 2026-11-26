// aiChatErrors.js — Đọc lỗi Trợ lý AI theo errorCode của BE (FE_AI_CHATBOT_CAP_NHAT_26-11, mục 3.1)
import { useEffect, useState } from 'react'

export const AI_MESSAGE_MAX = 1000

// Với 429 / 502 / 503 BE không lưu câu hỏi → giữ bong bóng câu hỏi kèm nút "Gửi lại"
const UNSAVED_CODES = new Set(['AI_RATE_LIMITED', 'AI_OVERLOADED', 'AI_UNAVAILABLE', 'AI_BUSY'])

export function describeAiError(err) {
  const code = err?.errorCode || null
  const seconds = Number(err?.errorDetail?.retryAfterSeconds)
  return {
    code,
    message: err?.message || 'Trợ lý AI tạm thời không phản hồi, vui lòng thử lại sau.',
    // AI_BUSY không có số giây: chờ vài giây rồi cho gửi lại
    retryAfter: Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : code === 'AI_BUSY' ? 3 : 0,
    unsaved: UNSAVED_CODES.has(code) || [429, 502, 503].includes(err?.status),
    paused: code === 'AI_NOT_CONFIGURED',
    sessionGone: code === 'AI_SESSION_NOT_FOUND',
  }
}

// Đếm lùi từng giây; start(n) bắt đầu lại từ n giây
export function useCooldown() {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (left <= 0) return undefined
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  return [left, setLeft]
}
