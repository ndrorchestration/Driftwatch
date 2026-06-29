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
          manualChunks: (id) => {
            // Vendor: React core
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            // Vendor: Google Gemini SDK
            if (id.includes('@google/generative-ai') || id.includes('@google/genai')) {
              return 'vendor-gemini';
            }
            // Vendor: all other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      // Raise warning threshold while we split — remove once chunks are all under 500kB
      chunkSizeWarningLimit: 600,
    },
  };
});
