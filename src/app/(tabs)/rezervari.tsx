import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'

import { Body, Card, CategoryTag, Centered, ErrorState, Muted, Screen, Title } from '@/components/ui'
import { api, describeError, type BookingDetail, type BookingStatus } from '@/lib/api'
import { formatDay, formatTime } from '@/lib/format'
import { color, space } from '@/theme'

/** Same wording as the web client's reservations page. */
const STATUS_LABEL: Record<BookingStatus, string> = {
  Booked: 'Rezervarea ta',
  CheckedIn: 'Ai ajuns',
  Completed: 'Încheiată',
  Cancelled: 'Anulată',
  NoShow: 'Neprezentat',
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; bookings: BookingDetail[] }

async function loadBookings(): Promise<State> {
  try {
    const bookings = await api.myBookings()
    // Soonest first; a cancelled one sinks below everything still on.
    bookings.sort((a, b) => {
      const cancelled = Number(a.status === 'Cancelled') - Number(b.status === 'Cancelled')
      return cancelled || a.startsAt.localeCompare(b.startsAt)
    })
    return { status: 'ready', bookings }
  } catch (err) {
    return { status: 'error', message: describeError(err) }
  }
}

export default function RezervariScreen() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let live = true
    void loadBookings().then((next) => live && setState(next))
    return () => {
      live = false
    }
  }, [])

  function retry() {
    setState({ status: 'loading' })
    void loadBookings().then(setState)
  }

  async function refresh() {
    setRefreshing(true)
    setState(await loadBookings())
    setRefreshing(false)
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Rezervările mele</Title>
      </View>

      {state.status === 'loading' && (
        <Centered>
          <ActivityIndicator color={color.ink} />
        </Centered>
      )}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}
      {state.status === 'ready' && (
        <FlatList
          data={state.bookings}
          keyExtractor={(booking) => booking.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={color.ink} />
          }
          ListEmptyComponent={<Muted>Nu ai nicio rezervare încă.</Muted>}
          renderItem={({ item }) => {
            const cancelled = item.status === 'Cancelled'
            return (
              <Card style={cancelled && { opacity: 0.6 }}>
                <Muted style={{ color: cancelled ? color.inkMuted : color.liber }}>
                  {STATUS_LABEL[item.status].toUpperCase()}
                </Muted>
                <Body style={styles.when}>{formatDay(item.startsAt)}</Body>
                <Muted>
                  {formatTime(item.startsAt)}–{formatTime(item.endsAt)}
                  {item.location ? ` · ${item.location}` : ''}
                </Muted>
                <Body style={styles.name}>{item.specialistName}</Body>
                <CategoryTag value={item.category} />
              </Card>
            )
          }}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md },
  list: { paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: space.md },
  when: { color: color.ink, fontSize: 18, fontWeight: '600' },
  name: { color: color.ink, fontWeight: '600', marginTop: space.xs },
})
