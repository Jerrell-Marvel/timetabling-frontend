<script setup lang="ts">
import { computed } from 'vue'
import RepeatableRows from '@/components/controls/RepeatableRows.vue'
import HierarchySelector from '@/components/controls/HierarchySelector.vue'
import ActivityPickList from '@/components/controls/ActivityPickList.vue'
import CheckboxGroup from '@/components/controls/CheckboxGroup.vue'
import type { Setting, Option, Prodi } from '@/types'
import type { TreeNode } from 'primevue/treenode'

const props = defineProps<{
  errors?: Record<string, string>
  prodis: Prodi[]
  activityOptions: Option[]
  roomOptions: Option[]
  roomTypeOptions: Option[]
}>()

const modelValue = defineModel<Setting>({ required: true })

const dayOptions: Option<string>[] = [
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' },
]

// Prodi restriction as a cascading tree (concentrations as children); only
// top-level (prodi) keys are persisted into `prodi_ids`.
const prodiTreeOptions = computed<TreeNode[]>(() =>
  props.prodis.map((p) => ({
    key: String(p.id),
    label: p.name,
    children: p.concentrations.map((c) => ({ key: `${p.id}::${c}`, label: c })),
  })),
)

const prodiSelection = computed<string[]>({
  get: () => modelValue.value.prodi_ids.map(String),
  set: (keys) => {
    modelValue.value.prodi_ids = keys.filter((k) => !k.includes('::')).map(Number)
  },
})

function newTimeRange() {
  return { start: '07:00', end: '17:00' }
}

function toDate(value: string): Date | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(h ?? 0, m ?? 0, 0, 0)
  return date
}

function fromDate(value: unknown): string {
  if (!(value instanceof Date)) return ''
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <label class="block text-sm font-medium text-surface-700 mb-1">Nama Pengaturan</label>
      <InputText v-model="modelValue.name" class="w-full max-w-md" :invalid="!!errors?.name" />
      <Message v-if="errors?.name" severity="error" size="small" variant="simple">{{
        errors.name
      }}</Message>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Program Studi</h3>
      <HierarchySelector v-model="prodiSelection" :options="prodiTreeOptions" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Aktivitas Khusus</h3>
      <ActivityPickList v-model="modelValue.activity_ids" :options="activityOptions" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Ruangan</h3>
      <MultiSelect
        v-model="modelValue.room_ids"
        :options="roomOptions"
        option-label="label"
        option-value="value"
        filter
        class="w-full"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Tipe Ruangan</h3>
      <MultiSelect
        v-model="modelValue.room_type_ids"
        :options="roomTypeOptions"
        option-label="label"
        option-value="value"
        class="w-full"
      />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Hari</h3>
      <CheckboxGroup v-model="modelValue.days" :options="dayOptions" select-all-label="Pilih Semua Hari" />
    </div>

    <div>
      <h3 class="text-sm font-semibold text-surface-800 mb-2">Rentang Waktu</h3>
      <RepeatableRows
        v-model="modelValue.time_ranges"
        :new-row="newTimeRange"
        add-label="Tambah Rentang Waktu"
      >
        <template #row="{ row }">
          <div class="grid grid-cols-2 gap-2">
            <DatePicker
              :model-value="toDate(row.start)"
              @update:model-value="row.start = fromDate($event)"
              time-only
              hour-format="24"
              placeholder="Mulai"
            />
            <DatePicker
              :model-value="toDate(row.end)"
              @update:model-value="row.end = fromDate($event)"
              time-only
              hour-format="24"
              placeholder="Selesai"
            />
          </div>
        </template>
      </RepeatableRows>
    </div>
  </div>
</template>
