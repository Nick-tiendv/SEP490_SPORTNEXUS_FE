// Tiện ích đơn đặt sân chia tiền (theo docs BE "FE_CHIA_TIEN_DAT_SAN", cập nhật 25/11/2026).

// BE trả giờ VN, có thể không kèm múi giờ ("2026-11-25T14:30:00") → coi là +07:00.
export function parseVnTime(value) {
  if (!value) return NaN
  const text = String(value).trim()
  return new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text}+07:00`).getTime()
}

// Số giây còn lại tới mốc (null nếu không đọc được)
export function secondsUntil(value, now = Date.now()) {
  const at = parseVnTime(value)
  return Number.isFinite(at) ? Math.max(0, Math.round((at - now) / 1000)) : null
}

// Cách BE chia: tiền mỗi ca chia đều cho (người tạo + số bạn), làm tròn xuống; phần lẻ người tạo trả.
// share: phần mỗi người bạn; hostShare: phần người tạo (gồm phần lẻ).
export function splitShares(slotPrices, people) {
  const n = Math.max(1, Math.floor(Number(people)) || 1)
  const prices = (slotPrices || []).map((p) => Math.max(0, Number(p) || 0))
  const total = prices.reduce((sum, p) => sum + p, 0)
  const share = prices.reduce((sum, p) => sum + Math.floor(p / n), 0)
  return { total, share, hostShare: total - share * (n - 1) }
}

const upper = (value) => String(value || '').toUpperCase()
export const bookingIdOf = (b) => b?.bookingId || b?.id || ''
export const isSplitHost = (b) => /host/i.test(b?.myRole || '')
export const isSplitParticipant = (b) => /participant/i.test(b?.myRole || '')

// Đơn chia tiền đang chờ góp (my-bookings / upcoming): PENDING và có người khác cùng góp
export const isPendingSplit = (b) =>
  upper(b?.bookingStatus || b?.status) === 'PENDING' &&
  (b?.isSplitPayment === true || isSplitParticipant(b) || Number(b?.participantCount) > 1)

// Hiện nút "Góp tiền": được mời, đơn còn chờ góp, mình chưa góp
export const needsMyPayment = (b) => isSplitParticipant(b) && isPendingSplit(b) && upper(b?.myPaymentStatus) === 'PENDING'

// paymentStatus của từng người trong chi tiết đơn: PENDING = chưa góp; HELD / PAID / CHECKED_IN = đã góp
export const hasPaid = (status) => /HELD|PAID|CHECKED_IN/.test(upper(status))
