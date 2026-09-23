<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['product-modal__inner']"
    @close="handleClose"
  >
    <div
      v-if="product"
      class="product-modal"
      :style="{
        '--card-color': cardColor,
        '--card-color-rgb': cardColorRgb,
      }"
    >
      <div class="product-modal__card">
        <div v-if="productWeapon" class="product-modal__weapon">
          {{ productWeapon }}
        </div>

        <div v-if="productImage" class="product-modal__image-wrapper">
          <div class="product-modal__bg _ibg-contain">
            <img src="@/assets/img/card-bg.svg" alt="" />
          </div>

          <div class="product-modal__image _ibg-contain">
            <img :src="productImage" :alt="productName || productWeapon" />
          </div>
        </div>

        <div class="product-modal__content">
          <div v-if="productName" class="product-modal__name _h3">
            {{ productName }}
          </div>

          <div v-if="hasInfo" class="product-modal__info">
            <div v-if="product.type" class="product-modal__row">
              <span class="product-modal__label">
                {{ $t('Type:') }}
              </span>

              <span class="product-modal__value">
                {{ product.type }}
              </span>
            </div>
            <div v-if="productExterior" class="product-modal__row">
              <span class="product-modal__label">
                {{ $t('Quality:') }}
              </span>

              <span class="product-modal__value">
                {{ productExterior }}
              </span>
            </div>
            <div v-if="product.quality && false" class="product-modal__row">
              <span class="product-modal__label">
                {{ $t('Rarity') }}
              </span>

              <span
                class="product-modal__value product-modal__value_quality"
                :style="{ color: qualityColor }"
              >
                {{ product.quality }}
              </span>
            </div>
          </div>

          <div class="product-modal__bottom">
            <PriceFormatter
              v-if="price"
              :price="price"
              skip-conversion
              reverse
              size="size-32"
              class="product-modal__price"
            />

            <BaseButton
              type="button"
              class="product-modal__button"
              :variant="isInCart ? 'delete' : 'primary'"
              :disabled="isLoading"
              @click="handleCartAction"
            >
              <template v-if="isLoading"> ... </template>

              <template v-else-if="isInCart">
                {{ $t('Remove') }}
              </template>

              <template v-else>
                {{ $t('Add') }}
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

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
  show: {
    type: Boolean,
    required: true,
  },
  product: {
    type: Object,
    default: null,
  },
  cartItemId: {
    type: [Number, String],
    default: null,
  },
  forceCartMode: {
    type: Boolean,
    default: false,
  },
  accentColor: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'update:show'])

const cartStore = useCartStore()
const toast = useToast()
const router = useRouter()

const { t } = useI18n()

const isLoading = ref(false)

const qualityColorMap = {
  'Consumer Grade': '#b0c3d9',
  'Mil-Spec Grade': '#4b69ff',
  'Industrial Grade': '#5e98d9',
  Restricted: '#8847ff',
  'High Grade': '#4b69ff',
  Classified: '#d32ce6',
  Covert: '#eb4b4b',
  'Base Grade': '#b0c3d9',
  Remarkable: '#8847ff',
  Extraordinary: '#eb4b4b',
  Superior: '#d32ce6',
  Distinguished: '#4b69ff',
  Exotic: '#d32ce6',
  Exceptional: '#8847ff',
  Master: '#eb4b4b',
  Contraband: '#e4ae39',
  Arcana: '#ade55c',
  Immortal: '#e4ae39',
  Legendary: '#d32ce6',
  Mythical: '#8847ff',
  Rare: '#4b69ff',
  Uncommon: '#5e98d9',
  Common: '#b0c3d9',
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

const productImage = computed(() => {
  const image = props.product?.img_url || ''

  if (!image) {
    return ''
  }

  if (/^https?:\/\//i.test(image)) {
    return image
  }

  return `${VITE_STATIC_DOMAIN}${image}`
})

const productWeapon = computed(() => {
  const title = cleanProductTitle(props.product?.title)

  if (!title) {
    return ''
  }

  const [weapon] = title.split('|').map(part => part.trim())

  return weapon || ''
})

const productName = computed(() => {
  const title = cleanProductTitle(props.product?.title)

  if (!title) {
    return ''
  }

  const parts = title.split('|').map(part => part.trim())

  if (parts.length > 1) {
    return parts.slice(1).join(' | ')
  }

  return title
})

const productExterior = computed(() => {
  const exterior =
    props.product?.exterior_name ||
    props.product?.exterior ||
    props.product?.exteriorName ||
    ''

  if (exterior) {
    return String(exterior).trim().replace(/_/g, ' ')
  }

  const title = String(props.product?.title || '')
  const match = title.match(/\(([^)]+)\)\s*$/)

  return match?.[1]?.trim() || ''
})

const price = computed(() => {
  const value = Number(props.product?.internal_price ?? 0)

  return Number.isFinite(value) ? value : 0
})

const qualityColor = computed(() => {
  return qualityColorMap[props.product?.quality] || 'var(--hint-primary-color)'
})

const hasInfo = computed(() => {
  return Boolean(
    productExterior.value || props.product?.type || props.product?.quality,
  )
})

const cartActionId = computed(() => {
  return props.cartItemId ?? props.product?.id ?? null
})

const isInCart = computed(() => {
  if (props.forceCartMode) {
    return true
  }

  if (!props.product?.id) {
    return false
  }

  return cartStore.isItemInCart(props.product.id)
})

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleCartAction = async () => {
  if (isLoading.value) {
    return
  }

  if (isInCart.value) {
    const itemId = cartActionId.value

    if (itemId == null) {
      toast.error(t('Failed to remove item'))
      return
    }

    try {
      isLoading.value = true

      const { success, error: errorMessage } =
        await cartStore.removeFromCart(itemId)

      if (success) {
        toast.success(t('Item removed from cart'))
        handleClose()
        return
      }

      toast.error(errorMessage || t('Failed to remove item'))
    } catch (error) {
      toast.error(error?.message || t('Failed to remove item'))
    } finally {
      isLoading.value = false
    }

    return
  }

  const productId = props.product?.id

  if (productId == null) {
    toast.error(t('Failed to add item'))
    return
  }

  try {
    isLoading.value = true

    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(productId)

    if (success) {
      toast.success(t('Item added to cart'))
      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      handleClose()

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
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.product-modal {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;

  &__card {
    width: 100%;
  }

  &__weapon {
    width: 100%;
    min-width: 0;
    text-align: center;
    font-family: var(--font-inter);
    font-size: 16px;
    line-height: 150%;
    font-weight: 400;

    color: var(--secondary-color);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__image-wrapper {
    position: relative;

    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
  }

  &__bg {
    position: absolute;

    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%);

    width: 100%;
    max-width: 200px;
    height: 100%;
    max-height: 205px;
  }

  &__image {
    position: relative;
    z-index: 1;

    width: 100%;
    max-width: 280px;
    aspect-ratio: 1 / 0.75;

    margin: 0 auto;
  }

  &__content {
    min-width: 0;
  }

  &__name {
    width: 100%;
    min-width: 0;
    text-align: center;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__info {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__row {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__label,
  &__value {
    min-width: 0;
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    line-height: 150%;
    font-weight: 400;
  }

  &__label {
    flex: 0 0 auto;
  }

  &__value {
    flex: 1 1 auto;

    text-align: right;
    text-transform: capitalize;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &_quality {
      font-weight: 500;
    }
  }

  &__bottom {
  }

  &__price {
    color: var(--primary-color);
    margin: 0 auto;
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__button {
  }
}
</style>
