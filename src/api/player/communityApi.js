import apiClient, { normalizeApiError } from '../apiClient.js'
import { readLocalAvatar } from './profileApi.js'

export const COMMUNITY_ENDPOINT = '/api/v1/community'
export const COMMENT_EDIT_WINDOW_MS = 15 * 60 * 1000 // 15 phút
const LOCAL_COMMENT_EDITS_KEY = 'sportnexus_comment_edits'
const LOCAL_COMMENT_LIKES_KEY = 'sportnexus_comment_likes'

export function parseCommunityTimeMs(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  const str = String(value).trim()
  if (!str) return 0
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(str)
  const normalized = !hasTz && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) ? `${str}Z` : str
  const ms = new Date(normalized).getTime()
  return Number.isFinite(ms) ? ms : new Date(str).getTime() || 0
}

const readCurrentLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem('sportnexus_current_user') || '{}')
  } catch {
    return {}
  }
}

export const readCommentEditMeta = (commentId) => {
  if (!commentId) return null
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_COMMENT_EDITS_KEY) || '{}')
    return map?.[String(commentId)] || null
  } catch {
    return null
  }
}

export const saveCommentEditMeta = (commentId, editedAt = new Date().toISOString()) => {
  if (!commentId) return null
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_COMMENT_EDITS_KEY) || '{}')
    const key = String(commentId)
    const prev = map[key] || {}
    const next = {
      editedAt,
      editCount: (Number(prev.editCount) || 0) + 1,
    }
    map[key] = next
    localStorage.setItem(LOCAL_COMMENT_EDITS_KEY, JSON.stringify(map))
    return next
  } catch {
    return { editedAt, editCount: 1 }
  }
}

export const readCommentLikeMeta = (commentId) => {
  if (!commentId) return { likeCount: 0, isLikedByMe: false }
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_COMMENT_LIKES_KEY) || '{}')
    return map?.[String(commentId)] || { likeCount: 0, isLikedByMe: false }
  } catch {
    return { likeCount: 0, isLikedByMe: false }
  }
}

export const toggleLikeComment = (commentId, baseCount = 0) => {
  if (!commentId) return { likeCount: baseCount, isLikedByMe: false }
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_COMMENT_LIKES_KEY) || '{}')
    const key = String(commentId)
    const prev = map[key] || { likeCount: Number(baseCount) || 0, isLikedByMe: false }
    const nextLiked = !prev.isLikedByMe
    const nextCount = Math.max(0, (Number(prev.likeCount) || 0) + (nextLiked ? 1 : -1))
    const next = { likeCount: nextCount, isLikedByMe: nextLiked }
    map[key] = next
    localStorage.setItem(LOCAL_COMMENT_LIKES_KEY, JSON.stringify(map))
    return next
  } catch {
    return { likeCount: baseCount, isLikedByMe: false }
  }
}

export const enrichPost = (post) => {
  if (!post || typeof post !== 'object') return post
  const me = readCurrentLocalUser()
  const myId = me?.id || me?.userId
  const myName = me?.fullName || me?.name
  const isMine =
    Boolean(post.isMine || post.isOwn) ||
    (myId && String(post.authorId) === String(myId)) ||
    (myName && post.authorName === myName)
  const localAvatar = readLocalAvatar() || me?.avatarUrl || null
  const authorAvatarUrl = isMine
    ? localAvatar || post.authorAvatarUrl || post.authorAvatar || null
    : post.authorAvatarUrl || post.authorAvatar || null
  return {
    ...post,
    isMine,
    authorAvatarUrl,
    authorAvatar: authorAvatarUrl,
  }
}

export const enrichComment = (comment) => {
  if (!comment || typeof comment !== 'object') return comment
  const me = readCurrentLocalUser()
  const myId = me?.id || me?.userId
  const myName = me?.fullName || me?.name
  const isMine =
    Boolean(comment.isMine || comment.isOwn) ||
    (myId && String(comment.userId || comment.authorId) === String(myId)) ||
    (myName && (comment.userName === myName || comment.authorName === myName))
  const localAvatar = readLocalAvatar() || me?.avatarUrl || null
  const userAvatarUrl = isMine
    ? localAvatar || comment.userAvatarUrl || comment.authorAvatar || null
    : comment.userAvatarUrl || comment.authorAvatar || null
  const editMeta = readCommentEditMeta(comment.id)
  const rawUpdatedAt = comment.editedAt || comment.updatedAt || null
  const hasServerEdit =
    rawUpdatedAt &&
    comment.createdAt &&
    parseCommunityTimeMs(rawUpdatedAt) > parseCommunityTimeMs(comment.createdAt) + 1000
  const editedAt = editMeta?.editedAt || (hasServerEdit ? rawUpdatedAt : null)
  const likeMeta = readCommentLikeMeta(comment.id)
  const baseLikes = Number(comment.likeCount) || 0
  return {
    ...comment,
    isMine,
    userName: comment.userName || comment.authorName || 'Người chơi',
    userAvatarUrl,
    authorAvatar: userAvatarUrl,
    editedAt,
    editCount: editMeta?.editCount || (hasServerEdit ? 1 : 0),
    likeCount: Math.max(baseLikes, Number(likeMeta.likeCount) || 0),
    isLikedByMe: Boolean(comment.isLikedByMe || likeMeta.isLikedByMe),
    replies: Array.isArray(comment.replies)
      ? comment.replies.filter((r) => r && typeof r === 'object').map(enrichComment)
      : [],
  }
}

const compressImageToDataUrl = (file, maxSize = 720, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'))
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (typeof document === 'undefined' || typeof Image === 'undefined') {
        resolve(dataUrl)
        return
      }
      const img = new Image()
      img.onerror = () => resolve(dataUrl)
      img.onload = () => {
        try {
          let { width, height } = img
          if (width > maxSize || height > maxSize) {
            if (width >= height) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, width)
          canvas.height = Math.max(1, height)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })

/**
 * Lấy danh sách bài viết trên Bảng tin cộng đồng
 * GET /api/v1/community/posts
 * @param {Object} [params]
 * @param {string} [params.SportCategoryId] - Lọc theo môn thể thao
 * @param {string} [params.AuthorId] - Lọc theo người đăng
 * @param {string} [params.Keyword] - Từ khóa tìm kiếm
 * @param {string} [params.SortBy] - Sắp xếp ('newest', 'popular', 'trending')
 * @param {number} [params.Page=1]
 * @param {number} [params.PageSize=10]
 * @returns {Promise<{ items: Array, totalItems: number, page: number, pageSize: number }>}
 */
export async function getCommunityPosts(params = {}) {
  try {
    const cleanParams = {}
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        cleanParams[key] = val
      }
    })
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/posts`, { params: cleanParams })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) {
      return { ...data, items: data.items.map(enrichPost) }
    }
    if (Array.isArray(data)) {
      return { items: data.map(enrichPost), totalItems: data.length, page: 1, pageSize: data.length }
    }
    return { items: [], totalItems: 0, page: 1, pageSize: 10 }
  } catch (error) {
    console.warn('[communityApi] Lỗi lấy danh sách bài viết:', error)
    return { items: [], totalItems: 0, page: 1, pageSize: 10 }
  }
}

/**
 * Đăng bài viết mới lên bảng tin cộng đồng
 * POST /api/v1/community/posts
 */
export async function createCommunityPost(payload) {
  if (!payload || !payload.content?.trim()) {
    throw new Error('Nội dung bài viết không được để trống')
  }
  try {
    const response = await apiClient.post(`${COMMUNITY_ENDPOINT}/posts`, {
      content: payload.content.trim(),
      mediaUrls: Array.isArray(payload.mediaUrls) ? payload.mediaUrls : [],
      sportCategoryId: payload.sportCategoryId || null,
      lfgCardId: payload.lfgCardId || null,
      tournamentId: payload.tournamentId || null,
    })
    const body = response.data
    return enrichPost(body?.data || body?.result || body)
  } catch (error) {
    console.warn('[communityApi] Lỗi khi tạo bài viết:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách bài viết của tôi
 * GET /api/v1/community/my-posts
 */
export async function getMyCommunityPosts(params = {}) {
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/my-posts`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) {
      return { ...data, items: data.items.map((p) => enrichPost({ ...p, isMine: true })) }
    }
    if (Array.isArray(data)) {
      return { items: data.map((p) => enrichPost({ ...p, isMine: true })), totalItems: data.length }
    }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn('[communityApi] Lỗi lấy bài viết của tôi:', error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Lấy danh sách bài viết của một người dùng
 * GET /api/v1/community/users/{userId}/posts
 */
export async function getUserCommunityPosts(userId, params = {}) {
  if (!userId) return { items: [], totalItems: 0 }
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/users/${userId}/posts`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) {
      return { ...data, items: data.items.map(enrichPost) }
    }
    if (Array.isArray(data)) {
      return { items: data.map(enrichPost), totalItems: data.length }
    }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn(`[communityApi] Lỗi lấy bài viết người dùng ${userId}:`, error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Xem chi tiết bài viết
 * GET /api/v1/community/posts/{postId}
 */
export async function getCommunityPostById(postId) {
  if (!postId) return null
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/posts/${postId}`)
    const body = response.data
    return enrichPost(body?.data || body?.result || body)
  } catch (error) {
    console.warn(`[communityApi] Lỗi lấy chi tiết bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Chỉnh sửa bài viết
 * PUT /api/v1/community/posts/{postId}
 */
export async function updateCommunityPost(postId, payload) {
  if (!postId) throw new Error('postId không được để trống')
  try {
    const response = await apiClient.put(`${COMMUNITY_ENDPOINT}/posts/${postId}`, payload)
    const body = response.data
    return enrichPost(body?.data || body?.result || body)
  } catch (error) {
    console.warn(`[communityApi] Lỗi cập nhật bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa bài viết
 * DELETE /api/v1/community/posts/{postId}
 */
export async function deleteCommunityPost(postId) {
  if (!postId) return false
  try {
    await apiClient.delete(`${COMMUNITY_ENDPOINT}/posts/${postId}`)
    return true
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi xóa bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Tải ảnh đính kèm bài viết lên server
 * POST /api/v1/community/posts/images
 */
export async function uploadPostImage(file) {
  if (!file) throw new Error('Vui lòng chọn file ảnh để tải lên')
  const formData = new FormData()
  formData.append('file', file)
  try {
    // Không tự đặt Content-Type: trình duyệt tự thêm multipart boundary.
    const response = await apiClient.post(`${COMMUNITY_ENDPOINT}/posts/images`, formData)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    try {
      const fallbackRes = await apiClient.post('/api/v1/uploads/images?purpose=general', formData, {
        headers: { 'Content-Type': undefined },
      })
      const fbBody = fallbackRes.data
      const fbData = fbBody?.data || fbBody?.result || fbBody
      if (fbData?.url || typeof fbData === 'string') {
        return typeof fbData === 'string' ? { url: fbData } : fbData
      }
    } catch {
      // bỏ qua để chuyển sang nén ảnh lưu cục bộ khi dịch vụ lưu trữ đám mây của BE gặp lỗi 500
    }
    const status = error?.status || error?.response?.status || 0
    if (!status || status >= 500) {
      const dataUrl = await compressImageToDataUrl(file)
      return { url: dataUrl }
    }
    console.warn('[communityApi] Lỗi khi tải ảnh bài viết:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Thích bài viết
 * POST /api/v1/community/posts/{postId}/like
 */
export async function likeCommunityPost(postId) {
  if (!postId) return null
  try {
    const response = await apiClient.post(`${COMMUNITY_ENDPOINT}/posts/${postId}/like`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi thích bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Bỏ thích bài viết
 * DELETE /api/v1/community/posts/{postId}/like
 */
export async function unlikeCommunityPost(postId) {
  if (!postId) return null
  try {
    const response = await apiClient.delete(`${COMMUNITY_ENDPOINT}/posts/${postId}/like`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi bỏ thích bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách bình luận của bài viết
 * GET /api/v1/community/posts/{postId}/comments
 */
export async function getPostComments(postId, params = {}) {
  if (!postId) return { items: [], totalItems: 0 }
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/posts/${postId}/comments`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) {
      return { ...data, items: data.items.map(enrichComment) }
    }
    if (Array.isArray(data)) {
      return { items: data.map(enrichComment), totalItems: data.length }
    }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn(`[communityApi] Lỗi lấy bình luận bài viết ${postId}:`, error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Thêm bình luận vào bài viết
 * POST /api/v1/community/posts/{postId}/comments
 */
export async function createPostComment(postId, payload) {
  if (!postId) throw new Error('postId không được để trống')
  if (!payload?.content?.trim()) throw new Error('Nội dung bình luận không được để trống')
  try {
    const response = await apiClient.post(`${COMMUNITY_ENDPOINT}/posts/${postId}/comments`, {
      content: payload.content.trim(),
      parentCommentId: payload.parentCommentId || null,
    })
    const body = response.data
    return enrichComment(body?.data || body?.result || body)
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi gửi bình luận cho bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Cập nhật nội dung bình luận (chỉ cho phép trong vòng 15 phút kể từ lúc đăng)
 * PUT /api/v1/community/comments/{commentId}
 */
export async function updatePostComment(commentId, content, createdAt = null) {
  if (!commentId) throw new Error('commentId không được để trống')
  if (!content?.trim()) throw new Error('Nội dung không được để trống')
  if (createdAt) {
    const createdMs = parseCommunityTimeMs(createdAt)
    if (createdMs > 0 && Date.now() - createdMs > COMMENT_EDIT_WINDOW_MS) {
      throw new Error('Đã quá thời hạn 15 phút kể từ lúc đăng bình luận. Không thể chỉnh sửa bình luận này nữa.')
    }
  }
  try {
    const response = await apiClient.put(`${COMMUNITY_ENDPOINT}/comments/${commentId}`, {
      content: content.trim(),
    })
    const editedAt = new Date().toISOString()
    saveCommentEditMeta(commentId, editedAt)
    const body = response.data
    const raw = body?.data || body?.result || body || {}
    return enrichComment({ ...raw, id: raw.id || commentId, content: content.trim(), editedAt })
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi sửa bình luận ${commentId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa bình luận
 * DELETE /api/v1/community/comments/{commentId}
 */
export async function deletePostComment(commentId) {
  if (!commentId) return false
  try {
    await apiClient.delete(`${COMMUNITY_ENDPOINT}/comments/${commentId}`)
    return true
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi xóa bình luận ${commentId}:`, error)
    throw normalizeApiError(error)
  }
}

export const likePost = likeCommunityPost
export const unlikePost = unlikeCommunityPost

export default {
  getCommunityPosts,
  createCommunityPost,
  getMyCommunityPosts,
  getUserCommunityPosts,
  getCommunityPostById,
  updateCommunityPost,
  deleteCommunityPost,
  uploadPostImage,
  likeCommunityPost,
  unlikeCommunityPost,
  likePost,
  unlikePost,
  getPostComments,
  createPostComment,
  updatePostComment,
  deletePostComment,
  toggleLikeComment,
  readCommentEditMeta,
  saveCommentEditMeta,
  parseCommunityTimeMs,
  COMMENT_EDIT_WINDOW_MS,
}
