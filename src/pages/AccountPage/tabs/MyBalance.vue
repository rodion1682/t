<template>
  <div class="balance" v-bind="attrs">
    <div v-if="false" class="balance__top">
      <div class="balance__subtitle _h5">{{ $t('My balance:') }}</div>
      <div class="balance__amount">
        <SvgIcon :icon="WalletIcon" class="balance__wallet" />
        <PriceFormatter
          class="balance__coin"
          :price="userBalance"
          size="size-28"
          skip-conversion
        />
      </div>
    </div>

    <div class="balance__title _h4">{{ $t('Top Up Balance') }}</div>
    <div class="balance__options">
      <BaseButton
        v-for="option in amountOptions"
        :key="`${option.baseAmount}-${option.amount}`"
        type="button"
        class="balance__option"
        :variant="
          Number(selectedAmount) === option.amount ? 'primary' : 'bordered '
        "
        :class="{
          active: Number(selectedAmount) === option.amount,
        }"
        :disabled="isLoading"
        @click="selectAmount(option.amount)"
      >
        {{ option.label }} {{ currentCurrencySymbol }}
      </BaseButton>
    </div>
    <div class="balance__bottom">
      <div class="balance__or">{{ $t('or enter your amount:') }}</div>
      <div class="balance__row">
        <BaseInput
          class="balance__input"
          v-model.number="selectedAmount"
          type="number"
          :placeholder="$t('0')"
          :empty="true"
          :disabled="isLoading"
        >
          <template #suffix>
            <span>{{ currentCurrencySymbol }}</span>
          </template>
        </BaseInput>
        <div class="balance__min">
          {{ $t('Min. depopsit is') }}
          <span> {{ minTopupAmount }}{{ currentCurrencySymbol }}</span>
        </div>
      </div>
      <div class="balance__conversion">
        <PriceFormatter is-currency :price="selectedCurrencyValue" />
        <span>=</span>
        <PriceFormatter :price="1" skip-conversion />
      </div>
      <!-- v-if="selectedAmount "  -->

      <div v-if="isValidAmount" class="balance__get">
        <span>{{ $t('You will get:') }}</span>
        <PriceFormatter :price="topUpAmountInCoins" skip-conversion reverse />
      </div>
      <div v-if="shouldShowAmountError" class="balance__error _text-error">
        {{ amountError }}
      </div>
      <BaseButton
        class="balance__submit"
        variant="primary"
        :disabled="!isValidAmount || isLoading"
        @click="openTopUpModal"
      >
        {{ $t('Continue') }}
      </BaseButton>
    </div>
  </div>

  <TopUpModal
    :show="isTopUpModalOpen"
    :selected-amount="Number(selectedAmount)"
    @close="closeTopUpModal"
  />
</template>

<script setup>
import { debounce } from 'lodash'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import TopUpModal from '@/components/modals/TopUpModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const { t } = useI18n()
const toast = useToast()

const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()

const { currentCurrency, currentCurrencyCode, currentCurrencySymbol } =
  storeToRefs(currencyStore)
const { userBalance } = storeToRefs(userStore)

const BASE_AMOUNTS = [5, 15, 25, 50, 100, 200]

const selectedAmount = ref('')
const amountError = ref('')
const amountTouched = ref(false)
const isTopUpModalOpen = ref(false)

const isLoading = computed(() => settingsStore.loading)

const selectedCurrencyValue = computed(() => {
  return Number(currentCurrency.value?.value) || 1
})

const topUpAmountInCoins = computed(() => {
  const amount = Number(selectedAmount.value || 0)
  const currencyValue = Number(currentCurrency.value?.value || 1)

  return Number(amount / currencyValue).toFixed(2)
})

const minTopupAmount = computed(() => {
  return Number(settingsStore.minTopUpAmount || 0)
})

const maxTopupAmount = computed(() => {
  return Number(settingsStore.maxTopUpAmount || 0)
})

const amountOptions = computed(() => {
  const currencyRate = selectedCurrencyValue.value
  const minAmount = minTopupAmount.value

  const options = BASE_AMOUNTS.map(baseAmount => {
    const convertedAmount = baseAmount * currencyRate

    const formattedAmount = currencyStore.formatFiat(
      convertedAmount,
      currentCurrencyCode.value,
    )

    return {
      baseAmount,
      amount: Number(formattedAmount),
      label: formattedAmount,
    }
  }).filter(option => {
    if (!minAmount) return true

    return option.amount >= minAmount
  })

  // Prevent duplicate buttons after rounding,
  // especially for zero-decimal currencies.
  return options.filter((option, index, array) => {
    return array.findIndex(item => item.amount === option.amount) === index
  })
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
  selectedAmount.value = amount
  amountTouched.value = true
  validateAmount(amount)
}

const openTopUpModal = () => {
  amountTouched.value = true

  if (!validateAmount(selectedAmount.value)) {
    toast.warning(amountError.value || t('Please enter a valid amount'))
    return
  }

  isTopUpModalOpen.value = true
}

const closeTopUpModal = () => {
  isTopUpModalOpen.value = false
}

watch(
  () => selectedAmount.value,
  value => {
    amountError.value = ''
    debouncedValidateAmount(value)
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

watch(
  () => maxTopupAmount.value,
  () => {
    if (amountTouched.value) {
      validateAmount(selectedAmount.value)
    }
  },
)

watch(
  () => currentCurrencyCode.value,
  () => {
    selectedAmount.value = ''
    amountError.value = ''
    amountTouched.value = false
  },
)

onMounted(() => {
  if (!settingsStore.settings && !settingsStore.loading) {
    settingsStore.fetchSettings()
  }
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
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-primary-color);
  @include adaptiveValue('border-radius', 20, 10);
  @include adaptiveValue('padding', 40, 10);
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
      text-transform: uppercase;
    }
  }

  &__options {
    display: grid;
    @include adaptiveValue('gap', 20, 4);
    grid-template-columns: repeat(6, 1fr);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
    @media (max-width: $md2) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: $md4) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__option {
  }

  &__bottom {
  }

  &__or {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
  }

  &__row {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 20, 10);
    }
  }

  &__input {
    width: 100%;
    @media (min-width: $md5) {
      max-width: 426px;
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__min {
    align-self: center;
    white-space: nowrap;
  }

  &__conversion {
    font-weight: 400 !important;
    display: flex;
    gap: 5px;
    align-items: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__get {
    display: flex;
    gap: 5px;
    align-items: center;
    color: var(--primary-color);
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__submit {
    max-width: 426px;
  }
}
</style>
