// Nạp SDK đăng nhập Google / Facebook khi cần (không nạp sẵn ở index.html).
// Client ID / App ID là giá trị công khai, khai báo trong .env (phải trùng cấu hình BE trên Render):
//   VITE_GOOGLE_CLIENT_ID = Auth:Google:ClientIds (Web client)
//   VITE_FACEBOOK_APP_ID  = Auth:Facebook:AppId
export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
export const FACEBOOK_APP_ID = (import.meta.env.VITE_FACEBOOK_APP_ID || '').trim()

const scripts = new Map()
function loadScript(src, id) {
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const existing = document.getElementById(id)
      if (existing) { resolve(); return }
      const el = document.createElement('script')
      el.id = id
      el.src = src
      el.async = true
      el.defer = true
      el.onload = () => resolve()
      el.onerror = () => { scripts.delete(src); reject(new Error('Không tải được thư viện đăng nhập. Kiểm tra kết nối mạng hoặc trình chặn quảng cáo.')) }
      document.head.appendChild(el)
    }))
  }
  return scripts.get(src)
}

// Google Identity Services: vẽ nút chính thức của Google vào `container`, trả idToken qua onCredential.
export async function renderGoogleButton(container, { onCredential, width = 320, text = 'signin_with' }) {
  if (!GOOGLE_CLIENT_ID) throw new Error('Chưa cấu hình VITE_GOOGLE_CLIENT_ID.')
  await loadScript('https://accounts.google.com/gsi/client', 'google-gsi')
  const google = window.google
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (res) => res?.credential && onCredential(res.credential),
    ux_mode: 'popup',
    auto_select: false,
  })
  container.innerHTML = ''
  google.accounts.id.renderButton(container, { type: 'standard', theme: 'outline', size: 'large', shape: 'rectangular', text, width, locale: 'vi' })
}

// Facebook Login: mở cửa sổ đăng nhập, trả accessToken.
let fbReady = null
export async function facebookAccessToken() {
  if (!FACEBOOK_APP_ID) throw new Error('Chưa cấu hình VITE_FACEBOOK_APP_ID.')
  if (!fbReady) {
    fbReady = loadScript('https://connect.facebook.net/vi_VN/sdk.js', 'facebook-jssdk').then(() => {
      window.FB.init({ appId: FACEBOOK_APP_ID, cookie: false, xfbml: false, version: 'v19.0' })
    }).catch((error) => { fbReady = null; throw error })
  }
  await fbReady
  return new Promise((resolve, reject) => {
    window.FB.login((res) => {
      // Chỉ nhận token khi người dùng thật sự đồng ý trong popup (bấm X -> status khác 'connected').
      // Không dùng FB.getLoginStatus / gọi API khi tải trang.
      const token = res?.status === 'connected' ? res.authResponse?.accessToken : null
      if (token) resolve(token)
      else reject(Object.assign(new Error('Bạn đã hủy đăng nhập Facebook.'), { cancelled: true }))
    }, { scope: 'public_profile,email' })
  })
}
