import { useEffect, useState } from 'react'
import { loadRepeatOccurrences } from './courtSlots.js'
import { WEEKDAYS, buildRepeatDates, formatRepeatDate, weekdayOf } from './recurringBooking.js'

// Đặt định kỳ: lặp lại các ca mẫu (cùng ngày gốc) vào các thứ đã chọn trong N tuần.
// templates: [{ courtId, courtName, sportName, start: 'HH:mm', end: 'HH:mm', price }]
// baseDate: 'YYYY-MM-DD' của các ca đã chọn (null nếu các ca khác ngày → không lặp được).
// Trả `slots` = ca của các ngày lặp lại (chỉ khi mọi buổi còn trống) và `recurring` để hiển thị ở trang thanh toán.
export function useRepeatBooking(templates, baseDate) {
  const [repeat, setRepeat] = useState({ enabled: false, weekdays: [], weeks: 4 })
  const [check, setCheck] = useState({ key: '', items: [], error: '' })
  const weekdays = repeat.weekdays.length ? repeat.weekdays : baseDate ? [weekdayOf(baseDate)] : []
  const key =
    repeat.enabled && baseDate && templates.length
      ? JSON.stringify({ dates: buildRepeatDates(baseDate, weekdays, repeat.weeks), templates })
      : ''

  useEffect(() => {
    if (!key) return undefined
    let cancelled = false
    const { dates, templates: list } = JSON.parse(key)
    loadRepeatOccurrences(dates, list)
      .then((items) => !cancelled && setCheck({ key, items, error: '' }))
      .catch((err) => !cancelled && setCheck({ key, items: [], error: err?.message || 'Không kiểm tra được lịch các tuần tiếp theo.' }))
    return () => { cancelled = true }
  }, [key])

  const loading = Boolean(key) && check.key !== key
  const items = key && !loading ? check.items : []
  const problems = items.filter((item) => item.status !== 'ok')
  const ready = !repeat.enabled || (Boolean(key) && !loading && !check.error && problems.length === 0)
  const slots = key && ready ? items.map((item) => item.slot) : []

  const toggleWeekday = (value) =>
    setRepeat((prev) => {
      const current = prev.weekdays.length ? prev.weekdays : weekdays
      const next = current.includes(value) ? current.filter((d) => d !== value) : [...current, value]
      return { ...prev, weekdays: next.length ? next : current }
    })

  const recurring = slots.length
    ? {
        weeks: repeat.weeks,
        weekdays: WEEKDAYS.filter((d) => weekdays.includes(d.value)).map((d) => d.short),
        dates: [baseDate, ...new Set(items.map((item) => item.date))].map(formatRepeatDate),
      }
    : null

  return {
    enabled: repeat.enabled,
    setEnabled: (enabled) => setRepeat((prev) => ({ ...prev, enabled })),
    weeks: repeat.weeks,
    setWeeks: (weeks) => setRepeat((prev) => ({ ...prev, weeks })),
    weekdays,
    toggleWeekday,
    baseDate,
    loading,
    error: key ? check.error : '',
    items,
    problems,
    ready,
    slots,
    recurring,
  }
}
