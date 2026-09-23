import axios from '@/plugins/axios'
import { useCurrencyStore } from '@/stores/currency'
import { debounce } from 'lodash'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const DEBOUNCE_DELAY = 400

export const PRODUCT_GAMES = {
  CS2: 'cs2',
  DOTA2: 'dota2',
}

export const ALLOWED_GAMES = [PRODUCT_GAMES.CS2]

export const SORT_OPTIONS = [
  {
    value: 'desc',
    label: 'From high to low ',
  },
  {
    value: 'asc',
    label: 'From low to high',
  },
]

export const DEFAULT_FILTERS = {
  search: '',
  sort: 'desc',

  priceRange: {
    min: null,
    max: null,
  },

  page: 1,
  perPage: 25,

  type: [],
  quality: [],
  subcategories: [],
  hero: [],
  class: [],
  exterior_name: [],

  special_offer: '',
}

const toArray = value => {
  return value ? String(value).split(',').filter(Boolean) : []
}

const normalizeGame = value => {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function useProductList(initialCategory = PRODUCT_GAMES.CS2) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const currencyStore = useCurrencyStore()

  const allowedGames = computed(() => {
    const games = ALLOWED_GAMES.map(normalizeGame).filter(game => {
      return Object.values(PRODUCT_GAMES).includes(game)
    })

    const uniqueGames = [...new Set(games)]

    if (!uniqueGames.length) {
      return [PRODUCT_GAMES.CS2]
    }

    return uniqueGames
  })

  const isCs2Allowed = computed(() => {
    return allowedGames.value.includes(PRODUCT_GAMES.CS2)
  })

  const isDota2Allowed = computed(() => {
    return allowedGames.value.includes(PRODUCT_GAMES.DOTA2)
  })

  const isSingleGame = computed(() => {
    return allowedGames.value.length === 1
  })

  const isCs2Only = computed(() => {
    return (
      allowedGames.value.length === 1 &&
      allowedGames.value[0] === PRODUCT_GAMES.CS2
    )
  })

  const isDota2Only = computed(() => {
    return (
      allowedGames.value.length === 1 &&
      allowedGames.value[0] === PRODUCT_GAMES.DOTA2
    )
  })

  const resolveAllowedGame = value => {
    const game = normalizeGame(value)

    if (allowedGames.value.includes(game)) {
      return game
    }

    return allowedGames.value[0]
  }

  const currentCategory = ref(
    resolveAllowedGame(
      route.query.category || initialCategory || allowedGames.value[0],
    ),
  )

  const currentGame = computed(() => {
    return currentCategory.value
  })

  const isCs2 = computed(() => {
    return currentCategory.value === PRODUCT_GAMES.CS2
  })

  const isDota2 = computed(() => {
    return currentCategory.value === PRODUCT_GAMES.DOTA2
  })

  const products = ref([])
  const loading = ref(false)
  const subcategoriesLoading = ref(false)
  const error = ref(null)
  const ready = ref(false)

  const availableFilters = reactive({
    types: [],
    qualities: [],
    heroes: [],
    exterior_names: [],
    classes: [],
    subcategories: [],
  })

  const pagination = reactive({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    from: 1,
    to: DEFAULT_FILTERS.perPage,
  })

  const currencyCode = computed(() => {
    return currencyStore.currentCurrencyCode || 'EUR'
  })

  const getForcedSpecialOffer = () => {
    if (route.name === 'NewItemsPage') {
      return 'new'
    }

    if (route.name === 'SalePage') {
      return 'sale'
    }

    return ''
  }

  const initializeFilters = () => {
    const q = route.query

    const forcedSpecialOffer = getForcedSpecialOffer()

    return {
      ...DEFAULT_FILTERS,

      priceRange: {
        min:
          q.price_from != null && q.price_from !== ''
            ? Number(q.price_from)
            : null,

        max:
          q.price_till != null && q.price_till !== ''
            ? Number(q.price_till)
            : null,
      },

      search: q.search ? String(q.search) : '',

      sort: q.sort ? String(q.sort) : DEFAULT_FILTERS.sort,

      page: q.page ? Number(q.page) : 1,

      perPage: q.per_page ? Number(q.per_page) : DEFAULT_FILTERS.perPage,

      type: toArray(q.type),

      quality: toArray(q.quality),

      subcategories: toArray(q.subcategories),

      hero: toArray(q.heroes),

      exterior_name: toArray(q.exterior_names),

      class: toArray(q.item_class),

      special_offer:
        forcedSpecialOffer || (q.special_offer ? String(q.special_offer) : ''),
    }
  }

  const filters = reactive(initializeFilters())

  const resetAvailableFilters = () => {
    availableFilters.types = []
    availableFilters.qualities = []
    availableFilters.heroes = []
    availableFilters.exterior_names = []
    availableFilters.classes = []
    availableFilters.subcategories = []
  }

  const buildQueryFromFilters = () => ({
    category: currentCategory.value,

    ...(filters.search && {
      search: filters.search,
    }),

    ...(filters.sort !== DEFAULT_FILTERS.sort && {
      sort: filters.sort,
    }),

    ...(filters.page > 1 && {
      page: String(filters.page),
    }),

    ...(filters.perPage !== DEFAULT_FILTERS.perPage && {
      per_page: String(filters.perPage),
    }),

    ...(filters.priceRange.min != null &&
      filters.priceRange.min !== 0 && {
        price_from: filters.priceRange.min,
      }),

    ...(filters.priceRange.max != null && {
      price_till: filters.priceRange.max,
    }),

    ...(filters.type.length && {
      type: filters.type.join(','),
    }),

    ...(filters.quality.length && {
      quality: filters.quality.join(','),
    }),

    ...(filters.subcategories.length && {
      subcategories: filters.subcategories.join(','),
    }),

    ...(filters.hero.length && {
      heroes: filters.hero.join(','),
    }),

    ...(filters.exterior_name.length && {
      exterior_names: filters.exterior_name.join(','),
    }),

    ...(filters.class.length && {
      item_class: filters.class.join(','),
    }),

    ...(filters.special_offer && {
      special_offer: filters.special_offer,
    }),
  })

  const updateURLQuery = async () => {
    await router.replace({
      path: route.path,
      query: buildQueryFromFilters(),
    })
  }

  const fetchFilterData = async () => {
    try {
      const { data } = await axios.get('/items/filter-data', {
        params: {
          category: currentCategory.value,
        },
      })

      if (data?.status !== 'OK') {
        resetAvailableFilters()
        return
      }

      availableFilters.types = (data.payload?.types || []).map(value => ({
        label: value,
        value,
      }))

      availableFilters.qualities = (data.payload?.qualities || []).map(
        value => ({
          label: value,
          value,
        }),
      )

      availableFilters.heroes = (data.payload?.heroes || []).map(value => ({
        label: value,
        value,
      }))

      availableFilters.exterior_names = (
        data.payload?.exterior_names || []
      ).map(value => ({
        label: value,
        value,
      }))

      availableFilters.classes = (data.payload?.classes || []).map(value => ({
        label: value,
        value,
      }))
    } catch (e) {
      console.error('fetchFilterData error:', e)

      resetAvailableFilters()
    }
  }

  const fetchSubcategories = async () => {
    subcategoriesLoading.value = true

    try {
      const { data } = await axios.get('/items/subcategories', {
        params: {
          category: currentCategory.value,
        },
      })

      availableFilters.subcategories =
        data?.status === 'OK' ? data.payload || [] : []
    } catch (e) {
      console.error('fetchSubcategories error:', e)

      availableFilters.subcategories = []
    } finally {
      subcategoriesLoading.value = false
    }
  }

  let currentRequestId = 0
  let abortController = null

  const fetchProductsImmediate = async () => {
    const requestId = ++currentRequestId

    currentCategory.value = resolveAllowedGame(currentCategory.value)

    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()

    loading.value = true
    error.value = null

    try {
      const params = {
        page: filters.page,
        limit: filters.perPage,
        sort: filters.sort,
        category: currentCategory.value,
        currency: currencyCode.value,
      }

      if (filters.search) {
        params.search = filters.search
      }

      if (filters.priceRange.min != null) {
        params.price_from = filters.priceRange.min
      }

      if (filters.priceRange.max != null) {
        params.price_till = filters.priceRange.max
      }

      if (filters.type.length) {
        params.type = filters.type.join(',')
      }

      if (filters.quality.length) {
        params.quality = filters.quality.join(',')
      }

      if (filters.subcategories.length) {
        params.subcategories = filters.subcategories.join(',')
      }

      if (filters.hero.length) {
        params.heroes = filters.hero.join(',')
      }

      if (filters.exterior_name.length) {
        params.exterior_names = filters.exterior_name.join(',')
      }

      if (filters.class.length) {
        params.item_class = filters.class.join(',')
      }

      if (filters.special_offer) {
        params.special_offer = filters.special_offer
      }

      const { data } = await axios.get('/items/list', {
        params,
        timeout: 15000,
        signal: abortController.signal,
      })

      if (requestId !== currentRequestId) {
        return
      }

      if (data?.status === 'OK') {
        products.value = data.payload || []

        const total = Number(data?.meta?.total ?? 0)
        const pages = Number(data?.meta?.pages ?? 1)

        pagination.total = total
        pagination.lastPage = pages
        pagination.currentPage = Number(filters.page || 1)

        pagination.from = total
          ? (pagination.currentPage - 1) * filters.perPage + 1
          : 0

        pagination.to = Math.min(
          pagination.currentPage * filters.perPage,
          total,
        )
      } else {
        products.value = []

        pagination.total = 0
        pagination.currentPage = 1
        pagination.lastPage = 1
        pagination.from = 0
        pagination.to = 0
      }
    } catch (err) {
      const canceled =
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED'

      if (canceled) {
        return
      }

      console.error('fetchProducts error:', err)

      if (
        err?.code === 'ECONNABORTED' ||
        String(err?.message || '').includes('timeout')
      ) {
        error.value = t('Request timeout. Please try again.')
      } else if (!err?.response) {
        error.value = t('Network error. Please check your connection.')
      } else {
        error.value =
          err.response?.data?.message || t('Failed to load products.')
      }

      products.value = []
    } finally {
      if (requestId === currentRequestId) {
        loading.value = false
        abortController = null
        ready.value = true
      }
    }
  }

  const fetchProducts = debounce(fetchProductsImmediate, DEBOUNCE_DELAY)

  const syncFromRouteAndFetch = async () => {
    const oldCategory = currentCategory.value

    const requestedCategory =
      route.query.category || initialCategory || allowedGames.value[0]

    const newCategory = resolveAllowedGame(requestedCategory)

    const categoryChanged = oldCategory !== newCategory

    currentCategory.value = newCategory

    Object.assign(filters, initializeFilters())

    const filtersAreEmpty =
      !availableFilters.types.length &&
      !availableFilters.qualities.length &&
      !availableFilters.heroes.length &&
      !availableFilters.exterior_names.length &&
      !availableFilters.classes.length &&
      !availableFilters.subcategories.length

    let filtersPromise = Promise.resolve()

    if (categoryChanged || filtersAreEmpty) {
      resetAvailableFilters()

      filtersPromise = Promise.all([fetchFilterData(), fetchSubcategories()])
    }

    await fetchProductsImmediate()

    await filtersPromise
  }

  const setCategory = async newCategory => {
    const normalizedCategory = normalizeGame(newCategory)

    if (!allowedGames.value.includes(normalizedCategory)) {
      console.warn(
        `Game "${normalizedCategory}" is not enabled in ALLOWED_GAMES.`,
      )

      return
    }

    if (normalizedCategory === currentCategory.value) {
      return
    }

    loading.value = true
    ready.value = true
    products.value = []

    currentCategory.value = normalizedCategory

    Object.assign(filters, {
      ...DEFAULT_FILTERS,

      priceRange: {
        ...DEFAULT_FILTERS.priceRange,
      },

      type: [],
      quality: [],
      subcategories: [],
      hero: [],
      class: [],
      exterior_name: [],

      special_offer: getForcedSpecialOffer(),
    })

    resetAvailableFilters()

    await updateURLQuery()
  }

  const updateFilters = async newFilters => {
    if (!Object.prototype.hasOwnProperty.call(newFilters, 'page')) {
      filters.page = 1
    }

    Object.assign(filters, newFilters)

    const forcedSpecialOffer = getForcedSpecialOffer()

    if (forcedSpecialOffer) {
      filters.special_offer = forcedSpecialOffer
    }

    await updateURLQuery()
  }

  const resetFilters = async () => {
    Object.assign(filters, {
      ...DEFAULT_FILTERS,

      priceRange: {
        ...DEFAULT_FILTERS.priceRange,
      },

      type: [],
      quality: [],
      subcategories: [],
      hero: [],
      class: [],
      exterior_name: [],

      special_offer: getForcedSpecialOffer(),
    })

    await updateURLQuery()
  }

  watch(
    () => route.fullPath,
    async () => {
      await syncFromRouteAndFetch()
    },
    {
      immediate: true,
    },
  )

  watch(
    () => currencyStore.currentCurrencyCode,
    async () => {
      filters.priceRange.min = null
      filters.priceRange.max = null
      filters.page = 1

      await updateURLQuery()
    },
  )

  return {
    SORT_OPTIONS,

    allowedGames,

    isSingleGame,

    isCs2Allowed,
    isDota2Allowed,

    isCs2Only,
    isDota2Only,

    isCs2,
    isDota2,

    products,

    loading,
    subcategoriesLoading,
    error,
    ready,

    filters,
    availableFilters,

    pagination,

    currentGame,

    setCategory,

    updateFilters,
    resetFilters,

    fetchProducts,
    fetchProductsImmediate,

    syncFromRouteAndFetch,

    fetchFilterData,
    fetchSubcategories,
  }
}
