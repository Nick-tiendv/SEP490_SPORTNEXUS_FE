import test from 'node:test'
import assert from 'node:assert/strict'
import { createMascotDirector, homePos, loadMascotPrefs, pickNewNotifications, pickRecentUnread, sizeFor } from '../src/components/mascot/mascotDirector.js'
import { MASCOT_ASSETS, MASCOT_CONFIG, mascotLine, pickMascotAsset, roleKey } from '../src/components/mascot/mascotConfig.js'

const memoryStorage = () => {
  const data = new Map()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) }
}

test('mascot: mỗi phiên tab chọn ngẫu nhiên 1 con và giữ nguyên tới khi đóng tab', () => {
  assert.deepEqual(MASCOT_ASSETS.map((a) => a.key), ['football', 'badminton', 'basketball', 'pickleball', 'tennis'])
  const tab = memoryStorage()
  const first = pickMascotAsset({ storage: tab, rand: () => 0.5 })
  assert.equal(first.key, 'basketball')
  assert.equal(pickMascotAsset({ storage: tab, rand: () => 0 }).key, 'basketball', 'F5 trong cùng tab: giữ con cũ')
  assert.equal(pickMascotAsset({ storage: memoryStorage(), rand: () => 0.99 }).key, 'tennis', 'tab mới: chọn lại')
  assert.equal(pickMascotAsset({ storage: tab, forceKey: 'badminton' }).key, 'badminton', '?mascot=badminton')
  assert.equal(pickMascotAsset({ storage: tab, forceKey: 'khong-co' }).key, 'badminton', 'key sai thì bỏ qua')
  const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
  assert.equal(pickMascotAsset({ storage: blocked, rand: () => 0 }).key, 'football')
})

test('mascot: câu chào có thêm câu theo môn của con đang hiện', () => {
  const lines = new Set(Array.from({ length: 40 }, (_, i) => mascotLine('greet', 'Player', { sport: 'badminton', rand: () => i / 40, hour: 20 })))
  assert.ok([...lines].some((l) => l.includes('🏸')))
  assert.ok([...lines].every((l) => l.startsWith('Chào buổi tối!')))
})

// Bộ hẹn giờ giả: chạy lần lượt từng timer theo thứ tự thời gian
function fakeClock() {
  let seq = 0
  const timers = new Map()
  return {
    setTimeout: (fn, ms) => { timers.set(++seq, { fn, at: ms }); return seq },
    clearTimeout: (id) => timers.delete(id),
    next() {
      const [id, t] = [...timers.entries()].sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0] || []
      if (!id) return false
      timers.delete(id)
      t.fn()
      return true
    },
    get size() { return timers.size },
  }
}

function setup({ prefs, reduced = false, vw = 1280, vh = 800, left = 0, rand = () => 0.5 } = {}) {
  const clock = fakeClock()
  const views = []
  const saves = []
  const opened = []
  const d = createMascotDirector({
    emit: (v) => views.push(v),
    getRect: () => null,
    viewport: () => ({ w: vw, h: vh, left }),
    line: (kind) => kind,
    prefs,
    reduced,
    save: (p) => saves.push(p),
    onOpenNotifications: (item) => opened.push(item),
    rand,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
  })
  return { d, clock, views, saves, opened, last: () => views.at(-1), vw, vh }
}

const drag = (d, from, to) => {
  d.pointerDown({ button: 0, clientX: from.x, clientY: from.y })
  d.pointerMove({ clientX: to.x, clientY: to.y })
  d.pointerUp()
}

test('mascot: mới vào thì đứng ở góc rồi chạy vòng vòng', () => {
  const { d, clock, last, vw, vh } = setup()
  d.start()
  const home = homePos(sizeFor(vw), vw, vh)
  assert.deepEqual({ x: last().x, y: last().y }, home)
  assert.equal(last().action, 'idle')
  clock.next() // bắt đầu chặng chạy đầu tiên
  assert.equal(last().action, 'run')
  assert.ok(last().ms >= MASCOT_CONFIG.legMs[0] && last().ms <= MASCOT_CONFIG.legMs[1], 'mỗi chặng 3–6 giây')
  assert.notDeepEqual({ x: last().x, y: last().y }, home)
})

test('mascot: thông báo xếp hàng, hiện lần lượt từng cái ở góc cố định', () => {
  const { d, clock, last, vw, vh } = setup()
  d.start()
  clock.next()
  d.enqueue([{ id: 'a', title: 'A', message: 'tin A' }, { id: 'b', title: 'B', message: 'tin B' }])
  assert.equal(last().action, 'run', 'chạy về góc')
  assert.deepEqual({ x: last().x, y: last().y }, homePos(sizeFor(vw), vw, vh))
  clock.next()
  assert.equal(last().action, 'jump')
  assert.equal(last().bubble.title, 'A')
  assert.equal(d.state.queue.length, 1, 'B còn chờ, không chồng lên A')
  clock.next() // A tự ẩn sau bubbleMs → tới B (đã ở góc nên không phải chạy)
  clock.next()
  assert.equal(last().bubble.title, 'B')
  clock.next()
  assert.equal(last().bubble, null)
  assert.equal(d.state.queue.length, 0)
  clock.next()
  assert.equal(last().action, 'run', 'hết thông báo thì chạy vòng vòng lại')
})

test('mascot: bấm bong bóng thông báo → mở danh sách thông báo', () => {
  const { d, clock, opened, last } = setup()
  d.start()
  d.enqueue([{ id: 'a', title: 'A', message: '' }])
  clock.next()
  d.openNotice()
  assert.equal(opened[0].id, 'a')
  assert.equal(last().bubble, null)
})

test('mascot: kéo lần 1 thì nhắc, kéo lần 2 thì đứng yên tại chỗ thả và dỗi (lưu lại)', () => {
  const { d, clock, last, saves } = setup()
  d.start()
  drag(d, { x: 1200, y: 650 }, { x: 600, y: 400 })
  assert.equal(last().sulk, false)
  assert.equal(last().bubble.text, 'dragWarn')
  clock.next() // ẩn câu nhắc → chạy tiếp
  clock.next()
  assert.equal(last().action, 'run')

  drag(d, { x: last().x + 10, y: last().y + 10 }, { x: 300, y: 300 })
  assert.equal(last().sulk, true)
  assert.equal(last().action, 'sulk')
  assert.equal(last().bubble.text, 'sulkStart')
  assert.deepEqual(saves.at(-1), { hidden: false, sulk: true, x: Math.round(last().x), y: Math.round(last().y) })
  const spot = { x: last().x, y: last().y }
  while (clock.next());
  assert.deepEqual({ x: last().x, y: last().y }, spot, 'đang dỗi thì không chạy nữa')
  assert.equal(last().action, 'sulk')
})

test('mascot: đang dỗi vẫn báo thông báo tại chỗ; bấm vào → Dỗ dành → chạy lại', () => {
  const { d, clock, last, saves } = setup({ prefs: { sulk: true, x: 200, y: 300 } })
  d.start()
  assert.deepEqual({ x: last().x, y: last().y, action: last().action }, { x: 200, y: 300, action: 'sulk' })
  d.enqueue([{ id: 'a', title: 'A', message: '' }])
  clock.next()
  assert.deepEqual({ x: last().x, y: last().y }, { x: 200, y: 300 }, 'không chạy về góc khi đang dỗi')
  assert.equal(last().bubble.sulk, true)
  d.closeBubble()

  d.pointerDown({ button: 0, clientX: 210, clientY: 310 })
  d.pointerUp() // bấm, không kéo
  assert.deepEqual(last().bubble.actions, ['makeUp'])
  d.makeUp()
  assert.equal(last().sulk, false)
  assert.equal(saves.at(-1).sulk, false)
  clock.next() // ẩn câu "hết giận"
  clock.next()
  assert.equal(last().action, 'run')
})

test('mascot: bấm vào lúc bình thường thì chào; ẩn thì bỏ qua thông báo và lưu lựa chọn', () => {
  const { d, last, saves } = setup()
  d.start()
  d.click()
  assert.equal(last().bubble.text, 'greet')
  assert.deepEqual(last().bubble.actions, ['hide'])
  d.hide()
  assert.equal(last().hidden, true)
  assert.equal(saves.at(-1).hidden, true)
  d.enqueue([{ id: 'a', title: 'A' }])
  assert.equal(d.state.queue.length, 0)
  d.show()
  assert.equal(last().hidden, false)
})

test('mascot: prefers-reduced-motion thì đứng yên ở góc, vẫn hiện bong bóng', () => {
  const { d, clock, last, vw, vh } = setup({ reduced: true })
  d.start()
  assert.equal(clock.size, 0, 'không lên lịch chạy')
  d.enqueue([{ id: 'a', title: 'A' }])
  clock.next()
  assert.equal(last().bubble.title, 'A')
  assert.equal(last().action, 'idle')
  assert.deepEqual({ x: last().x, y: last().y }, homePos(sizeFor(vw), vw, vh))
})

test('mascot: chỉ báo thông báo chưa đọc mới, theo thứ tự cũ → mới', () => {
  const seen = new Set(['1'])
  const items = [{ id: '3', read: false }, { id: '2', read: true }, { id: '4', read: false }, { id: '1', read: false }]
  assert.deepEqual(pickNewNotifications(items, seen).map((n) => n.id), ['4', '3'])
})

test('mascot: vào trang / đăng nhập lại vẫn báo thông báo chưa đọc vừa tới (≤ 15 phút)', () => {
  const now = Date.parse('2026-11-24T16:02:00')
  const ago = (min) => new Date(now - min * 60000).toISOString()
  const items = [
    { id: 'n1', read: false, createdAt: ago(0), title: 'Có đơn đặt sân mới' }, // vừa xong
    { id: 'n2', read: false, createdAt: ago(60) }, // 1 giờ trước: cũ
    { id: 'n3', read: true, createdAt: ago(1) }, // đã đọc
    { id: 'n4', read: false, createdAt: ago(5) },
    { id: 'n5', read: false, createdAt: null },
  ]
  const windowMs = 15 * 60000
  assert.deepEqual(pickRecentUnread(items, { now, windowMs }).map((n) => n.id), ['n4', 'n1'])
  assert.deepEqual(pickRecentUnread(items, { now, windowMs, skip: new Set(['n1']) }).map((n) => n.id), ['n4'], 'F5: không báo lại cái đã báo')
})

test('mascot: localStorage lỗi thì dùng mặc định; câu thoại theo vai trò', () => {
  const broken = { getItem: () => { throw new Error('blocked') } }
  assert.deepEqual(loadMascotPrefs(broken), { hidden: false, sulk: false, x: null, y: null })
  assert.equal(roleKey('CourtOwner'), 'owner')
  assert.equal(roleKey('Player'), 'player')
  assert.match(mascotLine('greet', 'CourtOwner', { rand: () => 0, hour: 8 }), /^Chào buổi sáng! Kiểm tra lịch sân/)
  assert.equal(mascotLine('unread', 'Player', { n: 3 }), 'Bạn có 3 thông báo chưa đọc nè!')
})

test('mascot: không chạy / không bị thả ra sau sidebar cố định bên trái', () => {
  const { d, clock, views } = setup({ left: 260, rand: () => 0 }) // rand 0: luôn chọn điểm sát mép trái nhất
  d.start()
  for (let i = 0; i < 6; i++) clock.next()
  assert.ok(views.length > 1)
  assert.ok(views.every((v) => v.x >= 260), 'mọi vị trí đều bên phải sidebar')
  drag(d, { x: 1200, y: 650 }, { x: 10, y: 300 }) // kéo thả lên sidebar
  assert.ok(views.at(-1).x >= 260)
})
