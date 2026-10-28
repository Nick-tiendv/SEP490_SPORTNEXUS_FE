// AIChatModal.jsx — Khung chat thông minh giữa Người chơi và Trợ lý AI SportNexus
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
  getAiSessionMessages,
  getStoredAiSessionId,
  mapAiHistoryToMessages,
  sendChatMessage,
  storeAiSessionId,
} from '../../../api/player/aiApi.js'
import { getFacilities } from '../../../api/player/facilityApi.js'
import { getCourtSlots } from '../../../api/player/bookingApi.js'
import './AIChatModal.css'

function AIChatModal({
  isOpen = false,
  onClose = () => {},
  currentCourtId = 'snx-q7',
  onSelectCourtSlot = null,
}) {
  const navigate = useNavigate()

    // Đồng bộ thông tin hồ sơ người chơi & vị trí từ hồ sơ hoặc GPS
  const profileContext = getUserProfileContext()
  const initialLoc = profileContext.districtCenter || DISTRICT_CENTERS.thuduc

  const [userProfile, setUserProfile] = useState(() => profileContext)
  const [userLocation, setUserLocation] = useState(() => ({
    ...initialLoc,
    updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }))

  const [messages, setMessages] = useState(() => [buildWelcomeMessage(initialLoc, profileContext)])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [isListening, setIsListening] = useState(false)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Tự động đồng bộ danh sách cơ sở & sân từ website vào AI khi mở modal
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    getFacilities()
      .then((facilities) => {
        if (isMounted && Array.isArray(facilities)) {
          syncFacilitiesWithAIChat(facilities)
        }
      })
      .catch((err) => console.warn('[AIChatModal] Không thể tải facilities từ API:', err))
    return () => { isMounted = false }
  }, [isOpen])

  // Lắng nghe cập nhật hồ sơ người dùng theo thời gian thực
  useEffect(() => {
    const handleProfileSync = () => {
      const p = getUserProfileContext()
      setUserProfile(p)
      if (p.districtCenter && !userLocation.isGps) {
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
  }, [userLocation.isGps])

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
          // Chỉ cập nhật lời chào, không xoá cuộc trò chuyện đang có
          setMessages((prev) =>
            prev.length === 1 && prev[0].sender !== 'user' ? [buildWelcomeMessage(newLoc)] : prev
          )
        },
        () => {
          // Giữ mặc định nếu không cấp quyền
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [isOpen])

  // Đồng bộ lịch sử từ server mỗi khi mở modal (phiên có thể đã thay đổi ở trang /ai-chat)
  useEffect(() => {
    if (!isOpen) return
    const storedId = getStoredAiSessionId()
    if (!storedId) return
    let cancelled = false
    getAiSessionMessages(storedId)
      .then((items) => {
        if (cancelled) return
        const mapped = mapAiHistoryToMessages(items)
        if (mapped.length > 0) setMessages(mapped)
      })
      .catch(() => {
        // Phiên không còn tồn tại → bắt đầu phiên mới ở lần gửi tiếp theo
        if (!cancelled) storeAiSessionId(null)
      })
    return () => {
      cancelled = true
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
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isTyping) return

    // Dừng nhận diện giọng nói nếu đang nghe
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
      console.info('[AIChatModal] Người chơi xác nhận chọn ca rõ ràng -> Kích hoạt phản hồi chốt ca dứt khoát.')
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
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 30)
      return
    }

    try {
      // Đọc phiên dùng chung ngay lúc gửi để luôn khớp với trang /ai-chat
      const currentSessionId = getStoredAiSessionId()
      const aiResult = await sendChatMessage({
        message: text,
        sessionId: currentSessionId || undefined,
        lat: userLocation.lat,
        lng: userLocation.lng,
      })

      if (aiResult?.sessionId && !currentSessionId) {
        storeAiSessionId(aiResult.sessionId)
      }

      const botReply = aiResult?.reply?.message || aiResult?.message || aiResult?.text || ''
      const lowerReply = botReply.toLowerCase()

      // Kiểm tra người dùng có đang hỏi đích danh địa chỉ hoặc sân cụ thể (VD: "36 trần duy hưng", "trần duy hưng", "sân lucky", "hà nội"...)
      const hasSpecificAddressOrCourt =
        lowerText.includes('trần duy hưng') ||
        lowerText.includes('36 trần duy hưng') ||
        lowerText.includes('hà nội') ||
        lowerText.includes('cầu giấy') ||
        lowerText.includes('lucky') ||
        lowerText.includes('võ văn ngân') ||
        lowerText.includes('quang trung') ||
        lowerText.includes('nguyễn huệ') ||
        lowerText.includes('phú mỹ hưng')

      // Phát hiện backend xác nhận chọn ca nhưng văn bản bị lặp lại hoặc thiếu Action Card
      const isBackendConfirmingSlot =
        lowerReply.includes('bạn đã chọn ca') ||
        lowerReply.includes('mình sẽ chuyển bạn đến trang đặt sân') ||
        lowerReply.includes('xác nhận và thanh toán') ||
        lowerReply.includes('đã chọn khung giờ')

      // Phát hiện trường hợp backend trả lời sai lệch hoặc lỗi rỗng không có sân
      const isBackendMismatch =
        isBackendConfirmingSlot ||
        lowerReply.includes('ở khu vực "sân') ||
        lowerReply.includes('ở khu vực "lucky') ||
        lowerReply.includes('hiện chưa có sân trống phù hợp ở khu vực') ||
        (!aiResult?.reply?.facilities?.length && hasSpecificAddressOrCourt)

      if (isBackendMismatch) {
        console.info('[AIChatModal] Kích hoạt Smart Engine cục bộ để trả lời đúng địa chỉ và cơ sở người dùng yêu cầu.')
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
      } else {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: botReply || 'Dưới đây là thông tin từ Trợ lý AI:',
          facilities: aiResult?.reply?.facilities || aiResult?.facilities,
          lfgCards: aiResult?.reply?.lfgCards || aiResult?.lfgCards,
          slots: aiResult?.reply?.slots,
        }
        setMessages((prev) => [...prev, botMsg])
      }
    } catch (err) {
      console.warn('[AIChatModal] Fallback to local AI engine:', err)
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
      console.warn('[AIChatModal] Không thể tải ca sân từ máy chủ:', err)
    }

    const slotLabel = `${targetSlot.start || '14:00'} - ${targetSlot.end || '16:00'}`
    const totalAmount = targetSlot.price || (court.price || 100000) * hours

    onClose()
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

  // Làm mới đoạn chat & Cập nhật vị trí mới của người chơi ở thời điểm hiện tại
  const handleResetChat = () => {
    showToast('📍 Đang định vị vị trí hiện tại của bạn...')

    const applyNewLoc = (newLoc) => {
      setUserLocation(newLoc)
      const welcome = buildWelcomeMessage(newLoc)
      setMessages([welcome])
      setInputValue('')
      // Làm mới = bắt đầu phiên mới, tránh tin nhắn sau rơi vào phiên cũ
      storeAiSessionId(null)
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
    } catch {
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
                              <span className="snx-ai-slot-price">
                                {formatVnd(msg.recommendedSlot.price)}
                              </span>
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
                            onClick={() => handleApplyCourt(msg.recommendedCourt, msg.recommendedSlot)}
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
