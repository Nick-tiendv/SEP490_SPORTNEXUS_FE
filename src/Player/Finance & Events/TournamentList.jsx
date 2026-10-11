import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function TournamentList() {
  const navigate = useNavigate()

  // State for live score
  const [liveScore, setLiveScore] = useState({
    team1: 19,
    team2: 17,
    set: 2,
    set1Score: '21 - 18',
  })

  // State for registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  // Registration state for upcoming tournament
  const [isRegistered, setIsRegistered] = useState(false)
  const [teammateName, setTeammateName] = useState('Bảo Long (DUPR 3.8)')
  const [agreedEscrow, setAgreedEscrow] = useState(true)

  // Escrow balance from localStorage
  const [escrowBalance, setEscrowBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setEscrowBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleUpdate)
  }, [])

  // Show toast notification
  const showToast = (message) => {
    setToastMsg(message)
    setTimeout(() => {
      setToastMsg(null)
    }, 3500)
  }

  // Handle registration confirmation with escrow deduction
  const handleConfirmRegistration = () => {
    const fee = 500000
    if (escrowBalance < fee) {
      showToast('⚠️ Số dư ví Escrow không đủ để ký quỹ lệ phí!')
      return
    }
    const newBal = escrowBalance - fee
    localStorage.setItem('escrow_balance', newBal)
    setEscrowBalance(newBal)
    window.dispatchEvent(new Event('escrow_balance_updated'))
    setIsRegistered(true)
    setShowRegisterModal(false)
    showToast('🎉 Đăng ký thành công! Đã ký quỹ 500.000 đ vào hệ thống Smart Escrow.')
  }

  // Handle cancel registration and refund escrow
  const handleCancelRegistration = () => {
    const fee = 500000
    const newBal = escrowBalance + fee
    localStorage.setItem('escrow_balance', newBal)
    setEscrowBalance(newBal)
    window.dispatchEvent(new Event('escrow_balance_updated'))
    setIsRegistered(false)
    showToast('↩️ Đã hủy đăng ký. Lệ phí 500.000 đ đã được hoàn lại vào ví Escrow.')
  }

  return (
    <div className="w-full min-h-screen text-[#1e293b] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 bg-[#0f172a] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500/40 animate-bounce duration-300">
          <span className="material-symbols-outlined text-emerald-400 text-[22px]">
            verified
          </span>
          <span className="text-sm font-semibold tracking-wide">{toastMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-[1400px] mx-auto px-6 py-6 md:px-10 md:py-8 flex flex-col gap-8">
        
        {/* ==================== 1. KHUNG THỨ NHẤT: GIẢI ĐẤU ĐANG DIỄN RA (NỔI BẬT) ==================== */}
        <section className="flex flex-col gap-3">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-base md:text-lg font-black text-[#0f172a] uppercase tracking-wide flex items-center gap-2">
                <span>Giải đấu đang diễn ra</span>
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                ● Trực Tiếp Vòng Bán Kết
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[15px]">sensors</span>
              <span>Live Sync thời gian thực</span>
            </div>
          </div>

          {/* Highlighted Card Container */}
          <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/5 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:border-emerald-500/60">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500"></div>

            {/* Phân vùng 1: THÔNG TIN CỦA GIẢI ĐẤU */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex-1">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#dcfce7] text-[#15803d] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
                    VÒNG BÁN KẾT • COURT 01
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-slate-500">
                      emoji_events
                    </span>
                    Cầu Lông Đôi Nam Hạng Pro
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    Loại Trực Tiếp (BO3 - 21 Điểm)
                  </span>
                </div>

                {/* Tournament Big Title */}
                <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#0f172a] uppercase tracking-tight leading-snug mb-2">
                  SPORTNEXUS OPEN CUP 2026 – VÔ ĐỊCH CẦU LÔNG ĐÔI NAM
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl font-normal">
                  Giải đấu quy tụ các tay vợt phong trào và bán chuyên hàng đầu. Toàn bộ tiền thưởng được quản lý ký quỹ tự động qua hệ thống Smart Escrow SportNexus, trao thưởng minh bạch 100% ngay sau trận chung kết.
                </p>
              </div>

              {/* Tournament Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 flex-shrink-0">
                {/* Metric 1 */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      TỔNG GIẢI THƯỞNG
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#0f172a]">
                      20.000.000 đ
                    </span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      ĐỊA ĐIỂM
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#0f172a]">
                      Arena Q.7
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1 bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">military_tech</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      DANH HIỆU
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#0f172a]">
                      Cúp Vàng
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phân vùng 2: TỈ SỐ HIỆN TẠI (LÀM CỰC KỲ NỔI BẬT) */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-emerald-950 rounded-2xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden">
              {/* Status Header of Match */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="bg-red-500 text-white font-black px-2.5 py-1 rounded text-xs uppercase tracking-wider shadow-sm animate-pulse">
                    SET 2 LIVE
                  </span>
                  <span className="text-sm font-bold text-slate-200">
                    Bán Kết 01 • Sân Court 01 SportNexus
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  Tỉ số Set 1: <span className="text-white font-black">21 - 18</span>
                </div>
              </div>

              {/* Matchup row with big live scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team 1: Minh Minh Minh / Bảo Long (Serving / Leading) */}
                <div className="bg-emerald-900/40 border-2 border-emerald-400/80 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">
                      1
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                        Minh Minh Minh / Bảo Long
                      </h4>
                      <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                        <span className="material-symbols-outlined text-[15px] animate-bounce">
                          sports_tennis
                        </span>
                        Đang cầm giao cầu
                      </p>
                    </div>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight pl-2 drop-shadow-md">
                    {liveScore.team1}
                  </div>
                </div>

                {/* Team 2: Đăng Khoa / Hoàng Khang (Trailing) */}
                <div className="bg-white/5 border border-white/15 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-200 tracking-wide">
                        Đăng Khoa / Hoàng Khang
                      </h4>
                      <p className="text-xs font-normal text-slate-400 mt-0.5">
                        Đỡ cầu • Tạm hòa 19-17
                      </p>
                    </div>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-slate-300 tracking-tight pl-2">
                    {liveScore.team2}
                  </div>
                </div>
              </div>
            </div>

            {/* Phân vùng 3: DƯỚI CÙNG CHỈ HIỂN THỊ TRỌNG TÀI CHÍNH & THỜI LƯỢNG TRẬN ĐẤU */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  sports
                </span>
                <span>
                  Trọng tài chính: <strong className="text-slate-900 font-bold">Phan Minh Tâm</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  schedule
                </span>
                <span>
                  Thời lượng trận đấu: <strong className="text-slate-900 font-bold">34 phút</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2. KHUNG THỨ HAI: GIẢI ĐẤU ĐÃ DIỄN RA ==================== */}
        <section className="flex flex-col gap-3">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full border border-slate-400 text-slate-600 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <h2 className="text-base md:text-lg font-black text-[#0f172a] uppercase tracking-wide">
                Giải đấu đã diễn ra
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                1 Trận Đã Có Tỉ Số
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Đã cập nhật kết quả và trả thưởng Escrow
            </span>
          </div>

          {/* Finished Tournament Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-7 flex flex-col gap-5 hover:shadow-md transition">
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2.5">
                <span className="bg-[#0f172a] text-white font-black px-2.5 py-1 rounded text-xs uppercase tracking-wider">
                  FT (KẾT THÚC)
                </span>
                <span className="text-slate-800 font-bold text-xs sm:text-sm">
                  Tứ Kết • Sân Court 02 SportNexus Arena
                </span>
              </div>
              <div className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
                Đã xác thực kết quả &amp; giải ngân thưởng
              </div>
            </div>

            {/* Matchup row with finished scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Winner */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-[#00875a] text-white text-xs font-bold px-2.5 py-1 rounded-md flex-shrink-0">
                    Thắng
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#0f172a]">
                      Lê Dũng / Hoàng Nam
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tỉ số set: 21-16, 21-19
                    </p>
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#00875a] tracking-tight pl-2">
                  2
                </div>
              </div>

              {/* Loser */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md flex-shrink-0">
                    Thua
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-slate-700">
                      Phi Hùng / Quang Huy
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dừng bước tại Tứ Kết
                    </p>
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-400 tracking-tight pl-2">
                  0
                </div>
              </div>
            </div>

            {/* DƯỚI CÙNG CHỈ HIỂN THỊ TRỌNG TÀI CHÍNH & THỜI LƯỢNG TRẬN ĐẤU */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  sports
                </span>
                <span>
                  Trọng tài chính: <strong className="text-slate-900 font-bold">Phan Minh Tâm</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  schedule
                </span>
                <span>
                  Thời lượng trận đấu: <strong className="text-slate-900 font-bold">42 phút</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. KHUNG THỨ BA: GIẢI ĐẤU SẮP DIỄN RA (NỔI BẬT ĐỂ ĐĂNG KÝ) ==================== */}
        <section className="flex flex-col gap-3">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[24px] text-emerald-600">
                military_tech
              </span>
              <h2 className="text-base md:text-lg font-black text-[#0f172a] uppercase tracking-wide">
                Giải đấu sắp diễn ra
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                🔥 Giải Đấu Hoàn Toàn Mới
              </span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Ký quỹ tự động qua ví Smart Escrow
            </span>
          </div>

          {/* Brand New Tournament Highlighted Card */}
          <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 rounded-3xl border-2 border-emerald-500/60 shadow-xl shadow-emerald-600/10 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:border-emerald-500">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500"></div>

            {/* Top status info */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-700 text-white font-extrabold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[15px]">event</span>
                  Khai Mạc: 15/11/2026 - 18/11/2026
                </span>
                <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-lg text-xs border border-amber-300">
                  ⏳ Hạn chót đăng ký: 23:59 Ngày 10/11/2026
                </span>
                <span className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-lg text-xs">
                  Sân Trung Tâm Court 01 SportNexus Arena
                </span>
              </div>

              {/* Slots remaining */}
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Còn lại 3/32 suất hạt giống mở rộng</span>
              </div>
            </div>

            {/* Middle Section: Tournament Details & Prominent Registration CTA */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-1">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#0f172a] uppercase tracking-tight mb-2">
                  GIẢI CẦU LÔNG VÔ ĐỊCH MÙA ĐÔNG SPORTNEXUS WINTER CHAMPIONSHIP 2026
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-4 font-normal">
                  Giải đấu quy mô quốc gia chính thức khởi tranh vào <strong>tháng 11/2026</strong> dành cho các cặp đôi phong trào và bán chuyên. Toàn bộ tiền thưởng được bảo chứng 100% qua Smart Escrow, giải ngân ngay lập tức sau lễ bế mạc trao cúp.
                </p>

                {/* 3 Key Tournament Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      TỔNG TIỀN THƯỞNG
                    </span>
                    <span className="text-base font-black text-emerald-700">
                      35.000.000 đ
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      LỆ PHÍ KÝ QUỸ ESCROW
                    </span>
                    <span className="text-base font-black text-[#0f172a]">
                      500.000 đ / Đôi
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      QUY MÔ GIẢI ĐẤU
                    </span>
                    <span className="text-base font-black text-slate-800">
                      32 Cặp Đấu Hạt Giống
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button Area */}
              <div className="flex flex-col items-center lg:items-end flex-shrink-0">
                {isRegistered ? (
                  <div className="flex flex-col items-center lg:items-end gap-2">
                    <div className="bg-[#dcfce7] text-[#15803d] border-2 border-[#86efac] px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-md">
                      <span className="material-symbols-outlined text-[22px]">
                        verified
                      </span>
                      Đã Đăng Ký Tham Gia Thành Công
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelRegistration}
                      className="text-xs text-rose-500 hover:text-rose-700 underline font-semibold cursor-pointer"
                    >
                      Hủy đăng ký &amp; hoàn ký quỹ 500.000 đ
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center lg:items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(true)}
                      className="bg-gradient-to-r from-[#15803d] via-emerald-600 to-[#047857] hover:from-[#166534] hover:to-[#065f46] text-white px-9 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-700/25 transition-all hover:scale-[1.03] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        sports_tennis
                      </span>
                      <span>Đăng ký tham gia ngay</span>
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500 text-center">
                      ⚡ Ký quỹ an toàn • Hoàn trả 100% nếu có thay đổi
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DƯỚI CÙNG CHỈ HIỂN THỊ TRỌNG TÀI CHÍNH & THỜI LƯỢNG TRẬN ĐẤU */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 text-xs sm:text-sm text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  sports
                </span>
                <span>
                  Trọng tài chính: <strong className="text-slate-900 font-bold">Phan Minh Tâm</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  schedule
                </span>
                <span>
                  Thời lượng trận đấu: <strong className="text-slate-900 font-bold">45 phút / trận</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 4. FOOTER SECTION ==================== */}
        <footer className="border-t border-slate-200 mt-4 pt-6 pb-12 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Brand info */}
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#2D5F3F] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#0f172a] tracking-tight">
                  SPORTNEXUS VIETNAM
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn diện.
              </p>
            </div>

            {/* Right: Quick links */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
              <a
                href="tel:0968950913"
                className="flex items-center gap-1.5 hover:text-[#15803d] transition"
              >
                <span className="material-symbols-outlined text-[16px] text-[#15803d]">
                  support_agent
                </span>
                <span>Hotline 24/7: <strong>0968950913</strong></span>
              </a>

              <span className="hidden sm:inline text-slate-300">•</span>

              <button
                type="button"
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-1.5 hover:text-[#15803d] transition cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">
                  verified_user
                </span>
                <span>Bảo vệ Ký Quỹ Escrow</span>
              </button>

              <span className="hidden sm:inline text-slate-300">•</span>

              <span className="hover:text-slate-900 cursor-pointer">
                Điều khoản dịch vụ
              </span>

              <span className="hidden sm:inline text-slate-300">•</span>

              <span className="hover:text-slate-900 cursor-pointer">
                Chính sách Fairplay
              </span>
            </div>
          </div>

          {/* Copyright & Live Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11.5px] text-slate-400 border-t border-slate-100 pt-4">
            <p>© 2026 SportNexus Vietnam Joint Stock Company. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hệ thống bảo chứng Escrow thời gian thực</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ==================== MODAL: REGISTER UPCOMING TOURNAMENT ==================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#15803d] text-[22px]">
                  sports_tennis
                </span>
                <h3 className="font-extrabold text-base text-[#0f172a]">
                  Đăng Ký Tham Gia Giải Đấu Mới 2026
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-800">
                <p className="font-bold text-xs mb-0.5">
                  🏆 SportNexus Winter Championship 2026
                </p>
                <p className="text-[11px] text-emerald-700">
                  Thời gian: 15/11/2026 - 18/11/2026 • Sân Arena Q.7 • Trọng tài chính: Phan Minh Tâm
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vận động viên 1 (Bạn):</label>
                <input
                  type="text"
                  disabled
                  value="Minh Minh Minh (DUPR 3.8)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vận động viên 2 (Đồng đội):</label>
                <input
                  type="text"
                  value={teammateName}
                  onChange={(e) => setTeammateName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-emerald-500"
                />
              </div>

              {/* Escrow deposit breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Lệ phí bảo chứng ký quỹ giải đấu:</span>
                  <strong className="text-slate-900 font-mono">500.000 đ</strong>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Số dư ví Escrow hiện tại:</span>
                  <strong className="text-[#15803d] font-mono">
                    {new Intl.NumberFormat('vi-VN').format(escrowBalance)} đ
                  </strong>
                </div>
                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-[#0f172a]">
                  <span>Số dư sau khi ký quỹ:</span>
                  <span className="font-mono text-emerald-700">
                    {new Intl.NumberFormat('vi-VN').format(Math.max(0, escrowBalance - 500000))} đ
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={agreedEscrow}
                  onChange={(e) => setAgreedEscrow(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  Tôi đồng ý khóa ký quỹ 500.000 đ qua hệ thống Smart Escrow SportNexus và cam kết tham gia thi đấu đúng lịch trình giải đấu Fairplay.
                </span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!agreedEscrow}
                onClick={handleConfirmRegistration}
                className="bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
              >
                Xác nhận ký quỹ &amp; Tham gia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentList
