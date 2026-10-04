/**
 * Which API this build talks to. The EAS build profiles set it (development and
 * preview → stage, production → prod) — the same split as amicus-web, where main
 * deploys to stage and a release to prod.
 *
 * `EXPO_PUBLIC_*` values are inlined into the JS bundle when it is built, so a
 * change needs a new bundle, not just an app restart.
 */
export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? 'https://stage.thorsp.net').replace(
  /\/$/,
  '',
)
