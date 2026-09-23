<template>
  <div
    class="price"
    v-bind="attrs"
    :class="[{ 'is-reverse': reverse, isOld, isBold }, size]"
  >
    <div v-if="showCurrencySymbol" class="price__currency" :class="{ hint }">
      {{ resolvedCurrencySymbol }}
    </div>
    <div v-else-if="internalCurrencyImage" class="price__icon _ibg-contain">
      <img :src="internalCurrencyImage" :alt="internalCurrencyAlt" />
    </div>
    <div v-if="priceValue !== null" class="price__value">
      {{ formattedPrice }}
    </div>
  </div>
</template>

<script setup>
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const props = defineProps({
  price: { type: [Number, String], required: false },
  isCurrency: { type: Boolean, default: false },
  rawFiat: { type: Boolean, default: false },
  skipConversion: { type: Boolean, default: false },
  reverse: { type: Boolean, default: false },
  hint: { type: Boolean, default: false },
  isOld: { type: Boolean, default: false },
  isBold: { type: Boolean, default: true },
  size: { type: String, default: 'ibm-13' }, // ibm-13 | sg-20 | sg-42

  currencySymbol: { type: String, default: '' },
  currencyCode: { type: String, default: '' },
})

const priceValue = computed(() => {
  const n = Number(props.price)
  return Number.isFinite(n) ? n : null
})

const internalCurrency = computed(() => {
  return settingsStore.internalCurrency || {}
})

const internalCurrencyImage = computed(() => {
  return internalCurrency.value?.image || ''
})

const internalCurrencyAlt = computed(() => {
  return internalCurrency.value?.name || 'Internal currency'
})

const resolvedCurrencyCode = computed(() => {
  return props.currencyCode || currencyStore.currentCurrency?.code || 'EUR'
})

const resolvedCurrencySymbol = computed(() => {
  return (
    props.currencySymbol ||
    currencyStore.getCurrencySymbolByCode?.(resolvedCurrencyCode.value) ||
    currencyStore.currentCurrencySymbol ||
    currencyStore.currentCurrency?.symbol ||
    resolvedCurrencyCode.value ||
    ''
  )
})

const showCurrencySymbol = computed(() => {
  return props.isCurrency || props.rawFiat
})

const formattedFiatByCode = (value, code) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(value)
  } catch {
    return Number(value || 0).toFixed(2)
  }
}

const stripCurrencySymbols = value => {
  return String(value)
    .replace(/[^\d.,\s-]/g, '')
    .trim()
}

const formattedPrice = computed(() => {
  if (priceValue.value === null) return '0'

  if (props.skipConversion) {
    if (props.isCurrency || props.rawFiat) {
      return stripCurrencySymbols(
        formattedFiatByCode(priceValue.value, resolvedCurrencyCode.value),
      )
    }

    return String(priceValue.value).trim()
  }

  if (props.rawFiat || props.isCurrency) {
    return stripCurrencySymbols(
      formattedFiatByCode(priceValue.value, resolvedCurrencyCode.value),
    )
  }

  const fiatAmount = currencyStore.creditsToFiat(priceValue.value)

  return stripCurrencySymbols(currencyStore.formatFiat(fiatAmount))
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.price {
  display: flex;
  align-items: center;

  &.is-reverse {
    flex-direction: row-reverse;
  }

  &__currency,
  &__value {
    transition: color 0.3s ease 0s;
  }

  &__icon {
  }
  &__currency,
  &__value {
    color: inherit;
    transition: color 0.3s ease 0s;
  }

  &.isOld {
    opacity: 0.7;
    text-decoration: line-through;
  }
  &.ibm-13 {
    gap: 4px;
    .price__currency,
    .price__value {
      @include ibm-13-700;
      font-weight: inherit;
    }
    .price__icon {
      min-width: 14px;
      height: 14px;
    }
  }
  &.sg-20 {
    gap: 5px;
    .price__currency,
    .price__value {
      @include sg-20-700;
      font-weight: inherit;
    }
    .price__icon {
      min-width: 18px;
      height: 18px;
    }
  }
  &.sg-42 {
    gap: 5px;
    .price__currency,
    .price__value {
      @include sg-42-700;
      font-weight: inherit;
    }
    .price__icon {
      @include adaptiveValue('min-width', 40, 26);
      @include adaptiveValue('height', 40, 26);
    }
  }
}
</style>
