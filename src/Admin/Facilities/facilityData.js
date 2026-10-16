// Nhãn hiển thị và hàm tiện ích cho trang Quản lý cơ sở thể thao (dữ liệu thật lấy qua src/api/admin/facilityApi.js).
// Giá trị trạng thái gửi qua PUT /api/v1/facilities/{id} { status } — cần đối chiếu với enum thật của BE.

export const statusLabels = { Pending: 'Chờ duyệt', Active: 'Đang hoạt động', Maintenance: 'Đang bảo trì', Inactive: 'Đã tắt', Rejected: 'Đã từ chối' }
export const courtStatusLabels = { Available: 'Sẵn sàng', Active: 'Sẵn sàng', InUse: 'Đang sử dụng', Maintenance: 'Bảo trì', Inactive: 'Đã tắt', Disabled: 'Đã tắt' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Tennis: 'Quần vợt', Football: 'Bóng đá', Basketball: 'Bóng rổ' }
// Lớp CSS hiện có: (mặc định = xanh), maintenance (vàng), disabled (đỏ).
export const statusTone = status => (/pending|maintenance/i.test(status) ? 'maintenance' : /inactive|disable|reject|lock|ban/i.test(status) ? 'disabled' : /inuse|in_use/i.test(status) ? 'inuse' : 'active')
export const isPending = facility => /pending/i.test(facility.status)
export const isDisabled = facility => statusTone(facility.status) === 'disabled'

export const formatNumber = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const fallbackPhoto = '/sports-bg.jpg'

const normalize = text => String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
export function filterFacilities(facilities, filters) {
  const query = normalize(filters.search.trim())
  return facilities.filter(facility => (!query || normalize(`${facility.name} ${facility.owner.name} ${facility.address}`).includes(query))
    && (!filters.rating || (facility.rating ?? 0) >= Number(filters.rating)))
}

export function facilityStats(facilities) {
  const active = facilities.filter(facility => statusTone(facility.status) === 'active').length
  const pending = facilities.filter(isPending).length
  const percent = value => (facilities.length ? `${((value / facilities.length) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '0%')
  const courts = facilities.reduce((sum, facility) => sum + (facility.courtCount || 0), 0)
  return [
    { label: 'Tổng cơ sở sân', value: facilities.length, trend: 'Theo bộ lọc trạng thái / môn', icon: 'facilities' },
    { label: 'Cơ sở đang hoạt động', value: active, trend: `${percent(active)} cơ sở hoạt động`, icon: 'active' },
    { label: 'Chờ duyệt', value: pending, trend: pending ? 'Cần quản trị viên xét duyệt' : 'Không có cơ sở chờ duyệt', icon: 'maintenance' },
    { label: 'Tổng số sân', value: facilities.some(facility => facility.courtCount != null) ? courts : NaN, trend: 'Cộng từ các cơ sở', icon: 'courts' },
  ]
}

export function facilitiesCsv(facilities) {
  const escape = value => {
    const text = String(value ?? '')
    // Keep names/addresses from becoming spreadsheet formulas.
    return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`
  }
  const rows = [['Mã cơ sở', 'Tên cơ sở', 'Chủ sân', 'Địa chỉ', 'Môn thể thao', 'Số sân', 'Trạng thái', 'Đánh giá'],
    ...facilities.map(facility => [facility.id, facility.name, facility.owner.name, facility.address, facility.sports.map(sport => sportLabels[sport] || sport).join(', '), facility.courtCount ?? '', statusLabels[facility.status] || facility.status, facility.rating ?? 'Chưa đánh giá'])]
  return '﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')
}
