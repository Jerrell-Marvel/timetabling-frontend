import type { Id, ScheduleActivity, ScheduleRoom, TimetableRefData } from '@/types'

/**
 * Reference-data cache (activities, rooms) from `GET /timetable-data`. Port of
 * `models/dbRef.js` — every method name/behavior kept 1:1.
 */
export class DBRef {
  private db: TimetableRefData = { activities: {}, rooms: {} }

  initDB(db: TimetableRefData): void {
    this.db = db
  }

  // activity
  getActivities(idx: Id): ScheduleActivity {
    return this.db.activities[idx]!
  }

  getActivitiesCourseInfo(idx: Id): string {
    const activity = this.getActivities(idx)
    let lecturers = ''
    activity.activity_lecturers.forEach((val) => {
      lecturers += val.name + ', '
    })
    return `${activity.course.name}(${activity.activity_type.name}) - ${activity.course_class} - ${lecturers}`
  }

  getActivitiesColorInfo(idx: Id): string {
    return this.getActivities(idx).course.color
  }

  // rooms
  getAllRoomIds(): ScheduleRoom[] {
    return Object.values(this.db.rooms)
  }

  getRoom(idx: Id): ScheduleRoom {
    return this.db.rooms[idx]!
  }

  getRoomByCode(code: string): ScheduleRoom | null {
    for (const idx of Object.keys(this.db.rooms)) {
      const room = this.db.rooms[Number(idx)]!
      if (room.room_code === code) {
        return room
      }
    }
    return null
  }
}
