import type { Id, InsertedActivity, RoomActs, ScheduleInitData } from '@/types'
import type { DBRef } from './DBRef'

export interface DaySchedule {
  days: number
  activities: InsertedActivity[]
}

/** One rendered grid cell — either a placed activity or an empty gap (`colspan` only). */
export interface TableCell {
  value?: string
  data_id?: Id
  colspan?: number
  style?: string
}

export interface RoomTableView {
  data_id: Id
  raw: (Id | string | null)[]
  td: TableCell[]
}

/**
 * The schedule state: table view per day, inserted/not-inserted, add/remove
 * placement, `getInserted()` for save. Port of `models/schedule.js` — method
 * names/behavior kept 1:1.
 */
export class Schedule {
  conflicts: Id[]
  notInserted: Id[]
  insertedRaw: InsertedActivity[]
  /** 1-indexed by day (index 0 = Monday). */
  days: DaySchedule[]
  /** `tableView[day-1][room_id]`. Rebuilt (emptied) on every mutation until `createTableView` reruns. */
  tableView: RoomTableView[][]

  constructor(schedule: ScheduleInitData) {
    this.conflicts = schedule.conflicts ?? []
    this.notInserted = schedule.notInserted
    this.insertedRaw = schedule.inserted
    this.days = this.groupByDay(this.insertedRaw)
    this.tableView = []
  }

  private groupByDay(schedule: InsertedActivity[]): DaySchedule[] {
    const days: DaySchedule[] = []
    for (let index = 0; index < 7; index++) {
      days.push({ days: index + 1, activities: [] })
    }
    schedule.forEach((element) => {
      days[element.day - 1]!.activities.push(element)
    })
    return days
  }

  getInserted(): InsertedActivity[] {
    return this.insertedRaw
  }

  getNotInserted(): Id[] {
    return this.notInserted
  }

  getConflicts(): Id[] {
    return this.conflicts
  }

  /** `day` is 1-indexed (1 = Monday). */
  getTableView(day: number): RoomTableView[] {
    return this.tableView[day - 1]!
  }

  /** Recomputes `tableView` for all 7 days — one pass per room to collapse contiguous cells via colspan. */
  createTableView(dbRef: DBRef): void {
    const rooms = dbRef.getAllRoomIds()
    this.tableView = []
    for (let index = 0; index < 7; index++) {
      const row: RoomTableView[] = []
      rooms.forEach((room) => {
        const arr = Array.from({ length: 25 }, (): Id | string | null => null)
        arr[0] = room.room_code
        row[room.id] = { data_id: room.id, raw: arr, td: [] }
      })
      this.tableView.push(row)
    }
    this.insertedRaw.forEach((activity) => {
      for (let index = activity.start_time; index < activity.end_time; index++) {
        this.tableView[activity.day - 1]![activity.room_id]!.raw[index] = activity.activity_id
      }
    })
    for (let i = 0; i < this.tableView.length; i++) {
      rooms.forEach((room) => {
        const td: TableCell[] = [{ value: room.room_code }]
        let count = 1
        let print = 17
        const raw = this.tableView[i]![room.id]!.raw
        for (let k = 7; k < raw.length; k++) {
          const current = raw[k]!
          let next: Id | string | null = -1
          if (k + 1 !== raw.length) {
            next = raw[k + 1] ?? null
          }
          if (current !== next) {
            if (!current) {
              td.push({ colspan: count })
            } else {
              const activityId = current as Id
              td.push({
                data_id: activityId,
                colspan: count,
                value: dbRef.getActivitiesCourseInfo(activityId),
                style: `background:${dbRef.getActivitiesColorInfo(activityId)};`,
              })
            }
            this.tableView[i]![room.id]!.td = td
            print--
            count = 1
          } else {
            count++
          }
        }
        while (print > 0) {
          td.push({ colspan: 0, style: 'display:none !important;' })
          print--
        }
        this.tableView[i]![room.id]!.td = td
      })
    }
  }

  /** Per-room hourly occupancy for `day` (1-indexed) — feeds edit-mode validation. */
  createRoomActs(day: number): RoomActs[] {
    const currentDaySchedule = this.days[day - 1]!
    const arr: RoomActs[] = []
    currentDaySchedule.activities.forEach((elm) => {
      if (!arr[elm.room_id]) {
        arr[elm.room_id] = { room_id: elm.room_id, activities: Array(24).fill('') }
      }
      for (let index = elm.start_time; index < elm.end_time; index++) {
        arr[elm.room_id]!.activities[index - 1] = elm.activity_id
      }
    })
    return arr.filter((n) => n)
  }

  addSchedule(activity_id: Id, day: number, room_id: Id, start_time: number, end_time: number): void {
    const index = this.notInserted.indexOf(activity_id)
    if (index !== -1) {
      this.notInserted.splice(index, 1)
    }

    this.insertedRaw.push({ activity_id, day, room_id, start_time, end_time })

    this.days = this.groupByDay(this.insertedRaw)
    this.tableView = []
  }

  removeSchedule(activity_id: Id): void {
    let index = -1
    this.insertedRaw.forEach((element, idx) => {
      if (element.activity_id === activity_id) {
        index = idx
      }
    })
    if (index !== -1) {
      this.insertedRaw.splice(index, 1)
    }

    this.notInserted.push(activity_id)

    this.days = this.groupByDay(this.insertedRaw)
    this.tableView = []
  }
}
