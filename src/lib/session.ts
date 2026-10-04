import * as SecureStore from 'expo-secure-store'
import { useSyncExternalStore } from 'react'
import { Platform } from 'react-native'

const ACCESS_KEY = 'amicus.accessToken'
const REFRESH_KEY = 'amicus.refreshToken'

/**
 * The signed-in session: an access token (an hour) and a refresh token.
 *
 * Persisted in the platform keystore (Keychain / Android Keystore), with an
 * in-memory copy so a render can read it synchronously — the keystore API is
 * async. `load()` runs once at startup and the root layout renders nothing until
 * it settles, so no screen ever runs against a session that is still being read.
 *
 * Web has no secure store, so it falls back to localStorage. That only exists to
 * keep `expo start --web` usable for quick UI previews; the real web client is
 * amicus-web.
 */
type Snapshot = { ready: boolean; signedIn: boolean }

let access: string | null = null
let refresh: string | null = null
let snapshot: Snapshot = { ready: false, signedIn: false }
const listeners = new Set<() => void>()

function publish() {
  snapshot = { ready: true, signedIn: access !== null }
  listeners.forEach((listener) => listener())
}

const store =
  Platform.OS === 'web'
    ? {
        get: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
        set: async (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
        remove: async (key: string) => globalThis.localStorage?.removeItem(key),
      }
    : {
        get: (key: string) => SecureStore.getItemAsync(key),
        set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        remove: (key: string) => SecureStore.deleteItemAsync(key),
      }

export const session = {
  accessToken: () => access,
  refreshToken: () => refresh,

  async load() {
    try {
      ;[access, refresh] = await Promise.all([store.get(ACCESS_KEY), store.get(REFRESH_KEY)])
    } catch {
      // An unreadable keystore (a restored device, a wiped keychain) is a signed-out
      // user, not a crash at launch.
      access = null
      refresh = null
    }
    publish()
  },

  set(accessToken: string, refreshToken?: string | null) {
    access = accessToken
    if (refreshToken) refresh = refreshToken
    publish()
    void store.set(ACCESS_KEY, accessToken).catch(() => {})
    if (refreshToken) void store.set(REFRESH_KEY, refreshToken).catch(() => {})
  },

  clear() {
    access = null
    refresh = null
    publish()
    void store.remove(ACCESS_KEY).catch(() => {})
    void store.remove(REFRESH_KEY).catch(() => {})
  },
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSession(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
}
