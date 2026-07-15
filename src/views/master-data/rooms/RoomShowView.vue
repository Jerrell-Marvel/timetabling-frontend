<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import RoomDetail from '@/components/rooms/RoomDetail.vue'
import { roomsService, roomTypesService } from '@/services'
import type { Room } from '@/types'

const route = useRoute()
const router = useRouter()
const room = ref<Room | null>(null)
const roomTypeName = ref<string | undefined>()
const parentName = ref<string | undefined>()

onMounted(async () => {
  const data = await roomsService.get(Number(route.params.id))
  room.value = data

  const type = await roomTypesService.get(data.room_type_id)
  roomTypeName.value = type.name

  if (data.parent_id) {
    const parent = await roomsService.get(data.parent_id)
    parentName.value = parent.code
  }
})
</script>

<template>
  <CRUPage page="Ruangan" type="Detil" url="/rooms">
    <div class="flex justify-end mb-4">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        @click="router.push({ name: 'rooms.edit', params: { id: route.params.id } })"
      />
    </div>
    <RoomDetail v-if="room" :room="room" :room-type-name="roomTypeName" :parent-name="parentName" />
  </CRUPage>
</template>
