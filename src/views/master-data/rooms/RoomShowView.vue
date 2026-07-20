<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CRUPage from '@/layout/CRUPage.vue'
import RoomDetail from '@/components/rooms/RoomDetail.vue'
import { roomsService } from '@/services'
import type { Room } from '@/types'

const route = useRoute()
const router = useRouter()
const room = ref<Room | null>(null)
const parentName = ref<string | undefined>()

onMounted(async () => {
  // `RoomResponse` embeds `roomType`, so only the parent needs resolving.
  const data = await roomsService.get(Number(route.params.id))
  room.value = data

  if (data.parentRoomId) {
    const parent = await roomsService.get(data.parentRoomId)
    parentName.value = parent.roomCode
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
    <RoomDetail v-if="room" :room="room" :parent-name="parentName" />
  </CRUPage>
</template>
