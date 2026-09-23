<template>
  <section class="tranding">
    <div class="tranding__inner _cnt">
      <div class="tranding__top">
        <div class="tranding__title _h2">
          <span>{{ $t('trending') }}</span>
          {{ $t(' this week') }}
        </div>

        <div class="tranding__subtitle _h6">
          <span>//</span>
          {{ $t('live listings') }}
        </div>
      </div>

      <div class="tranding__slider">
        <Swiper
          v-if="productStore.randomProducts.length"
          :modules="[Autoplay, FreeMode]"
          :loop="true"
          :free-mode="{
            enabled: true,
            momentum: false,
          }"
          :allow-touch-move="true"
          :grab-cursor="true"
          :speed="3500"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :breakpoints="{
            320: {
              slidesPerView: 1.5,
              spaceBetween: 4,
            },
            439.98: {
              slidesPerView: 2.25,
              spaceBetween: 4,
            },
            619.98: {
              slidesPerView: 3,
              spaceBetween: 4,
            },
            767.98: {
              slidesPerView: 4,
              spaceBetween: 4,
            },
            991.82: {
              slidesPerView: 5,
              spaceBetween: 4,
            },
            1099.98: {
              slidesPerView: 6,
              spaceBetween: 20,
            },
          }"
          class="tranding__swiper"
        >
          <SwiperSlide
            v-for="(item, index) in productStore.randomProducts"
            :key="item.id"
          >
            <ProductCard
              :product="item"
              :accent-color="
                [
                  '#3F9088',
                  '#CAA327',
                  '#B5442F',
                  '#7B4C8D',
                  '#F0EAE0',
                  '#C1587B',
                ][index % 6]
              "
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<script setup>
import 'swiper/css'

import { Autoplay, FreeMode } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { onMounted, ref } from 'vue'

import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/product'

defineProps({
  title: {
    type: String,
    default: '',
  },

  text: {
    type: String,
    default: '',
  },
})

const productStore = useProductStore()

const hasFetchedRandomProducts = ref(false)

const fetchRandomProductsOnce = async () => {
  if (hasFetchedRandomProducts.value) return

  if (productStore.isLoadingRandomProducts) return

  if (productStore.randomProducts?.length) return

  hasFetchedRandomProducts.value = true

  try {
    await productStore.fetchRandomProducts()
  } catch (error) {
    hasFetchedRandomProducts.value = false

    console.error('Failed to fetch random products:', error)
  }
}

onMounted(() => {
  fetchRandomProductsOnce()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.tranding {
  @include adaptiveValue('padding-top', 160, 25);
  @include adaptiveValue('padding-bottom', 100, 25);

  &__inner {
  }

  &__top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    column-gap: 20px;
    row-gap: 15px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 15);
    }
  }

  &__title {
  }

  &__subtitle {
    color: var(--secondary-color);

    span {
      margin-right: 10px;
    }
  }

  &__slider {
    width: 100%;
    overflow: hidden;
  }

  &__swiper {
    width: 100%;

    /*
     * Makes the automatic movement linear
     * instead of easing in and out.
     */
    :deep(.swiper-wrapper) {
      align-items: stretch;

      transition-timing-function: linear !important;
    }

    /*
     * Makes every slide stretch to the
     * same height.
     */
    :deep(.swiper-slide) {
      height: auto;

      display: flex;
    }

    /*
     * ProductCard fills the full SwiperSlide.
     */
    :deep(.swiper-slide > *) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
