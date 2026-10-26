import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Building2, ExternalLink, Pencil, Ban, Check, Trash2, ShieldCheck } from 'lucide-react'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'
import { FacilityStatus } from '../Facilities/FacilityDetails.jsx'
import { VerificationBadge } from './OwnerVerifications.jsx'
import '../Facilities/facility.css'
import { getOwnerMonthSummary } from '../../api/admin/ownerApi.js'

const number = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')

export default function CourtOwnerDetails({ owner, verification, onKyc, isSelf, onClose, onEdit, onSuspend, onDelete }) {
  const [summary, setSummary] = useState({ id: '', bookings: undefined, revenue: undefined, error: '' })
  useEffect(() => {
    let cancelled = false
    getOwnerMonthSummary(owner.id)
      .then(result => !cancelled && setSummary({ id: owner.id, ...result, error: '' }))
      .catch(error => !cancelled && setSummary({ id: owner.id, error: error.message }))
    return () => { cancelled = true }
  }, [owner.id])
  const summaryLoading = summary.id !== owner.id
  const courts = owner.facilities.reduce((sum, facility) => sum + facility.courts, 0)
  return <aside className="owners-details" aria-label={`Chi tiết chủ sân ${owner.name}`}>
    <header className="owners-details-heading"><h2><Building2 size={17} />Chi tiết chủ sân <small title={owner.id}>#{owner.id.slice(0, 8).toUpperCase()}</small></h2><button onClick={onClose} aria-label="Đóng chi tiết chủ sân"><X size={16} /></button></header>
    <div className="owners-details-body">
      <section className="owners-profile"><UserAvatar user={owner} /><div><h3>{owner.name} <span className="owners-pro-badge">Chủ sân</span></h3><p>{owner.username && `@${owner.username}`}</p><div className="owners-profile-status"><AccountStatus status={owner.status} /></div>{owner.joined && <small>Tham gia từ {owner.joined.split('-').reverse().join('/')}</small>}<small>{owner.email || 'Chưa có email'}</small><small>{owner.phone || "Chưa có số điện thoại"}</small></div></section>
      <section className="owners-kyc"><dl><div><dt>Điểm fair-play</dt><dd>{owner.fairplay == null ? '—' : number(owner.fairplay)}</dd></div><div><dt>Số dư ví</dt><dd>{owner.wallet == null ? '—' : `${number(owner.wallet)} ₫`}</dd></div></dl><dl><div><dt>Xác minh KYC</dt><dd>{verification ? <VerificationBadge status={verification.status} /> : 'Chưa nộp hồ sơ'}</dd></div>{verification?.reviewedAt && <div><dt>Ngày duyệt</dt><dd>{new Date(verification.reviewedAt).toLocaleDateString('vi-VN')}</dd></div>}</dl>{verification && <button className="users-button" style={{ marginTop: 9 }} onClick={() => onKyc(verification.id)}><ShieldCheck size={13} />Xem hồ sơ KYC</button>}</section>
      <section><h3 className="owners-section-label">Hiệu quả kinh doanh</h3><div className="owners-performance">{[["Cơ sở", owner.facilities.length], ["Tổng số sân", courts], ["Lượt đặt sân tháng này", summaryLoading ? '…' : number(summary.bookings)], ["Doanh thu tháng này", summaryLoading ? '…' : Number.isFinite(summary.revenue) ? `${number(summary.revenue)} ₫` : '—']].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>{summary.error && <p className="users-form-error">Không tải được số liệu đặt sân: {summary.error}</p>}</section>
      <section><div className="owners-facilities-heading"><h3 className="owners-section-label">Cơ sở trực thuộc ({owner.facilities.length})</h3></div><div className="owners-facilities">{owner.facilities.map(facility => <article key={facility.id}><div><h4>{facility.name}</h4><FacilityStatus status={facility.status} /></div><p>{[facility.location, facility.courts ? `${facility.courts} sân` : '', facility.sports && `(${facility.sports})`].filter(Boolean).join(' • ')}</p><footer><span>{facility.rating ? `★ ${facility.rating}` : "Chưa có điểm đánh giá"}</span><Link to="/admin/facilities">Xem cơ sở <ExternalLink size={11} /></Link></footer></article>)}{!owner.facilities.length && <p className="owners-empty-facilities">Chủ sân chưa có cơ sở nào.</p>}</div></section>
    </div>
    <footer className="owners-details-actions"><button className={`users-button ${owner.status === 'Suspended' ? '' : 'users-danger'}`} onClick={onSuspend} disabled={isSelf}>{owner.status === 'Suspended' ? <Check size={13} /> : <Ban size={13} />}{owner.status === 'Suspended' ? "Khôi phục" : "Tạm khóa"}</button><button className="users-button" onClick={onEdit}><Pencil size={13} />Chỉnh sửa</button><button className="users-button users-danger" onClick={onDelete} disabled={isSelf}><Trash2 size={13} />Xóa</button></footer>
  </aside>
}
