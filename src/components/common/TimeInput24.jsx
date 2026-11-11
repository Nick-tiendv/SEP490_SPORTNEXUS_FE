// Ô chọn giờ dạng 24 giờ (HH:mm, 00:00 – 23:59), không phụ thuộc AM/PM theo ngôn ngữ trình duyệt như <input type="time">.
// value / onChange dùng chuỗi "HH:mm"; allowEmpty = cho bỏ trống (giá trị '').
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export default function TimeInput24({ value, onChange, label, allowEmpty = false, selectClassName = 'snx-select', selectStyle }) {
  const match = /^(\d{2}):(\d{2})/.exec(value || '')
  const hh = match ? match[1] : ''
  const mm = match ? match[2] : ''
  const emit = (h, m) => onChange(h ? `${h}:${m || '00'}` : '')
  const style = { width: 'auto', minWidth: 72, ...selectStyle }

  return (
    <span role="group" aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <select className={selectClassName} style={style} value={hh} onChange={(e) => emit(e.target.value, mm)} aria-label={`${label} (giờ)`}>
        {(allowEmpty || !hh) && <option value="" disabled={!allowEmpty}>--</option>}
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span aria-hidden="true" style={{ fontWeight: 700 }}>:</span>
      <select className={selectClassName} style={style} value={mm} disabled={!hh} onChange={(e) => emit(hh, e.target.value)} aria-label={`${label} (phút)`}>
        {!hh && <option value="">--</option>}
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </span>
  )
}
