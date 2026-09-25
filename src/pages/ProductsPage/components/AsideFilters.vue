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
            @change="applyRangeImmediately"
          />

          <input
            v-model.number="rangeMax"
            class="aside__range-input aside__range-input_max"
            type="range"
            :min="PRICE_MIN"
            :max="PRICE_MAX"
            :step="PRICE_STEP"
            @input="handleRangeInput"
            @change="applyRangeImmediately"
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
              @blur="applyPriceInputsImmediately"
              @keydown.enter.prevent="applyPriceInputsImmediately"
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
              @blur="applyPriceInputsImmediately"
              @keydown.enter.prevent="applyPriceInputsImmediately"
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
            aside__option_active: !selectedRarity.length,
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
            aside__option_active: selectedRarity.includes(option.value),
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
const PRICE_MAX = 1500
const PRICE_STEP = 1

const PRICE_DEBOUNCE = 300

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
}))

const safeAvailableFilters = computed(() => ({
  qualities: Array.isArray(props.availableFilters?.qualities)
    ? props.availableFilters.qualities
    : [],

  exterior_names: Array.isArray(props.availableFilters?.exterior_names)
    ? props.availableFilters.exterior_names
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

/*
 * EXTERIOR
 *
 * API:
 * exterior_names
 *
 * Example:
 * Battle-Scarred
 * Factory New
 * Field-Tested
 * Minimal Wear
 * Well-Worn
 */
const exteriorOptions = computed(() => {
  return safeAvailableFilters.value.exterior_names
})

const selectedExterior = computed(() => {
  return safeFilters.value.exterior_name
})

const showExteriorFilter = computed(() => {
  return isCs2.value && exteriorOptions.value.length > 0
})

/*
 * RARITY
 *
 * API:
 * qualities
 *
 * Example:
 * base grade
 * classified
 * consumer grade
 * contraband
 * covert
 * etc.
 */
const rarityOptions = computed(() => {
  return safeAvailableFilters.value.qualities
})

const selectedRarity = computed(() => {
  return safeFilters.value.quality
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

/*
 * ==================================
 * PRICE HELPERS
 * ==================================
 */

const normalizePriceValues = () => {
  let min = minPrice.value !== '' ? Number(minPrice.value) : null

  let max = maxPrice.value !== '' ? Number(maxPrice.value) : null

  if (min !== null && Number.isFinite(min)) {
    min = clamp(min, PRICE_MIN, PRICE_MAX)
  } else {
    min = null
  }

  if (max !== null && Number.isFinite(max)) {
    max = clamp(max, PRICE_MIN, PRICE_MAX)
  } else {
    max = null
  }

  /*
   * Don't swap while user is
   * typing. Clamp min against max
   * instead.
   */
  if (min !== null && max !== null && min > max) {
    min = max
  }

  return {
    min,
    max,
  }
}

const syncLocalPriceValues = (min, max) => {
  minPrice.value = min !== null ? String(min) : ''

  maxPrice.value = max !== null ? String(max) : ''

  rangeMin.value = min ?? PRICE_MIN

  rangeMax.value = max ?? PRICE_MAX
}

const updatePriceFilters = async () => {
  const { min, max } = normalizePriceValues()

  syncLocalPriceValues(min, max)

  await props.updateFilters({
    priceRange: {
      min,
      max,
    },

    page: 1,
  })
}

const debouncedPriceUpdate = debounce(updatePriceFilters, PRICE_DEBOUNCE)

/*
 * ==================================
 * PRICE TEXT INPUTS
 * ==================================
 */

const handleMinInput = event => {
  minPrice.value = sanitizeNumber(event.target.value)

  debouncedPriceUpdate()
}

const handleMaxInput = event => {
  maxPrice.value = sanitizeNumber(event.target.value)

  debouncedPriceUpdate()
}

const applyPriceInputsImmediately = async () => {
  debouncedPriceUpdate.cancel()

  await updatePriceFilters()
}

/*
 * ==================================
 * RANGE SLIDER
 * ==================================
 */

const getRangePriceValues = () => {
  const min = rangeMin.value > PRICE_MIN ? rangeMin.value : null

  const max = rangeMax.value < PRICE_MAX ? rangeMax.value : null

  return {
    min,
    max,
  }
}

const updateRangeFilters = async () => {
  const { min, max } = getRangePriceValues()

  await props.updateFilters({
    priceRange: {
      min,
      max,
    },

    page: 1,
  })
}

const debouncedRangeUpdate = debounce(updateRangeFilters, PRICE_DEBOUNCE)

const handleRangeInput = event => {
  const isMin = event.target.classList.contains('aside__range-input_min')

  if (rangeMin.value > rangeMax.value) {
    if (isMin) {
      rangeMin.value = rangeMax.value
    } else {
      rangeMax.value = rangeMin.value
    }
  }

  minPrice.value = rangeMin.value > PRICE_MIN ? String(rangeMin.value) : ''

  maxPrice.value = rangeMax.value < PRICE_MAX ? String(rangeMax.value) : ''

  /*
   * Apply automatically after
   * user stops dragging for 300ms.
   */
  debouncedRangeUpdate()
}

const applyRangeImmediately = async () => {
  debouncedRangeUpdate.cancel()

  await updateRangeFilters()
}

/*
 * ==================================
 * EXTERIOR
 * ==================================
 */

const toggleExterior = async value => {
  const current = [...selectedExterior.value]

  const index = current.indexOf(value)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  await props.updateFilters({
    exterior_name: current,

    page: 1,
  })
}

const clearExterior = async () => {
  await props.updateFilters({
    exterior_name: [],

    page: 1,
  })
}

/*
 * ==================================
 * RARITY / QUALITY
 * ==================================
 */

const toggleRarity = async value => {
  const current = [...selectedRarity.value]

  const index = current.indexOf(value)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  await props.updateFilters({
    quality: current,

    page: 1,
  })
}

const clearRarity = async () => {
  await props.updateFilters({
    quality: [],

    page: 1,
  })
}

/*
 * ==================================
 * RESET
 * ==================================
 */

const handleResetFilters = async () => {
  debouncedPriceUpdate.cancel()
  debouncedRangeUpdate.cancel()

  minPrice.value = ''
  maxPrice.value = ''

  rangeMin.value = PRICE_MIN

  rangeMax.value = PRICE_MAX

  await props.resetFilters()
}

/*
 * Keep local price controls in sync
 * with URL / external filter changes.
 */
watch(
  () => safeFilters.value.priceRange,

  value => {
    const rawMin = value?.min != null ? Number(value.min) : null

    const rawMax = value?.max != null ? Number(value.max) : null

    const min =
      rawMin !== null && Number.isFinite(rawMin)
        ? clamp(rawMin, PRICE_MIN, PRICE_MAX)
        : null

    const max =
      rawMax !== null && Number.isFinite(rawMax)
        ? clamp(rawMax, PRICE_MIN, PRICE_MAX)
        : null

    minPrice.value = min !== null ? String(min) : ''

    maxPrice.value = max !== null ? String(max) : ''

    rangeMin.value = min ?? PRICE_MIN

    rangeMax.value = max ?? PRICE_MAX
  },

  {
    deep: true,
    immediate: true,
  },
)

onBeforeUnmount(() => {
  debouncedPriceUpdate.cancel()
  debouncedRangeUpdate.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.aside {
  width: 100%;

  @include adaptiveValue('padding', 24, 15);

  @include adaptiveValue('border-radius', 38, 20);

  background: var(--double-spanish-white);

  color: var(--cod-gray);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 15px;
  }

  &__title {
    @include ibm-14-700;
    text-transform: uppercase;
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

    &:not(:first-of-type) {
      padding-top: 18px;
    }
    border-bottom: 1px solid var(--sisal);

    &:last-of-type {
      border-bottom: 0px;
      padding-bottom: 20px;
    }
  }

  &__subtitle {
    @include ibm-11-700;

    text-transform: uppercase;
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
  &__range {
    padding: 4px 8px 0;

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__range-track {
    position: relative;

    height: 20px;

    &::before {
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

    transition: all 0.3s ease 0s;

    &:focus-within {
      border-color: var(--copper);
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

  &__options {
    display: flex;
    flex-direction: column;

    gap: 2px;

    max-height: 250px;

    padding-right: 6px;

    overflow-y: auto;
    overflow-x: hidden;

    overscroll-behavior: contain;
  }

  &__option {
    display: flex;
    align-items: center;

    width: 100%;
    @include adaptiveValue('min-height', 32, 40);

    gap: 9px;

    padding: 5px;

    border-radius: 999px;

    background: transparent;

    @include ibm-14-700;

    text-align: left;

    color: var(--cod-gray);

    cursor: pointer;

    transition: all 0.3s ease 0s;
    text-transform: capitalize;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--feta);
      }
    }

    &_active {
      font-weight: 700;

      background-color: var(--feta);

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
