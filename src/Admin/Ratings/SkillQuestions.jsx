import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { confirmDialog } from '../../components/common/confirm.js'
import { createSkillQuestion, deleteSkillQuestion, listSkillQuestions, updateSkillQuestion } from '../../api/admin/ratingApi.js'

// Bộ câu hỏi khảo sát toàn diện (QĐ-E): Admin thêm / sửa / xóa câu và điểm từng đáp án.
// Câu chung (scoringRule trống) áp dụng mọi môn; câu kỹ thuật theo luật môn (BADMINTON…, GENERIC cho môn chưa có bộ riêng).
// Tổng điểm quy về 0 – 100 → Elo khởi đầu. Sửa câu hỏi không làm đổi Elo của người đã làm (BE lưu phiên bản form).
const TYPES = [['SINGLE_CHOICE', 'Chọn 1 đáp án'], ['SCALE_1_5', 'Tự chấm 1 – 5']]
const noop = () => {}
const emptyForm = () => ({ code: '', text: '', type: 'SINGLE_CHOICE', scoringRule: '', maxPoints: '5', orderIndex: '0', isActive: true, options: [{ value: '', label: '', points: '0' }, { value: '', label: '', points: '0' }] })
const toForm = q => ({
  code: q.code, text: q.text, type: q.type, scoringRule: q.scoringRule || '', maxPoints: String(q.maxPoints || 5), orderIndex: String(q.orderIndex ?? 0), isActive: q.isActive,
  options: (q.options?.length ? q.options : emptyForm().options).map(o => ({ value: o.value, label: o.label, points: String(o.points ?? 0) })),
})

function QuestionDialog({ question, rules, onClose, onDone }) {
  const [form, setForm] = useState(() => (question ? toForm(question) : emptyForm()))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const set = patch => setForm(prev => ({ ...prev, ...patch }))
  const setOption = (i, patch) => set({ options: form.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) })
  const submit = async () => {
    setSubmitting(true); setError('')
    const payload = {
      code: form.code.trim(), text: form.text.trim(), type: form.type, scoringRule: form.scoringRule.trim() || null,
      orderIndex: Number(form.orderIndex) || 0, isActive: form.isActive,
      maxPoints: form.type === 'SCALE_1_5' ? Number(form.maxPoints) : null,
      options: form.type === 'SINGLE_CHOICE' ? form.options.map(o => ({ value: o.value.trim(), label: o.label.trim(), points: Number(o.points) || 0 })) : null,
    }
    try {
      if (question) await updateSkillQuestion(question.id, payload)
      else await createSkillQuestion(payload)
      onDone(question ? `Đã sửa câu ${payload.code}.` : `Đã thêm câu ${payload.code}.`)
    } catch (err) { setError(err.message); setSubmitting(false) }
  }
  return <DemoDialog title={question ? `Sửa câu ${question.code}` : 'Thêm câu hỏi khảo sát'} onClose={submitting ? noop : onClose}>
    <div className="users-form">
      <label>Mã câu (chữ hoa, số, _)<input value={form.code} onChange={e => set({ code: e.target.value.toUpperCase() })} placeholder="VD: EQUIPMENT" maxLength={50} /></label>
      <label>Nội dung câu hỏi<textarea rows={2} maxLength={500} value={form.text} onChange={e => set({ text: e.target.value })} /></label>
      <label>Loại<select value={form.type} onChange={e => set({ type: e.target.value })}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label>Phạm vi (trống = câu chung mọi môn)<input list="skill-question-rules" value={form.scoringRule} onChange={e => set({ scoringRule: e.target.value.toUpperCase() })} placeholder="Câu chung" /><datalist id="skill-question-rules">{rules.map(r => <option key={r} value={r} />)}</datalist></label>
      <label>Thứ tự<input type="number" min="0" max="1000" value={form.orderIndex} onChange={e => set({ orderIndex: e.target.value })} /></label>
      <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.isActive} onChange={e => set({ isActive: e.target.checked })} />Đang dùng (bỏ chọn = tạm ẩn khỏi khảo sát)</label>
      {form.type === 'SCALE_1_5'
        ? <label>Điểm tối đa (điểm = (tự chấm − 1) / 4 × điểm tối đa)<input type="number" min="1" max="100" value={form.maxPoints} onChange={e => set({ maxPoints: e.target.value })} /></label>
        : <div>
          <strong style={{ fontSize: 13 }}>Đáp án (2 – 10)</strong>
          {form.options.map((o, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 70px auto', gap: 6, marginTop: 6 }}>
            <input aria-label="Giá trị" placeholder="GIA_TRI" value={o.value} onChange={e => setOption(i, { value: e.target.value.toUpperCase() })} />
            <input aria-label="Nội dung đáp án" placeholder="Nội dung đáp án" value={o.label} onChange={e => setOption(i, { label: e.target.value })} />
            <input aria-label="Điểm" type="number" min="0" max="100" value={o.points} onChange={e => setOption(i, { points: e.target.value })} />
            <button type="button" className="users-button" disabled={form.options.length <= 2} onClick={() => set({ options: form.options.filter((_, j) => j !== i) })}>×</button>
          </div>)}
          {form.options.length < 10 && <button type="button" className="users-button" style={{ marginTop: 6 }} onClick={() => set({ options: [...form.options, { value: '', label: '', points: '0' }] })}><Plus size={12} />Thêm đáp án</button>}
        </div>}
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" onClick={submit} disabled={submitting}>{submitting ? 'Đang lưu…' : 'Lưu'}</button></footer>
    </div>
  </DemoDialog>
}

export default function SkillQuestions({ onNotice }) {
  const [scope, setScope] = useState('')
  const [reload, setReload] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: '' })
  const [dialog, setDialog] = useState(null)
  // Phạm vi lấy từ câu hỏi BE trả về khi xem "Tất cả" (không hard-code danh sách luật môn)
  const [rules, setRules] = useState([])
  useEffect(() => {
    let cancelled = false
    const key = `${scope}|${reload}`
    listSkillQuestions(scope)
      .then(data => {
        if (cancelled) return
        setState({ key, data, error: '' })
        if (!scope) setRules([...new Set((data?.questions || []).map(q => q.scoringRule).filter(Boolean))].sort())
      })
      .catch(error => !cancelled && setState({ key, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [scope, reload])
  const questions = state.data?.questions || []
  const done = message => { setDialog(null); onNotice(message); setReload(v => v + 1) }
  const remove = async q => {
    if (!(await confirmDialog(`Xóa câu ${q.code}? Người đã làm khảo sát giữ nguyên Elo.`))) return
    try { await deleteSkillQuestion(q.id); done(`Đã xóa câu ${q.code}.`) } catch (error) { onNotice(error.message) }
  }
  return <section className="lfg-table-panel">
    <header>
      <h2>Câu hỏi khảo sát toàn diện <span>{questions.length}</span>{state.data && <small style={{ marginLeft: 8 }}>Phiên bản bộ câu hỏi: {state.data.formVersion}</small>}</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>Phạm vi<select value={scope} onChange={e => setScope(e.target.value)}><option value="">Tất cả</option><option value="COMMON">Câu chung</option>{rules.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
        <button className="users-button primary" onClick={() => setDialog({ question: null })}><Plus size={13} />Thêm câu hỏi</button>
      </div>
    </header>
    <p className="lfg-empty" style={{ textAlign: 'left' }}>Tổng điểm các câu của một môn được quy về thang 0 – 100, Elo khởi đầu = 1000 + điểm × 6. Sửa / xóa câu hỏi chỉ áp dụng cho lần làm khảo sát sau, Elo đã có không đổi.</p>
    {state.error && <div className="users-notice" role="alert"><span>{state.error}</span></div>}
    <div className="lfg-table-scroll"><table><thead><tr>{['Mã', 'Câu hỏi', 'Loại', 'Phạm vi', 'Điểm', 'Trạng thái', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody style={state.key !== `${scope}|${reload}` ? { opacity: 0.5 } : undefined}>{questions.map(q => <tr key={q.id}>
        <td><strong>{q.code}</strong><small>Thứ tự {q.orderIndex}</small></td>
        <td>{q.text}</td>
        <td>{TYPES.find(([v]) => v === q.type)?.[1] || q.type}</td>
        <td>{q.scoringRule || 'Câu chung'}</td>
        <td>{q.type === 'SCALE_1_5' ? `tối đa ${q.maxPoints}` : (q.options || []).map(o => `${o.label}: ${o.points}`).join(' · ')}</td>
        <td>{q.isActive ? 'Đang dùng' : 'Tạm ẩn'}</td>
        <td><div style={{ display: 'flex', gap: 6 }}><button className="users-button" onClick={() => setDialog({ question: q })}>Sửa</button><button className="users-button users-danger" onClick={() => remove(q)}>Xóa</button></div></td>
      </tr>)}</tbody></table>
      {state.data && !questions.length && <p className="lfg-empty">Chưa có câu hỏi nào trong phạm vi này.</p>}</div>
    {dialog && <QuestionDialog question={dialog.question} rules={rules} onClose={() => setDialog(null)} onDone={done} />}
  </section>
}
