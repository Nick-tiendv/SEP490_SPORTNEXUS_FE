import { settingsFields } from './settingsData.js'

export function SettingsField({ group, name, settings, errors, onChange, disabled = false }) {
  const field = settingsFields[group][name]
  const value = settings[group][name]
  const id = `ss-${group}-${name}`
  const error = errors[`${group}.${name}`]
  const describedBy = `${id}-help${error ? ` ${id}-error` : ''}`
  if (field.type === 'toggle') {
    return <div className={`ss-toggle-field ${disabled ? 'disabled' : ''}`}>
      <div><span id={`${id}-label`} className="ss-field-label">{field.label}</span><small id={`${id}-help`}>{field.help}</small></div>
      <div className="ss-toggle-control"><span className={value && !disabled ? 'enabled' : ''}>{disabled ? "Kênh đã tắt" : value ? "Đã bật" : "Đã tắt"}</span><button type="button" id={id} role="switch" aria-checked={value} aria-labelledby={`${id}-label`} aria-describedby={describedBy} disabled={disabled} className={`ss-switch ${value ? 'on' : ''}`} onClick={() => onChange(group, name, !value)}><span /></button></div>
      {error && <p className="ss-field-error" id={`${id}-error`}>{error}</p>}
    </div>
  }
  const props = { id, value, disabled, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, onChange: event => onChange(group, name, field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value) }
  return <div className={`ss-field ${disabled ? 'disabled' : ''}`}>
    <label className="ss-field-label" htmlFor={id}>{field.label}</label>
    {field.type === 'select' ? <select {...props}>{field.options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select> : field.type === 'textarea' ? <textarea {...props} rows={3} maxLength={field.maxLength} /> : <div className="ss-input-wrap"><input {...props} type={field.type} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength} />{field.unit && <span>{field.unit}</span>}</div>}
    <small id={`${id}-help`}>{field.help}</small>{error && <p className="ss-field-error" id={`${id}-error`}>{error}</p>}
  </div>
}

export function SettingsFields({ group, names, settings, errors, onChange, className = '', disabled = false }) {
  return <div className={`ss-fields ${className}`}>{names.map(name => <SettingsField key={name} group={group} name={name} settings={settings} errors={errors} onChange={onChange} disabled={disabled} />)}</div>
}
