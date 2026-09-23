<script setup>
import { computed, onMounted, ref } from 'vue'

import axios from '@/plugins/axios'

import CategorySection from '@/pages/HomePage/components/CategorySection.vue'
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import { useI18n } from 'vue-i18n'
import ApartSection from './components/ApartSection.vue'
import HowSection from './components/HowSection.vue'
import StartSection from './components/StartSection.vue'
import WhySection from './components/WhySection.vue'

const { t } = useI18n()

const CATEGORY = 'cs2'

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

const HERO_TYPES = ['gloves', 'pistol', 'rifle']

const loading = ref(false)
const filterData = ref(null)
const totalItems = ref(0)
const categoryData = ref({})
const heroItems = ref([])

const categories = computed(() => {
  return MARKET_CATEGORIES.map((category, index) => ({
    ...category,
    number: String(index + 1).padStart(2, '0'),
    total: categoryData.value[category.key]?.total || 0,
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
      return
    }

    filterData.value = data.payload || null
  } catch (error) {
    console.error('Failed to fetch filter data:', error)
  }
}

const fetchCategory = async category => {
  try {
    const { data } = await axios.get('/items/list', {
      params: {
        category: CATEGORY,
        type: category.key,
        random: HERO_TYPES.includes(category.key) ? 1 : undefined,
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

const fetchCategories = async () => {
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

  heroItems.value = HERO_TYPES.map(type => {
    const item = categoryData.value[type]?.item

    if (!item) {
      return null
    }

    return {
      ...item,
      heroType: type,
    }
  }).filter(Boolean)
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
      return
    }

    totalItems.value = Number(data.meta?.total || 0)
  } catch (error) {
    console.error('Failed to fetch total items:', error)
  }
}

const loadHome = async () => {
  loading.value = true

  try {
    await Promise.all([fetchFilterData(), fetchTotalItems(), fetchCategories()])
  } catch (error) {
    console.error('Failed to load home page:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadHome)
</script>

<template>
  <div class="home">
    <HeroSection
      :loading="loading"
      :hero-items="heroItems"
      :total-items="totalItems"
      :category-count="categoryCount"
    />

    <CategorySection :loading="loading" :categories="categories" />

    <HowSection />
    <WhySection />
    <ApartSection />
    <StartSection />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;
</style>
