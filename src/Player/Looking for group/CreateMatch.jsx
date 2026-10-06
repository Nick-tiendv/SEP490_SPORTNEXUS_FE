import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// District courts database for dynamic map & closest court detection
const DISTRICT_DATA = {
  q7: {
    name: 'Quận 7',
    label: 'Quận 7 (Đang chọn)',
    mapQuery: 'CLB The Thao Nam Sai Gon, Quan 7, Ho Chi Minh City',
    courts: [
      {
        id: 'c-q7-1',
        name: 'CLB Thể Thao Nam Sài Gòn',
        address: 'Đường số 9, P. Tân Phú, Quận 7',
        distance: '2.1 km',
        courtCount: '4 sân thảm',
        price: '98k/h',
        rating: 4.9,
      },
      {
        id: 'c-q7-2',
        name: 'SportNexus Arena Q.7',
        address: '35 Huỳnh Tấn Phát, Tân Thuận Đông, Quận 7',
        distance: '0.8 km',
        courtCount: '5 sân Yonex',
        price: '110k/h',
        rating: 4.95,
      },
      {
        id: 'c-q7-3',
        name: 'Sân Cầu Lông & Pickleball Tân Mỹ',
        address: 'Đường Tân Mỹ, P. Tân Phú, Quận 7',
        distance: '3.2 km',
        courtCount: '6 sân thảm tiêu chuẩn',
        price: '85k/h',
        rating: 4.8,
      },
    ],
  },
  binhthanh: {
    name: 'Bình Thạnh',
    label: 'Bình Thạnh',
    mapQuery: 'San Cau Long Tre Xanh, Dinh Bo Linh, Binh Thanh, Ho Chi Minh City',
    courts: [
      {
        id: 'c-bt-1',
        name: 'Sân Cầu Lông Tre Xanh',
        address: '128 Đinh Bộ Lĩnh, P.26, Bình Thạnh',
        distance: '1.8 km',
        courtCount: '6 sân thảm xịn',
        price: '90k/h',
        rating: 4.9,
      },
      {
        id: 'c-bt-2',
        name: 'CLB YONEX Điện Biên Phủ',
        address: '128 Điện Biên Phủ, P.25, Bình Thạnh',
        distance: '3.5 km',
        courtCount: '8 sân thi đấu BWF',
        price: '105k/h',
        rating: 4.85,
      },
      {
        id: 'c-bt-3',
        name: 'Pickleball D2 Saigon Hub',
        address: 'Đường D2 (Nguyễn Gia Trí), Bình Thạnh',
        distance: '2.4 km',
        courtCount: '4 sân ngoài trời',
        price: '95k/h',
        rating: 4.8,
      },
    ],
  },
  phunhuan: {
    name: 'Phú Nhuận',
    label: 'Phú Nhuận',
    mapQuery: 'CLB The Thao Rach Mieu, Hoa Phuong, Phu Nhuan, Ho Chi Minh City',
    courts: [
      {
        id: 'c-pn-1',
        name: 'CLB Thể Thao Rạch Miễu',
        address: 'Số 1 Hoa Phượng, P.2, Phú Nhuận',
        distance: '1.5 km',
        courtCount: '10 sân tiêu chuẩn',
        price: '115k/h',
        rating: 4.9,
      },
      {
        id: 'c-pn-2',
        name: 'Sân Cầu Lông Ga Trực Thăng',
        address: 'Hoàng Văn Thụ, P.8, Phú Nhuận',
        distance: '2.9 km',
        courtCount: '5 sân thảm PU',
        price: '95k/h',
        rating: 4.75,
      },
    ],
  },
  thuduc: {
    name: 'TP. Thủ Đức',
    label: 'TP. Thủ Đức',
    mapQuery: 'D-Pickleball Hub Thao Dien, Thu Duc, Ho Chi Minh City',
    courts: [
      {
        id: 'c-td-1',
        name: 'D-Pickleball & Badminton Hub',
        address: '28 Thảo Điền, TP. Thủ Đức',
        distance: '3.1 km',
        courtCount: '8 sân máy lạnh',
        price: '120k/h',
        rating: 4.95,
      },
      {
        id: 'c-td-2',
        name: 'CLB Cầu Lông Hiệp Phú',
        address: 'Đường Võ Văn Ngân, TP. Thủ Đức',
        distance: '4.8 km',
        courtCount: '6 sân thảm',
        price: '80k/h',
        rating: 4.7,
      },
    ],
  },
  q1: {
    name: 'Quận 1',
    label: 'Quận 1',
    mapQuery: 'San Cau Long Tao Dan, Quan 1, Ho Chi Minh City',
    courts: [
      {
        id: 'c-q1-1',
        name: 'Sân Cầu Lông Tao Đàn Q.1',
        address: 'Số 1 Huyền Trân Công Chúa, Bến Thành, Q.1',
        distance: '1.2 km',
        courtCount: '6 sân thảm cao cấp',
        price: '130k/h',
        rating: 4.9,
      },
      {
        id: 'c-q1-2',
        name: 'CLB Thể Thao Hoa Lư',
        address: 'Số 2 Đinh Tiên Hoàng, Đa Kao, Q.1',
        distance: '2.0 km',
        courtCount: '8 sân đa năng',
        price: '125k/h',
        rating: 4.85,
      },
    ],
  },
  q2: {
    name: 'Quận 2',
    label: 'Quận 2 (Thảo Điền / An Phú)',
    mapQuery: 'San Cau Long An Phu, Quan 2, Ho Chi Minh City',
    courts: [
      {
        id: 'c-q2-1',
        name: 'CLB Cầu Lông & Pickleball An Phú',
        address: 'Đường Thảo Điền, An Phú, TP. Thủ Đức (Quận 2)',
        distance: '2.7 km',
        courtCount: '6 sân thảm BWF',
        price: '115k/h',
        rating: 4.9,
      },
      {
        id: 'c-q2-2',
        name: 'Thảo Điền Sports Hub',
        address: '12 Quốc Hương, Thảo Điền, Quận 2',
        distance: '3.4 km',
        courtCount: '4 sân ngoài trời',
        price: '100k/h',
        rating: 4.8,
      },
    ],
  },
  q3: {
    name: 'Quận 3',
    label: 'Quận 3',
    mapQuery: 'CLB The Thao Ho Xuan Huong, Quan 3, Ho Chi Minh City',
    courts: [
      {
        id: 'c-q3-1',
        name: 'CLB Thể Thao Hồ Xuân Hương',
        address: 'Số 2 Hồ Xuân Hương, P.6, Quận 3',
        distance: '2.5 km',
        courtCount: '8 sân máy lạnh tiêu chuẩn',
        price: '120k/h',
        rating: 4.9,
      },
      {
        id: 'c-q3-2',
        name: 'Sân Cầu Lông Ga Sài Gòn',
        address: 'Số 1 Nguyễn Thông, P.9, Quận 3',
        distance: '3.1 km',
        courtCount: '4 sân thảm cao cấp',
        price: '95k/h',
        rating: 4.75,
      },
    ],
  },
  q4: {
    name: 'Quận 4',
    label: 'Quận 4',
    mapQuery: 'CLB The Thao Khanh Hoi, Quan 4, Ho Chi Minh City',
    courts: [
      {
        id: 'c-q4-1',
        name: 'Trung Tâm Thể Thao Khánh Hội',
        address: 'Đường Hoàng Diệu, P.5, Quận 4',
        distance: '1.9 km',
        courtCount: '6 sân thảm tiêu chuẩn',
        price: '95k/h',
        rating: 4.8,
      },
    ],
  },
  q10: {
    name: 'Quận 10',
    label: 'Quận 10',
    mapQuery: 'CLB The Thao Ky Hoa, Quan 10, Ho Chi Minh City',
    courts: [
      {
        id: 'c-q10-1',
        name: 'CLB Cầu Lông & Tennis Kỳ Hòa',
        address: 'Sư Vạn Hạnh, P.12, Quận 10',
        distance: '2.8 km',
        courtCount: '10 sân tiêu chuẩn',
        price: '110k/h',
        rating: 4.85,
      },
      {
        id: 'c-q10-2',
        name: 'Sân Cầu Lông Bắc Hải',
        address: 'Đường Bắc Hải, P.15, Quận 10',
        distance: '3.6 km',
        courtCount: '5 sân thảm PU',
        price: '90k/h',
        rating: 4.7,
      },
    ],
  },
  tanbinh: {
    name: 'Tân Bình',
    label: 'Tân Bình',
    mapQuery: 'CLB Cau Long Hoang Hoa Tham, Tan Binh, Ho Chi Minh City',
    courts: [
      {
        id: 'c-tb-1',
        name: 'CLB Cầu Lông Viettel Hoàng Hoa Thám',
        address: '158 Hoàng Hoa Thám, P.12, Tân Bình',
        distance: '4.2 km',
        courtCount: '12 sân thảm cao cấp',
        price: '105k/h',
        rating: 4.9,
      },
      {
        id: 'c-tb-2',
        name: 'Sân Cầu Lông & Pickleball Cộng Hòa',
        address: '19 Cộng Hòa, P.12, Tân Bình',
        distance: '3.9 km',
        courtCount: '6 sân thi đấu',
        price: '95k/h',
        rating: 4.8,
      },
    ],
  },
  govap: {
    name: 'Gò Vấp',
    label: 'Gò Vấp',
    mapQuery: 'CLB Cau Long Dat Duc, Go Vap, Ho Chi Minh City',
    courts: [
      {
        id: 'c-gv-1',
        name: 'CLB Cầu Lông Đạt Đức Gò Vấp',
        address: '5A Lương Ngọc Quyến, P.5, Gò Vấp',
        distance: '5.1 km',
        courtCount: '8 sân thảm',
        price: '85k/h',
        rating: 4.8,
      },
    ],
  },
}

function CreateMatch() {
  const navigate = useNavigate()

  // State management
  const [sport, setSport] = useState('badminton') // 'badminton' | 'pickleball'
  const [radius, setRadius] = useState(8.5)
  const [selectedDistrict, setSelectedDistrict] = useState('q7')
  const [districtSearchQuery, setDistrictSearchQuery] = useState('')
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false)
  const [selectedCourtId, setSelectedCourtId] = useState('c-q7-1')
  const [selectedDate, setSelectedDate] = useState('today') // 'today' | 'tomorrow'
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('17:30 - 19:30')
  const [preferredTimeRange, setPreferredTimeRange] = useState('18:00 - 20:30')

  // Formats (multi-select)
  const [selectedFormats, setSelectedFormats] = useState(['mixed']) // 'mixed', 'men', 'women', 'single'

  // Skill Level
  const [skillLevel, setSkillLevel] = useState('intermediate') // 'intermediate', 'beginner', 'pro'

  // Play Styles (checkboxes)
  const [playStyles, setPlayStyles] = useState({
    fun: true,
    fairplay: true,
    competitive: false,
  })

  // Court Standards (checkboxes)
  const [courtStandards, setCourtStandards] = useState({
    acCourt: true,
    proBall: true,
    splitBill: true,
  })

  // Auto court lock checkbox
  const [autoLockCourt, setAutoLockCourt] = useState(true)

  // Escrow reassurance pill state
  const [showEscrowPill, setShowEscrowPill] = useState(true)

  // Wallet balance synchronized with localStorage
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  // Toast / Submission state
  const [submitting, setSubmitting] = useState(false)

  // Listen for balance updates from anywhere in app
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleUpdate)
  }, [])

  // When district changes, automatically select the first closest court of that district
  useEffect(() => {
    const courts = DISTRICT_DATA[selectedDistrict]?.courts || []
    if (courts.length > 0) {
      setSelectedCourtId(courts[0].id)
    }
  }, [selectedDistrict])

  // Current district object & active court
  const currentDistrictData = DISTRICT_DATA[selectedDistrict] || DISTRICT_DATA.q7
  const currentCourt =
    currentDistrictData.courts.find((c) => c.id === selectedCourtId) || currentDistrictData.courts[0]

  // Filtered districts based on user search query (by district name or court name/address)
  const filteredDistricts = Object.entries(DISTRICT_DATA).filter(([key, item]) => {
    if (!districtSearchQuery.trim()) return true
    const q = districtSearchQuery.toLowerCase().trim()
    const matchName = item.name.toLowerCase().includes(q)
    const matchCourts = item.courts.some(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    )
    return matchName || matchCourts
  })

  // Select district from search dropdown
  const handleSelectDistrict = (key) => {
    setSelectedDistrict(key)
    setDistrictSearchQuery('')
    setIsDistrictDropdownOpen(false)
  }

  // Toggle format helper
  const toggleFormat = (f) => {
    if (selectedFormats.includes(f)) {
      if (selectedFormats.length > 1) {
        setSelectedFormats(selectedFormats.filter((item) => item !== f))
      }
    } else {
      setSelectedFormats([...selectedFormats, f])
    }
  }

  // Handle Match Publishing & save into feed
  const handlePublishMatch = () => {
    setSubmitting(true)

    // Deduct deposit and save to localStorage
    const deposit = 45000
    const newBal = Math.max(0, walletBalance - deposit)
    localStorage.setItem('escrow_balance', newBal.toString())
    setWalletBalance(newBal)
    window.dispatchEvent(new Event('escrow_balance_updated'))

    // Create a new match object to prepend into community feed
    const formatName = selectedFormats.includes('mixed')
      ? 'Đôi Nam Nữ'
      : selectedFormats.includes('men')
      ? 'Đôi Nam'
      : selectedFormats.includes('women')
      ? 'Đôi Nữ'
      : 'Đơn 1v1'

    const levelText =
      skillLevel === 'intermediate'
        ? 'Elo 1400 - 1600'
        : skillLevel === 'beginner'
        ? 'Elo < 1300'
        : 'Elo > 1700'

    const createdMatch = {
      id: Date.now(),
      sport: sport,
      sportBadge: sport === 'badminton' ? 'CẦU LÔNG ĐÔI' : 'PICKLEBALL ĐÔI',
      subBadge: '✓ Kèo Của Bạn (Host: Minh Minh Minh)',
      levelTag: levelText,
      slotTag: 'Cần 3 Người (Nam/Nữ)',
      time: `${preferredTimeRange} (${selectedDate === 'today' ? 'Hôm Nay' : 'Ngày Mai'})`,
      timeSlot: 'evening',
      title: `[${sport === 'badminton' ? 'Cầu Lông' : 'Pickleball'} ${formatName}] Giao lưu tại ${currentCourt.name} (${currentDistrictData.name})`,
      location: `${currentCourt.name}, ${currentCourt.address}`,
      groupDesc: 'Host: Minh Minh Minh (Chỉ số Fairplay 99.4)',
      roster: [
        { initials: 'MMM', bg: '#2D5F3F', name: 'Minh Minh Minh (Bạn - Host)' },
        { initials: '?', bg: 'empty', name: 'Slot trống 1' },
        { initials: '?', bg: 'empty', name: 'Slot trống 2' },
        { initials: '?', bg: 'empty', name: 'Slot trống 3' },
      ],
      currentSlots: 1,
      totalSlots: 4,
      priceLabel: 'Tiền cọc chia đều:',
      price: deposit,
      priceDisplay: `${new Intl.NumberFormat('vi-VN').format(deposit)} đ`,
      buttonText: 'Chốt Slot Ngay',
      isFlashClaim: false,
      image:
        sport === 'badminton'
          ? 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop'
          : 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
    }

    try {
      const existing = localStorage.getItem('lfg_custom_matches')
      const parsed = existing ? JSON.parse(existing) : []
      localStorage.setItem('lfg_custom_matches', JSON.stringify([createdMatch, ...parsed]))
    } catch {
      localStorage.setItem('lfg_custom_matches', JSON.stringify([createdMatch]))
    }

    setTimeout(() => {
      navigate('/community')
    }, 600)
  }

  // Handle Cancel Match Creation
  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn huỷ bỏ đăng kèo ghép trận này không?')) {
      navigate('/community')
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F6F9F6] text-[#1E293B] pb-16">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Main Large White Card Container */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 md:p-10 shadow-sm">
          {/* Header Section */}
          <div className="flex flex-col gap-3 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#2D5F3F] flex items-center justify-center text-white shadow-md shadow-[#2D5F3F]/30 shrink-0">
                <span className="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-[28px] font-black text-[#111827] tracking-tight">
                    Tạo Kèo Ghép Mới (LFG Matchmaking)
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EAF7EE] text-[#15803D] border border-[#C6E7BE] text-[11px] font-extrabold uppercase tracking-wide">
                    Realtime Engine
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kết nối vận động viên cùng đẳng cấp &amp; tối ưu giờ sân theo thời gian thực
                </p>
              </div>
            </div>

            {/* Escrow Reassurance Badge */}
            {showEscrowPill && (
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#EAF7EE] border border-[#C6E7BE] text-[#15803D] text-xs font-bold shadow-2xs mt-1">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Bảo Chứng Escrow 100% Chống Bùng Kèo</span>
                <button
                  type="button"
                  onClick={() => setShowEscrowPill(false)}
                  className="w-4 h-4 rounded-full hover:bg-green-200 flex items-center justify-center text-[#15803D] ml-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* 2-Column Main Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            {/* ================= LEFT COLUMN: CONFIGURATION FORM ================= */}
            <div className="lg:col-span-8 flex flex-col gap-7">
              {/* 01. CHỌN BỘ MÔN THỂ THAO */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide">
                    01. CHỌN BỘ MÔN THỂ THAO
                  </label>
                  <span className="text-[11px] font-extrabold text-[#15803D] uppercase tracking-wider">
                    ELO / DUPR SYNCED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Cầu Lông Card */}
                  <div
                    onClick={() => setSport('badminton')}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 ${
                      sport === 'badminton'
                        ? 'bg-[#2D5F3F] text-white shadow-md shadow-[#2D5F3F]/30 border-2 border-[#2D5F3F]'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        sport === 'badminton'
                          ? 'bg-white/20 text-white scale-105'
                          : 'bg-gray-100'
                      }`}
                    >
                      <span
                        className="text-[26px] leading-none select-none"
                        role="img"
                        aria-label="Cầu Lông"
                        style={{
                          filter:
                            sport === 'badminton'
                              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
                              : 'none',
                        }}
                      >
                        🏸
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-[15px]">Cầu Lông</h3>
                        {sport === 'badminton' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]"></span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          sport === 'badminton' ? 'text-green-100' : 'text-gray-400'
                        }`}
                      >
                        Badminton Pro-Circuit
                      </p>
                    </div>
                  </div>

                  {/* Pickleball Card */}
                  <div
                    onClick={() => setSport('pickleball')}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 ${
                      sport === 'pickleball'
                        ? 'bg-[#2D5F3F] text-white shadow-md shadow-[#2D5F3F]/30 border-2 border-[#2D5F3F]'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        sport === 'pickleball'
                          ? 'bg-white/20 text-white scale-105'
                          : 'bg-gray-100'
                      }`}
                    >
                      <span
                        className="text-[26px] leading-none select-none"
                        role="img"
                        aria-label="Pickleball"
                        style={{
                          filter:
                            sport === 'pickleball'
                              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
                              : 'none',
                        }}
                      >
                        🏓
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-[15px]">Pickleball</h3>
                        {sport === 'pickleball' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]"></span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          sport === 'pickleball' ? 'text-green-100' : 'text-gray-400'
                        }`}
                      >
                        Paddle &amp; DUPR Arena
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 02. BÁN KÍNH & KHU VỰC MUỐN CHƠI */}
              <div className="bg-[#FAFBF9] rounded-2xl p-5 border border-gray-200/80">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide">
                    02. BÁN KÍNH &amp; KHU VỰC MUỐN CHƠI
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#111827] shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                    Bán kính: {radius} km
                  </span>
                </div>

                {/* Range Slider Với 2 Nút Tăng Chỉnh Gần - Xa Ở 2 Đầu */}
                <div className="py-2 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {/* Nút giảm khoảng cách (Gần hơn) */}
                    <button
                      type="button"
                      onClick={() => setRadius((prev) => Math.max(1, +(prev - 0.5).toFixed(1)))}
                      disabled={radius <= 1}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-[#2D5F3F] hover:bg-[#EAF7EE] text-[#1E293B] hover:text-[#2D5F3F] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs transition-all cursor-pointer shrink-0"
                      title="Giảm bán kính (Gần hơn: -0.5km)"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>

                    {/* Range Track */}
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="0.5"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D5F3F]"
                      />
                    </div>

                    {/* Nút tăng khoảng cách (Xa hơn) */}
                    <button
                      type="button"
                      onClick={() => setRadius((prev) => Math.min(25, +(prev + 0.5).toFixed(1)))}
                      disabled={radius >= 25}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-[#2D5F3F] hover:bg-[#EAF7EE] text-[#1E293B] hover:text-[#2D5F3F] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-2xs transition-all cursor-pointer shrink-0"
                      title="Tăng bán kính (Xa hơn: +0.5km)"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 font-semibold px-0.5">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-gray-400">near_me</span>
                      Gần nhất (1 km)
                    </span>
                    <span className="text-[#2D5F3F] font-bold">Tiêu chuẩn đề xuất (8 - 10 km)</span>
                    <span className="flex items-center gap-1">
                      Mở rộng (25 km)
                      <span className="material-symbols-outlined text-[13px] text-gray-400">explore</span>
                    </span>
                  </div>
                </div>

                {/* Thanh Tìm Kiếm Khu Vực Sân (Quận / Địa Điểm) Thay Cho Các Nút Chọn Nhanh */}
                <div className="mt-4 pt-3.5 border-t border-gray-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11.5px] font-bold text-gray-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#2D5F3F]">
                        search_insights
                      </span>
                      Tìm kiếm khu vực sân (quận, địa bàn):
                    </span>
                    {/* Active Selected Area Pill */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-extrabold bg-[#EAF7EE] border border-[#C6E7BE] px-2.5 py-0.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Đang chọn: {currentDistrictData.name} ({currentDistrictData.courts.length} sân)
                    </span>
                  </div>

                  {/* Search Bar Input Container */}
                  <div className="relative">
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 material-symbols-outlined text-gray-400 text-[19px] pointer-events-none">
                        search
                      </span>
                      <input
                        type="text"
                        value={districtSearchQuery}
                        onChange={(e) => {
                          setDistrictSearchQuery(e.target.value)
                          setIsDistrictDropdownOpen(true)
                        }}
                        onFocus={() => setIsDistrictDropdownOpen(true)}
                        placeholder="Nhập tên quận, khu vực hoặc cụm sân (VD: Quận 7, Bình Thạnh, Rạch Miễu, Tao Đàn...)"
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-gray-800 font-medium placeholder-gray-400 transition-all outline-none shadow-2xs"
                      />
                      {districtSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setDistrictSearchQuery('')
                            setIsDistrictDropdownOpen(false)
                          }}
                          className="absolute right-3 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-[11px] cursor-pointer"
                          title="Xóa tìm kiếm"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Autocomplete / Dropdown Results List */}
                    {isDistrictDropdownOpen && (
                      <>
                        {/* Overlay backdrop to close dropdown when clicking outside */}
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsDistrictDropdownOpen(false)}
                        />

                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-gray-100">
                          <div className="p-2.5 bg-gray-50/90 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                            <span>
                              {districtSearchQuery.trim()
                                ? `Kết quả tìm kiếm (${filteredDistricts.length} khu vực)`
                                : 'Chọn nhanh hoặc tìm kiếm khu vực sân:'}
                            </span>
                            <span className="text-gray-400 font-normal">Click để chọn</span>
                          </div>

                          {filteredDistricts.length > 0 ? (
                            filteredDistricts.map(([key, item]) => {
                              const isSelected = selectedDistrict === key
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleSelectDistrict(key)}
                                  className={`w-full p-3 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#EAF7EE] hover:bg-[#dff3e5]'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? 'bg-[#2D5F3F] text-white'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[17px]">
                                        location_on
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4
                                          className={`text-xs font-bold ${
                                            isSelected ? 'text-[#15803D]' : 'text-gray-900'
                                          }`}
                                        >
                                          {item.name}
                                        </h4>
                                        {isSelected && (
                                          <span className="px-1.5 py-0.2 rounded bg-[#15803D] text-white text-[9.5px] font-extrabold uppercase">
                                            Đang Chọn
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10.5px] text-gray-500 truncate mt-0.5">
                                        {item.courts.map((c) => c.name).join(' • ')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span
                                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                                        isSelected
                                          ? 'bg-[#2D5F3F] text-white'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {item.courts.length} sân
                                    </span>
                                  </div>
                                </button>
                              )
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-gray-500">
                              <span className="material-symbols-outlined text-[24px] text-gray-400 block mb-1">
                                search_off
                              </span>
                              Không tìm thấy khu vực phù hợp với &quot;{districtSearchQuery}&quot;
                              <p className="text-[11px] text-gray-400 mt-1">
                                Hãy thử tìm theo tên quận (VD: Quận 7, Bình Thạnh, Phú Nhuận...)
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Active selected tag and shortcut trigger */}
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-[#15803D]">
                        check_circle
                      </span>
                      <span>
                        Khu vực áp dụng bản đồ:{' '}
                        <strong className="text-[#111827]">{currentDistrictData.name}</strong> •{' '}
                        {currentDistrictData.courts.length} sân trong bán kính {radius} km
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDistrictDropdownOpen((prev) => !prev)}
                      className="text-[11px] font-bold text-[#15803D] hover:underline cursor-pointer"
                    >
                      {isDistrictDropdownOpen ? 'Đóng danh sách' : 'Xem tất cả khu vực ▾'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 03. KHUNG GIỜ CẦN THIẾT (PROMINENT & HIGHLIGHTED) */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAFBF8] to-[#F2F9F3] border-2 border-[#86EFAC] p-5 sm:p-6 shadow-[0_8px_30px_rgba(45,95,63,0.08)] overflow-hidden">
                {/* Glowing neon accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#2D5F3F]" />

                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[20px] animate-bounce">
                      local_fire_department
                    </span>
                    <label className="text-[13px] font-black text-[#111827] uppercase tracking-wide">
                      03. KHUNG GIỜ CẦN THIẾT
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedDate('today')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDate === 'today'
                          ? 'bg-[#2D5F3F] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Hôm nay (T6, ...)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate('tomorrow')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDate === 'tomorrow'
                          ? 'bg-[#2D5F3F] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Ngày mai
                    </button>
                  </div>
                </div>

                {/* PROMINENT Preferred Time Range Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-white to-[#F0FDF4] border-2 border-[#86EFAC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md shadow-[#2D5F3F]/10 relative overflow-hidden mb-4">
                  {/* Glowing background halo */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#34D399]/15 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-md shadow-[#F59E0B]/30 shrink-0">
                      <span className="material-symbols-outlined text-[28px] animate-pulse">
                        alarm_on
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#15803D]">
                          KHUNG GIỜ CHỌN ƯU TIÊN
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-black uppercase">
                          Hot Slot
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-[26px] sm:text-[30px] font-black text-[#111827] tracking-tight leading-none">
                          {preferredTimeRange}
                        </span>
                        <span className="text-xs sm:text-sm text-[#15803D] font-bold">
                          (2.5 giờ sân chuẩn)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-500">
                          bolt
                        </span>
                        Tỷ lệ ghép tự động thành công: <strong>98.4%</strong> trong khung giờ này
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2 relative z-10 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#B45309] border border-[#F59E0B]/40 text-xs font-black uppercase tracking-wide shadow-xs">
                      <span>🔥</span>
                      GIỜ VÀNG CAO ĐIỂM
                    </span>
                    <span className="text-[11px] text-gray-500 font-semibold">
                      Cam kết giữ chỗ Escrow
                    </span>
                  </div>
                </div>

                {/* Quick Suggestion Time Pills */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="text-gray-500 font-bold text-[11px] mr-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    Chọn giờ khác nhanh:
                  </span>
                  {[
                    { id: 'morning', label: '06:00 - 08:00 (Sáng sớm)' },
                    { id: 'afternoon', label: '17:30 - 19:30 (Chiều tối)' },
                    { id: 'prime', label: '18:00 - 20:30 (Tối vàng)' },
                    { id: 'night', label: '20:00 - 22:00 (Tối muộn)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlot(t.label)
                        setPreferredTimeRange(t.label.split(' ')[0] + ' - ' + t.label.split(' ')[2])
                      }}
                      className={`px-3.5 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                        selectedTimeSlot === t.label
                          ? 'bg-[#2D5F3F] text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 04. TIÊU CHÍ GHÉP TRẬN & CẤU HÌNH KÈO */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide">
                    04. TIÊU CHÍ GHÉP TRẬN &amp; CẤU HÌNH KÈO
                  </label>
                  <span className="text-[11px] font-extrabold text-[#15803D]">
                    Tối ưu ghép 99.2%
                  </span>
                </div>

                {/* Thể thức thi đấu */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Thể thức thi đấu cần tìm:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'mixed', label: 'Đôi Nam Nữ' },
                      { id: 'men', label: 'Đôi Nam' },
                      { id: 'women', label: 'Đôi Nữ' },
                      { id: 'single', label: 'Đơn 1vs1' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => toggleFormat(fmt.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedFormats.includes(fmt.id)
                            ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {selectedFormats.includes(fmt.id) ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>{fmt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yêu cầu Trình độ Elo / DUPR */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Yêu cầu Trình độ Elo / DUPR:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Trung bình Khá */}
                    <div
                      onClick={() => setSkillLevel('intermediate')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        skillLevel === 'intermediate'
                          ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <span className="material-symbols-outlined text-[16px]">
                          {skillLevel === 'intermediate' ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>Trung bình Khá</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Elo 1400 - 1600 (DUPR 3.0 - 4.0)
                      </p>
                    </div>

                    {/* Mới tập chơi */}
                    <div
                      onClick={() => setSkillLevel('beginner')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        skillLevel === 'beginner'
                          ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <span className="material-symbols-outlined text-[16px]">
                          {skillLevel === 'beginner' ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>Mới tập chơi</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Elo &lt; 1300 (DUPR &lt; 2.5)
                      </p>
                    </div>

                    {/* Bán chuyên / Pro */}
                    <div
                      onClick={() => setSkillLevel('pro')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        skillLevel === 'pro'
                          ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <span className="material-symbols-outlined text-[16px]">
                          {skillLevel === 'pro' ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>Bán chuyên / Pro</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Elo &gt; 1700+ (DUPR &gt; 4.5)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phong cách thi đấu & Tiêu chuẩn sân */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Phong cách thi đấu */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 text-xs">
                    <p className="font-extrabold text-gray-900 mb-2.5">Phong cách thi đấu:</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playStyles.fun}
                          onChange={(e) => setPlayStyles({ ...playStyles, fun: e.target.checked })}
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Giao lưu vui vẻ, rèn luyện sức khỏe
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playStyles.fairplay}
                          onChange={(e) =>
                            setPlayStyles({ ...playStyles, fairplay: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Có tính điểm xếp hạng Fairplay
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={playStyles.competitive}
                          onChange={(e) =>
                            setPlayStyles({ ...playStyles, competitive: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Thi đấu cạnh tranh gắt gao
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Tiêu chuẩn sân & Chi phí */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-gray-200 text-xs">
                    <p className="font-extrabold text-gray-900 mb-2.5">Tiêu chuẩn sân &amp; Chi phí:</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courtStandards.acCourt}
                          onChange={(e) =>
                            setCourtStandards({ ...courtStandards, acCourt: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Sân thảm cao cấp có máy lạnh
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courtStandards.proBall}
                          onChange={(e) =>
                            setCourtStandards({ ...courtStandards, proBall: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-medium">
                          Cầu Yonex AS-40 / Franklin X-40
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courtStandards.splitBill}
                          onChange={(e) =>
                            setCourtStandards({ ...courtStandards, splitBill: e.target.checked })
                          }
                          className="rounded accent-[#2D5F3F]"
                        />
                        <span className="text-gray-700 font-bold text-[#15803D]">
                          Chia đều qua ví Escrow (Split bill)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: DYNAMIC MAP & SUMMARY ================= */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Card 1: CỤM SÂN TRONG BÁN KÍNH (DYNAMIC MAP PREVIEW) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-black text-gray-800 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[16px] text-[#2D5F3F]">
                      map
                    </span>
                    <span>CỤM SÂN TRONG BÁN KÍNH</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#15803D]">
                    {currentDistrictData.courts.length} SÂN TRỐNG KHẢ DỤNG
                  </span>
                </div>

                {/* Dynamic Map Frame with Selected Location */}
                <div className="relative rounded-2xl overflow-hidden h-56 bg-slate-100 border border-gray-200 shadow-inner group">
                  <iframe
                    title="Bản đồ cụm sân thể thao"
                    className="w-full h-full border-0 pointer-events-auto"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      currentCourt.name + ', ' + currentDistrictData.name + ', TP Ho Chi Minh'
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    loading="lazy"
                  />

                  {/* Radius Overlay Indicator */}
                  <div className="absolute top-2.5 left-2.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[10.5px] font-extrabold text-gray-800 shadow-xs border border-gray-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                      Khu Vực {currentDistrictData.name} • {radius}km
                    </span>
                  </div>

                  {/* Top-right Status Pill */}
                  <div className="absolute top-2.5 right-2.5 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-lg bg-[#2D5F3F] text-white text-[10px] font-bold shadow-xs">
                      Lưới Trực Tuyến
                    </span>
                  </div>

                  {/* Bottom Court Card Floating Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-between pointer-events-auto">
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-xs text-[#111827] flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0"></span>
                        <span className="truncate">{currentCourt.name}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                        Cách bạn {currentCourt.distance} • {currentCourt.courtCount}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF7EE] text-[#15803D] font-black text-xs shrink-0">
                      {currentCourt.price}
                    </span>
                  </div>
                </div>

                {/* List of Nearest Courts in this District */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                  <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                    Sân gần nhất tại {currentDistrictData.name}:
                  </span>
                  {currentDistrictData.courts.map((court) => (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => setSelectedCourtId(court.id)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedCourtId === court.id
                          ? 'border-[#2D5F3F] bg-[#EAF7EE] text-[#15803D] font-bold'
                          : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-[14px]">
                          {selectedCourtId === court.id ? 'check_circle' : 'location_on'}
                        </span>
                        <span className="truncate">{court.name}</span>
                      </div>
                      <span className="text-[10.5px] text-gray-400 shrink-0 font-semibold ml-2">
                        {court.distance}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card 2: Host Info Card (SYNCHRONIZED WITH ESCROW WALLET) */}
              <div className="bg-[#FAFBF9] rounded-2xl border border-gray-200 p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5F3F] flex items-center justify-center text-white font-black text-xs shadow-xs">
                    MMM
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#111827]">
                      Minh Minh Minh (Chủ Kèo)
                    </h4>
                    <p className="text-[10.5px] text-gray-500">
                      DUPR 3.8 • Elo 1650 • <span className="text-[#15803D] font-bold">Fairplay 99.4</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-semibold">Ví Escrow</span>
                  <span className="text-xs font-black text-[#15803D]">
                    {new Intl.NumberFormat('vi-VN').format(walletBalance)} đ
                  </span>
                </div>
              </div>

              {/* Card 3: TỈ LỆ KHỚP KÈO DỰ BÁO */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                    TỈ LỆ KHỚP KÈO DỰ BÁO
                  </span>
                  <p className="text-lg font-black text-[#111827] mt-0.5">~ 4.8 Phút</p>
                  <p className="text-[10.5px] text-gray-500 mt-0.5">
                    Đang có 18 vận động viên cùng Elo trực tuyến
                  </p>
                </div>

                {/* Donut progress 88% */}
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#2D5F3F]"
                      strokeDasharray="88, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#111827]">88%</span>
                </div>
              </div>

              {/* Card 4: Auto Booking & Lock Court Guarantee */}
              <div className="bg-[#EAF7EE] rounded-2xl border border-[#C6E7BE] p-4 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoLockCourt}
                    onChange={(e) => setAutoLockCourt(e.target.checked)}
                    className="mt-0.5 rounded accent-[#2D5F3F]"
                  />
                  <div>
                    <p className="font-extrabold text-[#111827]">
                      Xác nhận tìm &amp; tự động giữ sân 🔒
                    </p>
                    <p className="text-[11px] text-[#2D5F3F] mt-1 leading-relaxed">
                      SportNexus sẽ tự động tìm và khóa sân trống phù hợp nhất trong bán kính khu
                      vực và khung giờ đã chọn nếu chưa có sẵn.
                    </p>
                    <p className="text-[10.5px] text-[#15803D] font-bold mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Tự động hoàn cọc nếu không tìm được sân đạt chuẩn
                    </p>
                  </div>
                </label>
              </div>

              {/* Card 5: Escrow Fee Notice */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex items-start gap-2 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  0
                </span>
                <span>
                  Tiền cọc ký quỹ <strong>45.000 đ/người</strong> được hoàn trả 100% khi trận đấu
                  kết thúc hoặc huỷ trước 2 tiếng qua hợp đồng Escrow.
                </span>
              </div>

              {/* Card 6: Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => navigate('/community')}
                    className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Lưu Bản Nháp
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-700 transition-colors cursor-pointer font-bold"
                  >
                    Hủy Bỏ
                  </button>
                </div>

                {/* Primary Publish Button */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePublishMatch}
                  className="px-6 py-3.5 rounded-2xl bg-[#2D5F3F] hover:bg-[#234A31] text-white font-black text-sm shadow-md shadow-[#2D5F3F]/35 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>{submitting ? 'Đang Đăng...' : 'ĐĂNG KÈO NGAY'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Footer */}
        <footer className="mt-14 pt-8 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#2D5F3F] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                </div>
                <span className="font-extrabold text-sm text-[#111827] tracking-tight">
                  SPORTNEXUS VIETNAM
                </span>
              </div>
              <p className="max-w-md text-gray-600 leading-relaxed">
                Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn
                diện.
              </p>
              <p className="mt-2 text-gray-400 text-[11px]">
                © 2026 SportNexus Vietnam Joint Stock Company. Bảo lưu mọi quyền.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2.5">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5">
                  Hotline 24/7: <strong>0968950913</strong>
                </span>
                <span>•</span>
                <span>Bảo vệ Ký Quỹ Escrow</span>
                <span>•</span>
                <Link to="#terms" className="hover:text-[#15803D]">
                  Điều khoản dịch vụ
                </Link>
              </div>

              <div className="flex items-center gap-4 text-gray-500 text-xs">
                <Link to="#fairplay" className="hover:text-[#15803D]">
                  Chính sách Fairplay
                </Link>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#15803D] font-bold mt-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span>Hệ thống bảo chứng Escrow thời gian thực</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CreateMatch
