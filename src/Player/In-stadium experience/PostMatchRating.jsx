import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function PostMatchRating() {
  const navigate = useNavigate()

  // Lấy dữ liệu phiên check-out gần nhất từ localStorage
  const [checkoutSession, setCheckoutSession] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_last_checkout_session')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error(e)
    }
    // Mặc định kiểm tra nếu chưa có
    return null
  })

  // Danh sách người chơi cùng sân
  const defaultCoPlayers = [
    {
      id: 'p1',
      name: 'Hoàng Nam',
      email: 'hoang.nam.badminton@gmail.com',
      role: 'Đồng đội đánh cặp',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      level: 'Khá (BWF Grade B)',
    },
    {
      id: 'p2',
      name: 'Đức Trần',
      email: 'duc_tran92@outlook.com',
      role: 'Đối thủ cùng sân',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      level: 'Trung bình - Khá',
    },
    {
      id: 'p3',
      name: 'Tuấn Kiệt',
      email: 'tuankiet.sports@gmail.com',
      role: 'Đối thủ cùng sân',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
      level: 'Khá',
    },
  ]

  const coPlayers =
    checkoutSession && checkoutSession.coPlayers && checkoutSession.coPlayers.length > 0
      ? checkoutSession.coPlayers
      : defaultCoPlayers

  // Người chơi đang chọn để đánh giá
  const [selectedPlayerId, setSelectedPlayerId] = useState(coPlayers[0]?.id || 'p1')

  // Đánh giá: Chấm điểm sao (1 đến 5 sao)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)

  // Đánh giá: Hình thức viết nhận xét (bắt buộc)
  const [writtenReview, setWrittenReview] = useState('')

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState(null)

  // Danh sách ID người chơi đã được đánh giá trong phiên này
  const [reviewedPlayers, setReviewedPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('player_match_reviewed_ids')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return []
  })

  // Đánh giá đã gửi trong hệ thống
  const [submittedReviews, setSubmittedReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('player_match_reviews')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return []
  })

  // Cập nhật session nếu có sự kiện storage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('sportnexus_last_checkout_session')
        if (saved) {
          setCheckoutSession(JSON.parse(saved))
        }
      } catch (e) {}
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Mô phỏng Check-out nhanh nếu người dùng đang ở trạng thái chưa check-out
  const handleSimulateCheckout = () => {
    const session = {
      courtId: 'Court 3',
      courtName: 'Sân Cầu Lông BWF Pro 01',
      sport: 'Cầu lông',
      checkInDone: true,
      checkInTime: '18:00',
      checkOutDone: true,
      checkOutTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      coPlayers: defaultCoPlayers,
    }
    localStorage.setItem('sportnexus_last_checkout_session', JSON.stringify(session))
    setCheckoutSession(session)
    triggerToast('✅ Check-out thành công! Bây giờ bạn có thể viết nhận xét và chấm sao cho bạn chơi cùng sân.')
  }

  const selectedPlayer = coPlayers.find((p) => p.id === selectedPlayerId) || coPlayers[0]
  const isAlreadyReviewed = reviewedPlayers.includes(selectedPlayerId)

  // Quick suggestion tags để chèn vào phần viết nhận xét
  const quickTags = [
    'Thái độ rất fairplay & hòa nhã 🤝',
    'Kỹ thuật tốt, di chuyển bọc lót xuất sắc 🏸',
    'Đúng giờ và chia tiền sân nhanh chóng ⏱️',
    'Phối hợp ăn ý, tinh thần đồng đội cao ✨',
    'Giao lưu vui vẻ, tôn trọng quyết định trọng tài 🏆',
  ]

  const handleAddTag = (tag) => {
    setWrittenReview((prev) => {
      if (!prev.trim()) return tag
      return `${prev}. ${tag}`
    })
  }

  // Xử lý gửi đánh giá sau trận
  const handleSubmitRating = (e) => {
    e.preventDefault()

    // 1. Kiểm tra điều kiện check-out thành công
    if (!checkoutSession || !checkoutSession.checkOutDone) {
      triggerToast('⚠️ Người chơi chỉ được phép đánh giá sau khi check-out thành công!')
      return
    }

    // 2. Kiểm tra hình thức chấm điểm sao (1 - 5 sao)
    if (!rating || rating < 1 || rating > 5) {
      triggerToast('⚠️ Vui lòng chấm điểm sao từ 1 đến 5 sao!')
      return
    }

    // 3. Kiểm tra hình thức viết nhận xét (bắt buộc, tối thiểu 10 ký tự)
    if (!writtenReview || writtenReview.trim().length < 10) {
      triggerToast('⚠️ Vui lòng viết nhận xét bằng chữ (tối thiểu 10 ký tự) cho người chơi cùng sân!')
      return
    }

    const newReview = {
      id: Date.now(),
      author: 'Bạn (Người chơi cùng sân)',
      targetPlayer: selectedPlayer.name,
      coPlayerRole: selectedPlayer.role || 'Bạn chơi cùng sân',
      avatarInitial: selectedPlayer.name.slice(0, 2).toUpperCase(),
      avatarBg: '#DCFCE7',
      avatarColor: '#15803D',
      matchType: `Kèo ${checkoutSession.sport || 'Cầu lông'}`,
      court: `${checkoutSession.courtName || 'Sân Cầu Lông BWF Pro 01'} (${checkoutSession.courtId || 'Court 3'})`,
      time: 'Vừa xong',
      rating: rating,
      content: writtenReview.trim(),
      verifiedCheckout: true,
      checkoutTime: checkoutSession.checkOutTime || '19:30',
    }

    // Cập nhật danh sách reviews trong localStorage
    const updatedReviews = [newReview, ...submittedReviews]
    setSubmittedReviews(updatedReviews)
    localStorage.setItem('player_match_reviews', JSON.stringify(updatedReviews))

    // Lưu danh sách người đã được đánh giá
    const updatedReviewedIds = [...new Set([...reviewedPlayers, selectedPlayerId])]
    setReviewedPlayers(updatedReviewedIds)
    localStorage.setItem('player_match_reviewed_ids', JSON.stringify(updatedReviewedIds))

    // Reset form viết
    setWrittenReview('')
    setRating(5)

    triggerToast(`🎉 Đã gửi đánh giá thành công cho ${selectedPlayer.name}!`)
  }

  // Diễn giải ý nghĩa số sao
  const getStarLabel = (stars) => {
    switch (stars) {
      case 1:
        return '1 sao: Cần cải thiện (Chưa đúng giờ / Thái độ chưa tốt)'
      case 2:
        return '2 sao: Tạm được (Cần nâng cao tinh thần fairplay)'
      case 3:
        return '3 sao: Khá tốt (Chơi đúng luật, giao lưu hòa đồng)'
      case 4:
        return '4 sao: Rất tốt (Kỹ năng ổn định, tinh thần thể thao cao)'
      case 5:
        return '5 sao: Xuất sắc & Fairplay (Tuyệt vời, sẵn sàng tái đấu)'
      default:
        return ''
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        background: '#F8FAFC',
        padding: '28px 36px 60px 36px',
        color: '#111827',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            right: '32px',
            zIndex: 9999,
            background: '#065F46',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(6, 95, 70, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#86EFAC' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <Link to="/dashboard" style={{ color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/check-in" style={{ color: '#15803D', textDecoration: 'none', fontWeight: 600 }}>
            Check-in & Check-out QR
          </Link>
          <span>/</span>
          <span style={{ color: '#1E293B', fontWeight: 700 }}>Đánh Giá Người Chơi Sau Trận</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/profile"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
              person
            </span>
            Xem Đánh Giá Trên Profile
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          padding: '24px 28px',
          boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: '#DCFCE7',
                color: '#15803D',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              HỆ THỐNG FAIRPLAY SPORTNEXUS
            </span>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              Vé #TK-8849 • Sân Cầu Lông BWF Pro 01
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Đánh Giá Sau Trận Đấu Cho Người Chơi Cùng Sân
          </h1>
          <p style={{ fontSize: '13.5px', color: '#4B5563', margin: '6px 0 0 0', fontWeight: 500 }}>
            Quy định: Người chơi chỉ được phép đánh giá bằng hình thức <strong>viết nhận xét</strong> và{' '}
            <strong>chấm điểm sao</strong> cho người chơi cùng sân sau khi <strong>check-out thành công</strong>.
          </p>
        </div>

        {/* Trạng thái check-out */}
        <div
          style={{
            background: checkoutSession && checkoutSession.checkOutDone ? '#F0FDF4' : '#FEF2F2',
            border:
              checkoutSession && checkoutSession.checkOutDone
                ? '1px solid #BBF7D0'
                : '1px solid #FECACA',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: checkoutSession && checkoutSession.checkOutDone ? '#15803D' : '#DC2626',
            }}
          >
            {checkoutSession && checkoutSession.checkOutDone ? 'verified' : 'lock_clock'}
          </span>
          <div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: checkoutSession && checkoutSession.checkOutDone ? '#166534' : '#991B1B',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              TRẠNG THÁI CHECK-OUT
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: checkoutSession && checkoutSession.checkOutDone ? '#15803D' : '#DC2626',
              }}
            >
              {checkoutSession && checkoutSession.checkOutDone
                ? `Đã check-out (${checkoutSession.checkOutTime || '19:30'}) • Hợp lệ để đánh giá`
                : 'Chưa check-out • Đang khóa đánh giá'}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== TRƯỜNG HỢP 1: CHƯA CHECK-OUT ===================== */}
      {(!checkoutSession || !checkoutSession.checkOutDone) && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1.5px dashed #CBD5E1',
            padding: '48px 32px',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              boxShadow: '0 6px 18px rgba(217, 119, 6, 0.15)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '38px' }}>
              lock_clock
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', margin: '0 0 10px 0' }}>
            Tính Năng Đánh Giá Đang Được Khóa
          </h2>

          <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Theo quy định minh bạch của <strong>SportNexus</strong>, người chơi chỉ được phép đánh giá bằng hình thức{' '}
            <strong>viết nhận xét</strong> và <strong>chấm điểm sao</strong> cho bạn chơi cùng sân{' '}
            <span style={{ color: '#DC2626', fontWeight: 700 }}>sau khi đã check-out thành công</span> khỏi sân đấu.
          </p>

          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left',
              fontSize: '13px',
              color: '#475569',
              lineHeight: 1.55,
            }}
          >
            <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
                info
              </span>
              Vì sao cần hoàn tất Check-out trước khi đánh giá?
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Đảm bảo trận đấu đã kết thúc hoàn toàn và bạn có đủ trải nghiệm với bạn chơi.</li>
              <li>Chống spam đánh giá ảo hoặc gian lận điểm danh tiếng thể thao.</li>
              <li>Bảo đảm tiền cọc ký quỹ Escrow đã được xử lý minh bạch tại cổng sân.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/check-in"
              style={{
                padding: '12px 24px',
                borderRadius: '14px',
                background: '#15803D',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                qr_code_scanner
              </span>
              Đi Đến Trang Check-out Trả Sân
            </Link>

            <button
              type="button"
              onClick={handleSimulateCheckout}
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                background: '#F0FDF4',
                border: '1.5px dashed #16A34A',
                color: '#15803D',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                bolt
              </span>
              Mô phỏng Check-out thành công ngay
            </button>
          </div>
        </div>
      )}

      {/* ===================== TRƯỜNG HỢP 2: ĐÃ CHECK-OUT THÀNH CÔNG ===================== */}
      {checkoutSession && checkoutSession.checkOutDone && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* CỘT TRÁI: DANH SÁCH BẠN CHƠI CÙNG SÂN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '22px',
                boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Bạn Chơi Cùng Sân ({coPlayers.length})
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500, marginTop: '2px' }}>
                    Chọn người chơi để viết nhận xét và chấm sao
                  </div>
                </div>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  ✓ Cùng sân đấu
                </span>
              </div>

              {/* Danh sách người chơi cùng sân */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {coPlayers.map((player) => {
                  const isSelected = player.id === selectedPlayerId
                  const isReviewed = reviewedPlayers.includes(player.id)

                  return (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        background: isSelected ? '#F0FDF4' : '#F8FAFC',
                        border: isSelected ? '2px solid #16A34A' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: '#E2E8F0',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                            border: isSelected ? '2px solid #16A34A' : '1px solid #CBD5E1',
                          }}
                        >
                          <img
                            src={
                              player.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=DCFCE7&color=15803D`
                            }
                            alt={player.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                            {player.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                            {player.role || 'Bạn chơi cùng sân'} • {player.email ? player.email.split('@')[0] : ''}
                          </div>
                        </div>
                      </div>

                      {/* Trạng thái đã đánh giá */}
                      <div>
                        {isReviewed ? (
                          <span
                            style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                              check
                            </span>
                            Đã đánh giá
                          </span>
                        ) : (
                          <span
                            style={{
                              background: isSelected ? '#DCFCE7' : '#F1F5F9',
                              color: isSelected ? '#15803D' : '#64748B',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '8px',
                            }}
                          >
                            {isSelected ? 'Đang chọn' : 'Đánh giá'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hộp cam kết quy chuẩn */}
            <div
              style={{
                background: '#ECFDF5',
                borderRadius: '16px',
                border: '1px solid #A7F3D0',
                padding: '16px 18px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#059669', flexShrink: 0, marginTop: '2px' }}>
                policy
              </span>
              <div style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, marginBottom: '2px' }}>Quy chuẩn đánh giá văn minh</div>
                Chỉ đánh giá khách quan dựa trên tinh thần thi đấu, sự trung thực và fairplay trong trận đấu vừa qua.
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐÁNH GIÁ (CHẤM SAO + VIẾT NHẬN XÉT) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '28px',
              boxShadow: '0 2px 14px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Header Form */}
            <div
              style={{
                paddingBottom: '20px',
                borderBottom: '1px solid #F1F5F9',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                  }}
                >
                  {selectedPlayer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#111827', margin: 0 }}>
                      Đánh Giá: {selectedPlayer.name}
                    </h2>
                    <span
                      style={{
                        background: '#E0F2FE',
                        color: '#0284C7',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {selectedPlayer.role || 'Cùng sân'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    {checkoutSession.courtName} • {checkoutSession.courtId} • Check-out lúc {checkoutSession.checkOutTime}
                  </div>
                </div>
              </div>

              {isAlreadyReviewed && (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    task_alt
                  </span>
                  Bạn đã gửi đánh giá cho người chơi này
                </div>
              )}
            </div>

            {/* BẮT ĐẦU FORM */}
            <form onSubmit={handleSubmitRating}>
              {/* PHẦN 1: CHẤM ĐIỂM SAO */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  marginBottom: '22px',
                  textAlign: 'center',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '10px',
                  }}
                >
                  1. Chấm Điểm Sao Cho Bạn Chơi Cùng Sân (Bắt buộc)
                </label>

                {/* Dãy sao tương tác */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating)
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          outline: 'none',
                          transform: isFilled ? 'scale(1.12)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                        title={`${star} sao`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '44px',
                            color: isFilled ? '#EAB308' : '#CBD5E1',
                            fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0",
                            transition: 'color 0.15s ease',
                          }}
                        >
                          star
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Nhãn mô tả số sao */}
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: rating >= 4 ? '#15803D' : rating === 3 ? '#D97706' : '#DC2626',
                  }}
                >
                  {getStarLabel(hoverRating || rating)}
                </div>
              </div>

              {/* PHẦN 2: VIẾT NHẬN XÉT BẰNG CHỮ */}
              <div style={{ marginBottom: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>2. Viết Nhận Xét Đánh Giá (Bắt buộc)</span>
                    <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <span
                    style={{
                      fontSize: '12px',
                      color: writtenReview.trim().length >= 10 ? '#15803D' : '#94A3B8',
                      fontWeight: 600,
                    }}
                  >
                    {writtenReview.trim().length}/10 ký tự tối thiểu
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={writtenReview}
                  onChange={(e) => setWrittenReview(e.target.value)}
                  placeholder={`Hãy viết vài dòng cảm nhận chân thực về ${selectedPlayer.name} (ví dụ: tinh thần thể thao, sự đúng giờ, khả năng phối hợp cùng sân, thái độ hòa nhã)...`}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border:
                      writtenReview.trim().length > 0 && writtenReview.trim().length < 10
                        ? '1.5px solid #F87171'
                        : '1.5px solid #CBD5E1',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: '#1E293B',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    background: '#FAFAFA',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16A34A'
                    e.target.style.background = '#ffffff'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#FAFAFA'
                  }}
                />

                {/* Gợi ý mẫu câu nhanh */}
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      marginBottom: '6px',
                    }}
                  >
                    GỢI Ý NHẬN XÉT NHANH (NHẤP ĐỂ CHÈN):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {quickTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#DCFCE7'
                          e.currentTarget.style.color = '#15803D'
                          e.currentTarget.style.borderColor = '#86EFAC'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F1F5F9'
                          e.currentTarget.style.color = '#334155'
                          e.currentTarget.style.borderColor = '#E2E8F0'
                        }}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#15803D' }}>
                    verified_user
                  </span>
                  Đánh giá có huy hiệu xác thực <strong>✓ Đã check-out cùng sân</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: '#F1F5F9',
                      border: 'none',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Bỏ qua / Về Dashboard
                  </button>

                  <button
                    type="submit"
                    disabled={writtenReview.trim().length < 10}
                    style={{
                      padding: '11px 24px',
                      borderRadius: '12px',
                      background:
                        writtenReview.trim().length >= 10
                          ? 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)'
                          : '#CBD5E1',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: writtenReview.trim().length >= 10 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow:
                        writtenReview.trim().length >= 10
                          ? '0 4px 14px rgba(22, 163, 74, 0.25)'
                          : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      send
                    </span>
                    Gửi Đánh Giá Sau Trận
                  </button>
                </div>
              </div>
            </form>

            {/* DANH SÁCH CÁC ĐÁNH GIÁ ĐÃ GỬI TRONG PHIÊN NÀY */}
            {submittedReviews.length > 0 && (
              <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                  Đánh Giá Đã Gửi Gần Đây ({submittedReviews.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {submittedReviews.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                            Đánh giá: {item.targetPlayer || 'Người chơi'}
                          </span>
                          <span
                            style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '6px',
                            }}
                          >
                            ✓ Check-out cùng sân
                          </span>
                        </div>

                        {/* Điểm sao */}
                        <div style={{ color: '#EAB308', fontSize: '12px' }}>
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic', lineHeight: 1.45 }}>
                        "{item.content}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostMatchRating
