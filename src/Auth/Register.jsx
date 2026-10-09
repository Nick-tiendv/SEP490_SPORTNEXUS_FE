import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth-pages.css'

function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [selectedSports, setSelectedSports] = useState([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const toggleSport = (sport) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    )
  }

  // Tính độ mạnh mật khẩu
  const calculatePasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.length >= 12) strength++
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++
    if (/\d/.test(pass)) strength++
    if (/[^a-zA-Z0-9]/.test(pass)) strength++
    return strength
  }

  const getPasswordStrength = () => {
    const strength = calculatePasswordStrength(password)
    if (strength === 0 || password.length === 0) return { level: 0, text: '', color: 'bg-gray-200' }
    if (strength <= 2) return { level: 1, text: 'Yếu', color: 'bg-red-500' }
    if (strength <= 3) return { level: 2, text: 'Trung bình', color: 'bg-yellow-500' }
    return { level: 3, text: 'Mạnh', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  return (
    <div className="min-h-screen sport-animated-bg flex flex-col">
      {/* Top Header - Toàn màn hình */}
      <header className="w-full px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#2D5F3F] rounded-2xl flex items-center justify-center ring-2 ring-white ring-opacity-20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[#2D5F3F] font-bold text-lg leading-none">SportNexus</span>
            <span className="text-[#2D5F3F] text-[10px] uppercase tracking-wider">Tournament Engine</span>
          </div>
        </div>

        {/* Trang Chủ Button */}
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="font-medium">Trang chủ</span>
          </a>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col lg:flex-row relative text-gray-900">
        {/* BEGIN: LeftHeroSide - Vietnamese themed */}
        <section aria-label="Visual Showcase" className="relative hidden lg:flex lg:w-[42%] flex-col justify-between overflow-hidden bg-white/30 backdrop-blur-sm p-8 xl:p-10 select-none">

          {/* Center Content */}
          <div className="space-y-6 max-w-md">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-[#4A7C59]/20 rounded-full px-4 py-2">
              <span className="text-[#4A7C59]">👥</span>
              <span className="text-sm text-[#2D5F3F] font-medium">CỘNG ĐỒNG VẬN ĐỘNG VIÊN</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl xl:text-5xl font-bold text-[#2D5F3F] leading-tight">
              Bứt Phá Đam Mê Cùng SportNexus
            </h1>

            {/* Description */}
            <p className="text-[#4A7C59] leading-relaxed">
              Hơn <span className="font-bold text-[#2D5F3F]">45.000</span> tay vợt <span className="font-bold text-[#2D5F3F]">Cầu lông & Pickleball</span> đang kết nối, <span className="font-bold text-[#2D5F3F]">đặt sân</span> và <span className="font-bold text-[#2D5F3F]">giao lưu thi đấu</span> mỗi ngày.
            </p>

            {/* Feature Boxes */}
            <div className="space-y-3">
              {/* Feature 1 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#4A7C59]/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E3] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D5F3F] mb-1">Đặt Sân Thông Minh</div>
                    <div className="text-sm text-[#4A7C59]">Khóa sân tức thì trong 30 giây với biểu phí minh bạch.</div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#4A7C59]/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E3] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D5F3F] mb-1">Ghép Trận Nhanh</div>
                    <div className="text-sm text-[#4A7C59]">Tìm bạn chơi cùng trình độ DUPR vô phòng đỗ.</div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#4A7C59]/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E3] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D5F3F] mb-1">Giải Đấu Chuyên Nghiệp</div>
                    <div className="text-sm text-[#4A7C59]">Bảng đầu tư động, cập nhật điểm live và xếp hạng chuẩn.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Box - Refined with Better Spacing */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#059669] rounded-3xl p-7 shadow-2xl border-2 border-emerald-400/20 mb-12">
              {/* Animated Background Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Orbs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 opacity-20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300 opacity-15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.7s'}} />
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-yellow-300 opacity-10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.4s'}} />
                
                {/* Decorative Icons */}
                <div className="absolute top-6 right-12 text-3xl opacity-40 animate-bounce" style={{animationDuration: '3s'}}>🏸</div>
                <div className="absolute top-12 right-24 text-2xl opacity-30 animate-bounce" style={{animationDuration: '4s', animationDelay: '0.5s'}}>✨</div>
                <div className="absolute bottom-12 right-16 text-2xl opacity-25 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1s'}}>🎾</div>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-5">
                {/* HOT DEAL Badge - Refined */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 text-[#064E3B] rounded-full px-3.5 py-1.5 shadow-lg">
                  {/* Fire Icon SVG - Compact & Sharp */}
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 9 6 9 10C9 12.2091 10.7909 14 13 14C15.2091 14 17 12.2091 17 10C17 6 14 2 14 2C14 2 12.5 4 12 6C11.5 4 12 2 12 2Z" />
                    <path d="M12 14C9.23858 14 7 16.2386 7 19C7 21.7614 9.23858 24 12 24C14.7614 24 17 21.7614 17 19C17 16.2386 14.7614 14 12 14Z" opacity="0.7"/>
                  </svg>
                  <span className="text-xs font-black uppercase tracking-wider">Hot Deal</span>
                </div>

                {/* Title Section with Better Spacing */}
                <div className="space-y-2">
                  <div className="flex items-start gap-4">
                    {/* Gift Icon */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-3xl">🎁</span>
                    </div>
                    
                    {/* Title Text */}
                    <div className="flex-1 space-y-1.5">
                      <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                        ƯU ĐÃI THÀNH VIÊN MỚI
                      </h3>
                      <p className="text-yellow-300 text-sm font-bold uppercase tracking-wide">
                        Chỉ dành cho bạn!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Offer Details Card - Enhanced Spacing */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    {/* Voucher Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>

                    {/* Text Content with Improved Spacing */}
                    <div className="flex-1 space-y-2">
                      <div className="text-base font-bold text-white mb-2">
                        Tặng ngay voucher giảm <span className="text-yellow-300 text-xl font-black">20%</span>
                      </div>
                      <p className="text-emerald-100 text-sm leading-relaxed">
                        Áp dụng cho lượt đặt sân <span className="font-semibold text-white">Cầu lông</span> hoặc <span className="font-semibold text-white">Pickleball</span> đầu tiên sau khi đăng ký thành công.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button 
                  type="button" 
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-300 text-[#064E3B] font-black text-base px-6 py-4 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-yellow-400/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Tham Gia Ngay</span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Footer */}
          <div className="text-[10px] text-[#4A7C59] space-y-1 mt-8">
            <div>© 2026 SPORTNEXUS VIETNAM. ALL RIGHTS RESERVED.</div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#" className="hover:text-[#2D5F3F] whitespace-nowrap">CAM KẾT BẢO MẬT</a>
              <span>•</span>
              <a href="#" className="hover:text-[#2D5F3F] whitespace-nowrap">CHÍNH SÁCH FAIRPLAY</a>
              <span>•</span>
              <a href="#" className="hover:text-[#2D5F3F] whitespace-nowrap">ĐIỀU KHOẢN DỊCH VỤ</a>
            </div>
          </div>
        </section>
        
        {/* BEGIN: RightFormSide */}
        <section aria-label="Registration Portal" className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-14 py-10 lg:py-12 overflow-y-auto bg-white/80 backdrop-blur-sm">
          <div className="w-full max-w-xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#2D5F3F] mb-2">
                Đăng ký tài khoản
              </h1>
              <p className="text-[#6B7280]">
                Gia nhập cộng đồng thể thao SportNexus ngay hôm nay.
              </p>
            </header>
            
            {/* Form */}
            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); navigate('/onboarding') }}>
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#2D5F3F] mb-2" htmlFor="full-name">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                    id="full-name" 
                    placeholder="Ví dụ: Nguyễn Văn A" 
                    required 
                    type="text" 
                  />
                </div>
              </div>
              
              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2D5F3F] mb-2" htmlFor="phone">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-600 text-sm font-medium">+84</span>
                    </div>
                    <input 
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                      id="phone" 
                      placeholder="0912 345 678" 
                      required 
                      type="tel" 
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2D5F3F] mb-2" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                      id="email" 
                      placeholder="email@example.com" 
                      required 
                      type="email" 
                    />
                  </div>
                </div>
              </div>

              {/* Sports Interest */}
              <div>
                <label className="block text-sm font-medium text-[#2D5F3F] mb-2">
                  Bộ môn thể thao quan tâm
                </label>
                <div className="text-xs text-gray-500 mb-3">(Có thể chọn cả hai)</div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Cầu Lông */}
                  <button
                    type="button"
                    onClick={() => toggleSport('badminton')}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedSports.includes('badminton')
                        ? 'border-[#4A7C59] bg-[#E8F5E3]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedSports.includes('badminton') ? 'bg-[#4A7C59] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-xl">🏸</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-[#2D5F3F]">Cầu Lông</div>
                      <div className="text-xs text-gray-500">Badminton</div>
                    </div>
                    {selectedSports.includes('badminton') && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#4A7C59] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Pickleball */}
                  <button
                    type="button"
                    onClick={() => toggleSport('pickleball')}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedSports.includes('pickleball')
                        ? 'border-[#4A7C59] bg-[#E8F5E3]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedSports.includes('pickleball') ? 'bg-[#4A7C59]' : 'bg-gray-100'
                    }`}>
                      <svg className="w-7 h-7" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="pickleballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: selectedSports.includes('pickleball') ? '#FFFFFF' : '#A95AA1'}} />
                            <stop offset="35%" style={{stopColor: selectedSports.includes('pickleball') ? '#FFFFFF' : '#7B7FA8'}} />
                            <stop offset="70%" style={{stopColor: selectedSports.includes('pickleball') ? '#FFFFFF' : '#4A9B9E'}} />
                            <stop offset="100%" style={{stopColor: selectedSports.includes('pickleball') ? '#FFFFFF' : '#2DBEAA'}} />
                          </linearGradient>
                        </defs>
                        
                        {/* Paddle handle - exact shape from reference */}
                        <path d="M 120 340 L 80 410 Q 70 430 75 445 Q 78 455 90 458 L 115 458 Q 127 455 130 445 Q 135 430 125 410 L 145 360" 
                          stroke="url(#pickleballGradient)" 
                          strokeWidth="32" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill="none" />
                        
                        {/* Handle grip lines - horizontal strokes */}
                        <line x1="82" y1="418" x2="108" y2="418" stroke="url(#pickleballGradient)" strokeWidth="16" strokeLinecap="round" />
                        <line x1="78" y1="438" x2="104" y2="438" stroke="url(#pickleballGradient)" strokeWidth="16" strokeLinecap="round" />
                        
                        {/* Paddle head - rounded square matching reference proportions */}
                        <rect x="105" y="40" width="260" height="260" rx="88" 
                          stroke="url(#pickleballGradient)" 
                          strokeWidth="36" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none" />
                        
                        {/* Ball - positioned at bottom right corner */}
                        <circle cx="380" cy="355" r="95" 
                          stroke="url(#pickleballGradient)" 
                          strokeWidth="32" 
                          fill="none" />
                        
                        {/* Ball holes - 4 dots in perfect 2x2 grid */}
                        <circle cx="355" cy="330" r="15" fill="url(#pickleballGradient)" />
                        <circle cx="405" cy="330" r="15" fill="url(#pickleballGradient)" />
                        <circle cx="355" cy="380" r="15" fill="url(#pickleballGradient)" />
                        <circle cx="405" cy="380" r="15" fill="url(#pickleballGradient)" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-[#2D5F3F]">Pickleball</div>
                      <div className="text-xs text-gray-500">Trending 2026</div>
                    </div>
                    {selectedSports.includes('pickleball') && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#4A7C59] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#2D5F3F]" htmlFor="password">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    {password.length > 0 && (
                      <span className={`text-xs font-semibold ${
                        passwordStrength.level === 1 ? 'text-red-500' : 
                        passwordStrength.level === 2 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input 
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                      id="password" 
                      placeholder="Nhập mật khẩu an toàn" 
                      required 
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      aria-label="Toggle password visibility" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A7C59]" 
                      onClick={(e) => { e.preventDefault(); setPasswordVisible(!passwordVisible) }} 
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {passwordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'
                        }`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'
                        }`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'
                        }`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#2D5F3F]" htmlFor="confirm-password">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    {confirmPassword.length > 0 && (
                      <span className={`text-xs font-semibold ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordsMatch ? '✓ Khớp' : '✗ Không khớp'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input 
                      className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                        confirmPassword.length > 0 
                          ? passwordsMatch 
                            ? 'border-green-500 focus:border-green-600 focus:ring-green-500/20' 
                            : 'border-red-500 focus:border-red-600 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-[#4A7C59] focus:ring-[#4A7C59]/20'
                      } focus:ring-2 outline-none transition-all`}
                      id="confirm-password" 
                      placeholder="Nhập lại mật khẩu" 
                      required 
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      aria-label="Toggle confirm password visibility" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A7C59]" 
                      onClick={(e) => { e.preventDefault(); setConfirmPasswordVisible(!confirmPasswordVisible) }} 
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {confirmPasswordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input 
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-[#4A7C59] focus:ring-[#4A7C59] cursor-pointer" 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required
                />
                <label className="text-sm text-gray-600 leading-relaxed cursor-pointer" htmlFor="terms">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-[#4A7C59] hover:underline font-medium">Điều khoản dịch vụ</a>
                  {' '}và{' '}
                  <a href="#" className="text-[#4A7C59] hover:underline font-medium">Chính sách bảo mật</a>
                  {' '}của SportNexus.
                </label>
              </div>
              
              {/* Primary Create Account Button */}
              <div className="pt-2">
                <button 
                  className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-[#4A7C59] hover:bg-[#3D6549] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl" 
                  type="submit"
                >
                  TẠO TÀI KHOẢN NGAY
                </button>
              </div>
            </form>
            
            {/* Social Divider */}
            <div className="my-6 relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="flex-shrink mx-4 text-sm text-gray-500 uppercase tracking-wider">
                Hoặc đăng ký nhanh bằng
              </span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            
            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335" />
                  <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4" />
                  <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" fill="#FBBC05" />
                  <path d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" fill="#34A853" />
                </svg>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
            
            {/* Bottom Sign In Link */}
            <footer className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Bạn đã có tài khoản?{' '}
                <a className="text-[#4A7C59] font-semibold hover:underline" href="/login">
                  Đăng nhập ngay
                </a>
              </p>
            </footer>
            
          </div>
        </section>
      </main>
    </div>
  )
}

export default Register
