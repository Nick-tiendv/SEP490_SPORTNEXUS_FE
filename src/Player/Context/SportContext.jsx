import { useState, useEffect } from 'react'
import { SportContext, sportsListFromCatalog } from './sportContext.js'
import { getPublicSports } from '../../api/auth/authApi.js'
import { setSportCatalog } from '../LFG/lfgSuggestionEngine.js'

const STORAGE_KEY = 'sportnexus_selected_sports'
// Bản lưu cũ ghi cả 5 môn khi chọn "Tất cả": coi như đang chọn tất cả
const LEGACY_ALL_KEYS = ['badminton', 'pickleball', 'football', 'basketball', 'tennis']

// Bộ lọc môn: 'all' = mọi môn của hệ thống (kể cả môn Admin mới thêm), hoặc danh sách khóa môn đang chọn
function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(parsed) && parsed.length > 0 && !LEGACY_ALL_KEYS.every((k) => parsed.includes(k))) return parsed
  } catch {
    // ignore
  }
  return 'all'
}

export function SportProvider({ children }) {
  const [SPORTS_LIST, setSportsList] = useState(sportsListFromCatalog)
  const [selection, setSelection] = useState(readSaved)

  // Danh sách môn thật từ GET /api/v1/master-data/sports (API công khai)
  useEffect(() => {
    let cancelled = false
    getPublicSports()
      .then((list) => {
        if (cancelled) return
        setSportCatalog(list)
        setSportsList(sportsListFromCatalog())
      })
      .catch((err) => console.warn('[SportProvider] Không tải được danh sách môn:', err))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
    } catch {
      // ignore
    }
  }, [selection])

  const isAllActive = selection === 'all'
  const selectedSports = isAllActive ? SPORTS_LIST.map((s) => s.key) : selection
  const isSportActive = (key) => isAllActive || selection.includes(key)

  const toggleSport = (key) => {
    setSelection((prev) => {
      // Đang chọn tất cả: bấm môn nào thì lọc DUY NHẤT môn đó
      if (prev === 'all') return [key]
      // Bỏ chọn môn đang chọn (luôn giữ ít nhất 1 môn; chỉ nút 'Tất cả' mới chọn hết)
      if (prev.includes(key)) return prev.length === 1 ? prev : prev.filter((k) => k !== key)
      const next = [...prev, key]
      return SPORTS_LIST.length > 0 && SPORTS_LIST.every((s) => next.includes(s.key)) ? 'all' : next
    })
  }

  // Chọn duy nhất 1 môn
  const selectOnlySport = (key) => setSelection([key])

  // Chọn hiển thị tất cả môn
  const selectAllSports = () => setSelection('all')

  const setSelectedSports = (keys) => setSelection(Array.isArray(keys) && keys.length > 0 ? keys : 'all')

  return (
    <SportContext.Provider
      value={{
        selectedSports,
        setSelectedSports,
        toggleSport,
        selectOnlySport,
        selectAllSports,
        isSportActive,
        isAllActive,
        SPORTS_LIST,
      }}
    >
      {children}
    </SportContext.Provider>
  )
}
