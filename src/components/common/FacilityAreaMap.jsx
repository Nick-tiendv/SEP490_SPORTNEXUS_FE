import { useEffect, useRef, useState } from 'react'
import { getTileLayerConfig } from '../../utils/mapTiles.js'

// Trung tâm Việt Nam (chỉ dùng khi chưa có bất kỳ tọa độ cơ sở hoặc vị trí người dùng nào)
const DEFAULT_CENTER = [16.0471, 108.2068]

const parseCoord = value => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const getCoords = item => {
  if (!item || typeof item !== 'object') return null
  const lat = parseCoord(item.lat ?? item.latitude)
  const lng = parseCoord(item.lng ?? item.longitude)
  if (lat == null || lng == null) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  if (Math.abs(lat) < 1 && Math.abs(lng) < 1) return null
  return [lat, lng]
}

const createFacilityPopup = fac => {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'min-width:160px;font-family:inherit;line-height:1.4'

  const title = document.createElement('strong')
  title.textContent = fac.name || 'Cơ sở thể thao'
  title.style.cssText = 'display:block;font-size:12px;color:#111827;margin-bottom:2px'
  wrap.appendChild(title)

  if (fac.address) {
    const addr = document.createElement('div')
    addr.textContent = fac.address
    addr.style.cssText = 'font-size:11px;color:#64748b;margin-bottom:3px'
    wrap.appendChild(addr)
  }

  const priceNum = Number(fac.price)
  if (Number.isFinite(priceNum) && priceNum > 0) {
    const price = document.createElement('div')
    price.textContent = `Từ ${new Intl.NumberFormat('vi-VN').format(priceNum)} đ/giờ`
    price.style.cssText = 'font-size:11px;font-weight:700;color:#15803d'
    wrap.appendChild(price)
  }

  return wrap
}

/**
 * Bản đồ Leaflet hiển thị danh sách cụm sân trong khu vực / bán kính (dùng OpenStreetMap + ghi nguồn chuẩn).
 */
export default function FacilityAreaMap({
  facilities = [],
  selectedFacilityId = null,
  onSelectFacility,
  userOriginCoords = null,
  radiusKm = null,
  height = 224,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const [isLeafletReady, setIsLeafletReady] = useState(() => typeof window !== 'undefined' && Boolean(window.L))
  const onSelectRef = useRef(onSelectFacility)

  useEffect(() => {
    onSelectRef.current = onSelectFacility
  }, [onSelectFacility])

  // Nạp Leaflet nếu chưa gắn sẵn trên window (an toàn cho cả SSR lẫn runtime)
  useEffect(() => {
    if (isLeafletReady) return undefined
    let cancelled = false
    import('leaflet')
      .then(mod => {
        if (cancelled) return
        const L = mod.default || mod
        if (typeof window !== 'undefined' && !window.L) window.L = L
        leafletRef.current = L
        setIsLeafletReady(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isLeafletReady])

  // Khởi tạo bản đồ Leaflet với nguồn tile hợp lệ và bật attributionControl: true
  useEffect(() => {
    const L = leafletRef.current || (typeof window !== 'undefined' ? window.L : null)
    if (!isLeafletReady || !L || !containerRef.current || mapRef.current) return undefined

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    })

    L.control.zoom({ position: 'bottomleft' }).addTo(map)

    const { url, options } = getTileLayerConfig('m')
    L.tileLayer(url, options).addTo(map)

    const markerLayer = L.layerGroup().addTo(map)
    const userLayer = L.layerGroup().addTo(map)
    mapRef.current = { map, L, markerLayer, userLayer }

    requestAnimationFrame(() => map.invalidateSize())
    const timer = setTimeout(() => map.invalidateSize(), 200)

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        mapRef.current?.map.invalidateSize()
      })
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timer)
      if (resizeObserver) resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [isLeafletReady])

  // Đồng bộ ghim cơ sở, vị trí người chơi, bán kính và khung nhìn bản đồ
  useEffect(() => {
    const current = mapRef.current
    if (!current) return
    const { map, L, markerLayer, userLayer } = current

    markerLayer.clearLayers()
    userLayer.clearLayers()

    const points = []
    let selectedCoords = null

    for (const fac of Array.isArray(facilities) ? facilities : []) {
      const coords = getCoords(fac)
      if (!coords) continue
      points.push(coords)
      const isSelected = selectedFacilityId != null && fac.id === selectedFacilityId
      if (isSelected) selectedCoords = coords

      const icon = L.divIcon({
        className: '',
        html: isSelected
          ? '<span class="material-symbols-outlined" style="font-size:36px;color:#15803d;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))">location_on</span>'
          : '<span class="material-symbols-outlined" style="font-size:28px;color:#2d5f3f;opacity:.92;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))">location_on</span>',
        iconSize: isSelected ? [36, 36] : [28, 28],
        iconAnchor: isSelected ? [18, 34] : [14, 26],
        popupAnchor: [0, -28],
      })

      const marker = L.marker(coords, {
        icon,
        zIndexOffset: isSelected ? 500 : 0,
      })
      marker.bindPopup(createFacilityPopup(fac), { offset: [0, -6] })
      marker.on('click', () => {
        onSelectRef.current?.(fac)
      })
      marker.addTo(markerLayer)
    }

    const originCoords = getCoords(userOriginCoords)
    if (originCoords) {
      const userIcon = L.divIcon({
        className: '',
        html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2563eb;border:2.5px solid #ffffff;box-shadow:0 0 0 4px rgba(37,99,235,0.22)"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker(originCoords, { icon: userIcon }).bindPopup('<strong>Vị trí của bạn</strong>').addTo(userLayer)

      const numericRadius = Number(radiusKm)
      if (Number.isFinite(numericRadius) && numericRadius > 0) {
        L.circle(originCoords, {
          radius: numericRadius * 1000,
          color: '#16a34a',
          weight: 1.5,
          dashArray: '5 5',
          fillOpacity: 0.05,
          interactive: false,
        }).addTo(userLayer)
      }
    }

    map.invalidateSize()
    if (selectedCoords) {
      map.setView(selectedCoords, 15)
    } else if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 14 })
    } else if (points.length === 1) {
      map.setView(points[0], 14)
    } else if (originCoords) {
      map.setView(originCoords, 13)
    } else {
      map.setView(DEFAULT_CENTER, 5)
    }
  }, [isLeafletReady, facilities, selectedFacilityId, userOriginCoords, radiusKm])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', isolation: 'isolate' }}
      aria-label="Bản đồ cụm sân thể thao"
    />
  )
}
