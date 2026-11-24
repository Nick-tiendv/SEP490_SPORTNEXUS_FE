import { useState } from 'react'
import { matchFacilities } from './tournamentRules.js'

// Ô chọn cơ sở tổ chức (người chơi tạo giải): gõ vài ký tự hoặc tên rồi chọn trong gợi ý.
export default function FacilityPicker({ facilities, value, onChange, loading, style }) {
  const selected = facilities.find((f) => f.id === value)
  const [query, setQuery] = useState(null) // null = đang hiện tên cơ sở đã chọn
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const text = query ?? (selected ? selected.name : '')
  const options = matchFacilities(facilities, query ?? '').slice(0, 8)

  const pick = (facility) => {
    onChange(facility.id)
    setQuery(null)
    setOpen(false)
  }
  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActive((index) => (options.length ? (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length : 0))
    } else if (event.key === 'Enter' && open && options[active]) {
      event.preventDefault()
      pick(options[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
      setQuery(null)
    }
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        value={text}
        placeholder={loading ? 'Đang tải cơ sở…' : 'Gõ tên hoặc địa chỉ cơ sở tổ chức'}
        role="combobox"
        aria-label="Cơ sở tổ chức"
        aria-expanded={open}
        aria-autocomplete="list"
        onFocus={(event) => { event.target.select(); setOpen(true) }}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
          if (value) onChange('') // đang gõ lại thì bỏ cơ sở đã chọn tới khi chọn gợi ý mới
        }}
        onBlur={() => { setOpen(false); setQuery(null) }}
        onKeyDown={onKeyDown}
        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${value ? '#86EFAC' : '#CBD5E1'}`, fontSize: '13.5px', boxSizing: 'border-box', background: '#FFFFFF' }}
      />
      {selected && query == null && selected.address && (
        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>{selected.address}</div>
      )}
      {open && !loading && (
        <div role="listbox" style={{ position: 'absolute', zIndex: 20, top: '42px', left: 0, right: 0, maxHeight: '280px', overflowY: 'auto', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', boxShadow: '0 10px 20px rgba(15,23,42,0.12)' }}>
          {options.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '13px', color: '#64748B' }}>Không tìm thấy cơ sở phù hợp.</div>
          ) : options.map((f, index) => (
            <div
              key={f.id}
              role="option"
              aria-selected={f.id === value}
              onMouseDown={(event) => { event.preventDefault(); pick(f) }}
              onMouseEnter={() => setActive(index)}
              style={{ padding: '8px 12px', cursor: 'pointer', background: index === active ? '#F0FDF4' : '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}
            >
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{f.name}</div>
              {f.address && <div style={{ fontSize: '12px', color: '#64748B' }}>{f.address}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
