import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const toIsoDate = value => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}
const toNumberOrNull = value => (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value))

// Chuẩn hóa tài khoản. Schema response chưa được mô tả trong swagger nên thử nhiều tên field.
export function toAccount(raw) {
  const isActiveFlag = pick(raw, 'isActive', 'active')
  const statusText = String(pick(raw, 'status', 'accountStatus') ?? '')
  const active = typeof isActiveFlag === 'boolean' ? isActiveFlag : !/inactive|lock|ban|suspend|disable/i.test(statusText)
  const name = pick(raw, 'fullName', 'name', 'displayName') || pick(raw, 'username', 'userName') || '—'
  return {
    id: String(pick(raw, 'id', 'accountId', 'userId') ?? ''),
    name,
    username: pick(raw, 'username', 'userName') || '',
    email: pick(raw, 'email') || '',
    phone: pick(raw, 'phone', 'phoneNumber') || '',
    role: String(pick(raw, 'roleName', 'role.name', 'role', 'role.roleName') ?? ''),
    roleId: String(pick(raw, 'roleId', 'role.id') ?? ''),
    status: active ? 'Active' : 'Suspended',
    joined: toIsoDate(pick(raw, 'createdAt', 'createdDate', 'createdOn', 'joinedAt')),
    avatarUrl: pick(raw, 'avatarUrl', 'avatar') || '',
    fairplay: toNumberOrNull(pick(raw, 'fairPlayScore', 'fairplayScore')),
    wallet: toNumberOrNull(pick(raw, 'walletBalance', 'wallet.balance', 'balance')),
    verified: pick(raw, 'isVerified', 'emailConfirmed', 'isEmailVerified'),
  }
}

export async function listAccounts() {
  return toList(unwrap((await apiClient.get('/api/accounts')).data)).items.map(toAccount)
}
export async function getAccount(id) {
  return toAccount(unwrap((await apiClient.get(`/api/accounts/${encodeURIComponent(id)}`)).data))
}
export async function getMyAccount() {
  return toAccount(unwrap((await apiClient.get('/api/auth/me')).data))
}
// Body theo swagger CreateAccountRequest (roleId, password là bắt buộc phía BE).
export async function createAccount({ username, password, fullName, phone, email, roleId }) {
  return unwrap((await apiClient.post('/api/accounts', { username, password, fullName, phone: phone || null, email, roleId, isActive: true, fairPlayScore: 100 })).data)
}
// UpdateAccountRequest: field nào null thì BE giữ nguyên.
export async function updateAccount(id, { username, fullName, phone, email, roleId, password }) {
  return unwrap((await apiClient.put(`/api/accounts/${encodeURIComponent(id)}`, { username, fullName, phone: phone || null, email, roleId: roleId || null, password: password || null })).data)
}
export async function toggleAccountStatus(id) {
  return unwrap((await apiClient.patch(`/api/accounts/${encodeURIComponent(id)}/toggle-status`)).data)
}
export async function deleteAccount(id) {
  return unwrap((await apiClient.delete(`/api/accounts/${encodeURIComponent(id)}`)).data)
}
