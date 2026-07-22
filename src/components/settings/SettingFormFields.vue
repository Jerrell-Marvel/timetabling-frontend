<script setup lang="ts">
/**
 * Every control here maps 1:1 onto a `SettingableType` the backend actually
 * persists (`setting_constraints.settingable_type`). Values are kept as the
 * **strings** the API uses — stringified ids, hours 7–23, day indexes 1–6.
 *
 * All seven types are rendered. `activityType` is a flat checkbox group rather
 * than a tree, matching legacy `<multiple-check-component name="activityType">`.
 */
import type { TreeNode } from 'primevue/treenode'
import type { Option, SettingFormState } from '@/types'
import CheckboxGroup from '@/components/controls/CheckboxGroup.vue'
import HierarchySelector from '@/components/controls/HierarchySelector.vue'

defineProps<{
  errors?: Record<string, string>
  /** Disabled on edit — the backend ignores `semesterId` on update. */
  isEdit?: boolean
  semesterOptions: Option[]
  /** Fakultas → Jurusan, mirroring the legacy `createJurusanTree`. */
  jurusanTree: TreeNode[]
  /** Unit → Gedung → Lantai → Ruangan, mirroring the legacy `createRoomTree`. */
  roomTree: TreeNode[]
  roomTypeOptions: Option<string>[]
  /** Flat, unscoped — legacy `provideActivityTypeData()` used a plain `ActivityType::get()`. */
  activityTypeOptions: Option<string>[]
  activityOptions: Option<string>[]
}>()

const modelValue = defineModel<SettingFormState>({ required: true })

/** `hari` — 1 = Senin … 6 = Sabtu, matching `SettingDefaultsProvider`. */
const hariOptions: Option<string>[] = [
  { label: 'Senin', value: '1' },
  { label: 'Selasa', value: '2' },
  { label: 'Rabu', value: '3' },
  { label: 'Kamis', value: '4' },
  { label: 'Jumat', value: '5' },
  { label: 'Sabtu', value: '6' },
]

/** `waktu` — discrete start hours 7..23 (the backend stores hours, not ranges). */
const waktuOptions: Option<string>[] = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 7
  return { label: `${String(hour).padStart(2, '0')}:00`, value: String(hour) }
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1"
        >Nama Pengaturan<span class="text-red-500 ml-1">*</span></label
      >
      <InputText v-model="modelValue.name" class="w-full max-w-md" :invalid="!!errors?.name" />
      <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
        errors.name
      }}</Message>
    </div>

    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1">Semester</label>
      <Select
        v-model="modelValue.semesterId"
        :options="semesterOptions"
        option-label="label"
        option-value="value"
        :disabled="isEdit"
        show-clear
        placeholder="Semester aktif"
        class="w-full max-w-md"
      />
      <small class="text-surface-400">
        {{
          isEdit
            ? 'Semester tidak dapat diubah setelah pengaturan dibuat.'
            : 'Kosongkan untuk memakai semester aktif.'
        }}
      </small>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Jurusan</h3>
      <HierarchySelector v-model="modelValue.constraints.jurusan" :options="jurusanTree" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Tipe Aktivitas</h3>
      <CheckboxGroup
        v-model="modelValue.constraints.activityType"
        :options="activityTypeOptions"
        select-all-label="Pilih Semua Tipe Aktivitas"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Tipe Ruangan</h3>
      <CheckboxGroup
        v-model="modelValue.constraints.roomType"
        :options="roomTypeOptions"
        select-all-label="Pilih Semua Tipe Ruangan"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ruangan</h3>
      <HierarchySelector v-model="modelValue.constraints.room" :options="roomTree" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Aktivitas Khusus</h3>
      <MultiSelect
        v-model="modelValue.constraints.activity"
        :options="activityOptions"
        option-label="label"
        option-value="value"
        filter
        display="chip"
        placeholder="Pilih aktivitas"
        class="w-full"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Hari</h3>
      <CheckboxGroup
        v-model="modelValue.constraints.hari"
        :options="hariOptions"
        select-all-label="Pilih Semua Hari"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Jam</h3>
      <CheckboxGroup
        v-model="modelValue.constraints.waktu"
        :options="waktuOptions"
        select-all-label="Pilih Semua Jam"
      />
    </div>
  </div>
</template>
