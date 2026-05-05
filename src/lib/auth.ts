import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

export type OAuthProvider = 'google' | 'apple';

export async function signInWithProvider(provider: OAuthProvider): Promise<void> {
  const redirectTo = Capacitor.isNativePlatform()
    ? 'com.grouptripplanner.app://auth/callback'
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });

  if (error) throw error;

  if (Capacitor.isNativePlatform() && data?.url) {
    await Browser.open({ url: data.url, presentationStyle: 'popover' });
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Register the deep-link handler for native OAuth callback
App.addListener('appUrlOpen', async ({ url }) => {
  if (!url.includes('auth/callback')) return;

  try {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get('code');

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  } catch (err) {
    console.error('Error handling auth callback URL:', err);
  } finally {
    await Browser.close();
  }
});
