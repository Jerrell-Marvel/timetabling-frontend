<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import RoomFormFields from '@/components/rooms/RoomFormFields.vue'
import { useApiForm } from '@/composables/useApiForm'
import { roomsService, roomTypesService } from '@/services'
import type { Room, Option } from '@/types'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => id.value !== null)

const form = reactive<Room>({
  code: '',
  owner: '',
  campus: '',
  building: '',
  floor: '',
  capacity: 0,
  parent_id: null,
  room_type_id: 0,
  availabilities: [],
})
const roomTypeOptions = ref<Option[]>([])
const parentOptions = ref<Option[]>([])
const { errors, processing, submit } = useApiForm()

onMounted(async () => {
  const [types, rooms] = await Promise.all([roomTypesService.list(), roomsService.list()])
  roomTypeOptions.value = types.map((t) => ({ label: t.name, value: t.id! }))
  parentOptions.value = rooms
    .filter((r) => r.id !== id.value)
    .map((r) => ({ label: r.code, value: r.id! }))

  if (id.value !== null) {
    const data = await roomsService.get(id.value)
    Object.assign(form, data)
  }
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
