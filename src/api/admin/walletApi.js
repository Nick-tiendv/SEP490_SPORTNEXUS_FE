import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== false))
const path = value => encodeURIComponent(value)
const toNumber = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))
const asArray = value => (Array.isArray(value) ? value : [])

// ---------- Giao dịch: GET /api/v1/admin/wallets/transactions ----------
export function toTransaction(raw) {
  return {
    id: String(raw?.id ?? ''),
    walletId: String(raw?.walletId ?? ''),
    userId: String(raw?.userId ?? ''),
    fullName: raw?.fullName || '—',
    role: raw?.roleName || '',
    type: String(raw?.type ?? '').toUpperCase(),
    amount: toNumber(raw?.amount) ?? 0,
    balanceChange: toNumber(raw?.balanceChange) ?? 0,
    status: String(raw?.status ?? '').toUpperCase(),
    description: raw?.description || '',
    note: raw?.note || '',
    referenceId: raw?.referenceId || '',
    createdAt: raw?.createdAt || '',
  }
}
// Query: UserId, ReferenceId, MinAmount, Type, Status, From, To, Page, PageSize.
export async function listTransactions(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/wallets/transactions', { params: clean(params) })).data))
  return { items: items.map(toTransaction), total, totalPages }
}

// ---------- Ví: GET /api/v1/admin/wallets, /{userId} ----------
export function toWallet(raw) {
  return {
    walletId: String(raw?.walletId ?? ''),
    userId: String(raw?.userId ?? ''),
    fullName: raw?.fullName || '—',
    email: raw?.email || '',
    phone: raw?.phone || '',
    role: raw?.roleName || '',
    isActive: raw?.isActive !== false,
    balance: toNumber(raw?.balance) ?? 0,
    frozenBalance: toNumber(raw?.frozenBalance) ?? 0,
    transactionCount: toNumber(raw?.transactionCount) ?? 0,
    lastTransactionAt: raw?.lastTransactionAt || '',
  }
}
// Query: Keyword, Role, Negative, SortBy, Page, PageSize.
export async function listWallets(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/wallets', { params: clean(params) })).data))
  return { items: items.map(toWallet), total, totalPages }
}
const WALLET_FIELDS = { role: 'roleName' }
// Response chi tiết chưa có mẫu: lấy phần thông tin ví (phẳng hoặc lồng trong `wallet`) và danh sách giao dịch nếu có.
export async function getWallet(userId) {
  const data = unwrap((await apiClient.get(`/api/v1/admin/wallets/${path(userId)}`)).data) || {}
  const base = data.wallet && typeof data.wallet === 'object' ? { ...data, ...data.wallet } : data
  // Chỉ giữ field có thật trong response để không ghi đè dữ liệu dòng danh sách bằng giá trị mặc định.
  const present = Object.entries(toWallet(base)).filter(([key]) => (WALLET_FIELDS[key] || key) in base)
  return { ...Object.fromEntries(present), transactions: asArray(pick(data, 'recentTransactions', 'transactions', 'items')).map(toTransaction) }
}
// amount > 0 cộng tiền, < 0 trừ tiền.
export const adjustWallet = async (userId, { amount, reason }) => unwrap((await apiClient.post(`/api/v1/admin/wallets/${path(userId)}/adjust`, { amount, reason })).data)

// ---------- Thống kê: GET /api/v1/admin/wallets/statistics?from&to ----------
const STAT_KEYS = ['walletCount', 'totalBalance', 'totalFrozenBalance', 'negativeWallets', 'negativeAmount', 'bookingEscrowHeld', 'prizeFundsHeld', 'totalDeposits', 'bookingGrossValue', 'bookingRefunds', 'ownerBookingEarnings', 'platformRevenue', 'bookingCommissionRevenue', 'promotionRevenue', 'currentBookingFeePercent', 'withdrawalsCompleted', 'withdrawalsPending', 'pendingDeposits', 'tournamentFeesToOwners', 'prizesPaid', 'adminAdjustments']
export async function getWalletStatistics({ from, to } = {}) {
  const data = unwrap((await apiClient.get('/api/v1/admin/wallets/statistics', { params: clean({ from, to }) })).data) || {}
  return {
    ...Object.fromEntries(STAT_KEYS.map(key => [key, toNumber(data[key])])),
    byDay: asArray(data.byDay).map(day => ({
      date: day.date,
      deposits: toNumber(day.deposits) ?? 0,
      bookingGrossValue: toNumber(day.bookingGrossValue) ?? 0,
      refunds: toNumber(day.refunds) ?? 0,
      ownerEarnings: toNumber(day.ownerEarnings) ?? 0,
    })),
  }
}

// ---------- Cài đặt hoa hồng & đối soát ----------
export async function getCommissionSetting() {
  const data = unwrap((await apiClient.get('/api/v1/admin/wallets/settings/commission')).data) || {}
  return { bookingFeePercent: toNumber(data.bookingFeePercent), updatedAt: data.updatedAt || '' }
}
export const updateCommissionSetting = async bookingFeePercent => unwrap((await apiClient.put('/api/v1/admin/wallets/settings/commission', { bookingFeePercent })).data)
export const runSettlements = async () => unwrap((await apiClient.post('/api/v1/admin/wallets/settlements/run')).data)

// ---------- Rút tiền: GET /api/v1/admin/withdrawals ----------
// Chưa có response mẫu (danh sách rỗng) nên thử vài tên field phổ biến.
export function toWithdrawal(raw) {
  return {
    id: String(pick(raw, 'id', 'withdrawalId') ?? ''),
    userId: String(pick(raw, 'userId', 'user.id') ?? ''),
    fullName: pick(raw, 'fullName', 'userName', 'accountName', 'user.fullName') || '—',
    email: pick(raw, 'email', 'userEmail', 'accountEmail', 'user.email') || '',
    role: pick(raw, 'roleName', 'role') || '',
    amount: toNumber(pick(raw, 'amount')) ?? 0,
    status: String(pick(raw, 'status') ?? 'PENDING').toUpperCase(),
    bankName: pick(raw, 'bankName', 'bank.name', 'bankCode') || '',
    bankAccountNumber: pick(raw, 'bankAccountNumber', 'accountNumber', 'bankAccountNo', 'bank.accountNumber') || '',
    bankAccountName: pick(raw, 'bankAccountName', 'accountHolderName', 'bankAccountHolder', 'bank.accountName') || '',
    bankTransactionRef: pick(raw, 'bankTransactionRef', 'transactionRef') || '',
    rejectReason: pick(raw, 'rejectReason', 'rejectedReason', 'reason') || '',
    createdAt: pick(raw, 'createdAt', 'requestedAt') || '',
    processedAt: pick(raw, 'processedAt', 'completedAt', 'reviewedAt', 'updatedAt') || '',
  }
}
// Query: Status, Keyword, UserId, Page, PageSize.
export async function listWithdrawals(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/admin/withdrawals', { params: clean(params) })).data))
  return { items: items.map(toWithdrawal), total, totalPages }
}
export const completeWithdrawal = async (id, bankTransactionRef) => unwrap((await apiClient.patch(`/api/v1/admin/withdrawals/${path(id)}/complete`, { bankTransactionRef: bankTransactionRef || null })).data)
export const rejectWithdrawal = async (id, reason) => unwrap((await apiClient.patch(`/api/v1/admin/withdrawals/${path(id)}/reject`, { reason: reason || null })).data)
