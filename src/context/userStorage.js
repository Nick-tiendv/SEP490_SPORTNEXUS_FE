// Dữ liệu gắn với 1 tài khoản mà một số trang cũ còn lưu ở localStorage (bộ nhớ đệm số dư, hồ sơ,
// phiên chơi để đánh giá, vé đang mở…). Phải xóa khi đăng xuất / đăng nhập tài khoản khác,
// nếu không người dùng sau trên cùng máy sẽ thấy dữ liệu của người trước.
const USER_KEYS = [
  'escrow_balance',
  'frozen_balance',
  'available_balance',
  'player_profile_data',
  'player_sports_data',
  'player_match_reviews',
  'player_match_reviewed_ids',
  'sportnexus_last_checkout_session',
  'sportnexus_ticket_checkin_done',
  'sportnexus_last_booking_id',
  'sportnexus_current_lfg_id',
  'sportnexus_current_tournament_id',
  'sportnexus_selected_slot_id',
  'sportnexus_selected_slot_ids',
  'sportnexus_player_bank_account',
  'sportnexus_current_user',
  'sportnexus_user_id',
  'sportnexus_user_fullname',
  'sportnexus_user_role',
  'sportnexus_registered_role',
  'sportnexus_auth_token',
  'sportnexus_browser_push_token',
  'sportnexus_browser_push_enabled',
  'sportnexus_disabled_notif_types',
]

export function clearUserData() {
  try {
    for (const key of USER_KEYS) localStorage.removeItem(key)
  } catch { /* trình duyệt chặn localStorage: không có gì để xóa */ }
}
