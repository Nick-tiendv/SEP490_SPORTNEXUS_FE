// Máy trạng thái của mascot: chạy vòng vòng, nghỉ, báo thông báo, bị kéo, dỗi.
// JS thuần (không React/DOM) để test bằng node; React chỉ render snapshot qua emit().
import { MASCOT_CONFIG } from './mascotConfig.js'

const STORAGE_KEY = 'snx.mascot'
const EDGE = { top: 4, side: 4, bottom: 4 } // lề khi kéo thả / thu nhỏ cửa sổ

export function loadMascotPrefs(storage = globalThis.localStorage) {
  try {
    const p = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}')
    return { hidden: p.hidden === true, sulk: p.sulk === true, x: Number.isFinite(p.x) ? p.x : null, y: Number.isFinite(p.y) ? p.y : null }
  } catch {
    return { hidden: false, sulk: false, x: null, y: null }
  }
}

export function saveMascotPrefs(prefs, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* localStorage bị chặn (ẩn danh, chặn dữ liệu trang): bỏ qua */
  }
}

const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max))
const between = ([a, b], rand) => a + rand() * (b - a)

export const sizeFor = (vw, cfg = MASCOT_CONFIG) => (vw < cfg.mobileBreakpoint ? cfg.size.mobile : cfg.size.desktop)

// left: phần bên trái bị sidebar cố định chiếm (0 trên mobile) — mascot không chạy / bị thả ra sau sidebar
export const clampPos = (pos, size, vw, vh, m = MASCOT_CONFIG.margin, left = 0) => ({
  x: clamp(pos.x, left + m.side, vw - size.w - m.side),
  y: clamp(pos.y, m.top, vh - size.h - m.bottom),
})

export const homePos = (size, vw, vh, cfg = MASCOT_CONFIG, left = 0) =>
  clampPos({ x: vw - size.w - cfg.home.right, y: vh - size.h - cfg.home.bottom }, size, vw, vh, EDGE, left)

export const randomTarget = (size, vw, vh, cfg = MASCOT_CONFIG, rand = Math.random, left = 0) => {
  const m = cfg.margin
  return {
    x: left + m.side + rand() * Math.max(0, vw - left - size.w - 2 * m.side),
    y: m.top + rand() * Math.max(0, vh - size.h - m.top - m.bottom),
  }
}

// Thông báo chưa đọc chưa từng thấy; API trả mới nhất trước nên đảo lại để báo theo thứ tự cũ → mới.
export const pickNewNotifications = (items, seen) => items.filter((n) => n?.id && !n.read && !seen.has(n.id)).reverse()

// Lần tải đầu sau khi vào trang / đăng nhập lại: thông báo chưa đọc vừa tới gần đây vẫn phải báo
// (vd. vừa đổi sang tài khoản khác để đặt sân rồi quay lại tài khoản chủ sân).
export const pickRecentUnread = (items, { now = Date.now(), windowMs, max = 3, skip = new Set() }) =>
  items
    .filter((n) => {
      const at = new Date(n?.createdAt).getTime()
      return n?.id && !n.read && !skip.has(n.id) && Number.isFinite(at) && now - at <= windowMs
    })
    .slice(0, max)
    .reverse()

export function createMascotDirector(opts) {
  const { emit, getRect, viewport, line, onOpenNotifications, save = saveMascotPrefs, config: cfg = MASCOT_CONFIG, rand = Math.random } = opts
  const later = opts.setTimeout || ((fn, ms) => setTimeout(fn, ms))
  const cancel = opts.clearTimeout || ((id) => clearTimeout(id))
  const saved = opts.prefs || {}

  const s = {
    started: false, vw: 0, vh: 0, left: 0, size: cfg.size.desktop,
    pos: { x: 0, y: 0 }, ms: 0, action: 'idle', facingLeft: false, bubble: null,
    hidden: saved.hidden === true, sulk: saved.sulk === true, reduced: opts.reduced === true,
    queue: [], current: null, alerting: false, dragCount: 0, drag: null, timer: null, bubbleTimer: null,
  }

  const render = () => emit({
    x: s.pos.x, y: s.pos.y, ms: s.ms, action: s.action, facingLeft: s.facingLeft, bubble: s.bubble,
    hidden: s.hidden, sulk: s.sulk, size: s.size, vw: s.vw, left: s.left,
  })
  const restAction = () => (s.sulk ? 'sulk' : 'idle')
  const home = () => homePos(s.size, s.vw, s.vh, cfg, s.left)
  const inBounds = (pos) => clampPos(pos, s.size, s.vw, s.vh, EDGE, s.left)
  const persist = () => save({ hidden: s.hidden, sulk: s.sulk, x: s.sulk ? Math.round(s.pos.x) : null, y: s.sulk ? Math.round(s.pos.y) : null })
  const stopTimer = () => { cancel(s.timer); s.timer = null }
  // ms > 0: chạy có transition, quay mặt theo hướng di chuyển
  const place = ({ x, y }, ms = 0) => {
    if (ms && Math.abs(x - s.pos.x) > 1) s.facingLeft = x < s.pos.x
    s.pos = { x, y }
    s.ms = ms
  }
  // Dừng ngay tại chỗ đang hiển thị (đang giữa transition thì vị trí thật lấy từ DOM)
  const freeze = () => {
    const r = getRect?.()
    if (r) s.pos = { x: r.left, y: r.top }
    s.ms = 0
  }
  // Bị ngắt khi đang chạy về góc báo tin: trả thông báo về đầu hàng đợi
  const abortAlert = () => {
    if (s.alerting && !s.bubble) {
      s.queue.unshift(s.current)
      s.alerting = false
      s.current = null
    }
  }
  const canRoam = () => s.started && !s.hidden && !s.sulk && !s.reduced && !s.bubble && !s.drag && !s.alerting

  function roam(delay = 600) {
    stopTimer()
    if (canRoam()) s.timer = later(leg, delay)
  }
  function leg() {
    if (!canRoam()) return
    const ms = Math.round(between(cfg.legMs, rand))
    s.action = 'run'
    place(randomTarget(s.size, s.vw, s.vh, cfg, rand, s.left), ms)
    render()
    s.timer = later(rest, ms)
  }
  function rest() {
    if (!canRoam()) return
    if (rand() >= cfg.idleChance) return leg()
    s.action = 'idle'
    s.ms = 0
    render()
    s.timer = later(leg, between(cfg.idleMs, rand))
  }

  function say(bubble, ms) {
    cancel(s.bubbleTimer)
    s.bubble = bubble
    render()
    s.bubbleTimer = later(closeBubble, ms)
  }
  function closeBubble() {
    cancel(s.bubbleTimer)
    s.bubbleTimer = null
    s.bubble = null
    s.alerting = false
    s.current = null
    if (!s.drag) s.action = restAction()
    render()
    if (!next()) roam()
  }

  function next() {
    if (!s.started || !s.queue.length || s.hidden || s.drag || s.bubble || s.alerting) return false
    alert(s.queue.shift())
    return true
  }
  // Chạy về góc cố định (đang dỗi thì đứng tại chỗ), nhảy lên và hiện bong bóng
  function alert(item) {
    stopTimer()
    freeze()
    s.alerting = true
    s.current = item
    const target = s.sulk ? s.pos : home()
    const dist = Math.hypot(target.x - s.pos.x, target.y - s.pos.y)
    const ms = s.reduced || dist < 4 ? 0 : Math.round(clamp((dist / cfg.runSpeed) * 1000, 400, 2500))
    s.action = ms ? 'run' : restAction()
    place(target, ms)
    render()
    s.timer = later(() => {
      s.action = s.sulk ? 'sulk' : s.reduced ? 'idle' : 'jump'
      s.ms = 0
      say({ kind: 'notice', title: item.title, text: item.message, sulk: s.sulk }, cfg.bubbleMs)
    }, ms)
  }

  function pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return
    stopTimer()
    abortAlert()
    freeze()
    s.drag = { sx: e.clientX, sy: e.clientY, ox: e.clientX - s.pos.x, oy: e.clientY - s.pos.y, moved: false }
    if (s.action === 'run') s.action = restAction()
    render()
  }
  function pointerMove(e) {
    const d = s.drag
    if (!d) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < cfg.dragThreshold) return
    d.moved = true
    s.action = 'drag'
    place(inBounds({ x: e.clientX - d.ox, y: e.clientY - d.oy }))
    render()
  }
  // Kéo lần 1: nhắc nhở rồi chạy tiếp. Kéo lần 2: đứng yên tại chỗ thả và dỗi (lưu lại).
  function pointerUp() {
    const d = s.drag
    if (!d) return
    s.drag = null
    if (!d.moved) {
      s.action = restAction()
      return click()
    }
    s.dragCount += 1
    const showingNotice = s.bubble?.kind === 'notice'
    const becameSulk = !s.sulk && s.dragCount >= cfg.dragsToSulk
    if (becameSulk) s.sulk = true
    s.action = restAction()
    if (s.sulk) persist()
    if (showingNotice) return render()
    if (becameSulk) return say({ kind: 'sulk', text: line('sulkStart') }, cfg.chatMs)
    if (!s.sulk) return say({ kind: 'chat', text: line('dragWarn') }, cfg.chatMs)
    render()
    if (!s.bubble) next()
  }

  function click() {
    if (s.bubble?.kind === 'notice') return openNotice()
    if (s.sulk) return say({ kind: 'sulk', text: line('sulkClick'), actions: ['makeUp'] }, cfg.bubbleMs)
    say({ kind: 'chat', text: line('greet'), actions: ['hide'] }, cfg.bubbleMs)
  }
  function openNotice() {
    onOpenNotifications?.(s.current)
    closeBubble()
  }
  function makeUp() {
    s.sulk = false
    s.dragCount = 0
    persist()
    s.action = s.reduced ? 'idle' : 'jump'
    say({ kind: 'chat', text: line('madeUp') }, cfg.chatMs)
  }
  function hide() {
    stopTimer()
    cancel(s.bubbleTimer)
    Object.assign(s, { bubble: null, alerting: false, current: null, queue: [], drag: null, hidden: true, action: restAction() })
    persist()
    render()
  }
  function show() {
    s.hidden = false
    persist()
    if (!s.sulk) place(home())
    s.action = restAction()
    render()
    roam(800)
  }

  function setReduced(value) {
    s.reduced = value === true
    if (!s.started) return
    if (!s.reduced) return roam()
    stopTimer()
    abortAlert()
    if (!s.sulk && !s.drag && !s.bubble) place(home())
    if (s.action === 'run') s.action = restAction()
    render()
    next()
  }
  // Mobile bắn resize khi thanh địa chỉ co giãn: chỉ xử lý khi đổi bề ngang hoặc mascot bị lọt ra ngoài
  function resize() {
    const { w, h, left = 0 } = viewport()
    const widthChanged = w !== s.vw || left !== s.left
    Object.assign(s, { vw: w, vh: h, left, size: sizeFor(w, cfg) })
    if (!s.started || s.drag) return
    const inside = inBounds(s.pos)
    if (!widthChanged && inside.x === s.pos.x && inside.y === s.pos.y) return
    stopTimer()
    abortAlert()
    freeze()
    place(s.reduced && !s.sulk && !s.bubble ? home() : inBounds(s.pos))
    if (s.action === 'run') s.action = restAction()
    if (s.sulk) persist()
    render()
    if (!next()) roam(400)
  }

  function start() {
    const { w, h, left = 0 } = viewport()
    Object.assign(s, { started: true, vw: w, vh: h, left, size: sizeFor(w, cfg) })
    const hasSpot = s.sulk && Number.isFinite(saved.x) && Number.isFinite(saved.y)
    place(hasSpot ? inBounds({ x: saved.x, y: saved.y }) : home())
    s.action = restAction()
    render()
    if (!next()) roam(1500)
  }
  function stop() {
    s.started = false
    stopTimer()
    cancel(s.bubbleTimer)
  }
  function enqueue(items) {
    if (s.hidden || !items?.length) return
    s.queue.push(...items)
    next()
  }

  return { start, stop, enqueue, resize, setReduced, pointerDown, pointerMove, pointerUp, click, openNotice, closeBubble, makeUp, hide, show, state: s }
}
