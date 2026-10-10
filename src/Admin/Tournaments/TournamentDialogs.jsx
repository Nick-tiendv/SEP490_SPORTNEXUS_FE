import { useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { sportLabels, formatLabels, parseDate, date, facilities } from './tournamentData.js'

export function TournamentForm({ tournament, tournaments, onClose, onSave }) {
  const [values, setValues] = useState({ name: tournament?.name || '', sport: tournament?.sport || 'Badminton', facility: tournament?.facility || facilities[0], organizer: tournament?.organizer || 'Ban tổ chức SportNexus (minh họa)', starts: tournament ? date(tournament.starts) : '', ends: tournament ? date(tournament.ends) : '', deadline: tournament ? date(tournament.deadline) : '', capacity: String(tournament?.capacity || 32), entryFee: String(tournament?.entryFee ?? 150000), prize: String(tournament?.prize ?? 15000000), format: tournament?.format || 'Knockout' })
  const [error, setError] = useState('')
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 3 || clean.organizer.length < 3) return setError('Tên giải và ban tổ chức phải có ít nhất 3 ký tự.')
    if (tournaments.some(item => item.id !== tournament?.id && item.name.toLocaleLowerCase('vi') === clean.name.toLocaleLowerCase('vi'))) return setError('Tên giải đã có trong dữ liệu minh họa.')
    const starts = parseDate(clean.starts), ends = parseDate(clean.ends), deadline = parseDate(clean.deadline)
    if (!starts || !ends || !deadline) return setError('Nhập ngày hợp lệ theo định dạng ngày/tháng/năm.')
    if (ends < starts || deadline > starts) return setError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu; hạn đăng ký không được sau ngày bắt đầu.')
    const capacity = Number(clean.capacity), entryFee = Number(clean.entryFee), prize = Number(clean.prize)
    const max = clean.format === 'RoundRobin' ? 16 : 64
    if (!Number.isInteger(capacity) || capacity < 2 || capacity > max || capacity < (tournament?.participants.length || 0)) return setError(`Sức chứa phải từ 2 đến ${max} và không ít hơn số người đã đăng ký.`)
    if (!clean.entryFee || !clean.prize || !Number.isSafeInteger(entryFee) || !Number.isSafeInteger(prize) || entryFee < 0 || prize < 0 || entryFee > 1000000000 || prize > 1000000000) return setError('Phí tham gia và giải thưởng phải là số nguyên từ 0 đến 1.000.000.000 đ.')
    onSave({ ...clean, starts, ends, deadline, capacity, entryFee, prize })
  }
  return <DemoDialog title={tournament ? 'Chỉnh sửa giải đấu — Bản mẫu' : 'Tạo giải đấu — Bản mẫu'} closeLabel="Đóng hộp thoại" onClose={onClose}><p className="users-demo-note">Chỉ lưu trong phiên hiện tại. Giải mới chưa có người đăng ký. Bản mẫu hỗ trợ thi đấu đơn; đổi thể thức sẽ xóa nhánh đấu và bốc thăm cũ.</p><form className="users-form" noValidate onSubmit={submit}>
    {[['name', 'Tên giải đấu'], ['organizer', 'Ban tổ chức']].map(([name, label]) => <label key={name}>{label}<input name={name} value={values[name]} onChange={change} maxLength={120} required /></label>)}
    <label>Môn thể thao<select name="sport" value={values.sport} onChange={change}>{Object.entries(sportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>Cơ sở<select name="facility" value={values.facility} onChange={change}>{facilities.map(facility => <option key={facility}>{facility}</option>)}</select></label>
    {[['starts', 'Ngày bắt đầu'], ['ends', 'Ngày kết thúc'], ['deadline', 'Hạn đăng ký']].map(([name, label]) => <label key={name}>{label}<input name={name} placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} value={values[name]} onChange={change} required /></label>)}
    <label>Thể thức<select name="format" value={values.format} onChange={change}>{Object.entries(formatLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {[['capacity', 'Sức chứa'], ['entryFee', 'Phí tham gia (đ)'], ['prize', 'Giải thưởng (đ)']].map(([name, label]) => <label key={name}>{label}<input name={name} type="number" value={values[name]} onChange={change} min={name === 'capacity' ? 2 : 0} step="1" required /></label>)}
    {error && <p className="users-form-error" role="alert">{error}</p>}<footer><button type="button" className="users-button" onClick={onClose}>Hủy</button><button className="users-button primary">{tournament ? 'Lưu thay đổi minh họa' : 'Tạo giải minh họa'}</button></footer>
  </form></DemoDialog>
}

export function TournamentActionDialog({ type, tournament, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const cancel = type === 'cancel', pair = type === 'pair'
  return <DemoDialog title={cancel ? 'Xác nhận hủy giải — Bản mẫu' : pair ? 'Bốc thăm ngẫu nhiên — Bản mẫu' : 'Tạo nhánh đấu — Bản mẫu'} closeLabel="Đóng hộp thoại" onClose={onClose}><p className="users-demo-note">Chỉ cập nhật dữ liệu trong phiên hiện tại. Không tác động đến giải thật, đăng ký, thanh toán hoặc hoàn tiền.</p><p>#{tournament.id} · {tournament.name}</p>{!cancel && <p className="tournaments-dialog-explanation">{pair ? 'Bốc thăm xáo trộn thứ tự người chơi; không thay đổi hạt giống. Nếu đã có nhánh đấu, xác nhận sẽ thay nhánh đấu để khớp với bốc thăm mới và xóa kết quả mẫu cũ.' : tournament.bracket ? 'Đã có nhánh đấu. Xác nhận tạo lại sẽ thay nhánh đấu và xóa các kết quả mẫu cũ; giữ nguyên thứ tự bốc thăm hiện tại.' : 'Tạo nhánh đấu theo thứ tự bốc thăm đã xác nhận, hoặc hạt giống nếu chưa bốc thăm. Kết quả tạo là xác định cho cùng thứ tự người chơi.'}</p>}{cancel && <label className="tournaments-reason">Lý do hủy minh họa<input value={reason} onChange={event => setReason(event.target.value)} maxLength={200} /></label>}{error && <p className="users-form-error" role="alert">{error}</p>}<footer><button className="users-button" onClick={onClose}>Giữ nguyên</button><button className={`users-button ${cancel ? 'users-danger' : 'primary'}`} onClick={() => { if (cancel && reason.trim().length < 5) return setError('Nhập lý do minh họa có ít nhất 5 ký tự.'); onConfirm(reason.trim()) }}>{cancel ? 'Xác nhận hủy minh họa' : pair ? 'Xác nhận bốc thăm minh họa' : tournament.bracket ? 'Xác nhận tạo lại nhánh đấu' : 'Xác nhận tạo nhánh đấu'}</button></footer></DemoDialog>
}

export function ParticipantDialog({ participant, onClose }) {
  return <DemoDialog title="Thông tin người tham gia — Bản mẫu" closeLabel="Đóng hộp thoại" onClose={onClose}><div className="tournaments-player"><UserAvatar user={participant} /><div><strong>{participant.name}</strong><small>{participant.rating} · Hạt giống {participant.seed}</small></div></div><p>Ngày đăng ký: {date(participant.registered)}.</p><p>Thanh toán: {participant.paid ? 'Đã thanh toán minh họa' : 'Chưa thanh toán minh họa'}.</p><p className="users-demo-note">Hồ sơ và hạt giống là dữ liệu giả lập. Không đăng ký người chơi hoặc thu tiền tại đây.</p><footer><button className="users-button" onClick={onClose}>Đóng</button></footer></DemoDialog>
}
