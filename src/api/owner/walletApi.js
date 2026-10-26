import { get, getList, path, post, put } from './request.js'

// ---------- Ví & doanh thu ----------
export const getMyWallet = () => get('/api/v1/wallet')
export const getOwnerEarnings = ({ from, to } = {}) => get('/api/v1/wallet/owner/earnings', { from, to })
// Query: Type, Status, From, To, Page, PageSize.
export const getMyTransactions = params => getList('/api/v1/wallet/transactions', params)

// ---------- Tài khoản ngân hàng (BE chỉ lưu 1 tài khoản) ----------
export const getBankAccount = () => get('/api/v1/wallet/bank-account')
export const updateBankAccount = ({ bankName, bankAccountNumber, bankAccountHolder }) =>
  put('/api/v1/wallet/bank-account', { bankName, bankAccountNumber, bankAccountHolder })

// ---------- Rút tiền ----------
export const createWithdrawal = amount => post('/api/v1/wallet/withdrawals', { amount })
export const getMyWithdrawals = ({ page, pageSize } = {}) => getList('/api/v1/wallet/withdrawals', { page, pageSize })
export const cancelWithdrawal = id => post(`/api/v1/wallet/withdrawals/${path(id)}/cancel`)
