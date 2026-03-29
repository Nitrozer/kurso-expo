import { useState } from 'react';
import { View, TextInput, Pressable, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { signIn } from '../../lib/auth';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FDF9F3' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative "Annotation." text */}
        <Text
          style={{
            position: 'absolute',
            top: 48,
            right: 48,
            fontFamily: 'Fraunces_300Light_Italic',
            fontSize: 64,
            color: colors.ink,
            opacity: 0.08,
          }}
        >
          Annotation.
        </Text>

        <View style={{ width: '100%', maxWidth: 380 }}>
          {/* K° Logo */}
          <View style={{ alignItems: 'center', marginBottom: 64 }}>
            <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 56, color: colors.ink }}>
              K<Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 40, color: colors.blue }}>°</Text>
            </Text>
          </View>

          {/* Heading */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 28, color: colors.ink, marginBottom: 8 }}>
              Bienvenue
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#5F5E5E' }}>
              Identifiez-vous pour acceder a vos manuscrits.
            </Text>
          </View>

          {/* Email Field */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#5F5E5E', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="etudiant@universite.fr"
              placeholderTextColor={colors.inkGhost}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: colors.ink,
                height: 56,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#E0D8CE',
                borderRadius: 14,
                backgroundColor: 'transparent',
              }}
            />
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#5F5E5E', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Mot de passe
            </Text>
            <View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.inkGhost}
                secureTextEntry={!showPassword}
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 14,
                  color: colors.ink,
                  height: 56,
                  paddingHorizontal: 16,
                  paddingRight: 48,
                  borderWidth: 1,
                  borderColor: '#E0D8CE',
                  borderRadius: 14,
                  backgroundColor: 'transparent',
                }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: 18 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.inkGhost} />
                ) : (
                  <Eye size={20} color={colors.inkGhost} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Se connecter button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{
              height: 56,
              backgroundColor: colors.ink,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: '#FDF9F3' }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </Pressable>

          {/* Mot de passe oublie */}
          <Pressable style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.blue }}>
              Mot de passe oublie
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 48 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(197,197,217,0.3)' }} />
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.inkGhost, letterSpacing: 2, textTransform: 'uppercase', marginHorizontal: 16 }}>
              Ou
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(197,197,217,0.3)' }} />
          </View>

          {/* Google button */}
          <Pressable
            style={{
              height: 56,
              borderWidth: 1,
              borderColor: '#C5C5D9',
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              backgroundColor: '#F7F3ED',
              marginBottom: 48,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink }}>
              Continuer avec Google
            </Text>
          </Pressable>

          {/* Create account */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#5F5E5E' }}>
              Nouveau ici ?{' '}
            </Text>
            <Link href="/(auth)/register">
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink }}>
                Creer un compte
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
