import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SignIn } from '../components/SignIn';
import { AuthProvider, useAuth } from '../data/auth';
import { StoreProvider } from '../data/store';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Gate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/** Shows the sign-in screen until a staff member is signed in. */
function Gate() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;
  if (!session) return <SignIn />;

  // A fresh store for each signed-in person, so nobody sees the last person's screens.
  return (
    <StoreProvider key={session.user.id}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'none' }}>
      <Stack.Screen name="orders/edit" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="orders/customer" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="needs/add" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="outputs/print" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="customers/edit" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </StoreProvider>
  );
}
