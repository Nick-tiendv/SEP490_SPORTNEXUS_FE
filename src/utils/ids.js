// Tạo id tạm phía client (tin nhắn, thông báo nội bộ, dòng nháp…). Không dùng làm id gửi lên BE.
// Thêm bộ đếm để 2 lần gọi trong cùng 1 mili giây vẫn khác nhau.
let counter = 0
export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${(counter++).toString(36)}`

// Thời điểm hiện tại (ms). Gọi trong handler / effect, không gọi trực tiếp khi render.
export const nowMs = () => Date.now()
