<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
})

const router = useRouter()

const authStore = useAuthStore()
const cartStore = useCartStore()
const toast = useToast()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const imageUrl = computed(() => {
  const url = props.item?.img_url_big || props.item?.img_url

  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `${VITE_STATIC_DOMAIN}${url}`
})

const hasOldPrice = computed(() => {
  const price = Number(props.item?.price)
  const oldPrice = Number(props.item?.old_price)

  return Number.isFinite(price) && Number.isFinite(oldPrice) && oldPrice > price
})

const description = computed(() => {
  return String(props.item?.description || '')
    .replace(/<[^>]*>/g, '')
    .trim()
})

const details = computed(() => {
  const result = []

  if (props.item?.quality) {
    result.push(props.item.quality)
  }

  if (props.item?.type) {
    result.push(props.item.type)
  }

  return result
})

const buying = computed(() => {
  const itemId = props.item?.id

  if (!itemId) {
    return false
  }

  return Boolean(cartStore.itemLoading?.[itemId])
})

const redirectToLogin = async itemId => {
  sessionStorage.setItem('pendingBuyItemId', String(itemId))

  const redirect = router.resolve({
    name: 'HomePage',
    query: {
      completeBuy: '1',
    },
  }).fullPath

  await router.push({
    name: 'LoginPage',
    query: {
      redirect,
    },
  })
}

const buyNow = async () => {
  const itemId = props.item?.id

  if (!itemId || buying.value) {
    return
  }

  if (!authStore.isAuthenticated) {
    await redirectToLogin(itemId)
    return
  }

  try {
    const result = await cartStore.addToCart(itemId, 1)

    if (result?.success) {
      sessionStorage.removeItem('pendingBuyItemId')

      toast.success('Item added to cart!')

      await router.push({
        name: 'CartPage',
      })

      return
    }

    if (result?.isUnauthorized) {
      await redirectToLogin(itemId)
      return
    }

    toast.error(result?.message || 'Failed to add item to cart')
  } catch (error) {
    console.error('Failed to buy item:', error)

    toast.error('Failed to add item to cart')
  }
}

const inspectItem = async () => {
  const itemId = props.item?.id

  if (!itemId) {
    return
  }

  await router.push({
    name: 'ProductDetailsPage',
    params: {
      productId: itemId,
    },
  })
}
</script>

<template>
  <section v-if="item" id="weekly-drops" class="drop home-anchor">
    <div class="drop__inner _cnt">
      <div class="drop__card">
        <div class="drop__visual">
          <div class="drop__image">
            <img
              v-if="imageUrl"
              class="drop__image-shadow"
              :src="imageUrl"
              alt=""
              aria-hidden="true"
            />

            <img
              v-if="imageUrl"
              class="drop__image-main"
              :src="imageUrl"
              :alt="item.title"
            />
          </div>
        </div>

        <div class="drop__content">
          <div class="drop__label">
            {{ $t('Drop of the week') }}
          </div>

          <h2 class="drop__title">
            {{ item.title }}
          </h2>

          <div v-if="description" class="drop__description">
            {{ description }}
          </div>

          <div v-if="details.length" class="drop__details">
            <div v-for="detail in details" :key="detail" class="drop__detail">
              {{ $t(detail) }}
            </div>
          </div>

          <div class="drop__bottom">
            <div class="drop__prices">
              <PriceFormatter
                v-if="hasOldPrice"
                class="drop__old-price"
                :price="item.old_price"
                is-currency
                skip-conversion
                is-old
                :is-bold="false"
                size="ibm-13"
              />

              <PriceFormatter
                class="drop__price"
                :price="item.price"
                is-currency
                skip-conversion
                :is-bold="false"
                size="sg-42"
              />
            </div>

            <div class="drop__actions">
              <BaseButton
                class="drop__button"
                :disabled="buying"
                @click="buyNow"
              >
                {{ $t('Buy now') }}
              </BaseButton>

              <BaseButton
                class="drop__button drop__button_inspect"
                variant="bordered"
                @click="inspectItem"
              >
                {{ $t('Inspect item') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.drop {
  @include adaptiveValue('padding-top', 120, 25);
  @include adaptiveValue('padding-bottom', 60, 25);
  @media (max-width: $md4) {
    margin-left: -10px;
    margin-right: -10px;
  }

  &__card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);

    @include adaptiveValue('gap', 60, 25);
    @include adaptiveValue('padding', 36, 15);
    @include adaptiveValue('border-radius', 38, 20);

    background-color: var(--double-spanish-white);
  }

  &__visual {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;

    @include adaptiveValue('min-height', 360, 200);
    @include adaptiveValue('border-radius', 38, 20);

    overflow: hidden;
    background: #d9a46f;
  }

  &__image {
    position: relative;

    width: 90%;
    height: 90%;
  }

  &__image-main {
    position: absolute;
    z-index: 2;

    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: contain;

    pointer-events: none;
  }

  &__image-shadow {
    position: absolute;
    z-index: 1;

    left: 8%;
    bottom: 1%;

    width: 84%;
    height: 50%;

    object-fit: contain;

    transform: perspective(220px) rotateX(70deg) scaleY(0.28);
    transform-origin: bottom center;

    filter: brightness(0) blur(12px);

    opacity: 0.22;

    pointer-events: none;
  }

  &__content {
    display: flex;
    align-self: center;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
  }

  &__label {
    @include ibm-12-700;

    text-transform: uppercase;
    letter-spacing: 0.96px;

    color: var(--rope);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 11, 9);
    }
  }

  &__title {
    @include sg-42-700;
    color: var(--cod-gray);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__description {
    max-width: 370px;
    @include ibm-15-400;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 17, 15);
    }
  }

  &__details {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__detail {
    padding: 7px 14px;

    border-radius: 999px;

    background-color: var(--merino);

    @include ibm-12-700;

    color: var(--armadillo);
  }

  &__bottom {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('gap', 20, 18);
  }

  &__prices {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 6px;
  }

  &__old-price {
    color: var(--makara);

    :deep(.price__currency),
    :deep(.price__value) {
      font-weight: 400;
    }
  }

  &__price {
    color: var(--cod-gray);
  }

  &__actions {
    display: flex;

    @include adaptiveValue('gap', 32, 10, 1296, 992, 1);
  }

  &__button {
    min-width: 117px;

    white-space: nowrap;
    @include adaptiveValue('min-height', 48, 40);

    &_inspect {
      min-width: 160px;
    }
  }
}

@media (max-width: $md2) {
  .drop {
    &__card {
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    }
  }
}

@media (max-width: $md3) {
  .drop {
    &__card {
      grid-template-columns: 1fr;
    }

    &__content {
      padding: 5px;
    }
  }
}

@media (max-width: $md5) {
  .drop {
    &__bottom {
      align-items: stretch;
      flex-direction: column;
    }

    &__actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }

    &__button {
      width: 100%;
    }
  }
}
</style>
