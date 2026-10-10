import { X, Building2, ShieldCheck, ExternalLink, Pencil, Ban, Check } from 'lucide-react'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'

export function VerificationBadge({ status }) {
  return <span className={`owners-verification ${status.toLowerCase()}`}>{status === 'Verified' && <ShieldCheck size={11} />}{status}</span>
}

export default function CourtOwnerDetails({ owner, onClose, onEdit, onReview, onSuspend, onFacility }) {
  const courts = owner.facilities.reduce((sum, facility) => sum + facility.courts, 0)
  return <aside className="owners-details" aria-label={`Court owner details for ${owner.name}`}>
    <header className="owners-details-heading"><h2><Building2 size={17} />Court Owner Details <small>#{owner.id}</small></h2><button onClick={onClose} aria-label="Close court owner details"><X size={16} /></button></header>
    <div className="owners-details-body">
      <section className="owners-profile"><UserAvatar user={owner} /><div><h3>{owner.name} <span className="owners-pro-badge">Court Owner</span></h3><p>@{owner.username} • ID #{owner.id}</p><div className="owners-profile-status"><VerificationBadge status={owner.verification} /><AccountStatus status={owner.status} /></div><small>Tham gia từ {owner.joined}</small><small>{owner.email}</small><small>{owner.phone || 'Phone not available'}</small></div></section>
      <section className="owners-kyc"><dl><div><dt>Đơn vị pháp nhân</dt><dd>{owner.legalName || 'Not available'}</dd></div><div><dt>Mã số thuế / GPKD</dt><dd>{owner.registration || 'Not available'}</dd></div><div><dt>Verification</dt><dd><VerificationBadge status={owner.verification} /></dd></div><div><dt>Escrow Trust Score</dt><dd className="owners-trust">{owner.trust == null ? 'Not assessed' : `${owner.trust}% (Demo score)`}</dd></div></dl><small>Fictional KYC information • Not a real registration document</small></section>
      <section><h3 className="owners-section-label">Business Performance</h3><div className="owners-performance">{[['Cơ sở (Facilities)', owner.facilities.length], ['Tổng số sân (Courts)', courts], ['Bookings (Tháng này)', owner.monthlyBookings.toLocaleString()], ['Monthly GMV', `${(owner.monthlyGmv / 1000000).toLocaleString()}M đ`]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div></section>
      <section><div className="owners-facilities-heading"><h3 className="owners-section-label">Cơ sở trực thuộc ({owner.facilities.length})</h3><small>Demo facilities</small></div><div className="owners-facilities">{owner.facilities.map(facility => <article key={facility.id}><div><h4>{facility.name}</h4><AccountStatus status={facility.status} /></div><p>{facility.location} • {facility.courts} Courts ({facility.sports})</p><footer><span>{facility.rating ? `★ ${facility.rating}` : 'Rating not available'}</span><button onClick={() => onFacility(facility)}>View Facility <ExternalLink size={11} /></button></footer></article>)}{!owner.facilities.length && <p className="owners-empty-facilities">No associated facilities in this prototype.</p>}</div></section>
    </div>
    <footer className="owners-details-actions"><button className={`users-button ${owner.status === 'Suspended' ? '' : 'users-danger'}`} onClick={onSuspend}>{owner.status === 'Suspended' ? <Check size={13} /> : <Ban size={13} />}{owner.status === 'Suspended' ? 'Reactivate' : 'Suspend Owner'}</button><button className="users-button" onClick={onEdit}><Pencil size={13} />Edit Owner</button><button className="users-button primary" onClick={onReview}><ShieldCheck size={13} />{owner.verification === 'Verified' ? 'Review KYC' : 'Verify / Review'}</button></footer>
  </aside>
}
