# Legacy Frontend Component Inventory

## Scope and method

This is a read-only inventory of `timetabling_laravel/resources/views`, `resources/js`, and the directly referenced legacy styles/scripts. It describes the live frontend surface that should be preserved or deliberately redesigned in the Vue 3 SPA. No implementation code was created or changed.

Directories named `_hapus` or `hapus` contain retired/dead artifacts and are listed only as exclusions; they are not part of the active migration scope.

## Legacy composition

The application is a Laravel multi-page application with small Vue 2 roots mounted into Blade pages:

- `main.main` hosts page content components.
- `#menuC` independently hosts the sidebar menu.
- Blade supplies data as component props, owns routing, forms, CSRF, flash messages, errors, and most navigation.
- Vue 2 supplies interactive lists, tables, upload/download dialogs, and the scheduling board.
- UI stack: CoreUI 2, Bootstrap 4, Font Awesome/Simple Line icons, jQuery DataTables, Selectize, Bootstrap date/time picker, `vue-color`, and bespoke SCSS/CSS.

For the SPA, the Laravel/Blade concerns should move to Vue Router, API clients, auth state, form validation, toast/alert state, and PrimeVue components. The old Bootstrap/jQuery behavior should not be carried forward as a dependency.

## Application shell and global layout

| Legacy asset | Responsibility | SPA target / notes |
| --- | --- | --- |
| `views/layouts/app.blade.php` | Overall CoreUI application shell: fixed header, responsive/minimizable sidebar, main content, footer logos. Header has account dropdown and logout. | `AppLayout` with `AppHeader`, `AppSidebar`, `AppFooter`, and a router view. Drive collapse state and account menu from Vue state. |
| `views/layouts/sidebar.blade.php` | Sidebar container and minimize control. | Part of `AppSidebar`. |
| `views/layouts/menu.blade.php` | Builds navigation model and active status; hides admin-only entries based on `User::isAdmin()`. | Static/type-safe nav metadata plus route meta and an authorization guard. |
| `AllNavComponent.vue` | Iterates the server-created navigation model. | `SidebarNavigation`. |
| `NavComponent.vue` | Collapsible top-level navigation group; respects admin requirement. | `SidebarNavGroup`. |
| `SubNavComponent.vue` | Individual sidebar link with active state and authorization check. | `SidebarNavItem`. |
| `BreadCrumbComponent.vue` | Simple breadcrumb with final item as active. | A router-driven `AppBreadcrumb`. |
| `LoaderComponent.vue` | Full-screen blocking "MENUNGGU..." overlay. | Global `ProgressSpinner` overlay, ideally tied to request/action state rather than DOM/jQuery show/hide. |
| `home.blade.php` | Empty/simple post-login dashboard shell. | Confirm whether a real dashboard is required; otherwise redirect to a useful default route. |

### Navigation map and authorization

| Group | Routes/pages | Legacy access rule |
| --- | --- | --- |
| Penjadwalan | Input Aktivitas, Pengaturan Penjadwalan, Penjadwalan, Hasil Penjadwalan | Scheduling board is admin-only; the other entries are visible to authenticated users. |
| Master Data | Pengajar, Mata Kuliah, Ruangan | Authenticated users. |
| Pengaturan | Semester, Program Studi, Tipe Ruangan, Tipe Aktivitas | Admin-only. |
| Pengguna | User management | Admin-only. |

## Reusable page patterns

| Legacy component | Responsibility | Migration notes |
| --- | --- | --- |
| `CRUPageComponent.vue` | Shared create/edit/detail page wrapper: breadcrumb, heading icon, back link, card, server error slot. | Replace with a form/detail page layout; use router navigation and an in-page `Message`/toast for errors. |
| `IndexPageComponent.vue` | Shared index wrapper: breadcrumb, title, create link, optional upload/download actions, flash slot, card. | `ResourceListLayout` with configurable header actions. |
| `KeyValueIndexComponent.vue` | Specialization for simple name-based settings tables. | Reuse `ResourceListLayout` and a normal table definition. |
| `TableComponent.vue` | Generic table with nested-property rendering, view/edit/delete actions, `confirm()`, and optional jQuery DataTables. | PrimeVue `DataTable` with columns/actions supplied as configuration. Use a reusable confirmation dialog; do not retain jQuery DataTables or HTML form deletion. |
| `UploadComponent.vue` | Bootstrap modal, one or more file pickers, individual upload action, success/failure message, loader. | Reusable `ImportDialog` using PrimeVue `Dialog`/`FileUpload`; API-driven result display. |
| `DownloadComponent.vue` | Bootstrap modal containing template/download options. | Reusable `DownloadTemplateDialog`, or expose compact split-button actions when a modal is unnecessary. |

### Active dialogs and confirmations

| Legacy UI | Trigger and behavior | SPA equivalent |
| --- | --- | --- |
| Upload dialog (`popupUpload`) | From list headers; uploads Excel files for resources/results. | `ImportDialog`. |
| Download dialog (`popupDownload`) | From list headers; downloads one of several templates/data exports. | `DownloadTemplateDialog` or menu. |
| Activity revalidation dialog (`poppupValidate`) | Explains that validation is required before scheduling and invokes revalidation. | `ConfirmDialog` with progress/result feedback. |
| Force-insert dialog (`forceInsert`) | Scheduling editor warning before placing an activity despite validation errors. | `ConfirmDialog`, preserving the selected activity/slot context. |
| Browser confirmations | Generic delete, reset current semester, duplicate semester data, delete result. | Central `ConfirmationService`; messages should be localized consistently. |

## Authentication pages

| Blade page | Existing UI |
| --- | --- |
| `auth/login.blade.php` | Email/password card, inline field errors, submit button. |
| `auth/passwords/email.blade.php` | Password reset request form. |
| `auth/passwords/reset.blade.php` | Token, email, new password, confirmation form. |
| `auth/passwords/confirm.blade.php` | Password confirmation form. |
| `auth/verify.blade.php` | Email verification instruction/resend state. |
| `auth/register.blade.php` | Legacy registration view; registration route is currently not enabled in `web.php`. |

Migration note: `new/timetabling-frontend/src/views/LoginView.vue` already indicates a SPA login surface. Keep reset/verification only if the decoupled backend exposes matching flows; registration should be a product decision, not assumed.

## Resource pages and component inventory

All standard resources use list + create/edit/detail variants. In the SPA, each should become route-level views backed by shared resource table/form primitives, while preserving the listed domain fields and interactions.

| Domain | List component/page | Form/detail components | Existing behavior to preserve |
| --- | --- | --- | --- |
| Activities | `ActivitiesIndexComponent.vue`; `activities/index.blade.php` | `ActivitiesFieldsComponent.vue`, `ActivitiesShowFieldsComponent.vue`, `MultipleDaySlotComponent.vue` | Semester selector; Excel upload/template/full-data download; validation dialog; CRUD; course-derived info; multiple rooms, room types, lecturers, parallels; minimum-day-gap rows. |
| Courses | `CoursesIndexComponent.vue`; `courses/index.blade.php` | `CoursesFieldsComponent.vue`, `CoursesShowFieldsComponent.vue`, `MultipleCoursesComponent.vue`, `MultipleSemesterComponent.vue` | Excel upload/template download; CRUD/detail; program, type, semester, concentration; dependent concentration/course fetching; no-clash constraints by semester and by course. |
| Lecturers | `LecturersIndexComponent.vue`; `lecturers/index.blade.php` | `LecturersFieldsComponent.vue`, `LecturersShowFieldsComponent.vue`, `MultipleTimeSlotComponent.vue` | Two Excel import types and two templates; CRUD/detail; NIK, name, alias; repeatable unavailable and preferred teaching-time slots. |
| Rooms | `RoomsIndexComponent.vue`; `rooms/index.blade.php` | `RoomsFieldsComponent.vue`, `RoomsShowFieldsComponent.vue` | Excel import/template; CRUD/detail; code, owner, campus/location, building, floor, capacity, parent, room type; six-day availability grid. |
| Program Studi (Prodi/Jurusan) | `JurusansIndexComponent.vue`; `jurusans/index.blade.php` | `JurusansFieldsComponent.vue`, `ConsentrationComponent.vue` | CRUD; name/faculty/degree level; color selection; repeatable concentrations. |
| Room types | `KeyValueIndexComponent.vue`; `room_types/index.blade.php` | `RoomTypesFieldsComponent.vue` | Name-only CRUD. |
| Activity types | `KeyValueIndexComponent.vue`; `activity_types/index.blade.php` | `ActivityTypesFieldsComponent.vue` | Name-only CRUD. Note the legacy prop is misnamed `roomType`; normalize it to `activityType`. |
| Users | `UserIndexComponent.vue`; `users/index.blade.php` | `UserFieldsComponent.vue` | Admin CRUD; user cannot delete their own email account; name, email, password, faculty. |
| Semesters | `SemestersIndexComponent.vue`; `semesters/index.blade.php` | None; inline action page | Add next semester, mark current, reset current semester data, duplicate selected semester data. State-changing actions show blocking loader and confirmations. |
| Scheduling settings | `SettingsIndexComponent.vue`; `settings/index.blade.php` | `SettingsFieldsComponent.vue` + custom selection controls | CRUD of a named setting for current semester; choose program/activity/room/room-type/day/time restrictions or a special-activity selection. |
| Results | `ResultsIndexComponent.vue`; `results/index.blade.php` | No separate form/detail | Import updated results; export SIAKAD, printable download, open timetable snapshot, delete result. |

### Constraint and selection controls

| Legacy component | Used by | Responsibility |
| --- | --- | --- |
| `MultipleTimeSlotComponent.vue` | Lecturer form | Repeatable day/start/end rows serialized to JSON in a hidden input. |
| `MultipleDaySlotComponent.vue` | Activity form | Repeatable activity/minimum-gap-day rows serialized to JSON. |
| `MultipleCoursesComponent.vue` | Course form | Repeatable prohibited-course selection; loading state while the course list changes with program. |
| `MultipleSemesterComponent.vue` | Course form | Repeatable prohibited-semester selection (hard-coded 1–8). |
| `ConsentrationComponent.vue` | Program form | Repeatable free-text concentration inputs. |
| `TreeViewComponent.vue` + `TreeNodeComponent.vue` | Settings form | Hierarchical, cascading checkbox selection for program and room trees. |
| `MultipleCheckComponent.vue` + `CustomCheckComponent.vue` | Settings form | Checkbox list with a select-all control; names are submitted as arrays. |
| `MultiListComponent.vue` | Settings form | Searchable dual-list transfer for special activities; selected items submit hidden `Activity[]` inputs. |

Migration note: model these as controlled components that emit typed values (arrays of IDs/time ranges), not hidden JSON/form fields. PrimeVue `Tree`, `MultiSelect`, `PickList`, `Checkbox`, and `Select` cover most of this UI.

## Scheduling board

This is the most bespoke legacy interface and should be planned as a separate feature slice rather than forced through generic CRUD patterns.

| Legacy component | Responsibility |
| --- | --- |
| `TimeTableIndexComponent.vue` | Scheduling screen orchestration: weekday, loading/flash state, board, history, settings selection, generate/edit/save controls, read-only result mode, and validation lock. |
| `TimeTableComponent.vue` | Room × time-slot table rendering. Normal mode shows schedule cells and a course hover card. Edit mode decomposes free spans into slots, lets users select an unplaced activity, validates placement, manually removes activities, and opens force-insert confirmation for invalid placement. |
| `DaysComponent.vue` | Monday–Saturday tab selector. |
| `CourseHoverComponent.vue` | Pointer-positioned course summary: course/class/session, room/room type, quota, and lecturers. |
| `EditTableComponent.vue` | Draggable manual-edit side panel; lists unplaced activities, searches them, reveals details, selects activity, and toggles force mode. |
| `EditTableHoverComponent.vue` | Pointer-positioned validation-failure message card. |
| `ForceInsertModalComponent.vue` | Confirmation before forced placement. |
| `FlashMessageComponent.vue` | Success/error status banner for schedule completeness/save/generation. |
| `GenerateButtonComponent.vue` | Calls the scheduling algorithm, then refreshes data/history. |
| `SaveButtonComponent.vue` | Persists manual/current scheduling data. |
| `EditToggleButtonComponent.vue` | Enters/exits manual edit mode. |
| `PengaturanButtonComponent.vue` | Dropdown for selecting an optional scheduling-setting profile. |
| `HistoryButtonComponent.vue` | Dropdown for switching between current in-memory schedule snapshots. |
| `TimeTableServices.js` + `models/*` | Client-side schedule state, references, validation, editing, rendering, API calls, and history. |

### Board behavior that requires parity decisions

- Board currently shows six days and 17 hourly columns labelled 07:00–24:00, with variable cell spans for activity duration.
- A scheduling lock blocks all board controls until activities are revalidated.
- Generation, explicit save, selected setting profile, snapshot/history switching, and result snapshot viewing are distinct workflows.
- Manual editing exposes unplaced activities, placement diagnostics, deletion, and force insertion. The SPA must retain or consciously retire each of these workflow steps.
- The legacy board builds schedule logic in the browser after fetching reference/schedule JSON. During API design, decide whether validation/render-ready board data remains client-owned or moves to the backend. Preserve one authoritative schedule model to avoid divergent validation results.

## Blade and server-coupling to remove

| Legacy coupling | SPA replacement |
| --- | --- |
| Route links and active state embedded in Blade | Vue Router named routes and route metadata. |
| Blade-passed JSON props | Fetch resource/query data in view-level composables/stores. |
| Laravel HTML forms, method spoofing, CSRF fields | API client methods and standard JSON/multipart requests; token/cookie strategy defined centrally. |
| Blade flash/error slots | Toast/message service and field-level API error mapping. |
| `window.location`/full-page reload after actions | Router navigation/invalidation/refetch. |
| `confirm()` and Bootstrap `data-toggle` modals | PrimeVue confirmation and dialog services. |
| jQuery DOM mutation and DataTables | Declarative Vue rendering and PrimeVue table/paginator/filter state. |

## Supporting frontend assets

- `resources/sass/app.scss` imports Bootstrap and Nunito; component-local styles exist for settings and timetable editing.
- `public/css/components/multiple-input.css` supports repeatable legacy form controls.
- `public/js/setting.js` and other public scripts are legacy browser dependencies; assess only if a user-visible behavior is not represented by an active component.
- `resources/js/services/*.js` contain fetch/XHR calls for activities, courses, semesters, timetable, uploads, and validation. Their endpoint contracts are migration inputs, but they are not UI components.

## Explicit exclusions

- `resources/views/_hapus/**`, `resources/views/**/hapus/**`, and `resources/js/components/_hapus/**` are archived/deleted features. They include old CRUD partials for activity constraints, activity-room links, activity-lecturer links, availability, lock validation, and an older shared-component set.
- `views/socket.blade.php` is a standalone experimental socket/SSE test page, not an application page.
- Authentication email templates are backend mail artifacts, not SPA views.

## Suggested Vue 3 component taxonomy (plan only)

```text
layout/
  AppLayout, AppHeader, AppSidebar, AppFooter, AppBreadcrumb
components/common/
  ResourceListLayout, ResourceFormLayout, ResourceTable, ImportDialog,
  DownloadTemplateDialog, ConfirmActionDialog, LoadingOverlay
components/constraints/
  TimeRangeList, DayGapList, CourseConflictList, SemesterConflictList,
  ConcentrationList, HierarchySelector, ActivityPickList
features/<domain>/
  <Domain>ListView, <Domain>FormView, <Domain>DetailView
features/scheduling/
  SchedulingView, DayTabs, TimetableGrid, ActivityHoverCard,
  ManualSchedulingPanel, PlacementDiagnostics, ScheduleActions
```

This taxonomy is a migration boundary, not an instruction to implement it yet. The existing draft pages in `new/timetabling-frontend` should be reviewed against this inventory before extraction or consolidation begins.
