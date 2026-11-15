// Cấu hình nguồn tile bản đồ hợp lệ cho Leaflet (không dùng link tile Google Maps không qua API).
// Lưu ý theo OpenStreetMap Tile Usage Policy:
// Trình duyệt web chặn JavaScript ghi đè HTTP header `User-Agent` (Fetch forbidden header) và luôn tự gửi
// User-Agent chuẩn của trình duyệt kèm `Referer`; do đó FE cấu hình `referrerPolicy: 'strict-origin-when-cross-origin'`
// để tile server nhận đầy đủ thông tin nguồn truy cập (khác với app Mobile phải truyền `User-Agent` thủ công).

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
const MAPTILER_ATTRIBUTION = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> ' + OSM_ATTRIBUTION
const MAPBOX_ATTRIBUTION = '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> ' + OSM_ATTRIBUTION

const readEnv = env => {
  if (env && typeof env === 'object') return env
  return (typeof import.meta !== 'undefined' && import.meta.env) || {}
}

/**
 * Trả về cấu hình `{ url, options, provider }` cho `L.tileLayer(url, options)`.
 * Ưu tiên key thương mại hợp lệ (`VITE_MAPTILER_API_KEY` / `VITE_MAPBOX_ACCESS_TOKEN`) nếu có,
 * mặc định dùng OpenStreetMap Standard (bản đồ đường phố) và Esri World Imagery (ảnh vệ tinh).
 */
export function getTileLayerConfig(mode = 'm', env) {
  const safeEnv = readEnv(env)
  const isSatellite = mode === 'k'
  const maptilerKey = String(safeEnv.VITE_MAPTILER_API_KEY || '').trim()
  const mapboxToken = String(safeEnv.VITE_MAPBOX_ACCESS_TOKEN || '').trim()

  if (maptilerKey) {
    const mapId = isSatellite ? 'hybrid' : 'streets-v2'
    const ext = isSatellite ? 'jpg' : 'png'
    return {
      provider: 'maptiler',
      url: `https://api.maptiler.com/maps/${mapId}/256/{z}/{x}/{y}.${ext}?key=${encodeURIComponent(maptilerKey)}`,
      options: {
        maxZoom: 20,
        referrerPolicy: 'strict-origin-when-cross-origin',
        attribution: MAPTILER_ATTRIBUTION,
      },
    }
  }

  if (mapboxToken) {
    const styleId = isSatellite ? 'satellite-streets-v12' : 'streets-v12'
    return {
      provider: 'mapbox',
      url: `https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${encodeURIComponent(mapboxToken)}`,
      options: {
        maxZoom: 20,
        referrerPolicy: 'strict-origin-when-cross-origin',
        attribution: MAPBOX_ATTRIBUTION,
      },
    }
  }

  if (isSatellite) {
    return {
      provider: 'esri-world-imagery',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        maxZoom: 19,
        maxNativeZoom: 18,
        referrerPolicy: 'strict-origin-when-cross-origin',
        attribution: ESRI_ATTRIBUTION,
      },
    }
  }

  return {
    provider: 'openstreetmap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      maxNativeZoom: 19,
      referrerPolicy: 'strict-origin-when-cross-origin',
      attribution: OSM_ATTRIBUTION,
    },
  }
}
