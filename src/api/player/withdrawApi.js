import apiClient, { normalizeApiError } from '../apiClient.js'

/**
 * Service quản lý yêu cầu rút tiền và tài khoản ngân hàng của role Player
 * Backend API:
 * - GET  /api/v1/wallet/withdrawals
 * - POST /api/v1/wallet/withdrawals
 * - POST /api/v1/wallet/withdrawals/{id}/cancel
 * - GET  /api/v1/wallet/bank-account
 * - PUT  /api/v1/wallet/bank-account
 * - GET  /api/v1/wallet/transactions/{transactionId}
 */

export const MIN_MAINTENANCE_FEE = 50000 // 50.000đ phí duy trì tài khoản Player

export const WITHDRAW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
}

export const POPULAR_BANKS = [
  { id: 'vcb', code: 'VCB', name: 'Vietcombank', shortName: 'VCB', logo: '🏦' },
  { id: 'tcb', code: 'TCB', name: 'Techcombank', shortName: 'TCB', logo: '💳' },
  { id: 'mb', code: 'MB', name: 'MB Bank (Quân Đội)', shortName: 'MB', logo: '⭐' },
  { id: 'vtb', code: 'CTG', name: 'VietinBank', shortName: 'VTB', logo: '🏛️' },
  { id: 'bidv', code: 'BIDV', name: 'BIDV', shortName: 'BIDV', logo: '💎' },
  { id: 'acb', code: 'ACB', name: 'ACB (Á Châu)', shortName: 'ACB', logo: '🌐' },
  { id: 'tpb', code: 'TPB', name: 'TPBank (Tiên Phong)', shortName: 'TPB', logo: '✨' },
  { id: 'vpb', code: 'VPB', name: 'VPBank', shortName: 'VPB', logo: '🍀' },
  { id: 'momo', code: 'MOMO', name: 'Ví Điện Tử MoMo', shortName: 'MoMo', logo: '📱' },
]

export const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(Number(val) || 0)

const STORAGE_KEY = 'sportnexus_player_withdraw_requests'

/**
 * Lấy thông tin tài khoản ngân hàng liên kết của Player
 * GET /api/v1/wallet/bank-account
 * @returns {Promise<{ bankName: string, bankAccountNumber: string, bankAccountHolder: string }>}
 */
export async function getBankAccount() {
  try {
    const response = await apiClient.get('/api/v1/wallet/bank-account')
    const body = response.data
    return body?.data || body?.result || body || null
  } catch (error) {
    console.warn('[withdrawApi] Không thể lấy tài khoản ngân hàng từ BE:', error)
    try {
      const saved = localStorage.getItem('sportnexus_player_bank_account')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }
}

/**
 * Cập nhật thông tin tài khoản ngân hàng liên kết của Player
 * PUT /api/v1/wallet/bank-account
 * @param {Object} payload
 * @param {string} payload.bankName
 * @param {string} payload.bankAccountNumber
 * @param {string} payload.bankAccountHolder
 * @returns {Promise<Object>}
 */
export async function updateBankAccount(payload) {
  if (!payload || !payload.bankAccountNumber) {
    throw new Error('Số tài khoản không được để trống')
  }
  try {
    const bodyPayload = {
      bankName: payload.bankName || 'Vietcombank',
      bankAccountNumber: String(payload.bankAccountNumber).trim(),
      bankAccountHolder: String(payload.bankAccountHolder || '').trim().toUpperCase(),
    }
    const response = await apiClient.put('/api/v1/wallet/bank-account', bodyPayload)
    const body = response.data
    try {
      localStorage.setItem('sportnexus_player_bank_account', JSON.stringify(bodyPayload))
    } catch {}
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[withdrawApi] Lỗi cập nhật tài khoản ngân hàng:', error)
    try {
      localStorage.setItem('sportnexus_player_bank_account', JSON.stringify(payload))
    } catch {}
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách yêu cầu rút tiền của Player
 * Hỗ trợ cả đồng bộ (cho Admin UI) và Promise (cho async callers)
 * GET /api/v1/wallet/withdrawals?page=1&pageSize=20
 * @param {Object} [params]
 * @returns {Array & Promise<Array>}
 */
export function getWithdrawalRequests(params = {}) {
  let localData = []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    localData = raw ? JSON.parse(raw) : []
  } catch {
    localData = []
  }

  const result = [...localData]

  const promise = (async () => {
    try {
      const response = await apiClient.get('/api/v1/wallet/withdrawals', { params })
      const body = response.data
      const data = body?.data || body?.result || body
      let items = []
      if (data && Array.isArray(data.items)) items = data.items
      else if (Array.isArray(data)) items = data
      else if (Array.isArray(body)) items = body
      else items = localData

      if (items.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        } catch {}
      }
      return items
    } catch (error) {
      console.warn('[withdrawApi] API /api/v1/wallet/withdrawals lỗi, dùng fallback localStorage:', error)
      return localData
    }
  })()

  // Make the returned array a Thenable
  result.then = promise.then.bind(promise)
  result.catch = promise.catch.bind(promise)
  result.finally = promise.finally.bind(promise)

  return result
}

/**
 * Phê duyệt yêu cầu rút tiền (Admin)
 * @param {string} id
 * @param {string} [adminNote]
 */
export function approveWithdrawalRequest(id, adminNote = '') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    const updated = list.map((r) =>
      r.id === id ? { ...r, status: WITHDRAW_STATUS.APPROVED, adminNote, approvedAt: new Date().toISOString() } : r
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('sportnexus_withdraw_requests_updated', { detail: { id, status: 'APPROVED' } }))
    return true
  } catch (e) {
    console.warn('[withdrawApi] Lỗi approveWithdrawalRequest:', e)
    throw e
  }
}

/**
 * Từ chối yêu cầu rút tiền (Admin)
 * @param {string} id
 * @param {string} [rejectReason]
 */
export function rejectWithdrawalRequest(id, rejectReason = '') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    const updated = list.map((r) =>
      r.id === id ? { ...r, status: WITHDRAW_STATUS.REJECTED, rejectReason, rejectedAt: new Date().toISOString() } : r
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('sportnexus_withdraw_requests_updated', { detail: { id, status: 'REJECTED' } }))
    return true
  } catch (e) {
    console.warn('[withdrawApi] Lỗi rejectWithdrawalRequest:', e)
    throw e
  }
}

/**
 * Tạo yêu cầu rút tiền mới
 * POST /api/v1/wallet/withdrawals
 * @param {Object} payload
 * @param {number} payload.amount - Số tiền muốn rút
 * @param {Object} [payload.bank] - Thông tin ngân hàng nhận
 * @returns {Promise<Object>}
 */
export async function createWithdrawalRequest({ amount, bank, note }) {
  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0) {
    throw new Error('Số tiền rút phải lớn hơn 0đ')
  }

  try {
    const response = await apiClient.post('/api/v1/wallet/withdrawals', {
      amount: numAmount,
    })
    const body = response.data
    const resData = body?.data || body?.result || body

    // Cập nhật ngầm vào localStorage để đồng bộ offline
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const newReq = {
        id: resData?.id || `WD-${Date.now()}`,
        amount: numAmount,
        bank: bank || { bankName: 'Vietcombank', accountNumber: '•••' },
        createdAt: new Date().toISOString(),
        status: resData?.status || 'PENDING',
        note: note || '',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newReq, ...existing]))
    } catch {}

    return resData
  } catch (error) {
    console.warn('[withdrawApi] Lỗi khi tạo yêu cầu rút tiền:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Hủy yêu cầu rút tiền đang chờ duyệt
 * POST /api/v1/wallet/withdrawals/{id}/cancel
 * @param {string} id - UUID yêu cầu rút
 * @returns {Promise<Object>}
 */
export async function cancelWithdrawalRequest(id) {
  if (!id) throw new Error('ID yêu cầu rút tiền không được để trống')
  try {
    const response = await apiClient.post(`/api/v1/wallet/withdrawals/${id}/cancel`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[withdrawApi] Lỗi hủy yêu cầu rút ${id}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xem chi tiết giao dịch ví theo ID
 * GET /api/v1/wallet/transactions/{transactionId}
 * @param {string} transactionId
 * @returns {Promise<Object>}
 */
export async function getTransactionById(transactionId) {
  if (!transactionId) return null
  try {
    const response = await apiClient.get(`/api/v1/wallet/transactions/${transactionId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[withdrawApi] Lỗi xem giao dịch ${transactionId}:`, error)
    throw normalizeApiError(error)
  }
}

export default {
  MIN_MAINTENANCE_FEE,
  WITHDRAW_STATUS,
  POPULAR_BANKS,
  formatVND,
  getBankAccount,
  updateBankAccount,
  getWithdrawalRequests,
  createWithdrawalRequest,
  cancelWithdrawalRequest,
  getTransactionById,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
}
