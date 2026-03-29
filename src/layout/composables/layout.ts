import { reactive } from 'vue'

type LayoutState = {
  staticMenuInactive: boolean // hamburger menu dekstop
  mobileMenuActive: boolean // hamburger menu mobile
}

const layoutState = reactive<LayoutState>({
  staticMenuInactive: false,
  mobileMenuActive: false,
})

export function useLayout() {
  const isDesktop = () => window.innerWidth > 991

  // hamburger diklik
  const toggleMenu = () => {
    if (isDesktop()) {
      layoutState.staticMenuInactive = !layoutState.staticMenuInactive
    } else {
      layoutState.mobileMenuActive = !layoutState.mobileMenuActive
    }
  }

  // tutup di mobile
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
