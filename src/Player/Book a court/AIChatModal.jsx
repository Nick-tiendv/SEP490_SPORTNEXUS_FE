// AIChatModal.jsx — Khung chat thông minh giữa Người chơi và Trợ lý AI SportNexus
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  COURTS,
  buildSlotsForCourt,
  formatVnd,
  processAIChatQuery,
} from './aiBookingData.js'
import './AIChatModal.css'

const INITIAL_WELCOME = {
  id: 'welcome-1',
  sender: 'bot',
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  text:
    'Xin chào bạn! 👋 Tôi là **SportNexus AI Concierge** — trợ lý đặt sân thể thao thông minh.\n\n' +
    'Tôi đã đồng bộ toàn bộ dữ liệu sân bãi và lịch trống thời gian thực trên hệ thống. Dựa trên vị trí của bạn tại **Nguyễn Thị Thập, Quận 7**, tôi có thể giúp bạn:\n\n' +
    '• **Gợi ý sân gần bạn nhất** (SportNexus Arena Q.7 cách 0.8 km)\n' +
    '• **Tìm sân Cầu lông / Pickleball** theo khoảng giá & khung giờ vàng\n' +
    '• **Kiểm tra slot trống tối nay** và tự động chọn sân giúp bạn\n' +
    '• **Giải đáp chính sách Khóa giữ chỗ 15p** & Bảo chứng Escrow an toàn\n\n' +
    'Bạn muốn tìm sân theo tiêu chí nào hôm nay?',
  quickReplies: [
    '📍 Tìm sân gần tôi nhất (Quận 7)',
    '💰 Sân cầu lông giá rẻ nhất',
    '🏓 Sân Pickleball tốt nhất',
    '⏰ Giờ trống tối nay từ 19:30',
    '🛡️ Cơ chế giữ chỗ và bảo chứng Escrow',
  ],
}

function AIChatModal({
  isOpen = false,
  onClose = () => {},
  currentCourtId = 'snx-q7',
  onSelectCourtSlot = null,
}) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([INITIAL_WELCOME])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, isTyping, isOpen])

  // Focus input khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isOpen])

  // Phím Esc đóng modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const showToast = (text) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(null), 3200)
  }

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: nowStr,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Phân tích câu hỏi và phản hồi sau một khoảng trễ tự nhiên (500ms - 800ms)
    setTimeout(() => {
      const response = processAIChatQuery(text, currentCourtId)
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        ...response,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 650)
  }

  // Hành động 1: Chọn sân và slot trực tiếp trên giao diện Đặt sân
  const handleApplyCourt = (court, slot) => {
    if (!court) return

    if (onSelectCourtSlot) {
      onSelectCourtSlot({ courtId: court.id, slotId: slot?.id, court, slot })
    }

    // Phát sự kiện toàn cục để MapBooking cập nhật
    window.dispatchEvent(
      new CustomEvent('sportnexus-select-court-slot', {
        detail: { courtId: court.id, slotId: slot?.id, court, slot },
      })
    )

    showToast(`✅ Đã áp dụng chọn sân ${court.name} (${slot ? `${slot.start} - ${slot.end}` : ''})`)
  }

  // Hành động 2: Đi thẳng vào thanh toán Split Payment
  const handleBookNow = (court, slot) => {
    if (!court) return
    const targetSlot = slot || buildSlotsForCourt(court).find((s) => s.status === 'available') || {
      start: '19:30',
      end: '21:00',
      hours: 1.5,
      price: court.price * 1.5,
    }

    onClose()
    navigate('/split-payment', {
      state: {
        court: court.name,
        address: court.address,
        district: court.district,
        subCourt: court.subCourt,
        subCourtDesc: court.subCourtDesc,
        image: court.image,
        sport: court.sport,
        slot: `${targetSlot.start} - ${targetSlot.end}`,
        hours: targetSlot.hours || 1.5,
        total: targetSlot.price,
        hourlyRate: court.price,
      },
    })
  }

  const handleResetChat = () => {
    setMessages([INITIAL_WELCOME])
    showToast('Đã làm mới đoạn chat')
  }

  // Format markdown cơ bản: **bold**, list items, \n
  const renderFormattedText = (rawText) => {
    if (!rawText) return null
    const lines = rawText.split('\n')

    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} style={{ height: '6px' }} />
      }

      // Xử lý list item
      const isBullet = line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')
      const content = isBullet ? line.slice(2) : line

      // Thay thế **text** bằng <strong>text</strong>
      const parts = content.split(/(\*\*.*?\*\*)/g)
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>
        }
        return part
      })

      if (isBullet) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '6px', marginLeft: '6px', marginBottom: '3px' }}>
            <span style={{ color: '#10B981' }}>•</span>
            <div>{renderedParts}</div>
          </div>
        )
      }

      return (
        <p key={idx} style={{ margin: '0 0 5px' }}>
          {renderedParts}
        </p>
      )
    })
  }

  return (
    <div className={`snx-ai-overlay ${isExpanded ? 'is-expanded' : ''}`} onClick={onClose}>
      <div
        className={`snx-ai-widget ${isExpanded ? 'is-expanded' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Khung chat trợ lý AI SportNexus"
      >
        {/* Toast thông báo */}
        {toastMessage && (
          <div className="snx-ai-toast">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                close
              </span>
            </button>
          </div>
        )}

        {/* ================= HEADER ================= */}
        <div className="snx-ai-header">
          <div className="snx-ai-header-brand">
            <div className="snx-ai-avatar">
              🤖
              <span className="snx-ai-avatar-dot" />
            </div>
            <div>
              <h2 className="snx-ai-header-title">
                SportNexus AI Concierge
                <span className="snx-ai-badge-header">Live 24/7</span>
              </h2>
              <p className="snx-ai-header-sub">Trợ lý Đặt Sân Thông Minh • Gợi ý tối ưu theo vị trí</p>
            </div>
          </div>

          <div className="snx-ai-header-tools">
            <button
              type="button"
              className="snx-ai-icon-btn"
              title="Làm mới cuộc trò chuyện"
              onClick={handleResetChat}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                restart_alt
              </span>
            </button>

            <button
              type="button"
              className="snx-ai-icon-btn"
              title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
              onClick={() => setIsExpanded((v) => !v)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isExpanded ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>

            <button
              type="button"
              className="snx-ai-icon-btn"
              title="Đóng khung chat"
              onClick={onClose}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* ================= CHAT BODY ================= */}
        <div className="snx-ai-body" ref={bodyRef}>
          {/* Welcome Info Card */}
          <div className="snx-ai-welcome-box">
            <h3 className="snx-ai-welcome-title">
              <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#10B981' }}>
                verified
              </span>
              Dữ liệu sân bãi cập nhật thời gian thực
            </h3>
            <p className="snx-ai-welcome-text">
              Bạn có thể hỏi bằng tiếng Việt tự nhiên: <em>"tìm sân cầu lông gần nhất"</em>,{' '}
              <em>"sân nào giá dưới 200k"</em>, <em>"tối nay có sân pickleball nào trống từ 19h"</em>. AI sẽ tự động phân tích và đưa ra lựa chọn ưu tiên tối ưu nhất!
            </p>
          </div>

          {/* Message List */}
          {messages.map((msg) => (
            <div key={msg.id} className={`snx-ai-msg ${msg.sender === 'user' ? 'is-user' : 'is-bot'}`}>
              {msg.sender === 'bot' && (
                <div className="snx-ai-msg-avatar" title="Trợ lý AI SportNexus">
                  🤖
                </div>
              )}

              <div className="snx-ai-msg-content">
                <div className="snx-ai-bubble">{renderFormattedText(msg.text)}</div>

                {/* THẺ GỢI Ý ƯU TIÊN (Actionable Court Card) */}
                {msg.recommendedCourt && (
                  <div className="snx-ai-recom-card">
                    {msg.priorityBadge && (
                      <div className="snx-ai-recom-badge">
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                          hotel_class
                        </span>
                        {msg.priorityBadge}
                      </div>
                    )}

                    <div className="snx-ai-recom-media">
                      <img
                        className="snx-ai-recom-img"
                        src={msg.recommendedCourt.image}
                        alt={msg.recommendedCourt.name}
                        loading="lazy"
                      />
                      <div className="snx-ai-recom-meta-float">
                        <span className="snx-ai-tag-pill">
                          {msg.recommendedCourt.sport === 'badminton' ? '🏸 Cầu Lông' : '🏓 Pickleball'}
                        </span>
                        <span className="snx-ai-rating-pill">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                            star
                          </span>
                          {msg.recommendedCourt.rating}
                        </span>
                      </div>
                    </div>

                    <div className="snx-ai-recom-body">
                      <div>
                        <h4 className="snx-ai-recom-title">{msg.recommendedCourt.name}</h4>
                        <p className="snx-ai-recom-addr">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#10B981' }}>
                            location_on
                          </span>
                          {msg.recommendedCourt.address} •{' '}
                          <strong>Cách {msg.recommendedCourt.distance} km</strong>
                        </p>
                      </div>

                      {msg.recommendedSlot && (
                        <div className="snx-ai-recom-slot">
                          <span className="snx-ai-slot-time">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              schedule
                            </span>
                            Khung giờ vàng: {msg.recommendedSlot.start} - {msg.recommendedSlot.end}
                          </span>
                          <span className="snx-ai-slot-price">
                            {formatVnd(msg.recommendedSlot.price)}
                          </span>
                        </div>
                      )}

                      {msg.priorityReason && (
                        <div className="snx-ai-recom-reason">
                          💡 <strong>Lý do ưu tiên:</strong> {msg.priorityReason}
                        </div>
                      )}

                      <div className="snx-ai-recom-actions">
                        <button
                          type="button"
                          className="snx-ai-btn-action snx-ai-btn-select"
                          onClick={() => handleApplyCourt(msg.recommendedCourt, msg.recommendedSlot)}
                          title="Áp dụng chọn sân này trên lưới lịch"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            check_circle
                          </span>
                          Chọn Sân Này
                        </button>

                        <button
                          type="button"
                          className="snx-ai-btn-action snx-ai-btn-book"
                          onClick={() => handleBookNow(msg.recommendedCourt, msg.recommendedSlot)}
                          title="Đi thẳng đến bước đặt cọc & chia tiền Split Payment"
                        >
                          <span>Đặt &amp; Chia Tiền</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick suggestions per message if available */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="snx-ai-chips-wrap" style={{ marginTop: '8px' }}>
                    <div className="snx-ai-chips-list">
                      {msg.quickReplies.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          className="snx-ai-chip"
                          onClick={() => handleSendMessage(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="snx-ai-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="snx-ai-msg is-bot">
              <div className="snx-ai-msg-avatar">🤖</div>
              <div className="snx-ai-typing">
                <div className="snx-ai-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span>SportNexus AI đang phân tích dữ liệu sân...</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER / INPUT ================= */}
        <div className="snx-ai-footer">
          <form
            className="snx-ai-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="snx-ai-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi: 'sân nào gần nhất?', 'giá dưới 200k'..."
              disabled={isTyping}
            />

            <button
              type="button"
              className="snx-ai-voice-btn"
              title="Gợi ý câu hỏi nhanh qua giọng nói"
              onClick={() => handleSendMessage('Tìm cho tôi sân cầu lông gần nhất tối nay')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                mic
              </span>
            </button>

            <button
              type="submit"
              className="snx-ai-send-btn"
              disabled={!inputValue.trim() || isTyping}
              title="Gửi câu hỏi"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                send
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AIChatModal
