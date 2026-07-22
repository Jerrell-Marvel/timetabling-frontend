<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import RoomFormFields from '@/components/rooms/RoomFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { roomsService, roomTypesService } from '@/services'
import { isClosed } from '@/types'
import type { Option, RoomPayload } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<RoomPayload>({
  roomCode: '',
  name: '',
  unitOwner: '',
  location: '',
  building: '',
  floor: '',
  capacity: null,
  parentRoomId: null,
  roomTypeId: null,
  virtual: null,
  availabilities: [],
})
const roomTypeOptions = ref<Option[]>([])
const parentOptions = ref<Option[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  const [types, rooms] = await Promise.all([roomTypesService.list(), roomsService.list()])
  roomTypeOptions.value = types.map((t) => ({ label: t.name, value: t.id }))
  // A room cannot be its own parent.
  parentOptions.value = rooms
    .filter((r) => r.id !== id.value)
    .map((r) => ({ label: r.roomCode, value: r.id }))

  if (id.value === null) return

  const data = await roomsService.get(id.value)
  // Copy only writable fields — `id`, `childIds` and `roomType` are read-only.
  form.roomCode = data.roomCode
  form.name = data.name
  form.unitOwner = data.unitOwner
  form.location = data.location
  form.building = data.building
  form.floor = data.floor
  form.capacity = data.capacity
  form.parentRoomId = data.parentRoomId ?? null
  form.roomTypeId = data.roomTypeId
  form.virtual = data.virtual ?? null
  // A room always carries all six days; closed ones come back as 00:00–00:00.
  // The grid models "closed" as an absent row, so drop them here and let the
  // backend re-materialize them on save.
  form.availabilities = (data.availabilities ?? [])
    .filter((a) => !isClosed(a))
    .map((a) => ({ day: a.day, startTime: a.startTime, endTime: a.endTime }))
})

async function handleSubmit() {
  await submit(() =>
    isEdit.value ? roomsService.update(id.value!, form) : roomsService.create(form),
  )
  router.push({ name: 'rooms.index' })
}
</script>

<template>
  <CRUPage page="Ruangan" :type="isEdit ? 'Ubah' : 'Buat'" url="/rooms">
    <template #error>
      <Message v-if="Object.keys(errors).length" severity="error" :closable="false" class="mb-4">
        Periksa kembali data yang diisi.
      </Message>
    </template>

    <RoomFormFields
      :model-value="form"
      :errors="errors"
      :room-type-options="roomTypeOptions"
      :parent-options="parentOptions"
    />

    <div class="flex justify-end gap-2 mt-6">
      <Button
        label="Batal"
        text
        severity="secondary"
        @click="router.push({ name: 'rooms.index' })"
      />
      <Button label="Simpan" icon="pi pi-save" :loading="processing" @click="handleSubmit" />
    </div>
  </CRUPage>
</template>
