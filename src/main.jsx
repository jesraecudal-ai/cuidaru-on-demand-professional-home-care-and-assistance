import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Auto-apply dark class based on system preference
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const applyDark = (e) => {
  document.documentElement.classList.toggle('dark', e.matches);
};
applyDark(mq);
mq.addEventListener('change', applyDark);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)