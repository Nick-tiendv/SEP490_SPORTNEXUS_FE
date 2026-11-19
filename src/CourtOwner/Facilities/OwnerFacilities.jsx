import { useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  createFacility,
  deleteFacility,
  deleteFacilityImage,
  getAmenities,
  getFacility,
  resolveAreaCodes,
  setFacilityThumbnail,
  updateFacility,
  updateFacilityAmenities,
  uploadFacilityImages,
} from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { statusBadge, toTimeSpan } from '../shared.js'
import TimeInput24 from '../../components/common/TimeInput24.jsx'
import FacilityAddressFields from '../../components/common/FacilityAddressFields.jsx'
import LocationPickerMap from '../../components/common/LocationPickerMap.jsx'
import { geocodeAddress } from '../../utils/geolocation.js'
import { isValidProvince, isValidWard, parseFacilityAddress, validateFacilityAddress } from '../../utils/vnAddress.js'

const MAX_IMAGES = 10
const APPROVAL = {
  APPROVED: ['green', 'Đã duyệt'],
  PENDING: ['amber', 'Chờ Admin duyệt'],
  REJECTED: ['red', 'Bị từ chối'],
}
const approvalBadge = status => {
  const [color, label] = APPROVAL[String(status || '').toUpperCase()] || ['gray', status || '—']
  return <span className={`snx-badge snx-badge--${color}`}>{label}</span>
}

const EMPTY_FORM = {
  name: '',
  street: '',
  province: '',
  district: '',
  legacyProvince: '',
  legacyDistrict: '',
  latitude: '',
  longitude: '',
  phone: '',
  openTime: '06:00',
  closeTime: '22:00',
  description: '',
  rules: '',
  autoGenerateSlots: true,
}
const formFromFacility = f => {
  const parsed = parseFacilityAddress({
    address: f.address,
    province: f.province,
    district: f.district,
  })
  return {
    name: f.name || '',
    street: parsed.street,
    province: parsed.province,
    district: parsed.district,
    legacyProvince: parsed.legacyProvince,
    legacyDistrict: parsed.legacyDistrict,
    latitude: f.latitude ?? '',
    longitude: f.longitude ?? '',
    phone: f.phone || '',
    openTime: String(f.openTime || '').slice(0, 5),
    closeTime: String(f.closeTime || '').slice(0, 5),
    description: f.description || '',
    rules: f.rules || '',
    autoGenerateSlots: !!f.autoGenerateSlots,
  }
}
// BE lưu địa chỉ 3 trường: streetAddress + provinceCode + wardCode (form chọn theo tên, đổi sang mã khi lưu)
const toPayload = async form => ({
  name: form.name.trim(),
  streetAddress: form.street.trim().replace(/,+$/, '').trim(),
  ...(await resolveAreaCodes(form.province, form.district)),
  latitude: form.latitude === '' ? null : Number(form.latitude),
  longitude: form.longitude === '' ? null : Number(form.longitude),
  phone: form.phone.trim() || null,
  openTime: toTimeSpan(form.openTime),
  closeTime: toTimeSpan(form.closeTime),
  description: form.description.trim() || null,
  rules: form.rules.trim() || null,
  autoGenerateSlots: !!form.autoGenerateSlots,
})

const validateOwnerForm = form => {
  if (!form.name.trim()) return 'Vui lòng nhập tên cơ sở.'
  const addrError = validateFacilityAddress(form)
  if (addrError) return addrError
  const hasLat = String(form.latitude ?? '').trim() !== ''
  const hasLng = String(form.longitude ?? '').trim() !== ''
  if (hasLat !== hasLng) return 'Vui lòng chọn đầy đủ cả Vĩ độ và Kinh độ, hoặc xóa tọa độ.'
  if (hasLat && hasLng) {
    const lat = Number(form.latitude)
    const lng = Number(form.longitude)
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      return 'Vĩ độ phải trong khoảng -90..90 và kinh độ trong khoảng -180..180.'
    }
  }
  if (form.openTime && form.closeTime && form.closeTime <= form.openTime) return 'Giờ đóng cửa phải sau giờ mở cửa.'
  return ''
}

function FacilityForm({ form, setForm, showErrors = false }) {
  const [viewCenter, setViewCenter] = useState(null)
  const [locatingArea, setLocatingArea] = useState(false)

  const field = key => ({
    value: form[key],
    onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  const latText = String(form.latitude ?? '').trim()
  const lngText = String(form.longitude ?? '').trim()
  const latNum = Number(latText)
  const lngNum = Number(lngText)
  const mapValue =
    latText !== '' && lngText !== '' && Number.isFinite(latNum) && Number.isFinite(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180
      ? { latitude: latNum, longitude: lngNum }
      : null

  const addressErrors = showErrors
    ? {
        province: !isValidProvince(form.province),
        district: !isValidWard(form.province, form.district),
        street: !form.street.trim(),
      }
    : {}

  const focusAreaOnMap = async () => {
    const query = [form.street, form.district, form.province]
      .map(part => String(part || '').trim())
      .filter(Boolean)
      .join(', ')
    if (!query || locatingArea) return
    setLocatingArea(true)
    try {
      const found = (await geocodeAddress(query)) || (form.province ? await geocodeAddress([form.district, form.province].filter(Boolean).join(', ')) : null)
      if (!found) {
        toast.info('Chưa tìm thấy khu vực trên bản đồ, vui lòng kéo bản đồ thủ công để cắm ghim.')
        return
      }
      setViewCenter({
        latitude: found.lat,
        longitude: found.lng,
        zoom: form.street.trim() ? 16 : form.district ? 14 : 11,
      })
    } finally {
      setLocatingArea(false)
    }
  }

  return (
    <div className="snx-stack" style={{ gap: 12 }}>
      <label className="snx-field">
        Tên cơ sở *
        <input className="snx-input" maxLength={200} required aria-invalid={showErrors && !form.name.trim() ? true : undefined} {...field('name')} />
      </label>

      <FacilityAddressFields
        province={form.province}
        district={form.district}
        street={form.street}
        legacyProvince={form.legacyProvince}
        legacyDistrict={form.legacyDistrict}
        errors={addressErrors}
        onChange={patch => setForm(prev => ({ ...prev, ...patch }))}
      />

      <label className="snx-field">
        Số điện thoại
        <input className="snx-input" type="tel" {...field('phone')} />
      </label>

      <div className="snx-field">
        <div className="snx-row" style={{ justifyContent: 'space-between' }}>
          <span>Vị trí sân trên bản đồ</span>
          <div className="snx-row">
            {(form.province || form.street.trim()) && (
              <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={locatingArea} onClick={focusAreaOnMap}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  travel_explore
                </span>
                {locatingArea ? 'Đang tìm khu vực…' : 'Tìm khu vực trên bản đồ'}
              </button>
            )}
            {mapValue && (
              <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setForm(prev => ({ ...prev, latitude: '', longitude: '' }))}>
                Xóa ghim
              </button>
            )}
          </div>
        </div>
        <span className="snx-muted" style={{ fontWeight: 400 }}>
          Bấm lên bản đồ hoặc kéo ghim để cắm cờ chọn đúng tọa độ sân.
        </span>
        <LocationPickerMap
          value={mapValue}
          viewCenter={viewCenter}
          height={250}
          onChange={({ latitude, longitude }) => setForm(prev => ({ ...prev, latitude: String(latitude), longitude: String(longitude) }))}
        />
        <div className="snx-form-grid">
          <label className="snx-field">
            Vĩ độ
            <input className="snx-input" type="number" step="any" {...field('latitude')} />
          </label>
          <label className="snx-field">
            Kinh độ
            <input className="snx-input" type="number" step="any" {...field('longitude')} />
          </label>
        </div>
      </div>

      <div className="snx-form-grid">
        <div className="snx-field">
          Giờ mở cửa
          <TimeInput24 label="Giờ mở cửa" allowEmpty value={form.openTime} onChange={v => setForm(prev => ({ ...prev, openTime: v }))} />
        </div>
        <div className="snx-field">
          Giờ đóng cửa
          <TimeInput24 label="Giờ đóng cửa" allowEmpty value={form.closeTime} onChange={v => setForm(prev => ({ ...prev, closeTime: v }))} />
        </div>
      </div>
      <label className="snx-field">
        Giới thiệu
        <textarea className="snx-textarea" rows={3} maxLength={2000} {...field('description')} />
      </label>
      <label className="snx-field">
        Nội quy sân
        <textarea className="snx-textarea" rows={2} maxLength={2000} {...field('rules')} />
      </label>
      <label className="snx-row" style={{ fontSize: 13 }}>
        <input type="checkbox" checked={form.autoGenerateSlots} onChange={e => setForm(prev => ({ ...prev, autoGenerateSlots: e.target.checked }))} />
        Tự sinh ca hằng ngày theo giờ mở cửa
      </label>
    </div>
  )
}

function CreateFacilityModal({ amenities, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [amenityIds, setAmenityIds] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = async event => {
    event.preventDefault()
    setSubmitted(true)
    const validationError = validateOwnerForm(form)
    if (validationError) {
      toast.error(validationError)
      return
    }
    setBusy(true)
    try {
      const created = await createFacility({ ...(await toPayload(form)), amenityIds, imageUrls: [] })
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
      <form className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="create-facility-title" noValidate onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="create-facility-title" className="snx-card-title">
              Tạo cơ sở mới
            </h2>
            <p className="snx-card-subtitle">Cần hồ sơ xác minh chủ sân đã được duyệt. Cơ sở mới sẽ chờ Admin duyệt trước khi hiện với người chơi.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <FacilityForm form={form} setForm={setForm} showErrors={submitted} />
        {amenities.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="snx-muted" style={{ marginBottom: 6 }}>
              Tiện ích
            </div>
            <div className="snx-row">
              {amenities.map(a => {
                const on = amenityIds.includes(String(a.id))
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="snx-chip"
                    aria-pressed={on}
                    onClick={() => setAmenityIds(prev => (on ? prev.filter(x => x !== String(a.id)) : [...prev, String(a.id)]))}
                  >
                    {a.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy}>
            Tạo cơ sở
          </button>
        </div>
      </form>
    </div>
  )
}

function FacilityDetail({ facilityId, amenities, onChanged, onDeleted }) {
  const detail = useApi(() => getFacility(facilityId), [facilityId])
  const f = detail.data
  const [form, setForm] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [amenityIds, setAmenityIds] = useState(null)
  const [busy, setBusy] = useState('')
  const images = f?.imageItems || []
  const currentAmenityIds = amenityIds ?? (f?.amenities || []).map(a => String(a.id))

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

  const saveInfo = async event => {
    event.preventDefault()
    setSubmitted(true)
    const validationError = validateOwnerForm(form)
    if (validationError) {
      toast.error(validationError)
      return
    }
    // amenityIds / imageUrls null: BE giữ nguyên (tiện ích và ảnh sửa riêng bên dưới).
    if (
      await run('info', async () => updateFacility(facilityId, { ...(await toPayload(form)), status: null, amenityIds: null, imageUrls: null }), 'Đã lưu thông tin cơ sở.')
    ) {
      setSubmitted(false)
      setForm(null)
      onChanged()
    }
  }
  const saveAmenities = () =>
    run('amenities', () => updateFacilityAmenities(facilityId, currentAmenityIds), 'Đã cập nhật tiện ích.').then(ok => ok && setAmenityIds(null))
  const addImages = files => {
    const list = [...files].slice(0, MAX_IMAGES - images.length)
    if (!list.length) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh cho mỗi cơ sở.`)
      return
    }
    if (list.some(file => file.size > 5 * 1024 * 1024)) {
      toast.error('Mỗi ảnh tối đa 5MB.')
      return
    }
    run('upload', () => uploadFacilityImages(facilityId, list), `Đã tải lên ${list.length} ảnh.`)
  }
  const remove = async () => {
    if (!(await confirmDialog(`Đóng cơ sở "${f.name}"? Sân con và các ca chưa đặt trong tương lai sẽ bị xóa. Lịch sử đặt sân và đánh giá vẫn được giữ.`)))
      return
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
            <div className="snx-row">
              <h2 className="snx-card-title">{f.name}</h2>
              {approvalBadge(f.approvalStatus)}
              {f.isLocked && <span className="snx-badge snx-badge--red">Bị khóa</span>}
              {f.status && <span className={statusBadge(f.status).className}>{statusBadge(f.status).label}</span>}
            </div>
            <p className="snx-card-subtitle">{f.address}</p>
          </div>
          {!form && (
            <button
              type="button"
              className="snx-btn snx-btn--secondary snx-btn--sm"
              onClick={() => {
                setSubmitted(false)
                setForm(formFromFacility(f))
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                edit
              </span>
              Sửa thông tin
            </button>
          )}
        </div>
        {String(f.approvalStatus).toUpperCase() === 'REJECTED' && f.rejectReason && (
          <div className="snx-alert snx-alert--error" style={{ marginBottom: 12 }}>
            Lý do từ chối: {f.rejectReason}
          </div>
        )}
        {f.isLocked && f.lockedReason && (
          <div className="snx-alert snx-alert--error" style={{ marginBottom: 12 }}>
            Lý do khóa: {f.lockedReason}
          </div>
        )}

        {form ? (
          <form noValidate onSubmit={saveInfo}>
            <FacilityForm form={form} setForm={setForm} showErrors={submitted} />
            <div className="snx-modal-foot">
              <button
                type="button"
                className="snx-btn snx-btn--ghost"
                onClick={() => {
                  setSubmitted(false)
                  setForm(null)
                }}
              >
                Hủy
              </button>
              <button type="submit" className="snx-btn snx-btn--primary" disabled={busy === 'info'}>
                Lưu thông tin
              </button>
            </div>
          </form>
        ) : (
          <div className="snx-form-grid">
            <div>
              <div className="snx-muted">Giờ mở cửa</div>
              <strong>
                {String(f.openTime || '').slice(0, 5) || '—'} – {String(f.closeTime || '').slice(0, 5) || '—'}
              </strong>
            </div>
            <div>
              <div className="snx-muted">Điện thoại</div>
              <strong>{f.phone || '—'}</strong>
            </div>
            <div>
              <div className="snx-muted">Khu vực</div>
              <strong>{[f.district, f.province].filter(Boolean).join(', ') || '—'}</strong>
            </div>
            <div>
              <div className="snx-muted">Đánh giá</div>
              <strong>{f.averageRating ? `${Number(f.averageRating).toFixed(1)} ★ (${f.reviewCount})` : 'Chưa có'}</strong>
            </div>
            <div>
              <div className="snx-muted">Sân con</div>
              <strong>{(f.courts || []).length} sân</strong>{' '}
              <Link to="/owner/courts" className="snx-muted">
                Quản lý
              </Link>
            </div>
            <div>
              <div className="snx-muted">Tự sinh ca</div>
              <strong>{f.autoGenerateSlots ? 'Bật' : 'Tắt'}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 12 }}>
          <h2 className="snx-card-title">Ảnh cơ sở</h2>
          <span className="snx-muted">
            {images.length}/{MAX_IMAGES}
          </span>
          <span className="snx-spacer" />
          <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add_photo_alternate
            </span>
            {busy === 'upload' ? 'Đang tải…' : 'Thêm ảnh'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              disabled={busy === 'upload' || images.length >= MAX_IMAGES}
              onChange={e => {
                addImages(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        {images.length === 0 ? (
          <div className="snx-empty">
            <span className="material-symbols-outlined">photo_library</span>Chưa có ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
          </div>
        ) : (
          <div className="snx-thumb-grid">
            {images.map(img => (
              <div key={img.id} className="snx-thumb">
                <img src={img.url} alt="Ảnh cơ sở" />
                {img.isThumbnail && <span className="snx-thumb-flag snx-badge snx-badge--green">Ảnh đại diện</span>}
                <div className="snx-thumb-actions">
                  {!img.isThumbnail && (
                    <button
                      type="button"
                      className="snx-btn snx-btn--secondary snx-btn--sm"
                      disabled={!!busy}
                      onClick={() => run(`thumb-${img.id}`, () => setFacilityThumbnail(facilityId, img.id), 'Đã đặt ảnh đại diện.')}
                    >
                      Đặt đại diện
                    </button>
                  )}
                  <button
                    type="button"
                    className="snx-btn snx-btn--danger snx-btn--sm"
                    disabled={!!busy}
                    onClick={async () =>
                      (await confirmDialog('Xóa ảnh này?')) && run(`del-${img.id}`, () => deleteFacilityImage(facilityId, img.id), 'Đã xóa ảnh.')
                    }
                    aria-label="Xóa ảnh"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      delete
                    </span>
                  </button>
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
          {amenityIds && (
            <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setAmenityIds(null)}>
              Hoàn tác
            </button>
          )}
          <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={!amenityIds || busy === 'amenities'} onClick={saveAmenities}>
            Lưu tiện ích
          </button>
        </div>
        {amenities.length === 0 ? (
          <p className="snx-muted">Chưa tải được danh mục tiện ích.</p>
        ) : (
          <div className="snx-row">
            {amenities.map(a => {
              const id = String(a.id)
              const on = currentAmenityIds.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  className="snx-chip"
                  aria-pressed={on}
                  onClick={() => setAmenityIds(on ? currentAmenityIds.filter(x => x !== id) : [...currentAmenityIds, id])}
                >
                  {on && (
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      check
                    </span>
                  )}
                  {a.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="snx-card" style={{ borderColor: '#fecaca' }}>
        <div className="snx-row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 className="snx-card-title" style={{ color: '#b91c1c' }}>
              Đóng cơ sở
            </h2>
            <p className="snx-card-subtitle">Không đóng được khi còn đơn đặt sắp tới hoặc giải đấu chưa kết thúc.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--danger" disabled={busy === 'delete'} onClick={remove}>
            Đóng cơ sở này
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OwnerFacilities() {
  const { facilities, facilityId, selectFacility, refreshFacilities, loading } = useOwnerContext()
  const amenities = useApi(() => getAmenities(), [], { initialData: [] })
  const [searchParams, setSearchParams] = useSearchParams()
  const [creating, setCreatingState] = useState(() => searchParams.get('create') === '1')
  const setCreating = open => {
    setCreatingState(open)
    if (!open && searchParams.has('create')) setSearchParams({}, { replace: true })
  }

  return (
    <div className="snx-stack">
      <PageHeader
        eyebrow="Cơ sở & sân"
        eyebrowIcon="domain"
        title="Cơ sở của tôi"
        subtitle="Thông tin, ảnh, tiện ích và trạng thái duyệt của từng cơ sở."
        actions={
          <button type="button" className="snx-btn snx-btn--primary" onClick={() => setCreating(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add
            </span>
            Tạo cơ sở
          </button>
        }
      />

      {facilities.length > 1 && (
        <div className="snx-tabs" role="tablist" aria-label="Chọn cơ sở">
          {facilities.map(f => (
            <button key={f.id} type="button" role="tab" aria-selected={f.id === facilityId} className="snx-tab" onClick={() => selectFacility(f.id)}>
              {f.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="snx-muted">Đang tải…</p>
      ) : !facilityId ? (
        <div className="snx-empty">
          <span className="material-symbols-outlined">domain_add</span>
          Bạn chưa có cơ sở nào. Hãy hoàn tất <Link to="/owner/profile">xác minh chủ sân</Link> rồi tạo cơ sở đầu tiên.
          <div style={{ marginTop: 12 }}>
            <button type="button" className="snx-btn snx-btn--primary" onClick={() => setCreating(true)}>
              Tạo cơ sở
            </button>
          </div>
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
          onCreated={id =>
            refreshFacilities()
              .then(() => id && selectFacility(id))
              .catch(() => {})
          }
        />
      )}
    </div>
  )
}
