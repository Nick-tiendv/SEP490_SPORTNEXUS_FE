import { Component } from 'react'

// Chặn lỗi render của 1 trang để không làm trắng cả app. Đổi `resetKey` (vd đường dẫn) thì thử render lại.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  componentDidUpdate(previous) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    // Lỗi tải file trang (thường do vừa deploy bản mới): tải lại trang là đủ.
    const chunkError = /dynamically imported module|Failed to fetch|Loading chunk/i.test(String(this.state.error?.message))
    return (
      <div role="alert" style={{ display: 'grid', placeItems: 'center', minHeight: '50vh', padding: 24 }}>
        <div className="snx-card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#ef4444' }}>error</span>
          <h2 className="snx-card-title" style={{ marginTop: 8 }}>{chunkError ? 'Có phiên bản mới của trang' : 'Trang gặp lỗi khi hiển thị'}</h2>
          <p className="snx-card-subtitle">{chunkError ? 'Vui lòng tải lại để dùng bản mới nhất.' : 'Bạn có thể tải lại trang hoặc quay về trang chủ. Các trang khác vẫn dùng bình thường.'}</p>
          <div className="snx-row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button type="button" className="snx-btn snx-btn--primary" onClick={() => window.location.reload()}>Tải lại trang</button>
            <a href="/" className="snx-btn snx-btn--secondary">Về trang chủ</a>
          </div>
        </div>
      </div>
    )
  }
}
