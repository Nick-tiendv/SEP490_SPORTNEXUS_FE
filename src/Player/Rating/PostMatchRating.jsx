import { useState, useEffect } from 'react'
import { uid } from '../../utils/ids.js'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { rateFairPlay } from '../../api/player/lfgApi.js'
import {
  getPendingFairPlayRatings,
  checkFacilityReviewEligibility,
  createFacilityReview,
} from '../../api/player/reviewApi.js'

const fmtTime = (v) => (v ? new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '')
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : '')

function PostMatchRating() {
  const navigate = useNavigate()

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState(null)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  /* ------------------- Trận chờ chấm Fair Play (GET /api/v1/fair-play/pending-ratings) ------------------- */
  // Chỉ những trận mình đã check-in, còn trong hạn đánh giá và còn người cùng check-in chưa được mình chấm
  const [pendingRatings, setPendingRatings] = useState([])
  const [loadingPending, setLoadingPending] = useState(true)
  const [searchParams] = useSearchParams()
  // Mở từ trang Check-in QR: ?contextId= chọn sẵn trận đó
  const [selectedContextId, setSelectedContextId] = useState(() => searchParams.get('contextId'))

  useEffect(() => {
    let cancelled = false
    getPendingFairPlayRatings()
      .then((data) => !cancelled && setPendingRatings(Array.isArray(data) ? data : []))
      .catch((err) => !cancelled && triggerToast(`⚠️ ${err?.message || 'Không tải được danh sách trận chờ đánh giá.'}`))
      .finally(() => !cancelled && setLoadingPending(false))
    return () => { cancelled = true }
  }, [])

  const selectedMatch = pendingRatings.find((m) => m.contextId === selectedContextId) || pendingRatings[0] || null
  const checkoutSession = selectedMatch
    ? {
        contextId: selectedMatch.contextId,
        facilityId: selectedMatch.facilityId,
        courtName: [selectedMatch.facilityName, selectedMatch.courtName].filter(Boolean).join(' - '),
        courtId: selectedMatch.sportName || (selectedMatch.contextType === 'LFG' ? 'Kèo LFG' : 'Đặt sân'),
        checkInTime: `${fmtTime(selectedMatch.startTime)} - ${fmtTime(selectedMatch.endTime)}, ${fmtDate(selectedMatch.startTime)}`,
        checkOutTime: `${fmtTime(selectedMatch.endTime)}; hạn chấm ${fmtTime(selectedMatch.ratingDeadline)} ${fmtDate(selectedMatch.ratingDeadline)}`,
      }
    : null
  const coPlayers = (selectedMatch?.players || []).map((u) => ({
    id: u.userId,
    userId: u.userId,
    name: u.fullName,
    avatar: u.avatarUrl,
    role: selectedMatch.contextType === 'LFG' ? 'Thành viên kèo LFG' : 'Người góp tiền cùng sân',
  }))

  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const [reviewedPlayers, setReviewedPlayers] = useState([])

  // Đánh giá: Chấm điểm sao (1 đến 5 sao)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)

  // Đánh giá: Hình thức viết nhận xét (bắt buộc)
  const [writtenReview, setWrittenReview] = useState('')

  // Đánh giá đã gửi trong phiên làm việc này
  const [submittedReviews, setSubmittedReviews] = useState([])

  /* ------------------- Tab Switcher: Người chơi (Fair Play) vs Cơ sở (Facility) ------------------- */
  const [activeRatingTab, setActiveRatingTab] = useState('player') // 'player' | 'facility'

  /* ------------------- Đánh giá cơ sở thể thao (cơ sở của trận đang chọn) ------------------- */
  const currentFacilityId = selectedMatch?.facilityId || null
  const currentFacilityName = selectedMatch?.facilityName || 'Chưa có trận đã check-in'
  const [facilityRating, setFacilityRating] = useState(5)
  const [facilityHoverRating, setFacilityHoverRating] = useState(0)
  const [facilityComment, setFacilityComment] = useState('')
  // Kết quả kiểm tra gắn với facilityId; đang kiểm tra khi cơ sở hiện tại chưa có kết quả
  const [eligibilityResult, setEligibilityResult] = useState({ facilityId: null, isEligible: false, message: '' })
  const checkingEligibility = Boolean(currentFacilityId) && eligibilityResult.facilityId !== currentFacilityId
  const facilityEligibility = checkingEligibility ? { isEligible: false, message: '' } : eligibilityResult
  const setFacilityEligibility = (value) => setEligibilityResult({ facilityId: currentFacilityId, ...value })
  const [submittingFacilityReview, setSubmittingFacilityReview] = useState(false)
  const [submittedFacilityReviews, setSubmittedFacilityReviews] = useState([])

  // Kiểm tra điều kiện đánh giá cơ sở: GET /api/v1/facility-reviews/eligibility/{facilityId}
  useEffect(() => {
    if (!currentFacilityId) return
    let cancelled = false
    checkFacilityReviewEligibility(currentFacilityId)
      .then((res) => {
        if (!cancelled) setEligibilityResult({ facilityId: currentFacilityId, isEligible: false, message: '', ...res })
      })
      .catch((err) => {
        if (!cancelled) setEligibilityResult({ facilityId: currentFacilityId, isEligible: false, message: err?.message || '' })
      })
    return () => { cancelled = true }
  }, [currentFacilityId])

  // Gửi đánh giá cơ sở: POST /api/v1/facility-reviews
  const handleSubmitFacilityReview = async (e) => {
    if (e) e.preventDefault()
    if (!currentFacilityId) {
      triggerToast('⚠️ Chưa có trận đã check-in để đánh giá cơ sở.')
      return
    }
    if (!facilityRating || facilityRating < 1) {
      triggerToast('⚠️ Vui lòng chọn số sao đánh giá cơ sở (1 - 5 sao)!')
      return
    }
    if (!facilityComment || facilityComment.trim().length < 10) {
      triggerToast('⚠️ Vui lòng viết nhận xét tối thiểu 10 ký tự cho cơ sở!')
      return
    }

    setSubmittingFacilityReview(true)
    try {
      await createFacilityReview({
        facilityId: currentFacilityId,
        rating: facilityRating,
        comment: facilityComment.trim(),
      })
      triggerToast('🎉 Đã gửi đánh giá cơ sở thể thao thành công!')
      setSubmittedFacilityReviews((prev) => [
        {
          id: uid('facility-review'),
          facilityName: currentFacilityName,
          rating: facilityRating,
          comment: facilityComment.trim(),
          createdAt: 'Vừa xong',
        },
        ...prev,
      ])
      setFacilityComment('')
      setFacilityRating(5)
      setFacilityEligibility({ isEligible: false, message: 'Bạn đã đánh giá cơ sở này.' })
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể gửi đánh giá cơ sở'}`)
    } finally {
      setSubmittingFacilityReview(false)
    }
  }

  // Chọn trận từ danh sách Pending Ratings
  const handleSelectPendingRating = (item) => {
    if (!item) return
    setSelectedContextId(item.contextId)
    setSelectedPlayerId(null)
    triggerToast(`Đã chọn trận: ${item.facilityName || ''} ${item.courtName || ''} để chấm điểm!`)
  }

  const isEligibleToRate = Boolean(selectedMatch)
  const selectedPlayer = coPlayers.find((p) => p.id === selectedPlayerId) || coPlayers[0] || { name: '', role: '' }
  const isAlreadyReviewed = reviewedPlayers.includes(`${selectedMatch?.contextId}:${selectedPlayer.id}`)

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

  // Gửi đánh giá Fair Play: POST /api/v1/reviews/fair-play
  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (!isEligibleToRate || !selectedPlayer.id) {
      triggerToast('⚠️ Chỉ được đánh giá người đã cùng check-in trong trận còn hạn chấm điểm!')
      return
    }
    if (!rating || rating < 1 || rating > 5) {
      triggerToast('⚠️ Vui lòng chấm điểm sao từ 1 đến 5 sao!')
      return
    }
    if (!writtenReview || writtenReview.trim().length < 10) {
      triggerToast('⚠️ Vui lòng viết nhận xét bằng chữ (tối thiểu 10 ký tự) cho người chơi cùng sân!')
      return
    }
    if (isAlreadyReviewed) {
      triggerToast('⚠️ Mỗi người chỉ được chấm Fair Play 1 lần cho 1 người trong 1 trận!')
      return
    }

    setIsSubmittingRating(true)
    try {
      await rateFairPlay({
        revieweeId: selectedPlayer.userId,
        contextId: selectedMatch.contextId,
        score: rating,
        comment: writtenReview.trim(),
      })
    } catch (apiErr) {
      triggerToast(`⚠️ ${apiErr?.message || 'Không gửi được đánh giá.'}`)
      setIsSubmittingRating(false)
      return
    }
    setIsSubmittingRating(false)

    setSubmittedReviews((prev) => [
      {
        id: uid('review'),
        author: 'Bạn',
        targetPlayer: selectedPlayer.name,
        coPlayerRole: selectedPlayer.role,
        avatarInitial: selectedPlayer.name.slice(0, 2).toUpperCase(),
        avatarBg: '#DCFCE7',
        avatarColor: '#15803D',
        matchType: checkoutSession.courtId,
        court: checkoutSession.courtName,
        time: 'Vừa xong',
        rating,
        content: writtenReview.trim(),
        verifiedCheckout: true,
      },
      ...prev,
    ])
    setReviewedPlayers((prev) => [...prev, `${selectedMatch.contextId}:${selectedPlayer.id}`])
    setWrittenReview('')
    setRating(5)
    triggerToast(`🎉 Đã chấm Fair Play ${rating} sao cho ${selectedPlayer.name}!`)
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
    <div className="snx-page">
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
      <div className="snx-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="snx-page-eyebrow">
              HỆ THỐNG FAIRPLAY SPORTNEXUS
            </span>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
              {checkoutSession ? `${checkoutSession.courtName} • ${checkoutSession.checkInTime}` : 'Chưa có trận chờ đánh giá'}
            </span>
          </div>
          <h1 className="snx-page-title">
            Đánh Giá Sau Trận Đấu Cho Người Chơi Cùng Sân
          </h1>
          <p className="snx-page-subtitle">
            Quy định: Người chơi chỉ được phép đánh giá bằng hình thức <strong>viết nhận xét</strong> và{' '}
            <strong>chấm điểm sao</strong> cho người chơi cùng sân sau khi <strong style={{ color: '#15803D' }}>check-in thành công</strong>.
          </p>
        </div>

        {/* Trạng thái check-in */}
        <div
          style={{
            background: isEligibleToRate ? '#F0FDF4' : '#FEF2F2',
            border: isEligibleToRate ? '1px solid #BBF7D0' : '1px solid #FECACA',
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
              color: isEligibleToRate ? '#15803D' : '#DC2626',
            }}
          >
            {isEligibleToRate ? 'verified' : 'lock_clock'}
          </span>
          <div>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: isEligibleToRate ? '#166534' : '#991B1B',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              TRẠNG THÁI CHECK-IN
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: isEligibleToRate ? '#15803D' : '#DC2626',
              }}
            >
              {isEligibleToRate
                ? `Đã check-in (${checkoutSession.checkInTime}) • Hợp lệ để đánh giá`
                : 'Chưa check-in • Đang khóa đánh giá'}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BANNER: TRẬN ĐẤU ĐANG CHỜ CHẤM FAIR PLAY (GET /api/v1/fair-play/pending-ratings) ===================== */}
      {loadingPending && (
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280' }}>Đang tải các trận chờ chấm Fair Play…</p>
      )}
      {pendingRatings.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
            border: '1.5px solid #86EFAC',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#15803D',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                sports_score
              </span>
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#14532D' }}>
                Bạn có {pendingRatings.length} trận đấu đang chờ chấm điểm Fair Play!
              </div>
              <div style={{ fontSize: '12px', color: '#166534' }}>
                Chọn trận để chấm điểm người chơi đã cùng check-in. Hoàn thành đánh giá giúp nâng cao uy tín thể thao cộng đồng.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {pendingRatings.slice(0, 4).map((item, idx) => (
              <button
                key={item.contextId || idx}
                type="button"
                onClick={() => handleSelectPendingRating(item)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #86EFAC',
                  color: '#15803D',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{[item.courtName || item.facilityName || `Trận #${idx + 1}`, fmtTime(item.startTime)].filter(Boolean).join(' • ')}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB CHUYỂN ĐỔI: NGƯỜI CHƠI VS CƠ SỞ ===================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveRatingTab('player')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: activeRatingTab === 'player' ? '#15803D' : '#ffffff',
            color: activeRatingTab === 'player' ? '#ffffff' : '#4B5563',
            border: activeRatingTab === 'player' ? 'none' : '1px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            boxShadow: activeRatingTab === 'player' ? '0 4px 12px rgba(21, 128, 61, 0.25)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            sports_handball
          </span>
          Đánh Giá Bạn Chơi Cùng Sân (Fair Play)
        </button>

        <button
          type="button"
          onClick={() => setActiveRatingTab('facility')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: activeRatingTab === 'facility' ? '#15803D' : '#ffffff',
            color: activeRatingTab === 'facility' ? '#ffffff' : '#4B5563',
            border: activeRatingTab === 'facility' ? 'none' : '1px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            boxShadow: activeRatingTab === 'facility' ? '0 4px 12px rgba(21, 128, 61, 0.25)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            stadium
          </span>
          Đánh Giá Chất Lượng Cơ Sở Sân Đấu
        </button>
      </div>

      {/* ===================== TAB 1: ĐÁNH GIÁ NGƯỜI CHƠI (FAIR PLAY) ===================== */}
      {activeRatingTab === 'player' && (
        <>
          {/* ===================== TRƯỜNG HỢP 1: CHƯA CHECK-IN ===================== */}
          {!isEligibleToRate && !loadingPending && (
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
            <span style={{ color: '#15803D', fontWeight: 700 }}>sau khi đã check-in thành công</span> vào sân đấu. Hiện bạn không có trận nào đang chờ chấm điểm.
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
              Vì sao cần hoàn tất Check-in trước khi đánh giá?
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Đảm bảo người chơi đã có mặt thực tế tại sân đấu (Quy định 2.7: Cả hai người phải đã check-in).</li>
              <li>Chống spam đánh giá ảo hoặc gian lận điểm danh tiếng Fair Play thể thao.</li>
              <li>Danh sách bạn chơi lấy từ những người đã cùng check-in; hạn chấm điểm kéo dài sau giờ kết thúc ca.</li>
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
              Đi Đến Trang Check-in QR
            </Link>

          </div>
        </div>
      )}

      {/* ===================== TRƯỜNG HỢP 2: ĐÃ CHECK-IN THÀNH CÔNG ===================== */}
      {isEligibleToRate && (
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Bạn Chơi Cùng Sân ({coPlayers.length})
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500, marginTop: '2px' }}>
                    Đã cùng check-in • Chọn người để đánh giá
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
                  const isSelected = player.id === selectedPlayer.id
                  const isReviewed = reviewedPlayers.includes(`${selectedMatch?.contextId}:${player.id}`)

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
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=${player.isDoublesGuest ? 'FEF3C7&color=D97706' : 'DCFCE7&color=15803D'}`
                            }
                            alt={player.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                              {player.name}
                            </span>
                            {player.isDoublesGuest && (
                              <span
                                style={{
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  fontSize: '9.5px',
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  border: '1px solid #FDE68A',
                                }}
                              >
                                Đánh đôi
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                            {player.isDoublesGuest
                              ? `${player.role} • Đi cùng ${player.representedBy}`
                              : `${player.role || 'Bạn chơi cùng sân'}${player.email ? ` • ${player.email.split('@')[0]}` : ''}`}
                          </div>
                        </div>
                      </div>

                      {/* Trạng thái đã đánh giá */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#111827', margin: 0 }}>
                      Đánh Giá: {selectedPlayer.name}
                    </h2>
                    <span
                      style={{
                        background: selectedPlayer.isDoublesGuest ? '#FEF3C7' : '#E0F2FE',
                        color: selectedPlayer.isDoublesGuest ? '#B45309' : '#0284C7',
                        border: selectedPlayer.isDoublesGuest ? '1px solid #FDE68A' : 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {selectedPlayer.isDoublesGuest
                        ? `🏸 ${selectedPlayer.role} (Đi cùng ${selectedPlayer.representedBy})`
                        : selectedPlayer.role || 'Cùng sân'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                    {checkoutSession.courtName} • {checkoutSession.courtId} • Kết thúc {checkoutSession.checkOutTime}
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

                {/* Fair Play Points Translation Formula - Image 3: Điểm Fair Play = số sao x 20 */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 14px',
                    background: '#ECFDF5',
                    borderRadius: '12px',
                    border: '1px solid #A7F3D0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#065F46',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#059669' }}>
                    verified_user
                  </span>
                  <span>
                    Quy đổi Fair Play: <strong>{rating} sao = +{rating * 20} điểm</strong> (Điểm Fair Play = số sao × 20, thang điểm 0 - 100)
                  </span>
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
                    disabled={writtenReview.trim().length < 10 || isSubmittingRating}
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
        </>
      )}

      {/* ===================== TAB 2: ĐÁNH GIÁ CHẤT LƯỢNG CƠ SỞ SÂN ĐẤU ===================== */}
      {activeRatingTab === 'facility' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            padding: '28px 32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {/* Header Cơ Sở */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '20px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                  stadium
                </span>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                  CƠ SỞ THỂ THAO ĐÃ ĐẶT SÂN
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                  {currentFacilityName}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Sân: <span className="font-semibold">{selectedMatch ? `${selectedMatch.courtName} • ${checkoutSession.checkInTime}` : 'Chọn một trận đã check-in ở trên'}</span>
                </div>
              </div>
            </div>

            {/* Trạng thái Eligibility (GET /api/v1/facility-reviews/eligibility/{facilityId}) */}
            <div
              style={{
                background: facilityEligibility?.isEligible ? '#F0FDF4' : '#FFFBEB',
                border: facilityEligibility?.isEligible ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  color: facilityEligibility?.isEligible ? '#15803D' : '#D97706',
                }}
              >
                {facilityEligibility?.isEligible ? 'verified' : 'info'}
              </span>
              <div style={{ fontSize: '12px', fontWeight: 700, color: facilityEligibility?.isEligible ? '#166534' : '#92400E' }}>
                {checkingEligibility
                  ? 'Đang kiểm tra điều kiện đánh giá...'
                  : facilityEligibility?.isEligible
                  ? 'Đủ điều kiện đánh giá'
                  : facilityEligibility?.message || 'Chưa đủ điều kiện đánh giá cơ sở này'}
              </div>
            </div>
          </div>

          {/* Form đánh giá cơ sở (POST /api/v1/facility-reviews & POST /api/v1/reviews/facility) */}
          <form onSubmit={handleSubmitFacilityReview} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Chấm sao cơ sở */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                1. Chấm điểm chất lượng cơ sở (1 - 5 sao) *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFacilityRating(star)}
                    onMouseEnter={() => setFacilityHoverRating(star)}
                    onMouseLeave={() => setFacilityHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '34px',
                      color: (facilityHoverRating || facilityRating) >= star ? '#EAB308' : '#CBD5E1',
                      transition: 'transform 0.1s',
                    }}
                  >
                    ★
                  </button>
                ))}
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#15803D', marginLeft: '8px' }}>
                  {facilityRating === 5
                    ? '5 sao: Xuất sắc (Sân đẹp, ánh sáng chuẩn, vệ sinh sạch sẽ)'
                    : facilityRating === 4
                    ? '4 sao: Rất tốt (Hài lòng với trải nghiệm)'
                    : facilityRating === 3
                    ? '3 sao: Trung bình (Cần bảo trì sàn hoặc ánh sáng)'
                    : facilityRating === 2
                    ? '2 sao: Kém (Nhiều bất tiện)'
                    : '1 sao: Rất thất vọng'}
                </span>
              </div>
            </div>

            {/* Gợi ý đánh giá nhanh */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                2. Điểm nổi bật của sân (Nhấn để chèn nhanh vào nhận xét)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Mặt thảm chuẩn BWF êm ái, bám tốt 🏸',
                  'Hệ thống đèn LED sáng đều, không chói mắt 💡',
                  'Phòng thay đồ & WC sạch sẽ, tiện nghi 🚿',
                  'Bãi giữ xe rộng rãi, có chỗ đỗ ô tô 🚗',
                  'Nhân viên hỗ trợ nhiệt tình, chuyên nghiệp 🤝',
                  'Nước uống lạnh và khu ngồi nghỉ thoáng mát ❄️',
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setFacilityComment((prev) => (prev.trim() ? `${prev}. ${item}` : item))
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Nhận xét bằng chữ */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                3. Viết cảm nhận chi tiết về sân đấu (Tối thiểu 10 ký tự) *
              </label>
              <textarea
                rows={4}
                value={facilityComment}
                onChange={(e) => setFacilityComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về chất lượng mặt sân, hệ thống chiếu sáng, không gian và thái độ phục vụ..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                <span>Độ dài: {facilityComment.length} ký tự (Tối thiểu 10)</span>
              </div>
            </div>

            {/* Action Submit */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="submit"
                disabled={submittingFacilityReview || facilityComment.trim().length < 10}
                style={{
                  padding: '12px 28px',
                  borderRadius: '14px',
                  background:
                    facilityComment.trim().length >= 10
                      ? 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)'
                      : '#CBD5E1',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: facilityComment.trim().length >= 10 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow:
                    facilityComment.trim().length >= 10 ? '0 4px 14px rgba(22, 163, 74, 0.25)' : 'none',
                }}
              >
                {submittingFacilityReview ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>
                      progress_activity
                    </span>
                    Đang gửi đánh giá...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      rate_review
                    </span>
                    Gửi Đánh Giá Cơ Sở Sân Đấu
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lịch sử đánh giá cơ sở gần đây */}
          {submittedFacilityReviews.length > 0 && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                Đánh Giá Cơ Sở Đã Gửi Của Bạn ({submittedFacilityReviews.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {submittedFacilityReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>{rev.facilityName}</span>
                      <div style={{ color: '#EAB308', fontSize: '14px' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic', margin: 0 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PostMatchRating
