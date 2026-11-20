import { createContext, useContext } from 'react'
import { SPORT_CATALOG } from '../LFG/lfgSuggestionEngine.js'

// Context + hook dùng chung (Provider ở SportContext.jsx).
// Danh sách môn lấy từ GET /api/v1/master-data/sports (Provider nạp vào SPORT_CATALOG), không ghi cứng ở FE.
export const SportContext = createContext()

// Môn của hệ thống dạng { key, label, emoji, color } từ danh mục đã nạp
export const sportsListFromCatalog = () =>
  Object.values(SPORT_CATALOG).map((s) => ({ key: s.key, label: s.name, emoji: s.emoji, color: s.color }))

export function useSport() {
  const context = useContext(SportContext)
  if (!context) {
    const SPORTS_LIST = sportsListFromCatalog()
    return {
      selectedSports: SPORTS_LIST.map((s) => s.key),
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
