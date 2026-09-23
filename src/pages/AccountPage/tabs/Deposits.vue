<template>
  <div class="deposits">
    <div class="deposits__itmes">
      <div class="deposits__balance balance">
        <div class="balance__top">
          <div class="balance__title _md">{{ $t('My balance') }}</div>
          <div class="balance__sub _text-secondary">
            {{ $t('Recent balance:') }}
          </div>
          <div class="balance__value _h3">{{ formattedBalance }}</div>
        </div>

        <div class="balance__bottom">
          <BaseButton
            variant="top-up"
            type="button"
            class="balance__button"
            :class="{ active: mode === 'topup' }"
            @click="setMode('topup')"
          >
            {{ $t('Top up') }}
          </BaseButton>

          <BaseButton
            variant="top-up"
            type="button"
            class="balance__button"
            :class="{ active: mode === 'withdraw' }"
            @click="setMode('withdraw')"
          >
            {{ $t('Withdraw') }}
          </BaseButton>
        </div>
      </div>

      <div class="deposits__top-up top-up">
        <!-- ===================== WITHDRAW (Slyse-style) ===================== -->
        <div v-if="mode === 'withdraw'" class="top-up__block">
          <!-- STEP 1: Amount -->
          <template v-if="withdrawStep === 1">
            <div class="top-up__title _md">{{ $t('Withdraw') }}</div>

            <BaseInput
              v-model="withdrawAmountInput"
              type="text"
              inputmode="decimal"
              :placeholder="$t('Enter amount')"
              class="top-up__input"
              :regular-prefix="true"
              :disabled="withdrawLoading"
              @update:modelValue="onWithdrawAmountInput"
              @blur="onWithdrawAmountBlur"
            >
              <template #prefix>{{ currencySymbol }}</template>
            </BaseInput>

            <div v-if="withdrawError" class="top-up__error _text-error">
              {{ withdrawError }}
            </div>

            <BaseButton
              type="button"
              class="top-up__next"
              :disabled="withdrawLoading"
              @click="goWithdrawStep2"
            >
              {{ $t('Next') }}
            </BaseButton>
          </template>

          <!-- STEP 2: Card details -->
          <template v-else>
            <div class="top-up__title _md">{{ $t('Withdraw') }}</div>

            <BaseInput
              :model-value="formattedCardNumber"
              :placeholder="$t('Card number')"
              :error="withdrawErrors.card_number"
              class="top-up__input"
              :disabled="withdrawLoading"
              inputmode="numeric"
              autocomplete="cc-number"
              @update:modelValue="onCardNumberInput"
            />

            <div class="top-up__row">
              <BaseInput
                v-model="withdrawCard.expiry_month"
                :placeholder="$t('MM')"
                :error="withdrawErrors.expiry_month"
                class="top-up__input"
                :disabled="withdrawLoading"
                @update:modelValue="onExpiryMonthInput"
              />
              <BaseInput
                v-model="withdrawCard.expiry_year"
                :placeholder="$t('YY')"
                :error="withdrawErrors.expiry_year"
                class="top-up__input"
                :disabled="withdrawLoading"
                @update:modelValue="onExpiryYearInput"
              />
            </div>

            <BaseInput
              v-model="withdrawCard.cardholder_name"
              :placeholder="$t('Card Holder Name')"
              :error="withdrawErrors.cardholder_name"
              class="top-up__input"
              :disabled="withdrawLoading"
              @update:modelValue="onCardholderNameInput"
            />

            <div v-if="withdrawError" class="top-up__error _text-error">
              {{ withdrawError }}
            </div>

            <BaseButton
              type="button"
              class="top-up__next"
              :disabled="withdrawLoading"
              @click="submitWithdraw"
            >
              <span v-if="withdrawLoading">{{ $t('Processing') }}...</span>
              <span v-else>{{ $t('Withdraw') }}</span>
            </BaseButton>

            <BaseButton
              variant="steam"
              type="button"
              class="top-up__back"
              :disabled="withdrawLoading"
              @click="withdrawStep = 1"
            >
              {{ $t('Back') }}
            </BaseButton>
          </template>
        </div>

        <!-- ===================== TOPUP ===================== -->
        <template v-else>
          <!-- STEP 1 -->
          <div v-if="step === 1" class="top-up__block">
            <div class="top-up__title _md">{{ $t('Top up') }}</div>

            <BaseInput
              v-model="amountInput"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              :placeholder="$t('Enter amount')"
              @update:modelValue="onAmountInput"
              class="top-up__input"
              :regular-prefix="true"
            >
              <template #prefix>{{ currencySymbol }}</template>
            </BaseInput>

            <div class="top-up__label _text-secondary">
              <div
                v-if="minAmountText"
                class="top-up__min-amount _text-secondary"
              >
                {{ minAmountText }}
              </div>
              <div v-if="amountError" class="top-up__error _text-error">
                {{ amountError }}
              </div>
            </div>

            <div class="top-up__actions">
              <div
                class="top-up__wrapper-action"
                v-for="v in quickAmounts"
                :key="v"
              >
                <BaseButton
                  type="button"
                  class="top-up__action"
                  :class="{ active: Number(amountInput) === v }"
                  @click="setQuickAmount(v)"
                >
                  {{ formatQuick(v) }}
                </BaseButton>
              </div>
            </div>

            <div class="top-up__label _text-secondary">
              {{ $t('Payment method') }}
            </div>

            <div class="top-up__methods">
              <BaseCheckbox
                v-for="m in availablePaymentMethods"
                :key="m.code"
                :model-value="selectedMethodCode === m.code"
                @update:modelValue="() => selectMethod(m.code)"
                class="top-up__method"
                :bordered="true"
              >
                <span class="top-up__method-name">{{ m.title }}</span>
                <span class="top-up__method-image _ibg-contain">
                  <img v-if="m.image" :src="m.image" />
                </span>
              </BaseCheckbox>
            </div>

            <div v-if="topupStore.error" class="top-up__error _text-error">
              {{ topupStore.error }}
            </div>

            <BaseButton
              v-if="canGoStep2"
              type="button"
              class="top-up__next"
              :disabled="topupStore.isLoading"
              @click="goStep2"
            >
              {{ $t('Pay by card') }}
            </BaseButton>
          </div>

          <!-- STEP 2 -->
          <div v-else class="top-up__block">
            <div class="top-up__title _md">{{ $t('Contact Information') }}</div>

            <div class="top-up__inputs">
              <BaseInput
                v-model="form.name"
                :placeholder="$t('Name:')"
                :error="errors.name"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BaseInput
                v-model="form.surname"
                :placeholder="$t('Surname:')"
                :error="errors.surname"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BaseInput
                v-model="form.email"
                type="email"
                :placeholder="$t('Email:')"
                :error="errors.email"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BasePhone
                v-model="form.phone"
                :placeholder="$t('Phone:')"
                @phone-data="onPhoneData"
                :error="errors.phone"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BaseSelect
                v-model="form.country"
                :options="countryOptions"
                optionLabel="title"
                optionValue="id"
                :placeholder="$t('Country:')"
                :error="errors.country"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BaseInput
                v-model="form.city"
                :placeholder="$t('City:')"
                :error="errors.city"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BaseInput
                v-model="form.address"
                :placeholder="$t('Address:')"
                :error="errors.address"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
              <BaseInput
                v-model="form.postCode"
                :placeholder="$t('Post Code:')"
                :error="errors.postCode"
                :disabled="topupStore.isLoading"
                class="top-up__input"
              />
            </div>

            <div class="top-up__terms">
              <BaseCheckbox
                v-model="form.termsAccepted"
                :error="errors.termsAccepted"
              >
                {{ $t('signup_terms_text') }}
                <router-link :to="getPageUrl(termsPage)" target="_blank">
                  {{ $t('Terms of use') }}
                </router-link>
                {{ $t('and the') }}
                <router-link :to="getPageUrl(privacyPage)" target="_blank">
                  {{ $t('Privacy Policy') }}
                </router-link>
              </BaseCheckbox>
            </div>

            <div class="top-up__actions">
              <BaseButton
                type="button"
                class="top-up__pay"
                :disabled="topupStore.isLoading"
                @click="submitCheckout"
              >
                <span v-if="topupStore.isLoading"
                  >{{ $t('Processing') }}...</span
                >
                <span v-else>{{ $t('Pay Now') }}</span>
              </BaseButton>

              <BaseButton
                variant="steam"
                type="button"
                class="top-up__back"
                :disabled="topupStore.isLoading"
                @click="backToStep1"
              >
                {{ $t('Back') }}
              </BaseButton>
            </div>

            <div v-if="topupStore.error" class="top-up__error _text-error">
              {{ topupStore.error }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BasePhone from '@/components/base/BasePhone.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

import axios from '@/plugins/axios'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const topupStore = useTopUpStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

const mode = ref('topup') // 'topup' | 'withdraw'
const step = ref(1) // topup step

const currency = computed(() => currencyStore.currentCurrency || {})
const currencyCode = computed(
  () => currency.value?.code || currencyStore.currentCurrencyCode || '',
)
const currencySymbol = computed(
  () => currency.value?.symbol || currencyStore.currentCurrencySymbol || '',
)
const balance = computed(() => Number(userStore.userBalance) || 0)
const formattedBalance = computed(() => {
  const code = currencyCode.value
  const n = currencyStore.formatFiat(balance.value, code)
  return `${currencyStore.currentCurrencySymbol} ${n}`
})

const baseQuickAmounts = [5, 10, 20, 50, 100, 200]
const currencyRate = computed(() => Number(currency.value?.value || 1))

const quickAmounts = computed(() =>
  baseQuickAmounts.map(v => Math.round(v * currencyRate.value * 100) / 100),
)

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const cur = currencyCode.value
  return methods.filter(m => {
    if (!m.currencies || m.currencies.length === 0) return true
    return m.currencies.includes(cur)
  })
})

const selectedMethodCode = ref(null)
const selectMethod = code => {
  selectedMethodCode.value = code
  topupStore.setPaymentType(code)
}

const amountInput = ref('')
const amountError = ref('')

const minAmount = computed(() => Number(settingsStore.minTopUpAmount || 0))
const minAmountText = computed(() => {
  if (!minAmount.value) return ''
  return `${t('Minimum top-up amount')}: ${currencyStore.formatFiat(
    minAmount.value,
    currencyCode.value,
  )}`
})

const normalizeAmount = v => {
  const n = Number(String(v).replace(',', '.'))
  return Number.isNaN(n) ? 0 : n
}

const onAmountInput = () => {
  amountError.value = ''
  topupStore.clearError?.()
  topupStore.setAmount(normalizeAmount(amountInput.value))
}

const setQuickAmount = v => {
  amountInput.value = String(v)
  amountError.value = ''
  topupStore.clearError?.()
  topupStore.setAmount(v)
}

const formatQuick = v => `${currencySymbol.value} ${v}`

const hasValidAmount = computed(() => {
  const val = normalizeAmount(amountInput.value)
  if (!val || val <= 0) return false
  if (minAmount.value && val < minAmount.value) return false
  return true
})

const canGoStep2 = computed(
  () => hasValidAmount.value && !!selectedMethodCode.value,
)

const goStep2 = () => {
  if (!hasValidAmount.value) {
    amountError.value = minAmount.value
      ? t('Amount is below minimum')
      : t('Please enter a valid amount')
    return
  }
  if (!selectedMethodCode.value) return

  topupStore.setAmount(normalizeAmount(amountInput.value))
  topupStore.setPaymentType(selectedMethodCode.value)

  step.value = 2
  prefillTopupForm()
  router.replace({ query: { ...route.query, mode: 'topup', step: '2' } })
}

const form = reactive({
  name: '',
  surname: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  email: '',
  termsAccepted: false,
})

const errors = reactive({
  name: '',
  surname: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  email: '',
  termsAccepted: '',
})

const phoneData = ref({ isValid: false })

const onPhoneData = data => {
  phoneData.value = data || { isValid: false }
  if (form.phone && !phoneData.value.isValid) {
    errors.phone = t('Please enter a valid phone number')
  } else {
    errors.phone = ''
  }
}

const countryOptions = computed(() => countriesStore.countries || [])

const prefillTopupForm = () => {
  const u = userStore.user || {}
  form.name = u.name || ''
  form.surname = u.surname || ''
  form.phone = u.phone || ''
  form.country = u.country_id || u.country || ''
  form.city = u.city || ''
  form.address = u.address || ''
  form.postCode = u.zip || ''
  form.email = u.email || ''
  form.termsAccepted = false
}

const validateTopupStep2 = () => {
  Object.keys(errors).forEach(k => (errors[k] = ''))
  let ok = true

  if (!form.name) ((errors.name = t('Name is required')), (ok = false))
  if (!form.surname) ((errors.surname = t('Surname is required')), (ok = false))

  if (!form.email) {
    errors.email = t('Email is required')
    ok = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('Invalid email format')
    ok = false
  }

  if (!form.country) ((errors.country = t('Country is required')), (ok = false))
  if (!form.city) ((errors.city = t('City is required')), (ok = false))
  if (!form.address) ((errors.address = t('Address is required')), (ok = false))
  if (!form.postCode)
    ((errors.postCode = t('Post Code is required')), (ok = false))

  if (!form.phone || !phoneData.value.isValid) {
    errors.phone = t('Valid phone number is required')
    ok = false
  }

  if (!form.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
    ok = false
  }

  return ok
}

const submitCheckout = async () => {
  if (!validateTopupStep2()) return

  topupStore.setAmount(normalizeAmount(amountInput.value))
  topupStore.setPaymentType(selectedMethodCode.value)

  try {
    const res = await topupStore.checkout({
      name: form.name,
      surname: form.surname,
      phone: form.phone,
      country: form.country,
      city: form.city,
      address: form.address,
      postCode: form.postCode,
      email: form.email,
      currency: currencyCode.value,
    })

    if (res?.redirect_url) window.location.href = res.redirect_url
  } catch (e) {
    // store sets error
  }
}

const backToStep1 = () => {
  step.value = 1
  if (route.query.step) {
    router.replace({ query: { ...route.query, step: undefined } })
  }
}

const setMode = newMode => {
  mode.value = newMode

  if (newMode === 'withdraw') {
    step.value = 1
    resetWithdraw()
    router.replace({
      query: { ...route.query, mode: 'withdraw', step: undefined },
    })
    return
  }

  router.replace({ query: { ...route.query, mode: 'topup' } })
  if (route.query.step !== '2') step.value = 1
}

const withdrawStep = ref(1)
const withdrawAmountInput = ref('')
const withdrawError = ref('')
const withdrawLoading = ref(false)

const withdrawCard = reactive({
  card_number_digits: '',
  expiry_month: '',
  expiry_year: '',
  cardholder_name: '',
})

const withdrawErrors = reactive({
  amount: '',
  card_number: '',
  expiry_month: '',
  expiry_year: '',
  cardholder_name: '',
})

const formatCardNumberForUi = digits =>
  String(digits || '')
    .replace(/\D/g, '')
    .slice(0, 19) // 16..19 digits
    .replace(/(.{4})/g, '$1 ') // space every 4
    .trim()

const formattedCardNumber = computed(() =>
  formatCardNumberForUi(withdrawCard.card_number_digits),
)

const sanitizeMoney = v => {
  let value = String(v ?? '').replace(/[^0-9.,]/g, '')
  value = value.replace(',', '.')
  const parts = value.split('.')
  if (parts.length > 2) value = `${parts[0]}.${parts[1]}`
  if (parts[1]) value = `${parts[0]}.${parts[1].slice(0, 2)}`
  if (value.startsWith('.')) value = `0${value}`
  return value
}

const onWithdrawAmountInput = v => {
  withdrawAmountInput.value = sanitizeMoney(v)
  withdrawError.value = ''
}

const onWithdrawAmountBlur = () => {
  if (withdrawAmountInput.value?.endsWith('.')) {
    withdrawAmountInput.value = withdrawAmountInput.value.slice(0, -1)
  }
}

const onCardNumberInput = v => {
  const digits = String(v ?? '')
    .replace(/\D/g, '')
    .slice(0, 19)
  withdrawCard.card_number_digits = digits
  withdrawErrors.card_number = ''
}

const onExpiryMonthInput = v => {
  const digits = String(v ?? '')
    .replace(/\D/g, '')
    .slice(0, 2)
  let mm = digits
  if (mm && Number(mm) > 12) mm = '12'
  withdrawCard.expiry_month = mm
  withdrawErrors.expiry_month = ''
}

const onExpiryYearInput = v => {
  const yy = String(v ?? '')
    .replace(/\D/g, '')
    .slice(0, 2)
  withdrawCard.expiry_year = yy
  withdrawErrors.expiry_year = ''
}

const onCardholderNameInput = v => {
  // Slyse max 30 chars; uppercase like in example modal
  const cleaned = String(v ?? '')
    .replace(/[^A-Za-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 2)
    .join(' ')
    .toUpperCase()
    .slice(0, 30)

  withdrawCard.cardholder_name = cleaned
  withdrawErrors.cardholder_name = ''
}

const validateWithdrawStep1 = () => {
  withdrawError.value = ''
  withdrawErrors.amount = ''

  const amount = normalizeAmount(withdrawAmountInput.value)

  if (!amount || amount < 0.01) {
    withdrawError.value = t('Please enter a valid amount')
    withdrawErrors.amount = withdrawError.value
    return false
  }

  // keep your local balance check (UX)
  if (amount > balance.value) {
    withdrawError.value = t(
      'You do not have a sufficient amount of funds in your account',
    )
    return false
  }

  return true
}

const goWithdrawStep2 = () => {
  if (!validateWithdrawStep1()) return
  withdrawStep.value = 2
}

const validateWithdrawStep2 = () => {
  withdrawError.value = ''
  Object.keys(withdrawErrors).forEach(k => (withdrawErrors[k] = ''))

  let ok = true

  const pan = withdrawCard.card_number_digits
  if (!pan || pan.length < 16 || pan.length > 19) {
    withdrawErrors.card_number = t('Card number is required')
    ok = false
  }

  if (
    !withdrawCard.expiry_month ||
    String(withdrawCard.expiry_month).length !== 2
  ) {
    withdrawErrors.expiry_month = t('Expire month is required')
    ok = false
  }

  if (
    !withdrawCard.expiry_year ||
    String(withdrawCard.expiry_year).length !== 2
  ) {
    withdrawErrors.expiry_year = t('Expire year is required')
    ok = false
  }

  const name = withdrawCard.cardholder_name
  if (!name || name.length > 30) {
    withdrawErrors.cardholder_name = t('Card holder name is required')
    ok = false
  }

  return ok
}

const resetWithdraw = () => {
  withdrawStep.value = 1
  withdrawAmountInput.value = ''
  withdrawError.value = ''
  Object.keys(withdrawErrors).forEach(k => (withdrawErrors[k] = ''))
  withdrawCard.card_number = ''
  withdrawCard.expiry_month = ''
  withdrawCard.expiry_year = ''
  withdrawCard.cardholder_name = ''
}

const submitWithdraw = async () => {
  withdrawError.value = ''

  if (!validateWithdrawStep1()) return
  if (!validateWithdrawStep2()) return

  const amount = Number(normalizeAmount(withdrawAmountInput.value)).toFixed(2)

  withdrawLoading.value = true
  try {
    // EXACT keys SlyseHandler::initiate() validates
    const payload = {
      amount,
      currency: currencyCode.value,
      card_number: withdrawCard.card_number,
      expiry_month: withdrawCard.expiry_month,
      expiry_year: withdrawCard.expiry_year,
      cardholder_name: withdrawCard.cardholder_name,
    }

    const res = await axios.post('/payouts', payload)
    const data = res?.data || {}

    // slyse returns {status:"OK"} on success in your code
    if (data?.status === 'OK') {
      await userStore.fetchProfile?.()
      resetWithdraw()
      return
    }

    // generic fallback
    if (data?.message) withdrawError.value = data.message
    else withdrawError.value = t('Something went wrong')
  } catch (e) {
    withdrawError.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      t('Something went wrong')
  } finally {
    withdrawLoading.value = false
  }
}

watch(
  () => route.query,
  q => {
    const nextMode = q.mode === 'withdraw' ? 'withdraw' : 'topup'
    mode.value = nextMode

    if (nextMode === 'withdraw') {
      step.value = 1
      if (withdrawStep.value !== 1) withdrawStep.value = 1
      return
    }

    if (q.step === '2') {
      step.value = 2
      prefillTopupForm()
    } else {
      step.value = 1
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!settingsStore.settings) await settingsStore.fetchSettings()
  if (!countriesStore.countries?.length) await countriesStore.fetchCountries?.()
  await ensurePages()

  // restore topup values
  if (topupStore.amount != null)
    amountInput.value = String(topupStore.amount || '')
  if (topupStore.paymentType) selectedMethodCode.value = topupStore.paymentType
  if (!selectedMethodCode.value && availablePaymentMethods.value.length) {
    selectMethod(availablePaymentMethods.value[0].code)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.deposits {
  &__itmes {
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 25, 20);
    }
  }
  &__balance {
    @media (min-width: $md5) {
      @include adaptiveValue('max-width', 245, 200);
      width: 100%;
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 25px;
      }
    }
  }
  &__top-up {
    @media (min-width: $md5) {
      margin-left: auto;
      margin-right: auto;
      @include adaptiveValue('max-width', 287, 200);
      width: 100%;
    }
  }
}

.balance {
  &__top {
    @include adaptiveValue('padding', 14, 10);
    @include adaptiveValue('padding-bottom', 60, 10);
    background-color: #040711;
    @include adaptiveValue(' border-radius', 8, 6);
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 25);
    }
  }
  &__sub {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 15);
    }
  }
  &__bottom {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
  }
}

.top-up {
  &__title {
    @include adaptiveValue('font-size', 16, 14);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }
  &__input {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 11, 10);
    }
  }
  &__label {
    color: var(--third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 10);
    }
  }
  &__min-amount {
    color: var(--third-color);
  }
  &__error {
    color: var(--error-color);
    @include adaptiveValue('margin-top', 8, 8);
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('row-gap', 10, 6);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }
  &__wrapper-action {
    @include adaptiveValue('padding-right', 5, 3);
    @include adaptiveValue('padding-left', 5, 3);
    flex: 0 1 33.333%;
  }
  &__action {
    background-color: #090c1b;
    &.active {
      pointer-events: none;
      background-color: var(--hint-color);
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-color);
      }
    }
    &::before {
      display: none;
    }
    :deep(.btn__decor) {
      display: none;
    }
  }
  &__methods {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 22);
    }
  }
  &__method {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 6, 5);
    }
    :deep(.base-checkbox__label) {
      flex: 1 1 100%;
    }
    &-name {
      text-transform: capitalize;
    }
    &-image {
      margin-left: auto;
      min-width: 35px;
      min-height: 22px;
    }
  }
  &__row {
    display: flex;
    gap: 8px;
  }
  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }
  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 22);
    }
  }
  &__pay {
    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }
}
</style>
