# Frontend Component Implementation Specs — Vue 3 SPA

> Phase-by-phase build specification for every frontend component catalogued in
> [frontend-verified-components.md](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/frontend-verified-components.md),
> layered on top of the route scaffolding in
> [routes-specs.md](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/routes-specs.md).
>
> **Scope:** this document plans *component bodies, state, and cross-cutting infrastructure*. The 37 route stubs and the
> shell already exist. This is the "fill in the stubs" plan.
>
> **Architecture (approved):** Pinia for state, Axios for the API client. Both are **not yet installed** — Phase 0 adds them.

---

## 0. Architecture resolutions (legacy-grounded)

The four open decisions from the audit are resolved here by reading the legacy Laravel/Vue 2 source. **Rule: replicate legacy behavior and scope exactly.**

### R1 — `HomeView`: empty landing page, *not* a dashboard, *not* a redirect

- **Legacy ground truth:** [`routes/web.php:24`](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/timetabling_laravel/routes/web.php) →
  `Route::middleware('auth')->get('/', fn() => view('home'))`. The view
  [`resources/views/home.blade.php`](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/timetabling_laravel/resources/views/home.blade.php)
  extends the app layout and its `@section('content')` is an **empty** `container-fluid`/`row`. `HomeController@index` also just returns `view('home')`.
- **Decision:** `HomeView.vue` renders the authenticated shell (`AppLayout`) with an **empty content region**. Do **not** build dashboard widgets. Do **not** redirect `/` to another route — legacy landed the user on an empty home. Route `meta.title` should read `Beranda`, not `Dashboard` (the legacy page had no dashboard concept).
- **Allowed minimum:** an optional passive welcome heading is acceptable (legacy showed literally nothing); no data fetching, no KPIs.

### R2 — Auth flows: **login + logout only**

- **Legacy ground truth:** `Auth::routes()` is **commented out** ([`web.php:38,55`](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/timetabling_laravel/routes/web.php)). Only three auth routes are registered and functional:
  - `GET /login` → `LoginController@showLoginForm`
  - `POST /login` → `LoginController@login`
  - `POST /logout` → `LoginController@logout`
  - `LoginController` redirects to `RouteServiceProvider::HOME` (`/`) after login; `guest` middleware on everything except logout.
- Register / Forgot-password / Reset / Confirm-password / Email-verification **controllers exist** in `app/Http/Controllers/Auth/` but have **no registered routes** — they are dead code, unreachable in the running app.
- **Decision:** Implement **only** login and logout. **Do not** build registration, password reset, or email verification screens. New users are provisioned exclusively through the admin `UserController` CRUD (Section E / Phase 3). After login → redirect to `home` (or `redirect` query param if present). Logout → POST, then redirect to `login`.

### R3 — Schedule validation: **client-side**, recreated in a composable + TS models

- **Legacy ground truth:** Placement/render/validation logic lives entirely in the browser:
  [`resources/js/services/TimeTableServices.js`](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/timetabling_laravel/resources/js/services/TimeTableServices.js)
  orchestrating three model classes under `resources/js/models/`:
  - `dbRef.js` — reference data cache (activities, rooms) loaded from `GET /timetable-data`.
  - `schedule.js` — the schedule state: table view per day, inserted / not-inserted / conflicts, add/remove placement, `getInserted()` for saving.
  - `selectedEdit.js` — **all manual-placement validation rules** live in `checkValidation()`: room-code match, room-type match, capacity vs. quota, room availability window, lecturer time-clash + lecturer unavailability, course "bentrok" conflict (same jurusan/tingkat/konsentrasi/class for wajib courses), parent/child room occupancy.
  - The server-side `ValidateServices.js` is trivial (just alerts on a `GET` result) — the real logic is client-side.
- **Backend responsibilities (kept on the API):** generate the schedule (`POST /timetable` → `TableController@getAlgorithm`), initial schedule (`GET /getInitSchedule`), ref data (`GET /timetable-data`), persist (`POST /save-table`), and admin revalidate/reset (`GET /activity/revalidate`, `/activity/reset`).
- **Decision:** Recreate the client model as one authoritative TypeScript module — `useSchedule` composable wrapping ported `Schedule` / `SelectedEdit` / `DBRef` classes. Placement validation stays **client-side** (identical rules to `selectedEdit.checkValidation`). The board never re-implements validation inline; it calls the composable. Backend is called only for generate / init / ref-data / save / revalidate.

### R4 — `ActivityTypes`: rename `roomType` → `activityType`

- **Legacy ground truth:** [`ActivityTypesFieldsComponent.vue:20`](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/timetabling_laravel/resources/js/components/activity_types/ActivityTypesFieldsComponent.vue)
  declares `props: { roomType: Object }` — a copy-paste artifact from `RoomTypesFieldsComponent`. The entity is **name-only** (`{ id, name }`), served by `ActivityTypeController` as a plain resource.
- **Decision:** In the SPA the prop/model is named `activityType` (type `{ id?: number; name: string }`). It maps 1:1 to the same backend `activity_types` structure — only the local identifier changes. Data flow is otherwise identical to `RoomTypes` (name-only CRUD).

### Naming reconciliation (supersedes routes-specs.md)

The older `routes-specs.md` referenced `DefaultLayout` and `src/layouts/`. The **implemented** repo uses:
- `src/layout/` (singular) for the shell.
- `AppLayout.vue` (not `DefaultLayout.vue`) as the authenticated shell.
- `src/views/LoginView.vue` (not `src/views/auth/LoginView.vue`).

**This document uses the implemented names.** Do not create `DefaultLayout`, `AppHeader`, or `AppBreadcrumb`.

---

## Phase overview

| Phase | Theme | Depends on | Blocks |
| --- | --- | --- | --- |
| **0** | Cross-cutting setup: Pinia, Axios, auth store, toast/confirm, API layer, types | — | all |
| **1** | Core shell & layouts: wire `AppTopbar`/`AppMenu`/`AuthLayout` to real auth + login | 0 | 2–4 |
| **2** | Base UI & shared primitives: list/table/dialog/overlay wrappers | 0, 1 | 3, 4 |
| **3** | Constraint controls + domain resource forms/details (all CRUD slices) | 0–2 | — |
| **4** | Scheduling board (Timetable feature slice) | 0–2 | — |

Phases 3 and 4 are independent of each other and can proceed in parallel once Phase 2 lands.

---

## Phase 0 — Cross-cutting setup

**Goal:** every dependency and singleton service the components rely on. No visual features yet; after this phase the app boots with a working auth store (backed by the API), global toast + confirm, and a typed Axios client.

### Dependencies to install

```bash
npm i pinia axios
# PrimeVue services (ToastService, ConfirmationService) ship with primevue@4.5 — no extra install
```

### Files to CREATE

| File | Purpose | Notes |
| --- | --- | --- |
| `src/stores/auth.ts` | `useAuthStore` (Pinia) | State: `user`, `isAuthenticated`, `isAdmin`. Actions: `login(credentials)`, `logout()`, `fetchUser()`. Replaces Blade `Auth` / `User::isAdmin()`. Persists session (see auth strategy below). |
| `src/lib/api.ts` | Axios instance | `baseURL` from `import.meta.env.VITE_API_URL`, `withCredentials: true`, JSON headers. Request interceptor attaches token/CSRF; response interceptor maps 401→logout+redirect, 422→field errors, 403→toast. Replaces the raw `fetch` + Laravel CSRF coupling in legacy services. |
| `src/services/*.ts` | Typed endpoint modules | One per domain (`lecturers`, `courses`, `rooms`, `activities`, `settings`, `semesters`, `results`, `prodis`, `roomTypes`, `activityTypes`, `users`, `timetable`). Each exports CRUD + custom endpoints. **Endpoint contracts come from `routes/web.php` + legacy `services/*.js`** (see mapping table below). |
| `src/types/*.ts` | Domain DTO interfaces | `Lecturer`, `Course`, `Room`, `Activity`, `Setting`, `Semester`, `Result`, `Prodi`, `RoomType`, `ActivityType` (`{id,name}`), `User`, plus `schedule.ts` types for the board. |
| `src/composables/useToast.ts` | Thin re-export/helper over PrimeVue `useToast` | Standard success/error/warn helpers so components don't repeat severity/life config. Replaces Blade flash. |
| `src/composables/useConfirm.ts` | Helper over PrimeVue `useConfirm` | Standard confirm(message, accept) wrapper. Replaces native `confirm()` and the legacy revalidate/force-insert modals' trigger. |
| `src/composables/useApiForm.ts` | Form submit + 422 error-mapping helper | Holds `errors` ref keyed by field; consumed by every resource form to render field-level `Message`s. Replaces Blade inline `@error`. |
| `.env` / `.env.example` | `VITE_API_URL` | Points at the decoupled Laravel API. |

### Files to UPDATE

| File | Change |
| --- | --- |
| `src/main.ts` | `app.use(createPinia())`; register `ToastService` + `ConfirmationService`; mount `<Toast/>` + `<ConfirmDialog/>` once (in `App.vue`). Keep existing PrimeVue theme config. |
| `src/App.vue` | Add global `<Toast />` and `<ConfirmDialog />` alongside `<RouterView/>`. |
| `src/router/index.ts` | Replace hardcoded `isAuthenticated = true` / `isAdmin = true` (`index.ts:86-87`) with `useAuthStore()` reads. Same for `src/router/guards.ts` stubs. |

### PrimeVue integration
`ToastService`, `ConfirmationService` (plugins) + `Toast`, `ConfirmDialog` (components, mounted once globally).

### State / data-flow considerations
- **Auth strategy:** the legacy app used Laravel session cookies + CSRF. For the decoupled SPA, standardize on **cookie-based session (`withCredentials`) with CSRF token**, OR bearer token in the store — pick one in `api.ts` and keep it single-sourced. The store is the only owner of auth state; guards and `AppMenu` read from it (fixes the hardcoded `isAdmin` in `AppMenu.vue:7`).
- **`isAdmin`** mirrors legacy `isAdmin` middleware (`web.php` uses `['auth','isAdmin']` on timetable/semesters/prodis/room-types/activity-types/users). The store's `isAdmin` must gate exactly those routes (already tagged `requiresAdmin` in the route modules).

### Legacy endpoint → service mapping (source of truth for `src/services/`)

| Service module | Endpoints (from `web.php` + legacy JS) |
| --- | --- |
| `lecturers.ts` | `resource('lecturers')`; `excel-lecturer` (download), `excel-lecturer-time`, `uploads-lecturer`, `uploads-lecturer-time` (2 import types). |
| `courses.ts` | `resource('courses')`; `courseInfo/{id}`, `konsentrasi/{id}`, `courselist/{id}` (dependent fetch); `excel-course`, `uploads-course`. |
| `rooms.ts` | `resource('rooms')`; `excel-room`, `uploads-room`. |
| `activities.ts` | `resource('activities')`; `activities/sems/{sems}`, `activities/data/{id}`; `excel-activities`, `uploads-activities`, `AllActivityExcel` (2 import types). |
| `settings.ts` | `resource('settings')`. |
| `semesters.ts` | `resource('semesters')`; `semesters/next`, `semesters/duplicate`, `semesters-current` (PUT), `semester-delete` (DELETE). |
| `results.ts` | `resource('results')`; `export-siakad/{id}`, `download-print/{id}`, `uploads-excel-result-update`. |
| `prodis.ts` | `resource('prodis')`. |
| `roomTypes.ts` | `resource('roomTypes')`. |
| `activityTypes.ts` | `resource('activityTypes')`. |
| `users.ts` | `resource('users')` (admin). |
| `timetable.ts` | `timetable-data`, `getInitSchedule`, `POST timetable` (generate), `save-table`, `activity/revalidate`, `activity/reset`, `show-timetable/{id}`. |

### DELETE
None. (No legacy files live in the new project; the Laravel app is the reference, not a build input.)

---

## Phase 1 — Core shell & layouts

**Goal:** the shell components already scaffolded (`AppLayout`, `AppTopbar`, `AppSidebar`, `AppMenu`, `AppMenuItem`, `AppFooter`, `BreadCrumb`, `AuthLayout`) become *functional* against the Phase 0 auth store, and login works end-to-end. After this phase: unauthenticated users see login; authenticated users see the shell with the empty home; logout works; admin menu filtering is real.

### Files to UPDATE

| File | Change | Legacy parity |
| --- | --- | --- |
| `src/views/LoginView.vue` | Build the login form: `InputText` (email), `Password`, `Checkbox` (remember), submit `Button`, error `Message`. Calls `authStore.login()`, then redirects to `redirect` query or `home`. | `auth/login.blade.php` + `LoginController`. **Login only** (R2). |
| `src/layout/AppTopbar.vue` | Add account menu (`Menu` + `Button`/avatar) with a **Logout** item → `authStore.logout()` → redirect `login`. | Blade header account dropdown + `POST /logout`. |
| `src/layout/AppMenu.vue` | Replace `const isAdmin = ref(true)` (`AppMenu.vue:7`) with `storeToRefs(useAuthStore()).isAdmin`. Filtering logic already correct. | `AllNavComponent` + `isAdmin` middleware. |
| `src/views/HomeView.vue` | Render **empty** content per **R1**. Optional passive heading only. No data, no widgets, no redirect. | `home.blade.php` (empty). |
| `src/router/index.ts`, `guards.ts` | Already slated in Phase 0 to read the store; verify guard behavior: guest→home when authed, auth→login when not, admin→home when not admin. | `web.php` middleware groups. |

### Files to CREATE
None — the shell is fully scaffolded. Confirm `AppFooter` logo assets exist under `src/assets/`; if referenced legacy logos are missing, add them (asset-only, no component work).

### PrimeVue integration
`InputText`, `Password`, `Checkbox`, `Button`, `Message` (login); `Menu`, `Button`/`Avatar` (topbar account); `Breadcrumb` optional backing for `BreadCrumb`.

### State / props / composable considerations
- **`HomeView`** takes no props and fetches nothing (R1).
- **`AppTopbar`** reads `authStore.user` for the display name; logout action is the only mutation.
- **`AppMenu`** is now fully store-driven; the `MenuItemType.adminRequired` flags already encode the legacy `isAdmin` route gating.
- **`LoginView`** uses `useApiForm` for 422 mapping; disables submit while pending; shows a single top-level error `Message` for invalid-credentials (legacy behavior — one flash, not field errors).

### `meta.title` correction
Change the home route `meta.title` from `'Dashboard'` to `'Beranda'` (R1 — there is no dashboard).

---

## Phase 2 — Base UI & shared primitives

**Goal:** the reusable layer (Section B of the audit) that every domain view composes. Build these before the domain views so Phase 3/4 just wire config.

### Files to CREATE (`src/components/base/`)

| Component | Replaces (legacy) | PrimeVue basis | Key props / slots / emits |
| --- | --- | --- | --- |
| `ResourceListLayout.vue` | `IndexPageComponent` + `KeyValueIndexComponent` (🔀) | `Card`, `Button` | Props: `title`, `createTo?`, `createLabel?`. Slots: `#actions` (import/export), default (table/content). `KeyValueIndex` = this with a 1-col table config — **no separate component**. |
| `ResourceTable.vue` | `TableComponent` | **`DataTable`** + `Column`, `Paginator` | Props: `rows`, `columns` (incl. nested-field accessor), `actions` (view/edit/delete), `loading`. Emits: `view`, `edit`, `delete`. **No jQuery DataTables, no HTML-form deletion** — deletion routes through `ConfirmActionDialog`. |
| `ImportDialog.vue` | `UploadComponent` | `Dialog` + **`FileUpload`** | Props: `visible` (v-model), `endpoints` (array — supports the 2-import-type cases: lecturers time/base, activities data/base). Emits: `uploaded`. API-driven result feedback via toast. |
| `DownloadMenu.vue` | `DownloadComponent` | **`SplitButton`** / `Menu` | Props: `items` (template vs. data export). Prefer split-button over a modal. |
| `ConfirmActionDialog.vue` | `RevalidateComponent`, `ForceInsertModalComponent`, all `confirm()` (🔀) | **`ConfirmDialog`** + `ConfirmationService` | Standard confirm; a variant carries **progress/result** state for revalidate + force-insert (both need in-flight feedback). Exposes an imperative `confirm({message, accept, withProgress})`. |
| `LoadingOverlay.vue` | `LoaderComponent` | **`ProgressSpinner`** + `BlockUI` | Props: `active`, `label?` (default `"MENUNGGU…"`). Driven by request/action state — **not** jQuery show/hide. |

### PrimeVue integration
`DataTable`, `Column`, `Paginator`, `Card`, `Button`, `Dialog`, `FileUpload`, `SplitButton`, `Menu`, `ConfirmDialog`, `ProgressSpinner`, `BlockUI`.

### State / props / composable considerations
- These are **controlled, config-driven** components — no domain knowledge inside them. Column/action config is passed in per domain.
- `ResourceTable` supports **nested-field accessors** (e.g. `course.name`) because legacy tables displayed related-model fields.
- `ImportDialog.endpoints` is an array precisely to preserve the legacy **two-import-type** flows (lecturers, activities). Single-import domains pass a one-element array.
- `ConfirmActionDialog` is the single home for delete confirmation, semester actions, results delete, revalidate, reset, and force-insert — everywhere legacy used `confirm()` or a bespoke modal.
- `LoadingOverlay` state should come from Axios interceptors or per-action `loading` refs, exposed via a small `useLoading` pattern if global blocking is needed (legacy "MENUNGGU…" was global).

### DELETE
Do **not** port `public/css/components/multiple-input.css` or any Bootstrap/jQuery asset.

---

## Phase 3 — Constraint controls & domain forms

**Goal:** the repeatable/complex form controls (Section D) plus every domain's form body, detail body, and index config (Section E). This completes all non-scheduling CRUD.

### 3A — Constraint & selection controls (`src/components/controls/`)

| Component | Legacy source | Used by | PrimeVue basis / note |
| --- | --- | --- | --- |
| `RepeatableRows.vue` | (generic base for the 5 below) | all repeatable lists | Generic add/remove/reorder host with a typed row `#row` slot. Built first so the five lists are thin. |
| `TimeRangeList.vue` | `MultipleTimeSlotComponent` | Lecturer form | Rows: day (`Select`) / start (`DatePicker` time) / end. Two instances: unavailable + preferred (`type` differentiates — legacy `lecturer_times.type` incl. `"Priority"`). Emits typed `TimeRange[]`. |
| `DayGapList.vue` | `MultipleDaySlotComponent` | Activity form | Rows: activity (`Select`) / min-gap-day (`InputNumber`). |
| `CourseConflictList.vue` | `MultipleCoursesComponent` | Course form | Prohibited-course rows; reloads options when program changes (loading state). |
| `SemesterConflictList.vue` | `MultipleSemesterComponent` | Course form | Prohibited-semester rows (1–8). |
| `ConcentrationList.vue` | `ConsentrationComponent` | Prodi form | Repeatable free-text `InputText` rows. |
| `HierarchySelector.vue` | `TreeViewComponent` + `TreeNodeComponent` (🔀) | Settings form | Cascading checkbox tree → **`Tree`** `selectionMode="checkbox"`. |
| `ActivityPickList.vue` | `MultiListComponent` | Settings form | Searchable dual-list → **`PickList`**. |
| `CheckboxGroup.vue` *(maybe inline)* | `MultipleCheckComponent` + `CustomCheckComponent` (🔀) | Settings form | `Checkbox` group + header "select all". Likely inline — build only if reused. |

**Emit contract (all):** controlled components emitting **typed values** (arrays of IDs / time-range objects / strings) via `v-model`. **Never** hidden JSON inputs (legacy used hidden inputs; the SPA uses reactive state).

### 3B — Resource form/detail bodies (`src/components/<domain>/`)

Each `*FormView` / `*ShowView` route stub composes a form/detail body inside the existing `CRUPage`. `CRUPage` already provides breadcrumb, header icon, back link, card, `#error` slot, and the `type: 'Buat' | 'Ubah' | 'Detil'` prop (`CRUPage.vue:7-11`).

| Domain | Create/Update | Detail | Fields to preserve (from legacy) | Special controls |
| --- | --- | --- | --- | --- |
| **Activities** | `ActivityFormFields` | `ActivityDetail` | Semester selector, course-derived info (`activities/sems/{sems}` fetch), multiple rooms/room-types/lecturers/parallels, min-day-gap rows | `DayGapList`, `Select`/`MultiSelect` |
| **Courses** | `CourseFormFields` | `CourseDetail` | Program/type/semester/concentration; dependent concentration+course fetch (`konsentrasi/{id}`, `courselist/{id}`, `courseInfo/{id}`); no-clash by semester & by course | `SemesterConflictList`, `CourseConflictList` |
| **Lecturers** | `LecturerFormFields` | `LecturerDetail` | NIK/name/alias; unavailable + preferred time slots. **Two import types.** | `TimeRangeList` ×2, `ImportDialog` (2 endpoints) |
| **Rooms** | `RoomFormFields` | `RoomDetail` | Code/owner/campus/building/floor/capacity/parent/type; six-day availability grid | `Select` (parent/type), availability grid |
| **Prodi** | `ProdiFormFields` | — | Name/faculty/degree; color; concentrations | **`ColorPicker`**, `ConcentrationList` |
| **Room Types** | *(inline in view)* | — | Name only | `ResourceListLayout` + simple form |
| **Activity Types** | *(inline in view)* | — | Name only. **Model/prop named `activityType`** (R4) | inline form |
| **Users** | `UserFormFields` | — | Name/email/password/faculty. **Rule: a user cannot delete their own account.** | admin-only |
| **Settings** | `SettingFormFields` | — | Named setting for current semester; program/activity/room/room-type/day/time restrictions or special-activity selection | `HierarchySelector`, `ActivityPickList`, `CheckboxGroup` |
| **Semesters** | `SemesterActions` (inline page) | — | **No form/detail.** add-next / mark-current / reset-current / duplicate — each a confirmed, blocking action | `ConfirmActionDialog` + `LoadingOverlay` |
| **Results** | `ResultActions` (inline page) | — | **No form/detail.** import updated results, export SIAKAD, printable download, open snapshot, delete result | `ImportDialog`, `DownloadMenu`, `ConfirmActionDialog` |

**Index bodies** (`ActivitiesIndexComponent`, `CoursesIndexComponent`, …) are **not ported** — each index view = `ResourceListLayout` + `ResourceTable` with per-domain column/action config.

### Files to UPDATE
All `*IndexView.vue`, `*FormView.vue`, `*ShowView.vue` stubs across `master-data/`, `scheduling/{activities,settings,results}`, `pengaturan/`, `users/` — replace the placeholder `<h1>` with the composed body described above. `FormView`s read `route.params.id` to toggle `type` `'Buat'` vs `'Ubah'` (and drive `CRUPage`).

### PrimeVue integration
`Select`, `MultiSelect`, `DatePicker`, `InputText`, `InputNumber`, `Checkbox`, `ColorPicker`, `Tree`, `PickList`, `Button`, `Message` — plus the Phase 2 primitives.

### State / props / composable considerations
- **Dependent fetches** (course→concentration→course list; semester→activity info) are the trickiest parity point. Model as `watch`ers on the driving field that call the service module and repopulate dependent `Select` options, showing the control's loading state (legacy `MultipleCoursesComponent` did this).
- **Forms** use `useApiForm` for submit + 422 field-error mapping into `CRUPage`'s `#error` slot and per-field `Message`s.
- **Users self-delete guard:** the delete action in the users index must disable/hide when `row.id === authStore.user.id` (legacy `UserController` rule).
- **Delete everywhere** flows through `ConfirmActionDialog` (Phase 2) → service `destroy` → toast → refresh.

---

## Phase 4 — Scheduling board

**Goal:** the bespoke Timetable feature slice (Section F), replicating the legacy **client-side** schedule model and validation (**R3**). Self-contained; not generic CRUD.

### Files to CREATE

**Composable + model (`src/composables/` + `src/lib/schedule/`):**

| File | Ports (legacy) | Responsibility |
| --- | --- | --- |
| `src/composables/useSchedule.ts` | `TimeTableServices.js` | Orchestration state: current day, current setting, `schedule`, history stack + index, edit mode, selected-edit, ref data. Actions mirror legacy methods: `getAllRefData`, `getInitSchedule`, `initData`, `changeDay`, `startEditMode`, `setCurrentSelectedEdit`, `addSchedule`, `removeSchedule`, `saveTimeTable`, `generateTimeTable`, `changeHistorySet`, `getStatus`. |
| `src/lib/schedule/DBRef.ts` | `models/dbRef.js` | Reference cache (activities, rooms) from `GET /timetable-data`. |
| `src/lib/schedule/Schedule.ts` | `models/schedule.js` | Table view per day, inserted / not-inserted / conflicts, add/remove placement, `getInserted()` for save. |
| `src/lib/schedule/SelectedEdit.ts` | `models/selectedEdit.js` | **All placement validation** in `checkValidation()`: room-code/room-type match, capacity vs quota, room availability window, lecturer clash + unavailability, course "bentrok" (jurusan/tingkat/konsentrasi/class for wajib), parent/child room occupancy, force-insert toggle. **Port rules verbatim.** |
| `src/types/schedule.ts` | — | TS types for activity/room/slot/schedule payloads. |

**Board components (`src/components/scheduling/`):**

| Component | Legacy source | Responsibility | PrimeVue |
| --- | --- | --- | --- |
| `SchedulingBoard.vue` | `TimeTableIndexComponent` | Orchestrates weekday, loading/flash, board, history, setting profile, generate/edit/save, read-only result mode, validation lock. Hosts `useSchedule`. | — |
| `TimetableGrid.vue` | `TimeTableComponent` | Room × time-slot grid; normal render + edit-mode slot decomposition, placement validation calls, manual removal, force-insert trigger. **6 days × 17 hourly cols (07:00–24:00)**, variable cell spans for duration. | — |
| `DayTabs.vue` | `DaysComponent` | Mon–Sat selector | **`Tabs`** / `SelectButton` |
| `ActivityHoverCard.vue` | `CourseHoverComponent` | Pointer-positioned course/class/session/room/quota/lecturers summary | — |
| `ManualSchedulingPanel.vue` | `EditTableComponent` | Draggable side panel: unplaced-activity list, search, details, select, force toggle | `Drawer`/floating panel, `InputText` search |
| `PlacementDiagnostics.vue` | `EditTableHoverComponent` | Pointer-positioned validation-failure message card (reads `checkValidation().messages`) | — |
| `ScheduleFlashBanner.vue` | `FlashMessageComponent` | Completeness/save/generation status | **`Message`** |
| `ScheduleActions.vue` | `GenerateButton`, `SaveButton`, `EditToggleButton`, `PengaturanButton`, `HistoryButton` (🔀) | Toolbar: generate / save / edit-toggle / setting-profile / history-snapshot | `Button`, `SplitButton`/`Select` (history) |
| *(force-insert)* | `ForceInsertModalComponent` | Reuse Phase 2 `ConfirmActionDialog`, preserving activity/slot context | `ConfirmDialog` |

### Files to UPDATE
- `src/views/scheduling/timetable/TimetableView.vue` — host `SchedulingBoard` in **editable** mode (admin; route already `requiresAdmin`).
- `src/views/scheduling/timetable/TimetableShowView.vue` — host `SchedulingBoard`/`TimetableGrid` in **read-only result mode** (`show-timetable/{id}`), non-admin allowed.

### PrimeVue integration
`Tabs`/`SelectButton`, `Button`, `SplitButton`, `Select`, `Message`, `Drawer`, `ConfirmDialog`, `ProgressSpinner`/`BlockUI` (validation lock).

### State / props / composable considerations (parity-critical)
- **Single authoritative model:** all validation/render goes through `useSchedule` + the ported classes. Components never re-derive placement rules inline (**R3**).
- **Grid geometry:** 6 days × 17 hourly columns 07:00–24:00; a placed activity spans `duration` columns. `col` is 0-based from 07:00 (legacy `start = col + 7`).
- **Validation lock:** board controls are blocked until activities are revalidated (legacy admin `activity/revalidate`); model via a `locked` flag + `LoadingOverlay`/`BlockUI`.
- **Edit vs. read-only:** `SchedulingBoard` takes a `mode: 'edit' | 'result'` prop. Result mode disables placement, generate, save.
- **History:** the composable keeps a stack of `Schedule` snapshots (legacy `history[]` + `currentHistoryIdx`); `ScheduleActions` history control switches `changeHistorySet`.
- **Force insert:** toggled on `SelectedEdit`; when a placement fails validation, force-insert allows it via `ConfirmActionDialog` carrying activity/slot context.
- **Save payload:** `POST /save-table` with `data = schedule.getInserted()` and `notInsert = schedule.getNotInserted()` (exact legacy shape).
- **Generate:** `POST /timetable` with `{ setting_id, data: inserted }`; on success re-init from response `{conflicts, notInserted, inserted}`.

### DELETE
Do **not** port `socket.blade.php`, `SocketController` SSE, `public/js/setting.js`, or any jQuery board scripts.

---

## Cross-phase file summary

### New directories
```
src/
├── stores/            (auth.ts)                          [Phase 0]
├── lib/
│   ├── api.ts                                            [Phase 0]
│   └── schedule/  (DBRef.ts, Schedule.ts, SelectedEdit.ts) [Phase 4]
├── services/          (12 domain endpoint modules)       [Phase 0]
├── types/             (domain DTOs + schedule.ts)        [Phase 0/4]
├── composables/       (useToast, useConfirm, useApiForm, [Phase 0]
│                       useSchedule)                       [Phase 4]
└── components/
    ├── base/          (6 shared primitives)              [Phase 2]
    ├── controls/      (RepeatableRows + 7 controls)      [Phase 3]
    ├── <domain>/      (form/detail bodies)               [Phase 3]
    └── scheduling/    (8 board components)               [Phase 4]
```

### Updated (existing) files
| File | Phase | Change |
| --- | --- | --- |
| `src/main.ts` | 0 | Pinia + Toast/Confirm services |
| `src/App.vue` | 0 | mount `<Toast/>` + `<ConfirmDialog/>` |
| `src/router/index.ts`, `guards.ts` | 0/1 | store-backed guards |
| `src/layout/AppMenu.vue` | 1 | store-backed `isAdmin` (remove hardcode) |
| `src/layout/AppTopbar.vue` | 1 | account menu + logout |
| `src/views/LoginView.vue` | 1 | login form (login only) |
| `src/views/HomeView.vue` | 1 | empty landing (R1); title→`Beranda` |
| all 37 `*View.vue` stubs | 3/4 | composed bodies |

### Deleted files
None in the SPA. **Not carried forward** from legacy (reference only): `_hapus`/`hapus`, `socket.blade.php`, auth email templates, register/password-reset/verify screens (R2), `multiple-input.css`, `public/js/setting.js`, all Bootstrap/jQuery/Selectize/CoreUI/`vue-color` assets, Blade routing/CSRF/flash coupling.

---

## Parity checklist (must hold at completion)

- [ ] `/` shows an **empty** home inside the shell — no dashboard, no redirect (R1).
- [ ] Only **login** and **logout** exist; no register/reset/verify screens (R2).
- [ ] All manual-placement validation lives in `SelectedEdit.checkValidation`, called via `useSchedule` — one authoritative client model (R3).
- [ ] `ActivityType` model/prop is `activityType`, mapping to the same name-only backend structure (R4).
- [ ] Admin gating (`requiresAdmin`) matches legacy `isAdmin` middleware exactly: timetable(index), semesters, prodis, room-types, activity-types, users.
- [ ] Two-import-type flows preserved for lecturers and activities.
- [ ] A user cannot delete their own account.
- [ ] Delete/confirm/semester/result actions all route through `ConfirmActionDialog`.
- [ ] Grid is 6 days × 17 hourly columns (07:00–24:00) with duration spans.
