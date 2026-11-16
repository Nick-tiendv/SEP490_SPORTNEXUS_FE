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

  await t.test('lfgSuggestionEngine tính Haversine theo tọa độ thực và trả null khi thiếu tọa độ', async () => {
    const engine = await server.ssrLoadModule('/src/Player/LFG/lfgSuggestionEngine.js')

    const hanoiDist = engine.calculateDistanceFromRegisteredAddress({
      userCoords: { lat: 21.0285, lng: 105.8542 },
      targetLat: 21.0365,
      targetLng: 105.8342,
    })
    assert.equal(typeof hanoiDist, 'number')
    assert.ok(hanoiDist > 1.5 && hanoiDist < 3.0, `Khoảng cách Hà Nội thực tế phải ~2.3 km, nhận ${hanoiDist}`)

    // Không tự bịa khoảng cách khi chỉ truyền tên quận mà không có tọa độ
    const noCoordsDist = engine.calculateDistanceFromRegisteredAddress({
      registeredAddress: 'Quận 2, TP.HCM',
      targetAddress: 'Quận 9, TP.HCM',
    })
    assert.equal(noCoordsDist, null)

    assert.equal(engine.getDistanceRangeInfo(null).key, 'unknown')
    assert.equal(engine.getDistanceRangeInfo(null).id, 'range_unknown')

    const profileSports = [{ sportKey: 'badminton', sportName: 'Cầu lông', skillKey: 'all', skillLabel: 'Tất cả' }]

    // Thiếu tọa độ vẫn giữ item ở chế độ distanceRangeKey = 'all' và không gắn mặc định TP.HCM / Thủ Đức
    const withoutCoordsResult = engine.buildPersonalizedLfgSuggestions({
      profileSports,
      userProfileLocation: '',
      userCoords: null,
      activeFilters: { sport: 'all', distanceRangeKey: 'all', timeSlots: [] },
      facilities: [
        { id: 'fac-hn', name: 'Sân Cầu Lông Hoàn Kiếm', provinceName: 'Hà Nội', sports: ['badminton'] },
      ],
      matches: [
        { id: 'm-hn', title: 'Giao lưu tối', sport: 'badminton', location: 'Phường Cửa Nam, Hà Nội', timeSlot: 'evening' },
      ],
      communityPosts: [
        { id: 'p-hn', content: 'Tìm bạn đánh cầu', sportName: 'badminton', location: 'Phường Cửa Nam, Hà Nội' },
      ],
    })

    assert.equal(withoutCoordsResult.suggestedVenues.length, 1)
    assert.equal(withoutCoordsResult.suggestedVenues[0].distanceKm, null)
    assert.equal(withoutCoordsResult.suggestedVenues[0].etaMinutes, null)
    assert.equal(withoutCoordsResult.suggestedVenues[0].address, 'Hà Nội')

    assert.equal(withoutCoordsResult.suggestedMatches.length, 1)
    assert.equal(withoutCoordsResult.suggestedMatches[0].distanceKm, null)
    assert.equal(withoutCoordsResult.suggestedMatches[0].etaMinutes, null)

    assert.equal(withoutCoordsResult.suggestedPosts.length, 1)
    assert.equal(withoutCoordsResult.suggestedPosts[0].distanceKm, null)
    assert.equal(withoutCoordsResult.suggestedPosts[0].etaMinutes, null)

    // Có tọa độ thực: sắp xếp gần -> xa và lọc đúng theo maxDistanceKm
    const withCoordsResult = engine.buildPersonalizedLfgSuggestions({
      profileSports,
      userProfileLocation: 'Đà Nẵng',
      userCoords: { lat: 16.0544, lng: 108.2022 },
      activeFilters: { sport: 'all', distanceRangeKey: 'all', maxDistanceKm: 10, timeSlots: [] },
      facilities: [
        { id: 'far-hn', name: 'Sân Hà Nội', provinceName: 'Hà Nội', lat: 21.0285, lng: 105.8542, sports: ['badminton'] },
        { id: 'near-dn', name: 'Sân Đà Nẵng', provinceName: 'Đà Nẵng', lat: 16.0605, lng: 108.2102, sports: ['badminton'] },
      ],
      matches: [],
      communityPosts: [],
    })

    assert.equal(withCoordsResult.suggestedVenues.length, 1)
    assert.equal(withCoordsResult.suggestedVenues[0].id, 'near-dn')
    assert.ok(withCoordsResult.suggestedVenues[0].distanceKm > 0 && withCoordsResult.suggestedVenues[0].distanceKm < 3)
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
    })
    assert.equal(withCoordsCourt.lat, 21.0285)
    assert.equal(withCoordsCourt.lng, 105.8542)

    assert.equal(facilityApi.detectDistrictFromAddress(''), '')
    assert.equal(facilityApi.detectDistrictFromAddress('12 Trần Hưng Đạo, Phường Cửa Nam, Hà Nội'), 'phuongcuanam')
  })
})
