import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function CheckInQR() {
  const [seconds, setSeconds] = useState(29)
  const [copied, setCopied] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [checkInDone, setCheckInDone] = useState(false)

  // Share QR modal states with participant deletion support
  const [showShareModal, setShowShareModal] = useState(false)
  const [matchParticipants, setMatchParticipants] = useState([
    { id: '1', email: 'hoang.nam.badminton@gmail.com', isSelected: true },
    { id: '2', email: 'duc_tran92@outlook.com', isSelected: false },
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
        { id: Date.now().toString(), email: trimmed, isSelected: true },
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
      { id: '1', email: 'hoang.nam.badminton@gmail.com', isSelected: true },
      { id: '2', email: 'duc_tran92@outlook.com', isSelected: false },
    ])
    setToastMessage('Đã khôi phục danh sách gợi ý ban đầu')
    setTimeout(() => setToastMessage(null), 3000)
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
              {checkInDone ? (
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

            {/* Quick Demo Scan Button */}
            <button
              type="button"
              onClick={() => setShowCheckInModal(true)}
              style={{
                marginTop: '10px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px dashed #10B981',
                background: '#F0FDF4',
                color: '#15803D',
                fontSize: '11.5px',
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
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                qr_code_scanner
              </span>
              Mô phỏng quét mã vào cổng
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

          {/* Additional Escrow Security Details Box */}
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
                  placeholder=""
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
