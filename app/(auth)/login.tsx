import { useState } from 'react';
import { View, TextInput, Pressable, Text, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { signIn } from '../../lib/auth';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(main)');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-parchment items-center justify-center px-xxl">
      <View className="w-full max-w-[400px]">
        {/* Logo */}
        <View className="flex-row items-baseline mb-xxxl self-center">
          <Text style={[textPresets.heroName, { color: colors.ink }]}>K</Text>
          <Text style={[textPresets.heroName, { fontFamily: 'Fraunces_300Light_Italic', color: colors.blue, fontSize: 32 }]}>°</Text>
        </View>

        {/* Inputs */}
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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.darkText }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </Pressable>

        {/* Link to register */}
        <Link href="/(auth)/register" className="mt-lg self-center">
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.blue }}>
            Pas encore de compte ? S'inscrire
          </Text>
        </Link>
      </View>
    </View>
  );
}
