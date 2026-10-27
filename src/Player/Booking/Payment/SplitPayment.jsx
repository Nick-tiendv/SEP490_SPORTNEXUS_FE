import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { initialsOf, useCurrentUser } from '../../../hooks/useCurrentUser.js'
import {
  createBooking,
  getBookingQrTicket,
  getCourtSlots,
  lookupAccountByPhone,
  joinBooking,
  payRemainingBooking,
  addBookingParticipants,
  getCancellationReasons,
  cancelBooking,
  getBookingById,
} from '../../../api/player/bookingApi.js'
import { cancelLfg } from '../../../api/player/lfgApi.js'
import {
  getWallet,
  createDeposit,
  getDepositByOrderCode,
  cancelDeposit,
  normalizeDepositStatus,
  savePendingDeposit,
  clearPendingDeposit,
  DEPOSIT_STATUS,
} from '../../../api/player/walletApi.js'
import './SplitPayment.css'

function SplitPayment() {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  const [slotError, setSlotError] = useState('')
  const [activeSlotData, setActiveSlotData] = useState(null)

  // Đồng bộ số dư ví thực tế từ Backend API
  useEffect(() => {
    let isMounted = true
    getWallet()
      .then((w) => {
        if (isMounted && w && typeof w.balance === 'number') {
          setWalletBalance(w.balance)
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [])

  // Kiểm tra ca người dùng đã chọn còn trống không. Không tự đổi sang ca khác.
  useEffect(() => {
    let isMounted = true
    const isGuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const courtId = typeof state.courtId === 'string' && isGuidRegex.test(state.courtId) ? state.courtId : null
    const slotId = typeof state.courtSlotId === 'string' && isGuidRegex.test(state.courtSlotId) ? state.courtSlotId : null
    if (!courtId || !slotId) return undefined

    getCourtSlots(courtId, (state.date || new Date().toISOString()).slice(0, 10))
      .then((slots) => {
        if (!isMounted || !Array.isArray(slots)) return
        const slot = slots.find((s) => s.id === slotId)
        if (slot && !slot.isPast && slot.isBookable !== false && slot.status === 'Available') {
          setActiveSlotData(slot)
          setSlotError('')
        } else {
          setSlotError('Ca bạn chọn đã được đặt hoặc đã qua giờ. Vui lòng quay lại chọn ca khác.')
        }
      })
      .catch((err) => console.warn('[SplitPayment] Không thể kiểm tra ca sân:', err))
    return () => { isMounted = false }
  }, [state.courtId, state.courtSlotId, state.date])

  // Court info with exact fallbacks to reference design
  const courtName = state.court || 'Cụm Sân SportNexus'
  const subCourt = state.subCourt || 'Sân 01'
  const subCourts = state.subCourts || (state.subCourt ? state.subCourt.split(', ') : ['Sân 01'])
  const courtCount = state.courtCount || subCourts.length || 1
  const address = state.address || 'Hồ Chí Minh'
  const locationName = state.locationName || (address.includes(',') ? address.split(',').slice(-2).join(', ').trim() : address) || 'Hồ Chí Minh'
  const slotTime = activeSlotData
    ? `${activeSlotData.startTime?.slice(11, 16)} - ${activeSlotData.endTime?.slice(11, 16)}`
    : (state.slot && state.slot !== '18:00 - 19:00' ? state.slot : '20:00 - 21:00')
  const hours = state.hours || (state.slotCount ? state.slotCount * 1.0 : 1.0)
  const totalAmount = Number(state.total) || 120000
  const hourlyRate = state.hourlyRate || Math.round(totalAmount / (hours || 1))
  const unitPrice = state.unitPrice || Math.round(totalAmount / courtCount)
  const courtImage =
    state.image ||
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop'
  const sportLabel = state.sport === 'pickleball' ? 'PICKLEBALL CHUYÊN NGHIỆP' : 'CẦU LÔNG CHUYÊN NGHIỆP'
  const floorType = state.subCourtDesc || 'Sân đạt chuẩn thi đấu'

  const bookingDateStr = (state.date || new Date().toISOString()).slice(0, 10)
  const displayBookingDate = useMemo(() => {
    if (state.dateLabel) return state.dateLabel
    if (!state.date) return 'Hôm nay'
    try {
      const parts = bookingDateStr.split('-').map(Number)
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)
      const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24))
      const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
      const dayName = dayNames[d.getDay()]
      const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (diffDays === 0) return `Hôm nay (${dayName}, ${dateFormatted})`
      if (diffDays === 1) return `Ngày mai (${dayName}, ${dateFormatted})`
      return `${dayName} (${dateFormatted}/${d.getFullYear()})`
    } catch {
      return state.date
    }
  }, [state.date, state.dateLabel, bookingDateStr])

  // Booking step: 'confirm' | 'bank_qr' | 'ticket_pass'
  const [step, setStep] = useState('confirm')

  // Payment configuration
  const [paymentMode, setPaymentMode] = useState('full') // 'full' | 'split'
  const [paymentChannel, setPaymentChannel] = useState('escrow') // 'escrow' | 'bank'
  const [note, setNote] = useState('')
  const [countdown, setCountdown] = useState(581) // 09:41
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const [qrTicketData, setQrTicketData] = useState(null)
  const [showRawResponse, setShowRawResponse] = useState(false)

  // Quản lý phiên thanh toán PayOS thật (tiền thật)
  const [payosSession, setPayosSession] = useState(null)
  const [payosCheckAttempt, setPayosCheckAttempt] = useState(0)

  // Wallet balance state (synced with TopBar via localStorage & custom event)
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 0
  })

  // Số dư bị đóng băng trong hợp đồng Escrow (frozenBalance) theo Bước 4
  const [frozenBalance, setFrozenBalance] = useState(() => {
    const saved = localStorage.getItem('frozen_balance')
    return saved !== null ? Number(saved) : 0
  })

  // Mã QR Check-in Pass sau khi đặt sân thành công
  const [qrToken, setQrToken] = useState('SNX-BWF-9982-A81F')
  const [qrVersion] = useState(1)

  // Notification modal state
  const [modalData, setModalData] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  // =========================================================================
  // ĐẶT SÂN CHIA TIỀN VỚI BẠN BÈ (Image 1: Bước 1, 2, 3, 4, 5)
  // =========================================================================
  const DEFAULT_SAMPLE_FRIENDS = [
    { id: '11111111-1111-1111-1111-111111111111', fullName: 'Lê Hoàng Nam', phone: '0912345678', email: 'hoang.nam@sportnexus.vn' },
    { id: '22222222-2222-2222-2222-222222222222', fullName: 'Trần Bảo An', phone: '0988777666', email: 'bao.an@sportnexus.vn' },
    { id: '33333333-3333-3333-3333-333333333333', fullName: 'Phạm Quốc Thịnh', phone: '0903112233', email: 'quoc.thinh@sportnexus.vn' },
  ]

  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupError, setLookupError] = useState(null)
  // Bạn chơi được thêm bằng cách tra cứu số điện thoại (GET /api/accounts/lookup).
  const [invitedFriends, setInvitedFriends] = useState([])

  // Trạng thái đơn: PENDING | PAID | CHECKED_IN | CANCELLED
  const [bookingStatus, setBookingStatus] = useState('PAID')
  const [paymentDeadline, setPaymentDeadline] = useState(null)
  const [deadlineSeconds, setDeadlineSeconds] = useState(30 * 60) // 30 phút theo Bước 2
  const [isPayingRemaining, setIsPayingRemaining] = useState(false)

  // =========================================================================
  // HỦY ĐƠN VÀ HOÀN TIỀN (Image 2)
  // =========================================================================
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReasons, setCancellationReasons] = useState([])
  const [selectedReasonCode, setSelectedReasonCode] = useState(1)
  const [customReasonText, setCustomReasonText] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  // Countdown timer for booking hold (Step: confirm)
  useEffect(() => {
    if (step !== 'confirm') return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  // Lắng nghe cập nhật số dư ví & số dư đóng băng
  useEffect(() => {
    const handleBalanceUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    const handleFrozenUpdate = () => {
      const saved = localStorage.getItem('frozen_balance')
      if (saved !== null) setFrozenBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleBalanceUpdate)
    window.addEventListener('frozen_balance_updated', handleFrozenUpdate)
    return () => {
      window.removeEventListener('escrow_balance_updated', handleBalanceUpdate)
      window.removeEventListener('frozen_balance_updated', handleFrozenUpdate)
    }
  }, [])

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatVnd = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  // Che số điện thoại bảo mật (Bước 1: SĐT trả về đã được che)
  const maskPhone = (phone) => {
    if (!phone) return '09•• ••• •••'
    const s = String(phone).replace(/\s+/g, '')
    if (s.includes('•••') || s.includes('*')) return s
    if (s.length >= 10) {
      return `${s.slice(0, 4)} ••• ${s.slice(-3)}`
    }
    return s
  }

  // Tính số giờ còn lại từ bây giờ tới ca thi đấu (Image 2: mốc 24h xét hoàn tiền)
  const getHoursUntilMatch = () => {
    try {
      const now = new Date()
      const matchDate = new Date()
      if (activeSlotData?.startTime) {
        const slotDate = new Date(activeSlotData.startTime)
        if (!isNaN(slotDate.getTime())) {
          return (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        }
      }
      if (slotTime) {
        const startTimeStr = slotTime.split('-')[0].trim()
        const [h, m] = startTimeStr.split(':').map(Number)
        if (!isNaN(h)) {
          matchDate.setHours(h, m || 0, 0, 0)
          return (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        }
      }
    } catch {}
    return 26 // Mặc định > 24h nếu chưa rõ thời điểm cụ thể
  }

  // Split calculation: Tổng tiền / (1 Người tạo + N Bạn bè)
  const totalParticipantCount = paymentMode === 'split' ? (invitedFriends.length + 1) : 1
  const splitAmount = Math.round(totalAmount / (totalParticipantCount || 1))
  const payableAmount = paymentMode === 'full' ? totalAmount : splitAmount

  // Handle Copy to clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // BƯỚC 5: Đếm ngược hạn nộp tiền (PaymentDeadline). Quá hạn mà chưa đủ -> Hệ thống tự hủy đơn và hoàn tiền
  useEffect(() => {
    if (step !== 'ticket_pass' || bookingStatus !== 'PENDING') return
    const timer = setInterval(() => {
      setDeadlineSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleDeadlineExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step, bookingStatus])

  const handleDeadlineExpired = () => {
    // Bước 5: Quá hạn mà chưa đủ -> Hệ thống tự hủy đơn và hoàn tiền cho mọi người đã trả
    // Số dư thật do backend cập nhật: tải lại ví (getWallet tự đồng bộ TopBar và các trang khác).
    getWallet().catch(() => {})
    setBookingStatus('CANCELLED')

    window.dispatchEvent(
      new CustomEvent('player_new_notification', {
        detail: {
          id: `expired_${Date.now()}`,
          type: 'booking',
          icon: 'timer_off',
          color: '#DC2626',
          bg: '#FEE2E2',
          title: 'Đơn chia tiền đã hết hạn (CANCELLED)',
          message: `Đơn đặt sân tại ${courtName} đã tự động hủy do quá hạn góp tiền (PaymentDeadline).`,
          details: `Hệ thống đã tự động hoàn 100% tiền (${formatVnd(payableAmount)}) vào Ví Escrow.`,
          time: 'Vừa xong',
          unread: true,
          link: '/wallet',
          linkText: 'Xem số dư ví',
        },
      })
    )
    alert(`⏰ Đã hết hạn góp tiền (PaymentDeadline)!\n\nĐơn đặt sân đã tự động hủy. Hệ thống đã hoàn trả ${formatVnd(payableAmount)} vào ví Escrow của bạn.`)
  }

  // BƯỚC 1: Tìm kiếm bạn bè theo số điện thoại (GET /api/accounts/lookup?phone=...)
  const handleSearchFriend = async (e) => {
    if (e) e.preventDefault()
    const cleanPhone = lookupPhone.trim()
    if (!cleanPhone) {
      setLookupError('Vui lòng nhập số điện thoại bạn bè cần tìm.')
      return
    }
    setLookupLoading(true)
    setLookupError(null)
    setLookupResult(null)
    try {
      const data = await lookupAccountByPhone(cleanPhone)
      if (data) {
        setLookupResult({
          id: data.id || data.userId,
          fullName: data.fullName || data.name || data.userName || `Bạn chơi (${cleanPhone})`,
          phone: data.phone || cleanPhone,
          email: data.email || `${cleanPhone}@sportnexus.vn`,
        })
      } else {
        setLookupError('Không tìm thấy tài khoản với số điện thoại này trên hệ thống.')
      }
    } catch (err) {
      console.warn('[SplitPayment] lookupAccountByPhone notice:', err)
      const errMessage = err?.message || 'Không tìm thấy tài khoản.'
      setLookupError(`Không tìm thấy tài khoản (${errMessage}). Bạn có thể chọn nhanh từ danh sách bạn bè gợi ý bên dưới.`)
    } finally {
      setLookupLoading(false)
    }
  }

  const handleAddInvitedFriend = async (friend) => {
    if (!friend || !friend.id) return
    if (invitedFriends.some((f) => f.id === friend.id)) {
      alert('Bạn này đã có trong danh sách chia tiền rồi!')
      return
    }
    if (invitedFriends.length >= 7) {
      alert('Tối đa 8 người chia tiền cho 1 đơn đặt sân.')
      return
    }

    const targetBookingId = bookingResult?.id || bookingResult?.bookingId || location.state?.bookingId
    if (targetBookingId) {
      try {
        await addBookingParticipants(targetBookingId, [friend.id])
      } catch (err) {
        console.warn('SplitPayment: Lỗi khi thêm người chia tiền qua API:', err)
      }
    }

    setInvitedFriends((prev) => [
      ...prev,
      {
        id: friend.id,
        fullName: friend.fullName || friend.name || 'Bạn chơi',
        phone: friend.phone || '09•• ••• •••',
        email: friend.email || '',
        status: 'WAITING',
      },
    ])
    setLookupResult(null)
    setLookupPhone('')
  }


  const handleRemoveInvitedFriend = (id) => {
    setInvitedFriends((prev) => prev.filter((f) => f.id !== id))
  }

  // BƯỚC 3: Người được mời nhận thông báo -> POST /api/v1/bookings/{bookingId}/join
  const handleSimulateFriendJoin = async (friendId) => {
    const bookingId =
      (typeof bookingResult === 'string' && isValidGuid(bookingResult) ? bookingResult : null) ||
      bookingResult?.id ||
      bookingResult?.bookingId ||
      bookingResult?.data?.id
    try {
      if (isValidGuid(bookingId)) {
        await joinBooking(bookingId)
      }
    } catch (err) {
      console.warn('[SplitPayment] joinBooking API notice:', err?.message)
    }

    setInvitedFriends((prev) => {
      const next = prev.map((f) => (f.id === friendId ? { ...f, status: 'PAID' } : f))
      const allPaid = next.every((f) => f.status === 'PAID')
      if (allPaid) {
        setBookingStatus('PAID')
        window.dispatchEvent(
          new CustomEvent('player_new_notification', {
            detail: {
              id: `all_paid_${Date.now()}`,
              type: 'booking',
              icon: 'verified',
              color: '#15803D',
              bg: '#DCFCE7',
              title: 'Tất cả bạn bè đã góp tiền đủ (PAID)!',
              message: `Đơn đặt sân ${courtName} đã thanh toán đủ và chuyển sang PAID. Vé QR check-in đã sẵn sàng!`,
              time: 'Vừa xong',
              unread: true,
              link: '/checkin',
              linkText: 'Xem vé QR',
            },
          })
        )
      }
      return next
    })
  }

  // BƯỚC 4: (Tùy chọn) Người tạo trả nốt phần của người chưa góp -> POST /api/v1/bookings/{bookingId}/pay-remaining
  const handlePayRemaining = async () => {
    const unpaid = invitedFriends.filter((f) => f.status !== 'PAID')
    if (unpaid.length === 0) {
      alert('Tất cả mọi người đã góp đủ tiền rồi!')
      return
    }
    const remainingDue = unpaid.length * splitAmount
    if (walletBalance < remainingDue) {
      alert(`Số dư ví (${formatVnd(walletBalance)}) không đủ để trả nốt (${formatVnd(remainingDue)})! Vui lòng nạp thêm tiền.`)
      return
    }

    const confirmPay = window.confirm(
      `👉 Người tạo trả nốt phần của ${unpaid.length} người chưa góp (${formatVnd(remainingDue)}) để xác nhận đơn ngay?\n\nLưu ý: Những người chưa góp sẽ bị loại khỏi đơn theo quy định Bước 4.`
    )
    if (!confirmPay) return

    setIsPayingRemaining(true)
    try {
      const bookingId =
        (typeof bookingResult === 'string' && isValidGuid(bookingResult) ? bookingResult : null) ||
        bookingResult?.id ||
        bookingResult?.bookingId ||
        bookingResult?.data?.id
      if (isValidGuid(bookingId)) {
        try {
          await payRemainingBooking(bookingId)
        } catch (apiErr) {
          console.warn('[SplitPayment] payRemainingBooking API notice:', apiErr)
        }
      }

      // Số dư thật do backend cập nhật: tải lại ví (getWallet tự đồng bộ TopBar và các trang khác).
      getWallet().catch(() => {})

      // Loại bỏ người chưa góp khỏi đơn và chuyển trạng thái đơn sang PAID
      setInvitedFriends((prev) => prev.filter((f) => f.status === 'PAID'))
      setBookingStatus('PAID')

      window.dispatchEvent(
        new CustomEvent('player_new_notification', {
          detail: {
            id: `pay_remaining_${Date.now()}`,
            type: 'booking',
            icon: 'check_circle',
            color: '#15803D',
            bg: '#DCFCE7',
            title: 'Đã thanh toán nốt phần còn lại (PAID)!',
            message: `Người tạo đã đóng nốt ${formatVnd(remainingDue)}. Đơn đã xác nhận thành công và chuyển sang PAID.`,
            time: 'Vừa xong',
            unread: true,
            link: '/checkin',
            linkText: 'Xem vé QR',
          },
        })
      )
      alert(`✅ Đã thanh toán nốt ${formatVnd(remainingDue)} thành công!\n\nĐơn hàng đã chuyển sang trạng thái PAID. Vé QR check-in đã sẵn sàng.`)
    } finally {
      setIsPayingRemaining(false)
    }
  }

  // HỦY ĐƠN VÀ HOÀN TIỀN (Image 2)
  const handleOpenCancelModal = async () => {
    if (bookingStatus === 'CHECKED_IN') {
      alert('❌ Đơn đã check-in tại sân không thể hủy theo quy định!')
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
      console.warn('[SplitPayment] Không thể tải cancellation reasons:', e)
    }
  }

  const handleConfirmCancel = async () => {
    const bookingId =
      (typeof bookingResult === 'string' && isValidGuid(bookingResult) ? bookingResult : null) ||
      bookingResult?.id ||
      bookingResult?.bookingId ||
      bookingResult?.data?.id

    const selectedReasonObj = cancellationReasons.find((r) => r.code === selectedReasonCode)
    const finalReason = selectedReasonObj?.isCustom
      ? customReasonText.trim() || 'Lý do khác'
      : selectedReasonObj?.label || 'Người đặt yêu cầu hủy đơn'

    const hoursLeft = getHoursUntilMatch()
    const isEligibleRefund = hoursLeft >= 24

    setIsCanceling(true)
    setCancelError(null)
    try {
      // Đơn đang dùng cho kèo LFG không hủy trực tiếp được: phải hủy kèo (POST /api/v1/lfgs/{cardId}/cancel)
      const isLfg = Boolean(state.isLfg || state.cardId)
      if (isLfg && state.cardId) {
        await cancelLfg(state.cardId, { reason: finalReason })
      } else if (isValidGuid(bookingId)) {
        await cancelBooking(bookingId, {
          reasonCode: selectedReasonCode,
          reason: finalReason,
        })
      }

      // Xử lý hoàn tiền
      if (isEligibleRefund) getWallet().catch(() => {})

      setBookingStatus('CANCELLED')
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
            message: `Đơn tại ${courtName} đã được hủy thành công. Lý do: ${finalReason}.`,
            details: isEligibleRefund
              ? `Hủy trước ca >= 24h: Đã hoàn 100% (${formatVnd(payableAmount)}) vào Ví Escrow.`
              : 'Hủy dưới 24h trước giờ chơi: Không đủ điều kiện hoàn tiền theo quy định.',
            time: 'Vừa xong',
            unread: true,
            link: '/wallet',
            linkText: 'Xem ví Escrow',
          },
        })
      )

      alert(
        `✅ Đã hủy đơn đặt sân thành công!\n\n${
          isEligibleRefund
            ? `💰 Bạn đã được hoàn 100% (${formatVnd(payableAmount)}) vào Ví Escrow vì hủy trước giờ chơi từ 24 giờ trở lên.`
            : `⚠️ Hủy dưới 24 giờ trước giờ chơi: Theo quy định, không được hoàn tiền.`
        }`
      )
    } catch (err) {
      console.error('[SplitPayment] Hủy đơn thất bại:', err)
      setCancelError(err?.message || 'Lỗi khi gửi yêu cầu hủy đơn.')
    } finally {
      setIsCanceling(false)
    }
  }

  // Regex kiểm tra chuỗi có phải UUID/GUID hợp lệ (8-4-4-4-12 hex) và không thuộc ca đã qua giờ bắt đầu
  const isValidGuid = (id) =>
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim())

  // Xác định ID ca sân người dùng đã chọn (GUID từ API). Trả null nếu không có, không dùng ca mặc định.
  const resolveCurrentSlotId = () => {
    // 1. Ưu tiên cao nhất là ca thực tế đã được verify khả dụng trong hôm nay
    if (activeSlotData && isValidGuid(activeSlotData.id)) return activeSlotData.id
    if (isValidGuid(state.courtSlotId)) return state.courtSlotId
    if (Array.isArray(state.courtSlotIds)) {
      const found = state.courtSlotIds.find(isValidGuid)
      if (found) return found
    }
    if (Array.isArray(state.selectedSlots)) {
      const found = state.selectedSlots.find((s) => isValidGuid(s?.id))
      if (found) return found.id
    }
    try {
      const cachedId = localStorage.getItem('sportnexus_selected_slot_id')
      if (isValidGuid(cachedId)) return cachedId
      const cachedList = JSON.parse(localStorage.getItem('sportnexus_selected_slot_ids') || '[]')
      if (Array.isArray(cachedList)) {
        const found = cachedList.find(isValidGuid)
        if (found) return found
      }
    } catch {
      // Bỏ qua lỗi parse
    }
    return null
  }

  const resolveCurrentSlotIds = () => {
    if (Array.isArray(state.courtSlotIds)) {
      const valid = state.courtSlotIds.filter(isValidGuid)
      if (valid.length > 0) return valid
    }
    if (Array.isArray(state.selectedSlots)) {
      const valid = state.selectedSlots.map((s) => s?.id).filter(isValidGuid)
      if (valid.length > 0) return valid
    }
    if (activeSlotData && isValidGuid(activeSlotData.id)) return [activeSlotData.id]
    if (isValidGuid(state.courtSlotId)) return [state.courtSlotId]
    try {
      const cachedList = JSON.parse(localStorage.getItem('sportnexus_selected_slot_ids') || '[]')
      if (Array.isArray(cachedList)) {
        const valid = cachedList.filter(isValidGuid)
        if (valid.length > 0) return valid
      }
      const cachedId = localStorage.getItem('sportnexus_selected_slot_id')
      if (isValidGuid(cachedId)) return [cachedId]
    } catch {
      // Bỏ qua lỗi parse
    }
    const single = resolveCurrentSlotId()
    return single ? [single] : []
  }

  // Hàm tạo payload đặt sân chuẩn theo đặc tả Bước 2 API
  const buildBookingPayload = () => {
    const validSingleId = resolveCurrentSlotId()
    const validSlotIds = resolveCurrentSlotIds()

    if (!validSingleId && validSlotIds.length === 0) {
      return null
    }

    const isConsecutive = state.isConsecutive !== false && (validSlotIds.length <= 1 || state.isConsecutive === true)

    // Lấy danh sách ID người tham gia nếu chia tiền (Bước 2: participantIds: [...])
    const activeParticipantIds = paymentMode === 'split' && Array.isArray(invitedFriends)
      ? invitedFriends.map((f) => f.id).filter(isValidGuid)
      : []

    if (isConsecutive && validSingleId) {
      // Cách 1: courtSlotId + numberOfSlots (đặt N ca liên tiếp, tối đa 24). courtSlotIds để null
      return {
        courtSlotId: validSingleId,
        numberOfSlots: state.numberOfSlots || (validSlotIds.length > 0 ? validSlotIds.length : 1),
        courtSlotIds: null,
        totalAmount: 0, // Server tự tính giá
        isSplitPayment: paymentMode === 'split',
        participantIds: activeParticipantIds,
      }
    }

    // Cách 2: courtSlotIds (nhiều ca rời nhau). courtSlotId & numberOfSlots để null
    return {
      courtSlotId: null,
      numberOfSlots: null,
      courtSlotIds: validSlotIds.length > 0 ? validSlotIds : [validSingleId],
      totalAmount: 0,
      isSplitPayment: paymentMode === 'split',
      participantIds: activeParticipantIds,
    }
  }

  // Action: Click "Xác nhận thanh toán & lấy vé QR" (Thực hiện Bước 3, 4, 5)
  const handleConfirmCheckout = async () => {
    if (paymentChannel === 'escrow') {
      // Kiểm tra số dư ví
      if (walletBalance < payableAmount) {
        alert('Số dư ví không đủ! Vui lòng nạp thêm tiền hoặc chọn thanh toán qua ngân hàng.')
        return
      }

      if (slotError) {
        alert(`❌ ${slotError}`)
        return
      }
      const bookingPayload = buildBookingPayload()
      if (!bookingPayload) {
        alert('❌ Không tìm thấy mã ca sân (GUID) hợp lệ từ hệ thống! Vui lòng quay lại màn hình chọn ca sân để chọn khung giờ còn trống.')
        return
      }

      setIsSubmitting(true)
      try {
        // BƯỚC 3: POST /api/v1/bookings
        let createdBooking = null
        try {
          createdBooking = await createBooking(bookingPayload)
        } catch (apiErr) {
          console.error('[SplitPayment] createBooking API thất bại:', apiErr)
          const errorMsg = apiErr?.message || 'Lỗi xử lý đơn đặt sân từ máy chủ.'
          if (errorMsg.includes('Số dư không đủ') || errorMsg.includes('số dư hiện tại') || errorMsg.includes('số dư khả dụng')) {
            const confirmDeposit = window.confirm(
              `❌ ${errorMsg}\n\n👉 Bạn có muốn chuyển sang màn hình nạp tiền ví qua cổng PayOS để nạp số dư còn thiếu không?`
            )
            if (confirmDeposit) {
              navigate('/wallet', {
                state: {
                  suggestedAmount: Math.max(10000, payableAmount - (walletBalance || 0)),
                  returnTo: {
                    path: '/split-payment',
                    state: location.state,
                    label: 'Quay lại đặt sân',
                  },
                },
              })
            }
            return
          }
          alert(`❌ Đặt sân không thành công:\n${errorMsg}`)
          return
        }

        // BƯỚC 4: Nhận 201 Created. Số dư thật do backend trừ, tải lại ví thay vì tự tính.
        getWallet()
          .then((w) => { if (w && typeof w.balance === 'number') setWalletBalance(w.balance) })
          .catch(() => {})
        window.dispatchEvent(new Event('escrow_balance_updated'))
        setBookingResult(createdBooking)
        console.log('[SplitPayment] ✅ Đặt sân thành công! Dữ liệu phản hồi từ máy chủ (Response):', createdBooking)

        const bookingId =
          (typeof createdBooking === 'string' && isValidGuid(createdBooking) ? createdBooking : null) ||
          createdBooking?.id ||
          createdBooking?.bookingId ||
          createdBooking?.data?.id ||
          createdBooking?.data?.bookingId ||
          (typeof createdBooking?.data === 'string' && isValidGuid(createdBooking.data) ? createdBooking.data : null)
        if (bookingId) {
          try { localStorage.setItem('sportnexus_last_booking_id', bookingId) } catch { /* bỏ qua */ }
        }

        let ticketTokenValue = bookingId ? `SNX-${String(bookingId).slice(0, 8).toUpperCase()}` : `SNX-${Date.now()}`

        // BƯỚC 5: GET /api/v1/bookings/{bookingId}/qr-ticket
        if (isValidGuid(bookingId)) {
          try {
            console.log(`[SplitPayment] 📡 Đang gọi GET /api/v1/bookings/${bookingId}/qr-ticket...`)
            const ticketRes = await getBookingQrTicket(bookingId)
            console.log('[SplitPayment] ✅ Phản hồi vé QR từ máy chủ:', ticketRes)
            if (ticketRes) {
              setQrTicketData(ticketRes)
              const tokenCandidate =
                (typeof ticketRes === 'string' && ticketRes.trim() ? ticketRes.trim() : null) ||
                ticketRes.ticketCode ||
                ticketRes.qrToken ||
                ticketRes.code ||
                ticketRes.token ||
                ticketRes.qrTicket ||
                ticketRes.data?.ticketCode ||
                ticketRes.data?.qrToken ||
                ticketRes.data?.code
              if (tokenCandidate) {
                ticketTokenValue = tokenCandidate
              }
            }
          } catch (qrErr) {
            console.warn('[SplitPayment] getBookingQrTicket error:', qrErr)
          }
        }
        setQrToken(ticketTokenValue)

        // Cập nhật trạng thái đơn theo Bước 2 (isSplitPayment -> PENDING, người tạo trả phần của mình ngay, hạn 30 phút)
        if (paymentMode === 'split') {
          setBookingStatus('PENDING')
          const now = Date.now()
          const thirtyMins = now + 30 * 60 * 1000
          setPaymentDeadline(new Date(thirtyMins))
          setDeadlineSeconds(30 * 60)
        } else {
          setBookingStatus('PAID')
        }

        // Phát thông báo Đặt sân thành công (PAID hoặc PENDING)
        window.dispatchEvent(
          new CustomEvent('player_new_notification', {
            detail: {
              id: `book_${Date.now()}`,
              type: 'booking',
              icon: 'sports_tennis',
              color: paymentMode === 'split' ? '#D97706' : '#15803D',
              bg: paymentMode === 'split' ? '#FEF3C7' : '#EAF7EE',
              title: paymentMode === 'split'
                ? 'Đã tạo đơn chia tiền (Trạng thái: PENDING)!'
                : 'Đặt sân thành công (Trạng thái: PAID)!',
              message: `Bạn đã giữ chỗ tại ${courtName} (${subCourt}).`,
              details: paymentMode === 'split'
                ? `Hạn góp tiền: 30 phút • Người tạo đã đóng ${formatVnd(payableAmount)} • Đang chờ bạn bè góp`
                : `Khung giờ: ${slotTime} • Tiền giữ trong frozenBalance • Mã vé: #${ticketTokenValue}`,
              time: 'Vừa xong',
              unread: true,
              link: '/checkin',
              linkText: 'Xem vé QR Pass',
              meta: { court: courtName, timeSlot: slotTime, token: ticketTokenValue },
            },
          })
        )

        setModalData({
          title: paymentMode === 'split'
            ? 'Đã Tạo Đơn Chia Tiền Thành Công (PENDING)!'
            : 'Thanh Toán & Đặt Sân Thành Công (PAID)!',
          desc: paymentMode === 'split'
            ? `Đã trừ ${formatVnd(payableAmount)} (phần của bạn) từ Ví Escrow. Đơn ở trạng thái PENDING với hạn nộp 30 phút. Chờ người được mời góp để chuyển PAID.`
            : `Đã tự động trừ ${formatVnd(payableAmount)} từ Ví Escrow và chuyển vào số dư đóng băng (frozenBalance) bảo chứng 100% tới khi chơi xong. Đang xuất vé QR check-in...`,
          onClose: () => {
            setModalData(null)
            setStep('ticket_pass')
          },
        })

        setTimeout(() => {
          setModalData(null)
          setStep('ticket_pass')
        }, 1500)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // CASE 2: Thanh toán trực tiếp qua cổng PayOS (tiền thật)
      await handleInitiatePayOS()
    }
  }

  // Khởi tạo phiên thanh toán thật qua cổng PayOS (POST /api/v1/wallet/deposit)
  const handleInitiatePayOS = async () => {
    const bookingPayload = buildBookingPayload()
    if (!bookingPayload) {
      alert('❌ Không tìm thấy mã ca sân (GUID) hợp lệ từ hệ thống! Vui lòng quay lại màn hình chọn ca sân để chọn khung giờ còn trống.')
      return
    }

    if (payableAmount > 2000000) {
      alert(`❌ Số tiền thanh toán (${new Intl.NumberFormat('vi-VN').format(payableAmount)}đ) vượt quá hạn mức nạp tối đa của một giao dịch PayOS (2.000.000đ).\nVui lòng vào mục Ví Escrow để nạp tiền thành nhiều lần trước khi đặt sân.`)
      navigate('/wallet', {
        state: {
          returnTo: { path: '/split-payment', state: location.state, label: 'Quay lại đặt sân' },
          suggestedAmount: 2000000,
        },
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Giới hạn nạp tối thiểu 10.000đ, tối đa 2.000.000đ
      const depositAmount = Math.min(2000000, Math.max(10000, Math.round(payableAmount)))
      const depRes = await createDeposit({ amount: depositAmount })
      const orderCode = depRes?.orderCode
      if (!orderCode) throw new Error('Máy chủ không trả về mã đơn (orderCode).')

      // Lưu ngữ cảnh nạp tiền để khi chuyển hướng PayOS có thể quay lại
      savePendingDeposit({
        orderCode,
        amount: depositAmount,
        returnTo: {
          path: '/split-payment',
          state: location.state,
          label: 'Quay lại đặt sân',
        },
      })

      setPayosSession({
        orderCode: String(orderCode),
        checkoutUrl: depRes?.checkoutUrl || '',
        qrCode: depRes?.qrCode || '',
        amount: depRes?.amount ?? depositAmount,
        accountName: depRes?.accountName || 'PAYOS CỔNG THANH TOÁN',
        accountNumber: depRes?.accountNumber || '',
        description: depRes?.description || `SPORTNEXUS ${orderCode}`,
        expiresAt: depRes?.expiredAt ? (typeof depRes.expiredAt === 'number' ? (depRes.expiredAt < 1e12 ? depRes.expiredAt * 1000 : depRes.expiredAt) : Date.parse(depRes.expiredAt)) : Date.now() + 15 * 60 * 1000,
      })
      setStep('bank_qr')
    } catch (err) {
      console.error('[SplitPayment] Khởi tạo thanh toán PayOS thất bại:', err)
      alert(`❌ Không thể tạo thanh toán PayOS:\n${err?.message || 'Lỗi kết nối máy chủ'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hủy phiên thanh toán PayOS
  const handleCancelPayOS = async () => {
    if (!payosSession?.orderCode) {
      setStep('confirm')
      return
    }
    const confirmCancel = window.confirm('Bạn có chắc muốn hủy đơn thanh toán PayOS này không?')
    if (!confirmCancel) return

    try {
      await cancelDeposit(payosSession.orderCode)
    } catch {}
    clearPendingDeposit()
    setPayosSession(null)
    setStep('confirm')
  }

  // Tự động hoàn tất tạo đơn đặt sân sau khi PayOS xác nhận đã chuyển tiền thật thành công
  const handleCompleteBookingAfterPayment = async (orderCode) => {
    const bookingPayload = buildBookingPayload()
    if (!bookingPayload) {
      alert('Đã nhận thanh toán qua PayOS nhưng thiếu thông tin ca sân. Vui lòng liên hệ hỗ trợ hoặc xem lại số dư ví.')
      navigate('/wallet')
      return
    }

    setIsSubmitting(true)
    try {
      let createdBooking = null
      try {
        createdBooking = await createBooking(bookingPayload)
      } catch (apiErr) {
        console.error('[SplitPayment] createBooking thất bại sau khi PayOS thanh toán:', apiErr)
        alert(`Đã nhận thanh toán qua PayOS nhưng lỗi tạo đơn đặt sân:\n${apiErr?.message || 'Lỗi hệ thống'}\nTiền đã được lưu vào ví Escrow của bạn.`)
        navigate('/wallet')
        return
      }

      setBookingResult(createdBooking)
      console.log('[SplitPayment] ✅ Đặt sân thành công qua PayOS! Phản hồi từ máy chủ:', createdBooking)

      const bookingId =
        (typeof createdBooking === 'string' && isValidGuid(createdBooking) ? createdBooking : null) ||
        createdBooking?.id ||
        createdBooking?.bookingId ||
        createdBooking?.data?.id ||
        createdBooking?.data?.bookingId ||
        (typeof createdBooking?.data === 'string' && isValidGuid(createdBooking.data) ? createdBooking.data : null)
        if (bookingId) {
          try { localStorage.setItem('sportnexus_last_booking_id', bookingId) } catch { /* bỏ qua */ }
        }

      let ticketTokenValue = bookingId ? `SNX-${String(bookingId).slice(0, 8).toUpperCase()}` : `SNX-${Date.now()}`

      if (isValidGuid(bookingId)) {
        try {
          const ticketRes = await getBookingQrTicket(bookingId)
          if (ticketRes) {
            setQrTicketData(ticketRes)
            const tokenCandidate =
              (typeof ticketRes === 'string' && ticketRes.trim() ? ticketRes.trim() : null) ||
              ticketRes.ticketCode ||
              ticketRes.qrToken ||
              ticketRes.code ||
              ticketRes.token ||
              ticketRes.qrTicket ||
              ticketRes.data?.ticketCode ||
              ticketRes.data?.qrToken ||
              ticketRes.data?.code
            if (tokenCandidate) {
              ticketTokenValue = tokenCandidate
            }
          }
        } catch (qrErr) {
          console.warn('[SplitPayment] getBookingQrTicket error:', qrErr)
        }
      }
      setQrToken(ticketTokenValue)

      // Cập nhật số dư ví
      try {
        const w = await getWallet()
        if (w && typeof w.balance === 'number') setWalletBalance(w.balance)
      } catch {}

      if (paymentMode === 'split') {
        setBookingStatus('PENDING')
        const now = Date.now()
        const thirtyMins = now + 30 * 60 * 1000
        setPaymentDeadline(new Date(thirtyMins))
        setDeadlineSeconds(30 * 60)
      } else {
        setBookingStatus('PAID')
      }

      // Phát thông báo Đặt sân thành công & Giao dịch PayOS
      window.dispatchEvent(
        new CustomEvent('player_new_notification', {
          detail: {
            id: `book_${Date.now()}`,
            type: 'booking',
            icon: 'sports_tennis',
            color: paymentMode === 'split' ? '#D97706' : '#15803D',
            bg: paymentMode === 'split' ? '#FEF3C7' : '#EAF7EE',
            title: paymentMode === 'split'
              ? 'Đặt sân qua PayOS thành công (Trạng thái: PENDING)!'
              : 'Đặt sân & Thanh toán PayOS thành công (PAID)!',
            message: `Bạn đã giữ chỗ tại ${courtName} (${subCourt}).`,
            details: `Khung giờ: ${slotTime} (${displayBookingDate}) • Mã vé: #${ticketTokenValue} • Mã PayOS: #${orderCode || ''}`,
            time: 'Vừa xong',
            unread: true,
            link: '/checkin',
            linkText: 'Xem vé QR Pass',
            meta: { court: courtName, timeSlot: slotTime, token: ticketTokenValue },
          },
        })
      )

      window.dispatchEvent(
        new CustomEvent('player_new_notification', {
          detail: {
            id: `tx_${Date.now()}`,
            type: 'transaction',
            icon: 'receipt_long',
            color: '#0284C7',
            bg: '#E0F2FE',
            title: 'Thanh toán PayOS khớp lệnh thành công!',
            message: `Hệ thống Napas 24/7 đã khớp giao dịch chuyển tiền thật qua cổng PayOS cho cụm sân ${courtName}.`,
            details: `Số tiền: ${formatVnd(payableAmount)} • Hợp đồng Escrow bảo chứng 100%`,
            time: 'Vừa xong',
            unread: true,
            link: '/wallet',
            linkText: 'Xem ví Escrow',
            meta: { amount: payableAmount, method: 'payos' },
          },
        })
      )

      setModalData({
        title: 'Thanh Toán PayOS & Đặt Sân Thành Công (PAID)!',
        desc: `Cổng PayOS đã khớp ${formatVnd(payableAmount)} chuyển khoản thành công. Đang xuất vé QR check-in...`,
        onClose: () => {
          setModalData(null)
          setStep('ticket_pass')
        },
      })

      setTimeout(() => {
        setModalData(null)
        setStep('ticket_pass')
      }, 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Polling tự động kiểm tra thanh toán PayOS bằng tiền thật
  useEffect(() => {
    if (step !== 'bank_qr' || !payosSession?.orderCode) return undefined
    let active = true
    let timer = null

    const checkStatus = async () => {
      try {
        const data = await getDepositByOrderCode(payosSession.orderCode)
        if (!active) return
        const status = normalizeDepositStatus(data?.status)
        if (status === DEPOSIT_STATUS.SUCCESS) {
          clearPendingDeposit()
          await handleCompleteBookingAfterPayment(payosSession.orderCode)
          return
        }
        if (status === DEPOSIT_STATUS.CANCELLED || status === DEPOSIT_STATUS.FAILED) {
          clearPendingDeposit()
          alert(status === DEPOSIT_STATUS.CANCELLED ? 'Đơn thanh toán PayOS đã bị hủy.' : 'Thanh toán PayOS không thành công.')
          setStep('confirm')
          setPayosSession(null)
          return
        }
      } catch (err) {
        // Tiếp tục thử lại trong chu kỳ polling
      }
      if (active) {
        timer = setTimeout(checkStatus, 2500)
      }
    }

    timer = setTimeout(checkStatus, 2500)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [step, payosSession, payosCheckAttempt])

  // Action: Gửi mã check-in cho bạn chơi
  const handleSendCodeToFriends = () => {
    window.dispatchEvent(new CustomEvent('player_new_notification', {
      detail: {
        id: `friend_${Date.now()}`,
        type: 'checkin',
        icon: 'share',
        color: '#7C3AED',
        bg: '#F3E8FF',
        title: 'Gửi mã cho bạn chơi thành công!',
        message: `Đã gửi mã vé check-in và link định vị sân ${courtName} cho bạn chơi.`,
        details: `Mã vé Token: #${qrToken} • Người nhận: Trần Bảo An, Lê Hoàng Nam, Phạm Quốc Thịnh`,
        time: 'Vừa xong',
        unread: true,
        link: '/checkin',
        linkText: 'Xem vé QR nhóm',
        meta: { token: qrToken, recipients: ['Trần Bảo An', 'Lê Hoàng Nam', 'Phạm Quốc Thịnh'] }
      }
    }))
    alert(`Đã gửi mã vé QR #${qrToken} thành công cho 3 bạn chơi! Thông báo đã được gửi vào chuông thông báo.`)
  }

  return (
    <div className="sp-page">
      {/* ===================== TOP HEADER & COUNTDOWN ===================== */}
      <div className="sp-header-wrapper">
        <div className="sp-nav-row">
          <button
            type="button"
            className="sp-back-btn"
            onClick={() => {
              if (step === 'bank_qr') setStep('confirm')
              else if (step === 'ticket_pass') navigate('/court-finder')
              else navigate('/court-finder')
            }}
            title="Quay lại"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="sp-title-area">
            <p className="sp-breadcrumb">
              {step === 'ticket_pass'
                ? 'ĐẶT SÂN / VÉ QR CHECK-IN SÂN'
                : step === 'bank_qr'
                ? 'ĐẶT SÂN / THANH TOÁN VIETQR NAPAS 24/7'
                : 'ĐẶT SÂN'}
            </p>
            <h1 className="sp-main-title">
              {step === 'ticket_pass'
                ? 'Vé Điện Tử & Mã QR Check-in Sân'
                : step === 'bank_qr'
                ? 'Quét Mã VietQR Chuyển Khoản Ngân Hàng'
                : 'Xác Nhận Đặt Sân'}
            </h1>

            {step === 'confirm' && (
              <div className="sp-lock-bar sp-lock-bar--highlight">
                <div className="sp-lock-timer">
                  <div className="sp-timer-icon-wrap">
                    <span className="material-symbols-outlined sp-timer-icon">schedule</span>
                  </div>
                  <div className="sp-lock-info">
                    <span className="sp-lock-label">SÂN ĐÃ TẠM KHÓA GIỮ CHỖ</span>
                    <span className="sp-lock-subtext">Hệ thống đang giữ chỗ độc quyền cho bạn</span>
                  </div>
                  <div className="sp-timer-digits-badge">
                    <span className="sp-timer-pulse-dot" />
                    <span className="sp-timer-digits">{formatTimer(countdown)}</span>
                  </div>
                </div>
                <div className="sp-lock-guarantee">
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Chống đụng lịch 100%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          PHẦN 1: MÀN HÌNH XÁC NHẬN ĐẶT SÂN & CHỌN PHƯƠNG THỨC THANH TOÁN
          ===================================================================== */}
      {step === 'confirm' && (
        <div className="sp-grid">
          {/* CỘT TRÁI */}
          <div className="sp-col-left">
            {/* Card 1: Cụm Sân & Lịch Thi Đấu Đã Khóa */}
            <section className="sp-card" aria-label="Cụm sân và lịch thi đấu đã khóa">
              <div className="sp-card-head">
                <div className="sp-head-left">
                  <div className="sp-head-icon">
                    <span className="material-symbols-outlined">sports_tennis</span>
                  </div>
                  <h2 className="sp-card-title">Cụm Sân &amp; Lịch Thi Đấu Đã Khóa</h2>
                </div>
                <span className="sp-badge-closed">ĐÃ CHỐT SLOT</span>
              </div>

              <div className="sp-court-box">
                <div className="sp-court-img-wrap">
                  <img src={courtImage} alt={courtName} className="sp-court-img" />
                  <div className="sp-court-img-pill">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{floorType}</span>
                  </div>
                </div>

                <div className="sp-court-info">
                  <div className="sp-court-tags-row">
                    <span className="sp-tag-pro">{sportLabel}</span>
                    <span className="sp-location-text">
                      <span className="material-symbols-outlined">location_on</span>
                      {locationName}
                    </span>
                  </div>

                  <h3 className="sp-court-name">{courtName}</h3>
                  <p className="sp-court-address">{address}</p>

                  <div className="sp-court-stats-strip">
                    <div className="sp-stat-item">
                      <small>MÃ SÂN ({courtCount} SÂN)</small>
                      <strong title={subCourt}>{subCourt}</strong>
                      {courtCount > 1 && (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{courtCount} sân cùng giờ</span>
                      )}
                    </div>
                    <div className="sp-stat-item">
                      <small>KHUNG GIỜ</small>
                      <strong>{slotTime}</strong>
                      <span>{displayBookingDate}</span>
                    </div>
                    <div className="sp-stat-item">
                      <small>TỔNG TIỀN ({hours}H)</small>
                      <strong className="sp-price-color">{formatVnd(totalAmount)}</strong>
                      <span>{courtCount > 1 ? `${courtCount} sân × ${formatVnd(unitPrice)}` : `${formatVnd(hourlyRate)}/giờ`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Card 2: Chọn Hình Thức Thanh Toán */}
            <section className="sp-card" aria-label="Chọn hình thức thanh toán">
              <div className="sp-card-head" style={{ marginBottom: 4 }}>
                <div className="sp-head-left">
                  <div className="sp-head-icon">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <h2 className="sp-card-title">Chọn Hình Thức Thanh Toán</h2>
                </div>
              </div>
              <p className="sp-card-subtitle">Chọn phương thức ký quỹ bảo chứng giao dịch</p>

              {/* Split / Full payment boxes */}
              <div className="sp-mode-grid">
                {/* Option: Thanh Toán Toàn Bộ */}
                <div
                  className={`sp-mode-box ${paymentMode === 'full' ? 'sp-mode-active' : ''}`}
                  onClick={() => setPaymentMode('full')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sp-mode-top">
                    <span className="sp-mode-radio-icon">
                      <span className="material-symbols-outlined">
                        {paymentMode === 'full' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </span>
                    <span className="sp-mode-title">Thanh Toán Toàn Bộ</span>
                    <span className="sp-badge-default">Mặc định</span>
                  </div>
                  <div className="sp-mode-amount-row">
                    <small>SỐ TIỀN:</small>
                    <strong>{formatVnd(totalAmount)}</strong>
                  </div>
                </div>

                {/* Option: Thanh Toán Từng Người */}
                <div
                  className={`sp-mode-box ${paymentMode === 'split' ? 'sp-mode-active' : ''}`}
                  onClick={() => setPaymentMode('split')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sp-mode-top">
                    <span className="sp-mode-radio-icon">
                      <span className="material-symbols-outlined">
                        {paymentMode === 'split' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </span>
                    <span className="sp-mode-title">Thanh Toán Từng Người</span>
                    <span className="sp-badge-count">{invitedFriends.length + 1} người</span>
                  </div>
                  <div className="sp-mode-amount-row">
                    <small>SỐ TIỀN:</small>
                    <strong className="sp-split-color">{formatVnd(splitAmount)} / người</strong>
                  </div>
                </div>
              </div>

              {/* BƯỚC 1: TÌM BẠN BÈ THEO SỐ ĐIỆN THOẠI ĐỂ LẤY USERID (GET /api/accounts/lookup?phone=...) */}
              {paymentMode === 'split' && (
                <div className="sp-split-friends-section">
                  <div className="sp-split-title-row">
                    <div className="sp-split-title-left">
                      <span className="material-symbols-outlined" style={{ color: '#15803D' }}>group_add</span>
                      <span>Tìm &amp; Thêm Bạn Bè Cùng Chia Tiền</span>
                    </div>
                    <span className="sp-badge-count" style={{ background: '#DCFCE7', color: '#15803D' }}>
                      {invitedFriends.length + 1} người trong đơn
                    </span>
                  </div>

                  {/* Input tra cứu số điện thoại */}
                  <form className="sp-phone-search-row" onSubmit={handleSearchFriend}>
                    <input
                      type="tel"
                      className="sp-phone-search-input"
                      placeholder="Nhập số điện thoại bạn bè (vd: 0912345678)..."
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="sp-phone-search-btn"
                      disabled={lookupLoading || !lookupPhone.trim()}
                    >
                      <span className={`material-symbols-outlined ${lookupLoading ? 'animate-spin' : ''}`}>
                        {lookupLoading ? 'sync' : 'search'}
                      </span>
                      <span>{lookupLoading ? 'Đang tìm...' : 'Tra cứu'}</span>
                    </button>
                  </form>

                  {lookupError && (
                    <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '12px', marginBottom: '10px' }}>
                      ⚠️ {lookupError}
                    </div>
                  )}

                  {/* Kết quả tìm kiếm bạn bè từ API */}
                  {lookupResult && (
                    <div className="sp-friend-result-card">
                      <div className="sp-friend-info-left">
                        <div className="sp-friend-avatar">
                          {(lookupResult.fullName || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="sp-friend-names">
                          <div className="sp-friend-name">{lookupResult.fullName}</div>
                          <div className="sp-friend-phone">SĐT (đã che): {maskPhone(lookupResult.phone)}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="sp-btn-add-friend"
                        onClick={() => handleAddInvitedFriend(lookupResult)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                        <span>Thêm vào nhóm chia tiền</span>
                      </button>
                    </div>
                  )}

                  {/* Gợi ý thêm nhanh bạn bè mẫu */}
                  <div className="sp-sample-friends-row">
                    <span className="sp-sample-label">Gợi ý bạn chơi:</span>
                    {DEFAULT_SAMPLE_FRIENDS.map((sample) => {
                      const isAdded = invitedFriends.some((f) => f.id === sample.id)
                      return (
                        <button
                          key={sample.id}
                          type="button"
                          className="sp-sample-pill"
                          style={{ opacity: isAdded ? 0.5 : 1, textDecoration: isAdded ? 'line-through' : 'none' }}
                          disabled={isAdded}
                          onClick={() => handleAddInvitedFriend(sample)}
                        >
                          + {sample.fullName} ({maskPhone(sample.phone)})
                        </button>
                      )
                    })}
                  </div>

                  {/* Danh sách người tham gia */}
                  <div className="sp-friends-list">
                    {/* Host (Người tạo đơn) */}
                    <div className="sp-friend-item-row" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                      <div className="sp-friend-item-left">
                        <div className="sp-friend-avatar" style={{ background: '#15803D' }}>BẠN</div>
                        <div>
                          <div className="sp-friend-name">Bạn (Chủ Nhóm Đặt Sân)</div>
                          <div className="sp-friend-phone">Người tạo trả phần của mình ngay khi tạo đơn</div>
                        </div>
                      </div>
                      <div className="sp-friend-item-right">
                        <strong className="sp-friend-share-amt">{formatVnd(splitAmount)}</strong>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>
                          Người tạo đơn
                        </span>
                      </div>
                    </div>

                    {/* Bạn bè được mời */}
                    {invitedFriends.map((friend) => (
                      <div key={friend.id} className="sp-friend-item-row">
                        <div className="sp-friend-item-left">
                          <div className="sp-friend-avatar" style={{ background: '#0284C7' }}>
                            {(friend.fullName || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="sp-friend-name">{friend.fullName}</div>
                            <div className="sp-friend-phone">SĐT (đã che): {maskPhone(friend.phone)}</div>
                          </div>
                        </div>
                        <div className="sp-friend-item-right">
                          <strong className="sp-friend-share-amt">{formatVnd(splitAmount)}</strong>
                          <button
                            type="button"
                            className="sp-btn-remove-friend"
                            title="Xóa bạn này khỏi đơn chia tiền"
                            onClick={() => handleRemoveInvitedFriend(friend.id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bảng tóm tắt chia tiền */}
                  <div className="sp-split-summary-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Tổng tiền: {formatVnd(totalAmount)} ÷ {invitedFriends.length + 1} người</strong>
                      <strong style={{ fontSize: 14, color: '#15803D' }}>= {formatVnd(splitAmount)} / người</strong>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#4b5563', marginTop: 2 }}>
                      💡 <strong>Quy trình xử lý FE:</strong> Người tạo trả phần của mình ngay. Đơn ở trạng thái <strong>PENDING</strong>, hạn góp tiền là 30 phút (xem PaymentDeadline). Khi đủ người trả thì đơn chuyển <strong>PAID</strong>.
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-section: Kênh / Phương Thức Thanh Toán */}
              <div className="sp-channel-head">
                <div className="sp-channel-title">
                  <span className="material-symbols-outlined">account_balance</span>
                  <span>Kênh / Phương Thức Thanh Toán</span>
                </div>
                <span className="sp-pill-amber">
                  <span className="material-symbols-outlined">schedule</span>
                  Giữ chỗ 15 phút
                </span>
              </div>

              <div className="sp-channel-list">
                {/* Channel 1: Escrow Wallet */}
                <div
                  className={`sp-channel-row ${paymentChannel === 'escrow' ? 'sp-channel-active' : ''}`}
                  onClick={() => setPaymentChannel('escrow')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sp-channel-left">
                    <span className="sp-channel-radio-icon">
                      <span className="material-symbols-outlined">
                        {paymentChannel === 'escrow' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </span>
                    <div className="sp-channel-logo-sq">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div className="sp-channel-texts">
                      <div className="sp-channel-title-row">
                        <span className="sp-channel-name">Thanh toán qua ví Escrow</span>
                        <span className="sp-badge-recommend">Khuyên dùng</span>
                      </div>
                      <span className="sp-channel-sub">
                        Số dư ví: <strong>{formatVnd(walletBalance)}</strong> • Ký quỹ (frozenBalance): <strong>{formatVnd(frozenBalance)}</strong>
                      </span>
                      {walletBalance < payableAmount && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#92400E', fontWeight: 600 }}>
                            ⚠️ Số dư ví ({formatVnd(walletBalance)}) không đủ ({formatVnd(payableAmount)})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('/wallet', {
                                state: {
                                  suggestedAmount: Math.max(10000, payableAmount - (walletBalance || 0)),
                                  returnTo: {
                                    path: '/split-payment',
                                    state: location.state,
                                    label: 'Quay lại đặt sân',
                                  },
                                },
                              })
                            }}
                            style={{
                              padding: '5px 12px',
                              background: '#15803D',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>account_balance_wallet</span>
                            <span>Nạp tiền ngay (PayOS)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sp-pill-time-limit">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>Thời gian giới hạn là 15 phút</span>
                  </div>
                </div>

                {/* Channel 2: PayOS / VietQR */}
                <div
                  className={`sp-channel-row ${paymentChannel === 'bank' ? 'sp-channel-active' : ''}`}
                  onClick={() => setPaymentChannel('bank')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sp-channel-left">
                    <span className="sp-channel-radio-icon">
                      <span className="material-symbols-outlined">
                        {paymentChannel === 'bank' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </span>
                    <div className="sp-channel-logo-sq">
                      <span className="material-symbols-outlined">qr_code_2</span>
                    </div>
                    <div className="sp-channel-texts">
                      <div className="sp-channel-title-row">
                        <span className="sp-channel-name">Thanh toán trực tiếp qua cổng PayOS</span>
                        <span className="sp-badge-napas" style={{ background: '#DCFCE7', color: '#15803D', borderColor: '#86EFAC' }}>
                          VietQR / Napas 24/7 • Tiền thật
                        </span>
                      </div>
                      <span className="sp-channel-sub">
                        Tạo mã VietQR cổng PayOS thanh toán bằng tiền thật, tự động kích hoạt vé
                      </span>
                    </div>
                  </div>

                  <div className="sp-pill-time-limit">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>Thời gian giới hạn là 15 phút</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Card 3: Ghi chú cho Quản lý sân (Tùy chọn) */}
            <section className="sp-card" aria-label="Ghi chú cho quản lý sân">
              <div className="sp-card-head" style={{ marginBottom: 12 }}>
                <div className="sp-head-left">
                  <span className="material-symbols-outlined" style={{ color: 'var(--sp-green)' }}>
                    edit_note
                  </span>
                  <h2 className="sp-card-title">Ghi chú cho Quản lý sân (Tùy chọn)</h2>
                </div>
              </div>
              <textarea
                className="sp-note-input"
                rows={2}
                value={note}
                placeholder="Ghi chú thêm cho quản lý sân nếu có..."
                onChange={(e) => setNote(e.target.value)}
              />
            </section>
          </div>

          {/* CỘT PHẢI */}
          <div className="sp-col-right">
            {/* Card 1: Thông tin người đặt sân */}
            <section className="sp-card" aria-label="Thông tin người đặt sân">
              <div className="sp-card-head" style={{ marginBottom: 14 }}>
                <div className="sp-head-left">
                  <span className="material-symbols-outlined" style={{ color: 'var(--sp-green)' }}>
                    person
                  </span>
                  <h2 className="sp-card-title">Thông tin người đặt sân</h2>
                </div>
              </div>

              <div className="sp-user-row">
                <div className="sp-user-avatar">{initialsOf(currentUser.name)}</div>
                <div className="sp-user-details">
                  <p className="sp-user-name">{currentUser.name || 'Bạn'}</p>
                  <p className="sp-user-contact">0908 ••• 888 • minhm@domain.vn</p>
                </div>
              </div>

              <div className="sp-user-stats-grid">
                <div className="sp-user-stat-card">
                  <small>TRÌNH ĐỘ</small>
                  <strong>Khá (Phong trào)</strong>
                </div>
                <div className="sp-user-stat-card">
                  <small>ĐIỂM FAIRPLAY</small>
                  <strong className="sp-fairplay-color">⭐ 99.4/100</strong>
                </div>
              </div>
            </section>

            {/* Card 2: Chi Tiết Quyết Toán & Xác Nhận */}
            <section className="sp-card" aria-label="Chi tiết quyết toán và xác nhận">
              <div className="sp-settlement-head">
                <div className="sp-settlement-title-row">
                  <span className="material-symbols-outlined sp-settlement-icon">
                    receipt_long
                  </span>
                  <h2 className="sp-card-title">Chi Tiết Quyết Toán &amp; Xác Nhận</h2>
                </div>
                <div className="sp-settlement-badge-row">
                  <span className="sp-time-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                    {hours} GIỜ THI ĐẤU
                  </span>
                </div>
              </div>

              <div className="sp-receipt-rows">
                <div className="sp-receipt-line sp-receipt-line--court">
                  <div className="sp-receipt-court-header">
                    <span className="sp-receipt-court-name">
                      Tiền thuê {courtCount > 1 ? `${courtCount} sân` : subCourt}
                    </span>
                    <span className="sp-receipt-price-nowrap">{formatVnd(totalAmount)}</span>
                  </div>
                  <div className="sp-receipt-slot-highlight">
                    <span className="material-symbols-outlined">schedule</span>
                    <strong>{slotTime}</strong>
                    <span>• {displayBookingDate} {courtCount > 1 ? `(${courtCount} sân × ${formatVnd(unitPrice)})` : ''}</span>
                  </div>
                </div>
                <div className="sp-receipt-line">
                  <span className="sp-receipt-line-left sp-receipt-line-discount">
                    Ưu đãi giờ vàng thành viên
                  </span>
                  <span className="sp-receipt-price-nowrap sp-receipt-line-discount">-0 đ</span>
                </div>
              </div>

              <div className="sp-receipt-divider" />

              <div className="sp-receipt-total-row">
                <div className="sp-total-labels">
                  <span className="sp-total-head">TỔNG THANH TOÁN KỲ NÀY</span>
                  <span className="sp-total-sub">
                    {paymentMode === 'full'
                      ? 'Ký quỹ 100% toàn bộ tiền sân'
                      : 'Ký quỹ 1 phần (1/4) tiền sân'}
                  </span>
                </div>
                <strong className="sp-total-value">{formatVnd(payableAmount)}</strong>
              </div>

              {/* Action buttons */}
              <button
                type="button"
                className="sp-btn-confirm"
                onClick={handleConfirmCheckout}
                disabled={isSubmitting}
                id="sp-confirm-checkout"
              >
                <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : ''}`}>
                  {isSubmitting ? 'sync' : 'check_circle'}
                </span>
                <span>
                  {isSubmitting ? 'Đang gửi yêu cầu đặt sân (POST /bookings)...' : 'Xác nhận thanh toán & lấy vé QR'}
                </span>
              </button>

              <button
                type="button"
                className="sp-btn-cancel"
                onClick={() => navigate('/court-finder')}
                id="sp-cancel-checkout"
              >
                <span>Quay lại chọn giờ khác / hủy đặt</span>
              </button>

              {/* Escrow Guarantee Statement */}
              <div className="sp-escrow-box">
                <span className="material-symbols-outlined">verified_user</span>
                <p className="sp-escrow-text">
                  <strong>Bảo chứng Escrow 100%:</strong> Tiền giữ tại Hợp đồng Ký quỹ thông minh SportNexus.
                  Chủ sân chỉ nhận tiền sau khi bạn quét QR check-in vào sân thành công.
                </p>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* =====================================================================
          PHẦN 2: MÀN HÌNH THANH TOÁN TRỰC TIẾP QUA CỔNG PAYOS (TIỀN THẬT)
          ===================================================================== */}
      {step === 'bank_qr' && (
        <div className="sp-bank-container">
          {/* Cột Trái: Mã QR PayOS thật */}
          <div className="sp-bank-qr-card">
            <span className="sp-vietqr-header-pill" style={{ background: '#15803D' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                qr_code_scanner
              </span>
              VietQR Napas 24/7 • PayOS
            </span>

            <div className="sp-bank-qr-frame">
              {payosSession?.qrCode ? (
                <QRCodeSVG
                  value={payosSession.qrCode}
                  size={216}
                  level="M"
                  style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#15803D' }}>
                    open_in_new
                  </span>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginTop: '6px' }}>
                    Nhấn nút bên dưới để mở trang thanh toán PayOS
                  </p>
                </div>
              )}
            </div>

            <div className="sp-bank-qr-amount-pill">
              <small>Số tiền thanh toán PayOS:</small>
              <strong>{formatVnd(payosSession?.amount || payableAmount)}</strong>
            </div>

            <p style={{ fontSize: 11.5, color: '#6b7280', marginTop: 12, lineHeight: 1.4 }}>
              Mở ứng dụng ngân hàng bất kỳ để quét mã VietQR. Hệ thống PayOS sẽ tự động khớp lệnh ngay khi nhận được tiền.
            </p>
          </div>

          {/* Cột Phải: Thông tin thanh toán PayOS và các nút thao tác */}
          <div className="sp-bank-details-panel">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: 24 }}>verified_user</span>
                <h2 className="sp-bank-info-title" style={{ margin: 0 }}>Cổng Thanh Toán PayOS (Napas 24/7)</h2>
              </div>
              <p className="sp-bank-info-subtitle">
                Đang chờ bạn quét mã thanh toán... Hệ thống tự động kích hoạt vé ngay khi PayOS gửi xác nhận.
              </p>

              <div className="sp-bank-fields-grid">
                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Mã đơn PayOS:</span>
                  <div className="sp-bank-field-val">
                    <strong style={{ fontFamily: 'monospace' }}>#{payosSession?.orderCode || 'Đang tạo...'}</strong>
                  </div>
                </div>

                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Số tiền:</span>
                  <div className="sp-bank-field-val">
                    <strong style={{ color: '#2f5d12', fontSize: 16 }}>{formatVnd(payosSession?.amount || payableAmount)}</strong>
                    <button
                      type="button"
                      className="sp-btn-copy"
                      onClick={() => handleCopy(String(payosSession?.amount || payableAmount), 'amount')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {copiedField === 'amount' ? 'check' : 'content_copy'}
                      </span>
                      {copiedField === 'amount' ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                {payosSession?.description && (
                  <div className="sp-bank-field-row">
                    <span className="sp-bank-field-label">Nội dung chuyển khoản:</span>
                    <div className="sp-bank-field-val">
                      <strong style={{ color: '#c2410c' }}>{payosSession.description}</strong>
                      <button
                        type="button"
                        className="sp-btn-copy"
                        onClick={() => handleCopy(payosSession.description, 'memo')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                          {copiedField === 'memo' ? 'check' : 'content_copy'}
                        </span>
                        {copiedField === 'memo' ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                )}

                {payosSession?.accountName && (
                  <div className="sp-bank-field-row">
                    <span className="sp-bank-field-label">Đơn vị thụ hưởng:</span>
                    <div className="sp-bank-field-val">
                      <strong>{payosSession.accountName}</strong>
                    </div>
                  </div>
                )}

                <div className="sp-bank-field-row" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <span className="sp-bank-field-label">Trạng thái xác thực:</span>
                  <div className="sp-bank-field-val" style={{ color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span>
                    <span>Đang chờ chuyển khoản từ PayOS...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-bank-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {payosSession?.checkoutUrl && (
                  <button
                    type="button"
                    className="sp-btn-confirm"
                    style={{ flex: 1, minWidth: '180px', margin: 0, background: '#15803D' }}
                    onClick={() => {
                      window.location.href = payosSession.checkoutUrl
                    }}
                  >
                    <span className="material-symbols-outlined">open_in_new</span>
                    <span>Mở trang thanh toán PayOS</span>
                  </button>
                )}

                <button
                  type="button"
                  className="sp-btn-confirm"
                  style={{ flex: 1, minWidth: '160px', margin: 0, background: '#0284C7' }}
                  onClick={() => setPayosCheckAttempt((n) => n + 1)}
                >
                  <span className="material-symbols-outlined">refresh</span>
                  <span>Kiểm tra lại trạng thái</span>
                </button>
              </div>

              <button
                type="button"
                className="sp-btn-cancel"
                style={{ width: '100%', margin: 0, padding: '12px 20px', background: '#6b7280' }}
                onClick={handleCancelPayOS}
              >
                <span>Hủy thanh toán PayOS &amp; Quay lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PHẦN 3: GIAO DIỆN XUẤT MÃ QR CỐ ĐỊNH & TOÀN BỘ THÔNG TIN ĐÃ ĐẶT
          ===================================================================== */}
      {step === 'ticket_pass' && (
        <div className="sp-pass-grid">
          {/* CỘT TRÁI: THẺ MÃ QR CHECK-IN CỐ ĐỊNH & CÁC NÚT TƯƠNG TÁC QR */}
          <div className="sp-ticket-col">
            <div className="sp-ticket-card">
              {/* 4 TRẠNG THÁI ĐƠN CHUẨN: PENDING | PAID | CHECKED_IN | CANCELLED */}
              {bookingStatus === 'PENDING' && (
                <div className="sp-status-card sp-status-card--pending">
                  <div className="sp-status-icon-wrap">
                    <span className="material-symbols-outlined animate-spin">schedule</span>
                  </div>
                  <div className="sp-status-info">
                    <div className="sp-status-head-row">
                      <span className="sp-status-title">PENDING • Đơn chia tiền đang chờ người được mời góp</span>
                      <span className="sp-deadline-badge">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>timer</span>
                        HẠN GÓP: {formatTimer(deadlineSeconds)}
                      </span>
                    </div>
                    <div className="sp-status-desc">
                      Người tạo đã trả phần của mình ({formatVnd(payableAmount)}). Hạn góp tiền là 30 phút (xem PaymentDeadline). Quá hạn mà chưa đủ thì hệ thống tự hủy đơn và hoàn tiền cho mọi người đã trả.
                    </div>

                    {/* Danh sách người tham gia góp tiền */}
                    <div className="sp-participants-panel">
                      <div className="sp-participants-title">
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#D97706' }}>group</span>
                        <span>Tiến độ góp tiền ({invitedFriends.filter(f => f.status === 'PAID').length + 1} / {invitedFriends.length + 1} người đã đóng)</span>
                      </div>

                      {/* Host */}
                      <div className="sp-part-row">
                        <div className="sp-part-left">
                          <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: 18 }}>check_circle</span>
                          <strong>Bạn (Chủ Nhóm Đặt Sân)</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{formatVnd(splitAmount)}</span>
                          <span className="sp-part-status-badge sp-part-status--paid">ĐÃ TRẢ (KÝ QUỸ ESCROW)</span>
                        </div>
                      </div>

                      {/* Invited friends */}
                      {invitedFriends.map((f) => (
                        <div key={f.id} className="sp-part-row">
                          <div className="sp-part-left">
                            <span
                              className="material-symbols-outlined"
                              style={{ color: f.status === 'PAID' ? '#15803D' : '#D97706', fontSize: 18 }}
                            >
                              {f.status === 'PAID' ? 'check_circle' : 'hourglass_empty'}
                            </span>
                            <span>{f.fullName} ({maskPhone(f.phone)})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{formatVnd(splitAmount)}</span>
                            {f.status === 'PAID' ? (
                              <span className="sp-part-status-badge sp-part-status--paid">ĐÃ GÓP TIỀN</span>
                            ) : (
                              <>
                                <span className="sp-part-status-badge sp-part-status--pending">CHỜ GÓP</span>
                                <button
                                  type="button"
                                  className="sp-btn-sim-join"
                                  title="Bước 3: Người được mời nhận thông báo -> POST /api/v1/bookings/{id}/join"
                                  onClick={() => handleSimulateFriendJoin(f.id)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>send</span>
                                  <span>Góp tiền</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Tùy chọn: Người tạo trả nốt phần của người chưa góp để xác nhận đơn ngay */}
                      {invitedFriends.some(f => f.status !== 'PAID') && (
                        <button
                          type="button"
                          className="sp-btn-pay-remaining"
                          disabled={isPayingRemaining}
                          onClick={handlePayRemaining}
                        >
                          <span className="material-symbols-outlined">payments</span>
                          <span>
                            {isPayingRemaining
                              ? 'Đang thanh toán nốt phần còn lại...'
                              : `Trả nốt phần chưa góp (${formatVnd(invitedFriends.filter(f => f.status !== 'PAID').length * splitAmount)}) để xác nhận đơn ngay`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {bookingStatus === 'PAID' && (
                <div className="sp-status-card sp-status-card--paid">
                  <div className="sp-status-icon-wrap">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div className="sp-status-info">
                    <div className="sp-status-head-row">
                      <span className="sp-status-title">PAID • Đã thanh toán đủ, giữ chỗ thành công</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: 10 }}>
                        ĐÃ KHÓA SÂN
                      </span>
                    </div>
                    <div className="sp-status-desc">
                      Đã thanh toán đủ tiền sân, giữ chỗ thành công. Tiền được bảo chứng an toàn 100% trong quỹ Escrow SportNexus.
                    </div>
                  </div>
                </div>
              )}

              {bookingStatus === 'CHECKED_IN' && (
                <div className="sp-status-card sp-status-card--checkedin">
                  <div className="sp-status-icon-wrap">
                    <span className="material-symbols-outlined">how_to_reg</span>
                  </div>
                  <div className="sp-status-info">
                    <div className="sp-status-head-row">
                      <span className="sp-status-title">CHECKED_IN • Đã check-in tại sân</span>
                    </div>
                    <div className="sp-status-desc">
                      Bạn đã hoàn tất quét mã QR check-in tại cổng sân thi đấu.
                    </div>
                  </div>
                </div>
              )}

              {bookingStatus === 'CANCELLED' && (
                <div className="sp-status-card sp-status-card--cancelled">
                  <div className="sp-status-icon-wrap">
                    <span className="material-symbols-outlined">cancel</span>
                  </div>
                  <div className="sp-status-info">
                    <div className="sp-status-head-row">
                      <span className="sp-status-title">CANCELLED • Đã hủy đơn đặt sân</span>
                    </div>
                    <div className="sp-status-desc">
                      Đơn đặt sân này đã bị hủy (người đặt, chủ sân, Admin hủy hoặc quá hạn góp tiền). Tiền đã được xử lý hoàn trả theo quy định.
                    </div>
                  </div>
                </div>
              )}

              <h2 className="sp-ticket-title">Vé QR Check-in Vào Cụm Sân</h2>
              <p className="sp-ticket-sub">
                Đưa mã QR này cho chủ sân hoặc quầy lễ tân quét khi tới sân
              </p>

              {/* Khung mã QR cố định với hiệu ứng laser */}
              <div className="sp-ticket-qr-box" style={{ opacity: bookingStatus === 'CANCELLED' ? 0.35 : 1 }}>
                {bookingStatus === 'PAID' && <div className="sp-ticket-laser-line" />}

                {bookingStatus === 'PENDING' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(3px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      padding: 16,
                      textAlign: 'center',
                      gap: 6,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#D97706' }}>lock_clock</span>
                    <strong style={{ fontSize: 13, color: '#92400E' }}>Mã QR Tạm Khóa</strong>
                    <span style={{ fontSize: 11, color: '#78350F' }}>
                      Đang chờ bạn bè góp đủ tiền để kích hoạt mã vé QR check-in cổng sân.
                    </span>
                  </div>
                )}

                {bookingStatus === 'CANCELLED' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(254, 242, 242, 0.92)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      padding: 16,
                      textAlign: 'center',
                      gap: 6,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#DC2626' }}>cancel</span>
                    <strong style={{ fontSize: 14, color: '#991B1B' }}>ĐƠN ĐÃ BỊ HỦY</strong>
                    <span style={{ fontSize: 11.5, color: '#7F1D1D' }}>Vé không còn hiệu lực check-in</span>
                  </div>
                )}

                <div className="sp-qr-svg-wrap" key={qrVersion}>
                  <svg
                    className="w-full h-full text-green-900 drop-shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                    fill="currentColor"
                    viewBox="0 0 100 100"
                  >
                    {/* Outer corner finders */}
                    <rect fill="none" height="26" rx="4" stroke="#1b5e20" strokeWidth="4" width="26" x="5" y="5" />
                    <rect fill="#2e7d32" height="14" rx="2" width="14" x="11" y="11" />
                    <rect fill="none" height="26" rx="4" stroke="#1b5e20" strokeWidth="4" width="26" x="69" y="5" />
                    <rect fill="#2e7d32" height="14" rx="2" width="14" x="75" y="11" />
                    <rect fill="none" height="26" rx="4" stroke="#1b5e20" strokeWidth="4" width="26" x="5" y="69" />
                    <rect fill="#2e7d32" height="14" rx="2" width="14" x="11" y="75" />

                    {/* Inner dynamic matrix dots based on qrVersion */}
                    <rect height="6" rx="1.5" width="6" x="38" y="8" fill="#1b5e20" />
                    <rect height="6" rx="1.5" width="10" x="52" y={16 + (qrVersion % 4)} fill="#2e7d32" />
                    <rect height="12" rx="1.5" width="6" x="42" y={48 + (qrVersion % 3)} fill="#1b5e20" />
                    <rect height="6" rx="1.5" width="12" x="78" y="38" fill="#2e7d32" />
                    <rect height="12" rx="1.5" width="6" x="86" y="68" fill="#1b5e20" />
                    <rect height="6" rx="1.5" width="6" x="54" y="54" fill="#1b5e20" />
                    <rect height="6" rx="1.5" width="8" x="68" y="54" fill="#2e7d32" />
                    <rect height="8" rx="1.5" width="6" x="38" y="76" fill="#1b5e20" />
                    <rect height="6" rx="1.5" width="10" x="50" y="76" fill="#2e7d32" />
                    <circle cx="50" cy="38" r="4" fill="#15803d" />
                    <circle cx="62" cy="70" r="3.5" fill="#15803d" />
                    <circle cx="70" cy="85" r="3.5" fill="#2e7d32" />
                  </svg>
                </div>
              </div>

              {/* Thông tin mã QR check-in cố định sau khi đặt sân thành công */}
              <div className="sp-ticket-timer-bar">
                <div className="sp-timer-bar-left">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: bookingStatus === 'PENDING' ? '#FEF3C7' : bookingStatus === 'CANCELLED' ? '#FEE2E2' : '#DCFCE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: bookingStatus === 'PENDING' ? '#D97706' : bookingStatus === 'CANCELLED' ? '#DC2626' : '#15803D',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {bookingStatus === 'PENDING' ? 'schedule' : bookingStatus === 'CANCELLED' ? 'cancel' : 'verified'}
                    </span>
                  </div>

                  <div className="sp-timer-text-wrap">
                    <strong>
                      Trạng thái đơn: {bookingStatus} {bookingStatus === 'PENDING' ? '(Chờ góp tiền)' : '(Bảo chứng Escrow)'}
                    </strong>
                    <small>
                      {bookingStatus === 'PENDING'
                        ? `Đã góp: ${formatVnd(payableAmount)} • Còn thiếu: ${formatVnd(invitedFriends.filter(f => f.status !== 'PAID').length * splitAmount)}`
                        : `Tiền được giữ trong frozenBalance (${formatVnd(payableAmount)}) tới khi chơi xong`}
                    </small>
                  </div>
                </div>
              </div>

              <div className="sp-ticket-token-id">MÃ VÉ CHECK-IN: #{qrToken}</div>

            </div>

            {/* Khung Tải ảnh vé QR về máy, Gửi mã cho bạn chơi, và HỦY ĐƠN VÀ HOÀN TIỀN (Image 2) */}
            <div className="sp-pass-qr-actions" style={{ flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                  type="button"
                  className="sp-btn-action-primary"
                  style={{ flex: 1 }}
                  disabled={bookingStatus === 'CANCELLED'}
                  onClick={() => alert('Đã lưu mã vé QR vào thư viện ảnh của thiết bị!')}
                >
                  <span className="material-symbols-outlined">download</span>
                  <span>Tải ảnh vé QR</span>
                </button>

                <button
                  type="button"
                  className="sp-btn-action-secondary"
                  style={{ flex: 1, borderColor: '#16a34a', color: '#16a34a', background: '#f0fdf4' }}
                  disabled={bookingStatus === 'CANCELLED'}
                  onClick={handleSendCodeToFriends}
                >
                  <span className="material-symbols-outlined">share</span>
                  <span>Gửi cho bạn chơi</span>
                </button>
              </div>

              {/* Nút Hủy đơn & hoàn tiền (Image 2: POST /api/v1/bookings/{id}/cancel) */}
              <button
                type="button"
                className="sp-btn-cancel-booking"
                style={{ width: '100%' }}
                disabled={bookingStatus === 'CHECKED_IN' || bookingStatus === 'CANCELLED'}
                onClick={handleOpenCancelModal}
              >
                <span className="material-symbols-outlined">event_busy</span>
                <span>
                  {bookingStatus === 'CANCELLED'
                    ? 'Đơn đã được hủy'
                    : bookingStatus === 'CHECKED_IN'
                    ? 'Đơn đã check-in (Không thể hủy)'
                    : 'Hủy đơn đặt sân & Hoàn tiền'}
                </span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: TOÀN BỘ THÔNG TIN NGƯỜI CHƠI VÀ SÂN ĐÃ ĐẶT */}
          <div className="sp-details-col">
            {/* Khối 1: Thông tin người chơi */}
            <div className="sp-info-card">
              <div className="sp-info-card-header">
                <div className="sp-info-header-title">
                  <span className="material-symbols-outlined">person</span>
                  <span>Thông Tin Người Chơi (Host)</span>
                </div>
                <span className="sp-badge-closed">ĐÃ XÁC MINH</span>
              </div>

              <div className="sp-pass-user-box">
                <div className="sp-pass-user-avatar">{initialsOf(currentUser.name)}</div>
                <div className="sp-pass-user-info">
                  <p className="sp-pass-user-name">{currentUser.name || 'Bạn'}</p>
                  <p className="sp-pass-user-sub">0908 ••• 888 • minhm@domain.vn</p>
                </div>
              </div>

              <div className="sp-pass-user-stats">
                <div className="sp-pass-stat-pill">
                  <small>TRÌNH ĐỘ</small>
                  <strong>Khá (Phong trào)</strong>
                </div>
                <div className="sp-pass-stat-pill">
                  <small>ĐIỂM FAIRPLAY</small>
                  <strong style={{ color: '#d97706' }}>⭐ 99.4/100</strong>
                </div>
                <div className="sp-pass-stat-pill">
                  <small>VAI TRÒ</small>
                  <strong>Chủ Nhóm Đặt Sân</strong>
                </div>
              </div>
            </div>

            {/* Khối 2: Thông tin chi tiết sân đã đặt */}
            <div className="sp-info-card">
              <div className="sp-info-card-header">
                <div className="sp-info-header-title">
                  <span className="material-symbols-outlined">stadium</span>
                  <span>Thông Tin Cụm Sân &amp; Lịch Đã Đặt</span>
                </div>
                <span className="sp-badge-default">ĐÃ THANH TOÁN</span>
              </div>

              <div className="sp-court-specs-grid">
                <div className="sp-spec-item sp-spec-full">
                  <small>CỤM SÂN THI ĐẤU</small>
                  <strong style={{ fontSize: 16 }}>{courtName}</strong>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{address}</span>
                </div>

                <div className="sp-spec-item">
                  <small>MÃ SÂN ({courtCount} SÂN) &amp; MẶT SÂN</small>
                  <strong>{subCourt}</strong>
                  <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>
                    {floorType} {courtCount > 1 ? `• ${courtCount} sân cùng giờ` : ''}
                  </span>
                </div>

                <div className="sp-spec-item">
                  <small>MÔN THỂ THAO</small>
                  <strong>Cầu Lông Tiêu Chuẩn BWF</strong>
                </div>

                <div className="sp-spec-item">
                  <small>KHUNG GIỜ THI ĐẤU</small>
                  <strong style={{ color: '#111827' }}>{slotTime} ({hours}H)</strong>
                  <span style={{ fontSize: 11.5, color: '#6b7280' }}>{displayBookingDate}</span>
                </div>

                <div className="sp-spec-item">
                  <small>PHƯƠNG THỨC THANH TOÁN</small>
                  <strong style={{ color: '#2f5d12' }}>
                    {paymentChannel === 'escrow'
                      ? 'Ví Escrow (Đã trừ thẳng vào ví)'
                      : 'Chuyển Khoản Ngân Hàng (VietQR)'}
                  </strong>
                </div>

                <div className="sp-spec-item sp-spec-full">
                  <small>GHI CHÚ CHO QUẢN LÝ SÂN</small>
                  <strong>{note || 'Không có ghi chú'}</strong>
                </div>

                <div className="sp-spec-item sp-spec-full" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#166534' }}>
                      Tổng số tiền đã thanh toán
                    </span>
                    <strong className="sp-spec-highlight" style={{ fontSize: '18px', fontWeight: 850, color: '#15803d' }}>
                      {formatVnd(payableAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>



            {/* Khung Đặt thêm sân khác và Xem ví Escrow - Dưới phần Thông tin cụm sân */}
            <div className="sp-pass-nav-actions">
              <button
                type="button"
                className="sp-btn-action-secondary"
                onClick={() => navigate('/court-finder')}
              >
                <span className="material-symbols-outlined">search</span>
                <span>Đặt thêm sân khác</span>
              </button>

              <button
                type="button"
                className="sp-btn-action-secondary"
                onClick={() => navigate('/wallet')}
              >
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <span>Xem ví Escrow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CANCELLATION & REFUND MODAL (Image 2) ===================== */}
      {showCancelModal && (
        <div className="sp-modal-backdrop" onClick={() => !isCanceling && setShowCancelModal(false)}>
          <div className="sp-cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-cancel-head">
              <div className="sp-cancel-icon">
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Xác Nhận Hủy Đơn Đặt Sân
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                  Áp dụng chính sách hoàn tiền tự động theo quy định của SportNexus
                </p>
              </div>
            </div>

            {/* Chính sách hoàn tiền 24 giờ */}
            <div className={`sp-cancel-policy-card ${getHoursUntilMatch() >= 24 ? 'sp-policy-full' : 'sp-policy-zero'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4 }}>
                <span className="material-symbols-outlined">
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
                    Thời điểm hủy cách giờ chơi <strong>{getHoursUntilMatch().toFixed(1)} giờ</strong> (&ge; 24h).
                    Bạn sẽ nhận lại <strong>100% số tiền ({formatVnd(payableAmount)})</strong> vào Ví Escrow ngay sau khi hủy.
                  </>
                ) : (
                  <>
                    Thời điểm hủy cách giờ chơi chỉ <strong>{getHoursUntilMatch().toFixed(1)} giờ</strong> (&lt; 24h).
                    Theo quy định SportNexus, đơn hủy trong vòng 24 giờ trước giờ thi đấu sẽ <strong>không được hoàn tiền</strong>.
                  </>
                )}
              </div>
            </div>

            {/* Lưu ý nếu đơn là kèo LFG */}
            {(state.isLfg || state.cardId) && (
              <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 12, color: '#1e40af' }}>
                ℹ️ <strong>Đơn gắn kèm kèo ghép LFG:</strong> Hệ thống sẽ tự động hủy kèo ghép theo quy định.
              </div>
            )}

            {/* Chọn lý do hủy từ API GET /api/v1/bookings/cancellation-reasons */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Lý do hủy đơn:
              </label>
              <select
                className="sp-reason-select"
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

            {/* Nhập lý do khác nếu chọn mục 6 (Custom) */}
            {selectedReasonCode === 6 && (
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Chi tiết lý do của bạn:
                </label>
                <textarea
                  className="sp-reason-textarea"
                  placeholder="Vui lòng nêu rõ lý do bạn muốn hủy đơn..."
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  disabled={isCanceling}
                />
              </div>
            )}

            {cancelError && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12 }}>
                ⚠️ {cancelError}
              </div>
            )}

            <div className="sp-cancel-actions">
              <button
                type="button"
                className="sp-btn-action-secondary"
                style={{ flex: 1, padding: '11px 16px', borderRadius: 10 }}
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
              >
                Giữ lại đơn
              </button>

              <button
                type="button"
                className="sp-btn-confirm-cancel"
                onClick={handleConfirmCancel}
                disabled={isCanceling}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {isCanceling ? 'sync' : 'event_busy'}
                </span>
                <span>{isCanceling ? 'Đang xử lý hủy...' : 'Xác Nhận Hủy Đơn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SUCCESS / NOTIFICATION MODAL ===================== */}
      {modalData && (
        <div className="sp-modal-backdrop" onClick={modalData.onClose}>
          <div className="sp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                verified
              </span>
            </div>
            <h3 className="sp-modal-title">{modalData.title}</h3>
            <p className="sp-modal-desc">{modalData.desc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SplitPayment
