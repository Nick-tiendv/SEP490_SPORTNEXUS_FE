import { useEffect, useState } from 'react'
import { Search, RefreshCw, X, ShieldCheck, Check, Ban, FileImage, ExternalLink } from 'lucide-react'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { approveOwnerVerification, getOwnerVerification, listOwnerVerifications, rejectOwnerVerification } from '../../api/admin/ownerVerificationApi.js'

const verificationLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã xác minh', REJECTED: 'Đã từ chối' }
export function VerificationBadge({ status }) {
  return <span className={`owners-verification ${status === 'APPROVED' ? '' : status.toLowerCase()}`}>{verificationLabels[status] || status}</span>
}
const formatDate = value => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
const formatDateTime = value => (value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—')
const noop = () => {}

export default function OwnerVerifications({ tabs, initialId, onChanged }) {
  const [status, setStatus] = useState(initialId ? '' : 'PENDING')
  const [search, setSearch] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [list, setList] = useState({ key: '', items: [], total: 0, totalPages: 1, error: '' })
  const [detailId, setDetailId] = useState(initialId || null)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const pageSize = 20

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])
  const listKey = JSON.stringify([status, keyword, page, reload])
  const loading = list.key !== listKey
  useEffect(() => {
    let cancelled = false
    listOwnerVerifications({ status, keyword, page, pageSize })
      .then(({ items, total, totalPages }) => !cancelled && setList({ key: listKey, items, total, totalPages: totalPages || Math.max(1, Math.ceil(total / pageSize)), error: '' }))
      .catch(error => !cancelled && setList(previous => ({ ...previous, key: listKey, error: error.message })))
    return () => { cancelled = true }
  }, [listKey, status, keyword, page])

  const changeStatus = value => { setStatus(value); setPage(1) }
  const done = message => { setDialog(null); setNotice(message); setReload(value => value + 1); onChanged?.() }
  const pages = Math.max(1, list.totalPages)

  return <div className={`owners-page ${detailId ? 'with-details' : ''}`}>
    <div className="owners-main-content">
      <header className="owners-page-heading admin-page-header"><div><h1>Xác minh chủ sân <span>{loading && !list.items.length ? '…' : `${list.total.toLocaleString('vi-VN')} hồ sơ`}</span></h1><p>Duyệt giấy tờ KYC trước khi chủ sân được đăng cơ sở lên SportNexus.</p></div><div className="owners-heading-actions">{tabs}<button className="users-button" onClick={() => setReload(value => value + 1)} disabled={loading}><RefreshCw size={15} />Làm mới</button></div></header>
      <section className="owners-toolbar" aria-label="Bộ lọc hồ sơ xác minh"><div className="owners-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm hồ sơ xác minh" placeholder="Tên, email, số điện thoại…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label><select aria-label="Lọc trạng thái xác minh" value={status} onChange={event => changeStatus(event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(verificationLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div></section>
      {list.error && <div className="users-notice" role="alert">Không tải được hồ sơ xác minh: {list.error}<button aria-label="Thử lại" onClick={() => setReload(value => value + 1)}>↻</button></div>}
      {notice && <div className="users-notice" role="status">{notice}<button aria-label="Đóng thông báo" onClick={() => setNotice('')}><X size={14} /></button></div>}
      <section className="owners-table-panel" aria-label="Danh sách hồ sơ xác minh" aria-busy={loading}><div className="owners-table-scroll"><table><thead><tr><th>Tài khoản</th><th>Họ tên trên giấy tờ</th><th>Số CCCD</th><th>Ngày gửi</th><th>Trạng thái</th></tr></thead><tbody style={loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.id} className={item.id === detailId ? 'is-selected' : ''} onClick={() => setDetailId(item.id)}><td><button className="owners-table-profile" aria-label={`Xem hồ sơ ${item.accountName || item.fullName}`} onClick={event => { event.stopPropagation(); setDetailId(item.id) }}><UserAvatar user={{ name: item.accountName || item.fullName }} /><span><strong>{item.accountName || '—'}</strong><small>{item.accountEmail}</small></span></button></td><td>{item.fullName || '—'}</td><td>{item.idNumber || '—'}</td><td>{formatDate(item.createdAt)}</td><td><VerificationBadge status={item.status} /></td></tr>)}</tbody></table></div>
        {loading && !list.items.length && <div className="users-empty"><ShieldCheck size={25} /><h3>Đang tải hồ sơ…</h3></div>}
        {!loading && !list.items.length && <div className="users-empty"><ShieldCheck size={25} /><h3>{status === 'PENDING' && !keyword ? 'Không có hồ sơ nào đang chờ duyệt' : 'Không có hồ sơ phù hợp'}</h3></div>}
        <footer className="owners-pagination"><span>Trang {page} / {pages} · {list.total.toLocaleString('vi-VN')} hồ sơ</span><nav aria-label="Phân trang hồ sơ xác minh"><button disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Trước</button><button disabled={loading || page >= pages} onClick={() => setPage(page + 1)}>Sau</button></nav></footer></section>
    </div>
    {detailId && <VerificationDetails key={`${detailId}#${reload}`} id={detailId} base={list.items.find(item => item.id === detailId)} onClose={() => setDetailId(null)} onApprove={item => setDialog({ type: 'approve', item })} onReject={item => setDialog({ type: 'reject', item })} />}
    {dialog && <ReviewDialog type={dialog.type} item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}

function VerificationDetails({ id, base, onClose, onApprove, onReject }) {
  const [state, setState] = useState({ item: null, error: '' })
  useEffect(() => {
    let cancelled = false
    getOwnerVerification(id)
      .then(item => !cancelled && setState({ item, error: '' }))
      .catch(error => !cancelled && setState({ item: null, error: error.message }))
    return () => { cancelled = true }
  }, [id])
  const item = state.item || base
  if (!item) return <aside className="owners-details"><header className="owners-details-heading"><h2><ShieldCheck size={17} />Hồ sơ xác minh</h2><button onClick={onClose} aria-label="Đóng hồ sơ"><X size={16} /></button></header><div className="owners-details-body"><p>{state.error || 'Đang tải hồ sơ…'}</p></div></aside>
  const fields = [['Họ tên trên giấy tờ', item.fullName], ['Số CCCD', item.idNumber], ['Ngày sinh', formatDate(item.dateOfBirth)], ['Địa chỉ', item.address], ['Email tài khoản', item.accountEmail], ['Số điện thoại', item.accountPhone], ['Ngày gửi', formatDateTime(item.createdAt)], ['Ngày duyệt', formatDateTime(item.reviewedAt)]]
  return <aside className="owners-details" aria-label={`Hồ sơ xác minh ${item.accountName}`} aria-busy={!state.item && !state.error}>
    <header className="owners-details-heading"><h2><ShieldCheck size={17} />Hồ sơ xác minh <small title={item.id}>#{item.id.slice(0, 8).toUpperCase()}</small></h2><button onClick={onClose} aria-label="Đóng hồ sơ"><X size={16} /></button></header>
    <div className="owners-details-body">
      {state.error && <p className="users-form-error" role="alert">Không tải được đầy đủ hồ sơ: {state.error}</p>}
      <section className="owners-profile"><UserAvatar user={{ name: item.accountName || item.fullName }} /><div><h3>{item.accountName || item.fullName}</h3><div className="owners-profile-status"><VerificationBadge status={item.status} /></div></div></section>
      {item.rejectReason && <p className="users-form-error">Lý do từ chối: {item.rejectReason}</p>}
      <section className="owners-kyc"><dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl></section>
      <section><h3 className="owners-section-label">Giấy tờ đã nộp</h3><div className="owners-documents">{item.documents.map(doc => doc.url
        ? <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer"><img src={doc.url} alt={doc.label} /><span>{doc.label} <ExternalLink size={10} /></span></a>
        : <div key={doc.label} className="missing"><FileImage size={20} /><span>{doc.label}</span><small>Chưa tải lên</small></div>)}</div></section>
    </div>
    {item.status === 'PENDING' && <footer className="owners-details-actions"><button className="users-button primary" onClick={() => onApprove(item)}><Check size={13} />Duyệt hồ sơ</button><button className="users-button users-danger" onClick={() => onReject(item)}><Ban size={13} />Từ chối</button></footer>}
  </aside>
}

// PATCH /api/v1/admin/owner-verifications/{id}/approve | reject { reason }.
function ReviewDialog({ type, item, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const reject = type === 'reject'
  const name = item.accountName || item.fullName
  const confirm = async () => {
    if (reject && !reason.trim()) return setError('Vui lòng nhập lý do để chủ sân biết cần bổ sung gì.')
    setSubmitting(true); setError('')
    try {
      if (reject) await rejectOwnerVerification(item.id, reason.trim())
      else await approveOwnerVerification(item.id)
      onDone(reject ? `Đã từ chối hồ sơ xác minh của ${name}.` : `Đã duyệt hồ sơ xác minh của ${name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={reject ? 'Từ chối hồ sơ xác minh' : 'Duyệt hồ sơ xác minh'} onClose={submitting ? noop : onClose}>
    <p>{reject ? `Từ chối hồ sơ KYC của ${name}?` : `Xác nhận ${name} là chủ sân đã xác minh? Hãy kiểm tra kỹ giấy tờ trước khi duyệt.`}</p>
    {reject && <div className="users-form"><label>Lý do từ chối<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Ảnh CCCD bị mờ, thiếu giấy phép kinh doanh…" /></label></div>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${reject ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Xác nhận'}</button></footer>
  </DemoDialog>
}
