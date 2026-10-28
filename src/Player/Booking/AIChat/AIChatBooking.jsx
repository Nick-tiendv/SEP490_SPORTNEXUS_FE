// AIChatBooking.jsx — Giao diện Toàn trang Trợ lý AI SportNexus Concierge
import { useEffect, useRef, useState } from 'react'
import { uid } from '../../../utils/ids.js'
import { useNavigate } from 'react-router-dom'
import {
  DISTRICT_CENTERS,
  buildSlotsForCourt,
  buildWelcomeMessage,
  detectClosestDistrict,
  formatVnd,
  processAIChatQuery,
  getUserProfileContext,
  syncFacilitiesWithAIChat,
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
import { getFacilities } from '../../../api/player/facilityApi.js'
import { getCourtSlots } from '../../../api/player/bookingApi.js'
import './AIChatModal.css'

function AIChatBooking() {
  const navigate = useNavigate()

  // Vị trí người chơi thời gian thực
  const [userLocation, setUserLocation] = useState(() => ({
    ...DISTRICT_CENTERS.q7,
    updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }))

  const [userProfile, setUserProfile] = useState(() => getUserProfileContext())
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

  // Tự động đồng bộ danh sách cơ sở & sân từ website vào AI
  useEffect(() => {
    let isMounted = true
    getFacilities()
      .then((facilities) => {
        if (isMounted && Array.isArray(facilities)) {
          syncFacilitiesWithAIChat(facilities)
        }
      })
      .catch((err) => console.warn('[AIChatBooking] Không thể tải facilities từ API:', err))
    return () => { isMounted = false }
  }, [])

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

  const [activeCourtId, setActiveCourtId] = useState('snx-q7')
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

    const lowerText = text.toLowerCase()

    // PHẢN ỨNG NHANH 1: Người chơi muốn đi thẳng đến thanh toán / chia tiền
    if (
      lowerText.includes('thanh toán ngay') ||
      lowerText.includes('chuyển sang thanh toán') ||
      lowerText.includes('đặt & thanh toán ngay') ||
      lowerText.includes('đặt & chia tiền ngay')
    ) {
      const lastBookingMsg = [...messages].reverse().find((m) => m.recommendedCourt && m.recommendedSlot)
      if (lastBookingMsg) {
        showToast('🚀 Đang chuyển bạn đến trang thanh toán Split Payment...')
        handleBookNow(lastBookingMsg.recommendedCourt, lastBookingMsg.recommendedSlot)
        return
      }
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

    // PHẢN ỨNG NHANH 2: Người chơi đã chọn ca cụ thể (VD: "mình chọn ca 14h00-16h00 nhé", "chọn ca 14:00-16:00", "đặt ca 14h-16h sân lucky")
    const isDirectSlotSelection =
      lowerText.includes('chọn ca') ||
      lowerText.includes('mình chọn') ||
      lowerText.includes('tôi chọn') ||
      lowerText.includes('đặt ca') ||
      lowerText.includes('chốt ca') ||
      lowerText.includes('lấy ca') ||
      lowerText.includes('sân lucky') ||
      lowerText.includes('lucky') ||
      /\b\d{1,2}[h:]\d{0,2}\s*[-–đến]\s*\d{1,2}[h:]\d{0,2}\b/i.test(lowerText)

    if (isDirectSlotSelection) {
      console.info('[AIChatBooking] Người chơi xác nhận chọn ca rõ ràng -> Kích hoạt phản hồi chốt ca dứt khoát.')
      const response = processAIChatQuery(text, activeCourtId, userLocation, userProfile)
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
      setTimeout(() => inputRef.current?.focus(), 30)
      return
    }

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
      const lowerReply = botReply.toLowerCase()

      // Phát hiện backend xác nhận chọn ca nhưng văn bản bị lặp lại hoặc thiếu Action Card
      const isBackendConfirmingSlot =
        lowerReply.includes('bạn đã chọn ca') ||
        lowerReply.includes('mình sẽ chuyển bạn đến trang đặt sân') ||
        lowerReply.includes('xác nhận và thanh toán') ||
        lowerReply.includes('đã chọn khung giờ')

      if (isBackendConfirmingSlot) {
        const response = processAIChatQuery(text, activeCourtId, userLocation, userProfile)
        if (response.recommendedCourt?.id) {
          setActiveCourtId(response.recommendedCourt.id)
        }
        const botMsg = {
          id: uid('bot'),
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          ...response,
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        const botMsg = {
          id: uid('bot'),
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: botReply,
          facilities: aiResult?.reply?.facilities || aiResult?.facilities,
          lfgCards: aiResult?.reply?.lfgCards || aiResult?.lfgCards,
          slots: aiResult?.reply?.slots,
        }
        setMessages((prev) => [...prev, botMsg])
      }
    } catch (err) {
      console.warn('[AIChatBooking] API AI không phản hồi, dùng fallback local engine:', err)
      const response = processAIChatQuery(text, activeCourtId, userLocation, userProfile)
      if (response.recommendedCourt?.id) {
        setActiveCourtId(response.recommendedCourt.id)
      }
      const botMsg = {
        id: uid('bot'),
        sender: 'bot',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        ...response,
      }
      setMessages((prev) => [...prev, botMsg])
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

  const handleBookNow = async (court, slot) => {
    if (!court) return
    const targetSlot = slot || buildSlotsForCourt(court).find((s) => s.status === 'available') || {
      start: '14:00',
      end: '16:00',
      hours: 2,
      price: (court.price || 100000) * 2,
    }

    const isGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Xác định subCourt thực tế
    const targetSubCourt =
      (targetSlot?.subCourtId && court.subCourts?.find((sc) => sc.id === targetSlot.subCourtId)) ||
      (targetSlot?.subCourtName && court.subCourts?.find((sc) => sc.name.toLowerCase().includes(targetSlot.subCourtName.toLowerCase()))) ||
      (court.subCourt && court.subCourts?.find((sc) => court.subCourt.toLowerCase().includes(sc.name.toLowerCase()))) ||
      (court.subCourts && court.subCourts.find((sc) => sc.name.toLowerCase().includes('lucky'))) ||
      court.subCourts?.[0]
    const subCourtId = targetSubCourt?.id || targetSlot?.subCourtId || (isGuidRegex.test(court.id) ? court.id : '4e10deee-f580-43d9-96f6-8b1981e0f42c')
    const subCourtName = targetSubCourt?.name || targetSlot?.subCourtName || (court.subCourt ? court.subCourt.split(' (')[0] : 'Sân lucky')
    const bookingDateStr = '2026-10-28'
    const bookingDateLabel = '28/10/2026'

    let realSlotId = targetSlot.id && isGuidRegex.test(targetSlot.id) ? targetSlot.id : null
    let realSlotIds = []
    const hours = targetSlot.hours || 2
    const numberOfSlotsNeeded = Math.max(1, Math.round(hours))

    // Tự động truy vấn ca sân thực tế (GUID) từ Backend API
    try {
      const liveSlots = await getCourtSlots(subCourtId, bookingDateStr)
      if (Array.isArray(liveSlots) && liveSlots.length > 0) {
        const targetStart = targetSlot.start || '14:00'
        const matched =
          liveSlots.find((s) => s.startTime?.slice(11, 16) === targetStart && s.isBookable !== false) ||
          liveSlots.find((s) => s.isBookable !== false && !s.isPast)

        if (matched) {
          realSlotId = matched.id
          realSlotIds = [matched.id]
          if (numberOfSlotsNeeded >= 2) {
            const nextSlot = liveSlots.find((s) => s.startTime === matched.endTime && s.isBookable !== false)
            if (nextSlot) realSlotIds.push(nextSlot.id)
          }
        }
      }
    } catch (err) {
      console.warn('[AIChatBooking] Không thể tải ca sân từ máy chủ:', err)
    }

    const slotLabel = `${targetSlot.start || '14:00'} - ${targetSlot.end || '16:00'}`
    const totalAmount = targetSlot.price || (court.price || 100000) * hours

    navigate('/split-payment', {
      state: {
        facilityId: court.id,
        courtId: subCourtId,
        subCourtId: subCourtId,
        court: court.name,
        address: court.address,
        district: court.district,
        subCourt: subCourtName,
        subCourtDesc: court.subCourtDesc,
        image: court.image,
        sport: court.sport,
        slot: slotLabel,
        hours: hours,
        total: totalAmount,
        hourlyRate: Math.round(totalAmount / hours),
        courtSlotId: realSlotId,
        courtSlotIds: realSlotIds.length > 0 ? realSlotIds : (realSlotId ? [realSlotId] : []),
        numberOfSlots: realSlotIds.length > 0 ? realSlotIds.length : numberOfSlotsNeeded,
        isConsecutive: true,
        date: bookingDateStr,
        dateLabel: bookingDateLabel,
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

              {msg.recommendedCourt && (
                <div className="snx-ai-recom-card mt-2">
                  {msg.priorityBadge && (
                    <div className="snx-ai-recom-badge" title={msg.priorityBadge}>
                      {!/^[\p{Emoji}\u2600-\u27BF]/u.test(msg.priorityBadge) && (
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          hotel_class
                        </span>
                      )}
                      <span>{msg.priorityBadge}</span>
                    </div>
                  )}

                  <div className="snx-ai-recom-content-wrap">
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
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                            star
                          </span>
                          {msg.recommendedCourt.rating}
                        </span>
                      </div>
                    </div>

                    <div className="snx-ai-recom-body">
                      <div className="snx-ai-recom-loc-group">
                        <div className="snx-ai-recom-header-row">
                          <h4 className="snx-ai-recom-title" title={msg.recommendedCourt.name}>
                            {msg.recommendedCourt.name}
                          </h4>
                          <div className="snx-ai-recom-dist-row">
                            <span className="snx-ai-dist-badge">
                              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>
                                near_me
                              </span>
                              Cách {msg.recommendedCourt.distance} km
                            </span>
                            {msg.recommendedCourt.route?.eta && (
                              <span className="snx-ai-eta-text">• {msg.recommendedCourt.route.eta}</span>
                            )}
                          </div>
                        </div>

                        <div className="snx-ai-recom-addr" title={msg.recommendedCourt.address}>
                          <span className="material-symbols-outlined snx-ai-loc-icon">
                            location_on
                          </span>
                          <span className="snx-ai-addr-text">{msg.recommendedCourt.address}</span>
                        </div>
                      </div>

                      {msg.recommendedSlot && (
                        <div className="snx-ai-recom-slot">
                          <div className="snx-ai-slot-primary-row">
                            <span className="snx-ai-slot-time">
                              <span className="material-symbols-outlined">
                                schedule
                              </span>
                              <span className="snx-ai-slot-prefix">Khung giờ:</span>
                              <strong className="snx-ai-slot-range">
                                {msg.recommendedSlot.start}&nbsp;–&nbsp;{msg.recommendedSlot.end}
                              </strong>
                            </span>
                            <span className="snx-ai-slot-price">{formatVnd(msg.recommendedSlot.price)}</span>
                          </div>

                          {msg.recommendedSlot.note && (
                            <div className="snx-ai-slot-secondary-row">
                              <span className="snx-ai-slot-status-dot" />
                              <span className="snx-ai-slot-note-text">{msg.recommendedSlot.note}</span>
                              {msg.recommendedSlot.hours && (
                                <span className="snx-ai-slot-hours-text">
                                  • {msg.recommendedSlot.hours}h thi đấu
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {msg.priorityReason && (
                        <div className="snx-ai-recom-reason" title={msg.priorityReason}>
                          💡 <strong>Ưu tiên:</strong> {msg.priorityReason}
                        </div>
                      )}

                      <div className="snx-ai-recom-actions">
                        <button
                          type="button"
                          className="snx-ai-btn-action snx-ai-btn-select"
                          onClick={() => handleSelectCourtOnMap(msg.recommendedCourt, msg.recommendedSlot)}
                          title="Áp dụng chọn sân này ngay lập tức"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            check_circle
                          </span>
                          <span>Chọn Sân</span>
                        </button>

                        <button
                          type="button"
                          className={`snx-ai-btn-action snx-ai-btn-book ${
                            msg.priorityBadge?.includes('XÁC NHẬN') ? 'is-confirmed-action' : ''
                          }`}
                          onClick={() => handleBookNow(msg.recommendedCourt, msg.recommendedSlot)}
                          title="Xác nhận & chuyển sang thanh toán / chia tiền Split Payment ngay"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            {msg.priorityBadge?.includes('XÁC NHẬN') ? 'payments' : 'arrow_forward'}
                          </span>
                          <span>
                            {msg.priorityBadge?.includes('XÁC NHẬN') ? 'Thanh Toán Ngay' : 'Đặt & Chia Tiền'}
                          </span>
                        </button>
                      </div>
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
