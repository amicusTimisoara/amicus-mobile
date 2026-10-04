/** Every slot is in Romania time — the events' zone — whatever the phone is set to. */
const ZONE = 'Europe/Bucharest'

const dayFormat = new Intl.DateTimeFormat('ro-RO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: ZONE,
})
const timeFormat = new Intl.DateTimeFormat('ro-RO', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: ZONE,
})

export function formatDay(iso: string): string {
  const text = dayFormat.format(new Date(iso))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso))
}
