import { defaultSettings, initialChangeHistory, settingsFields, settingsStorageKey, settingsVersion, tournamentFormats } from './settingsData.js'

export const cloneSettings = settings => structuredClone(settings)
export const hasChanges = (current, saved) => JSON.stringify(current) !== JSON.stringify(saved)
export const formatSettingsTime = value => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })

export function validateSettings(settings) {
  const errors = {}
  for (const [group, fields] of Object.entries(settingsFields)) {
    for (const [key, field] of Object.entries(fields)) {
      const value = settings?.[group]?.[key]
      const path = `${group}.${key}`
      if (field.type === 'toggle') {
        if (typeof value !== 'boolean') errors[path] = 'Giá trị bật/tắt không hợp lệ.'
      } else if (field.type === 'number') {
        const parsed = Number(value)
        if (!['number', 'string'].includes(typeof value) || String(value).trim() === '' || !Number.isFinite(parsed)) errors[path] = 'Vui lòng nhập một số hợp lệ.'
        else if (parsed < field.min || parsed > field.max) errors[path] = `Giá trị phải từ ${field.min} đến ${field.max} ${field.unit}.`
        else if (field.integer && !Number.isInteger(parsed)) errors[path] = 'Giá trị phải là số nguyên.'
      } else if (field.type === 'select') {
        if (!field.options.some(([option]) => option === value)) errors[path] = 'Vui lòng chọn một giá trị hợp lệ.'
      } else if (typeof value !== 'string' || !value.trim() || value.trim().length > field.maxLength) {
        errors[path] = `Nội dung phải có từ 1 đến ${field.maxLength} ký tự.`
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errors[path] = 'Email hỗ trợ không đúng định dạng.'
    }
  }
  if (!errors['booking.minDuration'] && !errors['booking.maxDuration'] && Number(settings.booking.maxDuration) < Number(settings.booking.minDuration)) {
    errors['booking.maxDuration'] = 'Thời lượng tối đa không được nhỏ hơn thời lượng tối thiểu.'
  }
  const formats = settings?.tournament?.formats
  if (!Array.isArray(formats) || !formats.length || new Set(formats).size !== formats.length || formats.some(value => !tournamentFormats.some(([id]) => id === value))) {
    errors['tournament.formats'] = 'Chọn ít nhất một hình thức giải đấu hợp lệ.'
  }
  return errors
}

// Allowlisted fields only: unexpected credentials and auth data never enter saved/exported configuration.
export function sanitizeSettings(settings) {
  return Object.fromEntries(Object.entries(defaultSettings).map(([group, fields]) => [group,
    Object.fromEntries(Object.keys(fields).map(key => {
      const field = settingsFields[group]?.[key]
      const value = settings[group][key]
      return [key, Array.isArray(value) ? [...value] : field?.type === 'number' ? Number(value) : typeof value === 'string' && field?.type !== 'select' ? value.trim() : value]
    })),
  ]))
}
export function settingsChanges(before, after) {
  const changes = []
  for (const [group, fields] of Object.entries(defaultSettings)) {
    for (const key of Object.keys(fields)) {
      if (JSON.stringify(before[group][key]) !== JSON.stringify(after[group][key])) changes.push({ path: `${group}.${key}`, label: settingsFields[group]?.[key]?.label || "Hình thức giải đấu", before: structuredClone(before[group][key]), after: structuredClone(after[group][key]) })
    }
  }
  return changes
}
export function makeHistoryEntry(before, after, actor, at = new Date().toISOString(), id = crypto.randomUUID()) {
  const changes = settingsChanges(before, after)
  return { id, at, actor, groups: [...new Set(changes.map(change => change.path.split('.')[0]))], changes }
}

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage }
  catch { return null }
}
function cleanHistory(history) {
  if (!Array.isArray(history)) return cloneSettings(initialChangeHistory)
  return history.slice(0, 100).filter(entry => entry && typeof entry.id === 'string' && typeof entry.actor === 'string' && Number.isFinite(Date.parse(entry.at)) && Array.isArray(entry.changes)).map(entry => {
    const changes = entry.changes.filter(change => {
      const [group, key] = String(change?.path || '').split('.')
      if (!Object.hasOwn(defaultSettings, group) || !Object.hasOwn(defaultSettings[group], key)) return false
      const expected = defaultSettings[group][key]
      const validValue = value => Array.isArray(expected)
        ? Array.isArray(value) && value.every(id => tournamentFormats.some(([allowed]) => allowed === id))
        : typeof value === typeof expected && (typeof value !== 'number' || Number.isFinite(value))
      return validValue(change.before) && validValue(change.after)
    }).map(change => ({ path: change.path, label: settingsFields[change.path.split('.')[0]]?.[change.path.split('.')[1]]?.label || "Hình thức giải đấu", before: change.before, after: change.after }))
    return { id: entry.id, at: entry.at, actor: entry.actor.slice(0, 120), groups: [...new Set(changes.map(change => change.path.split('.')[0]))], changes }
  }).filter(entry => entry.changes.length)
}
export function loadMockSettings(storage = browserStorage()) {
  const fallback = { settings: cloneSettings(defaultSettings), history: cloneSettings(initialChangeHistory), notice: '' }
  if (!storage) return { ...fallback, notice: typeof window === 'undefined' ? '' : 'LocalStorage không khả dụng. Cấu hình chỉ được giữ trong phiên hiện tại.' }
  try {
    const raw = storage.getItem(settingsStorageKey)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (parsed?.version !== settingsVersion || Object.keys(validateSettings(parsed.settings)).length) return { ...fallback, notice: 'Dữ liệu lưu mẫu không hợp lệ. Đã tải cấu hình mặc định.' }
    return { settings: sanitizeSettings(parsed.settings), history: cleanHistory(parsed.history), notice: '' }
  } catch { return { ...fallback, notice: 'Không thể đọc cấu hình mẫu đã lưu. Đã tải cấu hình mặc định.' } }
}
export function persistMockSettings(settings, history, storage = browserStorage()) {
  if (!storage) return { persisted: false, notice: 'Đã lưu trong phiên hiện tại; LocalStorage không khả dụng.' }
  try {
    storage.setItem(settingsStorageKey, JSON.stringify({ version: settingsVersion, settings: sanitizeSettings(settings), history: cleanHistory(history) }))
    return { persisted: true, notice: '' }
  } catch { return { persisted: false, notice: 'Đã lưu trong phiên hiện tại; không thể ghi LocalStorage.' } }
}
export function exportSettings(settings) {
  const errors = validateSettings(settings)
  if (Object.keys(errors).length) throw new Error('Cấu hình chưa hợp lệ. Vui lòng sửa các trường trước khi xuất.')
  return JSON.stringify({ mode: 'mock', version: settingsVersion, settings: sanitizeSettings(settings) }, null, 2)
}
