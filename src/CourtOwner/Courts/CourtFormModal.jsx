import { useState } from 'react'

// Thêm / sửa sân con. CreateCourtRequest / UpdateCourtRequest: categoryId, name, defaultPrice, courtType,
// isIndoor, surfaceType, maxPlayers (1-100), teamSize (số người mỗi đội). Sửa sân: chuỗi rỗng "" xóa loại sân.
const INDOOR_OPTIONS = [
  { value: '', label: 'Chưa khai báo' },
  { value: 'true', label: 'Trong nhà' },
  { value: 'false', label: 'Ngoài trời' },
]

// Loại sân gợi ý theo môn (BE chưa có danh mục, vẫn lưu courtType dạng chuỗi và teamSize dạng số).
// Tra theo tên môn từ API; môn không có trong bảng thì chủ sân tự nhập như trước.
const COURT_PRESETS = [
  { match: ['bong da', 'football', 'soccer'], types: [['Sân 5 người', 5], ['Sân 7 người', 7], ['Sân 11 người', 11]] },
  { match: ['cau long', 'badminton'], types: [['Sân đơn', 1], ['Sân đôi', 2]] },
  { match: ['pickleball'], types: [['Sân đơn', 1], ['Sân đôi', 2]] },
  { match: ['tennis', 'quan vot'], types: [['Sân đơn', 1], ['Sân đôi', 2]] },
  { match: ['bong ro', 'basketball'], types: [['Sân 3x3', 3], ['Sân 5x5', 5]] },
  { match: ['bong chuyen', 'volleyball'], types: [['Sân 6 người', 6], ['Bóng chuyền bãi biển (2 người)', 2]] },
]
// Thời lượng 1 ca chủ sân chọn (BE: bội số 15 phút, 15 - 480); bỏ trống = theo môn
const SLOT_MINUTE_OPTIONS = [30, 45, 60, 90, 120, 150, 180, 240]
const plain = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/gi, 'd').toLowerCase()
const presetOf = (sportName) => {
  const name = plain(sportName)
  return name ? COURT_PRESETS.find((p) => p.match.some((m) => name.includes(m)))?.types || null : null
}

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
    slotMinutes: court?.slotMinutes == null ? '' : String(court.slotMinutes),
  }))
  const [error, setError] = useState('')
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const presets = presetOf(sports.find((sport) => sport.id === form.categoryId)?.name)
  const sportSlotMinutes = Number(sports.find((sport) => sport.id === form.categoryId)?.defaultSlotMinutes) || 120
  const teamSizeOptions = presets ? [...new Set(presets.map(([, size]) => size))].sort((a, b) => a - b) : []
  // Giá trị đã lưu nhưng không nằm trong danh sách gợi ý: vẫn hiện để không mất dữ liệu
  const legacyCourtType = Boolean(presets && form.courtType) && !presets.some(([label]) => label === form.courtType)
  const legacyTeamSize = Boolean(presets && form.teamSize) && !teamSizeOptions.includes(Number(form.teamSize))
  // Đổi môn: loại sân / số người mỗi đội của môn cũ không còn đúng
  const changeSport = (event) => setForm((prev) => ({ ...prev, categoryId: event.target.value, courtType: '', teamSize: '' }))
  // Chọn loại sân: tự điền số người mỗi đội tương ứng
  const changeCourtType = (event) => {
    const value = event.target.value
    const preset = presets?.find(([label]) => label === value)
    setForm((prev) => ({ ...prev, courtType: value, teamSize: preset ? String(preset[1]) : prev.teamSize }))
  }

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
      // Thời lượng ca: "" = theo môn (sửa sân gửi 0 để bỏ lựa chọn cũ)
      slotMinutes: form.slotMinutes === '' ? (editing ? 0 : null) : Number(form.slotMinutes),
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
              <select className="snx-select" value={form.categoryId} onChange={changeSport}>
                {!sports.length && <option value="">Đang tải…</option>}
                {sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
              </select>
            </label>
            <label className="snx-field">Tên sân *<input className="snx-input" maxLength={100} value={form.name} onChange={set('name')} placeholder="VD: Sân 1" /></label>
            <label className="snx-field">Giá mặc định / giờ (đ) *<input className="snx-input" type="number" min={0} step={1000} value={form.defaultPrice} onChange={set('defaultPrice')} /></label>
          </div>
          <div className="snx-form-grid">
            <label className="snx-field">Loại sân
              {presets ? (
                <select className="snx-select" value={form.courtType} onChange={changeCourtType}>
                  <option value="">Chưa khai báo</option>
                  {legacyCourtType && <option value={form.courtType}>{form.courtType} (dữ liệu cũ)</option>}
                  {presets.map(([label]) => <option key={label} value={label}>{label}</option>)}
                </select>
              ) : (
                <input className="snx-input" maxLength={50} value={form.courtType} onChange={set('courtType')} placeholder="VD: Sân 5 người" />
              )}
            </label>
            <label className="snx-field">Mặt sân<input className="snx-input" maxLength={50} value={form.surfaceType} onChange={set('surfaceType')} placeholder="VD: Thảm PU, cỏ nhân tạo" /></label>
            <label className="snx-field">Trong nhà / ngoài trời
              <select className="snx-select" value={form.isIndoor} onChange={set('isIndoor')}>
                {INDOOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="snx-field">Số người tối đa<input className="snx-input" type="number" min={1} max={100} value={form.maxPlayers} onChange={set('maxPlayers')} /></label>
            <label className="snx-field">Số người mỗi đội
              {presets ? (
                <select className="snx-select" value={form.teamSize} onChange={set('teamSize')}>
                  <option value="">Chưa khai báo</option>
                  {legacyTeamSize && <option value={form.teamSize}>{form.teamSize} người (dữ liệu cũ)</option>}
                  {teamSizeOptions.map((size) => <option key={size} value={String(size)}>{size} người</option>)}
                </select>
              ) : (
                <input className="snx-input" type="number" min={1} max={15} value={form.teamSize} onChange={set('teamSize')} />
              )}
            </label>
            <label className="snx-field">Thời lượng mỗi ca
              <select className="snx-select" value={form.slotMinutes} onChange={set('slotMinutes')}>
                <option value="">Theo môn ({sportSlotMinutes} phút)</option>
                {form.slotMinutes !== '' && !SLOT_MINUTE_OPTIONS.includes(Number(form.slotMinutes)) && <option value={form.slotMinutes}>{form.slotMinutes} phút</option>}
                {SLOT_MINUTE_OPTIONS.map((m) => <option key={m} value={String(m)}>{m} phút</option>)}
              </select>
            </label>
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
