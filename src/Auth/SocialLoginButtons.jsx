import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { socialLogin } from '../api/auth/authApi.js'
import { confirmDialog } from '../components/common/confirm.js'
import { useAuth } from '../context/authContext.js'
import { finishLogin } from './finishLogin.js'
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID, facebookAccessToken, renderGoogleButton } from './socialSdk.js'

// Nút đăng nhập Google / Facebook dùng ở trang Đăng nhập và Đăng ký.
// role ('Player' | 'Owner') chỉ có tác dụng khi BE tạo tài khoản mới.
export default function SocialLoginButtons({ role, mode = 'login' }) {
  const { login: contextLogin } = useAuth()
  const navigate = useNavigate()
  const googleRef = useRef(null)
  const roleRef = useRef(role)
  const [busy, setBusy] = useState('')
  const [googleError, setGoogleError] = useState('')

  useEffect(() => { roleRef.current = role }, [role])

  const complete = async (provider, token) => {
    setBusy(provider)
    try {
      let data = await socialLogin(provider, token, roleRef.current)
      if (data.needsConfirmation) {
        const who = [data.fullName, data.email && `(${data.email})`].filter(Boolean).join(' ') || 'tài khoản này'
        const ok = await confirmDialog(`Chưa có tài khoản SportNexus liên kết với ${who}. Tạo tài khoản mới?`, {
          title: 'Tạo tài khoản mới', confirmLabel: 'Tạo tài khoản', cancelLabel: 'Huỷ', danger: false, image: data.avatarUrl,
        })
        if (!ok) return
        // Dùng lại đúng token cũ (không mở lại popup) + cùng role
        data = await socialLogin(provider, token, roleRef.current, { confirmCreate: true })
        if (data.needsConfirmation) throw new Error('Không tạo được tài khoản. Vui lòng thử lại.')
      }
      const target = finishLogin(data, { contextLogin })
      toast.success(data.isNewUser ? `Chào mừng ${data.fullName || 'bạn'} đến với SportNexus!` : `Đăng nhập thành công! Chào mừng ${data.fullName || ''}.`)
      if (data.needsPhone) {
        // Tài khoản Google / Facebook chưa có SĐT: cần bổ sung để đặt sân, nhận vé…
        toast.info('Vui lòng bổ sung số điện thoại trong Hồ sơ để dùng đầy đủ tính năng.', { duration: 8000 })
      }
      navigate(target, { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Đăng nhập không thành công.')
    } finally {
      setBusy('')
    }
  }

  // Google chỉ trả idToken qua nút chính thức của Google -> vẽ nút đó vào ô bên trái
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleRef.current) return
    const width = Math.min(400, Math.max(180, googleRef.current.offsetWidth || 240))
    renderGoogleButton(googleRef.current, { onCredential: (credential) => complete('google', credential), width, text: mode === 'register' ? 'signup_with' : 'signin_with' })
      .catch((error) => setGoogleError(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ vẽ nút 1 lần; complete đọc role qua ref
  }, [mode])

  const handleFacebook = async () => {
    if (busy) return
    setBusy('facebook')
    try {
      const token = await facebookAccessToken()
      await complete('facebook', token)
    } catch (error) {
      if (!error?.cancelled) toast.error(error?.message || 'Không đăng nhập được bằng Facebook.')
      setBusy('')
    }
  }

  const notConfigured = (name, key) => () => toast.error(`Đăng nhập ${name} chưa được cấu hình trên web (thiếu ${key} trong .env).`)

  return (
    <div className="grid grid-cols-2 gap-3" aria-busy={Boolean(busy)}>
      {GOOGLE_CLIENT_ID && !googleError ? (
        <div ref={googleRef} className="flex items-center justify-center min-h-[44px]" style={{ opacity: busy === 'google' ? 0.6 : 1 }} aria-label="Đăng nhập bằng Google" />
      ) : (
        <button
          type="button"
          onClick={googleError ? () => toast.error(googleError) : notConfigured('Google', 'VITE_GOOGLE_CLIENT_ID')}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>
      )}

      <button
        type="button"
        onClick={FACEBOOK_APP_ID ? handleFacebook : notConfigured('Facebook', 'VITE_FACEBOOK_APP_ID')}
        disabled={busy === 'facebook'}
        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span className="text-sm font-medium text-gray-700">{busy === 'facebook' ? 'Đang đăng nhập…' : 'Facebook'}</span>
      </button>
    </div>
  )
}
