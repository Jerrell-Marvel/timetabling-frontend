import type { Id } from './common'

/**
 * Board payload types for the Phase 4 scheduling slice (R3). Field names mirror
 * the legacy `GET /timetable-data` JSON shape verbatim — `DBRef`/`Schedule`/
 * `SelectedEdit` (src/lib/schedule/) and `useSchedule` are ported 1:1 against
 * these, per `models/dbRef.js`, `models/schedule.js`, `models/selectedEdit.js`.
 */

// ── Reference data (`GET /timetable-data`) ──────────────────────────────────

/** Fields off `activity.course` needed by `SelectedEdit.isBentrok`. */
export interface ScheduleCourse {
  jurusan_id: Id
  tingkat: number
  konsentrasi: string | null
  /** `"Wajib"` marks a mandatory course — drives the bentrok (clash) rule. */
  type: string
  code: string
  name: string
  color: string
}

export interface ScheduleActivityRoom {
  room_code: string
}

export interface ScheduleActivityRoomType {
  id: Id
  name: string
}

/** One lecturer time constraint. `type: "Priority"` = preferred (not unavailable). */
export interface ScheduleLecturerTime {
  day: number
  start_time: string
  end_time: string
  type: string
}

export interface ScheduleActivityLecturer {
  nik: string
  name: string
  lecturer_times: ScheduleLecturerTime[]
}

/** An activity as shaped for the board (distinct from the CRUD `Activity` DTO). */
export interface ScheduleActivity {
  id: Id
  course: ScheduleCourse
  course_code: string
  course_class: string
  course_session: number
  quota: number
  duration: number
  activity_type: { id: Id; name: string }
  /** Explicit room whitelist; empty means "match by room type instead". */
  activity_rooms: ScheduleActivityRoom[]
  activity_room_types: ScheduleActivityRoomType[]
  activity_lecturers: ScheduleActivityLecturer[]
}

export interface ScheduleRoomAvailable {
  day: number
  start_time: string
  end_time: string
}

/** A room as shaped for the board (distinct from the CRUD `Room` DTO). */
export interface ScheduleRoom {
  id: Id
  room_code: string
  room_type_id: Id
  capacity: number
  parent_room: { room_code: string } | null
  /** Child room codes (legacy `room.childs`) — used by the parent/child occupancy rule. */
  childs: string[]
  room_available: ScheduleRoomAvailable[]
}

/** `GET /timetable-data` — keyed by id, mirrors `TableController::getData()`. */
export interface TimetableRefData {
  activities: Record<Id, ScheduleActivity>
  rooms: Record<Id, ScheduleRoom>
}

// ── Placement / schedule state ──────────────────────────────────────────────

/** One placed activity — exact legacy `insertedRaw` element shape. */
export interface InsertedActivity {
  activity_id: Id
  day: number
  room_id: Id
  /** Hour, 7..24 (0-based grid `col` is `start_time - 7`). */
  start_time: number
  end_time: number
}

/** Response of init / generate (`{ conflicts, notInserted, inserted }`). */
export interface ScheduleInitData {
  conflicts?: Id[]
  /** Array of activity ids, not placements (legacy `schedule.notInserted`). */
  notInserted: Id[]
  inserted: InsertedActivity[]
}

/** `POST /save-table` body (exact legacy shape). */
export interface SaveTablePayload {
  data: InsertedActivity[]
  notInsert: Id[]
}

/** `POST /timetable` (generate) body. */
export interface GeneratePayload {
  setting_id: Id | null
  data: InsertedActivity[]
}

// ── Edit-mode helper shapes ──────────────────────────────────────────────────

/** Per-room hour occupancy for the current day in edit mode (legacy `createRoomActs`). */
export interface RoomActs {
  room_id: Id
  /** 24 hourly slots (index 0 = hour 1); `''` = free, else the occupying activity id. */
  activities: (Id | '')[]
}

/** Grid position used by `checkValidation` — `col` is 0-based from 07:00. */
export interface SlotPosition {
  col: number
  room: string
  room_id: Id
}

export interface ValidationResult {
  status: boolean
  messages: string[]
}
