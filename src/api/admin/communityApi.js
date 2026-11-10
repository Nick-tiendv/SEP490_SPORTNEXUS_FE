import { get, patch, path } from '../owner/request.js'

// ---------- Admin xử lý vi phạm cộng đồng trực tiếp: /api/v1/admin/community ----------
// Ẩn / bỏ ẩn bài viết, bình luận (kèm lý do, BE báo tác giả). Xử lý theo báo cáo: POST /api/v1/reports/admin/{id}/resolve.
// { posts: [{ id, authorId, authorName, content, hiddenReason, createdAt }], comments: [{ id, postId, userId, userName, content, hiddenReason, createdAt }] }
export const getHiddenContent = () => get('/api/v1/admin/community/hidden')
export const hidePost = (postId, reason) => patch(`/api/v1/admin/community/posts/${path(postId)}/hide`, { reason })
export const unhidePost = postId => patch(`/api/v1/admin/community/posts/${path(postId)}/unhide`)
export const hideComment = (commentId, reason) => patch(`/api/v1/admin/community/comments/${path(commentId)}/hide`, { reason })
export const unhideComment = commentId => patch(`/api/v1/admin/community/comments/${path(commentId)}/unhide`)
