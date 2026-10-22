/**
 * Service quản lý yêu cầu rút tiền của role Player và duyệt bởi role Admin
 * Quy định cốt lõi:
 * - Số dư tài khoản của Player phải có tối thiểu 50.000đ (phí duy trì tài khoản bắt buộc)
 * - Số tiền tối đa có thể rút = availableBalance - 50.000đ
 */

export const MIN_MAINTENANCE_FEE = 50000 // 50.000đ phí duy trì tài khoản Player

export const WITHDRAW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
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

const INITIAL_REQUESTS = [
  {
    id: 'WD-20261022-001',
    player: {
      name: 'Minh Minh Minh',
      email: 'minh.minh@sportnexus.vn',
      phone: '0908 123 456',
      role: 'Player',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
    },
    amount: 150000,
    playerBalanceBefore: 250000,
    maintenanceFeeHeld: 50000,
    remainingBalance: 100000,
    bank: {
      bankName: 'Vietcombank (VCB)',
      accountNumber: '0071001234567',
      accountHolder: 'MINH MINH MINH',
    },
    createdAt: '2026-10-22 14:30:00',
    status: 'PENDING',
    note: 'Rút tiền hoàn cọc trận đấu ngày 21/10',
  },
  {
    id: 'WD-20261022-002',
    player: {
      name: 'Hoàng Nam',
      email: 'hoang.nam.badminton@gmail.com',
      phone: '0912 345 678',
      role: 'Player',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    },
    amount: 80000,
    playerBalanceBefore: 130000,
    maintenanceFeeHeld: 50000,
    remainingBalance: 50000,
    bank: {
      bankName: 'Techcombank (TCB)',
      accountNumber: '19036789102030',
      accountHolder: 'HOANG NAM',
    },
    createdAt: '2026-10-22 15:10:00',
    status: 'PENDING',
    note: 'Rút số dư sau giải đấu giao hữu',
  },
  {
    id: 'WD-20261021-098',
    player: {
      name: 'Đức Trần',
      email: 'duc_tran92@outlook.com',
      phone: '0938 987 654',
      role: 'Player',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
    },
    amount: 200000,
    playerBalanceBefore: 350000,
    maintenanceFeeHeld: 50000,
    remainingBalance: 150000,
    bank: {
      bankName: 'MB Bank (Quân Đội)',
      accountNumber: '0888999888',
      accountHolder: 'TRAN DUC',
    },
    createdAt: '2026-10-21 09:20:00',
    status: 'APPROVED',
    approvedAt: '2026-10-21 10:05:00',
    adminNote: 'Đã chuyển khoản Napas 24/7 thành công. Mã FT: FT2610219842',
  },
  {
    id: 'WD-20261020-045',
    player: {
      name: 'Tuấn Kiệt',
      email: 'tuankiet.sports@gmail.com',
      phone: '0977 112 233',
      role: 'Player',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop',
    },
    amount: 100000,
    playerBalanceBefore: 160000,
    maintenanceFeeHeld: 50000,
    remainingBalance: 60000,
    bank: {
      bankName: 'ACB (Á Châu)',
      accountNumber: '246813579',
      accountHolder: 'TUAN KIET',
    },
    createdAt: '2026-10-20 16:45:00',
    status: 'REJECTED',
    rejectedAt: '2026-10-20 17:15:00',
    rejectReason: 'Tên chủ tài khoản ngân hàng không khớp với họ tên đã xác minh tài khoản.',
  },
]

/**
 * Lấy danh sách tất cả yêu cầu rút tiền
 */
export function getWithdrawalRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS))
      return INITIAL_REQUESTS
    }
    return JSON.parse(saved)
  } catch (e) {
    console.error('[withdrawApi] Lỗi đọc yêu cầu rút tiền:', e)
    return INITIAL_REQUESTS
  }
}

/**
 * Tạo yêu cầu rút tiền mới cho Player
 */
export function createWithdrawalRequest({
  amount,
  bankName,
  accountNumber,
  accountHolder,
  note = '',
  currentBalance = 0,
  userProfile = null,
}) {
  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0) {
    throw new Error('Số tiền yêu cầu rút không hợp lệ.')
  }

  if (currentBalance < MIN_MAINTENANCE_FEE) {
    throw new Error(
      `Số dư của bạn (${formatVND(currentBalance)}đ) không đủ mức tối thiểu ${formatVND(
        MIN_MAINTENANCE_FEE
      )}đ (phí duy trì tài khoản Player bắt buộc).`
    )
  }

  const maxWithdrawable = Math.max(0, currentBalance - MIN_MAINTENANCE_FEE)
  if (numAmount > maxWithdrawable) {
    throw new Error(
      `Số tiền yêu cầu rút (${formatVND(numAmount)}đ) vượt quá hạn mức tối đa cho phép (${formatVND(
        maxWithdrawable
      )}đ). Bạn phải giữ lại tối thiểu ${formatVND(MIN_MAINTENANCE_FEE)}đ làm phí duy trì tài khoản.`
    )
  }

  if (!bankName || !accountNumber || !accountHolder) {
    throw new Error('Vui lòng điền đầy đủ thông tin ngân hàng thụ hưởng (Ngân hàng, Số tài khoản, Tên chủ thẻ).')
  }

  const newId = `WD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
  const remaining = currentBalance - numAmount

  const newReq = {
    id: newId,
    player: {
      name: userProfile?.name || 'Minh Minh Minh',
      email: userProfile?.email || 'player@sportnexus.vn',
      phone: userProfile?.phone || '0908 123 456',
      role: 'Player',
      avatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
    },
    amount: numAmount,
    playerBalanceBefore: currentBalance,
    maintenanceFeeHeld: MIN_MAINTENANCE_FEE,
    remainingBalance: remaining,
    bank: {
      bankName,
      accountNumber: String(accountNumber).trim(),
      accountHolder: String(accountHolder).trim().toUpperCase(),
    },
    createdAt: new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    status: WITHDRAW_STATUS.PENDING,
    note: note ? note.trim() : 'Yêu cầu rút tiền về tài khoản ngân hàng cá nhân',
  }

  const currentList = getWithdrawalRequests()
  const updatedList = [newReq, ...currentList]

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
    // Trừ số dư khả dụng và ghi nhận tạm giữ
    const newAvail = Math.max(0, currentBalance - numAmount)
    localStorage.setItem('available_balance', String(newAvail))
    localStorage.setItem('escrow_balance', String(newAvail))
    window.dispatchEvent(new Event('sportnexus_withdraw_requests_updated'))
    window.dispatchEvent(new Event('escrow_balance_updated'))
  } catch (e) {
    console.error(e)
  }

  return newReq
}

/**
 * Admin duyệt yêu cầu rút tiền
 */
export function approveWithdrawalRequest(requestId, adminNote = '') {
  const currentList = getWithdrawalRequests()
  const target = currentList.find((r) => r.id === requestId)
  if (!target) {
    throw new Error(`Không tìm thấy yêu cầu rút tiền #${requestId}`)
  }

  if (target.status !== WITHDRAW_STATUS.PENDING) {
    throw new Error(`Yêu cầu #${requestId} đã ở trạng thái ${target.status}, không thể duyệt lại.`)
  }

  const updatedList = currentList.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: WITHDRAW_STATUS.APPROVED,
        approvedAt: new Date().toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        adminNote: adminNote || 'Đã duyệt chi và chuyển khoản thành công tới tài khoản ngân hàng của Player.',
      }
    }
    return r
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  window.dispatchEvent(new Event('sportnexus_withdraw_requests_updated'))
  return true
}

/**
 * Admin từ chối yêu cầu rút tiền
 */
export function rejectWithdrawalRequest(requestId, rejectReason = '') {
  const currentList = getWithdrawalRequests()
  const target = currentList.find((r) => r.id === requestId)
  if (!target) {
    throw new Error(`Không tìm thấy yêu cầu rút tiền #${requestId}`)
  }

  if (target.status !== WITHDRAW_STATUS.PENDING) {
    throw new Error(`Yêu cầu #${requestId} đã ở trạng thái ${target.status}, không thể từ chối.`)
  }

  const reason = rejectReason ? rejectReason.trim() : 'Yêu cầu không đáp ứng điều kiện hoặc thông tin ngân hàng không hợp lệ.'

  const updatedList = currentList.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: WITHDRAW_STATUS.REJECTED,
        rejectedAt: new Date().toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        rejectReason: reason,
      }
    }
    return r
  })

  // Hoàn tiền lại vào ví của người chơi
  try {
    const curBalance = Number(localStorage.getItem('available_balance') || target.remainingBalance || 50000)
    const refundedBalance = curBalance + Number(target.amount)
    localStorage.setItem('available_balance', String(refundedBalance))
    localStorage.setItem('escrow_balance', String(refundedBalance))
  } catch (e) {}

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  window.dispatchEvent(new Event('sportnexus_withdraw_requests_updated'))
  window.dispatchEvent(new Event('escrow_balance_updated'))
  return true
}
