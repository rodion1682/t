<template>
  <div class="detailed">
    <div class="detailed__inner _cnt">
      <LoadingSpinner v-if="loading" class="detailed__loading" />
      <div
        v-else-if="storeError || localError"
        class="detailed__error _text-error"
      >
        {{ storeError || localError }}
      </div>
      <template v-else-if="product">
        <div class="detailed__top top">
          <button class="top__back" @click="goBackToList">
            <SvgIcon class="top__back-icon" :icon="ChevronDownIcon" />
            <div class="top__back-text">{{ $t('Back') }}</div>
          </button>
          <div v-if="product.category === 'cs2'" class="top__game top__game_cs">
            <SvgIcon class="top__game-icon" :icon="CS" />
          </div>
          <div v-else class="top__game top__game_dota">
            <SvgIcon class="top__game-icon" :icon="DOTA" />
          </div>
          <div class="top__line _ibg">
          </div>
        </div>
        <div class="detailed__product product">
          <div class="product__title _h3">{{ product.title }}</div>
          <div
            class="product__content"
            :style="{ '--quality-color': qualityColor }"
          >
            <div class="product__image-wrapper">
              <div v-if="product.img_url" class="product__image _ibg-contain">
                <img :src="imgSrc" />
              </div>
            </div>
            <div class="product__info">
              <div class="product__list">
                <div class="product__item" v-if="product.type">
                  <div class="product__label">{{ $t('Type') }}</div>
                  <div class="product__value">{{ product.type }}</div>
                </div>
                <div class="product__item" v-if="product.quality">
                  <div class="product__label">{{ $t('Rarity') }}</div>
                  <div class="product__value">
                    {{ product.quality }}
                  </div>
                </div>
                <div class="product__item" v-if="product.exterior">
                  <div class="product__label">{{ $t('Exterior') }}</div>
                  <div class="product__value">{{ product.exterior }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="product__bottom">
            <div class="product__prices">
              <div class="product__row">
                <PriceFormatter
                  class="product__coin"
                  size="size-40"
                  :price="price"
                />
                <PriceFormatter
                  class="product__fiat"
                  :price="price"
                  isCurrency
                />
              </div>
              <div class="product__row" v-if="product.old_price">
                <PriceFormatter
                  isOld
                  class="product__coin"
                  size="size-40"
                  :price="getOldFiatPrice"
                />
                <PriceFormatter
                  isOld
                  class="product__fiat"
                  :price="oldPrice"
                  isCurrency
                />
              </div>
            </div>
            <BaseButton
              v-if="!isInCart"
              class="product__button"
              :disabled="isLoading"
              @click="toggleCart"
            >
              <template v-if="isLoading">...</template>
              <template v-else>
                {{ $t('Buy') }}
              </template>
            </BaseButton>

            <BaseButton
              v-else
              class="product__button"
              variant="trash"
              :disabled="isLoading"
              @click="toggleCart"
            >
              <template v-if="isLoading">...</template>
              <template v-else>
                <SvgIcon :icon="TrashIcon" class="product__button-icon" />
              </template>
            </BaseButton>
          </div>
        </div>
        <div v-if="similarProducts.length" class="detailed__similar similar">
          <div class="similar__title _h2 _title">
            {{ $t('You may also like') }}
          </div>

          <div class="similar__items">
            <div
              v-for="item in similarProducts"
              :key="item.id"
              class="similar__item"
            >
              <ProductCard :product="item" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'

import { ChevronDownIcon, CS, DOTA, TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useCurrencyStore } from '@/stores/currency'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const props = defineProps({
  productId: { type: [String, Number], required: true },
  initialProduct: { type: Object, default: null },
  game: { type: String, default: '' },
})

const qualityColorMap = {
  'Consumer Grade': '#B0C3D9',
  'Mil-Spec Grade': '#4B69FF',
  'Industrial Grade': '#5E98D9',
  Restricted: '#8847FF',
  'High Grade': '#4B69FF',
  Classified: '#D32CE6',
  Covert: '#EB4B4B',
  'Base Grade': '#B0C3D9',
  Remarkable: '#8847FF',
  Extraordinary: '#EB4B4B',
  Superior: '#D32CE6',
  Distinguished: '#4B69FF',
  Exotic: '#D32CE6',
  Exceptional: '#8847FF',
  Master: '#EB4B4B',
  Contraband: '#E4AE39',
}

const qualityColor = computed(() => {
  return qualityColorMap[product.value?.quality] || '#8E96AD'
})

const emit = defineEmits(['close', 'loaded'])

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const currencyStore = useCurrencyStore()

const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToast()

const loading = ref(false)
const localError = ref('')
const isLoading = ref(false)

const { currentCurrency } = storeToRefs(currencyStore)

const selectedCurrencyValue = computed(() => {
  return Number(currentCurrency.value?.value) || 1
})

const similarProducts = computed(() => {
  return Array.isArray(product.value?.similar)
    ? product.value.similar.slice(0, 5)
    : []
})

const product = computed(
  () => props.initialProduct || productStore.currentProduct,
)
const storeError = computed(() => productStore.error)

const imgSrc = computed(() => {
  if (product.value?.img_url_big) {
    return product.value?.img_url_big
      ? VITE_STATIC_DOMAIN + product.value.img_url_big
      : ''
  } else {
    return product.value?.img_url
      ? VITE_STATIC_DOMAIN + product.value.img_url
      : ''
  }
})

const price = computed(() => Number(product.value?.price ?? 0).toFixed(2))

const oldPrice = computed(() => {
  return parseFloat(product.value?.old_price * selectedCurrencyValue.value)
})

const getOldFiatPrice = computed(() => {
  return parseFloat(product.value?.old_price * currentCurrency?.value?.value)
})

const stripProductFromPath = path => path.replace(/\/p\/[^/]+$/, '')

const goBackToList = () => {
  emit('close')

  if (route.query.from) {
    router.push(route.query.from)
    return
  }

  router.replace({
    path: stripProductFromPath(route.path),
    query: {},
  })
}

const isInCart = computed(() =>
  product.value?.id ? cartStore.isItemInCart(product.value.id) : false,
)

async function load(id) {
  localError.value = ''
  loading.value = true
  try {
    if (
      props.initialProduct &&
      String(props.initialProduct.id) === String(id)
    ) {
      emit('loaded', props.initialProduct)
      return
    }

    await productStore.fetchProductDetails(id)

    if (productStore.currentProduct) {
      console.log('productStore.currentProduct', productStore.currentProduct)
      emit('loaded', productStore.currentProduct)
    }
  } catch (e) {
    localError.value = e?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.productId,
  id => {
    if (!id) return
    load(id)
  },
  { immediate: true },
)

async function toggleCart() {
  if (!product.value?.id) return

  if (isInCart.value) {
    try {
      isLoading.value = true
      const { success, error: errorMsg } = await cartStore.removeFromCart(
        product.value.id,
      )

      if (success) toast.success(t('Item removed from cart'))
      else toast.error(errorMsg || t('Failed to remove item'))
    } catch (err) {
      toast.error(err?.message || t('Failed to remove item'))
    } finally {
      isLoading.value = false
    }
    return
  }

  try {
    isLoading.value = true
    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(product.value.id)

    if (success) {
      toast.success(t('Item added to cart'))
    } else {
      if (isUnauthorized) {
        toast.warning(t('Please login to add items to cart'))
        router.push({
          name: 'LoginPage',
          query: { redirect: router.currentRoute.value.fullPath || '/' },
        })
      } else if (isAlreadyInCart) {
        toast.warning(message)
      } else {
        toast.error(message)
      }
    }
  } catch (err) {
    toast.error(err?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

async function buyNow() {
  if (!product.value?.id) return

  // if already in cart -> just go
  if (isInCart.value) {
    router.push({ name: 'CartPage' })
    return
  }

  // otherwise add then go
  try {
    isLoading.value = true
    const { success, isUnauthorized, message } = await cartStore.addToCart(
      product.value.id,
    )

    if (success) {
      router.push({ name: 'CartPage' })
      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to buy items'))
      router.push({
        name: 'LoginPage',
        query: { redirect: router.currentRoute.value.fullPath || '/' },
      })
    } else {
      toast.error(message || t('Failed to add item to cart'))
    }
  } catch (err) {
    toast.error(err?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (!route.path.includes(`/p/`)) {
    productStore.clearCurrentProduct()
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.detailed {
  @include adaptiveValue('padding-top', 89, 75);
  @include adaptiveValue('padding-bottom', 116, 25);
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 100%;
  &__inner {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1 1 100%;
    @media (max-width: $md6) {
      padding: 0px;
    }
  }

  &__loading {
  }

  &__error {
    @media (max-width: $md6) {
      padding: 0 10px;
    }
  }
  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 52, 15);
    }
  }
  &__product {
    width: 100%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 116, 35);
    }
  }
  &__similar {
    width: 100%;
  }
}

.top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  &__back {
    min-width: 73px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: var(--bg-secondary-color);
    transition: all 0.3s ease;
    color: var(--primary-color);
    padding: 4px 6px;
    cursor: pointer;
    gap: 8px;
    align-items: center;
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
        .top__back-text {
          color: var(--hint-primary-color);
        }
      }
    }
    &-icon {
      min-width: 10px;
      height: 9px;
      transform: rotate(-180deg);
    }
    &-text {
      color: var(--secondary-color);
      transition: color 0.3s ease 0s;
    }
  }
  &__game {
    min-width: 73px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: var(--bg-secondary-color);
    transition: all 0.3s ease;
    cursor: pointer;
    &_cs {
      :deep(svg path:nth-child(-n + 3)) {
        fill: #3b5fff;
      }

      :deep(svg path:nth-child(n + 4)) {
        fill: #ffffff;
      }
    }

    &_dota {
      :deep(svg path:first-child) {
        fill: #b9070a;
      }

      :deep(svg path:last-child) {
        fill: #ffffff;
      }
    }

    &-icon {
      width: 64px;
      height: 16px;

      :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
      }

      :deep(path) {
        transition: fill 0.3s ease;
      }
    }
  }

  &__line {
    margin-left: 6px;
    height: 8px;
    width: 100%;
  }
}

.product {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  @include bg-border-gradient;
  @include adaptiveValue('padding-top', 64, 15);
  @include adaptiveValue('padding-bottom', 38, 15);
  @include adaptiveValue('border-radius', 30, 8);
  @media (min-width: $md2) {
    @include adaptiveValue('padding-left', 64, 15, 1400, 992, 1);
    @include adaptiveValue('padding-right', 64, 15, 1400, 992, 1);
  }
  @media (max-width: $md2) {
    @include adaptiveValue('padding-left', 15, 10);
    @include adaptiveValue('padding-right', 15, 10);
  }
  &__title {
    font-weight: 400 !important;
    font-family: var(--font-oswald) !important;
    text-align: center;
    line-height: 150%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 51, 15);
    }
  }

  &__content {
    @media (min-width: $md6) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 48, 15);
    }
  }
  &__image-wrapper {
    max-width: 450px;
    width: 100%;
    padding-bottom: 24%;
    position: relative;
    @media (max-width: $md3) {
      padding-bottom: 34%;
    }
    @media (max-width: $md6) {
      padding-bottom: 66%;
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__image {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  &__info {
    max-width: 559px;
    width: 100%;
  }

  &__list {
  }

  &__item {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    @include adaptiveValue('padding-top', 12, 10);
    @include adaptiveValue('padding-bottom', 12, 10);
    &:not(:last-child) {
      border-bottom: 1px solid rgb(255, 255, 255, 0.15);
    }
  }
  &__label,
  &__value {
    color: var(--primary-color);
    text-transform: uppercase;
    height: fit-content;
  }
  &__label {
    text-align: right;
    font-size: 14px;
    line-height: 17px;
    font-family: var(--font-inter);
    font-weight: 700;
  }

  &__value {
    font-size: 18px;
    line-height: 27px;
    font-weight: 400;
    font-family: var(--font-oswald);
    text-align: right;
  }

  &__bottom {
    background-color: rgb(255, 255, 255, 0.15);
    @include adaptiveValue('border-radius', 10, 8);
    @include adaptiveValue('padding-top', 26, 15);
    @include adaptiveValue('padding-bottom', 26, 15);
    @include adaptiveValue('padding-left', 15, 10);
    @include adaptiveValue('padding-right', 15, 10);
    @media (min-width: $md5) {
      display: flex;
      align-items: center;
      justify-content: center;
      @include adaptiveValue('gap', 90, 20, 1400, 992, 1);
    }
    @media (max-width: $md6) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__prices {
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 20px;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__coin {
  }

  &__fiat {
    :deep(.price__currency),
    :deep(.price__value) {
      color: var(--secondary-color);
    }
  }

  &__button {
    min-width: 188px;
    min-height: 45px;
    @media (min-width: $md5) {
      width: fit-content;
    }
    &-icon {
      min-width: 19px;
      min-height: 19px;
    }
  }
}

.detailed {
  &__similar {
    width: 100%;
  }
}

.similar {
  &__title {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('row-gap', 16, 4);
    @include adaptiveValue('margin-left', -8, -2);
    @include adaptiveValue('margin-right', -8, -2);
  }

  &__item {
    flex: 0 1 20%;
    max-width: 20%;
    @include adaptiveValue('padding-left', 8, 2);
    @include adaptiveValue('padding-right', 8, 2);

    @media (max-width: $md2) {
      flex: 0 1 25%;
      max-width: 25%;
    }

    @media (max-width: $md3) {
      flex: 0 1 33.333%;
      max-width: 33.333%;
    }

    @media (max-width: $md4) {
      flex: 0 1 50%;
      max-width: 50%;
    }
  }
}
</style>
