import { useState } from 'react'
import { X, MapPin, Star, CheckCircle2, Clock3, Pencil, CalendarDays, AlertTriangle, ShieldCheck } from 'lucide-react'
import { sportLabels, statusLabels, courtStatusLabels, formatNumber, getCourtStatus } from './facilityData.js'

export function FacilityStatus({ status }) {
  return <span className={`facilities-status ${status.toLowerCase()}`}><i />{statusLabels[status]}</span>
}

export default function FacilityDetails({ facility, onClose, onEdit, onStatus, onBookings, onPhoto }) {
  const [allCourts, setAllCourts] = useState(false)
  const maintenanceCount = facility.courts.filter(court => getCourtStatus(facility, court) === 'Maintenance').length
  return <aside className="facilities-details" aria-label="Chi tiết cơ sở">
    <header><h2>Chi tiết cơ sở <small>#{facility.id}</small></h2><button aria-label="Đóng chi tiết cơ sở" onClick={onClose}><X size={17} /></button></header>
    <div className="facilities-detail-body">
      <button className="facilities-cover" onClick={() => onPhoto(facility.photos[0])} aria-label="Xem ảnh bìa minh họa"><img src={facility.photos[0].src} alt="Ảnh bìa thể thao minh họa" style={{ objectPosition: facility.photos[0].position }} /><FacilityStatus status={facility.status} /><span>Ảnh minh họa</span></button>
      <div className="facilities-detail-title"><h3>{facility.name}</h3><span><Star size={14} fill="currentColor" /> {facility.rating ? facility.rating.toLocaleString('vi-VN') : 'Chưa đánh giá'}</span></div>
      <p className="facilities-detail-muted">{formatNumber(facility.reviews)} lượt đánh giá minh họa · {facility.sports.map(sport => sportLabels[sport]).join(' & ')}</p>
      <p className="facilities-address"><MapPin size={13} />{facility.address}</p>
      <section className="facilities-owner"><span className="facilities-owner-avatar">{facility.owner.name.split(' ').map(word => word[0]).slice(-2).join('')}</span><div><strong>{facility.owner.name}</strong><small>#{facility.owner.id} · Chủ sân</small><span><ShieldCheck size={11} />{facility.owner.verified ? 'Đã xác minh (minh họa)' : 'Chưa xác minh (minh họa)'}</span></div></section>
      <div className="facilities-info-grid"><section><small>Tổng số sân</small><strong>{formatNumber(facility.courts.length)} sân</strong><p>{facility.category}</p></section><section><small><Clock3 size={11} /> Giờ hoạt động</small><strong>{facility.opens} – {facility.closes}</strong><p>Mở cửa mỗi ngày</p></section></div>
      <section className="facilities-photos"><h4>Hình ảnh cơ sở <small>{facility.photos.length} ảnh minh họa</small></h4><div>{facility.photos.map((photo, index) => <button key={index} onClick={() => onPhoto(photo)} aria-label={`Xem ${photo.label.toLowerCase()}`}><img src={photo.src} style={{ objectPosition: photo.position }} alt={photo.label} /></button>)}</div></section>
      <section className="facilities-courts"><h4>Danh sách sân <small>{facility.courts.length} sân</small></h4>{facility.courts.slice(0, allCourts ? undefined : 4).map(court => {
        const status = getCourtStatus(facility, court)
        return <div key={court.id} className="facilities-court"><i className={status.toLowerCase()} /><div><strong>{court.name}</strong><small>{sportLabels[court.sport]}</small></div><span className={`facilities-court-status ${status.toLowerCase()}`}>{courtStatusLabels[status]}</span></div>
      })}{facility.courts.length > 4 && <button className="facilities-text-button" onClick={() => setAllCourts(!allCourts)}>{allCourts ? 'Thu gọn danh sách sân' : `Xem tất cả ${facility.courts.length} sân`}</button>}</section>
      {maintenanceCount > 0 && <p className="facilities-maintenance-note"><AlertTriangle size={15} /><span><strong>Thông báo bảo trì minh họa</strong>{maintenanceCount} sân đang bảo trì trong dữ liệu mẫu. Đây không phải lịch sử bảo trì thực tế.</span></p>}
      <p className="facilities-detail-muted">Dữ liệu bản mẫu · Không kết nối máy chủ</p>
    </div>
    <footer><button className="users-button primary" onClick={onEdit}><Pencil size={12} />Chỉnh sửa cơ sở</button><button className="users-button" onClick={onBookings}><CalendarDays size={12} />Xem đơn đặt sân</button><button className={`users-button ${facility.status === 'Disabled' ? 'primary' : 'users-danger'}`} onClick={onStatus}><CheckCircle2 size={12} />{facility.status === 'Disabled' ? 'Kích hoạt lại cơ sở' : 'Vô hiệu hóa cơ sở'}</button></footer>
  </aside>
}
