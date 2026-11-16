import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

const render = (type, props, withRouter = false) => {
  const el = createElement(type, props)
  return renderToString(withRouter ? createElement(MemoryRouter, null, el) : el).replaceAll('<!-- -->', '')
}

test('Module 01, 03, 08: nối các API bị bỏ quên và giao diện tiếng Việt hợp lệ', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('Module 01: UserManagement & PhoneOtpDialog hiển thị và nối checkPhone/sendOtp/verifyOtp/registerAdmin', async () => {
    const [{ default: UserManagement }, { PhoneOtpDialog }, authApi, clientMod, dialogsSrc] = await Promise.all([
      server.ssrLoadModule('/src/Admin/Users/UserManagement.jsx'),
      server.ssrLoadModule('/src/Admin/Users/UserDialogs.jsx'),
      server.ssrLoadModule('/src/api/auth/authApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      readFile(new URL('../src/Admin/Users/UserDialogs.jsx', import.meta.url), 'utf8'),
    ])

    const pageHtml = render(UserManagement, {}, true)
    assert.ok(pageHtml.includes('Kiểm tra SĐT &amp; Gửi OTP'))

    const dialogHtml = render(PhoneOtpDialog, { onClose: () => {} })
    for (const label of ['Kiểm tra SĐT &amp; Gửi OTP', 'Kiểm tra SĐT', 'Gửi OTP', 'Xác thực OTP', 'Đăng ký tài khoản mới', 'Khôi phục mật khẩu']) {
      assert.ok(dialogHtml.includes(label), `Thiếu nhãn: ${label}`)
    }
    assert.doesNotMatch(dialogHtml, />\s*(Active|Inactive|Pending|Confirmed|Completed|Draft|Court Owner|Verified|Select|Showing)\s*</)

    assert.match(dialogsSrc, /\bcheckPhone\b/)
    assert.match(dialogsSrc, /\bsendOtp\b/)
    assert.match(dialogsSrc, /\bverifyOtp\b/)
    assert.match(dialogsSrc, /\bregisterAdmin\b/)

    const prevAdapter = clientMod.default.defaults.adapter
    const requests = []
    clientMod.default.defaults.adapter = async (config) => {
      requests.push({ method: config.method?.toUpperCase(), url: config.url, params: config.params, data: config.data ? JSON.parse(config.data) : null })
      if (config.url === '/api/auth/check-phone') return { status: 200, data: { statusCode: 200, message: 'OK', data: { exists: true } }, headers: {}, config }
      if (config.url === '/api/auth/send-otp') return { status: 200, data: { statusCode: 200, message: 'OK', data: { phone: '0912345678', type: 'REGISTER', expiresInSeconds: 300, devOtp: '123456' } }, headers: {}, config }
      return { status: 200, data: { statusCode: 200, message: 'Hợp lệ', data: { verified: true } }, headers: {}, config }
    }
    t.after(() => { clientMod.default.defaults.adapter = prevAdapter })

    assert.equal(await authApi.checkPhone('0912345678'), true)
    const sentOtp = await authApi.sendOtp('0912345678', 'REGISTER')
    assert.equal(sentOtp.devOtp, '123456')
    const verified = await authApi.verifyOtp({ phone: '0912345678', otpCode: '123456', type: 'REGISTER' })
    assert.equal(verified.statusCode, 200)
    assert.deepEqual(requests.map((r) => `${r.method} ${r.url}`), [
      'GET /api/auth/check-phone',
      'POST /api/auth/send-otp',
      'POST /api/auth/verify-otp',
    ])
  })

  await t.test('Module 03: MasterData gộp ca, CourtFormModal 7 ngày, OwnerSlots & Player/Admin imports', async () => {
    const [{ default: MasterDataManagement }, masterDataApi, { default: CourtFormModal }, clientMod] = await Promise.all([
      server.ssrLoadModule('/src/Admin/MasterData/MasterDataManagement.jsx'),
      server.ssrLoadModule('/src/api/admin/masterDataApi.js'),
      server.ssrLoadModule('/src/CourtOwner/Courts/CourtFormModal.jsx'),
      server.ssrLoadModule('/src/api/apiClient.js'),
    ])

    const mdHtml = render(MasterDataManagement)
    assert.ok(mdHtml.includes('Gộp ca theo môn'))

    const prevAdapter = clientMod.default.defaults.adapter
    let mergeReq = null
    clientMod.default.defaults.adapter = async (config) => {
      mergeReq = config
      return { status: 200, data: { statusCode: 200, message: 'Đã gộp 4 ca', data: { mergedCount: 4 } }, headers: {}, config }
    }
    t.after(() => { clientMod.default.defaults.adapter = prevAdapter })

    const mergeRes = await masterDataApi.mergeCourtSlotsToSportLength()
    assert.equal(mergeReq.method?.toUpperCase(), 'POST')
    assert.equal(mergeReq.url, '/api/v1/admin/master-data/court-slots/merge-to-sport-length')
    assert.equal(mergeRes.message, 'Đã gộp 4 ca')

    const courtModalHtml = render(CourtFormModal, {
      court: {
        id: 'c1',
        name: 'Sân 1',
        categoryId: 's1',
        defaultPrice: 120000,
        availableSlotsNext7Days: 14,
        effectiveSlotMinutes: 120,
        minUpcomingPrice: 100000,
        maxUpcomingPrice: 150000,
      },
      sports: [{ id: 's1', name: 'Cầu lông', defaultSlotMinutes: 120 }],
      onClose: () => {},
      onSubmit: () => {},
    })
    assert.ok(courtModalHtml.includes('14 ca trống 7 ngày tới'))
    assert.ok(courtModalHtml.includes('Thời lượng áp dụng: 120 phút'))

    const checks = [
      ['../src/Admin/Facilities/FacilityDetails.jsx', /\bgetFacilityCourts\b/],
      ['../src/CourtOwner/Courts/CourtManage.jsx', /\bgetCourt\b/],
      ['../src/CourtOwner/Slots/OwnerSlots.jsx', /\bgetFacilityAvailability\b/],
      ['../src/CourtOwner/Slots/OwnerSlots.jsx', /\bgenerateCourtSlots\b/],
      ['../src/CourtOwner/Slots/OwnerSlots.jsx', /\bgenerateFacilitySlots\b/],
      ['../src/CourtOwner/Slots/OwnerSlots.jsx', /Khung giá riêng/],
      ['../src/Player/Booking/FindCourt/MapBooking.jsx', /\bgetFacilityLocations\b/],
      ['../src/Player/Booking/CourtDetail/CourtDetails.jsx', /\bgetFacilityAvailability\b/],
    ]
    for (const [rel, pattern] of checks) {
      const content = await readFile(new URL(rel, import.meta.url), 'utf8')
      assert.match(content, pattern, `${rel} thiếu kết nối ${pattern}`)
    }

    const { default: OwnerSlots } = await server.ssrLoadModule('/src/CourtOwner/Slots/OwnerSlots.jsx')
    const ownerSlotsHtml = renderToString(
      createElement(
        MemoryRouter,
        { initialEntries: ['/owner/slots'] },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            { element: createElement(Outlet, { context: { facilityId: 'fac-1', facility: { name: 'Sân Test' } } }) },
            createElement(Route, { path: '*', element: createElement(OwnerSlots) })
          )
        )
      )
    ).replaceAll('<!-- -->', '')

    for (const cls of ['snx-btn--amber', 'snx-btn--green', 'snx-btn--blue', 'snx-btn--red']) {
      assert.ok(ownerSlotsHtml.includes(cls), `OwnerSlots thiếu class nút ${cls}`)
    }
    for (const label of ['Khóa ca trống', 'Mở lại ca đã khóa', 'Đổi giá', 'Xóa ca', 'Mọi ngày', 'Chọn thứ trong tuần']) {
      assert.ok(ownerSlotsHtml.includes(label), `OwnerSlots thiếu nhãn ${label}`)
    }
    for (const removed of ['Bỏ trống giờ =', 'Ca đã có khách đặt luôn được giữ nguyên', 'Nghỉ lễ, bảo trì']) {
      assert.ok(!ownerSlotsHtml.includes(removed), `OwnerSlots vẫn còn dòng đã xóa: ${removed}`)
    }
  })

  await t.test('Module 08: getTeamMembers chuẩn hóa dữ liệu thành viên và được TeamsPanel sử dụng', async () => {
    const [teamApi, clientMod, teamsPanelSrc] = await Promise.all([
      server.ssrLoadModule('/src/api/player/teamApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      readFile(new URL('../src/Player/Tournament/TeamsPanel.jsx', import.meta.url), 'utf8'),
    ])

    assert.match(teamsPanelSrc, /\bgetTeamMembers\b/)

    const prevAdapter = clientMod.default.defaults.adapter
    let requestedUrl = ''
    clientMod.default.defaults.adapter = async (config) => {
      requestedUrl = config.url
      return {
        status: 200,
        data: {
          statusCode: 200,
          message: 'OK',
          data: [{ accountId: 'u1', fullName: 'Nguyễn Văn A', phone: '0901234567', avatarUrl: null, joinedAt: '2026-11-10T07:59:14Z' }],
        },
        headers: {},
        config,
      }
    }
    t.after(() => { clientMod.default.defaults.adapter = prevAdapter })

    const members = await teamApi.getTeamMembers('team-123')
    assert.equal(requestedUrl, '/api/v1/teams/team-123/members')
    assert.deepEqual(members, [{
      accountId: 'u1',
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      avatarUrl: null,
      joinedAt: '2026-11-10T07:59:14Z',
    }])
  })

  await t.test('AdminDashboard: 6 thẻ tổng quan, xu hướng nền tảng, môn phổ biến và 4 yêu cầu chờ xử lý dùng màu sắc riêng biệt', async () => {
    const [{ default: AdminDashboard }, dashboardSrc] = await Promise.all([
      server.ssrLoadModule('/src/Admin/Dashboard/AdminDashboard.jsx'),
      readFile(new URL('../src/Admin/Dashboard/AdminDashboard.jsx', import.meta.url), 'utf8'),
    ])
    const html = render(AdminDashboard, {}, true)
    for (const tone of ['blue', 'violet', 'teal', 'amber', 'emerald', 'rose']) {
      assert.ok(html.includes(`admin-stat-card--${tone}`), `Thiếu biến thể màu admin-stat-card--${tone}`)
    }
    for (const metric of ['revenue', 'bookings', 'users']) {
      assert.ok(html.includes(`admin-trend-metric--${metric}`), `Thiếu biến thể màu admin-trend-metric--${metric}`)
    }
    for (const attnTone of ['violet', 'red', 'amber', 'teal']) {
      assert.ok(html.includes(`admin-attention-card ${attnTone}`), `Thiếu biến thể màu admin-attention-card ${attnTone}`)
    }
    for (const sportTone of ['emerald', 'blue', 'amber', 'violet', 'rose', 'teal']) {
      assert.match(dashboardSrc, new RegExp(`SPORT_TONES[\\s\\S]*'${sportTone}'`), `Thiếu màu môn phổ biến ${sportTone}`)
    }
  })

  await t.test('Admin: đồng bộ toàn bộ font chữ sang Times New Roman', async () => {
    const [themeCss, dashboardCss, layoutSrc] = await Promise.all([
      readFile(new URL('../src/Admin/styles/admin-theme.css', import.meta.url), 'utf8'),
      readFile(new URL('../src/Admin/Dashboard/dashboard.css', import.meta.url), 'utf8'),
      readFile(new URL('../src/Admin/Layout/AdminLayout.jsx', import.meta.url), 'utf8'),
    ])
    assert.match(themeCss, /--font-admin:\s*'Times New Roman',\s*Times,\s*serif;/)
    assert.match(themeCss, /--font-sans:\s*var\(--font-admin\);/)
    assert.match(themeCss, /--font-display:\s*var\(--font-admin\);/)
    assert.match(themeCss, /body\.sn-admin-active\s*\{/)
    assert.doesNotMatch(dashboardCss, /ui-monospace/)
    assert.match(layoutSrc, /sn-admin-active/)
  })
})
