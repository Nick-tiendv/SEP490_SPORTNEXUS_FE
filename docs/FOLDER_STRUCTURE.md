# Cấu trúc thư mục `src`

Code được chia theo **role → chức năng (trang)**. Tên thư mục và file không dùng dấu cách, `&` hay tiếng Việt có dấu.

```
src/
├── App.jsx, main.jsx          Router và điểm khởi chạy
├── Auth/                      Đăng nhập, đăng ký, quên mật khẩu, ProtectedRoute
├── context/                   AuthContext, session
├── components/common/         Component dùng chung mọi role
│
├── Player/                    Role Player (User)
│   ├── Layout/                PlayerLayout, TopBar, TopSideBar, PlayerFooter, NotificationBell
│   ├── Context/               SportContext
│   ├── Home/                  Dashboard (trang chủ)
│   ├── Booking/
│   │   ├── FindCourt/         MapBooking, InteractiveCourtMap  (/court-finder)
│   │   ├── CourtDetail/       CourtDetails                     (/court)
│   │   ├── Payment/           SplitPayment                     (/split-payment)
│   │   └── AIChat/            AIChatBooking, AIChatModal       (/ai-chat)
│   ├── CheckIn/               CheckInQR, LiveQRPass            (/qr-pass, /check-in, /live-qr)
│   ├── LFG/                   CommunityFeed, CreateMatch, FlashClaim
│   ├── Tournament/            TournamentList
│   ├── Wallet/                WalletEscrow, DepositSuccess, DepositCancel
│   ├── Rating/                PostMatchRating
│   └── Profile/               Profile, OnBoarding
│
├── CourtOwner/                Role Chủ sân
│   ├── Layout/                CourtOwnerLayout, ownerContext
│   ├── Dashboard/             Dashboard
│   ├── Profile/               CourtOwnerProfile (hồ sơ + KYC)
│   ├── Courts/                CourtManage
│   ├── CheckIn/               CheckQR
│   ├── Schedule/              BookingSchedule
│   ├── Tournament/            CreateTournament
│   └── Settlement/            Settlement
│
├── Admin/                     Role Admin, mỗi chức năng một thư mục:
│   └── <Feature>/             XxxManagement (trang list), XxxDetails, XxxDialogs (thêm/sửa/xoá),
│                              XxxTable, xxxData.js (helper), xxx.css
│
└── api/
    ├── apiClient.js           Axios + token
    ├── auth/                  API đăng nhập / đăng ký
    ├── player/                API phía Player
    ├── owner/                 API phía Chủ sân (import qua '../api/owner')
    └── admin/                 API phía Admin
```

## Quy ước khi thêm trang mới

- Đặt trang vào `src/<Role>/<Chức năng>/`. Nếu chức năng có nhiều màn hình thì tách thư mục con, ví dụ `Player/Booking/Payment/`.
- Trong một chức năng, tách file theo vai trò giống phần Admin: `XxxManagement.jsx` (danh sách), `XxxDetails.jsx` (xem chi tiết), `XxxDialogs.jsx` (form thêm/sửa/xoá), `xxxData.js` (hàm xử lý dữ liệu).
- Hàm gọi API đặt trong `src/api/<role>/`, không gọi `apiClient` trực tiếp trong trang.
- Không dùng dấu cách, `&` hay dấu tiếng Việt trong tên file và thư mục.
