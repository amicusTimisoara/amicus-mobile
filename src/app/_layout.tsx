import { DarkTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

import { session, useSession } from '@/lib/session'
import { color } from '@/theme'

void SplashScreen.preventAutoHideAsync()

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: color.page,
    card: color.raised,
    text: color.ink,
    border: color.line,
    primary: color.brand,
  },
}

/**
 * Root: reads the stored session, then routes by it. `Stack.Protected` makes the
 * signed-in and signed-out halves mutually exclusive, so signing in or out simply
 * swaps them — no screen has to redirect by hand.
 */
export default function RootLayout() {
  const { ready, signedIn } = useSession()

  useEffect(() => {
    void session.load()
  }, [])

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  // Keep the splash up until the keystore has answered: rendering earlier would
  // flash the sign-in screen at someone who is already signed in.
  if (!ready) return null

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.page } }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  )
}
