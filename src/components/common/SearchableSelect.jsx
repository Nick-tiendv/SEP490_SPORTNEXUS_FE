import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { normalizeVi } from '../../utils/vnAddress.js'
import './SearchableSelect.css'

const toOption = item => (typeof item === 'string' ? { value: item, label: item, keywords: '' } : item)

const stripAdminPrefix = text =>
  String(text || '')
    .trim()
    .replace(/^(thành phố|tỉnh|tp\.?|phường|xã|thị trấn|đặc khu|p\.|x\.|tt\.)\s+/i, '')
    .trim()

const rankOption = (opt, normQuery) => {
  if (!normQuery) return 0
  const bare = normalizeVi(stripAdminPrefix(opt.label))
  if (bare === normQuery) return 0
  if (bare.startsWith(normQuery)) return 1
  if (normalizeVi(opt.label).startsWith(normQuery)) return 2
  return 3
}

export default function SearchableSelect({
  id,
  value = '',
  onChange,
  options = [],
  placeholder = '— Chọn —',
  searchPlaceholder = 'Tìm kiếm…',
  emptyText = 'Không tìm thấy kết quả phù hợp.',
  disabled = false,
  invalid = false,
  ariaLabel,
  ariaLabelledBy,
}) {
  const autoId = useId()
  const listboxId = `${id || autoId}-listbox`
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const searchInputRef = useRef(null)
  const optionRefs = useRef([])

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const normalizedOptions = useMemo(() => options.map(toOption), [options])
  const selectedOption = useMemo(() => normalizedOptions.find(opt => opt.value === value) || null, [normalizedOptions, value])

  const filteredOptions = useMemo(() => {
    const normQuery = normalizeVi(query)
    if (!normQuery) return normalizedOptions
    const compactQuery = normQuery.replace(/\s+/g, '')
    const matches = normalizedOptions.filter(opt => {
      const hay = normalizeVi(`${opt.label} ${opt.keywords || ''}`)
      const compactHay = hay.replace(/\s+/g, '')
      return hay.includes(normQuery) || (compactQuery && compactHay.includes(compactQuery))
    })
    return matches.sort((a, b) => rankOption(a, normQuery) - rankOption(b, normQuery))
  }, [normalizedOptions, query])

  const closeMenu = (restoreFocus = false) => {
    setOpen(false)
    setQuery('')
    if (restoreFocus) triggerRef.current?.focus()
  }

  const openMenu = () => {
    if (disabled) return
    const selectedIdx = normalizedOptions.findIndex(opt => opt.value === value)
    setQuery('')
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0)
    setOpen(true)
  }

  const toggleMenu = () => {
    if (open) closeMenu()
    else openMenu()
  }

  const selectOption = opt => {
    onChange?.(opt.value)
    closeMenu(true)
  }

  // Focus ô tìm kiếm ngay khi mở dropdown và đóng khi bấm ra ngoài.
  useEffect(() => {
    if (!open) return undefined
    const raf = requestAnimationFrame(() => searchInputRef.current?.focus())
    const handleOutside = event => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [open])

  // Cuộn mục đang được chọn bằng phím mũi tên vào tầm nhìn.
  useEffect(() => {
    if (!open) return
    optionRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest' })
  }, [open, activeIndex])

  const safeActiveIndex = filteredOptions.length ? Math.min(activeIndex, filteredOptions.length - 1) : -1

  const handleKeyDown = event => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openMenu()
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu(true)
      return
    }
    if (event.key === 'Tab') {
      closeMenu()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (filteredOptions.length) setActiveIndex(prev => (prev + 1) % filteredOptions.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (filteredOptions.length) setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (safeActiveIndex >= 0 && filteredOptions[safeActiveIndex]) {
        selectOption(filteredOptions[safeActiveIndex])
      }
    }
  }

  return (
    <div ref={rootRef} className="snx-ss" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="snx-ss-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={toggleMenu}
      >
        <span className={`snx-ss-value ${selectedOption ? '' : 'is-placeholder'}`}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className="snx-ss-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="snx-ss-popover">
          <div className="snx-ss-search-box">
            <Search size={15} className="snx-ss-search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              className="snx-ss-search-input"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              value={query}
              onChange={event => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
            />
            {query && (
              <button
                type="button"
                className="snx-ss-search-clear"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => {
                  setQuery('')
                  setActiveIndex(0)
                  searchInputRef.current?.focus()
                }}
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>

          <div id={listboxId} role="listbox" className="snx-ss-list">
            {filteredOptions.length === 0 ? (
              <div className="snx-ss-empty">{emptyText}</div>
            ) : (
              filteredOptions.map((opt, index) => {
                const selected = opt.value === value
                const active = index === safeActiveIndex
                return (
                  <button
                    key={opt.value}
                    ref={node => {
                      optionRefs.current[index] = node
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`snx-ss-option ${active ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(opt)}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={15} className="snx-ss-check" aria-hidden="true" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
