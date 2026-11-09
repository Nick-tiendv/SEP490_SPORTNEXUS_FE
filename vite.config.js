import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Tách thư viện ít thay đổi ra chunk riêng để trình duyệt cache lâu, file app chính nhẹ hơn
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/ },
            { name: 'vendor-libs', test: /[\\/]node_modules[\\/](axios|sonner)[\\/]/ },
          ],
        },
      },
    },
  },
})
