<script setup lang="ts">
/**
 * The whole Activity form: master data on top, then the five constraint kinds.
 *
 * The user sees one form and one Save button. The activity/constraint split the
 * backend enforces is handled entirely by `activitiesService.saveForm` — nothing
 * in this component knows there are two endpoints behind it.
 *
 * All option lists carry **string** values, because every constraint value is
 * stored as a string server-side.
 */
import ConstraintList from '@/components/controls/ConstraintList.vue'
import DayGapList from '@/components/controls/DayGapList.vue'
import type { ActivityFormModel, Option } from '@/types'

defineProps<{
  errors?: Record<string, string>
  semesterOptions: Option[]
  courseOptions: Option[]
  activityTypeOptions: Option[]
  roomOptions: Option<string>[]
  roomTypeOptions: Option<string>[]
  /** Lecturers keyed by NIK — the constraint value for `LECTURER` is the NIK. */
  lecturerOptions: Option<string>[]
  /** Other activities (excluding self), for the paralel and gap pickers. */
  activityOptions: Option<string>[]
}>()

const modelValue = defineModel<ActivityFormModel>({ required: true })
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- ── Master data ─────────────────────────────────────────────────── -->
    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-3">Data Aktivitas</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Semester</label>
          <Select
            v-model="modelValue.semesterId"
            :options="semesterOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
          <small v-if="errors?.semesterId" class="text-red-500">{{ errors.semesterId }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Matakuliah</label>
          <Select
            v-model="modelValue.courseId"
            :options="courseOptions"
            option-label="label"
            option-value="value"
            filter
            class="w-full"
          />
          <small v-if="errors?.courseId" class="text-red-500">{{ errors.courseId }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Jenis Aktivitas</label>
          <Select
            v-model="modelValue.activityTypeId"
            :options="activityTypeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
          <small v-if="errors?.activityTypeId" class="text-red-500">
            {{ errors.activityTypeId }}
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Kelas</label>
          <InputText v-model="modelValue.courseClass" maxlength="3" class="w-full" />
          <small v-if="errors?.courseClass" class="text-red-500">{{ errors.courseClass }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Sesi</label>
          <InputNumber v-model="modelValue.courseSession" :min="1" class="w-full" />
          <small v-if="errors?.courseSession" class="text-red-500">
            {{ errors.courseSession }}
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Durasi (jam)</label>
          <InputNumber v-model="modelValue.duration" :min="1" class="w-full" />
          <small v-if="errors?.duration" class="text-red-500">{{ errors.duration }}</small>
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 mb-1">Kuota</label>
          <InputNumber v-model="modelValue.quota" :min="1" class="w-full" />
          <small v-if="errors?.quota" class="text-red-500">{{ errors.quota }}</small>
        </div>
      </div>
    </div>

    <!-- ── Constraints ─────────────────────────────────────────────────── -->
    <div class="border-t border-surface-200 pt-5">
      <h3 class="text-sm font-semibold text-surface-800">Batasan Penjadwalan</h3>
      <p class="text-xs text-surface-400 mt-1 mb-4">
        <strong>Hard Constraint</strong>: jadwal tidak akan pernah melanggar batasan ini.
        <strong>Soft Constraint</strong>: penjadwal boleh melanggarnya bila tidak ada solusi lain.
      </p>

      <div class="flex flex-col gap-5">
        <div>
          <h4 class="text-sm font-medium text-surface-700 mb-2">Pengajar</h4>
          <MultiSelect
            v-model="modelValue.lecturerNiks"
            :options="lecturerOptions"
            option-label="label"
            option-value="value"
            filter
            placeholder="Pilih pengajar"
            class="w-full"
          />
          <!--
            No Hard/Soft Constraint toggle here on purpose: lecturers are not a
            preference, they define who teaches the activity. The backend pins
            LECTURER rows to hard, so offering a toggle would be a lie.
          -->
          <p class="text-xs text-surface-400 mt-1">
            Pengajar selalu bersifat Hard Constraint dan tidak dapat diubah menjadi Soft
            Constraint.
          </p>
        </div>

        <div>
          <h4 class="text-sm font-medium text-surface-700 mb-2">Ruangan</h4>
          <ConstraintList
            v-model="modelValue.rooms"
            :options="roomOptions"
            add-label="Tambah Ruangan"
            placeholder="Pilih ruangan"
            hint="Kosongkan bila aktivitas boleh ditempatkan di ruangan mana pun."
          />
        </div>

        <div>
          <h4 class="text-sm font-medium text-surface-700 mb-2">Tipe Ruangan</h4>
          <ConstraintList
            v-model="modelValue.roomTypes"
            :options="roomTypeOptions"
            add-label="Tambah Tipe Ruangan"
            placeholder="Pilih tipe ruangan"
            hint="Kosongkan bila semua tipe ruangan dapat dipakai."
          />
        </div>

        <div>
          <h4 class="text-sm font-medium text-surface-700 mb-2">Aktivitas Paralel</h4>
          <ConstraintList
            v-model="modelValue.paralels"
            :options="activityOptions"
            add-label="Tambah Aktivitas Paralel"
            placeholder="Pilih aktivitas"
            hint="Aktivitas paralel dijadwalkan pada waktu yang sama."
          />
        </div>

        <div>
          <h4 class="text-sm font-medium text-surface-700 mb-2">Jarak Hari Minimum</h4>
          <DayGapList
            v-model="modelValue.gaps"
            :activity-options="activityOptions"
            hint="Jumlah hari minimum antara aktivitas ini dan aktivitas yang dipilih."
          />
        </div>
      </div>
    </div>
  </div>
</template>
