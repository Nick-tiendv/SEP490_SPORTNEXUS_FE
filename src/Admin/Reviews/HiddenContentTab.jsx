import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { getHiddenContent, hideComment, hidePost, unhideComment, unhidePost } from '../../api/admin/communityApi.js'

// Admin ẩn / bỏ ẩn bài viết và bình luận cộng đồng trực tiếp (không cần có báo cáo); ẩn / bỏ ẩn đều báo tác giả.
const date = value => (value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—')
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function HiddenContentTab() {
  const [reload, setReload] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: '' })
  const [form, setForm] = useState({ kind: 'post', id: '', reason: '' })
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let cancelled = false
    getHiddenContent()
      .then(data => !cancelled && setState({ key: reload, data, error: '' }))
      .catch(error => !cancelled && setState({ key: reload, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [reload])

  const run = async (task, message) => {
    setBusy(true)
    try { await task(); toast.success(message); setReload(v => v + 1); return true } catch (error) { toast.error(error.message); return false } finally { setBusy(false) }
  }
  const hide = async event => {
    event.preventDefault()
    const id = form.id.trim()
    if (!GUID.test(id)) return toast.error('Mã bài viết / bình luận không hợp lệ.')
    if (!form.reason.trim()) return toast.error('Vui lòng nhập lý do ẩn.')
    const ok = await run(() => (form.kind === 'post' ? hidePost(id, form.reason.trim()) : hideComment(id, form.reason.trim())), form.kind === 'post' ? 'Đã ẩn bài viết.' : 'Đã ẩn bình luận.')
    if (ok) setForm(f => ({ ...f, id: '', reason: '' }))
  }
  const posts = state.data?.posts || []
  const comments = state.data?.comments || []
  const row = (item, kind) => <tr key={`${kind}-${item.id}`}>
    <td>{kind === 'post' ? 'Bài viết' : 'Bình luận'}</td>
    <td>{kind === 'post' ? item.authorName : item.userName}</td>
    <td className="rr-excerpt" title={item.content}>{item.content}</td>
    <td>{item.hiddenReason || '—'}</td>
    <td>{date(item.createdAt)}</td>
    <td><button className="rr-button" disabled={busy} onClick={() => run(() => (kind === 'post' ? unhidePost(item.id) : unhideComment(item.id)), 'Đã bỏ ẩn, nội dung hiển thị lại.')}><Eye size={14} />Bỏ ẩn</button></td>
  </tr>

  return <div className="rr-content" style={{ display: 'block' }}>
    <section className="rr-list">
      <form className="rr-toolbar" onSubmit={hide} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label>Loại<select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}><option value="post">Bài viết</option><option value="comment">Bình luận</option></select></label>
        <label style={{ flex: '1 1 240px' }}>Mã (id) bài viết / bình luận<input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="xxxxxxxx-xxxx-…" /></label>
        <label style={{ flex: '2 1 300px' }}>Lý do (tác giả sẽ thấy)<input maxLength={500} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="VD: Ngôn từ xúc phạm người khác" /></label>
        <button className="rr-button danger" disabled={busy}><EyeOff size={14} />Ẩn nội dung</button>
      </form>
      {state.error && <p className="rr-error" role="alert">{state.error}</p>}
      <div className="rr-table-scroll"><table><thead><tr>{['Loại', 'Tác giả', 'Nội dung', 'Lý do ẩn', 'Ngày đăng', ''].map(text => <th key={text}>{text}</th>)}</tr></thead>
        <tbody style={state.key !== reload ? { opacity: 0.5 } : undefined}>{posts.map(p => row(p, 'post'))}{comments.map(c => row(c, 'comment'))}</tbody></table></div>
      {state.data && !posts.length && !comments.length && <div className="rr-empty"><Eye size={28} /><h3>Không có nội dung nào đang bị ẩn</h3></div>}
    </section>
  </div>
}
