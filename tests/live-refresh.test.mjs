import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createLiveRefresher } from '../src/hooks/useLiveRefresh.js'

const src = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('tự làm mới: gộp các lần kích hoạt sát nhau, thông báo mới thì luôn tải', () => {
  let t = 0
  let calls = 0
  const run = createLiveRefresher(() => calls++, { minGapMs: 3000, now: () => t })
  t = 1000
  assert.equal(run(), false, 'vừa mở trang (đã tải) thì quay lại tab chưa cần tải')
  t = 4000
  assert.equal(run(), true)
  t = 4500
  assert.equal(run(), false, 'focus + visibilitychange cùng lúc chỉ tải 1 lần')
  assert.equal(run(true), true, 'có thông báo mới thì tải ngay')
  assert.equal(calls, 2)
})

test('tự làm mới: chuông kiểm tra số chưa đọc 15 giây/lần và phát sự kiện khi có thông báo mới', async () => {
  const bell = await src('src/Player/Layout/NotificationBell.jsx')
  assert.match(bell, /setInterval\(check, 15000\)/)
  assert.match(bell, /dispatchEvent\(new CustomEvent\(LIVE_REFRESH_EVENT\)\)/)
})

test('tự làm mới: các màn chủ sân hiển thị đơn đặt sân đều nghe sự kiện', async () => {
  const pages = [
    'src/CourtOwner/Schedule/BookingSchedule.jsx',
    'src/CourtOwner/Bookings/OwnerBookings.jsx',
    'src/CourtOwner/Dashboard/Dashboard.jsx',
    'src/CourtOwner/CheckIn/CheckQR.jsx',
    'src/CourtOwner/Layout/CourtOwnerLayout.jsx',
  ]
  for (const page of pages) assert.match(await src(page), /useLiveRefresh\(/, page)
})
