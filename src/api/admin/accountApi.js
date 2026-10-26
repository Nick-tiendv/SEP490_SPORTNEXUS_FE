import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

// Ngày (yyyy-MM-dd) theo giờ Việt Nam. Chuỗi không kèm múi giờ giữ nguyên phần ngày;
// chuỗi có Z/offset (DateTimeOffset) là một thời điểm → quy về ngày Việt Nam.
const vnDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' })
const toIsoDate = value => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && !/(Z|[+-]\d{2}:?\d{2})$/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : vnDate.format(date)
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
    // AccountReponse (docs 06) đặt tên trường là `createAt`.
    joined: toIsoDate(pick(raw, 'createAt', 'createdAt', 'createdDate', 'createdOn', 'joinedAt')),
    modifiedAt: pick(raw, 'modifiedAt', 'updatedAt') || '',
    avatarUrl: pick(raw, 'avatarUrl', 'avatar') || '',
    fairplay: toNumberOrNull(pick(raw, 'fairPlayScore', 'fairplayScore')),
    wallet: toNumberOrNull(pick(raw, 'walletBalance', 'wallet.balance', 'balance')),
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
// GET /api/accounts/admin/by-phone?phone= : tra cứu đầy đủ tài khoản theo SĐT (có thể trả nhiều tài khoản).
export async function findAccountsByPhone(phone) {
  return toList(unwrap((await apiClient.get('/api/accounts/admin/by-phone', { params: { phone } })).data)).items.map(toAccount)
}
