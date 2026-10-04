# Native modules

Custom Swift / Kotlin code lives here, one folder per module, written with the
[Expo Modules API](https://docs.expo.dev/modules/overview/). Expo autolinks every
module in this folder — no registration step.

```bash
bunx create-expo-module@latest --local <name>   # scaffolds modules/<name>/{ios,android,src}
```

A new or changed module needs a **new dev build** (`eas build --profile development`):
JS reloads instantly, native code only arrives with a build. Once a module exists,
Expo Go can no longer run the app — use the dev client (`bun start`).
