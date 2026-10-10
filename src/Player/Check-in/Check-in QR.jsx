import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function CheckInQR() {
  const [seconds, setSeconds] = useState(29)
  const [copied, setCopied] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  
  // Trạng thái Check-in & Check-out đọc từ localStorage
  const [checkOutDone, setCheckOutDone] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        return Boolean(parsed?.checkOutDone)
      }
    } catch (e) {}
    return false
  })

  const [checkInDone, setCheckInDone] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        return Boolean(parsed?.checkInDone || parsed?.checkOutDone)
      }
    } catch (e) {}
    return false
  })

  // Modal Check-out và Đánh giá sau trận
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [selectedCoPlayer, setSelectedCoPlayer] = useState(null)
  const [rateStars, setRateStars] = useState(5)
  const [rateHoverStars, setRateHoverStars] = useState(0)
  const [writtenReview, setWrittenReview] = useState('')

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

  // Countdown timer for rolling QR code
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
      })),
    }
    localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(sessionData))
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
    if (!checkOutDone) {
      setToastMessage('⚠️ Bạn chỉ được phép đánh giá sau khi check-out thành công!')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    setSelectedCoPlayer(player)
    setWrittenReview('')
    setRateStars(5)
    setShowRateModal(true)
  }

  // Xử lý gửi đánh giá sau trận (chỉ cho phép sau khi check-out thành công)
  const handleSubmitRateCoPlayer = (e) => {
    e.preventDefault()
    if (!checkOutDone) {
      setToastMessage('⚠️ Người chơi chỉ được phép đánh giá sau khi check-out thành công!')
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

    const targetName = selectedCoPlayer?.name || selectedCoPlayer?.email?.split('@')[0] || 'Bạn chơi'
    const newReview = {
      id: Date.now(),
      author: 'Bạn (Người chơi cùng sân)',
      targetPlayer: targetName,
      coPlayerRole: selectedCoPlayer?.role || 'Bạn chơi cùng sân',
      avatarInitial: targetName.slice(0, 2).toUpperCase(),
      avatarBg: '#DCFCE7',
      avatarColor: '#15803D',
      matchType: 'Kèo Cầu Lông',
      court: 'Sân Cầu Lông BWF Pro 01 (Court 3)',
      time: 'Vừa xong',
      rating: rateStars,
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

    // Đánh dấu người chơi đã được đánh giá
    if (selectedCoPlayer) {
      const updated = [...new Set([...reviewedPlayerIds, selectedCoPlayer.id])]
      setReviewedPlayerIds(updated)
      localStorage.setItem('player_match_reviewed_ids', JSON.stringify(updated))
    }

    setWrittenReview('')
    setRateStars(5)
    setShowRateModal(false)
    setToastMessage(`🎉 Đã gửi đánh giá thành công cho ${targetName}!`)
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

  // Calculate circular progress for 30s countdown
  const progressPercent = ((30 - seconds) / 30) * 100
  const circumference = 2 * Math.PI * 16 // radius 16 -> ~100.53
  const strokeDashoffset = circumference - (circumference * seconds) / 30

  // Mock check-in history data exactly as shown in screenshot
  const historyList = [
    {
      id: 1,
      time: 'Hôm nay • 18:00 (2026)',
      location: 'D-Sports Thảo Điền, TP. Thủ Đức',
      sport: 'Cầu Lông',
      sportColor: 'cyan', // light blue badge
      sportIcon: 'badminton',
      amount: '240.000 đ',
      status: 'Giải ngân tự động',
      authMethod: 'Check-in Cổng A',
      authIcon: 'qr',
      stars: 5,
    },
    {
      id: 2,
      time: '18/02/2026 • 19:30',
      location: 'SportNexus Arena Q.7',
      sport: 'Pickleball Pro',
      sportColor: 'green', // light green badge
      sportIcon: 'pickleball',
      amount: '330.000 đ',
      status: 'Giải ngân tự động',
      authMethod: 'Check-in Cổng B2',
      authIcon: 'qr',
      stars: 5,
    },
    {
      id: 3,
      time: '12/02/2026 • 07:00',
      location: 'Sân Cầu Lông Kỳ Hòa Q.10',
      sport: 'Cầu Lông',
      sportColor: 'cyan',
      sportIcon: 'badminton',
      amount: '200.000 đ',
      status: 'Giải ngân tự động',
      authMethod: 'Check-in OTP Kiosk',
      authIcon: 'kiosk',
      stars: 5,
    },
  ]

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        background: 'transparent',
        padding: '28px 36px 60px 36px',
        color: '#111827',
      }}
    >
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
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '26px',
        }}
      >
        {/* Left: Title & Subtitle */}
        <div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            Check-in QR
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#4B5563',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Tiền sân được bảo vệ 100% trong ví ký quỹ trung gian, chỉ giải ngân khi quét mã QR vào sân.
          </p>
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
                  <span style={{ color: '#15803D' }}>Đã Check-out Trả Sân</span> • Court 3
                </>
              ) : checkInDone ? (
                <>
                  <span style={{ color: '#0284C7' }}>Đang Hoạt Động</span> • Court 3
                </>
              ) : (
                <>
                  <span style={{ color: '#15803D' }}>Sẵn Sàng Check-in</span> • Court 3
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MAIN TWO-COLUMN LAYOUT ===================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) 1fr',
          gap: '24px',
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
            <div style={{ padding: '18px 20px 14px 20px' }}>
              {/* Row 1: Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                {/* Left badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#DCFCE7',
                    padding: '3px 10px',
                    borderRadius: '20px',
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
                <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#9CA3AF',
                      letterSpacing: '0.4px',
                    }}
                  >
                    VÉ #TK-8849
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#0284C7',
                      letterSpacing: '0.3px',
                    }}
                  >
                    SÂN ĐÔI
                  </div>
                </div>
              </div>

              {/* Row 2: Court Title with shuttlecock icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#15803D',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Shuttlecock icon */}
                    <path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="m10.5 17.5-6-11.5a1.5 1.5 0 0 1 2-2l5 6" />
                    <path d="m13.5 17.5 6-11.5a1.5 1.5 0 0 0-2-2l-5 6" />
                    <path d="M7 10h10" />
                  </svg>
                </div>

                <div style={{ lineHeight: 1.3 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '16.5px',
                      fontWeight: 800,
                      color: '#111827',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    Sân Cầu Lông BWF Pro 01 – Yonex Mat
                  </h3>
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: '12.5px',
                      color: '#6B7280',
                      fontWeight: 500,
                    }}
                  >
                    SportNexus Arena Q.7 • 19:30, 24/02/2026
                  </p>
                </div>
              </div>
            </div>

            {/* Court Photo with overlay pills */}
            <div
              style={{
                position: 'relative',
                height: '148px',
                width: '100%',
                overflow: 'hidden',
                background: '#1F2937',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop"
                alt="Sân Cầu Lông BWF Pro 01"
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
                    'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)',
                }}
              />

              {/* Bottom-left Location Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.72)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#34D399' }}>
                  location_on
                </span>
                <span>Khu B - Tầng 2, 480 Huỳnh Tấn Phát, P. Bình Thuận</span>
              </div>

              {/* Bottom-right Gate Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.82)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '3px 9px',
                  borderRadius: '8px',
                  textAlign: 'right',
                  lineHeight: 1.15,
                }}
              >
                <div
                  style={{
                    fontSize: '8.5px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                  }}
                >
                  COURT 3
                </div>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '0.4px',
                  }}
                >
                  CỔNG B2
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
            {/* Top-Right Circular Countdown Timer */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Mã QR làm mới định kỳ bảo vệ tài khoản"
            >
              <svg width="40" height="40" viewBox="0 0 38 38" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="19"
                  cy="19"
                  r="16"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                {/* Animated Green Progress Ring */}
                <circle
                  cx="19"
                  cy="19"
                  r="16"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.9s linear',
                  }}
                />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                {seconds}s
              </span>
            </div>

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

            {/* Auto refresh caption */}
            <div
              style={{
                marginTop: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#15803D',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '15px',
                    animation: 'spinSlow 6s linear infinite',
                  }}
                >
                  sync
                </span>
                <span>Mã tự động làm mới sau: {seconds} giây</span>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  fontWeight: 500,
                }}
              >
                SportNexus Arena Q.7 • 19:30, 24/02/2026
              </div>
            </div>

            {/* Button: Gửi mã cho bạn chơi */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              style={{
                marginTop: '16px',
                width: '100%',
                maxWidth: '280px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1.5px solid #2D5F3F',
                background: '#ffffff',
                color: '#15803D',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(45, 95, 63, 0.08)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F0FDF4'
                e.currentTarget.style.borderColor = '#15803D'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(45, 95, 63, 0.16)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#2D5F3F'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 95, 63, 0.08)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#15803D' }}>
                forward_to_inbox
              </span>
              <span>Gửi mã cho bạn chơi</span>
            </button>

            {/* Buttons: Check-in / Check-out / Đánh giá bạn chơi */}
            {!checkInDone && (
              <button
                type="button"
                onClick={() => setShowCheckInModal(true)}
                style={{
                  marginTop: '10px',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: '1px dashed #10B981',
                  background: '#F0FDF4',
                  color: '#15803D',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
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
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
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
                  maxWidth: '280px',
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

            {checkOutDone && (
              <button
                type="button"
                onClick={() => {
                  if (matchParticipants.length > 0) {
                    setSelectedCoPlayer(matchParticipants[0])
                    setShowRateModal(true)
                  }
                }}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  maxWidth: '280px',
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
                <span>Đánh Giá Bạn Chơi Cùng Sân</span>
              </button>
            )}
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

        {/* ================= RIGHT COLUMN: History & Fairplay Rating ================= */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
            padding: '24px 28px',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            {/* Title with History icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#15803D',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  history
                </span>
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#111827',
                    letterSpacing: '-0.3px',
                  }}
                >
                  Lịch Sử Check-in &amp; Đánh Giá Fairplay Gần Đây
                </h2>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontWeight: 500,
                  }}
                >
                  SportNexus Arena Q.7 • 19:30, 24/02/2026
                </div>
              </div>
            </div>

            {/* Badge: 3 lượt gần nhất */}
            <div
              style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                whiteSpace: 'nowrap',
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
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <th
                    style={{
                      padding: '10px 14px 12px 6px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    THỜI GIAN &amp; ĐỊA ĐIỂM
                  </th>
                  <th
                    style={{
                      padding: '10px 14px 12px 14px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    MÔN THỂ THAO
                  </th>
                  <th
                    style={{
                      padding: '10px 14px 12px 14px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    SỐ TIỀN KÝ QUỸ
                  </th>
                  <th
                    style={{
                      padding: '10px 14px 12px 14px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    XÁC THỰC CHECK-IN
                  </th>
                  <th
                    style={{
                      padding: '10px 6px 12px 14px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      textAlign: 'right',
                    }}
                  >
                    FAIRP
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
                      <td style={{ padding: '16px 14px 16px 6px' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#111827',
                            marginBottom: '2px',
                          }}
                        >
                          {item.time}
                        </div>
                        <div
                          style={{
                            fontSize: '11.5px',
                            color: '#6B7280',
                            fontWeight: 500,
                          }}
                        >
                          {item.location}
                        </div>
                      </td>

                      {/* 2. MÔN THỂ THAO */}
                      <td style={{ padding: '16px 14px' }}>
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
                          }}
                        >
                          <span>{item.sportIcon === 'badminton' ? '🏸' : '🏓'}</span>
                          <span>{item.sport}</span>
                        </span>
                      </td>

                      {/* 3. SỐ TIỀN KÝ QUỸ */}
                      <td style={{ padding: '16px 14px' }}>
                        <div
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 800,
                            color: '#111827',
                          }}
                        >
                          {item.amount}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#16A34A',
                            marginTop: '1px',
                          }}
                        >
                          {item.status}
                        </div>
                      </td>

                      {/* 4. XÁC THỰC CHECK-IN */}
                      <td style={{ padding: '16px 14px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: item.authIcon === 'kiosk' ? '#4D7C0F' : '#15803D',
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
                      <td style={{ padding: '16px 6px 16px 14px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            color: '#15803D',
                            fontSize: '13px',
                          }}
                        >
                          {[...Array(item.stars)].map((_, i) => (
                            <span key={i} style={{ color: '#15803D' }}>
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ===================== KHU VỰC ĐÁNH GIÁ BẠN CHƠI CÙNG SÂN SAU CHECK-OUT ===================== */}
          <div
            style={{
              marginTop: '28px',
              padding: '20px 22px',
              borderRadius: '18px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '15.5px',
                    fontWeight: 800,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>
                    stars
                  </span>
                  Đánh Giá Bạn Chơi Cùng Sân Sau Trận
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Quy định: Chỉ được phép viết nhận xét và chấm sao cho bạn cùng sân sau khi <strong>check-out thành công</strong>.
                </div>
              </div>

              <Link
                to="/post-match-rating"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#15803D',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#DCFCE7',
                  padding: '6px 12px',
                  borderRadius: '10px',
                }}
              >
                <span>Trang Đánh Giá Chi Tiết</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  open_in_new
                </span>
              </Link>
            </div>

            {/* Trạng thái chưa check-out: Khóa đánh giá */}
            {!checkOutDone ? (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#DC2626' }}>
                    lock_clock
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B' }}>
                      Đánh giá sau trận đang tạm khóa
                    </div>
                    <div style={{ fontSize: '12px', color: '#B91C1C' }}>
                      Bạn cần hoàn tất <strong>Check-out trả sân</strong> để mở quyền viết nhận xét và chấm điểm sao cho bạn chơi.
                    </div>
                  </div>
                </div>

                {checkInDone ? (
                  <button
                    type="button"
                    onClick={() => setShowCheckOutModal(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#DC2626',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Check-out trả sân ngay
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCheckInModal(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#15803D',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Check-in vào sân trước
                  </button>
                )}
              </div>
            ) : (
              /* Trạng thái đã check-out: Danh sách bạn chơi cùng sân kèm nút đánh giá */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#166534',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#15803D' }}>
                    check_circle
                  </span>
                  Đã xác thực check-out thành công • Chọn bạn chơi bên dưới để viết nhận xét và chấm sao:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '6px' }}>
                  {matchParticipants.map((p) => {
                    const isReviewed = reviewedPlayerIds.includes(p.id)
                    return (
                      <div
                        key={p.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#DCFCE7',
                              color: '#15803D',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                            }}
                          >
                            {(p.name || p.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                              {p.name || p.email.split('@')[0]}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {p.role || 'Bạn cùng sân'}
                            </div>
                          </div>
                        </div>

                        {isReviewed ? (
                          <span
                            style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>✓ Đã đánh giá</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenRateModal(p)}
                            style={{
                              background: '#15803D',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                              star
                            </span>
                            <span>Đánh giá</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: '28px',
              padding: '16px 18px',
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
                Hệ thống xác thực mã hóa hai lớp • Tự động hoàn tiền nếu chủ sân hủy lịch
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

      {/* ===================== SIMULATION SUCCESS MODAL ===================== */}
      {showCheckInModal && (
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
          onClick={() => setShowCheckInModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
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
              Check-in Cổng B2 Thành Công!
            </h3>
            <p
              style={{
                fontSize: '13.5px',
                color: '#4B5563',
                margin: '0 0 20px 0',
                lineHeight: 1.5,
              }}
            >
              Hệ thống đã nhận diện mã QR của bạn. Barie Cổng B2 đã mở, chúc bạn có trận đấu bùng nổ!
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
                Số tiền <strong>330.000 đ</strong> đã được giải tỏa an toàn và ghi nhận doanh thu cho Sân Cầu Lông BWF Pro 01.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCheckInModal(false)
                setCheckInDone(true)
                const session = {
                  courtId: 'Court 3',
                  courtName: 'Sân Cầu Lông BWF Pro 01',
                  sport: 'Cầu Lông',
                  checkInDone: true,
                  checkInTime: '18:00',
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
                setToastMessage('Đã check-in thành công • Trạng thái sân: Đang Hoạt Động')
                setTimeout(() => setToastMessage(null), 3500)
              }}
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
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.92'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Hoàn tất &amp; Vào sân thi đấu
            </button>
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
                        {p.name || p.email.split('@')[0]}
                      </option>
                    ))}
                  </select>
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
      `}</style>
    </div>
  )
}

export default CheckInQR
