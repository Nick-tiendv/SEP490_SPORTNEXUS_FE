import { useState, useEffect } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { createLfg, updateLfg, getLfgById } from '../../api/player/lfgApi.js'
import { getWallet } from '../../api/player/walletApi.js'
import { searchFacilities } from '../../api/player/facilityApi.js'
import { getFacilityAvailability } from '../../api/player/bookingApi.js'
import { initialsOf, useCurrentUser } from '../../hooks/useCurrentUser.js'

// Môn trên giao diện -> tên môn trong danh mục BE
const SPORT_NAMES = {
  badminton: 'cầu lông',
  pickleball: 'pickleball',
  football: 'bóng đá',
  basketball: 'bóng rổ',
  tennis: 'tennis',
}

const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const clock = (v) => new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
const vnd = (n) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0)
const normalize = (t = '') => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Gom cơ sở thật (GET /api/v1/facilities/search) theo quận để chọn khu vực
const groupByDistrict = (facilities) => {
  const map = {}
  facilities.forEach((f) => {
    const name = f.district || f.province || 'Khác'
    const key = normalize(name).replace(/[^a-z0-9]/g, '') || 'khac'
    if (!map[key]) map[key] = { name, label: name, courts: [] }
    map[key].courts.push({
      id: f.id,
      name: f.name,
      address: f.address || '',
      distance: f.distanceKm != null ? `${Number(f.distanceKm).toFixed(1)} km` : name,
      courtCount: `${f.courtCount || 0} sân`,
      price: f.minPrice ? `${Math.round(f.minPrice / 1000)}k/h` : '—',
      rating: f.averageRating,
      lat: f.latitude,
      lng: f.longitude,
      sports: (f.sports || []).map((x) => normalize(x.name)),
    })
  })
  return map
}


function CreateMatch() {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()

  // State management
  const [sport, setSport] = useState('badminton') // 'badminton' | 'pickleball'
  const [radius, setRadius] = useState(8.5)
  // Vị trí người chơi lấy từ Hồ sơ cá nhân (mặc định 'Thủ Đức')
  const [userProfileLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.location) return parsed.location
      }
    } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
    return 'Thủ Đức'
  })

  // Cơ sở thật theo quận
  const [districtData, setDistrictData] = useState({})
  useEffect(() => {
    searchFacilities({ pageSize: 100 })
      .then((res) => setDistrictData(groupByDistrict(res.items || [])))
      .catch(() => toast.error('Không tải được danh sách cơ sở.'))
  }, [])
  const districtKeys = Object.keys(districtData)
  const userDistrictKey = districtKeys.find((k) => normalize(userProfileLocation).includes(k) || k.includes(normalize(userProfileLocation).replace(/[^a-z0-9]/g, ''))) || districtKeys[0]
  const [pickedDistrict, setSelectedDistrict] = useState(null)
  const selectedDistrict = pickedDistrict && districtData[pickedDistrict] ? pickedDistrict : userDistrictKey
  const [districtSearchQuery, setDistrictSearchQuery] = useState('')
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false)
  const [pickedCourtId, setSelectedCourtId] = useState(null)
  const [selectedDate, setSelectedDate] = useState('today') // 'today' | 'tomorrow'

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

  // Escrow reassurance pill state
  const [showEscrowPill, setShowEscrowPill] = useState(true)

  // Wallet balance synchronized with localStorage
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 0
  })

  // LFG Specific State - 2.6 Chủ kèo Bước 1
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const editCardId = searchParams.get('cardId') || searchParams.get('editId')
  const isEditMode = Boolean(editCardId)
  // Kèo LFG phải gắn với một ca sân thật, truyền sang từ màn hình chọn ca.
  const initialSlotId = location.state?.courtSlotId || location.state?.slotId || null
  const [courtSlotId, setCourtSlotId] = useState(initialSlotId)
  const [slotsNeeded, setSlotsNeeded] = useState(3)
  const [pricePerPerson, setPricePerPerson] = useState('')
  const [requireApproval, setRequireApproval] = useState(false)
  const [description, setDescription] = useState('')
  const [courtFee, setCourtFee] = useState(() => Number(location.state?.total || location.state?.price) || 0) // 100% tiền sân của ca đã chọn
  const [createError, setCreateError] = useState(null)

  // Tải dữ liệu kèo cũ khi ở chế độ chỉnh sửa: GET /api/v1/lfgs/{cardId}
  useEffect(() => {
    if (editCardId) {
      getLfgById(editCardId)
        .then((res) => {
          if (res) {
            if (res.slotsNeeded) setSlotsNeeded(res.slotsNeeded)
            if (res.pricePerPerson) setPricePerPerson(String(res.pricePerPerson))
            if (res.description) setDescription(res.description)
            if (res.requireApproval !== undefined) setRequireApproval(Boolean(res.requireApproval))
          }
        })
        .catch((e) => console.warn('[CreateMatch] Không thể tải thông tin kèo cũ để sửa:', e))
    }
  }, [editCardId])

  // Toast / Submission state
  const [submitting, setSubmitting] = useState(false)

  // Lấy số dư ví thật khi mở trang
  useEffect(() => {
    getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {})
  }, [])

  // Listen for balance updates from anywhere in app
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleUpdate)
  }, [])

  // Khu vực & cơ sở đang chọn
  const currentDistrictData = districtData[selectedDistrict] || { name: 'Đang tải…', courts: [] }
  const currentCourt =
    currentDistrictData.courts.find((c) => c.id === pickedCourtId) || currentDistrictData.courts[0] || { name: '—', distance: '', courtCount: '', price: '' }
  const selectedCourtId = currentCourt.id

  // Lọc khu vực theo tên quận hoặc tên / địa chỉ cơ sở
  const filteredDistricts = Object.entries(districtData).filter(([, item]) => {
    if (!districtSearchQuery.trim()) return true
    const q = districtSearchQuery.toLowerCase().trim()
    const matchName = item.name.toLowerCase().includes(q)
    const matchCourts = item.courts.some(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    )
    return matchName || matchCourts
  })

  const handleSelectDistrict = (key) => {
    setSelectedDistrict(key)
    setSelectedCourtId(null)
    setDistrictSearchQuery('')
    setIsDistrictDropdownOpen(false)
  }

  // Ca trống thật của cơ sở đang chọn (GET /api/v1/facilities/{id}/availability)
  const playDate = new Date()
  if (selectedDate === 'tomorrow') playDate.setDate(playDate.getDate() + 1)
  const playDateStr = toDateStr(playDate)
  const [availability, setAvailability] = useState({ key: '', slots: [] })
  const availabilityKey = selectedCourtId ? `${selectedCourtId}|${playDateStr}|${sport}` : ''
  useEffect(() => {
    if (isEditMode || !availabilityKey) return undefined
    const [facilityId, date, sportKey] = availabilityKey.split('|')
    let cancelled = false
    getFacilityAvailability(facilityId, date)
      .then((res) => {
        if (cancelled) return
        const wanted = SPORT_NAMES[sportKey]
        const slots = (res?.courts || [])
          .filter((c) => c.isBookable !== false && (!wanted || normalize(c.sportName || '').includes(normalize(wanted))))
          .flatMap((c) => (c.slots || []).filter((x) => x.isBookable && !x.isPast).map((x) => ({ ...x, courtName: c.courtName })))
          .sort((x, y) => new Date(x.startTime) - new Date(y.startTime))
        setAvailability({ key: availabilityKey, slots })
      })
      .catch(() => !cancelled && setAvailability({ key: availabilityKey, slots: [] }))
    return () => { cancelled = true }
  }, [availabilityKey, isEditMode])
  const availableSlots = availability.key === availabilityKey ? availability.slots : []
  const loadingSlots = Boolean(availabilityKey) && availability.key !== availabilityKey
  const [pickedSlot, setPickedSlot] = useState(null)

  const handlePickSlot = (slot) => {
    setPickedSlot(slot)
    setCourtSlotId(slot.id)
    setCourtFee(Number(slot.price) || 0)
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
  // 2.6 Chủ kèo Bước 1: POST /api/v1/lfgs
  const handlePublishMatch = async () => {
    setSubmitting(true)
    setCreateError(null)

    if (!isEditMode && !courtSlotId) {
      setCreateError('Chưa chọn ca sân. Vui lòng chọn cơ sở và một ca trống ở mục 03 trước khi tạo kèo.')
      setSubmitting(false)
      return
    }

    // Kiểm tra số dư ví chủ sân (FE Xử lý: Hệ thống tự đặt ca sân và trừ 100% tiền sân từ ví chủ kèo)
    if (walletBalance < courtFee) {
      toast.error(`Số dư ví Escrow hiện tại không đủ để trừ 100% tiền sân (${new Intl.NumberFormat('vi-VN').format(courtFee)} đ). Vui lòng nạp thêm tiền!`)
      setSubmitting(false)
      return
    }

    const skillTag =
      skillLevel === 'beginner'
        ? 'BEGINNER'
        : skillLevel === 'pro'
        ? 'ADVANCED'
        : 'INTERMEDIATE'

    const parsedPrice = pricePerPerson ? Number(pricePerPerson) : undefined
    // Nếu đang sửa kèo: Gọi PUT /api/v1/lfgs/{cardId}
    if (isEditMode) {
      try {
        await updateLfg(editCardId, {
          slotsNeeded: Number(slotsNeeded) || 3,
          pricePerPerson: parsedPrice,
          skillLevelTag: skillTag,
          description: description.trim() || undefined,
          requireApproval: Boolean(requireApproval),
        })
        setTimeout(() => {
          navigate('/community?tab=my_cards')
        }, 500)
        return
      } catch (apiErr) {
        console.warn('[CreateMatch] API updateLfg lỗi:', apiErr)
        setCreateError(apiErr?.message || 'Không thể cập nhật kèo ghép.')
        setSubmitting(false)
        return
      }
    }

    // Tạo mới: Gọi API BE: POST /api/v1/lfgs
    try {
      await createLfg({
        courtSlotId,
        slotsNeeded: Number(slotsNeeded) || 3,
        pricePerPerson: parsedPrice,
        skillLevelTag: skillTag,
        description: description.trim() || undefined,
        requireApproval: Boolean(requireApproval),
      })
    } catch (apiErr) {
      console.warn('[CreateMatch] API createLfg lỗi:', apiErr)
      setCreateError(apiErr?.message || 'Không thể tạo kèo ghép trên hệ thống.')
      setSubmitting(false)
      return
    }

    // Backend đã đặt ca và trừ tiền sân: tải lại ví để hiển thị số dư thật.
    getWallet().catch(() => {})

    setTimeout(() => {
      navigate('/community?tab=my_cards')
    }, 600)
  }

  // Handle Cancel Match Creation
  const handleCancel = async () => {
    if ((await confirmDialog('Bạn có chắc chắn muốn huỷ bỏ đăng kèo ghép trận này không?'))) {
      navigate('/community')
    }
  }

  return (
    <div className="w-full min-h-screen text-[#1E293B] pb-16">
      <div className="snx-page">
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
                  <h1 className="snx-page-title">
                    {isEditMode ? 'Chỉnh Sửa Kèo Ghép (PUT /api/v1/lfgs)' : 'Tạo Kèo Ghép Mới (LFG Matchmaking)'}
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
                    ĐỒNG BỘ TRÌNH ĐỘ
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {[
                    { key: 'badminton', name: 'Cầu Lông', emoji: '🏸', sub: 'BWF Pro' },
                    { key: 'pickleball', name: 'Pickleball', emoji: '🏓', sub: 'Giao lưu & Đấu' },
                    { key: 'football', name: 'Bóng Đá', emoji: '⚽', sub: 'Mini 5-7' },
                    { key: 'basketball', name: 'Bóng Rổ', emoji: '🏀', sub: 'FIBA 3x3' },
                    { key: 'tennis', name: 'Tennis', emoji: '🎾', sub: 'Hard Court' },
                  ].map((s) => (
                    <div
                      key={s.key}
                      onClick={() => setSport(s.key)}
                      className={`relative p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
                        sport === s.key
                          ? 'bg-[#2D5F3F] text-white shadow-md shadow-[#2D5F3F]/30 border-2 border-[#2D5F3F]'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          sport === s.key ? 'bg-white/20 text-white scale-105' : 'bg-gray-100'
                        }`}
                      >
                        <span className="text-[22px] leading-none select-none" role="img" aria-label={s.name}>
                          {s.emoji}
                        </span>
                      </div>
                      <div className="w-full">
                        <div className="flex items-center justify-center gap-1">
                          <h3 className="font-extrabold text-[13px] truncate">{s.name}</h3>
                          {sport === s.key && (
                            <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399] shrink-0"></span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 truncate ${sport === s.key ? 'text-green-100' : 'text-gray-400'}`}>
                          {s.sub}
                        </p>
                      </div>
                    </div>
                  ))}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-extrabold bg-[#EAF7EE] border border-[#C6E7BE] px-2.5 py-0.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                        Đang chọn: {currentDistrictData.name} ({currentDistrictData.courts.length} sân)
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-extrabold bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded-lg">
                        <span className="material-symbols-outlined text-[13px] text-[#16A34A]">person_pin_circle</span>
                        Đồng bộ hồ sơ: {userProfileLocation}
                      </span>
                    </div>
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
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-gray-800 font-medium transition-all outline-none shadow-2xs"
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

              {/* 03. CHỌN CA TRỐNG (GET /api/v1/facilities/{id}/availability) */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAFBF8] to-[#F2F9F3] border-2 border-[#86EFAC] p-5 sm:p-6 shadow-[0_8px_30px_rgba(45,95,63,0.08)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#2D5F3F]" />

                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">event_available</span>
                    <label className="text-[13px] font-black text-[#111827] uppercase tracking-wide">
                      03. CHỌN CA TRỐNG TẠI {currentCourt.name}
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-gray-200 shadow-2xs">
                    {[['today', 0], ['tomorrow', 1]].map(([key, plus]) => {
                      const d = new Date()
                      d.setDate(d.getDate() + plus)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedDate(key)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedDate === key ? 'bg-[#2D5F3F] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {plus === 0 ? 'Hôm nay' : 'Ngày mai'} ({d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Ca đã chọn */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-white to-[#F0FDF4] border-2 border-[#86EFAC] flex items-center gap-4 shadow-md shadow-[#2D5F3F]/10 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-[28px]">alarm_on</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#15803D]">CA SÂN CỦA KÈO</span>
                    {pickedSlot ? (
                      <>
                        <div className="text-[26px] font-black text-[#111827] tracking-tight leading-none mt-1">
                          {clock(pickedSlot.startTime)} - {clock(pickedSlot.endTime)}
                        </div>
                        <p className="text-[12px] text-gray-500 mt-1">
                          {pickedSlot.courtName} • {new Date(pickedSlot.startTime).toLocaleDateString('vi-VN')} • {vnd(pickedSlot.price)} đ
                        </p>
                      </>
                    ) : (
                      <div className="text-[15px] font-bold text-gray-500 mt-1">
                        {courtSlotId ? 'Đã chọn ca từ màn hình đặt sân' : 'Chưa chọn ca, hãy chọn một ca trống bên dưới'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {loadingSlots && <span className="text-gray-500">Đang tải ca trống…</span>}
                  {!loadingSlots && availableSlots.length === 0 && (
                    <span className="text-gray-500">Cơ sở này không còn ca trống cho môn đã chọn trong ngày.</span>
                  )}
                  {availableSlots.slice(0, 24).map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handlePickSlot(slot)}
                      className={`px-3 py-2 rounded-xl font-extrabold transition-all cursor-pointer text-left ${
                        courtSlotId === slot.id
                          ? 'bg-[#2D5F3F] text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {clock(slot.startTime)} - {clock(slot.endTime)}
                      <span className={`block text-[10px] font-semibold ${courtSlotId === slot.id ? 'text-green-100' : 'text-gray-400'}`}>
                        {slot.courtName} • {Math.round(slot.price / 1000)}k
                      </span>
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

                {/* Yêu cầu Trình độ Người chơi */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Yêu cầu Trình độ:</p>
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
                        <span>Trung bình - Khá</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Đánh chắc tay, giao lưu đều đặn
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
                        Phong trào, vừa tập vừa giao lưu
                      </p>
                    </div>

                    {/* Bán chuyên / Nâng cao */}
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
                        <span>Bán chuyên / Nâng cao</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 pl-5">
                        Thi đấu cọ xát, kỹ chiến thuật tốt
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

              {/* 05. CẤU HÌNH SUẤT & DUYỆT NGƯỜI THAM GIA (LFG SPEC) */}
              <div className="bg-[#FAFBF9] rounded-2xl p-5 border border-gray-200/80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-black text-[#111827] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#2D5F3F]">group_add</span>
                    05. CẤU HÌNH SUẤT &amp; DUYỆT NGƯỜI THAM GIA
                  </label>
                  <span className="text-[11px] font-extrabold text-[#15803D] uppercase tracking-wider">
                    API /api/v1/lfgs
                  </span>
                </div>

                {/* Số người cần tìm (slotsNeeded) & Giá mỗi người (pricePerPerson) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* slotsNeeded */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Số người cần tìm thêm (<code className="text-[#2D5F3F] font-mono">slotsNeeded</code>):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSlotsNeeded((prev) => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-300 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={slotsNeeded}
                        onChange={(e) => setSlotsNeeded(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="flex-1 h-10 px-3 text-center bg-white border border-gray-300 rounded-xl font-black text-base text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]"
                      />
                      <button
                        type="button"
                        onClick={() => setSlotsNeeded((prev) => Math.min(20, prev + 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-300 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10.5px] text-gray-500 mt-1 block">
                      Tổng số người trên sân = {slotsNeeded + 1} (bao gồm bạn là chủ kèo)
                    </span>
                  </div>

                  {/* pricePerPerson */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Tiền mỗi người đóng (<code className="text-[#2D5F3F] font-mono">pricePerPerson</code>):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Để trống = Tự chia đều tiền sân"
                        value={pricePerPerson}
                        onChange={(e) => setPricePerPerson(e.target.value)}
                        className="w-full h-10 pl-3 pr-8 bg-white border border-gray-300 rounded-xl text-xs font-bold text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">đ</span>
                    </div>
                    <span className="text-[10.5px] text-gray-500 mt-1 block">
                      {pricePerPerson
                        ? `Mỗi người đóng: ${new Intl.NumberFormat('vi-VN').format(Number(pricePerPerson))} đ`
                        : `Chia đều dự kiến: ~${new Intl.NumberFormat('vi-VN').format(Math.round(courtFee / (slotsNeeded + 1)))} đ / người`}
                    </span>
                  </div>
                </div>

                {/* Require Approval Switch */}
                <div className="p-3.5 rounded-xl bg-white border border-gray-200">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs text-[#111827] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">verified</span>
                        Chế độ duyệt người tham gia (requireApproval)
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        {requireApproval
                          ? 'BẬT: Người tham gia gửi yêu cầu, tiền cọc được giữ trong ví họ và bạn có quyền Duyệt (Approve) hoặc Từ chối (Reject).'
                          : 'TẮT: Người tham gia chọn slot là trừ tiền và vào kèo ngay (Kèo công khai trực tiếp).'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded accent-[#2D5F3F] cursor-pointer shrink-0"
                    />
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Ghi chú mô tả trận đấu (description):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Giao lưu 2-3 set vui vẻ, đề nghị đến đúng giờ, nước uống tự chuẩn bị..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]"
                  />
                </div>

                {/* Court Slot UUID */}
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin</span>
                    Ca sân UUID (<code className="text-[#2D5F3F] font-mono">courtSlotId</code>):
                  </span>
                  <span className="font-mono text-gray-700 text-[10.5px] truncate max-w-[220px]" title={courtSlotId}>
                    {courtSlotId}
                  </span>
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
                    {currentDistrictData.courts.length} CƠ SỞ TRONG KHU VỰC
                  </span>
                </div>

                {/* Dynamic Map Frame with Selected Location */}
                <div className="relative rounded-2xl overflow-hidden h-56 bg-slate-100 border border-gray-200 shadow-inner group">
                  <iframe
                    title="Bản đồ cụm sân thể thao"
                    className="w-full h-full border-0 pointer-events-auto"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      currentCourt.lat ? `${currentCourt.lat},${currentCourt.lng}` : `${currentCourt.name}, ${currentDistrictData.name}`
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
                        {currentCourt.address || currentCourt.distance} • {currentCourt.courtCount}
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
                      onClick={() => { setSelectedCourtId(court.id); setPickedSlot(null) }}
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
                    {initialsOf(currentUser.name)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#111827]">
                      {currentUser.name || 'Bạn'} (Chủ Kèo)
                    </h4>
                    <p className="text-[10.5px] text-gray-500">
                      Trình: Trung bình - Khá • <span className="text-[#15803D] font-bold">Fairplay 99.4</span>
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

              {/* Card 4: FE Xử lý Hệ thống tự đặt ca sân & Trừ 100% tiền sân từ ví chủ kèo (Image 1) */}
              <div className="bg-[#EAF7EE] rounded-2xl border border-[#C6E7BE] p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[20px] shrink-0 mt-0.5">account_balance_wallet</span>
                  <div>
                    <p className="font-extrabold text-[#111827]">
                      Trừ 100% Tiền Sân Từ Ví Chủ Kèo: {new Intl.NumberFormat('vi-VN').format(courtFee)} đ
                    </p>
                    <p className="text-[11px] text-[#2D5F3F] mt-1 leading-relaxed">
                      Hệ thống tự động đặt ca sân và trừ 100% tiền sân từ ví chủ kèo. Tiền của người tham gia giữ trong ví họ, chỉ chuyển cho chủ kèo khi check-in hoặc sau giờ chơi.
                    </p>
                    <p className="text-[10.5px] text-[#15803D] font-bold mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      {pricePerPerson
                        ? `Thu người chơi: ${new Intl.NumberFormat('vi-VN').format(Number(pricePerPerson))} đ/suất`
                        : `pricePerPerson để trống = chia đều ~${new Intl.NumberFormat('vi-VN').format(Math.round(courtFee / (slotsNeeded + 1)))} đ cho ${slotsNeeded + 1} người.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 5: Quy tắc Hủy tự động & Hoàn tiền (Image 2) */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5 leading-relaxed">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">info</span>
                <div>
                  <strong className="block font-bold mb-0.5">Quy tắc hủy tự động &amp; Hoàn 100%:</strong>
                  Kèo chưa đủ người khi còn <strong>2 ngày tới giờ chơi</strong> sẽ tự động bị hủy, hủy luôn đơn sân và <strong>hoàn 100% cho mọi người</strong>.
                </div>
              </div>

              {/* Error banner if any */}
              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-600 text-[16px] shrink-0 mt-0.5">error</span>
                  <span>{createError}</span>
                </div>
              )}

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
                  <span>{submitting ? 'Đang Xử Lý...' : isEditMode ? 'LƯU THAY ĐỔI KÈO' : 'ĐĂNG KÈO NGAY'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CreateMatch
