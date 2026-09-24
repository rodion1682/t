<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useGame } from '@/composables/useGame'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },

  heroItems: {
    type: Array,
    default: () => [],
  },

  totalItems: {
    type: Number,
    default: 0,
  },

  categoryCount: {
    type: Number,
    default: 0,
  },
})

const router = useRouter()
const { t } = useI18n()
const { marketRoute } = useGame()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const AUTOPLAY_DELAY = 2600
const DRAG_THRESHOLD = 45

const search = ref('')

const activeIndex = ref(props.heroItems.length > 1 ? 1 : 0)

const direction = ref(1)

const isPaused = ref(false)
const isDragging = ref(false)

const dragStartX = ref(0)
const dragCurrentX = ref(0)

let autoplayTimer = null

const popularItems = [
  {
    label: t('AWP'),
    query: {
      search: 'awp',
    },
  },
  {
    label: t('Karambit'),
    query: {
      search: 'karambit',
    },
  },
  {
    label: t('Fade'),
    query: {
      search: 'fade',
    },
  },
  {
    label: t('Under €50'),
    query: {
      price_till: 50,
    },
  },
]

const dragOffset = computed(() => {
  if (!isDragging.value) {
    return 0
  }

  return dragCurrentX.value - dragStartX.value
})

const formatNumber = value => {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

const getImageUrl = item => {
  if (!item?.img_url) {
    return ''
  }

  if (/^https?:\/\//i.test(item.img_url)) {
    return item.img_url
  }

  return `${VITE_STATIC_DOMAIN}${item.img_url}`
}

const submitSearch = () => {
  const value = search.value.trim()

  if (!value) {
    return
  }

  router.push({
    ...marketRoute.value,

    query: {
      category: 'cs2',
      search: value,
    },
  })
}

const openPopular = item => {
  router.push({
    ...marketRoute.value,

    query: {
      category: 'cs2',
      ...item.query,
    },
  })
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
  })
}

const getOffset = index => {
  return index - activeIndex.value
}

const getProductStyle = index => {
  const offset = getOffset(index)
  const distance = Math.abs(offset)

  let translate = 0
  let scale = 0.62
  let opacity = 0
  let zIndex = 0

  if (offset === 0) {
    translate = 0
    scale = 1
    opacity = 1
    zIndex = 3
  } else if (offset === -1) {
    translate = -92
    scale = 0.69
    opacity = 0.65
    zIndex = 2
  } else if (offset === 1) {
    translate = 92
    scale = 0.69
    opacity = 0.65
    zIndex = 2
  } else {
    translate = offset < 0 ? -145 : 145

    scale = 0.62
    opacity = 0
    zIndex = 1
  }

  let dragTranslate = 0

  if (isDragging.value) {
    dragTranslate = dragOffset.value / 4
  }

  return {
    transform: `
      translateX(
        calc(
          -50% +
          ${translate}% +
          ${dragTranslate}px
        )
      )
      scale(${scale})
    `,

    opacity,

    zIndex,

    pointerEvents: distance <= 1 ? 'auto' : 'none',

    transition: isDragging.value
      ? 'none'
      : `
          transform 900ms
            cubic-bezier(.45,.05,.25,1),
          opacity 900ms
            cubic-bezier(.45,.05,.25,1),
          box-shadow 900ms
            cubic-bezier(.45,.05,.25,1)
        `,
  }
}

const goNext = () => {
  const lastIndex = props.heroItems.length - 1

  if (lastIndex <= 0) {
    return
  }

  if (activeIndex.value >= lastIndex) {
    direction.value = -1

    activeIndex.value = Math.max(0, activeIndex.value - 1)

    return
  }

  activeIndex.value += 1
}

const goPrevious = () => {
  if (props.heroItems.length <= 1) {
    return
  }

  if (activeIndex.value <= 0) {
    direction.value = 1

    activeIndex.value = Math.min(
      props.heroItems.length - 1,
      activeIndex.value + 1,
    )

    return
  }

  activeIndex.value -= 1
}

const autoplayStep = () => {
  if (isPaused.value || isDragging.value || props.heroItems.length <= 1) {
    return
  }

  if (direction.value === 1) {
    goNext()
  } else {
    goPrevious()
  }
}

const stopAutoplay = () => {
  if (!autoplayTimer) {
    return
  }

  window.clearInterval(autoplayTimer)

  autoplayTimer = null
}

const startAutoplay = () => {
  stopAutoplay()

  if (props.heroItems.length <= 1) {
    return
  }

  autoplayTimer = window.setInterval(autoplayStep, AUTOPLAY_DELAY)
}

const restartAutoplay = () => {
  stopAutoplay()
  startAutoplay()
}

const pauseCarousel = () => {
  isPaused.value = true
}

const resumeCarousel = () => {
  isPaused.value = false
}

const selectSlide = index => {
  if (isDragging.value) {
    return
  }

  const offset = getOffset(index)

  if (offset === -1) {
    direction.value = -1
    activeIndex.value = index

    restartAutoplay()

    return
  }

  if (offset === 1) {
    direction.value = 1
    activeIndex.value = index

    restartAutoplay()

    return
  }

  if (offset === 0) {
    openProduct(props.heroItems[index])
  }
}

const onPointerDown = event => {
  if (props.heroItems.length <= 1) {
    return
  }

  isDragging.value = true
  isPaused.value = true

  dragStartX.value = event.clientX

  dragCurrentX.value = event.clientX

  event.currentTarget.setPointerCapture?.(event.pointerId)
}

const onPointerMove = event => {
  if (!isDragging.value) {
    return
  }

  dragCurrentX.value = event.clientX
}

const finishDrag = () => {
  if (!isDragging.value) {
    return
  }

  const distance = dragCurrentX.value - dragStartX.value

  isDragging.value = false

  dragStartX.value = 0
  dragCurrentX.value = 0

  if (Math.abs(distance) >= DRAG_THRESHOLD) {
    if (distance < 0) {
      direction.value = 1
      goNext()
    } else {
      direction.value = -1
      goPrevious()
    }
  }

  isPaused.value = false

  restartAutoplay()
}

const onPointerUp = event => {
  event.currentTarget.releasePointerCapture?.(event.pointerId)

  finishDrag()
}

const onPointerCancel = () => {
  finishDrag()
}

watch(
  () => props.heroItems,
  items => {
    if (!items.length) {
      activeIndex.value = 0
      direction.value = 1

      stopAutoplay()

      return
    }

    activeIndex.value = items.length > 1 ? 1 : 0

    direction.value = 1

    startAutoplay()
  },
  {
    deep: false,
  },
)

onMounted(() => {
  activeIndex.value = props.heroItems.length > 1 ? 1 : 0

  direction.value = 1

  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<template>
  <section class="hero">
    <div class="hero__bg-top"></div>

    <div class="hero__bg-right"></div>

    <div class="hero__inner _cnt">
      <div class="hero__top top">
        <div class="top__label">
          {{ $t('Counter-Strike 2 skin market') }}
        </div>

        <div class="top__title _h1">
          <div>
            {{ $t('Trade CS2 skins in') }}
          </div>

          <div>
            {{ $t('the open') }}
          </div>
        </div>

        <div class="top__text">
          {{
            $t(
              'Live prices and the full history of every item. Float, pattern and the last five sales sit on the card — before you buy, not after.',
            )
          }}
        </div>
      </div>

      <div class="hero__body body">
        <BaseInput
          v-model="search"
          class="body__search"
          :placeholder="$t('Search AK-47, Karambit, Fade...')"
          @enter="submitSearch"
        >
          <template #prefix>
            <SvgIcon :icon="SearchIcon" class="body__search-icon" />
          </template>

          <template #suffix>
            <BaseButton class="body__search-button" @click="submitSearch">
              {{ $t('Search') }}
            </BaseButton>
          </template>
        </BaseInput>

        <div class="body__categories">
          <div class="body__label">
            {{ $t('Popular:') }}
          </div>

          <div class="body__items">
            <button
              v-for="item in popularItems"
              :key="item.label"
              type="button"
              class="body__item"
              @click="openPopular(item)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div
          v-if="heroItems.length"
          class="body__products"
          :class="{
            body__products_dragging: isDragging,
          }"
          @mouseenter="pauseCarousel"
          @mouseleave="resumeCarousel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
          <div class="body__products-track">
            <button
              v-for="(item, index) in heroItems"
              :key="item.id"
              type="button"
              class="body__product"
              :class="{
                body__product_active: index === activeIndex,

                body__product_side: Math.abs(getOffset(index)) === 1,
              }"
              :style="getProductStyle(index)"
              @click="selectSlide(index)"
            >
              <div class="body__product-image">
                <img
                  class="body__product-shadow"
                  :src="getImageUrl(item)"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />

                <img
                  class="body__product-img"
                  :src="getImageUrl(item)"
                  :alt="item.title"
                  draggable="false"
                />
              </div>
            </button>
          </div>
        </div>

        <div class="body__stats">
          <div class="body__stat">
            <strong>
              {{ formatNumber(totalItems) }}
            </strong>

            <span>
              {{ $t('items live') }}
            </span>
          </div>

          <div class="body__stat">
            <strong>
              {{ categoryCount }}
            </strong>

            <span>
              {{ $t('categories') }}
            </span>
          </div>

          <div class="body__stat">
            <strong> 100% </strong>

            <span>
              {{ $t('checked by hand') }}
            </span>
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

.hero {
  @include header-indent;

  position: relative;

  max-width: 1440px;

  overflow: visible;

  margin: 0 auto;

  @include adaptiveValue('padding-bottom', 60, 25);

  @include adaptiveValue('padding-top', 60, 25);

  &__bg-top {
    position: absolute;

    top: -260px;
    left: 50%;

    width: 1100px;
    height: 640px;

    margin-left: -550px;

    border-radius: 50%;

    background: radial-gradient(
      closest-side,
      var(--chrome-white),
      transparent 72%
    );

    opacity: 0.75;

    pointer-events: none;
  }

  &__bg-right {
    position: absolute;

    top: 340px;
    right: -200px;

    width: 560px;
    height: 560px;

    border-radius: 50%;

    background: radial-gradient(
      closest-side,
      var(--other-color-1),
      transparent 70%
    );

    opacity: 0.8;

    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }
}

.top {
  text-align: center;

  &__label {
    position: relative;

    width: fit-content;

    margin-left: auto;
    margin-right: auto;

    padding-left: 17px;

    @include ibm-12-700;

    &:not(:last-child) {
      margin-bottom: 17px;
    }

    &::before {
      content: '';

      position: absolute;

      top: 50%;
      left: 0;

      width: 6px;
      height: 6px;

      transform: translate(0, -50%);

      border-radius: 50%;

      background-color: var(--limed-ash);
    }
  }

  &__title {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__text {
    max-width: 550px;

    margin: 0 auto;
  }
}

.body {
  &__search {
    max-width: 640px;

    margin-left: auto;
    margin-right: auto;

    &:not(:last-child) {
      margin-bottom: 16px;
    }

    :deep(.base-input) {
      @include adaptiveValue('min-height', 58, 50);
    }

    :deep(.base-input__suffix) {
      @include adaptiveValue('right', 11, 3);
    }

    :deep(.base-input__control) {
      padding-right: 110px;
    }

    :deep(.base-input__placeholder) {
      max-width: calc(100% - 150px);
    }

    &-icon {
      min-width: 16px;
      height: 16px;

      color: var(--zorba);
    }

    &-button {
      max-width: 100px;
      width: 100%;
    }
  }

  &__categories {
    display: flex;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__label {
    @include ibm-13-700;

    font-weight: 400;

    color: var(--makara);
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    width: fit-content;

    padding: 0 6px;

    background-color: transparent;

    @include ibm-13-700;

    font-weight: 600;

    color: var(--cod-gray);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--rope);
      }
    }
  }

  &__products {
    position: relative;

    width: 100%;
    max-width: 1000px;

    margin-left: auto;
    margin-right: auto;

    overflow: visible;

    cursor: grab;

    touch-action: pan-y;

    user-select: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }

    &_dragging {
      cursor: grabbing;
    }

    &-track {
      position: relative;

      width: 100%;

      height: clamp(220px, 26vw, 360px);

      overflow: visible;
    }
  }

  &__product {
    position: absolute;

    top: 0;
    left: 50%;

    width: clamp(220px, 26vw, 360px);

    height: clamp(220px, 26vw, 360px);

    padding: clamp(15px, 2.1vw, 30px);

    overflow: hidden;

    border: 0;

    border-radius: clamp(20px, 2vw, 28px);

    background: #d8b978;

    transform-origin: center;

    will-change: transform, opacity;

    &_active {
      background: #e8b978;

      box-shadow: 0 12px 32px var(--cod-gray-16);

      cursor: pointer;

      .body__product-image {
        max-width: 234px;
      }

      .body__product-shadow {
        bottom: 7%;
      }
    }

    &_side {
      cursor: pointer;

      box-shadow: 0 1px 2px var(--cod-gray-16);

      @media (any-hover: hover) {
        &:hover {
          opacity: 0.82 !important;
        }
      }
    }

    &-image {
      position: relative;

      width: 100%;
      max-width: 188px;

      aspect-ratio: 1;

      margin: 0 auto;

      transition: max-width 900ms cubic-bezier(0.45, 0.05, 0.25, 1);
    }

    &-img {
      position: absolute;
      z-index: 2;

      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: contain;

      pointer-events: none;
    }

    &-shadow {
      position: absolute;
      z-index: 1;

      left: 10%;
      bottom: 4%;

      width: 80%;
      height: 35%;

      object-fit: contain;

      transform: scaleY(0.18);

      transform-origin: bottom center;

      filter: brightness(0) blur(10px);

      opacity: 0.35;

      pointer-events: none;

      transition: bottom 900ms cubic-bezier(0.45, 0.05, 0.25, 1);
    }
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    @include adaptiveValue('gap', 12, 10);
  }

  &__stat {
    display: flex;
    align-items: center;

    gap: 10px;

    border-radius: 999px;

    background-color: var(--double-spanish-white);

    @include adaptiveValue('padding-top', 10.5, 8);

    @include adaptiveValue('padding-bottom', 10.5, 8);

    @include adaptiveValue('padding-left', 22, 10);

    @include adaptiveValue('padding-right', 22, 10);

    @media (max-width: $md3) {
      border-radius: 20px;
    }

    strong {
      @include sg-20-700;

      color: var(--kelp);
    }

    span {
      @include ibm-13-700;

      font-weight: 400;

      color: var(--soya-bean);
    }
  }
}
</style>
