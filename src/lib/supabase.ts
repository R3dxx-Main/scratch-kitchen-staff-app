/**
 * Connection to the Scratch Kitchen Supabase project.
 *
 * The publishable key is meant to live inside the app: it only works together with
 * a staff sign-in, because every table only lets signed-in staff read or write it
 * (see supabase/setup.sql). Public sign-ups are turned off in the Supabase project,
 * so only people added under Authentication → Users can sign in.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://rznxjqqunggahsltkmue.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_6bRnu_5bzOoyAqxCPjVwYg_3G9EpQ7i';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Keep the sign-in fresh only while the app is on screen.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
