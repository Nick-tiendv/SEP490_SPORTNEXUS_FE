import { useEffect, useRef, useSyncExternalStore } from 'react'
import { confirmSnapshot, subscribeConfirm } from './confirm.js'

// Hiển thị hộp thoại do confirmDialog() (confirm.js) mở. Gắn 1 lần ở ToastProvider.
export default function ConfirmHost() {
  const dialog = useSyncExternalStore(subscribeConfirm, confirmSnapshot)
  const confirmRef = useRef(null)
  useEffect(() => {
    if (!dialog) return undefined
    const previous = document.activeElement
    confirmRef.current?.focus()
    const onKey = (event) => { if (event.key === 'Escape') dialog.resolve(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.() }
  }, [dialog])
  if (!dialog) return null
  return (
    <div className="snx-modal-backdrop" role="presentation" style={{ zIndex: 1000 }} onMouseDown={(event) => event.target === event.currentTarget && dialog.resolve(false)}>
      <div className="snx-modal" role="alertdialog" aria-modal="true" aria-labelledby="snx-confirm-title" aria-describedby="snx-confirm-message" style={{ width: 'min(440px, 100%)' }}>
        <div className="snx-row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', gap: 12 }}>
          {dialog.image
            ? <img src={dialog.image} alt="" referrerPolicy="no-referrer" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <span className="material-symbols-outlined" style={{ fontSize: 28, color: dialog.danger ? '#dc2626' : '#15803d' }}>{dialog.danger ? 'warning' : 'help'}</span>}
          <div>
            <h2 id="snx-confirm-title" className="snx-card-title" style={{ fontSize: 17 }}>{dialog.title}</h2>
            <p id="snx-confirm-message" style={{ margin: '6px 0 0', whiteSpace: 'pre-line', fontSize: 14, color: '#334155' }}>{dialog.message}</p>
          </div>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={() => dialog.resolve(false)}>{dialog.cancelLabel}</button>
          <button ref={confirmRef} type="button" className={`snx-btn ${dialog.danger ? 'snx-btn--danger' : 'snx-btn--primary'}`} onClick={() => dialog.resolve(true)}>{dialog.confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
