import { API_BASE } from './config'
import { session } from './session'

/** Shapes mirror amicus-api's `Contracts.cs`. Dates arrive as ISO strings. */
export interface TokenResponse {
  tokenType: string
  accessToken: string
  expiresIn: number
  refreshToken: string
}

export interface EventSummary {
  id: string
  slug: string
  name: string
  startsOn: string
  endsOn: string
  timeZoneId: string
}

export interface SpecialistSummary {
  eventSpecialistId: string
  specialistId: string
  fullName: string
  specialty: string
  /** A `SpecialistCategory` name: "Medical", "Juridic", … */
  category: string
  /** A `StoryProfile` name, or null when the „carte” is untagged. */
  profile: string | null
  bio: string | null
  location: string | null
}

export interface EventDetail {
  event: EventSummary
  specialists: SpecialistSummary[]
}

export type BookingStatus = 'Booked' | 'Cancelled' | 'CheckedIn' | 'Completed' | 'NoShow'

export interface BookingDetail {
  id: string
  slotId: string
  startsAt: string
  endsAt: string
  status: BookingStatus
  topic: string | null
  checkInCode: string
  eventSlug: string
  eventName: string
  specialistName: string
  specialty: string
  category: string
  location: string | null
}

export interface AccountInfo {
  email: string
  displayName: string | null
  photoUrl: string | null
  isEmailConfirmed: boolean
  isCarte: boolean
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * One renewal at a time. A screen can fire several requests together; if the hour
 * has just run out they all 401 at once, and each starting its own refresh would
 * cost several round trips for one expiry. Identity's refresh tokens are stateless
 * (the previous one keeps working), so this is about waste, not correctness.
 */
let refreshing: Promise<boolean> | null = null

async function renew(): Promise<boolean> {
  const refreshToken = session.refreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      // The refresh token itself is expired or revoked: the one place that decides a
      // session is over.
      session.clear()
      return false
    }
    const body = (await res.json()) as TokenResponse
    session.set(body.accessToken, body.refreshToken)
    return true
  } catch {
    // Offline or the server is down: not evidence the session is dead, so keep it.
    return false
  }
}

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers)
  const token = session.accessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  // An expired hour should be invisible: renew and run the request again — but only
  // when a token was actually sent (a 401 without one just means "sign in"), and
  // only once.
  if (res.status === 401 && token && !retried) {
    // Another request already renewed while this one was in flight.
    if (session.accessToken() !== token) return request<T>(path, init, true)

    refreshing ??= renew().finally(() => {
      refreshing = null
    })
    if (await refreshing) return request<T>(path, init, true)

    // No refresh token at all (a session from before one was stored): clear it, so the
    // app shows signed out instead of half-signed-in.
    if (!session.refreshToken()) session.clear()
  }

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = (await res.json()) as { error?: string; detail?: string; title?: string }
      detail = body.error ?? body.detail ?? body.title ?? detail
    } catch {
      /* not JSON — keep the status text */
    }
    throw new ApiError(res.status, detail || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AccountInfo>('/account/me'),
  events: () => request<EventSummary[]>('/events'),
  event: (slug: string) => request<EventDetail>(`/events/${encodeURIComponent(slug)}`),
  myBookings: () => request<BookingDetail[]>('/bookings/mine'),
}

/** A message for the screen, in the app's language. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.'
}
