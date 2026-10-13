import { Toaster } from 'sonner'
export default function ToastProvider() {
  return <Toaster position="top-right" richColors closeButton duration={4500} toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px' } }} />
}
