// AIChatBooking.jsx — Giao diện Toàn trang Trợ lý AI SportNexus Concierge
import { useEffect, useRef, useState } from 'react'
import { uid } from '../../../utils/ids.js'
import { useNavigate } from 'react-router-dom'
import {
  DISTRICT_CENTERS,
  buildWelcomeMessage,
  detectClosestDistrict,
  getUserProfileContext,
} from './aiBookingData.js'
import {
  sendChatMessage,
  createAiSession,
  getAiSessions,
  getAiSessionMessages,
  sendSessionChatMessage,
  deleteAiSession,
  getStoredAiSessionId,
  mapAiHistoryToMessages,
  storeAiSessionId,
} from '../../../api/player/aiApi.js'
import AiSuggestions from './AiSuggestions.jsx'
import { buildPaymentState } from './aiRealBooking.js'
import './AIChatModal.css'

function AIChatBooking() {
  const navigate = useNavigate()

  // Vị trí người chơi thời gian thực
  const [userLocation, setUserLocation] = useState(() => ({
    ...DISTRICT_CENTERS.q7,
    updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }))

  const [, setUserProfile] = useState(() => getUserProfileContext())
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

  // Lắng nghe cập nhật hồ sơ người dùng
  useEffect(() => {
    const handleProfileSync = () => {
      const p = getUserProfileContext()
      setUserProfile(p)
      if (p.districtCenter) {
        setUserLocation((prev) => ({
          ...p.districtCenter,
          updatedAt: prev.updatedAt,
        }))
      }
    }
    window.addEventListener('player-profile-updated', handleProfileSync)
    window.addEventListener('storage', handleProfileSync)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileSync)
      window.removeEventListener('storage', handleProfileSync)
    }
  }, [])

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
          // Chỉ cập nhật lời chào, không ghi đè lịch sử đã tải
          setMessages((prev) =>
            prev.length === 1 && prev[0].sender !== 'user' ? [buildWelcomeMessage(newLoc)] : prev
          )
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

  const [sessionsList, setSessionsList] = useState([])
  const [currentSessionId, setCurrentSessionIdState] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  // Luôn lưu phiên hiện tại để modal chat dùng chung cùng cuộc trò chuyện
  const setCurrentSessionId = (id) => {
    setCurrentSessionIdState(id)
    storeAiSessionId(id)
  }

  // Tải danh sách phiên hội thoại từ GET /api/v1/ai/sessions và khôi phục phiên đang dùng
  useEffect(() => {
    let isMounted = true
    async function loadSessions() {
      try {
        const list = await getAiSessions()
        if (isMounted && Array.isArray(list)) {
          setSessionsList(list)
          const storedId = getStoredAiSessionId()
          if (storedId && list.some((s) => s.id === storedId)) {
            handleSelectSession(storedId)
          } else if (storedId) {
            storeAiSessionId(null)
          }
        }
      } catch (e) {
        console.warn('AIChatBooking: Lỗi lấy danh sách sessions:', e)
      }
    }
    loadSessions()
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Chuyển sang phiên hội thoại khác: GET /api/v1/ai/sessions/{id}/messages
  async function handleSelectSession(sessionId) {
    if (!sessionId) return
    setCurrentSessionId(sessionId)
    setIsLoadingSession(true)
    try {
      const msgs = await getAiSessionMessages(sessionId)
      const mapped = mapAiHistoryToMessages(Array.isArray(msgs) ? msgs : [])
      if (mapped.length > 0) {
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
      id: uid('user'),
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

      const botReply = aiResult?.reply?.message || aiResult?.message || 'Mình chưa hiểu ý bạn, bạn nói rõ hơn giúp mình nhé.'
      const botMsg = {
        id: uid('bot'),
        sender: 'bot',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        text: botReply,
        facilities: aiResult?.reply?.facilities || [],
        lfgCards: aiResult?.reply?.lfgCards || [],
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.warn('[AIChatBooking] Trợ lý AI không phản hồi:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: uid('bot'),
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ ${err?.message || 'Trợ lý AI tạm thời không phản hồi, vui lòng thử lại sau.'}`,
        },
      ])
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }


  // Làm mới đoạn chat & Cập nhật vị trí mới với người chơi ở thời điểm hiện tại
  const handleResetChat = () => {
    showToast('📍 Đang định vị vị trí hiện tại của bạn...')

    const applyNewLoc = (newLoc) => {
      setUserLocation(newLoc)
      const welcome = buildWelcomeMessage(newLoc)
      setMessages([welcome])
      // Làm mới = bắt đầu phiên mới, tránh tin nhắn sau rơi vào phiên cũ
      setCurrentSessionId(null)
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
    } catch {
      setIsListening(false)
      showToast('⚠️ Không thể khởi động Micro. Vui lòng thử lại!')
    }
  }

  // Đặt 1 ca thật do AI gợi ý: sang trang thanh toán với đúng courtSlotId và ngày (giờ Việt Nam)
  const handleBookSlot = (facility, slot) => {
    navigate('/split-payment', { state: buildPaymentState(facility, slot) })
  }

  const handleOpenLfg = () => {
    navigate('/community')
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

      const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g)
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx}>{part.slice(1, -1)}</em>
        }
        return part
      })

      if (isBullet) {
        return (
          <div
            key={idx}
            className="snx-ai-bullet-row"
            style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '3px' }}
          >
            <span style={{ color: '#10B981', flexShrink: 0, marginTop: '2px', fontSize: '11px' }}>●</span>
            <div style={{ flex: 1, minWidth: 0 }}>{renderedParts}</div>
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
              disabled={isLoadingSession}
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

              <AiSuggestions facilities={msg.facilities} lfgCards={msg.lfgCards} onBookSlot={handleBookSlot} onOpenLfg={handleOpenLfg} />

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
