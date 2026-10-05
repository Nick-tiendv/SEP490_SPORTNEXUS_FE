import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './auth-pages.css'

function VerifyAccount() {
  const navigate = useNavigate()
  const location = useLocation()
  const userEmail = location.state?.email || 'user@email.com'
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [codeVersion, setCodeVersion] = useState(1) // Track code version
  const inputRefs = useRef([])

  // Timer countdown with auto-reset every minute
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(countdown)
    } else {
      // When timer hits 0, reset for next cycle
      setCanResend(true)
      // Auto reset after showing "can resend" for a moment
      const resetTimeout = setTimeout(() => {
        setTimer(60)
        setCodeVersion(prev => prev + 1)
      }, 100)
      return () => clearTimeout(resetTimeout)
    }
  }, [timer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take last character
    setCode(newCode)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = pastedData.split('')
    setCode([...newCode, ...Array(6 - newCode.length).fill('')])
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(newCode.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleResend = async () => {
    if (!canResend || isResending) return
    
    setIsResending(true)
    // TODO: Call API to resend code
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reset timer and state
    setTimer(60)
    setCanResend(false)
    setIsResending(false)
    setCodeVersion(prev => prev + 1)
    setCode(['', '', '', '', '', '']) // Clear entered code
    inputRefs.current[0]?.focus() // Focus first input
  }

  const handleSubmit = async () => {
    const verificationCode = code.join('')
    if (verificationCode.length !== 6) return

    // TODO: Call API to verify code
    console.log('Verifying code:', verificationCode)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex flex-col pastel-animated-bg">
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
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            TRANG CHỦ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
          {/* Back Button */}
          <button 
            onClick={handleBack}
            className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </button>

          {/* Help Button */}
          <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-gray-600">help_outline</span>
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6 mt-8">
            <div className="relative">
              {/* Outer glow circle */}
              <div className="absolute inset-0 bg-[#A8E6CF]/30 rounded-full blur-xl"></div>
              {/* Main circle */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#B8F0D8] to-[#A8E6CF] rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#4A7C3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {/* Small accent circle */}
                <div className="absolute bottom-2 right-2 w-7 h-7 bg-[#4A7C3E] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Xác thực tài khoản
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-2">
            Mã xác thực gồm 6 chữ số đã được gửi đến email:
          </p>
          <p className="text-sm font-semibold text-gray-800 text-center mb-6">
            {userEmail}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-14 h-16 text-center text-2xl font-bold rounded-xl transition-all
                  ${digit 
                    ? 'border-2 border-[#4A7C3E] bg-[#E8F5E9] text-[#4A7C3E] shadow-md' 
                    : 'border-2 border-gray-300 bg-white text-gray-900'}
                  focus:outline-none focus:border-[#4A7C3E] focus:ring-2 focus:ring-[#A8E6CF]/30 focus:shadow-lg`}
              />
            ))}
          </div>

          {/* Ready Indicator */}
          <div className="flex items-center justify-center gap-2 text-[#4A7C3E] text-sm mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-medium">Hệ thống sẵn sàng đợi soát mã tức thì</span>
          </div>

          {/* Timer & Resend */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 text-gray-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Gửi lại mã sau <span className="font-bold">{formatTime(timer)}</span></span>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Chưa nhận được mã? </span>
              <button 
                onClick={handleResend}
                disabled={!canResend || isResending}
                className={`text-sm font-semibold ${canResend && !isResending ? 'text-[#4A7C3E] hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
              >
                {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            </div>
          </div>

          {/* Privacy Notice - Highlighted */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-4 mb-6 shadow-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-red-800 mb-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>LƯU Ý QUAN TRỌNG</span>
                </p>
                <p className="text-xs text-gray-800 leading-relaxed">
                  <strong>Không chia sẻ</strong> mã xác thực này với bất kỳ ai, kể cả nhân viên SportNexus dưới mọi hình thức hỗ trợ. Đây là thông tin bảo mật tài khoản của bạn.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={code.some(digit => !digit)}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]
              ${code.every(digit => digit) 
                ? 'bg-[#4A7C3E] hover:bg-[#3d6634]' 
                : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Xác nhận & Tiếp tục
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/60 backdrop-blur-sm py-4">
        <div className="w-full px-6 flex items-center justify-between text-xs">
          <div className="text-gray-600">
            © 2026 SPORTNEXUS VIETNAM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Cam kết bảo mật
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Chính sách Fairplay
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Điều khoản dịch vụ
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default VerifyAccount
