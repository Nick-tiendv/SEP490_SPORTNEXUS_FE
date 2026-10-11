// SplitPayment.jsx — Xác Nhận Đặt Sân, Thanh Toán Ví / VietQR & Xuất Vé QR Check-In Động 30s
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './SplitPayment.css'

function SplitPayment() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  // Court info with exact fallbacks to reference design
  const courtName = state.court || 'SportNexus Arena Q.7'
  const subCourt = state.subCourt || 'Sân BWF 01'
  const subCourts = state.subCourts || (state.subCourt ? state.subCourt.split(', ') : ['Sân BWF 01'])
  const courtCount = state.courtCount || subCourts.length || 1
  const address = state.address || '35 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7'
  const locationName = 'Quận 7, TP.HCM'
  const slotTime = state.slot || '19:30 - 21:00'
  const hours = state.hours || 1.5
  const totalAmount = Number(state.total) || 330000
  const hourlyRate = state.hourlyRate || 220000
  const unitPrice = state.unitPrice || Math.round(totalAmount / courtCount)
  const courtImage =
    state.image ||
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop'
  const sportLabel = state.sport === 'pickleball' ? 'PICKLEBALL CHUYÊN NGHIỆP' : 'CẦU LÔNG CHUYÊN NGHIỆP'
  const floorType = state.subCourtDesc || 'Thảm YONEX BWF'

  // Booking step: 'confirm' | 'bank_qr' | 'ticket_pass'
  const [step, setStep] = useState('confirm')

  // Payment configuration
  const [paymentMode, setPaymentMode] = useState('full') // 'full' | 'split'
  const [paymentChannel, setPaymentChannel] = useState('escrow') // 'escrow' | 'bank'
  const [note, setNote] = useState('Lấy thêm 2 ống cầu Yonex AS-40, bật điều hòa trước 10 phút')
  const [countdown, setCountdown] = useState(581) // 09:41

  // Wallet balance state (synced with TopBar via localStorage & custom event)
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  // Dynamic 30-second QR Pass state
  const [qrSeconds, setQrSeconds] = useState(30)
  const [qrToken, setQrToken] = useState('SNX-BWF-9982-A81F')
  const [qrVersion, setQrVersion] = useState(1)

  // Notification modal state
  const [modalData, setModalData] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  // Countdown timer for booking hold (Step: confirm)
  useEffect(() => {
    if (step !== 'confirm') return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  // Rolling 30-second Dynamic QR timer (Step: ticket_pass)
  useEffect(() => {
    if (step !== 'ticket_pass') return
    const interval = setInterval(() => {
      setQrSeconds((prev) => {
        if (prev <= 1) {
          // Generate new token every 30 seconds
          const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase()
          setQrToken(`SNX-BWF-9982-${randomHex}`)
          setQrVersion((v) => v + 1)
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatVnd = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  // Split calculation (4 players)
  const splitAmount = Math.round(totalAmount / 4)
  const payableAmount = paymentMode === 'full' ? totalAmount : splitAmount

  // Handle manual QR Refresh
  const handleManualQrRefresh = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase()
    setQrToken(`SNX-BWF-9982-${randomHex}`)
    setQrVersion((v) => v + 1)
    setQrSeconds(30)
  }

  // Handle Copy to clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Action: Click "Xác nhận thanh toán & lấy vé QR"
  const handleConfirmCheckout = () => {
    if (paymentChannel === 'escrow') {
      // CASE 1: Thanh toán qua ví Escrow -> Trừ tiền tự động thẳng vào ví
      if (walletBalance < payableAmount) {
        alert('Số dư ví không đủ! Vui lòng nạp thêm tiền hoặc chọn thanh toán qua ngân hàng.')
        return
      }

      const newBalance = walletBalance - payableAmount
      setWalletBalance(newBalance)
      localStorage.setItem('escrow_balance', newBalance)
      window.dispatchEvent(new Event('escrow_balance_updated'))

      setModalData({
        title: 'Thanh Toán Thành Công Qua Ví!',
        desc: `Đã tự động trừ ${formatVnd(payableAmount)} từ Ví Escrow của bạn. Số dư ví còn lại: ${formatVnd(newBalance)}. Đang xuất vé QR check-in...`,
        onClose: () => {
          setModalData(null)
          setStep('ticket_pass')
        },
      })

      setTimeout(() => {
        setModalData(null)
        setStep('ticket_pass')
      }, 1600)
    } else {
      // CASE 2: Thanh toán qua ngân hàng -> Chuyển sang màn hình quét VietQR
      setStep('bank_qr')
    }
  }

  // Action: Completed Bank Transfer (Simulation)
  const handleBankPaymentSuccess = () => {
    setModalData({
      title: 'Giao Dịch Chuyển Khoản Thành Công!',
      desc: `Hệ thống đã nhận được ${formatVnd(payableAmount)} qua Napas 24/7. Hợp đồng Ký quỹ Escrow đã bảo chứng toàn diện. Đang xuất vé QR...`,
      onClose: () => {
        setModalData(null)
        setStep('ticket_pass')
      },
    })

    setTimeout(() => {
      setModalData(null)
      setStep('ticket_pass')
    }, 1600)
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
                      <span>Hôm nay (T6, 24/10)</span>
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
                    <span className="sp-badge-count">4 người</span>
                  </div>
                  <div className="sp-mode-amount-row">
                    <small>SỐ TIỀN:</small>
                    <strong className="sp-split-color">{formatVnd(splitAmount)} / người</strong>
                  </div>
                </div>
              </div>

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
                        Số dư ví: <strong>{formatVnd(walletBalance)}</strong> • Tự động trừ tiền &amp; kích hoạt vé
                      </span>
                    </div>
                  </div>

                  <div className="sp-pill-time-limit">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>Thời gian giới hạn là 15 phút</span>
                  </div>
                </div>

                {/* Channel 2: Bank Transfer / VietQR */}
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
                        <span className="sp-channel-name">Thanh toán qua tài khoản ngân hàng</span>
                        <span className="sp-badge-napas">VietQR / Napas 24/7</span>
                      </div>
                      <span className="sp-channel-sub">
                        Quét mã VietQR chuyển khoản tự động kích hoạt vé
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
                <div className="sp-user-avatar">MMM</div>
                <div className="sp-user-details">
                  <p className="sp-user-name">Minh Minh Minh</p>
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
                    <span>• Hôm nay {courtCount > 1 ? `(${courtCount} sân × ${formatVnd(unitPrice)})` : ''}</span>
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
                id="sp-confirm-checkout"
              >
                <span className="material-symbols-outlined">check_circle</span>
                <span>Xác nhận thanh toán &amp; lấy vé QR</span>
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
          PHẦN 2: MÀN HÌNH QUÉT MÃ VIETQR CHUYỂN KHOẢN NGÂN HÀNG
          ===================================================================== */}
      {step === 'bank_qr' && (
        <div className="sp-bank-container">
          {/* Cột Trái: Mã QR VietQR */}
          <div className="sp-bank-qr-card">
            <span className="sp-vietqr-header-pill">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                qr_code_scanner
              </span>
              VietQR / NAPAS 247
            </span>

            <div className="sp-bank-qr-frame">
              <img
                src={`https://api.vietqr.io/image/970422-0968950913-compact.png?amount=${payableAmount}&addInfo=SNX%20BOOKING%20BWF01&accountName=SPORTNEXUS%20ESCROW%20VIETNAM`}
                alt="VietQR Chuyển Khoản"
                className="sp-bank-qr-img"
              />
            </div>

            <div className="sp-bank-qr-amount-pill">
              <small>Số tiền cần chuyển khoản:</small>
              <strong>{formatVnd(payableAmount)}</strong>
            </div>

            <p style={{ fontSize: 11.5, color: '#6b7280', marginTop: 12, lineHeight: 1.4 }}>
              Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ (Vietcombank, MB, Techcombank, MoMo...) để quét mã
            </p>
          </div>

          {/* Cột Phải: Thông tin số tài khoản và nút hoàn tất */}
          <div className="sp-bank-details-panel">
            <div>
              <h2 className="sp-bank-info-title">Thông Tin Chuyển Khoản Ngân Hàng</h2>
              <p className="sp-bank-info-subtitle">
                Hệ thống tự động kích hoạt vé ngay khi giao dịch được xác nhận qua cổng Napas 24/7
              </p>

              <div className="sp-bank-fields-grid">
                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Ngân hàng thụ hưởng:</span>
                  <div className="sp-bank-field-val">
                    <strong>MB Bank (Ngân Hàng Quân Đội)</strong>
                  </div>
                </div>

                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Số tài khoản:</span>
                  <div className="sp-bank-field-val">
                    <strong>0968950913</strong>
                    <button
                      type="button"
                      className="sp-btn-copy"
                      onClick={() => handleCopy('0968950913', 'acc')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {copiedField === 'acc' ? 'check' : 'content_copy'}
                      </span>
                      {copiedField === 'acc' ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Chủ tài khoản:</span>
                  <div className="sp-bank-field-val">
                    <strong>SPORTNEXUS ESCROW VIETNAM</strong>
                  </div>
                </div>

                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Số tiền:</span>
                  <div className="sp-bank-field-val">
                    <strong style={{ color: '#2f5d12', fontSize: 16 }}>{formatVnd(payableAmount)}</strong>
                    <button
                      type="button"
                      className="sp-btn-copy"
                      onClick={() => handleCopy(String(payableAmount), 'amount')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {copiedField === 'amount' ? 'check' : 'content_copy'}
                      </span>
                      {copiedField === 'amount' ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                <div className="sp-bank-field-row">
                  <span className="sp-bank-field-label">Nội dung chuyển khoản:</span>
                  <div className="sp-bank-field-val">
                    <strong style={{ color: '#c2410c' }}>SNX BOOKING BWF01</strong>
                    <button
                      type="button"
                      className="sp-btn-copy"
                      onClick={() => handleCopy('SNX BOOKING BWF01', 'memo')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {copiedField === 'memo' ? 'check' : 'content_copy'}
                      </span>
                      {copiedField === 'memo' ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-bank-actions">
              <button
                type="button"
                className="sp-btn-confirm"
                style={{ flex: 1, margin: 0 }}
                onClick={handleBankPaymentSuccess}
              >
                <span className="material-symbols-outlined">verified</span>
                <span>Tôi đã chuyển khoản xong &amp; Nhận vé QR</span>
              </button>

              <button
                type="button"
                className="sp-btn-cancel"
                style={{ width: 'auto', margin: 0, padding: '12px 20px', background: '#6b7280' }}
                onClick={() => setStep('confirm')}
              >
                <span>Quay lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PHẦN 3: GIAO DIỆN XUẤT MÃ QR ĐỘNG 30S & TOÀN BỘ THÔNG TIN ĐÃ ĐẶT
          ===================================================================== */}
      {step === 'ticket_pass' && (
        <div className="sp-pass-grid">
          {/* CỘT TRÁI: THẺ MÃ QR CHECK-IN SÂN ĐỘNG (LÀM MỚI 30S) */}
          <div className="sp-ticket-card">
            <span className="sp-ticket-badge-ready">
              <span className="sp-ticket-pulse-dot" />
              Sẵn sàng check-in cổng sân
            </span>

            <h2 className="sp-ticket-title">Mã QR Check-in Độc Quyền</h2>
            <p className="sp-ticket-sub">
              Đưa mã QR này vào máy quét tại cổng hoặc quầy lễ tân để kích hoạt vào sân
            </p>

            {/* Khung mã QR động với hiệu ứng laser */}
            <div className="sp-ticket-qr-box">
              <div className="sp-ticket-laser-line" />

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

            {/* Thanh tiến trình đếm ngược 30 giây làm mới mã */}
            <div className="sp-ticket-timer-bar">
              <div className="sp-timer-bar-left">
                <div
                  className="sp-timer-progress-ring"
                  style={{ '--p-angle': `${(qrSeconds / 30) * 360}deg` }}
                >
                  <div className="sp-timer-progress-inner">{qrSeconds}s</div>
                </div>

                <div className="sp-timer-text-wrap">
                  <strong>Tự động làm mới sau {qrSeconds}s</strong>
                  <small>Bảo mật chống chụp màn hình / gian lận</small>
                </div>
              </div>

              <button
                type="button"
                className="sp-btn-refresh-qr"
                title="Làm mới mã ngay"
                onClick={handleManualQrRefresh}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  sync
                </span>
              </button>
            </div>

            <div className="sp-ticket-token-id">TOKEN: #{qrToken}</div>

            <div className="sp-ticket-escrow-pledge">
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                shield
              </span>
              <span>
                Chủ sân chỉ nhận tiền sau khi bạn quét QR check-in tại cổng thành công.
              </span>
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
                <div className="sp-pass-user-avatar">MMM</div>
                <div className="sp-pass-user-info">
                  <p className="sp-pass-user-name">Minh Minh Minh</p>
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
                  <span style={{ fontSize: 11.5, color: '#6b7280' }}>Hôm nay (T6, 24/10/2026)</span>
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

            {/* Các nút hành động */}
            <div className="sp-pass-action-buttons">
              <button
                type="button"
                className="sp-btn-action-primary"
                onClick={() => alert('Đã lưu mã vé QR vào thư viện ảnh của thiết bị!')}
              >
                <span className="material-symbols-outlined">download</span>
                <span>Tải ảnh vé QR về máy</span>
              </button>

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

      {/* ===================== FOOTER ===================== */}
      <footer className="sp-footer">
        <div className="sp-footer-top">
          <div>
            <div className="sp-footer-brand">
              <span className="sp-footer-logo-sq">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                  bolt
                </span>
              </span>
              <strong>SPORTNEXUS VIETNAM</strong>
            </div>
            <p>
              Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn diện.
            </p>
          </div>

          <div className="sp-footer-links">
            <div className="sp-footer-links-row">
              <span>
                <span className="material-symbols-outlined">support_agent</span>
                Hotline 24/7: 0968950913
              </span>
              <span>
                <span className="material-symbols-outlined">verified_user</span>
                Bảo vệ Ký Quỹ Escrow
              </span>
              <a href="#rules">Điều khoản dịch vụ</a>
            </div>
            <div className="sp-footer-links-row">
              <a href="#fairplay">Chính sách Fairplay</a>
            </div>
          </div>
        </div>

        <div className="sp-footer-bottom">
          <span>
            © 2026 SportNexus Vietnam Joint Stock Company • Nền tảng chuyên biệt Pickleball &amp; Cầu Lông. Bảo
            lưu mọi quyền.
          </span>
          <span className="sp-live-indicator">
            <span className="sp-live-dot" />
            Hệ thống bảo chứng Escrow thời gian thực
          </span>
        </div>
      </footer>

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
