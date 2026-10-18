import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function NotificationBell() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const containerRef = useRef(null)

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('player_notifications_v2')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_NOTIFICATIONS
  })

  // Lưu vào localStorage khi danh sách thay đổi
  const saveNotifications = (newList) => {
    setNotifications(newList)
    try {
      localStorage.setItem('player_notifications_v2', JSON.stringify(newList))
    } catch {}
  }

  // Đếm số lượng chưa đọc
  const unreadCount = notifications.filter((n) => !n.read).length

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

  // Lắng nghe sự kiện tạo thông báo mới từ bất kỳ đâu trong app
  useEffect(() => {
    const handleNewNotification = (e) => {
      if (!e.detail) return
      const rawType = e.detail.type || 'booking'
      const icon =
        e.detail.icon ||
        (rawType === 'checkin'
          ? 'qr_code_scanner'
          : rawType === 'feedback' || rawType === 'rating'
          ? 'star'
          : rawType === 'transaction'
          ? 'receipt_long'
          : rawType === 'wallet'
          ? 'account_balance_wallet'
          : rawType === 'friend_code'
          ? 'share'
          : 'sports_tennis')

      const color =
        e.detail.color ||
        (rawType === 'checkin'
          ? '#16A34A'
          : rawType === 'feedback' || rawType === 'rating'
          ? '#EA580C'
          : rawType === 'transaction'
          ? '#0284C7'
          : rawType === 'wallet'
          ? '#15803D'
          : rawType === 'friend_code'
          ? '#7C3AED'
          : '#15803D')

      const bg =
        e.detail.bg ||
        (rawType === 'checkin'
          ? '#DCFCE7'
          : rawType === 'feedback' || rawType === 'rating'
          ? '#FFEDD5'
          : rawType === 'transaction'
          ? '#E0F2FE'
          : rawType === 'wallet'
          ? '#EAF7EE'
          : rawType === 'friend_code'
          ? '#F3E8FF'
          : '#EAF7EE')

      const item = {
        id: `notif-${Date.now()}`,
        time: 'Vừa xong',
        read: false,
        icon,
        color,
        bg,
        message: e.detail.message || e.detail.content || '',
        details: e.detail.details || '',
        link: e.detail.link || '/checkin',
        linkText: e.detail.linkText || (rawType === 'booking' ? 'Xem vé QR Pass' : rawType === 'transaction' || rawType === 'wallet' ? 'Xem ví Escrow' : 'Xem chi tiết'),
        ...e.detail,
      }

      setNotifications((prev) => {
        const next = [item, ...prev]
        try {
          localStorage.setItem('player_notifications_v2', JSON.stringify(next))
        } catch {}
        return next
      })
    }

    window.addEventListener('player_new_notification', handleNewNotification)
    return () => {
      window.removeEventListener('player_new_notification', handleNewNotification)
    }
  }, [])

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    saveNotifications(updated)
  }

  // Xoá tất cả thông báo
  const handleClearAll = () => {
    saveNotifications([])
  }

  // Đánh dấu 1 thông báo là đã đọc
  const handleItemClick = (item) => {
    const updated = notifications.map((n) =>
      n.id === item.id ? { ...n, read: true } : n
    )
    saveNotifications(updated)
    if (item.link) {
      setIsOpen(false)
      navigate(item.link)
    }
  }

  // Lọc theo tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'booking') return n.type === 'booking'
    if (activeTab === 'transaction') return n.type === 'transaction'
    if (activeTab === 'wallet') return n.type === 'wallet'
    if (activeTab === 'checkin')
      return n.type === 'checkin' || n.type === 'invite' || n.type === 'friend_code'
    if (activeTab === 'feedback')
      return n.type === 'feedback' || n.type === 'rating'
    return true
  })

  return (
    <div className="relative" ref={containerRef}>
      {/* Nút Chuông Thông Báo - Thiết kế nổi bật, viền màu xanh thể thao, bóng đổ sinh động */}
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

        {/* Unread Badge Nổi Bật với hiệu ứng Ping hào quang */}
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
        <div className="absolute right-0 sm:-right-8 mt-2.5 w-[350px] sm:w-[450px] bg-white rounded-3xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]">
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

            <div className="flex items-center gap-1.5 text-[11px]">
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
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                  title="Xoá tất cả thông báo"
                >
                  <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                </button>
              )}
            </div>
          </div>

          {/* Bộ Lọc Tabs - Đầy đủ Tất cả, Đặt sân, Giao dịch, Ví Escrow, Check-in QR, Feedback */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#FAFBF9] border-b border-gray-100 text-xs overflow-x-auto scrollbar-none">
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

          {/* Danh sách thông báo */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[440px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2.5">
                  <span className="material-symbols-outlined text-[24px]">notifications_off</span>
                </div>
                <p className="font-bold text-gray-700 text-xs">Chưa có thông báo trong mục này</p>
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
                  <div className="flex-1 min-w-0">
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
                      {item.message || item.content}
                    </p>

                    {(item.details || (item.meta && (item.meta.amount || item.meta.court || item.meta.token))) && (
                      <div className="mt-1.5 p-1.5 px-2 rounded-lg bg-gray-50 border border-gray-100 text-[10.5px] text-gray-700 font-medium">
                        {item.details ? (
                          item.details
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {item.meta?.court && (
                              <div>
                                Sân: <strong className="text-gray-900">{item.meta.court}</strong>
                                {item.meta.timeSlot ? ` • Khung giờ: ${item.meta.timeSlot}` : ''}
                              </div>
                            )}
                            {item.meta?.amount && (
                              <div>
                                Số tiền thanh toán: <strong className="text-[#15803D] font-bold">-{new Intl.NumberFormat('vi-VN').format(item.meta.amount)} đ</strong>
                                {item.meta.method ? ` • Qua: ${item.meta.method === 'escrow' ? 'Ví Escrow' : 'Ngân hàng VietQR'}` : ''}
                              </div>
                            )}
                            {item.meta?.token && (
                              <div className="text-gray-500">Mã vé Check-in: #{item.meta.token}</div>
                            )}
                          </div>
                        )}
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
                </div>
              ))
            )}
          </div>

          {/* Footer Dropdown */}
          <div className="p-3 bg-[#FAFBF9] border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-medium">
              Đồng bộ dữ liệu thời gian thực
            </span>
            <button
              type="button"
              onClick={() => {
                saveNotifications(DEFAULT_NOTIFICATIONS)
              }}
              className="text-[#15803D] font-bold hover:underline cursor-pointer"
            >
              Khôi phục mẫu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
