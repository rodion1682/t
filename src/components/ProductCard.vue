<template>
  <template v-if="product">
    <article
      class="card"
      v-bind="$attrs"
      :class="{
        'card_in-cart': isInCart,
      }"
    >
      <button type="button" class="card__preview" @click="openDetails">
        <div v-if="productImage" class="card__image">
          <img :src="productImage" :alt="productTitle" loading="lazy" />
        </div>
      </button>

      <div class="card__body">
        <button
          type="button"
          class="card__title"
          :title="productTitle"
          @click="openDetails"
        >
          {{ productTitle }}
        </button>

        <div
          v-if="productInfoLine"
          class="card__quality"
          :title="productInfoLine"
        >
          {{ productInfoLine }}
        </div>

        <div class="card__bottom">
          <PriceFormatter
            v-if="price"
            :price="price"
            reverse
            size="size-18"
            skip-conversion
            class="card__price"
          />

          <button
            type="button"
            class="card__cart"
            :class="{
              card__cart_remove: shouldShowRemove,
              card__cart_loading: isLoading,
            }"
            :disabled="isLoading"
            :aria-label="
              shouldShowRemove ? $t('Remove from cart') : $t('Add to cart')
            "
            @click.stop="handleCartAction"
          >
            <span v-if="isLoading" class="card__loader"> ··· </span>

            <SvgIcon
              v-else-if="shouldShowRemove"
              :icon="TrashIcon"
              class="card__cart-icon"
            />

            <span v-else class="card__plus"> + </span>
          </button>
        </div>
      </div>
    </article>

    <ProductDetailsModal
      v-if="SHOW_DETAILS_MODAL && isDetailsOpen"
      :show="isDetailsOpen"
      :product="product"
      :cart-item-id="cartActionId"
      :force-cart-mode="forceCartMode"
      @close="closeDetails"
    />
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import ProductDetailsModal from '@/components/modals/ProductDetailsModal.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

defineOptions({
  inheritAttrs: false,
})

const SHOW_DETAILS_MODAL = true

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },

  accentColor: {
    type: String,
    default: '',
  },

  forceCartMode: {
    type: Boolean,
    default: false,
  },

  cartItemId: {
    type: [Number, String],
    default: null,
  },
})

const cartStore = useCartStore()
const toast = useToast()
const router = useRouter()

const { t } = useI18n()

const isLoading = ref(false)
const isDetailsOpen = ref(false)

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

const cartActionId = computed(() => {
  return props.cartItemId || props.product.id
})

const isInCart = computed(() => {
  return cartStore.isItemInCart(props.product.id)
})

const shouldShowRemove = computed(() => {
  return props.forceCartMode || isInCart.value
})

const productImage = computed(() => {
  const imageUrl = props.product?.img_url || ''

  if (!imageUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${VITE_STATIC_DOMAIN}${imageUrl}`
})

const price = computed(() => {
  const value = Number.parseFloat(
    props.product?.internal_price ?? props.product?.price ?? 0,
  )

  return Number.isFinite(value) ? value : 0
})

const productGame = computed(() => {
  return String(
    props.product?.category ||
      props.product?.game_code ||
      props.product?.gameCode ||
      '',
  )
    .trim()
    .toLowerCase()
})

const productTitle = computed(() => {
  return cleanProductTitle(props.product?.title || props.product?.name)
})

const productExterior = computed(() => {
  const directExterior =
    props.product?.exterior_name || props.product?.exterior || ''

  if (directExterior) {
    return formatText(directExterior)
  }

  const title = String(props.product?.title || '')

  const match = title.match(/\(([^)]+)\)\s*$/)

  return match ? String(match[1]).trim() : ''
})

const productInfoLine = computed(() => {
  if (productGame.value === 'cs2') {
    return productExterior.value || formatText(props.product?.quality)
  }

  if (productGame.value === 'dota2') {
    return formatText(
      props.product?.hero ||
        props.product?.hero_name ||
        props.product?.character,
    )
  }

  return (
    productExterior.value ||
    formatText(props.product?.quality) ||
    formatText(
      props.product?.hero ||
        props.product?.hero_name ||
        props.product?.character,
    )
  )
})

const openDetails = () => {
  if (SHOW_DETAILS_MODAL) {
    isDetailsOpen.value = true

    return
  }

  router.push({
    name: 'ProductDetailsPage',

    params: {
      productId: props.product.id,
    },

    query: {
      from: router.currentRoute.value.fullPath,
    },
  })
}

const closeDetails = () => {
  isDetailsOpen.value = false
}

const removeFromCart = async () => {
  try {
    isLoading.value = true

    const { success, error: errorMessage } = await cartStore.removeFromCart(
      cartActionId.value,
    )

    if (success) {
      toast.success(t('Item removed from cart'))

      return
    }

    toast.error(errorMessage || t('Failed to remove item'))
  } catch (error) {
    toast.error(error?.message || t('Failed to remove item'))
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  try {
    isLoading.value = true

    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(props.product.id)

    if (success) {
      toast.success(t('Item added to cart'))

      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      await router.push({
        name: 'LoginPage',

        query: {
          redirect: router.currentRoute.value.fullPath || '/',
        },
      })

      return
    }

    if (isAlreadyInCart) {
      toast.warning(message || t('Item is already in cart'))

      return
    }

    toast.error(message || t('Failed to add item'))
  } catch (error) {
    toast.error(error?.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}

const handleCartAction = async () => {
  if (isLoading.value) {
    return
  }

  if (shouldShowRemove.value) {
    await removeFromCart()

    return
  }

  await addToCart()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.card {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  min-width: 0;

  overflow: hidden;

  @include adaptiveValue('border-radius', 22, 14);

  background: var(--double-spanish-white);

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  @media (any-hover: hover) {
    &:hover {
      transform: translateY(-3px);

      box-shadow: 0 12px 28px var(--cod-gray-16);
    }
  }

  // =========================
  // IMAGE AREA
  // =========================

  &__preview {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    aspect-ratio: 1.32 / 1;

    @include adaptiveValue('padding', 16, 8);

    border: 0;

    overflow: hidden;

    background: linear-gradient(145deg, #d99b5f 0%, #e3ad72 42%, #ebc592 100%);

    cursor: pointer;

    &::before {
      content: '';

      position: absolute;

      inset: 0;

      background: radial-gradient(
        circle at 50% 42%,
        rgba(255, 244, 219, 0.45) 0%,
        rgba(255, 244, 219, 0.12) 40%,
        transparent 70%
      );

      pointer-events: none;
    }

    &::after {
      content: '';

      position: absolute;

      left: 10%;
      right: 10%;
      bottom: 8%;

      height: 12%;

      border-radius: 50%;

      background: rgba(91, 55, 28, 0.13);

      filter: blur(10px);

      transform: scaleX(0.8);

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

    transition: transform 0.3s ease;

    img {
      display: block;

      width: 100%;
      height: 100%;

      max-width: 190px;

      object-fit: contain;

      filter: drop-shadow(0 8px 7px rgba(32, 30, 29, 0.14));
    }
  }

  @media (any-hover: hover) {
    &:hover {
      .card__image {
        transform: scale(1.04);
      }
    }
  }

  // =========================
  // CONTENT
  // =========================

  &__body {
    display: flex;
    flex-direction: column;

    flex: 1 1 auto;

    min-width: 0;

    @include adaptiveValue('padding-top', 14, 10);

    @include adaptiveValue('padding-right', 15, 10);

    @include adaptiveValue('padding-bottom', 15, 10);

    @include adaptiveValue('padding-left', 15, 10);
  }

  &__title {
    display: block;

    width: 100%;
    min-width: 0;

    padding: 0;

    border: 0;

    overflow: hidden;

    background: transparent;

    @include ibm-12-400;

    line-height: 145%;

    text-align: left;

    white-space: nowrap;
    text-overflow: ellipsis;

    color: var(--cod-gray);

    cursor: pointer;

    transition: color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }
  }

  &__quality {
    width: 100%;
    min-width: 0;

    margin-top: 3px;

    overflow: hidden;

    @include ibm-12-700;

    line-height: 140%;

    white-space: nowrap;
    text-overflow: ellipsis;

    color: var(--hemlock);
  }

  // =========================
  // PRICE + CART
  // =========================

  &__bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    gap: 10px;

    margin-top: auto;

    @include adaptiveValue('padding-top', 17, 12);
  }

  &__price {
    min-width: 0;

    :deep(.price__value) {
      color: var(--cod-gray);
    }

    :deep(.price) {
      white-space: nowrap;
    }
  }

  &__cart {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 auto;

    @include adaptiveValue('width', 38, 32);

    @include adaptiveValue('height', 38, 32);

    padding: 0;

    border: 0;
    border-radius: 50%;

    background: var(--copper);

    color: var(--merino);

    cursor: pointer;

    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      opacity 0.2s ease;

    @media (any-hover: hover) {
      &:hover:not(:disabled) {
        transform: translateY(-2px);

        background: var(--tuscany);
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.95);
    }

    &:disabled {
      cursor: default;

      opacity: 0.65;
    }

    &_remove {
      background: var(--kelp);

      @media (any-hover: hover) {
        &:hover:not(:disabled) {
          background: var(--hemlock);
        }
      }
    }
  }

  &__plus {
    display: block;

    transform: translateY(-1px);

    font-size: 19px;
    line-height: 1;
    font-weight: 400;
  }

  &__cart-icon {
    width: 15px;
    height: 15px;
  }

  &__loader {
    display: block;

    font-size: 12px;
    line-height: 1;

    letter-spacing: 1px;
  }

  // =========================
  // ITEM ALREADY IN CART
  // =========================

  &_in-cart {
    .card__quality {
      color: var(--kelp);
    }
  }
}

// =========================
// TABLET
// =========================

@media (max-width: $md2) {
  .card {
    &__preview {
      aspect-ratio: 1.25 / 1;
    }

    &__image {
      img {
        max-width: 170px;
      }
    }
  }
}

// =========================
// MOBILE
// =========================

@media (max-width: $md3) {
  .card {
    &__preview {
      aspect-ratio: 1.25 / 1;
    }

    &__image {
      img {
        max-width: 150px;
      }
    }

    &__title {
      font-size: 12px;
    }

    &__quality {
      font-size: 11px;
    }
  }
}

@media (max-width: $md5) {
  .card {
    border-radius: 14px;

    &__preview {
      min-height: 115px;

      aspect-ratio: auto;
    }

    &__image {
      img {
        max-width: 130px;
      }
    }

    &__body {
      padding: 10px;
    }

    &__title {
      font-size: 11px;

      line-height: 135%;
    }

    &__quality {
      margin-top: 4px;

      font-size: 10px;

      line-height: 130%;
    }

    &__bottom {
      gap: 6px;

      padding-top: 12px;
    }

    &__cart {
      width: 30px;
      height: 30px;
    }

    &__plus {
      font-size: 17px;
    }

    &__cart-icon {
      width: 13px;
      height: 13px;
    }
  }
}
</style>
