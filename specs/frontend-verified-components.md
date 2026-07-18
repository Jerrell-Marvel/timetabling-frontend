# Verified Vue 3 Component List

> Audited against the legacy Vue 2 codebase (`timetabling_laravel/resources/js/components/**`) and the current
> state of `new/timetabling-frontend/src/**`. This supersedes the raw inventory in
> [frontend-component.md](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/frontend-component.md),
> which remains valid as the *legacy* reference. This file is the *target* component catalog for the SPA.
>
> **Planning artifact only — no component code is written here.**

## Audit ground truth

- **Stack (from `package.json`):** Vue 3.5, `vue-router` 5, **PrimeVue 4.5** + `@primeuix/themes`, **Tailwind 4**, `primeicons`. No Pinia, Axios, or form-validation library is installed yet — those are gaps, not components.
- **Already scaffolded shell** (sakai-vue style, present in `src/layout/`): `AppLayout`, `AppTopbar`, `AppSidebar`, `AppMenu`, `AppMenuItem`, `AppFooter`, `BreadCrumb`, `CRUPage`, plus `AuthLayout` and `composables/layout.ts`. All 37 route views exist as stubs.
- **Naming reconciliation:** the earlier drafts disagreed on shell names. The *implemented* names win. Do **not** create `DefaultLayout`, `AppHeader`, or `AppBreadcrumb` — they are already covered by `AppLayout`, `AppTopbar`, and `BreadCrumb` respectively.

---

## Legend

| Tag | Meaning |
| --- | --- |
| ✅ **Exists** | Already scaffolded in `new/timetabling-frontend` |
| 🔨 **Build** | New shared component to create |
| 🧩 **PrimeVue** | Use a built-in PrimeVue component directly — **do not** port a custom legacy component |
| 🔀 **Merge** | Several legacy components collapse into one |
| 🗑️ **Drop** | Legacy component with no SPA equivalent (server/jQuery/Bootstrap concern) |

---

## A. Core / Layout & Shell

| Component | Status | Replaces (legacy) | Notes |
| --- | --- | --- | --- |
| `AppLayout` | ✅ Exists | `layouts/app.blade.php` | Authenticated shell; hosts `<RouterView>`. |
| `AppTopbar` | ✅ Exists | Blade header + account dropdown | Add account menu + logout (PrimeVue `Menu`/`Button`). |
| `AppSidebar` | ✅ Exists | `layouts/sidebar.blade.php` | Container + minimize control. |
| `AppMenu` | ✅ Exists | `AllNavComponent.vue`, `menu.blade.php` | Nav model is now typed & client-owned; admin filtering already implemented via `adminRequired`. |
| `AppMenuItem` | ✅ Exists | `NavComponent.vue` + `SubNavComponent.vue` (🔀 merged) | One recursive item replaces the legacy group/sub split. |
| `AppFooter` | ✅ Exists | Blade footer logos | — |
| `BreadCrumb` | ✅ Exists | `BreadCrumbComponent.vue` | Takes `items`; final item passive. Optionally back it with PrimeVue `Breadcrumb`. |
| `AuthLayout` | ✅ Exists | `auth`-layout Blade | Minimal shell for login. |
| `HomeView` | ✅ Exists (stub) | `home.blade.php` | **Decision needed:** build a real dashboard vs. redirect to a default route. Legacy home is empty. |
| `NotFoundView` | ✅ Exists | (none — new) | 404 catch-all. |

> ⚠️ **Admin-filtering parity:** `AppMenu` currently hardcodes `isAdmin = ref(true)`. Wire this to the auth store when it exists.

---

## B. Base UI / Shared primitives (🔨 build)

These are the reusable layer that the domain views compose. They wrap PrimeVue rather than reinventing it.

| Component | Replaces (legacy) | Purpose |
| --- | --- | --- |
| `CRUPage` ✅ | `CRUPageComponent.vue` | **Already built.** Shared create/edit/detail wrapper: breadcrumb, header icon, back link, card, `#error` slot. Accepts `type: 'Buat' \| 'Ubah' \| 'Detil'`. |
| `ResourceListLayout` 🔨 | `IndexPageComponent.vue` + `KeyValueIndexComponent.vue` (🔀 merged) | Index-page wrapper: breadcrumb, title, create button, configurable header actions (import/export slots), content card. `KeyValueIndex` is just this with a 1-column table config — no separate component. |
| `ResourceTable` 🔨 | `TableComponent.vue` | Thin wrapper over PrimeVue **`DataTable`**: columns/actions/nested-field config, view/edit/delete action column. **Do not** port jQuery DataTables or HTML-form deletion. |
| `ImportDialog` 🔨 | `UploadComponent.vue` | PrimeVue `Dialog` + **`FileUpload`**; supports the multi-picker cases (lecturers/activities have 2 import types). API-driven result feedback. |
| `DownloadMenu` 🔨 | `DownloadComponent.vue` | Template/data export actions. Prefer a PrimeVue `SplitButton`/`Menu` over a modal where a modal is unnecessary. |
| `ConfirmActionDialog` 🔨 | `RevalidateComponent.vue`, `ForceInsertModalComponent.vue`, all `confirm()` calls | Standardize on PrimeVue **`ConfirmDialog` + `ConfirmationService`**. Carries progress/result feedback for the revalidate + force-insert cases. |
| `LoadingOverlay` 🔨 | `LoaderComponent.vue` | Global blocking "MENUNGGU…" overlay → PrimeVue **`ProgressSpinner`** + `BlockUI`, driven by request/action state (not jQuery show/hide). |

---

## C. Replaced entirely by built-in PrimeVue (🧩 — no custom component)

The legacy UI stack (CoreUI 2 / Bootstrap 4 / jQuery / Selectize / bootstrap-datepicker / `vue-color`) is **not** carried forward. These map directly to PrimeVue primitives — do not create wrappers unless a wrapper adds real config value.

| Legacy dependency / pattern | PrimeVue replacement |
| --- | --- |
| jQuery DataTables | `DataTable` (+ `Column`, `Paginator`, built-in sort/filter) |
| Selectize dropdowns | `Select` / `MultiSelect` |
| bootstrap date/time picker | `DatePicker` |
| `vue-color` picker (Prodi color) | `ColorPicker` |
| Bootstrap modals (`data-toggle`) | `Dialog` |
| `confirm()` / reset / duplicate / delete prompts | `ConfirmDialog` + `ConfirmationService` |
| Blade flash / inline field errors | `Toast` + `Message` (field-level API error mapping) |
| Buttons, cards, inputs, checkboxes | `Button`, `Card`, `InputText`, `Checkbox`, `InputNumber` |

---

## D. Constraint & selection controls (feature-shared, 🔨 build)

Repeatable/complex form controls used across resource forms. Model as **controlled components emitting typed values** (arrays of IDs / time ranges), **not** hidden JSON inputs.

| Component | Legacy source | Used by | PrimeVue basis / merge note |
| --- | --- | --- | --- |
| `TimeRangeList` 🔨 | `MultipleTimeSlotComponent.vue` | Lecturer form | Repeatable day/start/end rows. |
| `DayGapList` 🔨 | `MultipleDaySlotComponent.vue` | Activity form | Repeatable activity/min-gap-day rows. |
| `CourseConflictList` 🔨 | `MultipleCoursesComponent.vue` | Course form | Prohibited-course rows; loading state as program changes. |
| `SemesterConflictList` 🔨 | `MultipleSemesterComponent.vue` | Course form | Prohibited-semester rows (1–8). |
| `ConcentrationList` 🔨 | `ConsentrationComponent.vue` | Prodi form | Repeatable free-text concentration inputs. |
| `HierarchySelector` 🔨 | `TreeViewComponent.vue` + `TreeNodeComponent.vue` (🔀 merged) | Settings form | Cascading checkbox tree → PrimeVue **`Tree`** (`selectionMode="checkbox"`). |
| `ActivityPickList` 🔨 | `MultiListComponent.vue` | Settings form | Searchable dual-list → PrimeVue **`PickList`**. |
| *(inline)* `CheckboxGroup` 🧩 | `MultipleCheckComponent.vue` + `CustomCheckComponent.vue` (🔀 merged) | Settings form | Checkbox list + select-all → PrimeVue `Checkbox` group (+ header "select all"). Likely no custom component needed. |

> 💡 The five repeatable-row controls share one interaction pattern (add/remove/reorder rows). Consider a generic
> `RepeatableRows` base with typed row slots to avoid five near-duplicate implementations. `public/css/components/multiple-input.css`
> is a Bootstrap concern and should **not** be ported.

---

## E. Feature-specific: resource forms & detail bodies (🔨 build)

Each domain view already exists as a route stub (see `routes-specs.md`). What's missing is the **form body** and **detail body** each `*FormView` / `*ShowView` composes inside `CRUPage`. Listed here so they aren't overlooked.

| Domain | Form body | Detail body | Legacy source | Domain fields to preserve |
| --- | --- | --- | --- | --- |
| Activities | `ActivityFormFields` | `ActivityDetail` | `ActivitiesFieldsComponent`, `ActivitiesShowFieldsComponent` | Semester selector, course-derived info, multiple rooms/room-types/lecturers/parallels, min-day-gap rows (`DayGapList`). |
| Courses | `CourseFormFields` | `CourseDetail` | `CoursesFieldsComponent`, `CoursesShowFieldsComponent` | Program/type/semester/concentration, dependent concentration+course fetching, no-clash by semester (`SemesterConflictList`) & by course (`CourseConflictList`). |
| Lecturers | `LecturerFormFields` | `LecturerDetail` | `LecturersFieldsComponent`, `LecturersShowFieldsComponent` | NIK/name/alias, unavailable + preferred time slots (`TimeRangeList`). Two import types. |
| Rooms | `RoomFormFields` | `RoomDetail` | `RoomsFieldsComponent`, `RoomsShowFieldsComponent` | Code/owner/campus/building/floor/capacity/parent/type, six-day availability grid. |
| Prodi | `ProdiFormFields` | — | `JurusansFieldsComponent` | Name/faculty/degree, color (`ColorPicker`), concentrations (`ConcentrationList`). |
| Room Types | *(inline in view)* | — | `RoomTypesFieldsComponent` | Name-only. Use `ResourceListLayout` + simple form; no dedicated component needed. |
| Activity Types | *(inline in view)* | — | `ActivityTypesFieldsComponent` | Name-only. ⚠️ Legacy prop is misnamed `roomType` → normalize to `activityType`. |
| Users | `UserFormFields` | — | `UserFieldsComponent` | Name/email/password/faculty. ⚠️ Preserve rule: a user cannot delete their own account. |
| Settings | `SettingFormFields` | — | `SettingsFieldsComponent` + custom controls | Named setting for current semester; program/activity/room/room-type/day/time restrictions or special-activity selection (uses `HierarchySelector`, `ActivityPickList`, `CheckboxGroup`). |
| Semesters | `SemesterActions` (inline page) | — | `SemestersIndexComponent` | **No form/detail.** Action page: add-next, mark-current, reset-current, duplicate — each a confirmed, blocking action. |
| Results | `ResultActions` (inline page) | — | `ResultsIndexComponent` | **No form/detail.** Import updated results, export SIAKAD, printable download, open snapshot, delete result. |

> Note: the index list bodies (`ActivitiesIndexComponent`, `CoursesIndexComponent`, …) are absorbed by
> `ResourceListLayout` + `ResourceTable` with per-domain column/action config — they are **not** ported as bespoke components.

---

## F. Scheduling board (dedicated feature slice, 🔨 build)

The most bespoke surface. Plan as a self-contained feature, **not** generic CRUD. All under `TimetableView` / `TimetableShowView`.

| Component | Legacy source | Responsibility |
| --- | --- | --- |
| `SchedulingBoard` | `TimeTableIndexComponent.vue` | Orchestration: weekday, loading/flash, board, history, setting profile, generate/edit/save, read-only result mode, validation lock. |
| `TimetableGrid` | `TimeTableComponent.vue` | Room × time-slot grid; normal render + edit-mode slot decomposition, placement validation, manual removal, force-insert trigger. |
| `DayTabs` | `DaysComponent.vue` | Mon–Sat selector → PrimeVue `Tabs`/`SelectButton`. |
| `ActivityHoverCard` | `CourseHoverComponent.vue` | Pointer-positioned course/class/session/room/quota/lecturers summary. |
| `ManualSchedulingPanel` | `EditTableComponent.vue` | Draggable side panel: unplaced-activity list, search, details, select, force toggle. |
| `PlacementDiagnostics` | `EditTableHoverComponent.vue` | Pointer-positioned validation-failure message card. |
| `ScheduleFlashBanner` | `FlashMessageComponent.vue` | Completeness/save/generation status → PrimeVue `Message`. |
| `ScheduleActions` | `GenerateButton`, `SaveButton`, `EditToggleButton`, `PengaturanButton`, `HistoryButton` (🔀 merged group) | Toolbar of generate / save / edit-toggle / setting-profile / history-snapshot controls. |
| *(force-insert)* | `ForceInsertModalComponent.vue` | Use shared `ConfirmActionDialog` (Section B), preserving activity/slot context. |

**Parity decisions to settle before implementation:**
- 6 days × 17 hourly columns (07:00–24:00), variable cell spans for duration.
- Validation lock blocks all board controls until activities are revalidated.
- Where does schedule validation/render logic live — client (as legacy `TimeTableServices.js` + `models/*`) or backend? Keep **one authoritative model** to avoid divergent validation.

---

## G. Cross-cutting (non-visual, but required — not in the original draft)

Flagged because the draft is component-only, yet these block the components above from functioning:

| Item | Replaces (legacy) | Note |
| --- | --- | --- |
| `useAuthStore` (Pinia) | Blade `Auth`/`User::isAdmin()` | Drives route guards + `AppMenu` admin filter. **Pinia not yet installed.** |
| API client (Axios/fetch) | `resources/js/services/*.js`, Laravel forms/CSRF | Central token/cookie strategy; endpoint contracts come from legacy services. |
| Toast/confirmation services | Blade flash, `confirm()` | Register PrimeVue `ToastService` + `ConfirmationService` globally. |
| `useSchedule` composable | `TimeTableServices.js` + `models/*` | Client-side schedule state/validation/history for the board slice. |

---

## Audit summary — changes vs. the draft

**Merged (legacy → one SPA component):**
- `NavComponent` + `SubNavComponent` → `AppMenuItem` (already done)
- `IndexPageComponent` + `KeyValueIndexComponent` → `ResourceListLayout`
- `TreeViewComponent` + `TreeNodeComponent` → `HierarchySelector`
- `MultipleCheckComponent` + `CustomCheckComponent` → `CheckboxGroup`
- Five scheduling action buttons → `ScheduleActions`
- `RevalidateComponent` + `ForceInsertModalComponent` + all `confirm()` → `ConfirmActionDialog`

**Replaced by built-in PrimeVue (no port):** `TableComponent`→`DataTable`, `LoaderComponent`→`ProgressSpinner`/`BlockUI`, plus the whole CoreUI/Bootstrap/jQuery/Selectize/datepicker/`vue-color` stack (Section C).

**Renamed to match what's already built:** `DefaultLayout`→`AppLayout`, `AppHeader`→`AppTopbar`, `AppBreadcrumb`→`BreadCrumb`.

**Added (missing from draft):** auth store, API client, global toast/confirm services, `useSchedule` composable, and the per-domain form/detail bodies in Section E (draft named legacy field components but didn't define their SPA targets).

**Dropped (🗑️ no SPA equivalent):** everything under `_hapus`/`hapus`, `socket.blade.php`, auth email templates, `multiple-input.css`, `public/js/setting.js`, Blade routing/CSRF/flash coupling.

**Open decisions (need product/architecture sign-off):**
1. Real dashboard for `HomeView` vs. redirect.
2. Keep password-reset / email-verification / registration flows? (depend on decoupled backend support).
3. Schedule validation ownership: client vs. backend.
4. `ActivityTypes` prop rename `roomType` → `activityType`.
