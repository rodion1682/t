<template>
  <template v-if="product">
    <div
      class="card"
      v-bind="$attrs"
      :class="{ 'in-cart': isInCart }"
      :style="{
        '--card-color': cardColor,
        '--card-color-rgb': cardColorRgb,
      }"
      @click="openDetails"
    >
      <div v-if="productWeapon" class="card__weapon">
        {{ productWeapon }}
      </div>
      <div v-if="product.img_url" class="card__image-wrapper">
        <div class="card__bg _ibg-contain">
          <img src="@/assets/img/card-bg.svg" />
        </div>
        <div class="card__image _ibg-contain">
          <img :src="productImage" :alt="product.title" />
        </div>
      </div>

      <div v-if="productName" class="card__name">
        {{ productName }}
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

        <div class="card__actions">
          <BaseButton
            v-if="!shouldShowRemove"
            type="button"
            variant="bordered"
            class="card__button card__button_regular"
            :disabled="isLoading"
            @click.stop="handleCartAction"
          >
            <template v-if="isLoading"> ... </template>

            <template v-else>
              {{ $t('Add') }}
              <SvgIcon
                v-if="false"
                :icon="CartIcon"
                class="card__button-icon"
              />
            </template>
          </BaseButton>

          <BaseButton
            v-else
            type="button"
            variant="delete"
            class="card__button"
            :disabled="isLoading"
            @click.stop="handleCartAction"
          >
            <template v-if="isLoading"> ... </template>

            <template v-else>
              <SvgIcon :icon="TrashIcon" class="card__button-icon" />
            </template>
          </BaseButton>
        </div>
      </div>
    </div>

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
import BaseButton from '@/components/base/BaseButton.vue'
import { CartIcon, TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import ProductDetailsModal from '@/components/modals/ProductDetailsModal.vue'

import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

defineOptions({
  inheritAttrs: false,
})

const SHOW_DETAILS_MODAL = true

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const CARD_COLORS = [
  '#3F9088',
  '#CAA327',
  '#B5442F',
  '#7B4C8D',
  '#F0EAE0',
  '#C1587B',
]

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

const hexToRgb = hex => {
  const normalized = String(hex || '')
    .replace('#', '')
    .trim()

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return '63, 144, 136'
  }

  const number = Number.parseInt(normalized, 16)

  return [(number >> 16) & 255, (number >> 8) & 255, number & 255].join(', ')
}

const fallbackColor = computed(() => {
  const source = String(
    props.product?.title || props.product?.name || props.product?.id || '',
  )

  let hash = 0

  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0
  }

  return CARD_COLORS[hash % CARD_COLORS.length]
})

const cardColor = computed(() => {
  return props.accentColor || fallbackColor.value
})

const cardColorRgb = computed(() => {
  return hexToRgb(cardColor.value)
})

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

  if (!imageUrl) return ''

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  return `${VITE_STATIC_DOMAIN}${imageUrl}`
})

const price = computed(() => {
  const value = Number.parseFloat(props.product?.internal_price ?? 0)

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

const productExterior = computed(() => {
  const directExterior =
    props.product?.exterior_name || props.product?.exterior || ''

  if (directExterior) {
    return String(directExterior).trim().replace(/_/g, ' ')
  }

  const title = String(props.product?.title || '')

  const match = title.match(/\(([^)]+)\)\s*$/)

  return match ? String(match[1]).trim() : ''
})

const productWeapon = computed(() => {
  const title = cleanProductTitle(props.product?.title)

  if (!title) return ''

  const [weapon] = title.split('|').map(part => part.trim())

  return weapon || ''
})

const productName = computed(() => {
  const title = cleanProductTitle(props.product?.title)

  if (!title) return ''

  const parts = title.split('|').map(part => part.trim())

  if (parts.length > 1) {
    return parts.slice(1).join(' | ')
  }

  return title
})

const productInfoLine = computed(() => {
  if (productGame.value === 'cs2') {
    return productExterior.value
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
  if (isLoading.value) return

  if (shouldShowRemove.value) {
    await removeFromCart()
    return
  }

  await addToCart()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.card {
  position: relative;

  width: 100%;
  height: 100%;

  @include adaptiveValue('padding-top', 15, 10);
  @include adaptiveValue('padding-bottom', 15, 10);
  @include adaptiveValue('padding-left', 20, 10);
  @include adaptiveValue('padding-right', 20, 10);

  border: 1px solid var(--border-primary-color);
  @include adaptiveValue('border-radius', 20, 10);

  background: var(--bg-third-color);

  cursor: pointer;
  transform: scale(1);
  transition: all 0.3s ease 0s;

  @media (any-hover: hover) {
    &:hover {
      transform: scale(1.03);
    }
  }

  &__weapon,
  &__name {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__weapon {
    font-size: 10px;
    line-height: 15px;

    &:not(:last-child) {
      margin-bottom: 17px;
    }
  }
  &__image-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__bg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    max-width: 140px;
    width: 100%;
    height: 100%;
    max-height: 112px;
  }

  &__image {
    position: relative;
    z-index: 1;
    margin: 0 auto;
    max-width: 160px;
    width: 100%;
    aspect-ratio: 1 / 0.78;
  }

  &__name {
    color: var(--primary-color);
    font-size: 14px;
  }

  &__bottom {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  &__price {
    align-self: flex-end;
    :deep(.price__value) {
      color: var(--primary-color);
    }
  }

  &__actions {
    max-width: 80px;
    flex: 1 1 100%;
  }

  &__button {
    width: 100%;
    min-height: 32px;
    font-size: 10px;
    padding: 5px 8px;

    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }
}
</style>
