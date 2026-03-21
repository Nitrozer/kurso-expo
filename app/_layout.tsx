import '../global.css';
import { useEffect } from 'react';
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

  const { session, isLoading, setSession, setProfile, setLoading } = useAuthStore();
  const segments = useSegments();

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Route protection
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
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
