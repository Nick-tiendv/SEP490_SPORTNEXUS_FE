import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

test('P2: Ví Voucher, Team vs Team, Ticket Cảnh Báo Admin & Thống kê sân con', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('1. Ví Voucher (Player): GET /api/v1/wallet/vouchers, normalize và menu Mã giảm giá', async (st) => {
    const prevStorage = globalThis.localStorage
    const store = new Map()
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    }
    st.after(() => {
      if (prevStorage === undefined) delete globalThis.localStorage
      else globalThis.localStorage = prevStorage
    })

    const [walletApi, clientMod, { AuthContext }, { default: WalletEscrow }, { default: TopSideBar }, appSrc] = await Promise.all([
      server.ssrLoadModule('/src/api/player/walletApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      server.ssrLoadModule('/src/context/authContext.js'),
      server.ssrLoadModule('/src/Player/Wallet/WalletEscrow.jsx'),
      server.ssrLoadModule('/src/Player/Layout/TopSideBar.jsx'),
      readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    ])

    const prevAdapter = clientMod.default.defaults.adapter
    let requested = null
    clientMod.default.defaults.adapter = async (config) => {
      requested = { method: config.method?.toUpperCase(), url: config.url, params: config.params }
      return {
        status: 200,
        data: {
          statusCode: 200,
          message: 'OK',
          data: [
            {
              id: 'v-1',
              code: 'CANCEL10-ABC',
              discountPercent: 10,
              status: 'AVAILABLE',
              description: 'Voucher 10% do chủ sân bị phạt hủy đơn',
              facilityName: 'Sân Cầu Lông Victory',
              expiresAt: '2026-12-31T23:59:59Z',
            },
          ],
        },
        headers: {},
        config,
      }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    const vouchers = await walletApi.getWalletVouchers()
    assert.deepEqual(requested, { method: 'GET', url: '/api/v1/wallet/vouchers', params: undefined })
    assert.equal(vouchers.length, 1)
    assert.equal(vouchers[0].code, 'CANCEL10-ABC')
    assert.equal(vouchers[0].discountPercent, 10)
    assert.equal(vouchers[0].status, 'AVAILABLE')

    const authValue = {
      token: null,
      role: null,
      isMockSession: false,
      isAuthenticated: false,
      login: () => {},
      logout: () => {},
    }
    const walletHtml = renderToString(
      createElement(
        AuthContext.Provider,
        { value: authValue },
        createElement(MemoryRouter, { initialEntries: ['/wallet/vouchers'] }, createElement(WalletEscrow)),
      ),
    ).replaceAll('<!-- -->', '')
    assert.ok(walletHtml.includes('Mã giảm giá'))
    assert.ok(walletHtml.includes('Kho Mã giảm giá (Voucher)'))

    const sidebarHtml = renderToString(
      createElement(
        AuthContext.Provider,
        { value: authValue },
        createElement(MemoryRouter, { initialEntries: ['/wallet'] }, createElement(TopSideBar, { open: true, onClose: () => {} })),
      ),
    ).replaceAll('<!-- -->', '')
    assert.ok(sidebarHtml.includes('Mã giảm giá'))
    assert.match(appSrc, /path="\/wallet\/vouchers"/)
  })

  await t.test('2 & 3. Team vs Team: hostTeamId, challengerTeamId, helper và UI Feed/Modal', async () => {
    const [lfgApi, clientMod, createMatchSrc, feedSrc, flashSrc] = await Promise.all([
      server.ssrLoadModule('/src/api/player/lfgApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      readFile(new URL('../src/Player/LFG/CreateMatch.jsx', import.meta.url), 'utf8'),
      readFile(new URL('../src/Player/LFG/CommunityFeed.jsx', import.meta.url), 'utf8'),
      readFile(new URL('../src/Player/LFG/FlashClaim.jsx', import.meta.url), 'utf8'),
    ])

    const prevAdapter = clientMod.default.defaults.adapter
    const requests = []
    clientMod.default.defaults.adapter = async (config) => {
      requests.push({
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data ? JSON.parse(config.data) : null,
      })
      return { status: 200, data: { statusCode: 200, data: { id: 'card-1' } }, headers: {}, config }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    await lfgApi.createLfg({
      courtSlotId: 'slot-1',
      slotsNeeded: 5,
      hostTeamId: 'team-host-1',
    })
    await lfgApi.claimLfgSlot('card-1', {
      challengerTeamId: 'team-challenger-2',
    })

    assert.equal(requests[0].url, '/api/v1/lfgs')
    assert.equal(requests[0].data.hostTeamId, 'team-host-1')
    assert.equal(requests[1].url, '/api/v1/lfgs/card-1/claim')
    assert.equal(requests[1].data.challengerTeamId, 'team-challenger-2')

    assert.equal(lfgApi.isCaptainOfTeam({ captainId: 'User-1' }, 'user-1'), true)
    assert.equal(lfgApi.isCaptainOfTeam({ captainId: 'User-2' }, 'user-1'), false)

    const teamInfo = lfgApi.extractLfgTeamInfo({
      hostTeamId: 't1',
      hostTeamName: 'FC Rồng Vàng',
      challengerTeamId: 't2',
      challengerTeamName: 'FC Bão Đêm',
    })
    assert.equal(teamInfo.isTeamMatch, true)
    assert.equal(teamInfo.hostTeamName, 'FC Rồng Vàng')
    assert.equal(teamInfo.challengerTeamName, 'FC Bão Đêm')

    assert.match(createMatchSrc, /Chọn Đội Đại Diện/)
    assert.match(createMatchSrc, /hostTeamId/)
    assert.match(feedSrc, /Nhận kèo bằng Đội/)
    assert.match(feedSrc, /challengerTeamId/)
    assert.match(feedSrc, /isTeamMatch/)
    assert.match(flashSrc, /Nhận kèo bằng Đội/)
    assert.match(flashSrc, /challengerTeamId/)
  })

  await t.test('4. Ticket Cảnh Báo (Admin): pendingFairPlayDelta, viền đỏ, RESOLVE_NO_REFUND và REJECT', async () => {
    const [reportApi, reviewsData, clientMod, pageSrc, cssSrc] = await Promise.all([
      server.ssrLoadModule('/src/api/admin/reportApi.js'),
      server.ssrLoadModule('/src/Admin/Reviews/reviewsData.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      readFile(new URL('../src/Admin/Reviews/ReviewsReportsPage.jsx', import.meta.url), 'utf8'),
      readFile(new URL('../src/Admin/Reviews/reviews.css', import.meta.url), 'utf8'),
    ])

    const warningReport = reportApi.toReport({
      id: 'rep-warn-1',
      reportCode: 'RPT-999',
      status: 'PENDING',
      pendingFairPlayDelta: -15,
      reason: 'Nghi vấn review bombing',
    })
    const normalReport = reportApi.toReport({
      id: 'rep-norm-1',
      reportCode: 'RPT-100',
      status: 'PENDING',
      pendingFairPlayDelta: null,
      reason: 'Sân trơn',
    })

    assert.equal(warningReport.pendingFairPlayDelta, -15)
    assert.equal(normalReport.pendingFairPlayDelta, null)
    assert.equal(reviewsData.hasPendingFairPlayPenalty(warningReport), true)
    assert.equal(reviewsData.hasPendingFairPlayPenalty(normalReport), false)
    assert.equal(reviewsData.formatPendingFairPlayDelta(-15), '-15 điểm')

    const prevAdapter = clientMod.default.defaults.adapter
    const sentDecisions = []
    clientMod.default.defaults.adapter = async (config) => {
      const body = config.data ? JSON.parse(config.data) : null
      sentDecisions.push({ url: config.url, decision: body?.decision })
      return { status: 200, data: { statusCode: 200, data: {} }, headers: {}, config }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    await reportApi.resolveAdminReport('rep-warn-1', { decision: 'RESOLVE_NO_REFUND', adminNote: 'Giữ phạt' })
    await reportApi.resolveAdminReport('rep-warn-1', { decision: 'REJECT', adminNote: 'Xóa phạt' })
    assert.deepEqual(sentDecisions, [
      { url: '/api/v1/reports/admin/rep-warn-1/resolve', decision: 'RESOLVE_NO_REFUND' },
      { url: '/api/v1/reports/admin/rep-warn-1/resolve', decision: 'REJECT' },
    ])

    assert.match(cssSrc, /\.rr-row-warning/)
    assert.match(cssSrc, /#dc2626/)
    assert.match(pageSrc, /rr-row-warning/)
    assert.match(pageSrc, /Duyệt - Giữ nguyên phạt/)
    assert.match(pageSrc, /Bác bỏ - Xóa phạt/)
    assert.match(pageSrc, /RESOLVE_NO_REFUND/)
    assert.match(pageSrc, /REJECT/)
  })

  await t.test('5. Thống kê doanh thu từng sân con (Admin & Owner)', async () => {
    const [facilityApi, dashboardApi, clientMod, { default: FacilityDetails }, { default: OwnerDashboard }] = await Promise.all([
      server.ssrLoadModule('/src/api/admin/facilityApi.js'),
      server.ssrLoadModule('/src/api/admin/dashboardApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      server.ssrLoadModule('/src/Admin/Facilities/FacilityDetails.jsx'),
      server.ssrLoadModule('/src/CourtOwner/Dashboard/Dashboard.jsx'),
    ])

    const prevAdapter = clientMod.default.defaults.adapter
    let reqConfig = null
    clientMod.default.defaults.adapter = async (config) => {
      reqConfig = { url: config.url, params: config.params }
      return {
        status: 200,
        data: {
          statusCode: 200,
          data: [
            { courtId: 'c1', courtName: 'Sân 1', bookings: 12, revenue: 1800000, occupancyRate: 75 },
            { courtId: 'c2', courtName: 'Sân 2', bookings: 8, revenue: 1200000, occupancyRate: 50 },
          ],
        },
        headers: {},
        config,
      }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    const stats = await facilityApi.getAdminFacilityCourtStatistics('fac-1', { from: '2026-11-01', to: '2026-11-17' })
    assert.equal(reqConfig.url, '/api/v1/admin/facilities/fac-1/courts/statistics')
    assert.deepEqual(reqConfig.params, { from: '2026-11-01', to: '2026-11-17' })
    assert.equal(stats.items.length, 2)
    assert.equal(stats.totalBookings, 20)
    assert.equal(stats.totalRevenue, 3000000)
    assert.equal(dashboardApi.ADMIN_COURT_STATS_READY, true)

    const facilityHtml = renderToString(
      createElement(FacilityDetails, {
        facility: {
          id: 'fac-1',
          name: 'Cụm sân Test',
          status: 'Active',
          images: [],
          sports: [],
          amenities: [],
          courts: [],
          owner: { name: 'Chủ sân' },
        },
        onClose: () => {},
        onEdit: () => {},
        onAction: () => {},
        onBookings: () => {},
        onPhoto: () => {},
      }),
    ).replaceAll('<!-- -->', '')
    assert.ok(facilityHtml.includes('Thống kê doanh thu sân con'))

    const { Outlet, Route, Routes } = await import('react-router-dom')
    const ownerCtx = {
      facilityId: 'fac-1',
      facility: { id: 'fac-1', name: 'Cụm sân Test', courtCount: 2, status: 'Active' },
      facilities: [{ id: 'fac-1', name: 'Cụm sân Test' }],
      wallet: { balance: 0 },
      profile: { fullName: 'Chủ sân Test' },
      loading: false,
    }
    const ownerHtml = renderToString(
      createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            { element: createElement(Outlet, { context: ownerCtx }) },
            createElement(Route, { path: '/', element: createElement(OwnerDashboard) }),
          ),
        ),
      ),
    ).replaceAll('<!-- -->', '')
    assert.ok(ownerHtml.includes('Thống kê doanh thu từng sân con'))
  })
})
