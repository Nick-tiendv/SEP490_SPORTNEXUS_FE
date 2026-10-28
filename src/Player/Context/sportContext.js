import { createContext, useContext } from 'react'

// Context + danh sách môn + hook dùng chung (Provider ở SportContext.jsx)
export const SportContext = createContext()

export const SPORTS_LIST = [
  { key: 'badminton', label: 'Cầu Lông', emoji: '🏸', color: '#2D5F3F' },
  { key: 'pickleball', label: 'Pickleball', emoji: '🏓', color: '#1B6A45' },
  { key: 'football', label: 'Bóng Đá', emoji: '⚽', color: '#1E5631' },
  { key: 'basketball', label: 'Bóng Rổ', emoji: '🏀', color: '#C2410C' },
  { key: 'tennis', label: 'Tennis', emoji: '🎾', color: '#65A30D' },
]

export const ALL_SPORTS_KEYS = SPORTS_LIST.map((s) => s.key)

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
