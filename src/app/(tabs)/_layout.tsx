import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { color } from '@/theme'

/** Native tab bars: UITabBar on iOS, Material bottom navigation on Android. */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={color.raised}
      indicatorColor={color.sunken}
      labelStyle={{ selected: { color: color.ink } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Biblioteca</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }}
          md="menu_book"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rezervari">
        <NativeTabs.Trigger.Label>Rezervări</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="event" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cont">
        <NativeTabs.Trigger.Label>Cont</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="account_circle"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
