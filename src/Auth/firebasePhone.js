// Xác thực số điện thoại bằng Firebase Phone Auth (cùng cơ chế với app mobile).
// Firebase gửi SMS thật; sau khi người dùng nhập đúng mã, FE lấy Firebase ID token và gửi lên BE
// qua trường firebaseIdToken (RegisterRequest, ResetPasswordRequest, VerifyOtpRequest, AddPhoneRequest).
// Luồng OTP cũ (/api/auth/send-otp) không gửi SMS, mã chỉ lưu DB → người dùng nhập mã SMS luôn bị báo sai.
//
// Cấu hình Web App của cùng project Firebase với app mobile (.env):
//   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID
// Chưa cấu hình → isFirebasePhoneEnabled = false, các màn dùng lại luồng OTP cũ của BE (devOtp khi dev).

const env = import.meta.env || {}
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

export const isFirebasePhoneEnabled = Object.values(firebaseConfig).every(Boolean)

// "0912 345 678" | "84912345678" | "+84912345678" → "+84912345678" (Firebase cần dạng E.164)
export function toE164VN(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('84')) return `+${digits}`
  if (digits.startsWith('0')) return `+84${digits.slice(1)}`
  return `+84${digits}`
}

let authPromise = null
function getFirebaseAuth() {
  if (!authPromise) {
    authPromise = Promise.all([import('firebase/app'), import('firebase/auth')]).then(([app, auth]) => {
      const instance = auth.getAuth(app.getApps()[0] || app.initializeApp(firebaseConfig))
      instance.languageCode = 'vi'
      return { auth, instance }
    })
  }
  return authPromise
}

// Đổi mã lỗi Firebase sang câu tiếng Việt cho người dùng.
const FIREBASE_ERRORS = {
  'auth/invalid-phone-number': 'Số điện thoại không hợp lệ.',
  'auth/missing-phone-number': 'Vui lòng nhập số điện thoại.',
  'auth/invalid-verification-code': 'Mã OTP không chính xác.',
  'auth/missing-verification-code': 'Vui lòng nhập mã OTP.',
  'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.',
  'auth/session-expired': 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.',
  'auth/too-many-requests': 'Bạn đã yêu cầu mã quá nhiều lần. Vui lòng thử lại sau ít phút.',
  'auth/quota-exceeded': 'Hệ thống tạm thời không gửi được SMS. Vui lòng thử lại sau.',
  'auth/captcha-check-failed': 'Xác minh reCAPTCHA không thành công. Vui lòng tải lại trang và thử lại.',
  'auth/unauthorized-domain': 'Tên miền này chưa được cấp quyền gửi OTP. Vui lòng liên hệ quản trị viên.',
  'auth/operation-not-allowed': 'Đăng nhập bằng số điện thoại chưa được bật trên Firebase. Vui lòng liên hệ quản trị viên.',
  'auth/network-request-failed': 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.',
}
const toFriendlyError = (error) =>
  Object.assign(new Error(FIREBASE_ERRORS[error?.code] || 'Không xác thực được số điện thoại. Vui lòng thử lại.'), { code: error?.code, isNormalized: true })

let verifier = null
let pending = null // { phone, confirmation } — lần gửi mã gần nhất
let verified = null // { phone, idToken, at } — giữ lại để thử đăng ký / đặt mật khẩu lại mà không cần SMS mới
const TOKEN_TTL_MS = 50 * 60 * 1000 // Firebase ID token sống 60 phút

function freshRecaptchaContainer() {
  document.getElementById('snx-recaptcha')?.remove()
  const el = document.createElement('div')
  el.id = 'snx-recaptcha'
  document.body.appendChild(el)
  return el
}

// Gửi SMS mã OTP tới số điện thoại (reCAPTCHA ẩn).
export async function sendPhoneCode(phone) {
  const { auth, instance } = await getFirebaseAuth()
  try {
    verifier?.clear()
  } catch { /* verifier cũ đã bị hủy */ }
  verifier = new auth.RecaptchaVerifier(instance, freshRecaptchaContainer(), { size: 'invisible' })
  try {
    const confirmation = await auth.signInWithPhoneNumber(instance, toE164VN(phone), verifier)
    pending = { phone: toE164VN(phone), confirmation }
    verified = null
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export const hasPendingCode = (phone) => Boolean(pending && pending.phone === toE164VN(phone))

// Kiểm tra mã người dùng nhập, trả Firebase ID token để gửi lên BE.
export async function confirmPhoneCode(phone, code) {
  const e164 = toE164VN(phone)
  if (verified && verified.phone === e164 && Date.now() - verified.at < TOKEN_TTL_MS) return verified.idToken
  if (!pending || pending.phone !== e164) throw Object.assign(new Error('Vui lòng bấm gửi mã OTP tới số điện thoại này trước.'), { isNormalized: true })
  try {
    const credential = await pending.confirmation.confirm(String(code).trim())
    const idToken = await credential.user.getIdToken()
    verified = { phone: e164, idToken, at: Date.now() }
    pending = null
    // Chỉ cần token để BE xác minh SĐT; không giữ phiên đăng nhập Firebase trên web.
    const { auth, instance } = await getFirebaseAuth()
    auth.signOut(instance).catch(() => {})
    return idToken
  } catch (error) {
    throw toFriendlyError(error)
  }
}

// Xóa token đã xác thực sau khi BE dùng xong (đăng ký / đặt lại mật khẩu thành công).
export function clearPhoneVerification() {
  pending = null
  verified = null
}
