import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0973cc97c6274e07b61ff15fdbf79651',
  appName: 'study-spark-mobile-android',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // This enables hot-reload for the mobile app directly from the Lovable sandbox.
    url: 'https://0973cc97-c627-4e07-b61f-f15fdbf79651.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  // To enable push notifications, install the @capacitor/push-notifications plugin:
  // npm install @capacitor/push-notifications --save
  // Then add PushNotifications to the plugins array below if needed.

  // For custom splash screens and icons, run:
  // npx capacitor assets generate
  // See documentation: https://capacitorjs.com/docs/guides/splash-screens-and-icons

  // For Haptics (vibration): npm install @capacitor/haptics
  // For StatusBar or other native plugins, install from https://capacitorjs.com/docs/apis

  // Add more platform-specific config below as you add plugins/features.
}

export default config;

// NEXT STEPS (Do these locally after git pulling):
// - To enable native notifications, run: npm install @capacitor/push-notifications --save
// - To enable device haptics: npm install @capacitor/haptics --save
// - To generate splash screens & app icons: npx capacitor assets generate
// - See https://capacitorjs.com/docs/apis for more device features (StatusBar, etc.)
// - After any plugin install, run: npx cap sync

// If running on a physical device, follow the steps in the Lovable mobile guide: https://lovable.dev/blogs/TODO
