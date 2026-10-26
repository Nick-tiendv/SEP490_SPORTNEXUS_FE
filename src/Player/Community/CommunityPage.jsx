import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { useCurrentUser } from '../../hooks/useCurrentUser.js'
import { getSportCategories } from '../../api/player/profileApi.js'
import {
  createCommunityPost,
  createPostComment,
  deleteCommunityPost,
  deletePostComment,
  getCommunityPosts,
  getMyCommunityPosts,
  getPostComments,
  getUserCommunityPosts,
  likeCommunityPost,
  unlikeCommunityPost,
  updateCommunityPost,
  updatePostComment,
  uploadPostImage,
} from '../../api/communityApi.js'

const PAGE_SIZE = 10
const MAX_IMAGES = 10
const initials = (name) => (name || '?').trim().split(/\s+/).map((p) => p[0]).slice(-2).join('').toUpperCase()
const timeAgo = (value) => {
  if (!value) return ''
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (minutes < 1440) return `${Math.round(minutes / 60)} giờ trước`
  return new Date(value).toLocaleDateString('vi-VN')
}
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`

function Avatar({ name, url }) {
  return <span className="snx-avatar-sm">{url ? <img src={url} alt={name} /> : initials(name)}</span>
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
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung bài viết.'); return }
    setPosting(true)
    try {
      await createCommunityPost({ content, mediaUrls: images, sportCategoryId: sportId || null })
      setContent('')
      setImages([])
      setSportId('')
      toast.success('Đã đăng bài.')
      onPosted()
    } catch (error) {
      toast.error(error?.message || 'Không đăng được bài viết.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <section className="snx-card snx-stack" style={{ gap: 12 }}>
      <div className="snx-row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={me.name} url={me.avatarUrl} />
        <textarea className="snx-textarea" style={{ flex: 1 }} maxLength={5000} placeholder="Chia sẻ trận đấu, tìm bạn chơi, hỏi kinh nghiệm…" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      {images.length > 0 && (
        <div className="snx-feed-images snx-feed-images--edit">
          {images.map((url) => (
            <div key={url} className="snx-feed-image">
              <img src={url} alt="Ảnh đính kèm" />
              <button type="button" className="snx-feed-image-remove" aria-label="Bỏ ảnh" onClick={() => setImages((prev) => prev.filter((u) => u !== url))}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="snx-row">
        <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" disabled={uploading || images.length >= MAX_IMAGES} onClick={() => fileRef.current?.click()}>
          <span className="material-symbols-outlined">add_photo_alternate</span>{uploading ? 'Đang tải ảnh…' : `Ảnh (${images.length}/${MAX_IMAGES})`}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addImages(e.target.files)} />
        <select className="snx-select" style={{ width: 'auto', minHeight: 32, height: 32, padding: '0 10px' }} value={sportId} onChange={(e) => setSportId(e.target.value)} aria-label="Môn thể thao">
          <option value="">Không gắn môn</option>
          {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="snx-spacer" />
        <span className="snx-muted">{content.length}/5000</span>
        <button type="button" className="snx-btn snx-btn--primary" disabled={posting || uploading || !content.trim()} onClick={submit}>{posting ? 'Đang đăng…' : 'Đăng bài'}</button>
      </div>
    </section>
  )
}

function Comment({ comment, postId, onChanged, depth = 0 }) {
  const [editing, setEditing] = useState(null)
  const [replying, setReplying] = useState('')
  const [showReply, setShowReply] = useState(false)
  const save = async () => {
    try { await updatePostComment(comment.id, editing); setEditing(null); onChanged() } catch (e) { toast.error(e?.message || 'Không sửa được bình luận.') }
  }
  const remove = async () => {
    if (!window.confirm('Xóa bình luận này?')) return
    try { await deletePostComment(comment.id); onChanged(true) } catch (e) { toast.error(e?.message || 'Không xóa được bình luận.') }
  }
  const reply = async () => {
    if (!replying.trim()) return
    try { await createPostComment(postId, { content: replying, parentCommentId: comment.id }); setReplying(''); setShowReply(false); onChanged() } catch (e) { toast.error(e?.message || 'Không gửi được trả lời.') }
  }
  return (
    <div className="snx-comment" style={{ marginLeft: depth ? 44 : 0 }}>
      <Avatar name={comment.userName} url={comment.userAvatarUrl} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="snx-comment-bubble">
          <strong>{comment.userName}</strong>
          {editing !== null ? (
            <div className="snx-row" style={{ marginTop: 6 }}>
              <input className="snx-input" value={editing} onChange={(e) => setEditing(e.target.value)} />
              <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={save}>Lưu</button>
              <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setEditing(null)}>Hủy</button>
            </div>
          ) : <p>{comment.content}</p>}
        </div>
        <div className="snx-comment-actions">
          <span>{timeAgo(comment.createdAt)}</span>
          {depth === 0 && <button type="button" onClick={() => setShowReply((v) => !v)}>Trả lời</button>}
          {comment.isMine && editing === null && <button type="button" onClick={() => setEditing(comment.content)}>Sửa</button>}
          {comment.isMine && <button type="button" onClick={remove}>Xóa</button>}
        </div>
        {showReply && (
          <div className="snx-row" style={{ marginTop: 6 }}>
            <input className="snx-input" placeholder={`Trả lời ${comment.userName}…`} value={replying} onChange={(e) => setReplying(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && reply()} />
            <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={reply}>Gửi</button>
          </div>
        )}
        {(comment.replies || []).filter((r) => typeof r === 'object').map((r) => (
          <Comment key={r.id} comment={r} postId={postId} onChanged={onChanged} depth={1} />
        ))}
      </div>
    </div>
  )
}

function Comments({ postId, onCountChange }) {
  const comments = useApi(() => getPostComments(postId, { page: 1, pageSize: 50 }), [postId], { initialData: { items: [] } })
  const [text, setText] = useState('')
  const send = async () => {
    if (!text.trim()) return
    try {
      await createPostComment(postId, { content: text })
      setText('')
      comments.refresh()
      onCountChange(1)
    } catch (e) {
      toast.error(e?.message || 'Không gửi được bình luận.')
    }
  }
  return (
    <div className="snx-stack" style={{ gap: 10, paddingTop: 12, borderTop: '1px solid #eef2f1' }}>
      {comments.loading && <p className="snx-muted">Đang tải bình luận…</p>}
      {(comments.data.items || []).map((c) => (
        <Comment key={c.id} comment={c} postId={postId} onChanged={(removed) => { comments.refresh(); if (removed) onCountChange(-1) }} />
      ))}
      <div className="snx-row">
        <input className="snx-input" style={{ flex: 1 }} maxLength={1000} placeholder="Viết bình luận…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={!text.trim()} onClick={send}>Gửi</button>
      </div>
    </div>
  )
}

function PostCard({ post, onAuthor, onChanged, onRemoved }) {
  const [liked, setLiked] = useState(Boolean(post.isLikedByMe))
  const [likeCount, setLikeCount] = useState(Number(post.likeCount) || 0)
  const [commentCount, setCommentCount] = useState(Number(post.commentCount) || 0)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

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
    try { await updateCommunityPost(post.id, { content: editing }); setEditing(null); onChanged() } catch (e) { toast.error(e?.message || 'Không sửa được bài viết.') }
  }
  const remove = async () => {
    if (!window.confirm('Xóa bài viết này?')) return
    try { await deleteCommunityPost(post.id); toast.success('Đã xóa bài viết.'); onRemoved(post.id) } catch (e) { toast.error(e?.message || 'Không xóa được bài viết.') }
  }

  const lfg = post.sharedLfg
  const tour = post.sharedTournament
  return (
    <article className="snx-card snx-stack" style={{ gap: 12 }}>
      <header className="snx-row" style={{ gap: 12 }}>
        <Avatar name={post.authorName} url={post.authorAvatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <button type="button" className="snx-feed-author" onClick={() => onAuthor({ id: post.authorId, name: post.authorName })}>{post.authorName}</button>
          <div className="snx-muted">{timeAgo(post.createdAt)}{post.updatedAt && post.updatedAt !== post.createdAt ? ' · đã sửa' : ''}</div>
        </div>
        {post.sportName && <span className="snx-badge snx-badge--green">{post.sportName}</span>}
        {post.isMine && editing === null && (
          <>
            <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Sửa bài" onClick={() => setEditing(post.content)}><span className="material-symbols-outlined">edit</span></button>
            <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Xóa bài" onClick={remove}><span className="material-symbols-outlined">delete</span></button>
          </>
        )}
      </header>

      {editing !== null ? (
        <div className="snx-stack" style={{ gap: 8 }}>
          <textarea className="snx-textarea" value={editing} onChange={(e) => setEditing(e.target.value)} />
          <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setEditing(null)}>Hủy</button>
            <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={save}>Lưu</button>
          </div>
        </div>
      ) : <p className="snx-feed-content">{post.content}</p>}

      {post.mediaUrls?.length > 0 && (
        <div className={`snx-feed-images snx-feed-images--${Math.min(post.mediaUrls.length, 3)}`}>
          {post.mediaUrls.slice(0, 6).map((url) => <a key={url} className="snx-feed-image" href={url} target="_blank" rel="noreferrer"><img src={url} alt="Ảnh bài viết" loading="lazy" /></a>)}
        </div>
      )}

      {lfg && (
        <Link to="/community" className="snx-feed-share">
          <span className="material-symbols-outlined">group</span>
          <div><strong>Kèo LFG · {lfg.sportName}</strong><div className="snx-muted">{lfg.facilityName} · {lfg.startTime ? new Date(lfg.startTime).toLocaleString('vi-VN') : ''} · còn {lfg.remainingSlots}/{lfg.totalSlots} suất · {money(lfg.pricePerPerson)}/người</div></div>
        </Link>
      )}
      {tour && (
        <Link to="/tournament" className="snx-feed-share">
          <span className="material-symbols-outlined">emoji_events</span>
          <div><strong>Giải đấu · {tour.name}</strong><div className="snx-muted">{tour.facilityName} · Lệ phí {money(tour.entryFee)}</div></div>
        </Link>
      )}

      <footer className="snx-row" style={{ borderTop: '1px solid #eef2f1', paddingTop: 8 }}>
        <button type="button" className={`snx-btn snx-btn--ghost snx-btn--sm ${liked ? 'snx-liked' : ''}`} aria-pressed={liked} onClick={toggleLike}>
          <span className="material-symbols-outlined">{liked ? 'favorite' : 'favorite_border'}</span>{likeCount}
        </button>
        <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span className="material-symbols-outlined">chat_bubble</span>{commentCount} bình luận
        </button>
      </footer>
      {open && <Comments postId={post.id} onCountChange={(d) => setCommentCount((c) => Math.max(0, c + d))} />}
    </article>
  )
}

const TABS = [
  { key: 'feed', label: 'Bảng tin', icon: 'dynamic_feed' },
  { key: 'mine', label: 'Bài viết của tôi', icon: 'person' },
]

export default function CommunityPage() {
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
  const sports = useApi(getSportCategories, [], { initialData: [] })

  // Tải trang bài viết theo tab / bộ lọc: GET /community/posts | /my-posts | /users/{id}/posts
  const fetchPage = useCallback(async (pageNo) => {
    const params = { page: pageNo, pageSize: PAGE_SIZE }
    if (author) return getUserCommunityPosts(author.id, params)
    if (tab === 'mine') return getMyCommunityPosts(params)
    return getCommunityPosts({ ...params, sortBy, sportCategoryId: sportId || undefined, keyword: search || undefined })
  }, [author, tab, sortBy, sportId, search])

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
    return () => { cancelled = true }
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

  return (
    <div className="snx-page">
      <PageHeader
        eyebrow="Cộng đồng"
        eyebrowIcon="forum"
        title="Cộng đồng SportNexus"
        subtitle="Chia sẻ khoảnh khắc thi đấu, tìm bạn chơi và chia sẻ kèo LFG hoặc giải đấu."
        actions={<Link to="/community" className="snx-btn snx-btn--secondary"><span className="material-symbols-outlined">group</span>Ghép trận LFG</Link>}
      />

      <div className="snx-feed-layout">
        <div className="snx-stack">
          <div className="snx-row">
            <div className="snx-tabs" role="tablist">
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key && !author} className={`snx-tab ${tab === t.key && !author ? 'active' : ''}`} onClick={() => { setAuthor(null); setTab(t.key) }}>
                  <span className="material-symbols-outlined">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
            {tab === 'feed' && !author && (
              <div className="snx-tabs" role="group" aria-label="Sắp xếp">
                <button type="button" className={`snx-tab ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => setSortBy('newest')}>Mới nhất</button>
                <button type="button" className={`snx-tab ${sortBy === 'hot' ? 'active' : ''}`} onClick={() => setSortBy('hot')}>Nổi bật</button>
              </div>
            )}
          </div>

          {author && (
            <div className="snx-alert snx-alert--info">
              Đang xem bài viết của <strong>{author.name}</strong>
              <span className="snx-spacer" />
              <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setAuthor(null)}>Quay lại bảng tin</button>
            </div>
          )}

          {tab === 'feed' && !author && <Composer sports={sports.data || []} onPosted={refresh} />}
          {tab === 'mine' && !author && <Composer sports={sports.data || []} onPosted={refresh} />}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} onAuthor={setAuthor} onChanged={refresh} onRemoved={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
          ))}
          {!loading && posts.length === 0 && (
            <div className="snx-empty"><span className="material-symbols-outlined">forum</span>{tab === 'mine' ? 'Bạn chưa có bài viết nào.' : 'Chưa có bài viết nào phù hợp.'}</div>
          )}
          {loading && <p className="snx-muted">Đang tải…</p>}
          {!loading && hasMore && <button type="button" className="snx-btn snx-btn--secondary" onClick={loadMore}>Xem thêm bài viết</button>}
        </div>

        <aside className="snx-stack snx-feed-side">
          <section className="snx-card snx-stack" style={{ gap: 10 }}>
            <h2 className="snx-card-title" style={{ fontSize: 16 }}>Tìm & lọc</h2>
            <form className="snx-stack" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); setAuthor(null); setTab('feed'); setSearch(keyword.trim()) }}>
              <label className="snx-search"><span className="material-symbols-outlined">search</span><input className="snx-input" placeholder="Nội dung hoặc tên người đăng" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></label>
              <button type="submit" className="snx-btn snx-btn--secondary">Tìm kiếm</button>
            </form>
            <div className="snx-row" style={{ gap: 6 }}>
              <button type="button" className={`snx-btn snx-btn--sm ${!sportId ? 'snx-btn--primary' : 'snx-btn--secondary'}`} onClick={() => setSportId('')}>Tất cả môn</button>
              {(sports.data || []).map((s) => (
                <button key={s.id} type="button" className={`snx-btn snx-btn--sm ${sportId === s.id ? 'snx-btn--primary' : 'snx-btn--secondary'}`} onClick={() => { setAuthor(null); setTab('feed'); setSportId(s.id) }}>{s.name}</button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
