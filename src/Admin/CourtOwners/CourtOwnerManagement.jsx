import { useCallback, useState } from 'react'
import { Download, UserPlus, Search, BellRing, Building2, UserRoundCheck, Users, ClipboardCheck, ArrowRight, X } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'
import { initialOwners, ownerStats, emptyOwnerFilters, filterOwners, ownersCsv } from './courtOwnerData.js'
import CourtOwnerDetails, { VerificationBadge } from './CourtOwnerDetails.jsx'
import { OwnerFormDialog, OwnerReviewDialog, OwnerAccountDialog } from './OwnerDialogs.jsx'
import '../Users/users.css'
import './courtOwners.css'

const statIcons = [Users, UserRoundCheck, ClipboardCheck, Building2]

export default function CourtOwnerManagement() {
  const [owners, setOwners] = useState(initialOwners)
  const [filters, setFilters] = useState(emptyOwnerFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(initialOwners[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const closeDialog = useCallback(() => setDialog(null), [])
  const filtered = filterOwners(owners, filters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const detail = owners.find(owner => owner.id === detailId)
  const selectedOwners = owners.filter(owner => selected.includes(owner.id))
  const allVisibleSelected = visible.length > 0 && visible.every(owner => selected.includes(owner.id))
  const someVisibleSelected = visible.some(owner => selected.includes(owner.id))
  const verificationCandidates = selectedOwners.filter(owner => owner.verification !== 'Verified' && owner.registration && owner.legalName)
  const updateFilter = event => { setFilters({ ...filters, [event.target.name]: event.target.value }); setPage(1) }
  const reset = () => { setFilters(emptyOwnerFilters); setPage(1) }
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const toggleVisible = () => setSelected(previous => allVisibleSelected ? previous.filter(id => !visible.some(owner => owner.id === id)) : [...new Set([...previous, ...visible.map(owner => owner.id)])])
  const reviewPending = () => {
    const pendingFilters = { ...emptyOwnerFilters, verification: 'Pending' }
    const pending = filterOwners(owners, pendingFilters)
    setFilters(pendingFilters); setPage(1); setSelected([]); setDetailId(pending[0]?.id || null)
    if (!pending.length) setNotice('No pending owners remain in this local demo dataset.')
  }
  const exportCsv = records => {
    const url = URL.createObjectURL(new Blob([ownersCsv(records)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'sportnexus-demo-court-owners.csv'
    document.body.appendChild(link); link.click(); link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Exported ${records.length} mock court owners as CSV.`)
  }
  const saveOwner = values => {
    if (dialog.type === 'edit') {
      const original = dialog.owner
      const kycChanged = values.legalName !== (original.legalName || '') || values.registration !== (original.registration || '')
      setOwners(previous => previous.map(owner => owner.id === original.id ? { ...owner, ...values, phone: values.phone || null, registration: values.registration || null, verification: kycChanged ? 'Pending' : owner.verification, trust: kycChanged ? null : owner.trust } : owner))
      setNotice(`Demo owner updated locally.${kycChanged ? ' Changed KYC information requires a new demo review.' : ''} No backend changes.`)
    } else {
      const date = new Date()
      const joined = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const owner = { ...values, id: `DEMO-OWN-${crypto.randomUUID()}`, phone: values.phone || null, registration: values.registration || null, verification: 'Pending', status: 'Active', joined, trust: null, facilities: [], monthlyBookings: 0, monthlyGmv: 0 }
      setOwners(previous => [owner, ...previous]); setDetailId(owner.id); reset()
      setNotice('Court owner added to local prototype state only. No real account created.')
    }
    closeDialog()
  }
  const verifyOwners = ids => {
    setOwners(previous => previous.map(owner => ids.includes(owner.id) ? { ...owner, verification: 'Verified' } : owner))
    setNotice(`Demo verification applied to ${ids.length} owners locally. No KYC approval or facility verification persisted.`)
    closeDialog()
  }
  const confirmAccount = () => {
    const ids = dialog.owners.map(owner => owner.id)
    setOwners(previous => previous.map(owner => ids.includes(owner.id) ? dialog.restore ? { ...owner, status: owner.previousStatus || 'Active', previousStatus: null } : { ...owner, previousStatus: owner.status === 'Suspended' ? owner.previousStatus : owner.status, status: 'Suspended' } : owner))
    setNotice(`Demo ${dialog.restore ? 'reactivation' : 'suspension'} applied locally. Facilities, bookings and wallets are unchanged.`)
    closeDialog()
  }
  return <div className={`owners-page ${detail ? 'with-details' : ''}`}>
    <div className="owners-main-content">
      <header className="owners-page-heading"><div><h1>Court Owner<br />Management <span>1,356 Active</span></h1><p>Manage court owner accounts, KYC verification, and sports facilities across the SportNexus ecosystem.</p></div><div className="owners-heading-actions"><button className="users-button" onClick={() => exportCsv(filtered)}><Download size={15} />Export CSV</button><button className="users-button primary" onClick={() => setDialog({ type: 'add' })}><UserPlus size={16} /><span>Add Court<br />Owner</span></button></div></header>
      <section className="owners-kpis" aria-label="Court owner statistics">{ownerStats.map((stat, index) => { const Icon = statIcons[index]; return <article key={stat.label} className={stat.pending ? 'pending' : ''}><div><small>{stat.label}</small><Icon size={20} /></div><strong>{stat.value}<span>{stat.trend}</span></strong><p>{stat.detail}</p></article> })}</section>
      <div className="owners-demo-label">Interactive demo • KPI snapshot is illustrative • {owners.length} fictional owner records</div>
      <section className="owners-pending-banner"><BellRing size={23} /><div><h2>18 Court Owners awaiting<br />KYC &amp; Facility Verification</h2><p>Demo queue: {owners.filter(owner => owner.verification === 'Pending').length} pending owners in this local dataset.</p></div><span>Cần duyệt gấp</span><button onClick={reviewPending}>Review Pending <ArrowRight size={13} /></button></section>
      <section className="owners-toolbar" aria-label="Court owner filters"><div className="owners-filter-row"><label className="users-search"><Search size={14} /><input name="search" aria-label="Search court owners" placeholder="Search owner, username, email or ID..." value={filters.search} onChange={updateFilter} /></label><select aria-label="Verification status filter" name="verification" value={filters.verification} onChange={updateFilter}><option value="All">Verification: All Status</option>{['Verified', 'Pending', 'Rejected'].map(value => <option key={value}>{value}</option>)}</select><select aria-label="Account status filter" name="status" value={filters.status} onChange={updateFilter}><option value="All">Account: All Status</option>{['Active', 'Inactive', 'Suspended'].map(value => <option key={value}>{value}</option>)}</select><select aria-label="Facility count filter" name="facilities" value={filters.facilities} onChange={updateFilter}><option value="All">Facilities: All Counts</option>{['0', '1', '2', '3+'].map(value => <option key={value} value={value}>{value} facilities</option>)}</select></div><div className="owners-filter-actions"><span>{selected.length} selected</span><button onClick={() => setSelected(filtered.map(owner => owner.id))}>Select all {filtered.length} filtered owners</button><button onClick={reset}>Reset</button><div><button className="users-button" disabled={!verificationCandidates.length} onClick={() => setDialog({ type: 'bulk-verify', owners: verificationCandidates })}>Bulk Verify</button><button className="users-button" disabled={!selected.length} onClick={() => exportCsv(selectedOwners)}>Export Selected</button></div></div></section>
      {notice && <div className="users-notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14} /></button></div>}
      <section className="owners-table-panel" aria-label="Court owners"><div className="owners-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all visible court owners" checked={allVisibleSelected} onChange={toggleVisible} ref={node => { if (node) node.indeterminate = someVisibleSelected && !allVisibleSelected }} /></th><th>Court Owner</th><th>Contact</th><th>Facilities</th><th>Verification</th><th>Account</th></tr></thead><tbody>{visible.map(owner => <tr key={owner.id} className={owner.id === detailId ? 'is-selected' : ''} onClick={() => setDetailId(owner.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${owner.name}`} checked={selected.includes(owner.id)} onChange={() => toggle(owner.id)} /></td><td><button className="owners-table-profile" aria-label={`View details for ${owner.name}`} onClick={event => { event.stopPropagation(); setDetailId(owner.id) }}><UserAvatar user={owner} /><span><strong>{owner.name}{owner.status === 'Active' && <i />}</strong><small>@{owner.username}</small><small>#{owner.id}</small></span></button></td><td><strong className="owners-contact-email">{owner.email}</strong><small>{owner.phone || 'Phone not available'}</small></td><td><span className="owners-facility-count"><Building2 size={11} />{owner.facilities.length}</span></td><td><VerificationBadge status={owner.verification} /></td><td><AccountStatus status={owner.status} /></td></tr>)}</tbody></table></div>{!visible.length && <div className="users-empty"><Building2 size={25} /><h3>No court owners match these filters</h3><p>Try a different search or reset the filters.</p><button className="users-button" onClick={reset}>Reset filters</button></div>}<footer className="owners-pagination"><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} demo owners</span><label>Rows per page<select aria-label="Court owners rows per page" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[5, 10, 15].map(size => <option key={size}>{size}</option>)}</select></label><nav aria-label="Court owner pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} className={number === currentPage ? 'current' : ''} aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></nav></footer></section>
    </div>
    {detail && <CourtOwnerDetails owner={detail} onClose={() => setDetailId(null)} onEdit={() => setDialog({ type: 'edit', owner: detail })} onReview={() => setDialog({ type: 'review', owner: detail })} onSuspend={() => setDialog({ type: 'account', owners: [detail], restore: detail.status === 'Suspended' })} onFacility={facility => setNotice(`${facility.name}: Admin Facilities is coming soon. No facility changes performed.`)} />}
    {dialog && (dialog.type === 'add' || dialog.type === 'edit' ? <OwnerFormDialog key={dialog.owner?.id || 'add'} owner={dialog.owner} owners={owners} onClose={closeDialog} onSave={saveOwner} /> : dialog.type === 'review' ? <OwnerReviewDialog owner={dialog.owner} onClose={closeDialog} onConfirm={() => verifyOwners([dialog.owner.id])} /> : dialog.type === 'account' ? <OwnerAccountDialog owners={dialog.owners} restore={dialog.restore} onClose={closeDialog} onConfirm={confirmAccount} /> : <DemoDialog title="Bulk KYC Review — Demo" onClose={closeDialog}><p className="users-demo-note">Only selected, unverified owners with a fictional business name and registration reference are included. This updates local verification status only, not facilities or backend data.</p><ul className="owners-bulk-list">{dialog.owners.map(owner => <li key={owner.id}><strong>{owner.name}</strong><span>{owner.legalName} • {owner.registration}</span></li>)}</ul><footer><button className="users-button" onClick={closeDialog}>Cancel</button><button className="users-button primary" onClick={() => verifyOwners(dialog.owners.map(owner => owner.id))}>Confirm demo bulk verification</button></footer></DemoDialog>)}
  </div>
}
