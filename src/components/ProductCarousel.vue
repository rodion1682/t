<template>
  <section
    v-if="products?.length"
    class="mb-[100px] flex w-full justify-center px-4 lg:mt-[-126px]"
  >
    <div class="relative mx-auto w-full max-w-[1250px] overflow-hidden">
      <img
        src="@/assets/images/gradient_text.svg"
        class="pointer-events-none absolute left-1/2 top-0 h-[160px] w-full -translate-x-1/2 select-none px-7"
      />

      <header
        v-if="title"
        class="relative mb-[62px] flex flex-col items-center text-center"
      >
        <h2
          class="relative z-10 font-secondary text-[24px] font-normal md:text-[42px]"
        >
          {{ title }}
        </h2>
      </header>

      <Swiper
        :modules="[FreeMode, Pagination]"
        :slides-per-view="6"
        :space-between="4"
        :pagination="{ clickable: true }"
        :breakpoints="{
          320: { slidesPerView: 1, spaceBetween: 4 },
          640: { slidesPerView: 2, spaceBetween: 4 },
          768: { slidesPerView: 3, spaceBetween: 4 },
          1024: { slidesPerView: 4, spaceBetween: 4 },
          1280: { slidesPerView: 6, spaceBetween: 4 },
        }"
        :observer="true"
        :observe-parents="true"
        class="product-carousel"
      >
        <SwiperSlide
          v-for="item in products"
          :key="item.id"
          class="flex justify-center"
        >
          <div class="w-[205px]">
            <ProductCard :product="item" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import 'swiper/css'
import 'swiper/css/pagination'
import { FreeMode, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed } from 'vue'

import ProductCard from './ProductCard.vue'

defineProps<{
  products: any[]
  title?: string
  description?: string
  isNew?: boolean
  isSale?: boolean
}>()

const { width } = useWindowSize()
const centerOnMobile = computed(() => width.value < 768)
</script>

<style scoped>
.product-carousel {
  @apply pb-[54px];
}

.product-carousel :deep(.swiper-wrapper) {
  display: flex;
  align-items: stretch;
}

.product-carousel :deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.product-carousel :deep(.swiper-pagination) {
  @apply bottom-0;
}

.product-carousel :deep(.swiper-pagination-bullet) {
  @apply mx-[10px] h-[14px] w-[14px] bg-[#0E1118] opacity-100;
}

.product-carousel :deep(.swiper-pagination-bullet-active) {
  @apply relative bg-[#0E1118];
}

.product-carousel :deep(.swiper-pagination-bullet-active::after) {
  content: '';
  @apply absolute left-1/2 top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#577CF4];
}
</style>
