import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { ReportModal } from '../../components/common/ReportModal.jsx'
import { RecommendedLfgWidget } from '../LFG/RecommendedLfg.jsx'
import { useApi } from '../../hooks/useApi.js'
import { useCurrentUser } from '../../hooks/useCurrentUser.js'
import { getSportCategories, readLocalAvatar } from '../../api/player/profileApi.js'
import { getMyTeams } from '../../api/player/teamApi.js'
import {
  normalizeSportKey,
  recordNewPlayerDesire,
} from '../LFG/lfgSuggestionEngine.js'
import {
  COMMENT_EDIT_WINDOW_MS,
  createCommunityPost,
  createPostComment,
  deleteCommunityPost,
  deletePostComment,
  getCommunityPosts,
  getMyCommunityPosts,
  getPostComments,
  getUserCommunityPosts,
  likeCommunityPost,
  parseCommunityTimeMs,
  toggleLikeComment,
  unlikeCommunityPost,
  updateCommunityPost,
  updatePostComment,
  uploadPostImage,
} from '../../api/player/communityApi.js'

const PAGE_SIZE = 10
const MAX_IMAGES = 10
const RECENT_COMMENT_LIMIT = 5

const COMMENT_RANGES = [
  {
    key: 'newest',
    label: 'Mới nhất',
    desc: 'Bình luận gần nhất tính theo thời gian thực',
  },
  {
    key: 'relevant',
    label: 'Phù hợp nhất',
    desc: 'Bình luận được nhiều tương tác nhất',
  },
  {
    key: 'all',
    label: 'Tất cả',
    desc: 'Hiển thị toàn bộ bình luận (xếp từ mới đến cũ từ trên xuống dưới)',
  },
]

const initials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(-2)
    .join('')
    .toUpperCase()

const timeAgo = (value, nowMs) => {
  const ts = parseCommunityTimeMs(value)
  if (!ts) return ''
  const diffMs = Math.max(0, (nowMs || ts) - ts)
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`
  const days = Math.floor(minutes / 1440)
  if (days < 7) return `${days} ngày trước`
  return new Date(ts).toLocaleDateString('vi-VN')
}

const formatEditedAgo = (value, nowMs) => {
  const ts = parseCommunityTimeMs(value)
  if (!ts) return ''
  const diffMs = Math.max(0, (nowMs || ts) - ts)
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'đã sửa vừa xong'
  if (minutes < 60) return `đã sửa ${minutes} phút trước`
  if (minutes < 1440) return `đã sửa ${Math.floor(minutes / 60)} giờ trước`
  return `đã sửa ${Math.floor(minutes / 1440)} ngày trước`
}

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`

// Đồng bộ ảnh đại diện cá nhân của người chơi hiện tại lên bài viết & bình luận
function resolveUserAvatar(item, me) {
  const personalAvatar = me?.avatarUrl || readLocalAvatar() || ''
  const isCurrentUser =
    Boolean(item?.isMine || item?.isOwn) ||
    (me?.id && String(item?.authorId || item?.userId || '') === String(me.id)) ||
    (me?.name &&
      String(item?.authorName || item?.userName || '').trim().toLowerCase() ===
        String(me.name).trim().toLowerCase())
  if (isCurrentUser && personalAvatar) return personalAvatar
  return item?.authorAvatarUrl || item?.userAvatarUrl || item?.authorAvatar || ''
}

function Avatar({ name, url }) {
  return <span className="snx-avatar-sm">{url ? <img src={url} alt={name} /> : initials(name)}</span>
}

// Hiển thị nội dung bình luận có làm nổi bật các thẻ tag @Tên người chơi
function renderCommentContent(text, candidates = []) {
  if (!text) return null
  const names = candidates
    .map((c) => (c?.name || '').trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  const escapedNames = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = escapedNames.length
    ? new RegExp(`(@(?:${escapedNames.join('|')})|@[\\p{L}\\p{N}_.-]+(?:\\s+[\\p{L}\\p{N}_.-]+){0,2})`, 'gu')
    : /(@[\p{L}\p{N}_.-]+(?:\s+[\p{L}\p{N}_.-]+){0,2})/gu

  const parts = String(text).split(pattern)
  return parts.map((part, idx) =>
    part.startsWith('@') && part.length > 1 ? (
      <span key={idx} className="snx-mention">
        {part}
      </span>
    ) : (
      <span key={idx}>{part}</span>
    )
  )
}

// Ô nhập bình luận hỗ trợ tag người chơi khác khi gõ @...
function MentionInput({
  value,
  onChange,
  onSubmit,
  candidates = [],
  autoFocus = false,
}) {
  const inputRef = useRef(null)
  const [mentionQuery, setMentionQuery] = useState(null)

  const handleChange = (e) => {
    const nextVal = e.target.value
    onChange(nextVal)
    const caret = e.target.selectionStart ?? nextVal.length
    const beforeCaret = nextVal.slice(0, caret)
    const match = beforeCaret.match(/(?:^|\s)@([^\s@]*)$/)
    if (match) {
      setMentionQuery(match[1].toLowerCase())
    } else {
      setMentionQuery(null)
    }
  }

  const filteredCandidates = useMemo(() => {
    if (mentionQuery === null) return []
    return candidates
      .filter((c) => c?.name && c.name.toLowerCase().includes(mentionQuery))
      .slice(0, 6)
  }, [candidates, mentionQuery])

  const insertMention = (playerName) => {
    const current = String(value || '')
    const caret = inputRef.current?.selectionStart ?? current.length
    const beforeCaret = current.slice(0, caret)
    const afterCaret = current.slice(caret)
    const replacedBefore = beforeCaret.match(/(?:^|\s)@([^\s@]*)$/)
      ? beforeCaret.replace(/@([^\s@]*)$/, `@${playerName} `)
      : `${beforeCaret}${beforeCaret && !beforeCaret.endsWith(' ') ? ' ' : ''}@${playerName} `
    const nextValue = `${replacedBefore}${afterCaret}`
    onChange(nextValue)
    setMentionQuery(null)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <div className="snx-mention-wrap">
      {mentionQuery !== null && filteredCandidates.length > 0 && (
        <div className="snx-mention-menu" role="listbox" aria-label="Gợi ý gắn thẻ người chơi">
          {filteredCandidates.map((c) => (
            <button
              key={c.id || c.name}
              type="button"
              className="snx-mention-item"
              onClick={() => insertMention(c.name)}
            >
              <Avatar name={c.name} url={c.avatarUrl} />
              <span>@{c.name}</span>
            </button>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        className="snx-input"
        style={{ width: '100%' }}
        maxLength={1000}
        autoFocus={autoFocus}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && mentionQuery !== null) {
            setMentionQuery(null)
            return
          }
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault()
            setMentionQuery(null)
            onSubmit()
          }
        }}
      />
    </div>
  )
}

// Ô đăng bài: nội dung, môn thể thao, ảnh (POST /community/posts/images rồi POST /community/posts)
function Composer({ sports, onPosted }) {
  const me = useCurrentUser()
  const [content, setContent] = useState('')
  const [sportId, setSportId] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef(null)

  const addImages = async (files) => {
    const list = Array.from(files || []).slice(0, MAX_IMAGES - images.length)
    if (!list.length) return
    setUploading(true)
    try {
      for (const file of list) {
        const res = await uploadPostImage(file)
        if (res?.url) setImages((prev) => [...prev, res.url])
      }
    } catch (error) {
      toast.error(error?.message || 'Không tải được ảnh.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submit = async () => {
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết.')
      return
    }
    setPosting(true)
    try {
      const created = await createCommunityPost({
        content,
        mediaUrls: images,
        sportCategoryId: sportId || null,
      })
      setContent('')
      setImages([])
      setSportId('')
      toast.success('Đã đăng bài.')
      onPosted(created)
    } catch (error) {
      toast.error(error?.message || 'Không đăng được bài viết.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <section className="snx-card snx-stack" style={{ gap: 12 }}>
      <div className="snx-row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={me.name} url={me.avatarUrl || readLocalAvatar()} />
        <textarea
          className="snx-textarea"
          style={{ flex: 1 }}
          maxLength={5000}
          placeholder="Chia sẻ trận đấu, tìm bạn chơi, hỏi kinh nghiệm…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      {images.length > 0 && (
        <div className="snx-feed-images snx-feed-images--edit">
          {images.map((url) => (
            <div key={url} className="snx-feed-image">
              <img src={url} alt="Ảnh đính kèm" />
              <button
                type="button"
                className="snx-feed-image-remove"
                aria-label="Bỏ ảnh"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="snx-row">
        <button
          type="button"
          className="snx-btn snx-btn--ghost snx-btn--sm"
          disabled={uploading || images.length >= MAX_IMAGES}
          onClick={() => fileRef.current?.click()}
        >
          <span className="material-symbols-outlined">add_photo_alternate</span>
          {uploading ? 'Đang tải ảnh…' : `Ảnh (${images.length}/${MAX_IMAGES})`}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => addImages(e.target.files)}
        />
        <select
          className="snx-select"
          style={{ width: 'auto', minHeight: 32, height: 32, padding: '0 10px' }}
          value={sportId}
          onChange={(e) => setSportId(e.target.value)}
          aria-label="Môn thể thao"
        >
          <option value="">Không gắn môn</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="snx-spacer" />
        <span className="snx-muted">{content.length}/5000</span>
        <button
          type="button"
          className="snx-btn snx-btn--primary"
          disabled={posting || uploading || !content.trim()}
          onClick={submit}
        >
          {posting ? 'Đang đăng…' : 'Đăng bài'}
        </button>
      </div>
    </section>
  )
}

function Comment({
  comment,
  postId,
  me,
  nowMs,
  mentionCandidates,
  onChanged,
  onReport,
  depth = 0,
}) {
  const [editing, setEditing] = useState(null)
  const [replying, setReplying] = useState('')
  const [showReply, setShowReply] = useState(false)
  const [liked, setLiked] = useState(Boolean(comment.isLikedByMe))
  const [likeCount, setLikeCount] = useState(Number(comment.likeCount) || 0)

  const createdMs = parseCommunityTimeMs(comment.createdAt)
  const elapsedMs = createdMs ? Math.max(0, nowMs - createdMs) : Infinity
  const isWithinEditWindow = elapsedMs <= COMMENT_EDIT_WINDOW_MS

  const editedStamp =
    comment.editedAt ||
    (comment.updatedAt && comment.updatedAt !== comment.createdAt ? comment.updatedAt : null)
  const editedLabel = editedStamp ? formatEditedAgo(editedStamp, nowMs) : ''

  const avatarUrl = resolveUserAvatar(comment, me)

  const save = async () => {
    if (!editing || !editing.trim()) {
      toast.error('Nội dung bình luận không được để trống.')
      return
    }
    if (!isWithinEditWindow) {
      setEditing(null)
      toast.error('Đã quá 15 phút kể từ lúc đăng bình luận, bạn không thể chỉnh sửa nữa.')
      return
    }
    try {
      await updatePostComment(comment.id, editing.trim(), comment.createdAt)
      setEditing(null)
      toast.success('Đã cập nhật bình luận.')
      onChanged()
    } catch (e) {
      toast.error(e?.message || 'Không sửa được bình luận.')
    }
  }

  const remove = async () => {
    if (!(await confirmDialog('Xóa bình luận này?'))) return
    try {
      await deletePostComment(comment.id)
      toast.success('Đã xóa bình luận.')
      onChanged(true)
    } catch (e) {
      toast.error(e?.message || 'Không xóa được bình luận.')
    }
  }

  const reply = async () => {
    if (!replying.trim()) return
    try {
      await createPostComment(postId, { content: replying.trim(), parentCommentId: comment.id })
      setReplying('')
      setShowReply(false)
      toast.success('Đã gửi trả lời.')
      onChanged()
    } catch (e) {
      toast.error(e?.message || 'Không gửi được trả lời.')
    }
  }

  const handleToggleLike = () => {
    const res = toggleLikeComment(comment.id, likeCount)
    setLiked(res.liked)
    setLikeCount(res.likeCount)
    onChanged()
  }

  const sortedReplies = useMemo(() => {
    return (comment.replies || [])
      .filter((r) => typeof r === 'object')
      .slice()
      .sort((a, b) => parseCommunityTimeMs(b.createdAt) - parseCommunityTimeMs(a.createdAt))
  }, [comment.replies])

  return (
    <div className="snx-comment" style={{ marginLeft: depth ? 44 : 0 }}>
      <Avatar name={comment.userName} url={avatarUrl} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="snx-comment-bubble" style={{ width: editing !== null ? '100%' : undefined }}>
          <strong>{comment.userName}</strong>
          {editing !== null ? (
            <div className="snx-row" style={{ gap: 6, marginTop: 6 }}>
              <MentionInput
                value={editing}
                onChange={setEditing}
                onSubmit={save}
                candidates={mentionCandidates}
                autoFocus
              />
              <button
                type="button"
                className="snx-btn snx-btn--primary snx-btn--sm"
                onClick={save}
              >
                Lưu
              </button>
              <button
                type="button"
                className="snx-btn snx-btn--ghost snx-btn--sm"
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
            </div>
          ) : (
            <p>{renderCommentContent(comment.content, mentionCandidates)}</p>
          )}
        </div>

        <div className="snx-comment-actions">
          <span>
            {timeAgo(comment.createdAt, nowMs)}
            {editedLabel ? ` · ${editedLabel}` : ''}
          </span>
          <button
            type="button"
            className={liked ? 'snx-liked' : ''}
            onClick={handleToggleLike}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {liked ? 'favorite' : 'favorite_border'}
            </span>
            Thích{likeCount > 0 ? ` (${likeCount})` : ''}
          </button>
          {depth === 0 && (
            <button type="button" onClick={() => setShowReply((v) => !v)}>
              Trả lời
            </button>
          )}
          {comment.isMine && editing === null && isWithinEditWindow && (
            <button
              type="button"
              onClick={() => setEditing(comment.content)}
            >
              Sửa
            </button>
          )}
          {comment.isMine && (
            <button type="button" onClick={remove}>
              Xóa
            </button>
          )}
          {/* Nút Báo cáo nằm bên phải ngoài cùng của thanh thao tác bình luận */}
          <button
            type="button"
            className="snx-comment-report-btn"
            onClick={() =>
              onReport({
                targetType: 'POST_COMMENT',
                targetId: comment.id,
                targetUserId: comment.userId || comment.authorId || null,
                targetName: `Bình luận của ${comment.userName || 'người chơi'}`,
              })
            }
            title="Báo cáo bình luận vi phạm quy tắc cộng đồng"
          >
            <span className="material-symbols-outlined">flag</span>
            Báo cáo
          </button>
        </div>

        {showReply && (
          <div className="snx-row" style={{ marginTop: 6, alignItems: 'flex-start' }}>
            <MentionInput
              value={replying}
              onChange={setReplying}
              onSubmit={reply}
              candidates={mentionCandidates}
              autoFocus
            />
            <button
              type="button"
              className="snx-btn snx-btn--primary snx-btn--sm"
              disabled={!replying.trim()}
              onClick={reply}
            >
              Gửi
            </button>
          </div>
        )}

        {sortedReplies.map((r) => (
          <Comment
            key={r.id}
            comment={r}
            postId={postId}
            me={me}
            nowMs={nowMs}
            mentionCandidates={mentionCandidates}
            onChanged={onChanged}
            onReport={onReport}
            depth={1}
          />
        ))}
      </div>
    </div>
  )
}

function Comments({ postId, me, nowMs, baseMentionCandidates, onCountChange, onReport }) {
  const comments = useApi(() => getPostComments(postId, { page: 1, pageSize: 100 }), [postId], {
    initialData: { items: [] },
  })
  const [text, setText] = useState('')
  const [commentRange, setCommentRange] = useState('newest')

  const rawItems = useMemo(() => comments.data?.items || [], [comments.data])

  // Tập hợp danh sách người chơi có thể được @tag trong phần bình luận
  const mentionCandidates = useMemo(() => {
    const map = new Map()
    const addCandidate = (id, name, avatarUrl) => {
      const cleanName = String(name || '').trim()
      if (!cleanName) return
      const key = cleanName.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { id: id || key, name: cleanName, avatarUrl: avatarUrl || '' })
      }
    }
    ;(baseMentionCandidates || []).forEach((u) => addCandidate(u.id, u.name, u.avatarUrl))
    rawItems.forEach((c) => {
      addCandidate(c.userId, c.userName, resolveUserAvatar(c, me))
      ;(c.replies || []).forEach((r) => {
        if (typeof r === 'object') addCandidate(r.userId, r.userName, resolveUserAvatar(r, me))
      })
    })
    return Array.from(map.values())
  }, [baseMentionCandidates, rawItems, me])

  // Sắp xếp và lọc theo range loại bình luận:
  // - Mới nhất: bình luận gần nhất tính theo thời gian thực
  // - Phù hợp nhất: bình luận được nhiều tương tác nhất (tim + phản hồi)
  // - Tất cả: hiển thị toàn bộ bình luận có trong bài viết và xếp từ mới đến cũ từ trên xuống dưới
  const displayedComments = useMemo(() => {
    const newestSorted = rawItems
      .slice()
      .sort((a, b) => parseCommunityTimeMs(b.createdAt) - parseCommunityTimeMs(a.createdAt))

    if (commentRange === 'all') {
      return newestSorted
    }
    if (commentRange === 'relevant') {
      return rawItems.slice().sort((a, b) => {
        const scoreA = (Number(a.likeCount) || 0) + ((a.replies || []).length || 0) * 2
        const scoreB = (Number(b.likeCount) || 0) + ((b.replies || []).length || 0) * 2
        if (scoreB !== scoreA) return scoreB - scoreA
        return parseCommunityTimeMs(b.createdAt) - parseCommunityTimeMs(a.createdAt)
      })
    }
    // 'newest': bình luận gần nhất tính theo thời gian thực
    return newestSorted.slice(0, RECENT_COMMENT_LIMIT)
  }, [rawItems, commentRange])

  const send = async () => {
    if (!text.trim()) return
    try {
      await createPostComment(postId, { content: text.trim() })
      setText('')
      comments.refresh()
      onCountChange(1)
    } catch (e) {
      toast.error(e?.message || 'Không gửi được bình luận.')
    }
  }

  return (
    <div className="snx-stack" style={{ gap: 10, paddingTop: 12, borderTop: '1px solid #eef2f1' }}>
      {/* Range chọn loại hiển thị bình luận */}
      <div className="snx-comment-range">
        <div className="snx-comment-range-label">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            sort
          </span>
          <span>Loại bình luận:</span>
        </div>
        <div className="snx-comment-range-tabs" role="tablist" aria-label="Phân loại bình luận">
          {COMMENT_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={commentRange === r.key}
              className={`snx-comment-range-btn ${commentRange === r.key ? 'active' : ''}`}
              onClick={() => setCommentRange(r.key)}
              title={r.desc}
            >
              {r.label}
              {r.key === 'all' && rawItems.length > 0 ? ` (${rawItems.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Ô nhập bình luận */}
      <div className="snx-row" style={{ alignItems: 'flex-start' }}>
        <Avatar name={me.name} url={me.avatarUrl || readLocalAvatar()} />
        <MentionInput
          value={text}
          onChange={setText}
          onSubmit={send}
          candidates={mentionCandidates}
        />
        <button
          type="button"
          className="snx-btn snx-btn--primary snx-btn--sm"
          style={{ height: 40 }}
          disabled={!text.trim()}
          onClick={send}
        >
          Gửi
        </button>
      </div>

      {comments.loading && <p className="snx-muted">Đang tải bình luận…</p>}
      {!comments.loading && displayedComments.length === 0 && (
        <p className="snx-muted">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
      )}
      {displayedComments.map((c) => (
        <Comment
          key={c.id}
          comment={c}
          postId={postId}
          me={me}
          nowMs={nowMs}
          mentionCandidates={mentionCandidates}
          onReport={onReport}
          onChanged={(removed) => {
            comments.refresh()
            if (removed) onCountChange(-1)
          }}
        />
      ))}
      {commentRange === 'newest' && rawItems.length > RECENT_COMMENT_LIMIT && (
        <button
          type="button"
          className="snx-btn snx-btn--ghost snx-btn--sm"
          onClick={() => setCommentRange('all')}
        >
          Xem toàn bộ {rawItems.length} bình luận (xếp từ mới đến cũ)
        </button>
      )}
    </div>
  )
}

function PostCard({
  post,
  me,
  nowMs,
  baseMentionCandidates,
  onAuthor,
  onChanged,
  onRemoved,
  onReport,
}) {
  const [liked, setLiked] = useState(Boolean(post.isLikedByMe))
  const [likeCount, setLikeCount] = useState(Number(post.likeCount) || 0)
  const [commentCount, setCommentCount] = useState(Number(post.commentCount) || 0)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const authorAvatarUrl = resolveUserAvatar(post, me)

  const toggleLike = async () => {
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    try {
      const res = next ? await likeCommunityPost(post.id) : await unlikeCommunityPost(post.id)
      if (res && Number.isFinite(Number(res.likeCount))) setLikeCount(Number(res.likeCount))
    } catch (e) {
      setLiked(!next)
      setLikeCount((c) => c + (next ? -1 : 1))
      toast.error(e?.message || 'Không thực hiện được.')
    }
  }
  const save = async () => {
    try {
      await updateCommunityPost(post.id, { content: editing })
      setEditing(null)
      toast.success('Đã sửa bài viết.')
      onChanged()
    } catch (e) {
      toast.error(e?.message || 'Không sửa được bài viết.')
    }
  }
  const remove = async () => {
    if (!(await confirmDialog('Xóa bài viết này?'))) return
    try {
      await deleteCommunityPost(post.id)
      toast.success('Đã xóa bài viết.')
      onRemoved(post.id)
    } catch (e) {
      toast.error(e?.message || 'Không xóa được bài viết.')
    }
  }

  const lfg = post.sharedLfg
  const tour = post.sharedTournament
  return (
    <article className="snx-card snx-stack" style={{ gap: 12 }}>
      <header className="snx-row" style={{ gap: 12 }}>
        <Avatar name={post.authorName} url={authorAvatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            className="snx-feed-author"
            onClick={() => onAuthor({ id: post.authorId, name: post.authorName })}
          >
            {post.authorName}
          </button>
          <div className="snx-muted">
            {timeAgo(post.createdAt, nowMs)}
            {post.updatedAt && post.updatedAt !== post.createdAt
              ? ` · ${formatEditedAgo(post.updatedAt, nowMs)}`
              : ''}
          </div>
        </div>
        {post.sportName && <span className="snx-badge snx-badge--green">{post.sportName}</span>}
        {post.isMine && editing === null && (
          <>
            <button
              type="button"
              className="snx-btn snx-btn--ghost snx-btn--icon"
              aria-label="Sửa bài"
              onClick={() => setEditing(post.content)}
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button
              type="button"
              className="snx-btn snx-btn--ghost snx-btn--icon"
              aria-label="Xóa bài"
              onClick={remove}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </>
        )}
      </header>

      {editing !== null ? (
        <div className="snx-stack" style={{ gap: 8 }}>
          <textarea
            className="snx-textarea"
            value={editing}
            onChange={(e) => setEditing(e.target.value)}
          />
          <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="snx-btn snx-btn--secondary snx-btn--sm"
              onClick={() => setEditing(null)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="snx-btn snx-btn--primary snx-btn--sm"
              onClick={save}
            >
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <p className="snx-feed-content">{post.content}</p>
      )}

      {post.mediaUrls?.length > 0 && (
        <div className={`snx-feed-images snx-feed-images--${Math.min(post.mediaUrls.length, 3)}`}>
          {post.mediaUrls.slice(0, 6).map((url) => (
            <a key={url} className="snx-feed-image" href={url} target="_blank" rel="noreferrer">
              <img src={url} alt="Ảnh bài viết" loading="lazy" />
            </a>
          ))}
        </div>
      )}

      {lfg && (
        <Link to="/community" className="snx-feed-share">
          <span className="material-symbols-outlined">group</span>
          <div>
            <strong>Kèo LFG · {lfg.sportName}</strong>
            <div className="snx-muted">
              {lfg.facilityName} ·{' '}
              {lfg.startTime ? new Date(lfg.startTime).toLocaleString('vi-VN') : ''} · còn{' '}
              {lfg.remainingSlots}/{lfg.totalSlots} suất · {money(lfg.pricePerPerson)}/người
            </div>
          </div>
        </Link>
      )}
      {tour && (
        <Link to="/tournament" className="snx-feed-share">
          <span className="material-symbols-outlined">emoji_events</span>
          <div>
            <strong>Giải đấu · {tour.name}</strong>
            <div className="snx-muted">
              {tour.facilityName} · Lệ phí {money(tour.entryFee)}
            </div>
          </div>
        </Link>
      )}

      <footer className="snx-row" style={{ borderTop: '1px solid #eef2f1', paddingTop: 8 }}>
        <button
          type="button"
          className={`snx-btn snx-btn--ghost snx-btn--sm ${liked ? 'snx-liked' : ''}`}
          aria-pressed={liked}
          onClick={toggleLike}
        >
          <span className="material-symbols-outlined">
            {liked ? 'favorite' : 'favorite_border'}
          </span>
          {likeCount}
        </button>
        <button
          type="button"
          className="snx-btn snx-btn--ghost snx-btn--sm"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          {commentCount} bình luận
        </button>
        <span className="snx-spacer" />
        {/* Nút Báo cáo hiển thị bên phải ngoài cùng cho mọi người chơi (người đăng, người bình luận, người thả tim, người chơi khác) */}
        <button
          type="button"
          className="snx-btn snx-btn--danger snx-btn--sm"
          onClick={() =>
            onReport({
              targetType: 'COMMUNITY_POST',
              targetId: post.id,
              targetUserId: post.authorId || null,
              targetName: `Bài viết của ${post.authorName || 'người chơi'}`,
            })
          }
          title="Báo cáo bài viết nếu vi phạm tiêu chuẩn cộng đồng"
        >
          <span className="material-symbols-outlined">flag</span>
          Báo cáo
        </button>
      </footer>
      {open && (
        <Comments
          postId={post.id}
          me={me}
          nowMs={nowMs}
          baseMentionCandidates={baseMentionCandidates}
          onCountChange={(d) => setCommentCount((c) => Math.max(0, c + d))}
          onReport={onReport}
        />
      )}
    </article>
  )
}

const TABS = [
  { key: 'feed', label: 'Bảng tin', icon: 'dynamic_feed' },
  { key: 'mine', label: 'Bài viết của tôi', icon: 'person' },
]

export default function CommunityPage() {
  const me = useCurrentUser()
  const [tab, setTab] = useState('feed')
  const [sortBy, setSortBy] = useState('newest')
  const [sportId, setSportId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [reportTarget, setReportTarget] = useState(null)
  const [teamPlayers, setTeamPlayers] = useState([])
  const [nowMs, setNowMs] = useState(() => Date.now())
  const sports = useApi(getSportCategories, [], { initialData: [] })

  // Đồng hồ thời gian thực cập nhật mỗi 15 giây để hiển thị chính xác thời gian đăng & chỉnh sửa bình luận
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 15000)
    return () => clearInterval(id)
  }, [])

  // Tải danh sách đồng đội để hỗ trợ gợi ý khi @tag người chơi trong bình luận
  useEffect(() => {
    let active = true
    getMyTeams()
      .then((teams) => {
        if (!active || !Array.isArray(teams)) return
        const members = []
        teams.forEach((t) => {
          if (t?.leaderName) members.push({ id: t.leaderId, name: t.leaderName })
          ;(t?.members || []).forEach((m) => {
            if (m?.fullName || m?.name) {
              members.push({
                id: m.userId || m.id,
                name: m.fullName || m.name,
                avatarUrl: m.avatarUrl || '',
              })
            }
          })
        })
        setTeamPlayers(members)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Tải trang bài viết theo tab / bộ lọc: GET /community/posts | /my-posts | /users/{id}/posts
  const fetchPage = useCallback(
    async (pageNo) => {
      const params = { page: pageNo, pageSize: PAGE_SIZE }
      if (author) return getUserCommunityPosts(author.id, params)
      if (tab === 'mine') return getMyCommunityPosts(params)
      return getCommunityPosts({
        ...params,
        sortBy,
        sportCategoryId: sportId || undefined,
        keyword: search || undefined,
      })
    },
    [author, tab, sortBy, sportId, search]
  )

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(() => !cancelled && setLoading(true))
    fetchPage(1)
      .then((res) => {
        if (cancelled) return
        const items = res?.items || []
        setPosts(items)
        setPage(1)
        setHasMore(Number(res?.totalPages || 0) > 1 || items.length === PAGE_SIZE)
      })
      .catch((e) => !cancelled && toast.error(e?.message || 'Không tải được bài viết.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [fetchPage, reload])

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await fetchPage(page + 1)
      const items = res?.items || []
      setPosts((prev) => [...prev, ...items.filter((p) => !prev.some((x) => x.id === p.id))])
      setPage(page + 1)
      setHasMore(items.length === PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => setReload((n) => n + 1)

  // Sắp xếp hiển thị thời gian bài viết mới nhất trên đầu trang dựa theo thời gian thực
  const displayedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (sportId && String(post.sportCategoryId || '') !== String(sportId)) {
        const selectedSport = (sports.data || []).find((s) => String(s.id) === String(sportId))
        if (selectedSport && post.sportName && post.sportName !== selectedSport.name) return false
      }
      if (search.trim()) {
        const kw = search.trim().toLowerCase()
        const hay = `${post.content || ''} ${post.authorName || ''} ${post.sportName || ''}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })

    return filtered.slice().sort((a, b) => {
      if (sortBy === 'hot') {
        const hotA = (Number(a.likeCount) || 0) + (Number(a.commentCount) || 0) * 2
        const hotB = (Number(b.likeCount) || 0) + (Number(b.commentCount) || 0) * 2
        if (hotB !== hotA) return hotB - hotA
      }
      return parseCommunityTimeMs(b.createdAt) - parseCommunityTimeMs(a.createdAt)
    })
  }, [posts, sportId, search, sortBy, sports.data])

  // Danh sách người chơi gợi ý khi gõ @ trong bình luận
  const baseMentionCandidates = useMemo(() => {
    const map = new Map()
    const add = (id, name, avatarUrl) => {
      const clean = String(name || '').trim()
      if (!clean) return
      const key = clean.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { id: id || key, name: clean, avatarUrl: avatarUrl || '' })
      }
    }
    if (me?.name) add(me.id, me.name, me.avatarUrl || readLocalAvatar())
    posts.forEach((p) => add(p.authorId, p.authorName, resolveUserAvatar(p, me)))
    teamPlayers.forEach((tp) => add(tp.id, tp.name, tp.avatarUrl))
    return Array.from(map.values())
  }, [posts, teamPlayers, me])

  return (
    <div className="snx-page">
      <PageHeader
        eyebrow="Cộng đồng"
        eyebrowIcon="forum"
        title="Cộng đồng SportNexus"
        subtitle="Chia sẻ khoảnh khắc thi đấu, tìm bạn chơi và chia sẻ kèo LFG hoặc giải đấu."
        actions={
          <Link to="/community" className="snx-btn snx-btn--secondary">
            <span className="material-symbols-outlined">group</span>Ghép trận LFG
          </Link>
        }
      />

      <div className="snx-feed-layout">
        <div className="snx-stack">
          <div className="snx-row">
            <div className="snx-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key && !author}
                  className={`snx-tab ${tab === t.key && !author ? 'active' : ''}`}
                  onClick={() => {
                    setAuthor(null)
                    setTab(t.key)
                  }}
                >
                  <span className="material-symbols-outlined">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            {tab === 'feed' && !author && (
              <div className="snx-tabs" role="group" aria-label="Sắp xếp">
                <button
                  type="button"
                  className={`snx-tab ${sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => setSortBy('newest')}
                >
                  Mới nhất
                </button>
                <button
                  type="button"
                  className={`snx-tab ${sortBy === 'hot' ? 'active' : ''}`}
                  onClick={() => setSortBy('hot')}
                >
                  Nổi bật
                </button>
              </div>
            )}
          </div>

          {author && (
            <div className="snx-alert snx-alert--info">
              Đang xem bài viết của <strong>{author.name}</strong>
              <span className="snx-spacer" />
              <button
                type="button"
                className="snx-btn snx-btn--ghost snx-btn--sm"
                onClick={() => setAuthor(null)}
              >
                Quay lại bảng tin
              </button>
            </div>
          )}

          {tab === 'feed' && !author && <Composer sports={sports.data || []} onPosted={refresh} />}
          {tab === 'mine' && !author && <Composer sports={sports.data || []} onPosted={refresh} />}

          {displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              me={me}
              nowMs={nowMs}
              baseMentionCandidates={baseMentionCandidates}
              onAuthor={setAuthor}
              onChanged={refresh}
              onRemoved={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              onReport={(target) => setReportTarget(target)}
            />
          ))}
          {!loading && displayedPosts.length === 0 && (
            <div className="snx-empty">
              <span className="material-symbols-outlined">forum</span>
              {tab === 'mine' ? 'Bạn chưa có bài viết nào.' : 'Chưa có bài viết nào phù hợp.'}
            </div>
          )}
          {loading && <p className="snx-muted">Đang tải…</p>}
          {!loading && hasMore && (
            <button type="button" className="snx-btn snx-btn--secondary" onClick={loadMore}>
              Xem thêm bài viết
            </button>
          )}
        </div>

        <aside className="snx-stack snx-feed-side">
          <section className="snx-card snx-stack" style={{ gap: 10 }}>
            <h2 className="snx-card-title" style={{ fontSize: 16 }}>
              Tìm &amp; lọc
            </h2>
            <form
              className="snx-stack"
              style={{ gap: 8 }}
              onSubmit={(e) => {
                e.preventDefault()
                setAuthor(null)
                setTab('feed')
                const kw = keyword.trim()
                setSearch(kw)
                if (kw) {
                  recordNewPlayerDesire({ keyword: kw, source: 'Tìm kiếm Bảng tin cộng đồng' })
                }
              }}
            >
              <label className="snx-search">
                <span className="material-symbols-outlined">search</span>
                <input
                  className="snx-input"
                  placeholder="Nội dung hoặc tên người đăng"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </label>
              <button type="submit" className="snx-btn snx-btn--secondary">
                Tìm kiếm
              </button>
            </form>
            <div className="snx-row" style={{ gap: 6 }}>
              <button
                type="button"
                className={`snx-btn snx-btn--sm ${!sportId ? 'snx-btn--primary' : 'snx-btn--secondary'}`}
                onClick={() => setSportId('')}
              >
                Tất cả môn
              </button>
              {(sports.data || []).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`snx-btn snx-btn--sm ${sportId === s.id ? 'snx-btn--primary' : 'snx-btn--secondary'}`}
                  onClick={() => {
                    setAuthor(null)
                    setTab('feed')
                    setSportId(s.id)
                    const sk = normalizeSportKey(s.name)
                    if (sk) {
                      recordNewPlayerDesire({
                        sportKey: sk,
                        source: 'Lọc môn trên Bảng tin cộng đồng',
                      })
                    }
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </section>
          {/* Kèo phù hợp với bạn (theo khảo sát người chơi) */}
          <RecommendedLfgWidget />
        </aside>
      </div>

      {/* Hộp thoại Báo cáo bài viết / bình luận vi phạm tiêu chuẩn cộng đồng */}
      {reportTarget && (
        <ReportModal
          open={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.targetType}
          targetId={reportTarget.targetId}
          targetUserId={reportTarget.targetUserId}
          targetName={reportTarget.targetName}
        />
      )}
    </div>
  )
}
