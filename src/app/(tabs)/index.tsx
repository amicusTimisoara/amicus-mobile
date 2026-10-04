import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'

import { Body, Card, CategoryTag, Centered, ErrorState, Muted, Screen, Title } from '@/components/ui'
import { api, describeError, type SpecialistSummary } from '@/lib/api'
import { color, space } from '@/theme'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; books: SpecialistSummary[] }

async function loadBooks(): Promise<State> {
  try {
    const events = await api.events()
    const details = await Promise.all(events.map((e) => api.event(e.slug)))
    // One „carte” can sit on several months' rosters; list each person once.
    const byId = new Map<string, SpecialistSummary>()
    for (const detail of details) {
      for (const book of detail.specialists) {
        if (!byId.has(book.specialistId)) byId.set(book.specialistId, book)
      }
    }
    const books = [...byId.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ro'))
    return { status: 'ready', books }
  } catch (err) {
    return { status: 'error', message: describeError(err) }
  }
}

/** The catalogue: every „carte” on a published event's roster. */
export default function BibliotecaScreen() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let live = true
    void loadBooks().then((next) => live && setState(next))
    return () => {
      live = false
    }
  }, [])

  function retry() {
    setState({ status: 'loading' })
    void loadBooks().then(setState)
  }

  async function refresh() {
    setRefreshing(true)
    setState(await loadBooks())
    setRefreshing(false)
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Biblioteca</Title>
        <Muted>Cărțile vii pe care le poți împrumuta.</Muted>
      </View>

      {state.status === 'loading' && (
        <Centered>
          <ActivityIndicator color={color.ink} />
        </Centered>
      )}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}
      {state.status === 'ready' && (
        <FlatList
          data={state.books}
          keyExtractor={(book) => book.specialistId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={color.ink} />
          }
          ListEmptyComponent={<Muted>Nu sunt cărți publicate încă.</Muted>}
          renderItem={({ item }) => (
            <Card>
              <Body style={styles.name}>{item.fullName}</Body>
              <Muted>{item.specialty}</Muted>
              <CategoryTag value={item.category} />
            </Card>
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md, gap: space.xs },
  list: { paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: space.md },
  name: { color: color.ink, fontSize: 17, fontWeight: '600' },
})
