import apiClient, { normalizeApiError } from './apiClient.js'

export const COMMUNITY_ENDPOINT = '/api/v1/community'

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
    if (data && Array.isArray(data.items)) return data
    if (Array.isArray(data)) return { items: data, totalItems: data.length, page: 1, pageSize: data.length }
    return { items: [], totalItems: 0, page: 1, pageSize: 10 }
  } catch (error) {
    console.warn('[communityApi] Lỗi lấy danh sách bài viết:', error)
    return { items: [], totalItems: 0, page: 1, pageSize: 10 }
  }
}

/**
 * Đăng bài viết mới lên bảng tin cộng đồng
 * POST /api/v1/community/posts
 * @param {Object} payload
 * @param {string} payload.content - Nội dung bài viết
 * @param {string[]} [payload.mediaUrls] - Danh sách URL ảnh đính kèm
 * @param {string} [payload.sportCategoryId] - UUID môn thể thao liên quan
 * @param {string} [payload.lfgCardId] - UUID kèo LFG nếu chia sẻ kèo
 * @param {string} [payload.tournamentId] - UUID giải đấu nếu chia sẻ giải
 * @returns {Promise<Object>}
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
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[communityApi] Lỗi khi tạo bài viết:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Lấy danh sách bài viết của tôi
 * GET /api/v1/community/my-posts
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=10]
 * @returns {Promise<{ items: Array, totalItems: number }>}
 */
export async function getMyCommunityPosts(params = {}) {
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/my-posts`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) return data
    if (Array.isArray(data)) return { items: data, totalItems: data.length }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn('[communityApi] Lỗi lấy bài viết của tôi:', error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Lấy danh sách bài viết của một người dùng
 * GET /api/v1/community/users/{userId}/posts
 * @param {string} userId
 * @param {Object} [params]
 * @returns {Promise<{ items: Array, totalItems: number }>}
 */
export async function getUserCommunityPosts(userId, params = {}) {
  if (!userId) return { items: [], totalItems: 0 }
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/users/${userId}/posts`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) return data
    if (Array.isArray(data)) return { items: data, totalItems: data.length }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn(`[communityApi] Lỗi lấy bài viết người dùng ${userId}:`, error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Xem chi tiết bài viết
 * GET /api/v1/community/posts/{postId}
 * @param {string} postId
 * @returns {Promise<Object>}
 */
export async function getCommunityPostById(postId) {
  if (!postId) return null
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/posts/${postId}`)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[communityApi] Lỗi lấy chi tiết bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Chỉnh sửa bài viết
 * PUT /api/v1/community/posts/{postId}
 * @param {string} postId
 * @param {Object} payload
 * @param {string} payload.content
 * @param {string[]} [payload.mediaUrls]
 * @param {string} [payload.sportCategoryId]
 * @param {boolean} [payload.clearSportCategory]
 * @returns {Promise<Object>}
 */
export async function updateCommunityPost(postId, payload) {
  if (!postId) throw new Error('postId không được để trống')
  try {
    const response = await apiClient.put(`${COMMUNITY_ENDPOINT}/posts/${postId}`, payload)
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[communityApi] Lỗi cập nhật bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa bài viết
 * DELETE /api/v1/community/posts/{postId}
 * @param {string} postId
 * @returns {Promise<boolean>}
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
 * @param {File} file
 * @returns {Promise<{ url: string }>}
 */
export async function uploadPostImage(file) {
  if (!file) throw new Error('Vui lòng chọn file ảnh để tải lên')
  const formData = new FormData()
  formData.append('file', file)
  try {
    const response = await apiClient.post(`${COMMUNITY_ENDPOINT}/posts/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn('[communityApi] Lỗi khi tải ảnh bài viết:', error)
    throw normalizeApiError(error)
  }
}

/**
 * Thích bài viết
 * POST /api/v1/community/posts/{postId}/like
 * @param {string} postId
 * @returns {Promise<Object>}
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
 * @param {string} postId
 * @returns {Promise<Object>}
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
 * @param {string} postId
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=20]
 * @returns {Promise<{ items: Array, totalItems: number }>}
 */
export async function getPostComments(postId, params = {}) {
  if (!postId) return { items: [], totalItems: 0 }
  try {
    const response = await apiClient.get(`${COMMUNITY_ENDPOINT}/posts/${postId}/comments`, { params })
    const body = response.data
    const data = body?.data || body?.result || body
    if (data && Array.isArray(data.items)) return data
    if (Array.isArray(data)) return { items: data, totalItems: data.length }
    return { items: [], totalItems: 0 }
  } catch (error) {
    console.warn(`[communityApi] Lỗi lấy bình luận bài viết ${postId}:`, error)
    return { items: [], totalItems: 0 }
  }
}

/**
 * Thêm bình luận vào bài viết
 * POST /api/v1/community/posts/{postId}/comments
 * @param {string} postId
 * @param {Object} payload
 * @param {string} payload.content
 * @param {string} [payload.parentCommentId]
 * @returns {Promise<Object>}
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
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi gửi bình luận cho bài viết ${postId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Cập nhật nội dung bình luận
 * PUT /api/v1/community/comments/{commentId}
 * @param {string} commentId
 * @param {string} content
 * @returns {Promise<Object>}
 */
export async function updatePostComment(commentId, content) {
  if (!commentId) throw new Error('commentId không được để trống')
  if (!content?.trim()) throw new Error('Nội dung không được để trống')
  try {
    const response = await apiClient.put(`${COMMUNITY_ENDPOINT}/comments/${commentId}`, {
      content: content.trim(),
    })
    const body = response.data
    return body?.data || body?.result || body
  } catch (error) {
    console.warn(`[communityApi] Lỗi khi sửa bình luận ${commentId}:`, error)
    throw normalizeApiError(error)
  }
}

/**
 * Xóa bình luận
 * DELETE /api/v1/community/comments/{commentId}
 * @param {string} commentId
 * @returns {Promise<boolean>}
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
}
