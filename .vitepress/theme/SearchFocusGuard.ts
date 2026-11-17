import { defineComponent, onBeforeUnmount, onMounted } from 'vue'

type SearchOrigin = { button: HTMLButtonElement; href: string }

// VitePress 1.6.4's local-search trap can remember its own input as the return
// target. That input disappears on Escape. Keep the native UI and repair only
// the keyboard path whose original focus was the search trigger. A pointer
// opening starts at the dialog; keyboard openings keep native input focus.
export default defineComponent({
  name: 'SearchFocusGuard',
  setup() {
    let origin: SearchOrigin | undefined
    let pointerOrigin: SearchOrigin | undefined
    let revision = 0
    let frame = 0
    let pointerFrame = 0

    function forgetOrigin() {
      origin = undefined
      revision++
    }

    function forgetPointerOrigin() {
      pointerOrigin = undefined
      cancelAnimationFrame(pointerFrame)
      pointerFrame = 0
    }

    function onPointerDown(event: PointerEvent) {
      forgetOrigin()
      forgetPointerOrigin()
      const button = event.target instanceof Element
        ? event.target.closest('.VPNavBarSearch .DocSearch-Button')
        : null
      if (button instanceof HTMLButtonElement && !document.querySelector('.VPLocalSearchBox')) {
        pointerOrigin = { button, href: window.location.href }
      }
    }

    function onFocusIn(event: FocusEvent) {
      if (!pointerOrigin || !(event.target instanceof HTMLInputElement) ||
        !event.target.matches('.VPLocalSearchBox .search-input')) return
      const previous = pointerOrigin
      const modal = event.target.closest<HTMLElement>('.VPLocalSearchBox')
      if (!modal || previous.href !== window.location.href || !previous.button.isConnected) {
        forgetPointerOrigin()
        return
      }
      modal.tabIndex = -1
      modal.setAttribute('role', 'dialog')
      modal.setAttribute('aria-modal', 'true')
      modal.setAttribute('aria-label', previous.button.getAttribute('aria-label') || 'Search')
      modal.removeAttribute('aria-labelledby')
      modal.removeAttribute('aria-expanded')
      modal.removeAttribute('aria-haspopup')
      modal.focus({ preventScroll: true })
      // Native mounted focus + select + trap activation can focus the input
      // more than once. Guard only this initial render, never later user focus.
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0
            if (pointerOrigin === previous) pointerOrigin = undefined
          })
        })
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const modal = document.querySelector('.VPLocalSearchBox')
      const shortcut = event.key === 'k' && (event.ctrlKey || event.metaKey)
      const opensSearch = shortcut ||
        event.key === '/' || event.key === 'Enter' || event.key === ' '
      if (event.key === 'Tab' || event.key === 'Escape' || shortcut) forgetPointerOrigin()
      if (modal && shortcut) modal.querySelector<HTMLInputElement>('.search-input')?.focus()
      if (opensSearch && !modal) {
        const active = document.activeElement
        forgetPointerOrigin()
        forgetOrigin()
        if (active instanceof HTMLButtonElement && active.matches('.VPNavBarSearch .DocSearch-Button')) {
          origin = { button: active, href: window.location.href }
        }
        return
      }

      if (event.key !== 'Escape' || !modal || !origin) return
      const previous = origin
      forgetOrigin()
      const pending = revision
      // Let Vue unmount the modal and the native trap finish deactivating.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const active = document.activeElement
          if (
            pending === revision &&
            previous.href === window.location.href &&
            previous.button.isConnected &&
            !document.querySelector('.VPLocalSearchBox') &&
            (!active || active === document.body || active === document.documentElement)
          ) {
            previous.button.focus({ preventScroll: true })
          }
        })
      })
    }

    onMounted(() => {
      document.addEventListener('keydown', onKeyDown, true)
      document.addEventListener('pointerdown', onPointerDown, true)
      document.addEventListener('focusin', onFocusIn, true)
    })
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('focusin', onFocusIn, true)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(pointerFrame)
    })
    return () => null
  },
})
