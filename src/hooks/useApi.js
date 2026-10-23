import { useCallback, useEffect, useState } from 'react'

// Gọi một hàm API khi component mở (và mỗi khi deps đổi), trả về { data, loading, error, refresh }.
// fetcher phải trả Promise. Bỏ qua kết quả trả về muộn khi component đã đóng hoặc deps đã đổi.
export function useApi(fetcher, deps = [], { initialData = null, enabled = true } = {}) {
  const [state, setState] = useState({ data: initialData, loading: enabled, error: '' })
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    Promise.resolve()
      .then(() => { if (!cancelled) setState(previous => ({ ...previous, loading: true, error: '' })) })
      .then(() => fetcher())
      .then(data => { if (!cancelled) setState({ data, loading: false, error: '' }) })
      .catch(error => { if (!cancelled) setState(previous => ({ ...previous, loading: false, error: error?.message || 'Không tải được dữ liệu.' })) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reload, enabled])

  const refresh = useCallback(() => setReload(value => value + 1), [])
  return { ...state, setData: data => setState(previous => ({ ...previous, data })), refresh }
}
