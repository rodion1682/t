// useMediaQuery.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(false)
  let mediaQuery

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    const handler = e => (matches.value = e.matches)
    mediaQuery.addEventListener('change', handler)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handler)
    })
  })

  return matches
}
