import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

test('Chủ sân hủy đơn: API Preview Hủy, check mốc 48h, ownerPenaltyAmount, ownerFairPlayPenalty và fallback khi 400', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('buildOwnerCancelPenaltyPreview đọc ownerPenaltyAmount/ownerFairPlayPenalty và fallback quy tắc 48h khi preview lỗi 400', async () => {
    const {
      buildOwnerCancelPenaltyPreview,
      formatOwnerCancelResultMessage,
    } = await server.ssrLoadModule('/src/CourtOwner/Bookings/ownerCancelPenalty.js')

    const nowMs = new Date('2026-11-16T12:00:00+07:00').getTime()

    // 1. Có dữ liệu từ BE Preview Hủy (< 48h: 20% + trừ uy tín)
    const fromApiUnder48h = buildOwnerCancelPenaltyPreview({
      startTime: '2026-11-17T18:00:00+07:00',
      totalAmount: 200000,
      isWalkIn: false,
      preview: {
        ownerPenaltyAmount: 40000,
        ownerFairPlayPenalty: -10,
      },
      previewFallback: false,
      nowMs,
    })
    assert.equal(fromApiUnder48h.source, 'api')
    assert.equal(fromApiUnder48h.penaltyPercent, 20)
    assert.equal(fromApiUnder48h.ownerPenaltyAmount, 40000)
    assert.equal(fromApiUnder48h.ownerFairPlayPenalty, -10)
    assert.equal(fromApiUnder48h.fairPlayDeducted, 10)
    assert.equal(
      fromApiUnder48h.warningMessage,
      'Nếu hủy đơn này, bạn sẽ bị phạt 20% giá trị đơn và trừ uy tín.'
    )

    // 2. BE trả lỗi 400 preview -> tự check 48h (< 48h -> 20% & -10 FairPlay)
    const fallbackUnder48h = buildOwnerCancelPenaltyPreview({
      startTime: '2026-11-17T18:00:00+07:00',
      totalAmount: 300000,
      isWalkIn: false,
      preview: null,
      previewFallback: true,
      nowMs,
    })
    assert.equal(fallbackUnder48h.source, 'rule_48h')
    assert.equal(fallbackUnder48h.previewFallback, true)
    assert.equal(fallbackUnder48h.isUnder48h, true)
    assert.equal(fallbackUnder48h.penaltyPercent, 20)
    assert.equal(fallbackUnder48h.ownerPenaltyAmount, 60000)
    assert.equal(fallbackUnder48h.ownerFairPlayPenalty, -10)
    assert.equal(
      fallbackUnder48h.warningMessage,
      'Nếu hủy đơn này, bạn sẽ bị phạt 20% giá trị đơn và trừ uy tín.'
    )

    // 3. BE trả lỗi 400 preview -> >= 48h -> 10% & 0 FairPlay
    const fallbackOver48h = buildOwnerCancelPenaltyPreview({
      startTime: '2026-11-19T18:00:00+07:00',
      totalAmount: 300000,
      isWalkIn: false,
      preview: null,
      previewFallback: true,
      nowMs,
    })
    assert.equal(fallbackOver48h.isUnder48h, false)
    assert.equal(fallbackOver48h.penaltyPercent, 10)
    assert.equal(fallbackOver48h.ownerPenaltyAmount, 30000)
    assert.equal(fallbackOver48h.fairPlayDeducted, 0)
    assert.match(fallbackOver48h.warningMessage, /phạt 10% giá trị đơn/)

    // 4. Đơn khách vãng lai tại quầy -> không phạt
    const walkIn = buildOwnerCancelPenaltyPreview({
      startTime: '2026-11-17T18:00:00+07:00',
      totalAmount: 200000,
      isWalkIn: true,
      preview: null,
      previewFallback: true,
      nowMs,
    })
    assert.equal(walkIn.hasPenalty, false)
    assert.equal(walkIn.penaltyPercent, 0)
    assert.equal(walkIn.ownerPenaltyAmount, 0)
    assert.equal(walkIn.fairPlayDeducted, 0)

    const resultMsg = formatOwnerCancelResultMessage(
      { ownerPenaltyAmount: 40000, ownerFairPlayPenalty: -10 },
      (n) => `${n} Điểm`
    )
    assert.match(resultMsg, /40000 Điểm/)
    assert.match(resultMsg, /10 điểm Fair Play/)
  })

  await t.test('cancelOwnerBooking gọi POST /cancel (BE không có API preview hủy)', async () => {
    const [ownerApi, clientMod] = await Promise.all([
      server.ssrLoadModule('/src/api/owner/bookingApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
    ])

    const prevAdapter = clientMod.default.defaults.adapter
    const calls = []
    clientMod.default.defaults.adapter = async (config) => {
      calls.push({ method: config.method?.toUpperCase(), url: config.url })
      return {
        status: 200,
        data: {
          statusCode: 200,
          data: { bookingId: 'bk-1', ownerPenaltyAmount: 50000, ownerFairPlayPenalty: -10 },
        },
        headers: {},
        config,
      }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    assert.equal(ownerApi.previewOwnerBookingCancel, undefined)

    const cancelRes = await ownerApi.cancelOwnerBooking('bk-1', {
      reasonCode: 1,
      reason: 'Bảo trì mặt sân',
      lockSlotAfterCancel: true,
    })
    assert.equal(cancelRes.ownerPenaltyAmount, 50000)
    assert.equal(cancelRes.ownerFairPlayPenalty, -10)
    assert.equal(calls.at(-1).url, '/api/v1/bookings/owner/bk-1/cancel')
  })

  await t.test('OwnerBookings, BookingSchedule và OwnerCancelBookingModal nối popup cảnh báo và render SSR an toàn', async () => {
    const [{ default: OwnerCancelBookingModal }, { default: OwnerBookings }, { default: BookingSchedule }, modalSrc, bookingsSrc, scheduleSrc] =
      await Promise.all([
        server.ssrLoadModule('/src/CourtOwner/Bookings/OwnerCancelBookingModal.jsx'),
        server.ssrLoadModule('/src/CourtOwner/Bookings/OwnerBookings.jsx'),
        server.ssrLoadModule('/src/CourtOwner/Schedule/BookingSchedule.jsx'),
        readFile(new URL('../src/CourtOwner/Bookings/OwnerCancelBookingModal.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/CourtOwner/Bookings/OwnerBookings.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/CourtOwner/Schedule/BookingSchedule.jsx', import.meta.url), 'utf8'),
      ])

    assert.doesNotMatch(modalSrc, /previewOwnerBookingCancel|cancel-preview/)
    assert.match(modalSrc, /ownerPenaltyAmount/)
    assert.match(modalSrc, /fairPlayDeducted/)
    assert.match(bookingsSrc, /OwnerCancelBookingModal/)
    assert.match(bookingsSrc, /Hủy đơn/)
    assert.match(scheduleSrc, /OwnerCancelBookingModal/)
    assert.match(scheduleSrc, /Hủy đặt sân/)

    const futureShort = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
    const modalHtml = renderToString(
      createElement(OwnerCancelBookingModal, {
        booking: {
          bookingId: 'bk-ssr',
          customerName: 'Nguyễn Văn B',
          courtName: 'Sân 1',
          startTime: futureShort,
          totalAmount: 200000,
          isWalkIn: false,
        },
        onClose: () => {},
      })
    )
    assert.ok(modalHtml.includes('Cảnh báo hủy đơn đặt sân'))

    const renderWithOwnerContext = (Component) =>
      renderToString(
        createElement(
          MemoryRouter,
          null,
          createElement(
            Routes,
            null,
            createElement(
              Route,
              {
                element: createElement(Outlet, {
                  context: {
                    facilityId: 'fac-1',
                    facility: { name: 'Sân Test' },
                    loading: false,
                    error: '',
                    refreshWallet: async () => {},
                  },
                }),
              },
              createElement(Route, { path: '*', element: createElement(Component) })
            )
          )
        )
      )

    const bookingsHtml = renderWithOwnerContext(OwnerBookings)
    assert.ok(bookingsHtml.includes('Đơn đặt sân'))
    const scheduleHtml = renderWithOwnerContext(BookingSchedule)
    assert.ok(scheduleHtml.includes('Lịch'))
  })
})
