<template>
  <section v-if="items.length" class="tranding similar-products">
    <div class="tranding__inner _cnt-home">
      <div v-if="title || text" class="tranding__top">
        <div v-if="title" class="tranding__title _h2">
          {{ title }}
        </div>
        <div v-if="text" class="tranding__text">
          {{ text }}
        </div>
      </div>

      <div class="tranding__slider">
        <BaseButton
          has-arrow
          variant="arrow"
          class="tranding__arrow tranding__arrow_prev"
          @click="swiperInstance?.slidePrev()"
        />
        <BaseButton
          has-arrow
          variant="arrow"
          class="tranding__arrow tranding__arrow_next"
          @click="swiperInstance?.slideNext()"
        />

        <Swiper
          v-if="items.length"
          :free-mode="true"
          :modules="[FreeMode, Navigation]"
          :navigation="{
            prevEl: prevEl,
            nextEl: nextEl,
          }"
          @swiper="onSwiper"
          :breakpoints="{
            320: { slidesPerView: 1.5, spaceBetween: 4 },
            439.98: { slidesPerView: 2.25, spaceBetween: 4 },
            619.98: { slidesPerView: 3, spaceBetween: 4 },
            767.98: { slidesPerView: 4, spaceBetween: 4 },
            991.82: { slidesPerView: 5, spaceBetween: 4 },
            1099.98: { slidesPerView: 6, spaceBetween: 4 },
          }"
        >
          <SwiperSlide v-for="item in items" :key="item.id">
            <ProductCard :product="item" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<script setup>
import 'swiper/css'
import 'swiper/css/navigation'
import { FreeMode, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import BaseButton from '@/components/base/BaseButton.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/product'
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  excludeId: {
    type: [String, Number],
    default: null,
  },
  game: {
    type: String,
    default: '',
  },
  hero: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  limit: {
    type: Number,
    default: 16,
  },
})

const productStore = useProductStore()
const items = ref([])

const prevEl = ref(null)
const nextEl = ref(null)
const swiperInstance = ref(null)

const normalizedExcludeId = computed(() =>
  props.excludeId == null ? null : String(props.excludeId),
)

const onSwiper = async swiper => {
  swiperInstance.value = swiper

  await nextTick()

  swiper.params.navigation.prevEl = prevEl.value
  swiper.params.navigation.nextEl = nextEl.value

  swiper.navigation.destroy()
  swiper.navigation.init()
  swiper.navigation.update()
}

async function load() {
  try {
    const data = await productStore.fetchRandomProducts({
      game: props.game,
    })

    const list = Array.isArray(data) ? data : productStore.randomProducts

    const withoutCurrent = (list || []).filter(p =>
      normalizedExcludeId.value
        ? String(p.id) !== normalizedExcludeId.value
        : true,
    )

    const byHero = props.hero
      ? withoutCurrent.filter(p => p.hero === props.hero)
      : withoutCurrent

    items.value = (byHero.length ? byHero : withoutCurrent).slice(
      0,
      props.limit,
    )

    await nextTick()

    if (swiperInstance.value) {
      swiperInstance.value.update()
      swiperInstance.value.navigation?.update()
    }
  } catch {
    items.value = []
  }
}

watch(
  () => [props.excludeId, props.game, props.hero, props.limit],
  () => load(),
  { immediate: true },
)
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.tranding {
  @include adaptiveValue('padding-bottom', 52, 0);

  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 55, 15);
    }

    @media (min-width: $md4) {
      display: flex;
      @include adaptiveValue('column-gap', 39, 20);
    }

    @media (max-width: $md4) {
      text-align: center;
    }
  }

  &__title {
    @media (min-width: $md4) {
      line-height: 1;
    }

    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }

  &__text {
    height: fit-content;
    align-self: flex-end;
  }

  &__slider {
    position: relative;
    @include adaptiveValue('padding-left', 0, 50, 1400, 1300, 1);
    @include adaptiveValue('padding-right', 0, 50, 1400, 1300, 1);

    @media (max-width: $md4) {
      padding-left: 0px;
      padding-right: 0px;
      margin-left: -10px;
      margin-right: -10px;
    }

    :deep(.swiper-slide) {
      height: auto !important;
      min-height: 100% !important;
    }
  }

  &__arrow {
    position: absolute;
    top: 50%;
    transform: translate(0px, -50%);
    z-index: 2;

    @media (max-width: $md4) {
      @include hide-item;
    }

    &_prev {
      @include adaptiveValue('left', -62, 0, 1400, 1300, 1);
      transform: translate(0px, -50%);

      :deep(.btn__arrow) {
        transform: rotate(-180deg);
      }
    }

    &_next {
      @include adaptiveValue('right', -62, 0, 1400, 1300, 1);
    }
  }
}
</style>
