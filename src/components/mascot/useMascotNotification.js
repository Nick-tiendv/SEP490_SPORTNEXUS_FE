import { useCallback, useEffect, useRef } from 'react'
import { NOTIFICATIONS_SYNCED_EVENT } from './mascotEvents.js'
import { pickNewNotifications, pickRecentUnread } from './mascotDirector.js'

const ANNOUNCED_KEY = 'snx.mascot.announced' // id đã báo trong phiên tab: F5 không báo lại
const SUMMARY_KEY = 'snx.mascot.unreadShown' // phiên đăng nhập đã được báo tóm tắt
const RECENT_MS = 15 * 60 * 1000

const DEMO_ITEMS = [
  { title: 'Đặt sân thành công', message: 'Sân 1 • 18:00–20:00 hôm nay đã được xác nhận. Nhớ đến đúng giờ nha!' },
  { title: 'Lời mời vào kèo', message: 'Minh Anh mời bạn tham gia kèo cầu lông tối thứ 6 tại Sân Phú Nhuận.' },
  { title: 'Ví vừa được cộng tiền', message: 'Hoàn 120.000 điểm cho đơn đặt sân bị chủ sân hủy.' },
]
let demoSeq = 0
const demoItem = (i) => ({ ...DEMO_ITEMS[i % DEMO_ITEMS.length], id: `mascot-demo-${++demoSeq}`, demo: true })

const readSession = (key, fallback) => {
  try {
    return JSON.parse(sessionStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const writeSession = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sessionStorage bị chặn: chỉ mất phần chống báo trùng khi F5 */
  }
}

// Nguồn thông báo duy nhất của mascot. Hiện lấy kết quả NotificationBell tải về (60s/lần, và mỗi lần mở chuông)
// qua sự kiện window; khi BE có realtime (SignalR/WebSocket) chỉ cần gọi onNotifications([...]) từ đây.
// - Lần đồng bộ đầu: báo thông báo chưa đọc trong 15 phút gần nhất; không có thì báo tóm tắt số chưa đọc
//   (1 lần cho mỗi phiên đăng nhập, sessionKey đổi khi đăng nhập lại / đổi tài khoản).
// - Các lần sau: báo những thông báo chưa đọc mới xuất hiện.
// demo = true (?mascotDemo=1): bắn 3 thông báo giả liên tiếp để thử hàng đợi.
export function useMascotNotification(onNotifications, { demo = false, unreadText, sessionKey = '' } = {}) {
  const cbRef = useRef(onNotifications)
  const unreadTextRef = useRef(unreadText)
  useEffect(() => {
    cbRef.current = onNotifications
    unreadTextRef.current = unreadText
  })

  useEffect(() => {
    let seen = null
    const announced = new Set(readSession(ANNOUNCED_KEY, []))
    const announce = (items) => {
      if (!items.length) return
      items.forEach((n) => announced.add(n.id))
      writeSession(ANNOUNCED_KEY, [...announced].slice(-100))
      cbRef.current(items)
    }
    const onSync = (e) => {
      const items = Array.isArray(e.detail) ? e.detail : []
      if (!seen) {
        seen = new Set(items.map((n) => n.id))
        const recent = pickRecentUnread(items, { windowMs: RECENT_MS, skip: announced })
        if (recent.length) return announce(recent)
        const unread = items.filter((n) => !n.read).length
        if (unread && readSession(SUMMARY_KEY, null) !== sessionKey) {
          writeSession(SUMMARY_KEY, sessionKey)
          cbRef.current([{ id: 'mascot-unread-summary', title: 'Thông báo chưa đọc', message: unreadTextRef.current?.(unread) || '' }])
        }
        return
      }
      const fresh = pickNewNotifications(items, seen).filter((n) => !announced.has(n.id))
      items.forEach((n) => seen.add(n.id))
      announce(fresh)
    }
    window.addEventListener(NOTIFICATIONS_SYNCED_EVENT, onSync)
    return () => window.removeEventListener(NOTIFICATIONS_SYNCED_EVENT, onSync)
  }, [sessionKey])

  useEffect(() => {
    if (!demo) return undefined
    const timer = setTimeout(() => cbRef.current(DEMO_ITEMS.map((_, i) => demoItem(i))), 2500)
    return () => clearTimeout(timer)
  }, [demo])

  return { pushDemo: useCallback(() => cbRef.current([demoItem(demoSeq)]), []) }
}
