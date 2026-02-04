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
- **In code:** Reference the story in PR title/description and commit message. Use the commit format `#TASK_ID - Brief description` (e.g. `#US-001 - Add login form`). See [GETTING-STARTED](../GETTING-STARTED.md) → "Commit messages". Optionally add a one-line comment or README in the feature folder: `Requirement: docs/requirements/[epic]/US-001-xxx.md`.

---

## Workflow: keep requirement docs updated

Follow these steps so requirement docs stay in sync whether you **develop from a User Story** or **document an existing feature as a User Story**. AI agents should apply the same updates when helping with either flow.

### When developing a feature from a User Story (US → code)

1. **Before starting work**
   - Open the US file: `docs/requirements/[epic]/US-###-[name].md`.
   - Set **Status** to **In Progress**.
   - Optionally use a branch name that includes the US id (e.g. `feature/US-001-login-form`).

2. **While working**
   - Use the commit format `#TASK_ID - Brief description` (e.g. `#US-001 - Add login form`). See [GETTING-STARTED](../GETTING-STARTED.md) → "Commit messages".
   - In the US file, ensure **Technical Notes** → `Feature folder:` matches the feature you are implementing (e.g. `src/features/Login`).

3. **When the PR is merged**
   - Set the US file **Status** to **Done**.
   - Update [INDEX.md](./INDEX.md): set the story’s Status to Done in the table.
   - If the epic has a README that lists stories, ensure the story’s status is updated there too.

### When documenting an existing feature as a User Story (code → US)

1. **Create the User Story**
   - Choose or create an epic folder under `requirements/[epic-name]/` (kebab-case).
   - Copy [US template](./example-epic/US-001-example-story.md) to `US-###-[short-name].md`.
   - Fill **Summary**, **Acceptance Criteria**, and **Technical Notes**.
   - In **Technical Notes**, set `Feature folder: src/features/[ExistingFeatureName]` (the feature that already exists).

2. **Register the story**
   - Add the story to the epic’s `README.md` (list of stories in this epic).
   - Add a row to [INDEX.md](./INDEX.md) (Epic | ID | Title | Status).
   - Set **Status** to **Done** (since the feature already exists).

3. **Optional: link from code to requirement**
   - In the feature folder, add a one-line reference: in a README or at the top of the main file, e.g. `Requirement: docs/requirements/[epic]/US-###-xxx.md`.

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
