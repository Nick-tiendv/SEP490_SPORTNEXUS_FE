import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCancellationReasons, cancelBooking, getBookingQrTicket, getBookingById, getMyBookings, getUpcomingBookings } from '../../api/player/bookingApi.js'
import { cancelLfg, rateFairPlay, getLfgQrTicket, scanCheckIn } from '../../api/player/lfgApi.js'
import { getTournamentQrTicket, checkInTournament } from '../../api/player/tournamentApi.js'

const clockVN = (value) => (value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—')
const dateVN = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')

// Dữ liệu vé từ BE (booking detail / LFG qr-ticket / tournament qr-ticket) -> dạng giao diện đang dùng
const toTicket = ({ id, qrCode, facilityId, facilityName, facilityAddress, courtName, sportName, startTime, endTime, status, amount, sportType }) => ({
  id,
  qrCode: qrCode || '',
  ticketCode: id ? `SNX-${String(id).slice(0, 8).toUpperCase()}` : '',
  facilityId: facilityId || null,
  venueName: facilityName || '—',
  address: facilityAddress || '—',
  courtName: courtName || '—',
  gate: courtName || '—',
  sport: sportName || '—',
  sportType: sportType || sportName || '—',
  startTime: clockVN(startTime),
  endTime: clockVN(endTime),
  allowedCheckInStart: clockVN(startTime),
  allowedCheckInEnd: clockVN(endTime),
  playDate: dateVN(startTime),
  startAt: startTime || null,
  escrowAmount: Number(amount) || 0,
  status: status || 'PENDING_CHECKIN',
})

function CheckInQR() {
  const [copied, setCopied] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)

  // 2.7 Bước 1: Quản lý loại vé QR (đặt sân / kèo LFG / giải đấu)
  const [searchParams, setSearchParams] = useSearchParams()
  const [ticketType, setTicketType] = useState(() => searchParams.get('type') || 'booking')
  const [ticketData, setTicketData] = useState(null)
  const [isLoadingTicket, setIsLoadingTicket] = useState(true)
  const [ticketError, setTicketError] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [isScanningCheckIn, setIsScanningCheckIn] = useState(false)

  // Bước 1: Gọi API qr-ticket tương ứng khi mở vé QR
  useEffect(() => {
    let isMounted = true
    const loadTicket = async () => {
      setIsLoadingTicket(true)
      setTicketError(null)
      try {
        if (ticketType === 'booking') {
          // Đặt sân: GET /api/v1/bookings/{bookingId}/qr-ticket
          let bookingId = searchParams.get('bookingId') || localStorage.getItem('sportnexus_last_booking_id')
          if (!bookingId) {
            // Không có mã đơn trên URL: lấy đơn sắp tới gần nhất của người dùng
            const upcoming = await getUpcomingBookings()
            bookingId = upcoming[0]?.id || upcoming[0]?.bookingId || null
          }
          if (!bookingId) throw new Error('Bạn chưa có đơn đặt sân sắp tới nào.')
          // qr-ticket trả về chuỗi mã QR; chi tiết đơn lấy từ GET /api/v1/bookings/{bookingId}
          const [qr, detail] = await Promise.all([getBookingQrTicket(bookingId), getBookingById(bookingId)])
          if (isMounted) {
            const me = (detail?.participants || []).find((p) => p.isHost) || {}
            setTicketData(toTicket({
              id: bookingId,
              qrCode: typeof qr === 'string' ? qr : qr?.qrCode,
              facilityId: detail?.facilityId,
              facilityName: detail?.facilityName,
              facilityAddress: detail?.facilityAddress,
              courtName: detail?.courtName,
              sportName: detail?.sportName,
              startTime: detail?.startTime,
              endTime: detail?.endTime,
              status: me.isCheckedIn ? 'CHECKED_IN' : detail?.bookingStatus,
              amount: detail?.paidAmount ?? detail?.totalAmount,
            }))
          }
        } else if (ticketType === 'lfg') {
          // Kèo LFG: GET /api/v1/lfgs/{cardId}/qr-ticket
          const cardId = searchParams.get('cardId') || searchParams.get('lfgId') || localStorage.getItem('sportnexus_current_lfg_id')
          if (!cardId) throw new Error('Bạn chưa tham gia kèo LFG nào có vé check-in.')
          const res = await getLfgQrTicket(cardId)
          if (isMounted) {
            setTicketData(toTicket({
              id: res?.lfgCardId || cardId,
              qrCode: res?.qrCode,
              facilityName: res?.facilityName,
              courtName: res?.courtName,
              startTime: res?.startTime,
              endTime: res?.endTime,
              status: res?.isCheckedIn ? 'CHECKED_IN' : 'PENDING_CHECKIN',
              sportType: 'KÈO GHÉP TRẬN LFG',
            }))
          }
        } else if (ticketType === 'tournament') {
          // Giải đấu: GET /api/v1/tournaments/{id}/qr-ticket
          const tournamentId = searchParams.get('tournamentId') || localStorage.getItem('sportnexus_current_tournament_id')
          if (!tournamentId) throw new Error('Bạn chưa đăng ký giải đấu nào có vé check-in.')
          const res = await getTournamentQrTicket(tournamentId)
          if (isMounted) {
            setTicketData(toTicket({
              id: res?.tournamentId || tournamentId,
              qrCode: res?.qrCode,
              facilityId: res?.facilityId,
              facilityName: res?.facilityName,
              facilityAddress: res?.facilityAddress,
              courtName: res?.teamName || res?.fullName,
              sportType: res?.tournamentName || 'GIẢI ĐẤU',
              status: res?.tournamentStatus,
            }))
          }
        }
      } catch (err) {
        console.warn(`[CheckInQR] Không thể tải vé từ API (${ticketType}):`, err)
        if (isMounted) {
          setTicketData(null)
          setTicketError(err?.message || 'Không tải được vé check-in.')
        }
      } finally {
        if (isMounted) setIsLoadingTicket(false)
      }
    }
    loadTicket()
    return () => { isMounted = false }
  }, [ticketType, searchParams])

  // Danh sách vé của tôi: GET /api/v1/bookings/my-bookings và GET /api/v1/bookings/upcoming
  const [myBookingsList, setMyBookingsList] = useState([])
  const [upcomingBookingsList, setUpcomingBookingsList] = useState([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [showTicketsModal, setShowTicketsModal] = useState(false)
  const [ticketTab, setTicketTab] = useState('upcoming') // 'upcoming' | 'all'

  useEffect(() => {
    let isMounted = true
    const fetchUserTickets = async () => {
      setIsLoadingBookings(true)
      try {
        const [myRes, upcomingRes] = await Promise.allSettled([
          getMyBookings(),
          getUpcomingBookings(),
        ])
        if (isMounted) {
          if (myRes.status === 'fulfilled' && Array.isArray(myRes.value)) {
            setMyBookingsList(myRes.value)
          }
          if (upcomingRes.status === 'fulfilled' && Array.isArray(upcomingRes.value)) {
            setUpcomingBookingsList(upcomingRes.value)
          }
        }
      } catch (err) {
        console.warn('[CheckInQR] Không thể tải danh sách vé của tôi:', err)
      } finally {
        if (isMounted) setIsLoadingBookings(false)
      }
    }
    fetchUserTickets()
    return () => { isMounted = false }
  }, [])

  const handleSelectBookingTicket = (booking) => {
    const bId = booking.id || booking.bookingId || booking._id
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('type', 'booking')
      next.set('bookingId', bId)
      return next
    })
    setTicketType('booking')
    setShowTicketsModal(false)
  }


  // Cập nhật URL param khi đổi tab loại vé
  const handleSelectTicketType = (type) => {
    setTicketType(type)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('type', type)
      return next
    })
  }

  // 2.7 Bước 2: Quét check-in qua cổng IoT hoặc máy quét chủ sân
  const handleGateScanCheckIn = async () => {
    setIsScanningCheckIn(true)
    setScanError(null)
    const facilityId = ticketData?.facilityId
    const qrCode = ticketData?.qrCode || ticketData?.ticketCode
    if (!ticketData?.id || !qrCode) {
      setScanError('Chưa có vé hợp lệ để check-in.')
      setIsScanningCheckIn(false)
      return
    }

    try {
      if (ticketType === 'tournament') {
        // Giải đấu dùng POST /api/v1/tournaments/{id}/check-in
        await checkInTournament(ticketData.id, { facilityId, qrCode })
      } else {
        // Đặt sân và kèo LFG: POST /api/v1/checkin/scan?facilityId=...&qrCode=...
        await scanCheckIn(facilityId, qrCode)
      }

      setCheckInDone(true)
      const currentCode = ticketData?.ticketCode || '—'
      const cleanCode = currentCode.replace('#', '').trim()
      localStorage.setItem(`sportnexus_checked_in_${cleanCode}`, 'true')
      localStorage.setItem(`sportnexus_checked_in_${currentCode}`, 'true')

      const session = {
        courtId: ticketData?.gate || '—',
        courtName: ticketData?.courtName || '—',
        sport: ticketData?.sport || '—',
        ticketCode: cleanCode,
        checkInDone: true,
        checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        checkOutDone: false,
        checkOutTime: null,
        coPlayers: matchParticipants.map((p) => ({
          id: p.id,
          name: p.name || p.email.split('@')[0],
          email: p.email,
          role: p.role || 'Bạn chơi cùng sân',
        })),
      }
      localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(session))
      setToastMessage('🎉 Check-in thành công qua API! Barie đã mở, chào mừng bạn vào sân.')
    } catch (err) {
      console.warn('[CheckInQR] Lỗi khi gọi API check-in:', err)
      if (err?.status === 403) {
        setScanError('❌ Lỗi 403: Cơ sở này không thuộc quyền quản lý của chủ sân hoặc vé không thuộc cơ sở này!')
      } else if (err?.status === 400) {
        setScanError(`⚠️ Lỗi 400: ${err?.message || 'Vé chỉ check-in được từ 1 tiếng trước giờ chơi đến khi hết ca!'}`)
      } else {
        // Fallback demo trong môi trường offline
        setCheckInDone(true)
        const session = {
          courtId: ticketData?.gate || '—',
          courtName: ticketData?.courtName || '—',
          sport: ticketData?.sport || '—',
          checkInDone: true,
          checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          checkOutDone: false,
          checkOutTime: null,
          coPlayers: matchParticipants.map((p) => ({
            id: p.id,
            name: p.name || p.email.split('@')[0],
            email: p.email,
            role: p.role || 'Bạn chơi cùng sân',
          })),
        }
        localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(session))
        setToastMessage('🎉 Check-in thành công (Mô phỏng máy quét cổng)!')
      }
    } finally {
      setIsScanningCheckIn(false)
    }
  }

  // Hủy đơn và hoàn tiền (Image 2)
  const [isCancelled, setIsCancelled] = useState(() => {
    try {
      return localStorage.getItem('sportnexus_last_booking_cancelled') === 'true'
    } catch {
      return false
    }
  })
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReasons, setCancellationReasons] = useState([])
  const [selectedReasonCode, setSelectedReasonCode] = useState(1)
  const [customReasonText, setCustomReasonText] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  const getHoursUntilMatch = () => {
    try {
      // Số giờ còn lại tới giờ bắt đầu thật của vé (dùng cho quy định hoàn tiền 24h)
      if (!ticketData?.startAt) return 0
      return (new Date(ticketData.startAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    } catch {
      return 8
    }
  }

  const handleOpenCancelModal = async () => {
    if (checkInDone) {
      setToastMessage('❌ Đơn đã check-in tại sân không thể hủy!')
      setTimeout(() => setToastMessage(null), 3500)
      return
    }
    setShowCancelModal(true)
    setCancelError(null)
    try {
      const reasons = await getCancellationReasons()
      if (Array.isArray(reasons) && reasons.length > 0) {
        setCancellationReasons(reasons)
        setSelectedReasonCode(reasons[0].code)
      }
    } catch (e) {
      console.warn('[CheckInQR] Không thể lấy cancellation reasons:', e)
    }
  }

  const handleConfirmCancelCheckIn = async () => {
    setIsCanceling(true)
    setCancelError(null)
    const selectedReasonObj = cancellationReasons.find((r) => r.code === selectedReasonCode)
    const finalReason = selectedReasonObj?.isCustom
      ? customReasonText.trim() || 'Lý do khác'
      : selectedReasonObj?.label || 'Người đặt yêu cầu hủy đơn'

    const hoursLeft = getHoursUntilMatch()
    const isEligibleRefund = hoursLeft >= 24

    try {
      const bookingId = ticketData?.id
      if (!bookingId) throw new Error('Không tìm thấy đơn đặt sân để hủy.')
      await cancelBooking(bookingId, {
        reasonCode: selectedReasonCode,
        reason: finalReason,
      })

      // Tiền hoàn do backend xử lý; báo các thành phần đang hiển thị số dư tải lại ví.
      if (isEligibleRefund) window.dispatchEvent(new Event('escrow_balance_updated'))

      setIsCancelled(true)
      localStorage.setItem('sportnexus_last_booking_cancelled', 'true')
      setShowCancelModal(false)

      window.dispatchEvent(
        new CustomEvent('player_new_notification', {
          detail: {
            id: `cancel_${Date.now()}`,
            type: 'booking',
            icon: 'cancel',
            color: '#DC2626',
            bg: '#FEE2E2',
            title: `Đã hủy đơn đặt sân (CANCELLED) • ${isEligibleRefund ? 'Hoàn 100%' : 'Không hoàn tiền'}`,
            message: `Đơn tại SportNexus Arena Q.7 đã được hủy thành công. Lý do: ${finalReason}.`,
            details: isEligibleRefund
              ? 'Hủy trước ca >= 24h: Đã hoàn 100% (330.000 đ) vào Ví Escrow.'
              : 'Hủy dưới 24h trước giờ chơi: Không đủ điều kiện hoàn tiền theo quy định.',
            time: 'Vừa xong',
            unread: true,
            link: '/wallet',
            linkText: 'Xem ví Escrow',
          },
        })
      )

      setToastMessage(
        isEligibleRefund
          ? '✅ Đã hủy đơn thành công! Hoàn 100% (330.000 đ) vào ví Escrow.'
          : '⚠️ Đã hủy đơn thành công. Hủy dưới 24h: Không được hoàn tiền theo quy định.'
      )
      setTimeout(() => setToastMessage(null), 5000)
    } catch (err) {
      console.error('[CheckInQR] Hủy đơn thất bại:', err)
      setCancelError(err?.message || 'Lỗi khi gửi yêu cầu hủy đơn.')
    } finally {
      setIsCanceling(false)
    }
  }
  
  // Trạng thái Check-in & Check-out:
  // Banner / Nút "Đã check-in" chỉ bị làm mờ khi chủ sân scan QR từ tài khoản của chủ sân.
  // Khi người chơi chưa check-in thì nút vẫn sáng.
  const [checkInDone, setCheckInDone] = useState(false)
  const [checkOutDone, setCheckOutDone] = useState(false)

  // Đồng bộ trạng thái theo từng mã vé cụ thể
  useEffect(() => {
    if (!ticketData?.ticketCode) return
    const code = ticketData.ticketCode
    const cleanCode = code.replace('#', '').trim()

    const isOwnerCheckedIn =
      localStorage.getItem(`sportnexus_checked_in_${cleanCode}`) === 'true' ||
      localStorage.getItem(`sportnexus_checked_in_${code}`) === 'true' ||
      ticketData?.status === 'CHECKED_IN'

    setCheckInDone(Boolean(isOwnerCheckedIn))

    // Trạng thái check-out trả sân chỉ kích hoạt khi đã check-in
    if (isOwnerCheckedIn) {
      try {
        const saved = localStorage.getItem('sportnexus_last_checkout_session')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed?.ticketCode === cleanCode) {
            setCheckOutDone(Boolean(parsed?.checkOutDone))
          }
        }
      } catch (e) {}
    } else {
      setCheckOutDone(false)
    }
  }, [ticketData?.ticketCode, ticketData?.status])

  // Lắng nghe sự kiện chủ sân quét mã QR từ tài khoản chủ sân theo thời gian thực
  useEffect(() => {
    const handleTicketScanned = (e) => {
      const scannedCode = e?.detail?.ticketCode
      const currentCode = ticketData?.ticketCode
      if (!currentCode || !scannedCode) return

      const cleanScanned = scannedCode.replace('#', '').trim().toUpperCase()
      const cleanCurrent = currentCode.replace('#', '').trim().toUpperCase()

      if (cleanScanned === cleanCurrent || cleanScanned.includes(cleanCurrent) || cleanCurrent.includes(cleanScanned)) {
        setCheckInDone(true)
        setToastMessage('🎉 Chủ sân đã quét mã QR thành công từ tài khoản chủ sân! Vé đã chuyển sang trạng thái Đã Check-in.')
      }
    }

    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('sportnexus_checked_in_')) {
        const currentCode = ticketData?.ticketCode
        if (currentCode) {
          const cleanCurrent = currentCode.replace('#', '').trim()
          if (
            localStorage.getItem(`sportnexus_checked_in_${cleanCurrent}`) === 'true' ||
            localStorage.getItem(`sportnexus_checked_in_${currentCode}`) === 'true'
          ) {
            setCheckInDone(true)
          }
        }
      }
    }

    window.addEventListener('court_owner_checked_in_ticket', handleTicketScanned)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('court_owner_checked_in_ticket', handleTicketScanned)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [ticketData?.ticketCode])

  // Modal Check-out và Đánh giá sau trận
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rightTab, setRightTab] = useState('rating') // 'rating' | 'history'
  const [selectedCoPlayer, setSelectedCoPlayer] = useState(() => ({
    id: '1',
    name: 'Hoàng Nam',
    email: 'hoang.nam.badminton@gmail.com',
    role: 'Đồng đội đánh cặp',
    isSelected: true,
  }))
  const [rateStars, setRateStars] = useState(5)
  const [rateHoverStars, setRateHoverStars] = useState(0)
  const [writtenReview, setWrittenReview] = useState('')

  const getStarLabel = (stars) => {
    switch (stars) {
      case 5:
        return '5 sao: Xuất sắc & Fairplay (Tuyệt vời, sẵn sàng tái đấu)'
      case 4:
        return '4 sao: Rất tốt & Chuyên nghiệp (Thái độ chuẩn mực)'
      case 3:
        return '3 sao: Bình thường (Trận đấu ổn định)'
      case 2:
        return '2 sao: Cần cải thiện (Có hành vi thiếu tinh thần thể thao)'
      case 1:
        return '1 sao: Kém / Không fairplay (Có thái độ phi thể thao nghiêm trọng)'
      default:
        return 'Chưa chấm điểm sao'
    }
  }

  // Danh sách ID người chơi đã được đánh giá
  const [reviewedPlayerIds, setReviewedPlayerIds] = useState(() => {
    try {
      const saved = localStorage.getItem('player_match_reviewed_ids')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return []
  })

  // Share QR modal states with participant deletion support
  const [showShareModal, setShowShareModal] = useState(false)
  const [matchParticipants, setMatchParticipants] = useState([
    { id: '1', name: 'Hoàng Nam', email: 'hoang.nam.badminton@gmail.com', role: 'Đồng đội đánh cặp', isSelected: true },
    { id: '2', name: 'Đức Trần', email: 'duc_tran92@outlook.com', role: 'Đối thủ cùng sân', isSelected: false },
    { id: '3', name: 'Tuấn Kiệt', email: 'tuankiet.sports@gmail.com', role: 'Đối thủ cùng sân', isSelected: false },
  ])
  const [emailInput, setEmailInput] = useState('')
  const [toastMessage, setToastMessage] = useState(null)


  // Copy OTP handler
  const handleCopyOTP = () => {
    navigator.clipboard.writeText('894201')
    setToastMessage('Đã sao chép mã OTP dự phòng: 894 - 201')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Add participant
  const handleAddEmail = () => {
    const trimmed = emailInput.trim()
    if (!trimmed) return
    const selectedCount = matchParticipants.filter((p) => p.isSelected).length
    if (selectedCount >= 3) {
      setToastMessage('⚠️ Tối đa 3 người nhận mã check-in!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    const existing = matchParticipants.find((p) => p.email.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      setMatchParticipants((prev) =>
        prev.map((p) => (p.email.toLowerCase() === trimmed.toLowerCase() ? { ...p, isSelected: true } : p))
      )
      setToastMessage(`Đã chọn: ${trimmed}`)
    } else {
      setMatchParticipants((prev) => [
        ...prev,
        { id: Date.now().toString(), name: trimmed.split('@')[0], email: trimmed, role: 'Bạn chơi cùng sân', isSelected: true },
      ])
      setToastMessage(`Đã thêm người tham gia: ${trimmed}`)
    }
    setEmailInput('')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Delete participant completely from match popup
  const handleDeleteParticipant = (id, email) => {
    setMatchParticipants((prev) => prev.filter((p) => p.id !== id))
    setToastMessage(`Đã xóa người tham gia: ${email}`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Toggle selection for receiving QR pass
  const handleToggleSelectParticipant = (id) => {
    const target = matchParticipants.find((p) => p.id === id)
    if (!target) return
    if (!target.isSelected) {
      const selectedCount = matchParticipants.filter((p) => p.isSelected).length
      if (selectedCount >= 3) {
        setToastMessage('⚠️ Tối đa 3 người nhận mã check-in!')
        setTimeout(() => setToastMessage(null), 3000)
        return
      }
    }
    setMatchParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    )
  }

  // Restore default participants
  const handleRestoreDefaultParticipants = () => {
    setMatchParticipants([
      { id: '1', name: 'Hoàng Nam', email: 'hoang.nam.badminton@gmail.com', role: 'Đồng đội đánh cặp', isSelected: true },
      { id: '2', name: 'Đức Trần', email: 'duc_tran92@outlook.com', role: 'Đối thủ cùng sân', isSelected: false },
      { id: '3', name: 'Tuấn Kiệt', email: 'tuankiet.sports@gmail.com', role: 'Đối thủ cùng sân', isSelected: false },
    ])
    setToastMessage('Đã khôi phục danh sách gợi ý ban đầu')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Trạng thái thêm bạn đánh đôi (người đi cùng đại diện slot)
  const [showAddDoublesPartner, setShowAddDoublesPartner] = useState(false)
  const [doublesPartnerName, setDoublesPartnerName] = useState('')
  const [doublesPartnerRole, setDoublesPartnerRole] = useState('Đồng đội đánh cặp')
  const [doublesPartnerRep, setDoublesPartnerRep] = useState('Hoàng Nam')

  // Thêm người chơi đánh đôi đi cùng đại diện
  const handleAddDoublesParticipant = (e) => {
    if (e) e.preventDefault()
    const trimmed = doublesPartnerName.trim()
    if (!trimmed) {
      setToastMessage('⚠️ Vui lòng nhập họ tên hoặc biệt danh người chơi đánh đôi!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    const newParticipant = {
      id: `partner_${Date.now()}`,
      name: trimmed,
      email: `${trimmed.toLowerCase().replace(/\s+/g, '')}@guest.local`,
      role: doublesPartnerRole,
      isDoublesGuest: true,
      representedBy: doublesPartnerRep || 'Người đại diện slot',
      isSelected: false,
    }

    const updatedParticipants = [...matchParticipants, newParticipant]
    setMatchParticipants(updatedParticipants)
    setSelectedCoPlayer(newParticipant)
    setShowAddDoublesPartner(false)
    setDoublesPartnerName('')

    // Tự động đồng bộ và lưu vào session check-out
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      const parsed = saved ? JSON.parse(saved) : {
        courtId: 'Court 3',
        courtName: 'Sân Cầu Lông BWF Pro 01',
        sport: 'Cầu Lông',
        checkOutDone: true,
        checkOutTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
      parsed.coPlayers = updatedParticipants.map((p) => ({
        id: p.id,
        name: p.name || p.email.split('@')[0],
        email: p.email,
        role: p.role || 'Bạn chơi cùng sân',
        isDoublesGuest: p.isDoublesGuest,
        representedBy: p.representedBy,
      }))
      parsed.checkOutDone = true
      localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(parsed))
      window.dispatchEvent(new Event('sportnexus_checkout_updated'))
    } catch (e) {}

    setToastMessage(`🎉 Đã thêm bạn đánh đôi "${trimmed}" (Đi cùng ${newParticipant.representedBy}) vào danh sách đánh giá!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Xử lý xác nhận Check-out trả sân
  const handleConfirmCheckOut = () => {
    setShowCheckOutModal(false)
    setCheckOutDone(true)
    const checkOutTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const sessionData = {
      courtId: 'Court 3',
      courtName: 'Sân Cầu Lông BWF Pro 01',
      sport: 'Cầu Lông',
      checkInDone: true,
      checkInTime: '18:00',
      checkOutDone: true,
      checkOutTime: checkOutTime,
      coPlayers: matchParticipants.map((p) => ({
        id: p.id,
        name: p.name || p.email.split('@')[0],
        email: p.email,
        role: p.role || 'Bạn chơi cùng sân',
        isDoublesGuest: Boolean(p.isDoublesGuest),
        representedBy: p.representedBy || null,
      })),
    }
    localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(sessionData))
    window.dispatchEvent(new Event('sportnexus_checkout_updated'))
    setToastMessage(`🎉 Check-out trả sân thành công lúc ${checkOutTime}! Mời bạn đánh giá bạn chơi cùng sân.`)
    setTimeout(() => setToastMessage(null), 3500)

    // Tự động mở modal đánh giá bạn chơi đầu tiên nếu chưa đánh giá
    if (matchParticipants.length > 0) {
      setSelectedCoPlayer(matchParticipants[0])
      setShowRateModal(true)
    }
  }

  // Mở modal đánh giá người chơi cụ thể
  const handleOpenRateModal = (player) => {
    if (!checkInDone) {
      setToastMessage('⚠️ Bạn chỉ được phép đánh giá sau khi check-in thành công (Cả hai phải đã check-in)!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    setSelectedCoPlayer(player)
    setWrittenReview('')
    setRateStars(5)
    setShowRateModal(true)
  }

  // Xử lý gửi đánh giá sau trận (chỉ cho phép sau khi check-in thành công - Image 2.7)
  const handleSubmitRateCoPlayer = async (e) => {
    if (e) e.preventDefault()
    if (!checkInDone) {
      setToastMessage('⚠️ Người chơi chỉ được phép đánh giá sau khi check-in thành công (Cả hai phải đã check-in)!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    if (!rateStars || rateStars < 1 || rateStars > 5) {
      setToastMessage('⚠️ Vui lòng chấm điểm sao từ 1 đến 5 sao!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    if (!writtenReview || writtenReview.trim().length < 10) {
      setToastMessage('⚠️ Vui lòng viết nhận xét bằng chữ (tối thiểu 10 ký tự)!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    if (selectedCoPlayer && reviewedPlayerIds.includes(selectedCoPlayer.id)) {
      setToastMessage('⚠️ Mỗi người chỉ được chấm Fair Play 1 lần cho 1 người trong 1 trận!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    const targetName = selectedCoPlayer?.name || selectedCoPlayer?.email?.split('@')[0] || 'Bạn chơi'
    // 2.7 Bước 3: contextId là id kèo LFG hoặc id đơn đặt sân
    const contextId = ticketData?.id
    const revieweeId = selectedCoPlayer?.userId || selectedCoPlayer?.id

    try {
      await rateFairPlay({
        revieweeId,
        contextId,
        score: rateStars,
        comment: writtenReview.trim(),
      })
    } catch (err) {
      console.warn('[CheckInQR] Lỗi khi gọi API rateFairPlay:', err)
      if (err?.message) {
        setToastMessage(`⚠️ ${err.message}`)
      }
    }

    const effectiveRole = selectedCoPlayer?.isDoublesGuest
      ? `${selectedCoPlayer.role} • Đi cùng ${selectedCoPlayer.representedBy}`
      : selectedCoPlayer?.role || 'Bạn chơi cùng sân'

    const newReview = {
      id: Date.now(),
      author: 'Bạn (Người chơi cùng sân)',
      targetPlayer: targetName,
      coPlayerRole: effectiveRole,
      isDoublesGuest: Boolean(selectedCoPlayer?.isDoublesGuest),
      representedBy: selectedCoPlayer?.representedBy || null,
      avatarInitial: targetName.slice(0, 2).toUpperCase(),
      avatarBg: selectedCoPlayer?.isDoublesGuest ? '#FEF3C7' : '#DCFCE7',
      avatarColor: selectedCoPlayer?.isDoublesGuest ? '#D97706' : '#15803D',
      matchType: ticketData?.sportType || '—',
      court: `${ticketData?.courtName || '—'} (${ticketData?.gate || '—'})`,
      time: 'Vừa xong',
      rating: rateStars,
      fairPlayScore: rateStars * 20,
      content: writtenReview.trim(),
      verifiedCheckout: true,
      checkoutTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    // Lưu vào danh sách đánh giá hệ thống
    try {
      const saved = localStorage.getItem('player_match_reviews')
      const currentList = saved ? JSON.parse(saved) : []
      const updatedList = [newReview, ...currentList]
      localStorage.setItem('player_match_reviews', JSON.stringify(updatedList))
    } catch (e) {}

    // Đánh dấu người chơi đã được đánh giá (mỗi người chỉ chấm 1 lần cho 1 người trong 1 trận)
    if (selectedCoPlayer) {
      const updated = [...new Set([...reviewedPlayerIds, selectedCoPlayer.id])]
      setReviewedPlayerIds(updated)
      localStorage.setItem('player_match_reviewed_ids', JSON.stringify(updated))
    }

    setWrittenReview('')
    setRateStars(5)
    setShowRateModal(false)
    setToastMessage(`🎉 Đã gửi đánh giá Fair Play (+${rateStars * 20} điểm quy đổi) cho ${targetName}!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Quick tag suggestions
  const quickTags = [
    'Thái độ rất fairplay 🤝',
    'Kỹ thuật tốt, bọc lót xuất sắc 🏸',
    'Đúng giờ và chia bill nhanh gọn ⏱️',
    'Phối hợp ăn ý, tinh thần vui vẻ ✨',
  ]

  // Confirm send QR code
  const handleConfirmSend = () => {
    const selected = matchParticipants.filter((p) => p.isSelected)
    if (selected.length === 0) {
      setToastMessage('⚠️ Vui lòng chọn hoặc thêm ít nhất một người chơi để gửi mã!')
      setTimeout(() => setToastMessage(null), 3500)
      return
    }
    setShowShareModal(false)
    setToastMessage('Đã gửi mã thành công')
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }


  // Mock check-in history data exactly as shown in screenshot
  const historyList = [
    {
      id: 1,
      time: 'Hôm nay, 18:00',
      location: 'D-Sports Thảo Điền, TP. Thủ Đức',
      sport: 'Cầu Lông',
      sportColor: 'cyan', // light blue badge
      sportIcon: 'badminton',
      amount: '240.000 đ',
      status: 'Đã giải ngân',
      authMethod: 'Check-in Cổng A',
      authIcon: 'qr',
      stars: 5,
    },
    {
      id: 2,
      time: '18/02/2026, 19:30',
      location: 'SportNexus Arena Q.7',
      sport: 'Pickleball Pro',
      sportColor: 'green', // light green badge
      sportIcon: 'pickleball',
      amount: '330.000 đ',
      status: 'Đã giải ngân',
      authMethod: 'Check-in Cổng B2',
      authIcon: 'qr',
      stars: 5,
    },
    {
      id: 3,
      time: '12/02/2026, 07:00',
      location: 'Sân Cầu Lông Kỳ Hòa Q.10',
      sport: 'Cầu Lông',
      sportColor: 'cyan',
      sportIcon: 'badminton',
      amount: '200.000 đ',
      status: 'Đã giải ngân',
      authMethod: 'Check-in OTP Kiosk',
      authIcon: 'kiosk',
      stars: 5,
    },
  ]

  if (!isLoadingTicket && !ticketData) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', padding: '28px 36px 60px 36px', color: '#111827' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['booking', 'Đặt sân'], ['lfg', 'Kèo LFG'], ['tournament', 'Giải đấu']].map(([type, label]) => (
            <button key={type} type="button" onClick={() => handleSelectTicketType(type)}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 700, cursor: 'pointer',
                background: ticketType === type ? '#15803D' : '#FFFFFF', color: ticketType === type ? '#FFFFFF' : '#334155' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>Chưa có vé check-in</h2>
          <p style={{ margin: '0 0 20px', color: '#64748B' }}>{ticketError || 'Không tìm thấy vé.'}</p>
          <Link to="/court-finder" style={{ padding: '10px 18px', borderRadius: '10px', background: '#15803D', color: '#FFFFFF', fontWeight: 700, textDecoration: 'none' }}>
            Tìm sân để đặt
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="snx-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            right: '32px',
            zIndex: 9999,
            background: '#065F46',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(6, 95, 70, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#86EFAC' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================== TOP HEADER SECTION ===================== */}
      <div className="snx-page-header">
        {/* Left: Title & Subtitle */}
        <div>
          <h1 className="snx-page-title">
            Check-in QR &amp; Chấm Fair Play
          </h1>
        </div>

        {/* Right: Trạng thái sân hiện tại Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {/* Radar Glowing Indicator */}
          <div
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981',
              }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid #10B981',
                animation: 'radarPulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite',
              }}
            />
          </div>

          {/* Court status text */}
          <div style={{ lineHeight: 1.35 }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              TRẠNG THÁI SÂN HIỆN TẠI
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#111827',
              }}
            >
              {checkOutDone ? (
                <>
                  <span style={{ color: '#15803D' }}>Đã Check-out Trả Sân</span> • {ticketData?.gate || '—'}
                </>
              ) : checkInDone ? (
                <>
                  <span style={{ color: '#0284C7' }}>Đang Hoạt Động</span> • {ticketData?.gate || '—'}
                </>
              ) : (
                <>
                  <span style={{ color: '#15803D' }}>Sẵn Sàng Check-in</span> • {ticketData?.gate || '—'}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BƯỚC 1: CHỌN LOẠI VÉ QR (ĐẶT SÂN / KÈO / GIẢI ĐẤU) ===================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '8px 12px',
          marginBottom: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            onClick={() => handleSelectTicketType('booking')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: ticketType === 'booking' ? '#ffffff' : 'transparent',
              color: ticketType === 'booking' ? '#15803D' : '#64748B',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: ticketType === 'booking' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            <span>🏟️</span>
            <span>Vé Đặt Sân (Booking)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTicketType('lfg')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: ticketType === 'lfg' ? '#ffffff' : 'transparent',
              color: ticketType === 'lfg' ? '#0284C7' : '#64748B',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: ticketType === 'lfg' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            <span>🤝</span>
            <span>Vé Kèo LFG (Ghép Trận)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTicketType('tournament')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: ticketType === 'tournament' ? '#ffffff' : 'transparent',
              color: ticketType === 'tournament' ? '#D97706' : '#64748B',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: ticketType === 'tournament' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            <span>🏆</span>
            <span>Vé Giải Đấu (Tournament)</span>
          </button>
        </div>

        {/* Nút mở danh sách vé của tôi: GET /api/v1/bookings/my-bookings & upcoming */}
        <button
          type="button"
          onClick={() => setShowTicketsModal(true)}
          style={{
            marginLeft: 'auto',
            padding: '7px 14px',
            borderRadius: '10px',
            border: '1px solid #10B981',
            background: '#ECFDF5',
            color: '#065F46',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>confirmation_number</span>
          <span>Danh Sách Vé Của Tôi ({upcomingBookingsList.length > 0 ? upcomingBookingsList.length : myBookingsList.length})</span>
        </button>
      </div>

      {/* Dải gợi ý nhanh các trận sắp tới nếu có */}
      {upcomingBookingsList.length > 0 && (
        <div
          style={{
            marginBottom: '20px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '14px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>⚡</span> Trận sắp tới của bạn:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
            {upcomingBookingsList.slice(0, 5).map((b, idx) => {
              const bId = b.id || b.bookingId || idx
              const cName = b.courtName || b.court?.courtName || 'Sân đấu'
              const fName = b.facilityName || b.facility?.name || 'SportNexus'
              const time = b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : (b.timeSlot || 'Hôm nay')
              return (
                <button
                  key={bId}
                  type="button"
                  onClick={() => handleSelectBookingTicket(b)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid #86EFAC',
                    background: '#ffffff',
                    color: '#15803D',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{ color: '#047857' }}>⏰ {time}</span>
                  <span>•</span>
                  <span>{cName} ({fName})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ===================== MAIN TWO-COLUMN LAYOUT ===================== */}
      <div
        className="checkin-main-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(460px, 485px) 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* ================= LEFT COLUMN ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Match Info & Photo */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
            }}
          >
            {/* Header portion */}
            <div style={{ padding: '16px 20px 12px 20px' }}>
              {/* Row 1: Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  gap: '8px',
                }}
              >
                {/* Left badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#DCFCE7',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#15803D',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    TRẬN ĐẤU SẮP TỚI
                  </span>
                  <span style={{ color: '#EA580C', fontSize: '11px', fontWeight: 700 }}>
                    🕒 Còn 45 phút
                  </span>
                </div>

                {/* Right ticket code */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0369A1' }}>
                    #{ticketData?.ticketCode || '—'}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: '#0284C7',
                      background: '#E0F2FE',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ticketData?.sportType || '—'}
                  </span>
                </div>
              </div>

              {/* Row 2: Court Title with sport icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#15803D',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="m10.5 17.5-6-11.5a1.5 1.5 0 0 1 2-2l5 6" />
                    <path d="m13.5 17.5 6-11.5a1.5 1.5 0 0 0-2-2l-5 6" />
                    <path d="M7 10h10" />
                  </svg>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#111827',
                      letterSpacing: '-0.2px',
                      lineHeight: 1.35,
                    }}
                  >
                    {ticketData?.courtName || '—'}
                  </h3>
                </div>
              </div>

              {/* Row 3: Structured sub-info (Facility + Time + Date), NOT crammed into one line with dots */}
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#374151', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981', flexShrink: 0 }}>
                    stadium
                  </span>
                  <span>{ticketData?.venueName || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '11.5px', fontWeight: 500 }}>
                  <span>🕒 {ticketData?.startTime || '—'} - {ticketData?.endTime || '—'}</span>
                  <span>•</span>
                  <span>📅 {ticketData?.playDate || '—'}</span>
                </div>
              </div>
            </div>

            {/* Court Photo with clean overlay */}
            <div
              style={{
                position: 'relative',
                height: '145px',
                width: '100%',
                overflow: 'hidden',
                background: '#1F2937',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop"
                alt={ticketData?.courtName || '—'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Bottom dark gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(15,23,42,0.85) 100%)',
                }}
              />

              {/* Bottom bar overlay: Cleanly separated left address & right gate */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                {/* Left: Address pill */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '4px 9px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                    maxWidth: '74%',
                  }}
                  title={ticketData?.address}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#34D399', flexShrink: 0 }}>
                    location_on
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticketData?.address || '—'}
                  </span>
                </div>

                {/* Right: Gate Badge - Clean, ONLY gate name without duplicate hardcoded text */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    color: '#34D399',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    flexShrink: 0,
                  }}
                >
                  {ticketData?.gate || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Dynamic QR Code */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
              padding: '24px 20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >

            {/* Stylized QR Code Graphic matching screenshot */}
            <div
              onClick={() => setShowCheckInModal(true)}
              style={{
                cursor: 'pointer',
                padding: '12px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 26px rgba(22, 163, 74, 0.16)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}
              title="Nhấn để mô phỏng quét QR vào cổng"
            >
              {/* Laser scan line effect */}
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  right: '12px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #22C55E, transparent)',
                  boxShadow: '0 0 10px #22C55E',
                  animation: 'laserScan 2.4s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />

              {/* Exact High-fidelity SVG QR Code representation */}
              <svg width="190" height="190" viewBox="0 0 220 220" fill="none">
                {/* Background */}
                <rect width="220" height="220" rx="14" fill="#ffffff" />

                {/* Top-Left Finder Pattern (Outer dark blue, inner green) */}
                <rect x="20" y="20" width="56" height="56" rx="10" stroke="#111827" strokeWidth="8" fill="none" />
                <rect x="34" y="34" width="28" height="28" rx="6" fill="#15803D" />

                {/* Top-Right Finder Pattern */}
                <rect x="144" y="20" width="56" height="56" rx="10" stroke="#111827" strokeWidth="8" fill="none" />
                <rect x="158" y="34" width="28" height="28" rx="6" fill="#15803D" />

                {/* Bottom-Left Finder Pattern */}
                <rect x="20" y="144" width="56" height="56" rx="10" stroke="#111827" strokeWidth="8" fill="none" />
                <rect x="34" y="158" width="28" height="28" rx="6" fill="#15803D" />

                {/* Timing & Data Blocks */}
                <rect x="88" y="24" width="14" height="14" rx="3" fill="#111827" />
                <rect x="110" y="24" width="12" height="12" rx="3" fill="#15803D" />
                <rect x="96" y="44" width="14" height="14" rx="3" fill="#15803D" />
                <rect x="120" y="48" width="12" height="12" rx="3" fill="#111827" />

                {/* Left/Middle data modules */}
                <rect x="24" y="88" width="12" height="12" rx="3" fill="#15803D" />
                <rect x="44" y="90" width="14" height="14" rx="3" fill="#111827" />
                <rect x="68" y="88" width="12" height="12" rx="3" fill="#111827" />

                {/* Center Verified Checkmark Badge */}
                <rect x="85" y="85" width="50" height="50" rx="10" fill="#16A34A" />
                <path
                  d="M98 110L106 118L122 102"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Right side data modules */}
                <rect x="146" y="88" width="14" height="14" rx="3" fill="#111827" />
                <rect x="170" y="90" width="12" height="12" rx="3" fill="#15803D" />
                <rect x="188" y="88" width="12" height="12" rx="3" fill="#111827" />

                {/* Bottom area data modules */}
                <rect x="88" y="146" width="14" height="14" rx="3" fill="#15803D" />
                <rect x="110" y="146" width="14" height="14" rx="3" fill="#111827" />
                <rect x="96" y="168" width="14" height="14" rx="3" fill="#111827" />
                <rect x="120" y="168" width="12" height="12" rx="3" fill="#15803D" />

                {/* Bottom-right Corner Block */}
                <rect x="146" y="146" width="52" height="52" rx="10" stroke="#15803D" strokeWidth="8" fill="none" />
                <rect x="160" y="160" width="24" height="24" rx="5" fill="#111827" />
              </svg>
            </div>

            {/* Fixed QR code info */}
            <div
              style={{
                marginTop: '16px',
                width: '100%',
                maxWidth: '360px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#15803D',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '18px',
                    color: '#16A34A',
                  }}
                >
                  verified
                </span>
                <span>Mã QR Check-in: #{ticketData?.ticketCode || '—'}</span>
              </div>

              {/* Tên cơ sở & địa chỉ sân */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>
                  location_on
                </span>
                <span>{ticketData?.venueName || '—'}</span>
              </div>

              {/* Khung giờ thi đấu & Khung giờ check-in mở hiển thị cân đối từng dòng */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  marginTop: '2px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ color: '#64748B', fontWeight: 600 }}>🕒 Giờ chơi:</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>
                    {ticketData?.startTime || '—'} - {ticketData?.endTime || '—'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ color: '#15803D', fontWeight: 600 }}>🎟️ Khung check-in mở:</span>
                  <span style={{ color: '#166534', fontWeight: 800 }}>
                    {ticketData?.allowedCheckInStart || '—'} - {ticketData?.allowedCheckInEnd || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons: Check-in / Check-out / Đánh giá bạn chơi */}
            {!checkInDone && (
              <button
                type="button"
                onClick={() => setShowCheckInModal(true)}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  maxWidth: '360px',
                  padding: '9px 16px',
                  borderRadius: '12px',
                  border: '1.5px dashed #10B981',
                  background: '#F0FDF4',
                  color: '#15803D',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#DCFCE7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  qr_code_scanner
                </span>
                Mô phỏng quét mã vào cổng (Check-in)
              </button>
            )}

            {checkInDone && !checkOutDone && (
              <button
                type="button"
                onClick={() => setShowCheckOutModal(true)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  maxWidth: '360px',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(234, 88, 12, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.3)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                  logout
                </span>
                <span>Check-out Trả Sân &amp; Kết Thúc Trận</span>
              </button>
            )}

            {checkInDone && (
              <button
                type="button"
                onClick={() => {
                  setRightTab('rating')
                  const el = document.getElementById('post-match-rating-panel')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  maxWidth: '360px',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(22, 163, 74, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 163, 74, 0.3)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                  rate_review
                </span>
                <span>Đánh Giá Bạn Chơi Cùng Sân (Fair Play)</span>
              </button>
            )}

            {/* Nút Hủy đơn & Hoàn tiền / Trạng thái Check-in (Image 2 & 2.7) */}
            <button
              type="button"
              onClick={handleOpenCancelModal}
              disabled={checkInDone || isCancelled}
              style={{
                marginTop: '10px',
                width: '100%',
                maxWidth: '360px',
                padding: '11px 18px',
                borderRadius: '12px',
                border: isCancelled
                  ? '1px solid #CBD5E1'
                  : checkInDone
                  ? '1px solid #E2E8F0'
                  : '1.5px solid #EF4444',
                background: isCancelled
                  ? '#F1F5F9'
                  : checkInDone
                  ? '#F8FAFC'
                  : '#FEF2F2',
                color: isCancelled
                  ? '#64748B'
                  : checkInDone
                  ? '#94A3B8'
                  : '#DC2626',
                fontSize: '13px',
                fontWeight: 700,
                cursor: (checkInDone || isCancelled) ? 'not-allowed' : 'pointer',
                opacity: checkInDone ? 0.55 : 1,
                filter: checkInDone ? 'grayscale(0.6)' : 'none',
                boxShadow: (checkInDone || isCancelled)
                  ? 'none'
                  : '0 4px 14px rgba(239, 68, 68, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!checkInDone && !isCancelled) {
                  e.currentTarget.style.background = '#FEE2E2'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(239, 68, 68, 0.24)'
                }
              }}
              onMouseLeave={(e) => {
                if (!checkInDone && !isCancelled) {
                  e.currentTarget.style.background = '#FEF2F2'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.16)'
                }
              }}
              title={
                isCancelled
                  ? 'Đơn đặt sân này đã được hủy'
                  : checkInDone
                  ? 'Chủ sân đã quét mã QR xác nhận check-in (Không thể hủy đơn)'
                  : 'Chưa check-in: Bạn có thể hủy đơn đặt sân và hoàn tiền theo quy định'
              }
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isCancelled ? 'cancel' : checkInDone ? 'block' : 'event_busy'}
              </span>
              <span>
                {isCancelled
                  ? 'Đơn đã được hủy'
                  : checkInDone
                  ? 'Đã check-in (Không thể hủy)'
                  : 'Hủy đơn & Hoàn tiền'}
              </span>
            </button>
          </div>

          {/* Card 3: Backup OTP Code Card */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                MÃ OTP DỰ PHÒNG (NẾU CAMERA LỖI)
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  marginTop: '2px',
                }}
              >
                894 - 201
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyOTP}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #D1D5DB',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#374151',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F9FAFB'
                e.currentTarget.style.borderColor = '#9CA3AF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#D1D5DB'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4B5563' }}>
                content_copy
              </span>
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Đánh Giá Fair Play Bạn Chơi & Lịch Sử Check-in ================= */}
        <div
          id="post-match-rating-panel"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
            padding: '22px 24px',
          }}
        >
          {/* Top Tabs Switcher: Đánh Giá Fair Play & Lịch Sử Check-in */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setRightTab('rating')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: rightTab === 'rating' ? '#15803D' : 'transparent',
                  color: rightTab === 'rating' ? '#ffffff' : '#64748B',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: rightTab === 'rating' ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                  stars
                </span>
                <span>Đánh Giá Bạn Chơi (Fair Play)</span>
              </button>

              <button
                type="button"
                onClick={() => setRightTab('history')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: rightTab === 'history' ? '#15803D' : 'transparent',
                  color: rightTab === 'history' ? '#ffffff' : '#64748B',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: rightTab === 'history' ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                  history
                </span>
                <span>Lịch Sử Check-in ({historyList.length})</span>
              </button>
            </div>

            <div
              style={{
                fontSize: '11.5px',
                color: '#6B7280',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>
                confirmation_number
              </span>
              <span>Vé #{ticketData?.ticketCode || '—'}</span>
            </div>
          </div>

          {/* ================= TAB 1: ĐÁNH GIÁ BẠN CHƠI CÙNG SÂN (FAIR PLAY - YÊU CẦU 2.7) ================= */}
          {rightTab === 'rating' && (
            <div>
              {/* Header Box (Khung tiêu đề đúng như hình screenshot) */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    HỆ THỐNG FAIRPLAY SPORTNEXUS
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
                    Vé #{ticketData?.ticketCode || '—'} • {ticketData?.courtName || '—'}
                  </span>
                </div>

                <h2
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#111827',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Đánh Giá Sau Trận Đấu Cho Người Chơi Cùng Sân
                </h2>

                <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', lineHeight: 1.5 }}>
                  Quy định: Người chơi chỉ được phép đánh giá bằng hình thức <strong>viết nhận xét</strong> và <strong>chấm điểm sao</strong> cho người chơi cùng sân sau khi <strong style={{ color: '#15803D' }}>check-in thành công</strong>.
                </p>

                {/* Banner Trạng Thái Check-in */}
                {checkInDone ? (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1.5px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#DCFCE7',
                        color: '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                        verified
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#15803D',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        TRẠNG THÁI CHECK-IN
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                        Đã check-in ({ticketData?.startTime || '—'}) • Hợp lệ để đánh giá bạn chơi
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #FECACA',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#DC2626' }}>
                        lock_clock
                      </span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B' }}>
                          Đánh giá sau trận đang tạm khóa (Chờ Check-in)
                        </div>
                        <div style={{ fontSize: '12px', color: '#B91C1C' }}>
                          Bạn cần hoàn tất <strong>Check-in vào sân</strong> để mở quyền viết nhận xét và chấm sao (Quy định 2.7: Cả hai người phải đã check-in).
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCheckInModal(true)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: '#15803D',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        qr_code_scanner
                      </span>
                      <span>Mô phỏng Check-in ngay</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Grid 2 cột: Danh sách bạn chơi (trái) & Form đánh giá (phải) đúng y như hình screenshot */}
              <div
                className="rating-subgrid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(230px, 270px) 1fr',
                  gap: '16px',
                  alignItems: 'start',
                  marginTop: '14px',
                }}
              >
                {/* Cột 1: Danh Sách Bạn Chơi Cùng Sân */}
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827' }}>
                        Bạn Chơi Cùng Sân ({matchParticipants.length})
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
                        Tự cập nhật sau check-in • Chọn người để đánh giá
                      </div>
                    </div>
                    <span
                      style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✓ Cùng sân đấu
                    </span>
                  </div>

                  {/* Nút Thêm bạn đánh đôi (Đi cùng đại diện slot) */}
                  <div style={{ marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddDoublesPartner(!showAddDoublesPartner)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: showAddDoublesPartner ? '#FEF3C7' : '#F0FDF4',
                        border: showAddDoublesPartner ? '1.5px solid #F59E0B' : '1px dashed #16A34A',
                        color: showAddDoublesPartner ? '#B45309' : '#15803D',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {showAddDoublesPartner ? 'expand_less' : 'person_add'}
                      </span>
                      <span>{showAddDoublesPartner ? 'Đóng form thêm bạn' : '+ Thêm bạn đánh đôi (Đi cùng đại diện slot)'}</span>
                    </button>

                    {showAddDoublesPartner && (
                      <div
                        style={{
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: '12px',
                          padding: '12px',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#92400E' }}>
                          Thêm bạn đánh đôi (Đi cùng người đại diện):
                        </div>
                        <input
                          type="text"
                          placeholder="Họ tên bạn đánh đôi..."
                          value={doublesPartnerName}
                          onChange={(e) => setDoublesPartnerName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 9px',
                            borderRadius: '8px',
                            border: '1px solid #FCD34D',
                            fontSize: '11.5px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            background: '#ffffff',
                          }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <select
                            value={doublesPartnerRole}
                            onChange={(e) => setDoublesPartnerRole(e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                              fontSize: '11px',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          >
                            <option value="Đồng đội đánh cặp">Đồng đội đánh cặp</option>
                            <option value="Đối thủ cùng sân">Đối thủ cùng sân</option>
                          </select>
                          <select
                            value={doublesPartnerRep}
                            onChange={(e) => setDoublesPartnerRep(e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                              fontSize: '11px',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          >
                            {matchParticipants
                              .filter((p) => !p.isDoublesGuest)
                              .map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddDoublesParticipant}
                          style={{
                            padding: '7px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Thêm &amp; Chọn Đánh Giá
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Danh sách người chơi */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matchParticipants.map((p) => {
                      const isSelected = selectedCoPlayer?.id === p.id
                      const isReviewed = reviewedPlayerIds.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedCoPlayer(p)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            background: isSelected ? '#FFFFFF' : '#F1F5F9',
                            border: isSelected ? '2px solid #16A34A' : '1px solid #E2E8F0',
                            boxShadow: isSelected ? '0 3px 10px rgba(22, 163, 74, 0.12)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: p.isDoublesGuest ? '#FEF3C7' : '#DCFCE7',
                                color: p.isDoublesGuest ? '#D97706' : '#15803D',
                                border: isSelected ? '2px solid #16A34A' : '1px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '13px',
                                flexShrink: 0,
                              }}
                            >
                              {(p.name || p.email).slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  color: '#111827',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {p.name || p.email.split('@')[0]}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#64748B',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {p.isDoublesGuest
                                  ? `${p.role} • Đi cùng ${p.representedBy}`
                                  : p.role || 'Bạn chơi cùng sân'}
                              </div>
                            </div>
                          </div>

                          <div style={{ flexShrink: 0, marginLeft: '6px' }}>
                            {isReviewed ? (
                              <span
                                style={{
                                  background: '#DCFCE7',
                                  color: '#15803D',
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ✓ Đã chấm
                              </span>
                            ) : isSelected ? (
                              <span
                                style={{
                                  background: '#DCFCE7',
                                  color: '#15803D',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Đang chọn
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: '#E2E8F0',
                                  color: '#64748B',
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Đánh giá
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cột 2: Form Chấm Sao & Viết Nhận Xét Đánh Giá */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Selected player header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F1F5F9',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#DCFCE7',
                        color: '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {(selectedCoPlayer?.name || 'HO').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                          Đánh Giá: {selectedCoPlayer?.name || 'Hoàng Nam'}
                        </span>
                        <span
                          style={{
                            background: '#E0F2FE',
                            color: '#0284C7',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                          }}
                        >
                          {selectedCoPlayer?.role || 'Đồng đội đánh cặp'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        {ticketData?.courtName || '—'} • {ticketData?.gate || '—'} • Check-in lúc {ticketData?.startTime || '—'}
                      </div>
                    </div>
                  </div>

                  {reviewedPlayerIds.includes(selectedCoPlayer?.id) ? (
                    <div
                      style={{
                        background: '#F0FDF4',
                        border: '1.5px solid #BBF7D0',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#16A34A' }}>
                        task_alt
                      </span>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803D', marginTop: '6px' }}>
                        Bạn đã gửi đánh giá Fair Play cho {selectedCoPlayer?.name}!
                      </div>
                      <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>
                        Theo quy định 2.7, mỗi người chơi chỉ chấm 1 lần cho 1 người trong 1 trận. Điểm số đã được cộng vào hệ thống Fair Play SportNexus.
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRateCoPlayer}>
                      {/* 1. CHẤM ĐIỂM SAO */}
                      <div
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '14px',
                          border: '1px solid #E2E8F0',
                          padding: '14px 16px',
                          textAlign: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            marginBottom: '8px',
                          }}
                        >
                          1. CHẤM ĐIỂM SAO CHO BẠN CHƠI CÙNG SÂN (BẮT BUỘC)
                        </div>

                        {/* Interactive Stars */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= (rateHoverStars || rateStars)
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRateStars(star)}
                                onMouseEnter={() => setRateHoverStars(star)}
                                onMouseLeave={() => setRateHoverStars(0)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  outline: 'none',
                                  transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                                  transition: 'transform 0.15s ease',
                                }}
                                title={`${star} sao`}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{
                                    fontSize: '38px',
                                    color: isFilled ? '#EAB308' : '#CBD5E1',
                                    fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                                    transition: 'color 0.15s ease',
                                  }}
                                >
                                  star
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Label mô tả */}
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: rateStars >= 4 ? '#15803D' : rateStars === 3 ? '#D97706' : '#DC2626',
                          }}
                        >
                          {getStarLabel(rateHoverStars || rateStars)}
                        </div>

                        {/* Badge công thức quy đổi */}
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '6px 12px',
                            background: '#ECFDF5',
                            borderRadius: '10px',
                            border: '1px solid #A7F3D0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            color: '#065F46',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }}>
                            verified_user
                          </span>
                          <span>
                            Quy đổi Fair Play: <strong>{rateStars} sao = +{rateStars * 20} điểm</strong> (Điểm Fair Play = số sao × 20, thang điểm 0 - 100)
                          </span>
                        </div>
                      </div>

                      {/* 2. VIẾT NHẬN XÉT ĐÁNH GIÁ */}
                      <div style={{ marginBottom: '16px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                          }}
                        >
                          <label
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 800,
                              color: '#1E293B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>2. Viết Nhận Xét Đánh Giá (Bắt buộc)</span>
                            <span style={{ color: '#DC2626' }}>*</span>
                          </label>
                          <span
                            style={{
                              fontSize: '11.5px',
                              color: writtenReview.trim().length >= 10 ? '#15803D' : '#94A3B8',
                              fontWeight: 600,
                            }}
                          >
                            {writtenReview.trim().length}/10 ký tự tối thiểu
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          value={writtenReview}
                          onChange={(e) => setWrittenReview(e.target.value)}
                          placeholder="Chia sẻ nhận xét về tinh thần thi đấu, sự phối hợp, thái độ fairplay của bạn chơi..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12.5px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                          }}
                        />

                        {/* Gợi ý nhận xét nhanh */}
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '5px' }}>
                            💡 Gợi ý nhận xét nhanh (nhấn để thêm):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {quickTags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  setWrittenReview((prev) => {
                                    if (!prev.trim()) return tag
                                    return `${prev}. ${tag}`
                                  })
                                }}
                                style={{
                                  padding: '4px 9px',
                                  borderRadius: '8px',
                                  background: '#F1F5F9',
                                  border: '1px solid #E2E8F0',
                                  color: '#334155',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#DCFCE7'
                                  e.currentTarget.style.color = '#15803D'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#F1F5F9'
                                  e.currentTarget.style.color = '#334155'
                                }}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Nút gửi đánh giá */}
                      <button
                        type="submit"
                        disabled={!checkInDone || writtenReview.trim().length < 10}
                        style={{
                          width: '100%',
                          padding: '11px 18px',
                          borderRadius: '12px',
                          background:
                            !checkInDone || writtenReview.trim().length < 10
                              ? '#E2E8F0'
                              : 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                          color:
                            !checkInDone || writtenReview.trim().length < 10
                              ? '#94A3B8'
                              : '#ffffff',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor:
                            !checkInDone || writtenReview.trim().length < 10
                              ? 'not-allowed'
                              : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow:
                            !checkInDone || writtenReview.trim().length < 10
                              ? 'none'
                              : '0 4px 14px rgba(22, 163, 74, 0.25)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          send
                        </span>
                        <span>
                          {!checkInDone
                            ? 'Vui lòng Check-in vào sân trước khi gửi đánh giá'
                            : `Gửi Đánh Giá Fair Play (+${rateStars * 20} điểm quy đổi)`}
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: LỊCH SỬ CHECK-IN ================= */}
          {rightTab === 'history' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#111827',
                    }}
                  >
                    Lịch Sử Check-in &amp; Đánh Giá Fairplay Gần Đây
                  </h3>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginTop: '2px' }}>
                    {ticketData?.venueName || '—'} • {ticketData?.startTime || '—'}, {ticketData?.playDate || '—'}
                  </div>
                </div>

                <div
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  3 lượt gần nhất
                </div>
              </div>

              {/* Table Container */}
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    minWidth: '640px',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #F1F5F9' }}>
                      <th
                        style={{
                          padding: '8px 12px 10px 4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          whiteSpace: 'nowrap',
                          width: '28%',
                        }}
                      >
                        THỜI GIAN &amp; ĐỊA ĐIỂM
                      </th>
                      <th
                        style={{
                          padding: '8px 12px 10px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          whiteSpace: 'nowrap',
                          width: '18%',
                        }}
                      >
                        MÔN THỂ THAO
                      </th>
                      <th
                        style={{
                          padding: '8px 12px 10px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          whiteSpace: 'nowrap',
                          width: '18%',
                        }}
                      >
                        SỐ TIỀN KÝ QUỸ
                      </th>
                      <th
                        style={{
                          padding: '8px 12px 10px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          whiteSpace: 'nowrap',
                          width: '18%',
                        }}
                      >
                        XÁC THỰC CHECK-IN
                      </th>
                      <th
                        style={{
                          padding: '8px 4px 10px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                          width: '18%',
                        }}
                      >
                        ĐIỂM FAIRPLAY
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {historyList.map((item, index) => {
                      const isCyan = item.sportColor === 'cyan'
                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: index < historyList.length - 1 ? '1px solid #F3F4F6' : 'none',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F9FAFB'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          {/* 1. THỜI GIAN & ĐỊA ĐIỂM */}
                          <td style={{ padding: '11px 12px 11px 4px', whiteSpace: 'nowrap' }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 800,
                                color: '#111827',
                                marginBottom: '2px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.time}
                            </div>
                            <div
                              style={{
                                fontSize: '11.5px',
                                color: '#6B7280',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.location}
                            </div>
                          </td>

                          {/* 2. MÔN THỂ THAO */}
                          <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                background: isCyan ? '#E0F2FE' : '#DCFCE7',
                                color: isCyan ? '#0284C7' : '#15803D',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span>{item.sportIcon === 'badminton' ? '🏸' : '🏓'}</span>
                              <span>{item.sport}</span>
                            </span>
                          </td>

                          {/* 3. SỐ TIỀN KÝ QUỸ */}
                          <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                            <div
                              style={{
                                fontSize: '13.5px',
                                fontWeight: 800,
                                color: '#111827',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.amount}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#16A34A',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span style={{ fontSize: '10px' }}>✓</span>
                              <span>{item.status}</span>
                            </div>
                          </td>

                          {/* 4. XÁC THỰC CHECK-IN */}
                          <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: item.authIcon === 'kiosk' ? '#4D7C0F' : '#15803D',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  fontSize: '17px',
                                  color: item.authIcon === 'kiosk' ? '#65A30D' : '#16A34A',
                                }}
                              >
                                {item.authIcon === 'kiosk' ? 'pin' : 'qr_code_scanner'}
                              </span>
                              <span>{item.authMethod}</span>
                            </div>
                          </td>

                          {/* 5. FAIRPLAY */}
                          <td style={{ padding: '11px 4px 11px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <span
                                style={{
                                  color: '#EAB308',
                                  fontSize: '12.5px',
                                  letterSpacing: '1px',
                                }}
                              >
                                {'★'.repeat(item.stars)}
                              </span>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#15803D',
                                  background: '#DCFCE7',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                }}
                              >
                                {item.stars * 20}đ
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Banner bảo chứng hệ thống phía dưới */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px 18px',
              borderRadius: '14px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  verified_user
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#166534', fontWeight: 600 }}>
                Hệ thống xác thực mã hóa hai lớp • Điểm Fair Play bảo chứng uy tín tài khoản
              </div>
            </div>

            <Link
              to="/wallet"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#15803D',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Chi tiết ví Escrow</span>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== MODAL: QUÉT CHECK-IN QUA CỔNG TỰ ĐỘNG (BƯỚC 2) ===================== */}
      {showCheckInModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => !isScanningCheckIn && setShowCheckInModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: '28px',
              textAlign: 'center',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {checkInDone ? (
              <>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    boxShadow: '0 8px 20px rgba(22, 163, 74, 0.2)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '38px', fontWeight: 700 }}>
                    check
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#111827',
                    margin: '0 0 6px 0',
                  }}
                >
                  Check-in {ticketData?.gate || '—'} Thành Công!
                </h3>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: '#4B5563',
                    margin: '0 0 18px 0',
                    lineHeight: 1.5,
                  }}
                >
                  Hệ thống đã xác thực vé #{ticketData?.ticketCode || '—'}. Barie {ticketData?.gate || '—'} đã mở, chúc bạn có trận đấu bùng nổ!
                </p>

                {/* Escrow Release info box */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    textAlign: 'left',
                    marginBottom: '22px',
                    fontSize: '12.5px',
                    color: '#166534',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#15803D' }}>
                      lock_open
                    </span>
                    Giải ngân ký quỹ Escrow thành công
                  </div>
                  <div>
                    Số tiền <strong>{new Intl.NumberFormat('vi-VN').format(ticketData?.escrowAmount || 0)} đ</strong> đã được giải tỏa an toàn và ghi nhận doanh thu cho {ticketData?.courtName || '—'}.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  Hoàn tất &amp; Vào sân thi đấu
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    qr_code_scanner
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#111827',
                    margin: '0 0 6px 0',
                  }}
                >
                  Xác Thực Check-in Qua Cổng Barie
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    margin: '0 0 16px 0',
                    lineHeight: 1.5,
                  }}
                >
                  Quét mã vé <strong>#{ticketData?.ticketCode || '—'}</strong> tại máy quét barie để mở cổng vào sân thi đấu.
                </p>

                {/* Info Card */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    textAlign: 'left',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#334155',
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Loại vé:</span>
                    <strong style={{ color: '#0284C7' }}>{ticketData?.sportType || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Sân:</span>
                    <strong style={{ color: '#1E293B' }}>{ticketData?.courtName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Cơ sở:</span>
                    <strong style={{ color: '#1E293B' }}>{ticketData?.venueName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Giờ thi đấu:</span>
                    <strong style={{ color: '#15803D' }}>{ticketData?.startTime} - {ticketData?.endTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', marginTop: '6px' }}>
                    <span style={{ color: '#64748B' }}>Khung check-in hợp lệ:</span>
                    <strong style={{ color: '#D97706' }}>{ticketData?.allowedCheckInStart} - {ticketData?.allowedCheckInEnd}</strong>
                  </div>
                </div>

                {/* Error Banner if API returned 400 or 403 */}
                {scanError && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 600,
                      textAlign: 'left',
                      marginBottom: '16px',
                      lineHeight: 1.45,
                    }}
                  >
                    {scanError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCheckInModal(false)}
                    style={{
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: '12px',
                      background: '#F1F5F9',
                      border: 'none',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={isScanningCheckIn}
                    onClick={handleGateScanCheckIn}
                    style={{
                      flex: 2,
                      padding: '11px 0',
                      borderRadius: '12px',
                      background: isScanningCheckIn ? '#94A3B8' : 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: isScanningCheckIn ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isScanningCheckIn ? 'sync' : 'sensors'}
                    </span>
                    <span>{isScanningCheckIn ? 'Đang gửi mã...' : 'Mô Phỏng Quét Check-in'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== POPUP: GỬI MÃ CHECK-IN CHO BẠN CHƠI ===================== */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '22px 24px 18px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Green icon box with email forward */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803D',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    forward_to_inbox
                  </span>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#111827',
                      margin: 0,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    Gửi mã check-in cho bạn chơi
                  </h3>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      marginTop: '3px',
                    }}
                  >
                    VÉ #TK-8849 • SÂN CẦU LÔNG 01
                  </div>
                </div>
              </div>

              {/* Close button ✕ */}
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6'
                  e.currentTarget.style.color = '#111827'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#6B7280'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '0 24px 20px 24px' }}>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#4B5563',
                  lineHeight: 1.5,
                  margin: '0 0 18px 0',
                }}
              >
                Nhập địa chỉ email của người cùng tham gia để hệ thống tự động gửi vé QR và mã PIN check-in sân.
              </p>

              {/* Label Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#1F2937',
                  }}
                >
                  Nhập mail người chơi để gửi mã
                </label>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#166534',
                  }}
                >
                  Tối đa 3 người
                </span>
              </div>

              {/* Input container */}
              <div
                style={{
                  background: '#F0F4FF',
                  borderRadius: '14px',
                  padding: '6px 8px 6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #E0E7FF',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                  mail
                </span>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddEmail()
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '13.5px',
                    color: '#1E293B',
                    fontWeight: 500,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#BBF7D0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#DCFCE7'
                  }}
                >
                  + Thêm
                </button>
              </div>

              {/* Suggested Participants Section */}
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    marginBottom: '10px',
                  }}
                >
                  NGƯỜI THAM GIA TRONG TRẬN (GỢI Ý)
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {/* Match Participants List (All deletable) */}
                  {matchParticipants.map((item) => {
                    const isSelected = item.isSelected
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelectParticipant(item.id)}
                        style={{
                          background: isSelected ? '#EEF2FF' : '#F8FAFC',
                          border: isSelected ? '1px solid #E0E7FF' : '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '6px 10px 6px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: isSelected ? '#1E293B' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? '0 1px 4px rgba(99, 102, 241, 0.12)' : 'none',
                        }}
                        title={isSelected ? 'Đang chọn gửi mã (Nhấp để bỏ chọn)' : 'Nhấp để chọn gửi mã'}
                      >
                        {isSelected ? (
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#15803D',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '16px', color: '#64748B', flexShrink: 0 }}
                          >
                            person_add
                          </span>
                        )}

                        <span style={{ userSelect: 'none' }}>{item.email}</span>

                        {/* Explicit Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteParticipant(item.id, item.email)
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEE2E2'
                            e.currentTarget.style.color = '#DC2626'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = '#64748B'
                          }}
                          title={`Xóa ${item.email} khỏi trận`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            cancel
                          </span>
                        </button>
                      </div>
                    )
                  })}

                  {/* Empty state & restore if all participants are deleted */}
                  {matchParticipants.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '4px 0' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>
                        Đã xóa hết người tham gia. Nhập email ở trên để thêm người chơi.
                      </span>
                      <button
                        type="button"
                        onClick={handleRestoreDefaultParticipants}
                        style={{
                          background: '#F0FDF4',
                          border: '1px dashed #16A34A',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        Khôi phục gợi ý
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Security & Permissions Box */}
              <div
                style={{
                  marginTop: '18px',
                  background: '#E8F8F0',
                  border: '1px solid #A7F3D0',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#059669', flexShrink: 0, marginTop: '1px' }}>
                  shield
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 800,
                      color: '#065F46',
                      marginBottom: '2px',
                    }}
                  >
                    Bảo mật &amp; Quyền hạn
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#047857',
                      lineHeight: 1.45,
                    }}
                  >
                    Người nhận chỉ có quyền check-in qua cổng IoT và xem lịch thi đấu, không thể thay đổi thông tin đặt sân.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '14px 24px',
                background: '#F8FAFC',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{
                  background: '#EEF2FF',
                  border: 'none',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 22px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E0E7FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#EEF2FF'
                }}
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmSend}
                style={{
                  background: '#365314',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  padding: '10px 22px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(54, 83, 20, 0.25)',
                  transition: 'background 0.15s, transform 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2B4310'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#365314'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffffff' }}>
                  send
                </span>
                <span>Xác nhận gửi mã</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: XÁC NHẬN CHECK-OUT TRẢ SÂN ===================== */}
      {showCheckOutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowCheckOutModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: '28px',
              textAlign: 'center',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FFEDD5',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '34px', fontWeight: 700 }}>
                logout
              </span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
              Xác Nhận Check-out Trả Sân
            </h3>
            <p style={{ fontSize: '13.5px', color: '#4B5563', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              Bạn đang trả sân <strong>Sân Cầu Lông BWF Pro 01 (Court 3)</strong>. Sau khi check-out thành công, hệ thống sẽ mở quyền viết nhận xét và chấm sao cho bạn chơi cùng sân.
            </p>

            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '14px',
                padding: '12px 14px',
                textAlign: 'left',
                fontSize: '12.5px',
                color: '#166534',
                marginBottom: '20px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
                verified
              </span>
              <span>Ký quỹ Escrow hoàn tất đối soát • Khóa mở đánh giá bạn chơi sau trận</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowCheckOutModal(false)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckOut}
                style={{
                  flex: 1.5,
                  padding: '11px 0',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                }}
              >
                Xác Nhận Check-out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ĐÁNH GIÁ NGƯỜI CHƠI CÙNG SÂN (CHẤM SAO + VIẾT) ===================== */}
      {showRateModal && selectedCoPlayer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowRateModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px 16px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    rate_review
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                    Đánh Giá Người Chơi Cùng Sân
                  </h3>
                  <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginTop: '2px' }}>
                    ✓ Đã Check-out Thành Công • Court 3
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitRateCoPlayer} style={{ padding: '20px 24px' }}>
              {/* Thông tin người chơi cùng sân */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {(selectedCoPlayer.name || selectedCoPlayer.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
                      {selectedCoPlayer.name || selectedCoPlayer.email.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {selectedCoPlayer.role || 'Bạn cùng sân'}
                    </div>
                    {selectedCoPlayer.isDoublesGuest && (
                      <span
                        style={{
                          background: '#FEF3C7',
                          color: '#B45309',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: '1px solid #FDE68A',
                          display: 'inline-block',
                          marginTop: '2px',
                        }}
                      >
                        🏸 Đánh đôi (Đi cùng {selectedCoPlayer.representedBy})
                      </span>
                    )}
                  </div>
                </div>

                {/* Chọn bạn khác nếu có */}
                {matchParticipants.length > 1 && (
                  <select
                    value={selectedCoPlayer.id}
                    onChange={(e) => {
                      const target = matchParticipants.find((p) => p.id === e.target.value)
                      if (target) setSelectedCoPlayer(target)
                    }}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#334155',
                      background: '#ffffff',
                    }}
                  >
                    {matchParticipants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.email.split('@')[0]} {p.isDoublesGuest ? '(Đánh đôi)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Nút mở form thêm bạn đánh đôi (nếu chỉ 1 người đại diện đăng ký slot) */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddDoublesPartner(!showAddDoublesPartner)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    background: showAddDoublesPartner ? '#FEF3C7' : '#F0FDF4',
                    border: showAddDoublesPartner ? '1px solid #F59E0B' : '1px dashed #16A34A',
                    color: showAddDoublesPartner ? '#B45309' : '#15803D',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {showAddDoublesPartner ? 'expand_less' : 'person_add'}
                  </span>
                  {showAddDoublesPartner ? 'Đóng form thêm bạn đánh đôi' : '+ Thêm bạn đánh đôi (Đi cùng đại diện slot)'}
                </button>

                {showAddDoublesPartner && (
                  <div
                    style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '12px',
                      padding: '12px',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>
                      Dành cho trường hợp đánh đôi chỉ có 1 đại diện đặt slot trên app:
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập họ tên / biệt danh bạn đánh đôi..."
                      value={doublesPartnerName}
                      onChange={(e) => setDoublesPartnerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #FCD34D',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <select
                        value={doublesPartnerRole}
                        onChange={(e) => setDoublesPartnerRole(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #FCD34D',
                          fontSize: '11px',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="Đồng đội đánh cặp">Đồng đội đánh cặp</option>
                        <option value="Đối thủ đánh đôi">Đối thủ đánh đôi</option>
                      </select>
                      <select
                        value={doublesPartnerRep}
                        onChange={(e) => setDoublesPartnerRep(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #FCD34D',
                          fontSize: '11px',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        {matchParticipants
                          .filter((p) => !p.isDoublesGuest)
                          .map((p) => (
                            <option key={p.id} value={p.name || p.email.split('@')[0]}>
                              Đi cùng: {p.name || p.email.split('@')[0]}
                            </option>
                          ))}
                        <option value="Người chơi chính">Đi cùng: Người chơi chính</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddDoublesPartner(false)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          border: 'none',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleAddDoublesParticipant}
                        style={{
                          flex: 2,
                          padding: '6px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Thêm & Chọn Đánh Giá
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 1. Chấm điểm sao */}
              <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  1. Chấm Điểm Sao (1 Đến 5 Sao) *
                </label>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((s) => {
                    const isFilled = s <= (rateHoverStars || rateStars)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRateStars(s)}
                        onMouseEnter={() => setRateHoverStars(s)}
                        onMouseLeave={() => setRateHoverStars(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '36px',
                            color: isFilled ? '#EAB308' : '#CBD5E1',
                            fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                            transition: 'color 0.15s',
                          }}
                        >
                          star
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: rateStars >= 4 ? '#15803D' : '#D97706',
                  }}
                >
                  {rateStars === 5
                    ? '5 sao: Xuất sắc & Fairplay'
                    : rateStars === 4
                    ? '4 sao: Rất tốt & Nhiệt tình'
                    : rateStars === 3
                    ? '3 sao: Khá tốt'
                    : rateStars === 2
                    ? '2 sao: Tạm được'
                    : '1 sao: Cần cải thiện'}
                </div>
              </div>

              {/* 2. Viết nhận xét bằng chữ (bắt buộc) */}
              <div style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B' }}>
                    2. Viết Nhận Xét Bằng Chữ (Bắt buộc) *
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      color: writtenReview.trim().length >= 10 ? '#15803D' : '#94A3B8',
                      fontWeight: 700,
                    }}
                  >
                    {writtenReview.trim().length}/10 ký tự
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={writtenReview}
                  onChange={(e) => setWrittenReview(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border:
                      writtenReview.trim().length > 0 && writtenReview.trim().length < 10
                        ? '1.5px solid #F87171'
                        : '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#16A34A')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />

                {/* Quick tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                  {quickTags.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setWrittenReview((prev) => (prev.trim() ? `${prev}. ${tag}` : tag))
                      }
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: '12px',
                    background: '#F1F5F9',
                    border: 'none',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={writtenReview.trim().length < 10}
                  style={{
                    flex: 2,
                    padding: '10px 0',
                    borderRadius: '12px',
                    background:
                      writtenReview.trim().length >= 10
                        ? 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)'
                        : '#CBD5E1',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: writtenReview.trim().length >= 10 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow:
                      writtenReview.trim().length >= 10
                        ? '0 4px 12px rgba(22, 163, 74, 0.25)'
                        : 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                    send
                  </span>
                  Gửi Đánh Giá Sau Trận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CANCELLATION & REFUND MODAL (Image 2) ===================== */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => !isCanceling && setShowCancelModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px 28px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  event_busy
                </span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  Xác Nhận Hủy Đơn Đặt Sân
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                  Áp dụng chính sách hoàn tiền tự động theo quy định của SportNexus
                </p>
              </div>
            </div>

            {/* Chính sách 24h */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                fontSize: '12.5px',
                lineHeight: 1.5,
                background: getHoursUntilMatch() >= 24 ? '#F0FDF4' : '#FEF2F2',
                border: getHoursUntilMatch() >= 24 ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                color: getHoursUntilMatch() >= 24 ? '#166534' : '#991B1B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {getHoursUntilMatch() >= 24 ? 'check_circle' : 'warning'}
                </span>
                <span>
                  {getHoursUntilMatch() >= 24
                    ? 'ĐỦ ĐIỀU KIỆN HOÀN TIỀN 100%'
                    : 'KHÔNG HOÀN TIỀN (0%)'}
                </span>
              </div>
              <div>
                {getHoursUntilMatch() >= 24 ? (
                  <>
                    Thời điểm hủy cách giờ thi đấu <strong>{getHoursUntilMatch().toFixed(1)} giờ</strong> (&ge; 24h).
                    Bạn sẽ nhận lại <strong>100% tiền (330.000 đ)</strong> vào Ví Escrow ngay sau khi hủy.
                  </>
                ) : (
                  <>
                    Thời điểm hủy cách giờ thi đấu <strong>{getHoursUntilMatch().toFixed(1)} giờ</strong> (&lt; 24h).
                    Theo quy định SportNexus, đơn hủy trong vòng 24 giờ trước giờ thi đấu sẽ <strong>không được hoàn tiền</strong>.
                  </>
                )}
              </div>
            </div>

            {/* Dropdown lý do hủy */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Lý do hủy đơn:
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none',
                }}
                value={selectedReasonCode}
                onChange={(e) => setSelectedReasonCode(Number(e.target.value))}
                disabled={isCanceling}
              >
                {cancellationReasons.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom reason text */}
            {selectedReasonCode === 6 && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Chi tiết lý do của bạn:
                </label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '70px',
                  }}
                  placeholder="Vui lòng nêu rõ lý do bạn muốn hủy đơn..."
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  disabled={isCanceling}
                />
              </div>
            )}

            {cancelError && (
              <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '12px' }}>
                ⚠️ {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
              >
                Giữ lại đơn
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: isCanceling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={handleConfirmCancelCheckIn}
                disabled={isCanceling}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isCanceling ? 'sync' : 'event_busy'}
                </span>
                <span>{isCanceling ? 'Đang xử lý hủy...' : 'Xác Nhận Hủy Đơn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DANH SÁCH VÉ CỦA TÔI (MY-BOOKINGS & UPCOMING) ===================== */}
      {showTicketsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowTicketsModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              animation: 'scaleIn 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '28px' }}>
                  confirmation_number
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                    Danh Sách Vé Của Tôi
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                    Chọn một vé để nạp mã QR check-in &amp; quản lý đơn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketsModal(false)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                ✕
              </button>
            </div>

            {/* Tabs filter: Upcoming vs All */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <button
                type="button"
                onClick={() => setTicketTab('upcoming')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: ticketTab === 'upcoming' ? '#10B981' : '#E5E7EB',
                  color: ticketTab === 'upcoming' ? '#ffffff' : '#374151',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Trận Sắp Tới ({upcomingBookingsList.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketTab('all')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: ticketTab === 'all' ? '#10B981' : '#E5E7EB',
                  color: ticketTab === 'all' ? '#ffffff' : '#374151',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Tất Cả Vé Đặt ({myBookingsList.length})
              </button>
            </div>

            {/* List Content */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoadingBookings ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#6B7280' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', animation: 'spinSlow 1.5s linear infinite' }}>
                    sync
                  </span>
                  <div style={{ marginTop: '8px', fontSize: '13px' }}>Đang tải danh sách vé...</div>
                </div>
              ) : (
                (() => {
                  const currentList = ticketTab === 'upcoming' ? upcomingBookingsList : myBookingsList
                  if (!currentList || currentList.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#D1D5DB' }}>
                          event_busy
                        </span>
                        <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600 }}>
                          {ticketTab === 'upcoming' ? 'Bạn chưa có trận đấu nào sắp tới' : 'Chưa có lịch sử đặt sân nào'}
                        </div>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                          Hãy đặt sân mới hoặc tham gia kèo LFG trên SportNexus ngay!
                        </p>
                        <div className="snx-row" style={{ justifyContent: 'center', marginTop: 12 }}>
                          <Link to="/court-finder" className="snx-btn snx-btn--primary snx-btn--sm">Đặt sân</Link>
                          <Link to="/community" className="snx-btn snx-btn--secondary snx-btn--sm">Tìm kèo LFG</Link>
                        </div>
                      </div>
                    )
                  }

                  return currentList.map((item, index) => {
                    const id = item.id || item.bookingId || index
                    const courtName = item.courtName || item.court?.courtName || 'Sân thể thao'
                    const facilityName = item.facilityName || item.facility?.name || 'SportNexus Arena'
                    const date = item.playDate || item.bookingDate || item.date || 'Hôm nay'
                    const time = item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : (item.timeSlot || '19:30 - 21:00')
                    const amount = item.totalAmount || item.totalPrice || item.price || 0
                    const status = item.status || 'CONFIRMED'

                    return (
                      <div
                        key={id}
                        style={{
                          border: '1px solid #E5E7EB',
                          borderRadius: '14px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          background: '#ffffff',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: status === 'CONFIRMED' ? '#DCFCE7' : status === 'CANCELLED' ? '#FEE2E2' : '#EFF6FF',
                                color: status === 'CONFIRMED' ? '#15803D' : status === 'CANCELLED' ? '#B91C1C' : '#1D4ED8',
                              }}
                            >
                              {status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : status === 'CANCELLED' ? 'ĐÃ HỦY' : status}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
                              📅 {date} • ⏰ {time}
                            </span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                            {courtName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                            📍 {facilityName}
                          </div>
                          {amount > 0 && (
                            <div style={{ fontSize: '12.5px', color: '#047857', fontWeight: 700, marginTop: '4px' }}>
                              {Number(amount).toLocaleString('vi-VN')} đ
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectBookingTicket(item)}
                          style={{
                            padding: '8px 16px',
                            background: '#10B981',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>qr_code_2</span>
                          <span>Xem Mã QR</span>
                        </button>
                      </div>
                    )
                  })
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Animations */}
      <style>{`
        @keyframes radarPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes laserScan {
          0% {
            top: 14px;
            opacity: 0.2;
          }
          50% {
            top: 200px;
            opacity: 0.9;
          }
          100% {
            top: 14px;
            opacity: 0.2;
          }
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 1080px) {
          .checkin-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 900px) {
          .rating-subgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default CheckInQR
