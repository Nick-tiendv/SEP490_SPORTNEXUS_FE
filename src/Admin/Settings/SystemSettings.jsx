import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, Clock3, Download, Globe2, LoaderCircle, Mail, RotateCcw, Save, ShieldCheck, TriangleAlert, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/authContext.js'
import '../Users/users.css'
import './settings.css'
import { defaultSettings, mockAdministrator, settingsFields, settingsSections } from './settingsData.js'
import { cloneSettings, exportSettings, hasChanges, loadMockSettings, makeHistoryEntry, persistMockSettings, sanitizeSettings, validateSettings } from './settingsHelpers.js'
import { BookingPaymentSettings, DangerZone, GeneralSettings, NotificationSettings, SecurityAccessSettings, TournamentSettings } from './SettingsSections.jsx'
import SettingsDialogs from './SettingsDialogs.jsx'

const sectionIcons = { general: Globe2, 'booking-payments': CalendarDays, tournament: Trophy, notifications: Mail, security: ShieldCheck, danger: TriangleAlert }
const sectionGroups = { general: ['general'], 'booking-payments': ['booking', 'payment'], tournament: ['tournament'], notifications: ['notifications'], security: ['security'], danger: [] }

export default function SystemSettings() {
  const auth = useAuth()
  const [initial] = useState(loadMockSettings)
  const [settings, setSettings] = useState(() => cloneSettings(initial.settings))
  const [saved, setSaved] = useState(() => cloneSettings(initial.settings))
  const [history, setHistory] = useState(() => initial.history)
  const [notice, setNotice] = useState(initial.notice)
  const [errors, setErrors] = useState({})
  const [active, setActive] = useState('general')
  const [dialog, setDialog] = useState(null)
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef(null)
  const sections = useRef({})
  const dirty = hasChanges(settings, saved)
  const closeDialog = useCallback(() => setDialog(null), [])

  useEffect(() => {
    if (!dirty) return
    const warn = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  useEffect(() => () => clearTimeout(saveTimer.current), [])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) setActive(visible[0].target.dataset.section)
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 })
    Object.values(sections.current).forEach(node => { if (node) observer.observe(node) })
    return () => observer.disconnect()
  }, [])

  const navigateSection = id => {
    setActive(id)
    const node = sections.current[id]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' })
    node?.focus({ preventScroll: true })
  }
  const applyChange = (group, name, value) => {
    setSettings(current => ({ ...current, [group]: { ...current[group], [name]: value } }))
    setErrors(current => { const next = { ...current }; delete next[`${group}.${name}`]; return next })
  }
  const change = (group, name, value) => {
    if (settingsFields[group]?.[name]?.critical) setDialog({ type: 'critical', group, name, value })
    else applyChange(group, name, value)
  }
  const confirm = () => {
    if (dialog.type === 'critical') applyChange(dialog.group, dialog.name, dialog.value)
    else {
      setSettings(cloneSettings(defaultSettings)); setErrors({})
      toast.success('Đã khôi phục form về mặc định. Chọn Lưu tất cả thay đổi để lưu cấu hình mẫu.')
    }
    setDialog(null)
  }
  const validate = () => {
    const next = validateSettings(settings)
    setErrors(next)
    if (Object.keys(next).length) {
      const [group, name] = Object.keys(next)[0].split('.')
      navigateSection(group === 'booking' || group === 'payment' ? 'booking-payments' : group)
      const field = document.getElementById(`ss-${group}-${name}`) || document.getElementById('ss-formats-error')
      field?.focus({ preventScroll: true })
      toast.error('Cấu hình chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.')
      return false
    }
    return true
  }
  const save = () => {
    if (saving || !dirty || !validate()) return
    const next = sanitizeSettings(settings)
    const profileName = auth.profile?.fullName || auth.user?.name
    const entry = makeHistoryEntry(saved, next, profileName || `${mockAdministrator.name} (hồ sơ mẫu)`)
    const nextHistory = entry.changes.length ? [entry, ...history].slice(0, 100) : history
    setSaving(true)
    // A short local delay makes the simulated save status visible; no request is made.
    saveTimer.current = setTimeout(() => {
      const result = persistMockSettings(next, nextHistory)
      setSettings(next); setSaved(cloneSettings(next)); setHistory(nextHistory)
      setNotice(result.notice); setSaving(false)
      toast.success(result.persisted ? 'Đã lưu cấu hình mẫu trên thiết bị này.' : 'Đã lưu cấu hình mẫu trong phiên hiện tại.')
    }, 250)
  }
  const discard = () => {
    setSettings(cloneSettings(saved)); setErrors({})
    toast.success('Đã khôi phục cấu hình mẫu được lưu gần nhất.')
  }
  const download = () => {
    if (!validate()) return
    try {
      const contents = exportSettings(settings)
      const url = URL.createObjectURL(new Blob([contents], { type: 'application/json;charset=utf-8;' }))
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = 'sportnexus-system-settings-mock.json'; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Đã xuất cấu hình mẫu hiện tại thành JSON.')
    } catch (error) { toast.error(error.message || 'Không thể xuất cấu hình mẫu.') }
  }
  const fieldProps = { settings, errors, onChange: change }
  const contents = {
    general: <GeneralSettings {...fieldProps} />,
    'booking-payments': <BookingPaymentSettings {...fieldProps} />,
    tournament: <TournamentSettings {...fieldProps} />,
    notifications: <NotificationSettings {...fieldProps} />,
    security: <SecurityAccessSettings {...fieldProps} onOpen={type => setDialog({ type })} />,
    danger: <DangerZone onReset={() => setDialog({ type: 'reset' })} />,
  }

  return <div className="ss-page" aria-busy={saving}>
    <div className="ss-breadcrumb">Quản trị <span>/</span> Cài đặt hệ thống</div>
    <header className="ss-page-heading admin-page-header"><div><div className="ss-title-row"><h1>Cài đặt hệ thống</h1><span className="ss-operational-badge"><i />{settings.general.maintenanceMode ? "Chế độ bảo trì (mẫu)" : "Hệ thống hoạt động bình thường"}</span></div><p>Quản lý cấu hình nền tảng, chính sách vận hành và tùy chọn quản trị.</p></div><div className="ss-heading-actions"><button type="button" className="ss-button" onClick={() => setDialog({ type: 'history' })} disabled={saving}><Clock3 size={14} />Xem lịch sử thay đổi</button><button type="button" className="ss-button" onClick={download} disabled={saving}><Download size={14} />Xuất cấu hình</button></div></header>
    <div className="ss-demo-banner"><ShieldCheck size={16} /><span>Cấu hình mẫu · Chỉ lưu trên thiết bị này; các giá trị không được áp dụng lên module thật.</span></div>
    {notice && <div className="ss-storage-notice" role="status"><TriangleAlert size={16} />{notice}</div>}
    <nav className="ss-navigation" aria-label="Các nhóm cài đặt">{settingsSections.map(section => {
      const Icon = sectionIcons[section.id]
      return <button type="button" key={section.id} className={`${active === section.id ? 'active' : ''} ${section.id === 'danger' ? 'danger' : ''}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => navigateSection(section.id)}><Icon size={16} /><span><small>{section.number}</small>{section.nav}</span></button>
    })}</nav>
    <fieldset className="ss-settings-form" disabled={saving} aria-label="Cấu hình nền tảng">
      {settingsSections.map(section => {
        const Icon = sectionIcons[section.id]
        const sectionDirty = sectionGroups[section.id].some(group => hasChanges(settings[group], saved[group]))
        const sectionErrors = Object.keys(errors).filter(path => sectionGroups[section.id].includes(path.split('.')[0])).length
        return <section key={section.id} id={`ss-section-${section.id}`} data-section={section.id} ref={node => { sections.current[section.id] = node }} tabIndex={-1} className={`ss-section ${section.id === 'danger' ? 'ss-danger-section' : ''}`} aria-labelledby={`ss-heading-${section.id}`}><header><div><h2 id={`ss-heading-${section.id}`}><span className="ss-section-icon"><Icon size={18} /></span>{section.number}. {section.title}</h2><p>{section.subtitle}</p></div><span className={`ss-status ${section.id === 'danger' ? 'restricted' : sectionErrors ? 'error' : sectionDirty ? 'unsaved' : ''}`}>{section.id === 'danger' ? "HẠN CHẾ" : sectionErrors ? `${sectionErrors} LỖI` : sectionDirty ? "CHƯA LƯU" : "ĐÃ CẤU HÌNH"}</span></header><div className="ss-section-body">{contents[section.id]}</div></section>
      })}
    </fieldset>
    <footer className="ss-save-bar"><div role="status" aria-live="polite"><span className={`ss-save-dot ${dirty ? 'unsaved' : ''}`} /><span>{saving ? "Đang lưu cấu hình mẫu…" : dirty ? "Thay đổi chưa lưu" : "Đã lưu · Cấu hình mẫu"}</span></div><div><button type="button" className="ss-button ss-discard" disabled={!dirty || saving} onClick={discard}><RotateCcw size={14} />Hủy thay đổi</button><button type="button" className="ss-button primary" disabled={!dirty || saving} onClick={save}>{saving ? <LoaderCircle size={14} className="ss-spinner" /> : dirty ? <Save size={14} /> : <Check size={14} />}{saving ? "Đang lưu…" : "Lưu tất cả thay đổi"}</button></div></footer>
    {dialog && <SettingsDialogs dialog={dialog} history={history} settings={settings} onClose={closeDialog} onConfirm={confirm} />}
  </div>
}
