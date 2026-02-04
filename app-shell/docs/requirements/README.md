# Requirements — User Stories & Change Requests

This folder holds **User Stories (US)** and **Change Requests (CR)** so requirements stay in sync with the codebase. Use it for traceability, onboarding, and keeping CRs as amendments to the original story.

---

## Conventions

### Epic folders

- **Naming:** Use **kebab-case** (e.g. `user-management`, `billing-dashboard`, `dashboard`).
- **Location:** One folder per epic under `requirements/[epic-name]/`.
- **Contents:** Epic `README.md` (overview + list of stories), then `US-###-[short-name].md` and `US-###-CR-###.md`.

### User Stories

- **File name:** `US-###-[short-name].md` (e.g. `US-001-login-form.md`, `US-002-todo-list.md`).
- **Numbering:** Sequential within the epic (US-001, US-002, …). Optionally use a prefix per epic (e.g. 100s for billing) if you have many epics.
- **Template:** See [example epic](./example-epic/US-001-example-story.md). Include: Status, Summary, Acceptance Criteria, Technical Notes, Change Requests table, History table.

### Change Requests (CRs)

- **File name:** `US-###-CR-###.md` — CRs are **per story** and sit next to the story (e.g. `US-001-CR-001.md`).
- **Purpose:** Record the amendment (original vs amended). The **US file is the current requirement**; when a CR is applied, update the US file and keep the CR file as the amendment record.
- **Template:** See [example CR](./example-epic/US-001-CR-001.md).

### Status workflow

- **Status values:** Draft | In Review | Approved | In Progress | Done | Deprecated
- **When to update:**  
  - Set to **In Progress** when you start work on the story.  
  - Set to **Done** when the PR that implements it is merged.  
  - Update the US `.md` when a CR is applied (so the US file always reflects the current requirement).

### Traceability (code ↔ requirements)

- **In the US:** Under "Technical Notes", set `Feature folder: src/features/[FeatureName]` and link to related docs.
- **In code:** Reference the story in PR title/description and commit message (e.g. `US-001`, `docs/requirements/example-epic/US-001-example-story.md`). Optionally add a one-line comment or README in the feature folder: `Requirement: docs/requirements/[epic]/US-001-xxx.md`.

---

## How to add a User Story

1. Choose or create an epic folder (kebab-case).
2. Add `US-###-[short-name].md` (copy from [US template](./example-epic/US-001-example-story.md)).
3. Fill Status, Summary, Acceptance Criteria, Technical Notes.
4. Add the story to the epic's `README.md` and to [INDEX.md](./INDEX.md) (or the table in this README).

---

## How to add a Change Request

1. Create `US-###-CR-###.md` in the **same epic folder** as the story.
2. Fill the CR template: Related US, Summary, Original vs Amended, Acceptance Criteria delta, Impact.
3. **Update the US file** so it reflects the new requirement (the US file is the canonical current version).
4. In the US file, add a row to the "Change Requests" table linking to the CR file.

---

## Non-functional requirements (NFRs)

Cross-cutting requirements (e.g. "All API calls use base query from `src/api/`", "Support RTL") can live in:

- **`requirements/nfr/`** — one file per NFR (e.g. `NFR-001-api-base-query.md`), or
- **`requirements/GLOBAL-REQUIREMENTS.md`** — single file listing NFRs.

Link from this README when you add them.

---

## Index of User Stories

See [INDEX.md](./INDEX.md) for a table of all user stories (Epic | ID | Title | Status). Update it when adding or closing stories.
