# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. Dự án SportNexus FE

React 19 + Vite 8 + React Router 7, Axios, Tailwind 3, sonner (toast), lucide-react + Material Symbols. Backend: repo `SEP490_SPORTNEXUS_BE` (ASP.NET Core). Giao diện và chú thích viết **tiếng Việt**.

### Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server |
| `npm run lint` | ESLint (phải sạch trước khi commit) |
| `npm run build` | Build production |
| `npm test` | Test Node trong `tests/` (phải pass trước khi commit) |

Xem trước giao diện: cấu hình `fe-dev-mock` trong `.claude/launch.json` (cổng 5174, bật mock auth). Phiên mock **chặn mọi API cần đăng nhập** nên chỉ dùng để xem giao diện; xem `docs/mock-auth-development.md`.

### Cấu trúc & quy ước

- Thư mục theo **role → chức năng**: `src/Player/`, `src/CourtOwner/`, `src/Admin/`, dùng chung ở `src/components/`. Chi tiết: `docs/FOLDER_STRUCTURE.md`, khung giao diện: `docs/UI_LAYOUT.md`.
- Gọi API qua hàm trong `src/api/<role>/` (helper `get/post/put/patch/del/getList` ở `src/api/owner/request.js`), không gọi `apiClient` trực tiếp trong trang. BE trả `{ statusCode, message, data }`; `unwrap` lấy `data`, lỗi đi qua `normalizeApiError` (giữ `message` của BE để hiện toast).
- Trang mới: thêm route trong `src/App.jsx` (lazy + `<Page>`), mục menu ở `Player/Layout/TopSideBar.jsx` / `CourtOwner/Layout/CourtOwnerLayout.jsx` / `Admin/adminMenu.js`.
- Giao diện Player / Chủ sân dùng class `snx-*` (`src/styles/ui-kit.css`, `app-shell.css`); Admin dùng class riêng trong `src/Admin/styles/` và thư mục chức năng.
- Không dùng dữ liệu giả / fallback giả cho API thật: lỗi thì hiện lỗi hoặc ẩn khối.
- Giá trị enum, mã câu hỏi, lý do báo cáo… lấy từ API, không hard-code khi BE đã có endpoint trả về.

### Bẫy đã gặp

- `src/api/apiClient.js` **không được import file nội bộ khác**: `tests/auth-integration.test.mjs` nạp nó dưới dạng `data:` URL nên import tương đối sẽ hỏng. Cần móc thêm hành vi thì đăng ký từ ngoài (ví dụ `setForbiddenHandler` được `src/utils/surveyGate.js` gọi).
- `tests/admin-localization.test.mjs` khóa đúng danh sách nhãn menu Admin: thêm / đổi menu Admin thì cập nhật test.
- 403 do chưa làm khảo sát người chơi / khảo sát toàn diện môn được bắt tập trung (`utils/surveyGate.js` + `components/common/SurveyGateListener.jsx`), không xử lý riêng từng trang.
- Đối chiếu API với BE: đọc controller / DTO trong repo BE và `docs/` của BE (vd `FE_CHANGES_*.md`) thay vì đoán tên field.

### Git

- Làm trên nhánh tính năng, PR vào `main`. Commit / push chỉ khi được yêu cầu.
- Trước khi commit: `npm run lint`, `npm run build`, `npm test` đều phải qua.
