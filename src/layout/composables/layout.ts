import { reactive } from 'vue'

// Hanya butuh 2 state: untuk Desktop dan Mobile
type LayoutState = {
  staticMenuInactive: boolean
  mobileMenuActive: boolean
}

const layoutState = reactive<LayoutState>({
  staticMenuInactive: false, // Desktop menu (false = terbuka, true = tertutup/menyusut)
  mobileMenuActive: false, // Mobile menu (false = tertutup, true = terbuka)
})

export function useLayout() {
  // Cek apakah layar saat ini ukuran Desktop (Tailwind 'lg' breakpoint biasanya > 1024px,
  // tapi kita pakai 991px menyesuaikan bawaan PrimeVue)
  const isDesktop = () => window.innerWidth > 991

  // Fungsi yang dipanggil saat tombol hamburger di Topbar diklik
  const toggleMenu = () => {
    if (isDesktop()) {
      layoutState.staticMenuInactive = !layoutState.staticMenuInactive
    } else {
      layoutState.mobileMenuActive = !layoutState.mobileMenuActive
    }
  }

  // Fungsi untuk menutup menu di HP (misal saat background hitam diklik)
  const hideMobileMenu = () => {
    layoutState.mobileMenuActive = false
  }

  return {
    layoutState,
    toggleMenu,
    hideMobileMenu,
    isDesktop,
  }
}
