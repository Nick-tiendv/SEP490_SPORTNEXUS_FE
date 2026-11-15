import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
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
    const InteractiveCourtMap = mapCompMod.default

    await t.test('LocationPickerMap và InteractiveCourtMap không còn tile Google Maps lậu và đã bật attributionControl: true', async () => {
      const [pickerSrc, courtMapSrc, mapCssSrc] = await Promise.all([
        readFile(new URL('../src/components/common/LocationPickerMap.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/Booking/FindCourt/InteractiveCourtMap.jsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/Player/Booking/FindCourt/MapBooking.css', import.meta.url), 'utf8'),
      ])

      for (const src of [pickerSrc, courtMapSrc]) {
        assert.doesNotMatch(src, /mt[0-3]?\.google\.com|google\.com\/vt/i)
        assert.doesNotMatch(src, /attributionControl\s*:\s*false/)
        assert.match(src, /attributionControl\s*:\s*true/)
        assert.match(src, /getTileLayerConfig/)
      }

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

    await t.test('InteractiveCourtMap render SSR fallback trung lập không nhắc tile Google Maps', () => {
      const html = renderToString(createElement(InteractiveCourtMap, { courts: [] }))
      assert.match(html, /Đang tải bản đồ tương tác/)
      assert.doesNotMatch(html, /Google Maps/i)
    })

    await t.test('locationApi ưu tiên Backend Proxy khi cấu hình VITE_GEOCODE_PROXY_URL', async () => {
      const calls = []
      const client = locationApi.createLocationClient({
        env: {
          VITE_API_BASE_URL: 'https://api.example.com/api',
          VITE_GEOCODE_PROXY_URL: '/api/v1/locations',
        },
        fetchImpl: async url => {
          calls.push(url)
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
      assert.match(calls[0], /^https:\/\/api\.example\.com\/api\/v1\/locations\/search\?q=Qu%E1%BA%ADn%201/)
      assert.match(calls[1], /^https:\/\/api\.example\.com\/api\/v1\/locations\/reverse\?lat=10\.7756&lon=106\.7004/)
      assert.ok(calls.every(url => !url.includes('nominatim.openstreetmap.org')))
    })

    await t.test('locationApi giới hạn tốc độ, gộp request trùng, cache phiên và tự tạm dừng khi Nominatim trả 429', async () => {
      let clock = 1000
      const delays = []
      const fetchedUrls = []
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
        delay: async ms => {
          delays.push(ms)
          clock += ms
        },
        fetchImpl: async url => {
          fetchedUrls.push(url)
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

      // 1. Gọi trùng đồng thời → chỉ bắn 1 request
      const [a, b] = await Promise.all([client.geocodeAddress('Thủ Đức'), client.geocodeAddress('thủ đức')])
      assert.deepEqual(a, { lat: 10.84, lng: 106.75, bounds: { south: 10.8, north: 10.9, west: 106.7, east: 106.8 } })
      assert.deepEqual(b, a)
      assert.equal(fetchedUrls.length, 1)

      // 2. Request khác liên tiếp phải chờ đúng ≥ 1100ms
      const place = await client.reverseGeocode(10.87, 106.77)
      assert.equal(place, 'Phường Linh Xuân, Thành phố Hồ Chí Minh')
      assert.equal(fetchedUrls.length, 2)
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
      assert.equal(fetchedUrls.length, 3)

      // Trong thời gian cooldown (30s): bị chặn tại circuit breaker, không gọi fetch
      clock += 5000
      assert.equal(await client.geocodeAddress('Quận 9'), null)
      assert.equal(fetchedUrls.length, 3)

      // Sau khi hết cooldown 30s → cho phép thử lại và khôi phục
      clock += 30000
      mode = 'ok'
      const recovered = await client.geocodeAddress('Quận 9')
      assert.equal(recovered?.lat, 10.84)
      assert.equal(fetchedUrls.length, 4)
    })
  } finally {
    await server.close()
  }
})
