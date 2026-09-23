<template>
  <div class="list" v-bind="attrs">
    <BaseButton
      v-if="false"
      type="button"
      variant="transparent"
      class="list__clear"
      @click="clearCart"
    >
      {{ $t('Clear all cart') }}
    </BaseButton>

    <div class="list__list">
      <div
        v-for="item in cartStore.items"
        :key="item?.item_id"
        class="list__item"
      >
        <div class="list__about">
          <div v-if="item.item?.img_url" class="list__img _ibg-contain">
            <div class="list__bg _ibg-contain">
              <img src="@/assets/img/card-bg.svg" />
            </div>
            <img
              :src="getImageUrl(item.item.img_url)"
              :alt="item.item?.title"
            />
          </div>

          <div class="list__meta">
            <div
              v-if="getItemWeapon(item.item) && false"
              class="list__meta-sub"
            >
              {{ getItemWeapon(item.item) }}
            </div>

            <div class="list__meta-name">
              {{ getItemName(item.item) }}
            </div>

            <CartQuantity
              v-if="false"
              :model-value="getItemQuantity(item)"
              :loading="cartStore.isItemLoading(item?.item_id)"
              class="list__quantity"
              @change="quantity => updateItemQuantity(item?.item_id, quantity)"
            />
          </div>
        </div>

        <div class="list__prices">
          <PriceFormatter
            reverse
            class="list__coin"
            :price="item?.item?.internal_price"
            skip-conversion
          />

          <PriceFormatter
            v-if="false"
            class="list__fiat"
            :price="item?.item?.fiat_price"
            is-currency
            size="size-12"
          />
        </div>

        <BaseButton
          variant="delete"
          type="button"
          class="list__remove"
          :disabled="cartStore.isItemLoading(item?.item_id)"
          @click="removeItem(item?.item_id)"
        >
          <SvgIcon :icon="TrashIcon" class="list__remove-icon" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useCartStore } from '@/stores/cart'
import { useAttrs } from 'vue'
import CartQuantity from './CartQuantity.vue'

defineOptions({
  inheritAttrs: false,
})

defineEmits(['remove'])

const attrs = useAttrs()

const cartStore = useCartStore()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const getImageUrl = url => {
  return `${VITE_STATIC_DOMAIN}${url}`
}

const cleanTitle = title => {
  return String(title || '')
    .replace(/StatTrak™\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const getItemExterior = item => {
  const title = item?.title || ''

  const match = title.match(/\(([^)]+)\)\s*$/)

  if (match) {
    return `(${match[1].trim()})`
  }

  return item?.exterior ? `(${item.exterior})` : ''
}

const getItemName = item => {
  const title = cleanTitle(item?.title || '')
    .replace(/\s*\(([^)]+)\)\s*$/, '')
    .trim()

  const [, skinName] = title.split('|').map(part => part.trim())

  return skinName || title
}

const getItemWeapon = item => {
  const title = cleanTitle(item?.title || '')
    .replace(/\s*\(([^)]+)\)\s*$/, '')
    .trim()

  const [weapon] = title.split('|').map(part => part.trim())

  return weapon || ''
}

const getItemQuantity = item => {
  return cartStore.getQty(item?.item_id, item?.count || 1)
}

const updateItemQuantity = async (itemId, quantity) => {
  if (!itemId) return

  await cartStore.updateQuantity(itemId, quantity)
}

const removeItem = async itemId => {
  await cartStore.removeFromCart(itemId)
}

const clearCart = async () => {
  await cartStore.clearCart()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.list {
  &__clear {
    width: fit-content;
    margin-left: auto;
  }

  &__list {
  }

  &__item {
    display: flex;
    align-items: center;
    column-gap: 20px;
    row-gap: 10px;
    justify-content: space-between;
    border-radius: 20px;
    @include adaptiveValue('padding-left', 30, 10, 1440, 992, 1);
    @include adaptiveValue('padding-right', 30, 10, 1440, 992, 1);
    @include adaptiveValue('padding-top', 20, 10);
    @include adaptiveValue('padding-bottom', 20, 10);
    border: 1px solid var(--border-primary-color);
    background-color: var(--bg-third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 4);
    }
    @media (max-width: $md2) {
      flex-wrap: wrap;
    }
    @media (max-width: $md3) {
      flex-wrap: nowrap;
    }
    @media (max-width: $md5) {
      flex-wrap: wrap;
    }
  }

  &__about {
    flex: 0 1 50%;
    display: flex;
    overflow: hidden;

    @include adaptiveValue('gap', 30, 15, 1440, 992, 1);

    @media (max-width: $md2) {
      flex: 1 1 100%;
    }

    @media (max-width: $md3) {
      flex: 0 1 50%;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
  }

  &__img {
    flex: 0 0 80px;
    min-width: 80px;
    height: 60px;
    position: relative;
  }
  &__bg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 56px;
  }

  &__meta {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    align-self: center;

    &-name {
      display: block;
      width: 100%;
      min-width: 0;
      overflow: hidden;

      color: var(--primary-color);

      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &__quantity {
    width: fit-content;
  }

  &__prices {
    @media (max-width: $md5) {
      display: flex;
      gap: 15px;
    }
  }

  &__coin {
    color: var(--primary-color);
  }

  &__fiat {
  }

  &__remove {
    width: fit-content;
    @include adaptiveValue('min-width', 50, 40);
    border-color: transparent !important;
    &-icon {
      min-width: 18px;
      height: 18px;
    }
  }
}
</style>
