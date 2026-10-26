// Hộp thoại xác nhận dùng chung thay cho window.confirm của trình duyệt.
// Dùng: if (!(await confirmDialog('Xóa bài viết này?'))) return
// Tùy chọn: { title, confirmLabel, cancelLabel, danger } (danger tự bật khi câu hỏi có Xóa / Hủy / Giải tán…).
let current = null
const listeners = new Set()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener) }
const snapshot = () => current

const DANGER = /xóa|xoá|hủy|huỷ|giải tán|rời|đóng|loại|khóa|cảnh báo|đăng xuất/i

export function confirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    current?.resolve(false) // chỉ mở 1 hộp thoại một lúc
    current = {
      message: String(message ?? ''),
      title: options.title || 'Xác nhận',
      confirmLabel: options.confirmLabel || 'Đồng ý',
      cancelLabel: options.cancelLabel || 'Hủy',
      danger: options.danger ?? DANGER.test(String(message)),
      resolve: (value) => { current = null; emit(); resolve(value) },
    }
    emit()
  })
}

export const subscribeConfirm = subscribe
export const confirmSnapshot = snapshot
