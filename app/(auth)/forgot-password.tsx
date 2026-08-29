import { useState } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { showAlert } from '../../lib/alert';
import { requestPasswordReset } from '../../lib/auth';
import { textPresets } from '../../theme/typography';
import { useColors } from '../../theme/useColors';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (error: any) {
      showAlert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.surfaceBright }}
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: 380 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 }}
        >
          <ArrowLeft size={18} strokeWidth={1.6} color={colors.inkBody} />
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.inkBody }}>
            Retour
          </Text>
        </Pressable>

        <Text style={[textPresets.heroName, { color: colors.ink, fontSize: 34, lineHeight: 38, marginBottom: 12 }]}>
          Mot de passe{'\n'}oublie
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>.</Text>
        </Text>

        {sent ? (
          <>
            <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 14, lineHeight: 22, color: colors.inkBody, marginBottom: 32 }}>
              Si un compte existe pour {email.trim()}, un lien de reinitialisation
              vient d'y etre envoye. Pensez a regarder vos indesirables.
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              style={{ height: 56, backgroundColor: colors.ink, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.darkText }}>
                Revenir a la connexion
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 14, lineHeight: 22, color: colors.inkBody, marginBottom: 32 }}>
              Entrez votre adresse e-mail : vous recevrez un lien pour choisir un
              nouveau mot de passe.
            </Text>

            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.inkBody, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Adresse e-mail
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              placeholderTextColor={colors.inkGhost}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: colors.ink,
                height: 56,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                borderRadius: 14,
                backgroundColor: 'transparent',
                marginBottom: 24,
              }}
            />

            <Pressable
              onPress={handleSend}
              disabled={loading}
              style={{ height: 56, backgroundColor: colors.ink, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: colors.darkText }}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}
