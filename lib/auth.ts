import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import type { Profile } from '../types';

// URL vers laquelle Supabase renvoie apres le clic sur le lien de
// reinitialisation. Sur web c'est une vraie route, sur natif le lien profond
// kurso:// declare dans app.json.
function resetRedirectUrl() {
  return Platform.OS === 'web'
    ? `${window.location.origin}/reset-password`
    : Linking.createURL('/reset-password');
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetRedirectUrl(),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signUp(email: string, password: string, metadata?: { full_name: string; nickname: string; avatar_letter: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: metadata ? { data: metadata } : undefined,
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function createProfile(userId: string, fullName: string, nickname: string, avatarLetter: string): Promise<Profile> {
  // Use upsert because the trigger may have already created a skeleton profile
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, nickname, avatar_letter: avatarLetter })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'nickname' | 'avatar_letter'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
