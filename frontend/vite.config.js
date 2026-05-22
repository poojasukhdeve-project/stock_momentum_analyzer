import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/stock-momentum-analyzer/',
  server: { port: 5173 }
});