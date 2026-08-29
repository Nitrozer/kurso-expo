import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { createStorage } from './storage';
import 'react-native-url-polyfill/auto';

const storage = createStorage('supabase-auth');

const storageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => { storage.remove(key); },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // Sur web, le lien de reinitialisation renvoie le jeton dans le fragment
    // d'URL : sans ceci, supabase-js ne le lit pas et l'ecran de nouveau mot de
    // passe n'a pas de session. Sur natif il n'y a pas d'URL a inspecter.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
