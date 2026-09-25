<template>
  <main class="cart">
    <div class="cart__inner _cnt">
      <div class="cart__heading">
        <div class="cart__eyebrow">
          {{ $t('Market') }}
        </div>

        <h1 class="cart__title">
          {{ $t('Cart') }}
        </h1>
      </div>

      <LoadingSpinner v-if="cartStore.isLoading" class="cart__loading" />

      <div v-else-if="cartStore.isEmpty" class="cart__empty empty">
        <h2 class="empty__title">
          {{ $t('Your cart is empty') }}
        </h2>

        <p class="empty__text">
          {{ $t('Explore the marketplace and add skins you like.') }}
        </p>

        <RouterLink :to="marketRoute" class="empty__link">
          <BaseButton>
            {{ $t('Browse skins') }}
          </BaseButton>
        </RouterLink>
      </div>

      <div v-else class="cart__content">
        <CartItemsList class="cart__items" />

        <CartForm
          class="cart__checkout"
          @top-up-click="$emit('top-up-click')"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { useGame } from '@/composables/useGame'

import { useCartStore } from '@/stores/cart'

import CartForm from './components/CartForm.vue'
import CartItemsList from './components/CartItemsList.vue'

defineEmits(['top-up-click'])

const cartStore = useCartStore()

const { marketRoute } = useGame()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cart {
  display: flex;
  flex-direction: column;

  flex: 1 1 auto;

  width: 100%;

  @include adaptiveValue('padding-top', 50, 25);

  @include adaptiveValue('padding-bottom', 110, 40);

  &__inner {
    width: 100%;
  }

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 22);
    }
  }

  &__eyebrow {
    margin-bottom: 10px;

    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__title {
    margin: 0;

    @include sg-44-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__loading {
    margin: 100px auto;
  }

  &__content {
    display: grid;

    grid-template-columns:
      minmax(0, 1.65fr)
      minmax(360px, 1fr);

    align-items: start;

    @include adaptiveValue('gap', 40, 20);
  }

  &__items,
  &__checkout {
    min-width: 0;
  }
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  min-height: 380px;

  padding: 40px 20px;

  border-radius: 30px;

  background: var(--merino);

  text-align: center;

  &__title {
    margin: 0 0 10px;

    @include sg-26-700;

    color: var(--cod-gray);
  }

  &__text {
    max-width: 440px;

    margin: 0 0 24px;

    @include ibm-14-400;

    color: var(--makara);
  }

  &__link {
    display: block;

    width: fit-content;
  }
}

@media (max-width: $md2) {
  .cart {
    &__content {
      grid-template-columns:
        minmax(0, 1.35fr)
        minmax(330px, 1fr);

      gap: 20px;
    }
  }
}

@media (max-width: $md3) {
  .cart {
    &__content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
