# Vue 3 SPA — Frontend Route Registry

> Filtered from the full route inventory in [routes.md](file:///c:/Users/Asus/Documents/Kuliah/Materi/Sem%208/Penelitian%20Ko%20Ray/Code/routes.md).
> Only **user-facing pages** that render a UI are included below. API calls, file downloads/uploads, and data-fetching endpoints are excluded — those will be handled via API service calls from within the SPA.

> [!NOTE]
> **Filtering criteria applied:**
> - ✅ **Included:** GET routes that render a Blade view with a Vue component (i.e., a distinct user-facing page)
> - ❌ **Excluded:** POST/PUT/DELETE data mutations (API calls)
> - ❌ **Excluded:** Excel download/upload endpoints (API calls)
> - ❌ **Excluded:** JSON data-fetching endpoints without a page (e.g. `/timetable-data`, `/showSemesterData`, `/courseInfo/{id}`)
> - ❌ **Excluded:** Export endpoints (e.g. `/export-siakad/{id}`, `/download-print/{id}`)
> - ❌ **Excluded:** Socket/SSE utility endpoints
> - ❌ **Excluded:** All `/api/*` routes (consumed by the SPA as backend services)

---

## Route Table

| # | Vue Router Path | Name | Page Title | Legacy URI | Guard | Vue 3 View Component |
|---|----------------|------|------------|------------|-------|-----------------------|
| | **Authentication** | | | | | |
| 1 | `/login` | `login` | Login | `GET /login` | Guest | `LoginView.vue` |
| | **Dashboard** | | | | | |
| 2 | `/` | `home` | Dashboard | `GET /` | Auth | `HomeView.vue` |
| | **Penjadwalan (Scheduling)** | | | | | |
| 3 | `/activities` | `activities.index` | Input Aktivitas | `GET /activities` | Auth | `ActivityIndexView.vue` |
| 4 | `/activities/create` | `activities.create` | Tambah Aktivitas | `GET /activities/create` | Auth | `ActivityFormView.vue` |
| 5 | `/activities/:id` | `activities.show` | Detail Aktivitas | `GET /activities/{id}` | Auth | `ActivityShowView.vue` |
| 6 | `/activities/:id/edit` | `activities.edit` | Edit Aktivitas | `GET /activities/{id}/edit` | Auth | `ActivityFormView.vue` |
| 7 | `/settings` | `settings.index` | Pengaturan Penjadwalan | `GET /settings` | Auth | `SettingIndexView.vue` |
| 8 | `/settings/create` | `settings.create` | Tambah Pengaturan | `GET /settings/create` | Auth | `SettingFormView.vue` |
| 9 | `/settings/:id/edit` | `settings.edit` | Edit Pengaturan | `GET /settings/{id}/edit` | Auth | `SettingFormView.vue` |
| 10 | `/timetable` | `timetable.index` | Penjadwalan | `GET /timetable` | Auth + Admin | `TimetableView.vue` |
| 11 | `/timetable/:id` | `timetable.show` | Lihat Jadwal | `GET /show-timetable/{id}` | Auth | `TimetableShowView.vue` |
| 12 | `/results` | `results.index` | Hasil Penjadwalan | `GET /results` | Auth | `ResultIndexView.vue` |
| | **Master Data** | | | | | |
| 13 | `/lecturers` | `lecturers.index` | Pengajar | `GET /lecturers` | Auth | `LecturerIndexView.vue` |
| 14 | `/lecturers/create` | `lecturers.create` | Tambah Pengajar | `GET /lecturers/create` | Auth | `LecturerFormView.vue` |
| 15 | `/lecturers/:id` | `lecturers.show` | Detail Pengajar | `GET /lecturers/{id}` | Auth | `LecturerShowView.vue` |
| 16 | `/lecturers/:id/edit` | `lecturers.edit` | Edit Pengajar | `GET /lecturers/{id}/edit` | Auth | `LecturerFormView.vue` |
| 17 | `/courses` | `courses.index` | Matakuliah | `GET /courses` | Auth | `CourseIndexView.vue` |
| 18 | `/courses/create` | `courses.create` | Tambah Matakuliah | `GET /courses/create` | Auth | `CourseFormView.vue` |
| 19 | `/courses/:id` | `courses.show` | Detail Matakuliah | `GET /courses/{id}` | Auth | `CourseShowView.vue` |
| 20 | `/courses/:id/edit` | `courses.edit` | Edit Matakuliah | `GET /courses/{id}/edit` | Auth | `CourseFormView.vue` |
| 21 | `/rooms` | `rooms.index` | Ruangan | `GET /rooms` | Auth | `RoomIndexView.vue` |
| 22 | `/rooms/create` | `rooms.create` | Tambah Ruangan | `GET /rooms/create` | Auth | `RoomFormView.vue` |
| 23 | `/rooms/:id` | `rooms.show` | Detail Ruangan | `GET /rooms/{id}` | Auth | `RoomShowView.vue` |
| 24 | `/rooms/:id/edit` | `rooms.edit` | Edit Ruangan | `GET /rooms/{id}/edit` | Auth | `RoomFormView.vue` |
| | **Pengaturan (Settings)** | | | | | |
| 25 | `/semesters` | `semesters.index` | Semester | `GET /semesters` | Auth + Admin | `SemesterIndexView.vue` |
| 26 | `/prodis` | `prodis.index` | Program Studi | `GET /prodis` | Auth + Admin | `ProdiIndexView.vue` |
| 27 | `/prodis/create` | `prodis.create` | Tambah Program Studi | `GET /prodis/create` | Auth + Admin | `ProdiFormView.vue` |
| 28 | `/prodis/:id/edit` | `prodis.edit` | Edit Program Studi | `GET /prodis/{id}/edit` | Auth + Admin | `ProdiFormView.vue` |
| 29 | `/room-types` | `roomTypes.index` | Tipe Ruangan | `GET /roomTypes` | Auth + Admin | `RoomTypeIndexView.vue` |
| 30 | `/room-types/create` | `roomTypes.create` | Tambah Tipe Ruangan | `GET /roomTypes/create` | Auth + Admin | `RoomTypeFormView.vue` |
| 31 | `/room-types/:id/edit` | `roomTypes.edit` | Edit Tipe Ruangan | `GET /roomTypes/{id}/edit` | Auth + Admin | `RoomTypeFormView.vue` |
| 32 | `/activity-types` | `activityTypes.index` | Tipe Aktivitas | `GET /activityTypes` | Auth + Admin | `ActivityTypeIndexView.vue` |
| 33 | `/activity-types/create` | `activityTypes.create` | Tambah Tipe Aktivitas | `GET /activityTypes/create` | Auth + Admin | `ActivityTypeFormView.vue` |
| 34 | `/activity-types/:id/edit` | `activityTypes.edit` | Edit Tipe Aktivitas | `GET /activityTypes/{id}/edit` | Auth + Admin | `ActivityTypeFormView.vue` |
| | **User Management** | | | | | |
| 35 | `/users` | `users.index` | Pengguna | `GET /users` | Auth + Admin | `UserIndexView.vue` |
| 36 | `/users/create` | `users.create` | Tambah Pengguna | `GET /users/create` | Auth + Admin | `UserFormView.vue` |
| 37 | `/users/:id/edit` | `users.edit` | Edit Pengguna | `GET /users/{id}/edit` | Auth + Admin | `UserFormView.vue` |

**Total: 37 frontend routes**

---

## Route Architecture Notes

### Guard Types
| Guard | Description | Routes |
|-------|-------------|--------|
| `Guest` | Only accessible when NOT logged in. Redirects to `/` if authenticated. | 1 |
| `Auth` | Requires authentication. Redirects to `/login` if not authenticated. | 24 |
| `Auth + Admin` | Requires authentication AND admin role. Shows 403 or redirects if non-admin. | 12 |

### Shared Form Views (Create + Edit reuse)
The following modules reuse a single form component for both create and edit, differentiated by the presence of a route param (`:id`):

| Module | Shared Component | Create Route | Edit Route |
|--------|-----------------|--------------|------------|
| Activities | `ActivityFormView.vue` | `/activities/create` | `/activities/:id/edit` |
| Settings | `SettingFormView.vue` | `/settings/create` | `/settings/:id/edit` |
| Lecturers | `LecturerFormView.vue` | `/lecturers/create` | `/lecturers/:id/edit` |
| Courses | `CourseFormView.vue` | `/courses/create` | `/courses/:id/edit` |
| Rooms | `RoomFormView.vue` | `/rooms/create` | `/rooms/:id/edit` |
| Prodis | `ProdiFormView.vue` | `/prodis/create` | `/prodis/:id/edit` |
| Room Types | `RoomTypeFormView.vue` | `/room-types/create` | `/room-types/:id/edit` |
| Activity Types | `ActivityTypeFormView.vue` | `/activity-types/create` | `/activity-types/:id/edit` |
| Users | `UserFormView.vue` | `/users/create` | `/users/:id/edit` |

### URL Convention Changes (Legacy → New)
| Legacy (camelCase) | New (kebab-case) | Reason |
|--------------------|------------------|--------|
| `/roomTypes` | `/room-types` | URL best practice — kebab-case |
| `/activityTypes` | `/activity-types` | URL best practice — kebab-case |
| `/show-timetable/{id}` | `/timetable/:id` | Consistent RESTful pattern |

### Excluded Endpoints (handled as API service calls)

These are **not** frontend routes. They will be called from within Vue 3 views via Axios/fetch:

| Category | Example Endpoints | Called From |
|----------|-------------------|------------|
| Data mutations | `POST /activities`, `PUT /rooms/{id}`, `DELETE /users/{id}` | Form submissions in `*FormView.vue` |
| Excel download | `GET /excel-activities`, `GET /excel-lecturer`, `GET /excel-room`, etc. | Button click in `*IndexView.vue` |
| Excel upload | `POST /uploads-activities`, `POST /uploads-lecturer`, etc. | Upload dialog in `*IndexView.vue` |
| Data fetching | `GET /timetable-data`, `GET /showSemesterData`, `GET /getInitSchedule` | `TimetableView.vue` lifecycle hooks |
| Course lookups | `GET /courseInfo/{id}`, `GET /konsentrasi/{id}`, `GET /courselist/{id}` | `ActivityFormView.vue` cascading selects |
| Timetable ops | `POST /save-table`, `POST /timetable` (run algorithm) | `TimetableView.vue` action buttons |
| Semester ops | `POST /semesters/next`, `POST /semesters/duplicate`, `PUT /semesters-current` | `SemesterIndexView.vue` action buttons |
| Schedule ops | `GET /activity/revalidate`, `GET /activity/reset` | `TimetableView.vue` admin actions |
| Export | `GET /export-siakad/{id}`, `GET /download-print/{id}` | `ResultIndexView.vue` download buttons |
| Result upload | `POST /uploads-excel-result-update` | `ResultIndexView.vue` upload dialog |

---

## Proposed File Structure

```
src/
├── router/
│   └── index.ts                    # Vue Router config with all 37 routes
├── views/
│   ├── auth/
│   │   └── LoginView.vue
│   ├── HomeView.vue
│   ├── scheduling/
│   │   ├── activities/
│   │   │   ├── ActivityIndexView.vue
│   │   │   ├── ActivityFormView.vue
│   │   │   └── ActivityShowView.vue
│   │   ├── settings/
│   │   │   ├── SettingIndexView.vue
│   │   │   └── SettingFormView.vue
│   │   ├── timetable/
│   │   │   ├── TimetableView.vue
│   │   │   └── TimetableShowView.vue
│   │   └── results/
│   │       └── ResultIndexView.vue
│   ├── master-data/
│   │   ├── lecturers/
│   │   │   ├── LecturerIndexView.vue
│   │   │   ├── LecturerFormView.vue
│   │   │   └── LecturerShowView.vue
│   │   ├── courses/
│   │   │   ├── CourseIndexView.vue
│   │   │   ├── CourseFormView.vue
│   │   │   └── CourseShowView.vue
│   │   └── rooms/
│   │       ├── RoomIndexView.vue
│   │       ├── RoomFormView.vue
│   │       └── RoomShowView.vue
│   ├── pengaturan/
│   │   ├── semesters/
│   │   │   └── SemesterIndexView.vue
│   │   ├── prodis/
│   │   │   ├── ProdiIndexView.vue
│   │   │   └── ProdiFormView.vue
│   │   ├── room-types/
│   │   │   ├── RoomTypeIndexView.vue
│   │   │   └── RoomTypeFormView.vue
│   │   └── activity-types/
│   │       ├── ActivityTypeIndexView.vue
│   │       └── ActivityTypeFormView.vue
│   └── users/
│       ├── UserIndexView.vue
│       └── UserFormView.vue
└── layouts/
    ├── DefaultLayout.vue           # Sidebar + topbar (authenticated)
    └── AuthLayout.vue              # Minimal layout (login page)
```
