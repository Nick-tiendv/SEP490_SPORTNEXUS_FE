const labels = { Confirmed: 'Confirmed', Pending: 'Pending', Cancelled: 'Cancelled', Completed: 'Completed' }

export default function StatusBadge({ status }) {
  return <span className={`admin-status admin-status-${status.toLowerCase()}`}><i />{labels[status] || status}</span>
}
