import { useEffect, useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import FacilityAddressFields from '../../components/common/FacilityAddressFields.jsx'
import { approveFacility, getAmenityOptions, lockFacility, rejectFacility, unlockFacility, updateFacility } from '../../api/admin/facilityApi.js'
import { composeFacilityAddress, isValidProvince, isValidWard, parseFacilityAddress, validateFacilityAddress } from '../../utils/vnAddress.js'
import { facilityActions } from './facilityData.js'

const noop = () => { }

// PUT /api/v1/facilities/{id} — admin chỉnh sửa thông tin cơ sở.
export function FacilityFormDialog({ facility, onClose, onDone }) {
  const [values, setValues] = useState(() => {
    const parsed = parseFacilityAddress({
      address: facility.address,
      province: facility.province,
      district: facility.district,
    })
    return {
      name: facility.name === '—' ? '' : (facility.name || ''),
      ...parsed,
      latitude: facility.latitude ?? '',
      longitude: facility.longitude ?? '',
      images: (facility.images || []).join('\n'),
    }
  })
  const [amenityIds, setAmenityIds] = useState(() => new Set(facility.amenityIds.length ? facility.amenityIds : facility.amenities.map(item => item.id).filter(Boolean)))
  const [amenities, setAmenities] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    let cancelled = false
    getAmenityOptions().then(items => !cancelled && setAmenities(items)).catch(() => { })
    return () => { cancelled = true }
  }, [])
  const change = event => {
    setValues({ ...values, [event.target.name]: event.target.value })
    if (error) setError('')
  }
  const patchAddress = patch => {
    setValues(previous => ({ ...previous, ...patch }))
    if (error) setError('')
  }
  const toggleAmenity = id => setAmenityIds(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const addressErrors = submitted
    ? {
      province: !isValidProvince(values.province),
      district: !isValidWard(values.province, values.district),
      street: !values.street.trim(),
    }
    : {}
  const submit = async event => {
    event.preventDefault()
    setSubmitted(true)
    const name = values.name.trim()
    const addressError = validateFacilityAddress(values)
    const address = composeFacilityAddress({
      street: values.street,
      district: values.district,
      province: values.province,
    })
    const latitude = values.latitude === '' ? null : Number(values.latitude)
    const longitude = values.longitude === '' ? null : Number(values.longitude)
    const imageUrls = values.images.split('\n').map(line => line.trim()).filter(Boolean)
    if (name.length < 3) return setError('Tên cơ sở phải có ít nhất 3 ký tự.')
    if (addressError) return setError(addressError)
    if (address.length > 250) return setError('Địa chỉ đầy đủ không được vượt quá 250 ký tự.')
    if ((latitude == null) !== (longitude == null)) return setError('Vui lòng nhập đầy đủ cả vĩ độ và kinh độ, hoặc để trống cả hai.')
    if ((latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) || (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) return setError('Vĩ độ phải trong khoảng -90..90 và kinh độ trong khoảng -180..180.')
    if (imageUrls.some(url => !/^https?:\/\//i.test(url))) return setError('Mỗi dòng ảnh phải là một đường dẫn http(s).')
    setSubmitting(true); setError('')
    try {
      await updateFacility(facility.id, {
        name,
        address,
        province: values.province,
        district: values.district,
        latitude,
        longitude,
        imageUrls,
        amenityIds: amenities.length ? [...amenityIds] : null,
      })
      onDone(`Đã cập nhật cơ sở ${name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Chỉnh sửa cơ sở" onClose={submitting ? noop : onClose}>
    <form className="users-form" onSubmit={submit} noValidate>
      <label>Tên cơ sở<input name="name" value={values.name} onChange={change} maxLength={100} required /></label>
      <FacilityAddressFields
        province={values.province}
        district={values.district}
        street={values.street}
        legacyProvince={values.legacyProvince}
        legacyDistrict={values.legacyDistrict}
        onChange={patchAddress}
        disabled={submitting}
        errors={addressErrors}
      />
      <div className="facilities-form-hours"><label>Vĩ độ<input name="latitude" type="number" step="any" value={values.latitude} onChange={change} /></label><label>Kinh độ<input name="longitude" type="number" step="any" value={values.longitude} onChange={change} /></label></div>
      {amenities.length > 0 && <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend>Tiện ích</legend><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{amenities.map(item => <label key={item.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={amenityIds.has(item.id)} onChange={() => toggleAmenity(item.id)} />{item.name}</label>)}</div></fieldset>}
      <label>Ảnh cơ sở (mỗi dòng một đường dẫn)<textarea name="images" rows={3} value={values.images} onChange={change} /></label>
      {error && <p className="users-form-error" role="alert">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang lưu…' : 'Lưu thay đổi'}</button></footer>
    </form>
  </DemoDialog>
}

const runAction = {
  approve: id => approveFacility(id),
  reject: (id, { reason }) => rejectFacility(id, reason),
  lock: (id, options) => lockFacility(id, options),
  unlock: id => unlockFacility(id),
}

// PATCH /api/v1/admin/facilities/{id}/approve | reject { reason } | lock { reason, cancelUpcomingBookings } | unlock.
export function FacilityActionDialog({ facilities, action: actionKey, onClose, onDone }) {
  const action = facilityActions[actionKey]
  const [reason, setReason] = useState('')
  const [cancelUpcomingBookings, setCancelUpcomingBookings] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const targets = facilities.filter(action.allowed)
  const skipped = facilities.length - targets.length
  const confirm = async () => {
    if (action.reason && !reason.trim()) return setError('Vui lòng nhập lý do.')
    setSubmitting(true); setError('')
    const results = await Promise.allSettled(targets.map(facility => runAction[actionKey](facility.id, { reason: reason.trim(), cancelUpcomingBookings })))
    const failed = results.map((result, index) => result.status === 'rejected' && `${targets[index].name}: ${result.reason?.message}`).filter(Boolean)
    if (failed.length) { setError(`Thành công ${targets.length - failed.length}/${targets.length}. Lỗi — ${failed.join(' · ')}`); setSubmitting(false); if (failed.length < targets.length) onDone(null, true); return }
    onDone(`Đã ${action.done} ${targets.length} cơ sở.`)
  }
  return <DemoDialog title={action.label} onClose={submitting ? noop : onClose}>
    {targets.length ? <p>{action.label} cho {targets.length} cơ sở sau?</p> : <p>Không có cơ sở nào trong danh sách đã chọn có thể {action.done}.</p>}
    <ul className="facilities-confirm-list">{targets.map(facility => <li key={facility.id}>{facility.name}</li>)}</ul>
    {skipped > 0 && targets.length > 0 && <p className="facilities-detail-muted">Bỏ qua {skipped} cơ sở không phù hợp với thao tác này.</p>}
    {action.reason && targets.length > 0 && <div className="users-form"><label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder={actionKey === 'reject' ? 'Ví dụ: Thông tin địa chỉ chưa chính xác…' : 'Ví dụ: Nhiều báo cáo vi phạm…'} /></label>
      {actionKey === 'lock' && <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={cancelUpcomingBookings} onChange={event => setCancelUpcomingBookings(event.target.checked)} />Hủy các lượt đặt sân sắp tới</label>}</div>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${action.danger ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting || !targets.length}>{submitting ? 'Đang xử lý…' : 'Xác nhận'}</button></footer>
  </DemoDialog>
}

export function FacilityPhotoDialog({ photo, onClose }) {
  return <DemoDialog title={photo.label || 'Hình ảnh cơ sở'} closeLabel="Đóng hình ảnh" onClose={onClose}><img className="facilities-lightbox" src={photo.src} alt={photo.label || 'Hình ảnh cơ sở'} /></DemoDialog>
}
