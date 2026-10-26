import { useEffect, useState } from 'react'
import { CalendarDays, Gauge, LoaderCircle, RefreshCw, Save, TriangleAlert, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { getCommissionSetting, runSettlements, updateCommissionSetting } from '../../api/admin/walletApi.js'
import { getFairPlaySettings, updateFairPlaySettings } from '../../api/admin/fairPlayApi.js'
import '../Users/users.css'
import './settings.css'

const noop = () => {}
const dateTime = value => (value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '')

// Một ô cài đặt dạng số, lưu riêng qua API của nó.
function NumberSetting({ id, label, help, unit, min, max, step = 1, loader, saver, pick, successMessage, meta }) {
  const [state, setState] = useState({ loading: true, saved: null, value: '', error: '', meta: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    loader()
      .then(data => !cancelled && setState({ loading: false, saved: pick(data), value: String(pick(data) ?? ''), error: '', meta: data }))
      .catch(err => !cancelled && setState(previous => ({ ...previous, loading: false, error: err.message })))
    return () => { cancelled = true }
  }, [loader, pick])
  const value = Number(state.value)
  const dirty = state.value !== '' && value !== state.saved
  const save = async () => {
    if (!Number.isFinite(value) || value < min || value > max) return setError(`Giá trị phải từ ${min} đến ${max}.`)
    setSaving(true); setError('')
    try {
      await saver(value)
      setState(previous => ({ ...previous, saved: value }))
      toast.success(successMessage(value))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  return <div className="ss-field">
    <label className="ss-field-label" htmlFor={id}>{label}</label>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div className="ss-input-wrap" style={{ flex: 1 }}><input id={id} type="number" min={min} max={max} step={step} value={state.value} disabled={state.loading || saving} aria-invalid={Boolean(error)} onChange={event => { setState(previous => ({ ...previous, value: event.target.value })); setError('') }} /><span>{unit}</span></div>
      <button type="button" className="ss-button primary" disabled={!dirty || saving || state.loading} onClick={save}>{saving ? <LoaderCircle size={14} className="ss-spinner" /> : <Save size={14} />}Lưu</button></div>
    <small>{state.loading ? 'Đang tải giá trị hiện tại…' : `${help}${state.saved != null ? ` Giá trị đang áp dụng: ${state.saved}${unit}.` : ''}${meta?.(state.meta) || ''}`}</small>
    {(error || state.error) && <p className="ss-field-error" role="alert">{error || `Không tải được cài đặt: ${state.error}`}</p>}
  </div>
}

const pickFee = data => data.bookingFeePercent
const pickMinClaim = data => data.minClaimScore

// Chỉ các cài đặt có API thật: phí đặt sân (wallets/settings/commission), ngưỡng Fair Play (fair-play/settings), chạy đối soát (wallets/settlements/run).
export default function SystemSettings() {
  const [settling, setSettling] = useState(false)
  return <div className="ss-page">
    <header className="ss-page-heading admin-page-header"><div><div className="ss-title-row"><h1>Cài đặt hệ thống</h1></div><p>Các cấu hình vận hành áp dụng trực tiếp cho toàn nền tảng SportNexus.</p></div></header>
    <div className="ss-settings-form">
      <section className="ss-section" aria-labelledby="ss-heading-booking"><header><div><h2 id="ss-heading-booking"><span className="ss-section-icon"><CalendarDays size={18} /></span>01. Đặt sân & Thanh toán</h2><p>Phần trăm nền tảng thu trên mỗi đơn đặt sân.</p></div></header>
        <div className="ss-section-body"><div className="ss-fields">
          <NumberSetting id="ss-booking-fee" label="Phí đặt sân (hoa hồng nền tảng)" unit="%" min={0} max={100} step={0.5} loader={getCommissionSetting} saver={updateCommissionSetting} pick={pickFee}
            help="Áp dụng cho các đơn đặt sân mới; phần còn lại chuyển cho chủ sân." meta={data => (data?.updatedAt ? ` Cập nhật lần cuối ${dateTime(data.updatedAt)}.` : '')} successMessage={value => `Đã cập nhật phí đặt sân thành ${value}%.`} />
        </div></div></section>
      <section className="ss-section" aria-labelledby="ss-heading-fairplay"><header><div><h2 id="ss-heading-fairplay"><span className="ss-section-icon"><Gauge size={18} /></span>02. Fair Play</h2><p>Ngưỡng điểm uy tín để người chơi được nhận slot ghép trận.</p></div></header>
        <div className="ss-section-body"><div className="ss-fields">
          <NumberSetting id="ss-min-claim" label="Điểm Fair Play tối thiểu để nhận slot" unit=" điểm" min={0} max={100} loader={getFairPlaySettings} saver={updateFairPlaySettings} pick={pickMinClaim}
            help="Người chơi có điểm thấp hơn sẽ tự động bị chặn nhận slot." successMessage={value => `Đã đặt ngưỡng nhận slot là ${value} điểm.`} />
        </div></div></section>
      <section className="ss-section ss-danger-section" aria-labelledby="ss-heading-danger"><header><div><h2 id="ss-heading-danger"><span className="ss-section-icon"><TriangleAlert size={18} /></span>03. Thao tác nhạy cảm</h2><p>Các thao tác ảnh hưởng đến dòng tiền, cần xác nhận trước khi chạy.</p></div></header>
        <div className="ss-section-body"><div className="ss-danger-action"><div><h3>Chạy đối soát thủ công</h3><p>Giải ngân các khoản tiền đặt sân / giải đấu đã đến hạn cho chủ sân.</p><small>Hệ thống thường tự chạy định kỳ; chỉ chạy thủ công khi cần đối soát ngay.</small></div><button type="button" className="ss-button" onClick={() => setSettling(true)}><PlayCircle size={14} />Chạy đối soát</button></div></div></section>
    </div>
    {settling && <SettlementDialog onClose={() => setSettling(false)} />}
  </div>
}

// POST /api/v1/admin/wallets/settlements/run.
function SettlementDialog({ onClose }) {
  const [state, setState] = useState({ running: false, result: null, error: '' })
  const run = async () => {
    setState({ running: true, result: null, error: '' })
    try {
      const result = await runSettlements()
      setState({ running: false, result: result ?? {}, error: '' })
      toast.success('Đã chạy đối soát.')
    } catch (err) {
      setState({ running: false, result: null, error: err.message })
    }
  }
  const summary = state.result && typeof state.result === 'object' ? Object.entries(state.result).filter(([, value]) => typeof value !== 'object') : []
  return <DemoDialog title="Chạy đối soát thủ công" onClose={state.running ? noop : onClose}>
    {state.result ? <>
      <p>Đối soát đã hoàn tất.</p>
      {summary.length > 0 && <dl className="ss-history">{summary.map(([key, value]) => <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><dt>{key}</dt><dd>{typeof value === 'number' ? value.toLocaleString('vi-VN') : String(value)}</dd></div>)}</dl>}
      <footer><button className="users-button primary" onClick={onClose}>Đóng</button></footer>
    </> : <>
      <p>Hệ thống sẽ giải ngân ngay các khoản đã đến hạn cho chủ sân. Thao tác này không thể hoàn tác.</p>
      {state.error && <p className="users-form-error" role="alert">{state.error}</p>}
      <footer><button className="users-button" onClick={onClose} disabled={state.running}>Hủy</button><button className="users-button users-danger" onClick={run} disabled={state.running}>{state.running ? <><RefreshCw size={13} className="ss-spinner" />Đang chạy…</> : 'Xác nhận chạy đối soát'}</button></footer>
    </>}
  </DemoDialog>
}
