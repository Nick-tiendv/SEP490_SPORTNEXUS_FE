# Test nhanh luồng giải đấu (~15 phút)

Luật thật của giải (bắt đầu sau 2 ngày, hạn đăng ký trước 48 giờ, khóa hủy 24 giờ trước hạn) khiến test trọn luồng mất vài ngày. Chế độ test nới các luật **phía FE** để chạy hết luồng trong một buổi.

## Bật / tắt

1. Thêm vào `.env.local` (file này không commit):
   ```
   VITE_TOURNAMENT_TEST_RULES=true
   ```
2. Khởi động lại `npm run dev` (Vite chỉ đọc biến môi trường lúc khởi động).
3. Mở form tạo giải: thấy dải vàng **"Chế độ test"** là đã bật.

Tắt: xóa dòng trên (hoặc đặt `false`) rồi khởi động lại `npm run dev`. **Nhớ tắt trước buổi demo / bảo vệ.**

Chế độ chỉ có tác dụng khi chạy `npm run dev`. Bản `npm run build` và `npm test` luôn dùng luật thật, kể cả khi lỡ để biến này.

## Chế độ test đổi gì

| Luật | Luật thật | Chế độ test |
|---|---|---|
| Ngày bắt đầu sớm nhất | Hôm nay + 2 ngày | Ngày mai |
| Hạn đăng ký | Trước ngày bắt đầu ≥ 48 giờ, gửi BE dạng ngày | Trước ngày bắt đầu, gửi BE lúc **23:59** ngày đã chọn (để còn mở đăng ký trong ngày) |
| BTC hủy giải | Khóa từ 24 giờ trước hạn đăng ký | Hủy lúc nào cũng được |

Mã nằm ở `src/CourtOwner/Tournament/tournamentRules.js` (`TEST_RULES`). Luật thời gian mới thêm sau này cũng viết ở đó nếu cần nới khi test.

Các mốc do **BE** quyết thì chế độ này không đổi được:

- Khiếu nại trận: trong 15 phút sau khi trận có kết quả → khiếu nại ngay sau khi nhập tỉ số.
- Chuyển Admin: được ngay sau khi BTC quyết định (chỉ nhánh "BTC quá 24 giờ chưa xử lý" phải chờ).
- Elo: tính sau khi hết hạn khiếu nại + lần chạy job tiếp theo (~15–20 phút). Muốn thấy nhanh: nhờ BE giảm `matchComplaintMinutes` trên môi trường test.
- Thiếu người khi hết hạn đăng ký (hủy / gia hạn / vẫn đấu): phải chờ qua hạn đăng ký → test riêng.

## Chuẩn bị

5 tài khoản, mỗi tài khoản một cửa sổ trình duyệt riêng (Chrome profile hoặc cửa sổ ẩn danh khác nhau):

| Vai | Ghi chú |
|---|---|
| Admin | Duyệt giải, phân xử khiếu nại |
| BTC | Người chơi tổ chức giải (đủ Fair Play) hoặc chủ sân |
| Trọng tài | Tài khoản người chơi, **không** thi đấu trong giải |
| Người chơi A, B | Đã làm khảo sát môn của giải, ví đủ lệ phí |

Đặt tên giải có tiền tố **`[TEST]`**: BE dùng chung nên giải test hiện với mọi người.

## Kịch bản

1. **BTC tạo giải** (Giải đấu & Đội → Giải tôi tổ chức → Tạo giải): ngày bắt đầu = ngày mai, hạn đăng ký = hôm nay, thể thức Loại trực tiếp, tối đa 4, tải 1 file PDF, thêm 1 dòng lịch sân. → Báo "chờ Admin duyệt".
2. **Admin duyệt**: Quản lý giải đấu → nút **Chờ duyệt** → mở giải → Duyệt giải. (Cần BE đã bỏ bước chủ sân duyệt `PENDING_OWNER`.)
3. **A và B đăng ký** giải (tab Đang mở đăng ký).
4. **BTC thêm trọng tài**: panel quản lý giải → Nhân sự giải → vai trò Trọng tài → nhập số điện thoại → **Tìm** → Thêm nhân sự.
5. **BTC chốt danh sách & sinh nhánh**, rồi phân trọng tài cho trận ở bảng "Xếp sân & trọng tài".
6. **Trọng tài nhập tỉ số**: tab **Trận tôi làm trọng tài** → Nhập tỉ số.
7. **Người thua khiếu nại** ngay: chi tiết giải → trận → Khiếu nại kết quả.
8. **BTC xử lý**: panel quản lý giải → Khiếu nại kết quả trận → Giữ kết quả (nhập lý do).
9. **Người thua chuyển Admin**: Hồ sơ → Trung tâm hỗ trợ → Khiếu nại của tôi → **Không đồng ý, chuyển Admin**.
10. **Admin phân xử**: Đánh giá & Báo cáo → nút **Khiếu nại trận** → dòng có nhãn "Chờ Admin phân xử" → xem biên bản trọng tài / quyết định BTC / lý do chuyển → **Khiếu nại đúng**, **Bác, giữ kết quả** hoặc **Sửa tỉ số & đóng**.

Thử thêm nếu còn thời gian: BTC bấm "Sửa tỉ số & đóng" ở bước 8; trọng tài sửa tỉ số trận đã xong; BTC hủy giải (hoàn lệ phí).

## Cần kiểm tra lần đầu chạy

- BE có cho sinh sơ đồ khi chưa qua hạn đăng ký không (tài liệu BE không ghi).
- BE có cho nhập tỉ số trước giờ bắt đầu giải không.

Lỗi thì ghi lại `message` BE trả (toast) và request trong DevTools → Network.
