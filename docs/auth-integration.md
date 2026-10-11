# Báo cáo tích hợp Authentication SportNexus

## 1. Chức năng đã triển khai

- Client Axios dùng chung, cấu hình URL qua biến môi trường, timeout 30 giây, tự gắn Bearer token cho request được xác thực.
- API Authentication tách khỏi React và trạng thái phiên; không tạo module rỗng cho các nghiệp vụ khác.
- Login gọi backend, đọc `data.token` và `data.role`, kiểm tra JWT, chỉ cập nhật phiên sau thành công; chặn gửi lặp, hiển thị loading và lỗi.
- Register thu thập đủ năm trường, kiểm tra bắt buộc/email/xác nhận mật khẩu/điều khoản, hiển thị lỗi tại trường. Chỉ chuyển Login khi đăng ký thành công, không tự đăng nhập.
- Sonner được mount một lần ở root, hỗ trợ success/error/warning/info, đóng tự động và thủ công.
- AuthContext quản lý token, role, login/logout; khôi phục phiên khi refresh, xóa token hết hạn/sai định dạng và khi API được bảo vệ trả 401.
- Bảo vệ onboarding, Player và Admin theo mapping vai trò được cấu hình; giữ nguyên tên route và giao diện hiện có.
- Logout của Profile và AdminSidebar xóa phiên thật.

## 2. File mới

| Đường dẫn | Mục đích |
| --- | --- |
| `src/api/apiClient.js` | Axios chung, Bearer và chuẩn hóa lỗi HTTP/network/timeout. |
| `src/api/auth/authApi.js` | `registerUser`, `loginUser`, `registerAdmin`, kiểm tra response và lọc payload. |
| `src/context/AuthContext.jsx` | Provider trạng thái xác thực và thời hạn phiên. |
| `src/context/authContext.js` | Context và hook `useAuth`, tách để tương thích Fast Refresh. |
| `src/context/authSession.js` | Kiểm tra thời hạn JWT, lưu/khôi phục phiên. |
| `src/components/common/ToastProvider.jsx` | Toast dùng chung với phong cách SportNexus. |
| `src/Auth/ProtectedRoute.jsx` | Chặn truy cập khi chưa đăng nhập hoặc sai mapping. |
| `src/Auth/roleRoutes.js` | Mapping chính xác role backend sang route hiện có. |
| `.env.example` | Mẫu cấu hình API và mapping role. |
| `.env.local` | Cấu hình chạy local; được Git bỏ qua qua quy tắc `*.local`. |
| `tests/auth-integration.test.mjs` | Sáu bài kiểm tra hợp đồng API và phiên, không gọi backend thật. |
| `docs/auth-integration.md` | Báo cáo và các giới hạn triển khai. |

## 3. File đã sửa

| Đường dẫn | Thay đổi |
| --- | --- |
| `src/Auth/Login.jsx` | Thay navigation giả bằng API, username, validation, loading, toast và cập nhật phiên. |
| `src/Auth/Register.jsx` | API đăng ký, thêm username, validation theo trường, loading và toast. |
| `src/App.jsx` | Bọc route hiện có bằng bảo vệ xác thực/vai trò. |
| `src/main.jsx` | Mount AuthProvider và ToastProvider một lần. |
| `src/Player/Initialization & Profile/Profile.jsx` | Logout xóa token và trạng thái phiên. |
| `src/Admin/Layout/AdminSidebar.jsx` | Kích hoạt logout thật. |
| `package.json` | Axios, Sonner và lệnh `test:auth`. |
| `package-lock.json` | Khóa dependency tương ứng. |

## 4. API đã tích hợp

- `POST /api/auth/register`: gửi đúng `username`, `password`, `fullName`, `phone`, `email`; bỏ các trường frontend như confirmPassword, môn thể thao và điều khoản. Không gắn Authorization.
- `POST /api/auth/login`: gửi username/password, không gắn Authorization; kiểm tra envelope và lấy token/role từ phần data.
- `POST /api/auth/register-admin`: hàm dành cho workflow quản lý, sử dụng Bearer khi có phiên. Không có trang, route hay nút đăng ký Admin công khai; chưa có workflow quản lý phù hợp để gắn vào UI.
- Lỗi 400/401/403/404/409/500, timeout/network và response bất thường được xử lý; API không tự phát toast nên tránh thông báo lặp.

Đã đọc Swagger trực tiếp ngày 10/10/2026: <https://sep490-sportnexus-be.onrender.com/swagger/v1/swagger.json>. Schema xác nhận request fields, nhưng không có role enum hoặc response schema đủ để xác minh role/verification. Không có endpoint xác minh tài khoản trong nhóm auth được công bố; Register hiện chuyển về Login theo hợp đồng được cung cấp. Các trang ForgotPassword/VerifyAccount/ResetPassword hiện có được giữ lại, chưa tích hợp API ngoài phạm vi này.

## 5. Kiểm thử

- `npm.cmd run build`: đạt; Vite cảnh báo bundle lớn hơn 500 kB.
- `npm.cmd run test:auth`: 6/6 đạt. Kiểm tra payload, public headers, Bearer cho Admin API, envelope bất thường, duplicate response, HTTP lỗi, 401, timeout, JWT hết hạn, restore/logout và mapping role.
- Lint các file Authentication mới/thay đổi và root/AdminSidebar: đạt.
- `npm.cmd run lint`: 39 lỗi, 2 cảnh báo trong code có sẵn. Đã chạy ESLint trên các file của HEAD gốc và xác nhận cùng 39 lỗi, 2 cảnh báo; không refactor ngoài phạm vi.
- `git diff --check`: đạt.
- Backend thật: tải Swagger thành công; gửi login với tài khoản ngẫu nhiên không tồn tại, nhận HTTP 401. Không tạo tài khoản Player/Admin, không test đăng ký thành công hoặc trùng tài khoản thật.
- Kiểm tra `.env.local` bị Git bỏ qua; không lưu credentials/token thật vào repository.
- Chưa kiểm thử tương tác bằng trình duyệt: hiển thị toast/layout, loading, các trang sau đăng nhập và refresh/logout qua UI. Các trang hiện có biên dịch thành công nhưng điều đó không thay thế kiểm thử render.

## 6. Vấn đề còn lại và cấu hình

**Chưa xác minh role:** không tự đặt tên role. `VITE_AUTH_ROLE_ROUTES={}` mặc định nên đăng nhập thành công vẫn lưu phiên nhưng hiển thị cảnh báo và không mở trang hạn chế. Khi backend cung cấp tên role chính xác, đặt biến này thành JSON object ánh xạ tên đó tới `/dashboard` hoặc `/admin/dashboard`, rồi khởi động lại Vite. Court Owner chưa có dashboard riêng trong router hiện tại; cần xác nhận route và mapping trước khi tích hợp. Mapping là kiểm tra frontend, backend vẫn phải kiểm tra quyền cho mọi API.

**Register Admin:** Swagger không khai báo yêu cầu bảo mật tại operation và security cấp root không yêu cầu scheme. Đây là dấu hiệu cần kiểm tra backend, chưa chứng minh endpoint thực tế cho phép tạo Admin công khai. Không gọi endpoint này để tạo tài khoản thử nghiệm. Backend phải giới hạn thao tác này cho workflow có quyền phù hợp.

**Lưu token:** dùng sessionStorage vì hợp đồng trả JWT Bearer và chưa thấy hỗ trợ cookie HttpOnly. Phiên tồn tại khi refresh trong tab, không chủ động lưu lâu dài bằng localStorage. JavaScript/XSS có thể đọc sessionStorage; cần phòng XSS và tránh tải script không tin cậy. Kiểm tra JWT phía frontend chỉ đọc cấu trúc/exp/nbf, không xác minh chữ ký; backend là nơi xác minh tính hợp lệ và quyền. Không triển khai refresh token hoặc logout server khi chưa có API hỗ trợ.

**Dependency:** `npm audit` báo một lỗi high tại dependency gián tiếp `source-map-js`; cần xử lý trong đợt bảo trì dependency. Không tự cập nhật dependency ngoài phạm vi Authentication.

**Thông tin cần backend:** role values chính xác; tài khoản thử nghiệm được cấp phép; quy trình xác minh tài khoản nếu có; quyền register-admin; các API khôi phục mật khẩu/xác minh/logout hoặc refresh nếu được hỗ trợ.
