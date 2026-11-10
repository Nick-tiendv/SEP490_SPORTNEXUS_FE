import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Bản đồ chọn vị trí: bấm lên bản đồ hoặc kéo ghim để chỉnh. Vòng tròn mờ = sai số của vị trí tự động.
// value: { latitude, longitude, accuracy? } | null; onChange({ latitude, longitude })
const DEFAULT_CENTER = [16.047, 108.206] // giữa Việt Nam, khi chưa có vị trí
const PIN = L.divIcon({
  className: '',
  html: '<span class="material-symbols-outlined" style="font-size:36px;color:#16a34a;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">location_on</span>',
  iconSize: [36, 36],
  iconAnchor: [18, 34],
})
const round6 = (n) => Number(n.toFixed(6))

export default function LocationPickerMap({ value, onChange, height = 240 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    const map = L.map(containerRef.current, { center: DEFAULT_CENTER, zoom: 5, attributionControl: false })
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(map)
    const pick = (latlng) => onChangeRef.current?.({ latitude: round6(latlng.lat), longitude: round6(latlng.lng) })
    map.on('click', (event) => pick(event.latlng))
    mapRef.current = { map, pick }
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => { clearTimeout(timer); map.remove(); mapRef.current = null; markerRef.current = null; circleRef.current = null }
  }, [])

  // Đồng bộ ghim + vòng sai số theo value
  useEffect(() => {
    const current = mapRef.current
    if (!current) return
    const { map, pick } = current
    if (!value) {
      markerRef.current?.remove(); markerRef.current = null
      circleRef.current?.remove(); circleRef.current = null
      return
    }
    const latlng = [value.latitude, value.longitude]
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon: PIN, draggable: true }).addTo(map)
      markerRef.current.on('dragend', (event) => pick(event.target.getLatLng()))
    } else {
      markerRef.current.setLatLng(latlng)
    }
    circleRef.current?.remove(); circleRef.current = null
    if (value.accuracy > 0) {
      circleRef.current = L.circle(latlng, { radius: value.accuracy, color: '#16a34a', weight: 1, fillOpacity: 0.08 }).addTo(map)
      map.fitBounds(circleRef.current.getBounds(), { maxZoom: 16 })
    } else if (map.getZoom() < 13) {
      map.setView(latlng, 15)
    }
  }, [value])

  return <div ref={containerRef} style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--snx-border, #e5e7eb)' }} aria-label="Bản đồ chọn vị trí" />
}
