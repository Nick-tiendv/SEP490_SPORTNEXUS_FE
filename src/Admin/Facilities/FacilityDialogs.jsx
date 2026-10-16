import { useEffect, useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { getAmenityOptions, setFacilityStatus, updateFacility } from '../../api/admin/facilityApi.js'
import { statusLabels } from './facilityData.js'

const noop = () => {}

// PUT /api/v1/facilities/{id} — admin chỉnh sửa thông tin cơ sở.
export function FacilityFormDialog({ facility, onClose, onDone }) {
  const [values, setValues] = useState({ name: facility.name, address: facility.address, latitude: facility.latitude ?? '', longitude: facility.longitude ?? '', images: facility.images.join('\n') })
  const [amenityIds, setAmenityIds] = useState(() => new Set(facility.amenityIds.length ? facility.amenityIds : facility.amenities.map(item => item.id).filter(Boolean)))
  const [amenities, setAmenities] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    let cancelled = false
    getAmenityOptions().then(items => !cancelled && setAmenities(items)).catch(() => {})
    return () => { cancelled = true }
  }, [])
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const toggleAmenity = id => setAmenityIds(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const submit = async event => {
    event.preventDefault()
    const name = values.name.trim(), address = values.address.trim()
    const latitude = values.latitude === '' ? null : Number(values.latitude)
    const longitude = values.longitude === '' ? null : Number(values.longitude)
    const imageUrls = values.images.split('\n').map(line => line.trim()).filter(Boolean)
    if (name.length < 3) return setError('Tên cơ sở phải có ít nhất 3 ký tự.')
    if (!address) return setError('Vui lòng nhập địa chỉ.')
    if ((latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) || (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) return setError('Vĩ độ phải trong khoảng -90..90 và kinh độ trong khoảng -180..180.')
    if (imageUrls.some(url => !/^https?:\/\//i.test(url))) return setError('Mỗi dòng ảnh phải là một đường dẫn http(s).')
    setSubmitting(true); setError('')
    try {
      await updateFacility(facility.id, { name, address, latitude, longitude, imageUrls, amenityIds: amenities.length ? [...amenityIds] : null })
      onDone(`Đã cập nhật cơ sở ${name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Chỉnh sửa cơ sở" onClose={submitting ? noop : onClose}>
    <form className="users-form" onSubmit={submit} noValidate>
      <label>Tên cơ sở<input name="name" value={values.name} onChange={change} maxLength={100} required /></label>
      <label>Địa chỉ<input name="address" value={values.address} onChange={change} maxLength={250} required /></label>
      <div className="facilities-form-hours"><label>Vĩ độ<input name="latitude" type="number" step="any" value={values.latitude} onChange={change} /></label><label>Kinh độ<input name="longitude" type="number" step="any" value={values.longitude} onChange={change} /></label></div>
      {amenities.length > 0 && <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend>Tiện ích</legend><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{amenities.map(item => <label key={item.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={amenityIds.has(item.id)} onChange={() => toggleAmenity(item.id)} />{item.name}</label>)}</div></fieldset>}
      <label>Ảnh cơ sở (mỗi dòng một đường dẫn)<textarea name="images" rows={3} value={values.images} onChange={change} /></label>
      {error && <p className="users-form-error" role="alert">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang lưu…' : 'Lưu thay đổi'}</button></footer>
    </form>
  </DemoDialog>
}

const actionLabel = status => ({ Active: 'Kích hoạt / duyệt', Inactive: 'Vô hiệu hóa', Maintenance: 'Chuyển sang bảo trì', Rejected: 'Từ chối' }[status] || `Chuyển sang ${statusLabels[status] || status}`)

// PUT /api/v1/facilities/{id} { status } cho từng cơ sở.
export function FacilityStatusDialog({ facilities, status, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const targets = facilities.filter(facility => facility.status !== status)
  const confirm = async () => {
    setSubmitting(true); setError('')
    const results = await Promise.allSettled(targets.map(facility => setFacilityStatus(facility.id, status)))
    const failed = results.map((result, index) => result.status === 'rejected' && `${targets[index].name}: ${result.reason?.message}`).filter(Boolean)
    if (failed.length) { setError(`Thành công ${targets.length - failed.length}/${targets.length}. Lỗi — ${failed.join(' · ')}`); setSubmitting(false); if (failed.length < targets.length) onDone(null, true); return }
    onDone(`Đã cập nhật ${targets.length} cơ sở sang “${statusLabels[status] || status}”.`)
  }
  const danger = /inactive|reject/i.test(status)
  return <DemoDialog title="Xác nhận thay đổi trạng thái" onClose={submitting ? noop : onClose}>
    {targets.length ? <p>{actionLabel(status)} {targets.length} cơ sở?</p> : <p>Các cơ sở đã chọn đều đang ở trạng thái “{statusLabels[status] || status}”.</p>}
    <ul className="facilities-confirm-list">{targets.map(facility => <li key={facility.id}>{facility.name}</li>)}</ul>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${danger ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting || !targets.length}>{submitting ? 'Đang cập nhật…' : 'Xác nhận'}</button></footer>
  </DemoDialog>
}

export function FacilityPhotoDialog({ photo, onClose }) {
  return <DemoDialog title={photo.label || 'Hình ảnh cơ sở'} closeLabel="Đóng hình ảnh" onClose={onClose}><img className="facilities-lightbox" src={photo.src} alt={photo.label || 'Hình ảnh cơ sở'} /></DemoDialog>
}
