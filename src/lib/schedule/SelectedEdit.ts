import type {
  Id,
  RoomActs,
  ScheduleActivity,
  ScheduleRoom,
  SlotPosition,
  ValidationResult,
} from '@/types'
import type { DBRef } from './DBRef'

/**
 * The activity currently picked from the "unplaced" list plus **all
 * manual-placement validation** in `checkValidation()` (R3): room-code/room-type
 * match, capacity vs quota, room availability window, lecturer clash +
 * unavailability, course "bentrok" conflict, parent/child room occupancy, and
 * the force-insert toggle. Port of `models/selectedEdit.js` — rules kept 1:1.
 */
export class SelectedEdit {
  private activity_id: Id
  private duration: number
  private dbRef: DBRef
  private forceInsert = false

  constructor(activity_id: Id, duration: number, dbRef: DBRef) {
    this.activity_id = activity_id
    this.duration = duration
    this.dbRef = dbRef
  }

  getActivityId(): Id {
    return this.activity_id
  }

  getDuration(): number {
    return this.duration
  }

  toggleForce(): void {
    this.forceInsert = !this.forceInsert
  }

  isForceInsert(): boolean {
    return this.forceInsert
  }

  /** `lastd` = current day (1..6). `currentEditableData` = `Schedule.createRoomActs(lastd)`. */
  checkValidation(
    obj: SlotPosition,
    lastd: number,
    currentEditableData: RoomActs[],
  ): ValidationResult {
    const messages: string[] = []
    const ujung = 17 - obj.col
    const ite = ujung < this.duration ? ujung : this.duration

    if (this.activity_id === -1) {
      return { status: true, messages }
    }

    const activ = this.dbRef.getActivities(this.activity_id)
    let ok = true
    const room = this.dbRef.getRoom(obj.room_id)

    if (activ.activity_rooms.length) {
      let find = false
      const roomCodes: string[] = []
      for (let j = 0; j < activ.activity_rooms.length; j++) {
        if (activ.activity_rooms[j]!.room_code === obj.room) {
          find = true
        }
        roomCodes.push(activ.activity_rooms[j]!.room_code)
      }
      ok = ok && find
      if (!find) {
        messages.push(`Kode Ruangan tidak sesuai dengan aktivitas ini! (${roomCodes.toString()})`)
      }
    } else {
      let fd = activ.activity_room_types.length === 0
      activ.activity_room_types.forEach((v) => {
        if (room.room_type_id === v.id) {
          fd = true
        }
      })
      ok = ok && fd
      if (!fd) {
        messages.push('Ruangan tidak tepat untuk aktivitas ini!')
      }
    }

    let bl = true
    let isBentroks = false
    const bentroksActs: Record<string, boolean> = {}
    currentEditableData.forEach((elm) => {
      for (let i = 0; i < ite; i++) {
        const occupant = elm.activities[6 + i + obj.col * 1]
        if (occupant !== '' && occupant != null) {
          const activit = this.dbRef.getActivities(occupant)
          if (this.isSameTeacher(activit, activ)) {
            bl = false
          }
          if (this.isBentrok(activ, activit)) {
            isBentroks = true
            bentroksActs[activit.course_code] = true
          }
        }
      }
    })
    Object.keys(bentroksActs).forEach((code) => {
      messages.push(`${activ.course_code} dengan aktivitas ${code} Bentrok!`)
    })
    ok = ok && !isBentroks && bl

    let ravb = true
    room.room_available
      .filter((rm) => rm.day === lastd)
      .forEach((rd) => {
        const hourStart = Number(rd.start_time.split(':')[0]) - 7
        const hourStop = Number(rd.end_time.split(':')[0]) - 7
        if (obj.col >= hourStart && obj.col + this.duration <= hourStop) {
          // within the room's availability window
        } else {
          ravb = false
        }
      })

    if (obj.col + this.duration > 23 - 6) {
      ok = false
    }

    if (room.capacity >= activ.quota) {
      // capacity sufficient
    } else {
      ok = false
      messages.push(`Kapasitas ruangan tidak mencukupi! ${activ.quota} / ${room.capacity}`)
    }

    if (!ravb) {
      messages.push('Slot melewati batas waktu pemakaian ruang!')
    }
    ok = ok && ravb

    if (!bl) {
      messages.push('Terdapat pengajar yang mengajar pada waktu yang bersamaan!')
    }

    if (!this.teacherCanTeach(activ, obj.col + 7, obj.col + 7 + this.duration, lastd)) {
      ok = false
      messages.push('Terdapat Dosen yang tidak dapat mengajar pada slot ini!')
    }

    if (!this.isRoomCanUsed(obj, room, currentEditableData)) {
      ok = false
      messages.push('Ruangan terpakai!')
    }

    return { status: ok, messages }
  }

  private teacherCanTeach(
    activity: ScheduleActivity,
    mulai: number,
    berakhir: number,
    lastd: number,
  ): boolean {
    let ok = true
    activity.activity_lecturers.forEach((lect) => {
      lect.lecturer_times.forEach((time) => {
        if (time.type !== 'Priority' && lastd === time.day) {
          const start = Number(time.start_time.split(':')[0])
          const end = Number(time.end_time.split(':')[0])
          if (berakhir <= start || mulai >= end) {
            // outside the unavailable window
          } else {
            ok = false
          }
        }
      })
    })
    return ok
  }

  /**
   * Parent/child room occupancy. The legacy `isRoomCanUsed` compared
   * `rw.room`/`rw.acts` (fields that don't exist on `RoomActs` — it's
   * `room_id`/`activities`) and looped `i < this.currentDuration` (a property
   * that was never set, `duration` was), so the check was permanently a no-op
   * upstream. Matched against `room_id` via `DBRef.getRoomByCode` and
   * `this.duration` here so the rule actually enforces as documented.
   */
  private isRoomCanUsed(obj: SlotPosition, rm: ScheduleRoom, currentEditableData: RoomActs[]): boolean {
    const codes: string[] = []
    if (rm.parent_room != null) {
      codes.push(rm.parent_room.room_code)
    }
    codes.push(...rm.childs)

    let ok = true
    currentEditableData.forEach((rw) => {
      codes.forEach((code) => {
        const matched = this.dbRef.getRoomByCode(code)
        if (matched && rw.room_id === matched.id) {
          for (let i = 0; i < this.duration; i++) {
            if (rw.activities[6 + i + obj.col * 1] !== '') {
              ok = false
            }
          }
        }
      })
    })
    return ok
  }

  private isSameTeacher(act1: ScheduleActivity, act2: ScheduleActivity): boolean {
    let same = false
    act1.activity_lecturers.forEach((v1) => {
      act2.activity_lecturers.forEach((v2) => {
        if (v1.nik === v2.nik) {
          same = true
        }
      })
    })
    return same
  }

  private isWajib(act: ScheduleActivity): boolean {
    return act.course.type === 'Wajib'
  }

  private isBentrok(act1: ScheduleActivity, act2: ScheduleActivity): boolean {
    if (act1.course.jurusan_id !== act2.course.jurusan_id) {
      return false
    }

    const isWajib1 = this.isWajib(act1)
    const isWajib2 = this.isWajib(act2)

    if (isWajib1 && isWajib2) {
      return (
        act1.course_class === act2.course_class &&
        act1.course.tingkat === act2.course.tingkat &&
        act1.course.konsentrasi === act2.course.konsentrasi
      )
    } else if (isWajib1 || isWajib2) {
      return act1.course.tingkat === act2.course.tingkat && act1.course.konsentrasi === act2.course.konsentrasi
    }
    return false
  }
}
