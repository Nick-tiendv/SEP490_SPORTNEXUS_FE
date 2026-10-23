import { useState } from 'react'
import { AirVent, Dumbbell, GlassWater, Lightbulb, ShowerHead, Sparkles, SquareParking, UtensilsCrossed, Wifi } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { createMasterData, deleteMasterData, updateMasterData } from '../../api/admin/masterDataApi.js'
import { MAX_ICON_CODE, MAX_NAME, MAX_RULES, deleteBlockReason, formatNumber, iconCodes, kinds, usageCount, validateMasterData } from './masterDataHelpers.js'

const noop = () => {}
const ICONS = { parking: SquareParking, equipment: Dumbbell, canteen: UtensilsCrossed, air_conditioner: AirVent, water: GlassWater, shower: ShowerHead, wifi: Wifi, light: Lightbulb }

export function AmenityIcon({ code, size = 16 }) {
  const Icon = ICONS[code] || Sparkles
  return <Icon size={size} aria-hidden="true" />
}

// Chạy thao tác API trong hộp thoại: quản lý trạng thái đang gửi và lỗi.
function useSubmit(onDone) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const run = async task => {
    setSubmitting(true); setError('')
    try { const { message } = await task(); onDone(message) } catch (err) { setError(err.message); setSubmitting(false) }
  }
  return { submitting, error, setError, run }
}

// Thêm / sửa: POST hoặc PUT /api/v1/admin/master-data/{sports|amenities}.
export function MasterDataForm({ kind, item, items, onClose, onDone }) {
  const { noun, blank } = kinds[kind]
  const [values, setValues] = useState(() => (item ? { name: item.name, description: item.description || '', iconCode: item.iconCode || '' } : { ...blank }))
  const { submitting, error, setError, run } = useSubmit(onDone)
  const change = event => { setValues(current => ({ ...current, [event.target.name]: event.target.value })); setError('') }
  const submit = event => {
    event.preventDefault()
    const issue = validateMasterData(kind, values, items, item?.id)
    if (issue) { setError(issue); return }
    run(() => (item ? updateMasterData(kind, item.id, values) : createMasterData(kind, values)))
  }
  return <DemoDialog title={`${item ? 'Sửa' : 'Thêm'} ${noun}`} onClose={submitting ? noop : onClose}><form onSubmit={submit} className="users-form" noValidate>
    <label>Tên {noun}<input name="name" value={values.name} onChange={change} maxLength={MAX_NAME} required autoComplete="off" /></label>
    {kind === 'sports'
      ? <label>Mô tả luật chơi (không bắt buộc)<textarea name="description" rows={5} value={values.description} onChange={change} maxLength={MAX_RULES} /><small className="md-hint">{formatNumber(values.description.length)} / {formatNumber(MAX_RULES)} ký tự</small></label>
      : <label>Mã icon (không bắt buộc)
        <span className="md-icon-input"><span className="md-icon-preview"><AmenityIcon code={values.iconCode.trim()} size={18} /></span><input name="iconCode" list="md-icon-codes" value={values.iconCode} onChange={change} maxLength={MAX_ICON_CODE} placeholder="VD: wifi, parking, shower" autoComplete="off" /></span>
        <datalist id="md-icon-codes">{Object.entries(iconCodes).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</datalist>
        <small className="md-hint">Ứng dụng dùng mã này để hiển thị icon. Mã ngoài danh sách gợi ý sẽ hiện icon mặc định.</small>
      </label>}
    {item && usageCount(kind, item) > 0 && <p className="md-hint">Đổi tên sẽ áp dụng cho {kind === 'sports' ? `${formatNumber(item.courtCount)} sân con và ${formatNumber(item.tournamentCount)} giải đấu` : `${formatNumber(item.facilityCount)} cơ sở`} đang dùng.</p>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" type="submit" disabled={submitting}>{submitting ? 'Đang lưu…' : item ? 'Lưu thay đổi' : `Thêm ${noun}`}</button></footer>
  </form></DemoDialog>
}

// Xóa mềm: DELETE /api/v1/admin/master-data/{sports|amenities}/{id}.
export function DeleteMasterDataDialog({ kind, item, onClose, onDone }) {
  const { noun } = kinds[kind]
  const { submitting, error, run } = useSubmit(onDone)
  const blocked = deleteBlockReason(kind, item)
  return <DemoDialog title={`Xóa ${noun}`} onClose={submitting ? noop : onClose}><div className="users-form">
    <p>Xóa {noun} “<strong>{item.name}</strong>”? Mục bị xóa sẽ ẩn khỏi ứng dụng và có thể khôi phục lại sau.</p>
    {blocked ? <p className="users-form-error">{blocked} Hãy chuyển các sân con sang môn khác trước.</p>
      : kind === 'amenities' && item.facilityCount > 0 ? <p className="md-hint">Tiện ích sẽ bị gỡ khỏi {formatNumber(item.facilityCount)} cơ sở đang gắn. Khôi phục lại cũng không tự gắn lại vào các cơ sở này.</p>
        : kind === 'sports' && item.tournamentCount > 0 ? <p className="md-hint">Môn này có {formatNumber(item.tournamentCount)} giải đấu. Nếu còn giải chưa kết thúc, hệ thống sẽ không cho xóa.</p> : null}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button type="button" className="users-button primary md-danger" onClick={() => run(() => deleteMasterData(kind, item.id))} disabled={submitting || Boolean(blocked)}>{submitting ? 'Đang xóa…' : 'Xóa'}</button></footer>
  </div></DemoDialog>
}
