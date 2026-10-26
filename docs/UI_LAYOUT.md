# Khung giao diện dùng chung (Player · Chủ sân · Admin)

Cả 3 role dùng cùng một khung: sidebar 260px, thanh trên 60px, footer, thẻ tiêu đề trang.

| Thành phần | File | Dùng ở |
|---|---|---|
| Biến màu, kích thước, class `snx-*` | `src/styles/app-shell.css` | Mọi role |
| `AppSidebar`, `SidebarNav`, `AppTopbar`, `UserMenu`, `AppFooter`, `PageHeader` | `src/components/layout/AppShell.jsx` | Player, Chủ sân (Admin dùng `AppFooter`) |
| Sidebar & header Admin | `src/Admin/Layout/*` + `src/Admin/styles/admin-layout.css` (khối "Đồng bộ khung") | Admin |

## Quy ước cho trang mới

```jsx
import { PageHeader } from '../../components/layout/AppShell.jsx'

export default function MyPage() {
  return (
    <div className="snx-page">
      <PageHeader
        eyebrow="Nhãn nhỏ"
        eyebrowIcon="emoji_events"
        title="Tên trang"
        subtitle="Mô tả ngắn"
        actions={<button>…</button>}
      />
      {/* nội dung */}
    </div>
  )
}
```

- `snx-page`: lề 24px trên, 28px hai bên (16/12px trên điện thoại). Trang dạng form hẹp thêm `snx-page--narrow` (tối đa 1160px).
- Tiêu đề trang: font Outfit, 28px, đậm 800 (`snx-page-title`). Admin dùng `.admin-page-header` cùng kiểu.
- Tên trang trên thanh trên: Player sửa trong `PAGE_TITLES` (`src/Player/Layout/TopBar.jsx`), Chủ sân trong `getCurrentPageTitle` (`CourtOwnerLayout.jsx`), Admin lấy từ `adminMenu.js`.
- Thêm mục menu: Player `navItems` trong `TopSideBar.jsx`, Chủ sân `navItems` trong `CourtOwnerLayout.jsx`, Admin `adminMenu.js`.
