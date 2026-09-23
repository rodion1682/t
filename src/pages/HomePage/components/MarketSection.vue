<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const filters = [
  {
    key: 'all',
    label: 'All',
  },
  {
    key: 'rifle',
    label: 'Rifles',
    type: 'rifle',
  },
  {
    key: 'knife',
    label: 'Knives',
    type: 'knife',
  },
  {
    key: 'sniper',
    label: 'Snipers',
    type: 'sniper rifle',
  },
  {
    key: 'pistol',
    label: 'Pistols',
    type: 'pistol',
  },
  {
    key: 'under-50',
    label: 'Under €50',
    maxPrice: 50,
  },
]

const activeFilter = ref('all')

const activeFilterData = computed(() => {
  return filters.find(filter => filter.key === activeFilter.value) || filters[0]
})

const filteredItems = computed(() => {
  const filter = activeFilterData.value

  if (filter.key === 'all') {
    return props.items
  }

  if (filter.type) {
    return props.items.filter(item => {
      return (
        String(item?.type || '')
          .trim()
          .toLowerCase() === filter.type.toLowerCase()
      )
    })
  }

  if (filter.maxPrice !== undefined) {
    return props.items.filter(item => {
      const price = Number(item?.fiat_price ?? item?.price)

      return Number.isFinite(price) && price <= filter.maxPrice
    })
  }

  return props.items
})

const shownCount = computed(() => {
  return filteredItems.value.length
})

const totalCount = computed(() => {
  return props.items.length
})

const getImageUrl = item => {
  const url = item?.img_url_big || item?.img_url

  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `${VITE_STATIC_DOMAIN}${url}`
}

const getPrice = item => {
  return item?.fiat_price ?? item?.price
}

const getOldPrice = item => {
  return item?.old_fiat_price ?? item?.old_price
}

const hasOldPrice = item => {
  const price = Number(getPrice(item))
  const oldPrice = Number(getOldPrice(item))

  return Number.isFinite(price) && Number.isFinite(oldPrice) && oldPrice > price
}

const cleanTitle = value => {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

const formatText = value => {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const setFilter = filter => {
  if (!filter?.key) {
    return
  }

  activeFilter.value = filter.key
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
</script>

<template>
  <section class="market">
    <div class="market__inner _cnt">
      <div class="market__head">
        <div class="market__label">
          {{ $t('The market') }}
        </div>

        <h2 class="market__title">
          {{ $t('Trending in the last 24 hours') }}
        </h2>

        <div class="market__shown">
          {{ shownCount }} {{ $t('of') }} {{ totalCount }} {{ $t('shown') }}
        </div>
      </div>

      <div class="market__filters">
        <BaseButton
          v-for="filter in filters"
          :key="filter.key"
          type="button"
          :variant="activeFilter === filter.key ? 'primary' : 'bordered'"
          class="market__filter"
          :class="{
            market__filter_active: activeFilter === filter.key,
          }"
          @click="setFilter(filter)"
        >
          {{ $t(filter.label) }}
        </BaseButton>
      </div>

      <div v-if="filteredItems.length" class="market__grid">
        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="market__card"
          @click="openProduct(item)"
        >
          <div class="market__visual">
            <div class="market__image">
              <img
                v-if="getImageUrl(item)"
                class="market__image-shadow"
                :src="getImageUrl(item)"
                alt=""
                aria-hidden="true"
              />

              <img
                v-if="getImageUrl(item)"
                class="market__image-main"
                :src="getImageUrl(item)"
                :alt="cleanTitle(item.title)"
              />
            </div>
          </div>

          <div class="market__content">
            <div class="market__meta">
              <span class="market__quality">
                {{ formatText(item.exterior || item.quality || item.type) }}
              </span>
            </div>

            <h3 class="market__name">
              {{ cleanTitle(item.title) }}
            </h3>

            <div class="market__bottom">
              <div class="market__prices">
                <PriceFormatter
                  v-if="hasOldPrice(item)"
                  class="market__old-price"
                  :price="getOldPrice(item)"
                  raw-fiat
                  skip-conversion
                  is-old
                  :currency-code="item.fiat_currency"
                  :is-bold="false"
                  size="imb-13"
                />

                <PriceFormatter
                  class="market__price"
                  :price="getPrice(item)"
                  raw-fiat
                  skip-conversion
                  :currency-code="item.fiat_currency"
                  :is-bold="false"
                  size="sg-20"
                />
              </div>

              <BaseButton class="market__buy" @click.stop="openProduct(item)">
                {{ $t('Buy') }}
              </BaseButton>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="market__empty">
        <div class="market__empty-title">
          {{ $t('No trending items found for this category') }}
        </div>

        <div class="market__empty-text">
          {{ $t('Try another category to see available items.') }}
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

.market {
  @include adaptiveValue('padding-top', 60, 25);
  @include adaptiveValue('padding-bottom', 90, 50);

  &__head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
  }

  &__label {
    @include ibm-12-700;
    text-transform: uppercase;
    letter-spacing: 0.96px;

    color: var(--hemlock);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 9, 5);
    }
  }

  &__title {
    @include sg-40-700;
    color: var(--cod-gray);
  }

  &__shown {
    padding: 8px 13px;

    border-radius: 999px;

    background-color: var(--feta);

    @include ibm-13-700;

    color: var(--kelp);
  }

  &__filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    gap: 8px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__filter {
    width: fit-content;
    @media (max-width: $md6) {
      flex: 0 1 calc(33.333% - 6px);
    }
    &_active {
      pointer-events: none;
    }

    @media (any-hover: hover) {
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 4);
    @media (max-width: $md5) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__card {
    min-width: 0;

    overflow: hidden;

    @include adaptiveValue('border-radius', 28, 20);

    background-color: var(--double-spanish-white);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    @media (any-hover: hover) {
      &:hover {
        transform: translateY(-4px);

        box-shadow: 0 15px 35px var(--cod-gray-07);
      }
    }
  }

  &__visual {
    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('height', 170, 140);

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

    left: 10%;
    bottom: -2%;

    width: 80%;
    height: 45%;

    object-fit: contain;

    transform: perspective(220px) rotateX(72deg) scaleY(0.3);

    transform-origin: bottom center;

    filter: brightness(0) blur(10px);

    opacity: 0.18;

    pointer-events: none;
  }

  &__content {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('padding', 18, 10);
    background-color: var(--double-spanish-whit);
  }

  &__meta {
    @include ibm-12-700;
    font-weight: 400;
    color: var(--makara);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 6);
    }
  }

  &__quality {
    display: block;

    overflow: hidden;

    font-size: 11px;
    line-height: 130%;

    white-space: nowrap;
    text-overflow: ellipsis;

    color: var(--makara);
  }

  &__name {
    overflow: hidden;
    white-space: nowrap;
    min-width: 0;
    text-overflow: ellipsis;

    font-family: var(--font-space-grotesk);
    font-weight: 700;
    @include adaptiveValue('font-size', 17, 14);
    @include adaptiveValue('line-height', 21, 16);

    color: var(--cod-gray);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 8);
    }
  }

  &__bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;

    gap: 10px;

    margin-top: auto;
  }

  &__prices {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__old-price {
    color: var(--makara);
  }

  &__price {
    color: var(--cod-gray);
  }

  &__buy {
    @media (min-width: $md6) {
      flex: 0 0 auto;
      width: fit-content;
      min-width: 62px;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-height', 280, 80);

    @include adaptiveValue('padding', 30, 10);

    @include adaptiveValue('border-radius', 28, 20);

    background-color: var(--merino);

    text-align: center;
  }

  &__empty-title {
    margin-bottom: 8px;

    font-size: 18px;
    line-height: 130%;
    font-weight: 700;

    color: var(--cod-gray);
  }

  &__empty-text {
    font-size: 14px;
    line-height: 150%;

    color: var(--makara);
  }
}

@media (max-width: 1199.98px) {
  .market {
    &__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}

@media (max-width: $md2) {
  .market {
    &__grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}

@media (max-width: $md3) {
  .market {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
