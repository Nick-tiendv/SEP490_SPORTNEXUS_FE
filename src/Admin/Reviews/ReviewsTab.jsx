import { useEffect, useMemo, useState } from 'react'
import { Star, Search, EyeOff, Eye, MessageSquare, Building2, Users, ChevronLeft, ChevronRight, X } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { getFacilityReviewStatistics, hideFacilityReview, listFacilityReviews, unhideFacilityReview } from '../../api/admin/facilityReviewApi.js'
import { getFairPlayStatistics, hideFairPlayRating, listFairPlayRatings, unhideFairPlayRating } from '../../api/admin/fairPlayApi.js'

const PAGE_SIZE = 20
const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
const decimal = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '—')
const percent = value => (Number.isFinite(value) ? `${(value <= 1 ? value * 100 : value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—')
const date = value => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
const stars = value => (Number.isFinite(value) ? '★'.repeat(Math.round(value)) + '☆'.repeat(Math.max(0, 5 - Math.round(value))) : '—')
const noop = () => {}

// Tab "Đánh giá & Phản hồi": đánh giá cơ sở (/admin/facility-reviews) và đánh giá fair-play giữa người chơi (/admin/fair-play/ratings).
export default function ReviewsTab() {
  const [kind, setKind] = useState('facility')
  return <>
    <div className="admin-segmented" role="tablist" aria-label="Loại đánh giá" style={{ marginBottom: 18 }}>{[['facility', 'Đánh giá cơ sở'], ['fairplay', 'Đánh giá Fair Play']].map(([value, text]) => <button key={value} type="button" role="tab" aria-selected={kind === value} className={kind === value ? 'selected' : ''} onClick={() => setKind(value)}>{text}</button>)}</div>
    {kind === 'facility' ? <FacilityReviews /> : <FairPlayRatings />}
  </>
}

function useStats(loader, reload) {
  const [state, setState] = useState({ key: -1, value: {}, error: '' })
  useEffect(() => {
    let cancelled = false
    loader().then(value => !cancelled && setState({ key: reload, value, error: '' })).catch(error => !cancelled && setState(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [loader, reload])
  return { ...state, loading: state.key !== reload }
}

function Pager({ page, list, onPage }) {
  const pages = Math.max(1, list.totalPages)
  return <footer className="rr-pagination"><span>Trang {page} / {pages} · {number(list.total)} kết quả</span><div><button className="rr-button" aria-label="Trang trước" disabled={list.loading || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={15} /></button><button className="rr-button" aria-label="Trang sau" disabled={list.loading || page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={15} /></button></div></footer>
}

function ListState({ list, empty }) {
  if (list.loading && !list.items.length) return <div className="rr-empty"><Search size={28} /><h3>Đang tải…</h3></div>
  if (list.error) return <div className="rr-empty" role="alert"><h3>Không tải được dữ liệu</h3><p>{list.error}</p></div>
  if (!list.items.length) return <div className="rr-empty"><Star size={28} /><h3>{empty}</h3></div>
  return null
}

function VisibilityBadge({ hidden }) {
  return <span className={`rr-badge ${hidden ? 'rr-hidden' : 'rr-published'}`}>{hidden ? 'Đã ẩn' : 'Đang hiển thị'}</span>
}

function FacilityReviews() {
  const [filters, setFilters] = useState({ search: '', rating: '', replied: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [dialog, setDialog] = useState(null)
  const keyword = useDebounced(filters.search.trim())
  const params = useMemo(() => ({ Keyword: keyword, Rating: filters.rating, Replied: filters.replied, FromDate: filters.from, ToDate: filters.to, Page: page, PageSize: PAGE_SIZE }), [keyword, filters.rating, filters.replied, filters.from, filters.to, page])
  const list = usePagedList(listFacilityReviews, params, reload)
  const stats = useStats(getFacilityReviewStatistics, reload)
  const s = stats.value
  const review = list.items.find(item => item.id === selectedId)
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }

  return <>
    <div className="rr-stats">{[
      ['Tổng đánh giá', number(s.totalReviews), MessageSquare, `${number(s.newReviewsLast30Days)} đánh giá trong 30 ngày`],
      ['Điểm trung bình', decimal(s.averageRating), Star, stars(s.averageRating)],
      ['Đang hiển thị', number(s.visibleReviews), Eye, 'Người chơi nhìn thấy'],
      ['Đã ẩn', number(s.hiddenReviews), EyeOff, 'Bị quản trị viên ẩn'],
      ['Chủ sân phản hồi', percent(s.ownerReplyRate), Building2, 'Tỷ lệ đánh giá được trả lời'],
    ].map(([title, value, icon, supporting]) => <StatCard key={title} label={title} value={stats.loading ? '…' : value} icon={icon} supporting={supporting} />)}</div>
    {!stats.loading && s.totalReviews > 0 && <p className="rr-demo-note">Phân bổ sao: {s.distribution.map(item => `${item.star}★ ${number(item.count)}`).join(' · ')}{s.lowestRated.length ? ` · Điểm thấp nhất: ${s.lowestRated.slice(0, 3).map(item => `${item.name} (${decimal(item.rating)})`).join(', ')}` : ''}</p>}
    <div className="rr-content"><section className="rr-list"><div className="rr-toolbar"><label className="rr-search"><Search size={16} /><input aria-label="Tìm đánh giá" placeholder="Tìm theo nội dung, người đánh giá, cơ sở…" value={filters.search} onChange={event => change('search', event.target.value)} /></label>
      <div className="rr-filters" style={{ marginTop: 12 }}><label>Số sao<select value={filters.rating} onChange={event => change('rating', event.target.value)}><option value="">Tất cả</option>{[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} sao</option>)}</select></label><label>Chủ sân phản hồi<select value={filters.replied} onChange={event => change('replied', event.target.value)}><option value="">Tất cả</option><option value="true">Đã phản hồi</option><option value="false">Chưa phản hồi</option></select></label><label>Từ ngày<input type="date" value={filters.from} onChange={event => change('from', event.target.value)} /></label><label>Đến ngày<input type="date" value={filters.to} onChange={event => change('to', event.target.value)} /></label></div></div>
      <div className="rr-table-scroll"><table><thead><tr>{['Người đánh giá', 'Cơ sở', 'Số sao', 'Nội dung', 'Phản hồi', 'Hiển thị', 'Ngày'].map(text => <th key={text}>{text}</th>)}</tr></thead><tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => setSelectedId(item.id)}><td><button className="rr-row-button" onClick={() => setSelectedId(item.id)}>{item.user}</button></td><td>{item.facility}</td><td><span className={`rr-table-rating ${item.rating <= 2 ? 'low' : ''}`}><Star size={12} fill="currentColor" />{item.rating ?? '—'}</span></td><td className="rr-excerpt" title={item.comment}>{item.comment || '—'}</td><td>{item.reply ? 'Đã phản hồi' : '—'}</td><td><VisibilityBadge hidden={item.hidden} /></td><td>{date(item.createdAt)}</td></tr>)}</tbody></table></div>
      <ListState list={list} empty="Chưa có đánh giá cơ sở nào" /><Pager page={page} list={list} onPage={setPage} /></section>
      <aside className="rr-inspector">{review ? <>
        <header><h2><Star size={17} />Chi tiết đánh giá</h2><button className="rr-button" aria-label="Đóng" onClick={() => setSelectedId(null)}><X size={14} /></button></header>
        <div className="rr-reviewer"><div className="rr-card-title"><small>NGƯỜI ĐÁNH GIÁ</small><VisibilityBadge hidden={review.hidden} /></div><div className="rr-person"><span className="rr-avatar">{review.user.slice(0, 1)}</span><div><strong>{review.user}</strong><small>{date(review.createdAt)}</small></div></div></div>
        <div className="rr-target"><small>CƠ SỞ</small><div><Building2 size={16} /><strong>{review.facility}</strong></div></div>
        <div className="rr-rating"><span>{stars(review.rating)}</span><strong>{review.rating ?? '—'}<small> / 5</small></strong></div>
        <blockquote>{review.comment || 'Không có nội dung.'}</blockquote>
        {review.reply && <div className="rr-note"><small>Chủ sân phản hồi · {date(review.repliedAt)}</small><p>{review.reply}</p></div>}
        {review.hidden && review.hiddenReason && <div className="rr-warning">Lý do ẩn: {review.hiddenReason}</div>}
        <div className="rr-actions" style={{ marginTop: 16 }}><button className="rr-button" onClick={() => setDialog({ item: review, hide: !review.hidden })}>{review.hidden ? <><Eye size={14} />Hiện lại</> : <><EyeOff size={14} />Ẩn đánh giá</>}</button></div>
      </> : <div className="rr-empty"><Star size={28} /><h2>Chọn một đánh giá</h2><p>Xem nội dung, phản hồi của chủ sân và ẩn đánh giá vi phạm.</p></div>}</aside></div>
    {dialog && <VisibilityDialog {...dialog} noun="đánh giá cơ sở" requireReason onHide={hideFacilityReview} onUnhide={unhideFacilityReview} onClose={() => setDialog(null)} onDone={() => { setDialog(null); setReload(value => value + 1) }} />}
  </>
}

function FairPlayRatings() {
  const [filters, setFilters] = useState({ maxStars: '', hidden: '' })
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [dialog, setDialog] = useState(null)
  const params = useMemo(() => ({ maxStars: filters.maxStars, hidden: filters.hidden, page, pageSize: PAGE_SIZE }), [filters.maxStars, filters.hidden, page])
  const list = usePagedList(listFairPlayRatings, params, reload)
  const stats = useStats(getFairPlayStatistics, reload)
  const s = stats.value
  const rating = list.items.find(item => item.id === selectedId)
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }

  return <>
    <div className="rr-stats">{[
      ['Tổng đánh giá Fair Play', number(s.totalRatings), MessageSquare, `${number(s.ratingsLast30Days)} đánh giá trong 30 ngày`],
      ['Đã ẩn', number(s.hiddenRatings), EyeOff, 'Bị quản trị viên ẩn'],
      ['Điểm Fair Play TB', decimal(s.averageScore), Star, `Trên ${number(s.totalUsers)} người chơi`],
      ['Dưới ngưỡng', number(s.belowThresholdUsers), Users, `Ngưỡng nhận slot: ${number(s.minClaimScore)} điểm`],
      ['Bị cấm nhận slot', number(s.claimBannedUsers), Users, 'Quản lý ở trang Người dùng → Fair Play'],
    ].map(([title, value, icon, supporting]) => <StatCard key={title} label={title} value={stats.loading ? '…' : value} icon={icon} supporting={supporting} />)}</div>
    <div className="rr-content"><section className="rr-list"><div className="rr-toolbar"><div className="rr-filters"><label>Số sao tối đa<select value={filters.maxStars} onChange={event => change('maxStars', event.target.value)}><option value="">Tất cả</option>{[1, 2, 3, 4].map(star => <option key={star} value={star}>Từ {star} sao trở xuống</option>)}</select></label><label>Hiển thị<select value={filters.hidden} onChange={event => change('hidden', event.target.value)}><option value="">Tất cả</option><option value="false">Đang hiển thị</option><option value="true">Đã ẩn</option></select></label></div></div>
      <div className="rr-table-scroll"><table><thead><tr>{['Người đánh giá', 'Người được đánh giá', 'Số sao', 'Nhận xét', 'Hiển thị', 'Ngày'].map(text => <th key={text}>{text}</th>)}</tr></thead><tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => setSelectedId(item.id)}><td><button className="rr-row-button" onClick={() => setSelectedId(item.id)}>{item.rater}</button></td><td>{item.target}</td><td><span className={`rr-table-rating ${item.stars <= 2 ? 'low' : ''}`}><Star size={12} fill="currentColor" />{item.stars ?? '—'}</span></td><td className="rr-excerpt" title={item.comment}>{item.comment || '—'}</td><td><VisibilityBadge hidden={item.hidden} /></td><td>{date(item.createdAt)}</td></tr>)}</tbody></table></div>
      <ListState list={list} empty="Chưa có đánh giá Fair Play nào" /><Pager page={page} list={list} onPage={setPage} /></section>
      <aside className="rr-inspector">{rating ? <>
        <header><h2><Star size={17} />Đánh giá Fair Play</h2><button className="rr-button" aria-label="Đóng" onClick={() => setSelectedId(null)}><X size={14} /></button></header>
        <div className="rr-reviewer"><div className="rr-card-title"><small>NGƯỜI ĐÁNH GIÁ</small><VisibilityBadge hidden={rating.hidden} /></div><div className="rr-person"><span className="rr-avatar">{rating.rater.slice(0, 1)}</span><div><strong>{rating.rater}</strong><small>{date(rating.createdAt)}{rating.context ? ` · ${rating.context}` : ''}</small></div></div></div>
        <div className="rr-target"><small>NGƯỜI ĐƯỢC ĐÁNH GIÁ</small><div><Users size={16} /><strong>{rating.target}</strong></div></div>
        <div className="rr-rating"><span>{stars(rating.stars)}</span><strong>{rating.stars ?? '—'}<small> / 5</small></strong></div>
        <blockquote>{rating.comment || 'Không có nhận xét.'}</blockquote>
        {rating.hidden && rating.hiddenReason && <div className="rr-warning">Lý do ẩn: {rating.hiddenReason}</div>}
        <p className="rr-demo-note">Đánh giá bị ẩn sẽ không được tính vào điểm Fair Play của người được đánh giá.</p>
        <div className="rr-actions"><button className="rr-button" onClick={() => setDialog({ item: rating, hide: !rating.hidden })}>{rating.hidden ? <><Eye size={14} />Hiện lại</> : <><EyeOff size={14} />Ẩn đánh giá</>}</button></div>
      </> : <div className="rr-empty"><Star size={28} /><h2>Chọn một đánh giá</h2><p>Ẩn các đánh giá không công bằng hoặc mang tính trả đũa giữa người chơi.</p></div>}</aside></div>
    {dialog && <VisibilityDialog {...dialog} noun="đánh giá Fair Play" onHide={hideFairPlayRating} onUnhide={unhideFairPlayRating} onClose={() => setDialog(null)} onDone={() => { setDialog(null); setReload(value => value + 1) }} />}
  </>
}

function VisibilityDialog({ item, hide, noun, requireReason, onHide, onUnhide, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const confirm = async () => {
    if (hide && requireReason && !reason.trim()) return setError('Vui lòng nhập lý do ẩn.')
    setSubmitting(true); setError('')
    try {
      if (hide) await onHide(item.id, reason.trim())
      else await onUnhide(item.id)
      onDone()
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={hide ? `Ẩn ${noun}` : `Hiện lại ${noun}`} onClose={submitting ? noop : onClose}>
    <p>{hide ? `Ẩn ${noun} này khỏi người dùng?` : `Cho ${noun} này hiển thị trở lại?`}</p>
    {item.comment && <blockquote className="rr-note"><p>{item.comment}</p></blockquote>}
    {hide && <div className="users-form"><label>Lý do ẩn{requireReason ? '' : ' (không bắt buộc)'}<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Ngôn từ xúc phạm, nội dung không liên quan…" /></label></div>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${hide ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Xác nhận'}</button></footer>
  </DemoDialog>
}
