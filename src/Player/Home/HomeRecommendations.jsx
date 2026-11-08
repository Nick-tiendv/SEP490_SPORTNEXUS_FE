import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { getRecommendedCourts, getRecommendedLfgs, getRecommendedTournaments } from '../../api/player/recommendationApi.js'
import { buildPaymentState, vnClock, vnDayLabel } from '../Booking/AIChat/aiRealBooking.js'
import { RecommendedLfgCard } from '../LFG/RecommendedLfg.jsx'

// Gợi ý trên trang chủ theo khảo sát người chơi: kèo phù hợp, sân có ca trống trong giờ rảnh, giải hợp Elo.
// Mỗi khối tự ẩn khi lỗi / không có dữ liệu để không làm vỡ trang chủ.
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`
const TIER = { AMATEUR: 'Phong trào', SEMI_PRO: 'Bán chuyên', PRO: 'Chuyên nghiệp' }

function Block({ title, icon, link, linkLabel, children }) {
  return (
    <section className="snx-card" style={{ padding: 18, marginBottom: 20 }}>
      <div className="snx-row" style={{ marginBottom: 10 }}>
        <h2 className="snx-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
          <span className="material-symbols-outlined" style={{ color: '#15803d' }}>{icon}</span>{title}
        </h2>
        <span className="snx-spacer" />
        {link && <Link className="snx-btn snx-btn--ghost snx-btn--sm" to={link}>{linkLabel}</Link>}
      </div>
      {children}
    </section>
  )
}

export default function HomeRecommendations() {
  const navigate = useNavigate()
  const lfgs = useApi(getRecommendedLfgs, [], { initialData: [] })
  const courts = useApi(() => getRecommendedCourts(6), [], { initialData: [] })
  const tournaments = useApi(() => getRecommendedTournaments(4), [], { initialData: [] })
  const lfgItems = (lfgs.error ? [] : lfgs.data || []).slice(0, 3)
  const courtItems = courts.error ? [] : courts.data || []
  const tournamentItems = tournaments.error ? [] : tournaments.data || []

  return (
    <>
      {lfgItems.length > 0 && (
        <Block title="Kèo phù hợp với bạn" icon="auto_awesome" link="/recommended-lfg" linkLabel="Xem tất cả">
          <div className="snx-grid snx-grid--3">{lfgItems.map((item) => <RecommendedLfgCard key={item.card?.id} item={item} compact />)}</div>
        </Block>
      )}
      {courtItems.length > 0 && (
        <Block title="Sân trống trong giờ rảnh của bạn" icon="event_available" link="/court-finder" linkLabel="Tìm sân khác">
          <div className="snx-list">
            {courtItems.map((c) => (
              <div key={c.courtSlotId} className="snx-list-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{c.facilityName}</strong>
                  <div className="snx-muted">
                    {[c.sportName, c.courtName, `${vnClock(c.startTime)} – ${vnClock(c.endTime)} ${vnDayLabel(c.startTime)}`, c.distanceKm != null && `${Number(c.distanceKm).toFixed(1)} km`].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <strong style={{ fontSize: 14 }}>{money(c.price)}</strong>
                <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => navigate('/split-payment', { state: buildPaymentState(c, c) })}>Đặt ca</button>
              </div>
            ))}
          </div>
        </Block>
      )}
      {tournamentItems.length > 0 && (
        <Block title="Giải đấu hợp với bạn" icon="emoji_events" link="/tournament" linkLabel="Xem giải">
          <div className="snx-list">
            {tournamentItems.map((t) => (
              <div key={t.tournamentId} className="snx-list-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{t.name}</strong>
                  <div className="snx-muted">
                    {[t.sportName, t.facilityName, TIER[t.tier] || t.tier, t.registrationDeadline && `Hạn đăng ký ${new Date(t.registrationDeadline).toLocaleDateString('vi-VN')}`].filter(Boolean).join(' · ')}
                  </div>
                  {t.reason && <div style={{ fontSize: 12.5, color: '#15803d', marginTop: 2 }}>{t.reason}</div>}
                </div>
                <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => navigate(`/tournament?tournamentId=${encodeURIComponent(t.tournamentId)}`)}>Xem giải</button>
              </div>
            ))}
          </div>
        </Block>
      )}
    </>
  )
}
