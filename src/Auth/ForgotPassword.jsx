import './auth-pages.css'
import { useState } from 'react'

function ForgotPassword() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle password reset logic here
    console.log('Reset email sent to:', email)
  }

  return (
    <div className="min-h-screen pastel-animated-bg flex flex-col">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm py-3 px-6">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4A7C3E] rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900">SportNexus</span>
              <span className="text-[10px] text-gray-600 uppercase tracking-wide">Tournament Engine</span>
            </div>
          </div>

          {/* Navigation - Button Trang chủ */}
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            TRANG CHỦ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative">
            {/* Back Button */}
            <button 
              onClick={() => window.history.back()}
              className="absolute top-6 left-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Logo Center */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-[#4A7C3E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                </svg>
                <span className="text-base font-bold text-gray-900">SportNexus</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer glow circle */}
                <div className="absolute inset-0 bg-[#A8E6CF]/30 rounded-full blur-xl"></div>
                {/* Main circle */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#B8F0D8] to-[#A8E6CF] rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#4A7C3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {/* Small accent circle */}
                  <div className="absolute bottom-2 right-2 w-7 h-7 bg-[#4A7C3E] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">
              Quên mật khẩu?
            </h1>

            {/* Description */}
            <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
              Đừng lo lắng! Vui lòng nhập email hoặc tên đăng nhập liên kết với tài khoản của bạn để nhận mã khôi phục.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Email hoặc tên đăng nhập
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email hoặc tên đăng nhập của bạn"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#4A7C3E] focus:ring-2 focus:ring-[#A8E6CF]/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#E8F5E9] border border-[#A8E6CF] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-[#4A7C3E]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    SportNexus sẽ gửi mã xác thực ở chủ sở để lấp mật khẩu mới nhanh chóng và an toàn.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#4A7C3E] hover:bg-[#3d6634] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Gửi mã xác thực
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <span className="text-sm text-gray-600">Nhớ lại mật khẩu? </span>
                <a 
                  href="/login" 
                  className="text-sm font-semibold text-[#4A7C3E] hover:underline"
                >
                  Đăng nhập ngay
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/60 backdrop-blur-sm py-4">
        <div className="w-full px-6 flex items-center justify-between text-xs">
          <div className="text-gray-600">
            © 2026 SPORTNEXUS VIETNAM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Cam kết bảo mật
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Chính sách Fairplay
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Điều khoản dịch vụ
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ForgotPassword
