import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Aggiungi questa linea per permettere al server di essere accessibile da tutte le interfacce di rete
    port: 5173, // Porta su cui il server è in ascolto
  },
})
