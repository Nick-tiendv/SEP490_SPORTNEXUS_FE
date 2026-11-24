import { useEffect, useRef } from 'react'

// Hệ thống chưa có realtime (BE không có SignalR/WebSocket). NotificationBell kiểm tra số chưa đọc ~15s/lần
// và phát sự kiện này khi có thông báo mới (đặt sân, hủy, thanh toán…) để các màn đang mở tự tải lại.
export const LIVE_REFRESH_EVENT = 'snx:live-refresh'

// Gộp các lần kích hoạt sát nhau (quay lại tab + focus cùng lúc). force: sự kiện thông báo mới luôn chạy.
export function createLiveRefresher(onRefresh, { minGapMs = 3000, now = () => Date.now() } = {}) {
  let last = now()
  return (force = false) => {
    if (!force && now() - last < minGapMs) return false
    last = now()
    onRefresh()
    return true
  }
}

// Tự tải lại dữ liệu màn đang mở khi: có thông báo mới, quay lại tab, và định kỳ intervalMs
// (dự phòng khi người dùng tắt loại thông báo đó). Tab bị ẩn thì không tải định kỳ.
// onRefresh nên giữ dữ liệu cũ trong lúc tải để màn hình không nháy.
export function useLiveRefresh(onRefresh, { enabled = true, intervalMs = 60000 } = {}) {
  const cbRef = useRef(onRefresh)
  useEffect(() => {
    cbRef.current = onRefresh
  })

  useEffect(() => {
    if (!enabled) return undefined
    const run = createLiveRefresher(() => cbRef.current())
    const visible = () => document.visibilityState === 'visible'
    const onEvent = () => run(true)
    const onBack = () => visible() && run()
    const timer = setInterval(onBack, intervalMs)
    window.addEventListener(LIVE_REFRESH_EVENT, onEvent)
    window.addEventListener('focus', onBack)
    document.addEventListener('visibilitychange', onBack)
    return () => {
      clearInterval(timer)
      window.removeEventListener(LIVE_REFRESH_EVENT, onEvent)
      window.removeEventListener('focus', onBack)
      document.removeEventListener('visibilitychange', onBack)
    }
  }, [enabled, intervalMs])
}
