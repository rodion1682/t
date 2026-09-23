// @/composables/useGlobalSearch.js
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'

const DEBOUNCE_DELAY = 300

export const useGlobalSearch = () => {
  const route = useRoute()
  const router = useRouter()
  const searchValue = ref(route.query.search || '')

  const handleGlobalSearch = debounce(searchQuery => {
    const newQuery = {
      ...route.query,
      search: searchQuery || undefined,
      page: '1',
    }
    Object.keys(newQuery).forEach(
      key => newQuery[key] === undefined && delete newQuery[key],
    )
    router.push({
      path: `/products/${route.params.category || 'all'}`,
      query: newQuery,
    })
  }, DEBOUNCE_DELAY)

  watch(
    () => route.query.search,
    newSearch => {
      searchValue.value = newSearch || ''
    },
  )

  const resetSearch = () => {
    searchValue.value = ''
    const newQuery = { ...route.query }
    delete newQuery.search
    if ('page' in newQuery) {
      newQuery.page = '1'
    }
    if (JSON.stringify(newQuery) !== JSON.stringify(route.query)) {
      router.push(
        {
          path: route.path,
          query: newQuery,
        },
        undefined,
        { shallow: true },
      )
    }
  }

  return { searchValue, handleGlobalSearch, resetSearch }
}
