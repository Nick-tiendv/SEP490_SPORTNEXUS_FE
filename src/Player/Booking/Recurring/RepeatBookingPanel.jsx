import { REPEAT_WEEK_OPTIONS, WEEKDAYS, formatRepeatDate } from './recurringBooking.js'
import './repeatBooking.css'

const STATUS_TEXT = { ok: 'Còn trống', taken: 'Đã có người đặt', missing: 'Chưa mở ca giờ này' }

// Ô "Lặp lại vào giờ này mỗi tuần": chọn thứ + số tuần, liệt kê từng buổi và trạng thái.
// repeat = kết quả useRepeatBooking. disabledReason: lý do không cho lặp (vd chọn nhiều sân).
export default function RepeatBookingPanel({ repeat, disabledReason = '' }) {
  return (
    <div className="snx-repeat">
      <label className="snx-repeat-toggle">
        <input type="checkbox" checked={repeat.enabled} onChange={(e) => repeat.setEnabled(e.target.checked)} />
        <span className="material-symbols-outlined">event_repeat</span>
        Lặp lại vào giờ này mỗi tuần
      </label>
      {repeat.enabled && (disabledReason || !repeat.baseDate ? (
        <p className="snx-repeat-warn">{disabledReason || 'Chỉ lặp lại được khi các ca đã chọn cùng một ngày. Vui lòng bỏ bớt ca ở ngày khác.'}</p>
      ) : (
        <>
          <div className="snx-repeat-days" role="group" aria-label="Lặp lại vào các thứ">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                aria-pressed={repeat.weekdays.includes(day.value)}
                className={repeat.weekdays.includes(day.value) ? 'is-active' : ''}
                onClick={() => repeat.toggleWeekday(day.value)}
              >
                {day.short}
              </button>
            ))}
          </div>
          <label className="snx-repeat-weeks">
            Trong
            <select value={repeat.weeks} onChange={(e) => repeat.setWeeks(Number(e.target.value))}>
              {REPEAT_WEEK_OPTIONS.map((n) => <option key={n} value={n}>{n} tuần</option>)}
            </select>
            tính từ {formatRepeatDate(repeat.baseDate)}
          </label>
          {repeat.loading ? (
            <p className="snx-repeat-muted">Đang kiểm tra lịch các tuần tiếp theo…</p>
          ) : repeat.error ? (
            <p className="snx-repeat-error" role="alert">{repeat.error}</p>
          ) : repeat.items.length === 0 ? (
            <p className="snx-repeat-muted">Không có ngày lặp lại nào. Hãy chọn thêm thứ hoặc tăng số tuần.</p>
          ) : (
            <ul className="snx-repeat-list">
              {repeat.items.map((item) => (
                <li key={`${item.date}-${item.courtId}-${item.start}`}>
                  <span>{formatRepeatDate(item.date)} · {item.courtName} {item.start} - {item.end}</span>
                  <strong className={item.status === 'ok' ? 'is-ok' : 'is-bad'}>{STATUS_TEXT[item.status]}</strong>
                </li>
              ))}
            </ul>
          )}
          {repeat.problems.length > 0 && (
            <p className="snx-repeat-error">{repeat.problems.length} buổi không đặt được. Hãy đổi giờ hoặc bỏ bớt thứ / số tuần để tiếp tục.</p>
          )}
          <p className="snx-repeat-warn">Đơn đặt định kỳ không thể hủy sau khi đặt.</p>
        </>
      ))}
    </div>
  )
}
