import '../global.css';
import { useEffect, useState, useCallback } from 'react';
import { Slot, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import type { Session } from '@supabase/supabase-js';

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

  const [initialSession, setInitialSession] = useState<Session | null | undefined>(undefined);

  const handleAuthChange = useCallback(async (session: Session | null) => {
    useAuthStore.getState().setSession(session);
    if (session?.user) {
      const profile = await getProfile(session.user.id);
      useAuthStore.getState().setProfile(profile);
    } else {
      useAuthStore.getState().setProfile(null);
    }
  }, []);

  // Initialize auth once
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
      setInitialSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthChange]);

  // Navigate once when everything is ready
  useEffect(() => {
    if (initialSession === undefined || !fontsLoaded) return;

    SplashScreen.hideAsync();

    if (initialSession) {
      router.replace('/(main)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [initialSession, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;
  if (initialSession === undefined) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
