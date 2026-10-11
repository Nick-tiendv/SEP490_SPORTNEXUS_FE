import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const PRESET_SPORTS_CATALOG = [
  { key: 'badminton', name: 'Cầu lông', icon: '🏸', color: '#15803D', bgColor: '#DCFCE7' },
  { key: 'pickleball', name: 'Pickleball', icon: '🏓', color: '#0284C7', bgColor: '#E0F2FE' },
  { key: 'football', name: 'Bóng đá', icon: '⚽', color: '#2563EB', bgColor: '#EFF6FF' },
  { key: 'basketball', name: 'Bóng rổ', icon: '🏀', color: '#EA580C', bgColor: '#FFF7ED' },
  { key: 'tennis', name: 'Quần vợt (Tennis)', icon: '🎾', color: '#65A30D', bgColor: '#F7FEE7' },
  { key: 'table_tennis', name: 'Bóng bàn', icon: '🏓', color: '#0284C7', bgColor: '#E0F2FE' },
  { key: 'volleyball', name: 'Bóng chuyền', icon: '🏐', color: '#F59E0B', bgColor: '#FEF3C7' },
  { key: 'swimming', name: 'Bơi lội', icon: '🏊', color: '#06B6D4', bgColor: '#CFFAFE' },
  { key: 'running', name: 'Chạy bộ / Điền kinh', icon: '🏃', color: '#10B981', bgColor: '#D1FAE5' },
  { key: 'billiards', name: 'Bi-a (Billiards)', icon: '🎱', color: '#4B5563', bgColor: '#F3F4F6' },
  { key: 'golf', name: 'Golf', icon: '⛳', color: '#059669', bgColor: '#D1FAE5' },
  { key: 'bowling', name: 'Bowling', icon: '🎳', color: '#7C3AED', bgColor: '#EDE9FE' },
  { key: 'cycling', name: 'Đạp xe', icon: '🚴', color: '#D97706', bgColor: '#FEF3C7' },
  { key: 'martial_arts', name: 'Võ thuật', icon: '🥋', color: '#DC2626', bgColor: '#FEE2E2' },
  { key: 'other', name: 'Môn thể thao khác (Tùy chỉnh)', icon: '🎯', color: '#15803D', bgColor: '#DCFCE7' },
]

export default function Profile() {
  const navigate = useNavigate()

  // State thông tin người chơi - Đồng bộ tên & handle
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('player_profile_data')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          name: parsed.name || 'Minh Minh Minh',
          username: parsed.username || '@minhminhminh',
          location: parsed.location || 'Thủ Đức',
          bio: parsed.bio || 'Bị cầu lông chơi',
          joinDate: parsed.joinDate || 'Tháng 03/2024',
          phone: parsed.phone || '0908 123 456',
          reputationScore: parsed.reputationScore || 4.9,
          totalReviews: parsed.totalReviews || 58,
          matchesPlayed: parsed.matchesPlayed || 48,
          winRate: parsed.winRate || 86,
          punctualityRate: parsed.punctualityRate || 99,
          ...parsed,
        }
      } catch (e) {
        console.error(e)
      }
    }
    return {
      name: 'Minh Minh Minh',
      username: '@minhminhminh',
      location: 'Thủ Đức',
      joinDate: 'Tháng 03/2024',
      phone: '0908 123 456',
      bio: 'Bị cầu lông chơi',
      reputationScore: 4.9,
      totalReviews: 58,
      matchesPlayed: 48,
      winRate: 86,
      punctualityRate: 99,
    }
  })

  // State các môn thể thao
  const [sportsData, setSportsData] = useState(() => {
    const saved = localStorage.getItem('player_sports_data') || localStorage.getItem('player_sports_elo')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map((s) => {
          const { elo, ...rest } = s
          return rest
        })
      } catch (e) {
        console.error(e)
      }
    }
    return [
      {
        id: 'badminton',
        name: 'Cầu lông',
        icon: '🏸',
        level: 'Trung bình - Khá',
        field: 'Trình độ',
        ranked: true,
        matches: 32,
        winRate: '88%',
        color: '#15803D',
        bgColor: '#DCFCE7',
      },
      {
        id: 'pickleball',
        name: 'Pickleball',
        icon: '🏓',
        level: 'Mới chơi - Đang tiến bộ',
        field: 'Trình độ',
        ranked: true,
        matches: 12,
        winRate: '82%',
        color: '#0284C7',
        bgColor: '#E0F2FE',
      },
      {
        id: 'football',
        name: 'Bóng đá',
        icon: '⚽',
        level: 'Khá - Đá phong trào',
        field: 'Trình độ',
        ranked: true,
        matches: 8,
        winRate: '75%',
        color: '#2563EB',
        bgColor: '#EFF6FF',
      },
      {
        id: 'basketball',
        name: 'Bóng rổ',
        icon: '🏀',
        level: 'Trung bình - Khá',
        field: 'Trình độ',
        ranked: true,
        matches: 6,
        winRate: '80%',
        color: '#EA580C',
        bgColor: '#FFF7ED',
      },
      {
        id: 'tennis',
        name: 'Quần vợt (Tennis)',
        icon: '🎾',
        level: 'Mới tập chơi - Căn bản',
        field: 'Trình độ',
        ranked: true,
        matches: 2,
        winRate: '50%',
        color: '#65A30D',
        bgColor: '#F7FEE7',
      },
    ]
  })

  // Lưu profile khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_profile_data', JSON.stringify(profile))
  }, [profile])

  // Lưu sportsData khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_sports_data', JSON.stringify(sportsData))
    localStorage.removeItem('player_sports_elo')
  }, [sportsData])

  // Trạng thái các Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showAddSportModal, setShowAddSportModal] = useState(false)
  const [selectedSportToEdit, setSelectedSportToEdit] = useState(null)
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false)
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false)
  const [showMatchesModal, setShowMatchesModal] = useState(false)
  const [showFavoriteCourtsModal, setShowFavoriteCourtsModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Form edit profile tạm thời
  const [editForm, setEditForm] = useState({ ...profile })

  // Form cập nhật trình độ cho môn đã có
  const [skillForm, setSkillForm] = useState({
    level: 'Trung bình - Khá',
    matches: 0,
  })

  // Form thêm môn thể thao mới & tự đánh giá ban đầu
  const [newSportForm, setNewSportForm] = useState({
    sportKey: 'table_tennis',
    customName: '',
    customIcon: '🎯',
    level: 'Mới tập chơi',
    field: 'Trình độ',
    matches: 0,
  })

  // Form viết đánh giá sau trận cho người chơi cùng sân
  const [writeReviewForm, setWriteReviewForm] = useState({
    targetPlayer: 'Hoàng Nam',
    rating: 5,
    content: '',
  })
  const [hoveredStar, setHoveredStar] = useState(0)

  // Toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Danh sách đánh giá mẫu ban đầu
  const initialReviews = [
    {
      id: 1,
      author: 'Lê Nam',
      targetPlayer: 'Minh Minh Minh',
      coPlayerRole: 'Đối thủ đánh đôi',
      avatarInitial: 'LN',
      avatarBg: '#DCFCE7',
      avatarColor: '#15803D',
      matchType: 'Kèo Cầu lông',
      court: 'Sân Q7 (Sân số 3)',
      time: '2 ngày trước',
      rating: 5,
      content:
        'Đánh cầu rất chuẩn và vui tính! Lên lưới chắc tay, giao lưu cực kỳ thoải mái, phối hợp nhịp nhàng.',
      verifiedCheckout: true,
      checkoutTime: '20:15',
    },
    {
      id: 2,
      author: 'Trần Hùng',
      targetPlayer: 'Minh Minh Minh',
      coPlayerRole: 'Đồng đội đánh cặp',
      avatarInitial: 'TH',
      avatarBg: '#E0F2FE',
      avatarColor: '#0284C7',
      matchType: 'Kèo Pickleball',
      court: 'Sân Nam Sài Gòn (Sân 2)',
      time: '5 ngày trước',
      rating: 5,
      content:
        'Đúng giờ, tinh thần thể thao tuyệt vời. Luôn chủ động chia tiền sân sòng phẳng và hỗ trợ bọc lót đồng đội.',
      verifiedCheckout: true,
      checkoutTime: '19:40',
    },
    {
      id: 3,
      author: 'Hoàng Anh Tuấn',
      targetPlayer: 'Minh Minh Minh',
      coPlayerRole: 'Bạn chơi cùng sân',
      avatarInitial: 'AT',
      avatarBg: '#FEF3C7',
      avatarColor: '#B45309',
      matchType: 'Kèo Cầu lông',
      court: 'Sân Hoàng Vy Q8 (Sân 1)',
      time: '1 tuần trước',
      rating: 5,
      content:
        'Kỹ thuật phong cầu và đập cầu rất chuẩn mực. Thái độ thi đấu văn minh, rất mong tiếp tục giao lưu ở các giải phong trào tới!',
      verifiedCheckout: true,
      checkoutTime: '21:00',
    },
    {
      id: 4,
      author: 'Võ Minh Đạt',
      targetPlayer: 'Minh Minh Minh',
      coPlayerRole: 'Đối thủ cùng sân',
      avatarInitial: 'MĐ',
      avatarBg: '#F3E8FF',
      avatarColor: '#7E22CE',
      matchType: 'Kèo Bóng đá',
      court: 'Sân Cỏ Nhân Tạo Kênh Tẻ',
      time: '2 tuần trước',
      rating: 5,
      content:
        'Đá bóng nhiệt huyết, tôn trọng đối thủ và đồng đội. Chuyền bóng sắc bén, rất kỷ luật và hòa nhã!',
      verifiedCheckout: true,
      checkoutTime: '18:30',
    },
    {
      id: 5,
      author: 'Nguyễn Quốc Huy',
      targetPlayer: 'Minh Minh Minh',
      coPlayerRole: 'Đồng đội đánh cặp',
      avatarInitial: 'QH',
      avatarBg: '#FCE7F3',
      avatarColor: '#BE185D',
      matchType: 'Kèo Cầu lông',
      court: 'CLB Viettel Q.10 (Sân 4)',
      time: '3 tuần trước',
      rating: 5,
      content:
        'Bảo bọc lưới cực tốt, phản xạ nhanh và luôn động viên đồng đội lúc bị dẫn điểm. Rất uy tín!',
      verifiedCheckout: true,
      checkoutTime: '20:30',
    },
    {
      id: 6,
      author: 'Đặng Tuấn',
      targetPlayer: 'Minh Minh Minh',
      coPlayerRole: 'Đối thủ cùng sân',
      avatarInitial: 'ĐT',
      avatarBg: '#E0E7FF',
      avatarColor: '#4338CA',
      matchType: 'Kèo Cầu lông',
      court: 'Sân Tân Phong Q7',
      time: '28/09/2026',
      rating: 4,
      content:
        'Trận đấu kịch tính đến set 3, chơi sòng phẳng, chấp hành nghiêm quy định giờ giấc và check-out trả sân đúng giờ.',
      verifiedCheckout: true,
      checkoutTime: '21:30',
    },
  ]

  // State danh sách đánh giá sau trận (lưu localStorage)
  const [reviewsList, setReviewsList] = useState(() => {
    const saved = localStorage.getItem('player_match_reviews')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {
        console.error(e)
      }
    }
    return initialReviews
  })

  // Lưu reviewsList khi có thay đổi
  useEffect(() => {
    localStorage.setItem('player_match_reviews', JSON.stringify(reviewsList))
  }, [reviewsList])

  // Phiên thi đấu check-out mặc định chuẩn SportNexus
  const defaultCheckoutSession = {
    courtId: 'Court 3',
    courtName: 'Sân Cầu Lông BWF Pro 01',
    sport: 'Cầu lông',
    checkInDone: true,
    checkInTime: '18:00',
    checkOutDone: true,
    checkOutTime: '19:35',
    coPlayers: [
      { id: 'p1', name: 'Hoàng Nam', email: 'hoang.nam.badminton@gmail.com', role: 'Đồng đội đánh cặp', slotRep: 'Đại diện slot 1' },
      { id: 'p2', name: 'Đức Trần', email: 'duc_tran92@outlook.com', role: 'Đối thủ cùng sân', slotRep: 'Đại diện slot 2' },
      { id: 'p3', name: 'Tuấn Kiệt', email: 'tuankiet.sports@gmail.com', role: 'Đối thủ cùng sân', slotRep: 'Đại diện slot 3' },
    ],
  }

  // Lấy phiên thi đấu check-out gần nhất (lưu localStorage)
  const [checkoutSession, setCheckoutSession] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.checkOutDone) return parsed
      }
    } catch (e) {}
    return defaultCheckoutSession
  })

  // Danh sách tất cả người chơi tại thời điểm vừa check-out thành công
  const [checkoutCoPlayers, setCheckoutCoPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.coPlayers && parsed.coPlayers.length > 0) {
          return parsed.coPlayers
        }
      }
    } catch (e) {}
    return [
      { id: 'p1', name: 'Hoàng Nam', email: 'hoang.nam.badminton@gmail.com', role: 'Đồng đội đánh cặp', slotRep: 'Đại diện slot 1' },
      { id: 'p2', name: 'Đức Trần', email: 'duc_tran92@outlook.com', role: 'Đối thủ cùng sân', slotRep: 'Đại diện slot 2' },
      { id: 'p3', name: 'Tuấn Kiệt', email: 'tuankiet.sports@gmail.com', role: 'Đối thủ cùng sân', slotRep: 'Đại diện slot 3' },
    ]
  })

  // Trạng thái form thêm bạn đánh đôi (trường hợp 1 người đại diện đăng ký slot)
  const [showAddDoublesPartnerForm, setShowAddDoublesPartnerForm] = useState(false)
  const [doublesPartnerForm, setDoublesPartnerForm] = useState({
    name: '',
    role: 'Đồng đội đánh cặp',
    representedBy: 'Hoàng Nam',
  })

  // Tự động đồng bộ khi có phiên check-out mới hoàn tất trong hệ thống
  useEffect(() => {
    const handleSyncCheckout = () => {
      try {
        const saved = localStorage.getItem('sportnexus_last_checkout_session')
        if (saved) {
          const parsed = JSON.parse(saved)
          setCheckoutSession(parsed)
          if (parsed && parsed.coPlayers && parsed.coPlayers.length > 0) {
            setCheckoutCoPlayers(parsed.coPlayers)
          }
        }
      } catch (e) {}
    }
    window.addEventListener('sportnexus_checkout_updated', handleSyncCheckout)
    window.addEventListener('storage', handleSyncCheckout)
    return () => {
      window.removeEventListener('sportnexus_checkout_updated', handleSyncCheckout)
      window.removeEventListener('storage', handleSyncCheckout)
    }
  }, [])

  // Thêm người chơi đánh đôi (người đi cùng đại diện slot)
  const handleAddDoublesPartner = (e) => {
    if (e) e.preventDefault()
    const name = doublesPartnerForm.name.trim()
    if (!name) {
      triggerToast('⚠️ Vui lòng nhập họ tên hoặc biệt danh người chơi đánh đôi!')
      return
    }

    const newPartner = {
      id: `partner_${Date.now()}`,
      name: name,
      role: doublesPartnerForm.role,
      isDoublesGuest: true,
      representedBy: doublesPartnerForm.representedBy || 'Người đại diện slot',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FEF3C7&color=D97706`,
    }

    const updated = [...checkoutCoPlayers, newPartner]
    setCheckoutCoPlayers(updated)

    // Cập nhật lưu bền vững vào session
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      const parsed = saved ? JSON.parse(saved) : { checkOutDone: true, courtId: 'Court 3', courtName: 'Sân Cầu Lông BWF Pro 01' }
      parsed.coPlayers = updated
      parsed.checkOutDone = true
      localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(parsed))
      setCheckoutSession(parsed)
      window.dispatchEvent(new Event('sportnexus_checkout_updated'))
    } catch (err) {}

    // Tự động chọn người vừa thêm làm đối tượng đánh giá
    setWriteReviewForm((prev) => ({
      ...prev,
      targetPlayer: newPartner.name,
    }))

    setShowAddDoublesPartnerForm(false)
    setDoublesPartnerForm({
      name: '',
      role: 'Đồng đội đánh cặp',
      representedBy: checkoutCoPlayers[0]?.name || 'Hoàng Nam',
    })
    triggerToast(`🎉 Đã thêm bạn đánh đôi "${name}" (${newPartner.role} • Đi cùng ${newPartner.representedBy}) vào danh sách đánh giá!`)
  }

  // Xóa bạn đánh đôi đã thêm thủ công (nếu cần)
  const handleRemoveDoublesPartner = (id) => {
    const updated = checkoutCoPlayers.filter((p) => p.id !== id)
    setCheckoutCoPlayers(updated)
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        parsed.coPlayers = updated
        localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(parsed))
        setCheckoutSession(parsed)
        window.dispatchEvent(new Event('sportnexus_checkout_updated'))
      }
    } catch (err) {}
    triggerToast('🗑️ Đã xóa người chơi khỏi danh sách đánh giá của trận.')
  }

  // Mô phỏng check-out thành công nhanh để thử nghiệm
  const handleSimulateCheckout = () => {
    const session = {
      courtId: 'Court 3',
      courtName: 'Sân Cầu Lông BWF Pro 01',
      sport: 'Cầu lông',
      checkInDone: true,
      checkInTime: '18:00',
      checkOutDone: true,
      checkOutTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      coPlayers: [
        { id: 'p1', name: 'Hoàng Nam', email: 'hoang.nam.badminton@gmail.com', role: 'Đồng đội đánh cặp', slotRep: 'Đại diện slot 1' },
        { id: 'p2', name: 'Đức Trần', email: 'duc_tran92@outlook.com', role: 'Đối thủ cùng sân', slotRep: 'Đại diện slot 2' },
        { id: 'p3', name: 'Tuấn Kiệt', email: 'tuankiet.sports@gmail.com', role: 'Đối thủ cùng sân', slotRep: 'Đại diện slot 3' },
      ],
    }
    localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(session))
    setCheckoutSession(session)
    setCheckoutCoPlayers(session.coPlayers)
    window.dispatchEvent(new Event('sportnexus_checkout_updated'))
    triggerToast('✅ Đã kích hoạt phiên chơi check-out thành công tại Sân Cầu Lông BWF Pro 01!')
  }

  // Gửi đánh giá sau trận (chỉ cho phép sau khi check-out thành công)
  const handleSubmitReview = (e) => {
    e.preventDefault()
    const session = checkoutSession || (() => {
      try {
        const saved = localStorage.getItem('sportnexus_last_checkout_session')
        return saved ? JSON.parse(saved) : null
      } catch (e) { return null }
    })()

    if (!session || !session.checkOutDone) {
      triggerToast('⚠️ Người chơi chỉ được phép đánh giá sau khi check-out thành công!')
      return
    }

    if (!writeReviewForm.content || writeReviewForm.content.trim().length < 10) {
      triggerToast('⚠️ Vui lòng viết nhận xét chi tiết bằng chữ (tối thiểu 10 ký tự)!')
      return
    }

    if (!writeReviewForm.rating || writeReviewForm.rating < 1 || writeReviewForm.rating > 5) {
      triggerToast('⚠️ Vui lòng chấm điểm sao từ 1 đến 5 sao!')
      return
    }

    const targetCoPlayer = checkoutCoPlayers.find((p) => p.name === writeReviewForm.targetPlayer)
    const effectiveRole = targetCoPlayer?.isDoublesGuest
      ? `${targetCoPlayer.role} • Đi cùng ${targetCoPlayer.representedBy}`
      : targetCoPlayer?.role || 'Bạn chơi cùng sân'

    const newReview = {
      id: Date.now(),
      author: 'Bạn (Minh Minh Minh)',
      targetPlayer: writeReviewForm.targetPlayer,
      coPlayerRole: effectiveRole,
      isDoublesGuest: Boolean(targetCoPlayer?.isDoublesGuest),
      representedBy: targetCoPlayer?.representedBy || null,
      avatarInitial: writeReviewForm.targetPlayer.slice(0, 2).toUpperCase(),
      avatarBg: targetCoPlayer?.isDoublesGuest ? '#FEF3C7' : '#DCFCE7',
      avatarColor: targetCoPlayer?.isDoublesGuest ? '#D97706' : '#15803D',
      matchType: `Kèo ${session.sport || 'Cầu lông'}`,
      court: `${session.courtName || 'Sân Cầu Lông BWF Pro 01'} (${session.courtId || 'Court 3'})`,
      time: 'Vừa xong',
      rating: Number(writeReviewForm.rating),
      content: writeReviewForm.content.trim(),
      verifiedCheckout: true,
      checkoutTime: session.checkOutTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [newReview, ...reviewsList]
    setReviewsList(updated)
    setProfile((prev) => ({
      ...prev,
      totalReviews: (prev.totalReviews || 0) + 1,
    }))
    setShowWriteReviewModal(false)
    setWriteReviewForm({
      targetPlayer: 'Hoàng Nam',
      rating: 5,
      content: '',
    })
    triggerToast(`🎉 Đã gửi đánh giá thành công cho ${newReview.targetPlayer}!`)
  }

  // Danh sách sân yêu thích
  const favoriteCourts = [
    {
      name: 'Sân Cầu Lông Tân Phong (Quận 7)',
      address: 'Số 45 Lê Văn Lương, Tân Phong, Quận 7',
      sport: 'Cầu lông',
      rating: 4.9,
      courtsCount: '8 sân thảm PVC tiêu chuẩn',
    },
    {
      name: 'SportNexus Arena Nam Sài Gòn',
      address: 'Đường số 10, KDC Him Lam, Quận 7',
      sport: 'Pickleball & Cầu lông',
      rating: 5.0,
      courtsCount: '12 sân có máy che & quạt làm mát',
    },
    {
      name: 'CLB Pickleball Phú Mỹ Hưng',
      address: 'Khu Đô Thị Phú Mỹ Hưng, Quận 7',
      sport: 'Pickleball',
      rating: 4.8,
      courtsCount: '6 sân chuẩn USAPA',
    },
    {
      name: 'Sân Bóng Đá SportZone Q7',
      address: 'Nguyễn Văn Linh, Tân Phú, Quận 7',
      sport: 'Bóng đá mini 5-7 người',
      rating: 4.7,
      courtsCount: '4 sân cỏ nhân tạo đời mới',
    },
    {
      name: 'Sân Tennis Sunrise City',
      address: 'Khu Sunrise City, Nguyễn Hữu Thọ, Quận 7',
      sport: 'Tennis',
      rating: 4.9,
      courtsCount: '2 sân cứng tiêu chuẩn quốc tế',
    },
  ]

  // Mở modal cập nhật trình độ & số trận
  const handleOpenSkillModal = (sport) => {
    setSelectedSportToEdit(sport)
    setSkillForm({
      level: sport.level.includes('Chưa có') ? 'Mới tập chơi' : sport.level,
      matches: sport.matches !== undefined ? sport.matches : 0,
    })
    setShowSkillModal(true)
  }

  // Lưu trình độ & số trận
  const handleSaveSkill = () => {
    if (!selectedSportToEdit) return
    const numMatches = Math.max(0, parseInt(skillForm.matches, 10) || 0)
    setSportsData((prev) =>
      prev.map((s) => {
        if (s.id === selectedSportToEdit.id) {
          return {
            ...s,
            level: skillForm.level,
            matches: numMatches,
            field: 'Trình độ',
            ranked: true,
          }
        }
        return s
      })
    )
    setShowSkillModal(false)
    triggerToast(
      `🎉 Đã cập nhật thành công trình độ ${selectedSportToEdit.name} (${skillForm.level} • ${numMatches} trận)!`
    )
  }

  // Mở modal thêm môn thể thao mới
  const handleOpenAddSportModal = () => {
    const available = PRESET_SPORTS_CATALOG.find(
      (p) => p.key !== 'other' && !sportsData.some((s) => s.id === p.key || s.name.toLowerCase() === p.name.toLowerCase())
    )
    setNewSportForm({
      sportKey: available ? available.key : 'other',
      customName: '',
      customIcon: '🎯',
      level: 'Mới tập chơi',
      field: 'Trình độ',
      matches: 0,
    })
    setShowAddSportModal(true)
  }

  // Lưu môn thể thao mới & tự đánh giá trình độ ban đầu
  const handleSaveNewSport = () => {
    const isCustom = newSportForm.sportKey === 'other'
    const preset = PRESET_SPORTS_CATALOG.find((p) => p.key === newSportForm.sportKey)
    const sportName = isCustom ? newSportForm.customName.trim() : (preset ? preset.name : '')

    if (!sportName) {
      triggerToast('⚠️ Vui lòng nhập tên môn thể thao!')
      return
    }

    const isDuplicate = sportsData.some(
      (s) => s.id === newSportForm.sportKey || s.name.toLowerCase() === sportName.toLowerCase()
    )
    if (isDuplicate) {
      triggerToast(`⚠️ Môn "${sportName}" đã có sẵn trong danh sách kỹ năng của bạn!`)
      return
    }

    const newSport = {
      id: isCustom ? `sport_${Date.now()}` : newSportForm.sportKey,
      name: sportName,
      icon: isCustom ? (newSportForm.customIcon.trim() || '🎯') : preset.icon,
      level: newSportForm.level,
      field: 'Trình độ',
      ranked: true,
      matches: Number(newSportForm.matches) || 0,
      winRate: '100%',
      color: preset?.color || '#15803D',
      bgColor: preset?.bgColor || '#DCFCE7',
    }

    setSportsData((prev) => [...prev, newSport])
    setShowAddSportModal(false)
    triggerToast(`🎉 Đã thêm thành công môn ${newSport.name} (${newSport.level}) vào hồ sơ!`)
  }

  // Xóa môn thể thao khỏi danh sách kỹ năng
  const handleDeleteSport = (sport) => {
    if (sportsData.length <= 1) {
      triggerToast('⚠️ Bạn cần giữ ít nhất một môn thể thao trong hồ sơ!')
      return
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa môn "${sport.name}" khỏi danh sách trình độ kỹ năng?`)) {
      setSportsData((prev) => prev.filter((s) => s.id !== sport.id))
      triggerToast(`🗑️ Đã xóa môn ${sport.name} khỏi danh sách kỹ năng.`)
    }
  }

  // Lưu Form Edit Profile
  const handleSaveProfile = () => {
    setProfile({ ...editForm })
    localStorage.setItem('player_profile_data', JSON.stringify(editForm))
    window.dispatchEvent(new CustomEvent('player-profile-updated', { detail: editForm }))
    setShowEditModal(false)
    triggerToast('✅ Cập nhật thông tin hồ sơ người chơi thành công!')
  }

  return (
    <div
      style={{
        padding: '24px 28px 60px 28px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            right: '28px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(21, 128, 61, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER THANH TIÊU ĐỀ: Đồng bộ hệ sinh thái SportNexus */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '14px 20px',
          borderRadius: '18px',
          border: '1px solid rgba(45, 95, 63, 0.12)',
          boxShadow: '0 4px 16px rgba(45, 95, 63, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowNotificationModal(true)}
            title="Cài đặt tài khoản"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB'
              e.currentTarget.style.borderColor = '#15803D'
              e.currentTarget.style.color = '#15803D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF'
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.color = '#374151'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              settings
            </span>
          </button>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 800,
                color: '#1C3524',
                letterSpacing: '-0.4px',
              }}
            >
              Hồ sơ người chơi
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '12.5px',
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              Định danh vận động viên &amp; Hệ thống hồ sơ thể thao SportNexus
            </p>
          </div>
        </div>

        {/* Action Button: Chỉnh sửa hồ sơ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setEditForm({ ...profile })
              setShowEditModal(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(21, 128, 61, 0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(21, 128, 61, 0.25)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              edit_square
            </span>
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>
      </div>

      {/* GRID 2 CỘT RESPONSIVE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
        className="profile-responsive-grid"
      >
        {/* ===================== CỘT BÊN TRÁI ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CARD 1: HERO PROFILE CARD */}
          <div
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FAF7 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 10px 30px rgba(45, 95, 63, 0.06)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Header dải màu trang trí phía trên - Đã xóa mục ID */}
            <div
              style={{
                height: '88px',
                background:
                  'linear-gradient(135deg, #15803D 0%, #22C55E 60%, #86EFAC 100%)',
                position: 'relative',
              }}
            />

            {/* Nội dung bên trong Hero Card */}
            <div style={{ padding: '0 22px 22px 22px', position: 'relative' }}>
              {/* Avatar + Badge uy tín */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: '-44px',
                  marginBottom: '14px',
                }}
              >
                {/* Avatar container - Đồng bộ avatar MMM với TopBar và CommunityFeed */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      padding: '4px',
                      background: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(45, 95, 63, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, #1B4D2E 0%, #2D5F3F 50%, #15803D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '28px',
                        letterSpacing: '-0.5px',
                        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.25)',
                      }}
                    >
                      MMM
                    </div>
                  </div>
                  {/* Chấm tròn online / verified xanh lá góc dưới */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      right: '3px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#10B981',
                      }}
                    />
                  </span>
                </div>

                {/* Badge: Người chơi uy tín 4.9 ★ (58) */}
                <div
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#15803D',
                    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.08)',
                  }}
                >
                  <span style={{ color: '#EAB308' }}>★</span>
                  <span>Người chơi uy tín {profile.reputationScore} ★ ({profile.totalReviews})</span>
                </div>
              </div>

              {/* Tên & Thông tin người chơi: Minh Minh Minh */}
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#1C3524',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {profile.name}
                </h2>
                <p
                  style={{
                    margin: '3px 0 10px 0',
                    fontSize: '13.5px',
                    color: '#15803D',
                    fontWeight: 600,
                  }}
                >
                  {profile.username}
                </p>

                {/* Meta info: Vị trí & Ngày gia nhập */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#4B5563',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6B7280' }}>
                      location_on
                    </span>
                    <span>{profile.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6B7280' }}>
                      calendar_month
                    </span>
                    <span>Gia nhập: {profile.joinDate}</span>
                  </div>
                </div>

                {/* Bio tóm tắt */}
                {profile.bio && (
                  <div
                    style={{
                      background: '#F9FAFB',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: '#4B5563',
                      lineHeight: 1.45,
                      marginBottom: '18px',
                      borderLeft: '3px solid #15803D',
                    }}
                  >
                    {profile.bio}
                  </div>
                )}
              </div>

              {/* 3 THẺ THỐNG KÊ NHANH (48 Trận, 86% Tỷ lệ thắng, 99% Đúng giờ) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  background: '#F0FDF4',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  border: '1px solid #DCFCE7',
                }}
              >
                {/* 1. Trận đã đấu */}
                <div
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onClick={() => setShowMatchesModal(true)}
                  title="Nhấn để xem lịch sử 48 trận"
                >
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#15803D',
                      lineHeight: 1.1,
                    }}
                  >
                    {profile.matchesPlayed}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4B5563',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    Trận đã đấu
                  </div>
                </div>

                {/* 2. Tỷ lệ thắng */}
                <div
                  style={{
                    textAlign: 'center',
                    borderLeft: '1px solid #D1FAE5',
                    borderRight: '1px solid #D1FAE5',
                  }}
                >
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#15803D',
                      lineHeight: 1.1,
                    }}
                  >
                    {profile.winRate}%
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4B5563',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    Tỷ lệ thắng
                  </div>
                </div>

                {/* 3. Đúng giờ (Cao) */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#15803D',
                      lineHeight: 1.1,
                    }}
                  >
                    {profile.punctualityRate}%
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4B5563',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    Đúng giờ (Cao)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: DANH HIỆU & HUY HIỆU (3 ĐÃ ĐẠT) */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid rgba(45, 95, 63, 0.12)',
              boxShadow: '0 4px 16px rgba(45, 95, 63, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>
                  military_tech
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#1C3524',
                  }}
                >
                  Danh hiệu &amp; Huy hiệu
                </h3>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#15803D',
                  background: '#DCFCE7',
                  padding: '3px 10px',
                  borderRadius: '12px',
                }}
              >
                3 Đã đạt
              </span>
            </div>

            {/* 3 Thẻ Huy Hiệu */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}
            >
              {/* Huy hiệu 1: Vua giao lưu Q7 */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #FEFCE8 0%, #FEF08A 100%)',
                  border: '1px solid #FDE047',
                  borderRadius: '16px',
                  padding: '14px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(234, 179, 8, 0.12)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#FEF08A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  🏆
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#854D0E',
                    lineHeight: 1.25,
                    marginBottom: '4px',
                  }}
                >
                  Vua giao lưu Q7
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#A16207',
                    fontWeight: 600,
                  }}
                >
                  Top 5% tuần
                </div>
              </div>

              {/* Huy hiệu 2: Chiến binh đúng giờ */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #F0FDF4 0%, #BBF7D0 100%)',
                  border: '1px solid #86EFAC',
                  borderRadius: '16px',
                  padding: '14px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.12)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#86EFAC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  🕒
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#166534',
                    lineHeight: 1.25,
                    marginBottom: '4px',
                  }}
                >
                  Chiến binh đúng giờ
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#15803D',
                    fontWeight: 600,
                  }}
                >
                  30 trận liên tiếp
                </div>
              </div>

              {/* Huy hiệu 3: Fair-play 5 sao */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #F0FDFA 0%, #99F6E4 100%)',
                  border: '1px solid #5EEAD4',
                  borderRadius: '16px',
                  padding: '14px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.12)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#5EEAD4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  🤝
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#115E59',
                    lineHeight: 1.25,
                    marginBottom: '4px',
                  }}
                >
                  Fair-play 5 sao
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#0F766E',
                    fontWeight: 600,
                  }}
                >
                  Uy tín tuyệt đối
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: TÀI KHOẢN & TIỆN ÍCH */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid rgba(45, 95, 63, 0.12)',
              boxShadow: '0 4px 16px rgba(45, 95, 63, 0.04)',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: 800,
                color: '#1C3524',
              }}
            >
              Tài khoản &amp; Tiện ích
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. Lịch sử trận đấu */}
              <div
                onClick={() => setShowMatchesModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      flag
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Lịch sử trận đấu
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                    48 trận
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                    chevron_right
                  </span>
                </div>
              </div>

              {/* 2. Sân yêu thích */}
              <div
                onClick={() => setShowFavoriteCourtsModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      favorite
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Sân yêu thích
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                    5 địa điểm
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                    chevron_right
                  </span>
                </div>
              </div>

              {/* 3. Cài đặt thông báo */}
              <div
                onClick={() => setShowNotificationModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      notifications
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Cài đặt thông báo
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                  chevron_right
                </span>
              </div>

              {/* 4. Trung tâm hỗ trợ */}
              <div
                onClick={() => setShowHelpModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      support_agent
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Trung tâm hỗ trợ
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                  chevron_right
                </span>
              </div>

              {/* 5. Đăng xuất */}
              <div
                onClick={() => setShowLogoutModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#FEF2F2',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #FEE2E2',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEE2E2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FEF2F2'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      logout
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>
                    Đăng xuất
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#DC2626' }}>
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CỘT BÊN PHẢI ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* PHẦN 1: TRÌNH ĐỘ KỸ NĂNG */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 8px 24px rgba(45, 95, 63, 0.05)',
            }}
          >
            {/* Header: Icon + Trình độ & Nút Thêm Môn Thể Thao */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#15803D' }}>
                  workspace_premium
                </span>
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1C3524',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    Trình độ kỹ năng ({sportsData.length} môn)
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#15803D',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  ĐÁNH GIÁ KỸ NĂNG
                </span>
                <button
                  onClick={handleOpenAddSportModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(21, 128, 61, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 5px 14px rgba(21, 128, 61, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(21, 128, 61, 0.25)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Thêm môn thể thao
                </button>
              </div>
            </div>

            {/* Banner hướng dẫn (info box) */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: '#15803D', flexShrink: 0, marginTop: '1px' }}
              >
                info
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#166534',
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                Tự đánh giá trình độ giúp SportNexus đề xuất đối thủ &amp; kèo ghép trận cân bằng nhất.
              </p>
            </div>

            {/* DANH SÁCH 4 MÔN THỂ THAO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sportsData.map((sport) => {
                const isTennis = sport.id === 'tennis'
                return (
                  <div
                    key={sport.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '18px',
                      background: '#FFFFFF',
                      border: isTennis
                        ? '1.5px dashed #86EFAC'
                        : '1px solid rgba(45, 95, 63, 0.12)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#15803D'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(21, 128, 61, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isTennis
                        ? '#86EFAC'
                        : 'rgba(45, 95, 63, 0.12)'
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Left: Sport Icon + Name & Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '14px',
                          background: sport.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        {sport.icon}
                      </div>

                      <div>
                        {/* Tên môn + Badge Trạng thái */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '15.5px',
                              fontWeight: 800,
                              color: '#1C3524',
                            }}
                          >
                            {sport.name}
                          </span>
                          {sport.ranked ? (
                            <span
                              style={{
                                background: '#DCFCE7',
                                color: '#15803D',
                                border: '1px solid #86EFAC',
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                fontWeight: 800,
                              }}
                            >
                              Đã xác nhận
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#F3F4F6',
                                color: '#6B7280',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Chưa xếp hạng
                            </span>
                          )}
                        </div>

                        {/* Subtext: Trình độ & Số trận đã chơi */}
                        <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>
                            {sport.field}: <strong style={{ color: sport.ranked ? '#1F2937' : '#9CA3AF' }}>{sport.level}</strong>
                          </span>
                          <span style={{ color: '#D1D5DB' }}>•</span>
                          <span style={{ background: '#F3F4F6', color: '#374151', padding: '1px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                            {sport.matches !== undefined ? sport.matches : 0} trận đã chơi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action buttons (Cập nhật & Xóa môn) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenSkillModal(sport)}
                        style={{
                          background: isTennis ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)' : '#FFFFFF',
                          color: isTennis ? '#FFFFFF' : '#15803D',
                          border: isTennis ? 'none' : '1px solid #86EFAC',
                          borderRadius: '12px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: isTennis ? '0 3px 10px rgba(21, 128, 61, 0.25)' : 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (isTennis) {
                            e.currentTarget.style.transform = 'scale(1.02)'
                          } else {
                            e.currentTarget.style.background = '#DCFCE7'
                            e.currentTarget.style.borderColor = '#15803D'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isTennis) {
                            e.currentTarget.style.transform = 'scale(1)'
                          } else {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.borderColor = '#86EFAC'
                          }
                        }}
                      >
                        {isTennis && !sport.ranked ? 'Đánh giá ngay' : 'Cập nhật trình độ'}
                      </button>

                      {sportsData.length > 1 && (
                        <button
                          onClick={() => handleDeleteSport(sport)}
                          title={`Xóa môn ${sport.name} khỏi danh sách kỹ năng`}
                          style={{
                            background: '#F9FAFB',
                            color: '#9CA3AF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEE2E2'
                            e.currentTarget.style.borderColor = '#FCA5A5'
                            e.currentTarget.style.color = '#DC2626'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F9FAFB'
                            e.currentTarget.style.borderColor = '#E5E7EB'
                            e.currentTarget.style.color = '#9CA3AF'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Nút thêm môn thể thao dạng Card viền nét đứt */}
              <button
                onClick={handleOpenAddSportModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  background: '#F9FAFB',
                  border: '2px dashed #86EFAC',
                  color: '#15803D',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#15803D'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = '#86EFAC'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add_circle</span>
                <span>+ Thêm môn thể thao mới &amp; Tự đánh giá trình độ ban đầu</span>
              </button>
            </div>
          </div>

          {/* PHẦN 2: ĐÁNH GIÁ SAU TRẬN */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 8px 24px rgba(45, 95, 63, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#15803D' }}>
                  forum
                </span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1C3524',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    Đánh giá sau trận
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 10px rgba(21, 128, 61, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                    rate_review
                  </span>
                  <span>Viết đánh giá sau trận</span>
                </button>

                <button
                  onClick={() => setShowAllReviewsModal(true)}
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    borderRadius: '12px',
                    padding: '7px 12px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Tất cả ({reviewsList.length})</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            {/* Banner quy định đánh giá sau trận */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#475569',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
                  verified_user
                </span>
                <span>
                  <strong>Quy chuẩn đánh giá:</strong> Người chơi chỉ được phép <u>viết nhận xét</u> &amp; <u>chấm điểm sao</u> cho bạn chơi cùng sân <strong>sau khi check-out thành công</strong>.
                </span>
              </div>
              <span
                style={{
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '11px',
                  border: '1px solid #86EFAC',
                }}
              >
                ✓ Xác thực sau Check-out
              </span>
            </div>

            {/* Danh sách các đánh giá nổi bật */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviewsList.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: '18px',
                    padding: '16px 18px',
                    background: '#FAFCFA',
                    border: '1px solid rgba(45, 95, 63, 0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: item.avatarBg,
                          color: item.avatarColor,
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.avatarInitial}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '14.5px',
                            fontWeight: 800,
                            color: '#1F2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>{item.author}</span>
                          {item.coPlayerRole && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#6B7280',
                                background: '#F3F4F6',
                                padding: '1px 6px',
                                borderRadius: '6px',
                              }}
                            >
                              {item.coPlayerRole}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#6B7280',
                            marginTop: '2px',
                          }}
                        >
                          {item.matchType} • {item.court} • {item.time}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '8px',
                          border: '1px solid #86EFAC',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                          check_circle
                        </span>
                        Đã check-out cùng sân
                      </span>

                      <div style={{ display: 'flex', color: '#EAB308', fontSize: '14px', gap: '1px' }}>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              color: i < Math.floor(item.rating) ? '#EAB308' : '#D1D5DB',
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '13.5px',
                      color: '#374151',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                      paddingLeft: '4px',
                      borderLeft: '3px solid #15803D',
                    }}
                  >
                    “{item.content}”
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== CÁC MODAL TƯƠNG TÁC ===================== */}

      {/* 1. MODAL CHỈNH SỬA HỒ SƠ */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Chỉnh sửa thông tin người chơi
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Tên định danh (Handle)
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Khu vực thi đấu ưa thích
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Tổng số trận đã đấu
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({
                      ...prev,
                      matchesPlayed: Math.max(0, (parseInt(prev.matchesPlayed, 10) || 0) - 1),
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editForm.matchesPlayed === undefined ? '' : editForm.matchesPlayed}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setEditForm((prev) => ({
                        ...prev,
                        matchesPlayed: val === '' ? '' : parseInt(val, 10),
                      }))
                    }}
                    onBlur={() => {
                      if (editForm.matchesPlayed === '' || isNaN(editForm.matchesPlayed)) {
                        setEditForm((prev) => ({ ...prev, matchesPlayed: 0 }))
                      }
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #15803D',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#15803D',
                      outline: 'none',
                      background: '#F0FDF4',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({
                      ...prev,
                      matchesPlayed: (parseInt(prev.matchesPlayed, 10) || 0) + 1,
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Giới thiệu bản thân (Bio)
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL CẬP NHẬT TRÌNH ĐỘ */}
      {showSkillModal && selectedSportToEdit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>{selectedSportToEdit.icon}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Cập nhật trình độ người chơi: {selectedSportToEdit.name}
                </h3>
              </div>
              <button
                onClick={() => setShowSkillModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Trình độ người chơi
                </label>
                <select
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="Mới tập chơi">Mới tập chơi (Căn bản)</option>
                  <option value="Mới chơi - Đang tiến bộ">Mới chơi - Đang tiến bộ</option>
                  <option value="Trung bình">Trung bình (Giao lưu phong trào)</option>
                  <option value="Trung bình - Khá">Trung bình - Khá</option>
                  <option value="Khá - Đánh chắc tay">Khá - Đánh chắc tay</option>
                  <option value="Bán chuyên / Nâng cao">Bán chuyên / Nâng cao</option>
                  <option value="Chuyên nghiệp / Thi đấu giải">Chuyên nghiệp / Thi đấu giải</option>
                </select>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Thiết lập trình độ thực tế giúp hệ thống tự động ghép kèo cân bằng, đúng thực lực.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Số trận đã chơi ({selectedSportToEdit.name})
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSkillForm((prev) => ({
                      ...prev,
                      matches: Math.max(0, (parseInt(prev.matches, 10) || 0) - 1),
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={skillForm.matches === undefined ? '' : skillForm.matches}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setSkillForm((prev) => ({
                        ...prev,
                        matches: val === '' ? '' : parseInt(val, 10),
                      }))
                    }}
                    onBlur={() => {
                      if (skillForm.matches === '' || isNaN(skillForm.matches)) {
                        setSkillForm((prev) => ({ ...prev, matches: 0 }))
                      }
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #15803D',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#15803D',
                      outline: 'none',
                      background: '#F0FDF4',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setSkillForm((prev) => ({
                      ...prev,
                      matches: (parseInt(prev.matches, 10) || 0) + 1,
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280', marginRight: '4px' }}>Cộng nhanh:</span>
                  {[1, 5, 10].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setSkillForm((prev) => ({
                        ...prev,
                        matches: (parseInt(prev.matches, 10) || 0) + inc,
                      }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #BBF7D0',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSkillForm((prev) => ({ ...prev, matches: 0 }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: '#6B7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    Đặt về 0
                  </button>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  💡 Bạn có thể nhập trực tiếp số trận từ bàn phím hoặc dùng các nút tăng/giảm ở hai bên.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button
                onClick={() => setShowSkillModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSkill}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2B. MODAL THÊM MÔN THỂ THAO & TỰ ĐÁNH GIÁ TRÌNH ĐỘ BAN ĐẦU */}
      {showAddSportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  🏅
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                    Thêm môn thể thao &amp; Tự đánh giá
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                    Thiết lập trình độ ban đầu để ghép kèo chính xác
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Chọn môn thể thao */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  1. Chọn môn thể thao
                </label>
                <select
                  value={newSportForm.sportKey}
                  onChange={(e) => {
                    const selected = PRESET_SPORTS_CATALOG.find(p => p.key === e.target.value)
                    setNewSportForm({
                      ...newSportForm,
                      sportKey: e.target.value,
                      customName: selected?.key !== 'other' ? selected?.name || '' : '',
                      customIcon: selected?.icon || '🎯',
                    })
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  {PRESET_SPORTS_CATALOG.map((p) => {
                    const alreadyHas = sportsData.some(
                      (s) => s.id === p.key || s.name.toLowerCase() === p.name.toLowerCase()
                    )
                    return (
                      <option key={p.key} value={p.key} disabled={alreadyHas && p.key !== 'other'}>
                        {p.icon} {p.name} {alreadyHas && p.key !== 'other' ? '(Đã có trong hồ sơ)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Nếu chọn "other", cho phép tự nhập tên & icon */}
              {newSportForm.sportKey === 'other' && (
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                      Biểu tượng
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={newSportForm.customIcon}
                      onChange={(e) => setNewSportForm({ ...newSportForm, customIcon: e.target.value })}
                      placeholder="🎯"
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '18px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                      Tên môn thể thao tùy chỉnh *
                    </label>
                    <input
                      type="text"
                      value={newSportForm.customName}
                      onChange={(e) => setNewSportForm({ ...newSportForm, customName: e.target.value })}
                      placeholder="Ví dụ: Cầu mây, Leo núi, Bi lắc..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tự đánh giá trình độ ban đầu */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  2. Tự đánh giá trình độ ban đầu của bạn
                </label>
                <select
                  value={newSportForm.level}
                  onChange={(e) => setNewSportForm({ ...newSportForm, level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  <option value="Mới tập chơi">Mới tập chơi (Căn bản, làm quen môn thể thao)</option>
                  <option value="Mới chơi - Đang tiến bộ">Mới chơi - Đang tiến bộ (Nắm luật, phát bóng tốt)</option>
                  <option value="Trung bình">Trung bình (Giao lưu phong trào ổn định)</option>
                  <option value="Trung bình - Khá">Trung bình - Khá (Đỡ bóng chuẩn, phối hợp nhịp nhàng)</option>
                  <option value="Khá - Đánh chắc tay">Khá - Đánh chắc tay (Chiến thuật tốt, điều bóng khó)</option>
                  <option value="Bán chuyên / Nâng cao">Bán chuyên / Nâng cao (Tập luyện chuyên sâu)</option>
                  <option value="Chuyên nghiệp / Thi đấu giải">Chuyên nghiệp / Thi đấu giải (Vận động viên thi đấu)</option>
                </select>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>
                  💡 Trình độ tự đánh giá ban đầu này sẽ hiển thị trên thẻ hồ sơ của bạn và làm mốc ghép kèo. Bạn có thể tự cập nhật lại bất kỳ khi nào trình độ được nâng cao.
                </p>
              </div>

              {/* Số trận thi đấu trước đây (Tùy chọn) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  3. Số trận đã chơi / kinh nghiệm giao lưu (Tùy chọn)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewSportForm((prev) => ({
                      ...prev,
                      matches: Math.max(0, (parseInt(prev.matches, 10) || 0) - 1),
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newSportForm.matches === undefined ? '' : newSportForm.matches}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setNewSportForm((prev) => ({
                        ...prev,
                        matches: val === '' ? '' : parseInt(val, 10),
                      }))
                    }}
                    onBlur={() => {
                      if (newSportForm.matches === '' || isNaN(newSportForm.matches)) {
                        setNewSportForm((prev) => ({ ...prev, matches: 0 }))
                      }
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #15803D',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#15803D',
                      outline: 'none',
                      background: '#F0FDF4',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setNewSportForm((prev) => ({
                      ...prev,
                      matches: (parseInt(prev.matches, 10) || 0) + 1,
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280', marginRight: '4px' }}>Cộng nhanh:</span>
                  {[1, 5, 10].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setNewSportForm((prev) => ({
                        ...prev,
                        matches: (parseInt(prev.matches, 10) || 0) + inc,
                      }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #BBF7D0',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewSportForm((prev) => ({ ...prev, matches: 0 }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: '#6B7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    Đặt về 0
                  </button>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  💡 Bạn có thể nhập trực tiếp số trận từ bàn phím hoặc dùng các nút tăng/giảm ở hai bên.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddSportModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewSport}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                }}
              >
                Thêm môn thể thao &amp; Lưu trình độ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL XEM TẤT CẢ ĐÁNH GIÁ */}
      {showAllReviewsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '680px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Tất cả đánh giá từ người chơi ({reviewsList.length})
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  100% đánh giá xác thực bằng chữ &amp; sao sau khi check-out sân SportNexus
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllReviewsModal(false)
                    setShowWriteReviewModal(true)
                  }}
                  style={{
                    background: '#15803D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    rate_review
                  </span>
                  Viết đánh giá
                </button>

                <button
                  onClick={() => setShowAllReviewsModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Danh sách các review */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviewsList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: '16px',
                    padding: '14px 16px',
                    background: '#FAFCFA',
                    border: '1px solid rgba(45, 95, 63, 0.1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: item.avatarBg,
                          color: item.avatarColor,
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.avatarInitial}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{item.author}</span>
                          {item.coPlayerRole && (
                            <span style={{ fontSize: '10.5px', background: '#F3F4F6', color: '#6B7280', padding: '1px 5px', borderRadius: '4px' }}>
                              {item.coPlayerRole}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          {item.matchType} • {item.court} • {item.time}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          border: '1px solid #86EFAC',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                          check_circle
                        </span>
                        Đã check-out cùng sân
                      </span>

                      <div style={{ display: 'flex', color: '#EAB308', fontSize: '13px' }}>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              color: i < Math.floor(item.rating) ? '#EAB308' : '#D1D5DB',
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic', paddingLeft: '4px', borderLeft: '3px solid #15803D' }}>
                    “{item.content}”
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#15803D',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3B. MODAL VIẾT ĐÁNH GIÁ SAU TRẬN (CHỈ DÀNH CHO BẠN CHƠI CÙNG SÂN SAU KHI CHECK-OUT THÀNH CÔNG) */}
      {showWriteReviewModal && (() => {
        const session = checkoutSession || defaultCheckoutSession
        const isEligible = Boolean(session && session.checkOutDone)

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.5)',
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
                maxWidth: '560px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                border: '1px solid rgba(45, 95, 63, 0.15)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      rate_review
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                      Đánh giá sau trận đấu
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                      Chỉ mở sau khi hoàn tất check-out tại sân thi đấu
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {!isEligible ? (
                /* TH1: CHƯA CHECK-OUT THÀNH CÔNG -> KHÓA ĐÁNH GIÁ */
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                      lock
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>
                    Chưa đủ điều kiện đánh giá sau trận
                  </h4>

                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#4B5563', lineHeight: 1.6 }}>
                    Theo quy chuẩn minh bạch của SportNexus: Người chơi <strong>chỉ được phép đánh giá bằng hình thức viết nhận xét và chấm điểm sao cho người chơi cùng sân sau khi đã check-out thành công</strong>.
                  </p>

                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '16px',
                      padding: '14px',
                      marginBottom: '20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: '#475569',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#15803D' }}>
                        verified
                      </span>
                      Lợi ích của cơ chế xác thực check-out:
                    </div>
                    <div>• Ngăn chặn 100% đánh giá ảo, spam điểm danh dự</div>
                    <div>• Đảm bảo 2 bên thực sự đã chơi cùng nhau trên sân</div>
                    <div>• Bảo vệ quỹ ký quỹ Escrow và xếp hạng công bằng</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWriteReviewModal(false)
                        navigate('/check-in')
                      }}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '12px',
                        background: '#15803D',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        qr_code_scanner
                      </span>
                      Đi đến trang Check-in / Check-out sân
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSimulateCheckout()
                        // Re-trigger re-render
                        setShowWriteReviewModal(false)
                        setTimeout(() => setShowWriteReviewModal(true), 200)
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        background: '#F0FDF4',
                        color: '#15803D',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        border: '1px dashed #16A34A',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        bolt
                      </span>
                      Mô phỏng Check-out thành công ngay (Dùng thử)
                    </button>
                  </div>
                </div>
              ) : (
                /* TH2: ĐÃ CHECK-OUT THÀNH CÔNG -> MỞ FORM ĐÁNH GIÁ CHI TIẾT */
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Verified Session Info */}
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12.5px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#15803D' }}>
                          task_alt
                        </span>
                        Đã Check-out thành công • {session?.courtId || 'Court 3'}
                      </div>
                      <div style={{ color: '#15803D', fontSize: '11.5px', marginTop: '2px' }}>
                        {session?.courtName || 'Sân Cầu Lông BWF Pro 01'} (Lúc {session?.checkOutTime || '19:35'})
                      </div>
                    </div>
                    <span
                      style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        border: '1px solid #86EFAC',
                        borderRadius: '8px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      Đủ điều kiện
                    </span>
                  </div>

                  {/* 1. CHỌN NGƯỜI CHƠI CÙNG SÂN & THÊM BẠN ĐÁNH ĐÔI */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        1. Chọn người chơi cần đánh giá ({checkoutCoPlayers.length} người trong trận):
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddDoublesPartnerForm(!showAddDoublesPartnerForm)}
                        style={{
                          background: showAddDoublesPartnerForm ? '#FEE2E2' : '#F0FDF4',
                          border: showAddDoublesPartnerForm ? '1px solid #FCA5A5' : '1px dashed #16A34A',
                          color: showAddDoublesPartnerForm ? '#DC2626' : '#15803D',
                          borderRadius: '10px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                          {showAddDoublesPartnerForm ? 'close' : 'person_add'}
                        </span>
                        <span>{showAddDoublesPartnerForm ? 'Đóng form thêm' : '+ Thêm bạn đánh đôi (Đi cùng đại diện)'}</span>
                      </button>
                    </div>

                    {/* Form thêm bạn đánh đôi đi cùng (Trường hợp 1 người đại diện đăng ký slot) */}
                    {showAddDoublesPartnerForm && (
                      <div
                        style={{
                          background: '#FFFBEB',
                          border: '1.5px dashed #F59E0B',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          marginBottom: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>🏸</span>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                            Thêm người chơi đánh đôi cùng trận (Chưa có tài khoản slot)
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#B45309', lineHeight: 1.4 }}>
                          Áp dụng cho trận đánh đôi khi 1 người đại diện đứng ra đăng ký slot và dẫn bạn cặp đi cùng. Bạn có thể thêm bạn đánh cùng vào đây để viết nhận xét và chấm sao.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>
                              Họ tên / Biệt danh bạn đánh đôi *
                            </label>
                            <input
                              type="text"
                              value={doublesPartnerForm.name}
                              onChange={(e) => setDoublesPartnerForm({ ...doublesPartnerForm, name: e.target.value })}
                              placeholder="Ví dụ: Minh Tuấn, Bạn cặp của Nam..."
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid #FCD34D',
                                fontSize: '13px',
                                outline: 'none',
                                background: '#FFFFFF',
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>
                              Vai trò trong trận đấu
                            </label>
                            <select
                              value={doublesPartnerForm.role}
                              onChange={(e) => setDoublesPartnerForm({ ...doublesPartnerForm, role: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid #FCD34D',
                                fontSize: '13px',
                                outline: 'none',
                                background: '#FFFFFF',
                              }}
                            >
                              <option value="Đồng đội đánh cặp">Đồng đội đánh cặp (Team bạn)</option>
                              <option value="Đối thủ đánh đôi">Đối thủ đánh đôi (Team đối phương)</option>
                              <option value="Bạn giao lưu cùng sân">Bạn giao lưu cùng sân</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>
                              Đi cùng người đại diện slot
                            </label>
                            <select
                              value={doublesPartnerForm.representedBy}
                              onChange={(e) => setDoublesPartnerForm({ ...doublesPartnerForm, representedBy: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid #FCD34D',
                                fontSize: '13px',
                                outline: 'none',
                                background: '#FFFFFF',
                              }}
                            >
                              {checkoutCoPlayers.filter(p => !p.isDoublesGuest).map((p) => (
                                <option key={p.id} value={p.name}>
                                  Đi cùng: {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setShowAddDoublesPartnerForm(false)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              background: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#6B7280',
                              cursor: 'pointer',
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleAddDoublesPartner}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                              color: '#FFFFFF',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
                            }}
                          >
                            Xác nhận thêm &amp; Chọn đánh giá ngay
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Danh sách người chơi trong trận (gồm người đăng ký và người đánh đôi đi cùng) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                      {checkoutCoPlayers.map((cp) => {
                        const isSelected = writeReviewForm.targetPlayer === cp.name
                        return (
                          <div
                            key={cp.id}
                            onClick={() => setWriteReviewForm({ ...writeReviewForm, targetPlayer: cp.name })}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #15803D' : '1px solid #E5E7EB',
                              background: isSelected ? '#F0FDF4' : cp.isDoublesGuest ? '#FFFDF5' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                              transition: 'all 0.15s',
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '9px',
                                  background: isSelected ? '#15803D' : cp.isDoublesGuest ? '#FEF3C7' : '#E0F2FE',
                                  color: isSelected ? '#FFFFFF' : cp.isDoublesGuest ? '#D97706' : '#0369A1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  flexShrink: 0,
                                }}
                              >
                                {cp.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {cp.name}
                                </div>
                                <div style={{ fontSize: '10.5px', color: cp.isDoublesGuest ? '#B45309' : '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {cp.isDoublesGuest ? `Đánh đôi • ${cp.representedBy}` : (cp.role || 'Cùng sân')}
                                </div>
                              </div>
                            </div>

                            {/* Nút xóa bạn đánh đôi nếu là người thêm bổ sung */}
                            {cp.isDoublesGuest && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveDoublesPartner(cp.id)
                                }}
                                title="Xóa người chơi đánh đôi này"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#9CA3AF',
                                  padding: '2px',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 2. CHẤM ĐIỂM SAO (1 - 5 SAO) */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        2. Chấm điểm sao (Bắt buộc):
                      </label>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D' }}>
                        {writeReviewForm.rating === 5 && '⭐⭐⭐⭐⭐ Xuất sắc • Tinh thần Fairplay cao'}
                        {writeReviewForm.rating === 4 && '⭐⭐⭐⭐ Rất tốt • Phối hợp ăn ý, hòa nhã'}
                        {writeReviewForm.rating === 3 && '⭐⭐⭐ Hài lòng • Trình độ ngang tài'}
                        {writeReviewForm.rating === 2 && '⭐⭐ Cần cải thiện • Trễ giờ hoặc va chạm'}
                        {writeReviewForm.rating === 1 && '⭐ Kém • Tinh thần phi thể thao'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoveredStar || writeReviewForm.rating) >= star
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setWriteReviewForm({ ...writeReviewForm, rating: star })}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '28px',
                              cursor: 'pointer',
                              color: isFilled ? '#EAB308' : '#D1D5DB',
                              transition: 'transform 0.15s, color 0.15s',
                              transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                              padding: '2px',
                            }}
                          >
                            ★
                          </button>
                        )
                      })}
                      <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>
                        {writeReviewForm.rating} / 5 sao
                      </span>
                    </div>
                  </div>

                  {/* 3. VIẾT NHẬN XÉT BẰNG CHỮ (BẮT BUỘC) */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        3. Viết nhận xét chi tiết (Bắt buộc bằng chữ):
                      </label>
                      <span style={{ fontSize: '11px', color: writeReviewForm.content.trim().length >= 10 ? '#15803D' : '#DC2626' }}>
                        {writeReviewForm.content.trim().length}/10 ký tự tối thiểu
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={writeReviewForm.content}
                      onChange={(e) => setWriteReviewForm({ ...writeReviewForm, content: e.target.value })}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        padding: '12px 14px',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical',
                        background: '#FFFFFF',
                      }}
                    />

                    {/* Quick suggestion tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Gợi ý nhanh:</span>
                      {[
                        'Đúng giờ ⏱️',
                        'Fairplay tuyệt đối ⭐',
                        'Kỹ thuật phong cầu tốt 🏸',
                        'Phối hợp ăn ý 🤝',
                        'Vui vẻ, nhiệt tình 😊',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const cur = writeReviewForm.content
                            const updated = cur ? `${cur}. ${tag}` : tag
                            setWriteReviewForm({ ...writeReviewForm, content: updated })
                          }}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setShowWriteReviewModal(false)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        background: '#FFFFFF',
                        color: '#4B5563',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={writeReviewForm.content.trim().length < 10}
                      style={{
                        padding: '9px 22px',
                        borderRadius: '12px',
                        border: 'none',
                        background: writeReviewForm.content.trim().length >= 10
                          ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)'
                          : '#D1D5DB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: writeReviewForm.content.trim().length >= 10 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: writeReviewForm.content.trim().length >= 10 ? '0 3px 10px rgba(21, 128, 61, 0.3)' : 'none',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        send
                      </span>
                      Gửi đánh giá xác thực
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      })()}

      {/* 4. MODAL LỊCH SỬ TRẬN ĐẤU */}
      {showMatchesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '620px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Lịch sử thi đấu ({profile.matchesPlayed} trận)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Ghi nhận tự động từ Check-in QR &amp; Ghép trận SportNexus
                </p>
              </div>
              <button
                onClick={() => setShowMatchesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  id: 1,
                  sport: 'Cầu lông',
                  opponent: 'Lê Nam & Tuấn Kiệt',
                  court: 'Sân Q7 (Sân số 3)',
                  score: '21 - 18, 21 - 15',
                  result: 'Thắng',
                  date: 'Hôm qua, 18:30',
                },
                {
                  id: 2,
                  sport: 'Pickleball',
                  opponent: 'Trần Hùng & Bảo Long',
                  court: 'Sân Nam Sài Gòn (Sân 2)',
                  score: '11 - 8, 11 - 9',
                  result: 'Thắng',
                  date: '03/10/2026, 19:00',
                },
                {
                  id: 3,
                  sport: 'Cầu lông',
                  opponent: 'Đặng Tuấn (Khá)',
                  court: 'Sân Tân Phong Q7',
                  score: '19 - 21, 20 - 22',
                  result: 'Thua',
                  date: '28/09/2026, 20:00',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: m.result === 'Thắng' ? '#DCFCE7' : '#FEE2E2',
                          color: m.result === 'Thắng' ? '#15803D' : '#DC2626',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '8px',
                        }}
                      >
                        {m.result}
                      </span>
                      <strong style={{ fontSize: '14px', color: '#1F2937' }}>
                        {m.sport}: {m.opponent}
                      </strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      {m.court} • {m.date}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1C3524' }}>
                      {m.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowMatchesModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#15803D',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL SÂN YÊU THÍCH */}
      {showFavoriteCourtsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Danh sách sân yêu thích (5 địa điểm)
              </h3>
              <button
                onClick={() => setShowFavoriteCourtsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {favoriteCourts.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: '#FAFCFA',
                    border: '1px solid rgba(45, 95, 63, 0.12)',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>
                      {c.name}
                    </h4>
                    <p style={{ margin: '3px 0', fontSize: '12px', color: '#6B7280' }}>
                      {c.address}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#15803D', fontWeight: 600 }}>
                      <span>🏸 {c.sport}</span>
                      <span>•</span>
                      <span>⭐ {c.rating}</span>
                      <span>•</span>
                      <span>{c.courtsCount}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowFavoriteCourtsModal(false)
                      navigate('/court-finder')
                    }}
                    style={{
                      background: '#15803D',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Đặt sân
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowFavoriteCourtsModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#6B7280',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CÀI ĐẶT THÔNG BÁO */}
      {showNotificationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Cài đặt thông báo SportNexus
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Kèo ghép trận LFG phù hợp trình độ', desc: 'Nhận thông báo khi có kèo cùng quận & rank ngang bằng' },
                { title: 'Nhắc lịch đặt sân & Check-in QR', desc: 'Báo trước 60 phút và 15 phút trước giờ bóng lăn' },
                { title: 'Biến động số dư ví Escrow', desc: 'Thông báo khi nạp tiền, hoàn tiền cọc, giải ngân cọc sân' },
                { title: 'Đánh giá & Xếp hạng sau trận', desc: 'Nhận thông báo khi đối thủ hoặc đồng đội chấm điểm' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <div style={{ maxWidth: '320px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#15803D',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowNotificationModal(false)
                  triggerToast('✅ Đã lưu cài đặt thông báo!')
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL TRUNG TÂM HỖ TRỢ */}
      {showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Trung tâm trợ giúp SportNexus
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#374151' }}>
              <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '12px' }}>
                <strong>📞 Hotline khẩn cấp 24/7:</strong> 1900 8899 (Hỗ trợ khiếu nại cọc sân, sự cố giờ chơi)
              </div>
              <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '12px' }}>
                <strong>💬 Trợ lý AI Concierge:</strong> Nhấn nút robot góc dưới bên phải màn hình để được giải đáp tức thì.
              </div>
              <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '12px' }}>
                <strong>📧 Email tiếp nhận tranh chấp:</strong> support@sportnexus.vn
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  background: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL XÁC NHẬN ĐĂNG XUẤT */}
      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
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
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                logout
              </span>
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
              Xác nhận đăng xuất?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#6B7280', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>{profile.name}</strong> không?
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false)
                  navigate('/login')
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style CSS Responsive nhúng */}
      <style>{`
        @media (max-width: 1024px) {
          .profile-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
