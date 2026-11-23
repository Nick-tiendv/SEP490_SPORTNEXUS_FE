// Chuẩn hóa dữ liệu đợt giá đặc biệt và kiểm tra trùng phạm vi (không gọi API, test được bằng Node).
const dateOnly = value => (value ? String(value).slice(0, 10) : '')
const clockOnly = value => (value ? String(value).slice(0, 5) : '')

export function toPricePeriod(raw = {}) {
  return {
    id: String(raw.id ?? ''),
    name: raw.name || '',
    fromDate: dateOnly(raw.fromDate),
    toDate: dateOnly(raw.toDate),
    courtIds: Array.isArray(raw.courtIds) ? raw.courtIds.map(String) : [],
    startTime: clockOnly(raw.startTime),
    endTime: clockOnly(raw.endTime),
    price: Number(raw.price) || 0,
  }
}

// Hai khung giờ có giao nhau không ('' = cả ngày)
const timesOverlap = (aStart, aEnd, bStart, bEnd) => {
  if (!aStart || !aEnd || !bStart || !bEnd) return true
  return aStart < bEnd && bStart < aEnd
}

// Các đợt giá trùng phạm vi một thao tác đổi giá. courtIds rỗng = mọi sân.
export function findOverlappingPeriods(periods, { courtIds = [], dateFrom, dateTo, startTime = '', endTime = '' }) {
  return (periods || []).filter((period) => {
    if (period.toDate < dateFrom || period.fromDate > dateTo) return false
    const courtsOverlap = !courtIds.length || !period.courtIds.length || period.courtIds.some(id => courtIds.includes(id))
    return courtsOverlap && timesOverlap(startTime, endTime, period.startTime, period.endTime)
  })
}
