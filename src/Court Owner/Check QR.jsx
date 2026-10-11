import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Danh sách vé mẫu mô phỏng quét QR
const DEMO_TICKETS = [
  {
    ticketCode: 'SNX-89324-CHK',
    playerName: 'Nguyễn Văn An',
    playerPhone: '0912 345 678',
    playerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
    playerRank: 'Gold Member • Uy tín 98%',
    zoneName: 'Khu A — Sân Cầu Lông Quốc Tế BWF',
    courtName: 'Sân A1 (Tiêu chuẩn VIP)',
    sport: 'Cầu lông',
    sportIcon: 'sports_tennis',
    timeSlot: '18:00 - 19:30 Hôm nay',
    date: '10/10/2026',
    escrowAmount: 350000,
    status: 'locked_escrow', // 'locked_escrow' | 'released'
    isCorrectVenue: true,
    isCorrectTime: true,
    paymentMethod: 'Ví Escrow SportNexus (Đã khóa tiền)',
  },
  {
    ticketCode: 'SNX-44219-CHK',
    playerName: 'Trần Minh Quân (FC Saigon All-Stars)',
    playerPhone: '0988 765 432',
    playerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop',
    playerRank: 'Diamond Club • Đội trưởng FC',
    zoneName: 'Khu B — Cụm Sân Bóng Đá Mini',
    courtName: 'Sân B1 — Sân 5 Mini (Khung thành nhôm)',
    sport: 'Bóng đá',
    sportIcon: 'sports_soccer',
    timeSlot: '19:00 - 20:30 Hôm nay',
    date: '10/10/2026',
    escrowAmount: 600000,
    status: 'locked_escrow',
    isCorrectVenue: true,
    isCorrectTime: true,
    paymentMethod: 'VNPAY-QR Escrow Deposit',
  },
  {
    ticketCode: 'SNX-77102-CHK',
    playerName: 'Lê Hoàng Yến',
    playerPhone: '0903 111 222',
    playerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    playerRank: 'Silver Member',
    zoneName: 'Khu C — Cụm Sân Pickleball USAPA',
    courtName: 'Sân C1 (Center Court VIP)',
    sport: 'Pickleball',
    sportIcon: 'sports_tennis',
    timeSlot: '17:30 - 18:30 Hôm nay',
    date: '10/10/2026',
    escrowAmount: 240000,
    status: 'locked_escrow',
    isCorrectVenue: true,
    isCorrectTime: true,
    paymentMethod: 'Ví Escrow SportNexus',
  },
  {
    ticketCode: 'SNX-99001-USED',
    playerName: 'Phạm Đức Trọng',
    playerPhone: '0934 999 888',
    playerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    playerRank: 'Bronze Member',
    zoneName: 'Khu A — Sân Cầu Lông BWF',
    courtName: 'Sân A3',
    sport: 'Cầu lông',
    sportIcon: 'sports_tennis',
    timeSlot: '15:00 - 16:30 Hôm nay',
    date: '10/10/2026',
    escrowAmount: 300000,
    status: 'released', // Đã check-in rồi
    isCorrectVenue: true,
    isCorrectTime: true,
    paymentMethod: 'Đã hoàn tất giải ngân',
  },
]

export default function CheckQR() {
  const [manualCode, setManualCode] = useState('')
  const [scannedTicket, setScannedTicket] = useState(null)
  const [isScanning, setIsScanning] = useState(true)
  const [flashLight, setFlashLight] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [successDisbursedModal, setSuccessDisbursedModal] = useState(null)

  // Danh sách lịch sử lượt check-in gần đây
  const [recentLogs, setRecentLogs] = useState([
    {
      id: 'chk-101',
      code: 'SNX-65231-CHK',
      player: 'Hoàng Anh Tuấn',
      court: 'Khu A — Sân A2',
      sport: 'Cầu lông',
      time: '17:05:22',
      amount: 220000,
      escrowHash: '0x8f2a...b741',
      status: 'success',
    },
    {
      id: 'chk-102',
      code: 'SNX-11204-CHK',
      player: 'Nguyễn Thành Long',
      court: 'Khu C — Sân C2',
      sport: 'Pickleball',
      time: '16:58:10',
      amount: 200000,
      escrowHash: '0x3c1d...e892',
      status: 'success',
    },
    {
      id: 'chk-103',
      code: 'SNX-99001-USED',
      player: 'Phạm Đức Trọng',
      court: 'Khu A — Sân A3',
      sport: 'Cầu lông',
      time: '14:59:45',
      amount: 300000,
      escrowHash: '0x7a44...f231',
      status: 'success',
    },
  ])

  // Số dư chủ sân
  const [ownerBalance, setOwnerBalance] = useState(() => {
    const saved = localStorage.getItem('court_owner_balance')
    return saved !== null ? Number(saved) : 48650000
  })

  useEffect(() => {
    localStorage.setItem('court_owner_balance', ownerBalance.toString())
  }, [ownerBalance])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Quét vé mẫu
  const handleSelectDemoTicket = (ticket) => {
    setScannedTicket(ticket)
    setIsScanning(false)
    if (ticket.status === 'released') {
      showToast('⚠️ Vé này đã từng được quét check-in trước đó!')
    } else {
      showToast('✅ Đã nhận diện mã vé QR hợp lệ!')
    }
  }

  // Nhập mã tay
  const handleManualLookup = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return

    const clean = manualCode.trim().toUpperCase()
    const found = DEMO_TICKETS.find((t) => t.ticketCode.toUpperCase() === clean)

    if (found) {
      setScannedTicket(found)
      setIsScanning(false)
      showToast('✅ Tìm thấy thông tin vé đặt sân!')
    } else {
      // Mock tạo vé mới theo mã nhập
      const newMock = {
        ticketCode: clean,
        playerName: 'Khách hàng SportNexus (Mã tra cứu)',
        playerPhone: '0909 *** ***',
        playerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
        playerRank: 'Standard Member',
        zoneName: 'Khu A — Cụm Sân Cầu Lông Quốc Tế BWF',
        courtName: 'Sân A1',
        sport: 'Cầu lông',
        sportIcon: 'sports_tennis',
        timeSlot: 'Khung giờ hiện tại',
        date: '10/10/2026',
        escrowAmount: 260000,
        status: 'locked_escrow',
        isCorrectVenue: true,
        isCorrectTime: true,
        paymentMethod: 'Smart Escrow SportNexus',
      }
      setScannedTicket(newMock)
      setIsScanning(false)
      showToast('✅ Tìm thấy mã đặt sân hợp lệ trong hệ thống!')
    }
  }

  // Xác nhận check-in & kích hoạt giải ngân Escrow
  const handleConfirmCheckInAndDisburse = () => {
    if (!scannedTicket) return

    if (scannedTicket.status === 'released') {
      showToast('❌ Vé này đã được giải ngân rồi, không thể giải ngân lại!')
      return
    }

    const txHash = `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    // Tăng số dư khả dụng của chủ sân
    const newBal = ownerBalance + scannedTicket.escrowAmount
    setOwnerBalance(newBal)

    // Cập nhật trạng thái vé
    const updatedTicket = { ...scannedTicket, status: 'released' }
    setScannedTicket(updatedTicket)

    // Thêm log mới
    const newLogItem = {
      id: `chk-${Date.now()}`,
      code: scannedTicket.ticketCode,
      player: scannedTicket.playerName,
      court: `${scannedTicket.zoneName.split('—')[0]} — ${scannedTicket.courtName.split('(')[0]}`,
      sport: scannedTicket.sport,
      time: nowTime,
      amount: scannedTicket.escrowAmount,
      escrowHash: txHash,
      status: 'success',
    }

    setRecentLogs([newLogItem, ...recentLogs])

    // Mở modal chúc mừng giải ngân
    setSuccessDisbursedModal({
      ...scannedTicket,
      disbursedAt: nowTime,
      txHash: txHash,
      newBalance: newBal,
    })

    showToast(`🎉 Check-in thành công! Đã giải ngân +${formatVND(scannedTicket.escrowAmount)} về số dư khả dụng!`)
  }

  const handleResetScanner = () => {
    setScannedTicket(null)
    setManualCode('')
    setIsScanning(true)
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Header section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Smart Escrow Check-in Terminal
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Cơ chế giải ngân tự động tức thì
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Quét Mã QR & Kích Hoạt Giải Ngân Escrow
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>
            Quét mã QR của người chơi khi đến sân để xác nhận vào sân và mở khóa chuyển tiền ký quỹ vào ví của Chủ Sân.
          </p>
        </div>

        {/* Available Balance Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(6, 78, 59, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#34D399' }}>
              account_balance_wallet
            </span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#A7F3D0', fontWeight: 600 }}>
              Số Dư Khả Dụng (Đã Giải Ngân)
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
              {formatVND(ownerBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner on Left, Scanned Ticket Details on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '28px', marginBottom: '32px' }}>
        {/* Left Column: QR Scanner Viewport */}
        <div>
          <div
            style={{
              background: '#0F172A',
              borderRadius: '20px',
              padding: '24px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>
                  Camera Scanner 4K AI Active
                </span>
              </div>

              {/* Flashlight toggle */}
              <button
                onClick={() => setFlashLight((v) => !v)}
                style={{
                  background: flashLight ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {flashLight ? 'flashlight_on' : 'flashlight_off'}
                </span>
                {flashLight ? 'Bật Flash' : 'Tắt Flash'}
              </button>
            </div>

            {/* Viewfinder Frame */}
            <div
              style={{
                width: '100%',
                height: '320px',
                borderRadius: '16px',
                background: '#1E293B',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px dashed rgba(255, 255, 255, 0.15)',
              }}
            >
              {/* Animated Laser Beam */}
              {isScanning && (
                <div
                  style={{
                    position: 'absolute',
                    left: '10%',
                    right: '10%',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)',
                    boxShadow: '0 0 16px 4px #10B981',
                    animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                    zIndex: 10,
                  }}
                />
              )}

              {/* Viewfinder Target Box */}
              <div
                style={{
                  width: '210px',
                  height: '210px',
                  border: '2px solid rgba(16, 185, 129, 0.6)',
                  borderRadius: '18px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.25)',
                }}
              >
                {/* 4 corner accents */}
                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderLeft: '4px solid #10B981', borderTopLeftRadius: '14px' }} />
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderRight: '4px solid #10B981', borderTopRightRadius: '14px' }} />
                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderLeft: '4px solid #10B981', borderBottomLeftRadius: '14px' }} />
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderRight: '4px solid #10B981', borderBottomRightRadius: '14px' }} />

                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                    qr_code_scanner
                  </span>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                    Đặt mã QR vé người chơi vào chính giữa khung hình
                  </div>
                </div>
              </div>

              {/* Scan keyframe animation */}
              <style>{`
                @keyframes scanLaser {
                  0% { top: 15%; opacity: 0.3; }
                  50% { opacity: 1; }
                  100% { top: 85%; opacity: 0.3; }
                }
              `}</style>
            </div>

            {/* Quick Demo Tickets Selection */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px' }}>
                QUÉT NHANH VÉ MẪU ĐỂ TEST HỆ THỐNG:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {DEMO_TICKETS.map((t, idx) => (
                  <button
                    key={t.ticketCode}
                    onClick={() => handleSelectDemoTicket(t)}
                    style={{
                      background: scannedTicket?.ticketCode === t.ticketCode ? '#10B981' : '#1E293B',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Vé #{idx + 1} ({t.sport})</span>
                      <span style={{ color: t.status === 'released' ? '#FCA5A5' : '#86EFAC' }}>
                        {formatVND(t.escrowAmount)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      {t.playerName.split('(')[0].trim()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Code Input Form */}
            <form onSubmit={handleManualLookup} style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                HOẶC NHẬP MÃ ĐẶT SÂN / MÃ VÉ THỦ CÔNG:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="VD: SNX-89324-CHK..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0 16px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Kiểm Tra
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scanned Ticket Verification & Escrow Settlement Card */}
        <div>
          {scannedTicket ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              {/* Header of Ticket */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '18px',
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: scannedTicket.status === 'released' ? '#FEF2F2' : '#EFF6FF',
                        color: scannedTicket.status === 'released' ? '#DC2626' : '#2563EB',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      MÃ VÉ: {scannedTicket.ticketCode}
                    </span>
                    <span
                      style={{
                        background: scannedTicket.status === 'released' ? '#DC2626' : '#10B981',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {scannedTicket.status === 'released' ? 'ĐÃ CHECK-IN & GIẢI NGÂN' : 'SẴN SÀNG CHECK-IN'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '8px 0 0 0' }}>
                    Thông Tin Vé Đặt Sân & Ký Quỹ Escrow
                  </h2>
                </div>

                <button
                  onClick={handleResetScanner}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    refresh
                  </span>
                  Quét vé khác
                </button>
              </div>

              {/* Player Profile Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <img
                  src={scannedTicket.playerAvatar}
                  alt={scannedTicket.playerName}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #10B981',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {scannedTicket.playerName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span>📞 {scannedTicket.playerPhone}</span>
                    <span>•</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>{scannedTicket.playerRank}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#065F46',
                      border: '1px solid #A7F3D0',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    Đã Xác Minh Danh Tính
                  </span>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Cụm Sân & Khu Vực:</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {scannedTicket.zoneName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                    {scannedTicket.courtName}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Khung Giờ Thi Đấu:</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                    {scannedTicket.timeSlot}
                  </div>
                  <div style={{ fontSize: '13px', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    Ngày: {scannedTicket.date}
                  </div>
                </div>
              </div>

              {/* Escrow Deposit Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #F59E0B',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#B45309' }}>
                        lock
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                        {scannedTicket.status === 'released' ? 'ĐÃ GIẢI NGÂN THÀNH CÔNG' : 'TIỀN CỌC ĐANG KHÓA TẠI SMART ESCROW'}
                      </span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#78350F', margin: '4px 0' }}>
                      {formatVND(scannedTicket.escrowAmount)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#92400E' }}>
                      Phương thức: <strong>{scannedTicket.paymentMethod}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>HỢP ĐỒNG ESCROW</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      100% An Toàn
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Bảo chứng SportNexus</div>
                  </div>
                </div>

                <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                  Khi bấm xác nhận dưới đây, hợp đồng Smart Escrow sẽ mở khóa tức thời và chuyển toàn bộ số tiền cọc {formatVND(scannedTicket.escrowAmount)} vào tài khoản khả dụng của Chủ Sân.
                </p>
              </div>

              {/* Action Buttons */}
              <div>
                {scannedTicket.status !== 'released' ? (
                  <button
                    onClick={handleConfirmCheckInAndDisburse}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                      lock_open
                    </span>
                    XÁC NHẬN CHECK-IN & KÍCH HOẠT GIẢI NGÂN ESCROW ({formatVND(scannedTicket.escrowAmount)})
                  </button>
                ) : (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #86EFAC',
                      borderRadius: '12px',
                      padding: '14px',
                      textAlign: 'center',
                      color: '#15803D',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    ✅ Vé này đã được check-in và giải ngân thành công vào số dư của cơ sở.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '2px dashed #CBD5E1',
                padding: '60px 24px',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '42px' }}>
                  document_scanner
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#334155', margin: '0 0 6px 0' }}>
                Chưa Có Mã Vé Nào Được Quét
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '14px', maxWidth: '360px' }}>
                Hướng camera vào mã QR của người chơi hoặc nhấn các nút vé mẫu ở cột bên trái để thử nghiệm quy trình giải ngân.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Check-in Logs Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Nhật Ký Quét QR & Giải Ngân Escrow Trong Ngày
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13px' }}>
              Danh sách các lượt check-in đã hoàn tất giải ngân tiền cọc về ví chủ sân
            </p>
          </div>

          <span
            style={{
              background: '#DCFCE7',
              color: '#15803D',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '999px',
            }}
          >
            Hôm nay: {recentLogs.length} lượt hoàn tất
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Thời Gian
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Mã Vé
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Người Chơi
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Sân Thi Đấu
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Tiền Giải Ngân
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Mã Tham Chiếu Escrow
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Trạng Thái
                </th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    {log.time}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                    {log.code}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {log.player}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                    {log.court}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>
                    +{formatVND(log.amount)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>
                    {log.escrowHash}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        check
                      </span>
                      Đã Giải Ngân
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thông Báo Giải Ngân Thành Công */}
      {successDisbursedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '42px' }}>
                verified
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Giải Ngân Escrow Thành Công!
            </h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '14px' }}>
              Hệ thống Smart Escrow đã chuyển tiền cọc của khách hàng vào tài khoản khả dụng của cơ sở.
            </p>

            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                textAlign: 'left',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Số tiền giải ngân:</span>
                <strong style={{ fontSize: '16px', color: '#16A34A' }}>
                  +{formatVND(successDisbursedModal.escrowAmount)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Khách hàng:</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                  {successDisbursedModal.playerName}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Sân & Khung giờ:</span>
                <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                  {successDisbursedModal.courtName} • {successDisbursedModal.timeSlot}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Số dư khả dụng mới:</span>
                <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                  {formatVND(successDisbursedModal.newBalance)}
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessDisbursedModal(null)
                handleResetScanner()
              }}
              style={{
                width: '100%',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hoàn Tất & Tiếp Tục Quét
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
