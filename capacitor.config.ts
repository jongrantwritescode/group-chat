import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.grouptripplanner.app',
  appName: 'Group Trip Planner',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Browser: {
      presentationStyle: 'popover',
    },
  },
};

export default config;
