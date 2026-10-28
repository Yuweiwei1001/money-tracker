import 'react-native-reanimated';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@/src/store/AppDataContext';
import { colors } from '@/src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="transaction"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="budget" options={{ presentation: 'modal' }} />
          <Stack.Screen name="export" options={{ presentation: 'modal' }} />
        </Stack>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
