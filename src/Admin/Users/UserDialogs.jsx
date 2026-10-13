import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export function DemoDialog({ title, onClose, children, closeLabel = 'Close dialog' }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const node = dialog.current
    const focusable = () => [...node.querySelectorAll('button:not(:disabled), input, select, [tabindex="0"]')]
    focusable()[0]?.focus()
    const handleKey = event => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const items = focusable()
        const first = items[0], last = items.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    node.addEventListener('keydown', handleKey)
    return () => { node.removeEventListener('keydown', handleKey); previous?.focus() }
  }, [onClose])
  return <div className="users-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}><div className="users-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="users-dialog-title"><header><h2 id="users-dialog-title">{title}</h2><button onClick={onClose} aria-label={closeLabel}><X size={20} /></button></header>{children}</div></div>
}

export function UserFormDialog({ user, users, onClose, onSave }) {
  const [values, setValues] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '', phone: user?.phone || '', role: user?.role || 'Player' })
  const [error, setError] = useState('')
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 2) return setError('Name must contain at least two characters.')
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(clean.username)) return setError('Username must be 3–30 letters, numbers, dots, underscores or hyphens.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return setError('Enter a valid email address.')
    if (clean.phone && !/^[+\d\s()-]{7,20}$/.test(clean.phone)) return setError('Enter a valid phone number or leave it empty.')
    if (users.some(item => item.id !== user?.id && (item.username.toLowerCase() === clean.username.toLowerCase() || item.email.toLowerCase() === clean.email.toLowerCase()))) return setError('Username or email already exists in the demo dataset.')
    onSave(clean)
  }
  return <DemoDialog title={`${user ? 'Edit' : 'Add'} User — Demo`} onClose={onClose}><p className="users-demo-note">Prototype only. Changes are held in memory and reset on reload. No backend account will be created or updated.</p><form onSubmit={submit} className="users-form">
    {[['name', 'Full name'], ['username', 'Username'], ['email', 'Email'], ['phone', 'Phone (optional)']].map(([name, label]) => <label key={name}>{label}<input name={name} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} value={values[name]} onChange={change} required={name !== 'phone'} maxLength={name === 'name' ? 80 : 120} /></label>)}
    <label>Role<select name="role" value={values.role} onChange={change}>{['Player', 'Court Owner', 'Administrator'].map(role => <option key={role}>{role}</option>)}</select></label>
    {error && <p className="users-form-error" role="alert">{error}</p>}<footer><button type="button" className="users-button" onClick={onClose}>Cancel</button><button className="users-button primary" type="submit">{user ? 'Apply demo changes' : 'Add demo user'}</button></footer>
  </form></DemoDialog>
}

export function SuspensionDialog({ users, restore, onClose, onConfirm }) {
  return <DemoDialog title={`${restore ? 'Restore' : 'Suspend'} ${users.length === 1 ? 'user' : `${users.length} users`} — Demo`} onClose={onClose}><p className="users-demo-note">This action updates local prototype state only. It does not change real accounts, wallets, bookings or backend data.</p><p>{restore ? 'Restore access for' : 'Suspend'} {users.map(user => user.name).join(', ')}?</p><footer><button className="users-button" onClick={onClose}>Cancel</button><button className={`users-button ${restore ? 'primary' : 'users-danger'}`} onClick={onConfirm}>Confirm demo {restore ? 'restore' : 'suspension'}</button></footer></DemoDialog>
}
