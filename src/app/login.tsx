import { Image } from 'expo-image'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { Body, Button, Field, Muted, Screen, Title } from '@/components/ui'
import { ApiError, api, describeError } from '@/lib/api'
import { session } from '@/lib/session'
import { color, space } from '@/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!email.trim() || !password) {
      setError('Completează emailul și parola.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const tokens = await api.login(email.trim(), password)
      // The root layout's guard sees the new session and swaps to the tabs.
      session.set(tokens.accessToken, tokens.refreshToken)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Email sau parolă greșite.'
          : describeError(err),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityIgnoresInvertColors
            />
            <Muted>AMiCUS Timișoara · Biblioteca Vie</Muted>
          </View>

          <Title>Intră în cont</Title>
          <Body>Ca să vezi calendarul și să rezervi o întâlnire.</Body>

          <View style={styles.form}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <Field
              label="Parolă"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
            />
            {error && <Body style={{ color: color.danger }}>{error}</Body>}
            <Button title="Intră în cont" onPress={submit} busy={busy} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: space.xl, gap: space.md },
  brand: { alignItems: 'center', gap: space.sm, marginBottom: space.xl },
  logo: { width: 72, height: 68 },
  form: { gap: space.lg, marginTop: space.lg },
})
