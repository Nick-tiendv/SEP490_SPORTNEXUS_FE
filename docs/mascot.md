# Mascot thông báo nổi (cóc thể thao)

Có 5 con cóc theo môn: bóng đá, cầu lông, bóng rổ, pickleball, tennis. **Mỗi phiên mở tab chọn ngẫu nhiên 1 con** (lưu ở sessionStorage `snx.mascot.asset`), giữ nguyên khi F5 và chuyển trang, đóng tab mở lại thì chọn con khác. Thêm `?mascot=tennis` (hoặc `football`, `badminton`, `basketball`, `pickleball`) vào URL để chọn đúng con khi thử.

Cóc chạy vòng quanh màn hình ở phía Người chơi và Chủ sân. Có thông báo mới thì chạy về góc phải dưới, nhảy, vẫy tay và hiện bong bóng. Bấm vào bong bóng sẽ mở danh sách thông báo ở chuông.

## Hành vi

| Thao tác | Kết quả |
|---|---|
| Mới vào web | Chạy vòng vòng: mỗi chặng 3–6 giây, thỉnh thoảng đứng nghỉ 1–3 giây |
| Có thông báo mới | Chạy về góc, nhảy và hiện bong bóng. Bong bóng tự ẩn sau 5 giây. Nhiều thông báo thì hiện lần lượt |
| Bấm vào cóc | Câu chào theo vai trò, theo môn của con đang hiện và buổi trong ngày, kèm nút "Ẩn cóc" |
| Kéo lần 1 | Cóc bị dời chỗ, nhắc "kéo nữa là dỗi", rồi chạy tiếp |
| Kéo lần 2 | Đứng yên tại chỗ thả và **dỗi**: khoanh tay (cất vợt), mày nhíu, có dấu giận. Lưu vào localStorage, tải lại trang vẫn dỗi |
| Bấm vào cóc đang dỗi | Nút "Dỗ dành 🍬" giúp cóc hết giận và chạy lại |
| Ẩn cóc | Góc trái dưới còn nút 🐸 để hiện lại. Lựa chọn được lưu vào localStorage |
| Hệ điều hành bật giảm chuyển động | Đứng yên ở góc, vẫn hiện bong bóng |

Khi đang dỗi mà có thông báo, cóc báo ngay tại chỗ đang đứng, không chạy về góc.

## File

- `src/components/mascot/FloatingMascot.jsx`: component, gắn trong `Player/Layout/PlayerLayout.jsx` và `CourtOwner/Layout/CourtOwnerLayout.jsx`.
- `src/components/mascot/mascotDirector.js`: máy trạng thái (chạy, nghỉ, báo, kéo, dỗi). Là JS thuần, có test ở `tests/floating-mascot.test.mjs`.
- `src/components/mascot/mascotConfig.js`: **chỗ duy nhất cần sửa** để đổi danh sách mascot (`MASCOT_ASSETS`), kích thước, nhịp chạy, góc đứng và câu thoại (theo vai trò và theo môn).
- `src/components/mascot/MascotToad.jsx`: cóc SVG dùng chung 1 bộ khung + 5 bộ đồ (`KITS`: áo, quần, mũ / băng đô, băng cổ tay, vật cầm tay, vật dưới chân). Chân, tay, vật dưới chân tách riêng để animation; vợt nằm trong tay phải nên vung theo tay.
- `src/components/mascot/MascotFigure.jsx`: chọn cách vẽ theo kiểu: cóc SVG, ảnh tĩnh hoặc sprite sheet.
- `src/components/mascot/useMascotNotification.js`: nguồn thông báo của mascot.
- `public/mascot/toad-*.svg`: bản SVG gốc của từng con (để tham khảo hoặc dùng ở chế độ ảnh tĩnh).

## Đổi ảnh mascot

Thêm 1 phần tử vào `MASCOT_ASSETS` trong `mascotConfig.js` (bỏ phần tử nào thì con đó không còn được chọn):

```js
// Cóc SVG theo môn mới: thêm bộ đồ vào KITS trong MascotToad.jsx rồi khai báo
{ key: 'volleyball', type: 'svg', kit: 'volleyball', sport: 'volleyball' },

// Ảnh tĩnh trong public/mascot/ (nảy, lắc bằng CSS)
{ key: 'volleyball', type: 'image', src: '/mascot/toad-volleyball.png', sport: 'volleyball' },

// Sprite sheet: mỗi hàng 1 trạng thái, mỗi cột 1 khung
{
  key: 'robot', type: 'sprite', src: '/mascot/sheet.png', columns: 8, rows: 4,
  states: { run: { row: 0, frames: 8, fps: 14 }, idle: { row: 1, frames: 4, fps: 6 }, jump: { row: 2, frames: 6, fps: 12 }, sulk: { row: 3, frames: 4, fps: 6 } },
},
```

Câu chào riêng của môn: thêm vào `SPORT_LINES`. Ảnh không vuông thì sửa thêm `MASCOT_CONFIG.size`.

## Nguồn thông báo

Hiện chưa có realtime (SignalR, WebSocket). Mascot **không gọi API riêng**: `NotificationBell` kiểm tra `unread-count` 15 giây một lần (tab đang mở), số đổi thì tải lại `GET /api/v1/notifications`, và sau mỗi lần tải phát sự kiện `snx:notifications-synced`, và mascot so sánh id để tìm thông báo chưa đọc mới. Lần tải đầu sau khi vào trang hoặc đăng nhập lại: cóc báo từng thông báo chưa đọc trong 15 phút gần nhất (tối đa 3 cái); không có thì báo "Bạn có N thông báo chưa đọc", một lần cho mỗi phiên đăng nhập. Thông báo đã báo được nhớ theo id trong phiên tab nên F5 không báo lại. Bấm bong bóng thì phát `snx:open-notifications` để chuông mở danh sách (tên sự kiện ở `mascotEvents.js`).

Khi BE có realtime: trong `useMascotNotification.js`, nhận sự kiện từ hub rồi gọi `cbRef.current([{ id, title, message }])`.

## Thử nhanh

Mở bất kỳ trang Người chơi / Chủ sân với `?mascotDemo=1`: sau 2,5 giây có 3 thông báo giả liên tiếp, và góc trái dưới có nút "🔔 Thử thông báo" để bắn thêm. Muốn xóa trạng thái dỗi hoặc ẩn: xóa key `snx.mascot` trong localStorage.

## Lưu ý

- `z-index: 35`: dưới thanh trên cùng (40), lớp phủ menu (45), sidebar (50) và mọi modal.
- Vùng bao quanh cóc không nhận chuột. Riêng thân cóc nhận chuột để kéo được cả khi đang chạy, nên chỉ chặn đúng phần nhỏ dưới thân cóc.
