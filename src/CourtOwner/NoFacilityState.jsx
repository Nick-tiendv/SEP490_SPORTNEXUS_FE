import { Link } from 'react-router-dom'

// Màn hình khi chủ sân chưa có cơ sở (hoặc chưa tải được): luôn kèm nút đi tới bước tiếp theo.
// Thứ tự BE yêu cầu: xác minh chủ sân (eKYC) được duyệt -> tạo cơ sở -> Admin duyệt cơ sở -> thêm sân & sinh ca.
export default function NoFacilityState({ loading = false, error = '', what = 'quản lý sân' }) {
  if (loading) {
    return (
      <div className="snx-empty"><span className="material-symbols-outlined">progress_activity</span>Đang tải dữ liệu cơ sở…</div>
    )
  }
  if (error) {
    return (
      <div className="snx-empty">
        <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>error</span>
        <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>Không tải được dữ liệu cơ sở</strong>
        {error}
        <div className="snx-row" style={{ justifyContent: 'center', marginTop: 14 }}>
          <button type="button" className="snx-btn snx-btn--secondary" onClick={() => window.location.reload()}>Tải lại trang</button>
          <Link to="/owner/facilities" className="snx-btn snx-btn--ghost">Đến trang Cơ sở của tôi</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="snx-empty">
      <span className="material-symbols-outlined">domain_add</span>
      <strong style={{ display: 'block', color: '#0f172a', fontSize: 16, marginBottom: 4 }}>Bạn chưa có cơ sở nào</strong>
      Tạo cơ sở thể thao để bắt đầu {what}. Cơ sở mới cần Admin duyệt; hồ sơ xác minh chủ sân phải được duyệt trước.
      <div className="snx-row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <Link to="/owner/facilities?create=1" className="snx-btn snx-btn--primary"><span className="material-symbols-outlined" style={{ fontSize: 18, margin: 0, color: 'inherit', display: 'inline' }}>add</span>Tạo cơ sở</Link>
        <Link to="/owner/profile" className="snx-btn snx-btn--secondary">Xác minh chủ sân</Link>
      </div>
    </div>
  )
}
