import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { getMyVerification, submitVerification, uploadVerificationImage, verificationStatusOf } from '../../api/player/verificationApi.js'

// Xác minh danh tính (eKYC) của người chơi: được Admin duyệt mới tổ chức được giải (BE chặn khi tạo giải).
// Mở thẳng bằng /profile?verify=1 (link từ form tạo giải).
const STATUS = {
  NOT_SUBMITTED: ['Chưa xác minh', 'gray'],
  PENDING: ['Đang chờ duyệt', 'amber'],
  APPROVED: ['Đã xác minh', 'green'],
  REJECTED: ['Bị từ chối', 'red'],
  // Admin thu hồi xác minh đã duyệt: như chưa xác minh, gửi lại hồ sơ được
  REVOKED: ['Đã bị thu hồi', 'red'],
}
const IMAGES = [
  ['idFrontImageUrl', 'Ảnh CCCD mặt trước'],
  ['idBackImageUrl', 'Ảnh CCCD mặt sau'],
  ['selfieImageUrl', 'Ảnh chân dung cầm CCCD'],
]
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const emptyForm = { fullName: '', idNumber: '', dateOfBirth: '', address: '', idFrontImageUrl: '', idBackImageUrl: '', selfieImageUrl: '' }
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')

function VerificationModal({ verification, defaultName, onClose, onSubmitted }) {
  const data = verification.data
  const status = verificationStatusOf(data)
  const canSubmit = ['NOT_SUBMITTED', 'REJECTED', 'REVOKED'].includes(status)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState('')
  const set = (key) => (event) => setForm({ ...form, [key]: key === 'idNumber' ? event.target.value.replace(/\D/g, '') : event.target.value })

  const openForm = () => {
    setForm({ ...emptyForm, fullName: data?.fullName || defaultName || '', address: data?.address || '', dateOfBirth: data?.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : '' })
    setEditing(true)
  }
  const uploadImage = async (key, file) => {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) { toast.error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.'); return }
    if (file.size > MAX_IMAGE_SIZE) { toast.error('Ảnh không được vượt quá 5MB.'); return }
    setBusy(key)
    try {
      const result = await uploadVerificationImage(file)
      if (result?.url) setForm((prev) => ({ ...prev, [key]: result.url }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!/^\d{12}$/.test(form.idNumber)) { toast.error('Số CCCD phải gồm đúng 12 chữ số.'); return }
    const missing = IMAGES.find(([key]) => !form[key])
    if (missing) { toast.error(`Vui lòng tải lên ${missing[1].toLowerCase()}.`); return }
    setBusy('submit')
    try {
      await submitVerification({ ...form, fullName: form.fullName.trim(), address: form.address.trim() || null, businessLicenseUrl: null })
      toast.success('Đã gửi hồ sơ xác minh, vui lòng chờ Quản trị viên duyệt.')
      setEditing(false)
      onSubmitted()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="kyc-title">
        <div className="snx-modal-head">
          <div>
            <h2 id="kyc-title" className="snx-card-title">Xác minh danh tính (CCCD)</h2>
            <p className="snx-card-subtitle">Cần được Quản trị viên duyệt để tổ chức giải đấu.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>

        {verification.error && <div className="snx-alert snx-alert--error">{verification.error}</div>}
        {editing ? (
          <form className="snx-stack" onSubmit={submit}>
            <div className="snx-form-grid">
              <label className="snx-field">Họ tên đúng như trên CCCD<input className="snx-input" required maxLength={100} value={form.fullName} onChange={set('fullName')} /></label>
              <label className="snx-field">Số CCCD (12 chữ số)<input className="snx-input" required inputMode="numeric" maxLength={12} value={form.idNumber} onChange={set('idNumber')} /></label>
              <label className="snx-field">Ngày sinh<input className="snx-input" required type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></label>
              <label className="snx-field">Địa chỉ thường trú<input className="snx-input" maxLength={300} value={form.address} onChange={set('address')} /></label>
            </div>
            <div className="snx-form-grid">
              {IMAGES.map(([key, label]) => (
                <label key={key} style={{ display: 'block', borderRadius: 14, border: `1.5px dashed ${form[key] ? '#86EFAC' : '#CBD5E1'}`, background: '#F8FAFC', padding: 10, cursor: 'pointer', textAlign: 'center' }}>
                  <input type="file" accept={IMAGE_TYPES.join(',')} style={{ display: 'none' }} onChange={(event) => { uploadImage(key, event.target.files?.[0]); event.target.value = '' }} />
                  {form[key] ? <img src={form[key]} alt={label} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} /> : (
                    <div className="snx-muted" style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{busy === key ? 'hourglass_top' : 'add_a_photo'}</span>
                      <span style={{ fontSize: 12 }}>{busy === key ? 'Đang tải lên…' : 'Bấm để chọn ảnh'}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>{label} *</div>
                </label>
              ))}
            </div>
            <div className="snx-modal-foot">
              <button type="button" className="snx-btn snx-btn--secondary" onClick={() => setEditing(false)}>Hủy</button>
              <button type="submit" className="snx-btn snx-btn--primary" disabled={!!busy}>{busy === 'submit' ? 'Đang gửi…' : 'Gửi hồ sơ cho Quản trị viên'}</button>
            </div>
          </form>
        ) : (
          <div className="snx-stack">
            <div className="snx-row"><span className={`snx-badge snx-badge--${STATUS[status]?.[1] || 'gray'}`}>{STATUS[status]?.[0] || status}</span></div>
            {status === 'REJECTED' && data?.rejectReason && <div className="snx-alert snx-alert--error">Lý do từ chối: {data.rejectReason}</div>}
            {status === 'REVOKED' && <div className="snx-alert snx-alert--error">Xác minh đã bị thu hồi.{data?.rejectReason ? ` Lý do: ${data.rejectReason}` : ''}</div>}
            {verification.loading && !data ? <p className="snx-muted">Đang tải hồ sơ xác minh…</p> : data ? (
              <dl className="snx-form-grid" style={{ margin: 0 }}>
                {[['Họ tên trên CCCD', data.fullName], ['Số CCCD', data.idNumber], ['Ngày sinh', formatDate(data.dateOfBirth)], ['Địa chỉ', data.address || '—'], ['Ngày gửi', formatDate(data.createdAt)], ['Ngày duyệt', formatDate(data.reviewedAt)]].map(([label, value]) => (
                  <div key={label}><dt className="snx-muted" style={{ fontSize: 12.5 }}>{label}</dt><dd style={{ margin: '2px 0 0', fontWeight: 600 }}>{value || '—'}</dd></div>
                ))}
              </dl>
            ) : (
              <p className="snx-muted" style={{ margin: 0 }}>Bạn chưa gửi hồ sơ. Chuẩn bị ảnh CCCD 2 mặt và ảnh chân dung cầm CCCD (JPG / PNG / WEBP, tối đa 5MB).</p>
            )}
            <div className="snx-modal-foot">
              <button type="button" className="snx-btn snx-btn--secondary" onClick={onClose}>Đóng</button>
              {canSubmit && <button type="button" className="snx-btn snx-btn--primary" onClick={openForm}>{status === 'REJECTED' || status === 'REVOKED' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ xác minh'}</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Dòng "Xác minh danh tính" trong mục Tài khoản & Tiện ích của hồ sơ người chơi
export default function IdentityVerificationRow({ defaultName }) {
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(() => params.get('verify') === '1')
  const verification = useApi(getMyVerification, [], { initialData: null })
  const status = verificationStatusOf(verification.data)
  const close = () => {
    setOpen(false)
    if (params.has('verify')) { params.delete('verify'); setParams(params, { replace: true }) }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 14, background: '#F9FAFB', cursor: 'pointer', border: '1px solid transparent', width: '100%', textAlign: 'left' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 19 }}>badge</span>
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>Xác minh danh tính</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!verification.loading && !verification.error && <span className={`snx-badge snx-badge--${STATUS[status]?.[1] || 'gray'}`}>{STATUS[status]?.[0] || status}</span>}
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9CA3AF' }}>chevron_right</span>
        </span>
      </button>
      {open && <VerificationModal verification={verification} defaultName={defaultName} onClose={close} onSubmitted={verification.refresh} />}
    </>
  )
}
