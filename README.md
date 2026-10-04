# amicus-mobile

Mobile client for AMiCUS Timișoara („Biblioteca Vie”). Talks to
[amicus-api](https://github.com/amicusTimisoara/amicus-api), the same backend as
[amicus-web](https://github.com/amicusTimisoara/amicus-web).

**Stack:** Expo SDK 57 · React Native 0.86 · TypeScript · expo-router (native tabs) ·
React Compiler · a **dev client**, so custom Swift/Kotlin modules are first-class ·
Bun · oxlint.

## Layout

| Path | What |
|---|---|
| `src/app/` | Routes. `_layout` reads the session and gates on it; `login`; `(tabs)/` = Biblioteca, Rezervări, Cont |
| `src/lib/api.ts` | API client: bearer token, silent refresh on 401 (single-flight), typed endpoints |
| `src/lib/session.ts` | Access + refresh tokens in Keychain / Android Keystore (`expo-secure-store`) |
| `src/lib/config.ts` | Which API the build talks to |
| `src/theme.ts` | Design tokens — amicus-web's dark palette |
| `modules/` | Custom native modules (Swift/Kotlin) — see its README |

`ios/` and `android/` are **not committed**: `expo prebuild` generates them from
`app.json` + config plugins (Continuous Native Generation), and EAS does that on every build.

## Run it

```bash
bun install
bun start:go     # Expo Go — works while there are no custom native modules
bun start        # dev client — needs a dev build installed on the device/simulator
```

EAS project: [`@amicus-timisoara/amicus`](https://expo.dev/accounts/amicus-timisoara/projects/amicus)
(org `amicus-timisoara`; `owner` + `extra.eas.projectId` in `app.json`).

Dev build: `eas build --profile development --platform android|ios`
(`development-simulator` for the iOS simulator), or locally with `bun run android`
(Android SDK) / `bun run ios` (Mac + Xcode).

## Which API

`EXPO_PUBLIC_API_BASE`, inlined at bundle time. EAS profiles: `development` and
`preview` → `https://stage.thorsp.net`, `production` → `https://api.thorsp.net` —
the same stage/prod split as the web. Locally it defaults to stage; override with
`EXPO_PUBLIC_API_BASE=… bun start` or a `.env.local`.

## Checks

`bun run lint` · `bun run typecheck` · `bun run doctor`. CI (`lint, typecheck &
bundle`) also bundles the JS for iOS and Android, and is required to merge into `main`.

## Open before the first store build

- **Bundle ID / package** `ro.amicustimisoara.app` is a placeholder — it is permanent
  once an app is published, so pick it for the real domain first.
- **Google sign-in:** native Google Sign-In, using the existing web OAuth client as the
  `serverClientId`, should yield ID tokens amicus-api already accepts — verify when added.
