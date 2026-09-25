<template>
  <section class="cart-list">
    <div class="cart-list__items">
      <article
        v-for="row in cartStore.items"
        :key="row.item_id"
        class="cart-list__item"
      >
        <button
          type="button"
          class="cart-list__product"
          @click="openProduct(row.item)"
        >
          <div class="cart-list__visual">
            <img
              v-if="getImage(row.item)"
              :src="getImage(row.item)"
              :alt="getTitle(row.item)"
              loading="lazy"
            />
          </div>

          <div class="cart-list__meta">
            <div class="cart-list__title">
              {{ getTitle(row.item) }}
            </div>

            <div v-if="getExterior(row.item)" class="cart-list__exterior">
              {{ getExterior(row.item) }}
            </div>
          </div>
        </button>

        <div class="cart-list__right">
          <PriceFormatter
            :price="getPrice(row.item)"
            reverse
            skip-conversion
            is-currency
            class="cart-list__price"
          />

          <button
            type="button"
            class="cart-list__remove"
            :disabled="cartStore.isItemLoading(row.item_id)"
            @click="removeItem(row.item_id)"
          >
            <SvgIcon :icon="TrashIcon" class="cart-list__remove-icon" />

            <span>
              {{ $t('Delete') }}
            </span>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'

import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useCartStore } from '@/stores/cart'

const router = useRouter()

const cartStore = useCartStore()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const cleanTitle = value => {
  return String(value || '')
    .replace(/StatTrak™\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const getTitle = item => {
  return cleanTitle(item?.title || item?.name || '')
}

const getExterior = item => {
  const direct = item?.exterior_name || item?.exterior

  if (direct) {
    return direct
  }

  const match = String(item?.title || '').match(/\(([^)]+)\)\s*$/)

  return match?.[1] || item?.quality || ''
}

const getImage = item => {
  const url = item?.img_url || ''

  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `${VITE_STATIC_DOMAIN}${url}`
}

const getPrice = item => {
  return Number(item?.internal_price ?? item?.price ?? 0)
}

const openProduct = item => {
  if (!item?.id) {
    return
  }

  router.push({
    name: 'ProductDetailsPage',

    params: {
      productId: item.id,
    },

    query: {
      from: router.currentRoute.value.fullPath,
    },
  })
}

const removeItem = async id => {
  if (!id) {
    return
  }

  await cartStore.removeFromCart(id)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cart-list {
  padding: 10px;

  border-radius: 30px;

  background: rgba(235, 221, 197, 0.55);

  &__items {
    display: flex;
    flex-direction: column;

    gap: 4px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    min-height: 122px;

    @include adaptiveValue('padding', 20, 12);

    border-radius: 25px;

    background: var(--merino);
  }

  &__product {
    display: flex;
    align-items: center;

    flex: 1 1 auto;

    min-width: 0;

    gap: 24px;

    padding: 0;

    border: 0;

    background: transparent;

    text-align: left;

    cursor: pointer;
  }

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 96px;

    width: 96px;
    height: 82px;

    padding: 10px;

    border-radius: 22px;

    background: linear-gradient(145deg, #c9985f, #e8b875);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;

      filter: drop-shadow(0 6px 5px rgba(32, 30, 29, 0.14));
    }
  }

  &__meta {
    min-width: 0;
  }

  &__title {
    overflow: hidden;

    @include ibm-14-400;

    color: var(--cod-gray);

    white-space: nowrap;
    text-overflow: ellipsis;

    transition: color 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__product {
    @media (any-hover: hover) {
      &:hover {
        .cart-list__title {
          color: var(--copper);
        }
      }
    }
  }

  &__exterior {
    @include ibm-13-700;

    color: var(--kelp);
  }

  &__right {
    display: flex;
    align-items: center;

    flex: 0 0 auto;

    gap: 28px;
  }

  &__price {
    color: var(--cod-gray);
  }

  &__remove {
    display: inline-flex;
    align-items: center;

    gap: 7px;

    padding: 8px 0;

    border: 0;

    background: transparent;

    @include ibm-12-700;

    color: var(--rope);

    cursor: pointer;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover:not(:disabled) {
        color: var(--hairy-heath);
      }
    }

    &:disabled {
      opacity: 0.5;

      cursor: default;
    }
  }

  &__remove-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: $md2) {
  .cart-list {
    &__item {
      align-items: flex-start;
      flex-direction: column;
    }

    &__right {
      justify-content: space-between;

      width: 100%;

      padding-left: 120px;
    }
  }
}

@media (max-width: $md3) {
  .cart-list {
    &__item {
      flex-direction: row;
      align-items: center;
    }

    &__right {
      width: auto;

      padding-left: 0;
    }
  }
}

@media (max-width: $md5) {
  .cart-list {
    margin-right: -10px;
    margin-left: -10px;

    padding: 6px;

    border-radius: 20px;

    &__item {
      align-items: flex-start;
      flex-direction: column;

      gap: 14px;

      min-height: 0;

      border-radius: 17px;
    }

    &__product {
      width: 100%;

      gap: 14px;
    }

    &__visual {
      flex-basis: 78px;

      width: 78px;
      height: 68px;

      border-radius: 15px;
    }

    &__right {
      justify-content: space-between;

      width: 100%;
    }
  }
}
</style>
