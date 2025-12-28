import { CapacitorConfig } from '@capacitor/cli';

const useLiveReload = process.env.LIVE_RELOAD === 'true';

const config: CapacitorConfig = {
  appId: 'com.tisha.booking',
  appName: 'Tisha Booking',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    ...(useLiveReload && {
      url: "http://192.168.1.100:5173",
      cleartext: true
    })
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a237e',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1a237e',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;

