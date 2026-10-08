// AIChatModal.jsx — Khung chat thông minh giữa Người chơi và Trợ lý AI SportNexus
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  COURTS,
  DISTRICT_CENTERS,
  buildSlotsForCourt,
  buildWelcomeMessage,
  detectClosestDistrict,
  formatVnd,
  processAIChatQuery,
} from './aiBookingData.js'
import './AIChatModal.css'

function AIChatModal({
  isOpen = false,
  onClose = () => {},
  currentCourtId = 'snx-q7',
  onSelectCourtSlot = null,
}) {
  const navigate = useNavigate()

  // Vị trí người chơi thời gian thực (mặc định khởi tạo tại Quận 7 hoặc theo GPS)
  const [userLocation, setUserLocation] = useState(() => ({
    ...DISTRICT_CENTERS.q7,
    updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }))

  const [messages, setMessages] = useState(() => [buildWelcomeMessage(DISTRICT_CENTERS.q7)])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [isListening, setIsListening] = useState(false)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Cập nhật vị trí GPS ngầm khi modal mở lần đầu
  useEffect(() => {
    if (!isOpen) return

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const closest = detectClosestDistrict(latitude, longitude)
          const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          const newLoc = {
            lat: latitude,
            lng: longitude,
            name: closest.name,
            address: closest.address,
            updatedAt: nowStr,
          }
          setUserLocation(newLoc)
          setMessages([buildWelcomeMessage(newLoc)])
        },
        () => {
          // Giữ mặc định nếu không cấp quyền
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [isOpen])

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

  const [activeCourtId, setActiveCourtId] = useState(currentCourtId)

  useEffect(() => {
    if (currentCourtId) setActiveCourtId(currentCourtId)
  }, [currentCourtId])

  // Dọn dẹp micro khi modal đóng
  useEffect(() => {
    if (!isOpen && isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
  }, [isOpen, isListening])

  const showToast = (text) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Xử lý gửi tin nhắn: Trợ lý AI trả lời đúng và đầy đủ theo câu hỏi, không dư thừa
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    // Dừng nhận diện giọng nói nếu đang nghe
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

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

    // Phân tích câu hỏi và phản hồi chính xác sau 400ms - 600ms
    setTimeout(() => {
      const response = processAIChatQuery(text, activeCourtId, userLocation)
      if (response.recommendedCourt?.id) {
        setActiveCourtId(response.recommendedCourt.id)
      }
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        ...response,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 500)
  }

  // Hành động 1: Chọn sân và slot trực tiếp trên giao diện Đặt sân nhanh
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

    showToast(`✅ Đã chọn sân ${court.name} (${slot ? `${slot.start} - ${slot.end}` : ''})`)
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

  // Làm mới đoạn chat & Cập nhật vị trí mới của người chơi ở thời điểm hiện tại
  const handleResetChat = () => {
    showToast('📍 Đang định vị vị trí hiện tại của bạn...')

    const applyNewLoc = (newLoc) => {
      setUserLocation(newLoc)
      const welcome = buildWelcomeMessage(newLoc)
      setMessages([welcome])
      setInputValue('')
      showToast(`📍 Đã cập nhật vị trí: ${newLoc.name} (${newLoc.updatedAt})`)
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const closest = detectClosestDistrict(latitude, longitude)
          const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          applyNewLoc({
            lat: latitude,
            lng: longitude,
            name: closest.name,
            address: closest.address,
            updatedAt: nowStr,
          })
        },
        () => {
          // Nếu người dùng không cấp quyền hoặc trên thiết bị không có GPS
          const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          const fallback = DISTRICT_CENTERS.q7
          applyNewLoc({
            lat: fallback.lat,
            lng: fallback.lng,
            name: fallback.name,
            address: fallback.address,
            updatedAt: nowStr,
          })
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      const fallback = DISTRICT_CENTERS.q7
      applyNewLoc({
        lat: fallback.lat,
        lng: fallback.lng,
        name: fallback.name,
        address: fallback.address,
        updatedAt: nowStr,
      })
    }
  }

  // Tính năng Microchat: Nhận diện giọng nói tiếng Việt bằng Web Speech API
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      showToast('⚠️ Trình duyệt chưa hỗ trợ Web Speech API. Vui lòng sử dụng Google Chrome/Edge!')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'vi-VN' // Nhận diện tiếng Việt
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
        showToast('🎙️ Đang nghe... Hãy nói câu hỏi hoặc tiêu chí đặt sân của bạn!')
      }

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInputValue(transcript)
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          showToast('⚠️ Vui lòng cấp quyền truy cập Micro trên trình duyệt để nói câu hỏi.')
        } else if (event.error === 'no-speech') {
          showToast('Chưa nghe thấy âm thanh. Bạn vui lòng bấm micro và nói lại nhé!')
        } else {
          showToast(`Không nhận diện được giọng nói (${event.error})`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        inputRef.current?.focus()
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setIsListening(false)
      showToast('⚠️ Không thể khởi động Micro. Vui lòng thử lại!')
    }
  }

  // Format markdown: **bold**, list items, \n
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

  if (!isOpen) return null

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
              <p className="snx-ai-header-sub">
                {userLocation.name} • Cập nhật lúc {userLocation.updatedAt || 'Hôm nay'}
              </p>
            </div>
          </div>

          <div className="snx-ai-header-tools">
            <button
              type="button"
              className="snx-ai-icon-btn"
              title="Làm mới đoạn chat & cập nhật vị trí hiện tại"
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
              Trợ lý Đặt Sân Tức Thì &amp; Giữ Chỗ 15 Phút
            </h3>
            <p className="snx-ai-welcome-text">
              Bạn có thể gõ hoặc <strong>bấm Micro để nói</strong> bất kỳ tiêu chí nào (VD: <em>"sân gần nhất"</em>, <em>"sân cầu lông dưới 180k"</em>, <em>"sân pickleball có mái che"</em>). AI sẽ trả lời trực diện và giúp bạn chọn, đặt sân nhanh chóng!
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

                {/* THẺ ĐỀ XUẤT ĐẶT SÂN NHANH (Actionable Court Card) */}
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
                          💡 <strong>Ưu tiên:</strong> {msg.priorityReason}
                        </div>
                      )}

                      <div className="snx-ai-recom-actions">
                        <button
                          type="button"
                          className="snx-ai-btn-action snx-ai-btn-select"
                          onClick={() => handleApplyCourt(msg.recommendedCourt, msg.recommendedSlot)}
                          title="Áp dụng chọn sân này ngay lập tức"
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
                          title="Đặt & chuyển sang thanh toán / chia tiền Split Payment"
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
                <span>SportNexus AI đang xử lý dữ liệu...</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER / INPUT ================= */}
        <div className="snx-ai-footer">
          {/* Thông báo đang nhận diện microchat */}
          {isListening && (
            <div className="snx-ai-listening-indicator">
              <div className="snx-ai-listening-dots">
                <span />
                <span />
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                mic
              </span>
              <span>Đang nghe bạn nói... Bạn hãy đưa ra câu hỏi hoặc yêu cầu</span>
            </div>
          )}

          <form
            className="snx-ai-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
          >
            {/* Đã xóa dòng chữ mờ (placeholder) theo yêu cầu */}
            <input
              ref={inputRef}
              type="text"
              className="snx-ai-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />

            {/* Microchat: Bấm để đặt câu hỏi hoặc đưa ra vấn đề bằng giọng nói */}
            <button
              type="button"
              className={`snx-ai-voice-btn ${isListening ? 'is-listening' : ''}`}
              title={isListening ? 'Đang nghe giọng nói... Bấm để dừng' : 'Bấm để nói câu hỏi qua micro'}
              onClick={handleToggleVoiceInput}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {isListening ? 'graphic_eq' : 'mic'}
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
