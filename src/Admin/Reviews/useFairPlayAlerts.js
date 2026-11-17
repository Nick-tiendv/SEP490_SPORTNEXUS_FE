import { useEffect, useState } from 'react'
import { listFairPlayAlertReports } from '../../api/admin/reportApi.js'

// Ticket cảnh báo bạo lực mạng đang chờ xử lý (phiếu hệ thống có điểm Fair Play đang treo).
// Đổi reloadKey để tải lại (vd sau khi xử lý một phiếu).
export function useFairPlayAlerts(reloadKey = 0) {
  const [state, setState] = useState({ key: -1, items: [], error: '' })
  useEffect(() => {
    let cancelled = false
    listFairPlayAlertReports()
      .then(items => !cancelled && setState({ key: reloadKey, items, error: '' }))
      .catch(error => !cancelled && setState({ key: reloadKey, items: [], error: error.message }))
    return () => { cancelled = true }
  }, [reloadKey])
  return { ...state, loading: state.key !== reloadKey }
}
