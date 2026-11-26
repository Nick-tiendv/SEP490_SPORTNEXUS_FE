import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { hasPaid, isPendingSplit, needsMyPayment, parseVnTime, secondsUntil, splitShares } from '../src/Player/Booking/splitBooking.js'

const src = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('chia tiền: mỗi ca chia đều, làm tròn xuống, phần lẻ người tạo trả (giống BE)', () => {
  assert.deepEqual(splitShares([100000], 3), { total: 100000, share: 33333, hostShare: 33334 })
  // 2 ca giá khác nhau: làm tròn từng ca rồi cộng lại
  assert.deepEqual(splitShares([50000, 70001], 2), { total: 120001, share: 25000 + 35000, hostShare: 120001 - 60000 })
  assert.deepEqual(splitShares([90000], 1), { total: 90000, share: 90000, hostShare: 90000 })
})

test('chia tiền: hạn góp là giờ VN, không kèm múi giờ thì coi là +07:00', () => {
  assert.equal(parseVnTime('2026-11-25T14:30:00'), Date.parse('2026-11-25T07:30:00Z'))
  assert.equal(parseVnTime('2026-11-25T07:30:00Z'), Date.parse('2026-11-25T07:30:00Z'))
  assert.ok(Number.isNaN(parseVnTime(null)))
  const now = Date.parse('2026-11-25T07:00:00Z')
  assert.equal(secondsUntil('2026-11-25T14:30:00', now), 30 * 60)
  assert.equal(secondsUntil('2026-11-25T13:00:00', now), 0, 'quá hạn thì 0')
  assert.equal(secondsUntil('', now), null)
})

test('chia tiền: nhận diện đơn chờ góp và khi nào hiện nút "Góp tiền"', () => {
  const invite = { bookingStatus: 'PENDING', myRole: 'Participant', myPaymentStatus: 'PENDING', participantCount: 2 }
  assert.equal(isPendingSplit(invite), true)
  assert.equal(needsMyPayment(invite), true)
  assert.equal(needsMyPayment({ ...invite, myPaymentStatus: 'HELD' }), false, 'đã góp')
  assert.equal(needsMyPayment({ ...invite, bookingStatus: 'PAID' }), false, 'đơn đã xác nhận')
  assert.equal(needsMyPayment({ ...invite, myRole: 'Host' }), false, 'người tạo không góp lại')
  assert.equal(isPendingSplit({ bookingStatus: 'PENDING', myRole: 'Host', participantCount: 3 }), true)
  assert.equal(isPendingSplit({ bookingStatus: 'PENDING', myRole: 'Host', participantCount: 1 }), false, 'đơn 1 người không phải chia tiền')
  assert.equal(hasPaid('HELD'), true)
  assert.equal(hasPaid('PENDING'), false)
})

test('chia tiền: tạo đơn dựa vào isSplitPayment / paymentDeadline của BE, khóa voucher, thông báo mời mở đúng chỗ', async () => {
  const pay = await src('src/Player/Booking/Payment/SplitPayment.jsx')
  assert.match(pay, /createdBooking\?\.isSplitPayment === true/)
  assert.match(pay, /secondsUntil\(createdBooking\?\.paymentDeadline\)/)
  assert.match(pay, /voucherId: paymentMode === 'split' \? null/)
  const bell = await src('src/Player/Layout/NotificationBell.jsx')
  assert.match(bell, /\/dashboard\?splitBooking=/)
  for (const page of ['src/Player/Home/Dashboard.jsx', 'src/Player/Profile/Profile.jsx']) assert.match(await src(page), /<SplitBookings \/>/, page)
})
