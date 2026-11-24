// Cấu hình mascot thông báo nổi. Đổi ảnh / nhịp chạy / câu thoại chỉ cần sửa file này.

// Danh sách mascot: mỗi phiên mở tab chọn ngẫu nhiên 1 con, giữ nguyên tới khi đóng tab.
// key: mã duy nhất (dùng cho ?mascot=<key> để chọn khi thử); sport: bộ câu chào theo môn (SPORT_LINES).
// Ba kiểu:
//  - { type: 'svg', kit }: cóc SVG dựng sẵn theo môn (MascotToad.jsx), animation từng bộ phận.
//  - { type: 'image', src: '/mascot/ten-file.png' }: 1 ảnh tĩnh trong public/mascot/, animation bằng CSS (nảy, lắc).
//  - { type: 'sprite', src, columns, rows, states }: sprite sheet, mỗi hàng là 1 trạng thái, mỗi cột 1 khung.
//    states: { run: { row: 0, frames: 6, fps: 12 }, idle: {...}, jump: {...}, sulk: {...}, drag: {...} }
//    Trạng thái thiếu sẽ dùng idle.
export const MASCOT_ASSETS = [
  { key: 'football', type: 'svg', kit: 'football', sport: 'football' },
  { key: 'badminton', type: 'svg', kit: 'badminton', sport: 'badminton' },
  { key: 'basketball', type: 'svg', kit: 'basketball', sport: 'basketball' },
  { key: 'pickleball', type: 'svg', kit: 'pickleball', sport: 'pickleball' },
  { key: 'tennis', type: 'svg', kit: 'tennis', sport: 'tennis' },
  // Ví dụ thêm ảnh tĩnh: { key: 'volleyball', type: 'image', src: '/mascot/toad-volleyball.png', sport: 'volleyball' },
]

const ASSET_SESSION_KEY = 'snx.mascot.asset'

// Chọn mascot cho phiên tab: đã chọn thì giữ nguyên; forceKey (?mascot=tennis) để chọn đúng con khi thử.
export function pickMascotAsset({ storage = globalThis.sessionStorage, rand = Math.random, assets = MASCOT_ASSETS, forceKey } = {}) {
  const byKey = (key) => assets.find((a) => a.key === key)
  let saved = null
  try {
    saved = storage?.getItem(ASSET_SESSION_KEY)
  } catch {
    /* sessionStorage bị chặn: mỗi lần tải trang chọn lại */
  }
  const asset = byKey(forceKey) || byKey(saved) || assets[Math.floor(rand() * assets.length)] || assets[0]
  try {
    storage?.setItem(ASSET_SESSION_KEY, asset.key)
  } catch {
    /* như trên */
  }
  return asset
}

export const MASCOT_CONFIG = {
  // Khung vuông theo viewBox 240x240 của cóc
  size: { desktop: { w: 82, h: 82 }, mobile: { w: 64, h: 64 } },
  mobileBreakpoint: 640,
  // Lề an toàn khi chọn điểm chạy tới; top chừa thanh trên cùng của layout
  margin: { top: 72, side: 12, bottom: 12 },
  // Góc đứng khi báo thông báo (tính từ góc phải dưới, chừa nút trợ lý AI 56px ở bên Người chơi)
  home: { right: 24, bottom: 96 },
  legMs: [3000, 6000], // mỗi chặng chạy 3–6 giây
  idleMs: [1000, 3000], // nghỉ 1–3 giây
  idleChance: 0.35,
  runSpeed: 420, // px/giây khi chạy về góc để báo tin
  bubbleMs: 5000, // bong bóng thông báo tự ẩn
  chatMs: 3500, // bong bóng chào / phản ứng
  dragThreshold: 6, // px: nhỏ hơn thì tính là bấm, không phải kéo
  dragsToSulk: 2, // kéo lần thứ 2 thì dỗi
}

const LINES = {
  default: {
    greet: ['Chào bạn! Có gì mới tui báo liền nha 🐸', 'Ộp ộp! Tui canh thông báo cho bạn đây.', 'Bấm chuông phía trên để xem hết thông báo nha!'],
    dragWarn: ['Ui da! Kéo nữa là tui dỗi đó nha 😤', 'Ê ê, từ từ thôi! Kéo lần nữa là tui giận á.'],
    sulkStart: ['Hứ! Tui đứng đây luôn, không chạy nữa 😤', 'Giận rồi đó! Đứng yên đây cho bạn vừa lòng nè 😒'],
    sulkClick: ['Hứ… vẫn còn giận đó nha 😒', 'Không nói chuyện! Trừ khi được dỗ… 🍬'],
    madeUp: ['Thôi được rồi, tha cho đó! Đi chơi tiếp nè 🎉', 'Hết giận rồi! Ộp ộp 💚'],
    unread: ['Bạn có {n} thông báo chưa đọc nè!'],
  },
  player: {
    greet: ['Hôm nay ra sân không? 🏸', 'Tìm kèo đánh cùng chưa? Tui hóng lắm á!', 'Nhớ khởi động kỹ trước khi vào sân nha 💪'],
  },
  owner: {
    greet: ['Kiểm tra lịch sân hôm nay chưa chủ sân ơi? 📅', 'Có đơn mới là tui báo liền nha!', 'Chúc sân hôm nay kín lịch 🎉'],
  },
}

// Câu chào thêm theo môn của mascot đang hiện (trộn chung với câu chào theo vai trò)
const SPORT_LINES = {
  football: ['Ra sân đá banh hông? ⚽', 'Số 10 sẵn sàng ra sân nè ⚽'],
  badminton: ['Đánh cầu không? 🏸', 'Vợt căng dây rồi, đánh cầu thôi 🏸'],
  basketball: ['Ném vài quả bóng rổ không? 🏀', 'Số 23 khởi động xong rồi nè 🏀'],
  pickleball: ['Làm một trận pickleball không? 🏓', 'Pickleball đang hot lắm á, chơi thử đi!'],
  tennis: ['Ra sân tennis không? 🎾', 'Giao bóng thôi nào 🎾'],
}

const TIME_GREETING = (hour) => (hour < 11 ? 'Chào buổi sáng!' : hour < 14 ? 'Trưa rồi, nghỉ ngơi chút nha!' : hour < 18 ? 'Chào buổi chiều!' : 'Chào buổi tối!')

// Role từ AuthContext (Player / CourtOwner / Owner / ...) → bộ câu thoại
export const roleKey = (role) => (/owner|chusan|court_owner/i.test(String(role || '')) ? 'owner' : 'player')

// Lấy ngẫu nhiên 1 câu theo role (câu chào trộn thêm câu theo môn của mascot); câu chào có lời chào theo buổi.
export function mascotLine(kind, role, { rand = Math.random, hour = new Date().getHours(), n, sport } = {}) {
  const base = LINES[roleKey(role)][kind] || LINES.default[kind] || ['']
  const list = kind === 'greet' ? [...base, ...(SPORT_LINES[sport] || [])] : base
  const text = list[Math.floor(rand() * list.length)].replace('{n}', n)
  return kind === 'greet' ? `${TIME_GREETING(hour)} ${text}` : text
}
