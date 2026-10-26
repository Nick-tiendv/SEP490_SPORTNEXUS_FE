import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  createFacility,
  deleteFacility,
  deleteFacilityImage,
  getAmenities,
  getFacility,
  setFacilityThumbnail,
  updateFacility,
  updateFacilityAmenities,
  uploadFacilityImages,
} from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { statusBadge, toTimeSpan } from '../shared.js'

const MAX_IMAGES = 10
const APPROVAL = {
  APPROVED: ['green', 'Đã duyệt'],
  PENDING: ['amber', 'Chờ Admin duyệt'],
  REJECTED: ['red', 'Bị từ chối'],
}
const approvalBadge = (status) => {
  const [color, label] = APPROVAL[String(status || '').toUpperCase()] || ['gray', status || '—']
  return <span className={`snx-badge snx-badge--${color}`}>{label}</span>
}

const EMPTY_FORM = {
  name: '', address: '', province: '', district: '', latitude: '', longitude: '', phone: '',
  openTime: '06:00', closeTime: '22:00', description: '', rules: '', autoGenerateSlots: true,
}
const formFromFacility = (f) => ({
  name: f.name || '', address: f.address || '', province: f.province || '', district: f.district || '',
  latitude: f.latitude ?? '', longitude: f.longitude ?? '', phone: f.phone || '',
  openTime: String(f.openTime || '').slice(0, 5), closeTime: String(f.closeTime || '').slice(0, 5),
  description: f.description || '', rules: f.rules || '', autoGenerateSlots: !!f.autoGenerateSlots,
})
const toPayload = (form) => ({
  name: form.name.trim(),
  address: form.address.trim(),
  province: form.province.trim() || null,
  district: form.district.trim() || null,
  latitude: form.latitude === '' ? null : Number(form.latitude),
  longitude: form.longitude === '' ? null : Number(form.longitude),
  phone: form.phone.trim() || null,
  openTime: toTimeSpan(form.openTime),
  closeTime: toTimeSpan(form.closeTime),
  description: form.description.trim() || null,
  rules: form.rules.trim() || null,
  autoGenerateSlots: !!form.autoGenerateSlots,
})

function FacilityForm({ form, setForm }) {
  const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) })
  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error('Trình duyệt không hỗ trợ định vị.'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm({ ...form, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }),
      () => toast.error('Không lấy được vị trí hiện tại.'),
    )
  }
  return (
    <div className="snx-stack" style={{ gap: 12 }}>
      <label className="snx-field">Tên cơ sở *<input className="snx-input" maxLength={200} required {...field('name')} /></label>
      <label className="snx-field">Địa chỉ *<input className="snx-input" maxLength={500} required {...field('address')} /></label>
      <div className="snx-form-grid">
        <label className="snx-field">Tỉnh / Thành phố<input className="snx-input" {...field('province')} /></label>
        <label className="snx-field">Quận / Huyện<input className="snx-input" {...field('district')} /></label>
        <label className="snx-field">Số điện thoại<input className="snx-input" type="tel" {...field('phone')} /></label>
      </div>
      <div className="snx-form-grid">
        <label className="snx-field">Vĩ độ<input className="snx-input" type="number" step="any" {...field('latitude')} /></label>
        <label className="snx-field">Kinh độ<input className="snx-input" type="number" step="any" {...field('longitude')} /></label>
        <div className="snx-field" style={{ justifyContent: 'flex-end' }}><button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={useMyLocation}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>my_location</span>Lấy vị trí hiện tại</button></div>
      </div>
      <div className="snx-form-grid">
        <label className="snx-field">Giờ mở cửa<input className="snx-input" type="time" {...field('openTime')} /></label>
        <label className="snx-field">Giờ đóng cửa<input className="snx-input" type="time" {...field('closeTime')} /></label>
      </div>
      <label className="snx-field">Giới thiệu<textarea className="snx-textarea" rows={3} maxLength={2000} {...field('description')} /></label>
      <label className="snx-field">Nội quy sân<textarea className="snx-textarea" rows={2} maxLength={2000} {...field('rules')} /></label>
      <label className="snx-row" style={{ fontSize: 13 }}>
        <input type="checkbox" checked={form.autoGenerateSlots} onChange={(e) => setForm({ ...form, autoGenerateSlots: e.target.checked })} />
        Tự sinh ca hằng ngày theo giờ mở cửa
      </label>
    </div>
  )
}

function CreateFacilityModal({ amenities, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [amenityIds, setAmenityIds] = useState([])
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.address.trim()) { toast.error('Vui lòng nhập tên và địa chỉ cơ sở.'); return }
    if (form.openTime && form.closeTime && form.closeTime <= form.openTime) { toast.error('Giờ đóng cửa phải sau giờ mở cửa.'); return }
    setBusy(true)
    try {
      const created = await createFacility({ ...toPayload(form), amenityIds, imageUrls: [] })
      toast.success('Đã tạo cơ sở, đang chờ Admin duyệt. Bạn có thể thêm ảnh và sân ngay.')
      onCreated(created?.id ? String(created.id) : '')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="create-facility-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="create-facility-title" className="snx-card-title">Tạo cơ sở mới</h2>
            <p className="snx-card-subtitle">Cần hồ sơ xác minh chủ sân đã được duyệt. Cơ sở mới sẽ chờ Admin duyệt trước khi hiện với người chơi.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <FacilityForm form={form} setForm={setForm} />
        {amenities.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="snx-muted" style={{ marginBottom: 6 }}>Tiện ích</div>
            <div className="snx-row">
              {amenities.map((a) => {
                const on = amenityIds.includes(String(a.id))
                return <button key={a.id} type="button" className="snx-chip" aria-pressed={on} onClick={() => setAmenityIds((prev) => (on ? prev.filter((x) => x !== String(a.id)) : [...prev, String(a.id)]))}>{a.name}</button>
              })}
            </div>
          </div>
        )}
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy}>Tạo cơ sở</button>
        </div>
      </form>
    </div>
  )
}

function FacilityDetail({ facilityId, amenities, onChanged, onDeleted }) {
  const detail = useApi(() => getFacility(facilityId), [facilityId])
  const f = detail.data
  const [form, setForm] = useState(null)
  const [amenityIds, setAmenityIds] = useState(null)
  const [busy, setBusy] = useState('')
  const images = f?.imageItems || []
  const currentAmenityIds = amenityIds ?? (f?.amenities || []).map((a) => String(a.id))

  const run = async (key, action, message) => {
    setBusy(key)
    try {
      await action()
      if (message) toast.success(message)
      detail.refresh()
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    } finally {
      setBusy('')
    }
  }

  const saveInfo = async (event) => {
    event.preventDefault()
    if (form.closeTime && form.openTime && form.closeTime <= form.openTime) { toast.error('Giờ đóng cửa phải sau giờ mở cửa.'); return }
    // amenityIds / imageUrls null: BE giữ nguyên (tiện ích và ảnh sửa riêng bên dưới).
    if (await run('info', () => updateFacility(facilityId, { ...toPayload(form), status: null, amenityIds: null, imageUrls: null }), 'Đã lưu thông tin cơ sở.')) {
      setForm(null)
      onChanged()
    }
  }
  const saveAmenities = () => run('amenities', () => updateFacilityAmenities(facilityId, currentAmenityIds), 'Đã cập nhật tiện ích.').then((ok) => ok && setAmenityIds(null))
  const addImages = (files) => {
    const list = [...files].slice(0, MAX_IMAGES - images.length)
    if (!list.length) { toast.error(`Tối đa ${MAX_IMAGES} ảnh cho mỗi cơ sở.`); return }
    if (list.some((file) => file.size > 5 * 1024 * 1024)) { toast.error('Mỗi ảnh tối đa 5MB.'); return }
    run('upload', () => uploadFacilityImages(facilityId, list), `Đã tải lên ${list.length} ảnh.`)
  }
  const remove = async () => {
    if (!window.confirm(`Đóng cơ sở "${f.name}"? Sân con và các ca chưa đặt trong tương lai sẽ bị xóa. Lịch sử đặt sân và đánh giá vẫn được giữ.`)) return
    setBusy('delete')
    try {
      await deleteFacility(facilityId)
      toast.success('Đã đóng cơ sở.')
      onDeleted()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }

  if (detail.error) return <div className="snx-alert snx-alert--error">{detail.error}</div>
  if (!f) return <p className="snx-muted">Đang tải cơ sở…</p>

  return (
    <div className="snx-stack">
      <div className="snx-card">
        <div className="snx-row" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="snx-row"><h2 className="snx-card-title">{f.name}</h2>{approvalBadge(f.approvalStatus)}{f.isLocked && <span className="snx-badge snx-badge--red">Bị khóa</span>}{f.status && <span className={statusBadge(f.status).className}>{statusBadge(f.status).label}</span>}</div>
            <p className="snx-card-subtitle">{f.address}</p>
          </div>
          {!form && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setForm(formFromFacility(f))}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Sửa thông tin</button>}
        </div>
        {String(f.approvalStatus).toUpperCase() === 'REJECTED' && f.rejectReason && <div className="snx-alert snx-alert--error" style={{ marginBottom: 12 }}>Lý do từ chối: {f.rejectReason}</div>}
        {f.isLocked && f.lockedReason && <div className="snx-alert snx-alert--error" style={{ marginBottom: 12 }}>Lý do khóa: {f.lockedReason}</div>}

        {form ? (
          <form onSubmit={saveInfo}>
            <FacilityForm form={form} setForm={setForm} />
            <div className="snx-modal-foot">
              <button type="button" className="snx-btn snx-btn--ghost" onClick={() => setForm(null)}>Hủy</button>
              <button type="submit" className="snx-btn snx-btn--primary" disabled={busy === 'info'}>Lưu thông tin</button>
            </div>
          </form>
        ) : (
          <div className="snx-form-grid">
            <div><div className="snx-muted">Giờ mở cửa</div><strong>{String(f.openTime || '').slice(0, 5) || '—'} – {String(f.closeTime || '').slice(0, 5) || '—'}</strong></div>
            <div><div className="snx-muted">Điện thoại</div><strong>{f.phone || '—'}</strong></div>
            <div><div className="snx-muted">Khu vực</div><strong>{[f.district, f.province].filter(Boolean).join(', ') || '—'}</strong></div>
            <div><div className="snx-muted">Đánh giá</div><strong>{f.averageRating ? `${Number(f.averageRating).toFixed(1)} ★ (${f.reviewCount})` : 'Chưa có'}</strong></div>
            <div><div className="snx-muted">Sân con</div><strong>{(f.courts || []).length} sân</strong> <Link to="/owner/courts" className="snx-muted">Quản lý</Link></div>
            <div><div className="snx-muted">Tự sinh ca</div><strong>{f.autoGenerateSlots ? 'Bật' : 'Tắt'}</strong></div>
          </div>
        )}
      </div>

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 12 }}>
          <h2 className="snx-card-title">Ảnh cơ sở</h2>
          <span className="snx-muted">{images.length}/{MAX_IMAGES}</span>
          <span className="snx-spacer" />
          <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_photo_alternate</span>{busy === 'upload' ? 'Đang tải…' : 'Thêm ảnh'}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={busy === 'upload' || images.length >= MAX_IMAGES} onChange={(e) => { addImages(e.target.files); e.target.value = '' }} />
          </label>
        </div>
        {images.length === 0 ? (
          <div className="snx-empty"><span className="material-symbols-outlined">photo_library</span>Chưa có ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</div>
        ) : (
          <div className="snx-thumb-grid">
            {images.map((img) => (
              <div key={img.id} className="snx-thumb">
                <img src={img.url} alt="Ảnh cơ sở" />
                {img.isThumbnail && <span className="snx-thumb-flag snx-badge snx-badge--green">Ảnh đại diện</span>}
                <div className="snx-thumb-actions">
                  {!img.isThumbnail && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={!!busy} onClick={() => run(`thumb-${img.id}`, () => setFacilityThumbnail(facilityId, img.id), 'Đã đặt ảnh đại diện.')}>Đặt đại diện</button>}
                  <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" disabled={!!busy} onClick={() => window.confirm('Xóa ảnh này?') && run(`del-${img.id}`, () => deleteFacilityImage(facilityId, img.id), 'Đã xóa ảnh.')} aria-label="Xóa ảnh"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 12 }}>
          <h2 className="snx-card-title">Tiện ích</h2>
          <span className="snx-spacer" />
          {amenityIds && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setAmenityIds(null)}>Hoàn tác</button>}
          <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={!amenityIds || busy === 'amenities'} onClick={saveAmenities}>Lưu tiện ích</button>
        </div>
        {amenities.length === 0 ? <p className="snx-muted">Chưa tải được danh mục tiện ích.</p> : (
          <div className="snx-row">
            {amenities.map((a) => {
              const id = String(a.id)
              const on = currentAmenityIds.includes(id)
              return <button key={id} type="button" className="snx-chip" aria-pressed={on} onClick={() => setAmenityIds(on ? currentAmenityIds.filter((x) => x !== id) : [...currentAmenityIds, id])}>{on && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>}{a.name}</button>
            })}
          </div>
        )}
      </div>

      <div className="snx-card" style={{ borderColor: '#fecaca' }}>
        <div className="snx-row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 className="snx-card-title" style={{ color: '#b91c1c' }}>Đóng cơ sở</h2>
            <p className="snx-card-subtitle">Không đóng được khi còn đơn đặt sắp tới hoặc giải đấu chưa kết thúc.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--danger" disabled={busy === 'delete'} onClick={remove}>Đóng cơ sở này</button>
        </div>
      </div>
    </div>
  )
}

export default function OwnerFacilities() {
  const { facilities, facilityId, selectFacility, refreshFacilities, loading } = useOwnerContext()
  const amenities = useApi(() => getAmenities(), [], { initialData: [] })
  const [creating, setCreating] = useState(false)

  return (
    <div className="snx-stack">
      <PageHeader
        eyebrow="Cơ sở & sân"
        eyebrowIcon="domain"
        title="Cơ sở của tôi"
        subtitle="Thông tin, ảnh, tiện ích và trạng thái duyệt của từng cơ sở."
        actions={<button type="button" className="snx-btn snx-btn--primary" onClick={() => setCreating(true)}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Tạo cơ sở</button>}
      />

      {facilities.length > 1 && (
        <div className="snx-tabs" role="tablist" aria-label="Chọn cơ sở">
          {facilities.map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={f.id === facilityId} className="snx-tab" onClick={() => selectFacility(f.id)}>{f.name}</button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="snx-muted">Đang tải…</p>
      ) : !facilityId ? (
        <div className="snx-empty">
          <span className="material-symbols-outlined">domain_add</span>
          Bạn chưa có cơ sở nào. Hãy hoàn tất <Link to="/owner/profile">xác minh chủ sân</Link> rồi tạo cơ sở đầu tiên.
          <div style={{ marginTop: 12 }}><button type="button" className="snx-btn snx-btn--primary" onClick={() => setCreating(true)}>Tạo cơ sở</button></div>
        </div>
      ) : (
        <FacilityDetail
          key={facilityId}
          facilityId={facilityId}
          amenities={amenities.data || []}
          onChanged={() => refreshFacilities().catch(() => {})}
          onDeleted={() => refreshFacilities().catch(() => {})}
        />
      )}

      {creating && (
        <CreateFacilityModal
          amenities={amenities.data || []}
          onClose={() => setCreating(false)}
          onCreated={(id) => refreshFacilities().then(() => id && selectFacility(id)).catch(() => {})}
        />
      )}
    </div>
  )
}
