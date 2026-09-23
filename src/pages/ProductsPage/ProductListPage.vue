<template>
  <div class="products">
    <div class="products__inner _cnt">
      <div class="products__title _h2">
        {{ $t('Market') }}
      </div>
      <div class="products__body body">
        <div v-if="error" class="body__empty">
          <div class="body__empty-error _text-error">
            {{ error }}
          </div>

          <BaseButton
            class="body__empty-button"
            @click="fetchProductsImmediate"
          >
            {{ $t('Try again') }}
          </BaseButton>
        </div>

        <div v-else class="body__content" :class="{ open: isAsideFiltersOpen }">
          <AsideFilters
            class="body__aside"
            :class="{ open: isAsideFiltersOpen }"
            :filters="filters"
            :available-filters="availableFilters"
            :current-game="currentGame"
            :sort-options="SORT_OPTIONS"
            :update-filters="updateFilters"
            :reset-filters="resetFilters"
          />

          <div class="body__main">
            <TopFilters
              v-if="false"
              v-model:filters-open="isAsideFiltersOpen"
              class="products__top-filters"
              :filters="filters"
              :available-filters="availableFilters"
              :current-game="currentGame"
              :sort-options="SORT_OPTIONS"
              :update-filters="updateFilters"
              :reset-filters="resetFilters"
              :set-category="setCategory"
            />

            <LoadingSpinner v-if="!ready || loading" class="body__loading" />

            <div v-else-if="products.length" class="body__items">
              <div
                v-for="product in products"
                :key="product.id"
                class="body__item"
                :class="{ open: isAsideFiltersOpen }"
              >
                <ProductCard :product="product" />
              </div>
            </div>

            <div v-else class="body__empty">
              <div class="body__empty-text _l">
                {{ $t('No products found') }}
              </div>

              <BaseButton
                variant="bordered"
                class="body__empty-button"
                @click="resetFilters"
              >
                {{ $t('Reset filters') }}
              </BaseButton>
            </div>

            <div v-if="!loading && products.length" class="body__bottom">
              <PaginationComponent
                v-if="pagination.total > filters.perPage"
                class="body__pagination"
                :total-pages="totalPages"
                :current-page="Number(filters.page)"
                @update:current-page="onPageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductCard from '@/components/ProductCard.vue'
import AsideFilters from '@/pages/ProductsPage/components/AsideFilters.vue'
import TopFilters from '@/pages/ProductsPage/components/TopFilters.vue'

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
  setCategory,
  fetchProductsImmediate,
} = useProductList()

const isAsideFiltersOpen = ref(false)

const totalPages = computed(() => {
  return Math.ceil(pagination.total / filters.perPage)
})

const onPageChange = async page => {
  await updateFilters({ page })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.products {
  @include adaptiveValue('padding-top', 20, 25);
  @include adaptiveValue('margin-bottom', 130, 25);
  position: relative;
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }
  &__inner {
    position: relative;

    width: 100%;
    flex: 1 1 100%;

    display: flex;
    flex-direction: column;
  }

  &__top-filters {
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }
}

.body {
  &__main {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
  }

  &__content {
    @media (min-width: $md3) {
      display: flex;
      align-items: flex-start;

      @include adaptiveValue('gap', 20, 10);
    }
  }

  &__aside {
    @media (min-width: $md3) {
      @include adaptiveValue('max-width', 363, 160);
      @include adaptiveValue('min-width', 363, 160);
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }
  &__items {
    flex: 1 1 auto;
    min-width: 0;

    display: flex;
    flex-wrap: wrap;

    @include adaptiveValue('row-gap', 20, 4);
    @include adaptiveValue('margin-left', -10, -2);
    @include adaptiveValue('margin-right', -10, -2);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
    @media (max-width: $md6) {
      margin-left: -12px;
      margin-right: -12px;
    }
  }

  &__item {
    flex: 0 1 20%;
    max-width: 20%;
    @include adaptiveValue('padding-left', 10, 2);
    @include adaptiveValue('padding-right', 10, 2);
    @media (max-width: 1399.98px) {
      flex: 0 1 25%;
      max-width: 25%;
    }
    @media (max-width: 1199.98px) {
      flex: 0 1 33.333%;
      max-width: 33.333%;
    }
    @media (max-width: $md4) {
      flex: 0 1 50%;
      max-width: 50%;
    }
  }

  &__loading,
  &__empty {
    margin-top: 15vh;
    margin-bottom: 15vh;
    margin-left: auto;
    margin-right: auto;
  }

  &__empty {
    width: 100%;

    &-error,
    &-text {
      margin-bottom: 10px;
      text-align: center;
    }

    &-button {
      max-width: 209px;
      margin: 0 auto;
    }
  }

  &__bottom {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
