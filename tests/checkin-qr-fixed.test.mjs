import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

test('Vé check-in QR: giữ cố định QR theo từng booking và đã xóa phần Mô phỏng quét mã vào cổng (Check-in)', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  const [{ default: CheckInQR }, checkInSrc, splitPaymentSrc] = await Promise.all([
    server.ssrLoadModule('/src/Player/CheckIn/CheckInQR.jsx'),
    readFile(new URL('../src/Player/CheckIn/CheckInQR.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/Player/Booking/Payment/SplitPayment.jsx', import.meta.url), 'utf8'),
  ])

  // 1. SSR render an toàn
  const html = renderToString(
    createElement(MemoryRouter, { initialEntries: ['/qr-pass'] }, createElement(CheckInQR))
  )
  assert.ok(html.includes('Check-in QR'))

  // 2. Đã xóa hoàn toàn phần "Mô phỏng quét mã vào cổng (Check-in)" và modal mô phỏng
  assert.doesNotMatch(checkInSrc, /Mô phỏng quét mã vào cổng/)
  assert.doesNotMatch(checkInSrc, /Nhấn để mô phỏng quét QR vào cổng/)
  assert.doesNotMatch(checkInSrc, /\bshowCheckInModal\b/)
  assert.doesNotMatch(checkInSrc, /\bhandleGateScanCheckIn\b/)
  assert.doesNotMatch(checkInSrc, /Xác Thực Check-in Qua Cổng Barie/)

  // 3. Mã QR được giữ cố định theo từng booking, poll trạng thái không gọi lại getBookingQrTicket và không ghi đè qrCode
  assert.match(checkInSrc, /\bqrCodeCacheRef\b/)
  assert.match(checkInSrc, /\bpollTicketStatus\b/)
  assert.match(checkInSrc, /qrCode:\s*prev\.qrCode/)

  const pollFnMatch = checkInSrc.match(/const pollTicketStatus = useCallback\([\s\S]*?\n\s*\}, \[currentUser\.id\]\)/)
  assert.ok(pollFnMatch, 'Không tìm thấy pollTicketStatus')
  assert.doesNotMatch(pollFnMatch[0], /\bgetBookingQrTicket\b/)

  const pollEffectMatch = checkInSrc.match(/useEffect\(\(\) => \{\s*if \(!activeTicketId \|\| isQrDisabled\)[\s\S]*?\}, \[activeTicketId/)
  assert.ok(pollEffectMatch, 'Không tìm thấy useEffect poll trạng thái')
  assert.doesNotMatch(pollEffectMatch[0], /\bfetchTicket\b/)
  assert.doesNotMatch(pollEffectMatch[0], /\bgetBookingQrTicket\b/)

  // 4. SplitPayment không còn comment/biến QR động 30s
  assert.doesNotMatch(splitPaymentSrc, /Động 30s/i)
  assert.doesNotMatch(splitPaymentSrc, /\bqrVersion\b/)
})
