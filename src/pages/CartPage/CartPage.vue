<template>
  <div class="cart">
    <div class="cart__inner _cnt">
      <div class="cart__top">
        <button
          v-if="false"
          class="cart__back"
          type="button"
          @click="goToMarket"
        >
          <SvgIcon class="cart__back-icon" :icon="ChevronDownIcon" />
          <div class="cart__bacl-text">{{ $t('Back to market') }}</div>
        </button>
        <div class="cart__title _h2">
          {{ $t('CART') }}
          <div v-if="false" class="cart__title-count">
            ({{ cartStore.cartItemsCount }}
            {{ cartStore.cartItemsCount > 1 ? $t('items') : $t('item') }})
          </div>
        </div>
        <BaseButton
          v-if="!cartStore.isEmpty && false"
          type="button"
          variant="hint"
          class="cart__clear"
          :disabled="cartStore.isLoading"
          @click="clearCart"
        >
          {{ $t('Clear cart') }}
        </BaseButton>
      </div>
      <template v-if="cartStore.isLoading">
        <LoadingSpinner class="cart__loading" />
      </template>
      <template v-else-if="!cartStore.isEmpty">
        <div class="cart__content">
          <CartItemsList class="cart__items" />
          <CartForm @top-up-click="$emit('top-up-click')" class="cart__form" />
        </div>
      </template>
      <template v-else-if="cartStore.isEmpty">
        <div class="cart__empty empty">
          <div class="empty__text">
            {{
              $t('Cart is empty now. Explore the Shop and add something here.')
            }}
          </div>
          <RouterLink class="empty__link" :to="marketRoute">
            <BaseButton variant="bordered">{{ $t('browse skins') }}</BaseButton>
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import BaseButton from '@/components/base/BaseButton.vue'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { ChevronDownIcon } from '@/components/icons/index.js'
import { useGame } from '@/composables/useGame'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import CartForm from './components/CartForm.vue'
import CartItemsList from './components/CartItemsList.vue'

const cartStore = useCartStore()
const toast = useToast()
const router = useRouter()
const { t } = useI18n()

const { marketRoute } = useGame()

defineEmits(['checkout-open', 'top-up-click'])

const goToMarket = () => {
  router.push(marketRoute.value)
}

const clearCart = async () => {
  const { success, error } = await cartStore.clearCart()

  if (success) {
    toast.success(t('Cart cleared'))
    return
  }

  toast.error(error || t('Failed to clear cart'))
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.cart {
  @include adaptiveValue('padding-top', 20, 25);
  @include adaptiveValue('padding-bottom', 130, 25);
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  &__inner {
    width: 100%;
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__title {
    text-align: center;
  }

  &__loading {
    margin: auto;
    display: flex;
    justify-self: center;
  }

  &__content {
    @media (min-width: $md3) {
      display: flex;
      @include adaptiveValue('gap', 20, 10, 1440, 992, 1);
    }
    @media (max-width: $md5) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__items {
    flex: 0 1 41%;
    @media (max-width: $md2) {
      flex: 0 1 50%;
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__form {
    flex: 0 1 59%;
    height: fit-content;
    @media (max-width: $md2) {
      flex: 0 1 50%;
    }
  }

  &__empty {
  }
}

.empty {
  &__text {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__link {
    display: block;
    max-width: 267px;
    margin: 0 auto;
  }
}
</style>
