import { useState } from 'react'

// Thêm / sửa sân con. CreateCourtRequest / UpdateCourtRequest: categoryId, name, defaultPrice, courtType,
// isIndoor, surfaceType, maxPlayers (1-100), teamSize (số người mỗi đội). Sửa sân: chuỗi rỗng "" xóa loại sân.
const INDOOR_OPTIONS = [
  { value: '', label: 'Chưa khai báo' },
  { value: 'true', label: 'Trong nhà' },
  { value: 'false', label: 'Ngoài trời' },
]

export default function CourtFormModal({ court, sports, defaultSportId = '', defaultPrice = '', busy = false, onClose, onSubmit }) {
  const editing = Boolean(court)
  const [form, setForm] = useState(() => ({
    categoryId: court?.categoryId || defaultSportId || sports[0]?.id || '',
    name: court?.name || '',
    defaultPrice: court ? String(court.defaultPrice ?? '') : String(defaultPrice ?? ''),
    courtType: court?.courtType || '',
    isIndoor: court?.isIndoor == null ? '' : String(court.isIndoor),
    surfaceType: court?.surfaceType || '',
    maxPlayers: court?.maxPlayers == null ? '' : String(court.maxPlayers),
    teamSize: court?.teamSize == null ? '' : String(court.teamSize),
  }))
  const [error, setError] = useState('')
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    const price = Number(form.defaultPrice)
    const maxPlayers = form.maxPlayers === '' ? null : Number(form.maxPlayers)
    const teamSize = form.teamSize === '' ? null : Number(form.teamSize)
    if (!form.categoryId) return setError('Vui lòng chọn bộ môn.')
    if (!form.name.trim()) return setError('Vui lòng nhập tên sân.')
    if (!Number.isFinite(price) || price < 0) return setError('Giá mặc định không hợp lệ.')
    if (maxPlayers != null && (!Number.isInteger(maxPlayers) || maxPlayers < 1 || maxPlayers > 100)) return setError('Số người tối đa phải từ 1 đến 100.')
    if (teamSize != null && (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 15)) return setError('Số người mỗi đội phải từ 1 đến 15.')
    setError('')
    const payload = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      defaultPrice: price,
      // Sửa: "" để xóa giá trị cũ; thêm mới: null
      courtType: form.courtType.trim() || (editing ? '' : null),
      surfaceType: form.surfaceType.trim() || (editing ? '' : null),
      isIndoor: form.isIndoor === '' ? null : form.isIndoor === 'true',
      maxPlayers,
      teamSize,
    }
    if (editing) payload.clearIsIndoor = form.isIndoor === '' && court.isIndoor != null
    onSubmit(payload)
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="court-form-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="court-form-title" className="snx-card-title">{editing ? `Sửa ${court.name}` : 'Thêm sân mới'}</h2>
            <p className="snx-card-subtitle">{editing ? 'Thông tin để trống sẽ được xóa khỏi sân.' : 'Sau khi thêm, vào trang Ca sân để sinh ca cho sân này.'}</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack" style={{ gap: 12 }}>
          <div className="snx-form-grid">
            <label className="snx-field">Bộ môn *
              <select className="snx-select" value={form.categoryId} onChange={set('categoryId')}>
                {!sports.length && <option value="">Đang tải…</option>}
                {sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
              </select>
            </label>
            <label className="snx-field">Tên sân *<input className="snx-input" maxLength={100} value={form.name} onChange={set('name')} placeholder="VD: Sân 1" /></label>
            <label className="snx-field">Giá mặc định / giờ (đ) *<input className="snx-input" type="number" min={0} step={1000} value={form.defaultPrice} onChange={set('defaultPrice')} /></label>
          </div>
          <div className="snx-form-grid">
            <label className="snx-field">Loại sân<input className="snx-input" maxLength={50} value={form.courtType} onChange={set('courtType')} placeholder="VD: Sân 5 người" /></label>
            <label className="snx-field">Mặt sân<input className="snx-input" maxLength={50} value={form.surfaceType} onChange={set('surfaceType')} placeholder="VD: Thảm PU, cỏ nhân tạo" /></label>
            <label className="snx-field">Trong nhà / ngoài trời
              <select className="snx-select" value={form.isIndoor} onChange={set('isIndoor')}>
                {INDOOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="snx-field">Số người tối đa<input className="snx-input" type="number" min={1} max={100} value={form.maxPlayers} onChange={set('maxPlayers')} /></label>
            <label className="snx-field">Số người mỗi đội<input className="snx-input" type="number" min={1} max={15} value={form.teamSize} onChange={set('teamSize')} placeholder="Bóng đá 5 / 7 / 11" /></label>
          </div>
          {error && <div className="snx-alert snx-alert--error">{error}</div>}
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy}>{busy ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm sân'}</button>
        </div>
      </form>
    </div>
  )
}
