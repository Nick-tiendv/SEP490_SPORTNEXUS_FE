import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getLfgs,
  getLfgById,
  getMyLfgCards,
  getJoinedLfgs,
  claimLfgSlot,
  getLfgQrTicket,
  approveLfgParticipant,
  rejectLfgParticipant,
  removeLfgParticipant,
  cancelLfg,
  leaveLfg,
  getLfgCancelReasons,
  getMyFairPlay,
  updateLfg,
  acceptLfgInvitation,
  declineLfgInvitation,
  removeLfgGroupMember,
  createLfgCancelRequest,
  getLatestLfgCancelRequest,
  voteLfgCancelRequest,
} from '../../api/player/lfgApi.js'
import * as communityApi from '../../api/communityApi.js'
import { getWallet } from '../../api/player/walletApi.js'
import { initialsOf, useCurrentUser } from '../../hooks/useCurrentUser.js'

// Helper to remove any leftover Elo or DUPR/DURP references from match data
const sanitizeMatch = (m) => {
  if (!m) return m
  const clean = (str) => {
    if (!str || typeof str !== 'string') return str
    return str
      .replace(/\s*\((?:Elo|DUPR|DURP)[^)]*\)/gi, '')
      .replace(/\b(?:Elo|DUPR|DURP)\s*[:•\-]?\s*[\d.><+\s-]+/gi, '')
      .replace(/\b(?:Elo|DUPR|DURP)\b/gi, '')
      .replace(/•\s*•/g, '•')
      .replace(/\s*•\s*$/g, '')
      .replace(/^\s*•\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  const cleanedLevel = clean(m.levelTag)
  return {
    ...m,
    title: clean(m.title) || m.title,
    levelTag: cleanedLevel || 'Trung bình - Khá',
    subBadge: clean(m.subBadge) || m.subBadge,
    groupDesc: clean(m.groupDesc) || m.groupDesc,
  }
}


const FEED_IMAGES = {
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop',
  pickleball: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
}
const formatVnd = (n) => `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)} đ`

// Chuyển một thẻ LFG từ backend sang dạng thẻ hiển thị trên bảng tin.
const toFeedMatch = (card) => {
  const sportName = card.sportName || card.sportCategoryName || card.sport || ''
  const sport = /pickle/i.test(sportName) ? 'pickleball' : 'badminton'
  const start = card.startTime ? new Date(card.startTime) : null
  const hour = start ? start.getHours() : 18
  const totalSlots = Number(card.totalSlots) || 0
  const currentSlots = Math.max(0, totalSlots - (Number(card.remainingSlots) || 0))
  const price = Number(card.pricePerPerson ?? card.price ?? 0)
  const roster = Array.from({ length: totalSlots }, (_, i) => {
    const p = (card.participants || [])[i]
    if (i === 0 && !p && card.hostName) return { initials: card.hostName.slice(0, 2).toUpperCase(), bg: '#15803D', name: card.hostName }
    if (p) { const name = p.fullName || p.name || 'Người chơi'; return { initials: name.slice(0, 2).toUpperCase(), bg: '#0D9488', name } }
    return i < currentSlots ? { initials: '•', bg: '#0D9488', name: 'Đã tham gia' } : { initials: '?', bg: 'empty', name: `Slot trống ${i + 1}` }
  })
  return {
    id: card.id || card.cardId,
    sport,
    sportBadge: sportName ? sportName.toUpperCase() : 'KÈO GHÉP',
    subBadge: [card.format, card.requireApproval ? 'Cần chủ kèo duyệt' : 'Tham gia ngay'].filter(Boolean).join(' • '),
    levelTag: card.skillLevelTag || card.skillLevel || 'Mọi trình độ',
    slotTag: `Cần ${Number(card.remainingSlots) || 0} người`,
    time: start ? start.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—',
    timeSlot: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
    title: card.title || card.description || `Kèo ${sportName || 'ghép trận'}`,
    location: [card.courtName, card.facilityName, card.facilityAddress].filter(Boolean).join(', ') || '—',
    groupDesc: card.hostName ? `Chủ kèo: ${card.hostName}${card.hostFairPlayScore != null ? ` (Fair Play ${card.hostFairPlayScore})` : ''}` : (card.description || ''),
    requireApproval: Boolean(card.requireApproval),
    roster,
    currentSlots,
    totalSlots,
    priceLabel: 'Tiền cọc mỗi người:',
    price,
    priceDisplay: formatVnd(price),
    buttonText: 'Chốt Slot Ngay',
    isFlashClaim: false,
    image: card.imageUrl || card.facilityImageUrl || FEED_IMAGES[sport],
  }
}

function CommunityFeed() {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // 3-Tab Main Navigation: 'all' (Sàn ghép trận) | 'my_cards' (Kèo đã tạo - Chủ kèo) | 'joined' (Kèo đã tham gia)
  const [activeMainTab, setActiveMainTab] = useState(() => (searchParams.get('tab') === 'community_posts' ? 'all' : searchParams.get('tab') || 'all'))
  const [myStatusFilter, setMyStatusFilter] = useState('all') // 'all' | 'OPEN' | 'FILLED' | 'CANCELLED'
  const [myLfgCards, setMyLfgCards] = useState([])
  const [joinedLfgCards, setJoinedLfgCards] = useState([])
  const [isLoadingMyCards, setIsLoadingMyCards] = useState(false)
  const [isLoadingJoined, setIsLoadingJoined] = useState(false)
  const [isLoadingLfgs, setIsLoadingLfgs] = useState(false)
  const [myFairPlayData, setMyFairPlayData] = useState(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState(null)
  const [selectedClaimSide, setSelectedClaimSide] = useState('any')
  const [qrTicketModal, setQrTicketModal] = useState(null)
  const [cancelMatchModal, setCancelMatchModal] = useState(null)
  const [leaveMatchModal, setLeaveMatchModal] = useState(null)
  const [leaveReason, setLeaveReason] = useState('')
  const [cancelReasonsList, setCancelReasonsList] = useState([])
  const [selectedCancelReason, setSelectedCancelReason] = useState('')
  const [customCancelReason, setCustomCancelReason] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // LFG Cancel Requests & Bỏ phiếu hủy kèo (POST /cancel-requests, GET /cancel-requests/latest, POST /vote)
  const [cancelVoteModal, setCancelVoteModal] = useState(null) // { card, request, isLoading }
  const [cancelRequestReason, setCancelRequestReason] = useState('')
  const [isSubmittingCancelReq, setIsSubmittingCancelReq] = useState(false)

  // Bảng tin cộng đồng (14 API /api/v1/community/*)
  const [communityPosts, setCommunityPosts] = useState([])
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false)
  const [communitySubTab, setCommunitySubTab] = useState('all') // 'all' | 'my'
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImage, setNewPostImage] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [commentsByPostId, setCommentsByPostId] = useState({})
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null)
  const [commentInputs, setCommentInputs] = useState({})
  const [editingPost, setEditingPost] = useState(null)


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
    return saved !== null ? Number(saved) : 0
  })

  // Matches list
  // Danh sách kèo đang mở lấy từ GET /api/v1/lfgs
  const [matches, setMatches] = useState([])
  const [lfgListError, setLfgListError] = useState('')

  useEffect(() => {
    let cancelled = false
    setIsLoadingLfgs(true)
    getLfgs({ page: 1, pageSize: 50 })
      .then((res) => {
        if (cancelled) return
        setMatches((res?.items || []).map(toFeedMatch).map(sanitizeMatch))
        setLfgListError('')
      })
      .catch((err) => !cancelled && setLfgListError(err?.message || 'Không tải được danh sách kèo.'))
      .finally(() => !cancelled && setIsLoadingLfgs(false))
    return () => { cancelled = true }
  }, [])

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

  // Load My Cards (Chủ kèo) - Bước 2
  const loadMyCards = async (status = myStatusFilter) => {
    setIsLoadingMyCards(true)
    try {
      const list = await getMyLfgCards(status === 'all' ? undefined : status)
      const apiCards = Array.isArray(list) ? list : []
      if (apiCards.length > 0) {
        setMyLfgCards(apiCards)
      } else {
        setMyLfgCards([])
      }
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi lấy kèo của tôi:', err)
    } finally {
      setIsLoadingMyCards(false)
    }
  }

  // Load Joined Cards (Người tham gia)
  const loadJoinedCards = async () => {
    setIsLoadingJoined(true)
    try {
      const list = await getJoinedLfgs()
      setJoinedLfgCards(Array.isArray(list) ? list : [])
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi lấy kèo đã tham gia:', err)
    } finally {
      setIsLoadingJoined(false)
    }
  }

  // Load Fair Play Score - 2.7
  const loadFairPlay = async () => {
    try {
      const data = await getMyFairPlay()
      if (data) setMyFairPlayData(data)
    } catch (err) {
      console.warn('[CommunityFeed] Không lấy được Fair Play:', err)
    }
  }

  // Tab switcher
  const handleTabChange = (newTab) => {
    setActiveMainTab(newTab)
    setSearchParams(newTab === 'all' ? {} : { tab: newTab })
    if (newTab === 'my_cards') {
      loadMyCards()
    } else if (newTab === 'joined') {
      loadJoinedCards()
    } else if (newTab === 'community_posts') {
      loadCommunityPosts(communitySubTab)
    }
  }

  // Tải danh sách bài viết trên Bảng tin cộng đồng (GET /api/v1/community/posts hoặc /my-posts)
  const loadCommunityPosts = async (subTab = communitySubTab) => {
    setIsLoadingCommunity(true)
    try {
      let res
      if (subTab === 'my') {
        res = await communityApi.getMyCommunityPosts()
      } else {
        res = await communityApi.getCommunityPosts()
      }
      const items = res?.items || (Array.isArray(res) ? res : [])
      setCommunityPosts(items)
    } catch (err) {
      console.warn('[CommunityFeed] Không thể tải bài viết cộng đồng:', err)
      // Mock bài viết đẹp nếu server chưa có data
      setCommunityPosts([
        {
          id: 'post-1',
          authorName: 'Nguyễn Thành Trung',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          sportBadge: 'CẦU LÔNG',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          content: 'Hôm nay giao lưu tại sân Tre Xanh vui quá! Cảm ơn anh em đã bao sân và đánh rất nhiệt tình, tinh thần Fair Play 100 điểm 🏸✨',
          mediaUrls: ['https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=800&h=600&fit=crop'],
          likeCount: 12,
          isLiked: false,
          commentCount: 3,
        },
        {
          id: 'post-2',
          authorName: 'Lê Minh Quân',
          authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
          sportBadge: 'PICKLEBALL',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          content: 'Tìm hội đánh Pickleball cố định tối thứ 3 - thứ 5 khu vực Quận 7 hoặc Thủ Đức. Trình độ Trung bình - Khá, chia tiền cọc sòng phẳng qua Escrow!',
          mediaUrls: [],
          likeCount: 8,
          isLiked: true,
          commentCount: 1,
        },
      ])
    } finally {
      setIsLoadingCommunity(false)
    }
  }

  // Upload ảnh bài viết: POST /api/v1/community/posts/images
  const handleUploadPostImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const url = await communityApi.uploadPostImage(file)
      if (url) setNewPostImage(url)
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi tải ảnh bài viết:', err)
      const mockUrl = URL.createObjectURL(file)
      setNewPostImage(mockUrl)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Đăng bài viết mới: POST /api/v1/community/posts
  const handleCreateCommunityPost = async (e) => {
    if (e) e.preventDefault()
    if (!newPostContent.trim()) {
      alert('Vui lòng nhập nội dung bài viết!')
      return
    }
    setIsSubmittingPost(true)
    try {
      await communityApi.createCommunityPost({
        content: newPostContent.trim(),
        mediaUrls: newPostImage ? [newPostImage] : [],
      })
      setNewPostContent('')
      setNewPostImage(null)
      setToastMessage({
        title: 'Đăng Bài Thành Công',
        desc: 'Bài viết của bạn đã được xuất bản trên Bảng tin cộng đồng!',
        type: 'success',
      })
      loadCommunityPosts(communitySubTab)
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi khi đăng bài:', err)
      setToastMessage({
        title: 'Đã xuất bản (Mô phỏng)',
        desc: 'Bài viết đã được hiển thị trên bảng tin.',
        type: 'success',
      })
      // Thêm ngay vào state
      const localPost = {
        id: `local-${Date.now()}`,
        authorName: 'Bạn (Người dùng hiện tại)',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        sportBadge: 'GIAO LƯU',
        createdAt: new Date().toISOString(),
        content: newPostContent.trim(),
        mediaUrls: newPostImage ? [newPostImage] : [],
        likeCount: 0,
        isLiked: false,
        commentCount: 0,
        isOwn: true,
      }
      setCommunityPosts([localPost, ...communityPosts])
      setNewPostContent('')
      setNewPostImage(null)
    } finally {
      setIsSubmittingPost(false)
    }
  }

  // Thích / Bỏ thích bài viết: POST / DELETE /api/v1/community/posts/{postId}/like
  const handleToggleLikePost = async (postId, currentlyLiked) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !currentlyLiked
          return {
            ...p,
            isLiked: nextLiked,
            likeCount: nextLiked ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1),
          }
        }
        return p
      })
    )
    try {
      if (currentlyLiked) {
        await communityApi.unlikePost(postId)
      } else {
        await communityApi.likePost(postId)
      }
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi like/unlike:', err)
    }
  }

  // Mở/Đóng và tải bình luận: GET /api/v1/community/posts/{postId}/comments
  const handleToggleComments = async (postId) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null)
      return
    }
    setOpenCommentsPostId(postId)
    try {
      const res = await communityApi.getPostComments(postId)
      const list = res?.items || (Array.isArray(res) ? res : [])
      setCommentsByPostId((prev) => ({ ...prev, [postId]: list }))
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi tải bình luận:', err)
    }
  }

  // Thêm bình luận: POST /api/v1/community/posts/{postId}/comments
  const handleAddPostComment = async (postId) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return
    try {
      await communityApi.createPostComment(postId, { content: text })
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      // Cập nhật ngay trên UI
      const newComment = {
        id: `cmt-${Date.now()}`,
        authorName: 'Bạn',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
        content: text,
        createdAt: new Date().toISOString(),
        isOwn: true,
      }
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }))
      setCommunityPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
      )
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi gửi bình luận:', err)
    }
  }

  // Xóa bình luận: DELETE /api/v1/community/comments/{commentId}
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return
    try {
      await communityApi.deletePostComment(commentId)
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }))
      setCommunityPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p))
      )
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi xóa bình luận:', err)
    }
  }

  // Xóa bài viết: DELETE /api/v1/community/posts/{postId}
  const handleDeleteCommunityPost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return
    try {
      await communityApi.deleteCommunityPost(postId)
      setCommunityPosts((prev) => prev.filter((p) => p.id !== postId))
      setToastMessage({
        title: 'Đã Xóa Bài Viết',
        desc: 'Bài viết đã được xóa khỏi bảng tin cộng đồng.',
        type: 'success',
      })
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi xóa bài viết:', err)
    }
  }

  // Chỉnh sửa bài viết: PUT /api/v1/community/posts/{postId}
  const handleSaveEditPost = async (postId, content) => {
    try {
      await communityApi.updateCommunityPost(postId, { content })
      setCommunityPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, content } : p))
      )
      setEditingPost(null)
      setToastMessage({
        title: 'Cập Nhật Thành Công',
        desc: 'Nội dung bài viết đã được lưu.',
        type: 'success',
      })
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi cập nhật bài viết:', err)
    }
  }

  // Lời mời vào kèo: Chấp nhận POST /{cardId}/invitation/accept & Từ chối POST /{cardId}/invitation/decline
  const handleAcceptLfgInvite = async (cardId) => {
    try {
      await acceptLfgInvitation(cardId)
      setToastMessage({
        title: 'Đã Chấp Nhận Lời Mời',
        desc: 'Bạn đã tham gia kèo ghép thành công!',
        type: 'success',
      })
      loadJoinedCards()
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi chấp nhận lời mời:', err)
      alert(err.message || 'Không thể chấp nhận lời mời')
    }
  }

  const handleDeclineLfgInvite = async (cardId) => {
    try {
      await declineLfgInvitation(cardId)
      setToastMessage({
        title: 'Đã Từ Chối Lời Mời',
        desc: 'Đã từ chối tham gia kèo ghép.',
        type: 'info',
      })
      loadJoinedCards()
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi từ chối lời mời:', err)
      alert(err.message || 'Không thể từ chối lời mời')
    }
  }

  // Xóa thành viên nhóm: DELETE /api/v1/lfgs/{cardId}/group/{friendId}
  const handleRemoveGroupFriend = async (cardId, friendId, friendName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thành viên ${friendName || ''} khỏi nhóm ghép trận?`)) return
    try {
      await removeLfgGroupMember(cardId, friendId)
      setToastMessage({
        title: 'Đã Xóa Thành Viên',
        desc: `Đã xóa ${friendName || 'thành viên'} khỏi nhóm ghép trận.`,
        type: 'success',
      })
      loadMyCards()
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi xóa thành viên nhóm:', err)
      alert(err.message || 'Không thể xóa thành viên khỏi nhóm')
    }
  }

  // Mở modal Yêu cầu hủy & Bỏ phiếu hủy: POST /cancel-requests, GET /cancel-requests/latest, POST /vote
  const handleOpenCancelVoteModal = async (card) => {
    setCancelVoteModal({ card, request: null, isLoading: true })
    setCancelRequestReason('')
    try {
      const latestReq = await getLatestLfgCancelRequest(card.id)
      setCancelVoteModal({ card, request: latestReq, isLoading: false })
    } catch (err) {
      console.warn('[CommunityFeed] Chưa có yêu cầu hủy nào:', err)
      setCancelVoteModal({ card, request: null, isLoading: false })
    }
  }

  const handleCreateCancelReq = async (cardId) => {
    if (!cancelRequestReason.trim()) {
      alert('Vui lòng nhập lý do đề xuất hủy kèo!')
      return
    }
    setIsSubmittingCancelReq(true)
    try {
      await createLfgCancelRequest(cardId, { reason: cancelRequestReason.trim() })
      setToastMessage({
        title: 'Đã Tạo Yêu Cầu Hủy Kèo',
        desc: 'Yêu cầu hủy kèo đã được gửi tới tất cả thành viên để bỏ phiếu.',
        type: 'success',
      })
      const latestReq = await getLatestLfgCancelRequest(cardId).catch(() => null)
      setCancelVoteModal((prev) => (prev ? { ...prev, request: latestReq } : null))
    } catch (err) {
      alert(err.message || 'Lỗi khi gửi yêu cầu hủy kèo')
    } finally {
      setIsSubmittingCancelReq(false)
    }
  }

  const handleVoteCancelReq = async (cardId, requestId, approve) => {
    try {
      await voteLfgCancelRequest(cardId, requestId, { approve })
      setToastMessage({
        title: approve ? 'Đã Bỏ Phiếu Đồng Ý Hủy' : 'Đã Bỏ Phiếu Từ Chối',
        desc: 'Phiếu bầu của bạn đã được ghi nhận trên hệ thống.',
        type: 'success',
      })
      const updatedReq = await getLatestLfgCancelRequest(cardId).catch(() => null)
      setCancelVoteModal((prev) => (prev ? { ...prev, request: updatedReq } : null))
      loadMyCards()
      loadJoinedCards()
    } catch (err) {
      alert(err.message || 'Lỗi khi bỏ phiếu')
    }
  }

  useEffect(() => {
    loadFairPlay()
    if (activeMainTab === 'my_cards') {
      loadMyCards(myStatusFilter)
    } else if (activeMainTab === 'joined') {
      loadJoinedCards()
    } else if (activeMainTab === 'community_posts') {
      loadCommunityPosts(communitySubTab)
    }
  }, [activeMainTab, myStatusFilter, communitySubTab])

  // Confirm Slot Claim Handler - 2.6 Người tham gia Bước 2
  const handleConfirmClaim = async () => {
    if (!bookingModal) return

    setIsClaiming(true)
    setClaimError(null)

    if (walletBalance < (bookingModal.price || 0)) {
      alert('Số dư ví hiện tại không đủ để giữ slot. Vui lòng nạp thêm tiền!')
      setIsClaiming(false)
      return
    }

    try {
      // Gọi API Claim Slot: POST /api/v1/lfgs/{cardId}/claim
      await claimLfgSlot(bookingModal.id, {
        side: selectedClaimSide || 'any',
        friendIds: [],
        friendPayMode: 'me',
      })

      // Image 2: Kèo không cần duyệt: trừ tiền ngay, vào kèo luôn. Kèo cần duyệt: chỉ gửi yêu cầu, tiền bị giữ khi chủ kèo duyệt.
      const isApprovalRequired = Boolean(bookingModal.requireApproval)
      if (!isApprovalRequired) {
        getWallet().then((w) => setWalletBalance(w.balance)).catch(() => {})
      }

      setToastMessage({
        title: isApprovalRequired ? 'Đã Gửi Yêu Cầu Thành Công!' : 'Nhận Suất Thành Công!',
        desc: isApprovalRequired
          ? `Kèo này bật chế độ duyệt. Yêu cầu của bạn đã được gửi tới chủ kèo, tiền cọc sẽ được giữ an toàn khi chủ kèo duyệt.`
          : `Bạn đã vào đội hình trận "${bookingModal.title}". Khoản cọc ${bookingModal.priceDisplay} đã được bảo chứng Escrow.`,
        type: 'success',
      })

      setBookingModal(null)
      loadJoinedCards()
      handleTabChange('joined')
    } catch (err) {
      console.error('[CommunityFeed] Lỗi nhận suất:', err)
      // Image 2 spec: "Nhận suất có thể bị từ chối 403 khi điểm Fair Play thấp hơn ngưỡng Admin đặt (mặc định 50/100) hoặc đang bị Admin cấm nhận suất. Hiện nguyên câu message (có điểm hiện tại và ngưỡng)."
      const errMsg = err?.message || 'Không thể nhận suất kèo này. Vui lòng kiểm tra lại.'
      setClaimError(errMsg)
      setToastMessage({
        title: 'Từ Chối Nhận Suất (Fair Play / Quy định)',
        desc: errMsg,
        type: 'error',
      })
    } finally {
      setIsClaiming(false)
    }
  }

  // Chủ kèo: Duyệt người tham gia - 2.6 Bước 3
  const handleApproveParticipant = async (cardId, userId, participantName) => {
    setActionLoadingId(`${cardId}-${userId}`)
    try {
      await approveLfgParticipant(cardId, userId)
      setToastMessage({
        title: 'Duyệt thành công!',
        desc: `Đã duyệt vận động viên ${participantName} vào kèo ghép. Tiền cọc của người tham gia đã được giữ bảo chứng.`,
        type: 'success',
      })
      loadMyCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi duyệt thành viên',
        desc: err.message || 'Không thể duyệt thành viên.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Chủ kèo: Từ chối người tham gia - 2.6 Bước 3
  const handleRejectParticipant = async (cardId, userId, participantName) => {
    setActionLoadingId(`${cardId}-${userId}`)
    try {
      await rejectLfgParticipant(cardId, userId)
      setToastMessage({
        title: 'Đã từ chối',
        desc: `Đã từ chối yêu cầu tham gia của ${participantName}.`,
        type: 'info',
      })
      loadMyCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi từ chối thành viên',
        desc: err.message || 'Không thể từ chối thành viên.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Chủ kèo: Loại người đã vào kèo - 2.6 Bước 4
  const handleRemoveParticipant = async (cardId, userId, participantName) => {
    if (!window.confirm(`Xác nhận loại ${participantName} khỏi kèo?\n\nChính sách quy định: Hoàn 100% tiền cho họ và mở lại 1 suất trống cho kèo.`)) {
      return
    }
    setActionLoadingId(`${cardId}-${userId}`)
    try {
      await removeLfgParticipant(cardId, userId)
      setToastMessage({
        title: 'Đã loại thành viên',
        desc: `Đã loại ${participantName} khỏi kèo. Hệ thống đã hoàn 100% tiền cho người chơi và mở lại 1 suất trống.`,
        type: 'success',
      })
      loadMyCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi loại thành viên',
        desc: err.message || 'Không thể loại thành viên.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Chủ kèo: Mở modal hủy kèo - 2.6 Bước 5
  const handleOpenCancelModal = async (card) => {
    setCancelMatchModal(card)
    setSelectedCancelReason('')
    setCustomCancelReason('')
    try {
      const reasons = await getLfgCancelReasons()
      setCancelReasonsList(Array.isArray(reasons) ? reasons : [])
      if (Array.isArray(reasons) && reasons.length > 0) {
        const first = reasons[0]
        setSelectedCancelReason(typeof first === 'string' ? first : first?.label || first?.reason)
      }
    } catch (err) {
      console.warn('[CommunityFeed] Lỗi lấy lý do hủy:', err)
      setCancelReasonsList(['Bận việc đột xuất', 'Thời tiết xấu', 'Không đủ người chơi', 'Lý do khác'])
      setSelectedCancelReason('Bận việc đột xuất')
    }
  }

  // Chủ kèo: Xác nhận hủy kèo - 2.6 Bước 5
  const handleConfirmCancelMatch = async () => {
    if (!cancelMatchModal) return
    const isCustom = selectedCancelReason === 'Lý do khác' || selectedCancelReason === 'Khác (Tự nhập lý do)'
    const finalReason = isCustom ? customCancelReason.trim() || 'Lý do khác' : selectedCancelReason || 'Bận việc đột xuất'

    setActionLoadingId(cancelMatchModal.id)
    try {
      await cancelLfg(cancelMatchModal.id, { reason: finalReason })
      setToastMessage({
        title: 'Hủy Kèo Ghép Thành Công',
        desc: 'Đã hủy kèo. Hoàn 100% tiền cho người tham gia; tiền sân của chủ kèo hoàn theo chính sách hủy đặt sân (trước 24h hoàn 100%).',
        type: 'success',
      })
      setCancelMatchModal(null)
      loadMyCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi hủy kèo',
        desc: err.message || 'Không thể hủy kèo ghép.',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Người tham gia: Mở modal rời kèo - 2.6 Bước 4
  const handleOpenLeaveModal = (card) => {
    setLeaveMatchModal(card)
    setLeaveReason('')
  }

  // Người tham gia: Xác nhận rời kèo - 2.6 Bước 4
  const handleConfirmLeaveMatch = async () => {
    if (!leaveMatchModal) return

    // Kiểm tra quy định: Không rời được trong vòng 2 giờ trước giờ chơi
    if (leaveMatchModal.startTime) {
      const matchTime = new Date(leaveMatchModal.startTime).getTime()
      const now = Date.now()
      const diffHours = (matchTime - now) / (1000 * 60 * 60)
      if (diffHours < 2 && diffHours > 0) {
        alert('Quy định hệ thống: Không thể rời kèo trong vòng 2 giờ trước giờ chơi!')
        return
      }
    }

    setActionLoadingId(leaveMatchModal.id)
    try {
      await leaveLfg(leaveMatchModal.id, { reason: leaveReason.trim() || 'Rút khỏi kèo' })
      setToastMessage({
        title: 'Rời Kèo Thành Công',
        desc: 'Đã rời kèo (hoàn 100% tiền) hoặc rút yêu cầu đang chờ.',
        type: 'success',
      })
      setLeaveMatchModal(null)
      loadJoinedCards()
    } catch (err) {
      setToastMessage({
        title: 'Lỗi rời kèo',
        desc: err.message || 'Không thể rời kèo (Lưu ý: Không rời được trong vòng 2 giờ trước giờ chơi).',
        type: 'error',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Mở vé QR Check-in - 2.6 Bước 3 & 2.7 Bước 1
  const handleOpenQrTicket = async (cardId, matchInfo = {}) => {
    setQrTicketModal({
      isOpen: true,
      isLoading: true,
      cardId,
      title: matchInfo.title || 'Vé QR Check-in Kèo Ghép LFG',
      courtName: matchInfo.courtName || 'Sân SportNexus',
      facilityAddress: matchInfo.facilityAddress || 'TP. Hồ Chí Minh',
      time: matchInfo.time || '19:30 - 21:00',
      ticketCode: matchInfo.ticketCode || `SNX-LFG-${String(cardId).slice(0, 8)}`,
      qrCode: null,
    })

    try {
      const res = await getLfgQrTicket(cardId)
      setQrTicketModal((prev) => ({
        ...prev,
        isLoading: false,
        ticketData: res,
        qrCode: res?.qrCode || res?.code || `SNX-LFG-${cardId}`,
        ticketCode: res?.ticketCode || res?.code || prev.ticketCode,
      }))
    } catch (err) {
      console.warn('[CommunityFeed] Lấy vé QR thất bại hoặc demo fallback:', err)
      setQrTicketModal((prev) => ({
        ...prev,
        isLoading: false,
        qrCode: `SNX-LFG-${cardId}`,
      }))
    }
  }

  // Create match submit handler
  const handleCreateMatchSubmit = (e) => {
    e.preventDefault()
    if (!newMatch.title || !newMatch.location) {
      alert('Vui lòng nhập đầy đủ tiêu đề và địa điểm sân!')
      return
    }

    const sportBadgeMap = {
      badminton: 'CẦU LÔNG ĐÔI',
      pickleball: 'PICKLEBALL ĐÔI',
      football: 'BÓNG ĐÁ SÂN 7',
      basketball: 'BÓNG RỔ 3x3',
      tennis: 'QUẦN VỢT ĐÔI',
    }
    const sportImageMap = {
      badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop',
      pickleball: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
      football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
      tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=600&fit=crop',
    }

    const created = {
      id: Date.now(),
      sport: newMatch.sport,
      sportBadge: sportBadgeMap[newMatch.sport] || 'GIAO LƯU THỂ THAO',
      subBadge: '✓ Kèo Mới Đăng',
      levelTag: newMatch.level,
      slotTag: `Cần ${newMatch.slots} Người`,
      time: newMatch.time,
      title: newMatch.title,
      location: newMatch.location,
      groupDesc: `Host: ${currentUser.name || 'Bạn'}`,
      roster: [
        { initials: (currentUser.name || 'B').slice(0, 2).toUpperCase(), bg: '#2D5F3F', name: currentUser.name || 'Bạn' },
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
      image: sportImageMap[newMatch.sport] || sportImageMap.badminton,
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
      <div className="snx-page">
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

        {/* Title & Actions */}
        <div className="snx-page-header">
          <div>
            <h1 className="snx-page-title">
              Sàn Ghép Trận &amp; Tranh Slot
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Bộ Lọc Nâng Cao Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF2F6] hover:bg-[#E2E8F0] text-[#334155] font-semibold text-sm transition-all shadow-sm border border-gray-200/60 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#475569]">tune</span>
              <span>Bộ Lọc Nâng Cao</span>
            </button>

            {/* Đăng Kèo Ghép Mới Button */}
            <button
              onClick={() => navigate('/create-match')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(59,104,23,0.35)] cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Đăng Kèo Ghép Mới</span>
            </button>
          </div>
        </div>

        {/* ================= 3-TAB MAIN NAVIGATION (2.6 & 2.7) ================= */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200/80 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'all'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            <span>Sàn Ghép Trận (Tất Cả)</span>
          </button>

          <button
            onClick={() => handleTabChange('my_cards')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'my_cards'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            <span>Kèo Tôi Đã Tạo (Chủ Kèo)</span>
            {myLfgCards.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeMainTab === 'my_cards' ? 'bg-white text-[#3B6817]' : 'bg-[#EAF7EE] text-[#15803D]'}`}>
                {myLfgCards.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('joined')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'joined'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            <span>Kèo Tôi Đã Tham Gia</span>
            {joinedLfgCards.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeMainTab === 'joined' ? 'bg-white text-[#3B6817]' : 'bg-[#EAF7EE] text-[#15803D]'}`}>
                {joinedLfgCards.length}
              </span>
            )}
          </button>

          {/* Bảng tin cộng đồng đã tách thành trang riêng /feed (mục "Cộng đồng" trên sidebar) */}
          <button
            onClick={() => navigate('/feed')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeMainTab === 'community_posts'
                ? 'bg-[#3B6817] text-white shadow-md shadow-[#3B6817]/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dynamic_feed</span>
            <span>Bảng tin Cộng đồng</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            {communityPosts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeMainTab === 'community_posts' ? 'bg-white text-[#3B6817]' : 'bg-[#EAF7EE] text-[#15803D]'}`}>
                {communityPosts.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Bar Chips (Hiển thị khi ở Tab Sàn Ghép Trận) */}
        {activeMainTab === 'all' && (
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-gray-200/80 shadow-sm mb-7 overflow-x-auto scrollbar-none flex-wrap">
          {/* Tất Cả Thể Thao */}
          <button
            onClick={() => setActiveSportFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSportFilter === 'badminton'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">🏸</span>
            <span>Cầu Lông</span>
          </button>

          {/* Bóng Đá */}
          <button
            onClick={() => setActiveSportFilter('football')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSportFilter === 'football'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">⚽</span>
            <span>Bóng Đá</span>
          </button>

          {/* Bóng Rổ */}
          <button
            onClick={() => setActiveSportFilter('basketball')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSportFilter === 'basketball'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">🏀</span>
            <span>Bóng Rổ</span>
          </button>

          {/* Tennis */}
          <button
            onClick={() => setActiveSportFilter('tennis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSportFilter === 'tennis'
                ? 'bg-[#3B6817] text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-[15px] leading-none">🎾</span>
            <span>Tennis</span>
          </button>

          {/* Dropdown Trình độ */}
          <div className="relative shrink-0">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-gray-200 cursor-pointer focus:outline-none whitespace-nowrap"
            >
              <option value="all">Trình độ: Tất Cả Trình Độ</option>
              <option value="beginner">Mới chơi / Nhập môn</option>
              <option value="intermediate">Trung bình - Khá</option>
              <option value="advanced">Khá - Nâng cao</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[16px]">
              expand_more
            </span>
          </div>

          {/* Dropdown Khoảng cách */}
          <div className="relative shrink-0">
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 pr-8 rounded-xl border border-gray-200 cursor-pointer focus:outline-none whitespace-nowrap"
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
        )}

        {/* 2-Column Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* ================= LEFT COLUMN: MATCHES FEED ================= */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activeMainTab === 'all' && (
              <>
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
                          {match.sport === 'badminton'
                            ? '🏸'
                            : match.sport === 'pickleball'
                            ? '🏓'
                            : match.sport === 'football'
                            ? '⚽'
                            : match.sport === 'basketball'
                            ? '🏀'
                            : '🎾'}
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
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                              match.sport === 'badminton'
                                ? 'bg-[#EFF6FF] text-[#1E40AF]'
                                : 'bg-[#EEF2FF] text-[#4338CA]'
                            }`}
                          >
                            {match.levelTag}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                              match.isFlashClaim
                                ? 'bg-[#FEE2E2] text-[#DC2626]'
                                : 'bg-[#E0F2FE] text-[#0369A1]'
                            }`}
                          >
                            {match.slotTag}
                          </span>
                          {isMatchNearUser(match.location, userProfileLocation) && (
                            <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0">
                              <span className="material-symbols-outlined text-[13px] text-[#16A34A]">near_me</span>
                              Gần bạn ({userProfileLocation})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold whitespace-nowrap shrink-0 ml-auto">
                          <span className="material-symbols-outlined text-[14px] text-gray-500">
                            schedule
                          </span>
                          <span>{match.time}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h2
                        className="text-[16px] font-bold text-[#111827] leading-snug hover:text-[#3B6817] transition-colors cursor-pointer truncate"
                        title={match.title}
                      >
                        {match.title}
                      </h2>

                      {/* Location & Group Info */}
                      <div className="flex flex-col gap-1 mt-2.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 min-w-0" title={match.location}>
                          <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0">
                            location_on
                          </span>
                          <span className="truncate">{match.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0" title={match.groupDesc}>
                          <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0">
                            group
                          </span>
                          <span className="truncate">{match.groupDesc}</span>
                        </div>
                      </div>

                      {/* Rosters / Slots Row */}
                      <div className="flex items-center justify-between gap-2.5 mt-3 pt-2">
                        <div className="flex items-center -space-x-1.5 shrink-0">
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
                          <span className="text-xs text-[#B45309] font-medium flex items-center gap-1 whitespace-nowrap shrink-0">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {match.urgencyText}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium whitespace-nowrap shrink-0">
                            Đã ghép: {match.currentSlots}/{match.totalSlots} vị trí
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price & Action */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
                      <div className="whitespace-nowrap shrink-0">
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
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0 ${
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
            </>
            )}

            {/* TAB 2: KÈO TÔI ĐÃ TẠO (CHỦ KÈO) - 2.6 CHỦ KÈO */}
            {activeMainTab === 'my_cards' && (
              <div className="flex flex-col gap-5">
                {/* Status Sub-filter Bar (OPEN / FILLED / CANCELLED) */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Lọc trạng thái:</span>
                    {[
                      { key: 'all', label: 'Tất Cả' },
                      { key: 'OPEN', label: 'Đang Tuyển (OPEN)' },
                      { key: 'FILLED', label: 'Đã Đủ Người (FILLED)' },
                      { key: 'CANCELLED', label: 'Đã Hủy (CANCELLED)' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => {
                          setMyStatusFilter(st.key)
                          loadMyCards(st.key)
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          myStatusFilter === st.key
                            ? 'bg-[#3B6817] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/create-match')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#EAF7EE] text-[#15803D] hover:bg-[#DCFCE7] text-xs font-black border border-[#86EFAC] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Tạo Kèo Mới</span>
                  </button>
                </div>

                {/* Policy Notice Box for Host */}
                <div className="bg-[#FAFBF9] rounded-2xl border border-gray-200 p-4 text-xs text-gray-600 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#3B6817] text-[18px] shrink-0 mt-0.5">info</span>
                  <div>
                    <span className="font-bold text-[#111827]">Quy chế Chủ Kèo (2.6):</span> Hệ thống tự đặt ca sân và trừ 100% tiền sân từ ví chủ kèo. Khi hủy kèo: người tham gia được hoàn 100%; tiền sân của chủ kèo hoàn theo chính sách sân (trước 24h hoàn 100%).
                  </div>
                </div>

                {isLoadingMyCards ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#3B6817] animate-spin">progress_activity</span>
                    <p className="text-sm font-bold text-gray-700">Đang tải danh sách kèo đã tạo...</p>
                  </div>
                ) : myLfgCards.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                      <span className="material-symbols-outlined text-3xl">sports_score</span>
                    </div>
                    <p className="font-black text-gray-800 text-base">Bạn chưa tạo kèo ghép nào</p>
                    <p className="text-xs text-gray-500 max-w-md">
                      Hãy tạo ngay kèo ghép đầu tiên để hệ thống tự động tìm bạn chơi phù hợp trình độ và chia đều tiền sân qua Smart Escrow!
                    </p>
                    <button
                      onClick={() => navigate('/create-match')}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      Đăng Kèo Ghép Ngay
                    </button>
                  </div>
                ) : (
                  myLfgCards.map((card) => {
                    const statusColorMap = {
                      OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      FILLED: 'bg-blue-50 text-blue-700 border-blue-200',
                      CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
                    }
                    const statusTextMap = {
                      OPEN: 'Đang Tuyển (OPEN)',
                      FILLED: 'Đã Đủ Người (FILLED)',
                      CANCELLED: 'Đã Hủy (CANCELLED)',
                    }

                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all"
                      >
                        {/* Header Row: Title, Status, Approval Mode */}
                        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 flex-wrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${statusColorMap[card.status] || 'bg-gray-100 text-gray-700'}`}>
                                {statusTextMap[card.status] || card.status}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#1E40AF]">
                                {card.sportName || card.sport?.toUpperCase() || 'THỂ THAO'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {card.requireApproval ? '🛡️ Cần Duyệt Người' : '⚡ Tự Động Vào'}
                              </span>
                            </div>
                            <h3 className="font-black text-base text-[#111827] mt-1">{card.title}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#3B6817]">location_on</span>
                              <span>{card.courtName} • {card.facilityAddress}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-gray-400 block font-semibold">Giá mỗi người</span>
                            <span className="text-lg font-black text-[#15803D]">
                              {card.pricePerPerson ? `${new Intl.NumberFormat('vi-VN').format(card.pricePerPerson)} đ` : 'Chia đều ca'}
                            </span>
                          </div>
                        </div>

                        {/* Mid Row: Participants List (2.6 Bước 3 & Bước 4) */}
                        <div className="bg-[#FAFBF9] rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-gray-800 uppercase tracking-wide">
                              Danh Sách Thành Viên Tham Gia ({card.participants?.length || 0}/{card.totalSlots || (card.slotsNeeded || 2) + 1})
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {card.status === 'OPEN' ? `Cần thêm ${card.slotsNeeded || 1} người` : 'Đã khóa danh sách'}
                            </span>
                          </div>

                          {(!card.participants || card.participants.length === 0) ? (
                            <p className="text-xs text-gray-400 italic py-2">Chưa có người chơi xin vào kèo này.</p>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              {card.participants.map((p) => {
                                const isPending = p.status === 'PENDING'
                                const loadingKey = `${card.id}-${p.userId}`
                                const isLoadingThis = actionLoadingId === loadingKey

                                return (
                                  <div
                                    key={p.userId}
                                    className="p-2.5 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between gap-3 flex-wrap"
                                  >
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                                        alt={p.name}
                                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                      />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-xs text-[#111827]">{p.name}</span>
                                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-[#EAF7EE] text-[#15803D]">
                                            Fair Play {p.fairPlayScore || 100}
                                          </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 block">
                                          Trạng thái:{' '}
                                          <strong className={isPending ? 'text-amber-600' : 'text-emerald-700'}>
                                            {isPending ? 'Đang chờ duyệt' : 'Đã tham gia (Giữ cọc)'}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>

                                    {/* Actions for Participant */}
                                    <div className="flex items-center gap-2">
                                      {/* Bước 3: Approve / Reject (chỉ khi requireApproval = true và pending) */}
                                      {isPending ? (
                                        <>
                                          <button
                                            disabled={isLoadingThis}
                                            onClick={() => handleApproveParticipant(card.id, p.userId, p.name)}
                                            className="px-3 py-1.5 rounded-lg bg-[#3B6817] hover:bg-[#315613] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">check</span>
                                            <span>Duyệt</span>
                                          </button>
                                          <button
                                            disabled={isLoadingThis}
                                            onClick={() => handleRejectParticipant(card.id, p.userId, p.name)}
                                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                          >
                                            <span className="material-symbols-outlined text-[15px]">close</span>
                                            <span>Từ chối</span>
                                          </button>
                                        </>
                                      ) : (
                                        /* Bước 4: Loại người đã vào kèo (hoàn 100% tiền, mở lại 1 suất) */
                                        card.status !== 'CANCELLED' && (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              disabled={isLoadingThis}
                                              onClick={() => handleRemoveParticipant(card.id, p.userId, p.name)}
                                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer disabled:opacity-50"
                                              title="Hoàn 100% tiền cho họ và mở lại 1 suất trống"
                                            >
                                              <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                              <span>Loại</span>
                                            </button>
                                            <button
                                              disabled={isLoadingThis}
                                              onClick={() => handleRemoveGroupFriend(card.id, p.userId, p.name)}
                                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1 border border-amber-200 cursor-pointer disabled:opacity-50"
                                              title="Xóa bạn khỏi nhóm (DELETE /api/v1/lfgs/{cardId}/group/{friendId})"
                                            >
                                              <span className="material-symbols-outlined text-[14px]">group_remove</span>
                                              <span>Xóa bạn nhóm</span>
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 flex-wrap">
                          <span className="text-xs text-gray-500 font-medium">
                            Giờ chơi: <strong>{new Date(card.startTime || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Sửa kèo: PUT /api/v1/lfgs/{cardId} */}
                            {card.status !== 'CANCELLED' && (
                              <button
                                onClick={() => navigate(`/create-match?cardId=${card.id}&mode=edit`)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span>Sửa Kèo</span>
                              </button>
                            )}

                            {/* Bỏ phiếu hủy kèo (Vote Cancel): POST /cancel-requests & /vote */}
                            {card.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenCancelVoteModal(card)}
                                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-amber-200"
                              >
                                <span className="material-symbols-outlined text-[16px]">how_to_vote</span>
                                <span>Bỏ Phiếu Hủy</span>
                              </button>
                            )}

                            {/* Mở vé QR Check-in (2.7 Bước 1) */}
                            <button
                              onClick={() => handleOpenQrTicket(card.id, card)}
                              className="px-4 py-2 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
                              <span>Vé QR Check-in</span>
                            </button>

                            {/* Hủy kèo đơn phương (2.6 Bước 5) */}
                            {card.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenCancelModal(card)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <span className="material-symbols-outlined text-[17px]">cancel</span>
                                <span>Hủy Kèo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* TAB 3: KÈO TÔI ĐÃ THAM GIA (NGƯỜI THAM GIA) - 2.6 */}
            {activeMainTab === 'joined' && (
              <div className="flex flex-col gap-5">
                {/* Notice Box for Participants */}
                <div className="bg-[#EAF7EE] rounded-2xl border border-[#C6E7BE] p-4 text-xs text-[#1C3524] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">verified_user</span>
                  <div>
                    <span className="font-bold">Quy chế Người Tham Gia (2.6):</span> Tiền cọc được giữ an toàn trong ví Escrow của bạn và chỉ giải ngân cho chủ kèo khi check-in QR tại sân hoặc sau giờ chơi. Rời kèo được hoàn 100% tiền (Lưu ý: Không được rời trong vòng 2 giờ trước giờ chơi).
                  </div>
                </div>

                {isLoadingJoined ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#3B6817] animate-spin">progress_activity</span>
                    <p className="text-sm font-bold text-gray-700">Đang tải danh sách kèo đã tham gia...</p>
                  </div>
                ) : joinedLfgCards.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-3xl">sports_tennis</span>
                    </div>
                    <p className="font-black text-gray-800 text-base">Bạn chưa tham gia kèo ghép nào</p>
                    <p className="text-xs text-gray-500 max-w-md">
                      Khám phá sàn ghép trận và chốt slot ngay để giao lưu thể thao cùng các vận động viên khác!
                    </p>
                    <button
                      onClick={() => handleTabChange('all')}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      Khám Phá Sàn Ghép Trận
                    </button>
                  </div>
                ) : (
                  joinedLfgCards.map((card) => {
                    const isPending = card.claimStatus === 'PENDING'
                    const isInvited = card.claimStatus === 'INVITED' || card.invitationStatus === 'INVITED' || card.isInvitation

                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 flex-wrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${
                                  isInvited
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : isPending
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {isInvited ? 'Được Mời Vào Kèo' : isPending ? 'Đang Chờ Chủ Kèo Duyệt' : 'Đã Vào Đội Hình'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#1E40AF]">
                                {card.sportName || card.sport?.toUpperCase() || 'THỂ THAO'}
                              </span>
                            </div>
                            <h3 className="font-black text-base text-[#111827] mt-1">{card.title}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-[#3B6817]">location_on</span>
                              <span>{card.courtName} • {card.facilityAddress}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-gray-400 block font-semibold">Cọc giữ chỗ Escrow</span>
                            <span className="text-lg font-black text-[#15803D]">
                              {new Intl.NumberFormat('vi-VN').format(card.pricePerPerson || 45000)} đ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-3 rounded-xl flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                            <span>Chủ kèo: <strong>{card.hostName || 'Chủ kèo'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-gray-400">schedule</span>
                            <span>Giờ thi đấu: <strong>{new Date(card.startTime || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                          </div>
                        </div>

                        {/* Actions for Participant */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 flex-wrap">
                          {/* Lời mời tham gia: Chấp nhận POST /invitation/accept & Từ chối POST /invitation/decline */}
                          {isInvited ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptLfgInvite(card.id)}
                                className="px-4 py-2 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                <span>Chấp Nhận Lời Mời</span>
                              </button>
                              <button
                                onClick={() => handleDeclineLfgInvite(card.id)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                <span>Từ Chối</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Bỏ phiếu hủy kèo (Vote Cancel): POST /cancel-requests & /vote */}
                              <button
                                onClick={() => handleOpenCancelVoteModal(card)}
                                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-amber-200"
                              >
                                <span className="material-symbols-outlined text-[16px]">how_to_vote</span>
                                <span>Bỏ Phiếu Hủy Kèo</span>
                              </button>

                              {/* Rời kèo (Bước 4) */}
                              <button
                                onClick={() => handleOpenLeaveModal(card)}
                                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">logout</span>
                                <span>{isPending ? 'Rút yêu cầu' : 'Rời kèo'}</span>
                              </button>

                              {/* Mở vé QR (Bước 3 & 2.7) */}
                              {!isPending && (
                                <button
                                  onClick={() => handleOpenQrTicket(card.id, card)}
                                  className="px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                  <span>Mở Vé QR Check-in</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* TAB 4: BẢNG TIN CỘNG ĐỒNG (14 API /api/v1/community/*) */}
            {activeMainTab === 'community_posts' && (
              <div className="flex flex-col gap-5">
                {/* Community Header Banner */}
                <div className="bg-gradient-to-r from-[#1C3524] to-[#2D5F3F] rounded-2xl p-5 text-white shadow-md flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#34D399] text-[22px]">dynamic_feed</span>
                      <h2 className="text-lg font-black tracking-tight">Bảng Tin Thể Thao Cộng Đồng</h2>
                    </div>
                    <p className="text-xs text-[#A7F3D0] max-w-xl">
                      Không gian chia sẻ kinh nghiệm, tìm bạn giao lưu và cập nhật những trận đấu sôi động nhất trên SportNexus.
                    </p>
                  </div>

                  {/* Subtabs Filter: Tất cả vs Bài của tôi */}
                  <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setCommunitySubTab('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        communitySubTab === 'all'
                          ? 'bg-white text-[#1C3524] shadow-sm'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      Tất Cả Bài Viết
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommunitySubTab('my')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        communitySubTab === 'my'
                          ? 'bg-white text-[#1C3524] shadow-sm'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      Bài Viết Của Tôi
                    </button>
                  </div>
                </div>

                {/* Create Post Card (POST /api/v1/community/posts & /posts/images) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Bạn đang muốn chia sẻ điều gì về buổi tập hoặc tìm bạn cùng sân hôm nay?..."
                        rows={3}
                        className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#3B6817] focus:ring-1 focus:ring-[#3B6817] resize-none"
                      />
                    </div>
                  </div>

                  {/* Image Attachment Preview */}
                  {newPostImage && (
                    <div className="relative inline-block self-start ml-13">
                      <img
                        src={newPostImage}
                        alt="Đính kèm"
                        className="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setNewPostImage(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 flex-wrap gap-2">
                    {/* Attach Image button */}
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#3B6817] cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                      <span className="material-symbols-outlined text-[18px] text-[#3B6817]">image</span>
                      <span>{isUploadingImage ? 'Đang tải ảnh lên...' : 'Đính kèm ảnh'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadPostImage}
                        disabled={isUploadingImage}
                      />
                    </label>

                    {/* Publish Post Button */}
                    <button
                      type="button"
                      disabled={isSubmittingPost || !newPostContent.trim()}
                      onClick={handleCreateCommunityPost}
                      className="px-5 py-2 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md shadow-[#3B6817]/25 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[17px]">send</span>
                      <span>{isSubmittingPost ? 'Đang đăng...' : 'Đăng Bài Viết'}</span>
                    </button>
                  </div>
                </div>

                {/* Posts Feed Stream */}
                {isLoadingCommunity ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#3B6817] animate-spin">progress_activity</span>
                    <p className="text-sm font-bold text-gray-700">Đang tải bảng tin cộng đồng...</p>
                  </div>
                ) : communityPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
                    </div>
                    <p className="font-black text-gray-800 text-base">Chưa có bài viết nào</p>
                    <p className="text-xs text-gray-500 max-w-md">
                      Hãy là người đầu tiên chia sẻ khoảnh khắc thể thao lên cộng đồng SportNexus!
                    </p>
                  </div>
                ) : (
                  communityPosts.map((post) => {
                    const postId = post.id || post.postId
                    const isCommentsOpen = openCommentsPostId === postId
                    const comments = commentsByPostId[postId] || []

                    return (
                      <div
                        key={postId}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all"
                      >
                        {/* Post Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                              alt={post.authorName || 'Tác giả'}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#111827]">{post.authorName || 'Vận động viên SportNexus'}</span>
                                {post.sportBadge && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EAF7EE] text-[#15803D]">
                                    {post.sportBadge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400 block">
                                {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Vừa xong'}
                              </span>
                            </div>
                          </div>

                          {/* Post Action Menu (if own post: Edit & Delete) */}
                          {(post.isOwn || post.authorId === 'my-id' || communitySubTab === 'my') && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingPost(post)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Sửa bài viết (PUT /api/v1/community/posts/{postId})"
                              >
                                <span className="material-symbols-outlined text-[17px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCommunityPost(postId)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Xóa bài viết (DELETE /api/v1/community/posts/{postId})"
                              >
                                <span className="material-symbols-outlined text-[17px]">delete</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Post Content */}
                        <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>

                        {/* Post Media (Images) */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {post.mediaUrls.map((imgUrl, i) => (
                              <img
                                key={i}
                                src={imgUrl}
                                alt="Ảnh đính kèm"
                                className="w-full h-56 object-cover rounded-xl border border-gray-100"
                              />
                            ))}
                          </div>
                        )}

                        {/* Like & Comment Bar */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                          <div className="flex items-center gap-4">
                            {/* Nút Thích: POST / DELETE /api/v1/community/posts/{postId}/like */}
                            <button
                              type="button"
                              onClick={() => handleToggleLikePost(postId, post.isLiked)}
                              className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                                post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <span className={`material-symbols-outlined text-[19px] ${post.isLiked ? 'font-fill' : ''}`}>
                                favorite
                              </span>
                              <span>{post.likeCount || 0} Thích</span>
                            </button>

                            {/* Nút Bình luận: Mở list bình luận */}
                            <button
                              type="button"
                              onClick={() => handleToggleComments(postId)}
                              className="flex items-center gap-1.5 font-bold text-gray-500 hover:text-[#3B6817] transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[19px]">chat_bubble_outline</span>
                              <span>{post.commentCount || comments.length || 0} Bình luận</span>
                            </button>
                          </div>

                          <span className="text-[11px] text-gray-400">SportNexus Community</span>
                        </div>

                        {/* Comments Drawer (GET & POST /api/v1/community/posts/{postId}/comments) */}
                        {isCommentsOpen && (
                          <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3 border border-gray-200/80 mt-1">
                            <h4 className="text-xs font-bold text-gray-700">Bình luận ({comments.length})</h4>

                            {comments.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                            ) : (
                              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                                {comments.map((cmt) => (
                                  <div key={cmt.id} className="bg-white p-2.5 rounded-lg border border-gray-200/60 flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                      <img
                                        src={cmt.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
                                        alt={cmt.authorName}
                                        className="w-6 h-6 rounded-full object-cover shrink-0"
                                      />
                                      <div>
                                        <span className="font-bold text-[11px] text-[#111827] block">{cmt.authorName || 'Thành viên'}</span>
                                        <p className="text-xs text-gray-700 mt-0.5">{cmt.content}</p>
                                      </div>
                                    </div>
                                    {cmt.isOwn && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(postId, cmt.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Xóa bình luận (DELETE /api/v1/community/comments/{commentId})"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">close</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment Input */}
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={commentInputs[postId] || ''}
                                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [postId]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPostComment(postId)}
                                placeholder="Viết bình luận của bạn..."
                                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3B6817]"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddPostComment(postId)}
                                className="px-3 py-2 rounded-lg bg-[#3B6817] hover:bg-[#315613] text-white text-xs font-bold shrink-0"
                              >
                                Gửi
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
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
              <div className="flex items-center justify-between mb-4 relative z-10 gap-2">
                <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">badge</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1F2937]">
                    Hồ Sơ Ghép Trận Cá Nhân
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#DCFCE7] to-[#BBF7D0] text-[#15803D] border border-[#86EFAC] text-[11px] font-black shadow-xs tracking-wide whitespace-nowrap shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-[#15803D] animate-spin" style={{ animationDuration: '6s' }}>diamond</span>
                  Hạng Kim Cương
                </span>
              </div>

              {/* Avatar + Name + Level + Status */}
              <div className="flex items-start gap-3.5 mb-4 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-[58px] h-[58px] rounded-2xl bg-gradient-to-br from-[#1B4D2E] via-[#2D5F3F] to-[#15803D] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#2D5F3F]/35 ring-4 ring-[#86EFAC]/50 group-hover:scale-105 transition-transform">
                    {initialsOf(currentUser.name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[12px] font-black">check</span>
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-[17px] text-[#0F172A] leading-tight whitespace-nowrap">
                      {currentUser.name || 'Bạn'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] font-extrabold text-[10.5px] whitespace-nowrap">
                      Trình: Trung bình - Khá
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 whitespace-nowrap">
                    Thành viên từ T10/2025 • Niên khoá 2026
                  </p>

                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-gray-700 font-bold whitespace-nowrap">
                    <span className="material-symbols-outlined text-[15px] text-[#15803D] shrink-0">location_on</span>
                    <span>Vị trí thi đấu: <strong className="text-[#15803D]">{userProfileLocation}</strong></span>
                    <span className="text-[9.5px] text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded font-extrabold border border-[#86EFAC]/70 shrink-0">Đã đồng bộ</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-[#EAF7EE] border border-[#86EFAC] text-[#15803D] text-[11px] font-bold self-start shadow-2xs whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping shrink-0"></span>
                    <span>Đang Online Sẵn Sàng</span>
                  </div>
                </div>
              </div>

              {/* Fair Play Score Highlight Box */}
              <div className="mb-4 p-3.5 rounded-2xl bg-white border border-[#D1EBD0] shadow-2xs relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800 whitespace-nowrap shrink-0">
                    <span className="material-symbols-outlined text-[17px] text-red-500">
                      flag
                    </span>
                    <span>Chỉ Số Fair Play</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#15803D] text-[9.5px] font-extrabold">Top 1%</span>
                  </div>
                  <div className="text-right flex items-baseline gap-1 whitespace-nowrap shrink-0">
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

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 text-[10.5px] text-gray-500 font-medium whitespace-nowrap">
                  <span className="flex items-center gap-1 text-[#15803D] shrink-0">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    100% Hoàn thành trận
                  </span>
                  <span className="text-gray-400 shrink-0">0 Lần huỷ kèo trễ</span>
                </div>
              </div>

              {/* 2 Stats Mini Cards */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 rounded-2xl bg-white border border-[#DCEBDC] hover:border-[#86EFAC] transition-colors shadow-2xs flex flex-col justify-between">
                  <span className="text-[10.5px] text-gray-500 font-semibold block mb-1 whitespace-nowrap">
                    Trận đã ghép:
                  </span>
                  <div className="flex items-center gap-1 text-[16px] font-black text-[#111827] whitespace-nowrap">
                    <span>14 Trận</span>
                    <span className="material-symbols-outlined text-[16px] text-[#15803D]">
                      verified_user
                    </span>
                  </div>
                  <span className="text-[11px] text-[#15803D] font-extrabold block mt-1 whitespace-nowrap">
                    100% không bùng kèo
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#DCEBDC] hover:border-[#86EFAC] transition-colors shadow-2xs flex flex-col justify-between">
                  <span className="text-[10.5px] text-gray-500 font-semibold block mb-1 whitespace-nowrap">
                    Đánh giá cộng đồng:
                  </span>
                  <div className="flex items-center gap-1 text-[16px] font-black text-[#111827] whitespace-nowrap">
                    <span>4.95 / 5.0</span>
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      star
                    </span>
                  </div>
                  <span className="text-[10.5px] text-gray-500 font-semibold block mt-1 whitespace-nowrap">
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

            {/* Card 2: Cam Kết Chống Bùng Cọc & Quy Chế LFG */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <h3 className="font-bold text-[15px] text-[#111827]">
                  Cam Kết Chống Bùng Cọc &amp; Quy Chế LFG
                </h3>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setRulesModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EAF7EE] hover:bg-[#DCFCE7] text-[#15803D] font-bold text-xs transition-all border border-[#86EFAC]/70 flex items-center justify-between group active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    <span>Xem quy chế</span>
                  </span>
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
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[15px] text-[#3B6817] shrink-0">
                      bolt
                    </span>
                    <span className="text-gray-700 font-medium truncate">
                      <strong className="text-gray-900">Tuấn Kiệt</strong> vừa chốt slot Pickleball
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap shrink-0">12s trước</span>
                </div>

                {/* Activity 2 */}
                <div className="flex items-center justify-between text-xs py-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[15px] text-green-600 shrink-0">
                      verified_user
                    </span>
                    <span className="text-gray-700 font-medium truncate">
                      <strong className="text-gray-900">Bình An</strong> vừa check-in sân Tre Xanh
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap shrink-0">22m trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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

            {/* Chọn Phía / Đội tham gia (A / B / Bất kỳ) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
                Chọn vị trí / Đội hình:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'any', label: 'Bất Kỳ (Ngẫu Nhiên)' },
                  { key: 'A', label: 'Đội A (Chủ Sân)' },
                  { key: 'B', label: 'Đội B (Đối Thủ)' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedClaimSide(s.key)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedClaimSide === s.key
                        ? 'bg-[#EAF7EE] text-[#15803D] border-[#15803D]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quy chế Duyệt Kèo (2.6 Người tham gia Bước 2) */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              bookingModal.requireApproval
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-[#EAF7EE] border-[#C6E7BE] text-[#1C3524]'
            }`}>
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                {bookingModal.requireApproval ? 'security' : 'bolt'}
              </span>
              <div className="leading-relaxed">
                {bookingModal.requireApproval ? (
                  <>
                    <strong className="block mb-0.5">Kèo Cần Chủ Kèo Duyệt (requireApproval = true):</strong>
                    Chỉ gửi yêu cầu tham gia tới Chủ Kèo. Tiền cọc sẽ được bảo chứng giữ an toàn từ ví khi chủ kèo chính thức duyệt.
                  </>
                ) : (
                  <>
                    <strong className="block mb-0.5">Kèo Vào Tự Động:</strong>
                    Trừ tiền cọc ngay lập tức từ ví Smart Escrow và bạn chính thức vào đội hình ngay bây giờ.
                  </>
                )}
              </div>
            </div>

            {/* Error Message Banner (403 Fair Play hoặc cấm nhận suất - Image 2) */}
            {claimError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0 mt-0.5">gavel</span>
                <div>
                  <strong className="block font-black text-rose-900 mb-1">
                    Từ chối nhận suất (403):
                  </strong>
                  <p className="font-semibold leading-relaxed whitespace-pre-wrap">{claimError}</p>
                  <p className="text-[11px] text-rose-600 mt-1.5 italic">
                    (Quy định: Nhận suất bị từ chối khi điểm Fair Play thấp hơn ngưỡng quy định hoặc đang bị cấm nhận suất)
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setBookingModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                disabled={isClaiming}
                onClick={handleConfirmClaim}
                className="flex-1 py-2.5 rounded-xl bg-[#2D5F3F] hover:bg-[#234A31] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[17px]">check_circle</span>
                    <span>{bookingModal.requireApproval ? 'Gửi Yêu Cầu Vào Kèo' : 'Xác Nhận Nhận Suất'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VÉ QR CHECK-IN TẠI SÂN (2.6 Bước 3 & 2.7 Bước 1) ================= */}
      {qrTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 flex flex-col items-center gap-4 text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#15803D] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <h3 className="font-black text-base text-[#111827]">Vé QR Check-in LFG</h3>
              </div>
              <button
                onClick={() => setQrTicketModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center w-full">
              {qrTicketModal.isLoading ? (
                <div className="w-52 h-52 flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#3B6817] animate-spin">progress_activity</span>
                  <span className="text-xs text-gray-500 font-bold">Đang tải mã vé QR...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-52 h-52 bg-white rounded-xl p-3 border-2 border-[#15803D] shadow-sm flex items-center justify-center relative overflow-hidden">
                    {/* Simulated SVG QR Code */}
                    <svg className="w-full h-full text-[#111827]" fill="currentColor" viewBox="0 0 100 100">
                      <rect fill="none" height="26" rx="4" stroke="currentColor" strokeWidth="4" width="26" x="5" y="5"></rect>
                      <rect fill="currentColor" height="14" rx="2" width="14" x="11" y="11"></rect>
                      <rect fill="none" height="26" rx="4" stroke="currentColor" strokeWidth="4" width="26" x="69" y="5"></rect>
                      <rect fill="currentColor" height="14" rx="2" width="14" x="75" y="11"></rect>
                      <rect fill="none" height="26" rx="4" stroke="currentColor" strokeWidth="4" width="26" x="5" y="69"></rect>
                      <rect fill="currentColor" height="14" rx="2" width="14" x="11" y="75"></rect>
                      <rect height="6" rx="1" width="6" x="38" y="8"></rect>
                      <rect height="6" rx="1" width="10" x="52" y="18"></rect>
                      <rect height="12" rx="1" width="6" x="42" y="52"></rect>
                      <rect height="6" rx="1" width="12" x="80" y="38"></rect>
                      <rect height="12" rx="1" width="6" x="86" y="68"></rect>
                    </svg>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#16A34A] animate-pulse"></div>
                  </div>
                  <span className="font-mono text-xs font-black px-3 py-1 rounded-md bg-gray-200 text-gray-800 tracking-wider">
                    {qrTicketModal.ticketCode || 'SNX-LFG-PASS'}
                  </span>
                </div>
              )}
            </div>

            {/* Info Details */}
            <div className="w-full bg-[#FAFBF9] rounded-xl p-3 border border-gray-100 text-xs text-left flex flex-col gap-1.5">
              <p className="font-black text-[#111827]">{qrTicketModal.title}</p>
              <p className="text-gray-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#3B6817]">stadium</span>
                <span>{qrTicketModal.courtName}</span>
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#3B6817]">schedule</span>
                <span>Khung giờ: {qrTicketModal.time}</span>
              </p>
            </div>

            {/* Check-in rules (2.7 Bước 2) */}
            <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed text-left flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px] text-amber-600 shrink-0 mt-0.5">schedule</span>
              <div>
                <strong>Quy định Check-in tại sân:</strong> Vé chỉ check-in được từ <strong>1 tiếng trước giờ chơi</strong> đến khi hết ca; quét sớm hoặc trễ hệ thống sẽ từ chối nhận check-in.
              </div>
            </div>

            <button
              onClick={() => setQrTicketModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white text-xs font-bold cursor-pointer"
            >
              Đóng Vé QR
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: HỦY KÈO GHÉP (2.6 Bước 5) ================= */}
      {cancelMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <span className="material-symbols-outlined text-2xl">warning</span>
                <h3 className="font-black text-base text-[#111827]">Xác Nhận Hủy Kèo Ghép</h3>
              </div>
              <button
                onClick={() => setCancelMatchModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Bạn đang yêu cầu hủy kèo: <strong>{cancelMatchModal.title}</strong>
            </p>

            {/* Reason selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700">Lý do hủy kèo:</label>
              <select
                value={selectedCancelReason}
                onChange={(e) => setSelectedCancelReason(e.target.value)}
                className="p-2.5 rounded-xl border border-gray-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-[#3B6817]"
              >
                {cancelReasonsList.map((r, i) => {
                  const val = typeof r === 'string' ? r : r.label || r.reason || r.name
                  return (
                    <option key={i} value={val}>
                      {val}
                    </option>
                  )
                })}
              </select>

              {(selectedCancelReason === 'Lý do khác' || selectedCancelReason === 'Khác (Tự nhập lý do)') && (
                <textarea
                  rows="2"
                  placeholder="Nhập lý do chi tiết..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-300 text-xs w-full focus:outline-none focus:border-[#3B6817]"
                />
              )}
            </div>

            {/* Refund policy note (2.6 Bước 5) */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">policy</span>
              <div>
                <strong>Chính sách hoàn tiền (2.6 Bước 5):</strong> Hoàn 100% tiền cọc cho tất cả người tham gia. Tiền sân của chủ kèo được hoàn theo chính sách hủy đặt sân của cơ sở (trước 24h hoàn 100%).
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelMatchModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Giữ Kèo
              </button>
              <button
                type="button"
                disabled={actionLoadingId === cancelMatchModal.id}
                onClick={handleConfirmCancelMatch}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === cancelMatchModal.id ? 'Đang hủy...' : 'Xác Nhận Hủy Kèo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RỜI KÈO (2.6 Bước 4) ================= */}
      {leaveMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="material-symbols-outlined text-2xl">logout</span>
                <h3 className="font-black text-base text-[#111827]">Xác Nhận Rời Kèo</h3>
              </div>
              <button
                onClick={() => setLeaveMatchModal(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Bạn có chắc chắn muốn rời kèo ghép <strong>{leaveMatchModal.title}</strong>?
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Lý do rời kèo (tùy chọn):</label>
              <input
                type="text"
                placeholder="Nhập lý do rút khỏi trận..."
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="p-2.5 rounded-xl border border-gray-300 text-xs w-full focus:outline-none focus:border-[#3B6817]"
              />
            </div>

            {/* 2-hour window rule (2.6 Bước 4) */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">timer</span>
              <div>
                <strong>Quy định hoàn tiền:</strong> Hoàn 100% tiền cọc (hoặc rút yêu cầu đang chờ). <em>Lưu ý: Hệ thống không cho phép rời kèo trong vòng 2 giờ trước giờ chơi để bảo vệ các vận động viên khác.</em>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeaveMatchModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Ở Lại Kèo
              </button>
              <button
                type="button"
                disabled={actionLoadingId === leaveMatchModal.id}
                onClick={handleConfirmLeaveMatch}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === leaveMatchModal.id ? 'Đang xử lý...' : 'Xác Nhận Rời'}
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'badminton', label: '🏸 Cầu Lông' },
                    { key: 'pickleball', label: '🏓 Pickleball' },
                    { key: 'football', label: '⚽ Bóng Đá' },
                    { key: 'basketball', label: '🏀 Bóng Rổ' },
                    { key: 'tennis', label: '🎾 Tennis' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setNewMatch({ ...newMatch, sport: s.key })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        newMatch.sport === s.key
                          ? 'border-[#3B6817] bg-[#EAF7EE] text-[#15803D]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiêu đề kèo */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tiêu đề kèo giao lưu:</label>
                <input
                  type="text"
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
                    <label className="font-bold text-gray-800">Trình độ kỹ năng:</label>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { key: 'all', label: 'Tất cả trình độ' },
                      { key: 'beginner', label: 'Phong trào / Mới chơi' },
                      { key: 'intermediate', label: 'Trung bình - Khá' },
                      { key: 'advanced', label: 'Khá - Nâng cao' },
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

      {/* ================= MODAL: QUY CHẾ TRỌNG TÀI SỐ & PHÂN GIẢI TRANH CHẤP ================= */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                  <span className="material-symbols-outlined text-[24px]">gavel</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#111827] leading-tight">
                    Quy Chế Trọng Tài Số &amp; Bảo Chứng Ghép Trận LFG
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Hệ thống điều phối minh bạch, chống bùng kèo và tính điểm Fair Play thể thao
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRulesModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Nội Dung Quy Chế Chi Tiết */}
            <div className="flex flex-col gap-3.5 text-xs text-gray-700">
              {/* Mục 1: Thang Điểm Fair Play & Chế Tài */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">verified</span>
                  <h4>1. Thang Điểm Fair Play &amp; Chế Tài Kỷ Luật</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    <strong className="text-red-700 font-bold">Dưới 30 điểm:</strong> Tài khoản bị cấm tham gia ghép trận (LFG) và không thể tạo kèo mới.
                  </li>
                  <li>
                    <strong className="text-gray-900 font-bold">Cơ chế tự hồi điểm:</strong> Điểm số sẽ tự động phục hồi dần theo thời gian cho đến khi đạt đủ <strong>40 điểm</strong>.
                  </li>
                  <li>
                    <strong className="text-[#15803D] font-bold">Tích lũy trên 40 điểm:</strong> Muốn cộng điểm vượt mốc 40 điểm, bắt buộc người chơi phải tham gia thi đấu thực tế và được người chơi khác đánh giá tốt.
                  </li>
                  <li>
                    <strong className="text-red-700 font-bold">Vắng mặt hoặc trễ giờ:</strong> Không có mặt check-in hoặc đến trễ quá <strong>15 phút</strong> sẽ bị <strong>trừ 10 điểm</strong>.
                  </li>
                </ul>
              </div>

              {/* Mục 2: Điểm Đánh Giá Rating Sau Trận */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">star</span>
                  <h4>2. Thang Điểm Đánh Giá Chất Lượng Sau Trận (Rating)</h4>
                </div>
                <p className="text-gray-500 mb-2.5">
                  Điểm Fair Play được điều chỉnh theo điểm đánh giá trung bình từ các người chơi cùng trận:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-bold">
                  <div className="p-2.5 rounded-xl bg-white border border-red-200">
                    <span className="text-[11px] text-gray-500 block">Trung bình &lt; 1.5★</span>
                    <span className="text-sm font-black text-red-600">-5 Điểm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">Trung bình &lt; 2.5★</span>
                    <span className="text-sm font-black text-gray-500">0 Điểm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                    <span className="text-[11px] text-gray-500 block">Trung bình &gt; 4.0★</span>
                    <span className="text-sm font-black text-[#15803D]">+3 Điểm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-300 bg-[#EAF7EE]/50">
                    <span className="text-[11px] text-gray-500 block">Trung bình &gt; 4.5★</span>
                    <span className="text-sm font-black text-[#15803D]">+5 Điểm</span>
                  </div>
                </div>
              </div>

              {/* Mục 3: Cơ Chế Chia Tiền Cọc Sân */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-[#0284C7] text-[18px]">payments</span>
                  <h4>3. Cơ Chế Chia Tiền &amp; Đặt Cọc Sân</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    Người đầu tạo kèo (Host) đóng <strong className="text-gray-900 font-bold">1/4 tiền sân</strong> làm tiền cọc giữ sân ngay từ đầu.
                  </li>
                  <li>
                    Chi phí còn lại được chia đều cho <strong className="text-gray-900 font-bold">3 người chơi khác</strong>. Các thành viên nhận slot phải hoàn tất thanh toán phần chia trong vòng <strong className="text-[#0284C7] font-bold">30 phút</strong>.
                  </li>
                </ul>
              </div>

              {/* Mục 4: Chính Sách Hủy Kèo & Hoàn Cọc Escrow */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px]">assignment_return</span>
                  <h4>4. Chính Sách Hủy Kèo &amp; Hoàn Tiền Ký Quỹ Escrow</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    <strong className="text-gray-900 font-bold">Kèo chưa đủ người:</strong> Hủy bên LFG trước <strong>48 giờ</strong> nếu không đủ người tham gia thì được <strong>hoàn 100%</strong> tiền cọc.
                  </li>
                  <li>
                    <strong className="text-gray-900 font-bold">Kèo đã chốt đủ người:</strong>
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>Hủy trước <strong>24 giờ</strong> (khi có sự đồng ý của tất cả người tham gia LFG): <strong>Được hoàn tiền cọc</strong>.</li>
                      <li>Hủy sau <strong>24 giờ</strong> trước giờ chơi: <strong>Mất tiền cọc</strong> (100% tiền cọc bị trừ theo điều khoản hợp đồng).</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-red-700 font-bold">Phạt hủy kèo người tạo:</strong> Nếu kèo LFG đã tạo mà bị hủy trong vòng <strong>sau 24h trước giờ chơi</strong>: <strong>trừ 10 điểm</strong> Fair Play.
                  </li>
                </ul>
              </div>

              {/* Mục 5: Thể Thức Bóng Đá & Bóng Rổ */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-[#111827]">
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">groups</span>
                  <h4>5. Thể Thức Thi Đấu Bóng Đá &amp; Bóng Rổ (Team vs Team)</h4>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600 leading-relaxed">
                  <li>
                    <strong className="text-gray-900 font-bold">Bóng đá:</strong> Hỗ trợ ghép theo định dạng <strong>team 5, team 7, team 11</strong> (5v5, 7v7, 11v11).
                  </li>
                  <li>
                    <strong className="text-gray-900 font-bold">Bóng rổ:</strong> Ghép theo thể thức <strong>team vs team</strong> với các quy mô <strong>team 3, team 5, team 7</strong>.
                  </li>
                  <li>
                    <strong className="text-purple-700 font-bold">Quy chế Fair Play đội:</strong> Đối với thể thức ghép team vs team, việc cộng hoặc trừ điểm Fair Play sẽ áp dụng trực tiếp cho <strong>người đại diện ghép đội</strong>.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setRulesModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md shadow-[#3B6817]/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Đã hiểu &amp; Đồng ý quy chế</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: YÊU CẦU & BỎ PHIẾU HỦY KÈO (POST /cancel-requests & /vote) ===================== */}
      {cancelVoteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setCancelVoteModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">how_to_vote</span>
                <h3 className="text-base font-black text-gray-900">Biểu Quyết Hủy Kèo Ghép</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelVoteModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {cancelVoteModal.isLoading ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl animate-spin text-[#3B6817]">progress_activity</span>
                <span className="text-xs text-gray-500 font-semibold">Đang tải thông tin yêu cầu hủy...</span>
              </div>
            ) : cancelVoteModal.request ? (
              <div className="flex flex-col gap-3">
                <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Đang có yêu cầu hủy kèo cần các thành viên biểu quyết:</span>
                  </div>
                  <p><strong>Lý do:</strong> {cancelVoteModal.request.reason || 'Bận việc đột xuất'}</p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Trạng thái: <strong>{cancelVoteModal.request.status || 'PENDING_VOTE'}</strong> • Đồng ý: {cancelVoteModal.request.approveCount || 0} • Từ chối: {cancelVoteModal.request.declineCount || 0}
                  </p>
                </div>

                <p className="text-xs text-gray-600">
                  Nếu đa số thành viên đồng ý hủy, tiền cọc sẽ được hoàn lại 100% cho mọi người theo cơ chế Escrow.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleVoteCancelReq(cancelVoteModal.card.id, cancelVoteModal.request.id, false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs"
                  >
                    Không Đồng Ý
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVoteCancelReq(cancelVoteModal.card.id, cancelVoteModal.request.id, true)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
                  >
                    Đồng Ý Hủy Kèo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-600">
                  Hiện chưa có yêu cầu hủy nào cho kèo này. Nếu bạn muốn đề xuất hủy kèo để các thành viên cùng bỏ phiếu, vui lòng nhập lý do bên dưới:
                </p>

                <textarea
                  rows={3}
                  value={cancelRequestReason}
                  onChange={(e) => setCancelRequestReason(e.target.value)}
                  placeholder="Nhập lý do đề xuất hủy kèo (ví dụ: trời mưa to, sân cúp điện, ca bận đột xuất)..."
                  className="w-full text-xs text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-amber-600 resize-none"
                />

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCancelVoteModal(null)}
                    className="px-4 py-2 rounded-xl text-gray-600 font-bold text-xs hover:bg-gray-100"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingCancelReq || !cancelRequestReason.trim()}
                    onClick={() => handleCreateCancelReq(cancelVoteModal.card.id)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmittingCancelReq ? 'Đang gửi...' : 'Gửi Yêu Cầu Hủy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL: CHỈNH SỬA BÀI VIẾT (PUT /api/v1/community/posts/{postId}) ===================== */}
      {editingPost && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setEditingPost(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Chỉnh Sửa Bài Viết</h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={4}
              defaultValue={editingPost.content}
              id="editPostTextarea"
              className="w-full text-xs sm:text-sm text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#3B6817] resize-none"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 rounded-xl text-gray-600 font-bold text-xs hover:bg-gray-100"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = document.getElementById('editPostTextarea')?.value
                  if (val) handleSaveEditPost(editingPost.id, val)
                }}
                className="px-5 py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white font-bold text-xs shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityFeed
