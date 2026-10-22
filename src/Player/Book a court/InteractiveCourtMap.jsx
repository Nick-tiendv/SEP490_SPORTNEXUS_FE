import { useEffect, useRef, useState } from 'react'

/**
 * InteractiveCourtMap
 * Bản đồ tương tác sử dụng tile Google Maps (Roadmap & Satellite Hybrid),
 * gắn pin tọa độ thực của tất cả các cụm sân và vị trí người chơi.
 */
export default function InteractiveCourtMap({
  courts = [],
  selectedCourt = null,
  onSelectCourt,
  effectiveOrigin = 'Thủ Đức',
  originCoords = null,
  isEditingOrigin = false,
  setIsEditingOrigin,
  customOrigin = '',
  setCustomOrigin,
  userProfileLocation = 'Thủ Đức',
  mapType = 'm', // 'm' = Roadmap, 'k' = Satellite
  setMapType,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const userMarkerRef = useRef(null)
  const tileLayerRef = useRef(null)
  const [isLeafletReady, setIsLeafletReady] = useState(false)

  // Kiểm tra Leaflet có sẵn trên window (từ CDN)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      setIsLeafletReady(true)
      return
    }
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.L) {
        setIsLeafletReady(true)
        clearInterval(interval)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const L = window.L

    // Tọa độ khởi tạo: ưu tiên selectedCourt hoặc TP.HCM
    const initLat = selectedCourt?.lat || originCoords?.lat || 10.8498
    const initLng = selectedCourt?.lng || originCoords?.lng || 106.7725

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: 15,
      zoomControl: false, // Tự tạo nút zoom gọn gàng hoặc dùng custom
      attributionControl: false,
    })

    // URL Google Maps Tiles chính thức
    // lyrs=m : Roadmap chuẩn Google Maps
    // lyrs=y : Hybrid vệ tinh + đường phố & tên đường
    const tileUrl =
      mapType === 'k'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map)

    tileLayerRef.current = tileLayer
    mapInstanceRef.current = map

    // Đảm bảo Leaflet đo chính xác kích thước container và nạp đầy đủ 100% các ô gạch tile
    requestAnimationFrame(() => map.invalidateSize())
    const t1 = setTimeout(() => map.invalidateSize(), 100)
    const t2 = setTimeout(() => map.invalidateSize(), 300)
    const t3 = setTimeout(() => map.invalidateSize(), 700)
    const t4 = setTimeout(() => map.invalidateSize(), 1400)

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize()
        }
      })
      resizeObserver.observe(mapContainerRef.current)
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      if (resizeObserver) resizeObserver.disconnect()
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
      userMarkerRef.current = null
    }
  }, [isLeafletReady])

  // Cập nhật Tile Layer khi đổi giữa Bản đồ thường & Vệ tinh
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return
    const L = window.L
    const map = mapInstanceRef.current

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const tileUrl =
      mapType === 'k'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map)

    map.invalidateSize()
  }, [mapType])

  // Vẽ các Marker sân thể thao lên bản đồ
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return
    const L = window.L
    const map = mapInstanceRef.current

    // Xóa marker cũ
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m))
    markersRef.current = {}

    courts.forEach((court) => {
      if (!court.lat || !court.lng) return
      const isSelected = selectedCourt?.id === court.id

      // HTML Icon tùy chỉnh cho Marker kiểu Google Maps hiện đại
      const iconHtml = `
        <div class="sn-pin ${isSelected ? 'sn-pin--active' : ''}">
          <div class="sn-pin-pulse"></div>
          <div class="sn-pin-marker">
            <span class="material-symbols-outlined">${court.sport === 'pickleball' ? 'sports_tennis' : 'sports_tennis'}</span>
          </div>
          <div class="sn-pin-badge">${Math.round(court.price / 1000)}k</div>
        </div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'sn-custom-div-icon',
        iconSize: isSelected ? [38, 48] : [32, 40],
        iconAnchor: isSelected ? [19, 44] : [16, 36],
        popupAnchor: [0, -40],
      })

      const marker = L.marker([court.lat, court.lng], { icon: customIcon }).addTo(map)

      // Popup thông tin sân khi bấm vào
      const popupHtml = `
        <div class="sn-map-popup">
          <div class="sn-popup-header">
            <strong>${court.name.replace('SportNexus ', '')}</strong>
            <span class="sn-popup-rating">★ ${court.rating}</span>
          </div>
          <div class="sn-popup-addr">${court.address}</div>
          <div class="sn-popup-footer">
            <span class="sn-popup-price">${court.price.toLocaleString('vi-VN')} đ/giờ</span>
            <span class="sn-popup-dist">Cách ~${court.distance} km</span>
          </div>
        </div>
      `
      marker.bindPopup(popupHtml, { offset: [0, -10] })

      marker.on('click', () => {
        if (onSelectCourt) onSelectCourt(court)
      })

      markersRef.current[court.id] = marker
    })
  }, [courts, selectedCourt, onSelectCourt])

  // Vẽ Marker vị trí người chơi (Blue Radar Dot)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !originCoords) return
    const L = window.L
    const map = mapInstanceRef.current

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
    }

    const userHtml = `
      <div class="sn-user-pin" title="Vị trí xuất phát của bạn">
        <div class="sn-user-radar"></div>
        <div class="sn-user-core"></div>
      </div>
    `
    const userIcon = L.divIcon({
      html: userHtml,
      className: 'sn-user-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    const userMarker = L.marker([originCoords.lat, originCoords.lng], { icon: userIcon }).addTo(map)
    userMarker.bindPopup(`<strong>Vị trí của bạn</strong><br/>${effectiveOrigin}`, { offset: [0, -10] })
    userMarkerRef.current = userMarker
  }, [originCoords, effectiveOrigin])

  // Khi selectedCourt thay đổi, di chuyển bản đồ đến sân đó
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCourt?.lat || !selectedCourt?.lng) return
    const map = mapInstanceRef.current
    map.invalidateSize()

    map.flyTo([selectedCourt.lat, selectedCourt.lng], 16, {
      duration: 0.8,
      easeLinearity: 0.25,
    })

    // Mở popup tương ứng nếu có
    const marker = markersRef.current[selectedCourt.id]
    if (marker) {
      setTimeout(() => {
        marker.openPopup()
      }, 850)
    }
  }, [selectedCourt])

  // Hàm bay về vị trí người chơi
  const handleLocateMe = () => {
    if (!mapInstanceRef.current || !originCoords) return
    mapInstanceRef.current.invalidateSize()
    mapInstanceRef.current.flyTo([originCoords.lat, originCoords.lng], 15, {
      duration: 0.8,
    })
    if (userMarkerRef.current) {
      setTimeout(() => {
        userMarkerRef.current.openPopup()
      }, 850)
    }
  }

  // Hàm phóng to / thu nhỏ
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()

  return (
    <div className="sn-map-wrapper">
      {/* Container bản đồ tương tác thật */}
      <div className="sn-map-canvas" ref={mapContainerRef} />
      {!isLeafletReady && (
        <div className="sn-map-fallback">
          <span className="material-symbols-outlined sn-spin-ic">refresh</span>
          Đang tải Google Maps tương tác...
        </div>
      )}

      {/* Floating Control: Vị trí người chơi (Góc trên trái) */}
      <div className="sn-map-ctrl-top-left">
        <div className="sn-origin-pill">
          <span className="material-symbols-outlined sn-origin-ic">near_me</span>
          <span className="sn-origin-text">
            Vị trí: <strong>{effectiveOrigin}</strong>
          </span>
          <button
            type="button"
            className="sn-origin-btn"
            onClick={() => setIsEditingOrigin(!isEditingOrigin)}
            title="Đổi điểm xuất phát để tính khoảng cách và chỉ đường"
          >
            <span className="material-symbols-outlined">edit_location_alt</span>
            {isEditingOrigin ? 'Đóng' : 'Đổi'}
          </button>
        </div>

        {/* Popup đổi vị trí nhanh */}
        {isEditingOrigin && (
          <div className="mb-origin-popup">
            <div className="mb-origin-popup-header">
              <strong>Điểm xuất phát của bạn</strong>
              <small>SportNexus sẽ chỉ đường từ vị trí này đến sân</small>
            </div>
            <div className="mb-origin-input-row">
              <span className="material-symbols-outlined">place</span>
              <input
                type="text"
                className="mb-origin-input"
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingOrigin(false)
                }}
                autoFocus
              />
              {customOrigin && (
                <button
                  type="button"
                  className="mb-origin-clear-btn"
                  onClick={() => setCustomOrigin('')}
                  title="Đặt lại theo hồ sơ"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
            <div className="mb-origin-popup-actions">
              <button
                type="button"
                className="mb-origin-chip"
                onClick={() => {
                  setCustomOrigin('')
                  setIsEditingOrigin(false)
                }}
              >
                Dùng {userProfileLocation}
              </button>
              <button
                type="button"
                className="mb-origin-confirm-btn"
                onClick={() => setIsEditingOrigin(false)}
              >
                Áp Dụng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Control: Chế độ bản đồ & Định vị (Góc trên phải) */}
      <div className="sn-map-ctrl-top-right">
        {/* Switch Bản đồ / Vệ tinh */}
        <div className="sn-map-type-toggle">
          <button
            type="button"
            className={`sn-type-btn ${mapType === 'm' ? 'is-active' : ''}`}
            onClick={() => setMapType('m')}
            title="Xem bản đồ đường phố Google Maps"
          >
            Bản Đồ
          </button>
          <button
            type="button"
            className={`sn-type-btn ${mapType === 'k' ? 'is-active' : ''}`}
            onClick={() => setMapType('k')}
            title="Xem ảnh vệ tinh Google Maps"
          >
            Vệ Tinh
          </button>
        </div>

        {/* Nút Về Vị Trí Của Tôi */}
        <button
          type="button"
          className="sn-icon-btn"
          onClick={handleLocateMe}
          title="Di chuyển đến vị trí của bạn"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>

      {/* Floating Zoom Controls (Góc dưới phải) */}
      <div className="sn-map-ctrl-bottom-right">
        <button
          type="button"
          className="sn-zoom-btn"
          onClick={handleZoomIn}
          title="Phóng to bản đồ"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <button
          type="button"
          className="sn-zoom-btn"
          onClick={handleZoomOut}
          title="Thu nhỏ bản đồ"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>
    </div>
  )
}
