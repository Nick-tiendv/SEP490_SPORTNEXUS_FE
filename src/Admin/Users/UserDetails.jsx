import { X, UserRound, Activity, Wallet, History, TriangleAlert, Pencil, Ban, Check } from 'lucide-react'

const money = value => value == null ? 'Not available' : `${value.toLocaleString('vi-VN')} đ`

export function UserAvatar({ user }) {
  return <span className="users-avatar" aria-hidden="true">{user.name.split(' ').filter(Boolean).slice(-2).map(word => word[0]).join('')}</span>
}

export function AccountStatus({ status }) {
  return <span className={`users-status ${status.toLowerCase()}`}><i />{status}</span>
}

export default function UserDetails({ user, onClose, onEdit, onSuspend }) {
  return (
    <aside className="users-details" aria-label={`User details for ${user.name}`}>
      <header className="users-details-heading"><h2>User Details <small>{user.id}</small></h2><button onClick={onClose} aria-label="Close user details"><X size={18} /></button></header>
      <div className="users-details-body">
        <section className="users-profile">
          <div className="users-profile-main"><UserAvatar user={user} /><div><h3>{user.name}</h3><p>@{user.username} • {user.role}</p><small>{user.phone || 'Phone not available'}</small><small>{user.email}</small></div><AccountStatus status={user.status} /></div>
          <div className="users-profile-dates"><div><small>Member Since</small><strong>{user.joined}</strong></div><div><small>Last Active</small><strong>{user.lastActive || 'Not available'}</strong></div></div>
        </section>
        <section><h3 className="users-section-title"><UserRound size={15} />Sport &amp; Skill Profile</h3><div className="users-skill-grid">
          <div><small>DUPR Rating</small><strong className="users-rating">{user.dupr || '—'}</strong><p>{user.dupr ? 'Pickleball • Demo rating' : 'Not available'}</p></div>
          <div><small>Elo Rating</small><strong>{user.elo?.toLocaleString() || '—'}</strong><p>{user.elo ? 'Local prototype data' : 'Not available'}</p></div>
          <div><small>Fair-play Score</small><strong className="users-rating">{user.fairplay == null ? '—' : `${user.fairplay}%`}</strong><p>{user.fairplay == null ? 'Not available' : 'Demo sportsmanship score'}</p></div>
          <div><small>Favorite Sports</small><strong className="users-sport-name">{user.sport || 'Not available'}</strong><p>Local profile information</p></div>
        </div></section>
        <section><h3 className="users-section-title"><Activity size={15} />Platform Activity Summary</h3><div className="users-activity-stats">{[['Bookings', user.bookings], ['LFG Match', user.lfg], ['Tournaments', user.tournaments], ['Reviews', user.reviews]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong><small>demo total</small></div>)}</div></section>
        <section className="users-wallet"><h3 className="users-section-title"><Wallet size={15} />SportNexus Wallet <small>Demo balance</small></h3><div><span><small>Escrow / Số dư ký quỹ</small><strong>{money(user.wallet)}</strong></span><span><small>Total Spent</small><strong>{money(user.totalSpent)}</strong></span></div><p>Read-only mock wallet. No wallet operations.</p></section>
        <section><h3 className="users-section-title"><History size={15} />Recent Activity Timeline</h3>{user.activities.length ? <ol className="users-timeline">{user.activities.map(item => <li key={item.title}><i /><strong>{item.title}</strong><p>{item.text}</p><small>{item.time}</small></li>)}</ol> : <p className="users-unavailable">No activity records available in this prototype.</p>}</section>
        <section className="users-governance"><h3><TriangleAlert size={15} />Account Governance</h3><p>{user.status === 'Suspended' ? 'This demo account is suspended. Restore access with the action below.' : `Account has ${user.disputes} mock disputes${user.fairplay == null ? '' : ` and ${user.fairplay}% fair-play`}.`} Suspension changes local state only. No wallet or reservation changes are performed.</p></section>
      </div>
      <footer className="users-details-actions"><button className={user.status === 'Suspended' ? 'users-button' : 'users-button users-danger'} onClick={onSuspend}>{user.status === 'Suspended' ? <Check size={15} /> : <Ban size={15} />}{user.status === 'Suspended' ? 'Restore User' : 'Suspend'}</button><button className="users-button" onClick={onEdit}><Pencil size={15} />Edit User</button></footer>
    </aside>
  )
}
