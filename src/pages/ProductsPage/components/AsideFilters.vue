<template>
  <aside class="aside">
    <div class="aside__head">
      <div class="aside__title">
        {{ $t('Filter') }}
      </div>

      <button
        type="button"
        class="aside__close"
        aria-label="Close filters"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <!-- PRICE -->
    <div class="aside__section">
      <div class="aside__subtitle">
        {{ $t('Price') }}
      </div>

      <div class="aside__range">
        <div class="aside__range-track">
          <div class="aside__range-fill" :style="rangeFillStyle"></div>

          <input
            v-model.number="rangeMin"
            class="aside__range-input aside__range-input_min"
            type="range"
            :min="PRICE_MIN"
            :max="PRICE_MAX"
            :step="PRICE_STEP"
            @input="handleRangeInput"
            @change="applyRange"
          />

          <input
            v-model.number="rangeMax"
            class="aside__range-input aside__range-input_max"
            type="range"
            :min="PRICE_MIN"
            :max="PRICE_MAX"
            :step="PRICE_STEP"
            @input="handleRangeInput"
            @change="applyRange"
          />
        </div>
      </div>

      <div class="aside__price-fields">
        <label class="aside__price-field">
          <span class="aside__price-label">
            {{ $t('From') }}
          </span>

          <div class="aside__price-input-wrap">
            <input
              v-model="minPrice"
              class="aside__price-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="0"
              @input="handleMinInput"
              @blur="applyPriceInputs"
              @keydown.enter.prevent="applyPriceInputs"
            />

            <span class="aside__currency">
              {{ currencySymbol }}
            </span>
          </div>
        </label>

        <label class="aside__price-field">
          <span class="aside__price-label">
            {{ $t('To') }}
          </span>

          <div class="aside__price-input-wrap">
            <input
              v-model="maxPrice"
              class="aside__price-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              :placeholder="String(PRICE_MAX)"
              @input="handleMaxInput"
              @blur="applyPriceInputs"
              @keydown.enter.prevent="applyPriceInputs"
            />

            <span class="aside__currency">
              {{ currencySymbol }}
            </span>
          </div>
        </label>
      </div>
    </div>

    <!-- EXTERIOR -->
    <div v-if="showExteriorFilter" class="aside__section">
      <div class="aside__subtitle">
        {{ $t('Exterior') }}
      </div>

      <div class="aside__options">
        <button
          type="button"
          class="aside__option"
          :class="{
            aside__option_active: !selectedExterior.length,
          }"
          @click="clearExterior"
        >
          <span class="aside__check"> ✓ </span>

          <span>
            {{ $t('All') }}
          </span>
        </button>

        <button
          v-for="option in exteriorOptions"
          :key="option.value"
          type="button"
          class="aside__option"
          :class="{
            aside__option_active: selectedExterior.includes(option.value),
          }"
          @click="toggleExterior(option.value)"
        >
          <span class="aside__check"> ✓ </span>

          <span>
            {{ decodeHtml(option.label) }}
          </span>
        </button>
      </div>
    </div>

    <!-- RARITY -->
    <div v-if="showRarityFilter" class="aside__section">
      <div class="aside__subtitle">
        {{ $t('Rarity') }}
      </div>

      <div class="aside__options">
        <button
          type="button"
          class="aside__option"
          :class="{
            aside__option_active: !safeFilters.class.length,
          }"
          @click="clearRarity"
        >
          <span class="aside__check"> ✓ </span>

          <span>
            {{ $t('All') }}
          </span>
        </button>

        <button
          v-for="option in rarityOptions"
          :key="option.value"
          type="button"
          class="aside__option"
          :class="{
            aside__option_active: safeFilters.class.includes(option.value),
          }"
          @click="toggleRarity(option.value)"
        >
          <span class="aside__check"> ✓ </span>

          <span>
            {{ decodeHtml(option.label) }}
          </span>
        </button>
      </div>
    </div>

    <button type="button" class="aside__reset" @click="handleResetFilters">
      {{ $t('Reset all filters') }}
    </button>
  </aside>
</template>

<script setup>
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useCurrencyStore } from '@/stores/currency'

const emit = defineEmits(['close'])

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },

  availableFilters: {
    type: Object,
    default: () => ({}),
  },

  currentGame: {
    type: String,
    default: 'cs2',
  },

  updateFilters: {
    type: Function,
    required: true,
  },

  resetFilters: {
    type: Function,
    required: true,
  },
})

const currencyStore = useCurrencyStore()

const PRICE_MIN = 0
const PRICE_MAX = 100000
const PRICE_STEP = 1

const minPrice = ref('')
const maxPrice = ref('')

const rangeMin = ref(PRICE_MIN)
const rangeMax = ref(PRICE_MAX)

const currencySymbol = computed(() => {
  return currencyStore.currentCurrencySymbol || '€'
})

const safeFilters = computed(() => ({
  priceRange: props.filters?.priceRange || {
    min: null,
    max: null,
  },

  quality: Array.isArray(props.filters?.quality) ? props.filters.quality : [],

  exterior_name: Array.isArray(props.filters?.exterior_name)
    ? props.filters.exterior_name
    : [],

  class: Array.isArray(props.filters?.class) ? props.filters.class : [],
}))

const safeAvailableFilters = computed(() => ({
  qualities: Array.isArray(props.availableFilters?.qualities)
    ? props.availableFilters.qualities
    : [],

  exterior_names: Array.isArray(props.availableFilters?.exterior_names)
    ? props.availableFilters.exterior_names
    : [],

  classes: Array.isArray(props.availableFilters?.classes)
    ? props.availableFilters.classes
    : [],
}))

const normalizedCurrentGame = computed(() => {
  return String(props.currentGame || '')
    .trim()
    .toLowerCase()
})

const isCs2 = computed(() => {
  return normalizedCurrentGame.value === 'cs2'
})

const usesExteriorNames = computed(() => {
  return safeAvailableFilters.value.exterior_names.length > 0
})

const exteriorOptions = computed(() => {
  if (usesExteriorNames.value) {
    return safeAvailableFilters.value.exterior_names
  }

  return safeAvailableFilters.value.qualities
})

const exteriorFilterKey = computed(() => {
  return usesExteriorNames.value ? 'exterior_name' : 'quality'
})

const selectedExterior = computed(() => {
  return safeFilters.value[exteriorFilterKey.value] || []
})

const showExteriorFilter = computed(() => {
  return isCs2.value && exteriorOptions.value.length > 0
})

const rarityOptions = computed(() => {
  return safeAvailableFilters.value.classes
})

const showRarityFilter = computed(() => {
  return isCs2.value && rarityOptions.value.length > 0
})

const decodeHtml = value => {
  if (!value) {
    return ''
  }

  const textarea = document.createElement('textarea')

  textarea.innerHTML = String(value)

  return textarea.value
}

const sanitizeNumber = value => {
  return String(value ?? '').replace(/[^\d]/g, '')
}

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

const rangeFillStyle = computed(() => {
  const total = PRICE_MAX - PRICE_MIN

  const left = ((rangeMin.value - PRICE_MIN) / total) * 100

  const right = 100 - ((rangeMax.value - PRICE_MIN) / total) * 100

  return {
    left: `${left}%`,
    right: `${right}%`,
  }
})

const handleRangeInput = () => {
  if (rangeMin.value > rangeMax.value) {
    if (document.activeElement?.classList.contains('aside__range-input_min')) {
      rangeMin.value = rangeMax.value
    } else {
      rangeMax.value = rangeMin.value
    }
  }

  minPrice.value = rangeMin.value > PRICE_MIN ? String(rangeMin.value) : ''

  maxPrice.value = rangeMax.value < PRICE_MAX ? String(rangeMax.value) : ''
}

const applyRange = async () => {
  await props.updateFilters({
    priceRange: {
      min: rangeMin.value > PRICE_MIN ? rangeMin.value : null,

      max: rangeMax.value < PRICE_MAX ? rangeMax.value : null,
    },

    page: 1,
  })
}

const handleMinInput = event => {
  minPrice.value = sanitizeNumber(event.target.value)
}

const handleMaxInput = event => {
  maxPrice.value = sanitizeNumber(event.target.value)
}

const debouncedPriceUpdate = debounce(async () => {
  let min = minPrice.value !== '' ? Number(minPrice.value) : null

  let max = maxPrice.value !== '' ? Number(maxPrice.value) : null

  if (min !== null) {
    min = clamp(min, PRICE_MIN, PRICE_MAX)
  }

  if (max !== null) {
    max = clamp(max, PRICE_MIN, PRICE_MAX)
  }

  if (min !== null && max !== null && min > max) {
    const temp = min

    min = max
    max = temp
  }

  minPrice.value = min !== null ? String(min) : ''

  maxPrice.value = max !== null ? String(max) : ''

  rangeMin.value = min ?? PRICE_MIN

  rangeMax.value = max ?? PRICE_MAX

  await props.updateFilters({
    priceRange: {
      min,
      max,
    },

    page: 1,
  })
}, 300)

const applyPriceInputs = () => {
  debouncedPriceUpdate()
}

const toggleExterior = async value => {
  const current = [...selectedExterior.value]

  const index = current.indexOf(value)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  await props.updateFilters({
    [exteriorFilterKey.value]: current,

    page: 1,
  })
}

const clearExterior = async () => {
  await props.updateFilters({
    quality: [],
    exterior_name: [],
    page: 1,
  })
}

const toggleRarity = async value => {
  const current = [...safeFilters.value.class]

  const index = current.indexOf(value)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  await props.updateFilters({
    class: current,
    page: 1,
  })
}

const clearRarity = async () => {
  await props.updateFilters({
    class: [],
    page: 1,
  })
}

const handleResetFilters = async () => {
  debouncedPriceUpdate.cancel()

  minPrice.value = ''
  maxPrice.value = ''

  rangeMin.value = PRICE_MIN

  rangeMax.value = PRICE_MAX

  await props.resetFilters()
}

watch(
  () => safeFilters.value.priceRange,
  value => {
    const min = value?.min != null ? Number(value.min) : null

    const max = value?.max != null ? Number(value.max) : null

    minPrice.value = min !== null ? String(min) : ''

    maxPrice.value = max !== null ? String(max) : ''

    rangeMin.value = min !== null ? clamp(min, PRICE_MIN, PRICE_MAX) : PRICE_MIN

    rangeMax.value = max !== null ? clamp(max, PRICE_MIN, PRICE_MAX) : PRICE_MAX
  },
  {
    deep: true,
    immediate: true,
  },
)

onBeforeUnmount(() => {
  debouncedPriceUpdate.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.aside {
  width: 100%;

  @include adaptiveValue('padding', 24, 18);

  border-radius: 28px;

  background: var(--double-spanish-white);

  color: var(--cod-gray);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 15px;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__title {
    @include ibm-12-700;

    text-transform: uppercase;
    letter-spacing: 0.08em;

    color: var(--kelp);
  }

  &__close {
    display: none;

    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;

    padding: 0;

    border: 1px solid var(--cod-gray-07);

    border-radius: 50%;

    background: var(--merino);

    font-size: 24px;
    line-height: 1;

    color: var(--cod-gray);

    cursor: pointer;
  }

  &__section {
    padding-bottom: 22px;

    border-bottom: 1px solid var(--cod-gray-07);

    &:not(:first-of-type) {
      padding-top: 20px;
    }

    &:last-of-type {
      margin-bottom: 18px;
    }
  }

  &__subtitle {
    margin-bottom: 16px;

    @include ibm-12-700;

    text-transform: uppercase;
    letter-spacing: 0.08em;

    color: var(--makara);
  }

  // =========================
  // PRICE RANGE
  // =========================

  &__range {
    padding: 4px 8px 0;

    margin-bottom: 20px;
  }

  &__range-track {
    position: relative;

    height: 20px;
  }

  &__range-track::before {
    content: '';

    position: absolute;

    top: 50%;
    left: 0;
    right: 0;

    height: 2px;

    transform: translateY(-50%);

    border-radius: 999px;

    background: var(--makara);
  }

  &__range-fill {
    position: absolute;

    z-index: 1;

    top: 50%;

    height: 2px;

    transform: translateY(-50%);

    border-radius: 999px;

    background: var(--kelp);

    pointer-events: none;
  }

  &__range-input {
    position: absolute;

    z-index: 2;

    top: 0;
    left: 0;

    width: 100%;
    height: 20px;

    margin: 0;

    appearance: none;
    -webkit-appearance: none;

    background: transparent;

    pointer-events: none;

    &::-webkit-slider-runnable-track {
      height: 2px;

      background: transparent;
    }

    &::-moz-range-track {
      height: 2px;

      background: transparent;
    }

    &::-webkit-slider-thumb {
      width: 17px;
      height: 17px;

      margin-top: -7.5px;

      appearance: none;
      -webkit-appearance: none;

      border: 2px solid var(--merino);

      border-radius: 50%;

      background: var(--copper);

      box-shadow: 0 0 0 1px var(--copper);

      cursor: grab;

      pointer-events: auto;
    }

    &::-moz-range-thumb {
      width: 17px;
      height: 17px;

      border: 2px solid var(--merino);

      border-radius: 50%;

      background: var(--copper);

      box-shadow: 0 0 0 1px var(--copper);

      cursor: grab;

      pointer-events: auto;
    }

    &:active {
      &::-webkit-slider-thumb {
        cursor: grabbing;
      }

      &::-moz-range-thumb {
        cursor: grabbing;
      }
    }
  }

  &__price-fields {
    display: flex;
    flex-direction: column;

    gap: 8px;
  }

  &__price-field {
    display: flex;
    align-items: center;

    min-height: 40px;

    padding: 0 14px;

    border: 1px solid var(--cod-gray-07);

    border-radius: 999px;

    background: var(--merino);

    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus-within {
      border-color: var(--copper);

      box-shadow: 0 0 0 2px var(--copper-10);
    }
  }

  &__price-label {
    flex: 0 0 auto;

    min-width: 42px;

    @include ibm-12-400;

    color: var(--zorba);
  }

  &__price-input-wrap {
    display: flex;
    align-items: center;

    flex: 1 1 auto;

    min-width: 0;
  }

  &__price-input {
    width: 100%;
    min-width: 0;

    padding: 0;

    border: 0;
    outline: 0;

    background: transparent;

    @include ibm-12-400;

    color: var(--cod-gray);

    &::placeholder {
      color: var(--zorba);
    }
  }

  &__currency {
    flex: 0 0 auto;

    margin-left: 5px;

    @include ibm-12-400;

    color: var(--zorba);
  }

  // =========================
  // OPTIONS
  // =========================

  &__options {
    display: flex;
    flex-direction: column;

    gap: 2px;
  }

  &__option {
    display: flex;
    align-items: center;

    width: 100%;
    min-height: 34px;

    gap: 9px;

    padding: 5px 0;

    border: 0;

    background: transparent;

    @include ibm-12-400;

    text-align: left;

    color: var(--cod-gray);

    cursor: pointer;

    transition: color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--copper);
      }
    }

    &_active {
      font-weight: 700;

      color: var(--cod-gray);

      .aside__check {
        opacity: 1;
      }
    }
  }

  &__check {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 12px;

    width: 12px;

    opacity: 0;

    font-size: 11px;
    font-weight: 700;

    color: var(--kelp);

    transition: opacity 0.2s ease;
  }

  // =========================
  // RESET
  // =========================

  &__reset {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 42px;

    padding: 9px 16px;

    border: 0;

    border-radius: 999px;

    background: var(--feta);

    @include ibm-12-700;

    text-transform: uppercase;

    color: var(--kelp);

    cursor: pointer;

    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      transform 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        background: var(--kelp);

        color: var(--janna);

        transform: translateY(-1px);
      }
    }
  }
}

@media (max-width: $md3) {
  .aside {
    min-height: 100%;

    padding: 22px 20px 30px;

    border-radius: 0 24px 24px 0;

    box-shadow: 14px 0 40px var(--cod-gray-16);

    &__head {
      position: sticky;

      z-index: 5;

      top: 0;

      padding-bottom: 14px;

      background: var(--double-spanish-white);
    }

    &__title {
      font-size: 14px;
    }

    &__close {
      display: flex;
    }

    &__section {
      padding-bottom: 24px;

      &:not(:first-of-type) {
        padding-top: 22px;
      }
    }

    &__price-field {
      min-height: 44px;
    }

    &__option {
      min-height: 40px;

      font-size: 13px;
    }

    &__reset {
      min-height: 46px;

      margin-top: 4px;
    }
  }
}
</style>
