import { useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'

export function OwnerFormDialog({ owner, owners, onClose, onSave }) {
  const [values, setValues] = useState({ name: owner?.name || '', username: owner?.username || '', email: owner?.email || '', phone: owner?.phone || '', legalName: owner?.legalName || '', registration: owner?.registration || '' })
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 2) return setError('Name must contain at least two characters.')
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(clean.username)) return setError('Username must contain 3–30 letters, numbers, dots, underscores or hyphens.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return setError('Enter a valid email address.')
    if (clean.phone && !/^[+\d\s()-]{7,20}$/.test(clean.phone)) return setError('Enter a valid phone or leave it empty.')
    if (clean.legalName.length < 2) return setError('Enter a legal business name for the demo profile.')
    if (owners.some(item => item.id !== owner?.id && (item.username.toLowerCase() === clean.username.toLowerCase() || item.email.toLowerCase() === clean.email.toLowerCase()))) return setError('Username or email already exists in this demo dataset.')
    onSave(clean)
  }
  return <DemoDialog title={`${owner ? 'Edit' : 'Add'} Court Owner — Demo`} onClose={onClose}><p className="users-demo-note">Local prototype only. Changes reset on reload. Use fictional information; no account or business registration will be saved to a backend.</p><form className="users-form" onSubmit={submit}>{[['name', 'Full name'], ['username', 'Username'], ['email', 'Email'], ['phone', 'Phone (optional)'], ['legalName', 'Legal business name (demo)'], ['registration', 'Registration / tax reference (optional, fictional)']].map(([key, label]) => <label key={key}>{label}<input name={key} value={values[key]} onChange={event => setValues({ ...values, [key]: event.target.value })} required={!['phone', 'registration'].includes(key)} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} maxLength={key === 'username' ? 30 : 120} /></label>)}{error && <p className="users-form-error" role="alert">{error}</p>}<footer><button className="users-button" type="button" onClick={onClose}>Cancel</button><button className="users-button primary">{owner ? 'Apply demo changes' : 'Add demo owner'}</button></footer></form></DemoDialog>
}

export function OwnerReviewDialog({ owner, onClose, onConfirm }) {
  return <DemoDialog title="KYC Review — Demo" onClose={onClose}><p className="users-demo-note">Review fictional KYC information below. Confirming updates this owner's local verification badge only. No KYC approval or facility verification is persisted.</p><dl className="owners-review-fields">{[['Owner', owner.name], ['Business', owner.legalName || 'Not available'], ['Registration', owner.registration || 'Not available'], ['Current status', owner.verification], ['Facilities', owner.facilities.length]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{!owner.registration && <p className="users-form-error">Registration reference is missing. Add a fictional reference using Edit Owner before demo verification.</p>}<footer><button className="users-button" onClick={onClose}>Cancel</button><button className="users-button primary" disabled={owner.verification === 'Verified' || !owner.registration || !owner.legalName} onClick={onConfirm}>{owner.verification === 'Verified' ? 'Already verified (demo)' : 'Confirm demo verification'}</button></footer></DemoDialog>
}

export function OwnerAccountDialog({ owners, restore, onClose, onConfirm }) {
  return <DemoDialog title={`${restore ? 'Reactivate' : 'Suspend'} ${owners.length === 1 ? 'Owner' : `${owners.length} Owners`} — Demo`} onClose={onClose}><p className="users-demo-note">This action updates local account status only. It will not change real accounts, associated facilities, bookings, wallets or payments.</p><p>{restore ? 'Reactivate' : 'Suspend'} {owners.map(owner => owner.name).join(', ')}?</p><footer><button className="users-button" onClick={onClose}>Cancel</button><button className={`users-button ${restore ? 'primary' : 'users-danger'}`} onClick={onConfirm}>Confirm demo {restore ? 'reactivation' : 'suspension'}</button></footer></DemoDialog>
}
