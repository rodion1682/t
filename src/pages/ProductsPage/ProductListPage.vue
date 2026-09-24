<template>
  <main class="products">
    <div class="products__inner _cnt">
      <div class="products__breadcrumb">
        <RouterLink
          :to="{ name: 'HomePage' }"
          class="products__breadcrumb-link"
        >
          {{ $t('Home') }}
        </RouterLink>

        <span>/</span>

        <span>
          {{ $t('Buy skins') }}
        </span>
      </div>

      <div class="products__head">
        <h1 class="products__title">
          {{ $t('Buy CS2 skins') }}
        </h1>

        <div class="products__search">
          <SvgIcon :icon="SearchIcon" class="products__search-icon" />

          <input
            v-model="searchValue"
            type="search"
            autocomplete="off"
            class="products__search-input"
            :placeholder="$t('Search')"
          />
        </div>
      </div>

      <div v-if="categoryOptions.length" class="products__categories">
        <button
          v-for="category in categoryOptions"
          :key="category.value"
          type="button"
          class="products__category"
          :class="{ products__category_active: isCategoryActive(category) }"
          @click="selectCategory(category)"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="products__mobile-actions">
        <BaseButton
          type="button"
          variant="white-bordered"
          class="products__filter-toggle"
          @click="isAsideFiltersOpen = !isAsideFiltersOpen"
        >
          {{ $t('Filters') }}
        </BaseButton>

        <div class="products__sort products__sort_mobile">
          <button
            type="button"
            class="products__sort-button"
            @click="sortOpen = !sortOpen"
          >
            <span>
              {{ sortLabel }}
            </span>

            <span class="products__sort-arrow"> ▾ </span>
          </button>

          <div v-if="sortOpen" class="products__sort-menu">
            <button
              v-for="option in SORT_OPTIONS"
              :key="option.value"
              type="button"
              class="products__sort-option"
              @click="selectSort(option.value)"
            >
              <span
                class="products__sort-check"
                :class="{
                  'products__sort-check_active': filters.sort === option.value,
                }"
              >
                ✓
              </span>

              {{ $t(option.label) }}
            </button>
          </div>
        </div>
      </div>

      <div class="products__layout">
        <AsideFilters
          class="products__aside"
          :class="{
            products__aside_open: isAsideFiltersOpen,
          }"
          :filters="filters"
          :available-filters="availableFilters"
          :current-game="currentGame"
          :update-filters="updateFilters"
          :reset-filters="resetFilters"
          @close="isAsideFiltersOpen = false"
        />

        <div class="products__main">
          <div class="products__toolbar">
            <div v-if="activeTags.length" class="products__tags">
              <button
                v-for="tag in activeTags"
                :key="tag.key"
                type="button"
                class="products__tag"
                @click="tag.remove"
              >
                <span>
                  {{ tag.label }}
                </span>

                <span class="products__tag-remove"> × </span>
              </button>
            </div>

            <div class="products__sort">
              <button
                type="button"
                class="products__sort-button"
                @click="sortOpen = !sortOpen"
              >
                <span>
                  {{ sortLabel }}
                </span>

                <span class="products__sort-arrow"> ▾ </span>
              </button>

              <div v-if="sortOpen" class="products__sort-menu">
                <button
                  v-for="option in SORT_OPTIONS"
                  :key="option.value"
                  type="button"
                  class="products__sort-option"
                  @click="selectSort(option.value)"
                >
                  <span
                    class="products__sort-check"
                    :class="{
                      'products__sort-check_active':
                        filters.sort === option.value,
                    }"
                  >
                    ✓
                  </span>

                  {{ $t(option.label) }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="error" class="products__state">
            <div class="_text-error">
              {{ error }}
            </div>

            <BaseButton
              class="products__state-button"
              @click="fetchProductsImmediate"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <LoadingSpinner
            v-else-if="!ready || loading"
            class="products__loading"
          />

          <div v-else-if="products.length" class="products__grid">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              class="products__card"
            />
          </div>

          <div v-else class="products__state">
            <div class="products__empty-title">
              {{ $t('No items match these filters') }}
            </div>

            <BaseButton class="products__state-button" @click="resetFilters">
              {{ $t('Reset all filters') }}
            </BaseButton>
          </div>

          <PaginationComponent
            v-if="!loading && products.length && totalPages > 1"
            class="products__pagination"
            :total-pages="totalPages"
            :current-page="Number(filters.page)"
            @update:current-page="onPageChange"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductCard from '@/components/ProductCard.vue'

import AsideFilters from '@/pages/ProductsPage/components/AsideFilters.vue'

import { useProductList } from '@/composables/useProductList'

const {
  SORT_OPTIONS,
  products,
  loading,
  error,
  ready,
  filters,
  availableFilters,
  currentGame,
  pagination,
  updateFilters,
  resetFilters,
  fetchProductsImmediate,
} = useProductList()

const isAsideFiltersOpen = ref(false)
const sortOpen = ref(false)
const searchValue = ref(filters.search || '')

let searchTimer = null

const totalPages = computed(() => {
  return Math.ceil(pagination.total / filters.perPage)
})

const sortLabel = computed(() => {
  return (
    SORT_OPTIONS.find(option => option.value === filters.sort)?.label ||
    'Lowest first'
  )
})

const categoryOptions = computed(() => {
  const source = availableFilters.types || []

  return source.map(option => ({
    value: option.value,
    label: option.label,
  }))
})

const isCategoryActive = category => {
  return Array.isArray(filters.type) && filters.type.includes(category.value)
}

const selectCategory = async category => {
  const active = isCategoryActive(category)

  await updateFilters({
    type: active ? [] : [category.value],

    subcategories: [],

    page: 1,
  })
}

const selectSort = async value => {
  sortOpen.value = false

  await updateFilters({
    sort: value,
    page: 1,
  })
}

const activeTags = computed(() => {
  const tags = []

  if (filters.priceRange?.min != null) {
    tags.push({
      key: 'price-min',

      label: `From ${filters.priceRange.min}`,

      remove: () => {
        updateFilters({
          priceRange: {
            ...filters.priceRange,
            min: null,
          },

          page: 1,
        })
      },
    })
  }

  if (filters.priceRange?.max != null) {
    tags.push({
      key: 'price-max',

      label: `To ${filters.priceRange.max}`,

      remove: () => {
        updateFilters({
          priceRange: {
            ...filters.priceRange,
            max: null,
          },

          page: 1,
        })
      },
    })
  }

  ;(filters.exterior_name || []).forEach(value => {
    tags.push({
      key: `exterior-${value}`,

      label: value,

      remove: () => {
        updateFilters({
          exterior_name: filters.exterior_name.filter(item => item !== value),

          page: 1,
        })
      },
    })
  })

  ;(filters.quality || []).forEach(value => {
    tags.push({
      key: `quality-${value}`,

      label: value,

      remove: () => {
        updateFilters({
          quality: filters.quality.filter(item => item !== value),

          page: 1,
        })
      },
    })
  })

  return tags
})

const onPageChange = async page => {
  await updateFilters({
    page,
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

watch(
  () => filters.search,
  value => {
    if (searchValue.value !== (value || '')) {
      searchValue.value = value || ''
    }
  },
)

watch(searchValue, value => {
  window.clearTimeout(searchTimer)

  searchTimer = window.setTimeout(() => {
    updateFilters({
      search: value.trim(),
      page: 1,
    })
  }, 400)
})

const closeSort = event => {
  if (event.target.closest('.products__sort')) {
    return
  }

  sortOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeSort)
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)

  document.removeEventListener('click', closeSort)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.products {
  position: relative;

  @include adaptiveValue('padding-top', 34, 20);

  @include adaptiveValue('padding-bottom', 110, 50);

  &__inner {
    position: relative;
  }

  &__breadcrumb {
    display: flex;
    align-items: center;

    gap: 8px;

    @include ibm-12-700;

    color: var(--soya-bean);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__breadcrumb-link {
    color: var(--soya-bean);

    transition: color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px 32px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__title {
    flex: 0 0 auto;

    margin: 0;

    @include sg-42-700;

    color: var(--cod-gray);
  }

  &__search {
    display: flex;
    align-items: center;

    flex: 0 1 460px;

    min-width: 0;

    gap: 12px;

    padding: 6px 20px;

    border-radius: 999px;

    background: var(--merino);

    box-shadow: 0 8px 24px var(--cod-gray-07);
  }

  &__search-icon {
    flex: 0 0 auto;

    width: 18px;
    height: 18px;

    color: var(--zorba);
  }

  &__search-input {
    width: 100%;
    height: 52px;

    padding: 0;

    border: 0;
    outline: 0;

    background: transparent;

    @include ibm-14-400;

    color: var(--cod-gray);

    &::placeholder {
      color: var(--zorba);
    }
  }

  &__categories {
    display: flex;
    flex-wrap: wrap;

    gap: 8px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__category {
    min-height: 34px;

    padding: 7px 16px;

    border: 1px solid var(--cod-gray-16);

    border-radius: 999px;

    background: var(--merino);

    @include ibm-12-700;

    color: var(--cod-gray);

    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;

    &_active {
      border-color: var(--kelp);

      background: var(--kelp);

      color: var(--janna);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--copper);
      }
    }
  }

  &__layout {
    display: grid;

    grid-template-columns: 244px minmax(0, 1fr);

    align-items: start;

    @include adaptiveValue('gap', 40, 20);
  }

  &__aside {
    position: sticky;

    top: 90px;
  }

  &__main {
    min-width: 0;
  }

  &__toolbar {
    display: flex;
    align-items: center;

    min-height: 42px;

    gap: 12px;

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;

    gap: 8px;

    margin-right: auto;
  }

  &__tag {
    display: inline-flex;
    align-items: center;

    gap: 8px;

    min-height: 34px;

    padding: 0 8px 0 14px;

    border: 2px solid var(--cod-gray-07);

    border-radius: 999px;

    background: var(--merino);

    @include ibm-12-700;

    color: var(--cod-gray);
  }

  &__tag-remove {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 18px;
    height: 18px;

    border-radius: 50%;

    background: var(--double-spanish-white);

    color: var(--hairy-heath);
  }

  &__sort {
    position: relative;

    flex: 0 0 auto;

    margin-left: auto;

    &_mobile {
      display: none;
    }
  }

  &__sort-button {
    display: flex;
    align-items: center;

    gap: 10px;

    min-height: 42px;

    padding: 0 18px;

    border: 1px solid var(--cod-gray-16);

    border-radius: 999px;

    background: var(--merino);

    @include ibm-12-700;

    color: var(--cod-gray);

    white-space: nowrap;
  }

  &__sort-arrow {
    color: var(--kelp);
  }

  &__sort-menu {
    position: absolute;
    z-index: 20;

    top: calc(100% + 8px);
    right: 0;

    min-width: 100%;

    padding: 6px;

    border: 1px solid var(--cod-gray-07);

    border-radius: 16px;

    background: var(--merino);

    box-shadow: 0 12px 30px var(--cod-gray-16);
  }

  &__sort-option {
    display: flex;
    align-items: center;

    width: 100%;

    gap: 8px;

    padding: 9px 12px;

    border: 0;
    border-radius: 999px;

    background: transparent;

    @include ibm-12-700;

    color: var(--cod-gray);

    white-space: nowrap;

    @media (any-hover: hover) {
      &:hover {
        background: var(--feta);
      }
    }
  }

  &__sort-check {
    width: 12px;

    opacity: 0;

    color: var(--kelp);

    &_active {
      opacity: 1;
    }
  }

  &__grid {
    display: grid;

    grid-template-columns: repeat(5, minmax(0, 1fr));

    gap: 16px;
  }

  &__card {
    min-width: 0;
  }

  &__loading {
    margin: 120px auto;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    min-height: 300px;

    padding: 40px 20px;

    border-radius: 24px;

    background: var(--merino);

    text-align: center;
  }

  &__empty-title {
    @include sg-26-700;

    color: var(--cod-gray);
  }

  &__state-button {
    width: fit-content;

    margin-top: 20px;
  }

  &__pagination {
    margin-top: 36px;
  }

  &__mobile-actions {
    display: none;
  }
}

@media (max-width: $md1) {
  .products {
    &__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}

@media (max-width: $md2) {
  .products {
    &__layout {
      grid-template-columns: 220px minmax(0, 1fr);
    }

    &__grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}

@media (max-width: $md3) {
  .products {
    &__head {
      align-items: stretch;
      flex-direction: column;
    }

    &__title {
      flex: none;
    }

    &__search {
      flex: none;

      width: 100%;
      max-width: none;
    }

    &__categories {
      flex-wrap: nowrap;

      width: calc(100% + 30px);

      margin-left: -15px;
      padding: 0 15px;

      overflow-x: auto;

      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__category {
      flex: 0 0 auto;
    }

    &__layout {
      display: block;
    }

    &__aside {
      position: fixed;
      z-index: 50;

      inset: 0 auto 0 0;

      width: min(340px, calc(100vw - 40px));

      overflow-y: auto;

      transform: translateX(-105%);

      transition: transform 0.3s ease;

      &_open {
        transform: translateX(0);
      }
    }

    &__toolbar {
      display: none;
    }

    &__mobile-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 12px;

      margin-bottom: 18px;
    }

    &__filter-toggle {
      width: fit-content;
    }

    &__sort_mobile {
      display: block;
    }

    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 10px;
    }
  }
}

@media (max-width: $md5) {
  .products {
    &__title {
      @include sg-36-700;
    }

    &__search {
      padding-left: 16px;
      padding-right: 16px;
    }

    &__search-input {
      height: 46px;
    }

    &__grid {
      gap: 8px;
    }
  }
}
</style>
