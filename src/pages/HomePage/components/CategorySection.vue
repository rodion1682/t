<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  categoryCount: {
    type: Number,
    default: 0,
  },
})

const router = useRouter()
const { t } = useI18n()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const activeKey = ref('rifle')

const activeCategory = computed(() => {
  return (
    props.categories.find(category => category.key === activeKey.value) ||
    props.categories[0] ||
    null
  )
})

const activeItem = computed(() => {
  return activeCategory.value?.item || null
})

const formatNumber = value => {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

const formatPrice = value => {
  const price = Number(value || 0)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

const getImageUrl = item => {
  if (!item?.img_url) {
    return ''
  }

  if (/^https?:\/\//i.test(item.img_url)) {
    return item.img_url
  }

  return `${VITE_STATIC_DOMAIN}${item.img_url}`
}

const setActiveCategory = category => {
  if (!category?.key) {
    return
  }

  activeKey.value = category.key
}

const handleCategoryClick = category => {
  setActiveCategory(category)
}

const goToMarket = () => {
  router.push({
    name: 'ProductListPage',
    query: {
      category: 'cs2',
    },
  })
}

const goToCategory = category => {
  if (!category?.key) {
    return
  }

  router.push({
    name: 'ProductListPage',
    query: {
      category: 'cs2',
      type: category.key,
      page: 1,
    },
  })
}
</script>

<template>
  <section id="categories" class="category home-anchor">
    <div class="category__inner _cnt">
      <div class="category__head">
        <div class="category__label">
          {{ $t('Categories') }}
        </div>

        <div class="category__title _h2">
          {{ $t('Start where your inventory is thin') }}
        </div>

        <BaseButton
          variant="bordered"
          type="button"
          class="category__all"
          @click="goToMarket"
        >
          {{ $t('All') }}
          {{ categoryCount }}
          {{ $t('categories') }}
        </BaseButton>
      </div>

      <div v-if="categories.length" class="category__body">
        <div class="category__list">
          <button
            v-for="category in categories"
            :key="category.key"
            type="button"
            class="category__item"
            :class="{
              category__item_active: category.key === activeKey,
            }"
            @mouseenter="setActiveCategory(category)"
            @focus="setActiveCategory(category)"
            @click="handleCategoryClick(category)"
          >
            <div class="category__item-main">
              <span class="category__number">
                {{ category.number }}
              </span>

              <span class="category__name">
                {{ $t(category.label) }}
              </span>
            </div>

            <span class="category__count">
              {{ formatNumber(category.total) }}
              {{ $t('items') }}
            </span>
          </button>
        </div>

        <div
          v-if="activeCategory && activeItem"
          :key="activeCategory.key"
          class="category__preview"
        >
          <div class="category__preview-product">
            <div class="category__preview-image">
              <img
                class="category__preview-shadow"
                :src="getImageUrl(activeItem)"
                alt=""
                aria-hidden="true"
              />

              <img
                class="category__preview-img"
                :src="getImageUrl(activeItem)"
                :alt="activeItem.title"
              />
            </div>
          </div>

          <div class="category__preview-footer">
            <div class="category__preview-info">
              <div class="category__preview-name">
                {{ $t(activeCategory.label) }}
              </div>

              <div class="category__preview-price">
                {{ $t('from') }}
                <PriceFormatter :price="activeItem.price" is-currency />
              </div>
            </div>

            <BaseButton
              class="category__browse"
              @click="goToCategory(activeCategory)"
            >
              {{ $t('Browse') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.category {
  position: relative;

  @include adaptiveValue('padding-top', 60, 25);
  @include adaptiveValue('padding-bottom', 83, 25);

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__head {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 18);
    }
  }

  &__label {
    @include ibm-12-700;
    text-transform: uppercase;
    letter-spacing: 0.96px;
    color: var(--hemlock);
    &:not(:last-child) {
      margin-bottom: 9px;
    }
  }

  &__title {
  }

  &__all {
    width: fit-content;
    @include sg-14-700;
  }

  &__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(636px, 616px);

    @include adaptiveValue('gap', 44, 10);

    align-items: stretch;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__item {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    @include adaptiveValue('min-height', 96, 60);

    @include adaptiveValue('padding-top', 28, 10);
    @include adaptiveValue('padding-bottom', 28, 10);
    @include adaptiveValue('padding-left', 12, 10);
    @include adaptiveValue('padding-right', 12, 10);

    border-radius: 999px;

    text-align: left;

    background-color: transparent;
    color: var(--cod-gray);

    transition:
      background-color 0.3s ease,
      padding 0.3s ease;

    &_active {
      background-color: var(--chrome-white);

      .category__number {
        background-color: transparent;
      }
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--chrome-white);

        .category__number {
          background-color: transparent;
        }
      }
    }
    @media (max-width: $md3) {
      border-radius: 20px;
    }
  }

  &__item-main {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 18, 12);
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 auto;

    @include adaptiveValue('width', 40, 30);
    @include adaptiveValue('height', 40, 30);

    border-radius: 50%;

    background-color: var(--chrome-white);

    @include ibm-12-700;

    color: var(--kelp);

    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  &__name {
    @include sg-26-700;
    font-weight: 400;
    text-transform: capitalize;
  }

  &__count {
    flex: 0 0 auto;

    padding: 5px 12px;

    border-radius: 999px;

    background-color: var(--feta);

    @include ibm-13-700;

    color: var(--kelp);

    transition: opacity 0.3s ease;
  }

  &__preview {
    position: relative;

    display: flex;
    flex-direction: column;

    min-width: 0;

    overflow: hidden;

    @include adaptiveValue('border-radius', 28, 20);

    background: #d9a46f;

    animation: category-preview 0.3s ease;
  }

  &__preview-product {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    flex: 1 1 auto;

    @include adaptiveValue('min-height', 350, 250);

    @include adaptiveValue('padding', 45, 15);
  }

  &__preview-image {
    position: relative;

    width: 90%;
    max-width: 520px;

    aspect-ratio: 1.7;
  }

  &__preview-img {
    position: absolute;
    z-index: 2;

    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  &__preview-shadow {
    position: absolute;
    z-index: 1;

    left: 8%;
    bottom: -12%;

    width: 84%;
    height: 48%;

    object-fit: contain;

    transform: perspective(220px) rotateX(72deg) scaleY(0.32);

    transform-origin: bottom center;

    filter: brightness(0) blur(12px);

    opacity: 0.2;

    pointer-events: none;
  }

  &__preview-footer {
    position: relative;
    z-index: 3;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 15px;

    margin: 0 16px 16px;
    padding: 14px 22px;

    border-radius: 999px;

    background: var(--merino);
    @media (max-width: $md3) {
      border-radius: 20px;
    }
  }

  &__preview-info {
    min-width: 0;
  }

  &__preview-name {
    @include sg-20-700;
    font-weight: 400;
    color: var(--cod-gray);
  }

  &__preview-price {
    margin-top: -2px;
    display: flex;
    align-items: center;
    gap: 4px;
    @include ibm-13-700;
    font-weight: 400;

    color: var(--makara);
  }

  &__browse {
    max-width: 83px;
  }
}

@keyframes category-preview {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: $md2) {
  .category {
    &__body {
      grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.1fr);
    }
  }
}

@media (max-width: $md3) {
  .category {
    &__body {
      grid-template-columns: 1fr;
    }

    &__preview {
      min-height: 400px;
    }
  }
}

@media (max-width: $md5) {
  .category {
    &__item {
      gap: 10px;
    }

    &__count {
      padding: 6px 9px;
      font-size: 10px;
    }

    &__preview {
      min-height: 340px;
    }

    &__preview-image {
      width: 100%;
    }

    &__preview-footer {
      margin: 0 8px 8px;
      padding-left: 13px;
    }
  }
}
</style>
