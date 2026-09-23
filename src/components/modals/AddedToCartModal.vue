<template>
  <BaseModal :show="show" @close="handleClose" wrapper-classes="added__wrap">
    <div class="added">
      <div class="added__top">
        <div class="added__icon">
          <SvgIcon :icon="CheckIcon" class="added__icon-svg" />
        </div>

        <div class="added__title _h3">
          {{ $t('Added to Cart') }}
        </div>

        <div class="added__desc _text-secondary">
          {{ $t('Item has been successfully added to your cart') }}
        </div>
      </div>

      <div v-if="product" class="added__product">
        <div class="added__image _ibg-contain">
          <img :src="productImage" :alt="product.title" />
        </div>

        <div class="added__info">
          <div class="added__name">
            {{ getTitleSecondPart(product.title) }}
          </div>

          <PriceFormatter :price="getPrice" text-classes="added__price" />
        </div>
      </div>

      <div class="added__actions">
        <BaseButton
          @click="handleContinueShopping"
          variant="secondary"
          class="added__btn added__btn_secondary"
        >
          {{ $t('Continue Shopping') }}
        </BaseButton>

        <BaseButton @click="handleGoToCart" class="added__btn">
          {{ $t('Go to Cart') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { CheckIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const props = defineProps({
  show: { type: Boolean, required: true },
  product: { type: Object, default: null },
})

const emit = defineEmits(['close', 'update:show'])
const router = useRouter()

const productImage = computed(() => {
  if (!props.product?.img_url) return
  return VITE_STATIC_DOMAIN + props.product.img_url
})

const getPrice = computed(() =>
  parseFloat(props.product?.price ?? 0).toFixed(2),
)

const getTitleSecondPart = title => {
  if (!title) return ''
  const secondPart = title.split('|')[1]?.trim() || ''
  return secondPart.replace(/\s*\(.*?\)/g, '').trim()
}

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleContinueShopping = () => handleClose()

const handleGoToCart = () => {
  handleClose()
  router.push({ name: 'CartPage' })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.added {
  text-align: center;

  &__wrap {
   max-width: 500px;
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 14, 1920);
    }
  }

  &__icon {
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('width', 64, 54, 1920);
    @include adaptiveValue('height', 64, 54, 1920);
    border-radius: 50%;
    background: rgba(9, 87, 255, 0.15);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12, 1920);
    }
  }

  &__icon-svg {
    @include adaptiveValue('width', 28, 24, 1920);
    @include adaptiveValue('height', 28, 24, 1920);
    color: #0957ff;
  }

  &__title {
    text-transform: uppercase;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 6, 1920);
    }
  }

  &__desc {
    max-width: 420px;
    margin: 0 auto;
  }

  &__product {
    display: flex;
    align-items: center;
    text-align: left;

    background: #1c212d;
    @include adaptiveValue('border-radius', 8, 8, 1920);
    @include adaptiveValue('padding', 16, 12, 1920);
    @include adaptiveValue('gap', 14, 12, 1920);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14, 1920);
    }

    @media (max-width: $md6) {
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }
  }

  &__image {
    flex: 0 0 auto;
    @include adaptiveValue('min-width', 64, 56, 1920);
    @include adaptiveValue('height', 64, 56, 1920);
  }

  &__info {
    min-width: 0;
    flex: 1 1 auto;
  }

  &__name {
    font-weight: 700;
    color: var(--primary-color);
    @include adaptiveValue('font-size', 14, 13, 1920);
    line-height: 130%;

    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 6, 4, 1920);
    }
  }

  &__price {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  &__actions {
    display: flex;
    @include adaptiveValue('gap', 10, 10, 1920);

    @media (max-width: $md6) {
      flex-direction: column;
    }
  }

  &__btn {
    flex: 1 1 auto;
    @include adaptiveValue('min-height', 46, 40, 1920);

    &_secondary {
      // your BaseButton variant="secondary" already styles it,
      // this only nudges it closer to your dark cards:
      @media (any-hover: hover) {
        &:hover {
          filter: brightness(1.05);
        }
      }
    }
  }
}
</style>
