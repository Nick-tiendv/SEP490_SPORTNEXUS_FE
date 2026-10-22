# Báo cáo nối API & bỏ code cứng (nhánh `feature/connect-api`)

Nhánh tạo từ `feature/restructure-folders` (cấu trúc thư mục mới). Chỉ sửa phía FE, không đổi backend.

## 1. Thành phần dùng chung mới

| File | Dùng để |
|---|---|
| `src/hooks/useApi.js` | Gọi API khi mở trang: trả `{ data, loading, error, refresh }`, tự bỏ kết quả trả về muộn |
| `src/hooks/useCurrentUser.js` | Người dùng đang đăng nhập (`GET /api/auth/me` + `GET /api/v1/fair-play/me`), gọi 1 lần cho cả app; `initialsOf()` |
| `src/api/player/profileApi.js` | `/api/auth/me`, `/me/avatar`, `/change-password`, `/logout`, `/me/sports`, `/master-data/sports` |
| `src/api/player/notificationApi.js` | 10 API `/api/v1/notifications/*` |
| `src/api/admin/notificationApi.js` | `/api/v1/admin/notifications/broadcast(s)`, `/statistics` |

## 2. Lỗi đã sửa

| Lỗi | File | Cách sửa |
|---|---|---|
| Đặt sân dùng **mã ca / mã sân cứng** (`ba2a7900…`, `f4d8b134…`) khi không có ca thật, có thể đặt nhầm sân | `MapBooking.jsx`, `SplitPayment.jsx`, `AIChatBooking.jsx`, `AIChatModal.jsx`, `CreateMatch.jsx` | Bỏ hết mã cứng. Không có ca thật thì báo lỗi / đưa về bản đồ chọn ca |
| SplitPayment **tự đổi sang ca khác** khi ca đã chọn hết chỗ | `SplitPayment.jsx` | Chỉ kiểm tra ca đã chọn; nếu hết chỗ thì báo và không cho đặt |
| Số dư ví **tự cộng/trừ trong localStorage** (mặc định 2.450.000đ giả) | SplitPayment, CommunityFeed, CreateMatch, FlashClaim, TopBar, TournamentList, CheckInQR | Sau mỗi thao tác gọi lại `GET /api/v1/wallet`; mặc định 0 |
| Tạo kèo LFG **báo thành công dù API lỗi** | `CreateMatch.jsx` | Lỗi API thì hiện lỗi, không lưu kèo giả |
| Vé QR dùng **mã ca làm mã đơn**, trộn dữ liệu vé mẫu | `CheckInQR.jsx` | Lấy mã đơn từ URL / đơn vừa đặt / `GET /bookings/upcoming`; bỏ vé mẫu; có màn "Chưa có vé" |
| Log **mật khẩu, token** ra console (cả production) | `apiClient.js`, `ResetPassword.jsx` | Chỉ log khi dev, ẩn body các API đăng nhập / mật khẩu |
| Đăng xuất Player không gọi API | `Profile.jsx` | Gọi `POST /api/auth/logout` |
| Mã QR vé gửi sang trang ngoài `api.qrserver.com` | `Home/Dashboard.jsx` | Tạo QR ngay trên trình duyệt bằng `qrcode.react` |

## 3. API đã nối thêm

| Trang | API |
|---|---|
| Auth / Quên mật khẩu → OTP → Đặt lại | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` (OTP được BE kiểm tra ở bước đặt lại) |
| Player / Hồ sơ | `GET/PUT /api/auth/me`, `GET/PUT /api/auth/me/sports`, `GET /api/v1/master-data/sports`, `GET /api/v1/fair-play/me`, `GET /api/v1/bookings/my-bookings`, `POST /api/auth/logout` |
| Player / Onboarding | `GET /api/v1/master-data/sports`, `PUT /api/auth/me/sports` |
| Player / Giải đấu (viết lại trang) | `GET /tournaments/search`, `GET /tournaments/{id}`, `GET /tournaments/my-registrations`, `POST /tournaments/{id}/join`, `POST /tournaments/{id}/cancel`, `GET /teams/my-teams` |
| Player / Chuông thông báo | `GET /notifications`, `PUT /{id}/read`, `PUT /read-all`, `DELETE /notifications` |
| Player / Trang chủ | `GET /bookings/upcoming`, `GET /lfgs` (bỏ 3 mảng dữ liệu mẫu) |
| Player / LFG bảng tin | `GET /lfgs` (trước đó import nhưng không gọi, hiện dữ liệu mẫu) |
| Player / Ví – rút tiền | `GET/PUT /wallet/bank-account`, `POST/GET /wallet/withdrawals` (trước đó chỉ ghi localStorage) |
| Player / Thanh toán | `GET /bookings/upcoming` (helper mới), lưu mã đơn vừa tạo cho trang vé QR |
| Admin / Thông báo (viết lại trang) | `GET /admin/notifications/broadcasts`, `POST /broadcast`, `DELETE /broadcasts/{id}`, `GET /statistics` |

## 4. Code cứng đã bỏ

- Danh sách ~1.000 dòng sân giả `COURTS` trong `MapBooking.jsx` (giờ chỉ hiện sân từ API).
- Tên/handle mẫu "Minh Minh Minh", "@minhminhminh", "MMM" (TopBar, trang chủ, hồ sơ, thanh toán, LFG) → lấy từ `/api/auth/me`.
- Điểm "★ 4.9" trên TopBar → điểm Fair Play thật.
- Bạn chơi mẫu (3 người) trong chia tiền, kèo mẫu trong "Kèo của tôi" / "Đã tham gia", đánh giá mẫu, sân yêu thích mẫu, thông báo mẫu.
- Số tài khoản / tên chủ tài khoản mẫu ở form rút tiền → lấy từ `bank-account`.

## 5. Kiểm tra

- `npm run build`: chạy được.
- `npm run test:auth`: 10/10 pass. `tests/notification-management.test.mjs`: 15/15 (đã sửa phần kiểm tra giao diện trang Thông báo cho trang mới).
- ESLint toàn `src`: 166 → 150 vấn đề; không có lỗi mới (các lỗi còn lại đã có từ trước).
- Mở thử trên trình duyệt bằng phiên mock dev (API bị chặn có chủ đích): Trang chủ, Hồ sơ, Giải đấu, LFG, Vé QR, Tìm sân, Ví, Quên mật khẩu, Admin Thông báo đều hiển thị, không lỗi React.
- **Chưa kiểm tra với tài khoản thật** vì cần JWT thật: nên đăng nhập thử từng luồng ở mục 3.

## 6. Đối chiếu với `SEP490_SPORTNEXUS_BE/docs/API_RESPONSES.md`

Đã sửa FE cho khớp tài liệu response của BE:

| API | Sai trước đó | Đã sửa |
|---|---|---|
| `PUT /api/auth/me/sports` | Gửi `skillLevel` tiếng Việt | Gửi enum `BEGINNER / INTERMEDIATE / ADVANCED / PROFESSIONAL`, hiển thị lại nhãn tiếng Việt |
| `GET /api/v1/fair-play/me` | Đọc `score` | Đọc `fairPlayScore`, `averageRating`, `ratingCount` |
| `GET /api/auth/me` | Gọi thêm fair-play để lấy điểm | Dùng `fairPlayScore` có sẵn trong `/me` |
| `POST /admin/notifications/broadcast` | `target` = Player/CourtOwner | `ALL / PLAYER / OWNER / USERS` |
| `GET /admin/notifications/broadcasts`, `/statistics` | Trạng thái, field thống kê đoán | `SCHEDULED / SENT / CANCELLED / RECALLED`; `totalSent, totalRead, readRate, broadcastsSent, broadcastsScheduled` |
| `GET /api/v1/notifications` | Đọc `message`, `link` | Đọc `body`, mở màn hình theo `referenceType + referenceId`; nhóm theo `type` của BE |
| `DELETE /api/v1/notifications` | Hiểu là xóa tất cả | BE chỉ xóa thông báo **đã đọc** |
| `GET /api/v1/lfgs` | Đọc `currentSlots` | Tính từ `totalSlots - remainingSlots` |
| `GET /api/v1/tournaments/{id}` | Coi là object | BE trả **mảng**; lấy giải mẹ kèm `children` |
| `GET /tournaments/my-registrations` | Đọc `id`, `name` | Đọc `tournamentId`, `tournamentName`, `parentTournamentId`, `paymentStatus`, `tournamentStatus`, `qrCode` |
| `GET /bookings/{id}/qr-ticket` | Coi là object | BE trả **chuỗi** mã QR; thông tin sân lấy từ `GET /bookings/{id}` |
| `GET /bookings/upcoming`, `my-bookings` | `id` | `bookingId`, `bookingStatus` |
| Hủy vé (hoàn tiền 24h) | Giờ trận cứng 19:30 | Dùng `startTime` thật của đơn |

Còn cần BE xác nhận: `forgot-password` gửi OTP cho cả email nhưng `reset-password` chỉ nhận `phone` → FE đang yêu cầu nhập số điện thoại.

## 7. Còn lại (chưa làm trong nhánh này)

- Trang mới chưa có: Đội (Team), Bảng tin Community (bài viết, bình luận), Đánh giá sân, Khiếu nại (Player & Chủ sân), Danh mục môn/tiện ích, Khuyến mãi (Admin).
- AI Chat vẫn trả lời bằng logic trong code (`/api/v1/ai/*` chưa nối).
- Phần hình ảnh / huy hiệu / thống kê thắng-thua trong Hồ sơ vẫn là giao diện tĩnh (BE chưa có API tương ứng).
- `src/api/player/withdrawApi.js` (mock localStorage) chỉ còn hằng số được dùng; `Admin/Payments/PlayerWithdrawalApproval.jsx` không còn trang nào dùng.
