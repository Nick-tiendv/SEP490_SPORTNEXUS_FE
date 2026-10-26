import { useEffect, useState } from 'react'

// Tải danh sách có phân trang phía server; `params` thay đổi thì tải lại.
export function usePagedList(fetcher, params, reload) {
  const key = JSON.stringify([params, reload])
  const [state, setState] = useState({ key: '', items: [], total: 0, totalPages: 1, error: '' })
  useEffect(() => {
    let cancelled = false
    const query = JSON.parse(key)[0]
    fetcher(query)
      .then(({ items, total, totalPages }) => !cancelled && setState({ key, items, total, totalPages: totalPages || Math.max(1, Math.ceil(total / (query.PageSize || 20))), error: '' }))
      .catch(error => !cancelled && setState(previous => ({ ...previous, key, error: error.message })))
    return () => { cancelled = true }
  }, [fetcher, key])
  return { ...state, loading: state.key !== key }
}

// Giá trị trễ cho ô tìm kiếm (gửi lên server sau khi ngừng gõ).
export function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
