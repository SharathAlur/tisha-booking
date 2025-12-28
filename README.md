# Tisha Function Hall Booking

A complete React PWA for booking function halls with Firebase backend. Features real-time availability updates, Google authentication, and a beautiful Material-UI interface.

![Tisha Booking](https://img.shields.io/badge/PWA-Ready-brightgreen) ![React](https://img.shields.io/badge/React-18+-blue) ![Firebase](https://img.shields.io/badge/Firebase-10+-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)

## ✨ Features

- **📱 PWA Support**: Install as a native app on Android/iOS
- **🔐 Authentication**: Email/Password and Google Sign-in
- **📅 Real-time Calendar**: Live availability updates via Firestore
- **👥 Role-based Access**: Customer and Owner dashboards
- **🎨 Beautiful UI**: Material-UI with custom theming
- **📴 Offline Support**: Cached hall data, sync when online
- **🔔 Notifications**: Push notifications for booking updates
- **🛡️ Secure**: Firebase security rules prevent double-booking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

### Installation

1. **Clone and install dependencies**

```bash
cd tisha-booking
npm install
```

2. **Set up Firebase**

   a. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   
   b. Enable the following services:
      - Authentication (Email/Password + Google)
      - Firestore Database
      - Hosting
      - Cloud Functions (requires Blaze plan for scheduled functions)
   
   c. Get your Firebase config from Project Settings > Your apps > Web app

3. **Configure environment variables**

   Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. **Initialize Firebase**

```bash
firebase login
firebase use --add  # Select your project
```

5. **Deploy Firestore rules and indexes**

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

6. **Seed sample data** (optional)

   Open Firebase Console > Firestore and manually add the sample hall data, or use the seed script:

```bash
# Install ts-node globally
npm install -g ts-node

# Run the seed script (requires Firebase Admin SDK)
ts-node scripts/seedData.ts
```

7. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📁 Project Structure

```
tisha-booking/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthModal.tsx    # Login/Signup modal
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingModal.tsx
│   │   ├── HallCard.tsx
│   │   ├── Layout.tsx       # App shell with navigation
│   │   └── SplashScreen.tsx
│   ├── pages/               # Page components
│   │   ├── HomeScreen.tsx   # Public hall view
│   │   ├── MyBookingsScreen.tsx
│   │   └── OwnerDashboard.tsx
│   ├── stores/              # Zustand state management
│   │   ├── authStore.ts
│   │   ├── bookingStore.ts
│   │   ├── hallStore.ts
│   │   └── uiStore.ts
│   ├── firebase/            # Firebase configuration
│   │   └── config.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── theme.ts             # MUI theme customization
│   └── index.css            # Global styles
├── functions/               # Firebase Cloud Functions
│   └── src/
│       └── index.ts
├── public/                  # Static assets
├── scripts/                 # Utility scripts
│   └── seedData.ts
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
├── firebase.json            # Firebase configuration
└── vite.config.ts           # Vite + PWA configuration
```

## 🔧 Configuration

### Firebase Security Rules

The app uses role-based security rules:

- **Public**: Read-only access to halls and availability
- **Customers**: Create bookings, read/write own data
- **Owners**: Full access to their halls and all bookings

### Cloud Functions

Located in `functions/src/index.ts`:

- `processBooking`: Validates new bookings, prevents double-booking
- `onBookingStatusChange`: Updates hall availability on status changes
- `cleanupPendingBookings`: Cancels old pending bookings (runs daily)
- `sendBookingReminders`: Sends reminders for tomorrow's bookings
- `healthCheck`: HTTP endpoint for monitoring

Deploy functions:

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## 📲 Native App with Capacitor

This project uses **Capacitor** to build native Android and iOS apps from the web codebase.

### Prerequisites for Native Development

- **Android**: Android Studio + Android SDK
- **iOS**: Xcode (macOS only) + CocoaPods

### Setup Android

```bash
# Install dependencies and add Android platform
npm install
npx cap add android

# Build and sync
npm run cap:sync

# Open in Android Studio
npm run cap:android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Connect your device or start an emulator
3. Click "Run" (▶️) to install the app

### Setup iOS (macOS only)

```bash
# Install dependencies and add iOS platform
npm install
npx cap add ios

# Install CocoaPods dependencies
cd ios/App && pod install && cd ../..

# Build and sync
npm run cap:sync

# Open in Xcode
npm run cap:ios
```

In Xcode:
1. Select your target device
2. Click "Run" (▶️) to install the app

### Capacitor Commands

```bash
npm run cap:sync          # Build web + sync to native projects
npm run cap:android       # Build, sync, and open Android Studio
npm run cap:ios           # Build, sync, and open Xcode
npm run cap:run:android   # Build and run on connected Android device
npm run cap:run:ios       # Build and run on connected iOS device
```

### Live Reload (Development)

For live reload during development, update `capacitor.config.ts`:

```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:5173',
  cleartext: true,
}
```

Then run `npm run dev` and `npx cap run android --livereload`.

### Publishing to Google Play Store

1. Generate a signed APK/AAB in Android Studio
2. Create a Google Play Console account
3. Upload the signed bundle

## 📲 PWA Installation (Browser)

### Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (⋮) and select "Add to Home screen"

### iOS (Safari)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

## 🎨 Customization

### Theme

Edit `src/theme.ts` to customize colors, typography, and component styles.

### Hall Data

Update the sample hall data in `scripts/seedData.ts` or directly in Firestore.

### Adding More Halls

The app is designed for scalability. Simply add more documents to the `halls` collection with the same schema.

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format with Prettier
```

### Using Firebase Emulators

For local development with emulators:

```bash
# Start emulators
firebase emulators:start

# In another terminal, set env and run dev
VITE_USE_EMULATORS=true npm run dev
```

## 📦 Deployment

### Firebase Hosting

```bash
# Build the app
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

The app will be available at `https://your-project.web.app`

### Custom Domain

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the DNS verification steps

## 🔒 Security Considerations

1. **Never commit `.env` files** - Added to `.gitignore`
2. **Review security rules** before production
3. **Enable App Check** for additional security
4. **Set up budget alerts** for Firebase usage
5. **Enable 2FA** on your Firebase account

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Credits

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Material-UI](https://mui.com/)
- [Firebase](https://firebase.google.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Calendar](https://github.com/wojtekmaj/react-calendar)

---

Built with ❤️ for function hall booking management.

