import react from '@vitejs/plugin-react'
import { definePlayground } from '../shared/vite.ts'

export default definePlayground({
  stylesheet: '@paperpic/react/style.css',
  plugins: [
    react(),
  ],
})
