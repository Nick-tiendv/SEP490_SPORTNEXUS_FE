# SportNexus Frontend

Frontend application for the **SportNexus** graduation project.

SportNexus is a sports court discovery, booking, payment, wallet, LFG, and AI-assisted sports platform.

## Project

- **Project:** SportNexus
- **Frontend:** React 19 + Vite 8, React Router 7
- **Backend:** C# ASP.NET Core (.NET 10), repo `SEP490_SPORTNEXUS_BE`
- **Database:** PostgreSQL (Entity Framework Core + Npgsql)
- **API documentation:** Swagger và `docs/API_RESPONSES.md` của backend
- **UI Design:** Figma

## Frontend Repository

`https://github.com/Nick-tiendv/SEP490_SPORTNEXUS_FE.git`

## Tech Stack

- React 19, React Router 7, Vite 8
- Axios (`src/api/apiClient.js`: gắn token, làm mới token, chuẩn hóa lỗi)
- Tailwind CSS 3 (build qua PostCSS, cấu hình ở `tailwind.config.js`)
- CSS dùng chung: `src/styles/app-shell.css`, `src/styles/ui-kit.css`; Admin: `src/Admin/styles/`
- sonner (thông báo), lucide-react + Material Symbols (icon)
- Leaflet (bản đồ tìm sân), qrcode.react + jsqr (vé QR)

## Environment

Tạo file `.env` từ `.env.example`:

```text
VITE_API_BASE_URL=https://sep490-sportnexus-be.onrender.com
VITE_ALLOW_MOCK_AUTH=false
```

## Scripts

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production vào `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Chạy toàn bộ test trong `tests/` |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Nick-tiendv/SEP490_SPORTNEXUS_FE.git
```

### 2. Enter the project

```bash
cd SEP490_SPORTNEXUS_FE
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will display the local development URL in the terminal, normally something similar to:

```text
http://localhost:5173/
```

## Frontend Structure

Code được chia theo role (xem thêm `docs/FOLDER_STRUCTURE.md`):

```text
src/
├── Admin/        # trang quản trị (/admin/*)
├── CourtOwner/   # trang chủ sân (/owner/*)
├── Player/       # trang người chơi
├── Auth/         # đăng nhập, đăng ký, quên mật khẩu
├── api/          # mọi lời gọi API: admin/, owner/, player/, auth/
├── components/   # layout dùng chung (AppShell), ErrorBoundary, ProtectedRoute…
├── context/      # AuthContext (phiên đăng nhập)
├── hooks/        # useApi, useCurrentUser…
└── styles/       # app-shell.css, ui-kit.css, tailwind.css
```

## Main Features

### Player / User
- Search sports facilities and courts
- View court availability
- Book courts
- Make payments
- Use SportNexus Wallet
- Split booking costs when supported
- Create and join LFG activities
- Receive notifications/updates
- Use AI Assistant

### Court Owner
- Manage owner account
- Manage sports facilities
- Manage courts
- Manage court schedules
- Manage pricing
- Manage maintenance schedules
- Manage bookings

### AI Assistant
The AI Assistant is intended to support natural-language interactions for:
- Court search
- Court recommendations
- Booking
- LFG creation

## Functional Requirements

- **FE-01:** Search sports facilities and available courts based on sport type, location, date, and time.
- **FE-02:** Create individual/group bookings and split court fees through the SportNexus wallet.
- **FE-03:** Create/join LFG activities, claim available player slots, and receive updates/notifications.
- **FE-04:** Use an AI conversational assistant for court search, recommendations, booking, and LFG creation.
- **FE-05:** Manage Court Owner accounts, facilities, courts, booking time grids, pricing, and maintenance schedules.

## UI / Figma

The UI is designed in Figma.

When implementing a Figma screen:
- Keep the design close to the approved design.
- Reuse common components.
- Keep spacing, typography, colors, buttons, cards, and inputs consistent.
- Do not redesign without an explicit request.
- Support responsive layouts where required.

## Development Workflow

Before starting work:

```bash
git pull
```

After making changes:

```bash
git status
git add .
git commit -m "your message"
git push
```

When working with teammates, pull the latest changes before starting new work to reduce conflicts.

## AI / Codex Context

`SPORTNEXUS_CONTEXT.md` contains the shared project context used to help AI assistants such as Codex understand the project.

When making AI-assisted changes:
- Read `SPORTNEXUS_CONTEXT.md`.
- Follow the latest project requirements.
- Do not invent functionality.
- Keep changes focused on the requested task.

## Notes

This project is under active development. Requirements, UI designs, API contracts, and folder structures may change.

The latest explicit requirements from the development team take priority over older descriptions in this README.
