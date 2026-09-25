<template>
  <main class="details">
    <div class="details__inner _cnt">
      <LoadingSpinner v-if="loading" class="details__loading" />

      <div v-else-if="storeError || localError" class="details__state">
        <div class="details__state-title">
          {{ $t('Unable to load item') }}
        </div>

        <div class="_text-error">
          {{ storeError || localError }}
        </div>

        <BaseButton class="details__state-button" @click="load(productId)">
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <template v-else-if="product">
        <!-- Breadcrumb -->
        <nav class="details__breadcrumb" :aria-label="$t('Breadcrumb')">
          <RouterLink
            :to="{ name: 'HomePage' }"
            class="details__breadcrumb-link"
          >
            {{ $t('Home') }}
          </RouterLink>

          <span>/</span>

          <RouterLink
            :to="{ name: 'ProductListPage' }"
            class="details__breadcrumb-link"
          >
            {{ $t('Buy skins') }}
          </RouterLink>

          <span>/</span>

          <span class="details__breadcrumb-current">
            {{ productTitle }}
          </span>
        </nav>

        <section class="details__product product">
          <!-- Image -->
          <div class="product__visual">
            <div v-if="productImage" class="product__image">
              <img :src="productImage" :alt="productTitle" />
            </div>

            <div
              v-if="product.quality"
              class="product__rarity"
              :style="{ '--rarity-color': qualityColor }"
            >
              <span class="product__rarity-dot"></span>

              {{ product.quality }}
            </div>
          </div>

          <!-- Information -->
          <div class="product__info">
            <div class="product__heading">
              <div v-if="product.type" class="product__eyebrow">
                {{ product.type }}
              </div>

              <h1 class="product__title">
                {{ productTitle }}
              </h1>

              <div v-if="productExterior" class="product__exterior">
                {{ productExterior }}
              </div>
            </div>

            <!-- Details -->
            <div v-if="productMeta.length" class="product__meta">
              <div
                v-for="item in productMeta"
                :key="item.label"
                class="product__meta-row"
              >
                <span class="product__meta-label">
                  {{ $t(item.label) }}
                </span>

                <span class="product__meta-value">
                  {{ item.value }}
                </span>
              </div>
            </div>

            <!-- Purchase -->
            <div class="product__purchase">
              <div class="product__price-block">
                <div class="product__price-label">
                  {{ $t('Price') }}
                </div>

                <div class="product__prices">
                  <PriceFormatter
                    v-if="price"
                    :price="price"
                    reverse
                    size="sg-26"
                    skip-conversion
                    is-currency
                    class="product__price"
                  />

                  <PriceFormatter
                    v-if="oldPrice"
                    :price="oldPrice"
                    reverse
                    is-old
                    skip-conversion
                    is-currency
                    class="product__old-price"
                  />
                </div>
              </div>

              <div class="product__actions">
                <BaseButton
                  class="product__buy"
                  :disabled="isLoading"
                  @click="buyNow"
                >
                  <template v-if="isLoading"> ... </template>

                  <template v-else>
                    {{ $t('Buy now') }}
                  </template>
                </BaseButton>

                <button
                  type="button"
                  class="product__cart"
                  :class="{
                    product__cart_remove: isInCart,
                  }"
                  :disabled="isLoading"
                  @click="toggleCart"
                >
                  <template v-if="isLoading"> ... </template>

                  <template v-else-if="isInCart">
                    <SvgIcon :icon="TrashIcon" class="product__cart-icon" />

                    <span>
                      {{ $t('Remove from cart') }}
                    </span>
                  </template>

                  <template v-else>
                    <span class="product__cart-plus"> + </span>

                    <span>
                      {{ $t('Add to cart') }}
                    </span>
                  </template>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Similar products -->
        <section v-if="similarProducts.length" class="details__similar similar">
          <div class="similar__head">
            <div>
              <div class="similar__eyebrow">
                {{ $t('More skins') }}
              </div>

              <h2 class="similar__title">
                {{ $t('You may also like') }}
              </h2>
            </div>

            <RouterLink
              :to="{ name: 'ProductListPage' }"
              class="similar__browse"
            >
              {{ $t('Browse all') }}

              <span> → </span>
            </RouterLink>
          </div>

          <div class="similar__grid">
            <ProductCard
              v-for="item in similarProducts"
              :key="item.id"
              :product="item"
              class="similar__card"
            />
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import ProductCard from '@/components/ProductCard.vue'

import { useToast } from '@/composables/useToast'

import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { useProductStore } from '@/stores/product'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true,
  },

  initialProduct: {
    type: Object,
    default: null,
  },

  game: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'loaded'])

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const productStore = useProductStore()
const cartStore = useCartStore()
const currencyStore = useCurrencyStore()

const toast = useToast()

const loading = ref(false)
const localError = ref('')
const isLoading = ref(false)

const { currentCurrency } = storeToRefs(currencyStore)

const product = computed(() => {
  return props.initialProduct || productStore.currentProduct
})

const storeError = computed(() => {
  return productStore.error
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

const formatText = value => {
  return String(value || '')
    .trim()
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

const cleanProductTitle = value => {
  return String(value || '')
    .replace(/StatTrak™\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const productTitle = computed(() => {
  return cleanProductTitle(product.value?.title || product.value?.name)
})

const productExterior = computed(() => {
  const directExterior =
    product.value?.exterior_name || product.value?.exterior || ''

  if (directExterior) {
    return formatText(directExterior)
  }

  const title = String(product.value?.title || '')

  const match = title.match(/\(([^)]+)\)\s*$/)

  return match ? String(match[1]).trim() : ''
})

const qualityColor = computed(() => {
  return qualityColorMap[product.value?.quality] || '#82796a'
})

const buildImageUrl = value => {
  if (!value) {
    return ''
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `${VITE_STATIC_DOMAIN}${value}`
}

const productImage = computed(() => {
  return buildImageUrl(product.value?.img_url_big || product.value?.img_url)
})

const price = computed(() => {
  const value = Number.parseFloat(
    product.value?.internal_price ?? product.value?.price ?? 0,
  )

  return Number.isFinite(value) ? value : 0
})

const oldPrice = computed(() => {
  const value = Number.parseFloat(
    product.value?.internal_old_price ?? product.value?.old_price ?? 0,
  )

  return Number.isFinite(value) && value > price.value ? value : 0
})

const productMeta = computed(() => {
  const items = []

  if (product.value?.type) {
    items.push({
      label: 'Type',
      value: formatText(product.value.type),
    })
  }

  if (product.value?.quality) {
    items.push({
      label: 'Rarity',
      value: formatText(product.value.quality),
    })
  }

  if (productExterior.value) {
    items.push({
      label: 'Exterior',
      value: productExterior.value,
    })
  }

  if (product.value?.class) {
    items.push({
      label: 'Class',
      value: formatText(product.value.class),
    })
  }

  return items
})

const similarProducts = computed(() => {
  return Array.isArray(product.value?.similar)
    ? product.value.similar.slice(0, 5)
    : []
})

const isInCart = computed(() => {
  if (!product.value?.id) {
    return false
  }

  return cartStore.isItemInCart(product.value.id)
})

const goBackToList = async () => {
  emit('close')

  const from = route.query.from

  if (typeof from === 'string' && from.startsWith('/')) {
    await router.push(from)

    return
  }

  await router.push({
    name: 'ProductListPage',
  })
}

const load = async id => {
  if (!id) {
    return
  }

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

    const loadedProduct = await productStore.fetchProductDetails(id)

    if (loadedProduct) {
      emit('loaded', loadedProduct)
    }
  } catch (error) {
    localError.value = error?.message || t('Failed to load product')
  } finally {
    loading.value = false
  }
}

const removeFromCart = async () => {
  if (!product.value?.id) {
    return false
  }

  try {
    isLoading.value = true

    const { success, error: errorMessage } = await cartStore.removeFromCart(
      product.value.id,
    )

    if (success) {
      toast.success(t('Item removed from cart'))

      return true
    }

    toast.error(errorMessage || t('Failed to remove item'))

    return false
  } catch (error) {
    toast.error(error?.message || t('Failed to remove item'))

    return false
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  if (!product.value?.id) {
    return false
  }

  try {
    isLoading.value = true

    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(product.value.id)

    if (success) {
      toast.success(t('Item added to cart'))

      return true
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      await router.push({
        name: 'LoginPage',

        query: {
          redirect: router.currentRoute.value.fullPath || '/',
        },
      })

      return false
    }

    if (isAlreadyInCart) {
      toast.warning(message || t('Item is already in cart'))

      return false
    }

    toast.error(message || t('Failed to add item'))

    return false
  } catch (error) {
    toast.error(error?.message || t('Failed to add item to cart'))

    return false
  } finally {
    isLoading.value = false
  }
}

const toggleCart = async () => {
  if (!product.value?.id || isLoading.value) {
    return
  }

  if (isInCart.value) {
    await removeFromCart()

    return
  }

  await addToCart()
}

const buyNow = async () => {
  if (!product.value?.id || isLoading.value) {
    return
  }

  if (isInCart.value) {
    await router.push({
      name: 'CartPage',
    })

    return
  }

  const success = await addToCart()

  if (success) {
    await router.push({
      name: 'CartPage',
    })
  }
}

watch(
  () => props.productId,
  id => {
    load(id)
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  if (!props.initialProduct) {
    productStore.clearCurrentProduct()
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.details {
  position: relative;

  display: flex;
  flex-direction: column;

  flex: 1 0 auto;

  width: 100%;

  @include adaptiveValue('padding-top', 42, 24);

  @include adaptiveValue('padding-bottom', 110, 40);

  &__inner {
    display: flex;
    flex-direction: column;

    flex: 1 1 auto;

    width: 100%;
  }

  &__loading {
    margin: auto;
  }

  &__breadcrumb {
    display: flex;
    align-items: center;

    min-width: 0;

    gap: 8px;

    @include ibm-12-700;

    color: var(--cod-gray);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 14);
    }
  }

  &__breadcrumb-link {
    flex: 0 0 auto;

    color: var(--makara);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }
  }

  &__breadcrumb-current {
    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__back {
    display: inline-flex;
    align-items: center;

    align-self: flex-start;

    gap: 8px;

    padding: 0;

    border: 0;

    background: transparent;

    @include ibm-13-700;

    color: var(--kelp);

    cursor: pointer;

    transition: color 0.3s ease;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);

        .details__back-arrow {
          transform: translateX(-3px);
        }
      }
    }
  }

  &__back-arrow {
    font-size: 18px;
    line-height: 1;

    transition: transform 0.3s ease;
  }

  &__product {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 80, 45);
    }
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    flex: 1 1 auto;

    min-height: 420px;

    gap: 12px;

    padding: 40px 20px;

    border-radius: 28px;

    background: var(--merino);

    text-align: center;
  }

  &__state-title {
    @include sg-26-700;

    color: var(--cod-gray);
  }

  &__state-button {
    width: fit-content;

    margin-top: 10px;
  }
}

.product {
  display: grid;

  grid-template-columns:
    minmax(0, 1.05fr)
    minmax(380px, 0.95fr);

  overflow: hidden;

  border-radius: 32px;

  background: var(--merino);

  box-shadow: 0 18px 50px rgba(32, 30, 29, 0.08);

  &__visual {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 560px;

    @include adaptiveValue('padding', 70, 30);

    overflow: hidden;

    background: linear-gradient(145deg, #d99b5f 0%, #e3ad72 42%, #ebc592 100%);

    &::before {
      content: '';

      position: absolute;

      inset: 0;

      background: radial-gradient(
        circle at 50% 42%,
        rgba(255, 244, 219, 0.55) 0%,
        rgba(255, 244, 219, 0.15) 42%,
        transparent 72%
      );

      pointer-events: none;
    }

    &::after {
      content: '';

      position: absolute;

      right: 14%;
      bottom: 13%;
      left: 14%;

      height: 8%;

      border-radius: 50%;

      background: rgba(91, 55, 28, 0.14);

      filter: blur(18px);

      pointer-events: none;
    }
  }

  &__image {
    position: relative;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    img {
      display: block;

      width: 100%;
      height: auto;

      max-width: 560px;
      max-height: 390px;

      object-fit: contain;

      filter: drop-shadow(0 18px 15px rgba(32, 30, 29, 0.16));
    }
  }

  &__rarity {
    position: absolute;
    z-index: 3;

    top: 24px;
    left: 24px;

    display: inline-flex;
    align-items: center;

    gap: 7px;

    padding: 8px 12px;

    border-radius: 999px;

    background: rgba(249, 244, 237, 0.82);

    backdrop-filter: blur(8px);

    @include ibm-12-700;

    color: var(--cod-gray);
  }

  &__rarity-dot {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: var(--rarity-color);
  }

  &__info {
    display: flex;
    flex-direction: column;

    min-width: 0;

    @include adaptiveValue('padding-top', 54, 28);

    @include adaptiveValue('padding-right', 50, 22);

    @include adaptiveValue('padding-bottom', 50, 24);

    @include adaptiveValue('padding-left', 50, 22);
  }

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 24);
    }
  }

  &__eyebrow {
    @include ibm-12-700;

    color: var(--copper);

    text-transform: uppercase;
    letter-spacing: 0.08em;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__title {
    margin: 0;

    @include sg-44-700;

    color: var(--cod-gray);

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__exterior {
    @include ibm-17-400;

    color: var(--hemlock);
  }

  &__meta {
    border-top: 1px solid var(--cod-gray-07);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 24);
    }
  }

  &__meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    min-height: 52px;

    padding: 12px 0;

    border-bottom: 1px solid var(--cod-gray-07);
  }

  &__meta-label {
    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;
  }

  &__meta-value {
    @include ibm-14-700;

    color: var(--cod-gray);

    text-align: right;
  }

  &__purchase {
    margin-top: auto;

    padding: 22px;

    border-radius: 24px;

    background: var(--double-spanish-white);
  }

  &__price-block {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__price-label {
    margin-bottom: 5px;

    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;

    gap: 10px 14px;
  }

  &__price {
    color: var(--cod-gray);
  }

  &__old-price {
    opacity: 0.6;

    color: var(--makara);
  }

  &__actions {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr);

    gap: 10px;
  }

  &__buy {
    width: 100%;
  }

  &__cart {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 48px;

    gap: 8px;

    padding: 8px 16px;

    border: 1px solid var(--cod-gray-16);

    border-radius: 999px;

    background: var(--merino);

    @include ibm-13-700;

    color: var(--cod-gray);

    cursor: pointer;

    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease;

    @media (any-hover: hover) {
      &:hover:not(:disabled) {
        border-color: var(--copper);

        color: var(--copper);

        transform: translateY(-1px);
      }
    }

    &:disabled {
      opacity: 0.6;

      cursor: default;
    }

    &_remove {
      color: var(--hairy-heath);

      @media (any-hover: hover) {
        &:hover:not(:disabled) {
          border-color: var(--hairy-heath);

          color: var(--hairy-heath);
        }
      }
    }
  }

  &__cart-plus {
    font-size: 20px;
    line-height: 1;
  }

  &__cart-icon {
    width: 15px;
    height: 15px;
  }
}

.similar {
  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__eyebrow {
    margin-bottom: 5px;

    @include ibm-12-700;

    color: var(--copper);

    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__title {
    margin: 0;

    @include sg-36-700;

    color: var(--cod-gray);
  }

  &__browse {
    display: inline-flex;
    align-items: center;

    flex: 0 0 auto;

    gap: 8px;

    @include ibm-13-700;

    color: var(--kelp);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
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
}

@media (max-width: $md1) {
  .product {
    grid-template-columns:
      minmax(0, 1fr)
      minmax(360px, 0.9fr);

    &__visual {
      min-height: 500px;
    }
  }

  .similar {
    &__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}

@media (max-width: $md2) {
  .product {
    grid-template-columns: 1fr;

    &__visual {
      min-height: 420px;
    }
  }

  .similar {
    &__grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}

@media (max-width: $md3) {
  .details {
  }

  .product {
    border-radius: 24px;

    &__visual {
      min-height: 360px;
    }

    &__actions {
      grid-template-columns: 1fr;
    }
  }

  .similar {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 10px;
    }
  }
}

@media (max-width: $md5) {
  .product {
    border-radius: 18px;

    &__visual {
      min-height: 280px;

      padding: 30px 20px;
    }

    &__rarity {
      top: 14px;
      left: 14px;
    }

    &__title {
      @include sg-36-700;
    }

    &__purchase {
      padding: 16px;

      border-radius: 18px;
    }

    &__meta-row {
      min-height: 48px;
    }
  }

  .similar {
    &__head {
      align-items: flex-start;
    }

    &__browse {
      margin-top: 8px;

      span {
        display: none;
      }
    }
  }
}
</style>
