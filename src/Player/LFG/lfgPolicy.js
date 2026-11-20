// Số liệu chính sách kèo ghép (luật BE) — CHỈ dùng để hiển thị câu chữ giải thích.
// Việc quyết định (kèo đã khóa hay chưa, tiền hoàn, điểm bị trừ) luôn theo dữ liệu BE trả:
// isLocked / hostCancelUntil của kèo, kết quả POST /lfgs/{id}/cancel. BE đổi luật thì sửa tại đây.
export const LFG_POLICY = {
  // Mốc khóa hủy / rời kèo: trước giờ chơi bao nhiêu giờ
  lockHours: 48,
  // Chủ kèo hủy từ mốc trở lên: trừ điểm Fair Play
  earlyHostFairPlay: 10,
  // Chủ kèo hủy dưới mốc: mất % tiền sân (bồi thường người tham gia) + trừ điểm Fair Play
  lateHostPenaltyPercent: 50,
  lateHostFairPlay: 20,
  // Không cho rời kèo trong vòng N giờ trước giờ chơi
  leaveBlockHours: 2,
  // Trễ check-in quá N phút coi như vắng mặt, trừ điểm Fair Play
  checkInGraceMinutes: 15,
  noShowFairPlay: 10,
  // Môn đồng đội: bắt buộc ghép kèo theo đội (Team vs Team). Tiền sân chia đôi cho 2 đội trưởng, không chia tiền trong đội.
  // Các môn khác (cầu lông, pickleball, tennis…) chọn đánh đơn 1 vs 1 hoặc đôi 2 vs 2.
  teamSportKeys: ['football', 'basketball', 'volleyball'],
}
