# Mock Authentication trong development

Luồng vẫn gọi `POST /api/auth/login` thật. Chỉ chấp nhận kết quả HTTP 200, `statusCode === 200`, token và role không rỗng. Không thay response backend, không có credentials hardcode và không chuyển lỗi login thành thành công.

Mock chỉ bật khi Vite đang development và `VITE_ALLOW_MOCK_AUTH` đúng chuỗi `true`. Format được nhận diện là ba phần: header base64url JSON có `alg: HS256`, `typ: JWT`, sau đó đúng `MockPayload.MockSignature`. Payload và signature placeholder không được decode thành JWT thật. Token khác format này vẫn phải qua kiểm tra JWT hiện có, gồm thời hạn exp và nbf.

Phiên mock có `isMockSession: true`, giữ role backend trả về. AuthProvider cho phép frontend navigation qua ProtectedRoute hiện có và hiện nhãn `DEV MODE – Mock Authentication`. Mọi request Axios không có `skipAuth: true` bị chặn trước khi dispatch khi phiên mock hoạt động, kể cả GET và các mutation. Lỗi mang mã `MOCK_AUTH_BLOCKED` và thông báo development; caller có thể dùng `toast.warning(error.message)`. Token mock không được gửi trong Authorization. Login/Register công khai vẫn gọi backend được, vì các endpoint này không cần phiên xác thực.

## Bật/tắt

`.env.example` mặc định `VITE_ALLOW_MOCK_AUTH=false`. `.env.local` hiện đã bật theo yêu cầu:

```ini
VITE_ALLOW_MOCK_AUTH=true
VITE_AUTH_ROLE_ROUTES={"Admin":"/admin/dashboard","Player":"/dashboard"}
```

Khởi động lại `npm.cmd run dev` sau khi sửa biến môi trường. `Admin` và `Player` lấy từ response backend người dùng cung cấp; `Player` mở `/dashboard`. Không thêm role Court Owner khi chưa xác minh. Không tạo route mới.

Để tắt, đặt `VITE_ALLOW_MOCK_AUTH=false`, khởi động lại Vite rồi đăng nhập bằng JWT thật. Phiên mock lưu trước đó sẽ bị loại bỏ khi khôi phục nếu cờ tắt hoặc đang production. Logout xóa cả trạng thái mock và sessionStorage. JWT thật vẫn đi qua luồng xác thực cũ, kể cả khi cờ mock đang bật. Production luôn từ chối mock bất kể giá trị cờ.

## File thay đổi

- `src/context/mockAuth.js`: file mới, cờ development và nhận diện token placeholder.
- `src/context/authSession.js`: tạo/kiểm tra/khôi phục phiên mock riêng biệt.
- `src/context/AuthContext.jsx`: quản lý marker, tránh decode/timer cho mock, chặn token reader và hiển thị nhãn DEV.
- `src/api/apiClient.js`: chặn request cần xác thực với phiên mock trước khi gửi mạng.
- `src/api/auth/authApi.js`: login yêu cầu chính xác HTTP/body status 200, token/role không chỉ gồm khoảng trắng.
- `src/Auth/Login.jsx`: hỗ trợ hiển thị warning cho lỗi mock bị chặn.
- `.env.example`, `.env.local`: cấu hình cờ; local ánh xạ Admin đã được cung cấp.
- `tests/auth-integration.test.mjs`: bổ sung kiểm tra mock, flags, production, routing, logout và chặn API.
- `docs/mock-auth-development.md`: tài liệu này.

`authContext.js`, `ProtectedRoute.jsx` và `roleRoutes.js` đã được kiểm tra và dùng lại; không thêm provider hay state xác thực song song.

## Kiểm thử và giới hạn

- `npm.cmd run test:auth`: 9/9 bài kiểm tra đạt, bao gồm mock development bật/tắt, production, token sai, role thiếu, HTTP lỗi, JWT thật, restore/logout, mapping Admin và chặn GET/POST/PUT/PATCH/DELETE/registerAdmin mà không dispatch.
- Build production đạt khi `.env.local` vẫn bật mock; Vite cảnh báo kích thước bundle lớn.
- Lint các file xác thực liên quan và `git diff --check`: đạt.
- Các response trong bài test là test adapter, không thay API runtime. Chưa đăng nhập backend thật với tài khoản được cấp hoặc kiểm tra điều hướng/nhãn bằng trình duyệt trong lần thay đổi này.
- Mock chỉ kiểm tra giao diện; không xác minh chữ ký hay quyền server. Backend phải tự kiểm tra JWT/quyền. sessionStorage vẫn đọc được bởi JavaScript; bảo vệ XSS vẫn cần thiết.
- Mọi API được bảo vệ phải dùng shared client và không tự đánh dấu `skipAuth: true`. Hiện chỉ Login/Register công khai dùng cờ này. Khi thêm API trong tương lai, giữ quy tắc đó để không bỏ qua chặn mock.
