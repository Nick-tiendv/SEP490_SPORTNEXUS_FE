import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Test (`node --test`) tự dựng Vite server: dùng cache riêng để không ghi đè node_modules/.vite của
  // `npm run dev` đang chạy (ghi đè làm trình duyệt lỗi tải trang → "Có phiên bản mới của trang").
  cacheDir: process.env.NODE_TEST_CONTEXT ? 'node_modules/.vite-test' : undefined,
})
