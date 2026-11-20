import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'

const SRC_ROOT = fileURLToPath(new URL('../src', import.meta.url))

async function collectSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(SRC_ROOT, fullPath).replace(/\\/g, '/')
    if (entry.isDirectory()) {
      if (relPath === 'data' || relPath.startsWith('data/')) continue
      files.push(...(await collectSourceFiles(fullPath)))
    } else if (/\.(js|jsx|mjs)$/.test(entry.name)) {
      files.push({ fullPath, relPath })
    }
  }
  return files
}

test('Dọn dẹp dữ liệu hardcode quận cũ TP.HCM, tọa độ mặc định và placeholder tìm kiếm', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('Mã nguồn src/ không còn bảng khoảng cách quận cũ, tọa độ mặc định Thủ Đức hay placeholder Quận 2/7', async () => {
    const sourceFiles = await collectSourceFiles(SRC_ROOT)
    const forbiddenSymbols =
      /\b(DISTRICT_DISTANCE_MATRIX|DISTRICT_DISTANCES|DISTRICT_CENTERS|DISTRICT_COORDS|LEGACY_AREA_COORDS|DISTRICT_INFO|detectDistrictKey)\b|DISTRICTS\[/

    for (const file of sourceFiles) {
      const content = await readFile(file.fullPath, 'utf8')
      assert.doesNotMatch(
        content,
        forbiddenSymbols,
        `File ${file.relPath} vẫn còn tham chiếu dữ liệu quận cũ`
      )
    }

    const cleanedTargets = [
      'Player/LFG/lfgSuggestionEngine.js',
      'Player/Booking/AIChat/aiBookingData.js',
      'Player/Booking/AIChat/AIChatBooking.jsx',
      'Player/Booking/AIChat/AIChatModal.jsx',
      'Auth/Register.jsx',
      'api/player/facilityApi.js',
      'Player/Booking/FindCourt/InteractiveCourtMap.jsx',
      'Player/Booking/FindCourt/MapBooking.jsx',
      'Player/LFG/CreateMatch.jsx',
      'Player/LFG/CommunityFeed.jsx',
      'Player/Home/Dashboard.jsx',
    ]

    for (const relPath of cleanedTargets) {
      const content = await readFile(path.join(SRC_ROOT, relPath), 'utf8')
      assert.doesNotMatch(
        content,
        /['"`][^'"`\r\n]*(?:TP\.\s*Thủ Đức|Thủ Đức|Quận [279])[^'"`\r\n]*['"`]/i,
        `${relPath} vẫn còn chuỗi hardcode Thủ Đức / Quận 2/7/9`
      )
      assert.doesNotMatch(content, />[^<\r\n]*Quận [279][^<\r\n]*</, `${relPath} vẫn còn nhãn JSX Quận 2/7/9`)
      assert.doesNotMatch(content, /10\.849|106\.7537|106\.7725/, `${relPath} vẫn còn tọa độ mặc định Thủ Đức`)
    }

    const placeholderTargets = [
      'Auth/Register.jsx',
      'Player/Home/Dashboard.jsx',
      'Player/Booking/FindCourt/InteractiveCourtMap.jsx',
      'Player/Booking/FindCourt/MapBooking.jsx',
      'Player/LFG/CreateMatch.jsx',
    ]
    for (const relPath of placeholderTargets) {
      const content = await readFile(path.join(SRC_ROOT, relPath), 'utf8')
      assert.match(
        content,
        /placeholder="[^"]*Tên đường, phường, tỉnh[^"]*"/i,
        `${relPath} chưa dùng placeholder chuẩn "Tên đường, phường, tỉnh..."`
      )
    }
  })

  await t.test('lfgSuggestionEngine và CommunityFeed không còn tự tính Haversine mà đọc trực tiếp distanceKm từ API', async () => {
    const engine = await server.ssrLoadModule('/src/Player/LFG/lfgSuggestionEngine.js')
    const [engineSrc, feedSrc, createMatchSrc] = await Promise.all([
      readFile(path.join(SRC_ROOT, 'Player/LFG/lfgSuggestionEngine.js'), 'utf8'),
      readFile(path.join(SRC_ROOT, 'Player/LFG/CommunityFeed.jsx'), 'utf8'),
      readFile(path.join(SRC_ROOT, 'Player/LFG/CreateMatch.jsx'), 'utf8'),
    ])

    for (const src of [engineSrc, feedSrc, createMatchSrc]) {
      assert.doesNotMatch(src, /\b(haversineKm|calculateDistanceFromRegisteredAddress|realDistanceKm)\b/)
    }

    // Mốc hủy kèo LFG: số liệu chính sách gom ở lfgPolicy.js (48h); FE không tự tính mốc khóa mà dùng isLocked / hostCancelUntil của BE
    const policySrc = await readFile(new URL('../src/Player/LFG/lfgPolicy.js', import.meta.url), 'utf8')
    assert.match(policySrc, /lockHours: 48/)
    assert.doesNotMatch(feedSrc, /HOST_CANCEL_BEFORE_MS/)
    assert.match(feedSrc, /hostCancelUntil/)
    assert.match(feedSrc, /dưới \{LOCK_H\} giờ trước giờ chơi/)
    assert.match(feedSrc, /trước giờ chơi từ \$\{LOCK_H\} tiếng trở lên/)
    assert.doesNotMatch(feedSrc, /tới 24 giờ trước giờ chơi|Mốc T − 24 giờ|tới trước giờ chơi 24 tiếng|dưới 24 tiếng trước giờ chơi/)

    assert.equal(engine.haversineKm, undefined)
    assert.equal(engine.calculateDistanceFromRegisteredAddress, undefined)
    assert.equal(engine.getDistanceRangeInfo(null).key, 'unknown')
    assert.equal(engine.getDistanceRangeInfo(null).id, 'range_unknown')

    const profileSports = [{ sportKey: 'badminton', sportName: 'Cầu lông', skillKey: 'all', skillLabel: 'Tất cả' }]

    // Thiếu distanceKm từ API (dù có lat/lng) vẫn trả null ở chế độ distanceRangeKey = 'all', không tự tính Haversine ở FE
    const withoutApiDistanceResult = engine.buildPersonalizedLfgSuggestions({
      profileSports,
      userProfileLocation: '',
      activeFilters: { sport: 'all', distanceRangeKey: 'all', timeSlots: [] },
      facilities: [
        { id: 'fac-hn', name: 'Sân Cầu Lông Hoàn Kiếm', provinceName: 'Hà Nội', lat: 21.0285, lng: 105.8542, sports: ['badminton'] },
      ],
      matches: [
        { id: 'm-hn', title: 'Giao lưu tối', sport: 'badminton', location: 'Phường Cửa Nam, Hà Nội', lat: 21.0285, lng: 105.8542, timeSlot: 'evening' },
      ],
      communityPosts: [
        { id: 'p-hn', content: 'Tìm bạn đánh cầu', sportName: 'badminton', location: 'Phường Cửa Nam, Hà Nội', lat: 21.0285, lng: 105.8542 },
      ],
    })

    assert.equal(withoutApiDistanceResult.suggestedVenues.length, 1)
    assert.equal(withoutApiDistanceResult.suggestedVenues[0].distanceKm, null)
    assert.equal(withoutApiDistanceResult.suggestedVenues[0].etaMinutes, null)
    assert.equal(withoutApiDistanceResult.suggestedVenues[0].address, 'Hà Nội')

    assert.equal(withoutApiDistanceResult.suggestedMatches.length, 1)
    assert.equal(withoutApiDistanceResult.suggestedMatches[0].distanceKm, null)
    assert.equal(withoutApiDistanceResult.suggestedMatches[0].etaMinutes, null)

    assert.equal(withoutApiDistanceResult.suggestedPosts.length, 1)
    assert.equal(withoutApiDistanceResult.suggestedPosts[0].distanceKm, null)
    assert.equal(withoutApiDistanceResult.suggestedPosts[0].etaMinutes, null)

    // API trả sẵn distanceKm: đọc trực tiếp, sắp xếp gần -> xa và lọc đúng theo maxDistanceKm
    const withApiDistanceResult = engine.buildPersonalizedLfgSuggestions({
      profileSports,
      userProfileLocation: 'Đà Nẵng',
      activeFilters: { sport: 'all', distanceRangeKey: 'all', maxDistanceKm: 10, timeSlots: [] },
      facilities: [
        { id: 'far-hn', name: 'Sân Hà Nội', provinceName: 'Hà Nội', distanceKm: 620.5, sports: ['badminton'] },
        { id: 'near-dn', name: 'Sân Đà Nẵng', provinceName: 'Đà Nẵng', distanceKm: 2.3, sports: ['badminton'] },
      ],
      matches: [
        { id: 'm-far', title: 'Kèo xa', sport: 'badminton', distanceKm: 18.0, timeSlot: 'evening' },
        { id: 'm-near', title: 'Kèo gần', sport: 'badminton', distanceKm: 1.8, timeSlot: 'evening' },
      ],
      communityPosts: [
        { id: 'p-near', content: 'Giao lưu cầu lông', sportName: 'badminton', sharedLfg: { distanceKm: 4.2 } },
      ],
    })

    assert.equal(withApiDistanceResult.suggestedVenues.length, 1)
    assert.equal(withApiDistanceResult.suggestedVenues[0].id, 'near-dn')
    assert.equal(withApiDistanceResult.suggestedVenues[0].distanceKm, 2.3)

    assert.equal(withApiDistanceResult.suggestedMatches.length, 1)
    assert.equal(withApiDistanceResult.suggestedMatches[0].id, 'm-near')
    assert.equal(withApiDistanceResult.suggestedMatches[0].distanceKm, 1.8)

    assert.equal(withApiDistanceResult.suggestedPosts.length, 1)
    assert.equal(withApiDistanceResult.suggestedPosts[0].distanceKm, 4.2)
  })

  await t.test('aiBookingData không mặc định về TP. Thủ Đức hay Quận 7 khi thiếu dữ liệu hồ sơ', async (t) => {
    const prevStorage = globalThis.localStorage
    const store = new Map()
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    }
    t.after(() => {
      if (prevStorage === undefined) delete globalThis.localStorage
      else globalThis.localStorage = prevStorage
    })

    const aiBookingData = await server.ssrLoadModule('/src/Player/Booking/AIChat/aiBookingData.js')

    const emptyCtx = aiBookingData.getUserProfileContext()
    assert.equal(emptyCtx.rawLocation, '')
    assert.equal(emptyCtx.lat, null)
    assert.equal(emptyCtx.lng, null)

    const welcome = aiBookingData.buildWelcomeMessage(null, emptyCtx)
    assert.doesNotMatch(welcome.text, /Thủ Đức|Quận 7/i)

    store.set(
      'player_profile_data',
      JSON.stringify({ location: 'Phường Hải Châu, Đà Nẵng', latitude: 16.0544, longitude: 108.2022 })
    )
    const daNangCtx = aiBookingData.getUserProfileContext()
    assert.equal(daNangCtx.rawLocation, 'Phường Hải Châu, Đà Nẵng')
    assert.equal(daNangCtx.lat, 16.0544)
    assert.equal(daNangCtx.lng, 108.2022)
  })

  await t.test('facilityApi không điền tọa độ mặc định Thủ Đức và nhận diện khu vực tỉnh/thành bất kỳ', async () => {
    const facilityApi = await server.ssrLoadModule('/src/api/player/facilityApi.js')

    const noCoordsCourt = facilityApi.transformFacilityToCourt({
      id: 'f1',
      name: 'Sân Hải Phòng',
      address: '10 Lạch Tray, Phường Lạch Tray, Hải Phòng',
      province: 'Hải Phòng',
      courts: [{ id: 'c1', categoryName: 'Badminton', defaultPrice: 90000, status: 'ACTIVE' }],
    })
    assert.equal(noCoordsCourt.lat, null)
    assert.equal(noCoordsCourt.lng, null)
    assert.equal(noCoordsCourt.latitude, null)
    assert.equal(noCoordsCourt.longitude, null)
    assert.equal(noCoordsCourt.provinceName, 'Hải Phòng')

    const withCoordsCourt = facilityApi.transformFacilityToCourt({
      id: 'f2',
      name: 'Sân Hà Nội',
      address: '12 Trần Hưng Đạo, Phường Cửa Nam, Hà Nội',
      latitude: '21.0285',
      longitude: '105.8542',
      distanceKm: '2.7',
    })
    assert.equal(withCoordsCourt.lat, 21.0285)
    assert.equal(withCoordsCourt.lng, 105.8542)
    assert.equal(withCoordsCourt.distanceKm, 2.7)
    assert.equal(noCoordsCourt.distanceKm, null)

    assert.equal(facilityApi.detectDistrictFromAddress(''), '')
    assert.equal(facilityApi.detectDistrictFromAddress('12 Trần Hưng Đạo, Phường Cửa Nam, Hà Nội'), 'phuongcuanam')
  })

  await t.test('Xóa chức năng Vote hủy kèo LFG và cập nhật luồng hủy đơn phương < 48h có cảnh báo phạt', async () => {
    const [lfgApi, clientMod, lfgApiSrc, feedSrc] = await Promise.all([
      server.ssrLoadModule('/src/api/player/lfgApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
      readFile(path.join(SRC_ROOT, 'api/player/lfgApi.js'), 'utf8'),
      readFile(path.join(SRC_ROOT, 'Player/LFG/CommunityFeed.jsx'), 'utf8'),
    ])

    // 1. Đã xóa 3 hàm vote hủy kèo khỏi lfgApi.js (cả named export lẫn default export)
    assert.equal(lfgApi.createLfgCancelRequest, undefined)
    assert.equal(lfgApi.getLatestLfgCancelRequest, undefined)
    assert.equal(lfgApi.voteLfgCancelRequest, undefined)
    assert.equal(lfgApi.default?.createLfgCancelRequest, undefined)
    assert.equal(lfgApi.default?.getLatestLfgCancelRequest, undefined)
    assert.equal(lfgApi.default?.voteLfgCancelRequest, undefined)
    assert.equal(typeof lfgApi.cancelLfg, 'function')

    assert.doesNotMatch(
      lfgApiSrc,
      /\b(createLfgCancelRequest|getLatestLfgCancelRequest|voteLfgCancelRequest)\b|cancel-requests/,
    )

    // 2. CommunityFeed không còn modal/handler/nút bỏ phiếu hủy kèo
    assert.doesNotMatch(
      feedSrc,
      /\b(cancelVoteModal|handleOpenCancelVoteModal|handleCreateCancelReq|handleVoteCancelReq|cancelRequestReason|cancelRequestPick|isSubmittingCancelReq)\b/,
    )
    assert.doesNotMatch(feedSrc, /Yêu Cầu Hủy \(Bỏ Phiếu\)|Bỏ Phiếu Hủy Kèo|Biểu Quyết Hủy Kèo/)

    // 3. Có luồng kiểm tra isLocked + popup cảnh báo đỏ với compensationTotal & -20 điểm FairPlay
    assert.match(feedSrc, /const isCardLocked = \(card\)/)
    assert.match(feedSrc, /compensationTotal/)
    assert.match(feedSrc, /Hủy kèo sát giờ:/)
    const lfgPolicySrc = await readFile(new URL('../src/Player/LFG/lfgPolicy.js', import.meta.url), 'utf8')
    assert.match(lfgPolicySrc, /lateHostPenaltyPercent: 50/)
    assert.match(lfgPolicySrc, /lateHostFairPlay: 20/)
    assert.match(feedSrc, /\$\{LATE_PCT\}% tiền sân/)
    assert.match(feedSrc, /-\$\{LATE_FP\} điểm FairPlay/)

    // 4. Kiểm tra runtime gọi POST /api/v1/lfgs/{id}/cancel nhận compensationTotal cho kèo dưới 48h (isLocked = true)
    const prevAdapter = clientMod.default.defaults.adapter
    const requests = []
    clientMod.default.defaults.adapter = async (config) => {
      requests.push({
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data ? JSON.parse(config.data) : null,
      })
      return {
        status: 200,
        data: {
          statusCode: 200,
          message: 'Đã hủy kèo sát giờ',
          data: { id: 'card-48h', status: 'CANCELLED', isLocked: true, compensationTotal: 150000 },
        },
        headers: {},
        config,
      }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    const res = await lfgApi.cancelLfg('card-48h', { reason: 'Bận đột xuất' })
    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, 'POST')
    assert.equal(requests[0].url, '/api/v1/lfgs/card-48h/cancel')
    assert.deepEqual(requests[0].data, { reason: 'Bận đột xuất' })
    assert.equal(res.isLocked, true)
    assert.equal(res.compensationTotal, 150000)
  })
})
