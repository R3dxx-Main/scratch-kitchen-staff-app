// In the web version only: how to put the app on the home screen like a real app.
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

function isInstalled() {
  if (typeof window === 'undefined') return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
}

export function InstallTip() {
  if (Platform.OS !== 'web' || isInstalled()) return null;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const apple = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in document);
  const android = /Android/i.test(ua);
  const steps = apple
    ? 'In Safari, tap the Share button (the square with an arrow), then Add to Home Screen.'
    : android
      ? 'In Chrome, tap the ⋮ menu, then Add to Home screen or Install app.'
      : 'In Chrome or Edge, click the install icon at the right of the address bar.';
  return (
    <View accessibilityRole="summary" style={st.box}>
      <Text style={st.title}>Put Scratch Kitchen on your home screen</Text>
      <Text style={st.text}>{steps} It then opens full screen with the logo, like an app.</Text>
    </View>
  );
}

const st = StyleSheet.create({
  box: { width: '100%', maxWidth: 440, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, gap: 4, marginTop: 18 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
});
