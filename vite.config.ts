import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      now: 'Date.now()',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core — smallest, most stable, best cache hit rate
            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Three.js — large 3D lib, rarely changes
            if (id.includes('/node_modules/three/')) {
              return 'vendor-three';
            }
            // GSAP — animation lib, rarely changes
            if (id.includes('/node_modules/gsap/')) {
              return 'vendor-gsap';
            }
            // Motion (Framer Motion) — animation lib
            if (id.includes('/node_modules/motion/') || id.includes('/node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            // Lucide icons
            if (id.includes('/node_modules/lucide-react/')) {
              return 'vendor-lucide';
            }
            // Google Gemini SDKs
            if (id.includes('/node_modules/@google/')) {
              return 'vendor-gemini';
            }
            // Everything else in node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
  };
});
