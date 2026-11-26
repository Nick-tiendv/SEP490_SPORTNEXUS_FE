import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/authContext.js'
import MascotFigure from './MascotFigure.jsx'
import { mascotLine, pickMascotAsset } from './mascotConfig.js'
import { createMascotDirector, loadMascotPrefs } from './mascotDirector.js'
import { OPEN_NOTIFICATIONS_EVENT } from './mascotEvents.js'
import { useMascotNotification } from './useMascotNotification.js'
import './mascot.css'

const BUBBLE_MAX_W = 260
const GUTTER = 16

const readParam = (name) => {
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}

const shorten = (text, max) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

// Bề rộng sidebar cố định bên trái (= padding-left của vùng nội dung; mobile sidebar thu lại thì 0)
const sidebarWidth = () => {
  const workspace = document.querySelector('.snx-workspace')
  return workspace ? parseFloat(getComputedStyle(workspace).paddingLeft) || 0 : 0
}

// Bong bóng nằm phía trên (gần mép trên thì phía dưới) mascot, ép trong vùng nội dung (không lọt sau sidebar);
// đuôi chỉ vào giữa mascot
function bubbleLayout({ x, y, size, vw, left: sideLeft = 0 }) {
  const minX = sideLeft + GUTTER
  const width = Math.min(BUBBLE_MAX_W, vw - minX - GUTTER)
  const towardLeft = x + size.w / 2 > (minX + vw) / 2
  const desired = towardLeft ? size.w - width : 0
  const left = Math.min(Math.max(desired, minX - x), vw - GUTTER - width - x)
  const tail = Math.min(Math.max(size.w / 2 - left, 16), width - 16)
  return { width, left, tail, below: y < 170 }
}

function MascotBubble({ bubble, layout, onOpen, onClose, onMakeUp, onHide }) {
  const style = { width: layout.width, left: layout.left, '--snx-mascot-tail': `${layout.tail}px` }
  const cls = `snx-mascot-bubble is-${bubble.kind}${layout.below ? ' is-below' : ''}`
  return (
    <div className={cls} style={style} role="status" aria-live="polite">
      {bubble.kind === 'notice' ? (
        <button type="button" className="snx-mascot-bubble__main" onClick={onOpen}>
          <span className="snx-mascot-bubble__eyebrow">{bubble.sulk ? '😒 Hứ… có thông báo nè' : '🔔 Thông báo mới'}</span>
          <strong className="snx-mascot-bubble__title">{shorten(bubble.title, 70)}</strong>
          {bubble.text && <span className="snx-mascot-bubble__text">{shorten(bubble.text, 120)}</span>}
          <span className="snx-mascot-bubble__cta">Bấm để xem thông báo</span>
        </button>
      ) : (
        <>
          <p className="snx-mascot-bubble__say">{bubble.text}</p>
          {bubble.actions?.length > 0 && (
            <div className="snx-mascot-bubble__actions">
              {bubble.actions.includes('makeUp') && <button type="button" onClick={onMakeUp}>Dỗ dành 🍬</button>}
              {bubble.actions.includes('hide') && <button type="button" className="is-muted" onClick={onHide}>Ẩn cóc</button>}
            </div>
          )}
        </>
      )}
      <button type="button" className="snx-mascot-bubble__close" onClick={onClose} aria-label="Đóng">×</button>
    </div>
  )
}

// Mascot thông báo nổi: chạy vòng quanh màn hình, có thông báo mới thì chạy về góc phải dưới, nhảy và hiện bong bóng.
// Kéo lần 1: nhắc; kéo lần 2: đứng yên tại chỗ và dỗi (bấm vào → "Dỗ dành" để chạy lại). Gắn 1 lần trong layout.
export default function FloatingMascot() {
  const { role, token } = useAuth()
  const elRef = useRef(null)
  const directorRef = useRef(null)
  const roleRef = useRef(role)
  const [view, setView] = useState(null)
  const [demo] = useState(() => readParam('mascotDemo') === '1')
  // Mỗi phiên tab 1 con ngẫu nhiên; ?mascot=tennis để chọn đúng con khi thử
  const [asset] = useState(() => pickMascotAsset({ forceKey: readParam('mascot') }))

  useEffect(() => {
    roleRef.current = role
  }, [role])

  useEffect(() => {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const director = createMascotDirector({
      emit: setView,
      getRect: () => elRef.current?.getBoundingClientRect() ?? null,
      viewport: () => ({ w: window.innerWidth, h: window.innerHeight, left: sidebarWidth() }),
      line: (kind) => mascotLine(kind, roleRef.current, { sport: asset.sport }),
      prefs: loadMascotPrefs(),
      reduced: motion?.matches === true,
      onOpenNotifications: () => window.dispatchEvent(new CustomEvent(OPEN_NOTIFICATIONS_EVENT)),
    })
    directorRef.current = director
    director.start()
    const onResize = () => director.resize()
    const onMotion = (e) => director.setReduced(e.matches)
    window.addEventListener('resize', onResize)
    motion?.addEventListener?.('change', onMotion)
    return () => {
      director.stop()
      directorRef.current = null
      window.removeEventListener('resize', onResize)
      motion?.removeEventListener?.('change', onMotion)
    }
  }, [asset])

  const { pushDemo } = useMascotNotification((items) => directorRef.current?.enqueue(items), {
    demo,
    unreadText: (n) => mascotLine('unread', role, { n }),
    // Đổi mỗi lần đăng nhập: chỉ lấy đuôi token để phân biệt phiên, không lưu cả token
    sessionKey: String(token || '').slice(-12),
  })

  if (!view) return null
  const act = (name, ...args) => directorRef.current?.[name](...args)

  return (
    <>
      {!view.hidden && (
        <div
          ref={elRef}
          className={`snx-mascot is-${view.action}`}
          style={{
            width: view.size.w,
            height: view.size.h,
            transform: `translate3d(${view.x}px, ${view.y}px, 0)`,
            transition: view.ms ? `transform ${view.ms}ms ease-in-out` : 'none',
          }}
        >
          {view.bubble && (
            <MascotBubble
              bubble={view.bubble}
              layout={bubbleLayout(view)}
              onOpen={() => act('openNotice')}
              onClose={() => act('closeBubble')}
              onMakeUp={() => act('makeUp')}
              onHide={() => act('hide')}
            />
          )}
          <div
            className="snx-mascot__hit"
            role="button"
            tabIndex={0}
            aria-label="Mascot SportNexus: bấm để trò chuyện, kéo để dời chỗ"
            title="Bấm để trò chuyện, kéo để dời chỗ"
            onPointerDown={(e) => {
              try {
                e.currentTarget.setPointerCapture(e.pointerId) // kéo nhanh ra khỏi thân mascot vẫn bám theo
              } catch {
                /* pointer không còn hoạt động: vẫn kéo được trong phạm vi thân mascot */
              }
              act('pointerDown', e)
            }}
            onPointerMove={(e) => act('pointerMove', e)}
            onPointerUp={() => act('pointerUp')}
            onPointerCancel={() => act('pointerUp')}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              act('click')
            }}
          >
            <div className={`snx-mascot__flip${view.facingLeft ? ' is-left' : ''}`}>
              <div className={`snx-mascot__figure is-${asset.type}`}>
                <MascotFigure asset={asset} action={view.action} />
              </div>
            </div>
          </div>
        </div>
      )}
      {view.hidden && (
        <button type="button" className="snx-mascot-restore" onClick={() => act('show')} title="Hiện mascot" aria-label="Hiện mascot">
          🐸
        </button>
      )}
      {demo && (
        <button type="button" className="snx-mascot-demo" onClick={pushDemo}>
          🔔 Thử thông báo
        </button>
      )}
    </>
  )
}
