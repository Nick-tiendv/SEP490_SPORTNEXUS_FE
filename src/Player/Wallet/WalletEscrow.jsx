import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WalletEscrow() {
  const navigate = useNavigate()

  // Số dư ví Escrow hiện tại (đồng bộ với TopBar & LocalStorage)
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  // Số tiền muốn nạp (mặc định 100.000 đ như trong ảnh)
  const [amount, setAmount] = useState(100000)
  const [inputVal, setInputVal] = useState('100.000')

  // Phương thức thanh toán được chọn: 'bank' | 'momo' | 'vnpay'
  const [paymentMethod, setPaymentMethod] = useState('bank')

  // Trạng thái modal thanh toán
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [successToast, setSuccessToast] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [qrCountdown, setQrCountdown] = useState(900) // 15 phút

  // Lắng nghe cập nhật số dư từ các trang khác
  useEffect(() => {
    const handleBalanceUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleBalanceUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleBalanceUpdate)
  }, [])

  // Đếm ngược QR
  useEffect(() => {
    if (!showPaymentModal) return
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [showPaymentModal])

  // Định dạng số tiền
  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val)
  }

  // Xử lý khi chọn nhanh định mức
  const handleSelectQuickAmount = (val) => {
    setAmount(val)
    setInputVal(formatVND(val))
  }

  // Xử lý khi người dùng nhập số tiền
  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = Number(raw) || 0
    setAmount(num)
    setInputVal(num > 0 ? formatVND(num) : '')
  }

  // Xử lý khi nhấn nút Clear (x)
  const handleClear = () => {
    setAmount(0)
    setInputVal('')
  }

  // Tên nguồn tiền theo phương thức
  const getSourceName = () => {
    if (paymentMethod === 'bank') return 'Ngân hàng'
    if (paymentMethod === 'momo') return 'Ví MoMo'
    if (paymentMethod === 'vnpay') return 'VNPAY'
    return 'Ngân hàng'
  }

  // Xử lý copy
  const handleCopy = (field, text) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Xác nhận nạp tiền xong
  const handleConfirmPaid = () => {
    setIsVerifying(true)
    setTimeout(() => {
      const newBal = walletBalance + (amount || 0)
      localStorage.setItem('escrow_balance', newBal.toString())
      setWalletBalance(newBal)
      window.dispatchEvent(new Event('escrow_balance_updated'))
      setIsVerifying(false)
      setShowPaymentModal(false)
      setSuccessToast(`Nạp thành công +${formatVND(amount)} đ vào Ví Escrow!`)
      setTimeout(() => setSuccessToast(null), 4000)
    }, 1200)
  }

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full min-h-screen bg-[#F6FAF6] text-[#1E293B] pb-16">
      {/* Toast thông báo thành công */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#15803D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[22px]">check_circle</span>
          <span className="font-bold text-sm">{successToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-6 pt-6 pb-12">
        {/* ==================== 1. TOP HEADER SECTION ==================== */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/60">
                CỔNG THANH TOÁN BẢO ĐẢM
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/60">
                <span className="material-symbols-outlined text-[15px] font-bold text-[#15803D]">
                  verified
                </span>
                Bảo vệ an toàn 100%
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-[32px] font-extrabold text-[#111827] tracking-tight leading-snug">
              Nạp Tiền Vào Ví
            </h1>
          </div>
        </div>

        {/* ==================== 2. TWO COLUMNS LAYOUT ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (COL-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD 1: SỐ TIỀN MUỐN NẠP (VND) */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1F2937] mb-4">
                SỐ TIỀN MUỐN NẠP (VND)
              </h2>

              {/* Big Input Box */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all">
                <span className="material-symbols-outlined text-[#15803D] text-[28px] flex-shrink-0">
                  payments
                </span>
                <input
                  type="text"
                  value={inputVal ? `${inputVal} đ` : ''}
                  onChange={handleInputChange}
                  placeholder="0 đ"
                  className="w-full bg-transparent text-2xl md:text-[28px] font-extrabold text-[#111827] outline-none tracking-tight placeholder:text-gray-400"
                />
                {inputVal && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Xóa số tiền"
                    className="w-7 h-7 rounded-full bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#64748B] flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Chọn nhanh định mức */}
              <div className="mt-5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280] block mb-2.5">
                  CHỌN NHANH ĐỊNH MỨC:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[50000, 100000, 200000, 500000].map((val) => {
                    const isSelected = amount === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectQuickAmount(val)}
                        className={`py-3 px-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all text-center ${
                          isSelected
                            ? 'border-2 border-[#15803D] bg-[#F0FDF4] text-[#15803D] shadow-sm font-extrabold scale-[1.02]'
                            : 'border border-[#E2E8F0] bg-white text-[#374151] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        +{formatVND(val)} đ
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* CARD 2: PHƯƠNG THỨC NẠP TIỀN */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1F2937] mb-4">
                PHƯƠNG THỨC NẠP TIỀN
              </h2>

              <div className="space-y-3">
                {/* Option 1: Tài khoản Ngân hàng (VietQR / Napas 24/7) */}
                <div
                  onClick={() => setPaymentMethod('bank')}
                  className={`rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-2 border-[#10B981] bg-[#F0FDF4] shadow-sm'
                      : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  {/* Radio Button */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-2 border-[#10B981]'
                          : 'border-2 border-[#CBD5E1]'
                      }`}
                    >
                      {paymentMethod === 'bank' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#15803D] text-[22px]">
                      account_balance
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#111827]">
                      Tài khoản Ngân hàng (VietQR / Napas 24/7)
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5 font-medium">
                      • Miễn phí nạp, tức thì trong 30 giây
                    </p>
                  </div>
                </div>

                {/* Option 2: Ví điện tử MoMo */}
                <div
                  onClick={() => setPaymentMethod('momo')}
                  className={`rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-2 border-[#10B981] bg-[#F0FDF4] shadow-sm'
                      : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  {/* Radio Button */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === 'momo'
                          ? 'border-2 border-[#10B981]'
                          : 'border-2 border-[#CBD5E1]'
                      }`}
                    >
                      {paymentMethod === 'momo' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#FCE7F3] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#DB2777] text-[22px]">
                      wallet
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">
                        Ví điện tử MoMo
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#F1F5F9] text-[#64748B]">
                        Tự động
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5 font-medium">
                      Liên kết ví MoMo hoặc quét mã QR
                    </p>
                  </div>
                </div>

                {/* Option 3: Cổng thanh toán VNPAY */}
                <div
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                    paymentMethod === 'vnpay'
                      ? 'border-2 border-[#10B981] bg-[#F0FDF4] shadow-sm'
                      : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  {/* Radio Button */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === 'vnpay'
                          ? 'border-2 border-[#10B981]'
                          : 'border-2 border-[#CBD5E1]'
                      }`}
                    >
                      {paymentMethod === 'vnpay' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#E0F2FE] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#0284C7] text-[22px]">
                      credit_card
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">
                        Cổng thanh toán VNPAY
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#F1F5F9] text-[#64748B]">
                        Nội địa
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5 font-medium">
                      Hỗ trợ thẻ ATM nội địa &amp; hơn 40 ngân hàng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (COL-5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* BANNER THÔNG BÁO PHÍ GIAO DỊCH */}
            <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-2xl p-4 px-5 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#15803D] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">
                  check
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14532D]">
                  Phí giao dịch: Miễn phí
                </h4>
                <p className="text-xs text-[#166534] mt-0.5 font-medium">
                  Bảo vệ giao dịch bởi SportNexus Pay Safe
                </p>
              </div>
            </div>

            {/* CARD CHI TIẾT NẠP VÍ */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#F1F5F9]">
                <h3 className="text-base font-extrabold text-[#111827]">
                  Chi tiết nạp ví
                </h3>
                <span className="text-xs font-bold text-[#10B981]">
                  Tức thì
                </span>
              </div>

              {/* Rows */}
              <div className="py-4 space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280] font-medium">Số tiền nạp</span>
                  <span className="font-bold text-[#111827]">
                    {formatVND(amount)} đ
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280] font-medium">Nguồn tiền</span>
                  <span className="font-bold text-[#111827]">
                    {getSourceName()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280] font-medium">Phí dịch vụ</span>
                  <span className="font-bold text-[#10B981]">
                    Miễn phí
                  </span>
                </div>
              </div>

              {/* Tổng thanh toán */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-end justify-between mb-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280] block">
                    TỔNG THANH TOÁN
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] block mt-0.5 font-medium">
                    Tiền thực trừ
                  </span>
                </div>
                <span className="text-2xl font-extrabold text-[#111827] tracking-tight">
                  {formatVND(amount)} đ
                </span>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                disabled={amount <= 0}
                onClick={() => setShowPaymentModal(true)}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                  amount > 0
                    ? 'bg-[#15803D] hover:bg-[#166534] active:scale-[0.98]'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  check_circle
                </span>
                <span>Xác nhận nạp tiền vào ví ({formatVND(amount)} đ)</span>
              </button>

              {/* Secondary Back Button */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full mt-3 py-3 px-4 rounded-xl text-sm font-bold text-[#374151] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 3. PAGE FOOTER ==================== */}
        <footer className="mt-16 pt-8 border-t border-[#E5E7EB]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6">
            {/* Left Brand */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-[#15803D] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
                  SPORTNEXUS VIETNAM
                </span>
              </div>
              <p className="text-xs text-[#6B7280] max-w-lg leading-relaxed font-medium">
                Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn diện.
              </p>
            </div>

            {/* Right Links */}
            <div className="flex flex-col sm:items-end gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-[#4B5563] font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#15803D]">
                    support_agent
                  </span>
                  Hotline 24/7: <strong className="text-[#111827] font-bold">0968950913</strong>
                </span>
                <span className="flex items-center gap-1 text-[#4B5563] hover:text-[#15803D] cursor-pointer">
                  <span className="material-symbols-outlined text-[16px] text-[#15803D]">
                    verified_user
                  </span>
                  Bảo vệ Ký Quỹ Escrow
                </span>
                <span className="hover:text-[#15803D] cursor-pointer">
                  Điều khoản dịch vụ
                </span>
              </div>
              <div className="text-[#4B5563] hover:text-[#15803D] cursor-pointer font-medium">
                Chính sách Fairplay
              </div>
            </div>
          </div>

          {/* Copyright Line */}
          <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#9CA3AF]">
            <span>
              © 2026 SportNexus Vietnam Joint Stock Company. Bảo lưu mọi quyền.
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#15803D]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Hệ thống bảo chứng Escrow thời gian thực
            </span>
          </div>
        </footer>
      </div>

      {/* ==================== 4. PAYMENT MODAL (POPUP QR / GATEWAY) ==================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Modal Content Based on Payment Method */}
            {paymentMethod === 'bank' ? (
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-2xl bg-[#DCFCE7] text-[#15803D] mb-2">
                    <span className="material-symbols-outlined text-[30px]">
                      qr_code_2
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#111827]">
                    Quét Mã VietQR Napas 24/7
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Mở ứng dụng ngân hàng bất kỳ để quét mã và chuyển tiền tự động
                  </p>
                </div>

                {/* VietQR Box */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center">
                  <div className="relative bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <img
                      src={`https://img.vietqr.io/image/MB-0968950913-compact2.png?amount=${amount}&addInfo=NAP%20ESCROW%20SPORTNEXUS&accountName=SPORTNEXUS%20ESCROW`}
                      alt="VietQR Chuyển Khoản"
                      className="w-48 h-48 object-contain"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 rounded-lg p-1.5 shadow-md flex items-center gap-1 border border-emerald-200 pointer-events-none">
                      <span className="material-symbols-outlined text-[#15803D] text-[18px]">
                        bolt
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#15803D]">
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    <span>Hết hạn trong: {formatTimer(qrCountdown)}</span>
                  </div>
                </div>

                {/* Bank Details Table */}
                <div className="mt-4 bg-[#F8FAFC] rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Ngân hàng</span>
                    <span className="font-bold text-gray-900">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Số tài khoản</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span>0968950913</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('account', '0968950913')}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold"
                      >
                        {copiedField === 'account' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Chủ tài khoản</span>
                    <span className="font-bold text-gray-900">SPORTNEXUS ESCROW HOLDINGS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Số tiền</span>
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                      <span>{formatVND(amount)} đ</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('amount', amount.toString())}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold"
                      >
                        {copiedField === 'amount' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Nội dung CK</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span>NAP ESCROW SPORTNEXUS</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('memo', 'NAP ESCROW SPORTNEXUS')}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold"
                      >
                        {copiedField === 'memo' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm Action */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmPaid}
                  className="w-full mt-4 py-3.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Hệ thống đang kiểm tra giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        check_circle
                      </span>
                      <span>Tôi đã chuyển khoản thành công</span>
                    </>
                  )}
                </button>
              </div>
            ) : paymentMethod === 'momo' ? (
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-2xl bg-[#FCE7F3] text-[#DB2777] mb-2">
                    <span className="material-symbols-outlined text-[30px]">
                      wallet
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#111827]">
                    Thanh Toán Qua Ví MoMo
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Quét mã QR MoMo hoặc mở ứng dụng để xác nhận thanh toán
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=momo://pay?amount=${amount}&receiver=SPORTNEXUS`}
                      alt="MoMo QR"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-[#DB2777] mt-3">
                    Số tiền: {formatVND(amount)} đ
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmPaid}
                  className="w-full mt-5 py-3.5 rounded-xl bg-[#DB2777] hover:bg-[#BE185D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Đang đồng bộ MoMo...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        check_circle
                      </span>
                      <span>Xác nhận đã thanh toán trên MoMo</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-2xl bg-[#E0F2FE] text-[#0284C7] mb-2">
                    <span className="material-symbols-outlined text-[30px]">
                      credit_card
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#111827]">
                    Cổng Thanh Toán VNPAY
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Chuyển hướng đến cổng thanh toán bảo mật VNPAY
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Mã đơn hàng</span>
                    <span className="font-mono font-bold text-gray-800">
                      VNPAY-{Date.now().toString().slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Số tiền thanh toán</span>
                    <span className="text-base font-extrabold text-emerald-800">
                      {formatVND(amount)} đ
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-gray-600 leading-relaxed">
                    Hệ thống sẽ kết nối với cổng thẻ ATM Nội địa &amp; Internet Banking của hơn 40 ngân hàng đối tác.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmPaid}
                  className="w-full mt-5 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Đang xử lý kết nối VNPAY...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        lock
                      </span>
                      <span>Thanh toán ngay qua VNPAY</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
