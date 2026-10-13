const labels = { Confirmed: "Đã xác nhận", Pending: "Đang chờ xử lý", Cancelled: "Đã hủy", Completed: "Đã hoàn thành" }

export default function StatusBadge({ status, label }) {
  return <span className={`admin-status admin-status-${status.toLowerCase()}`}><i />{label || labels[status] || status}</span>
}
