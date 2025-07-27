import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initDB } from './utils/indexedDB';
import { registerServiceWorker } from './service-worker';

// Inicializar base de datos IndexedDB
initDB().then(() => {
  console.log('IndexedDB inicializada');
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker
registerServiceWorker();

reportWebVitals();