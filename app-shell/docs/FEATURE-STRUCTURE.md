# Feature Structure & Folder Organization

How to organize features under `src/features/`: flat by default, with optional subfolders only when complexity justifies it.

## Principles

1. **Prefer flat** — Keep files at the feature root. Avoid extra folders (`components/`, `hooks/`, etc.) unless the feature is large.
2. **Name by role, not by type** — Use `[FeatureName]Page.tsx`, `[FeatureName]Search.tsx`, `[FeatureName]Grid.tsx`, `[FeatureName]AddEditDrawer.tsx` at the **root** of the feature. Do not group them in a `components/` folder.
3. **Fewer folders** — Do not organize by “category” (components vs hooks vs utils) unless the feature has many files and the team needs that separation.
4. **Condition-based** — Start with the **simple** structure; move to the **complex** structure only when the checklist below says so.

---

## When to Use Which Structure

Use the **simple (flat)** structure by default. Switch to the **complex (subfolders)** structure only when **at least two** of the following are true:

| Criterion | Simple (flat) | Complex (subfolders) |
|-----------|----------------|----------------------|
| **Hooks** | Few (e.g. &lt; 8–10) | Many (e.g. 10+) |
| **Business domains** | Single (e.g. one entity or one flow) | Multiple (e.g. users + permissions + settings in one feature) |
| **UI surface** | One main screen + a few pieces (search, grid, drawer) | Multiple dialogs, tabs, wizards, or many forms |
| **Team** | Small / solo | Several people working in the same feature |
| **Tests** | A few test files | Many tests (hooks, utils, components) needing clear separation |

**Rule of thumb:** If you’re unsure, use the **simple** structure. Add subfolders when the feature folder becomes hard to scan or when multiple people need clear boundaries (e.g. “all hooks here”).

---

## Simple Structure (default)

All feature files at the **root** of the feature folder. No `components/` or `hooks/` subfolders.

**Path:** `src/features/[FeatureName]/`

**Example:** `src/features/TermsAndConditions/`

```
TermsAndConditions/
├── index.ts                              # Entry point & public exports
├── TermsAndConditionsPage.tsx            # Main page/screen
├── TermsAndConditionsSearch.tsx          # Search/filter UI
├── TermsAndConditionsGrid.tsx            # List/table UI
├── TermsAndConditionsAddEditDrawer.tsx   # Create/edit UI
├── constants.ts                          # Feature constants & enums
├── useTermsAndConditionsController.ts    # Main controller/business logic
├── useGetTermsAndConditions.ts           # API: fetch
├── useSaveTermsAndConditions.ts          # API: create
├── useUpdateTermsAndConditions.ts        # API: update
├── utils.ts                              # Non-hook helpers (or 1–2 named files)
└── TermsAndConditions.test.tsx           # Tests (next to code or one test file)
```

- **No `[module]`** — Use `features/TermsAndConditions/` unless you have a strong product/module grouping (see “Module folder” below).
- **No `components/`** — Page, Search, Grid, Drawer are siblings; names make their role clear.
- **Tests** — One or a few test files at feature root (e.g. `TermsAndConditions.test.tsx` or `TermsAndConditionsPage.test.tsx`). No `__tests__/` unless the feature is complex.

### Sub-feature (same idea, flat)

```
TermsAndConditions/
├── ... (files above)
└── VersionHistory/
    ├── index.ts
    ├── VersionHistoryPage.tsx
    ├── VersionHistoryList.tsx
    ├── useVersionHistoryController.ts
    └── VersionHistory.test.tsx
```

Sub-feature is also flat: no `components/` or `hooks/` inside `VersionHistory/`.

---

## Complex Structure (subfolders only when needed)

Use this when the feature is large and **at least two** of the criteria in the table above apply (many hooks, multiple domains, complex UI, larger team, many tests).

**Path:** `src/features/[FeatureName]/`

**Example:** `src/features/UserManagement/`

```
UserManagement/
├── index.ts
├── UserManagementPage.tsx
├── UserManagementSearch.tsx
├── UserManagementGrid.tsx
├── UserManagementAddEditDrawer.tsx
├── constants.ts
├── hooks/
│   ├── useUserManagementController.ts
│   ├── useGetUsers.ts
│   ├── useSaveUser.ts
│   ├── useUpdateUser.ts
│   ├── useGetPermissions.ts
│   └── useUpdatePermissions.ts
├── utils/
│   ├── validation.ts
│   └── formatters.ts
├── types/
│   └── index.ts
└── __tests__/
    ├── UserManagement.test.tsx
    ├── hooks/
    └── utils/
```

- **Main UI stays at root** — Page, Search, Grid, Drawer remain at feature root (no `components/` folder).
- **Subfolders** — Use `hooks/`, `utils/`, `types/`, `__tests__/` only to group many files. Do not add them “just in case.”

---

## Module folder (`[module]`)

**Use a module folder** when you have a clear product or area grouping, e.g.:

- `features/billing/Invoices/`
- `features/billing/Subscriptions/`
- `features/portalSettings/TermsAndConditions/`
- `features/portalSettings/PrivacyPolicy/`

**Skip the module folder** when:

- You have one app and no strong product boundaries.
- Features don’t naturally group under a parent name.

Then use **`features/[FeatureName]/`** directly (e.g. `features/TermsAndConditions/`).

---

## Naming conventions

| Kind | Pattern | Example |
|------|---------|---------|
| Page/screen | `[FeatureName]Page.tsx` | `TermsAndConditionsPage.tsx` |
| UI pieces | `[FeatureName][Role].tsx` | `TermsAndConditionsSearch.tsx`, `TermsAndConditionsGrid.tsx`, `TermsAndConditionsAddEditDrawer.tsx` |
| Controller hook | `use[FeatureName]Controller.ts` | `useTermsAndConditionsController.ts` |
| API hooks | `useGet[Entity].ts`, `useSave[Entity].ts`, `useUpdate[Entity].ts`, `useDelete[Entity].ts` | `useGetTermsAndConditions.ts` |
| Constants | `constants.ts` | `constants.ts` |
| Utils | `utils.ts` or `[name].ts` | `utils.ts`, `validation.ts` |
| Tests | `[FeatureName].test.tsx` or `[FileName].test.tsx` | `TermsAndConditions.test.tsx` |
| Entry | `index.ts` | Re-exports public API of the feature |

Use the same pattern for sub-features (e.g. `VersionHistoryPage.tsx`, `useVersionHistoryController.ts`).

---

## Summary

- **Default:** Simple, flat feature root; `[FeatureName]Page.tsx`, `[FeatureName]Search.tsx`, etc. at root; no `components/` folder.
- **When to add subfolders:** Only when at least two of: many hooks, multiple domains, complex UI, larger team, many tests.
- **Module folder:** Only when you have a real product/module grouping; otherwise `features/[FeatureName]/` is enough.
- **Sub-features and tests:** Same flat-first approach; use `__tests__/` (and hooks/utils subfolders) only in the complex case.
