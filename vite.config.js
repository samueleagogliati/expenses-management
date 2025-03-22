// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'

// export default defineConfig({
//   plugins: [vue()],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//   },
// })

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/': {
        target: 'http://expenses-server:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
