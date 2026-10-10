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
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: '#F8FAFC' }}>
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
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              FINANCIAL SETTLEMENT HUB
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Báo cáo doanh thu & Rút tiền tức thì Napas 24/7
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
            Báo Cáo Doanh Thu & Quyết Toán (Settlement)
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>
            Theo dõi số dư đã giải ngân từ Smart Escrow, đối soát doanh thu đa môn thể thao và tạo lệnh rút tiền về tài khoản ngân hàng.
          </p>
        </div>

        {/* Action Button: Rút Tiền Về Ngân Hàng */}
        <button
          onClick={() => {
            setWithdrawAmount('')
            setShowWithdrawModal(true)
          }}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
            transition: 'transform 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            payments
          </span>
          TẠO YÊU CẦU RÚT TIỀN (PAYOUT)
        </button>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Available Balance (Đã Giải Ngân) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
            borderRadius: '18px',
            padding: '24px',
            color: '#FFFFFF',
            boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase' }}>
                SỐ DƯ KHẢ DỤNG (AVAILABLE BALANCE)
              </div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#FFFFFF', margin: '8px 0' }}>
                {formatVND(availableBalance)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#6EE7B7' }}>
                account_balance_wallet
              </span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#D1FAE5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              check_circle
            </span>
            Sẵn sàng rút về tài khoản ngân hàng ngay
          </div>
        </div>

        {/* Pending Escrow (Đang tạm giữ chờ check-in) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>
                TẠM GIỮ TẠI SMART ESCROW
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#D97706', margin: '8px 0' }}>
                {formatVND(pendingEscrow)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                lock_clock
              </span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Sẽ tự động giải ngân khi khách quét mã QR check-in
          </div>
        </div>

        {/* Monthly Revenue */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase' }}>
                TỔNG DOANH THU THÁNG NÀY
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '8px 0' }}>
                {formatVND(monthlyRevenue)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                trending_up
              </span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#16A34A', fontWeight: 700 }}>
            +18.4% so với tháng trước (Tăng trưởng cao)
          </div>
        </div>

        {/* Platform Fee & Net Payout */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                PHÍ NỀN TẢNG SPORTNEXUS (3%)
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#475569', margin: '8px 0' }}>
                {formatVND(platformFee)}
              </div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#F1F5F9',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                receipt_long
              </span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
            Đã bao gồm chi phí bảo hiểm Escrow & server
          </div>
        </div>
      </div>

      {/* Analytics Section: Revenue Breakdown by Zones & 7-Day Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', marginBottom: '32px' }}>
        {/* 7-Day Trend Bar Chart */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13px' }}>
                Cuối tuần có doanh thu bứt phá vượt bậc nhờ cơ chế Dynamic Pricing
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, background: '#DCFCE7', padding: '4px 10px', borderRadius: '6px' }}>
              TB: 20.350.000 đ/ngày
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingTop: '20px', borderBottom: '2px solid #E2E8F0' }}>
            {[
              { day: 'T2', val: 14200000, height: '48%', peak: false },
              { day: 'T3', val: 15800000, height: '54%', peak: false },
              { day: 'T4', val: 16500000, height: '56%', peak: false },
              { day: 'T5', val: 18200000, height: '62%', peak: false },
              { day: 'T6', val: 22400000, height: '76%', peak: false },
              { day: 'T7 (Peak)', val: 29500000, height: '100%', peak: true },
              { day: 'CN (Peak)', val: 28100000, height: '95%', peak: true },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: item.peak ? '#DC2626' : '#64748B' }}>
                  {(item.val / 1000000).toFixed(1)}M
                </span>
                <div
                  style={{
                    width: '36px',
                    height: item.height,
                    borderRadius: '8px 8px 0 0',
                    background: item.peak
                      ? 'linear-gradient(180deg, #F97316 0%, #EA580C 100%)'
                      : 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                    boxShadow: item.peak ? '0 4px 12px rgba(249, 115, 22, 0.25)' : 'none',
                    transition: 'height 0.3s',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: item.peak ? 800 : 600, color: item.peak ? '#EA580C' : '#334155', marginTop: '4px' }}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown by Zone */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            Phân Bổ Doanh Thu Theo Bộ Môn
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Khu B — Bóng Đá Mini (3 sân)', pct: 42, color: '#3B82F6', rev: 59850000 },
              { label: 'Khu A — Cầu Lông BWF (5 sân)', pct: 38, color: '#10B981', rev: 54150000 },
              { label: 'Khu C — Pickleball Pro (4 sân)', pct: 15, color: '#F59E0B', rev: 21375000 },
              { label: 'Khu D — Tennis ATP (2 sân)', pct: 5, color: '#EC4899', rev: 7125000 },
            ].map((z, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{z.label}</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>
                    {z.pct}% ({formatVND(z.rev)})
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${z.pct}%`, height: '100%', background: z.color, borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Settlement History Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
              Lịch Sử Giao Dịch Quyết Toán & Biến Động Số Dư
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13px' }}>
              Ghi nhận minh bạch mọi dòng tiền giải ngân từ Escrow và lệnh rút tiền về ngân hàng
            </p>
          </div>

          <button
            onClick={() => showToast('Đang xuất bảng đối soát tài chính định dạng Excel/CSV...')}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              file_download
            </span>
            Xuất Báo Cáo
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Mã Giao Dịch
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Nội Dung Giao Dịch
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Thời Gian
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Số Tiền
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Mã Đối Soát / Tham Chiếu
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  Trạng Thái
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const isPositive = txn.amount > 0
                return (
                  <tr key={txn.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                      {txn.id}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{txn.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{txn.zone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                      {txn.timestamp}
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: isPositive ? '#16A34A' : '#DC2626',
                      }}
                    >
                      {isPositive ? `+${formatVND(txn.amount)}` : formatVND(txn.amount)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>
                      {txn.refCode}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        Thành Công
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
