const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

export default {
  expo: {
    name: IS_DEV ? 'Capitalia Dev' : IS_PREVIEW ? 'Capitalia Preview' : 'Capitalia',
    slug: 'capitalia',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV 
        ? 'com.cr8297408.capitalia.dev' 
        : IS_PREVIEW 
          ? 'com.cr8297408.capitalia.preview'
          : 'com.cr8297408.capitalia'
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser'
    ],
    experiments: {
      typedRoutes: true
    },
    updates: {
      url: 'https://u.expo.dev/f8efdedc-ff46-425c-b25a-6bbcd3bde2af'
    },
    runtimeVersion: {
      policy: 'appVersion'
    },
    extra: {
      router: {},
      eas: {
        projectId: 'f8efdedc-ff46-425c-b25a-6bbcd3bde2af'
      },
      // Variables de entorno accesibles desde la app
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      appName: process.env.EXPO_PUBLIC_APP_NAME || 'Capitalia',
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.2'
    },
    android: {
      package: IS_DEV 
        ? 'com.cr8297408.capitalia.dev' 
        : IS_PREVIEW 
          ? 'com.cr8297408.capitalia.preview'
          : 'com.cr8297408.capitalia',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff'
      }
    },
    owner: 'cr8297408'
  }
};
