import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  registerDeviceToken,
  unregisterDeviceToken,
} from '../../api/notificationApi.js'

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'booking',
    icon: 'sports_tennis',
    color: '#15803D',
    bg: '#EAF7EE',
    title: 'Đặt sân thành công!',
    message: 'Đã xác nhận đặt Sân Pickleball Thảm USAPA #2 tại SportNexus Arena Q.7.',
    details: 'Khung giờ: 18:00 - 20:00 (Hôm nay) • Mã vé: #BK-78923',
    time: '5 phút trước',
    read: false,
    link: '/checkin',
    linkText: 'Xem vé QR Pass',
  },
  {
    id: 'notif-checkin-1',
    type: 'checkin',
    icon: 'qr_code_scanner',
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'Mã QR Check-in đã sẵn sàng',
    message: 'Vé check-in sân Cầu lông Tre Xanh đã kích hoạt mã QR bảo chứng. Quét tại cổng hoặc quầy lễ tân để vào sân.',
    details: 'Mã vé Token: #SNX-BWF-9982-A81F • Hạn sử dụng: 18:00 - 20:00 hôm nay',
    time: '20 phút trước',
    read: false,
    link: '/checkin',
    linkText: 'Mở mã QR Check-in',
  },
  {
    id: 'notif-2',
    type: 'transaction',
    icon: 'receipt_long',
    color: '#0284C7',
    bg: '#E0F2FE',
    title: 'Giao dịch ký quỹ Escrow thành công',
    message: 'Thanh toán cọc giữ slot LFG: [Pickleball Đôi] Cần 1 tay vợt giao lưu nâng cao.',
    details: 'Số tiền: -55.000 đ • Trạng thái: Bảo chứng 100% • Mã GD: #ESC-99214',
    time: '35 phút trước',
    read: false,
    link: '/community',
    linkText: 'Xem chi tiết kèo',
  },
  {
    id: 'notif-3',
    type: 'checkin',
    icon: 'share',
    color: '#7C3AED',
    bg: '#F3E8FF',
    title: 'Đã gửi mã check-in cho bạn chơi',
    message: 'Đã gửi thành công mã QR vé vào sân cho bạn chơi Hoàng Bách & Dương Tuấn.',
    details: 'Mã vé: #SNX-8821 • Bạn chơi có thể dùng mã này để tự quét QR tại cổng',
    time: '1 giờ trước',
    read: false,
    link: '/split-payment',
    linkText: 'Xem trạng thái vé nhóm',
  },
  {
    id: 'notif-4',
    type: 'wallet',
    icon: 'account_balance_wallet',
    color: '#15803D',
    bg: '#DCFCE7',
    title: 'Nạp tiền vào ví thành công!',
    message: 'Bạn đã nạp thành công +500.000 đ vào Ví Escrow qua VietQR Napas247.',
    details: 'Số dư khả dụng: 2.450.000 đ • Mã giao dịch: #TOPUP-55421',
    time: '3 giờ trước',
    read: false,
    link: '/wallet',
    linkText: 'Xem số dư ví',
  },
  {
    id: 'notif-5',
    type: 'feedback',
    icon: 'star',
    color: '#EA580C',
    bg: '#FFEDD5',
    title: 'Được đánh giá tốt: +5 Điểm Fair Play!',
    message: 'Bạn chơi vừa chấm 5.0★ sau trận cầu lông tại Tre Xanh. Điểm Fair Play của bạn đã tăng lên 99.4/100.',
    details: 'Nhận xét: "Đánh chuẩn kỹ thuật, đúng giờ, giao lưu nhiệt tình!"',
    time: 'Hôm qua',
    read: true,
    link: '/profile',
    linkText: 'Xem đánh giá hồ sơ',
  },
  {
    id: 'notif-feedback-2',
    type: 'feedback',
    icon: 'rate_review',
    color: '#D97706',
    bg: '#FEF3C7',
    title: 'Yêu cầu gửi Feedback & Đánh giá bạn chơi',
    message: 'Trận đấu giao lưu LFG lúc 16:00 đã kết thúc. Hãy gửi đánh giá Fair Play cho 3 thành viên trong nhóm.',
    details: 'Đánh giá đúng hạn giúp tăng độ uy tín tài khoản và nhận ưu đãi đặt sân.',
    time: 'Hôm qua',
    read: true,
    link: '/profile',
    linkText: 'Đánh giá ngay',
  },
  {
    id: 'notif-6',
    type: 'wallet',
    icon: 'assignment_return',
    color: '#0D9488',
    bg: '#CCFBF1',
    title: 'Hoàn tiền cọc Escrow 100%',
    message: 'Kèo ghép trận LFG đã giải tán trước 48h. Hệ thống đã hoàn +45.000 đ vào ví của bạn.',
    details: 'Lý do: Không đủ số lượng người chơi theo hạn định.',
    time: '2 ngày trước',
    read: true,
    link: '/wallet',
    linkText: 'Lịch sử ví',
  },
]

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'booking', label: 'Đặt sân' },
  { key: 'transaction', label: 'Giao dịch' },
  { key: 'wallet', label: 'Ví Escrow' },
  { key: 'checkin', label: 'Check-in QR' },
  { key: 'feedback', label: 'Feedback' },
]

const NOTIFICATION_TYPES_CATALOG = [
  { code: 'BOOKING', label: 'Đặt sân & Lịch thi đấu', desc: 'Xác nhận đặt sân, đổi lịch và thông báo giờ chơi' },
  { code: 'PAYMENT', label: 'Giao dịch ví & Nạp rút Escrow', desc: 'Biến động số dư, hoàn tiền cọc và thanh toán chia tiền' },
  { code: 'CHECK_IN', label: 'Vé điện tử & Check-in QR', desc: 'Mã QR check-in, vé chia sẻ nhóm và cảnh báo giờ vào sân' },
  { code: 'FEEDBACK', label: 'Đánh giá & Điểm Fair Play', desc: 'Lời khen bạn chơi, cập nhật uy tín và mời đánh giá sau trận' },
  { code: 'COMMUNITY', label: 'Cộng đồng & Kèo LFG', desc: 'Lời mời ghép trận, bình luận bài viết và tương tác nhóm' },
  { code: 'SYSTEM', label: 'Thông báo hệ thống & Bảo trì', desc: 'Cập nhật tính năng mới, bảo trì cụm sân và cảnh báo bảo mật' },
]

// Hàm chuyển đổi relative time từ timestamp
function formatTimeAgo(dateString) {
  if (!dateString) return 'Gần đây'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const now = new Date()
    const diffMs = now - d
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return 'Vừa xong'
    if (diffMin < 60) return `${diffMin} phút trước`
    if (diffHour < 24) return `${diffHour} giờ trước`
    if (diffDay === 1) return 'Hôm qua'
    if (diffDay < 7) return `${diffDay} ngày trước`
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateString
  }
}

// Chuyển đổi item từ backend thành định dạng UI
function mapServerNotification(item) {
  if (!item) return null
  const rawType = String(item.type || item.Type || 'SYSTEM').toUpperCase()
  let uiType = 'booking'
  let icon = 'sports_tennis'
  let color = '#15803D'
  let bg = '#EAF7EE'
  let link = '/checkin'
  let linkText = 'Xem chi tiết'

  if (rawType.includes('BOOKING')) {
    uiType = 'booking'
    icon = 'sports_tennis'
    color = '#15803D'
    bg = '#EAF7EE'
    link = '/checkin'
    linkText = 'Xem vé QR Pass'
  } else if (rawType.includes('CHECK') || rawType.includes('PASS') || rawType.includes('QR')) {
    uiType = 'checkin'
    icon = 'qr_code_scanner'
    color = '#16A34A'
    bg = '#DCFCE7'
    link = '/checkin'
    linkText = 'Mở mã QR Check-in'
  } else if (rawType.includes('PAY') || rawType.includes('ESCROW') || rawType.includes('TRANSACTION')) {
    uiType = 'transaction'
    icon = 'receipt_long'
    color = '#0284C7'
    bg = '#E0F2FE'
    link = '/wallet'
    linkText = 'Xem ví Escrow'
  } else if (rawType.includes('WALLET') || rawType.includes('WITHDRAW') || rawType.includes('TOPUP')) {
    uiType = 'wallet'
    icon = 'account_balance_wallet'
    color = '#059669'
    bg = '#D1FAE5'
    link = '/wallet'
    linkText = 'Chi tiết giao dịch'
  } else if (rawType.includes('FEEDBACK') || rawType.includes('RATING') || rawType.includes('FAIRPLAY')) {
    uiType = 'feedback'
    icon = 'star'
    color = '#EA580C'
    bg = '#FFEDD5'
    link = '/profile'
    linkText = 'Xem đánh giá'
  } else if (rawType.includes('COMMUNITY') || rawType.includes('LFG') || rawType.includes('MATCH')) {
    uiType = 'community'
    icon = 'group'
    color = '#7C3AED'
    bg = '#F3E8FF'
    link = '/community'
    linkText = 'Xem kèo LFG'
  } else {
    uiType = 'system'
    icon = 'info'
    color = '#4B5563'
    bg = '#F3F4F6'
    link = '/profile'
    linkText = 'Xem thông báo'
  }

  const isRead = Boolean(item.isRead ?? item.read ?? false)

  return {
    id: item.id || `notif-${Date.now()}-${Math.random()}`,
    type: uiType,
    rawType,
    icon,
    color,
    bg,
    title: item.title || item.Title || 'Thông báo mới',
    message: item.message || item.content || item.Content || '',
    details: item.details || item.subtitle || (item.createdAt ? `Thời gian: ${new Date(item.createdAt).toLocaleString('vi-VN')}` : ''),
    time: formatTimeAgo(item.createdAt || item.CreatedAt || item.time),
    read: isRead,
    link: item.actionUrl || item.link || link,
    linkText: item.linkText || linkText,
    metadata: item.metadata || item.data || null,
  }
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [toastMessage, setToastMessage] = useState(null)
  const containerRef = useRef(null)

  // Danh sách thông báo
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('player_notifications_v2')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_NOTIFICATIONS
  })

  // State Cài đặt thông báo & Push token
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [disabledTypes, setDisabledTypes] = useState([])
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('sportnexus_browser_push_enabled') === 'true'
  })
  const [pushToken, setPushToken] = useState(() => {
    return localStorage.getItem('sportnexus_browser_push_token') || ''
  })

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Tải số lượng chưa đọc từ server: GET /api/v1/notifications/unread-count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount()
      if (typeof count === 'number') {
        setUnreadCount(count)
      } else {
        const localUnread = notifications.filter((n) => !n.read).length
        setUnreadCount(localUnread)
      }
    } catch (err) {
      console.warn('[NotificationBell] unreadCount error:', err)
      const localUnread = notifications.filter((n) => !n.read).length
      setUnreadCount(localUnread)
    }
  }, [notifications])

  // Tải danh sách thông báo từ server: GET /api/v1/notifications
  const fetchNotificationsList = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        Page: 1,
        PageSize: 40,
      }
      if (unreadOnly) params.UnreadOnly = true
      if (activeTab !== 'all') {
        const typeMap = {
          booking: 'BOOKING',
          transaction: 'PAYMENT',
          wallet: 'WALLET',
          checkin: 'CHECK_IN',
          feedback: 'FEEDBACK',
        }
        if (typeMap[activeTab]) params.Type = typeMap[activeTab]
      }

      const res = await getNotifications(params)
      const items = res?.items || (Array.isArray(res) ? res : [])

      if (items.length > 0) {
        const mapped = items.map(mapServerNotification).filter(Boolean)
        setNotifications(mapped)
        try {
          localStorage.setItem('player_notifications_v2', JSON.stringify(mapped))
        } catch {}
      } else {
        // Fallback sang localStorage nếu BE trả rỗng hoặc offline
        const saved = localStorage.getItem('player_notifications_v2')
        if (saved) {
          try {
            setNotifications(JSON.parse(saved))
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[NotificationBell] Lỗi tải notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, unreadOnly])

  // Tải unread count khi mount và polling nhẹ mỗi 30s
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Tải notifications khi mở dropdown hoặc đổi tab/filter
  useEffect(() => {
    if (isOpen) {
      fetchNotificationsList()
    }
  }, [isOpen, fetchNotificationsList])

  // Lưu vào localStorage khi danh sách thay đổi
  const saveNotifications = (newList) => {
    setNotifications(newList)
    const localUnread = newList.filter((n) => !n.read).length
    setUnreadCount(localUnread)
    try {
      localStorage.setItem('player_notifications_v2', JSON.stringify(newList))
    } catch {}
  }

  // Đóng khi click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Lắng nghe sự kiện thông báo thời gian thực từ app
  useEffect(() => {
    const handleNewNotification = (e) => {
      if (!e.detail) return
      const mapped = mapServerNotification(e.detail)
      if (!mapped) return
      setNotifications((prev) => {
        const next = [mapped, ...prev]
        try {
          localStorage.setItem('player_notifications_v2', JSON.stringify(next))
        } catch {}
        return next
      })
      setUnreadCount((prev) => prev + 1)
      triggerToast(`🔔 ${mapped.title}`)
    }

    window.addEventListener('player_new_notification', handleNewNotification)
    return () => {
      window.removeEventListener('player_new_notification', handleNewNotification)
    }
  }, [])

  // 1. Đánh dấu tất cả đã đọc: PUT /api/v1/notifications/read-all
  const handleMarkAllAsRead = async () => {
    try {
      const typeParam = activeTab !== 'all' ? activeTab.toUpperCase() : undefined
      await markAllNotificationsAsRead(typeParam)
    } catch (err) {
      console.warn('[NotificationBell] markAllAsRead error:', err)
    }
    const updated = notifications.map((n) => ({ ...n, read: true }))
    saveNotifications(updated)
    setUnreadCount(0)
    triggerToast('Đã đánh dấu tất cả thông báo là đã đọc')
  }

  // 2. Xóa 1 thông báo theo ID: DELETE /api/v1/notifications/{id}
  const handleDeleteSingleNotification = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
    } catch (err) {
      console.warn('[NotificationBell] deleteNotification error:', err)
    }
    const next = notifications.filter((n) => n.id !== id)
    saveNotifications(next)
    triggerToast('Đã xóa thông báo')
  }

  // 3. Xóa tất cả thông báo: DELETE /api/v1/notifications
  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo không?')) return
    try {
      await clearAllNotifications()
    } catch (err) {
      console.warn('[NotificationBell] clearAllNotifications error:', err)
    }
    saveNotifications([])
    setUnreadCount(0)
    triggerToast('Đã xóa sạch hộp thư thông báo')
  }

  // 4. Đánh dấu 1 thông báo là đã đọc: PUT /api/v1/notifications/{id}/read
  const handleItemClick = async (item) => {
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id)
      } catch (err) {
        console.warn('[NotificationBell] markNotificationAsRead error:', err)
      }
      const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      saveNotifications(updated)
    }
    if (item.link) {
      setIsOpen(false)
      navigate(item.link)
    }
  }

  // 5. Mở modal Cài đặt thông báo: GET /api/v1/notifications/settings
  const handleOpenSettingsModal = async () => {
    setShowSettingsModal(true)
    setSettingsLoading(true)
    try {
      const data = await getNotificationSettings()
      if (data && Array.isArray(data.disabledTypes)) {
        setDisabledTypes(data.disabledTypes)
      } else {
        const saved = localStorage.getItem('sportnexus_disabled_notif_types')
        if (saved) setDisabledTypes(JSON.parse(saved))
      }
    } catch (err) {
      console.warn('[NotificationBell] getNotificationSettings error:', err)
    } finally {
      setSettingsLoading(false)
    }
  }

  // 6. Lưu Cài đặt thông báo: PUT /api/v1/notifications/settings
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await updateNotificationSettings({ disabledTypes })
      localStorage.setItem('sportnexus_disabled_notif_types', JSON.stringify(disabledTypes))
      triggerToast('🎉 Đã cập nhật cài đặt thông báo thành công!')
      setShowSettingsModal(false)
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể lưu cài đặt'}`)
    } finally {
      setSavingSettings(false)
    }
  }

  // 7. Bật / Tắt nhận Push Notification thiết bị: POST / DELETE /api/v1/notifications/devices
  const handleTogglePushNotifications = async () => {
    if (!pushEnabled) {
      // Yêu cầu quyền Browser Notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          triggerToast('⚠️ Bạn đã từ chối quyền gửi thông báo trên trình duyệt')
          return
        }
      }

      // Tạo token ngẫu nhiên giả lập hoặc từ ServiceWorker
      const generatedToken =
        pushToken || `web-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      try {
        await registerDeviceToken({ token: generatedToken, platform: 'web' })
        setPushToken(generatedToken)
        setPushEnabled(true)
        localStorage.setItem('sportnexus_browser_push_token', generatedToken)
        localStorage.setItem('sportnexus_browser_push_enabled', 'true')
        triggerToast('🔔 Đã kích hoạt nhận thông báo đẩy trên trình duyệt thành công!')
      } catch (err) {
        triggerToast(`⚠️ ${err?.message || 'Lỗi đăng ký token thiết bị'}`)
      }
    } else {
      // Hủy đăng ký push notification
      try {
        if (pushToken) {
          await unregisterDeviceToken({ token: pushToken })
        }
        setPushEnabled(false)
        localStorage.setItem('sportnexus_browser_push_enabled', 'false')
        triggerToast('Đã tắt nhận thông báo đẩy trên trình duyệt')
      } catch (err) {
        triggerToast(`⚠️ ${err?.message || 'Lỗi hủy token thiết bị'}`)
      }
    }
  }

  // Lọc thông báo theo tab & UnreadOnly
  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly && n.read) return false
    if (activeTab === 'all') return true
    if (activeTab === 'booking') return n.type === 'booking'
    if (activeTab === 'transaction') return n.type === 'transaction'
    if (activeTab === 'wallet') return n.type === 'wallet'
    if (activeTab === 'checkin') return n.type === 'checkin'
    if (activeTab === 'feedback') return n.type === 'feedback'
    return true
  })

  return (
    <div className="relative" ref={containerRef}>
      {/* Toast thông báo nhanh */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#1F2937',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Nút Chuông Thông Báo */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-[42px] h-[42px] rounded-full transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-[#15803D] text-white shadow-lg shadow-[#15803D]/30 ring-2 ring-[#86EFAC] scale-105'
            : 'bg-gradient-to-br from-[#EAF7EE] via-[#E2F7E7] to-[#DCFCE7] text-[#15803D] border-2 border-[#86EFAC] shadow-[0_3px_10px_rgba(21,128,61,0.20)] hover:shadow-[0_4px_16px_rgba(21,128,61,0.32)] hover:border-[#22C55E] hover:scale-108 active:scale-95'
        }`}
        title="Chuông thông báo người chơi"
        aria-label="Thông báo"
      >
        <span
          className={`material-symbols-outlined text-[23px] transition-transform duration-200 ${
            isOpen ? 'rotate-[-10deg]' : 'hover:rotate-12'
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </span>

        {/* Unread Badge Nổi Bật với hiệu ứng Ping */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[22px] min-w-[22px] items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            <span className="relative inline-flex min-w-[22px] h-[22px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-[11px] border-2 border-white shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 sm:-right-8 mt-2.5 w-[360px] sm:w-[470px] bg-white rounded-3xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]">
          {/* Header Dropdown */}
          <div className="p-4 pb-3 bg-gradient-to-r from-[#F7FCF8] to-[#EEF9F0] border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#15803D] text-[24px]">
                notifications
              </span>
              <h3 className="font-extrabold text-[16px] text-[#111827]">Thông Báo</h3>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[11px]">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {/* Nút Cài đặt thông báo */}
              <button
                type="button"
                onClick={handleOpenSettingsModal}
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#15803D] hover:bg-[#DCFCE7] font-semibold transition-colors cursor-pointer"
                title="Cài đặt loại thông báo & Push token"
              >
                <span className="material-symbols-outlined text-[17px]">settings</span>
              </button>

              {/* Nút Đánh dấu tất cả đã đọc */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="px-2.5 py-1 rounded-lg text-[#15803D] hover:bg-[#DCFCE7] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                  <span>Đã đọc</span>
                </button>
              )}

              {/* Nút Xóa tất cả */}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                  title="Xoá tất cả thông báo"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                </button>
              )}
            </div>
          </div>

          {/* Bộ Lọc Tabs & Checkbox Chỉ chưa đọc */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#FAFBF9] border-b border-gray-100 text-xs gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-full font-bold text-[11.5px] whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-[#15803D] text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/90'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 cursor-pointer shrink-0 select-none pl-1">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#15803D] rounded cursor-pointer"
              />
              <span>Chưa đọc</span>
            </label>
          </div>

          {/* Danh sách thông báo */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[440px]">
            {loading ? (
              <div className="py-12 text-center text-gray-400">
                <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
                <p className="text-xs mt-1 font-medium">Đang cập nhật thông báo...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2.5">
                  <span className="material-symbols-outlined text-[24px]">notifications_off</span>
                </div>
                <p className="font-bold text-gray-700 text-xs">
                  {unreadOnly ? 'Không có thông báo chưa đọc nào' : 'Chưa có thông báo trong mục này'}
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Các cập nhật {FILTER_TABS.find((t) => t.key === activeTab)?.label} sẽ hiển thị tại đây
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                    item.read
                      ? 'bg-white hover:bg-gray-50/80'
                      : 'bg-[#F0FAF2]/60 hover:bg-[#EAF7EE]'
                  }`}
                >
                  {/* Icon Loại Thông Báo */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {item.icon}
                    </span>
                  </div>

                  {/* Nội Dung */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs leading-snug truncate ${
                          item.read
                            ? 'font-bold text-gray-800'
                            : 'font-extrabold text-[#111827]'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#15803D] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11.5px] text-gray-600 leading-snug">
                      {item.message}
                    </p>

                    {item.details && (
                      <div className="mt-1.5 p-1.5 px-2 rounded-lg bg-gray-50 border border-gray-100 text-[10.5px] text-gray-700 font-medium">
                        {item.details}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 text-[10.5px]">
                      <span className="text-gray-400 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {item.time}
                      </span>
                      {item.linkText && (
                        <span className="text-[#15803D] font-bold group-hover:underline flex items-center gap-0.5">
                          {item.linkText}
                          <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút Xóa 1 thông báo */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingleNotification(e, item.id)}
                    className="absolute top-3 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Xóa thông báo này"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Dropdown */}
          <div className="p-3 bg-[#FAFBF9] border-t border-gray-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${pushEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{pushEnabled ? 'Push Notification: Đang bật' : 'Push Notification: Đã tắt'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                saveNotifications(DEFAULT_NOTIFICATIONS)
                triggerToast('Đã khôi phục dữ liệu thông báo mẫu')
              }}
              className="text-[#15803D] font-bold hover:underline cursor-pointer"
            >
              Khôi phục mẫu
            </button>
          </div>
        </div>
      )}

      {/* MODAL CÀI ĐẶT THÔNG BÁO & THIẾT BỊ (GET /api/v1/notifications/settings, PUT /settings, POST /devices, DELETE /devices) */}
      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>settings</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1C3524' }}>
                    Cài Đặt Kênh Nhận Thông Báo
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#6B7280' }}>
                    Chọn các sự kiện bạn muốn nhận thông báo và quản lý thông báo đẩy trình duyệt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {settingsLoading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '28px' }}>
                  sync
                </span>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>Đang tải cài đặt thông báo...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Push Notification trên Trình duyệt */}
                <div style={{ padding: '14px', background: '#F0FDF4', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        notifications_active
                      </span>
                      Thông báo đẩy Web Push (Trình duyệt)
                    </div>
                    <button
                      type="button"
                      onClick={handleTogglePushNotifications}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: pushEnabled ? '#15803D' : '#D1D5DB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {pushEnabled ? 'Đang Bật' : 'Đang Tắt'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4B5563', lineHeight: 1.4 }}>
                    Nhận thông báo tức thì về lịch đấu, bạn chơi xác nhận vào sân và thanh toán ví Escrow ngay cả khi bạn không mở tab SportNexus.
                  </p>
                  {pushToken && (
                    <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#6B7280', fontFamily: 'monospace' }}>
                      Token: {pushToken.slice(0, 24)}...
                    </div>
                  )}
                </div>

                {/* 2. Danh mục sự kiện thông báo */}
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>
                    Chọn loại thông báo bạn muốn nhận:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {NOTIFICATION_TYPES_CATALOG.map((cat) => {
                      const isDisabled = disabledTypes.includes(cat.code)
                      return (
                        <label
                          key={cat.code}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            background: isDisabled ? '#F9FAFB' : '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!isDisabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDisabledTypes(disabledTypes.filter((t) => t !== cat.code))
                              } else {
                                setDisabledTypes([...disabledTypes, cat.code])
                              }
                            }}
                            style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#15803D', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isDisabled ? '#9CA3AF' : '#1F2937' }}>
                              {cat.label}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                              {cat.desc}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      color: '#4B5563',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={handleSaveSettings}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: savingSettings ? '#9CA3AF' : '#15803D',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: savingSettings ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {savingSettings ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
