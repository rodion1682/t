<script setup>
import {
  GlovesIcon,
  KnifeIcon,
  PistolIcon,
  RifleIcon,
  StickerIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import axios from '@/plugins/axios'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()

const { t } = useI18n()

const loadingCategories = ref(false)
const categories = ref([])

const CS2_CATEGORY_CONFIG = [
  {
    key: 'knives',
    label: t('Knives'),
    category: 'Knife',
    filterType: 'type',
    icon: KnifeIcon,
  },
  {
    key: 'gloves',
    label: t('Gloves'),
    category: 'Gloves',
    filterType: 'type',
    icon: GlovesIcon,
  },
  {
    key: 'rifles',
    label: t('Rifles'),
    category: 'Rifle',
    filterType: 'type',
    icon: RifleIcon,
  },
  {
    key: 'pistols',
    label: t('Pistols'),
    category: 'Pistol',
    filterType: 'type',
    icon: PistolIcon,
  },
  {
    key: 'stickers',
    label: t('Stickers'),
    category: 'Sticker',
    filterType: 'type',
    icon: StickerIcon,
  },
]

const normalizeValue = value => {
  return String(value || '')
    .trim()
    .toLowerCase()
}

const normalizeCategory = item => {
  return {
    label: item?.category || '',
    value: normalizeValue(item?.category),
    queryValue: item?.category || '',

    subCategories: Array.isArray(item?.sub_categories)
      ? item.sub_categories
      : [],
  }
}

const visibleCategories = computed(() => {
  return CS2_CATEGORY_CONFIG.map((config, index) => {
    const matchedCategory = categories.value.find(category => {
      return category.value === normalizeValue(config.category)
    })

    // Don't display category if API doesn't provide it.
    if (!matchedCategory) {
      return null
    }

    return {
      key: config.key,
      label: config.label,
      icon: config.icon,

      queryValue: matchedCategory.queryValue,

      subCategories: matchedCategory.subCategories,

      filterType: config.filterType,
    }
  }).filter(Boolean)
})

const fetchCategories = async () => {
  loadingCategories.value = true

  try {
    const { data } = await axios.get('/items/subcategories', {
      params: {
        category: 'cs2',
      },
    })

    if (data?.status !== 'OK' || !Array.isArray(data?.payload)) {
      categories.value = []
      return
    }

    categories.value = data.payload
      .map(normalizeCategory)
      .filter(category => category.value)
  } catch (error) {
    console.error('Failed to fetch CS2 categories:', error)

    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const goToCategory = category => {
  if (!category) {
    return
  }

  const query = {
    category: 'cs2',
    page: 1,
  }

  if (category.filterType === 'type' && category.queryValue) {
    query.type = category.queryValue
  }

  router.push({
    name: 'ProductListPage',
    query,
  })
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <section class="category">
    <div class="category__bg _ibg">
      <img src="@/assets/img/category-bg.png" />
    </div>
    <div class="category__inner _cnt">
      <div class="category__title _h2">
        {{ $t('Popular Categories') }}
      </div>

      <div class="category__body">
        <LoadingSpinner v-if="loadingCategories" class="category__loading" />

        <div v-else-if="visibleCategories.length" class="category__items">
          <button
            v-for="category in visibleCategories"
            :key="category.key"
            type="button"
            class="category__item"
            @click="goToCategory(category)"
          >
            <SvgIcon :icon="category.icon" class="category__item-icon" />

            <div class="category__item-label">
              {{ $t(category.label) }}
            </div>
          </button>
        </div>

        <div v-else class="category__empty _empty">
          {{ $t('No categories found') }}
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.category {
  @include adaptiveValue('padding-bottom', 230, 25);
  position: relative;
  overflow: hidden;
  &__bg {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 100%;
    height: 44%;
    transform: translate(-50%, 50%);
    @media (max-width: $md2) {
      height: 33%;
    }
    @media (max-width: $md3) {
      height: 22%;
    }
    @media (max-width: $md4) {
      height: 11%;
    }
  }
  &__inner {
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 18);
    }
  }

  &__body {
  }

  &__loading {
    display: flex;
    justify-content: center;
    margin: auto;
  }

  &__items {
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(5, 1fr);
    @include adaptiveValue('gap', 20, 4);
    @media (max-width: $md2) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    @include adaptiveValue('min-height', 122, 40);
    @include adaptiveValue('gap', 20, 10);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    color: var(--bg-primary-color);
    background-color: var(--primary-color);
    transition: all 0.3s ease 0s;

    @include adaptiveValue('border-radius', 20, 10);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-primary-color);
        color: var(--primary-color);
      }
    }

    &-icon {
      @include adaptiveValue('min-width', 30, 24);
      @include adaptiveValue('height', 30, 24);
    }

    &-label {
      @include adaptiveValue('font-size', 28, 20);
      line-height: 150%;
      color: inherit;
      font-weight: 700;
    }
  }

  &__empty {
  }
}
</style>
