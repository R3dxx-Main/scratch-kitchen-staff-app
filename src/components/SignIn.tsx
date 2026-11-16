// Staff sign-in, shown until someone signs in.
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../data/auth';
import { colors, fonts } from '../theme';
import { InstallTip } from './InstallTip';
import { Button, Card, Field, Muted, Notice } from './ui';

export function SignIn() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Type your email and password.');
    setBusy(true);
    setError(null);
    const msg = await signIn(email, password);
    setBusy(false);
    if (msg) setError(msg);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[st.top, { paddingTop: insets.top + 8 }]}>
        <Image source={require('../../assets/logo.png')} accessibilityLabel="Scratch Kitchen logo" style={st.logoSmall} />
        <Text style={st.topTitle}>Staff Hub</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo.png')} accessibilityLabel="" style={st.logo} />
          <Text accessibilityRole="header" style={st.h1}>
            Sign in
          </Text>
          <Muted style={{ textAlign: 'center', marginBottom: 20 }}>Use the email and password your manager set up for you.</Muted>
          <Card style={{ gap: 14, width: '100%', maxWidth: 440 }}>
            <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="username" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={submit} returnKeyType="go" />
            {error && <Notice text={error} tone="warn" />}
            <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy} big />
          </Card>
          <Muted style={{ textAlign: 'center', marginTop: 18, maxWidth: 440 }}>No account yet? Ask your manager to add you.</Muted>
          <InstallTip />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  top: { backgroundColor: colors.red, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoSmall: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.white },
  topTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.white },
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 110, height: 110, borderRadius: 55, marginBottom: 14 },
  h1: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginBottom: 4 },
});
