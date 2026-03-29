<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/layout/composables/layout'

const route = useRoute()
const { layoutState, isDesktop } = useLayout()

// 1. Definisikan tipe data untuk Props
type MenuItem = {
  label: string
  icon?: string
  to?: string
  url?: string
  target?: string
  items?: MenuItem[]
  visible?: boolean
  disabled?: boolean
  command?: (event: unknown) => void
}

const props = defineProps<{
  item: MenuItem
  root?: boolean
  index?: number
}>()

// 2. Logika Dropdown Terbuka/Tertutup (Lokal)
const isExpanded = ref(false)

// 3. Cek apakah menu aktif (berdasarkan Vue Router)
const isActive = computed(() => {
  console.log('label', props.item.label)
  console.log('path sekarang', route.path)
  console.log('to', props.item.to)
  console.log('sdkjfsdl', route.path.startsWith(props.item.to + '/'))

  if (props.item.to) {
    console.log('herer')
    console.log(route.path)
    console.log(props.item.to + '/')
    console.log(route.path.startsWith(props.item.to + '/'))
    return route.path === props.item.to || route.path.startsWith(props.item.to + '/')
  }
  // Jika punya anak, aktif jika salah satu anak aktif
  if (props.item.items) {
    console.log('ksdfjlskjfklsdklf')
    return props.item.items.some((child) => child.to && route.path.startsWith(child.to))
  }

  return false
})

// 4. Fungsi saat diklik
const itemClick = (event: Event) => {
  if (props.item.disabled) {
    event.preventDefault()
    return
  }

  if (props.item.command) {
    props.item.command({ originalEvent: event, item: props.item })
  }

  // Toggle submenu
  if (props.item.items) {
    isExpanded.value = !isExpanded.value
    console.log('dksfjlsdjk')
  } else {
    // Jika di HP dan mengklik link biasa, tutup sidebar otomatis
    if (!isDesktop()) {
      layoutState.mobileMenuActive = false
    }
  }
}
</script>

<template>
  <li v-if="item.visible !== false" :class="{ 'mt-4': root }">
    <a
      v-if="!item.to || item.items"
      :href="item.url"
      :target="item.target"
      @click="itemClick"
      class="flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors select-none"
      :class="
        isActive
          ? 'text-emerald-600 bg-emerald-50 font-semibold'
          : 'text-surface-700 hover:bg-surface-100'
      "
      tabindex="0"
    >
      <i v-if="item.icon" :class="item.icon" class="mr-3 text-lg" />
      <span class="flex-1">{{ item.label }}</span>
      <i
        v-if="item.items"
        class="pi pi-fw pi-angle-down ml-auto transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
      />
    </a>

    <router-link
      v-if="item.to && !item.items"
      :to="item.to"
      @click="itemClick"
      class="flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors select-none group"
      :class="
        isActive
          ? 'text-emerald-600 bg-emerald-50 font-semibold'
          : 'text-surface-700 hover:bg-surface-100'
      "
      tabindex="0"
    >
      <i v-if="item.icon" :class="item.icon" class="mr-3 text-lg" />
      <span class="flex-1">{{ item.label }}</span>
    </router-link>

    <Transition
      enter-active-class="transition-all duration-300 ease-in-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-96 opacity-100"
      leave-active-class="transition-all duration-200 ease-in-out"
      leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <ul v-show="item.items && root && isExpanded" class="list-none p-0 m-0 pl-4 overflow-hidden">
        <AppMenuItem
          v-for="(child, i) in item.items"
          :key="child.label"
          :item="child"
          :index="i"
          :root="false"
        />
      </ul>
    </Transition>
  </li>
</template>
