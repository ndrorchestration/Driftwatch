// Boot-time env validation — throws before React mounts if VITE_GEMINI_API_KEY is missing.
// Must be the first import so the error surfaces immediately, not silently at agent call time.
import './lib/env';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
