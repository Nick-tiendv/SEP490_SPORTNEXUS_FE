import { createContext, useContext, useState, useEffect } from 'react'

export const SportContext = createContext()

export const SPORTS_LIST = [
  { key: 'badminton', label: 'Cầu Lông', emoji: '🏸', color: '#2D5F3F' },
  { key: 'pickleball', label: 'Pickleball', emoji: '🏓', color: '#1B6A45' },
  { key: 'football', label: 'Bóng Đá', emoji: '⚽', color: '#2563EB' },
  { key: 'basketball', label: 'Bóng Rổ', emoji: '🏀', color: '#EA580C' },
  { key: 'tennis', label: 'Tennis', emoji: '🎾', color: '#65A30D' },
]

export const ALL_SPORTS_KEYS = SPORTS_LIST.map(s => s.key)

export function SportProvider({ children }) {
  // selectedSports: array of keys, e.g. ['badminton'], ['pickleball'], or all
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
      // Nếu đang chọn tất cả các môn: click vào 1 môn sẽ lọc DUY NHẤT môn đó (chọn 1 môn riêng)
      if (prev.length === SPORTS_LIST.length) {
        return [key]
      }

      // Nếu môn này đã được chọn: click lại chính môn đó sẽ HỦY CHỌN môn đó (không tự động nhảy sang tất cả)
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      }

      // Nếu môn này chưa có: thêm môn đó vào danh sách (cho phép chọn 2, 3, 4 môn riêng)
      return [...prev, key]
    })
  }

  // Chọn duy nhất 1 môn
  const selectOnlySport = (key) => {
    setSelectedSports([key])
  }

  // Chọn hiển thị tất cả các môn
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
