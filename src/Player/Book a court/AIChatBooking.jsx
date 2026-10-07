// AIChatBooking.jsx — Giao diện Toàn trang Trợ lý AI SportNexus Concierge
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
  id: 'welcome-page',
  sender: 'bot',
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  text:
    'Xin chào bạn! 👋 Tôi là **SportNexus AI Concierge** — trợ lý đặt sân thể thao thông minh thời gian thực.\n\n' +
    'Tôi đã đồng bộ toàn bộ dữ liệu sân bãi và trạng thái các khung giờ trống tại TP.HCM. Dựa trên vị trí của bạn tại **Nguyễn Thị Thập, Quận 7**, tôi có thể giúp bạn:\n\n' +
    '• **Gợi ý sân gần nhất** (SportNexus Arena Q.7 cách 0.8 km)\n' +
    '• **Tìm kiếm & so sánh** sân Cầu lông / Pickleball theo giá và chuẩn thi đấu\n' +
    '• **Chọn nhanh khung giờ vàng tối nay** và hỗ trợ chuyển sang đặt chỗ\n' +
    '• **Giải đáp cơ chế Khóa giữ chỗ 15p** & Bảo chứng giao dịch Escrow 24/7\n\n' +
    'Bạn muốn tìm kiếm sân theo tiêu chí nào hôm nay?',
  quickReplies: [
    '📍 Tìm sân gần tôi nhất (Quận 7)',
    '💰 Sân cầu lông giá rẻ nhất',
    '🏓 Sân Pickleball tốt nhất',
    '⏰ Giờ trống tối nay từ 19:30',
    '🛡️ Cơ chế giữ chỗ và bảo chứng Escrow',
  ],
}

function AIChatBooking() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([INITIAL_WELCOME])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, isTyping])

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

    setTimeout(() => {
      const response = processAIChatQuery(text, 'snx-q7')
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

  const handleSelectCourtOnMap = (court, slot) => {
    navigate('/court-finder')
    // Dispatch event to select that court in MapBooking
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('sportnexus-select-court-slot', {
          detail: { courtId: court.id, slotId: slot?.id, court, slot },
        })
      )
    }, 200)
  }

  const handleBookNow = (court, slot) => {
    const targetSlot = slot || buildSlotsForCourt(court).find((s) => s.status === 'available') || {
      start: '19:30',
      end: '21:00',
      hours: 1.5,
      price: court.price * 1.5,
    }

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

  const renderFormattedText = (rawText) => {
    if (!rawText) return null
    const lines = rawText.split('\n')

    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} style={{ height: '6px' }} />
      }

      const isBullet = line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')
      const content = isBullet ? line.slice(2) : line

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
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-t-2xl border border-b-0 border-emerald-900/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-emerald-950">SportNexus AI Concierge</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                Trực tuyến 24/7
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Trợ lý Đặt Sân Thông Minh • Tự động gợi ý lựa chọn tối ưu theo vị trí và ngân sách
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/court-finder')}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">map</span>
          Về Bản Đồ Đặt Sân
        </button>
      </div>

      {/* Chat Body */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto bg-gray-50/70 p-4 border-x border-emerald-900/10 flex flex-col gap-4"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`snx-ai-msg ${msg.sender === 'user' ? 'is-user' : 'is-bot'}`}>
            {msg.sender === 'bot' && (
              <div className="snx-ai-msg-avatar">🤖</div>
            )}

            <div className="snx-ai-msg-content max-w-2xl">
              <div className="snx-ai-bubble">{renderFormattedText(msg.text)}</div>

              {msg.recommendedCourt && (
                <div className="snx-ai-recom-card mt-2">
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
                        {msg.recommendedCourt.address} • <strong>Cách {msg.recommendedCourt.distance} km</strong>
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
                        <span className="snx-ai-slot-price">{formatVnd(msg.recommendedSlot.price)}</span>
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
                        onClick={() => handleSelectCourtOnMap(msg.recommendedCourt, msg.recommendedSlot)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          map
                        </span>
                        Xem &amp; Chọn Trên Bản Đồ
                      </button>

                      <button
                        type="button"
                        className="snx-ai-btn-action snx-ai-btn-book"
                        onClick={() => handleBookNow(msg.recommendedCourt, msg.recommendedSlot)}
                      >
                        <span>Đặt &amp; Chia Tiền Ngay</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="snx-ai-chips-wrap mt-2">
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

      {/* Input Area */}
      <div className="p-3 bg-white rounded-b-2xl border border-t-0 border-emerald-900/10 shadow-sm">
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
            placeholder="Hỏi AI bất kỳ: 'sân nào gần nhất?', 'giá dưới 200k', 'tối nay có sân pickleball nào trống?'..."
            disabled={isTyping}
          />
          <button
            type="button"
            className="snx-ai-voice-btn"
            title="Gợi ý câu hỏi mẫu"
            onClick={() => handleSendMessage('Tìm cho tôi sân pickleball chất lượng nhất')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
              mic
            </span>
          </button>
          <button
            type="submit"
            className="snx-ai-send-btn"
            disabled={!inputValue.trim() || isTyping}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              send
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIChatBooking
