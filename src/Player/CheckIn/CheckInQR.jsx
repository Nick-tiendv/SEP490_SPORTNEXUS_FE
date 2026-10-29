import { useCallback, useEffect, useState, useMemo } from 'react'
import { useCurrentUser } from '../../hooks/useCurrentUser.js'
import { uid } from '../../utils/ids.js'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCancellationReasons, cancelBooking, getBookingQrTicket, getBookingById, getMyBookings, getUpcomingBookings } from '../../api/player/bookingApi.js'
import { getLfgQrTicket } from '../../api/player/lfgApi.js'
import { getPendingFairPlayRatings } from '../../api/player/reviewApi.js'
import { getMyCheckInHistory } from '../../api/player/checkInApi.js'
import { getTournamentQrTicket } from '../../api/player/tournamentApi.js'
import { enrichPlayerBookings, resolveBookingPlayWindow } from '../../api/player/bookingApi.js'

const formatBookingStatusLabel = (rawStatus) => {
  const upper = String(rawStatus || '').toUpperCase()
  if (upper === 'PAID' || upper === 'CONFIRMED') return 'ĐÃ THANH TOÁN'
  if (upper === 'CHECKED_IN') return 'ĐÃ CHECK-IN'
  if (upper === 'PENDING') return 'CHỜ GÓP TIỀN'
  if (upper === 'CANCELLED') return 'ĐÃ HỦY'
  if (upper === 'COMPLETED') return 'HOÀN THÀNH'
  return upper || 'ĐÃ XÁC NHẬN'
}

const clockVN = (value) => (value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—')
const dateVN = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')

// Dữ liệu vé từ BE (booking detail / LFG qr-ticket / tournament qr-ticket) -> dạng giao diện đang dùng
const toTicket = ({ id, qrCode, facilityId, facilityName, facilityAddress, courtName, sportName, startTime, endTime, status, amount, sportType, timeRangeLabel, groupedBookingIds }) => ({
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
  timeRangeLabel: timeRangeLabel || null,
  groupedBookingIds: Array.isArray(groupedBookingIds) ? groupedBookingIds : [],
})

function CheckInQR() {
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)

  // 2.7 Bước 1: Quản lý loại vé QR (đặt sân / kèo LFG / giải đấu)
  const [searchParams, setSearchParams] = useSearchParams()
  const [ticketType, setTicketType] = useState(() => searchParams.get('type') || 'booking')
  const [ticketData, setTicketData] = useState(null)
  // Kết quả tải vé gắn với hàm tải đang dùng; đang tải khi hàm hiện tại chưa trả kết quả
  const [ticketLoad, setTicketLoad] = useState({ fetcher: null, error: null })
  const [scanError, setScanError] = useState(null)
  const [isScanningCheckIn, setIsScanningCheckIn] = useState(false)


  // Bước 1: Tải vé từ API qr-ticket tương ứng (dùng lại cho nút "Kiểm tra trạng thái" và tự hỏi lại)
  const currentUser = useCurrentUser()
  const fetchTicket = useCallback(async () => {
    if (ticketType === 'booking') {
          // Đặt sân: GET /api/v1/bookings/{bookingId}/qr-ticket
          let bookingId = searchParams.get('bookingId') || localStorage.getItem('sportnexus_last_booking_id')
          if (!bookingId) {
            // Không có mã đơn trên URL: lấy đơn sắp tới gần nhất của người dùng
            const upcoming = await getUpcomingBookings()
            const enrichedUpcoming = await enrichPlayerBookings(upcoming)
            bookingId = enrichedUpcoming[0]?.id || enrichedUpcoming[0]?.bookingId || upcoming[0]?.id || upcoming[0]?.bookingId || null
          }
          if (!bookingId) throw new Error('Bạn chưa có đơn đặt sân sắp tới nào.')
          // qr-ticket trả về chuỗi mã QR; chi tiết đơn lấy từ GET /api/v1/bookings/{bookingId}
          const [qr, detail] = await Promise.all([getBookingQrTicket(bookingId), getBookingById(bookingId)])
          {
            const participants = detail?.participants || []
            const me = participants.find((p) => String(p.userId) === String(currentUser.id)) || participants.find((p) => p.isHost) || {}
            const [upcomingSiblings, mySiblings] = await Promise.all([
              getUpcomingBookings().catch(() => []),
              getMyBookings().catch(() => []),
            ])
            const playWindow = await resolveBookingPlayWindow(detail, {
              bookingId,
              qr,
              upcomingBookings: upcomingSiblings,
              myBookings: mySiblings,
            })

            return toTicket({
              id: bookingId,
              qrCode: typeof qr === 'string' ? qr : qr?.qrCode,
              facilityId: detail?.facilityId,
              facilityName: detail?.facilityName,
              facilityAddress: detail?.facilityAddress,
              courtName: detail?.courtName,
              sportName: detail?.sportName,
              startTime: detail?.startTime,
              endTime: detail?.endTime,
              status: me.isCheckedIn || String(detail?.bookingStatus).toUpperCase() === 'CHECKED_IN' ? 'CHECKED_IN' : detail?.bookingStatus,
              amount: detail?.paidAmount ?? detail?.totalAmount,
              ...{
                startTime: playWindow.startTime ?? detail?.startTime,
                endTime: playWindow.endTime ?? detail?.endTime,
                amount: playWindow.totalAmount || (detail?.paidAmount ?? detail?.totalAmount),
                timeRangeLabel: playWindow.timeRangeLabel,
                groupedBookingIds: playWindow.groupedBookingIds,
              },
            })
          }
        } else if (ticketType === 'lfg') {
          // Kèo LFG: GET /api/v1/lfgs/{cardId}/qr-ticket
          const cardId = searchParams.get('cardId') || searchParams.get('lfgId') || localStorage.getItem('sportnexus_current_lfg_id')
          if (!cardId) throw new Error('Bạn chưa tham gia kèo LFG nào có vé check-in.')
          const res = await getLfgQrTicket(cardId)

          {
            return toTicket({
              id: res?.lfgCardId || cardId,
              qrCode: res?.qrCode,
              facilityName: res?.facilityName,
              courtName: res?.courtName,
              startTime: res?.startTime,
              endTime: res?.endTime,
              status: res?.isCheckedIn ? 'CHECKED_IN' : 'PENDING_CHECKIN',
              sportType: 'KÈO GHÉP TRẬN LFG',
            })
          }
        } else if (ticketType === 'tournament') {
          // Giải đấu: GET /api/v1/tournaments/{id}/qr-ticket
          const tournamentId = searchParams.get('tournamentId') || localStorage.getItem('sportnexus_current_tournament_id')
          if (!tournamentId) throw new Error('Bạn chưa đăng ký giải đấu nào có vé check-in.')
          const res = await getTournamentQrTicket(tournamentId)

          {
            return toTicket({
              id: res?.tournamentId || tournamentId,
              qrCode: res?.qrCode,
              facilityId: res?.facilityId,
              facilityName: res?.facilityName,
              facilityAddress: res?.facilityAddress,
              courtName: res?.teamName || res?.fullName,
              sportType: res?.tournamentName || 'GIẢI ĐẤU',
              status: res?.tournamentStatus,
            })
          }
        }
    return null
  }, [ticketType, searchParams, currentUser.id])

  const isLoadingTicket = ticketLoad.fetcher !== fetchTicket
  const ticketError = isLoadingTicket ? null : ticketLoad.error

  useEffect(() => {
    let isMounted = true
    fetchTicket()
      .then((ticket) => {
        if (!isMounted) return
        setTicketData(ticket)
        setTicketLoad({ fetcher: fetchTicket, error: null })
      })
      .catch((err) => {
        if (!isMounted) return
        setTicketData(null)
        setTicketLoad({ fetcher: fetchTicket, error: err?.message || 'Không tải được vé check-in.' })
      })
    return () => { isMounted = false }
  }, [fetchTicket])

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
            const enrichedMy = await enrichPlayerBookings(myRes.value)
            if (isMounted) setMyBookingsList(enrichedMy)
          }
          if (upcomingRes.status === 'fulfilled' && Array.isArray(upcomingRes.value)) {
            const enrichedUp = await enrichPlayerBookings(upcomingRes.value)
            if (isMounted) setUpcomingBookingsList(enrichedUp)
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

  // 2.7 Bước 2: Chủ sân quét QR trên máy của họ (POST /checkin/scan là API của chủ sân).
  // Người chơi chỉ kiểm tra lại trạng thái vé từ BE.
  const handleGateScanCheckIn = async () => {
    setIsScanningCheckIn(true)
    setScanError(null)
    try {
      const ticket = await fetchTicket()
      if (ticket) setTicketData(ticket)
      if (String(ticket?.status).toUpperCase() !== 'CHECKED_IN') {
        setScanError('Vé chưa được check-in. Hãy đưa mã QR (hoặc mã vé dự phòng) cho chủ sân quét tại quầy.')
        return
      }
      const cleanCode = (ticket.ticketCode || '').replace('#', '').trim()
      // Phiên chơi lưu trên máy để mở phần đánh giá sau trận
      localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify({
        courtId: ticket.gate || '—',
        courtName: ticket.courtName || '—',
        sport: ticket.sport || '—',
        ticketCode: cleanCode,
        checkInDone: true,
        checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        checkOutDone: false,
        checkOutTime: null,
        coPlayers: matchParticipants.map((p) => ({ id: p.id, name: p.name || p.email.split('@')[0], email: p.email, role: p.role || 'Bạn chơi cùng sân' })),
      }))
      setToastMessage('🎉 Vé đã được check-in. Chúc bạn chơi vui!')
    } catch (err) {
      setScanError(err?.message || 'Không kiểm tra được trạng thái vé, vui lòng thử lại.')
    } finally {
      setIsScanningCheckIn(false)
    }
  }

  // Hủy đơn và hoàn tiền (Image 2)
  const isCancelled = String(ticketData?.status || '').toUpperCase() === 'CANCELLED'
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

    try {
      const bookingId = ticketData?.id
      if (!bookingId) throw new Error('Không tìm thấy đơn đặt sân để hủy.')
      // Số tiền hoàn lấy từ kết quả BE (BE áp dụng quy định 24h theo giờ server), không tự đoán ở FE
      const result = await cancelBooking(bookingId, {
        reasonCode: selectedReasonCode,
        reason: finalReason,
      })
      const extraSiblingIds = (ticketData?.groupedBookingIds || []).filter(
        (gid) => gid && String(gid).toLowerCase() !== String(bookingId).toLowerCase()
      )
      let extraRefund = 0
      if (extraSiblingIds.length > 0) {
        const siblingResults = await Promise.allSettled(
          extraSiblingIds.map((gid) => cancelBooking(gid, { reasonCode: selectedReasonCode, reason: finalReason }))
        )
        extraRefund = siblingResults.reduce(
          (sum, r) => sum + (r.status === 'fulfilled' ? Number(r.value?.refundAmount) || 0 : 0),
          0
        )
      }
      const refundAmount = (Number(result?.refundAmount) || 0) + extraRefund
      const isEligibleRefund = refundAmount > 0
      const refundText = `${refundAmount.toLocaleString('vi-VN')} đ`
      const facilityLabel = ticketData?.venueName && ticketData.venueName !== '—' ? ticketData.venueName : 'sân'

      // Tiền hoàn do backend xử lý; báo các thành phần đang hiển thị số dư tải lại ví.
      if (isEligibleRefund) window.dispatchEvent(new Event('escrow_balance_updated'))

      setTicketData((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev))
      setShowCancelModal(false)

      window.dispatchEvent(
        new CustomEvent('player_new_notification', {
          detail: {
            id: uid('cancel'),
            type: 'booking',
            icon: 'cancel',
            color: '#DC2626',
            bg: '#FEE2E2',
            title: `Đã hủy đơn đặt sân (CANCELLED) • ${isEligibleRefund ? 'Hoàn 100%' : 'Không hoàn tiền'}`,
            message: `Đơn tại ${facilityLabel} đã được hủy thành công. Lý do: ${finalReason}.`,
            details: isEligibleRefund
              ? `Hủy trước ca >= 24h: Đã hoàn ${refundText} vào Ví Escrow.`
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
          ? `✅ Đã hủy đơn thành công! Hoàn ${refundText} vào ví Escrow.`
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
  // Đã check-in: theo trạng thái vé từ BE (chủ sân quét QR trên máy của họ)
  const checkInDone = String(ticketData?.status || '').toUpperCase() === 'CHECKED_IN'
  // Trạng thái check-out (ghi nhận trên máy) theo mã vé đang xem
  const currentTicketCode = (ticketData?.ticketCode || '').replace('#', '').trim()
  const [checkedOutCode, setCheckedOutCode] = useState(null)
  const storedCheckOutDone = useMemo(() => {
    if (!checkInDone || !currentTicketCode) return false
    try {
      const saved = JSON.parse(localStorage.getItem('sportnexus_last_checkout_session') || 'null')
      return Boolean(saved?.ticketCode === currentTicketCode && saved?.checkOutDone)
    } catch {
      return false // dữ liệu cũ hỏng thì coi như chưa check-out
    }
  }, [checkInDone, currentTicketCode])
  const checkOutDone = checkInDone && Boolean(currentTicketCode) && (checkedOutCode === currentTicketCode || storedCheckOutDone)

  // Tự hỏi lại BE mỗi 20 giây khi vé chưa check-in (chủ sân quét trên máy của họ)
  useEffect(() => {
    const status = String(ticketData?.status || '').toUpperCase()
    if (!ticketData?.id || ['CHECKED_IN', 'CANCELLED'].includes(status)) return undefined
    const timer = setInterval(() => {
      fetchTicket()
        .then((ticket) => {
          if (!ticket) return
          setTicketData(ticket)
          if (String(ticket.status).toUpperCase() === 'CHECKED_IN') setToastMessage('🎉 Chủ sân đã quét vé, bạn đã check-in thành công!')
        })
        .catch(() => { /* lỗi mạng tạm thời: thử lại ở lượt sau */ })
    }, 20000)
    return () => clearInterval(timer)
  }, [ticketData?.id, ticketData?.status, fetchTicket])

  // Modal Check-out và Đánh giá sau trận
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [rightTab, setRightTab] = useState('rating') // 'rating' | 'history'
  // Người cùng check-in trong trận này mà mình chưa chấm Fair Play (GET /api/v1/fair-play/pending-ratings)
  const [ticketPending, setTicketPending] = useState(null)
  useEffect(() => {
    if (!checkInDone || !ticketData?.id) return undefined
    let cancelled = false
    getPendingFairPlayRatings()
      .then((list) => {
        if (!cancelled) setTicketPending(list.find((m) => String(m.contextId) === String(ticketData.id)) || null)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [checkInDone, ticketData?.id])

  // Lịch sử check-in của tôi (GET /api/v1/checkin/history)
  const [checkInHistory, setCheckInHistory] = useState({ items: [], totalItems: 0 })
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  useEffect(() => {
    let cancelled = false
    getMyCheckInHistory({ pageSize: 20 })
      .then((res) => !cancelled && setCheckInHistory(res))
      .catch(() => {})
      .finally(() => !cancelled && setIsLoadingHistory(false))
    return () => { cancelled = true }
  }, [checkInDone])

  // Share QR modal states with participant deletion support
  const [showShareModal, setShowShareModal] = useState(false)
  const [matchParticipants, setMatchParticipants] = useState([])
  const [emailInput, setEmailInput] = useState('')


  // Mã dự phòng khi camera của chủ sân lỗi: chính là mã QR của vé (chủ sân nhập tay ở trang Quét QR)
  const handleCopyOTP = async () => {
    if (!ticketData?.qrCode) {
      setToastMessage('⚠️ Chưa có mã vé để sao chép.')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    try {
      await navigator.clipboard.writeText(ticketData.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setToastMessage('⚠️ Trình duyệt chặn sao chép, hãy đọc mã cho chủ sân.')
      setTimeout(() => setToastMessage(null), 3000)
    }
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

  // Xử lý xác nhận Check-out trả sân (ghi nhận trên máy, BE không có bước check-out)
  const handleConfirmCheckOut = () => {
    setShowCheckOutModal(false)
    setCheckedOutCode(currentTicketCode)
    const checkOutTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    try {
      const saved = JSON.parse(localStorage.getItem('sportnexus_last_checkout_session') || '{}') || {}
      localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify({
        ...saved,
        ticketCode: (ticketData?.ticketCode || '').replace('#', '').trim(),
        courtName: ticketData?.courtName || '—',
        checkInDone: true,
        checkOutDone: true,
        checkOutTime,
      }))
    } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
    setRightTab('rating')
    setToastMessage(`🎉 Check-out trả sân thành công lúc ${checkOutTime}! Mời bạn đánh giá bạn chơi cùng sân.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

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


  // Lịch sử check-in thật (GET /api/v1/checkin/history)
  const TICKET_TYPES = { BOOKING: 'Vé đặt sân', LFG: 'Vé kèo LFG', TOURNAMENT: 'Vé giải đấu' }
  const historyList = checkInHistory.items.map((h) => ({
    id: h.id,
    time: `${dateVN(h.checkedInAt)}, ${clockVN(h.checkedInAt)}`,
    location: [h.facilityName, h.courtName].filter(Boolean).join(' · ') || '—',
    sport: h.sportName || '—',
    sportColor: h.type === 'BOOKING' ? 'cyan' : 'green',
    sportIcon: 'sports',
    amount: TICKET_TYPES[h.type] || h.type,
    status: h.type === 'TOURNAMENT' ? (h.tournamentName || 'Giải đấu') : `Ca ${clockVN(h.startTime)} - ${clockVN(h.endTime)}`,
    authMethod: 'Quét QR tại cổng',
    authIcon: 'qr',
    isLate: h.isLate,
  }))

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
              const time = b.startTime && b.endTime ? `${clockVN(b.startTime)} - ${clockVN(b.endTime)} ${dateVN(b.startTime)}` : (b.timeSlot || 'Hôm nay')
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
                  <span>🕒 {(ticketType === 'booking' && ticketData?.timeRangeLabel) || `${ticketData?.startTime || '—'} - ${ticketData?.endTime || '—'}`}</span>
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

              {/* Mã QR thật của vé (qrCode do BE cấp); chủ sân quét mã này tại cổng để check-in */}
              {ticketData?.qrCode ? (
                <div style={{ background: '#ffffff', borderRadius: 14, padding: 12 }}>
                  <QRCodeSVG value={ticketData.qrCode} size={166} level="M" />
                </div>
              ) : (
                <div style={{ width: 190, height: 190, display: 'grid', placeItems: 'center', background: '#ffffff', borderRadius: 14, color: '#6b7280', fontSize: 12, textAlign: 'center', padding: 12 }}>Chưa có mã vé</div>
              )}
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
                    {(ticketType === 'booking' && ticketData?.timeRangeLabel) || `${ticketData?.startTime || '—'} - ${ticketData?.endTime || '—'}`}
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
                    {(ticketType === 'booking' && ticketData?.timeRangeLabel) || `${ticketData?.allowedCheckInStart || '—'} - ${ticketData?.allowedCheckInEnd || '—'}`}
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
                MÃ VÉ DỰ PHÒNG (NẾU CAMERA LỖI)
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '1px',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  marginTop: '2px',
                }}
              >
                {ticketData?.qrCode || '—'}
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
                <span>Lịch Sử Check-in ({checkInHistory.totalItems})</span>
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

          {/* ================= TAB 1: ĐÁNH GIÁ BẠN CHƠI CÙNG SÂN (GET /api/v1/fair-play/pending-ratings) ================= */}
          {rightTab === 'rating' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px', letterSpacing: '0.4px' }}>
                  HỆ THỐNG FAIRPLAY SPORTNEXUS
                </span>
                <h3 style={{ margin: '8px 0 2px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Đánh giá bạn chơi cùng sân</h3>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Chỉ chấm được những người <strong>đã cùng check-in</strong> trong trận này, mỗi người một lần.
                </div>
              </div>

              {!checkInDone ? (
                <div style={{ padding: '22px', borderRadius: '16px', border: '1.5px dashed #CBD5E1', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '34px', color: '#D97706' }}>lock_clock</span>
                  <div style={{ fontWeight: 800, color: '#1E293B', margin: '6px 0 4px' }}>Đánh giá đang khóa</div>
                  Đưa mã QR cho chủ sân quét để check-in, sau đó bạn có thể chấm Fair Play cho bạn chơi.
                </div>
              ) : !ticketPending || ticketPending.players.length === 0 ? (
                <div style={{ padding: '22px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '34px', color: '#15803D' }}>task_alt</span>
                  <div style={{ fontWeight: 800, color: '#1E293B', margin: '6px 0 4px' }}>Không có ai chờ bạn chấm điểm</div>
                  Trận này chưa có người khác check-in, hoặc bạn đã chấm hết.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Hạn chấm điểm: <strong>{clockVN(ticketPending.ratingDeadline)} {dateVN(ticketPending.ratingDeadline)}</strong>
                  </div>
                  {ticketPending.players.map((p) => (
                    <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <img
                        src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=DCFCE7&color=15803D`}
                        alt={p.fullName}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{p.fullName}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>Đã cùng check-in • Chưa được bạn chấm</div>
                      </div>
                    </div>
                  ))}
                  <Link
                    to={`/post-match-rating?contextId=${ticketPending.contextId}`}
                    style={{ marginTop: '4px', padding: '11px 18px', borderRadius: '12px', background: '#15803D', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px', textAlign: 'center' }}
                  >
                    Chấm Fair Play ({ticketPending.players.length} người)
                  </Link>
                </div>
              )}
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
                    Lịch Sử Check-in Của Tôi
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
                  {checkInHistory.totalItems} lượt check-in
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
                        LOẠI VÉ
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
                        ĐÚNG GIỜ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {historyList.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: '18px 4px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>{isLoadingHistory ? 'Đang tải lịch sử…' : 'Bạn chưa có lượt check-in nào.'}</td></tr>
                    )}
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

                          {/* 3. LOẠI VÉ */}
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
                                {item.isLate ? '⏰' : '✓'}
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
                                {item.isLate ? 'Check-in muộn' : 'Đúng giờ'}
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
                    <span>{isScanningCheckIn ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái check-in'}</span>
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
                        Chưa có người nhận. Nhập email ở trên để thêm người chơi.
                      </span>
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
              Bạn đang trả sân <strong>{ticketData?.venueName} - {ticketData?.courtName}</strong>. Sau khi check-out thành công, hệ thống sẽ mở quyền viết nhận xét và chấm sao cho bạn chơi cùng sân.
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
                    Bạn sẽ nhận lại <strong>100% tiền ({new Intl.NumberFormat('vi-VN').format(ticketData?.escrowAmount || 0)} đ)</strong> vào Ví Escrow ngay sau khi hủy.
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
                    const rawStatusUpper = String(item.bookingStatus || status || 'CONFIRMED').toUpperCase()
                    const isGreenStatus = rawStatusUpper === 'CONFIRMED' || rawStatusUpper === 'PAID' || rawStatusUpper === 'CHECKED_IN' || rawStatusUpper === 'COMPLETED'
                    const badgeStyleOverride = {
                      background: isGreenStatus ? '#DCFCE7' : rawStatusUpper === 'CANCELLED' ? '#FEE2E2' : '#EFF6FF',
                      color: isGreenStatus ? '#15803D' : rawStatusUpper === 'CANCELLED' ? '#B91C1C' : '#1D4ED8',
                    }
                    const formattedDate = item.playDate || (item.startTime ? dateVN(item.startTime) : '') || date
                    const formattedTime = item.displayTimeRange || (item.startTime && item.endTime ? `${clockVN(item.startTime)} - ${clockVN(item.endTime)}` : time)

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
                                ...badgeStyleOverride,
                              }}
                            >
                              {formatBookingStatusLabel(rawStatusUpper)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
                              📅 {formattedDate} • ⏰ {formattedTime}
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
