<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import axios from '@/plugins/axios'

import CategorySection from '@/pages/HomePage/components/CategorySection.vue'
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import DropSection from './components/DropSection.vue'
import HowSection from './components/HowSection.vue'
import ListingSection from './components/ListingSection.vue'
import MarketSection from './components/MarketSection.vue'
import StartSection from './components/StartSection.vue'

const { t } = useI18n()

const CATEGORY = 'cs2'

const HERO_ITEMS_LIMIT = 10
const MARKET_ITEMS_LIMIT = 10

const MARKET_CATEGORIES = [
  {
    key: 'rifle',
    label: t('Rifles'),
  },
  {
    key: 'knife',
    label: t('Knives'),
  },
  {
    key: 'sniper rifle',
    label: t('Snipers'),
  },
  {
    key: 'gloves',
    label: t('Gloves'),
  },
  {
    key: 'pistol',
    label: t('Pistols'),
  },
  {
    key: 'smg',
    label: t('SMGs'),
  },
]

const heroItems = ref([])
const totalItems = ref(0)
const filterData = ref(null)

const categoryData = ref({})

const dropItem = ref(null)

const marketItems = ref([])

const heroLoading = ref(true)
const categoriesLoading = ref(true)
const dropLoading = ref(false)
const marketLoading = ref(false)

const heroLoaded = ref(false)
const categoriesLoaded = ref(false)
const dropLoaded = ref(false)
const marketLoaded = ref(false)

const listingTrigger = ref(null)
const dropTrigger = ref(null)

let listingObserver = null
let dropObserver = null

const categories = computed(() => {
  return MARKET_CATEGORIES.map((category, index) => ({
    ...category,

    number: String(index + 1).padStart(2, '0'),

    total: categoryData.value[category.key]?.total || 0,

    item: categoryData.value[category.key]?.item || null,
  }))
})

const categoryCount = computed(() => {
  return filterData.value?.types?.length || 0
})

const fetchFilterData = async () => {
  try {
    const { data } = await axios.get('/items/filter-data', {
      params: {
        category: CATEGORY,
      },
    })

    if (data?.status !== 'OK') {
      filterData.value = null

      return
    }

    filterData.value = data.payload || null
  } catch (error) {
    console.error('Failed to fetch filter data:', error)

    filterData.value = null
  }
}

const fetchTotalItems = async () => {
  try {
    const { data } = await axios.get('/items/list', {
      params: {
        category: CATEGORY,
        page: 1,
        limit: 10,
      },
    })

    if (data?.status !== 'OK') {
      totalItems.value = 0

      return
    }

    totalItems.value = Number(data.meta?.total || 0)
  } catch (error) {
    console.error('Failed to fetch total items:', error)

    totalItems.value = 0
  }
}

const fetchHeroItems = async () => {
  try {
    const { data } = await axios.get('/items/list', {
      params: {
        category: CATEGORY,
        random: 1,
        page: 1,
        limit: HERO_ITEMS_LIMIT,
      },
    })

    if (data?.status !== 'OK') {
      heroItems.value = []

      return
    }

    heroItems.value = Array.isArray(data.payload)
      ? data.payload.slice(0, HERO_ITEMS_LIMIT)
      : []
  } catch (error) {
    console.error('Failed to fetch hero items:', error)

    heroItems.value = []
  }
}

const loadHero = async () => {
  if (heroLoaded.value) {
    return
  }

  heroLoading.value = true

  try {
    await Promise.all([fetchFilterData(), fetchTotalItems(), fetchHeroItems()])
  } catch (error) {
    console.error('Failed to load hero section:', error)
  } finally {
    heroLoading.value = false
    heroLoaded.value = true
  }
}

const fetchCategory = async category => {
  try {
    const { data } = await axios.get('/items/list', {
      params: {
        category: CATEGORY,
        type: category.key,
        random: 1,
        page: 1,
        limit: 10,
      },
    })

    if (data?.status !== 'OK') {
      return {
        key: category.key,
        total: 0,
        item: null,
      }
    }

    return {
      key: category.key,

      total: Number(data.meta?.total || 0),

      item: data.payload?.[0] || null,
    }
  } catch (error) {
    console.error(`Failed to fetch ${category.key}:`, error)

    return {
      key: category.key,
      total: 0,
      item: null,
    }
  }
}

const loadCategories = async () => {
  if (categoriesLoaded.value) {
    return
  }

  categoriesLoading.value = true

  try {
    const results = await Promise.all(
      MARKET_CATEGORIES.map(category => fetchCategory(category)),
    )

    categoryData.value = results.reduce((acc, result) => {
      acc[result.key] = {
        total: result.total,
        item: result.item,
      }

      return acc
    }, {})
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    categoriesLoading.value = false
    categoriesLoaded.value = true
  }
}

const loadDrop = async () => {
  if (dropLoaded.value || dropLoading.value) {
    return
  }

  dropLoading.value = true

  try {
    const { data } = await axios.get('/items/daily', {
      params: {
        category: CATEGORY,
      },
    })

    if (data?.status !== 'OK') {
      dropItem.value = null

      return
    }

    dropItem.value = data.payload || null
  } catch (error) {
    console.error('Failed to fetch drop of the week:', error)

    dropItem.value = null
  } finally {
    dropLoading.value = false
    dropLoaded.value = true

    await nextTick()

    observeDropTrigger()
  }
}

const loadMarket = async () => {
  if (marketLoaded.value || marketLoading.value) {
    return
  }

  marketLoading.value = true

  try {
    const { data } = await axios.get('/items/list', {
      params: {
        category: CATEGORY,
        random: 1,
        page: 1,
        limit: MARKET_ITEMS_LIMIT,
      },
    })

    if (data?.status !== 'OK') {
      marketItems.value = []

      return
    }

    marketItems.value = Array.isArray(data.payload)
      ? data.payload.slice(0, MARKET_ITEMS_LIMIT)
      : []
  } catch (error) {
    console.error('Failed to fetch market items:', error)

    marketItems.value = []
  } finally {
    marketLoading.value = false
    marketLoaded.value = true
  }
}

const observeListingTrigger = () => {
  if (!listingTrigger.value) {
    return
  }

  listingObserver?.disconnect()

  listingObserver = new IntersectionObserver(
    entries => {
      const entry = entries[0]

      if (!entry?.isIntersecting) {
        return
      }

      listingObserver?.disconnect()
      listingObserver = null

      loadDrop()
    },
    {
      root: null,

      /*
       * Start just before the user
       * actually reaches the trigger.
       */
      rootMargin: '0px 0px 200px 0px',

      threshold: 0,
    },
  )

  listingObserver.observe(listingTrigger.value)
}

const observeDropTrigger = () => {
  if (!dropTrigger.value || marketLoaded.value || marketLoading.value) {
    return
  }

  dropObserver?.disconnect()

  dropObserver = new IntersectionObserver(
    entries => {
      const entry = entries[0]

      if (!entry?.isIntersecting) {
        return
      }

      dropObserver?.disconnect()
      dropObserver = null

      loadMarket()
    },
    {
      root: null,

      rootMargin: '0px 0px 200px 0px',

      threshold: 0,
    },
  )

  dropObserver.observe(dropTrigger.value)
}

const loadInitialSections = async () => {
  /*
   * Hero and categories are independent.
   *
   * Both start immediately, but neither
   * waits for the other before rendering.
   */
  loadHero()
  loadCategories()

  await nextTick()

  observeListingTrigger()
}

onMounted(() => {
  loadInitialSections()
})

onBeforeUnmount(() => {
  listingObserver?.disconnect()
  dropObserver?.disconnect()

  listingObserver = null
  dropObserver = null
})
</script>

<template>
  <div class="home">
    <!-- HERO -->

    <div
      v-if="heroLoading"
      class="home__section-loader home__section-loader_hero"
    >
      <LoadingSpinner />
    </div>

    <HeroSection
      v-else
      :hero-items="heroItems"
      :total-items="totalItems"
      :category-count="categoryCount"
    />

    <!-- CATEGORIES -->

    <div
      v-if="categoriesLoading"
      class="home__section-loader home__section-loader_categories"
    >
      <LoadingSpinner />
    </div>

    <CategorySection
      v-else
      :categories="categories"
      :category-count="categoryCount"
    />

    <!--
      No request required.
      Always render immediately.
    -->

    <div ref="listingTrigger" class="home__trigger" aria-hidden="true"></div>

    <ListingSection />

    <!--
      DROP

      Request starts when the top of the
      Listing area approaches viewport.
    -->

    <div ref="dropTrigger" class="home__trigger" aria-hidden="true"></div>

    <div
      v-if="dropLoading"
      class="home__section-loader home__section-loader_drop"
    >
      <LoadingSpinner />
    </div>

    <DropSection v-else-if="dropLoaded && dropItem" :item="dropItem" />

    <!--
      MARKET

      Request starts when dropTrigger
      approaches the viewport.
    -->

    <div
      v-if="marketLoading"
      class="home__section-loader home__section-loader_market"
    >
      <LoadingSpinner />
    </div>

    <MarketSection v-else-if="marketLoaded" :items="marketItems" />

    <!--
      No requests required.
      Always rendered.
    -->

    <HowSection />

    <StartSection />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.home {
  &__trigger {
    width: 100%;
    height: 1px;

    pointer-events: none;
  }

  &__section-loader {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    &_hero {
      @include header-indent;

      min-height: 650px;
    }

    &_categories {
      min-height: 500px;
    }

    &_drop {
      min-height: 450px;
    }

    &_market {
      min-height: 500px;
    }
  }
}
</style>
