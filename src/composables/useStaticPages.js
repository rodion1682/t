import { computed } from 'vue'
import { useStaticStore } from '@/stores/static'

export function useStaticPages() {
  const staticStore = useStaticStore()

  const termsPage = computed(() =>
    staticStore.pages.find(page => page.is_terms === 1),
  )
  const privacyPage = computed(() =>
    staticStore.pages.find(page => page.is_privacy === 1),
  )
  const cookiePage = computed(() => {
    // First, try to find by the specific flag
    const pageByFlag = staticStore.pages.find(page => page.is_cookie === 1)
    if (pageByFlag) {
      return pageByFlag
    }
    // If not found, fallback to searching by title
    const searchTerm = 'cookie'
    return staticStore.pages.find(page => {
      if (!page || !page.title) return false
      return page.title.toLowerCase().includes(searchTerm)
    })
  })

  const ensurePages = async () => {
    if (staticStore.pages.length === 0) {
      await staticStore.fetchPages()
    }
  }

  const getPageUrl = page => {
    if (!page) return ''
    return page.slug ? `/${page.slug}` : `/static-page/${page.id}`
  }

  return {
    termsPage,
    privacyPage,
    cookiePage,
    ensurePages,
    getPageUrl,
    loading: computed(() => staticStore.loading),
    error: computed(() => staticStore.error),
  }
}
