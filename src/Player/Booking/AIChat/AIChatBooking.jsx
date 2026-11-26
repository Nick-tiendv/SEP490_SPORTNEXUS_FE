// AIChatBooking.jsx — Giao diện Toàn trang Trợ lý AI SportNexus Concierge
import { useEffect, useRef, useState } from 'react'
import { uid } from '../../../utils/ids.js'
import { vnClock } from '../../../utils/vnTime.js'
import { useNavigate } from 'react-router-dom'
import {
  buildWelcomeMessage,
  describeArea,
  getUserProfileContext,
} from './aiBookingData.js'
import {
  sendChatMessage,
  createAiSession,
  getAiSessions,
  sendSessionChatMessage,
  deleteAiSession,
  getStoredAiSessionId,
  storeAiSessionId,
} from '../../../api/player/aiApi.js'
import { useAiHistory } from './useAiHistory.js'

const SESSION_PAGE_SIZE = 20
import AiSuggestions from './AiSuggestions.jsx'
import { aiLeadText, buildPaymentState, relativeTimeVi, truncateText } from './aiRealBooking.js'
import { confirmDialog } from '../../../components/common/confirm.js'
import { AI_MESSAGE_MAX, describeAiError, useCooldown } from './aiChatErrors.js'
import './AIChatModal.css'

const buildProfileOrigin = (profile) => ({
  lat: profile?.lat ?? null,
  lng: profile?.lng ?? null,
  name: profile?.rawLocation || 'Chưa xác định vị trí',
  address: profile?.rawLocation || '',
  updatedAt: vnClock(new Date()),
})

function AIChatBooking() {
  const navigate = useNavigate()

  // Vị trí người chơi thời gian thực (lấy từ hồ sơ hoặc GPS, không gán cứng quận/tọa độ TP.HCM)
  const [initialProfile] = useState(() => getUserProfileContext())
  const [userLocation, setUserLocation] = useState(() => buildProfileOrigin(initialProfile))

  const [, setUserProfile] = useState(() => initialProfile)
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(buildProfileOrigin(initialProfile), initialProfile)])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [cooldown, setCooldown] = useCooldown()
  const [cooldownText, setCooldownText] = useState('')
  const [aiPaused, setAiPaused] = useState(false)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  // Cuộn xuống khi có tin mới, cuộn lên đầu thì tải tin cũ hơn
  const history = useAiHistory({ bodyRef, messages, isTyping, setMessages })

  // Lắng nghe cập nhật hồ sơ người dùng
  useEffect(() => {
    const handleProfileSync = () => {
      const p = getUserProfileContext()
      setUserProfile(p)
      setUserLocation((prev) => {
        if (prev.isGps) return prev
        return {
          ...prev,
          lat: p.lat ?? prev.lat,
          lng: p.lng ?? prev.lng,
          name: p.rawLocation || prev.name || 'Chưa xác định vị trí',
          address: p.rawLocation || prev.address || '',
        }
      })
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
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const closest = await describeArea(latitude, longitude)
          const nowStr = vnClock(new Date())
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
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
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
  // Danh sách phiên theo trang (mới nhất trước); trả ít hơn pageSize = đã hết
  const [sessionsPaging, setSessionsPaging] = useState({ page: 1, hasMore: false, loading: false })
  const [sessionsOpen, setSessionsOpen] = useState(false)

  // Luôn lưu phiên hiện tại để modal chat dùng chung cùng cuộc trò chuyện
  const setCurrentSessionId = (id) => {
    setCurrentSessionIdState(id)
    storeAiSessionId(id)
  }

  // Cuộn gần cuối danh sách phiên thì tải trang tiếp theo
  const handleSessionsScroll = (e) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40 && sessionsPaging.hasMore && !sessionsPaging.loading) {
      fetchSessions(sessionsPaging.page + 1).catch(() => showToast('⚠️ Không tải thêm được cuộc trò chuyện'))
    }
  }

  const fetchSessions = async (page) => {
    setSessionsPaging((p) => ({ ...p, loading: true }))
    try {
      const list = await getAiSessions({ page, pageSize: SESSION_PAGE_SIZE })
      setSessionsList((prev) => (page === 1 ? list : [...prev, ...list.filter((s) => !prev.some((p) => p.id === s.id))]))
      setSessionsPaging({ page, hasMore: list.length >= SESSION_PAGE_SIZE, loading: false })
      return list
    } catch (e) {
      setSessionsPaging((p) => ({ ...p, loading: false }))
      throw e
    }
  }

  // Tải trang đầu danh sách phiên và khôi phục phiên đang dùng
  useEffect(() => {
    let isMounted = true
    async function loadSessions() {
      try {
        await fetchSessions(1)
        // Phiên đang dùng có thể nằm ở trang sau: vẫn mở, BE báo AI_SESSION_NOT_FOUND thì tự bỏ
        const storedId = getStoredAiSessionId()
        if (isMounted && storedId) handleSelectSession(storedId)
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
      const mapped = await history.loadLatest(sessionId)
      if (!mapped) return // người dùng đã chuyển sang phiên khác
      if (mapped.length > 0) {
        setMessages(mapped)
      } else {
        setMessages([buildWelcomeMessage(userLocation)])
      }
    } catch (e) {
      console.warn('Lỗi lấy tin nhắn session:', e)
      if (describeAiError(e).sessionGone) {
        // Phiên đã bị xóa / không còn: bỏ khỏi danh sách, mở phiên mới
        setSessionsList((prev) => prev.filter((s) => s.id !== sessionId))
        setCurrentSessionId(null)
        history.resetHistory()
        setMessages([buildWelcomeMessage(userLocation)])
        showToast('⚠️ Cuộc trò chuyện này không còn, đã mở cuộc trò chuyện mới')
      } else {
        showToast('⚠️ Không thể tải lịch sử phiên này')
      }
    } finally {
      setIsLoadingSession(false)
    }
  }

  // Tạo phiên hội thoại mới: POST /api/v1/ai/sessions
  const handleCreateNewSession = async () => {
    try {
      const { session: newSession, reused } = await createAiSession()
      if (newSession?.id) {
        // BE trả lại phiên trống đang có (200) thì chỉ chuyển sang, không thêm dòng mới
        if (!reused) setSessionsList((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)])
        setCurrentSessionId(newSession.id)
      }
      history.resetHistory(newSession?.id || null)
      setMessages([buildWelcomeMessage(userLocation)])
      showToast(reused ? '✨ Đã chuyển sang cuộc trò chuyện trống đang có' : '✨ Đã tạo phiên hội thoại mới với AI Concierge')
    } catch (e) {
      console.warn('Lỗi tạo session:', e)
      setCurrentSessionId(null)
      history.resetHistory()
      setMessages([buildWelcomeMessage(userLocation)])
    }
  }

  // Xóa phiên hội thoại: DELETE /api/v1/ai/sessions/{id}
  const handleDeleteSession = async (sessionId) => {
    const idToDelete = sessionId || currentSessionId
    if (!idToDelete) return
    if (!(await confirmDialog('Xóa cuộc trò chuyện này? Toàn bộ tin nhắn trong cuộc trò chuyện sẽ mất.', { confirmLabel: 'Xóa' }))) return
    try {
      await deleteAiSession(idToDelete)
      setSessionsList((prev) => prev.filter((s) => s.id !== idToDelete))
      if (currentSessionId === idToDelete) {
        setCurrentSessionId(null)
        history.resetHistory()
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
    if (!text || isTyping || cooldown > 0 || aiPaused || text.length > AI_MESSAGE_MAX) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    const nowStr = vnClock(new Date())
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
          history.resetHistory(aiResult.sessionId)
          fetchSessions(1).catch(() => {})
        }
      }

      const botReply = aiResult?.reply?.message || aiResult?.message || 'Mình chưa hiểu ý bạn, bạn nói rõ hơn giúp mình nhé.'
      const botMsg = {
        id: uid('bot'),
        sender: 'bot',
        time: vnClock(new Date()),
        text: botReply,
        facilities: aiResult?.reply?.facilities || [],
        lfgCards: aiResult?.reply?.lfgCards || [],
        tournaments: aiResult?.reply?.tournaments || [],
        intent: aiResult?.reply?.intent,
        messageId: aiResult?.reply?.id,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.warn('[AIChatBooking] Trợ lý AI không phản hồi:', err)
      const info = describeAiError(err)
      if (info.sessionGone) {
        const goneId = currentSessionId
        setSessionsList((prev) => prev.filter((s) => s.id !== goneId))
        setCurrentSessionId(null)
        history.resetHistory()
      }
      if (info.paused) setAiPaused(true)
      if (info.retryAfter > 0) {
        setCooldown(info.retryAfter)
        setCooldownText(info.code === 'AI_OVERLOADED' ? 'Trợ lý đang quá tải.' : '')
      }
      if (info.unsaved || info.sessionGone) {
        // BE không lưu câu hỏi: giữ bong bóng kèm nút "Gửi lại" (phiên mất thì gửi lại sẽ mở phiên mới)
        setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? { ...m, failed: info.message } : m)))
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: uid('bot'),
            sender: 'bot',
            time: vnClock(new Date()),
            text: `⚠️ ${info.message}`,
          },
        ])
      }
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
      history.resetHistory()
      setInputValue('')
      showToast(`📍 Đã cập nhật vị trí: ${newLoc.name} (${newLoc.updatedAt})`)
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const closest = await describeArea(latitude, longitude)
          const nowStr = vnClock(new Date())
          applyNewLoc({
            lat: latitude,
            lng: longitude,
            name: closest.name,
            address: closest.address,
            updatedAt: nowStr,
          })
        },
        () => {
          const nowStr = vnClock(new Date())
          const p = getUserProfileContext()
          applyNewLoc({
            lat: p.lat ?? null,
            lng: p.lng ?? null,
            name: p.rawLocation || 'Chưa xác định vị trí',
            address: p.rawLocation || '',
            isGps: false,
            updatedAt: nowStr,
          })
          showToast('⚠️ Chưa lấy được GPS — vui lòng bật quyền vị trí hoặc nhập khu vực trong câu hỏi')
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
      )
    } else {
      const nowStr = vnClock(new Date())
      const p = getUserProfileContext()
      applyNewLoc({
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        name: p.rawLocation || 'Chưa xác định vị trí',
        address: p.rawLocation || '',
        isGps: false,
        updatedAt: nowStr,
      })
      showToast('⚠️ Trình duyệt không hỗ trợ định vị GPS')
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
        setInputValue(transcript.slice(0, AI_MESSAGE_MAX))
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

  // Gửi lại câu hỏi BE chưa lưu: bỏ bong bóng lỗi rồi gửi như câu mới
  const handleRetry = (msg) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    handleSendMessage(msg.text)
  }

  // Đặt 1 ca thật do AI gợi ý: sang trang thanh toán với đúng courtSlotId và ngày (giờ Việt Nam)
  const handleBookSlot = (facility, slot) => {
    navigate('/split-payment', { state: buildPaymentState(facility, slot) })
  }

  // Mở đúng kèo AI gợi ý (màn nhận suất theo lfgCardId)
  const handleOpenLfg = (c) => {
    navigate(c?.lfgCardId ? `/flash-claim?cardId=${encodeURIComponent(c.lfgCardId)}` : '/community')
  }

  const handleOpenTournament = (t) => {
    navigate(t?.tournamentId ? `/tournament?tournamentId=${encodeURIComponent(t.tournamentId)}` : '/tournament')
  }

  // Đặt ca / mở kèo xong từ gợi ý AI → sang vé QR hoặc kèo của tôi
  const handleAiDone = (kind) => {
    // Đơn chia tiền đang chờ góp hiện ở trang chủ (khối "Đơn chia tiền")
    navigate(kind === 'booking' ? '/qr-pass' : kind === 'split' ? '/dashboard' : '/community')
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setSessionsOpen((v) => !v)}
                disabled={isLoadingSession}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-800 bg-gray-100 border border-gray-300 hover:bg-gray-200 flex items-center gap-1 transition-all"
                title="Các cuộc trò chuyện trước"
                aria-expanded={sessionsOpen}
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                Lịch sử
              </button>
              {sessionsOpen && (
                <>
                  {/* Bấm ra ngoài để đóng */}
                  <div className="fixed inset-0 z-30" onClick={() => setSessionsOpen(false)} />
                  <div className="snx-ai-sessions" onScroll={handleSessionsScroll}>
                    {sessionsList.map((s) => (
                      <div key={s.id} className={`snx-ai-session-row ${s.id === currentSessionId ? 'is-active' : ''}`}>
                        <button
                          type="button"
                          className="snx-ai-session-main"
                          onClick={() => {
                            setSessionsOpen(false)
                            if (s.id !== currentSessionId) handleSelectSession(s.id)
                          }}
                        >
                          <span className="snx-ai-session-title">{s.title || 'Cuộc trò chuyện'}</span>
                          {s.lastMessage && <span className="snx-ai-session-last">{truncateText(s.lastMessage, 80)}</span>}
                          <span className="snx-ai-session-time">{relativeTimeVi(s.lastMessageAt || s.createdAt)}</span>
                        </button>
                        <button
                          type="button"
                          className="snx-ai-session-delete"
                          onClick={() => handleDeleteSession(s.id)}
                          title="Xóa cuộc trò chuyện này"
                          aria-label={`Xóa cuộc trò chuyện ${s.title || ''}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                    {sessionsPaging.loading && <div className="snx-ai-session-more">Đang tải…</div>}
                  </div>
                </>
              )}
            </div>
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
        onScroll={history.onScroll}
        className="flex-1 overflow-y-auto bg-gray-50/70 p-4 border-x border-emerald-900/10 flex flex-col gap-4"
      >
        {history.hasOlder && (
          <button type="button" className="snx-ai-older-btn" onClick={history.loadOlder} disabled={history.loadingOlder}>
            {history.loadingOlder ? 'Đang tải tin nhắn cũ…' : 'Xem tin nhắn cũ hơn'}
          </button>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`snx-ai-msg ${msg.sender === 'user' ? 'is-user' : 'is-bot'}`}>
            {msg.sender === 'bot' && (
              <div className="snx-ai-msg-avatar">🤖</div>
            )}

            <div className="snx-ai-msg-content max-w-2xl">
              <div className="snx-ai-bubble">{renderFormattedText(aiLeadText(msg))}</div>

              {msg.failed && (
                <div className="snx-ai-failed">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>error</span>
                  <span>{msg.failed}</span>
                  <button type="button" onClick={() => handleRetry(msg)} disabled={isTyping || cooldown > 0 || aiPaused}>
                    {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại'}
                  </button>
                </div>
              )}

              <AiSuggestions facilities={msg.facilities} lfgCards={msg.lfgCards} tournaments={msg.tournaments} messageId={msg.messageId} intent={msg.intent} onBookSlot={handleBookSlot} onOpenLfg={handleOpenLfg} onOpenTournament={handleOpenTournament} onDone={handleAiDone} onRefresh={history.refreshLatest} />

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

        {cooldown > 0 && !aiPaused && (
          <div className="snx-ai-cooldown">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hourglass_top</span>
            <span>{cooldownText} Vui lòng đợi {cooldown} giây rồi gửi tiếp.</span>
          </div>
        )}

        {aiPaused ? (
          <div className="snx-ai-cooldown">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>pause_circle</span>
            <span>Trợ lý AI tạm ngưng, bạn vui lòng quay lại sau.</span>
          </div>
        ) : (
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
            maxLength={AI_MESSAGE_MAX}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />
          {inputValue.length > AI_MESSAGE_MAX - 100 && (
            <span className="snx-ai-counter">{inputValue.length}/{AI_MESSAGE_MAX}</span>
          )}

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
            disabled={!inputValue.trim() || isTyping || cooldown > 0}
            title={cooldown > 0 ? `Vui lòng đợi ${cooldown} giây` : 'Gửi câu hỏi'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              send
            </span>
          </button>
        </form>
        )}
      </div>
    </div>
  )
}

export default AIChatBooking
