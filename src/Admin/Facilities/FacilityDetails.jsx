import { useEffect, useState } from 'react'
import { X, MapPin, Star, Clock3, Pencil, CalendarDays, ShieldCheck, Ban, BadgeCheck, Lock, LockOpen, Mail, CircleAlert } from 'lucide-react'
import { getAdminFacility } from '../../api/admin/facilityApi.js'
import { sportLabels, statusLabels, courtStatusLabels, formatNumber, statusTone, fallbackPhoto, facilityActions } from './facilityData.js'

export function FacilityStatus({ status }) {
  return <span className={`facilities-status ${statusTone(status)}`}><i />{statusLabels[status] || status}</span>
}

// Gộp bản ghi chi tiết vào bản ghi danh sách, bỏ qua field rỗng của API chi tiết.
const merge = (base, extra) => ({ ...base, ...Object.fromEntries(Object.entries(extra || {}).filter(([, value]) => value !== '' && value != null && !(Array.isArray(value) && !value.length))), owner: { ...base.owner, ...Object.fromEntries(Object.entries(extra?.owner || {}).filter(([, value]) => value)) } })
const actionIcons = { approve: BadgeCheck, reject: Ban, lock: Lock, unlock: LockOpen }

export default function FacilityDetails({ facility: base, onClose, onEdit, onAction, onBookings, onPhoto }) {
  const [state, setState] = useState({ id: '', detail: null, error: '' })
  const [allCourts, setAllCourts] = useState(false)
  useEffect(() => {
    let cancelled = false
    getAdminFacility(base.id)
      .then(detail => !cancelled && setState({ id: base.id, detail, error: '' }))
      .catch(error => !cancelled && setState({ id: base.id, detail: null, error: error.message }))
    return () => { cancelled = true }
  }, [base.id])
  const loading = state.id !== base.id
  const facility = merge(base, state.id === base.id ? state.detail : null)
  const { courts } = facility
  const owner = facility.owner.name || 'Chưa rõ chủ sân'
  const cover = facility.images[0] || fallbackPhoto
  const reason = facility.locked ? facility.lockReason : facility.status === 'Rejected' ? facility.rejectReason : ''
  const actions = Object.entries(facilityActions).filter(([, action]) => action.allowed(facility))
  return <aside className="facilities-details" aria-label="Chi tiết cơ sở" aria-busy={loading}>
    <header><h2>Chi tiết cơ sở <small title={facility.id}>#{facility.id.slice(0, 8).toUpperCase()}</small></h2><button aria-label="Đóng chi tiết cơ sở" onClick={onClose}><X size={17} /></button></header>
    <div className="facilities-detail-body">
      <button className="facilities-cover" onClick={() => onPhoto({ src: cover, label: facility.name })} aria-label="Xem ảnh bìa"><img src={cover} alt={`Ảnh ${facility.name}`} /><FacilityStatus status={facility.status} />{!facility.images.length && <span>Chưa có ảnh</span>}</button>
      {loading && <p className="facilities-detail-muted">Đang tải chi tiết…</p>}
      {state.error && <p className="users-form-error" role="alert">Không tải được đầy đủ chi tiết: {state.error}</p>}
      {reason && <p className="users-form-error"><CircleAlert size={12} /> {facility.locked ? 'Lý do khóa' : 'Lý do từ chối'}: {reason}</p>}
      <div className="facilities-detail-title"><h3>{facility.name}</h3><span><Star size={14} fill="currentColor" /> {facility.rating ? facility.rating.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : 'Chưa đánh giá'}</span></div>
      <p className="facilities-detail-muted">{facility.reviews ? `${formatNumber(facility.reviews)} lượt đánh giá · ` : ''}{facility.reports ? `${formatNumber(facility.reports)} báo cáo · ` : ''}{facility.sports.map(sport => sportLabels[sport] || sport).join(' & ') || 'Chưa có môn thể thao'}</p>
      <p className="facilities-address"><MapPin size={13} />{facility.address || 'Chưa có địa chỉ'}{facility.latitude != null && facility.longitude != null && <> · <a href={`https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">Xem bản đồ</a></>}</p>
      {facility.description && <p className="facilities-detail-muted">{facility.description}</p>}
      <section className="facilities-owner"><span className="facilities-owner-avatar">{owner.split(' ').map(word => word[0]).slice(-2).join('').toUpperCase()}</span><div><strong>{owner}</strong><small>{facility.owner.id ? `#${facility.owner.id.slice(0, 8).toUpperCase()} · ` : ''}Chủ sân</small>{facility.owner.email && <span><Mail size={11} />{facility.owner.email}</span>}{facility.owner.phone && <span><ShieldCheck size={11} />{facility.owner.phone}</span>}</div></section>
      <div className="facilities-info-grid"><section><small>Tổng số sân</small><strong>{formatNumber(courts.length || facility.courtCount)} sân</strong><p>{facility.amenities.map(item => item.name).join(', ') || 'Chưa có tiện ích'}</p></section><section><small><Clock3 size={11} /> Giờ hoạt động</small><strong>{facility.opens && facility.closes ? `${facility.opens} – ${facility.closes}` : 'Chưa có thông tin'}</strong><p>{facility.createdAt ? `Tạo ngày ${new Date(facility.createdAt).toLocaleDateString('vi-VN')}` : ''}</p></section></div>
      {facility.images.length > 0 && <section className="facilities-photos"><h4>Hình ảnh cơ sở <small>{facility.images.length} ảnh</small></h4><div>{facility.images.map((src, index) => <button key={src} onClick={() => onPhoto({ src, label: `${facility.name} – ảnh ${index + 1}` })} aria-label={`Xem ảnh ${index + 1}`}><img src={src} alt={`${facility.name} – ảnh ${index + 1}`} /></button>)}</div></section>}
      <section className="facilities-courts"><h4>Danh sách sân <small>{courts.length} sân</small></h4>{courts.slice(0, allCourts ? undefined : 4).map(court => {
        const tone = statusTone(court.status)
        return <div key={court.id} className="facilities-court"><i className={tone} /><div><strong>{court.name}</strong><small>{[sportLabels[court.sport] || court.sport, court.price != null && `${court.price.toLocaleString('vi-VN')} ₫/giờ`].filter(Boolean).join(' · ')}</small></div><span className={`facilities-court-status ${tone}`}>{courtStatusLabels[court.status] || court.status}</span></div>
      })}{!courts.length && !loading && <p className="facilities-detail-muted">Cơ sở chưa có sân nào.</p>}{courts.length > 4 && <button className="facilities-text-button" onClick={() => setAllCourts(!allCourts)}>{allCourts ? 'Thu gọn danh sách sân' : `Xem tất cả ${courts.length} sân`}</button>}</section>
    </div>
    <footer>{actions.map(([key, action]) => { const Icon = actionIcons[key]; return <button key={key} className={`users-button ${action.danger ? 'users-danger' : 'primary'}`} onClick={() => onAction(key)}><Icon size={12} />{action.label.replace(' cơ sở', '')}</button> })}<button className="users-button" onClick={() => onEdit(facility)}><Pencil size={12} />Chỉnh sửa</button><button className="users-button" onClick={onBookings}><CalendarDays size={12} />Đơn đặt sân</button></footer>
  </aside>
}
