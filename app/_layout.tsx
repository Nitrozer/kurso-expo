import '../global.css';
import { useEffect, useState } from 'react';
import { Slot, router } from 'expo-router';
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

  const [isReady, setIsReady] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  // Initialize auth once
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      }
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigate once when ready
  useEffect(() => {
    if (!isReady || !fontsLoaded) return;

    SplashScreen.hideAsync();
    const session = useAuthStore.getState().session;

    if (session) {
      router.replace('/(main)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isReady, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;
  if (!isReady) return null;

  return <Slot />;
}
