// AIChatBooking.jsx — Giao diện Toàn trang Trợ lý AI SportNexus Concierge
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
import {
  sendChatMessage,
  createAiSession,
  getAiSessions,
  getAiSessionMessages,
  sendSessionChatMessage,
  deleteAiSession,
} from '../../api/aiApi.js'
import './AIChatModal.css'

function AIChatBooking() {
  const navigate = useNavigate()

  // Vị trí người chơi thời gian thực
  const [userLocation, setUserLocation] = useState(() => ({
    ...DISTRICT_CENTERS.q7,
    updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }))

  const [messages, setMessages] = useState(() => [buildWelcomeMessage(DISTRICT_CENTERS.q7)])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [isListening, setIsListening] = useState(false)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Lấy vị trí GPS khi vào trang lần đầu
  useEffect(() => {
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
        () => { },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [])

  const showToast = (text) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(null), 3200)
  }

  const [activeCourtId, setActiveCourtId] = useState('snx-q7')
  const [sessionsList, setSessionsList] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  // Tải danh sách phiên hội thoại từ GET /api/v1/ai/sessions
  useEffect(() => {
    let isMounted = true
    async function loadSessions() {
      try {
        const list = await getAiSessions()
        if (isMounted && Array.isArray(list)) {
          setSessionsList(list)
        }
      } catch (e) {
        console.warn('AIChatBooking: Lỗi lấy danh sách sessions:', e)
      }
    }
    loadSessions()
    return () => { isMounted = false }
  }, [])

  // Chuyển sang phiên hội thoại khác: GET /api/v1/ai/sessions/{id}/messages
  const handleSelectSession = async (sessionId) => {
    if (!sessionId) return
    setCurrentSessionId(sessionId)
    setIsLoadingSession(true)
    try {
      const msgs = await getAiSessionMessages(sessionId)
      if (Array.isArray(msgs) && msgs.length > 0) {
        const mapped = msgs.map((m, idx) => ({
          id: m.id || `msg-${idx}`,
          sender: m.sender === 'user' || m.role === 'user' ? 'user' : 'bot',
          text: m.content || m.message || m.text || '',
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
          facilities: m.reply?.facilities || m.facilities,
          lfgCards: m.reply?.lfgCards || m.lfgCards,
          slots: m.slots,
        }))
        setMessages(mapped)
      } else {
        setMessages([buildWelcomeMessage(userLocation)])
      }
    } catch (e) {
      console.warn('Lỗi lấy tin nhắn session:', e)
      showToast('⚠️ Không thể tải lịch sử phiên này')
    } finally {
      setIsLoadingSession(false)
    }
  }

  // Tạo phiên hội thoại mới: POST /api/v1/ai/sessions
  const handleCreateNewSession = async () => {
    try {
      const newSession = await createAiSession()
      if (newSession?.id) {
        setSessionsList((prev) => [newSession, ...prev])
        setCurrentSessionId(newSession.id)
      }
      setMessages([buildWelcomeMessage(userLocation)])
      showToast('✨ Đã tạo phiên hội thoại mới với AI Concierge')
    } catch (e) {
      console.warn('Lỗi tạo session:', e)
      setCurrentSessionId(null)
      setMessages([buildWelcomeMessage(userLocation)])
    }
  }

  // Xóa phiên hội thoại: DELETE /api/v1/ai/sessions/{id}
  const handleDeleteSession = async (sessionId) => {
    const idToDelete = sessionId || currentSessionId
    if (!idToDelete) return
    try {
      await deleteAiSession(idToDelete)
      setSessionsList((prev) => prev.filter((s) => s.id !== idToDelete))
      if (currentSessionId === idToDelete) {
        setCurrentSessionId(null)
        setMessages([buildWelcomeMessage(userLocation)])
      }
      showToast('🗑️ Đã xóa cuộc trò chuyện')
    } catch (e) {
      console.warn('Lỗi xóa session:', e)
      showToast('⚠️ Không thể xóa cuộc trò chuyện')
    }
  }

  // Gửi tin nhắn và nhận phản hồi từ Backend AI hoặc local AI
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

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

    try {
      let aiResult = null
      if (currentSessionId) {
        // Gửi vào session hiện tại: POST /api/v1/ai/sessions/{id}/chat
        aiResult = await sendSessionChatMessage(currentSessionId, {
          message: text,
          lat: userLocation.lat,
          lng: userLocation.lng,
        })
      } else {
        // Gửi chung / tạo session: POST /api/v1/ai/chat
        aiResult = await sendChatMessage({
          message: text,
          lat: userLocation.lat,
          lng: userLocation.lng,
        })
        if (aiResult?.sessionId && !currentSessionId) {
          setCurrentSessionId(aiResult.sessionId)
          getAiSessions().then((list) => Array.isArray(list) && setSessionsList(list))
        }
      }

      const botReply = aiResult?.reply?.message || aiResult?.message || aiResult?.text || 'Xin chào! Tôi có thể giúp gì cho bạn?'
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        text: botReply,
        facilities: aiResult?.reply?.facilities || aiResult?.facilities,
        lfgCards: aiResult?.reply?.lfgCards || aiResult?.lfgCards,
        slots: aiResult?.reply?.slots,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.warn('[AIChatBooking] API AI không phản hồi, dùng fallback local engine:', err)
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
    } finally {
      setIsTyping(false)
    }
  }


  // Làm mới đoạn chat & Cập nhật vị trí mới với người chơi ở thời điểm hiện tại
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

  // Microchat: Sử dụng micro để nhận diện giọng nói tiếng Việt
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
      recognition.lang = 'vi-VN'
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
          showToast('⚠️ Vui lòng cấp quyền truy cập Micro trên trình duyệt.')
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

  const handleSelectCourtOnMap = (court, slot) => {
    navigate('/court-finder')
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

    const isGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const slotId = isGuidRegex.test(targetSlot.id) ? targetSlot.id : 'ba2a7900-1a73-430c-9cbd-3b5be6874b04'
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
        courtSlotId: slotId,
        courtSlotIds: [slotId],
        numberOfSlots: 1,
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
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-4 relative">
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
              Vị trí hiện tại: <strong>{userLocation.name}</strong> • Cập nhật lúc {userLocation.updatedAt || 'Hôm nay'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {sessionsList.length > 0 && (
            <select
              value={currentSessionId || ''}
              onChange={(e) => handleSelectSession(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 border border-gray-300 text-gray-800 outline-none"
              title="Chọn phiên hội thoại"
            >
              <option value="">-- Phiên trò chuyện mới --</option>
              {sessionsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || `Phiên #${s.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleCreateNewSession}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition-all"
            title="Tạo cuộc trò chuyện mới"
          >
            <span className="material-symbols-outlined text-[16px]">add_comment</span>
            Chat Mới
          </button>

          {currentSessionId && (
            <button
              type="button"
              onClick={() => handleDeleteSession(currentSessionId)}
              className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center gap-1 transition-all"
              title="Xóa phiên chat này"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetChat}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition-all"
            title="Làm mới đoạn chat & cập nhật vị trí hiện tại"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Vị trí
          </button>

          <button
            onClick={() => navigate('/court-finder')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 flex items-center gap-1 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            Bản Đồ
          </button>
        </div>
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
                    <div className="snx-ai-recom-loc-group">
                      <h4 className="snx-ai-recom-title">{msg.recommendedCourt.name}</h4>
                      
                      <div className="snx-ai-recom-addr">
                        <span className="material-symbols-outlined snx-ai-loc-icon">
                          location_on
                        </span>
                        <span className="snx-ai-addr-text">{msg.recommendedCourt.address}</span>
                      </div>

                      <div className="snx-ai-recom-dist-row">
                        <span className="snx-ai-dist-badge">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                            near_me
                          </span>
                          Cách bạn {msg.recommendedCourt.distance} km
                        </span>
                        {msg.recommendedCourt.route?.eta && (
                          <span className="snx-ai-eta-text">• {msg.recommendedCourt.route.eta}</span>
                        )}
                      </div>
                    </div>

                    {msg.recommendedSlot && (
                      <div className="snx-ai-recom-slot">
                        <div className="snx-ai-slot-primary-row">
                          <span className="snx-ai-slot-time">
                            <span className="material-symbols-outlined">
                              schedule
                            </span>
                            Khung giờ: {msg.recommendedSlot.start} - {msg.recommendedSlot.end}
                          </span>
                          <span className="snx-ai-slot-price">{formatVnd(msg.recommendedSlot.price)}</span>
                        </div>

                        {msg.recommendedSlot.note && (
                          <div className="snx-ai-slot-secondary-row">
                            <span className="snx-ai-slot-status-dot" />
                            <span>{msg.recommendedSlot.note}</span>
                            {msg.recommendedSlot.hours && (
                              <span style={{ color: '#047857', opacity: 0.85 }}>
                                • {msg.recommendedSlot.hours}h thi đấu
                              </span>
                            )}
                          </div>
                        )}
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
                          check_circle
                        </span>
                        Chọn Sân Này
                      </button>

                      <button
                        type="button"
                        className="snx-ai-btn-action snx-ai-btn-book"
                        onClick={() => handleBookNow(msg.recommendedCourt, msg.recommendedSlot)}
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
      <div className="p-3 bg-white rounded-b-2xl border border-t-0 border-emerald-900/10 shadow-sm flex flex-col gap-2">
        {isListening && (
          <div className="snx-ai-listening-indicator">
            <div className="snx-ai-listening-dots">
              <span />
              <span />
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              mic
            </span>
            <span>Đang nghe bạn nói... Hãy nói câu hỏi, yêu cầu hoặc tiêu chí đặt sân</span>
          </div>
        )}

        <form
          className="snx-ai-input-row"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          {/* Đã xóa dòng chữ mờ placeholder */}
          <input
            ref={inputRef}
            type="text"
            className="snx-ai-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />

          <button
            type="button"
            className={`snx-ai-voice-btn ${isListening ? 'is-listening' : ''}`}
            title={isListening ? 'Đang nghe... Bấm để dừng' : 'Bấm để nói câu hỏi qua micro'}
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
