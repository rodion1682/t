<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useGame } from '@/composables/useGame'
import { useI18n } from 'vue-i18n'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  heroItems: {
    type: Array,
    default: () => [],
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  categoryCount: {
    type: Number,
    default: 0,
  },
})

const router = useRouter()
const { t } = useI18n()
const { marketRoute } = useGame()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const search = ref('')

const popularItems = [
  {
    label: t('AWP'),
    query: {
      search: 'awp',
    },
  },
  {
    label: t('Karambit'),
    query: {
      search: 'karambit',
    },
  },
  {
    label: t('Fade'),
    query: {
      search: 'fade',
    },
  },
  {
    label: t('Under €50'),
    query: {
      price_till: 50,
    },
  },
]

const formatNumber = value => {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
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

const submitSearch = () => {
  const value = search.value.trim()

  if (!value) {
    return
  }

  router.push({
    ...marketRoute.value,
    query: {
      category: 'cs2',
      search: value,
    },
  })
}

const openPopular = item => {
  router.push({
    ...marketRoute.value,
    query: {
      category: 'cs2',
      ...item.query,
    },
  })
}

const openProduct = item => {
  if (!item?.id) {
    return
  }

  router.push({
    name: 'ProductDetailsPage',
    params: {
      productId: item.id,
    },
  })
}
</script>

<template>
  <section class="hero">
    <div class="hero__bg-top"></div>
    <div class="hero__bg-right"></div>
    <div class="hero__inner _cnt">
      <div class="hero__top top">
        <div class="top__label">
          {{ $t('Counter-Strike 2 skin market') }}
        </div>

        <div class="top__title _h1">
          <div>{{ $t('Trade CS2 skins in') }}</div>
          <div>{{ $t('the open') }}</div>
        </div>

        <div class="top__text">
          {{
            $t(
              'Live prices and the full history of every item. Float, pattern and the last five sales sit on the card — before you buy, not after.',
            )
          }}
        </div>
      </div>

      <div class="hero__body body">
        <BaseInput
          v-model="search"
          class="body__search"
          :placeholder="$t('Search AK-47, Karambit, Fade...')"
          @enter="submitSearch"
        >
          <template #prefix>
            <SvgIcon :icon="SearchIcon" class="body__search-icon" />
          </template>

          <template #suffix>
            <BaseButton class="body__search-button" @click="submitSearch">
              {{ $t('Search') }}
            </BaseButton>
          </template>
        </BaseInput>

        <div class="body__categories">
          <div class="body__label">
            {{ $t('Popular:') }}
          </div>

          <div class="body__items">
            <button
              v-for="item in popularItems"
              :key="item.label"
              type="button"
              class="body__item"
              @click="openPopular(item)"
            >
              {{ $t(item.label) }}
            </button>
          </div>
        </div>

        <div class="body__products">
          <button
            v-for="(item, index) in heroItems"
            :key="item.id"
            type="button"
            class="body__product"
            :class="[
              `body__product_${item.heroType}`,
              {
                body__product_main: index === 1,
              },
            ]"
            @click="openProduct(item)"
          >
            <div class="body__product-image">
              <img
                class="body__product-shadow"
                :src="getImageUrl(item)"
                alt=""
                aria-hidden="true"
              />

              <img
                class="body__product-img"
                :src="getImageUrl(item)"
                :alt="item.title"
              />
            </div>
          </button>
        </div>

        <div class="body__stats">
          <div class="body__stat">
            <strong>
              {{ formatNumber(totalItems) }}
            </strong>

            <span>{{ $t('items live') }}</span>
          </div>

          <div class="body__stat">
            <strong>
              {{ categoryCount }}
            </strong>

            <span>{{ $t('categories') }}</span>
          </div>

          <div class="body__stat">
            <strong>100%</strong>

            <span>{{ $t('checked by hand') }}</span>
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

.hero {
  @include header-indent;
  position: relative;
  max-width: 1440px;
  overflow: hidden;
  margin: 0 auto;
  @include adaptiveValue('padding-bottom', 60, 25);
  @include adaptiveValue('padding-top', 60, 25);
  &__bg-top {
    position: absolute;
    top: -260px;
    left: 50%;
    width: 1100px;
    height: 640px;
    margin-left: -550px;
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      var(--chrome-white),
      transparent 72%
    );
    opacity: 0.75;
    pointer-events: none;
  }
  &__bg-right {
    position: absolute;
    top: 340px;
    right: -200px;
    width: 560px;
    height: 560px;
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      var(--other-color-1),
      transparent 70%
    );
    opacity: 0.8;
    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__body {
  }
}

.top {
  text-align: center;
  &__label {
    position: relative;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    padding-left: 17px;
    @include ibm-12-700;
    &:not(:last-child) {
      margin-bottom: 17px;
    }
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translate(0px, -50%);
      left: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--limed-ash);
    }
  }

  &__title {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__text {
    max-width: 550px;
    margin: 0 auto;
  }
}

.body {
  &__search {
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
    &:not(:last-child) {
      margin-bottom: 16px;
    }
    :deep(.base-input) {
      @include adaptiveValue('min-height', 58, 50);
    }
    :deep(.base-input__suffix) {
      @include adaptiveValue('right', 11, 3);
    }
    :deep(.base-input__control) {
      padding-right: 110px;
    }
    :deep(.base-input__placeholder) {
      max-width: calc(100% - 150px);
    }
    &-icon {
      color: var(--zorba);
      min-width: 16px;
      height: 16px;
    }

    &-button {
      max-width: 100px;
      width: 100%;
    }
  }

  &__categories {
    display: flex;
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__label {
    @include ibm-13-700;
    font-weight: 400;
    color: var(--makara);
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    padding: 0px 6px;
    width: fit-content;
    background-color: transparent;
    @include ibm-13-700;
    font-weight: 600;
    color: var(--cod-gray);
    transition: color 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        color: var(--rope);
      }
    }
  }

  &__products {
    display: flex;
    justify-content: center;
    align-items: center;

    @include adaptiveValue('gap', 32, 10);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__product {
    position: relative;

    max-width: 250px;
    width: 100%;
    aspect-ratio: 1;

    overflow: hidden;

    background: #d8b978;

    @include adaptiveValue('border-radius', 28, 20);
    @include adaptiveValue('padding-top', 40, 15);
    @include adaptiveValue('padding-left', 30, 15);
    @include adaptiveValue('padding-right', 30, 15);
    @include adaptiveValue('padding-bottom', 40, 15);
    transition: opacity 0.3s ease 0s;
    @media (any-hover: hover) {
      opacity: 0.65;
      &:hover {
        opacity: 1;
      }
    }

    &_main {
      max-width: 360px;
      opacity: 1;
      background: #e8b978;
      @media (any-hover: hover) {
        &:hover {
          opacity: 0.65;
        }
      }

      .body__product-image {
        max-width: 234px;
      }

      .body__product-shadow {
        bottom: 7%;
      }
    }

    &-image {
      position: relative;

      width: 100%;
      max-width: 188px;
      aspect-ratio: 1;

      margin: 0 auto;
    }

    &-img {
      position: absolute;
      z-index: 2;

      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }

    &-shadow {
      position: absolute;
      z-index: 1;

      left: 10%;
      bottom: 4%;

      width: 80%;
      height: 35%;

      object-fit: contain;

      transform: scaleY(0.18);
      transform-origin: bottom center;

      filter: brightness(0) blur(10px);

      opacity: 0.35;

      pointer-events: none;
    }
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    @include adaptiveValue('gap', 12, 10);
  }

  &__stat {
    border-radius: 999px;
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--double-spanish-white);
    @include adaptiveValue('padding-top', 10.5, 8);
    @include adaptiveValue('padding-bottom', 10.5, 8);
    @include adaptiveValue('padding-left', 22, 10);
    @include adaptiveValue('padding-right', 22, 10);
    @media (max-width: $md3) {
      border-radius: 20px;
    }

    strong {
      @include sg-20-700;
      color: var(--kelp);
    }
    span {
      @include ibm-13-700;
      font-weight: 400;
      color: var(--soya-bean);
    }
  }
}
</style>
