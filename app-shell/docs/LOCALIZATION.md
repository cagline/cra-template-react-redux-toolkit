# Localization (i18n)

The shell uses **i18next** and **react-i18next** for translations. Remote modules share the same i18n instance via Module Federation so language changes in the shell apply everywhere.

## Shell setup

- **Config:** `src/utils/i18n.ts` — initializes i18n with `i18next-http-backend` and loads JSON from `public/locales/`.
- **Entry:** `src/index.tsx` imports `./utils/i18n` before rendering the app.
- **Translations:** `public/locales/<lng>/translation.json` (e.g. `en`, `de`).

Current languages: **en**, **de**. The Topbar language dropdown calls `i18n.changeLanguage(lng)`.

## Adding a new language

1. Add a folder under `public/locales/`, e.g. `public/locales/fr/`.
2. Add `translation.json` in that folder with the same key structure as `en/translation.json`.
3. In the Topbar (or wherever you drive language), add the new language to the list and ensure `i18n.changeLanguage` is called when the user selects it.

## Adding or editing translation keys

1. Edit `public/locales/en/translation.json` (and other locale files) with the same keys.
2. In components, use:
   ```ts
   import { useTranslation } from 'react-i18next';
   const { t } = useTranslation();
   // ...
   t('some.key')                    // simple
   t('some.key', { name: 'World' }) // interpolation {{name}}
   ```
3. Keys are nested by object structure, e.g. `app.title`, `moduleA.title`, `moduleB.dashboard`.

## Remote modules and i18n

Remotes **do not** initialize their own i18n. They use the **shared** i18n instance from the shell:

1. **Module Federation** — In shell and remote `vite.config.ts`, `i18next` and `react-i18next` are in `shared` with **singleton: true** so only one instance exists (the shell’s).
2. **Remote code** — Remotes add `i18next` and `react-i18next` as dependencies and use `useTranslation()` and `t()` in their components. They must **not** call `i18n.init()` or create a separate i18n instance.
3. **Translation files** — All translations live in the **shell’s** `public/locales/`. Remotes use a namespace prefix (e.g. `moduleA.*`, `moduleB.*`) so keys don’t clash. Example in a remote:
   ```ts
   const { t } = useTranslation();
   t('moduleA.title')
   t('moduleB.dashboard')
   ```

When the user changes language in the shell’s Topbar, `i18n.changeLanguage()` runs on the shared instance, and all shell and remote components using `useTranslation()` re-render with the new language.

## Key layout in translation.json

- **Shell:** `app.*`, `todo.*`, `counter.*`, `dashboard`, `error.*`.
- **Module A:** `moduleA.*` (e.g. `moduleA.title`, `moduleA.teamsOverview`).
- **Module B:** `moduleB.*` (e.g. `moduleB.title`, `moduleB.recentReports`).

Add new keys under the appropriate prefix and keep en/de (and any other locales) in sync.

## Interpolation

Use double curly braces in JSON and pass an object to `t()`:

```json
"moduleA.loggedInAs": "Logged in as: {{name}}",
"moduleA.members": "{{count}} members"
```

```ts
t('moduleA.loggedInAs', { name: user?.name ?? 'Guest' })
t('moduleA.members', { count: 12 })
```

## If remotes don’t update on language change

- Ensure **singleton: true** for `i18next` and `react-i18next` in **both** shell and remote `vite.config.ts` federation `shared` config.
- Rebuild shell and remotes after changing shared config; then test again.

See [MICRO_UI_ARCHITECTURE.md](./MICRO_UI_ARCHITECTURE.md) for more on shared dependencies and remotes.
