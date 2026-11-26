import test from 'node:test'
import assert from 'node:assert/strict'
import { describeAiError } from '../src/Player/Booking/AIChat/aiChatErrors.js'

test('trợ lý AI: quá 5 câu / phút thì đếm ngược đúng số giây BE trả và giữ câu hỏi', () => {
  const info = describeAiError({ status: 429, errorCode: 'AI_RATE_LIMITED', errorDetail: { retryAfterSeconds: 42 }, message: 'đợi 42 giây' })
  assert.equal(info.retryAfter, 42)
  assert.equal(info.unsaved, true)
  assert.equal(info.message, 'đợi 42 giây')
})

test('trợ lý AI: AI lỗi (502) giữ câu hỏi nhưng cho gửi lại ngay; AI_BUSY chờ vài giây', () => {
  assert.deepEqual(
    [describeAiError({ status: 502, errorCode: 'AI_UNAVAILABLE' }).retryAfter, describeAiError({ status: 502, errorCode: 'AI_UNAVAILABLE' }).unsaved],
    [0, true],
  )
  assert.equal(describeAiError({ status: 429, errorCode: 'AI_BUSY' }).retryAfter, 3)
})

test('trợ lý AI: chưa cấu hình thì tạm ngưng, phiên mất thì bỏ phiên, lỗi khác hiện message như cũ', () => {
  assert.equal(describeAiError({ status: 503, errorCode: 'AI_NOT_CONFIGURED' }).paused, true)
  assert.equal(describeAiError({ status: 404, errorCode: 'AI_SESSION_NOT_FOUND' }).sessionGone, true)
  const other = describeAiError({ status: 400, errorCode: 'AI_MESSAGE_INVALID', message: 'Câu hỏi quá dài' })
  assert.deepEqual([other.unsaved, other.paused, other.sessionGone, other.retryAfter], [false, false, false, 0])
})

test('đặt sân từ AI: tổng tiền lấy từ kết quả đặt sân (1 đơn, mảng đơn, { bookings })', async () => {
  const { bookingTotalOf, isSplitBookingResult } = await import('../src/Player/Booking/AIChat/aiRealBooking.js')
  assert.equal(bookingTotalOf({ id: 'b1', totalAmount: 240000 }), 240000)
  assert.equal(bookingTotalOf({ id: 'b1', totalAmountPaid: 216000, totalAmount: 240000 }), 216000)
  assert.equal(bookingTotalOf([{ totalAmount: 100000 }, { totalAmount: 120000 }]), 220000)
  assert.equal(bookingTotalOf({ totalAmount: 300000, bookings: [{ totalAmount: 100000 }] }), 300000)
  assert.equal(bookingTotalOf({ bookings: [{ totalAmount: 100000 }, { totalAmount: 50000 }] }), 150000)
  assert.equal(bookingTotalOf('id-chuoi'), null)
  assert.equal(bookingTotalOf({ id: 'b1' }), null)
  assert.equal(isSplitBookingResult({ isSplitPayment: true }), true)
  assert.equal(isSplitBookingResult({ bookings: [{ isSplitPayment: true }] }), true)
  assert.equal(isSplitBookingResult({ isSplitPayment: false }), false)
})

test('bong bóng AI: có card thì chỉ giữ câu dẫn, không có card hoặc tin người dùng thì giữ nguyên', async () => {
  const { aiLeadText } = await import('../src/Player/Booking/AIChat/aiRealBooking.js')
  const text = 'Có 2 sân cầu lông còn trống tối nay.\n\nMình tìm được:\n1. Sân A\n2. Sân B'
  assert.equal(aiLeadText({ sender: 'bot', text, facilities: [{ facilityId: 'a' }] }), 'Có 2 sân cầu lông còn trống tối nay.')
  assert.equal(aiLeadText({ sender: 'bot', text, tournaments: [{ tournamentId: 't' }] }), 'Có 2 sân cầu lông còn trống tối nay.')
  assert.equal(aiLeadText({ sender: 'bot', text, facilities: [] }), text)
  assert.equal(aiLeadText({ sender: 'user', text, facilities: [{}] }), text)
})

test('danh sách phiên: thời gian tương đối và cắt tin cuối 80 ký tự', async () => {
  const { relativeTimeVi, truncateText } = await import('../src/Player/Booking/AIChat/aiRealBooking.js')
  const now = Date.parse('2026-11-26T10:00:00Z')
  assert.equal(relativeTimeVi('2026-11-26T09:59:40Z', now), 'Vừa xong')
  assert.equal(relativeTimeVi('2026-11-26T09:55:00Z', now), '5 phút trước')
  assert.equal(relativeTimeVi('2026-11-26T07:00:00Z', now), '3 giờ trước')
  assert.equal(relativeTimeVi('2026-11-24T10:00:00Z', now), '2 ngày trước')
  assert.equal(relativeTimeVi('2026-11-01T10:00:00Z', now), '01/11/2026')
  assert.equal(relativeTimeVi(null, now), '')
  assert.equal(truncateText('a'.repeat(100)).length, 80)
  assert.equal(truncateText('ngắn  gọn'), 'ngắn gọn')
})
