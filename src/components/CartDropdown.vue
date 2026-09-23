<script setup>
import { useCartStore } from '@/stores/cart'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PriceFormatter from './PriceFormatter.vue'
import BaseButton from './base/BaseButton.vue'

const emit = defineEmits(['close'])

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const cartStore = useCartStore()
const router = useRouter()
const dropdownRef = ref(null)

const goToCheckout = () => {
  emit('close')
  router.push('/cart')
}

const clearCart = async () => {
  await cartStore.clearCart()
}

const removeItem = async itemId => {
  const result = await cartStore.removeFromCart(itemId)
  if (!result.success) console.error('Failed to remove item:', result.error)
}

const handleClickOutside = event => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    emit('close')
  }
}

const getItemSkin = title => {
  if (!title) return ''

  const parts = title.split('|')
  if (parts.length < 2) return ''

  return parts[1].replace(/\(.*?\)/g, '').trim()
}

const getItemName = title => {
  if (!title) return ''

  return title
    .replace(/^[^a-zA-Z0-9]+/, '')

    .split('|')[0]
    .trim()
}

const getImageUrl = url => {
  if (!url) return 'https://placehold.co/80x60'
  return `${VITE_STATIC_DOMAIN}${url}`
}

onMounted(() => {
  setTimeout(() => document.addEventListener('click', handleClickOutside), 100)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => cartStore.items,
  v => console.log('cartStore.items:', v),
  { deep: true, immediate: true },
)
</script>

<template>
  <div ref="dropdownRef" class="cart-dd">
    <div class="cart-dd__inner">
      <div
        v-if="!cartStore.items || cartStore.items.length === 0"
        class="cart-dd__empty"
      >
        {{ $t?.('Your cart is empty') ?? 'Your cart is empty' }}
      </div>

      <div v-else class="cart-dd__grid">
        <!-- LEFT: CART -->
        <div class="cart-dd__cart">
          <div class="cart-dd__top">
            <div class="cart-dd__title _l">{{ $t('Cart') }}</div>

            <BaseButton
              v-if="cartStore.cartItemsCount > 0"
              type="button"
              class="cart-dd__clear"
              variant="reset"
              @click="clearCart"
            >
              {{ $t('Clear cart') }}
            </BaseButton>
          </div>

          <div class="cart-dd__head">
            <div class="cart-dd__head-cell cart-dd__head-cell_item">
              {{ $t('Item') }}
            </div>
            <div class="cart-dd__head-cell cart-dd__head-cell_price">
              {{ $t('Price') }}
            </div>
            <div class="cart-dd__head-cell cart-dd__head-cell_action"></div>
          </div>

          <div class="cart-dd__list">
            <div
              v-for="cartItem in cartStore.items"
              :key="cartItem.id"
              class="cart-dd__row"
            >
              <div class="cart-dd__item">
                <div
                  v-if="cartItem.item?.img_url"
                  class="cart-dd__img _ibg-contain"
                >
                  <img :src="getImageUrl(cartItem.item.img_url)" />
                </div>
                <div class="cart-dd__meta">
                  <div class="cart-dd__name">
                    {{ getItemSkin(cartItem.item?.title) }}
                  </div>
                  <div class="cart-dd__sub">
                    {{ getItemName(cartItem.item?.title) }}
                  </div>
                </div>
              </div>
              <div class="cart-dd__price">
                <PriceFormatter
                  v-if="cartItem.item?.price"
                  :price="cartItem.item.price"
                />
              </div>
              <div class="cart-dd__action">
                <button
                  type="button"
                  class="cart-dd__remove"
                  :disabled="cartStore.isItemLoading(cartItem.item_id)"
                  @click="removeItem(cartItem.item_id)"
                >
                  <div class="cart-dd__remove-content">
                    <span>{{
                      cartStore.isItemLoading(cartItem.item_id) ? '...' : '×'
                    }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="cart-dd__summary">
          <div class="cart-dd__summary-title _md">{{ $t('Summary') }}</div>
          <div class="cart-dd__summary-row">
            <div class="cart-dd__summary-label">{{ $t('Items') }}</div>
            <div class="cart-dd__summary-value">
              {{ cartStore.cartItemsCount || 0 }}
            </div>
          </div>
          <div class="cart-dd__summary-total">
            <div class="cart-dd__summary-label">{{ $t('Total') }}:</div>
            <div class="cart-dd__summary-total-value">
              <PriceFormatter
                v-if="cartStore.cartTotal"
                :price="cartStore.cartTotal"
                textClasses="cart-dd__total-text"
              />
            </div>
          </div>
          <BaseButton
            variant="primary"
            class="cart-dd__buy"
            @click="goToCheckout"
          >
            {{ $t('Buy') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cart-dd {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 4;
  @include adaptiveValue('margin-top', 6, 6, 1920);
  @include adaptiveValue('border-radius', 6, 6, 1920);
  background: var(--bg-secondary-color);
  overflow: hidden;
  @include adaptiveValue('padding', 14, 10, 1920);
  @include adaptiveValue('padding-left', 27, 10, 1920);
  @media (min-width: $md4) {
    @include adaptiveValue('max-width', 724, 724, 1920);
    @include adaptiveValue('min-width', 724, 724, 1920);
  }
  @media (max-width: $md4) {
    min-width: fit-content;
    right: -10px;
  }
  @media (max-width: $md5) {
    max-width: 330px;
    min-width: 320px;
  }
  &__inner {
  }
  &__empty {
    @include adaptiveValue('padding-top', 48, 32, 1920);
    @include adaptiveValue('padding-bottom', 48, 32, 1920);
    text-align: center;
    color: #a3a7bc;
    font-size: 14px;
  }
  &__grid {
    @media (min-width: $md4) {
      display: flex;
      @include adaptiveValue('column-gap', 22, 20, 1920);
      align-items: flex-start;
    }
  }
  &__cart {
    flex: 0 1 59%;
  }
  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include adaptiveValue('gap', 20, 20, 1920);
    @include adaptiveValue('margin-top', 10, 6, 1920);
    @include adaptiveValue('margin-bottom', 20, 12, 1920);
  }
  &__title {
    @include adaptiveValue('font-size', 18, 18, 1920);
  }
  &__clear {
    width: fit-content;
    text-transform: none;
    @media (any-hover: hover) {
      color: #930f30 !important;
      &:hover {
        color: var(--primary-color) !important;
      }
    }
  }
  &__head {
    background: #040711;
    display: flex;
    @include adaptiveValue('gap', 20, 20, 1920);
    align-items: center;
    @include adaptiveValue('padding', 10, 10, 1920);
    @include adaptiveValue('border-radius', 6, 6, 1920);
    @include adaptiveValue('min-height', 46, 40, 1920);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10, 1920);
    }
    @media (max-width: $md5) {
      gap: 10px;
    }
  }
  &__head-cell {
    font-weight: 700;
    font-family: var(--font-open-sans);
    color: var(--third-color);
    text-transform: uppercase;
    &_item {
      flex: 0 1 60%;
    }
    &_price {
      flex: 0 1 30%;
    }
    &_action {
      @include adaptiveValue('min-width', 46, 40, 1920);
    }
  }
  &__list {
    @include adaptiveValue('max-height', 300, 300, 1920);
    overflow-y: auto;
    @include adaptiveValue('padding-right', 6, 6, 1920);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
    &::-webkit-scrollbar {
      @include adaptiveValue('width', 6, 6, 1920);
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    @media (max-width: $md5) {
      max-height: 200px;
    }
  }
  &__row {
    display: flex;
    @include adaptiveValue('gap', 20, 20, 1920);
    align-items: center;
    @include adaptiveValue('padding-left', 18, 0, 1920);
    @include adaptiveValue('padding-top', 18, 10, 1920);
    @include adaptiveValue('padding-bottom', 18, 10, 1920);
    border-style: solid;
    border-color: #040711;
    @include adaptiveValue('border-width', 1, 1, 1920);
    border-left: 0px;
    border-top: 0px;
    border-right: 0px;
    &:last-child {
      border-bottom: 0px;
    }
    @media (max-width: $md5) {
      gap: 10px;
    }
  }
  &__item {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 20, 20, 1920);
    flex: 0 1 60%;
  }
  &__img {
    @include adaptiveValue('min-width', 57, 57, 1920);
    @include adaptiveValue('height', 43, 43, 1920);
    @media (max-width: $md5) {
      min-width: 50px;
      height: 40px;
    }
  }
  &__meta {
    min-width: 0;
  }
  &__name {
    @include adaptiveValue('font-size', 12, 12, 1920);
    font-weight: 700;
    text-transform: capitalize;
    &:not(:last-child) {
      @include adaptiveValue(' margin-bottom', 8, 6, 1920);
    }
  }
  &__sub {
    color: var(--fourth-color);
  }
  &__price {
    flex: 0 1 30%;
    @include adaptiveValue('font-size', 14, 14, 1920);
    font-weight: 700;
    :deep(.price__currency) {
      color: var(--primary-color);
    }
  }
  &__action {
    display: flex;
    justify-content: flex-end;
  }
  &__remove {
    @include adaptiveValue('min-width', 46, 40, 1920);
    @include adaptiveValue('height', 46, 40, 1920);
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    &-content {
      @include adaptiveValue('min-width', 16, 16, 1920);
      @include adaptiveValue('height', 16, 16, 1920);
      border-radius: 50%;
      color: var(--primary-color);
      background-color: #930f30;
      transition: background-color 0.3s ease 0s;
      position: relative;
      span {
        display: inline-block;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-53%, -50%);
        font-weight: 500;
        @include adaptiveValue('font-size', 12, 12, 1920);
      }
    }
    @media (any-hover: hover) {
      &:hover {
        .cart-dd__remove-content {
          background-color: var(--error-color);
        }
      }
    }
  }
  &__summary {
    flex: 0 1 41%;
    @include adaptiveValue('border-radius', 8, 8, 1920);
    background: #040711;
    @include adaptiveValue('padding-top', 18, 10, 1920);
    @include adaptiveValue('padding-right', 20, 10, 1920);
    @include adaptiveValue('padding-bottom', 12, 10, 1920);
    @include adaptiveValue('padding-left', 28, 10, 1920);
    @media (max-width: 820px) {
      flex: 1 1 auto;
      width: 100%;
    }
    &-title,
    &-row,
    &-total {
      @include adaptiveValue('font-size', 14, 14, 1920);
      @include adaptiveValue('padding-bottom', 12, 10, 1920);
      &:not(:last-child) {
        border-color: #1c2032;
        border-style: solid;
        @include adaptiveValue('border-width', 1, 1, 1920);
        border-left: 0px;
        border-top: 0px;
        border-right: 0px;
        @include adaptiveValue('margin-bottom', 12, 10, 1920);
      }
    }
    &-row,
    &-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &-label {
      color: var(--third-color);
    }
    &-value {
      font-weight: 700;
    }
    &-total {
      border-bottom: none;
      :deep(.price__currency) {
        color: var(--primary-color);
      }
    }
  }
  &__buy {
    @media (min-width: $md5) {
      margin: 0 auto;
      @include adaptiveValue('max-width', 110, 110, 1920);
    }
  }
}
</style>
