import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Eye, EyeOff } from 'lucide-react-native';
import { showAlert } from '../../lib/alert';
import { updatePassword } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { textPresets } from '../../theme/typography';
import { useColors } from '../../theme/useColors';

type Status = 'checking' | 'ready' | 'invalid';

export default function ResetPasswordScreen() {
  const colors = useColors();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>('checking');

  const incomingUrl = Linking.useURL();

  // Le lien de reinitialisation porte les jetons. Sur web, supabase-js les lit
  // seul via detectSessionInUrl ; sur natif il n'y a pas d'URL a inspecter, il
  // faut donc extraire les jetons du lien profond et ouvrir la session a la main.
  useEffect(() => {
    let cancelled = false;

    async function establish() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (!cancelled) setStatus('ready');
        return;
      }

      if (incomingUrl) {
        const fragment = incomingUrl.split('#')[1];
        const params = new URLSearchParams(fragment ?? incomingUrl.split('?')[1] ?? '');
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!cancelled) setStatus(error ? 'invalid' : 'ready');
          return;
        }
      }

      if (!cancelled) setStatus('invalid');
    }

    establish();
    return () => { cancelled = true; };
  }, [incomingUrl]);

  const handleSubmit = async () => {
    if (password.length < 6) {
      showAlert('Erreur', 'Le mot de passe doit faire au moins 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      showAlert('Erreur', 'Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      await supabase.auth.signOut();
      showAlert('Mot de passe modifie', 'Vous pouvez maintenant vous connecter.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      showAlert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.ink,
    height: 56,
    paddingHorizontal: 16,
    paddingRight: 48,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    backgroundColor: 'transparent',
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.surfaceBright }}
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: 380 }}>
        <Text style={[textPresets.heroName, { color: colors.ink, fontSize: 34, lineHeight: 38, marginBottom: 12 }]}>
          Nouveau{'\n'}mot de passe
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>.</Text>
        </Text>

        {status === 'checking' && (
          <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 14, color: colors.inkBody }}>
            Verification du lien...
          </Text>
        )}

        {status === 'invalid' && (
          <>
            <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 14, lineHeight: 22, color: colors.inkBody, marginBottom: 32 }}>
              Ce lien est invalide ou a expire. Les liens de reinitialisation ne
              sont valables qu'une heure. Demandez-en un nouveau.
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/forgot-password')}
              style={{ height: 56, backgroundColor: colors.ink, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.darkText }}>
                Demander un nouveau lien
              </Text>
            </Pressable>
          </>
        )}

        {status === 'ready' && (
          <>
            <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 14, lineHeight: 22, color: colors.inkBody, marginBottom: 32 }}>
              Choisissez un nouveau mot de passe, d'au moins 6 caracteres.
            </Text>

            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.inkBody, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Nouveau mot de passe
            </Text>
            <View style={{ marginBottom: 20 }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.inkGhost}
                secureTextEntry={!showPassword}
                style={inputStyle}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: 18 }}
              >
                {showPassword
                  ? <EyeOff size={20} color={colors.inkGhost} />
                  : <Eye size={20} color={colors.inkGhost} />}
              </Pressable>
            </View>

            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.inkBody, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Confirmer
            </Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              placeholderTextColor={colors.inkGhost}
              secureTextEntry={!showPassword}
              style={[inputStyle, { marginBottom: 24 }]}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={{ height: 56, backgroundColor: colors.ink, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.darkText }}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}
