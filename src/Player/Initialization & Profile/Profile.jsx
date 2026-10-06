import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()

  // State thông tin người chơi - Đồng bộ tên & handle
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('player_profile_data')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        parsed.name = 'Minh Minh Minh'
        parsed.username = '@minhminhminh'
        parsed.location = 'Thủ Đức'
        parsed.bio = 'Bị cầu lông chơi'
        return parsed
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

  // State các môn thể thao & Elo
  const [sportsData, setSportsData] = useState(() => {
    const saved = localStorage.getItem('player_sports_elo')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return [
      {
        id: 'badminton',
        name: 'Cầu lông',
        icon: '🏸',
        elo: 1250,
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
        elo: 980,
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
        elo: 1150,
        level: 'Tiền vệ cánh',
        field: 'Sở trường',
        ranked: true,
        matches: 4,
        winRate: '75%',
        color: '#D97706',
        bgColor: '#FEF3C7',
      },
      {
        id: 'tennis',
        name: 'Quần vợt (Tennis)',
        icon: '🎾',
        elo: null,
        level: 'Chưa có dữ liệu thi đấu',
        field: 'Trạng thái',
        ranked: false,
        matches: 0,
        winRate: '0%',
        color: '#6B7280',
        bgColor: '#F3F4F6',
      },
    ]
  })

  // Lưu profile khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_profile_data', JSON.stringify(profile))
  }, [profile])

  // Lưu sportsData khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_sports_elo', JSON.stringify(sportsData))
  }, [sportsData])

  // Trạng thái các Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEloModal, setShowEloModal] = useState(false)
  const [selectedSportToEdit, setSelectedSportToEdit] = useState(null)
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false)
  const [showMatchesModal, setShowMatchesModal] = useState(false)
  const [showFavoriteCourtsModal, setShowFavoriteCourtsModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Form edit profile tạm thời
  const [editForm, setEditForm] = useState({ ...profile })

  // Form cập nhật Elo
  const [eloForm, setEloForm] = useState({
    elo: 1200,
    level: 'Trung bình - Khá',
  })

  // Toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Danh sách đánh giá
  const reviewsList = [
    {
      id: 1,
      author: 'Lê Nam',
      avatarInitial: 'LN',
      avatarBg: '#DCFCE7',
      avatarColor: '#15803D',
      matchType: 'Kèo Cầu lông',
      court: 'Sân Q7',
      time: '2 ngày trước',
      rating: 5,
      content:
        'Đánh cầu rất chuẩn và vui tính! Lên lưới chắc tay, giao lưu cực kỳ thoải mái.',
    },
    {
      id: 2,
      author: 'Trần Hùng',
      avatarInitial: 'TH',
      avatarBg: '#E0F2FE',
      avatarColor: '#0284C7',
      matchType: 'Kèo Pickleball',
      court: 'Sân Nam Sài Gòn',
      time: '5 ngày trước',
      rating: 5,
      content:
        'Đúng giờ, tinh thần thể thao tuyệt vời. Luôn chủ động chia tiền sân sòng phẳng.',
    },
    {
      id: 3,
      author: 'Hoàng Anh Tuấn',
      avatarInitial: 'AT',
      avatarBg: '#FEF3C7',
      avatarColor: '#B45309',
      matchType: 'Kèo Cầu lông',
      court: 'Sân Hoàng Vy Q8',
      time: '1 tuần trước',
      rating: 5,
      content:
        'Kỹ thuật phong cầu và đập cầu rất chuẩn mực. Rất mong được tiếp tục giao lưu ở các giải phong trào tới!',
    },
    {
      id: 4,
      author: 'Võ Minh Đạt',
      avatarInitial: 'MĐ',
      avatarBg: '#F3E8FF',
      avatarColor: '#7E22CE',
      matchType: 'Kèo Bóng đá',
      court: 'Sân Cỏ Nhân Tạo Kênh Tẻ',
      time: '2 tuần trước',
      rating: 4.8,
      content:
        'Đá bóng nhiệt huyết, tôn trọng đối thủ và đồng đội. Chuyền bóng sắc bén, rất kỷ luật!',
    },
  ]

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

  // Mở modal cập nhật Elo
  const handleOpenEloModal = (sport) => {
    setSelectedSportToEdit(sport)
    setEloForm({
      elo: sport.elo || 1000,
      level: sport.level.includes('Chưa có') ? 'Mới tập chơi' : sport.level,
    })
    setShowEloModal(true)
  }

  // Lưu Elo
  const handleSaveElo = () => {
    if (!selectedSportToEdit) return
    setSportsData((prev) =>
      prev.map((s) => {
        if (s.id === selectedSportToEdit.id) {
          return {
            ...s,
            elo: Number(eloForm.elo),
            level: eloForm.level,
            field: 'Trình độ',
            ranked: true,
          }
        }
        return s
      })
    )
    setShowEloModal(false)
    triggerToast(
      `🎉 Đã cập nhật thành công trình độ ${selectedSportToEdit.name} (Elo: ${eloForm.elo})!`
    )
  }

  // Lưu Form Edit Profile
  const handleSaveProfile = () => {
    setProfile({ ...editForm })
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
              Định danh vận động viên &amp; Hệ thống Elo chuẩn SportNexus
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
          {/* PHẦN 1: TRÌNH ĐỘ & ĐIỂM ELO */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 8px 24px rgba(45, 95, 63, 0.05)',
            }}
          >
            {/* Header: Icon + Trình độ & Điểm Elo + Badge HỆ THỐNG RANK */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
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
                    Trình độ &amp; Điểm Elo
                  </h2>
                </div>
              </div>
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
                HỆ THỐNG RANK
              </span>
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
                Điểm Elo và tự đánh giá giúp SportNexus đề xuất đối thủ &amp; kèo ghép trận cân bằng nhất.
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
                        {/* Tên môn + Badge Elo */}
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
                          {sport.ranked && sport.elo ? (
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
                              Elo {sport.elo}
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

                        {/* Subtext: Trình độ hoặc Sở trường */}
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          <span>{sport.field}: </span>
                          <strong style={{ color: sport.ranked ? '#1F2937' : '#9CA3AF' }}>
                            {sport.level}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action button */}
                    <div>
                      {isTennis ? (
                        <button
                          onClick={() => handleOpenEloModal(sport)}
                          style={{
                            background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '9px 18px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(21, 128, 61, 0.25)',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        >
                          Đánh giá ngay
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenEloModal(sport)}
                          style={{
                            background: '#FFFFFF',
                            color: '#15803D',
                            border: '1px solid #86EFAC',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#DCFCE7'
                            e.currentTarget.style.borderColor = '#15803D'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.borderColor = '#86EFAC'
                          }}
                        >
                          Cập nhật
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
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
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#15803D' }}>
                  forum
                </span>
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

              <button
                onClick={() => setShowAllReviewsModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803D',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Xem tất cả ({profile.totalReviews})</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Danh sách 2 đánh giá nổi bật */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviewsList.slice(0, 2).map((item) => (
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
                          }}
                        >
                          {item.author}
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

                    <div style={{ display: 'flex', color: '#EAB308', fontSize: '14px', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '13.5px',
                      color: '#374151',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
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

      {/* 2. MODAL CẬP NHẬT ELO & TRÌNH ĐỘ */}
      {showEloModal && selectedSportToEdit && (
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
                  Cập nhật xếp hạng: {selectedSportToEdit.name}
                </h3>
              </div>
              <button
                onClick={() => setShowEloModal(false)}
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
                  Điểm Elo tự đánh giá / Đạt được
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="500"
                    max="3000"
                    value={eloForm.elo}
                    onChange={(e) => setEloForm({ ...eloForm, elo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#15803D',
                      outline: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#6B7280',
                    }}
                  >
                    pts
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#6B7280' }}>
                  Thang điểm chuẩn SportNexus: 800-1100 (Mới chơi), 1100-1400 (Khá), 1400+ (Chuyên/Bán chuyên).
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Mức độ kỹ năng / Sở trường
                </label>
                <select
                  value={eloForm.level}
                  onChange={(e) => setEloForm({ ...eloForm, level: e.target.value })}
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
                  <option value="Mới tập chơi">Mới tập chơi - Căn bản</option>
                  <option value="Mới chơi - Đang tiến bộ">Mới chơi - Đang tiến bộ</option>
                  <option value="Trung bình - Khá">Trung bình - Khá</option>
                  <option value="Khá - Đánh chắc tay">Khá - Đánh chắc tay</option>
                  <option value="Bán chuyên / Thi đấu giải">Bán chuyên / Thi đấu giải</option>
                  <option value="Tiền vệ cánh">Tiền vệ cánh (Bóng đá)</option>
                  <option value="Tiền đạo cắm">Tiền đạo cắm (Bóng đá)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button
                onClick={() => setShowEloModal(false)}
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
                onClick={handleSaveElo}
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
              maxWidth: '650px',
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
                  Tất cả đánh giá từ người chơi ({profile.totalReviews})
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Đánh giá sau khi kết thúc trận qua hệ thống Smart Check-in SportNexus
                </p>
              </div>
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
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                          {item.author}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          {item.matchType} • {item.court} • {item.time}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', color: '#EAB308', fontSize: '13px' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
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
                  eloChange: '+18 Elo',
                  date: 'Hôm qua, 18:30',
                },
                {
                  id: 2,
                  sport: 'Pickleball',
                  opponent: 'Trần Hùng & Bảo Long',
                  court: 'Sân Nam Sài Gòn (Sân 2)',
                  score: '11 - 8, 11 - 9',
                  result: 'Thắng',
                  eloChange: '+14 Elo',
                  date: '03/10/2026, 19:00',
                },
                {
                  id: 3,
                  sport: 'Cầu lông',
                  opponent: 'Đặng Tuấn (Khá)',
                  court: 'Sân Tân Phong Q7',
                  score: '19 - 21, 20 - 22',
                  result: 'Thua',
                  eloChange: '-8 Elo',
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
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: m.result === 'Thắng' ? '#15803D' : '#DC2626',
                      }}
                    >
                      {m.eloChange}
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
                { title: 'Kèo ghép trận LFG phù hợp Elo', desc: 'Nhận thông báo khi có kèo cùng quận & rank ngang bằng' },
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
