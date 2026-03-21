import '../global.css';
import { useEffect, useRef } from 'react';
import { Slot, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fraunces_900Black,
  Fraunces_700Bold,
  Fraunces_300Light_Italic,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { getProfile } from '../lib/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_900Black,
    Fraunces_700Bold,
    Fraunces_300Light_Italic,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const segments = useSegments();
  const hasNavigated = useRef(false);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const profile = await getProfile(newSession.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
      hasNavigated.current = false; // allow re-navigation on auth change
    });
    return () => subscription.unsubscribe();
  }, []);

  // Route protection — only navigate once per auth state change
  useEffect(() => {
    if (isLoading || !fontsLoaded || hasNavigated.current) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      hasNavigated.current = true;
      router.replace('/(main)');
    }
  }, [session, isLoading, fontsLoaded, segments]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  if ((!fontsLoaded && !fontError) || isLoading) return null;

  return <Slot />;
}
