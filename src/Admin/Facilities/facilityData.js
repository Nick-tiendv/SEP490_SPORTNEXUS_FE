// Nhãn hiển thị và hàm tiện ích cho trang Quản lý cơ sở thể thao (dữ liệu thật lấy qua src/api/admin/facilityApi.js).

// Trạng thái hiển thị (gộp từ approvalStatus / isLocked / isDeleted — xem displayStatus trong facilityApi.js).
export const statusLabels = { Pending: 'Chờ duyệt', Active: 'Đang hoạt động', Rejected: 'Đã từ chối', Locked: 'Đã khóa', Inactive: 'Tạm ngưng', Deleted: 'Đã xóa' }
// Bộ lọc trạng thái → query của GET /api/v1/admin/facilities.
export const statusFilters = {
  Pending: { ApprovalStatus: 'PENDING' },
  Active: { ApprovalStatus: 'APPROVED', IsLocked: false },
  Rejected: { ApprovalStatus: 'REJECTED' },
  Locked: { IsLocked: true },
  Deleted: { IsDeleted: true },
}
export const courtStatusLabels = { Available: 'Sẵn sàng', Active: 'Sẵn sàng', InUse: 'Đang sử dụng', Maintenance: 'Bảo trì', Inactive: 'Đã tắt', Disabled: 'Đã tắt' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Tennis: 'Quần vợt', Football: 'Bóng đá', Basketball: 'Bóng rổ' }
// Lớp CSS hiện có: (mặc định = xanh), maintenance (vàng), disabled (đỏ).
export const statusTone = status => (/pending|maintenance/i.test(status) ? 'maintenance' : /inactive|disable|reject|lock|ban|delete/i.test(status) ? 'disabled' : /inuse|in_use/i.test(status) ? 'inuse' : 'active')
export const isPending = facility => facility.status === 'Pending'

// Thao tác quản trị: approve / reject / lock / unlock.
export const facilityActions = {
  approve: { label: 'Duyệt cơ sở', done: 'duyệt', allowed: facility => facility.status === 'Pending' || facility.status === 'Rejected' },
  reject: { label: 'Từ chối cơ sở', done: 'từ chối', allowed: facility => facility.status === 'Pending', reason: true, danger: true },
  lock: { label: 'Khóa cơ sở', done: 'khóa', allowed: facility => !facility.locked && !facility.deleted, reason: true, danger: true },
  unlock: { label: 'Mở khóa cơ sở', done: 'mở khóa', allowed: facility => facility.locked },
}

export const formatNumber = value => (Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—')
export const fallbackPhoto = '/sports-bg.jpg'

export function facilityStats(stats) {
  const percent = (value, total) => (Number.isFinite(value) && total ? `${((value / total) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—')
  return [
    { label: 'Tổng cơ sở sân', value: stats.total, trend: `${formatNumber(stats.newThisMonth)} cơ sở mới trong tháng`, icon: 'facilities' },
    { label: 'Đang hiển thị công khai', value: stats.public, trend: `${percent(stats.public, stats.total)} · ${formatNumber(stats.locked)} bị khóa`, icon: 'active' },
    { label: 'Chờ duyệt', value: stats.pending, trend: `${formatNumber(stats.rejected)} đã từ chối`, icon: 'maintenance' },
    { label: 'Tổng số sân', value: stats.courts, trend: `${formatNumber(stats.owners)} chủ sân`, icon: 'courts' },
  ]
}

export function facilitiesCsv(facilities) {
  const escape = value => {
    const text = String(value ?? '')
    // Keep names/addresses from becoming spreadsheet formulas.
    return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`
  }
  const rows = [['Mã cơ sở', 'Tên cơ sở', 'Chủ sân', 'Email chủ sân', 'Địa chỉ', 'Số sân', 'Trạng thái', 'Đánh giá', 'Ngày tạo'],
    ...facilities.map(facility => [facility.id, facility.name, facility.owner.name, facility.owner.email, facility.address, facility.courtCount ?? '', statusLabels[facility.status] || facility.status, facility.rating ?? 'Chưa đánh giá', facility.createdAt ? new Date(facility.createdAt).toLocaleDateString('vi-VN') : ''])]
  return '﻿' + rows.map(row => row.map(escape).join(',')).join('\r\n')
}
