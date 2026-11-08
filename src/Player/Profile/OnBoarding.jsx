import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getPublicSports as getSportCategories } from '../../api/auth/authApi.js'
import {
  DAYS, FREQUENCIES, GENDERS, GOALS, SKILL_LEVELS,
  formatOptionsFor, getOnboarding, saveOnboarding,
} from '../../api/player/ratingApi.js'
import { setNeedsOnboarding } from '../../utils/surveyGate.js'

// Khảo sát người chơi (PUT /api/auth/me/onboarding, thay toàn bộ).
// Bắt buộc ít nhất 1 môn (tối đa 10) và 1 khung giờ rảnh (tối đa 28). Làm ở lần đăng nhập đầu, sửa lại được.
const MAX_SPORTS = 10
const MAX_SLOTS = 28
const QUICK_SLOTS = [
  ['Tối ngày thường', [1, 2, 3, 4, 5], '18:00', '21:00'],
  ['Sáng cuối tuần', [6, 0], '06:00', '10:00'],
  ['Chiều cuối tuần', [6, 0], '15:00', '18:00'],
]
const hhmm = value => String(value || '').slice(0, 5)

function ChoiceRow({ options, value, onChange, allowEmpty = false }) {
  return (
    <div className="snx-row" style={{ gap: 8 }}>
      {options.map(([key, label]) => (
        <button key={key} type="button" className="snx-chip" aria-pressed={value === key}
          onClick={() => onChange(allowEmpty && value === key ? null : key)}>{label}</button>
      ))}
    </div>
  )
}

function Section({ step, title, hint, children }) {
  return (
    <section className="snx-card" style={{ padding: 20 }}>
      <h2 className="snx-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="snx-badge snx-badge--green">{step}</span>{title}
      </h2>
      {hint && <p className="snx-card-subtitle">{hint}</p>}
      <div className="snx-stack" style={{ marginTop: 12 }}>{children}</div>
    </section>
  )
}

export default function OnBoarding() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)

  const [gender, setGender] = useState(null)
  const [sports, setSports] = useState([]) // [{ sportCategoryId, skillLevel, preferredFormats[] }]
  const [slots, setSlots] = useState([]) // [{ dayOfWeek, startTime, endTime }]
  const [slotDraft, setSlotDraft] = useState({ dayOfWeek: 6, startTime: '07:00', endTime: '09:00' })
  const [location, setLocation] = useState(null) // { latitude, longitude }
  const [radiusKm, setRadiusKm] = useState(5)
  const [maxPrice, setMaxPrice] = useState('')
  const [goal, setGoal] = useState(null)
  const [frequency, setFrequency] = useState(null)

  // Tải danh mục môn và khảo sát đã lưu (nếu có)
  useEffect(() => {
    let cancelled = false
    Promise.all([getSportCategories(), getOnboarding().catch(() => null)])
      .then(([cats, saved]) => {
        if (cancelled) return
        setCategories(cats)
        if (!saved) return
        setCompleted(saved.isCompleted === true)
        setGender(saved.gender || null)
        setSports((saved.sports || []).map(s => ({
          sportCategoryId: String(s.sportCategoryId),
          skillLevel: s.skillLevel || 'BEGINNER',
          preferredFormats: s.preferredFormats || [],
        })))
        setSlots((saved.availability || []).map(a => ({ dayOfWeek: Number(a.dayOfWeek), startTime: hhmm(a.startTime), endTime: hhmm(a.endTime) })))
        if (saved.latitude != null && saved.longitude != null) setLocation({ latitude: saved.latitude, longitude: saved.longitude })
        if (saved.radiusKm) setRadiusKm(saved.radiusKm)
        if (saved.maxPricePerHour != null) setMaxPrice(String(saved.maxPricePerHour))
        setGoal(saved.goal || null)
        setFrequency(saved.frequency || null)
      })
      .catch(error => toast.error(error?.message || 'Không tải được danh mục môn thể thao.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const nameOf = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.name])), [categories])
  const sportEntry = id => sports.find(s => s.sportCategoryId === id)

  const toggleSport = id => {
    if (sportEntry(id)) setSports(sports.filter(s => s.sportCategoryId !== id))
    else if (sports.length >= MAX_SPORTS) toast.error(`Tối đa ${MAX_SPORTS} môn.`)
    else setSports([...sports, { sportCategoryId: id, skillLevel: 'BEGINNER', preferredFormats: [] }])
  }
  const patchSport = (id, patch) => setSports(sports.map(s => (s.sportCategoryId === id ? { ...s, ...patch } : s)))
  const toggleFormat = (id, format) => {
    const current = sportEntry(id)?.preferredFormats || []
    patchSport(id, { preferredFormats: current.includes(format) ? current.filter(f => f !== format) : [...current, format] })
  }

  const slotKey = s => `${s.dayOfWeek}-${s.startTime}-${s.endTime}`
  const addSlots = list => {
    const existing = new Set(slots.map(slotKey))
    const fresh = list.filter(s => !existing.has(slotKey(s)))
    if (slots.length + fresh.length > MAX_SLOTS) { toast.error(`Tối đa ${MAX_SLOTS} khung giờ.`); return }
    setSlots([...slots, ...fresh].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)))
  }
  const addDraftSlot = () => {
    if (!slotDraft.startTime || !slotDraft.endTime || slotDraft.endTime <= slotDraft.startTime) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu.')
      return
    }
    addSlots([{ ...slotDraft }])
  }

  const locate = () => {
    if (!navigator.geolocation) { toast.error('Trình duyệt không hỗ trợ định vị.'); return }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ latitude: Number(pos.coords.latitude.toFixed(6)), longitude: Number(pos.coords.longitude.toFixed(6)) }),
      () => toast.error('Không lấy được vị trí. Vui lòng cho phép truy cập vị trí.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const submit = async () => {
    if (saving) return
    if (sports.length === 0) { toast.error('Vui lòng chọn ít nhất 1 môn hay chơi.'); return }
    if (slots.length === 0) { toast.error('Vui lòng thêm ít nhất 1 khung giờ rảnh.'); return }
    const price = maxPrice === '' ? null : Number(maxPrice)
    if (price != null && (!Number.isFinite(price) || price < 0)) { toast.error('Mức giá sân không hợp lệ.'); return }
    setSaving(true)
    try {
      await saveOnboarding({
        gender: gender || null,
        sports: sports.map(s => ({ ...s, preferredFormats: s.preferredFormats.length ? s.preferredFormats : null })),
        availability: slots,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        radiusKm: location ? Number(radiusKm) : null,
        maxPricePerHour: price,
        goal: goal || null,
        frequency: frequency || null,
      })
      setNeedsOnboarding(false)
      try {
        localStorage.setItem('player_sports_data', JSON.stringify(sports.map(s => ({ ...s, id: s.sportCategoryId, name: nameOf[s.sportCategoryId] || '', sportName: nameOf[s.sportCategoryId] || '', level: s.skillLevel }))))
      } catch { /* bỏ qua */ }
      toast.success('Đã lưu khảo sát người chơi. Hãy làm khảo sát toàn diện từng môn để nhận Elo khởi đầu.')
      navigate(state?.from && state.from !== '/onboarding' ? state.from : '/assessment', { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Không lưu được khảo sát. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="snx-calm-bg" style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <div className="snx-stack" style={{ maxWidth: 860, margin: '0 auto', gap: 16 }}>
        <header>
          <p className="snx-page-eyebrow">Khảo sát người chơi</p>
          <h1 className="snx-page-title">{completed ? 'Cập nhật thông tin chơi thể thao' : 'Chào mừng đến SportNexus!'}</h1>
          <p className="snx-page-subtitle">
            Cho chúng tôi biết bạn chơi môn gì, trình độ và lúc nào rảnh để gợi ý kèo, sân và giải phù hợp.
            {!completed && ' Bạn cần hoàn thành khảo sát này trước khi mở / nhận kèo hoặc đăng ký giải.'}
          </p>
        </header>

        {loading ? <p className="snx-muted">Đang tải…</p> : (
          <>
            <Section step="1" title="Môn hay chơi và trình độ" hint={`Chọn 1 – ${MAX_SPORTS} môn. Trình độ tự đánh giá; Elo chính thức có sau khảo sát toàn diện từng môn.`}>
              <div className="snx-row" style={{ gap: 8 }}>
                {categories.map(c => (
                  <button key={c.id} type="button" className="snx-chip" aria-pressed={Boolean(sportEntry(c.id))} onClick={() => toggleSport(c.id)}>{c.name}</button>
                ))}
              </div>
              {sports.map(s => (
                <div key={s.sportCategoryId} className="snx-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <strong>{nameOf[s.sportCategoryId] || 'Môn thể thao'}</strong>
                  <div className="snx-muted">Trình độ</div>
                  <ChoiceRow options={SKILL_LEVELS} value={s.skillLevel} onChange={v => patchSport(s.sportCategoryId, { skillLevel: v })} />
                  <div className="snx-muted">Nội dung hay chơi (không bắt buộc)</div>
                  <div className="snx-row" style={{ gap: 8 }}>
                    {formatOptionsFor(nameOf[s.sportCategoryId]).map(([value, label]) => (
                      <button key={value} type="button" className="snx-chip" aria-pressed={s.preferredFormats.includes(value)} onClick={() => toggleFormat(s.sportCategoryId, value)}>{label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </Section>

            <Section step="2" title="Khung giờ rảnh trong tuần" hint={`Thêm 1 – ${MAX_SLOTS} khung giờ (giờ Việt Nam).`}>
              <div className="snx-row" style={{ gap: 8 }}>
                {QUICK_SLOTS.map(([label, days, startTime, endTime]) => (
                  <button key={label} type="button" className="snx-btn snx-btn--secondary snx-btn--sm"
                    onClick={() => addSlots(days.map(dayOfWeek => ({ dayOfWeek, startTime, endTime })))}>
                    <span className="material-symbols-outlined">add</span>{label}
                  </button>
                ))}
              </div>
              <div className="snx-row" style={{ gap: 8, alignItems: 'flex-end' }}>
                <label className="snx-field">Thứ
                  <select className="snx-select" value={slotDraft.dayOfWeek} onChange={e => setSlotDraft({ ...slotDraft, dayOfWeek: Number(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6, 0].map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
                  </select>
                </label>
                <label className="snx-field">Từ<input type="time" className="snx-input" value={slotDraft.startTime} onChange={e => setSlotDraft({ ...slotDraft, startTime: e.target.value })} /></label>
                <label className="snx-field">Đến<input type="time" className="snx-input" value={slotDraft.endTime} onChange={e => setSlotDraft({ ...slotDraft, endTime: e.target.value })} /></label>
                <button type="button" className="snx-btn snx-btn--primary" onClick={addDraftSlot}>Thêm</button>
              </div>
              {slots.length > 0 ? (
                <div className="snx-row" style={{ gap: 8 }}>
                  {slots.map(s => (
                    <span key={slotKey(s)} className="snx-chip" aria-pressed="true">
                      {DAYS[s.dayOfWeek]} {s.startTime}–{s.endTime}
                      <button type="button" aria-label="Xóa khung giờ" onClick={() => setSlots(slots.filter(x => slotKey(x) !== slotKey(s)))}
                        style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                      </button>
                    </span>
                  ))}
                </div>
              ) : <p className="snx-muted">Chưa có khung giờ nào.</p>}
            </Section>

            <Section step="3" title="Khu vực và mức giá" hint="Không bắt buộc. Dùng để gợi ý sân và kèo gần bạn.">
              <div className="snx-row" style={{ gap: 8 }}>
                <button type="button" className="snx-btn snx-btn--secondary" onClick={locate}>
                  <span className="material-symbols-outlined">my_location</span>{location ? 'Lấy lại vị trí hiện tại' : 'Dùng vị trí hiện tại'}
                </button>
                {location && (
                  <>
                    <span className="snx-muted">{location.latitude}, {location.longitude}</span>
                    <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setLocation(null)}>Bỏ vị trí</button>
                  </>
                )}
              </div>
              {location && (
                <label className="snx-field">Sẵn sàng đi tối đa: {radiusKm} km
                  <input type="range" min="1" max="50" value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))} />
                </label>
              )}
              <label className="snx-field">Giá sân chấp nhận được (đ / giờ)
                <input type="number" min="0" step="10000" className="snx-input" placeholder="VD: 150000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </label>
            </Section>

            <Section step="4" title="Bạn chơi để làm gì?" hint="Không bắt buộc.">
              <div className="snx-muted">Giới tính</div>
              <ChoiceRow options={GENDERS} value={gender} onChange={setGender} allowEmpty />
              <div className="snx-muted">Mục tiêu</div>
              <ChoiceRow options={GOALS} value={goal} onChange={setGoal} allowEmpty />
              <div className="snx-muted">Tần suất chơi</div>
              <ChoiceRow options={FREQUENCIES} value={frequency} onChange={setFrequency} allowEmpty />
            </Section>

            <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
              {completed && <button type="button" className="snx-btn snx-btn--secondary" onClick={() => navigate(-1)}>Hủy</button>}
              <button type="button" className="snx-btn snx-btn--primary" onClick={submit} disabled={saving}>
                {saving ? 'Đang lưu…' : 'Lưu khảo sát'}<span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
