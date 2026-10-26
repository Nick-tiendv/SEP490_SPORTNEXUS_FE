import apiClient, { normalizeApiError } from '../apiClient.js'

/**
 * Rút tiền / giao dịch ví của Player (danh sách, tạo yêu cầu, tài khoản ngân hàng dùng api/owner/walletApi.js)
 * - POST /api/v1/wallet/withdrawals/{id}/cancel
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
  cancelWithdrawalRequest,
  getTransactionById,
}
