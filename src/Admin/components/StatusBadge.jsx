const labels = { Confirmed: 'Confirmed', Pending: 'Pending', Cancelled: 'Cancelled', Completed: 'Completed' }

export default function StatusBadge({ status, label }) {
  return <span className={`admin-status admin-status-${status.toLowerCase()}`}><i />{label || labels[status] || status}</span>
}
