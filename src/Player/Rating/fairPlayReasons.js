// Hỗ trợ chuẩn hóa và kiểm tra hợp lệ lý do chấm điểm Fair Play 1 - 2 sao

const LETTER_RE = /\p{L}/u

/**
 * Chuẩn hóa dữ liệu danh sách lý do trả về từ GET /api/v1/reviews/fair-play/reasons.
 * Không tự tạo danh sách giả khi API rỗng hoặc lỗi.
 * @param {unknown} rawBody
 * @returns {Array<{ id: string|number, label: string, description?: string }>}
 */
export function normalizeFairPlayReasons(rawBody) {
  const payload = rawBody?.data ?? rawBody?.result ?? rawBody
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : []

  return list
    .map((item) => {
      if (item == null || typeof item !== 'object') return null
      const id = item.id ?? item.reasonId ?? item.code ?? item.value
      const label =
        item.label ??
        item.name ??
        item.title ??
        item.reasonText ??
        item.reason ??
        item.description ??
        item.text ??
        item.content ??
        ''
      if (id == null || id === '' || !String(label).trim()) return null
      return {
        ...item,
        id,
        label: String(label).trim(),
        description: item.description && item.description !== label ? String(item.description).trim() : '',
      }
    })
    .filter(Boolean)
}

/**
 * Nhận diện Lý do 4 ("Khác") yêu cầu người dùng bắt buộc nhập nội dung nhận xét bằng chữ.
 * @param {Object|null|undefined} reason
 * @returns {boolean}
 */
export function isOtherFairPlayReason(reason) {
  if (!reason) return false
  if (reason.isOther === true || reason.requireComment === true) return true
  const idText = String(reason.id ?? '').trim().toUpperCase()
  if (idText === '4' || idText === 'OTHER') return true
  const codeText = String(reason.code ?? '').trim().toUpperCase()
  if (codeText === 'OTHER' || codeText === 'KHAC') return true
  const labelText = `${reason.label || ''} ${reason.name || ''} ${reason.title || ''}`
  return /khác|other/i.test(labelText)
}

/**
 * Kiểm tra chuỗi có chứa ký tự chữ (không chấp nhận chuỗi rỗng, khoảng trắng hoặc chỉ ký tự/số).
 * @param {string} text
 * @returns {boolean}
 */
export function hasTextLetters(text) {
  const trimmed = String(text || '').trim()
  return trimmed.length > 0 && LETTER_RE.test(trimmed)
}

/**
 * Kiểm tra hợp lệ form chấm điểm Fair Play trước khi gọi POST /api/v1/reviews/fair-play.
 * - 1 - 2 sao: bắt buộc có reasonId.
 * - Nếu chọn Lý do 4 (Khác): ô Nhận xét bắt buộc phải nhập chữ (tối thiểu 10 ký tự).
 * @param {Object} params
 * @param {number} params.score
 * @param {string|number|null|undefined} params.reasonId
 * @param {Array} [params.reasons]
 * @param {string} params.comment
 */
export function validateFairPlayRating({ score, reasonId, reasons = [], comment }) {
  const numericScore = Number(score)
  const isLowRating = numericScore === 1 || numericScore === 2
  const hasReasonId = reasonId != null && String(reasonId).trim() !== ''
  const selectedReason =
    hasReasonId && Array.isArray(reasons)
      ? reasons.find((item) => String(item.id) === String(reasonId)) || null
      : null
  const isOtherReason =
    isLowRating && (isOtherFairPlayReason(selectedReason) || String(reasonId).trim() === '4')
  const trimmedComment = String(comment || '').trim()

  if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 5) {
    return {
      valid: false,
      error: 'Vui lòng chấm điểm sao từ 1 đến 5 sao!',
      isLowRating,
      isOtherReason,
    }
  }

  if (isLowRating && !hasReasonId) {
    return {
      valid: false,
      error: 'Vui lòng chọn lý do khi đánh giá 1 - 2 sao!',
      isLowRating,
      isOtherReason,
    }
  }

  // Nhận xét chỉ bắt buộc khi chọn Lý do "Khác" (BE trả 400 nếu thiếu); 3 - 5 sao và các lý do khác không bắt buộc.
  if (isOtherReason && !hasTextLetters(trimmedComment)) {
    return {
      valid: false,
      error: 'Khi chọn Lý do 4 (Khác), ô Nhận xét bắt buộc phải nhập chữ!',
      isLowRating,
      isOtherReason,
    }
  }

  if (isOtherReason && trimmedComment.length < 10) {
    return {
      valid: false,
      error: 'Khi chọn Lý do 4 (Khác), vui lòng nhập nhận xét bằng chữ tối thiểu 10 ký tự!',
      isLowRating,
      isOtherReason,
    }
  }

  return {
    valid: true,
    error: '',
    isLowRating,
    isOtherReason,
    selectedReason,
    reasonId: isLowRating ? reasonId : null,
    comment: trimmedComment,
  }
}
