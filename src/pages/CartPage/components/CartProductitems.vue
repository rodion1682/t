<template>
  <div class="list" v-bind="attrs">
    <div v-if="cartStore.items.length" class="list__items">
      <div
        v-for="item in cartStore.items"
        :key="item?.item_id"
        class="list__item"
      >
        <ProductCard
          v-if="item?.item"
          :product="item.item"
          :cart-item-id="item.item_id"
          force-cart-mode
        />
      </div>
    </div>
    <button
      type="button"
      variant="transparent"
      class="list__clear _link-grey"
      @click="clearCart"
    >
      {{ $t('Clear All Cart') }}
    </button>
  </div>
</template>

<script setup>
import { useAttrs } from 'vue'

import ProductCard from '@/components/ProductCard.vue'
import { useCartStore } from '@/stores/cart'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const cartStore = useCartStore()

const clearCart = async () => {
  await cartStore.clearCart()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.list {
  width: 100%;

  &__items {
    display: flex;
    flex-wrap: wrap;

    @include adaptiveValue('row-gap', 20, 10);
    @include adaptiveValue('margin-left', -10, -5);
    @include adaptiveValue('margin-right', -10, -5);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__item {
    display: flex;

    flex: 0 1 33.333%;
    max-width: 33.333%;

    @include adaptiveValue('padding-left', 10, 5);
    @include adaptiveValue('padding-right', 10, 5);

    :deep(.card) {
      width: 100%;
      height: 100%;
    }

    @media (max-width: $md2) {
      flex: 0 1 50%;
      max-width: 50%;
    }
  }
  &__clear {
    width: fit-content;
    margin-left: auto;
    @media (max-width: $md5) {
      margin-right: 10px;
    }
  }
}
</style>
