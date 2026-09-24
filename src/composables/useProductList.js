import axios from '@/plugins/axios'
import { useCurrencyStore } from '@/stores/currency'

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
    value: 'asc',
    label: 'Lowest first',
  },
  {
    value: 'desc',
    label: 'Highest first',
  },
]

export const DEFAULT_FILTERS = {
  search: '',
  sort: 'asc',

  priceRange: {
    min: null,
    max: null,
  },

  page: 1,
  perPage: 15,

  type: [],
  quality: [],
  subcategories: [],
  hero: [],
  class: [],
  exterior_name: [],

  special_offer: '',
}

const toArray = value => {
  if (!value) {
    return []
  }

  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const normalizeGame = value => {
  return String(value || '')
    .trim()
    .toLowerCase()
}

const normalizePage = value => {
  const page = Number(value)

  if (!Number.isFinite(page) || page < 1) {
    return 1
  }

  return Math.floor(page)
}

const normalizePerPage = value => {
  const perPage = Number(value)

  if (!Number.isFinite(perPage) || perPage < 1) {
    return DEFAULT_FILTERS.perPage
  }

  return Math.floor(perPage)
}

const normalizePrice = value => {
  if (value == null || value === '') {
    return null
  }

  const price = Number(value)

  if (!Number.isFinite(price) || price < 0) {
    return null
  }

  return price
}

const normalizeSort = value => {
  const sort = String(value || '')
    .trim()
    .toLowerCase()

  return SORT_OPTIONS.some(option => option.value === sort)
    ? sort
    : DEFAULT_FILTERS.sort
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

    return allowedGames.value[0] || PRODUCT_GAMES.CS2
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
    from: 0,
    to: 0,
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
        min: normalizePrice(q.price_from),

        max: normalizePrice(q.price_till),
      },

      search: q.search ? String(q.search).trim() : '',

      sort: normalizeSort(q.sort),

      page: normalizePage(q.page),

      perPage: normalizePerPage(q.per_page),

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

  const mapFilterOptions = values => {
    if (!Array.isArray(values)) {
      return []
    }

    return values
      .filter(value => value != null && value !== '')
      .map(value => {
        if (typeof value === 'object') {
          const optionValue = value.value ?? value.name ?? value.label

          return {
            ...value,

            label: value.label ?? value.name ?? optionValue,

            value: optionValue,
          }
        }

        return {
          label: value,
          value,
        }
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

      const payload = data.payload || {}

      availableFilters.types = mapFilterOptions(payload.types)

      availableFilters.qualities = mapFilterOptions(payload.qualities)

      availableFilters.heroes = mapFilterOptions(payload.heroes)

      availableFilters.exterior_names = mapFilterOptions(payload.exterior_names)

      availableFilters.classes = mapFilterOptions(payload.classes)
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
        products.value = Array.isArray(data.payload) ? data.payload : []

        const total = Number(data?.meta?.total ?? 0)

        const pages = Math.max(1, Number(data?.meta?.pages ?? 1))

        pagination.total = Number.isFinite(total) ? total : 0

        pagination.lastPage = Number.isFinite(pages) ? pages : 1

        pagination.currentPage = normalizePage(filters.page)

        pagination.from = pagination.total
          ? (pagination.currentPage - 1) * filters.perPage + 1
          : 0

        pagination.to = Math.min(
          pagination.currentPage * filters.perPage,

          pagination.total,
        )

        return
      }

      products.value = []

      pagination.total = 0
      pagination.currentPage = 1
      pagination.lastPage = 1
      pagination.from = 0
      pagination.to = 0
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

      pagination.total = 0
      pagination.currentPage = 1
      pagination.lastPage = 1
      pagination.from = 0
      pagination.to = 0
    } finally {
      if (requestId === currentRequestId) {
        loading.value = false

        abortController = null

        ready.value = true
      }
    }
  }

  /*
   * Kept for components that may want
   * a debounced product refresh directly.
   *
   * ProductListPage normally changes
   * filters -> URL -> route watcher ->
   * fetchProductsImmediate().
   */
  let fetchProductsTimer = null

  const fetchProducts = () => {
    window.clearTimeout(fetchProductsTimer)

    fetchProductsTimer = window.setTimeout(
      fetchProductsImmediate,
      DEBOUNCE_DELAY,
    )
  }

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
    const nextFilters = {
      ...newFilters,
    }

    if (!Object.prototype.hasOwnProperty.call(nextFilters, 'page')) {
      nextFilters.page = 1
    }

    if (Object.prototype.hasOwnProperty.call(nextFilters, 'page')) {
      nextFilters.page = normalizePage(nextFilters.page)
    }

    if (Object.prototype.hasOwnProperty.call(nextFilters, 'sort')) {
      nextFilters.sort = normalizeSort(nextFilters.sort)
    }

    if (Object.prototype.hasOwnProperty.call(nextFilters, 'search')) {
      nextFilters.search = String(nextFilters.search || '').trim()
    }

    if (nextFilters.priceRange) {
      nextFilters.priceRange = {
        min: normalizePrice(nextFilters.priceRange.min),

        max: normalizePrice(nextFilters.priceRange.max),
      }
    }

    Object.assign(filters, nextFilters)

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

    async (newCurrency, oldCurrency) => {
      if (!oldCurrency || newCurrency === oldCurrency) {
        return
      }

      filters.priceRange.min = null

      filters.priceRange.max = null

      filters.page = 1

      await updateURLQuery()

      /*
       * If URL did not change because
       * there were no price params/page
       * to remove, the route watcher
       * will not fire. Refresh directly.
       */
      await fetchProductsImmediate()
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
