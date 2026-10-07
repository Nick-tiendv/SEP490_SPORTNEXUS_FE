import { createContext, useContext, useState, useEffect } from 'react'

export const SportContext = createContext()

export const SPORTS_LIST = [
  { key: 'badminton', label: 'Cầu Lông', emoji: '🏸', color: '#2D5F3F' },
  { key: 'pickleball', label: 'Pickleball', emoji: '🏓', color: '#1B6A45' },
]

export function SportProvider({ children }) {
  // selectedSports: array of keys, e.g. ['badminton'], ['pickleball'], or ['badminton', 'pickleball']
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
    // Mặc định chọn cả 2 môn để người dùng thấy đầy đủ, hoặc có thể chọn 1 môn
    return ['badminton', 'pickleball']
  })

  useEffect(() => {
    try {
      localStorage.setItem('sportnexus_selected_sports', JSON.stringify(selectedSports))
    } catch {
      // ignore
    }
  }, [selectedSports])

  const isSportActive = (key) => selectedSports.includes(key)
  const isAllActive = selectedSports.length === 2

  /**
   * Toggle / select sport theo yêu cầu:
   * "khi click vào button môn nào sẽ chỉ hiển thị ra thông tin hay sân của môn đó,
   *  và chỉ khi click cả 2 button 2 môn thì mới hiển thị toàn bộ của cả 2 môn"
   */
  const toggleSport = (key) => {
    setSelectedSports((prev) => {
      // Nếu đang chọn cả 2 môn: click vào môn nào sẽ lọc DUY NHẤT môn đó
      if (prev.length === 2) {
        return [key]
      }

      // Nếu chỉ đang chọn 1 môn:
      if (prev.includes(key)) {
        // Click lại chính môn đó: chuyển sang hiển thị cả 2 môn
        return ['badminton', 'pickleball']
      } else {
        // Click vào môn còn lại (người dùng click cả 2 button): hiển thị toàn bộ cả 2 môn
        return ['badminton', 'pickleball']
      }
    })
  }

  // Chọn duy nhất 1 môn
  const selectOnlySport = (key) => {
    setSelectedSports([key])
  }

  // Chọn hiển thị cả 2 môn
  const selectAllSports = () => {
    setSelectedSports(['badminton', 'pickleball'])
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
      selectedSports: ['badminton', 'pickleball'],
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
