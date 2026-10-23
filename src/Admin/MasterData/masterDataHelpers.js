// Nhãn và hàm thuần cho trang Danh mục dùng chung (docs 33). Dữ liệu thật lấy qua src/api/admin/masterDataApi.js.

export const MAX_NAME = 100
export const MAX_RULES = 5000
export const MAX_ICON_CODE = 50

export const kinds = {
  sports: { label: 'Môn thể thao', noun: 'môn thể thao', blank: { name: '', description: '' } },
  amenities: { label: 'Tiện ích', noun: 'tiện ích', blank: { name: '', iconCode: '' } },
}

// Mã icon BE đang dùng cho tiện ích (gợi ý khi nhập, không bắt buộc chọn trong danh sách này).
export const iconCodes = {
  parking: 'Bãi gửi xe',
  equipment: 'Cho thuê dụng cụ',
  canteen: 'Căng tin',
  air_conditioner: 'Máy lạnh',
  water: 'Nước uống',
  shower: 'Phòng tắm',
  wifi: 'Wifi',
  light: 'Đèn chiếu sáng',
}

export const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
export const normalize = value => String(value ?? '').toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

// Số nơi đang dùng: sân con + giải đấu (môn) hoặc số cơ sở (tiện ích).
export const usageCount = (kind, item) => (kind === 'sports' ? item.courtCount + item.tournamentCount : item.facilityCount)

export function filterMasterData(items, { search = '', showDeleted = false } = {}) {
  const query = normalize(search.trim())
  return items
    .filter(item => showDeleted || !item.isDeleted)
    .filter(item => !query || normalize(`${item.name} ${item.description || ''} ${item.iconCode || ''}`).includes(query))
    .sort((a, b) => Number(a.isDeleted) - Number(b.isDeleted) || a.name.localeCompare(b.name, 'vi'))
}

export function masterDataStats(kind, items) {
  const active = items.filter(item => !item.isDeleted)
  return { active: active.length, inUse: active.filter(item => usageCount(kind, item) > 0).length, deleted: items.length - active.length }
}

// Kiểm tra trước khi gửi, theo ràng buộc của SportCategoryRequest / AmenityRequest. Trả '' nếu hợp lệ.
export function validateMasterData(kind, values, items = [], editingId = null) {
  const name = values.name.trim()
  if (!name) return `Vui lòng nhập tên ${kinds[kind].noun}.`
  if (name.length > MAX_NAME) return `Tên tối đa ${MAX_NAME} ký tự.`
  // BE trả 409 nếu trùng tên (kể cả mục đã xóa vẫn chặn khi khôi phục), báo sớm cho mục đang hoạt động.
  if (items.some(item => !item.isDeleted && item.id !== editingId && normalize(item.name) === normalize(name))) return `${kinds[kind].label} “${name}” đã tồn tại.`
  if (kind === 'sports' && values.description.trim().length > MAX_RULES) return `Mô tả luật tối đa ${formatNumber(MAX_RULES)} ký tự.`
  if (kind === 'amenities' && values.iconCode.trim().length > MAX_ICON_CODE) return `Mã icon tối đa ${MAX_ICON_CODE} ký tự.`
  return ''
}

// Môn còn sân con đang dùng thì BE chặn xóa; giải đấu chỉ chặn khi chưa kết thúc nên để BE quyết định.
export function deleteBlockReason(kind, item) {
  if (kind === 'sports' && item.courtCount > 0) return `Đang có ${formatNumber(item.courtCount)} sân con dùng môn này, không thể xóa.`
  return ''
}
