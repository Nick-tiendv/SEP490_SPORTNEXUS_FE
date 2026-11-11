import { useState, useEffect } from 'react'
import { ALL_SPORTS_KEYS, SPORTS_LIST, SportContext } from './sportContext.js'

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

      // Nếu đang chọn môn này: bỏ chọn môn đó (luôn giữ ít nhất 1 môn; chỉ nút 'Tất cả' mới chọn hết)
      if (prev.includes(key)) {
        return prev.length === 1 ? prev : prev.filter((k) => k !== key)
      }

      // Nếu chưa chọn: thêm môn vào danh sách lọc
      return [...prev, key]
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
