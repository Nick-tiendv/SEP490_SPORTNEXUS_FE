import { useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { facilityOwners, sportLabels, statusLabels } from './facilityData.js'

export function FacilityFormDialog({ facility, facilities, onClose, onSave }) {
  const [values, setValues] = useState({ name: facility?.name || '', ownerId: facility?.owner.id || facilityOwners[0].id,
    location: facility?.location || '', address: facility?.address || '', sports: facility?.sports.join(',') || 'Badminton',
    count: String(facility?.courts.length || 6), opens: facility?.opens || '05:30', closes: facility?.closes || '23:00',
    category: facility?.category || 'Cơ sở thể thao tổng hợp',
  })
  const [error, setError] = useState('')
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 3) return setError('Tên cơ sở phải có ít nhất 3 ký tự.')
    if (facilities.some(item => item.id !== facility?.id && item.name.toLocaleLowerCase('vi') === clean.name.toLocaleLowerCase('vi'))) return setError('Tên cơ sở đã có trong danh sách minh họa.')
    if (!clean.location || !clean.address || !clean.category) return setError('Vui lòng nhập đầy đủ khu vực, địa chỉ và loại cơ sở.')
    const count = Number(clean.count)
    if (!Number.isInteger(count) || count < 1 || count > 30) return setError('Số sân phải là số nguyên từ 1 đến 30.')
    if (!clean.opens || !clean.closes || clean.opens >= clean.closes) return setError('Giờ đóng cửa phải sau giờ mở cửa trong cùng ngày.')
    onSave({ ...clean, count, sports: clean.sports.split(','), owner: facilityOwners.find(owner => owner.id === clean.ownerId) })
  }
  const sportChoices = [...new Set([values.sports, ...Object.keys(sportLabels), 'Badminton,Pickleball', 'Badminton,Tennis', 'Tennis,Pickleball', 'Badminton,Football'])]
  return <DemoDialog title={facility ? 'Chỉnh sửa cơ sở — Bản mẫu' : 'Thêm cơ sở — Bản mẫu'} closeLabel="Đóng hộp thoại" onClose={onClose}>
    <p className="users-demo-note">Chỉ cập nhật dữ liệu minh họa trong phiên hiện tại. Tải lại trang sẽ khôi phục dữ liệu; không lưu lên máy chủ.</p>
    <form className="users-form" onSubmit={submit} noValidate>
      <label>Tên cơ sở<input name="name" value={values.name} onChange={change} maxLength={100} required /></label>
      <label>Chủ sân<select name="ownerId" value={values.ownerId} onChange={change}>{facilityOwners.map(owner => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select></label>
      {[['location', 'Khu vực'], ['address', 'Địa chỉ'], ['category', 'Loại cơ sở']].map(([name, label]) => <label key={name}>{label}<input name={name} value={values[name]} onChange={change} required maxLength={180} /></label>)}
      <label>Môn thể thao<select name="sports" value={values.sports} onChange={change}>{sportChoices.map(choice => <option key={choice} value={choice}>{choice.split(',').map(sport => sportLabels[sport]).join(' & ')}</option>)}</select></label>
      <label>Số sân<input name="count" type="number" min="1" max="30" step="1" value={values.count} onChange={change} required /></label>
      <div className="facilities-form-hours"><label>Giờ mở cửa<input name="opens" type="time" value={values.opens} onChange={change} required /></label><label>Giờ đóng cửa<input name="closes" type="time" value={values.closes} onChange={change} required /></label></div>
      {error && <p className="users-form-error" role="alert">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose}>Hủy</button><button className="users-button primary">{facility ? 'Lưu thay đổi minh họa' : 'Thêm cơ sở minh họa'}</button></footer>
    </form>
  </DemoDialog>
}

export function FacilityStatusDialog({ facilities, status, onClose, onConfirm }) {
  return <DemoDialog title="Xác nhận thay đổi trạng thái — Bản mẫu" closeLabel="Đóng hộp thoại" onClose={onClose}>
    <p className="users-demo-note">Thao tác chỉ thay đổi trạng thái minh họa trong phiên hiện tại. Không tác động đến cơ sở thật, sân, tài khoản hoặc đơn đặt sân trên máy chủ.</p>
    <p>{status === 'Disabled' ? 'Vô hiệu hóa' : status === 'Maintenance' ? 'Chuyển sang bảo trì' : 'Kích hoạt lại'} {facilities.length} cơ sở?</p>
    <ul className="facilities-confirm-list">{facilities.map(facility => <li key={facility.id}>{facility.name}</li>)}</ul>
    <p className="facilities-confirm-hint">Trạng thái mới: {statusLabels[status]}. {status === 'Active' && 'Các sân giữ trạng thái minh họa riêng trước đó.'}</p>
    <footer><button className="users-button" onClick={onClose}>Hủy</button><button className={`users-button ${status === 'Disabled' ? 'users-danger' : 'primary'}`} onClick={onConfirm}>Xác nhận thay đổi minh họa</button></footer>
  </DemoDialog>
}

export function FacilityPhotoDialog({ photo, onClose }) {
  return <DemoDialog title="Xem hình ảnh minh họa" closeLabel="Đóng hình ảnh" onClose={onClose}><img className="facilities-lightbox" src={photo.src} style={{ objectPosition: photo.position }} alt={photo.label} /><p className="users-demo-note">Ảnh minh họa dùng tài sản có sẵn của SportNexus; không phải ảnh chụp cơ sở thực tế.</p></DemoDialog>
}
