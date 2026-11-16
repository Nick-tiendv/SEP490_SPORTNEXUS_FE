import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

test('Tile bản đồ hợp lệ, bật attributionControl và cơ chế geocoding / rate-limit', async t => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })

  try {
    const mapTiles = await server.ssrLoadModule('/src/utils/mapTiles.js')
    const locationApi = await server.ssrLoadModule('/src/api/locationApi.js')
    const mapCompMod = await server.ssrLoadModule('/src/Player/Booking/FindCourt/InteractiveCourtMap.jsx')
    const areaMapMod = await server.ssrLoadModule('/src/components/common/FacilityAreaMap.jsx')
    const InteractiveCourtMap = mapCompMod.default
    const FacilityAreaMap = areaMapMod.default

    await t.test('LocationPickerMap, InteractiveCourtMap và FacilityAreaMap không còn tile Google Maps lậu và đã bật attributionControl: true', async () => {
      const [pickerSrc, courtMapSrc, areaMapSrc, createMatchSrc, mapBookingSrc, mapCssSrc] = await Promise.all([
        readFile(new URL('../src/components/common/LocationPickerMap.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/Booking/FindCourt/InteractiveCourtMap.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/components/common/FacilityAreaMap.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/LFG/CreateMatch.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/Booking/FindCourt/MapBooking.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/Booking/FindCourt/MapBooking.css', import.meta.url), 'utf8'),
      ])

      for (const src of [pickerSrc, courtMapSrc, areaMapSrc]) {
        assert.doesNotMatch(src, /mt[0-3]?\.google\.com|google\.com\/vt|maps\.google\.com/i)
        assert.doesNotMatch(src, /attributionControl\s*:\s*false/)
        assert.match(src, /attributionControl\s*:\s*true/)
        assert.match(src, /getTileLayerConfig/)
      }

      // CreateMatch không còn nhúng iframe Google Maps lậu hay chuỗi cứng TP Ho Chi Minh
      assert.doesNotMatch(createMatchSrc, /<iframe/i)
      assert.doesNotMatch(createMatchSrc, /maps\.google\.com|output=embed|TP Ho Chi Minh/i)
      assert.match(createMatchSrc, /<FacilityAreaMap\b/)

      // MapBooking dùng debounce 1 giây (GEOCODE_DEBOUNCE_MS) khi người dùng nhập địa chỉ tìm sân
      assert.match(mapBookingSrc, /GEOCODE_DEBOUNCE_MS/)

      // Nút zoom góc dưới phải phải nhường chỗ cho thanh attribution của Leaflet
      assert.match(mapCssSrc, /\.sn-map-ctrl-bottom-right\s*\{[^}]*bottom:\s*3[0-9]px/)
      assert.match(mapCssSrc, /\.sn-map-canvas\s+\.leaflet-control-attribution/)
    })

    await t.test('getTileLayerConfig chọn đúng OpenStreetMap / Esri / MapTiler / Mapbox kèm bản quyền', () => {
      const osm = mapTiles.getTileLayerConfig('m', {})
      assert.equal(osm.provider, 'openstreetmap')
      assert.equal(osm.url, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png')
      assert.equal(osm.options.maxZoom, 19)
      assert.equal(osm.options.referrerPolicy, 'strict-origin-when-cross-origin')
      assert.match(osm.options.attribution, /OpenStreetMap/)

      const sat = mapTiles.getTileLayerConfig('k', {})
      assert.equal(sat.provider, 'esri-world-imagery')
      assert.match(sat.url, /arcgisonline\.com/)
      assert.match(sat.options.attribution, /Esri/)

      const maptiler = mapTiles.getTileLayerConfig('k', { VITE_MAPTILER_API_KEY: 'key 123' })
      assert.equal(maptiler.provider, 'maptiler')
      assert.match(maptiler.url, /api\.maptiler\.com\/maps\/hybrid.*key%20123/)
      assert.match(maptiler.options.attribution, /MapTiler/)

      const mapbox = mapTiles.getTileLayerConfig('m', { VITE_MAPBOX_ACCESS_TOKEN: 'pk.test' })
      assert.equal(mapbox.provider, 'mapbox')
      assert.match(mapbox.url, /api\.mapbox\.com\/styles\/v1\/mapbox\/streets-v12.*access_token=pk\.test/)
      assert.match(mapbox.options.attribution, /Mapbox/)
    })

    await t.test('InteractiveCourtMap và FacilityAreaMap render SSR an toàn không nhắc tile Google Maps', () => {
      const courtMapHtml = renderToString(createElement(InteractiveCourtMap, { courts: [] }))
      assert.match(courtMapHtml, /Đang tải bản đồ tương tác/)
      assert.doesNotMatch(courtMapHtml, /Google Maps/i)

      const areaMapHtml = renderToString(createElement(FacilityAreaMap, { facilities: [] }))
      assert.match(areaMapHtml, /Bản đồ cụm sân thể thao/)
      assert.doesNotMatch(areaMapHtml, /Google Maps|iframe/i)
    })

    await t.test('locationApi ưu tiên Backend Proxy khi cấu hình VITE_GEOCODE_PROXY_URL', async () => {
      const calls = []
      const client = locationApi.createLocationClient({
        env: {
          VITE_API_BASE_URL: 'https://api.example.com/api',
          VITE_GEOCODE_PROXY_URL: '/api/v1/locations',
        },
        fetchImpl: async (url, options) => {
          calls.push({ url, options })
          if (url.includes('/search?')) {
            return {
              ok: true,
              status: 200,
              json: async () => ({ data: { lat: 10.77, lng: 106.7, bounds: { south: 10.7, north: 10.8, west: 106.6, east: 106.8 } } }),
            }
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: { displayName: 'Phường Sài Gòn, Thành phố Hồ Chí Minh' } }),
          }
        },
      })

      const geo = await client.geocodeAddress('Quận 1')
      const rev = await client.reverseGeocode(10.7756, 106.7004)
      assert.deepEqual(geo, { lat: 10.77, lng: 106.7, bounds: { south: 10.7, north: 10.8, west: 106.6, east: 106.8 } })
      assert.equal(rev, 'Phường Sài Gòn, Thành phố Hồ Chí Minh')
      assert.equal(calls.length, 2)
      assert.match(calls[0].url, /^https:\/\/api\.example\.com\/api\/v1\/locations\/search\?q=Qu%E1%BA%ADn%201/)
      assert.match(calls[1].url, /^https:\/\/api\.example\.com\/api\/v1\/locations\/reverse\?lat=10\.7756&lon=106\.7004/)
      assert.ok(calls.every(c => !c.url.includes('nominatim.openstreetmap.org')))
      assert.ok(calls.every(c => !c.options?.headers?.['User-Agent']))
    })

    await t.test('locationApi gắn User-Agent chuẩn, debounce 1 giây và rate-limit / cache / circuit-breaker cho Nominatim', async () => {
      assert.equal(locationApi.NOMINATIM_USER_AGENT, 'SportNexus-GraduationProject/1.0')
      assert.equal(locationApi.GEOCODE_DEBOUNCE_MS, 1000)

      let clock = 1000
      const delays = []
      const fetchedRequests = []
      const memStore = new Map()
      let mode = 'ok'

      const fakeStorage = {
        getItem: k => (memStore.has(k) ? memStore.get(k) : null),
        setItem: (k, v) => memStore.set(k, v),
      }

      const client = locationApi.createLocationClient({
        env: {},
        storage: fakeStorage,
        now: () => clock,
        minIntervalMs: 1100,
        debounceMs: 30,
        delay: async ms => {
          delays.push(ms)
          clock += ms
        },
        fetchImpl: async (url, options) => {
          fetchedRequests.push({ url, options })
          if (mode === '429') {
            return {
              ok: false,
              status: 429,
              headers: { get: name => (name.toLowerCase() === 'retry-after' ? '30' : null) },
            }
          }
          if (url.includes('/search?')) {
            return {
              ok: true,
              status: 200,
              json: async () => [{ lat: '10.84', lon: '106.75', boundingbox: ['10.8', '10.9', '106.7', '106.8'] }],
            }
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({ address: { suburb: 'Phường Linh Xuân', city: 'Thành phố Hồ Chí Minh' } }),
          }
        },
      })

      // 0. Debounce chỉ giữ lần gọi cuối sau khi người dùng dừng nhập
      const [debouncedFirst, debouncedSecond] = await Promise.all([
        client.debouncedGeocodeAddress('Hà'),
        client.debouncedGeocodeAddress('Hà Nội'),
      ])
      assert.equal(debouncedFirst, null)
      assert.equal(debouncedSecond?.lat, 10.84)
      assert.equal(fetchedRequests.length, 1)
      assert.equal(fetchedRequests[0].options?.headers?.['User-Agent'], 'SportNexus-GraduationProject/1.0')
      assert.equal(fetchedRequests[0].options?.referrerPolicy, 'strict-origin-when-cross-origin')

      // 1. Gọi trùng đồng thời → chỉ bắn 1 request
      clock += 2000
      const [a, b] = await Promise.all([client.geocodeAddress('Thủ Đức'), client.geocodeAddress('thủ đức')])
      assert.deepEqual(a, { lat: 10.84, lng: 106.75, bounds: { south: 10.8, north: 10.9, west: 106.7, east: 106.8 } })
      assert.deepEqual(b, a)
      assert.equal(fetchedRequests.length, 2)
      assert.equal(fetchedRequests[1].options?.headers?.['User-Agent'], 'SportNexus-GraduationProject/1.0')

      // 2. Request khác liên tiếp phải chờ đúng ≥ 1100ms
      const place = await client.reverseGeocode(10.87, 106.77)
      assert.equal(place, 'Phường Linh Xuân, Thành phố Hồ Chí Minh')
      assert.equal(fetchedRequests.length, 3)
      assert.ok(delays.some(ms => ms === 1100))

      // 3. Reload phiên (client mới cùng sessionStorage) vẫn dùng cache không gọi lại mạng
      const clientReloaded = locationApi.createLocationClient({
        env: {},
        storage: fakeStorage,
        now: () => clock,
        fetchImpl: async () => {
          throw new Error('Không được phép gọi mạng khi đã có trong sessionStorage cache')
        },
      })
      assert.equal(await clientReloaded.reverseGeocode(10.87, 106.77), 'Phường Linh Xuân, Thành phố Hồ Chí Minh')

      // 4. Khi gặp 429, tạm ngưng gọi mạng trong thời gian cooldown, hết cooldown thì gọi lại được
      clock += 2000
      mode = '429'
      assert.equal(await client.geocodeAddress('Quận 7'), null)
      assert.equal(fetchedRequests.length, 4)

      // Trong thời gian cooldown (30s): bị chặn tại circuit breaker, không gọi fetch
      clock += 5000
      assert.equal(await client.geocodeAddress('Quận 9'), null)
      assert.equal(fetchedRequests.length, 4)

      // Sau khi hết cooldown 30s → cho phép thử lại và khôi phục
      clock += 30000
      mode = 'ok'
      const recovered = await client.geocodeAddress('Quận 9')
      assert.equal(recovered?.lat, 10.84)
      assert.equal(fetchedRequests.length, 5)
    })

    await t.test('normalizeReverseGeocodePayload ưu tiên địa chỉ hành chính thay vì tên đường đơn lẻ', () => {
      assert.equal(
        locationApi.normalizeReverseGeocodePayload({
          name: 'Tỉnh lộ 10',
          address: {
            road: 'Tỉnh lộ 10',
            suburb: 'Phường Tân Tạo',
            city_district: 'Quận Bình Tân',
            city: 'Thành phố Hồ Chí Minh',
          },
          display_name: 'Tỉnh lộ 10, Phường Tân Tạo, Quận Bình Tân, Thành phố Hồ Chí Minh',
        }),
        'Phường Tân Tạo, Quận Bình Tân, Thành phố Hồ Chí Minh'
      )

      assert.equal(
        locationApi.normalizeReverseGeocodePayload({ data: { displayName: 'Phường Cửa Nam, Hà Nội' } }),
        'Phường Cửa Nam, Hà Nội'
      )
    })

    await t.test('playerOrigin đồng bộ vị trí xuất phát từ Đặt sân sang Hồ sơ ghép trận LFG', async () => {
      const playerOrigin = await server.ssrLoadModule('/src/utils/playerOrigin.js')
      const [communitySrc, mapBookingSrc, createMatchSrc, userStorageSrc] = await Promise.all([
        readFile(new URL('../src/Player/LFG/CommunityFeed.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/Booking/FindCourt/MapBooking.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/LFG/CreateMatch.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/context/userStorage.js', import.meta.url), 'utf8'),
      ])

      assert.match(mapBookingSrc, /saveBookingOrigin/)
      assert.match(communitySrc, /resolveEffectivePlayerOrigin/)
      assert.match(communitySrc, /subscribeBookingOrigin/)
      assert.match(createMatchSrc, /resolveEffectivePlayerOrigin/)
      assert.match(userStorageSrc, /sportnexus_booking_origin/)

      const store = new Map()
      const fakeStorage = {
        getItem: k => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: k => store.delete(k),
      }

      playerOrigin.saveBookingOrigin(
        { label: 'Phường Cửa Nam, Hà Nội', lat: 21.0285, lng: 105.8542, source: 'custom', customText: 'Phường Cửa Nam, Hà Nội' },
        fakeStorage
      )
      const saved = playerOrigin.readSavedBookingOrigin(fakeStorage)
      assert.equal(saved.label, 'Phường Cửa Nam, Hà Nội')
      assert.equal(saved.source, 'custom')

      // Khi người chơi đã đổi điểm xuất phát ở Đặt sân → ưu tiên hơn GPS / hồ sơ / khảo sát cũ
      const fromCustom = playerOrigin.resolveEffectivePlayerOrigin({
        bookingOrigin: saved,
        gpsCoords: { lat: 16.05, lng: 108.2, accuracy: 20 },
        gpsPlaceName: 'Đà Nẵng',
        profileLocation: 'Hải Phòng',
        onboarding: { coords: { lat: 10.75, lng: 106.6 }, name: 'Phường Tân Tạo, Thành phố Hồ Chí Minh' },
      })
      assert.equal(fromCustom.label, 'Phường Cửa Nam, Hà Nội')
      assert.deepEqual(fromCustom.coords, { lat: 21.0285, lng: 105.8542 })

      // Khi bỏ chọn vị trí tùy chỉnh, ưu tiên GPS chính xác (<= 1000m), bỏ qua GPS đoán theo IP (> 1000m)
      playerOrigin.clearBookingOrigin(fakeStorage)
      assert.equal(playerOrigin.readSavedBookingOrigin(fakeStorage), null)

      const fromUntrustedIp = playerOrigin.resolveEffectivePlayerOrigin({
        bookingOrigin: null,
        gpsCoords: { lat: 10.75, lng: 106.6, accuracy: 5000 },
        gpsPlaceName: 'Sai số IP',
        onboarding: { coords: { lat: 16.0544, lng: 108.2022 }, name: 'Phường Hải Châu, Đà Nẵng' },
      })
      assert.equal(fromUntrustedIp.label, 'Phường Hải Châu, Đà Nẵng')
      assert.equal(fromUntrustedIp.source, 'onboarding')

      const fromTrustedGps = playerOrigin.resolveEffectivePlayerOrigin({
        bookingOrigin: null,
        gpsCoords: { lat: 21.0285, lng: 105.8542, accuracy: 25 },
        gpsPlaceName: 'Phường Hoàn Kiếm, Hà Nội',
        onboarding: { coords: { lat: 16.0544, lng: 108.2022 }, name: 'Phường Hải Châu, Đà Nẵng' },
      })
      assert.equal(fromTrustedGps.label, 'Phường Hoàn Kiếm, Hà Nội')
      assert.equal(fromTrustedGps.source, 'gps')
    })

    await t.test('CreateMatch không chọn sẵn bộ môn hay tiêu chí ghép trận khi mở trang tạo kèo mới', async t => {
      const prevStorage = globalThis.localStorage
      const store = new Map()
      globalThis.localStorage = {
        getItem: k => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: k => store.delete(k),
      }
      t.after(() => {
        if (prevStorage === undefined) delete globalThis.localStorage
        else globalThis.localStorage = prevStorage
      })

      const createMatchMod = await server.ssrLoadModule('/src/Player/LFG/CreateMatch.jsx')
      const CreateMatch = createMatchMod.default
      const html = renderToString(createElement(MemoryRouter, null, createElement(CreateMatch)))

      // 01. Không chọn sẵn bộ môn nào (không có thẻ môn nào có chấm xanh #34D399)
      assert.doesNotMatch(html, /bg-\[#34D399\]/)

      // 04. Không chọn sẵn thể thức (aria-pressed="true"), không tick sẵn trình độ (check_box) hay checkbox
      assert.doesNotMatch(html, /aria-pressed="true"/)
      assert.doesNotMatch(html, />check_box</)
      assert.doesNotMatch(html, /type="checkbox"[^>]*checked/)
    })
  } finally {
    await server.close()
  }
})
