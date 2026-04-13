import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import posthog from 'posthog-js';

posthog.init('phc_mD8YFGBkZZBqGhevYA58vi9qh8nVw3rn9AZitZfpdn4C', {
  api_host: 'https://eu.posthog.com',
  person_profiles: 'identified_only',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);