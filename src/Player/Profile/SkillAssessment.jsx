import { useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getPublicSports as getSportCategories } from '../../api/auth/authApi.js'
import { uploadImage } from '../../api/player/uploadApi.js'
import {
  EVIDENCE_STATUS, getAssessmentForm, getMyAssessments, getMyRatings, isTechniqueCode, submitAssessment,
} from '../../api/player/ratingApi.js'
import { useApi } from '../../hooks/useApi.js'
import EloLeaderboard from '../../components/common/EloLeaderboard.jsx'

// Khảo sát toàn diện theo môn → Elo khởi đầu. Câu hỏi / mã giá trị lấy từ BE, không hard-code.
// Chưa có Elo môn nào thì không tạo / vào đội, không đăng ký giải môn đó.
const MAX_EVIDENCE = 5
const SKILL_TEXT = { BEGINNER: 'Mới chơi', INTERMEDIATE: 'Trung bình', ADVANCED: 'Khá / Nâng cao', PROFESSIONAL: 'Chuyên nghiệp' }
const dateVN = value => (value ? new Date(value).toLocaleDateString('vi-VN') : '')

function AssessmentResult({ result }) {
  const [label, tone] = EVIDENCE_STATUS[result.evidenceStatus] || [result.evidenceStatus, 'gray']
  return (
    <div className="snx-card" style={{ padding: 16 }}>
      <div className="snx-row" style={{ gap: 8 }}>
        <strong style={{ fontSize: 22 }}>Elo {result.assignedRating}</strong>
        <span className="snx-badge snx-badge--blue">{SKILL_TEXT[result.skillLevel] || result.skillLevel}</span>
        {result.evidenceStatus && result.evidenceStatus !== 'NONE' && <span className={`snx-badge snx-badge--${tone}`}>{label}</span>}
      </div>
      {result.computedRating > result.assignedRating && (
        <p className="snx-muted" style={{ marginTop: 6 }}>
          Điểm khảo sát quy ra Elo {result.computedRating}; Elo khởi đầu tạm giữ ở {result.assignedRating} cho tới khi bằng chứng thành tích được duyệt.
        </p>
      )}
      {result.flags?.length > 0 && (
        <div className="snx-alert snx-alert--info" style={{ marginTop: 8 }}>
          Một số câu trả lời chưa nhất quán: {result.flags.join('; ')}
        </div>
      )}
      {result.reviewNote && <p className="snx-muted" style={{ marginTop: 6 }}>Ghi chú duyệt: {result.reviewNote}</p>}
      {result.createdAt && <p className="snx-muted" style={{ marginTop: 6 }}>Làm ngày {dateVN(result.createdAt)}</p>}
    </div>
  )
}

export default function SkillAssessment() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [params, setParams] = useSearchParams()
  const sportId = params.get('sportId') || ''

  const sports = useApi(getSportCategories, [], { initialData: [] })
  const mine = useApi(getMyAssessments, [], { initialData: [] })
  const ratings = useApi(getMyRatings, [], { initialData: [] })
  const form = useApi(() => getAssessmentForm(sportId), [sportId], { enabled: Boolean(sportId) })

  const [answers, setAnswers] = useState({})
  const [evidence, setEvidence] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  // Đổi môn: xóa câu trả lời cũ (đặt lại state ngay khi render, không cần effect)
  const [lastSportId, setLastSportId] = useState(sportId)
  if (lastSportId !== sportId) {
    setLastSportId(sportId)
    setAnswers({})
    setEvidence([])
    setResult(null)
  }

  const doneBySport = useMemo(() => Object.fromEntries((mine.data || []).map(a => [String(a.sportCategoryId), a])), [mine.data])
  const eloBySport = useMemo(() => Object.fromEntries((ratings.data || [])
    .filter(r => String(r.ownerType).toUpperCase() !== 'TEAM' && String(r.ratingType).toUpperCase() !== 'TEAM')
    .map(r => [String(r.sportCategoryId), r])), [ratings.data])

  const questions = form.data?.questions || []
  const blockedReason = form.data?.blockedReason || ''
  const current = result || form.data?.current || null
  const unanswered = questions.filter(q => answers[q.code] === undefined || answers[q.code] === '')

  const addEvidence = async files => {
    const list = [...files].slice(0, MAX_EVIDENCE - evidence.length)
    if (!list.length) { toast.error(`Tối đa ${MAX_EVIDENCE} ảnh.`); return }
    setUploading(true)
    try {
      const urls = []
      for (const file of list) urls.push(await uploadImage(file, 'general'))
      setEvidence([...evidence, ...urls.filter(Boolean)])
    } catch (error) {
      toast.error(error?.message || 'Không tải ảnh lên được.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submit = async () => {
    if (saving || blockedReason) return
    if (unanswered.length) { toast.error(`Còn ${unanswered.length} câu chưa trả lời.`); return }
    const general = {}
    const techniques = {}
    for (const q of questions) {
      if (isTechniqueCode(q.code)) techniques[q.code] = Number(answers[q.code])
      else general[q.code] = String(answers[q.code])
    }
    setSaving(true)
    try {
      const { result: saved, message } = await submitAssessment(sportId, { answers: general, techniques, evidenceUrls: evidence })
      setResult(saved)
      toast.success(message || 'Đã ghi nhận khảo sát.')
      mine.refresh()
      ratings.refresh()
      form.refresh()
    } catch (error) {
      toast.error(error?.message || 'Không gửi được khảo sát.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="snx-page snx-page--narrow">
      <header className="snx-page-header">
        <div className="snx-page-header-copy">
          <p className="snx-page-eyebrow">Elo khởi đầu</p>
          <h1 className="snx-page-title">Khảo sát toàn diện theo môn</h1>
          <p className="snx-page-subtitle">
            Mỗi môn làm một lần để có Elo khởi đầu. Cần có Elo môn đó mới tạo / vào đội và đăng ký giải. Làm lại được sau 90 ngày.
          </p>
        </div>
        <div className="snx-page-actions">
          <Link className="snx-btn snx-btn--secondary" to="/onboarding">Sửa khảo sát người chơi</Link>
        </div>
      </header>

      <section className="snx-card" style={{ padding: 16 }}>
        <h2 className="snx-card-title">Chọn môn</h2>
        <div className="snx-row" style={{ gap: 8, marginTop: 10 }}>
          {(sports.data || []).map(s => {
            const elo = eloBySport[s.id]
            const done = doneBySport[s.id]
            return (
              <button key={s.id} type="button" className="snx-chip" aria-pressed={s.id === sportId}
                onClick={() => setParams({ sportId: s.id }, { replace: true })}>
                {s.name}
                {elo ? <span className="snx-muted">· Elo {elo.rating}{elo.rank ? ` (${elo.rank})` : ''}</span> : done ? <span className="snx-muted">· Đã làm</span> : null}
              </button>
            )
          })}
        </div>
      </section>

      {!sportId ? (
        <p className="snx-empty">Chọn một môn để bắt đầu khảo sát.</p>
      ) : form.loading ? (
        <p className="snx-muted">Đang tải câu hỏi…</p>
      ) : form.error ? (
        <div className="snx-alert snx-alert--error">{form.error}</div>
      ) : (
        <>
          {current && <AssessmentResult result={current} />}
          {blockedReason ? (
            <div className="snx-alert snx-alert--info">{blockedReason}</div>
          ) : (
            <>
              {questions.map((q, index) => (
                <section key={q.code} className="snx-card" style={{ padding: 16 }}>
                  <h3 className="snx-card-title" style={{ fontSize: 15 }}>{index + 1}. {q.question}</h3>
                  {q.type === 'SCALE_1_5' ? (
                    <div className="snx-row" style={{ gap: 8, marginTop: 10, alignItems: 'center' }}>
                      <span className="snx-muted">Yếu</span>
                      {(q.options?.length ? q.options : [1, 2, 3, 4, 5].map(v => ({ value: String(v), label: String(v) }))).map(o => (
                        <button key={o.value} type="button" className="snx-chip" aria-pressed={String(answers[q.code]) === String(o.value)}
                          title={o.label} onClick={() => setAnswers({ ...answers, [q.code]: o.value })}>{o.value}</button>
                      ))}
                      <span className="snx-muted">Rất tốt</span>
                    </div>
                  ) : (
                    <div className="snx-stack" style={{ gap: 6, marginTop: 10 }}>
                      {(q.options || []).map(o => (
                        <label key={o.value} className="snx-row" style={{ gap: 8, cursor: 'pointer' }}>
                          <input type="radio" name={q.code} checked={answers[q.code] === o.value} onChange={() => setAnswers({ ...answers, [q.code]: o.value })} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              <section className="snx-card" style={{ padding: 16 }}>
                <h3 className="snx-card-title" style={{ fontSize: 15 }}>Ảnh thành tích (không bắt buộc)</h3>
                <p className="snx-card-subtitle">Huy chương, giấy chứng nhận, kết quả giải… Tối đa {MAX_EVIDENCE} ảnh. Cần có và được duyệt để Elo khởi đầu vượt 1400.</p>
                <div className="snx-thumb-grid" style={{ marginTop: 10 }}>
                  {evidence.map(url => (
                    <div key={url} className="snx-thumb">
                      <img src={url} alt="Bằng chứng thành tích" />
                      <div className="snx-thumb-actions">
                        <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={() => setEvidence(evidence.filter(x => x !== url))}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
                {evidence.length < MAX_EVIDENCE && (
                  <>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => e.target.files?.length && addEvidence(e.target.files)} />
                    <button type="button" className="snx-btn snx-btn--secondary" style={{ marginTop: 10 }} disabled={uploading} onClick={() => fileRef.current?.click()}>
                      <span className="material-symbols-outlined">add_photo_alternate</span>{uploading ? 'Đang tải ảnh…' : 'Thêm ảnh'}
                    </button>
                  </>
                )}
              </section>

              <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
                {state?.from && <button type="button" className="snx-btn snx-btn--secondary" onClick={() => navigate(state.from)}>Quay lại</button>}
                <button type="button" className="snx-btn snx-btn--primary" disabled={saving || uploading || !questions.length} onClick={submit}>
                  {saving ? 'Đang gửi…' : current ? 'Làm lại khảo sát' : 'Gửi khảo sát'}
                </button>
              </div>
            </>
          )}
          {state?.from && blockedReason && (
            <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="snx-btn snx-btn--secondary" onClick={() => navigate(state.from)}>Quay lại</button>
            </div>
          )}
        </>
      )}
      <EloLeaderboard key={sportId || 'all'} initialSportId={sportId} />
    </div>
  )
}
