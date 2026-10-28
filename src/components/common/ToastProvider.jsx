import { Toaster } from 'sonner'
import ConfirmHost from './ConfirmDialog.jsx'

// Thông báo (toast) và hộp thoại xác nhận dùng chung cho toàn app.
export default function ToastProvider() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton duration={4500} toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px' } }} />
      <ConfirmHost />
    </>
  )
}
