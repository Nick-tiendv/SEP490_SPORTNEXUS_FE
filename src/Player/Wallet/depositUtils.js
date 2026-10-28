// Hàm tiện ích cho trang kết quả nạp tiền (tách khỏi component để Fast Refresh hoạt động)
export const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(Number(val) || 0)

/** Chỉ chấp nhận đường dẫn nội bộ (bắt đầu bằng "/" và không phải "//") để tránh open-redirect */
export const isSafeInternalPath = (path) => typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')

/**
 * Lấy màn cần quay lại sau khi nạp (vd: màn đặt sân) từ ngữ cảnh lệnh nạp đã lưu.
 * @returns {{path:string, state?:object, label?:string} | null}
 */
export function resolveReturnTarget(pending, orderCode) {
  if (!pending?.returnTo) return null
  if (orderCode && pending.orderCode && String(pending.orderCode) !== String(orderCode)) return null
  const rt = pending.returnTo
  return isSafeInternalPath(rt.path) ? rt : null
}

