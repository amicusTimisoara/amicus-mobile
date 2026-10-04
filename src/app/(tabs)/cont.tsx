import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { Body, Button, Card, Centered, ErrorState, Muted, Screen, Title } from '@/components/ui'
import { API_BASE } from '@/lib/config'
import { api, describeError, type AccountInfo } from '@/lib/api'
import { session } from '@/lib/session'
import { color, space } from '@/theme'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; me: AccountInfo }

async function loadMe(): Promise<State> {
  try {
    return { status: 'ready', me: await api.me() }
  } catch (err) {
    return { status: 'error', message: describeError(err) }
  }
}

export default function ContScreen() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let live = true
    void loadMe().then((next) => live && setState(next))
    return () => {
      live = false
    }
  }, [])

  function retry() {
    setState({ status: 'loading' })
    void loadMe().then(setState)
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Title>Contul meu</Title>

        {state.status === 'loading' && (
          <Centered>
            <ActivityIndicator color={color.ink} />
          </Centered>
        )}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}
        {state.status === 'ready' && (
          <Card>
            <Body style={styles.name}>{state.me.displayName || state.me.email}</Body>
            {state.me.displayName && <Muted>{state.me.email}</Muted>}
            {state.me.isCarte && <Muted style={{ color: color.brand }}>Ești o „carte”</Muted>}
          </Card>
        )}

        {/* Bearer tokens are stateless, so signing out is forgetting them here. */}
        <Button title="Ieși din cont" variant="ghost" onPress={() => session.clear()} />

        {__DEV__ && <Muted style={styles.api}>API: {API_BASE}</Muted>}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: space.xl, gap: space.lg },
  name: { color: color.ink, fontSize: 18, fontWeight: '600' },
  api: { marginTop: 'auto', textAlign: 'center' },
})
