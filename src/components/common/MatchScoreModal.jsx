import { useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { getMatch } from '../../api/player/tournamentApi.js'
import { buildScorePayload } from '../../CourtOwner/Tournament/tournamentRules.js'

const RESULT_TYPES = [
  ['NORMAL', 'Thi đấu bình thường'],
  ['WALKOVER', 'Xử thắng (đối thủ không ra sân)'],
  ['RETIRED', 'Bỏ cuộc giữa trận'],
]
const fold = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
const isFootball = (name) => /bong da|futsal|football|soccer/.test(fold(name))

// Nhập tỉ số một trận giải (trọng tài nhập điểm, BTC sửa tỉ số khi xử lý khiếu nại).
// onSubmit(payload, note) trả Promise; payload đúng body PUT /matches/{id}/score. withNote: hiện ô ghi chú (khiếu nại).
export default function MatchScoreModal({ matchId, title = 'Nhập tỉ số', submitLabel = 'Lưu tỉ số', withNote = false, onSubmit, onClose }) {
  const match = useApi(() => getMatch(matchId), [matchId], { initialData: null })
  const m = match.data
  // Tỉ số cũ (nếu có) điền sẵn khi chi tiết trận về; người dùng sửa thì giữ bản đang sửa
  const [edited, setEdited] = useState(null)
  const savedSets = (m?.scores || []).filter((s) => !s.isTiebreak).map((s) => ({ a: String(s.scoreP1 ?? ''), b: String(s.scoreP2 ?? '') }))
  const sets = edited || (savedSets.length ? savedSets : [{ a: '', b: '' }])
  const [resultType, setResultType] = useState('NORMAL')
  const [winnerId, setWinnerId] = useState('')
  const [tiebreak, setTiebreak] = useState({ a: '', b: '' })
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const updateSet = (index, changes) => setEdited(sets.map((set, i) => (i === index ? { ...set, ...changes } : set)))
  const totals = sets.reduce((sum, set) => ({ a: sum.a + (Number(set.a) || 0), b: sum.b + (Number(set.b) || 0) }), { a: 0, b: 0 })
  const filled = sets.some((set) => set.a !== '' || set.b !== '')
  // Bóng đá hòa: loại trực tiếp phải có luân lưu, vòng bảng được hòa (để trống luân lưu)
  const showTiebreak = resultType === 'NORMAL' && filled && totals.a === totals.b && isFootball(m?.sportName)

  const submit = async (event) => {
    event.preventDefault()
    const { payload, error } = buildScorePayload({ resultType, sets, winnerId, tiebreak: showTiebreak ? tiebreak : { a: '', b: '' } })
    if (error) { toast.error(error); return }
    setBusy(true)
    try {
      await onSubmit(payload, note.trim())
    } catch (err) {
      toast.error(err?.message || 'Không lưu được tỉ số.')
    } finally {
      setBusy(false)
    }
  }

  const sides = [[m?.participant1Id, m?.participant1Name], [m?.participant2Id, m?.participant2Name]].filter(([id]) => id)

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="match-score-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="match-score-title" className="snx-card-title">{title}</h2>
            {m && <p className="snx-card-subtitle">{[m.tournamentName, m.roundName].filter(Boolean).join(' · ')}</p>}
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        {match.loading && !m && <p className="snx-muted">Đang tải trận đấu…</p>}
        {match.error && <div className="snx-alert snx-alert--error">{match.error}</div>}
        {m && (
          <div className="snx-stack">
            <p style={{ margin: 0, fontSize: 15 }}><strong>{m.participant1Name || 'Bên 1'}</strong> <span className="snx-muted">vs</span> <strong>{m.participant2Name || 'Bên 2'}</strong></p>
            <label className="snx-field">Kết quả
              <select className="snx-select" value={resultType} onChange={(e) => setResultType(e.target.value)}>
                {RESULT_TYPES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            {resultType !== 'WALKOVER' && (
              <div className="snx-field">
                <span>Tỉ số từng hiệp ({m.participant1Name || 'Bên 1'} – {m.participant2Name || 'Bên 2'})</span>
                {sets.map((set, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 32px', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span className="snx-muted">Hiệp {index + 1}</span>
                    <input className="snx-input" type="number" min={0} aria-label={`Hiệp ${index + 1} bên 1`} value={set.a} onChange={(e) => updateSet(index, { a: e.target.value })} />
                    <input className="snx-input" type="number" min={0} aria-label={`Hiệp ${index + 1} bên 2`} value={set.b} onChange={(e) => updateSet(index, { b: e.target.value })} />
                    {sets.length > 1 && (
                      <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Xóa hiệp" onClick={() => setEdited(sets.filter((_, i) => i !== index))}><span className="material-symbols-outlined">close</span></button>
                    )}
                  </div>
                ))}
                {sets.length < 5 && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setEdited([...sets, { a: '', b: '' }])}>+ Thêm hiệp</button>}
              </div>
            )}
            {showTiebreak && (
              <div className="snx-field">
                <span>Luân lưu (để trống nếu trận vòng bảng được hòa)</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="snx-input" type="number" min={0} aria-label="Luân lưu bên 1" value={tiebreak.a} onChange={(e) => setTiebreak({ ...tiebreak, a: e.target.value })} />
                  <input className="snx-input" type="number" min={0} aria-label="Luân lưu bên 2" value={tiebreak.b} onChange={(e) => setTiebreak({ ...tiebreak, b: e.target.value })} />
                </div>
              </div>
            )}
            {resultType !== 'NORMAL' && (
              <label className="snx-field">{resultType === 'WALKOVER' ? 'Bên được xử thắng' : 'Bên thắng (bên còn lại bỏ cuộc)'}
                <select className="snx-select" value={winnerId} onChange={(e) => setWinnerId(e.target.value)}>
                  <option value="">Chọn bên thắng</option>
                  {sides.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
            )}
            {withNote && (
              <label className="snx-field">Ghi chú gửi người khiếu nại
                <textarea className="snx-input" rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Đã đối chiếu biên bản trọng tài, sửa tỉ số set 2." />
              </label>
            )}
          </div>
        )}
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy || !m}>{busy ? 'Đang lưu…' : submitLabel}</button>
        </div>
      </form>
    </div>
  )
}
