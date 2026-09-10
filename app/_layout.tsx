import { 
  useFonts,
  ChakraPetch_300Light,
  ChakraPetch_400Regular,
  ChakraPetch_500Medium,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold 
} from '@expo-google-fonts/chakra-petch';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Text, TextInput } from 'react-native';

// @ts-ignore
if (Text.defaultProps == null) Text.defaultProps = {};
// @ts-ignore
Text.defaultProps.style =  { fontFamily: 'ChakraPetch_400Regular', letterSpacing: 0.5 };

// @ts-ignore
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
// @ts-ignore
TextInput.defaultProps.style =  { fontFamily: 'ChakraPetch_400Regular', letterSpacing: 0.5 };

import { useColorScheme } from '@/components/useColorScheme';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ChakraPetch_300Light,
    ChakraPetch_400Regular,
    ChakraPetch_500Medium,
    ChakraPetch_600SemiBold,
    ChakraPetch_700Bold
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // useRootNavigationState is undefined until the navigator has fully mounted.
  // This is the official Expo Router pattern to avoid "navigate before mount" errors.
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    // Wait until the navigator is mounted before making any routing decisions
    if (!rootNavState?.key || !isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timeoutId = setTimeout(() => {
      if (!user && !inAuthGroup) {
        // Not logged in and not on an auth screen → go to login
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        // Logged in and still on auth screen → go to the app
        router.replace('/(tabs)');
      }
    }, 1);

    return () => clearTimeout(timeoutId);
  }, [user, segments, rootNavState?.key, router, isInitialized]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Product Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
