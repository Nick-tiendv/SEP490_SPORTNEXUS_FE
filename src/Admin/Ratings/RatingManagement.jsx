import { useEffect, useState } from 'react'
import { BadgeCheck, Flag, Medal, RefreshCw } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import EloLeaderboard from '../../components/common/EloLeaderboard.jsx'
import { clearRatingFlag, getUserSkillProfile, listAssessments, listFlaggedRatings, penalizeRating, reviewAssessment } from '../../api/admin/ratingApi.js'
import SkillQuestions from './SkillQuestions.jsx'
import '../Users/users.css'
import '../LFG/lfg.css'

// Admin kiểm soát Elo: duyệt bằng chứng khảo sát (Elo khởi đầu > 1400), xử lý hồ sơ Elo bị gắn cờ, xem bảng xếp hạng.
const EVIDENCE = { PENDING: ['Pending', 'Chờ duyệt'], APPROVED: ['Confirmed', 'Đã duyệt'], REJECTED: ['Cancelled', 'Từ chối'], NONE: ['Completed', 'Không có bằng chứng'] }
const LABELS = { MALE: 'Nam', FEMALE: 'Nữ', EXCHANGE: 'Giao lưu', TRAINING: 'Tập luyện', COMPETITION: 'Thi đấu', RARELY: 'Thỉnh thoảng', WEEKLY_1_2: '1 – 2 buổi / tuần', WEEKLY_3_PLUS: 'Từ 3 buổi / tuần' }
const noop = () => {}
const dateTime = value => (value ? new Date(value).toLocaleString('vi-VN') : '—')

function ReviewDialog({ assessment, approve, onClose, onDone }) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    if (!approve && !note.trim()) return setError('Vui lòng nhập lý do từ chối.')
    setSubmitting(true); setError('')
    try {
      await reviewAssessment(assessment.id, { approve, note: note.trim() })
      onDone(approve ? `Đã duyệt bằng chứng của ${assessment.fullName}.` : `Đã từ chối bằng chứng của ${assessment.fullName}.`)
    } catch (err) { setError(err.message); setSubmitting(false) }
  }
  return <DemoDialog title={approve ? 'Duyệt bằng chứng thành tích' : 'Từ chối bằng chứng'} onClose={submitting ? noop : onClose}>
    <p><strong>{assessment.fullName}</strong> · {assessment.sportName}</p>
    <p>{approve ? `Elo khởi đầu sẽ lên ${assessment.computedRating} theo điểm khảo sát.` : `Giữ Elo khởi đầu hiện tại (${assessment.assignedRating}).`}</p>
    <div className="users-form"><label>Ghi chú{!approve && ' (bắt buộc)'}<textarea rows={3} maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label>
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${approve ? 'primary' : 'users-danger'}`} onClick={submit} disabled={submitting}>{submitting ? 'Đang xử lý…' : approve ? 'Duyệt' : 'Từ chối'}</button></footer></div>
  </DemoDialog>
}

function FlagDialog({ item, penalize, onClose, onDone }) {
  const [note, setNote] = useState('')
  const [newRating, setNewRating] = useState('')
  const [reportId, setReportId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    if (penalize && !note.trim()) return setError('Vui lòng nhập lý do phạt.')
    const rating = newRating === '' ? null : Number(newRating)
    if (rating != null && (!Number.isInteger(rating) || rating < 0 || rating > 3000)) return setError('Elo mới phải là số nguyên 0 – 3000.')
    setSubmitting(true); setError('')
    try {
      if (penalize) await penalizeRating(item.ratingId, { newRating: rating, reason: note.trim(), reportId: reportId.trim() })
      else await clearRatingFlag(item.ratingId, note.trim())
      onDone(penalize ? `Đã phạt khai gian ${item.ownerName}.` : `Đã bỏ cờ cho ${item.ownerName}.`)
    } catch (err) { setError(err.message); setSubmitting(false) }
  }
  return <DemoDialog title={penalize ? 'Phạt khai gian trình độ' : 'Bỏ cờ, xác nhận trình độ hợp lệ'} onClose={submitting ? noop : onClose}>
    <p><strong>{item.ownerName}</strong> · {item.sportName} · Elo {item.rating}</p>
    {penalize && <p>Trừ 20 điểm Fair Play và khóa khảo sát môn này. Có thể đặt lại Elo.</p>}
    <div className="users-form">
      {penalize && <label>Elo mới (để trống = giữ nguyên)<input type="number" min="0" max="3000" value={newRating} onChange={e => setNewRating(e.target.value)} /></label>}
      <label>{penalize ? 'Lý do (bắt buộc)' : 'Ghi chú'}<textarea rows={3} maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label>
      {penalize && <label>Mã báo cáo liên quan (không bắt buộc)<input value={reportId} onChange={e => setReportId(e.target.value)} placeholder="reportId" /></label>}
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${penalize ? 'users-danger' : 'primary'}`} onClick={submit} disabled={submitting}>{submitting ? 'Đang xử lý…' : penalize ? 'Phạt' : 'Bỏ cờ'}</button></footer>
    </div>
  </DemoDialog>
}

// Hồ sơ trình độ 1 người chơi: khảo sát người chơi (thói quen, lịch rảnh, khu vực), Elo, mọi lần khảo sát toàn diện
function ProfileDialog({ user, onClose }) {
  const [state, setState] = useState({ data: null, error: '' })
  useEffect(() => {
    let cancelled = false
    getUserSkillProfile(user.userId).then(data => !cancelled && setState({ data, error: '' })).catch(error => !cancelled && setState({ data: null, error: error.message }))
    return () => { cancelled = true }
  }, [user.userId])
  const o = state.data?.onboarding
  return <DemoDialog title={`Hồ sơ trình độ · ${user.fullName || ''}`} onClose={onClose}>
    {!state.data && !state.error && <p>Đang tải…</p>}
    {state.error && <p className="users-form-error" role="alert">{state.error}</p>}
    {state.data && <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
      <section><strong>Khảo sát người chơi</strong>{o?.isCompleted
        ? <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          <li>Môn: {(o.sports || []).map(s => `${s.sportName} (${s.skillLevel}${s.preferredFormats?.length ? `, ${s.preferredFormats.join('/')}` : ''})`).join('; ') || '—'}</li>
          <li>Mục tiêu: {LABELS[o.goal] || o.goal || '—'} · Tần suất: {LABELS[o.frequency] || o.frequency || '—'} · Giới tính: {LABELS[o.gender] || '—'}</li>
          <li>Lịch rảnh: {(o.availability || []).length} khung giờ · Khu vực: {o.latitude != null ? `${o.latitude}, ${o.longitude} (bán kính ${o.radiusKm ?? '—'} km)` : 'Chưa khai'}</li>
          <li>Làm lúc: {dateTime(o.completedAt)}</li>
        </ul> : <p style={{ margin: '4px 0 0' }}>Chưa làm khảo sát người chơi.</p>}</section>
      <section><strong>Elo</strong>{(state.data.ratings || []).length
        ? <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{state.data.ratings.map(r => <li key={`${r.ownerType}|${r.ownerId}|${r.sportCategoryId}`}>{r.sportName} · {r.ownerType === 'TEAM' ? `Đội ${r.ownerName}` : 'Cá nhân'}: <strong>{r.rating}</strong> ({r.rank}, {r.ratedMatches} trận giải)</li>)}</ul>
        : <p style={{ margin: '4px 0 0' }}>Chưa có Elo.</p>}</section>
      <section><strong>Khảo sát toàn diện ({(state.data.assessments || []).length} lần)</strong>{(state.data.assessments || []).length > 0 && <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{state.data.assessments.map(a => <li key={a.id}>{dateTime(a.createdAt)} · {a.sportName} · {a.score}/100 → Elo {a.assignedRating}{a.computedRating > a.assignedRating ? ` (quy ra ${a.computedRating})` : ''}{a.flags?.length ? ` · Mâu thuẫn: ${a.flags.join('; ')}` : ''}</li>)}</ul>}</section>
    </div>}
  </DemoDialog>
}

export default function RatingManagement() {
  const [tab, setTab] = useState('assessments')
  // Mặc định xem mọi bài khảo sát; Admin tự lọc 'Chờ duyệt' khi cần duyệt bằng chứng
  const [evidenceStatus, setEvidenceStatus] = useState('ALL')
  const [reload, setReload] = useState(0)
  const [assessments, setAssessments] = useState({ key: null, items: [], error: '' })
  const [flagged, setFlagged] = useState({ key: null, items: [], error: '' })
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    const key = `${evidenceStatus}|${reload}`
    listAssessments(evidenceStatus)
      .then(items => !cancelled && setAssessments({ key, items, error: '' }))
      .catch(error => !cancelled && setAssessments({ key, items: [], error: error.message }))
    listFlaggedRatings()
      .then(items => !cancelled && setFlagged({ key: reload, items, error: '' }))
      .catch(error => !cancelled && setFlagged({ key: reload, items: [], error: error.message }))
    return () => { cancelled = true }
  }, [evidenceStatus, reload])

  const loadingAssessments = assessments.key !== `${evidenceStatus}|${reload}`
  const done = message => { setDialog(null); setNotice(message); setReload(v => v + 1) }
  const kpis = [
    { icon: BadgeCheck, className: 'total', label: evidenceStatus === 'PENDING' ? 'Bằng chứng chờ duyệt' : 'Khảo sát đang lọc (tối đa 200)', value: assessments.items.length },
    { icon: Flag, className: 'full', label: 'Hồ sơ Elo bị gắn cờ', value: flagged.items.length },
  ]

  return <div className="lfg-page">
    <header className="lfg-page-heading admin-page-header"><div><h1>Elo & trình độ</h1><p>Duyệt bằng chứng thành tích của khảo sát toàn diện, xử lý hồ sơ nghi khai sai trình độ và xem bảng xếp hạng.</p></div><div><button className="users-button" onClick={() => setReload(v => v + 1)}><RefreshCw size={13} />Làm mới</button></div></header>
    <div className="lfg-kpis">{kpis.map(({ icon: Icon, className, label, value }) => <article key={label} className={className}><div><small>{label}</small><Icon size={24} /></div><strong>{value}</strong></article>)}</div>
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}

    <section className="lfg-toolbar"><div className="lfg-filter-row">
      {[['assessments', 'Khảo sát toàn diện'], ['flagged', 'Hồ sơ bị gắn cờ'], ['questions', 'Câu hỏi khảo sát'], ['leaderboard', 'Bảng xếp hạng']].map(([key, label]) => <button key={key} className={`users-button ${tab === key ? 'primary' : ''}`} onClick={() => setTab(key)}>{key === 'leaderboard' && <Medal size={13} />}{label}</button>)}
      {tab === 'assessments' && <label>Trạng thái<select value={evidenceStatus} onChange={e => setEvidenceStatus(e.target.value)}><option value="ALL">Tất cả khảo sát</option>{['PENDING', 'APPROVED', 'REJECTED', 'NONE'].map(s => <option key={s} value={s}>{EVIDENCE[s][1]}</option>)}</select></label>}
    </div></section>

    {tab === 'assessments' && <section className="lfg-table-panel"><header><h2>Khảo sát toàn diện <span>{assessments.items.length}</span></h2></header>
      {assessments.error && <div className="users-notice" role="alert"><span>{assessments.error}</span></div>}
      <div className="lfg-table-scroll"><table><thead><tr>{['Người chơi', 'Môn', 'Elo', 'Câu trả lời mâu thuẫn', 'Bằng chứng', 'Trạng thái bằng chứng', ''].map(h => <th key={h} title={h === 'Trạng thái bằng chứng' ? 'Tự động khi người chơi nộp khảo sát; Admin chỉ Duyệt / Từ chối bài đang chờ duyệt' : undefined}>{h}</th>)}</tr></thead>
        <tbody style={loadingAssessments ? { opacity: 0.5 } : undefined}>{assessments.items.map(a => { const [tone, label] = EVIDENCE[a.evidenceStatus] || ['Pending', a.evidenceStatus]; return <tr key={a.id}>
          <td><strong>{a.fullName || '—'}</strong><small>{dateTime(a.createdAt)}</small></td>
          <td>{a.sportName}</td>
          <td><strong>{a.assignedRating}</strong><small>Khảo sát quy ra {a.computedRating}</small></td>
          <td>{a.flags?.length ? a.flags.join('; ') : '—'}</td>
          <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(a.evidenceUrls || []).map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Bằng chứng ${i + 1}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} /></a>)}{!a.evidenceUrls?.length && '—'}</div></td>
          <td><StatusBadge status={tone} label={label} />{a.reviewNote && <small>{a.reviewNote}</small>}</td>
          <td><div style={{ display: 'flex', gap: 6 }}><button className="users-button" onClick={() => setDialog({ type: 'profile', item: a })}>Hồ sơ</button>{a.evidenceStatus === 'PENDING' && <><button className="users-button primary" onClick={() => setDialog({ type: 'review', item: a, approve: true })}>Duyệt</button><button className="users-button users-danger" onClick={() => setDialog({ type: 'review', item: a, approve: false })}>Từ chối</button></>}</div></td>
        </tr> })}</tbody></table>
        {!loadingAssessments && !assessments.items.length && <p className="lfg-empty">Không có khảo sát nào ở trạng thái này.</p>}</div></section>}

    {tab === 'flagged' && <section className="lfg-table-panel"><header><h2>Hồ sơ Elo bị gắn cờ <span>{flagged.items.length}</span></h2></header>
      {flagged.error && <div className="users-notice" role="alert"><span>{flagged.error}</span></div>}
      <div className="lfg-table-scroll"><table><thead><tr>{['Người chơi / đội', 'Môn', 'Elo', 'Lý do gắn cờ', 'Thời điểm', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{flagged.items.map(f => <tr key={f.ratingId}>
          <td><strong>{f.ownerName || '—'}</strong><small>{f.ownerType === 'TEAM' ? 'Đội' : 'Cá nhân'}</small></td>
          <td>{f.sportName}</td>
          <td><strong>{f.rating}</strong><small>{f.ratedMatches} trận giải</small></td>
          <td>{f.flagReason || '—'}</td>
          <td>{dateTime(f.flaggedAt)}</td>
          <td><div style={{ display: 'flex', gap: 6 }}><button className="users-button" onClick={() => setDialog({ type: 'flag', item: f, penalize: false })}>Bỏ cờ</button>{f.ownerType !== 'TEAM' && <button className="users-button users-danger" onClick={() => setDialog({ type: 'flag', item: f, penalize: true })}>Phạt khai gian</button>}</div></td>
        </tr>)}</tbody></table>
        {!flagged.items.length && !flagged.error && <p className="lfg-empty">Không có hồ sơ nào bị gắn cờ.</p>}</div></section>}

    {tab === 'questions' && <SkillQuestions onNotice={setNotice} />}
    {tab === 'leaderboard' && <EloLeaderboard />}

    {dialog?.type === 'review' && <ReviewDialog assessment={dialog.item} approve={dialog.approve} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'profile' && <ProfileDialog user={dialog.item} onClose={() => setDialog(null)} />}
    {dialog?.type === 'flag' && <FlagDialog item={dialog.item} penalize={dialog.penalize} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
