import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import { theme } from './theme';
import './index.css';

// Initialize Capacitor plugins for native platforms
const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    // Set status bar style
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#1a237e' });
    } catch (e) {
      console.log('StatusBar not available:', e);
    }

    // Hide splash screen after app is ready
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.log('SplashScreen not available:', e);
    }
  }
};

// Register service worker for PWA (only in browser)
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('ServiceWorker registration failed:', error);
    });
  });
}

// Initialize Capacitor after DOM is ready
initializeCapacitor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

