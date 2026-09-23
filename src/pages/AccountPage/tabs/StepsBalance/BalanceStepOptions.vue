<template>
  <div class="balance">
    <div class="balance__title _l">{{ $t('Top Up') }}</div>
    <div class="balance__item">
      <div class="balance__label">{{ $t('Enter your amount:') }}</div>
      <div class="balance__row">
        <BaseInput
          class="balance__input"
          :model-value="selectedAmount"
          type="number"
          :placeholder="$t('Amount')"
          :disabled="isLoading"
          @update:model-value="updateAmount"
        >
          <template #prefix>
            <span class="balance__input-symbol">{{
              currentCurrencySymbol
            }}</span>
          </template>
        </BaseInput>

        <div class="balance__conversion">
          <PriceFormatter :price="1" skip-conversion />
          <span>=</span>
          <PriceFormatter is-currency reverse :price="selectedCurrencyValue" />
        </div>
      </div>
    </div>
    <div class="balance__item">
      <div class="balance__label">{{ $t('or choose amount:') }}</div>
      <div class="balance__options">
        <BaseButton
          v-for="amount in amounts"
          :key="amount"
          type="button"
          variant="option"
          class="balance__option"
          :class="{ active: Number(selectedAmount) === amount }"
          :disabled="isLoading"
          @click="selectAmount(amount)"
        >
          {{ amount }} {{ currentCurrencySymbol }}
        </BaseButton>
      </div>
    </div>
    <div class="balance__item">
      <div class="balance__label">
        <span>{{ $t('You will get:') }}</span>
        <PriceFormatter :price="topUpAmountInCoins" skip-conversion reverse />
      </div>
      <div class="balance__wrapper">
        <div v-if="shouldShowAmountError" class="balance__error _text-error">
          {{ amountError }}
        </div>
        <div class="balance__min">
          {{ $t('Min. top up amount is') }}
          {{ minTopupAmount }}{{ currentCurrencySymbol }}
        </div>
        <BaseButton
          class="balance__submit"
          variant="fade"
          :disabled="!isValidAmount || isLoading"
          @click="goNext"
        >
          {{ $t('Top up my balance') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { debounce } from 'lodash'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'

const BASE_AMOUNTS = [5, 25, 50, 75, 100]

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
})

const emit = defineEmits(['update:modelValue', 'next'])

const { t } = useI18n()
const toast = useToast()

const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()

const { currentCurrency, currentCurrencySymbol } = storeToRefs(currencyStore)

const amountError = ref('')
const amountTouched = ref(false)

const selectedAmount = computed(() => props.modelValue)

const isLoading = computed(() => {
  return settingsStore.loading || currencyStore.isLoading
})

const selectedCurrencyValue = computed(() => {
  return Number(currentCurrency.value?.value) || 1
})

const minTopupAmount = computed(() => {
  return Number(settingsStore.minTopUpAmount || 0)
})

const maxTopupAmount = computed(() => {
  return Number(settingsStore.maxTopUpAmount || 0)
})

const amounts = computed(() => {
  return BASE_AMOUNTS.map(amount => {
    return Number((amount * selectedCurrencyValue.value).toFixed(2))
  }).filter(amount => {
    if (minTopupAmount.value && amount < minTopupAmount.value) return false
    if (maxTopupAmount.value && amount > maxTopupAmount.value) return false

    return true
  })
})

const topUpAmountInCoins = computed(() => {
  const amount = Number(selectedAmount.value || 0)
  const currencyValue = selectedCurrencyValue.value

  return Number(amount / currencyValue).toFixed(2)
})

const isValidAmount = computed(() => {
  const amount = Number(selectedAmount.value)

  if (!selectedAmount.value) return false
  if (!Number.isFinite(amount)) return false
  if (amount <= 0) return false
  if (minTopupAmount.value && amount < minTopupAmount.value) return false
  if (maxTopupAmount.value && amount > maxTopupAmount.value) return false

  return true
})

const shouldShowAmountError = computed(() => {
  return amountTouched.value && !!amountError.value
})

const updateAmount = value => {
  emit('update:modelValue', value)
}

const validateAmount = value => {
  const amount = Number(value)
  const min = minTopupAmount.value
  const max = maxTopupAmount.value
  const currency = currentCurrencySymbol.value

  amountError.value = ''

  if (value === '' || value === null || value === undefined) {
    amountError.value = t('Amount is required')
    return false
  }

  if (!Number.isFinite(amount)) {
    amountError.value = t('Amount must be a number')
    return false
  }

  if (amount <= 0) {
    amountError.value = t('Amount must be higher then') + ` 0${currency}`
    return false
  }

  if (min && amount < min) {
    amountError.value =
      t('Amount must be higher then') + ` ${min.toFixed(2)}${currency}`
    return false
  }

  if (max && amount > max) {
    amountError.value =
      t('Amount must be lower then') + ` ${max.toFixed(2)}${currency}`
    return false
  }

  return true
}

const debouncedValidateAmount = debounce(value => {
  amountTouched.value = true
  validateAmount(value)
}, 300)

const selectAmount = amount => {
  emit('update:modelValue', amount)
  amountTouched.value = true
  validateAmount(amount)
}

const goNext = () => {
  amountTouched.value = true

  if (!validateAmount(selectedAmount.value)) {
    toast.warning(amountError.value || t('Please enter a valid amount'))
    return
  }

  emit('next')
}

watch(
  () => selectedAmount.value,
  value => {
    amountError.value = ''
    debouncedValidateAmount(value)
  },
)

watch(
  () => selectedCurrencyValue.value,
  () => {
    if (amountTouched.value) {
      validateAmount(selectedAmount.value)
    }
  },
)

watch(
  () => minTopupAmount.value,
  () => {
    if (amountTouched.value) {
      validateAmount(selectedAmount.value)
    }
  },
)

onMounted(async () => {
  await Promise.all([
    !settingsStore.settings && !settingsStore.loading
      ? settingsStore.fetchSettings()
      : null,
    currencyStore.currencies.length === 0
      ? currencyStore.initializeCurrencies()
      : null,
  ])
})

onBeforeUnmount(() => {
  debouncedValidateAmount.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.balance {
  display: block !important;
  &__title {
    line-height: 30px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__item {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
    @media (min-width: $md2) {
      display: flex;
      gap: 20px;
      justify-content: space-between;
    }
  }

  &__label {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    line-height: 17px;
    @media (max-width: $md2) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }
  &__row,
  &__options,
  &__wrapper {
    width: 100%;
    @media (min-width: $md4) {
      max-width: 450px;
    }
  }
  &__row {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 20, 10, 1400, 992, 1);
  }

  &__input {
    max-width: 285px;
    &-symbol {
      color: var(--primary-color);
    }
  }

  &__conversion {
    display: flex;
    gap: 12px;
    align-items: center;
    color: var(--primary-color) !important;
  }

  &__options {
    display: flex;
    @include adaptiveValue('gap', 20, 10, 1400, 992, 1);
    @media (max-width: $md2) {
      flex-wrap: wrap;
    }
    @media (max-width: $md6) {
      gap: 4px;
    }
  }

  &__option {
    flex: 0 1 20%;
    min-height: 41px !important;
    white-space: nowrap;
    @media (max-width: $md6) {
      flex: 0 1 calc(50% - 2px);
    }
  }

  &__wrapper {
  }

  &__error {
    margin-bottom: 8px;
  }

  &__min {
    margin-bottom: 8px;
    color: var(--pending-color);
  }

  &__submit {
    width: fit-content !important;
    min-width: 166px !important;
    min-height: 46px !important;
  }
}
</style>
