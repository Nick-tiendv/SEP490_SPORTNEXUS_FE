import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Tài khoản ngân hàng liên kết sẵn của Chủ Sân
const LINKED_BANK_ACCOUNTS = [
  {
    id: 'vcb-01',
    bankName: 'Vietcombank',
    bankShort: 'VCB',
    accountNumber: '0071000987654',
    accountHolder: 'NGUYEN VAN DUC (CHU SAN)',
    branch: 'Chi nhánh Nam Sài Gòn - Q.7',
    isDefault: true,
    logo: '🏦',
  },
  {
    id: 'mb-02',
    bankName: 'MB Bank',
    bankShort: 'MB',
    accountNumber: '88880908123456',
    accountHolder: 'SPORTNEXUS ARENA CO., LTD',
    branch: 'Sở Giao Dịch TP.HCM',
    isDefault: false,
    logo: '🎖️',
  },
  {
    id: 'tcb-03',
    bankName: 'Techcombank',
    bankShort: 'TCB',
    accountNumber: '19036789012345',
    accountHolder: 'NGUYEN VAN DUC',
    branch: 'Chi nhánh Phú Mỹ Hưng',
    isDefault: false,
    logo: '⚡',
  },
]

// Danh sách lịch sử giao dịch quyết toán & giải ngân
const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-98210',
    type: 'escrow_release',
    title: 'Giải ngân Escrow — Check-in Sân A1',
    amount: 350000,
    timestamp: '10/10/2026 18:02:15',
    status: 'completed',
    refCode: 'SNX-89324-CHK',
    zone: 'Khu A Cầu Lông',
  },
  {
    id: 'TXN-98209',
    type: 'escrow_release',
    title: 'Giải ngân Escrow — Check-in Sân B1',
    amount: 600000,
    timestamp: '10/10/2026 17:35:40',
    status: 'completed',
    refCode: 'SNX-44219-CHK',
    zone: 'Khu B Bóng Đá',
  },
  {
    id: 'TXN-98205',
    type: 'withdrawal',
    title: 'Rút tiền về Vietcombank (Napas 24/7)',
    amount: -25000000,
    timestamp: '09/10/2026 11:15:00',
    status: 'completed',
    refCode: 'NAPAS-7749210-VCB',
    zone: 'Tài khoản cá nhân',
  },
  {
    id: 'TXN-98198',
    type: 'escrow_release',
    title: 'Giải ngân Escrow — Check-in Sân C1',
    amount: 240000,
    timestamp: '09/10/2026 16:45:10',
    status: 'completed',
    refCode: 'SNX-77102-CHK',
    zone: 'Khu C Pickleball',
  },
  {
    id: 'TXN-98180',
    type: 'fee',
    title: 'Khấu trừ phí nền tảng SportNexus (3%)',
    amount: -750000,
    timestamp: '08/10/2026 23:59:59',
    status: 'completed',
    refCode: 'PLATFORM-FEE-W40',
    zone: 'Hệ thống SportNexus',
  },
]

export default function Settlement() {
  // Số dư khả dụng của chủ sân
  const [availableBalance, setAvailableBalance] = useState(() => {
    const saved = localStorage.getItem('court_owner_balance')
    return saved !== null ? Number(saved) : 48650000
  })

  // Số dư đang tạm giữ ở Smart Escrow
  const [pendingEscrow] = useState(19820000)
  const [monthlyRevenue] = useState(142500000)
  const [platformFee] = useState(4275000) // 3%

  // Lịch sử giao dịch
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS)
  const [activeTxnTab, setActiveTxnTab] = useState('all')

  const filteredTransactions = transactions.filter((t) => {
    if (activeTxnTab === 'all') return true
    return t.type === activeTxnTab
  })

  // Modal rút tiền
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState(LINKED_BANK_ACCOUNTS[0])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNote, setWithdrawNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [successWithdrawReceipt, setSuccessWithdrawReceipt] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    localStorage.setItem('court_owner_balance', availableBalance.toString())
  }, [availableBalance])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Xử lý tạo lệnh rút tiền
  const handleExecuteWithdrawal = (e) => {
    e.preventDefault()
    const amountNum = Number(withdrawAmount.replace(/[^0-9]/g, ''))

    if (!amountNum || amountNum < 100000) {
      showToast('❌ Số tiền rút tối thiểu là 100.000 VNĐ!')
      return
    }

    if (amountNum > availableBalance) {
      showToast('❌ Số tiền rút vượt quá số dư khả dụng hiện có!')
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      const newBal = availableBalance - amountNum
      setAvailableBalance(newBal)

      const refCode = `NAPAS-${Math.floor(1000000 + Math.random() * 9000000)}-${selectedBank.bankShort}`
      const newTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'withdrawal',
        title: `Rút tiền về ${selectedBank.bankName} (Napas 24/7)`,
        amount: -amountNum,
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'completed',
        refCode: refCode,
        zone: selectedBank.accountNumber,
      }

      setTransactions([newTxn, ...transactions])
      setIsProcessing(false)
      setShowWithdrawModal(false)

      setSuccessWithdrawReceipt({
        amount: amountNum,
        bank: selectedBank,
        refCode: refCode,
        time: newTxn.timestamp,
        remainingBalance: newBal,
      })

      showToast(`🎉 Lệnh rút tiền ${formatVND(amountNum)} đã được chuyển khoản thành công!`)
    }, 1200)
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

      {/* Header section — Khung Tiêu Đề Glassmorphism Nổi Bật */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(45, 95, 63, 0.16)',
          padding: '24px 28px',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #15803D 0%, #047857 100%)',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
              }}
            >
              FINANCIAL SETTLEMENT HUB
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Cổng Quyết Toán Napas 24/7 Trực Tuyến
            </span>
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
              lineHeight: 1.25,
            }}
          >
            Báo Cáo Doanh Thu &amp; Quyết Toán Tài Chính
          </h1>
          <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.5, maxWidth: '680px' }}>
            Theo dõi dòng tiền giải ngân minh bạch từ <strong>Smart Escrow</strong>, kiểm soát phân bổ doanh thu từng cụm sân và rút tiền tức thì 24/7.
          </p>
        </div>

        {/* Action Button: Rút Tiền Về Ngân Hàng */}
        <button
          onClick={() => {
            setWithdrawAmount('')
            setShowWithdrawModal(true)
          }}
          style={{
            background: 'linear-gradient(135deg, #15803D 0%, #047857 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            padding: '15px 26px',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 6px 20px rgba(21, 128, 61, 0.32)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 26px rgba(21, 128, 61, 0.42)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(21, 128, 61, 0.32)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            payments
          </span>
          <span>TẠO YÊU CẦU RÚT TIỀN (PAYOUT)</span>
        </button>
      </div>

      {/* 4 Core Financial KPI Cards — Từng Khung Nổi Bật & Tinh Tế */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Khung 1: Available Balance (Số Dư Khả Dụng) — Nổi Bật Tối Đa */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #15803D 55%, #047857 100%)',
            borderRadius: '20px',
            padding: '24px 26px',
            color: '#FFFFFF',
            boxShadow: '0 12px 30px -4px rgba(21, 128, 61, 0.35)',
            border: '1.5px solid rgba(134, 239, 172, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              right: '-25px',
              top: '-25px',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: '#A7F3D0',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                SỐ DƯ KHẢ DỤNG (AVAILABLE)
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#86EFAC' }}>
                  account_balance_wallet
                </span>
              </div>
            </div>

            <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', margin: '4px 0 14px 0' }}>
              {formatVND(availableBalance)}
            </div>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '6px 12px',
              borderRadius: '10px',
              width: 'fit-content',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#86EFAC' }}>
              check_circle
            </span>
            <span>Sẵn sàng rút tức thì Napas 24/7</span>
          </div>
        </div>

        {/* Khung 2: Pending Escrow (Tạm Giữ Tại Smart Escrow) — Tông Hổ Phách Sang Trọng */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 251, 235, 0.94) 100%)',
            borderRadius: '20px',
            padding: '24px 26px',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 10px 28px -4px rgba(217, 119, 6, 0.10)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: '#B45309',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                TẠM GIỮ TẠI SMART ESCROW
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FEF3C7',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.12)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#D97706' }}>
                  lock_clock
                </span>
              </div>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 900, color: '#B45309', letterSpacing: '-0.5px', margin: '4px 0 14px 0' }}>
              {formatVND(pendingEscrow)}
            </div>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FEF3C7',
              padding: '6px 12px',
              borderRadius: '10px',
              width: 'fit-content',
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#D97706' }}>
              verified_user
            </span>
            <span>Tự động giải ngân khi quét QR check-in</span>
          </div>
        </div>

        {/* Khung 3: Monthly Revenue (Tổng Doanh Thu Tháng Này) — Tông Xanh Biển Chuyên Nghiệp */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 247, 255, 0.94) 100%)',
            borderRadius: '20px',
            padding: '24px 26px',
            border: '1.5px solid rgba(37, 99, 235, 0.30)',
            boxShadow: '0 10px 28px -4px rgba(37, 99, 235, 0.10)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: '#1D4ED8',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                DOANH THU THÁNG HIỆN TẠI
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563EB' }}>
                  trending_up
                </span>
              </div>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 900, color: '#1E40AF', letterSpacing: '-0.5px', margin: '4px 0 14px 0' }}>
              {formatVND(monthlyRevenue)}
            </div>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              padding: '6px 12px',
              borderRadius: '10px',
              width: 'fit-content',
              fontWeight: 700,
            }}
          >
            <span>🚀</span>
            <span>+18.4% tăng trưởng so với tháng trước</span>
          </div>
        </div>

        {/* Khung 4: Platform Fee (Phí Nền Tảng SportNexus 3%) — Tông Tím Đá Quý Thanh Lịch */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 246, 255, 0.94) 100%)',
            borderRadius: '20px',
            padding: '24px 26px',
            border: '1.5px solid rgba(124, 58, 237, 0.28)',
            boxShadow: '0 10px 28px -4px rgba(124, 58, 237, 0.08)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: '#6D28D9',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                PHÍ NỀN TẢNG SPORTNEXUS (3%)
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#F3E8FF',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#7C3AED' }}>
                  receipt_long
                </span>
              </div>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 900, color: '#5B21B6', letterSpacing: '-0.5px', margin: '4px 0 14px 0' }}>
              {formatVND(platformFee)}
            </div>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: '#5B21B6',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F3E8FF',
              padding: '6px 12px',
              borderRadius: '10px',
              width: 'fit-content',
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#7C3AED' }}>
              shield
            </span>
            <span>Bảo hiểm quỹ Escrow &amp; hạ tầng server</span>
          </div>
        </div>
      </div>

      {/* Analytics Section: Khung Biểu Đồ 7 Ngày & Phân Bổ Doanh Thu Bộ Môn */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Khung Biểu Đồ Doanh Thu 7 Ngày Gần Nhất */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(45, 95, 63, 0.16)',
            padding: '24px 28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: '22px' }}>
                    bar_chart
                  </span>
                  Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13px' }}>
                  Cuối tuần doanh thu bứt phá nhờ cơ chế Định giá động (Dynamic Pricing)
                </p>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: '#15803D',
                  fontWeight: 800,
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 1px 4px rgba(21, 128, 61, 0.1)',
                }}
              >
                ⚡ TB: 20.35 Triệu đ/ngày
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '210px',
                paddingTop: '20px',
                paddingBottom: '10px',
                borderBottom: '2px solid #E2E8F0',
                gap: '8px',
              }}
            >
              {[
                { day: 'Thứ 2', val: 14200000, height: '48%', peak: false },
                { day: 'Thứ 3', val: 15800000, height: '54%', peak: false },
                { day: 'Thứ 4', val: 16500000, height: '56%', peak: false },
                { day: 'Thứ 5', val: 18200000, height: '62%', peak: false },
                { day: 'Thứ 6', val: 22400000, height: '76%', peak: false },
                { day: 'Thứ 7', val: 29500000, height: '100%', peak: true },
                { day: 'CN', val: 28100000, height: '95%', peak: true },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: item.peak ? '#C2410C' : '#334155',
                      background: item.peak ? '#FFEDD5' : '#F1F5F9',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {(item.val / 1000000).toFixed(1)}M
                  </span>

                  <div
                    style={{
                      width: '75%',
                      maxWidth: '46px',
                      height: item.height,
                      borderRadius: '8px 8px 0 0',
                      background: item.peak
                        ? 'linear-gradient(180deg, #F97316 0%, #EA580C 100%)'
                        : 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                      boxShadow: item.peak
                        ? '0 4px 14px rgba(234, 88, 12, 0.35)'
                        : '0 4px 12px rgba(16, 185, 129, 0.25)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scaleY(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    title={`${item.day}: ${formatVND(item.val)}`}
                  />

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: item.peak ? 800 : 700,
                      color: item.peak ? '#C2410C' : '#475569',
                      marginTop: '4px',
                    }}
                  >
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Summary Footer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '18px',
              paddingTop: '12px',
            }}
          >
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '10px 14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Tổng 7 Ngày</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>144.7 Triệu đ</div>
            </div>
            <div style={{ background: '#FFF7ED', borderRadius: '12px', padding: '10px 14px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700 }}>Đỉnh Thứ 7 🔥</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#C2410C', marginTop: '2px' }}>29.5 Triệu đ</div>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '10px 14px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>Tỷ Lệ Lấp Đầy</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>91.4% Giờ vàng</div>
            </div>
          </div>
        </div>

        {/* Khung Phân Bổ Doanh Thu Theo Bộ Môn */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(45, 95, 63, 0.16)',
            padding: '24px 28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: '22px' }}>
                  pie_chart
                </span>
                Phân Bổ Doanh Thu Theo Bộ Môn
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>4 Bộ Môn Hoạt Động</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Khu B — Bóng Đá Mini (Sân 5-7)', emoji: '⚽', pct: 42, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', rev: 59850000 },
                { label: 'Khu A — Cầu Lông BWF (5 sân VIP)', emoji: '🏸', pct: 38, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', rev: 54150000 },
                { label: 'Khu C — Pickleball USAPA Pro', emoji: '🏓', pct: 15, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', rev: 21375000 },
                { label: 'Khu D — Quần Vợt Tennis ATP', emoji: '🎾', pct: 5, color: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8', rev: 7125000 },
              ].map((z, idx) => (
                <div
                  key={idx}
                  style={{
                    background: z.bg,
                    border: `1px solid ${z.border}`,
                    borderRadius: '14px',
                    padding: '12px 16px',
                    transition: 'transform 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{z.emoji}</span>
                      <span style={{ fontWeight: 800, color: '#1E293B' }}>{z.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#FFFFFF',
                          border: `1px solid ${z.border}`,
                          color: z.color,
                          fontWeight: 900,
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {z.pct}%
                      </span>
                      <span style={{ fontWeight: 900, color: '#0F172A', fontSize: '13.5px' }}>
                        {formatVND(z.rev)}
                      </span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div
                      style={{
                        width: `${z.pct}%`,
                        height: '100%',
                        background: z.color,
                        borderRadius: '999px',
                        boxShadow: `0 0 8px ${z.color}80`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
              insights
            </span>
            <span>Bóng đá và Cầu lông đóng góp <strong>80%</strong> tổng doanh thu của cơ sở SportNexus Arena.</span>
          </div>
        </div>
      </div>

      {/* Khung Bảng Lịch Sử Quyết Toán & Biến Động Số Dư — Thiết Kế Minh Bạch Cao Cấp */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(45, 95, 63, 0.16)',
          padding: '26px 28px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: '24px' }}>
                history_edu
              </span>
              Lịch Sử Quyết Toán &amp; Biến Động Số Dư Escrow
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13.5px' }}>
              Mọi dòng tiền đều được ghi nhận phân rã minh bạch theo mã tham chiếu Napas và Smart Escrow
            </p>
          </div>

          {/* Filter Tabs & Export Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Quick Filter Tabs */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
              {[
                { key: 'all', label: `Tất Cả (${transactions.length})` },
                { key: 'escrow_release', label: '⚡ Giải Ngân Escrow' },
                { key: 'withdrawal', label: '🏦 Rút Tiền' },
                { key: 'fee', label: '📄 Phí Sàn' },
              ].map((tab) => {
                const isActive = activeTxnTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTxnTab(tab.key)}
                    style={{
                      border: 'none',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? '#15803D' : '#64748B',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => showToast('🎉 Đang xuất bảng đối soát tài chính định dạng Excel (.xlsx)...')}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
                file_download
              </span>
              <span>Xuất Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#FFFFFF' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)', borderBottom: '2px solid #CBD5E1' }}>
                <th style={{ padding: '14px 18px', fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Mã Giao Dịch
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Nội Dung Giao Dịch
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Thời Gian
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Số Tiền
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Mã Đối Soát Napas / Ref
                </th>
                <th style={{ padding: '14px 18px', fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Trạng Thái
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => {
                const isPositive = txn.amount > 0
                return (
                  <tr
                    key={txn.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
                      {txn.id}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '18px',
                            color: isPositive ? '#16A34A' : txn.type === 'withdrawal' ? '#DC2626' : '#64748B',
                          }}
                        >
                          {isPositive ? 'qr_code_scanner' : txn.type === 'withdrawal' ? 'arrow_upward' : 'receipt'}
                        </span>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{txn.title}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{txn.zone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                      {txn.timestamp}
                    </td>
                    <td
                      style={{
                        padding: '14px 18px',
                        fontSize: '15px',
                        fontWeight: 900,
                        color: isPositive ? '#059669' : '#DC2626',
                      }}
                    >
                      {isPositive ? `+${formatVND(txn.amount)}` : formatVND(txn.amount)}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                      <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        {txn.refCode}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          border: '1px solid #86EFAC',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>✓</span> Thành Công
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tạo Yêu Cầu Rút Tiền (Payout) */}
      {showWithdrawModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  Tạo Yêu Cầu Rút Tiền Về Ngân Hàng
                </h3>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Chuyển tiền nhanh 24/7 qua cổng Napas liên ngân hàng
                </span>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Available Balance Box */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Số Dư Khả Dụng Có Thể Rút:</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#14532D' }}>
                  {formatVND(availableBalance)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmount(availableBalance.toString())}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Rút Tất Cả
              </button>
            </div>

            <form onSubmit={handleExecuteWithdrawal}>
              {/* Select Bank Account */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Tài Khoản Ngân Hàng Nhận Tiền:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {LINKED_BANK_ACCOUNTS.map((acc) => {
                    const isSelected = selectedBank.id === acc.id
                    return (
                      <div
                        key={acc.id}
                        onClick={() => setSelectedBank(acc)}
                        style={{
                          border: isSelected ? '2px solid #10B981' : '1px solid #E2E8F0',
                          background: isSelected ? '#ECFDF5' : '#FFFFFF',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>{acc.logo}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                              {acc.bankName} — {acc.accountNumber}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {acc.accountHolder} • {acc.branch}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '20px' }}>
                            check_circle
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Enter Amount */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Số Tiền Cần Rút (VNĐ):
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  placeholder="Nhập số tiền..."
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0F172A',
                  }}
                />

                {/* Quick amount chips */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {[5000000, 10000000, 20000000, 40000000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setWithdrawAmount(v.toString())}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {(v / 1000000).toFixed(0)} Triệu
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Ghi Chú Rút Tiền:
                </label>
                <input
                  type="text"
                  placeholder="VD: Rút doanh thu tuần 41..."
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isProcessing ? '#94A3B8' : '#10B981',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {isProcessing ? 'hourglass_top' : 'send'}
                  </span>
                  {isProcessing ? 'Đang Xử Lý Giao Dịch...' : 'XÁC NHẬN RÚT TIỀN NGAY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Biên Nhận Rút Tiền Thành Công */}
      {successWithdrawReceipt && (
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
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
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
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '38px' }}>
                verified
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Rút Tiền Thành Công!
            </h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '13px' }}>
              Tiền đã được chuyển khoản tới tài khoản ngân hàng thụ hưởng qua cổng Napas 24/7.
            </p>

            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                textAlign: 'left',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Số tiền rút:</span>
                <strong style={{ fontSize: '16px', color: '#16A34A' }}>
                  {formatVND(successWithdrawReceipt.amount)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Ngân hàng thụ hưởng:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {successWithdrawReceipt.bank.bankName}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Số tài khoản:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {successWithdrawReceipt.bank.accountNumber}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Mã tham chiếu Napas:</span>
                <span style={{ fontSize: '12px', color: '#2563EB', fontFamily: 'monospace' }}>
                  {successWithdrawReceipt.refCode}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Số dư khả dụng còn lại:</span>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                  {formatVND(successWithdrawReceipt.remainingBalance)}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setSuccessWithdrawReceipt(null)}
              style={{
                width: '100%',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
