# Đối chiếu API Swagger ↔ Frontend

Nguồn: `https://sep490-sportnexus-be.onrender.com/swagger/v1/swagger.json` · FE commit `582567d` · 2026-10-22

Tổng **301** API: ✅ **117** đã nối và có trang dùng · 🟡 **24** đã viết hàm gọi nhưng chưa trang nào dùng · ❌ **160** chưa nối.

Ký hiệu: ✅ đã nối · 🟡 có hàm API nhưng UI chưa gọi · ❌ FE chưa gọi.

### Accounts — ✅ 6 · 🟡 0 · ❌ 2

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/accounts` |  | Admin/Users/UserManagement.jsx, Admin/Users/UserDialogs.jsx |
| ✅ | POST | `/api/accounts` |  | Admin/Users/UserManagement.jsx, Admin/Users/UserDialogs.jsx |
| ✅ | GET | `/api/accounts/{id}` |  | Admin/Users/UserManagement.jsx, Admin/Users/UserDialogs.jsx |
| ✅ | PUT | `/api/accounts/{id}` |  | Admin/Users/UserManagement.jsx, Admin/Users/UserDialogs.jsx |
| ✅ | DELETE | `/api/accounts/{id}` |  | Admin/Users/UserManagement.jsx, Admin/Users/UserDialogs.jsx |
| ❌ | GET | `/api/accounts/admin/by-phone` |  |  |
| ❌ | GET | `/api/accounts/lookup` |  |  |
| ✅ | PATCH | `/api/accounts/{id}/toggle-status` |  | Admin/Users/UserDialogs.jsx |

### AdminDashboard — ✅ 1 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/dashboard` |  | Admin/Dashboard/AdminDashboard.jsx, Admin/Dashboard/TrendsChart.jsx, Admin/Layout/AdminLayout.jsx |

### AdminFacility — ✅ 7 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/facilities` |  | Admin/Facilities/FacilityManagement.jsx, Admin/LFG/LFGManagement.jsx, Admin/Tournaments/TournamentManagement.jsx +3 |
| ✅ | GET | `/api/v1/admin/facilities/statistics` |  | Admin/Facilities/FacilityManagement.jsx |
| ✅ | GET | `/api/v1/admin/facilities/{facilityId}` |  | Admin/Facilities/FacilityManagement.jsx, Admin/LFG/LFGManagement.jsx, Admin/Tournaments/TournamentManagement.jsx +3 |
| ✅ | PATCH | `/api/v1/admin/facilities/{facilityId}/approve` |  | Admin/Facilities/FacilityDialogs.jsx |
| ✅ | PATCH | `/api/v1/admin/facilities/{facilityId}/reject` |  | Admin/Facilities/FacilityDialogs.jsx |
| ✅ | PATCH | `/api/v1/admin/facilities/{facilityId}/lock` |  | Admin/Facilities/FacilityDialogs.jsx |
| ✅ | PATCH | `/api/v1/admin/facilities/{facilityId}/unlock` |  | Admin/Facilities/FacilityDialogs.jsx |

### AdminFacilityReview — ✅ 5 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/facility-reviews` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | GET | `/api/v1/admin/facility-reviews/statistics` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | GET | `/api/v1/admin/facility-reviews/{reviewId}` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | PATCH | `/api/v1/admin/facility-reviews/{reviewId}/hide` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | PATCH | `/api/v1/admin/facility-reviews/{reviewId}/unhide` |  | Admin/Reviews/ReviewsTab.jsx |

### AdminFairPlay — ✅ 11 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/fair-play/statistics` |  | Admin/Reviews/ReviewsTab.jsx, Admin/Users/FairPlayTab.jsx |
| ✅ | GET | `/api/v1/admin/fair-play/users` |  | Admin/Users/FairPlayTab.jsx |
| ✅ | GET | `/api/v1/admin/fair-play/users/{userId}` |  | Admin/Users/FairPlayTab.jsx |
| ✅ | POST | `/api/v1/admin/fair-play/users/{userId}/adjust` |  | Admin/Users/FairPlayTab.jsx |
| ✅ | PATCH | `/api/v1/admin/fair-play/users/{userId}/claim-ban` |  | Admin/Users/FairPlayTab.jsx |
| ✅ | PATCH | `/api/v1/admin/fair-play/users/{userId}/claim-unban` |  | Admin/Users/FairPlayTab.jsx |
| ✅ | GET | `/api/v1/admin/fair-play/ratings` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | PATCH | `/api/v1/admin/fair-play/ratings/{ratingId}/hide` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | PATCH | `/api/v1/admin/fair-play/ratings/{ratingId}/unhide` |  | Admin/Reviews/ReviewsTab.jsx |
| ✅ | GET | `/api/v1/admin/fair-play/settings` |  | Admin/Settings/SystemSettings.jsx |
| ✅ | PUT | `/api/v1/admin/fair-play/settings` |  | Admin/Settings/SystemSettings.jsx |

### AdminLfg — ✅ 4 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/lfgs` |  | Admin/LFG/LFGManagement.jsx, Admin/LFG/LFGDetails.jsx, Admin/LFG/LFGDialogs.jsx |
| ✅ | GET | `/api/v1/admin/lfgs/statistics` |  | Admin/LFG/LFGManagement.jsx |
| ✅ | GET | `/api/v1/admin/lfgs/{cardId}` |  | Admin/LFG/LFGManagement.jsx, Admin/LFG/LFGDetails.jsx, Admin/LFG/LFGDialogs.jsx |
| ✅ | POST | `/api/v1/admin/lfgs/{cardId}/cancel` |  | Admin/LFG/LFGDialogs.jsx |

### AdminMasterData — ✅ 0 · 🟡 0 · ❌ 10

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/admin/master-data/sports` |  |  |
| ❌ | POST | `/api/v1/admin/master-data/sports` |  |  |
| ❌ | PUT | `/api/v1/admin/master-data/sports/{id}` |  |  |
| ❌ | DELETE | `/api/v1/admin/master-data/sports/{id}` |  |  |
| ❌ | PATCH | `/api/v1/admin/master-data/sports/{id}/restore` |  |  |
| ❌ | GET | `/api/v1/admin/master-data/amenities` |  |  |
| ❌ | POST | `/api/v1/admin/master-data/amenities` |  |  |
| ❌ | PUT | `/api/v1/admin/master-data/amenities/{id}` |  |  |
| ❌ | DELETE | `/api/v1/admin/master-data/amenities/{id}` |  |  |
| ❌ | PATCH | `/api/v1/admin/master-data/amenities/{id}/restore` |  |  |

### AdminNotification — ✅ 0 · 🟡 0 · ❌ 5

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | POST | `/api/v1/admin/notifications/broadcast` |  |  |
| ❌ | GET | `/api/v1/admin/notifications/broadcasts` |  |  |
| ❌ | GET | `/api/v1/admin/notifications/broadcasts/{id}` |  |  |
| ❌ | DELETE | `/api/v1/admin/notifications/broadcasts/{id}` |  |  |
| ❌ | GET | `/api/v1/admin/notifications/statistics` |  |  |

### AdminOwnerVerification — ✅ 4 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/owner-verifications` |  | Admin/CourtOwners/CourtOwnerManagement.jsx, Admin/CourtOwners/OwnerVerifications.jsx |
| ✅ | GET | `/api/v1/admin/owner-verifications/{id}` |  | Admin/CourtOwners/CourtOwnerManagement.jsx, Admin/CourtOwners/OwnerVerifications.jsx |
| ✅ | PATCH | `/api/v1/admin/owner-verifications/{id}/approve` |  | Admin/CourtOwners/OwnerVerifications.jsx |
| ✅ | PATCH | `/api/v1/admin/owner-verifications/{id}/reject` |  | Admin/CourtOwners/OwnerVerifications.jsx |

### AdminPromotion — ✅ 0 · 🟡 0 · ❌ 5

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/admin/promotions/packages` |  |  |
| ❌ | POST | `/api/v1/admin/promotions/packages` |  |  |
| ❌ | PUT | `/api/v1/admin/promotions/packages/{id}` |  |  |
| ❌ | DELETE | `/api/v1/admin/promotions/packages/{id}` |  |  |
| ❌ | GET | `/api/v1/admin/promotions` |  |  |

### AdminTeam — ✅ 0 · 🟡 0 · ❌ 6

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/admin/teams` |  |  |
| ❌ | GET | `/api/v1/admin/teams/statistics` |  |  |
| ❌ | GET | `/api/v1/admin/teams/{teamId}` |  |  |
| ❌ | DELETE | `/api/v1/admin/teams/{teamId}` |  |  |
| ❌ | PATCH | `/api/v1/admin/teams/{teamId}/lock` |  |  |
| ❌ | PATCH | `/api/v1/admin/teams/{teamId}/unlock` |  |  |

### AdminTournament — ✅ 5 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/tournaments` |  | Admin/Tournaments/TournamentManagement.jsx, Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx +1 |
| ✅ | GET | `/api/v1/admin/tournaments/statistics` |  | Admin/Tournaments/TournamentManagement.jsx |
| ✅ | PATCH | `/api/v1/admin/tournaments/{id}/lock` |  | Admin/Tournaments/TournamentDialogs.jsx |
| ✅ | PATCH | `/api/v1/admin/tournaments/{id}/unlock` |  | Admin/Tournaments/TournamentDialogs.jsx |
| ✅ | PATCH | `/api/v1/admin/tournaments/{id}/cancel` |  | Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx |

### AdminWallet — ✅ 8 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/wallets` |  | Admin/Payments/TransactionsTab.jsx, Admin/Payments/WalletsTab.jsx, Player/Book a court/SplitPayment.jsx +6 |
| ✅ | GET | `/api/v1/admin/wallets/statistics` |  | Admin/Payments/PaymentManagement.jsx |
| ✅ | GET | `/api/v1/admin/wallets/transactions` |  | Admin/Payments/TransactionsTab.jsx |
| ✅ | GET | `/api/v1/admin/wallets/settings/commission` |  | Admin/Settings/SystemSettings.jsx |
| ✅ | PUT | `/api/v1/admin/wallets/settings/commission` |  | Admin/Settings/SystemSettings.jsx |
| ✅ | POST | `/api/v1/admin/wallets/settlements/run` |  | Admin/Settings/SystemSettings.jsx |
| ✅ | GET | `/api/v1/admin/wallets/{userId}` |  | Admin/Payments/TransactionsTab.jsx, Admin/Payments/WalletsTab.jsx, Player/Book a court/SplitPayment.jsx +6 |
| ✅ | POST | `/api/v1/admin/wallets/{userId}/adjust` |  | Admin/Payments/WalletsTab.jsx |

### AdminWithdrawal — ✅ 3 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/admin/withdrawals` |  | Admin/Payments/WithdrawalsTab.jsx |
| ✅ | PATCH | `/api/v1/admin/withdrawals/{id}/complete` |  | Admin/Payments/WithdrawalsTab.jsx |
| ✅ | PATCH | `/api/v1/admin/withdrawals/{id}/reject` |  | Admin/Payments/WithdrawalsTab.jsx |

### AiAssistant — ✅ 0 · 🟡 0 · ❌ 6

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | POST | `/api/v1/ai/chat` |  |  |
| ❌ | POST | `/api/v1/ai/sessions` |  |  |
| ❌ | GET | `/api/v1/ai/sessions` |  |  |
| ❌ | GET | `/api/v1/ai/sessions/{id}/messages` |  |  |
| ❌ | POST | `/api/v1/ai/sessions/{id}/chat` |  |  |
| ❌ | DELETE | `/api/v1/ai/sessions/{id}` |  |  |

### Auth — ✅ 7 · 🟡 1 · ❌ 13

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | POST | `/api/auth/register` |  | Auth/Register.jsx |
| 🟡 | POST | `/api/auth/register-admin` |  | hàm `registerAdmin` chưa được trang nào dùng |
| ✅ | POST | `/api/auth/login` |  | Auth/Login.jsx |
| ❌ | POST | `/api/auth/send-otp` |  |  |
| ❌ | POST | `/api/auth/verify-otp` |  |  |
| ❌ | POST | `/api/auth/forgot-password` |  |  |
| ❌ | POST | `/api/auth/reset-password` |  |  |
| ❌ | POST | `/api/auth/refresh-token` |  |  |
| ❌ | POST | `/api/auth/google` |  |  |
| ❌ | POST | `/api/auth/facebook` |  |  |
| ❌ | POST | `/api/auth/me/phone` |  |  |
| ❌ | POST | `/api/auth/set-password` |  |  |
| ❌ | POST | `/api/auth/me/email/send-otp` |  |  |
| ❌ | POST | `/api/auth/me/email/verify` |  |  |
| ✅ | POST | `/api/auth/change-password` |  | Court Owner/CourtOwnerDashboard.jsx |
| ✅ | POST | `/api/auth/logout` |  | Admin/Layout/AdminSidebar.jsx, context/AuthContext.jsx, Court Owner/CourtOwnerDashboard.jsx +2 |
| ❌ | POST | `/api/auth/logout-all` |  |  |
| ✅ | GET | `/api/auth/me` |  | Admin/CourtOwners/CourtOwnerManagement.jsx, Admin/Layout/AdminLayout.jsx, Admin/Users/UserManagement.jsx +4 |
| ✅ | PUT | `/api/auth/me` |  | Court Owner/CourtOwnerLayout.jsx, Court Owner/CourtOwnerDashboard.jsx |
| ❌ | DELETE | `/api/auth/me` |  |  |
| ✅ | POST | `/api/auth/me/avatar` |  | Court Owner/CourtOwnerDashboard.jsx |

### Booking — ✅ 11 · 🟡 1 · ❌ 7

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | POST | `/api/v1/bookings` |  | Player/Book a court/SplitPayment.jsx |
| ❌ | POST | `/api/v1/bookings/{bookingId}/pay-remaining` |  |  |
| ❌ | POST | `/api/v1/bookings/{bookingId}/join` |  |  |
| ❌ | POST | `/api/v1/bookings/{bookingId}/participants` |  |  |
| ✅ | GET | `/api/v1/bookings/{bookingId}/qr-ticket` |  | Player/Book a court/SplitPayment.jsx |
| ❌ | GET | `/api/v1/bookings/my-bookings` |  |  |
| ❌ | GET | `/api/v1/bookings/upcoming` |  |  |
| ❌ | GET | `/api/v1/bookings/{bookingId}` |  |  |
| ✅ | GET | `/api/v1/bookings/cancellation-reasons` |  | Admin/Bookings/BookingDialogs.jsx, Court Owner/View Court Booking Schedule.jsx |
| ❌ | POST | `/api/v1/bookings/{bookingId}/cancel` |  |  |
| ✅ | GET | `/api/v1/bookings/owner` |  | Court Owner/Check QR.jsx, Court Owner/Dashboard.jsx, Court Owner/View Court Booking Schedule.jsx |
| 🟡 | GET | `/api/v1/bookings/owner/{bookingId}` |  | hàm `getOwnerBooking` chưa được trang nào dùng |
| ✅ | POST | `/api/v1/bookings/owner/walk-in` |  | Court Owner/View Court Booking Schedule.jsx |
| ✅ | POST | `/api/v1/bookings/owner/{bookingId}/cancel` |  | Court Owner/View Court Booking Schedule.jsx, Admin/Bookings/BookingDialogs.jsx |
| ✅ | POST | `/api/v1/bookings/owner/{bookingId}/check-in` |  | Court Owner/Check QR.jsx, Court Owner/View Court Booking Schedule.jsx |
| ✅ | GET | `/api/v1/bookings/admin` |  | Admin/Bookings/BookingManagement.jsx, Admin/Bookings/BookingDialogs.jsx, Admin/Dashboard/AdminDashboard.jsx +3 |
| ✅ | GET | `/api/v1/bookings/admin/statistics` |  | Admin/Bookings/BookingManagement.jsx |
| ✅ | GET | `/api/v1/bookings/admin/{bookingId}` |  | Admin/Bookings/BookingManagement.jsx, Admin/Bookings/BookingDialogs.jsx |
| ✅ | POST | `/api/v1/bookings/admin/{bookingId}/cancel` |  | Admin/Bookings/BookingDialogs.jsx, Court Owner/View Court Booking Schedule.jsx |

### CheckIn — ✅ 1 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | POST | `/api/v1/checkin/scan` |  | Court Owner/Check QR.jsx |

### Community — ✅ 0 · 🟡 0 · ❌ 14

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/community/posts` |  |  |
| ❌ | POST | `/api/v1/community/posts` |  |  |
| ❌ | GET | `/api/v1/community/my-posts` |  |  |
| ❌ | GET | `/api/v1/community/users/{userId}/posts` |  |  |
| ❌ | GET | `/api/v1/community/posts/{postId}` |  |  |
| ❌ | PUT | `/api/v1/community/posts/{postId}` |  |  |
| ❌ | DELETE | `/api/v1/community/posts/{postId}` |  |  |
| ❌ | POST | `/api/v1/community/posts/images` |  |  |
| ❌ | POST | `/api/v1/community/posts/{postId}/like` |  |  |
| ❌ | DELETE | `/api/v1/community/posts/{postId}/like` |  |  |
| ❌ | GET | `/api/v1/community/posts/{postId}/comments` |  |  |
| ❌ | POST | `/api/v1/community/posts/{postId}/comments` |  |  |
| ❌ | PUT | `/api/v1/community/comments/{commentId}` |  |  |
| ❌ | DELETE | `/api/v1/community/comments/{commentId}` |  |  |

### Court — ✅ 3 · 🟡 2 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/facilities/{facilityId}/courts` |  | Court Owner/Court Manage.jsx |
| ✅ | POST | `/api/v1/facilities/{facilityId}/courts` |  | Court Owner/Court Manage.jsx |
| 🟡 | GET | `/api/v1/facilities/{facilityId}/courts/{courtId}` |  | hàm `getCourt` chưa được trang nào dùng |
| ✅ | PUT | `/api/v1/facilities/{facilityId}/courts/{courtId}` |  | Court Owner/Court Manage.jsx |
| 🟡 | DELETE | `/api/v1/facilities/{facilityId}/courts/{courtId}` |  | hàm `deleteCourt` chưa được trang nào dùng |

### CourtSlot — ✅ 2 · 🟡 2 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/courts/{courtId}/slots` |  | Player/Book a court/CourtDetails.jsx, Player/Book a court/MapBooking.jsx, Player/Book a court/SplitPayment.jsx +1 |
| 🟡 | POST | `/api/v1/courts/{courtId}/slots/generate` |  | hàm `generateFacilitySlots`, `generateCourtSlots` chưa được trang nào dùng |
| 🟡 | DELETE | `/api/v1/slots/{slotId}` |  | hàm `deleteSlot` chưa được trang nào dùng |
| ✅ | PUT | `/api/v1/slots/{slotId}/status` |  | Court Owner/View Court Booking Schedule.jsx |

### Facility — ✅ 6 · 🟡 11 · ❌ 3

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/facilities` |  | Admin/Bookings/BookingManagement.jsx, Player/Book a court/CourtDetails.jsx, Player/Book a court/MapBooking.jsx +1 |
| 🟡 | POST | `/api/v1/facilities` |  | hàm `createFacility` chưa được trang nào dùng |
| ❌ | GET | `/api/v1/facilities/search` |  |  |
| ❌ | GET | `/api/v1/facilities/locations` |  |  |
| ❌ | GET | `/api/v1/facilities/{facilityId}/reviews` |  |  |
| ✅ | GET | `/api/v1/facilities/my-facilities` |  | Court Owner/CourtOwnerLayout.jsx |
| ✅ | GET | `/api/v1/facilities/{id}` |  | Player/Book a court/CourtDetails.jsx, Player/Book a court/MapBooking.jsx, Player/Layout/Dashboard.jsx +3 |
| ✅ | PUT | `/api/v1/facilities/{id}` |  | Admin/Facilities/FacilityManagement.jsx, Admin/LFG/LFGManagement.jsx, Admin/Tournaments/TournamentManagement.jsx +4 |
| 🟡 | DELETE | `/api/v1/facilities/{id}` |  | hàm `deleteFacility` chưa được trang nào dùng |
| 🟡 | GET | `/api/v1/facilities/{facilityId}/bookings` |  | hàm `getFacilityBookings` chưa được trang nào dùng |
| 🟡 | POST | `/api/v1/facilities/{id}/images` |  | hàm `uploadFacilityImages`, `deleteFacilityImage`, `setFacilityThumbnail` chưa được trang nào dùng |
| 🟡 | DELETE | `/api/v1/facilities/{id}/images/{imageId}` |  | hàm `uploadFacilityImages`, `deleteFacilityImage`, `setFacilityThumbnail` chưa được trang nào dùng |
| 🟡 | PATCH | `/api/v1/facilities/{id}/images/{imageId}/thumbnail` |  | hàm `setFacilityThumbnail` chưa được trang nào dùng |
| 🟡 | PUT | `/api/v1/facilities/{id}/amenities` |  | hàm `updateFacilityAmenities`, `getAmenities` chưa được trang nào dùng |
| ✅ | GET | `/api/v1/facilities/{id}/slots` |  | Court Owner/View Court Booking Schedule.jsx, Player/Book a court/CourtDetails.jsx, Player/Book a court/MapBooking.jsx +1 |
| 🟡 | GET | `/api/v1/facilities/{id}/slots/range` |  | hàm `getFacilitySlotsRange` chưa được trang nào dùng |
| ✅ | GET | `/api/v1/facilities/{id}/availability` |  | Player/Book a court/CourtDetails.jsx |
| 🟡 | POST | `/api/v1/facilities/{id}/slots/generate` |  | hàm `generateFacilitySlots`, `generateCourtSlots` chưa được trang nào dùng |
| 🟡 | PUT | `/api/v1/facilities/{id}/slots/bulk` |  | hàm `bulkUpdateSlots`, `bulkDeleteSlots` chưa được trang nào dùng |
| 🟡 | POST | `/api/v1/facilities/{id}/slots/bulk-delete` |  | hàm `bulkDeleteSlots` chưa được trang nào dùng |

### FacilityReview — ✅ 0 · 🟡 0 · ❌ 6

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/facility-reviews/eligibility/{facilityId}` |  |  |
| ❌ | POST | `/api/v1/facility-reviews` |  |  |
| ❌ | GET | `/api/v1/facility-reviews/my-reviews` |  |  |
| ❌ | GET | `/api/v1/facility-reviews/{reviewId}` |  |  |
| ❌ | PUT | `/api/v1/facility-reviews/{reviewId}` |  |  |
| ❌ | DELETE | `/api/v1/facility-reviews/{reviewId}` |  |  |

### FairPlay — ✅ 0 · 🟡 0 · ❌ 2

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/fair-play/me` |  |  |
| ❌ | GET | `/api/v1/fair-play/pending-ratings` |  |  |

### Lfg — ✅ 0 · 🟡 0 · ❌ 20

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/lfgs` |  |  |
| ❌ | POST | `/api/v1/lfgs` |  |  |
| ❌ | GET | `/api/v1/lfgs/my-cards` |  |  |
| ❌ | GET | `/api/v1/lfgs/joined` |  |  |
| ❌ | GET | `/api/v1/lfgs/{cardId}` |  |  |
| ❌ | PUT | `/api/v1/lfgs/{cardId}` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/cancel` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/participants/{userId}/approve` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/participants/{userId}/reject` |  |  |
| ❌ | DELETE | `/api/v1/lfgs/{cardId}/participants/{userId}` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/claim` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/invitation/accept` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/invitation/decline` |  |  |
| ❌ | DELETE | `/api/v1/lfgs/{cardId}/group/{friendId}` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/leave` |  |  |
| ❌ | GET | `/api/v1/lfgs/cancel-reasons` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/cancel-requests` |  |  |
| ❌ | GET | `/api/v1/lfgs/{cardId}/cancel-requests/latest` |  |  |
| ❌ | POST | `/api/v1/lfgs/{cardId}/cancel-requests/{requestId}/vote` |  |  |
| ❌ | GET | `/api/v1/lfgs/{cardId}/qr-ticket` |  |  |

### MasterData — ✅ 1 · 🟡 1 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/master-data/sports` |  | Admin/Dashboard/AdminDashboard.jsx, Court Owner/Court Manage.jsx, Court Owner/Create Automated Tournament.jsx |
| 🟡 | GET | `/api/v1/master-data/amenities` |  | hàm `updateFacilityAmenities`, `getAmenities` chưa được trang nào dùng |

### Match — ✅ 1 · 🟡 2 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| 🟡 | GET | `/api/v1/matches/{matchId}` |  | hàm `getMatch` chưa được trang nào dùng |
| ✅ | PUT | `/api/v1/matches/{matchId}/score` |  | Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx |
| 🟡 | PUT | `/api/v1/matches/{matchId}/assign-court` |  | hàm `assignMatchCourt` chưa được trang nào dùng |

### Notification — ✅ 0 · 🟡 0 · ❌ 10

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/notifications` |  |  |
| ❌ | DELETE | `/api/v1/notifications` |  |  |
| ❌ | POST | `/api/v1/notifications/devices` |  |  |
| ❌ | DELETE | `/api/v1/notifications/devices` |  |  |
| ❌ | GET | `/api/v1/notifications/unread-count` |  |  |
| ❌ | PUT | `/api/v1/notifications/{id}/read` |  |  |
| ❌ | PUT | `/api/v1/notifications/read-all` |  |  |
| ❌ | DELETE | `/api/v1/notifications/{id}` |  |  |
| ❌ | GET | `/api/v1/notifications/settings` |  |  |
| ❌ | PUT | `/api/v1/notifications/settings` |  |  |

### OwnerDashboard — ✅ 1 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/owner/dashboard` |  | Court Owner/Dashboard.jsx |

### OwnerFacilityReview — ✅ 0 · 🟡 0 · ❌ 5

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/owner/facility-reviews` |  |  |
| ❌ | GET | `/api/v1/owner/facility-reviews/statistics` |  |  |
| ❌ | POST | `/api/v1/owner/facility-reviews/{reviewId}/reply` |  |  |
| ❌ | PUT | `/api/v1/owner/facility-reviews/{reviewId}/reply` |  |  |
| ❌ | DELETE | `/api/v1/owner/facility-reviews/{reviewId}/reply` |  |  |

### OwnerVerification — ✅ 3 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/owner/verification` |  | Court Owner/CourtOwnerDashboard.jsx |
| ✅ | POST | `/api/v1/owner/verification` |  | Court Owner/CourtOwnerDashboard.jsx |
| ✅ | POST | `/api/v1/owner/verification/images` |  | Court Owner/CourtOwnerDashboard.jsx |

### Payment — ✅ 0 · 🟡 0 · ❌ 1

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | POST | `/api/v1/payments/payos/webhook` |  |  |

### Promotion — ✅ 0 · 🟡 0 · ❌ 3

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/promotions/packages` |  |  |
| ❌ | POST | `/api/v1/promotions` |  |  |
| ❌ | GET | `/api/v1/promotions/mine` |  |  |

### Report — ✅ 4 · 🟡 0 · ❌ 10

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/v1/reports/reasons` |  |  |
| ❌ | POST | `/api/v1/reports` |  |  |
| ❌ | GET | `/api/v1/reports/my-reports` |  |  |
| ❌ | GET | `/api/v1/reports/{reportId}` |  |  |
| ❌ | PUT | `/api/v1/reports/{reportId}` |  |  |
| ❌ | POST | `/api/v1/reports/{reportId}/withdraw` |  |  |
| ❌ | GET | `/api/v1/reports/owner` |  |  |
| ❌ | GET | `/api/v1/reports/owner/{reportId}` |  |  |
| ❌ | POST | `/api/v1/reports/owner/{reportId}/respond` |  |  |
| ❌ | POST | `/api/v1/reports/owner/{reportId}/accept-refund` |  |  |
| ✅ | GET | `/api/v1/reports/admin` |  | Admin/Reviews/ReviewsReportsPage.jsx |
| ✅ | GET | `/api/v1/reports/admin/statistics` |  | Admin/Reviews/ReviewsReportsPage.jsx |
| ✅ | GET | `/api/v1/reports/admin/{reportId}` |  | Admin/Reviews/ReviewsReportsPage.jsx |
| ✅ | POST | `/api/v1/reports/admin/{reportId}/resolve` |  | Admin/Reviews/ReviewsReportsPage.jsx |

### Review — ✅ 0 · 🟡 0 · ❌ 2

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | POST | `/api/v1/reviews/fair-play` |  |  |
| ❌ | POST | `/api/v1/reviews/facility` |  |  |

### Team — ✅ 0 · 🟡 0 · ❌ 18

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | POST | `/api/v1/teams` |  |  |
| ❌ | GET | `/api/v1/teams` |  |  |
| ❌ | GET | `/api/v1/teams/my-teams` |  |  |
| ❌ | GET | `/api/v1/teams/{id}` |  |  |
| ❌ | PUT | `/api/v1/teams/{id}` |  |  |
| ❌ | DELETE | `/api/v1/teams/{id}` |  |  |
| ❌ | GET | `/api/v1/teams/{id}/members` |  |  |
| ❌ | DELETE | `/api/v1/teams/{id}/members/{accountId}` |  |  |
| ❌ | PUT | `/api/v1/teams/{id}/captain` |  |  |
| ❌ | POST | `/api/v1/teams/{id}/leave` |  |  |
| ❌ | POST | `/api/v1/teams/{id}/logo` |  |  |
| ❌ | GET | `/api/v1/teams/{id}/tournaments` |  |  |
| ❌ | POST | `/api/v1/teams/{id}/invitations` |  |  |
| ❌ | GET | `/api/v1/teams/{id}/invitations` |  |  |
| ❌ | GET | `/api/v1/teams/invitations/me` |  |  |
| ❌ | POST | `/api/v1/teams/invitations/{invitationId}/accept` |  |  |
| ❌ | POST | `/api/v1/teams/invitations/{invitationId}/decline` |  |  |
| ❌ | DELETE | `/api/v1/teams/invitations/{invitationId}` |  |  |

### Tournament — ✅ 12 · 🟡 4 · ❌ 8

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | POST | `/api/v1/tournaments` |  | Court Owner/Create Automated Tournament.jsx |
| ❌ | GET | `/api/v1/tournaments` |  |  |
| 🟡 | POST | `/api/v1/tournaments/{id}/court-blocks` |  | hàm `blockCourts`, `releaseCourts` chưa được trang nào dùng |
| 🟡 | POST | `/api/v1/tournaments/{id}/court-blocks/release` |  | hàm `releaseCourts` chưa được trang nào dùng |
| 🟡 | GET | `/api/v1/tournaments/{id}/court-schedule` |  | hàm `getCourtSchedule` chưa được trang nào dùng |
| ✅ | GET | `/api/v1/tournaments/my-tournaments` |  | Court Owner/Create Automated Tournament.jsx |
| 🟡 | GET | `/api/v1/facilities/{facilityId}/tournaments` |  | hàm `getFacilityTournaments` chưa được trang nào dùng |
| ✅ | POST | `/api/v1/tournaments/{id}/execute-random-pairing` |  | Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx |
| ✅ | POST | `/api/v1/tournaments/{id}/generate-bracket` |  | Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx |
| ✅ | POST | `/api/v1/tournaments/{id}/participants` |  | Admin/Tournaments/TournamentDetails.jsx, Court Owner/Create Automated Tournament.jsx, Admin/Tournaments/TournamentDialogs.jsx |
| ✅ | GET | `/api/v1/tournaments/{id}/participants` |  | Admin/Tournaments/TournamentDetails.jsx, Court Owner/Create Automated Tournament.jsx, Admin/Tournaments/TournamentDialogs.jsx |
| ✅ | DELETE | `/api/v1/tournaments/{id}/participants/{participantId}` |  | Admin/Tournaments/TournamentDetails.jsx, Court Owner/Create Automated Tournament.jsx, Admin/Tournaments/TournamentDialogs.jsx |
| ✅ | POST | `/api/v1/tournaments/{id}/check-in` |  | Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx |
| ❌ | GET | `/api/v1/tournaments/search` |  |  |
| ❌ | GET | `/api/v1/tournaments/my-matches` |  |  |
| ❌ | PUT | `/api/v1/tournaments/{id}` |  |  |
| ✅ | GET | `/api/v1/tournaments/{id}` |  | Admin/Tournaments/TournamentManagement.jsx, Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx +1 |
| ✅ | DELETE | `/api/v1/tournaments/{id}` |  | Court Owner/Create Automated Tournament.jsx |
| ❌ | GET | `/api/v1/tournaments/my-registrations` |  |  |
| ❌ | GET | `/api/v1/tournaments/{id}/qr-ticket` |  |  |
| ❌ | POST | `/api/v1/tournaments/{id}/join` |  |  |
| ❌ | POST | `/api/v1/tournaments/{id}/cancel` |  |  |
| ✅ | PATCH | `/api/v1/tournaments/{id}/cancel-tournament` |  | Admin/Tournaments/TournamentDialogs.jsx, Court Owner/Create Automated Tournament.jsx |
| ✅ | GET | `/api/v1/tournaments/{id}/bracket` |  | Admin/Tournaments/TournamentDetails.jsx, Court Owner/Create Automated Tournament.jsx, Admin/Tournaments/TournamentDialogs.jsx |

### Upload — ✅ 0 · 🟡 0 · ❌ 1

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | POST | `/api/v1/uploads/images` |  |  |

### UserSport — ✅ 0 · 🟡 0 · ❌ 2

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ❌ | GET | `/api/auth/me/sports` |  |  |
| ❌ | PUT | `/api/auth/me/sports` |  |  |

### Wallet — ✅ 6 · 🟡 0 · ❌ 1

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/wallet` |  | Court Owner/CourtOwnerLayout.jsx, Court Owner/Settlement.jsx, Court Owner/CourtOwnerDashboard.jsx +6 |
| ✅ | GET | `/api/v1/wallet/deposits/{orderCode}` |  | Player/Book a court/SplitPayment.jsx, Player/Wallet/DepositCancel.jsx, Player/Wallet/DepositSuccess.jsx +1 |
| ✅ | POST | `/api/v1/wallet/deposits/{orderCode}/cancel` |  | Player/Book a court/SplitPayment.jsx, Player/Wallet/DepositCancel.jsx, Player/Wallet/WalletEscrow.jsx |
| ✅ | POST | `/api/v1/wallet/deposit` |  | Player/Book a court/SplitPayment.jsx, Player/Wallet/WalletEscrow.jsx, Player/Wallet/DepositCancel.jsx +1 |
| ✅ | GET | `/api/v1/wallet/transactions` |  | Court Owner/Settlement.jsx, Player/Wallet/WalletEscrow.jsx |
| ❌ | GET | `/api/v1/wallet/transactions/{transactionId}` |  |  |
| ✅ | GET | `/api/v1/wallet/owner/earnings` |  | Court Owner/Settlement.jsx |

### Withdrawal — ✅ 5 · 🟡 0 · ❌ 0

| | Method | Endpoint | Mô tả | Dùng ở |
|---|---|---|---|---|
| ✅ | GET | `/api/v1/wallet/bank-account` |  | Court Owner/CourtOwnerDashboard.jsx, Court Owner/Settlement.jsx |
| ✅ | PUT | `/api/v1/wallet/bank-account` |  | Court Owner/CourtOwnerDashboard.jsx, Court Owner/Settlement.jsx |
| ✅ | POST | `/api/v1/wallet/withdrawals` |  | Court Owner/Settlement.jsx |
| ✅ | GET | `/api/v1/wallet/withdrawals` |  | Court Owner/Settlement.jsx |
| ✅ | POST | `/api/v1/wallet/withdrawals/{id}/cancel` |  | Court Owner/Settlement.jsx |
