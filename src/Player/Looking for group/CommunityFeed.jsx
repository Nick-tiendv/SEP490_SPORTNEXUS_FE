import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function CommunityFeed() {
  const navigate = useNavigate()
  // Sports filter state: 'all' | 'pickleball' | 'badminton'
  const [activeSportFilter, setActiveSportFilter] = useState('badminton')
  const [levelFilter, setLevelFilter] = useState('all')
  const [distanceFilter, setDistanceFilter] = useState('all')

  // Advanced Filter Modal States
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(['morning', 'afternoon', 'evening']) // 'morning', 'afternoon', 'evening'
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all')
  const [selectedDistance, setSelectedDistance] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [filterMinFairPlay, setFilterMinFairPlay] = useState(true)
  const [filterFlashOnly, setFilterFlashOnly] = useState(false)
  const [filterStandardCourt, setFilterStandardCourt] = useState(true)

  // Modals state
  const [bookingModal, setBookingModal] = useState(null) // match object or null
  const [createMatchOpen, setCreateMatchOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [rulesModalOpen, setRulesModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Wallet balance sync
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  // Matches list
  const [matches, setMatches] = useState(() => {
    const defaultList = [
      {
        id: 1,
        sport: 'badminton',
        sportBadge: 'CẦU LÔNG ĐÔI',
        subBadge: 'Cầu Yonex AS-40',
        levelTag: 'Trung bình - Khá',
        slotTag: 'Cần 2 Người (Nam/Nữ)',
        time: '18:00 Tối Nay',
        timeSlot: 'evening',
        title: '[Cầu Lông Đôi Nam Nữ] Giao lưu vui vẻ, sân thảm xịn (Trung bình - Khá)',
        location: 'Sân Cầu Lông Tre Xanh, Đinh Bộ Lĩnh, Bình Thạnh',
        groupDesc: 'Nhóm văn phòng nhiệt tình, thân thiện',
        roster: [
          { initials: 'DT', bg: '#0D9488', name: 'Dương Tuấn' },
          { initials: 'MA', bg: '#15803D', name: 'Minh Anh' },
          { initials: '?', bg: 'empty', name: 'Slot trống 1' },
          { initials: '?', bg: 'empty', name: 'Slot trống 2' },
        ],
        currentSlots: 2,
        totalSlots: 4,
        priceLabel: 'Tiền cọc ký quỹ:',
        price: 45000,
        priceDisplay: '45.000 đ',
        buttonText: 'Chốt Slot Ngay',
        isFlashClaim: false,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop',
      },
      {
        id: 2,
        sport: 'pickleball',
        sportBadge: 'PICKLEBALL ĐÔI',
        subBadge: '✓ Sân Thảm Tiêu Chuẩn',
        levelTag: 'DUPR 3.5 - 4.0',
        slotTag: 'Còn Trống 1 Chỗ',
        time: '20:30 Tối nay',
        timeSlot: 'evening',
        title: '[Pickleball Đôi] Cần 1 tay vợt giao lưu nâng cao (DUPR 3.5 - 4.0)',
        location: 'Sân SportNexus Arena, Huỳnh Tấn Phát, Quận 7',
        groupDesc: 'Đã có 3/4 người (Host: Hoàng Bách)',
        roster: [
          { initials: 'HE', bg: '#16A34A', name: 'Hoàng Em' },
          { initials: 'TL', bg: '#0284C7', name: 'Thanh Long' },
          { initials: 'NB', bg: '#6366F1', name: 'Ngọc Bích' },
          { initials: '?', bg: 'empty', name: 'Slot trống' },
        ],
        currentSlots: 3,
        totalSlots: 4,
        urgencyText: '1 Slot còn lại sẽ khoá sau 12 phút',
        priceLabel: 'Tiền cọc chia đều:',
        price: 55000,
        priceDisplay: '55.000 đ',
        buttonText: 'Chốt Slot Ngay',
        isFlashClaim: true,
        image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
      },
      {
        id: 3,
        sport: 'badminton',
        sportBadge: 'CẦU LÔNG ĐÔI',
        subBadge: '✓ Sân Thảm Yonex',
        levelTag: 'Trung bình',
        slotTag: 'Cần 2 Người (Nam/Nữ)',
        time: '14:30 Chiều nay',
        timeSlot: 'afternoon',
        title: '[Cầu Lông Đôi Nam Nữ] Giao lưu kỹ thuật buổi chiều, sân điều hoà mát rượi',
        location: 'Sân Cầu Lông Lan Anh, Cách Mạng Tháng 8, Quận 10',
        groupDesc: 'Nhóm đánh kỹ thuật, bền cầu, ưu tiên giao lưu vui vẻ',
        roster: [
          { initials: 'TQ', bg: '#0284C7', name: 'Trần Quân' },
          { initials: 'VH', bg: '#15803D', name: 'Vũ Hải' },
          { initials: '?', bg: 'empty', name: 'Slot trống 1' },
          { initials: '?', bg: 'empty', name: 'Slot trống 2' },
        ],
        currentSlots: 2,
        totalSlots: 4,
        priceLabel: 'Tiền cọc ký quỹ:',
        price: 40000,
        priceDisplay: '40.000 đ',
        buttonText: 'Chốt Slot Ngay',
        isFlashClaim: false,
        image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=800&h=600&fit=crop',
      },
      {
        id: 4,
        sport: 'pickleball',
        sportBadge: 'PICKLEBALL ĐÔI',
        subBadge: '✓ Sân Acrylic USAPA',
        levelTag: 'DUPR 3.0 - 4.0',
        slotTag: 'Còn Trống 2 Chỗ',
        time: '19:00 Tối mai',
        timeSlot: 'evening',
        title: '[Pickleball Giao Lưu] D-Pickleball Hub Thảo Điền - Đánh vui vẻ, chia tiền sòng phẳng',
        location: 'D-Pickleball Hub, 28 Thảo Điền, TP. Thủ Đức',
        groupDesc: 'Nhóm thân thiện, có nước & bóng thi đấu sẵn',
        roster: [
          { initials: 'NV', bg: '#0D9488', name: 'Nguyễn Việt' },
          { initials: 'KL', bg: '#7C3AED', name: 'Khánh Linh' },
          { initials: '?', bg: 'empty', name: 'Slot trống 1' },
          { initials: '?', bg: 'empty', name: 'Slot trống 2' },
        ],
        currentSlots: 2,
        totalSlots: 4,
        priceLabel: 'Tiền cọc chia đều:',
        price: 50000,
        priceDisplay: '50.000 đ',
        buttonText: 'Chốt Slot Ngay',
        isFlashClaim: false,
        image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
      },
    ]

    try {
      const custom = localStorage.getItem('lfg_custom_matches')
      const customList = custom ? JSON.parse(custom) : []
      return [...customList, ...defaultList]
    } catch {
      return defaultList
    }
  })

  // Vị trí người chơi lấy từ Hồ sơ cá nhân (mặc định 'Thủ Đức')
  const [userProfileLocation, setUserProfileLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.location) return parsed.location
      }
    } catch {}
    return 'Thủ Đức'
  })

  // Lắng nghe cập nhật khi người chơi chỉnh sửa vị trí trong Profile
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const loc = e.detail?.location
      if (loc) setUserProfileLocation(loc)
      else {
        try {
          const saved = localStorage.getItem('player_profile_data')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.location) setUserProfileLocation(parsed.location)
          }
        } catch {}
      }
    }
    const handleStorage = (e) => {
      if (e.key === 'player_profile_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.location) setUserProfileLocation(parsed.location)
        } catch {}
      }
    }
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const isMatchNearUser = (matchLoc, userLoc) => {
    if (!matchLoc || !userLoc) return false
    const normM = matchLoc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const normU = userLoc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (normM.includes(normU) || normU.includes(normM)) return true
    if ((normU.includes('thu duc') || normU.includes('quan 2')) && (normM.includes('thu duc') || normM.includes('thao dien'))) return true
    if (normU.includes('binh thanh') && (normM.includes('binh thanh') || normM.includes('dinh bo linh'))) return true
    if (normU.includes('quan 7') && (normM.includes('quan 7') || normM.includes('huynh tan phat'))) return true
    return false
  }

  // New match form state
  const [newMatch, setNewMatch] = useState({
    sport: 'badminton',
    title: '',
    location: '',
    time: '19:30 Ngày mai',
    level: 'Trung bình - Khá',
    slots: 2,
    deposit: 50000,
  })

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Confirm Slot Claim Handler
  const handleConfirmClaim = () => {
    if (!bookingModal) return

    if (walletBalance < bookingModal.price) {
      alert('Số dư ví hiện tại không đủ để giữ slot. Vui lòng nạp thêm tiền!')
      return
    }

    const newBal = walletBalance - bookingModal.price
    setWalletBalance(newBal)
    localStorage.setItem('escrow_balance', newBal.toString())
    window.dispatchEvent(new Event('escrow_balance_updated'))

    // Update match slot
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === bookingModal.id) {
          const nextRoster = [...m.roster]
          const emptyIdx = nextRoster.findIndex((r) => r.bg === 'empty')
          if (emptyIdx !== -1) {
            nextRoster[emptyIdx] = {
              initials: 'MMM',
              bg: '#2D5F3F',
              name: 'Minh Minh Minh (Bạn)',
            }
          }
          return {
            ...m,
            currentSlots: Math.min(m.totalSlots, m.currentSlots + 1),
            roster: nextRoster,
          }
        }
        return m
      })
    )

    setToastMessage({
      title: 'Giữ Slot Thành Công!',
      desc: `Đã xác nhận giữ slot cho trận "${bookingModal.title}". Phí cọc ${bookingModal.priceDisplay} đã được tạm giữ an toàn.`,
      type: 'success',
    })
    setBookingModal(null)

    // Quay về trang chủ chính của trang Ghép trận
    navigate('/community')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Create match submit handler
  const handleCreateMatchSubmit = (e) => {
    e.preventDefault()
    if (!newMatch.title || !newMatch.location) {
      alert('Vui lòng nhập đầy đủ tiêu đề và địa điểm sân!')
      return
    }

    const created = {
      id: Date.now(),
      sport: newMatch.sport,
      sportBadge: newMatch.sport === 'badminton' ? 'CẦU LÔNG ĐÔI' : 'PICKLEBALL ĐÔI',
      subBadge: '✓ Kèo Mới Đăng',
      levelTag: newMatch.level,
      slotTag: `Cần ${newMatch.slots} Người`,
      time: newMatch.time,
      title: newMatch.title,
      location: newMatch.location,
      groupDesc: 'Host: Minh Minh Minh (99.4 Uy Tín)',
      roster: [
        { initials: 'MMM', bg: '#2D5F3F', name: 'Minh Minh Minh' },
        ...Array.from({ length: Number(newMatch.slots) }, (_, i) => ({
          initials: '?',
          bg: 'empty',
          name: `Slot ${i + 1}`,
        })),
      ],
      currentSlots: 1,
      totalSlots: 1 + Number(newMatch.slots),
      priceLabel: 'Tiền cọc ký quỹ:',
      price: Number(newMatch.deposit),
      priceDisplay: `${new Intl.NumberFormat('vi-VN').format(newMatch.deposit)} đ`,
      buttonText: 'Chốt Slot Ngay',
      isFlashClaim: false,
      image:
        newMatch.sport === 'badminton'
          ? 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop'
          : 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
    }

    setMatches((prev) => [created, ...prev])
    setCreateMatchOpen(false)
    setToastMessage({
      title: 'Đăng Kèo Thành Công!',
      desc: 'Kèo của bạn đã được broadcast tới toàn bộ mạng lưới SportNexus.',
      type: 'success',
    })
  }

  // Toggle time slot selection
  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(slot)) {
        if (prev.length === 1) return prev // keep at least 1 slot selected
        return prev.filter((s) => s !== slot)
      }
      return [...prev, slot]
    })
  }

  // Reset filters
  const handleResetFilters = () => {
    setActiveSportFilter('all')
    setSelectedTimeSlots(['morning', 'afternoon', 'evening'])
    setSelectedSkillLevel('all')
    setSelectedDistance('all')
    setSelectedFormat('all')
    setFilterMinFairPlay(true)
    setFilterFlashOnly(false)
    setFilterStandardCourt(false)
  }

  // Filtered matches (ưu tiên hiển thị các kèo gần vị trí hồ sơ người chơi lên đầu)
  const filteredMatches = matches
    .filter((m) => {
      if (activeSportFilter !== 'all' && m.sport !== activeSportFilter) return false
      if (m.timeSlot && !selectedTimeSlots.includes(m.timeSlot)) return false
      if (filterFlashOnly && !m.isFlashClaim) return false
      return true
    })
    .sort((a, b) => {
      const aNear = isMatchNearUser(a.location, userProfileLocation) ? 1 : 0
      const bNear = isMatchNearUser(b.location, userProfileLocation) ? 1 : 0
      return bNear - aNear
    })

  return (
    <div className="w-full min-h-screen text-[#1E293B] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-3 bg-[#1C3524] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#34D399]/40 animate-bounce">
          <span className="material-symbols-outlined text-[#34D399] text-2xl">check_circle</span>
          <div>
            <p className="font-bold text-sm">{toastMessage.title}</p>
            <p className="text-xs text-[#A7F3D0]">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Realtime WebSocket SignalR Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EE] text-[#15803D] font-bold text-[11px] tracking-wider uppercase border border-[#DCFCE7]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shadow-[0_0_8px_#16A34A]"></span>
            REALTIME WEBSOCKET SIGNALR
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-[11px] border border-[#FDE68A] shadow-2xs">
            <span className="material-symbols-outlined text-[13px] text-[#D97706]">location_on</span>
            <span>Vị trí ghép: {userProfileLocation} (Đồng bộ hồ sơ)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] font-semibold text-[11px]">
            <span className="material-symbols-outlined text-[13px]">bolt</span>
            Độ trễ: 18ms
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-gray-500 font-medium text-[12px]">
            142 Vận Động Viên Đang Tìm Đội
          </span>
        </div>

        {/* Title & Description & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-[36px] font-black text-[#111827] tracking-tight leading-tight">
              Sàn Ghép Trận &amp; Tranh Slot
            </h1>
            <p className="text-gray-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Chốt slot thể thao tức thì qua giao thức ký quỹ Escrow bảo chứng 100%. Không lo bùng
              kèo, chuẩn trình độ DUPR xác minh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Bộ Lọc Nâng Cao Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#334155] font-semibold text-sm transition-all shadow-sm border border-gray-200/60"
            >
              <span className="material-symbols-outlined text-[18px] text-[#475569]">tune</span>
              <span>Bộ Lọc Nâng Cao</span>
            </button>

            {/* Đăng Kèo Ghép Mới Button */}
            <button
              onClick={() => navigate('/create-match')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(59,104,23,0.35)] cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Đăng Kèo Ghép Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Bar Chips */}
        <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-white border border-gray-200/80 shadow-sm mb-7">
          {/* Tất Cả Thể Thao */}
          <button
            onClick={() => setActiveSportFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSportFilter === 'all'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">✨</span>
            <span>Tất Cả Thể Thao</span>
          </button>

          {/* Pickleball */}
          <button
            onClick={() => setActiveSportFilter('pickleball')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSportFilter === 'pickleball'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">🏓</span>
            <span>Pickleball</span>
          </button>

          {/* Cầu Lông */}
          <button
            onClick={() => setActiveSportFilter('badminton')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSportFilter === 'badminton'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">🏸</span>
            <span>Cầu Lông</span>
          </button>

          {/* Dropdown Trình độ */}
          <div className="relative">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-gray-200 cursor-pointer focus:outline-none"
            >
              <option value="all">Trình độ: Tất Cả Trình Độ</option>
              <option value="beginner">Mới chơi / Nhập môn</option>
              <option value="intermediate">Trung bình (DUPR 3.0 - 3.8)</option>
              <option value="advanced">Nâng cao (DUPR 3.8+)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Dropdown Khoảng cách */}
          <div className="relative">
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-gray-200 cursor-pointer focus:outline-none"
            >
              <option value="all">Khoảng cách: Toàn TP</option>
              <option value="5km">Dưới 5 km</option>
              <option value="10km">Dưới 10 km</option>
              <option value="district">Cùng quận/huyện</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {/* 2-Column Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* ================= LEFT COLUMN: MATCHES FEED ================= */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Flash Queue Banner */}
            <div className="bg-[#EAF7E8] border border-[#C6E7BE] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#3B6817] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">sensors</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Kèo Tranh Slot Nóng (Flash Queue)
                  </h3>
                  <p className="text-xs text-[#4A6B45] mt-0.5">
                    Slot giải phóng tức thì khi có thành viên xin rút hoặc trễ giờ check-in 15p.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span>Auto-Sync 5s</span>
              </div>
            </div>

            {/* Match Cards List */}
            {filteredMatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                  search_off
                </span>
                <p className="font-bold text-gray-700">Chưa tìm thấy kèo phù hợp bộ lọc</p>
                <p className="text-xs text-gray-500 mt-1">
                  Vui lòng chọn bộ lọc khác hoặc tự đăng kèo mới ngay!
                </p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Left: Court Image with Overlays */}
                  <div className="sm:w-[40%] relative min-h-[220px] sm:min-h-[250px] overflow-hidden group">
                    <img
                      src={match.image}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top-left Sport Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-[#134E4A]/90 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                        <span className="text-[13px] leading-none">
                          {match.sport === 'badminton' ? '🏸' : '🏓'}
                        </span>
                        {match.sportBadge}
                      </span>
                    </div>

                    {/* Bottom-left Equipment / Surface Tag */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                        {match.sport === 'badminton' ? (
                          <>
                            <span className="material-symbols-outlined text-[13px] text-green-300">
                              sports_tennis
                            </span>
                            {match.subBadge}
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[13px] text-green-400 font-bold">
                              check
                            </span>
                            {match.subBadge}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right: Match Details */}
                  <div className="sm:w-[60%] p-5 sm:p-6 flex flex-col justify-between gap-4">
                    <div>
                      {/* Top Badges & Time */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              match.sport === 'badminton'
                                ? 'bg-[#EFF6FF] text-[#1E40AF]'
                                : 'bg-[#EEF2FF] text-[#4338CA]'
                            }`}
                          >
                            {match.levelTag}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              match.isFlashClaim
                                ? 'bg-[#FEE2E2] text-[#DC2626]'
                                : 'bg-[#E0F2FE] text-[#0369A1]'
                            }`}
                          >
                            {match.slotTag}
                          </span>
                          {isMatchNearUser(match.location, userProfileLocation) && (
                            <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1 shadow-2xs">
                              <span className="material-symbols-outlined text-[13px] text-[#16A34A]">near_me</span>
                              Gần bạn ({userProfileLocation})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
                          <span className="material-symbols-outlined text-[14px] text-gray-500">
                            schedule
                          </span>
                          <span>{match.time}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-[16px] font-bold text-[#111827] leading-snug hover:text-[#3B6817] transition-colors cursor-pointer">
                        {match.title}
                      </h2>

                      {/* Location & Group Info */}
                      <div className="flex flex-col gap-1 mt-2.5 text-xs text-gray-600">
                        <div className="flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0 mt-0.5">
                            location_on
                          </span>
                          <span>{match.location}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0 mt-0.5">
                            group
                          </span>
                          <span>{match.groupDesc}</span>
                        </div>
                      </div>

                      {/* Rosters / Slots Row */}
                      <div className="flex items-center gap-2.5 mt-3 pt-2">
                        <div className="flex items-center -space-x-1.5">
                          {match.roster.map((player, idx) => (
                            <div
                              key={idx}
                              title={player.name}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold border-2 border-white shadow-xs ${
                                player.bg === 'empty'
                                  ? 'bg-gray-100 text-gray-400 border-dashed border-gray-300'
                                  : 'text-white'
                              }`}
                              style={{
                                backgroundColor:
                                  player.bg !== 'empty' ? player.bg : undefined,
                              }}
                            >
                              {player.initials}
                            </div>
                          ))}
                        </div>

                        {match.urgencyText ? (
                          <span className="text-xs text-[#B45309] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {match.urgencyText}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">
                            Đã ghép: {match.currentSlots}/{match.totalSlots} vị trí
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price & Action */}
                    <div className="flex items-end justify-between gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[11px] text-gray-500 block">
                          {match.priceLabel}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[20px] font-black text-[#111827]">
                            {match.priceDisplay}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">/người</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setBookingModal(match)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-95 ${
                          match.isFlashClaim
                            ? 'bg-[#3B6817] hover:bg-[#315613] shadow-[0_4px_14px_rgba(59,104,23,0.35)]'
                            : 'bg-[#3B6817] hover:bg-[#315613] shadow-[0_4px_14px_rgba(59,104,23,0.35)]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">bolt</span>
                        <span>{match.buttonText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= RIGHT COLUMN: SIDEBAR CARDS ================= */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Card 1: HỒ SƠ GHÉP TRẬN CÁ NHÂN (PROMINENT & HIGHLIGHTED) */}
            <div className="relative rounded-3xl bg-gradient-to-br from-white via-[#F7FCF8] to-[#EEF9F0] border-2 border-[#86EFAC] p-5 sm:p-6 shadow-[0_12px_36px_rgba(45,95,63,0.14)] hover:shadow-[0_16px_44px_rgba(45,95,63,0.2)] transition-all overflow-hidden group">
              {/* Top Glowing Color Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#10B981] via-[#22C55E] to-[#15803D]" />

              {/* Watermark Background Icon */}
              <div className="absolute -right-3 -bottom-5 text-[#86EFAC]/15 select-none pointer-events-none">
                <span className="material-symbols-outlined text-[130px]">sports_score</span>
              </div>

              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">badge</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1F2937]">
                    Hồ Sơ Ghép Trận Cá Nhân
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#DCFCE7] to-[#BBF7D0] text-[#15803D] border border-[#86EFAC] text-[11px] font-black shadow-xs tracking-wide">
                  <span className="material-symbols-outlined text-[14px] text-[#15803D] animate-spin" style={{ animationDuration: '6s' }}>diamond</span>
                  Hạng Kim Cương
                </span>
              </div>

              {/* Avatar + Name + Level + Status */}
              <div className="flex items-start gap-3.5 mb-4 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-[58px] h-[58px] rounded-2xl bg-gradient-to-br from-[#1B4D2E] via-[#2D5F3F] to-[#15803D] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#2D5F3F]/35 ring-4 ring-[#86EFAC]/50 group-hover:scale-105 transition-transform">
                    MMM
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[12px] font-black">check</span>
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-[17px] text-[#0F172A] leading-tight">
                      Minh Minh Minh
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] font-extrabold text-[10.5px]">
                      DUPR 3.8
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Thành viên từ T10/2025 • Niên khoá 2026
                  </p>

                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-gray-700 font-bold">
                    <span className="material-symbols-outlined text-[15px] text-[#15803D]">location_on</span>
                    <span>Vị trí thi đấu: <strong className="text-[#15803D]">{userProfileLocation}</strong></span>
                    <span className="text-[9.5px] text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded font-extrabold border border-[#86EFAC]/70">Đã đồng bộ</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-[#EAF7EE] border border-[#86EFAC] text-[#15803D] text-[11px] font-bold self-start shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping"></span>
                    <span>Đang Online Sẵn Sàng (Pickleball &amp; Cầu Lông)</span>
                  </div>
                </div>
              </div>

              {/* Fair Play Score Highlight Box */}
              <div className="mb-4 p-3.5 rounded-2xl bg-white border border-[#D1EBD0] shadow-2xs relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800">
                    <span className="material-symbols-outlined text-[17px] text-red-500">
                      flag
                    </span>
                    <span>Chỉ Số Fair Play</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#15803D] text-[9.5px] font-extrabold">Top 1%</span>
                  </div>
                  <div className="text-right flex items-baseline gap-1">
                    <span className="text-[22px] font-black text-[#15803D] tracking-tight">99.4</span>
                    <span className="text-xs text-gray-400 font-bold">/100</span>
                  </div>
                </div>

                {/* Glowing Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#10B981] via-[#22C55E] to-[#15803D] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                    style={{ width: '99.4%' }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 text-[10.5px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1 text-[#15803D]">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    100% Hoàn thành trận
                  </span>
                  <span className="text-gray-400">0 Lần huỷ kèo trễ</span>
                </div>
              </div>

              {/* 2 Stats Mini Cards */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 rounded-2xl bg-white border border-[#DCEBDC] hover:border-[#86EFAC] transition-colors shadow-2xs flex flex-col justify-between">
                  <span className="text-[10.5px] text-gray-500 font-semibold block mb-1">
                    Trận đã ghép:
                  </span>
                  <div className="flex items-center gap-1 text-[16px] font-black text-[#111827]">
                    <span>14 Trận</span>
                    <span className="material-symbols-outlined text-[16px] text-[#15803D]">
                      verified_user
                    </span>
                  </div>
                  <span className="text-[11px] text-[#15803D] font-extrabold block mt-1">
                    100% không bùng kèo
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#DCEBDC] hover:border-[#86EFAC] transition-colors shadow-2xs flex flex-col justify-between">
                  <span className="text-[10.5px] text-gray-500 font-semibold block mb-1">
                    Đánh giá cộng đồng:
                  </span>
                  <div className="flex items-center gap-1 text-[16px] font-black text-[#111827]">
                    <span>4.95 / 5.0</span>
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      star
                    </span>
                  </div>
                  <span className="text-[10.5px] text-gray-500 font-semibold block mt-1">
                    28 lượt vote uy tín
                  </span>
                </div>
              </div>

              {/* Quick Profile Footer Action */}
              <div className="mt-3.5 pt-3 border-t border-[#DCEBDC] flex items-center justify-between text-[11px] font-bold relative z-10">
                <span className="text-gray-500">Tự động nhận lời mời:</span>
                <span className="inline-flex items-center gap-1 text-[#15803D] bg-[#EAF7EE] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                  Bật Sẵn Sàng
                </span>
              </div>
            </div>

            {/* Card 2: Cam Kết Chống Bùng Cọc 100% */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <h3 className="font-bold text-[15px] text-[#111827]">
                  Cam Kết Chống Bùng Cọc 100%
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Cơ chế bảo vệ vận động viên minh bạch áp dụng toàn bộ hệ sinh thái SportNexus:
              </p>

              {/* 4 Rules */}
              <div className="flex flex-col gap-3 text-xs">
                {/* Rule 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    +
                  </div>
                  <p className="text-gray-700 leading-snug">
                    <strong className="text-gray-900">+1.5 Điểm Fair Play</strong> mỗi khi đến
                    đúng giờ và hoàn tất xác thực QR Check-in.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FEE2E2] text-[#DC2626] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    -
                  </div>
                  <p className="text-gray-700 leading-snug">
                    <strong className="text-red-700">Trừ 100% tiền cọc</strong> nếu huỷ slot dưới
                    60 phút trước giờ thi đấu hoặc không đến (No-show).
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    !
                  </div>
                  <p className="text-gray-700 leading-snug">
                    <strong className="text-gray-900">Tài khoản &lt; 80 Điểm</strong> sẽ bị hạn
                    chế quyền Flash Claim và bắt buộc cọc x2 giá trị thông thường.
                  </p>
                </div>

                {/* Rule 4 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-gray-700 leading-snug">
                    <strong className="text-[#15803D]">Hoàn 100% tức thì</strong> vào ví Escrow
                    nếu kèo bị host giải tán hoặc sân bị ảnh hưởng do thời tiết mưa to.
                  </p>
                </div>
              </div>

              {/* Link */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setRulesModalOpen(true)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#15803D] hover:text-[#0F5A29] group transition-colors"
                >
                  <span>Xem quy chế trọng tài số &amp; phân giải tranh chấp</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            {/* Card 3: HOẠT ĐỘNG THỜI GIAN THỰC */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Hoạt Động Thời Gian Thực
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping"></span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Activity 1 */}
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-[#3B6817]">
                      bolt
                    </span>
                    <span className="text-gray-700 font-medium">
                      <strong className="text-gray-900">Tuấn Kiệt</strong> vừa chốt slot Pickleball
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">12s trước</span>
                </div>

                {/* Activity 2 */}
                <div className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-green-600">
                      verified_user
                    </span>
                    <span className="text-gray-700 font-medium">
                      <strong className="text-gray-900">Bình An</strong> vừa check-in sân Tre Xanh
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">22m trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="mt-16 pt-8 border-t border-gray-200/80 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#3B6817] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                </div>
                <span className="font-extrabold text-sm text-[#111827] tracking-tight">
                  SPORTNEXUS VIETNAM
                </span>
              </div>
              <p className="max-w-md text-gray-600 leading-relaxed">
                Hệ thống kết nối thi đấu Pickleball &amp; Cầu Lông hàng đầu cùng giao thức ký quỹ
                Escrow minh bạch 2026.
              </p>
              <p className="mt-2 text-gray-400 text-[11px]">
                © 2026 SportNexus Vietnam Joint Stock Company. Bảo lưu mọi quyền.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2.5">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">
                    support_agent
                  </span>
                  Hotline 24/7: <strong>0968950913</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#15803D]">
                    verified_user
                  </span>
                  Bảo vệ Ký Quỹ Escrow
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-500 text-xs">
                <a href="#terms" className="hover:text-[#15803D] transition-colors">
                  Điều khoản dịch vụ
                </a>
                <span>•</span>
                <a href="#fairplay" className="hover:text-[#15803D] transition-colors">
                  Chính sách Fairplay
                </a>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#15803D] font-bold mt-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span>
                  HỆ THỐNG BẢO CHỨNG ESCROW THỜI GIAN THỰC • PICKLEBALL &amp; CẦU LÔNG
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ================= MODAL: XÁC NHẬN CHỌN SLOT NHANH ================= */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[22px]">bolt</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#111827] leading-tight">
                    Xác nhận chọn Slot nhanh
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Bảo chứng giữ chỗ an toàn qua Hợp đồng Escrow</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Chi Tiết Thông Tin Trận Đấu */}
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-gray-200/80 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      bookingModal.sport === 'badminton'
                        ? 'bg-[#EFF6FF] text-[#1E40AF]'
                        : 'bg-[#EEF2FF] text-[#4338CA]'
                    }`}
                  >
                    {bookingModal.sportBadge || (bookingModal.sport === 'badminton' ? 'CẦU LÔNG ĐÔI' : 'PICKLEBALL ĐÔI')}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {bookingModal.levelTag}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {bookingModal.slotTag || `Đã ghép: ${bookingModal.currentSlots}/${bookingModal.totalSlots} chỗ`}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-[#111827] text-sm sm:text-base leading-snug">
                  {bookingModal.title}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600 pt-2 border-t border-gray-200/60">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">
                    location_on
                  </span>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Địa điểm sân</span>
                    <span className="text-gray-800 font-medium leading-tight">{bookingModal.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">
                    schedule
                  </span>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Thời gian thi đấu</span>
                    <span className="text-gray-800 font-semibold">{bookingModal.time}</span>
                  </div>
                </div>

                {bookingModal.groupDesc && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <span className="material-symbols-outlined text-[17px] text-gray-400 shrink-0 mt-0.5">
                      group
                    </span>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Thông tin nhóm / Host</span>
                      <span className="text-gray-700">{bookingModal.groupDesc}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Roster & Slot Status */}
              {bookingModal.roster && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-500">Đội hình ({bookingModal.currentSlots}/{bookingModal.totalSlots}):</span>
                    <div className="flex items-center -space-x-1.5">
                      {bookingModal.roster.map((player, idx) => (
                        <div
                          key={idx}
                          title={player.name}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[9.5px] font-bold border-2 border-white shadow-xs ${
                            player.bg === 'empty'
                              ? 'bg-amber-100 text-amber-600 border-dashed border-amber-300'
                              : 'text-white'
                          }`}
                          style={{
                            backgroundColor: player.bg !== 'empty' ? player.bg : undefined,
                          }}
                        >
                          {player.bg === 'empty' ? '?' : player.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#2D5F3F] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping"></span>
                    Slot còn lại mở khoá cho bạn
                  </span>
                </div>
              )}
            </div>

            {/* Financial Summary: Khung tiền */}
            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-gray-200/80 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium">Số dư ví hiện tại:</span>
                <span className="font-bold text-[#111827]">
                  {new Intl.NumberFormat('vi-VN').format(walletBalance)} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#111827] pt-1.5 border-t border-gray-200/60">
                <span>Phí cọc giữ slot:</span>
                <span className="text-[#15803D] font-extrabold text-base">
                  {bookingModal.priceDisplay}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 pt-1.5 border-t border-gray-200/60">
                <span className="font-medium">Số dư còn lại:</span>
                <span
                  className={`font-bold ${
                    walletBalance - bookingModal.price < 0 ? 'text-red-600' : 'text-[#111827]'
                  }`}
                >
                  {new Intl.NumberFormat('vi-VN').format(walletBalance - bookingModal.price)} đ
                </span>
              </div>
            </div>

            {/* Protection Guarantee Note */}
            <div className="bg-[#EAF7EE] p-3 rounded-xl border border-[#C6E7BE] text-xs text-[#1C3524] flex items-start gap-2">
              <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">
                shield
              </span>
              <span>
                Khoản cọc được giữ an toàn tại hợp đồng Escrow SportNexus. Bạn sẽ được cộng{' '}
                <strong>+1.5 Điểm Fair Play</strong> khi đến sân check-in QR đúng giờ.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setBookingModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleConfirmClaim}
                className="flex-1 py-2.5 rounded-xl bg-[#2D5F3F] hover:bg-[#234A31] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">check_circle</span>
                <span>Xác nhận giữ slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ĐĂNG KÈO GHÉP MỚI ================= */}
      {createMatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#3B6817]">
                  add_circle
                </span>
                <h3 className="font-extrabold text-lg text-[#111827]">
                  Đăng Kèo Ghép &amp; Broadcast Slot
                </h3>
              </div>
              <button
                onClick={() => setCreateMatchOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMatchSubmit} className="flex flex-col gap-3.5 text-xs">
              {/* Chọn môn */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Môn thể thao:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMatch({ ...newMatch, sport: 'badminton' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      newMatch.sport === 'badminton'
                        ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>🏸 Cầu Lông</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMatch({ ...newMatch, sport: 'pickleball' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      newMatch.sport === 'pickleball'
                        ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>🏓 Pickleball</span>
                  </button>
                </div>
              </div>

              {/* Tiêu đề kèo */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tiêu đề kèo giao lưu:</label>
                <input
                  type="text"
                  placeholder="VD: [Cầu Lông Đôi] Cần 2 tay vợt giao lưu vui vẻ, sân mát mẻ"
                  value={newMatch.title}
                  onChange={(e) => setNewMatch({ ...newMatch, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6817] text-xs"
                  required
                />
              </div>

              {/* Địa điểm sân */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Sân &amp; Địa chỉ:</label>
                <input
                  type="text"
                  placeholder="VD: Sân Tre Xanh, 128 Đinh Bộ Lĩnh, Bình Thạnh"
                  value={newMatch.location}
                  onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6817] text-xs"
                  required
                />
              </div>

              {/* Thời gian & Trình độ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Thời gian thi đấu:</label>
                  <input
                    type="text"
                    value={newMatch.time}
                    onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6817] text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Chuẩn Trình Độ:</label>
                  <input
                    type="text"
                    value={newMatch.level}
                    onChange={(e) => setNewMatch({ ...newMatch, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6817] text-xs"
                  />
                </div>
              </div>

              {/* Số slot cần & Tiền cọc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Số slot cần tuyển:</label>
                  <select
                    value={newMatch.slots}
                    onChange={(e) => setNewMatch({ ...newMatch, slots: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6817] text-xs"
                  >
                    <option value={1}>1 người</option>
                    <option value={2}>2 người</option>
                    <option value={3}>3 người</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tiền cọc chia đều (VNĐ):</label>
                  <input
                    type="number"
                    step="5000"
                    value={newMatch.deposit}
                    onChange={(e) => setNewMatch({ ...newMatch, deposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6817] text-xs"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateMatchOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px]">broadcast_on_personal</span>
                  <span>Phát Sóng Kèo Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUY CHẾ TRỌNG TÀI & PHÂN GIẢI ================= */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#15803D]">gavel</span>
                <h3 className="font-extrabold text-lg text-[#111827]">
                  Quy Chế Trọng Tài Số &amp; Phân Giải
                </h3>
              </div>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="text-xs text-gray-700 flex flex-col gap-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[#EAF7EE] border border-[#C6E7BE]">
                <strong className="text-[#15803D] block mb-1">
                  1. Hợp đồng thông minh Ký Quỹ Escrow
                </strong>
                Mọi khoản đặt cọc được giữ an toàn bởi hệ thống SportNexus. Tiền chỉ được giải phóng
                cho chủ sân hoặc host sau khi hoàn tất xác thực QR Check-in tại sân.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <strong className="text-gray-900 block mb-1">
                  2. Cơ chế xử phạt huỷ slot &amp; No-show
                </strong>
                - Huỷ trước 60 phút: Hoàn 100% tiền cọc về Ví Escrow không phạt.<br />
                - Huỷ dưới 60 phút hoặc vắng mặt: Trừ 100% tiền cọc bồi thường cho đối thủ và chủ sân.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <strong className="text-gray-900 block mb-1">
                  3. Xếp hạng uy tín Fair Play (0 - 100)
                </strong>
                Vận động viên đạt từ 95 điểm trở lên sẽ được cấp huy hiệu <strong>Kim Cương</strong>{' '}
                và ưu tiên tranh slot tức thì (Flash Claim) trong các giải đấu lớn.
              </div>
            </div>

            <button
              onClick={() => setRulesModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#3B6817] text-white font-bold text-xs mt-2"
            >
              Tôi Đã Hiểu &amp; Đồng Ý
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: BỘ LỌC NÂNG CAO (EXPANDED & PROMINENT) ================= */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-gray-100 overflow-hidden">
            {/* Top Glowing Color Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#22C55E] via-[#3B6817] to-[#15803D]" />

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gradient-to-b from-[#F9FAF8] to-white">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B6817] to-[#15803D] flex items-center justify-center text-white shadow-md shadow-[#3B6817]/25 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-[#111827] tracking-tight">
                      Bộ Lọc Ghép Trận Nâng Cao
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                      Realtime Filters
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tùy chỉnh tiêu chí tìm kiếm kèo thi đấu, khung giờ, chuẩn trình độ &amp; bảo chứng Escrow
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="px-6 py-5 overflow-y-auto flex flex-col gap-6 text-xs">
              {/* SECTION 1: KHUNG GIỜ THI ĐẤU (HIGH PRIORITY & PROMINENT) */}
              <div className="bg-[#F8FAF8] rounded-2xl p-4 sm:p-5 border border-[#DCEBDC]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B6817] text-[18px]">schedule</span>
                    <label className="font-extrabold text-sm text-[#111827] uppercase tracking-wide">
                      Khung Giờ Thi Đấu
                    </label>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    (Có thể chọn nhiều khung giờ)
                  </span>
                </div>

                {/* 3 Prominent Time Slot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Sáng: 06:00 - 12:00 */}
                  <div
                    onClick={() => toggleTimeSlot('morning')}
                    className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTimeSlots.includes('morning')
                        ? 'border-[#3B6817] bg-[#EAF7EE] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">🌅</span>
                      {selectedTimeSlots.includes('morning') ? (
                        <span className="w-5 h-5 rounded-full bg-[#3B6817] text-white flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Sáng</h4>
                      <p className="font-extrabold text-[12px] text-[#3B6817] mt-0.5">06:00 - 12:00</p>
                      <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                        Khởi động ngày mới, không khí mát mẻ &amp; tràn đầy năng lượng
                      </p>
                    </div>
                  </div>

                  {/* Chiều: 12:00 - 17:00 (YÊU CẦU MỚI) */}
                  <div
                    onClick={() => toggleTimeSlot('afternoon')}
                    className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTimeSlots.includes('afternoon')
                        ? 'border-[#3B6817] bg-[#EAF7EE] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">☀️</span>
                      {selectedTimeSlots.includes('afternoon') ? (
                        <span className="w-5 h-5 rounded-full bg-[#3B6817] text-white flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-[13px] text-[#111827]">Chiều</h4>
                        <span className="px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#D97706] text-[9.5px] font-extrabold uppercase">Mới</span>
                      </div>
                      <p className="font-extrabold text-[12px] text-[#3B6817] mt-0.5">12:00 - 17:00</p>
                      <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                        Giao lưu xả stress giữa giờ, rèn kỹ thuật &amp; sân vắng thoáng
                      </p>
                    </div>
                  </div>

                  {/* Tối: 17:00 - 22:00 */}
                  <div
                    onClick={() => toggleTimeSlot('evening')}
                    className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTimeSlots.includes('evening')
                        ? 'border-[#3B6817] bg-[#EAF7EE] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">🌙</span>
                      {selectedTimeSlots.includes('evening') ? (
                        <span className="w-5 h-5 rounded-full bg-[#3B6817] text-white flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Tối</h4>
                      <p className="font-extrabold text-[12px] text-[#3B6817] mt-0.5">17:00 - 22:00</p>
                      <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">
                        Giờ vàng thi đấu sôi động nhất, tập trung nhiều cao thủ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: MÔN THỂ THAO & THỂ THỨC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Môn thể thao */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">sports_tennis</span>
                    <label className="font-bold text-gray-800">Môn thể thao:</label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'all', label: 'Tất cả môn', emoji: '✨' },
                      { key: 'badminton', label: 'Cầu lông', emoji: '🏸' },
                      { key: 'pickleball', label: 'Pickleball', emoji: '🏓' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setActiveSportFilter(s.key)}
                        className={`py-2.5 px-2 rounded-xl border font-bold text-center flex flex-col items-center gap-1 transition-all ${
                          activeSportFilter === s.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D] shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-[18px] leading-none">{s.emoji}</span>
                        <span className="text-[11px]">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thể thức ghép */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">group</span>
                    <label className="font-bold text-gray-800">Thể thức &amp; Giới tính:</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'Tất cả thể thức' },
                      { key: 'mixed', label: 'Đôi Nam Nữ' },
                      { key: 'men', label: 'Đôi Nam' },
                      { key: 'women', label: 'Đôi Nữ' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setSelectedFormat(f.key)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          selectedFormat === f.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: TRÌNH ĐỘ KỸ NĂNG & KHOẢNG CÁCH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trình độ */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">military_tech</span>
                    <label className="font-bold text-gray-800">Trình độ kỹ năng (DUPR):</label>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { key: 'all', label: 'Tất cả trình độ' },
                      { key: 'beginner', label: 'Phong trào / Mới chơi (DUPR < 3.0)' },
                      { key: 'intermediate', label: 'Trung bình khá (DUPR 3.0 - 3.8)' },
                      { key: 'advanced', label: 'Chuyên sâu / Nâng cao (DUPR 3.8+)' },
                    ].map((lvl) => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setSelectedSkillLevel(lvl.key)}
                        className={`py-1.5 px-3 rounded-xl border text-left text-[11px] font-semibold transition-all flex items-center justify-between ${
                          selectedSkillLevel === lvl.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span>{lvl.label}</span>
                        {selectedSkillLevel === lvl.key && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bán kính khoảng cách */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-gray-600 text-[16px]">near_me</span>
                    <label className="font-bold text-gray-800">Khoảng cách sân thi đấu:</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'Toàn TP.HCM' },
                      { key: '3km', label: 'Dưới 3 km' },
                      { key: '5km', label: 'Dưới 5 km' },
                      { key: '10km', label: 'Dưới 10 km' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDistance(d.key)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          selectedDistance === d.key
                            ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Escrow Guarantee Callout */}
                  <div className="mt-3 p-3 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] flex items-start gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                    <span>
                      Hệ thống tự động ưu tiên sân trong bán kính gần và có sẵn slot bảo chứng Escrow minh bạch.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: TIÊU CHÍ AN TOÀN & BẢO CHỨNG ESCROW */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <label className="font-bold text-gray-800 block mb-3 text-[12px]">
                  Tiêu chí Uy tín &amp; Bảo chứng Escrow:
                </label>
                <div className="flex flex-col gap-2.5">
                  {/* Switch 1 */}
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#15803D] text-[18px]">verified_user</span>
                      <div>
                        <p className="font-bold text-gray-800">Chỉ hiện Host có điểm Fair Play &ge; 90</p>
                        <p className="text-[10.5px] text-gray-500">Uy tín cao, cam kết 100% không bùng hẹn hoặc huỷ kèo đột xuất</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filterMinFairPlay}
                      onChange={(e) => setFilterMinFairPlay(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#3B6817] cursor-pointer"
                    />
                  </label>

                  {/* Switch 2 */}
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
                      <div>
                        <p className="font-bold text-gray-800">Ưu tiên kèo Tranh Slot Nóng (Flash Queue)</p>
                        <p className="text-[10.5px] text-gray-500">Chỉ hiển thị các kèo cần bổ sung slot khẩn cấp hoặc đang giữ chỗ 15p</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filterFlashOnly}
                      onChange={(e) => setFilterFlashOnly(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#3B6817] cursor-pointer"
                    />
                  </label>

                  {/* Switch 3 */}
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#3B6817] text-[18px]">check_circle</span>
                      <div>
                        <p className="font-bold text-gray-800">Chỉ chọn sân thảm tiêu chuẩn thi đấu</p>
                        <p className="text-[10.5px] text-gray-500">Sân thảm cao su chuyên dụng, đèn đạt chuẩn chống chói, bảo vệ khớp gối</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={filterStandardCourt}
                      onChange={(e) => setFilterStandardCourt(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#3B6817] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="px-6 py-4 bg-[#F9FAF8] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="material-symbols-outlined text-[16px] text-[#3B6817]">filter_alt</span>
                <span>
                  Tìm thấy <strong className="text-[#111827] font-black">{filteredMatches.length}</strong> kèo phù hợp
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-white text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Đặt lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterDrawerOpen(false)
                    setToastMessage({
                      title: 'Đã Cập Nhật Bộ Lọc!',
                      desc: `Tìm thấy ${filteredMatches.length} kèo ghép đấu tương thích với tiêu chí của bạn.`,
                      type: 'success',
                    })
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3B6817] to-[#2D5F3F] hover:from-[#315613] hover:to-[#244E33] text-white font-extrabold text-xs shadow-md shadow-[#3B6817]/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[17px]">check_circle</span>
                  <span>Áp Dụng Bộ Lọc ({filteredMatches.length} Kèo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityFeed
