// Tính toán và chuẩn hóa cảnh báo phạt khi Chủ sân hủy đơn đặt sân

export const OWNER_CANCEL_48H_MS = 48 * 60 * 60 * 1000
export const OWNER_PENALTY_PERCENT_UNDER_48H = 20
export const OWNER_PENALTY_PERCENT_OVER_48H = 10
export const OWNER_FAIRPLAY_PENALTY_UNDER_48H = -10

const toPositiveNumber = (val) => {
  if (val == null || val === '') return null
  const num = Number(val)
  return Number.isFinite(num) ? num : null
}

/**
 * Chuẩn hóa thông tin cảnh báo phạt khi Chủ sân bấm Hủy Đơn:
 * - Ưu tiên dữ liệu từ API Preview Hủy (ownerPenaltyAmount, ownerFairPlayPenalty).
 * - Nếu BE không có API Preview hoặc trả lỗi (vd 400 preview), tự kiểm tra mốc 48h và hiển thị theo rule tĩnh.
 *
 * @param {Object} params
 * @param {string|Date} [params.startTime]
 * @param {number|string|null} [params.totalAmount]
 * @param {boolean} [params.isWalkIn]
 * @param {Object|null} [params.preview]
 * @param {boolean} [params.previewFallback]
 * @param {number} [params.nowMs]
 */
export function buildOwnerCancelPenaltyPreview({
  startTime,
  totalAmount,
  isWalkIn = false,
  preview = null,
  previewFallback = false,
  nowMs = Date.now(),
} = {}) {
  const effectiveWalkIn =
    typeof preview?.isWalkIn === 'boolean' ? preview.isWalkIn : Boolean(isWalkIn)

  const startMs = startTime ? new Date(startTime).getTime() : NaN
  const isUnder48h =
    typeof preview?.isUnder48h === 'boolean'
      ? preview.isUnder48h
      : Number.isFinite(startMs)
        ? startMs - nowMs < OWNER_CANCEL_48H_MS
        : null

  const baseTotal = toPositiveNumber(preview?.totalAmount ?? preview?.bookingTotalAmount ?? totalAmount)

  const apiPenaltyAmount = toPositiveNumber(preview?.ownerPenaltyAmount ?? preview?.penaltyAmount)
  const apiFairPlayPenalty = toPositiveNumber(preview?.ownerFairPlayPenalty ?? preview?.fairPlayPenalty)
  const apiPercent = toPositiveNumber(
    preview?.ownerPenaltyPercent ??
      preview?.ownerPenaltyPercentage ??
      preview?.penaltyPercent ??
      preview?.penaltyPercentage,
  )

  const fallbackPercent = effectiveWalkIn
    ? 0
    : isUnder48h === false
      ? OWNER_PENALTY_PERCENT_OVER_48H
      : OWNER_PENALTY_PERCENT_UNDER_48H

  const fallbackAmount =
    effectiveWalkIn
      ? 0
      : baseTotal != null && baseTotal > 0
        ? Math.round((baseTotal * fallbackPercent) / 100)
        : null

  const fallbackFairPlay = effectiveWalkIn
    ? 0
    : isUnder48h === false
      ? 0
      : OWNER_FAIRPLAY_PENALTY_UNDER_48H

  const ownerPenaltyAmount = apiPenaltyAmount != null ? apiPenaltyAmount : fallbackAmount
  const ownerFairPlayPenalty = apiFairPlayPenalty != null ? apiFairPlayPenalty : fallbackFairPlay

  let penaltyPercent = apiPercent
  if (penaltyPercent == null) {
    if (apiPenaltyAmount != null && baseTotal != null && baseTotal > 0) {
      penaltyPercent = Math.round((apiPenaltyAmount / baseTotal) * 100)
    } else if (apiPenaltyAmount === 0 && (!apiFairPlayPenalty || apiFairPlayPenalty === 0)) {
      penaltyPercent = 0
    } else {
      penaltyPercent = fallbackPercent
    }
  }

  const fairPlayDeducted = Math.abs(Number(ownerFairPlayPenalty) || 0)
  const hasMoneyPenalty = Number(penaltyPercent) > 0 || (ownerPenaltyAmount != null && ownerPenaltyAmount > 0)
  const hasPenalty = hasMoneyPenalty || fairPlayDeducted > 0

  let warningMessage
  if (!hasPenalty) {
    warningMessage = 'Đơn khách vãng lai trả tại quầy: không bị phạt tiền và không trừ uy tín.'
  } else if (fairPlayDeducted > 0) {
    warningMessage = `Nếu hủy đơn này, bạn sẽ bị phạt ${penaltyPercent}% giá trị đơn và trừ uy tín.`
  } else {
    warningMessage = `Nếu hủy đơn này, bạn sẽ bị phạt ${penaltyPercent}% giá trị đơn (không trừ điểm uy tín vì hủy trước 48 giờ).`
  }

  return {
    source: preview && !previewFallback ? 'api' : 'rule_48h',
    previewFallback: Boolean(previewFallback || !preview),
    isWalkIn: effectiveWalkIn,
    isUnder48h,
    totalAmount: baseTotal,
    penaltyPercent,
    ownerPenaltyAmount,
    ownerFairPlayPenalty,
    fairPlayDeducted,
    hasPenalty,
    warningMessage,
  }
}

/**
 * Tạo câu thông báo sau khi POST /api/v1/bookings/owner/{id}/cancel thành công.
 * @param {Object|null} result
 * @param {(n: number) => string} formatPoints
 * @returns {string}
 */
export function formatOwnerCancelResultMessage(result, formatPoints) {
  const penaltyAmount = toPositiveNumber(result?.ownerPenaltyAmount ?? result?.penaltyAmount)
  const fairPlayPenalty = Math.abs(toPositiveNumber(result?.ownerFairPlayPenalty ?? result?.fairPlayPenalty) || 0)
  const parts = ['Đã hủy đơn. Người đặt được hoàn 100% và nhận voucher 10%.']
  if (penaltyAmount != null && penaltyAmount > 0) {
    parts.push(`Tiền phạt đã trừ vào ví: ${formatPoints(penaltyAmount)}.`)
  }
  if (fairPlayPenalty > 0) {
    parts.push(`Trừ ${fairPlayPenalty} điểm Fair Play.`)
  }
  return parts.join(' ')
}
