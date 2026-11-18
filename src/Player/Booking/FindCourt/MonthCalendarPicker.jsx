import { useEffect, useRef, useState } from 'react'

// Lịch chọn ngày theo tháng (bấm "Chọn lịch" mở bảng ngày của tháng, bấm 1 ngày để xem lưới ca ngày đó).
// value / minDate: 'YYYY-MM-DD'. label: chữ trên nút (vd hiện ngày đang chọn khi nằm ngoài dải 7 ngày).
const WEEK_HEAD = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const pad = (n) => String(n).padStart(2, '0')
const toKey = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`
const monthOf = (dateStr) => ({ y: Number(dateStr.slice(0, 4)), m: Number(dateStr.slice(5, 7)) })
const shiftMonth = ({ y, m }, delta) => {
  const index = y * 12 + (m - 1) + delta
  return { y: Math.floor(index / 12), m: (index % 12) + 1 }
}

export default function MonthCalendarPicker({ value, minDate, label = 'Chọn lịch', onChange }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => monthOf(value || minDate))
  const rootRef = useRef(null)

  // Đóng khi bấm ra ngoài hoặc nhấn Esc
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (!open) setView(monthOf(value || minDate))
    setOpen((v) => !v)
  }

  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate()
  // getUTCDay: 0 = CN … 6 = T7; lịch bắt đầu từ Thứ 2
  const leading = (new Date(Date.UTC(view.y, view.m - 1, 1)).getUTCDay() + 6) % 7
  const minMonth = monthOf(minDate)
  const canPrev = view.y * 12 + view.m > minMonth.y * 12 + minMonth.m

  return (
    <div className="mb-cal" ref={rootRef}>
      <button type="button" className="mb-date-custom-picker" aria-haspopup="dialog" aria-expanded={open} onClick={toggle} title="Chọn ngày khác từ lịch">
        <span className="material-symbols-outlined">calendar_month</span>
        <span>{label}</span>
      </button>
      {open && (
        <div className="mb-cal-pop" role="dialog" aria-label="Chọn ngày đặt sân">
          <div className="mb-cal-head">
            <button type="button" aria-label="Tháng trước" disabled={!canPrev} onClick={() => setView((v) => shiftMonth(v, -1))}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <strong>Tháng {view.m}/{view.y}</strong>
            <button type="button" aria-label="Tháng sau" onClick={() => setView((v) => shiftMonth(v, 1))}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="mb-cal-grid">
            {WEEK_HEAD.map((d) => <span key={d} className="mb-cal-weekday">{d}</span>)}
            {Array.from({ length: leading }, (_, i) => <span key={`blank-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const key = toKey(view.y, view.m, i + 1)
              const disabled = key < minDate
              const classes = ['mb-cal-day', key === value ? 'is-selected' : '', key === minDate ? 'is-today' : ''].filter(Boolean).join(' ')
              return (
                <button
                  key={key}
                  type="button"
                  className={classes}
                  disabled={disabled}
                  aria-pressed={key === value}
                  onClick={() => { onChange(key); setOpen(false) }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <p className="mb-cal-note">Ngày đã qua không chọn được. Ca chỉ hiện khi chủ sân đã mở lịch cho ngày đó.</p>
        </div>
      )}
    </div>
  )
}
