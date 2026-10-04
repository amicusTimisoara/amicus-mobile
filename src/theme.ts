/**
 * AMiCUS design tokens: the dark palette from amicus-web's `src/index.css`.
 *
 * Mobile is dark-only for now. When it gains a light theme, take web's light
 * tokens rather than inventing new values, so the two clients stay one product.
 */
export const color = {
  page: '#17140f',
  raised: '#201c16',
  sunken: '#2a251e',
  ink: '#f3ede4',
  inkSoft: '#c9bfb2',
  inkMuted: '#948a7c',
  line: '#322c24',
  lineMid: '#4a423a',
  brand: '#f2454a',
  liber: '#4ade80',
  danger: '#f87171',
  inverse: '#f3ede4',
  onInverse: '#1f1b16',
} as const

/** Keyed by the server's `SpecialistCategory` name. Labels match the web client. */
export const category: Record<string, { label: string; fg: string; bg: string }> = {
  Spiritual: { label: 'Spiritual', fg: '#a78bfa', bg: '#2a2145' },
  Mentorat: { label: 'Mentorat', fg: '#2dd4bf', bg: '#12332f' },
  Medical: { label: 'Medical', fg: '#fb923c', bg: '#3a2314' },
  Juridic: { label: 'Juridic', fg: '#60a5fa', bg: '#16263f' },
  Cariera: { label: 'Carieră', fg: '#f472b6', bg: '#3a1626' },
  Social: { label: 'Social', fg: '#94a3b8', bg: '#262b33' },
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const
