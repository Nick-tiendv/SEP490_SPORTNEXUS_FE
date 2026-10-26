import apiClient, { normalizeApiError } from '../apiClient.js'

/* ============================================================
 * HẰNG SỐ & TIỆN ÍCH LUỒNG NẠP TIỀN (PayOS)
 * ============================================================ */

/** Giới hạn số tiền nạp theo quy định: số nguyên 10.000đ – 2.000.000đ */
export const DEPOSIT_MIN = 10000
export const DEPOSIT_MAX = 2000000

/** Trạng thái lệnh nạp do BE trả về */
export const DEPOSIT_STATUS = {
  PENDING: 'PENDING_PAYMENT',
  SUCCESS: 'SUCCESS',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
}

/** Loại giao dịch ví (GET /api/v1/wallet/transactions?type=...) */
export const TRANSACTION_TYPES = ['DEPOSIT', 'FREEZE', 'PAYOUT', 'REFUND', 'RELEASE']

/**
 * Kiểm tra số tiền nạp phía FE (BE vẫn kiểm tra lại và trả 400 nếu sai).
 * @returns {string|null} Thông báo lỗi hoặc null nếu hợp lệ
 */
export function validateDepositAmount(amount) {
  const num = Number(amount)
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return 'Số tiền nạp phải là số nguyên hợp lệ'
  }
  if (num < DEPOSIT_MIN) {
    return `Số tiền nạp tối thiểu là ${new Intl.NumberFormat('vi-VN').format(DEPOSIT_MIN)}đ`
  }
  if (num > DEPOSIT_MAX) {
    return `Số tiền nạp không được vượt quá ${new Intl.NumberFormat('vi-VN').format(DEPOSIT_MAX)}đ (bạn đang nhập ${new Intl.NumberFormat('vi-VN').format(num)}đ)`
  }
  return null
}

/**
 * Chuẩn hóa trạng thái lệnh nạp từ BE về 4 giá trị chuẩn.
 * Chỉ dùng cho dữ liệu lấy từ API BE — KHÔNG dùng cho tham số `status` trên URL PayOS.
 */
export function normalizeDepositStatus(raw) {
  const s = String(raw || '').toUpperCase()
  if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') return DEPOSIT_STATUS.SUCCESS
  if (s === 'CANCELLED' || s === 'CANCELED') return DEPOSIT_STATUS.CANCELLED
  if (s === 'FAILED' || s === 'EXPIRED') return DEPOSIT_STATUS.FAILED
  return DEPOSIT_STATUS.PENDING
}

/* ------------------------------------------------------------
 * Ngữ cảnh lệnh nạp đang chờ — lưu trước khi chuyển sang PayOS
 * để khi PayOS chuyển về returnUrl/cancelUrl FE biết quay lại đâu.
 * ------------------------------------------------------------ */
const PENDING_DEPOSIT_KEY = 'sportnexus_pending_deposit'

export function savePendingDeposit({ orderCode, amount, returnTo } = {}) {
  try {
    localStorage.setItem(
      PENDING_DEPOSIT_KEY,
      JSON.stringify({ orderCode, amount, returnTo: returnTo || null, createdAt: Date.now() })
    )
  } catch {}
}

export function readPendingDeposit() {
  try {
    const raw = localStorage.getItem(PENDING_DEPOSIT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingDeposit() {
  try {
    localStorage.removeItem(PENDING_DEPOSIT_KEY)
  } catch {}
}

const unwrap = (body) => {
  if (!body || typeof body !== 'object') return body
  if (body.data !== undefined) return body.data
  if (body.result !== undefined) return body.result
  return body
}

/* ============================================================
 * API VÍ
 * ============================================================ */

/**
 * Xem ví
 * GET /api/v1/wallet
 * @returns {Promise<{balance:number, frozenBalance:number, availableBalance:number}>}
 */
export async function getWallet() {
  try {
    const response = await apiClient.get('/api/v1/wallet')
    const walletData = unwrap(response.data) || {}
    const balance = Number(walletData.balance ?? 0)
    const frozenBalance = Number(walletData.frozenBalance ?? 0)
    const availableBalance = Number(walletData.availableBalance ?? balance - frozenBalance)
    const normalized = { ...walletData, balance, frozenBalance, availableBalance }

    // Đồng bộ cho TopBar và các trang khác đang đọc từ localStorage
    try {
      localStorage.setItem('escrow_balance', String(balance))
      localStorage.setItem('frozen_balance', String(frozenBalance))
      localStorage.setItem('available_balance', String(availableBalance))
      window.dispatchEvent(new Event('escrow_balance_updated'))
      window.dispatchEvent(new Event('frozen_balance_updated'))
    } catch {}

    return normalized
  } catch (error) {
    console.warn('[walletApi] Không thể lấy thông tin ví từ máy chủ:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Tạo lệnh nạp
 * POST /api/v1/wallet/deposit  body { amount, returnUrl, cancelUrl }
 * 201 → { orderCode, checkoutUrl, qrCode, status: 'PENDING_PAYMENT', amount, ... }
 * 400 → số tiền không hợp lệ | 401 → chưa đăng nhập | 503 → PayOS chưa cấu hình
 */
export async function createDeposit({ amount, returnUrl, cancelUrl } = {}) {
  const validationError = validateDepositAmount(amount)
  if (validationError) {
    throw Object.assign(new Error(validationError), { status: 400, isNormalized: true })
  }
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const isLocalhost = Boolean(origin && (origin.includes('localhost') || origin.includes('127.0.0.1')))

    // BE có whitelist PayOS:AllowedReturnUrlPrefixes (chỉ chấp nhận domain production/vercel).
    // Nếu ở localhost và không có returnUrl tùy chỉnh, không gửi link localhost để tránh bị BE chặn 400;
    // thay vào đó để BE dùng ReturnUrl mặc định (hoặc fallback sang domain vercel đã whitelist).
    const payload = {
      amount: Number(amount),
    }

    if (returnUrl) {
      payload.returnUrl = returnUrl
    } else if (!isLocalhost && origin) {
      payload.returnUrl = `${origin}/wallet/deposit-success`
    }

    if (cancelUrl) {
      payload.cancelUrl = cancelUrl
    } else if (!isLocalhost && origin) {
      payload.cancelUrl = `${origin}/wallet/deposit-cancel`
    }

    let response
    try {
      response = await apiClient.post('/api/v1/wallet/deposit', payload)
    } catch (apiErr) {
      // Nếu BE không cho phép để trống returnUrl hoặc vẫn báo lỗi AllowedReturnUrlPrefixes,
      // thử lại với URL callback domain chính thức của hệ thống (nằm trong whitelist)
      const errMsg = String(apiErr?.message || '')
      const isReturnUrlIssue =
        errMsg.includes('AllowedReturnUrlPrefixes') ||
        errMsg.includes('returnUrl') ||
        apiErr?.status === 400
      if (isLocalhost && (!payload.returnUrl || isReturnUrlIssue)) {
        console.warn('[walletApi] Thử lại với URL callback whitelist của SportNexus...')
        const fallbackPayload = {
          amount: Number(amount),
          returnUrl: 'https://sep-490-sportnexus-fe.vercel.app/wallet/deposit-success',
          cancelUrl: 'https://sep-490-sportnexus-fe.vercel.app/wallet/deposit-cancel',
        }
        response = await apiClient.post('/api/v1/wallet/deposit', fallbackPayload)
      } else {
        throw apiErr
      }
    }
    const raw = unwrap(response.data) || {}
    const inner = raw.data || raw.result || raw
    const orderCode = raw.orderCode ?? inner.orderCode ?? raw.orderId ?? inner.orderId
    const checkoutUrl = raw.checkoutUrl ?? inner.checkoutUrl ?? raw.paymentUrl ?? inner.paymentUrl
    const qrCode = raw.qrCode ?? inner.qrCode
    const accountName = raw.accountName ?? inner.accountName
    const accountNumber = raw.accountNumber ?? inner.accountNumber
    const description = raw.description ?? inner.description
    const expiredAt = raw.expiredAt ?? inner.expiredAt ?? raw.expiresAt ?? inner.expiresAt
    const status = raw.status ?? inner.status ?? DEPOSIT_STATUS.PENDING

    return {
      ...inner,
      ...raw,
      orderCode,
      checkoutUrl,
      qrCode,
      accountName,
      accountNumber,
      description,
      expiredAt,
      status,
      amount: Number(raw.amount ?? inner.amount ?? amount),
    }
  } catch (error) {
    console.error('[walletApi] Tạo yêu cầu nạp tiền thất bại:', error)
    throw normalizeApiError(error)
  }
}

// Giữ alias depositWallet tương thích ngược
export const depositWallet = createDeposit

/**
 * Xem trạng thái lệnh nạp
 * GET /api/v1/wallet/deposits/{orderCode}
 * status: PENDING_PAYMENT → SUCCESS / CANCELLED / FAILED
 * 404 → không tìm thấy (hoặc orderCode của người khác)
 */
export async function getDepositByOrderCode(orderCode) {
  if (!orderCode) return null
  try {
    const response = await apiClient.get(`/api/v1/wallet/deposits/${encodeURIComponent(orderCode)}`)
    const raw = unwrap(response.data) || {}
    const inner = raw.data || raw.result || raw
    return {
      ...inner,
      ...raw,
      orderCode: raw.orderCode ?? inner.orderCode ?? orderCode,
      status: raw.status ?? inner.status,
      amount: Number(raw.amount ?? inner.amount ?? 0),
    }
  } catch (error) {
    console.warn(`[walletApi] Lỗi lấy thông tin nạp tiền ${orderCode}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Hủy lệnh nạp chưa thanh toán
 * POST /api/v1/wallet/deposits/{orderCode}/cancel
 * 400 → lệnh đã thanh toán / đã hủy (không còn ở trạng thái chờ)
 */
export async function cancelDeposit(orderCode) {
  if (!orderCode) return null
  try {
    const response = await apiClient.post(`/api/v1/wallet/deposits/${encodeURIComponent(orderCode)}/cancel`)
    return unwrap(response.data)
  } catch (error) {
    console.warn(`[walletApi] Lỗi hủy đơn nạp tiền ${orderCode}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lịch sử giao dịch ví
 * GET /api/v1/wallet/transactions?type=DEPOSIT&from=2026-10-01&to=2026-10-31&page=1&pageSize=20
 * @param {{type?:string, from?:string, to?:string, page?:number, pageSize?:number}} params
 * @returns {Promise<{items:Array, page:number, pageSize:number, totalCount:number, totalPages:number}>}
 */
export async function getWalletTransactions({ type, from, to, page = 1, pageSize = 20 } = {}) {
  const params = { page, pageSize }
  if (type) params.type = type
  if (from) params.from = from
  if (to) params.to = to
  try {
    const response = await apiClient.get('/api/v1/wallet/transactions', { params })
    const raw = response.data
    const body =
      raw && !Array.isArray(raw) && raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
        ? raw.data
        : raw
    const items = Array.isArray(body)
      ? body
      : body?.items || body?.data || body?.results || body?.transactions || []
    const totalCount = Number(body?.totalCount ?? body?.total ?? body?.totalItems ?? items.length)
    const size = Number(body?.pageSize ?? pageSize)
    const totalPages = Number(body?.totalPages ?? Math.max(1, Math.ceil(totalCount / (size || 1))))
    return { items, page: Number(body?.page ?? body?.pageNumber ?? page), pageSize: size, totalCount, totalPages }
  } catch (error) {
    console.warn('[walletApi] Lỗi lấy lịch sử giao dịch:', error)
    throw normalizeApiError(error)
  }
}
