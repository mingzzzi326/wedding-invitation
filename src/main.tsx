import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ParentApp from './parentApp.tsx';

const params = new URLSearchParams(window.location.search);
const version = params.get('version');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      {version === 'parents' ? <ParentApp /> : <App />}
  </StrictMode>,
)
