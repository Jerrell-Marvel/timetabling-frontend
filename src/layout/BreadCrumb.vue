<script setup lang="ts">
import { computed } from 'vue'

export interface BreadcrumbItem {
  name: string
  url?: string
}

const props = withDefaults(
  defineProps<{
    items: BreadcrumbItem[]
  }>(),
  {
    items: () => [],
  },
)

// Memetakan data kita (name, url) ke format PrimeVue (label, route)
const mappedItems = computed(() => {
  return props.items.map((item) => ({
    label: item.name,
    route: item.url,
  }))
})
</script>

<template>
  <Breadcrumb :model="mappedItems">
    <!-- Template bawaan PrimeVue untuk menangani Vue Router -->
    <template #item="{ item, props }">
      <!-- Jika item memiliki URL, render sebagai Router Link -->
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span v-bind="props.label">{{ item.label }}</span>
        </a>
      </router-link>

      <!-- Jika tidak memiliki URL (Item terakhir/Pasif), render biasa -->
      <a v-else :href="item.url" v-bind="props.action">
        <span v-bind="props.label" class="font-bold">{{ item.label }}</span>
      </a>
    </template>
  </Breadcrumb>
</template>
