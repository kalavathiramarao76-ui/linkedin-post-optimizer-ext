import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '../ui/ThemeToggle';
import { ToastProvider } from '../ui/Toast';
import { Popup } from './Popup';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <Popup />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
