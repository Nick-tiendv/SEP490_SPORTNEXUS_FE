import { useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { createReport, getReportReasons } from '../../api/player/reportApi.js'
import { uploadImage } from '../../api/player/uploadApi.js'

// Báo cáo một người chơi (targetType USER: bùng kèo, phi thể thao, khai gian trình độ SKILL_MISREPRESENTATION…)
// hoặc khiếu nại kết quả trận giải (targetType MATCH, targetObjectId = matchId, trong 15 phút sau khi có kết quả).
// Danh sách lý do lấy từ GET /api/v1/reports/reasons?targetType= nên lý do mới của BE tự xuất hiện.
const MAX_IMAGES = 5

export default function ReportModal({ targetType = 'USER', targetUserId, targetObjectId, subject, onClose }) {
  const reasons = useApi(() => getReportReasons(targetType), [targetType], { initialData: [] })
  // getReportReasons trả danh sách mặc định (FACILITY) khi BE lỗi: chỉ giữ lý do đúng loại đối tượng
  const options = (reasons.data || []).filter((r) => !r.targetType || String(r.targetType).toUpperCase() === targetType)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const picked = options.find((r) => r.code === reason)

  const addImages = async (files) => {
    const list = [...files].slice(0, MAX_IMAGES - images.length)
    setUploading(true)
    try {
      const urls = []
      for (const file of list) urls.push(await uploadImage(file, 'report'))
      setImages((prev) => [...prev, ...urls.filter(Boolean)])
    } catch (error) {
      toast.error(error?.message || 'Không tải ảnh lên được.')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!reason) { toast.error('Chọn lý do báo cáo.'); return }
    if (description.trim().length < 10) { toast.error('Mô tả sự việc ít nhất 10 ký tự.'); return }
    setBusy(true)
    try {
      await createReport({ targetType, targetUserId, targetObjectId, reason, description: description.trim(), evidenceImageUrls: images, requestedRefundPercentage: null })
      toast.success(targetType === 'MATCH' ? 'Đã gửi khiếu nại kết quả. Elo của trận sẽ chờ Admin xử lý.' : 'Đã gửi báo cáo tới Admin.')
      onClose(true)
    } catch (error) {
      toast.error(error?.message || 'Không gửi được báo cáo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="report-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="report-title" className="snx-card-title">{targetType === 'MATCH' ? 'Khiếu nại kết quả trận' : 'Báo cáo người chơi'}</h2>
            {subject && <p className="snx-card-subtitle">{subject}</p>}
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={() => onClose(false)}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack">
          {reasons.loading ? <p className="snx-muted">Đang tải lý do…</p> : (
            <div className="snx-stack" style={{ gap: 6 }}>
              {options.map((r) => (
                <label key={r.code} className="snx-list-item" style={{ cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="radio" name="report-reason" checked={reason === r.code} onChange={() => setReason(r.code)} style={{ marginTop: 3 }} />
                  <div>
                    <strong style={{ fontSize: 14 }}>{r.title || r.label || r.code}</strong>
                    {r.description && <div className="snx-muted">{r.description}</div>}
                  </div>
                </label>
              ))}
              {!options.length && <p className="snx-muted">Không tải được danh sách lý do. Vui lòng thử lại sau.</p>}
            </div>
          )}
          {picked?.code === 'SKILL_MISREPRESENTATION' && (
            <div className="snx-alert snx-alert--info">Nêu rõ trận đã chơi cùng và vì sao trình độ thật khác Elo. Ảnh / video kết quả sẽ giúp Admin xác minh nhanh hơn.</div>
          )}
          <label className="snx-field">Mô tả sự việc<textarea className="snx-textarea" rows={4} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <div className="snx-field">Ảnh bằng chứng (không bắt buộc, tối đa {MAX_IMAGES})
            <div className="snx-row">
              {images.map((url) => (
                <button key={url} type="button" title="Bỏ ảnh" onClick={() => setImages(images.filter((x) => x !== url))} style={{ border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
                  <img src={url} alt="Bằng chứng" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                </button>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Đang tải…' : 'Thêm ảnh'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={uploading} onChange={(e) => { if (e.target.files?.length) addImages(e.target.files); e.target.value = '' }} />
                </label>
              )}
            </div>
          </div>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={() => onClose(false)}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--danger" disabled={busy || uploading}>{busy ? 'Đang gửi…' : 'Gửi báo cáo'}</button>
        </div>
      </form>
    </div>
  )
}
