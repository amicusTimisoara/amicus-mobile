import type { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { category, color, radius, space } from '@/theme'

/** A full screen on the page colour, inset from the notch and the status bar. */
export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  )
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, style]}>{children}</Text>
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Button({
  title,
  onPress,
  busy = false,
  variant = 'primary',
}: {
  title: string
  onPress: () => void
  busy?: boolean
  variant?: 'primary' | 'ghost'
}) {
  const primary = variant === 'primary'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonGhost,
        (pressed || busy) && { opacity: 0.7 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={primary ? color.onInverse : color.ink} />
      ) : (
        <Text style={[styles.buttonText, { color: primary ? color.onInverse : color.ink }]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

export function Field({ label, ...input }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={color.inkMuted}
        selectionColor={color.brand}
        style={styles.input}
        {...input}
      />
    </View>
  )
}

export function CategoryTag({ value }: { value: string }) {
  const tone = category[value]
  if (!tone) return null
  return (
    <View style={[styles.tag, { backgroundColor: tone.bg }]}>
      <Text style={[styles.tagText, { color: tone.fg }]}>{tone.label.toUpperCase()}</Text>
    </View>
  )
}

/** Loading, and a failed load with a way to try again — every list screen needs both. */
export function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.centered}>{children}</View>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Centered>
      <Body style={{ textAlign: 'center' }}>{message}</Body>
      <View style={{ marginTop: space.lg, alignSelf: 'stretch' }}>
        <Button title="Încearcă din nou" variant="ghost" onPress={onRetry} />
      </View>
    </Centered>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.page },
  title: { color: color.ink, fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  body: { color: color.inkSoft, fontSize: 16, lineHeight: 22 },
  muted: { color: color.inkMuted, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: color.raised,
    borderColor: color.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  buttonPrimary: { backgroundColor: color.inverse },
  buttonGhost: { borderColor: color.lineMid, borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  field: { gap: space.xs },
  label: { color: color.inkSoft, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderColor: color.lineMid,
    borderWidth: 1,
    backgroundColor: color.raised,
    color: color.ink,
    fontSize: 16,
    paddingHorizontal: space.md,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
})
