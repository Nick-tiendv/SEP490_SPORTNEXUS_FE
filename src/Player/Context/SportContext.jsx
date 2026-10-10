import { createContext, useContext, useState, useEffect } from 'react'

export const SportContext = createContext()

export const SPORTS_LIST = [
  { key: 'badminton', label: 'Cầu Lông', emoji: '🏸', color: '#2D5F3F' },
  { key: 'pickleball', label: 'Pickleball', emoji: '🏓', color: '#1B6A45' },
  { key: 'football', label: 'Bóng Đá', emoji: '⚽', color: '#1E5631' },
  { key: 'basketball', label: 'Bóng Rổ', emoji: '🏀', color: '#C2410C' },
  { key: 'tennis', label: 'Tennis', emoji: '🎾', color: '#65A30D' },
]

export const ALL_SPORTS_KEYS = SPORTS_LIST.map((s) => s.key)

export function SportProvider({ children }) {
  const [selectedSports, setSelectedSports] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_selected_sports')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    // Mặc định chọn tất cả các môn để người dùng thấy đầy đủ
    return ALL_SPORTS_KEYS
  })

  useEffect(() => {
    try {
      localStorage.setItem('sportnexus_selected_sports', JSON.stringify(selectedSports))
    } catch {
      // ignore
    }
  }, [selectedSports])

  const isSportActive = (key) => selectedSports.includes(key)
  const isAllActive = selectedSports.length === SPORTS_LIST.length

  const toggleSport = (key) => {
    setSelectedSports((prev) => {
      // Nếu đang chọn toàn bộ các môn: click vào môn nào sẽ lọc DUY NHẤT môn đó
      if (prev.length === SPORTS_LIST.length) {
        return [key]
      }

      // Nếu chỉ đang chọn 1 môn:
      if (prev.length === 1 && prev.includes(key)) {
        // Click lại chính môn đó: chuyển sang hiển thị tất cả các môn
        return ALL_SPORTS_KEYS
      }

      // Nếu đang chọn nhiều môn hoặc môn khác:
      if (prev.includes(key)) {
        const remaining = prev.filter((k) => k !== key)
        return remaining.length > 0 ? remaining : ALL_SPORTS_KEYS
      } else {
        const next = [...prev, key]
        return next.length === SPORTS_LIST.length ? ALL_SPORTS_KEYS : next
      }
    })
  }

  // Chọn duy nhất 1 môn
  const selectOnlySport = (key) => {
    setSelectedSports([key])
  }

  // Chọn hiển thị tất cả môn
  const selectAllSports = () => {
    setSelectedSports(ALL_SPORTS_KEYS)
  }

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

export function useSport() {
  const context = useContext(SportContext)
  if (!context) {
    return {
      selectedSports: ALL_SPORTS_KEYS,
      setSelectedSports: () => {},
      toggleSport: () => {},
      selectOnlySport: () => {},
      selectAllSports: () => {},
      isSportActive: () => true,
      isAllActive: true,
      SPORTS_LIST,
    }
  }
  return context
}
