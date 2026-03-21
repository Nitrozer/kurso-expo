import { useState } from 'react';
import { View, TextInput, Pressable, Text, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { signUp, createProfile } from '../../lib/auth';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarLetter, setAvatarLetter] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !nickname || !avatarLetter || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (avatarLetter.length !== 1) {
      Alert.alert('Erreur', 'La lettre d\'avatar doit être un seul caractère.');
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(email, password);
      if (data.session && data.user) {
        // Session is active, we can create the profile
        await createProfile(data.user.id, fullName, nickname, avatarLetter);
        router.replace('/(main)');
      } else if (data.user) {
        // Email confirmation might be required, or session will come via onAuthStateChange
        // Try creating profile with a small delay to let the session establish
        await new Promise(resolve => setTimeout(resolve, 1000));
        await createProfile(data.user.id, fullName, nickname, avatarLetter);
        router.replace('/(main)');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-parchment"
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-[400px]">
        {/* Logo */}
        <View className="flex-row items-baseline mb-xxxl self-center">
          <Text style={[textPresets.heroName, { color: colors.ink }]}>K</Text>
          <Text style={[textPresets.heroName, { fontFamily: 'Fraunces_300Light_Italic', color: colors.blue, fontSize: 32 }]}>°</Text>
        </View>

        {/* Full name */}
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-md bg-parchment"
          placeholder="Nom complet"
          placeholderTextColor={colors.inkGhost}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />

        {/* Nickname */}
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-md bg-parchment"
          placeholder="Prénom (Bonjour X.)"
          placeholderTextColor={colors.inkGhost}
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="words"
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />

        {/* Avatar letter */}
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-md bg-parchment"
          placeholder="Lettre d'avatar (1 caractère)"
          placeholderTextColor={colors.inkGhost}
          value={avatarLetter}
          onChangeText={(text) => setAvatarLetter(text.slice(0, 1).toUpperCase())}
          maxLength={1}
          autoCapitalize="characters"
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />

        {/* Email */}
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-md bg-parchment"
          placeholder="Email"
          placeholderTextColor={colors.inkGhost}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />

        {/* Password */}
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-xl bg-parchment"
          placeholder="Mot de passe"
          placeholderTextColor={colors.inkGhost}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />

        {/* Button */}
        <Pressable
          className="w-full bg-dark rounded-xl py-md items-center"
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.darkText }}>
            {loading ? 'Création du compte...' : 'Créer un compte'}
          </Text>
        </Pressable>

        {/* Link to login */}
        <Link href="/(auth)/login" className="mt-lg self-center">
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.blue }}>
            Déjà un compte ? Se connecter
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
