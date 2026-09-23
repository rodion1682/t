<template>
  <div class="balance">
    <button
      class="balance__back back"
      type="button"
      :disabled="isSubmitting"
      @click="$emit('back')"
    >
      <SvgIcon class="back__icon" :icon="ChevronDownIcon" />
      <div class="back__text">{{ $t('Back') }}</div>
    </button>
    <div class="balance__inner">
      <div class="balance__block">
        <div class="balance__item">
          <div class="balance__title _l">
            {{ $t('Top up balance') }}
          </div>
          <div class="balance__rate">
            <PriceFormatter :price="1" skip-conversion />
            <span>=</span>
            <PriceFormatter
              is-currency
              reverse
              :price="selectedCurrencyValue"
            />
          </div>
        </div>
        <div class="balance__item">
          <div class="balance__label">{{ $t('Total to pay:') }}</div>
          <div class="balance__prices">
            <PriceFormatter
              :price="receiveCredits"
              size="size-20"
              skip-conversion
              class="balance__coin"
            />
            <PriceFormatter
              is-currency
              :price="localFiatAmount"
              :currency-code="currencyCode"
              class="balance__fiat"
            />
          </div>
        </div>
      </div>
      <div class="balance__form checkout">
        <div class="checkout__block">
          <div class="checkout__box">
            <div class="checkout__subtitle _l">
              {{ $t('Payment details') }}
            </div>

            <div class="checkout__inputs">
              <div class="checkout__row">
                <BaseInput
                  v-model="form.name"
                  :placeholder="$t('Name')"
                  :error="errors.name"
                  class="checkout__input"
                  :disabled="isSubmitting"
                  @blur="validateField('name')"
                />

                <BaseInput
                  v-model="form.surname"
                  :placeholder="$t('Surname')"
                  :error="errors.surname"
                  class="checkout__input"
                  :disabled="isSubmitting"
                  @blur="validateField('surname')"
                />
              </div>

              <BaseInput
                v-model="form.email"
                :placeholder="$t('Email')"
                type="email"
                autocomplete="email"
                :error="errors.email"
                class="checkout__input"
                :disabled="isSubmitting"
                @blur="validateField('email')"
              />

              <BaseInput
                v-model="form.phone"
                :placeholder="$t('Phone')"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                :error="errors.phone"
                class="checkout__input"
                :disabled="isSubmitting"
                @blur="validateField('phone')"
              />
            </div>
          </div>
        </div>
        <div class="checkout__block">
          <div class="checkout__box">
            <div class="checkout__subtitle _l">
              {{ $t('Billing address') }}
            </div>

            <div class="checkout__inputs">
              <BaseSelect
                v-model="form.country"
                :options="countries"
                option-label="name"
                option-value="value"
                :placeholder="$t('Choose country')"
                :error="errors.country"
                :disabled="isSubmitting"
                class="checkout__input"
              />

              <div class="checkout__row">
                <BaseInput
                  v-model="form.city"
                  :placeholder="$t('City')"
                  :error="errors.city"
                  class="checkout__input"
                  :disabled="isSubmitting"
                  @blur="validateField('city')"
                />

                <BaseInput
                  v-model="form.postCode"
                  :placeholder="$t('Zip-code')"
                  :error="errors.postCode"
                  class="checkout__input checkout__input_small"
                  :disabled="isSubmitting"
                  @blur="validateField('postCode')"
                />
              </div>

              <BaseInput
                v-model="form.address"
                :placeholder="$t('Address line')"
                :error="errors.address"
                class="checkout__input"
                :disabled="isSubmitting"
                @blur="validateField('address')"
              />
            </div>

            <BaseCheckbox
              v-model="form.termsAccepted"
              :error="errors.termsAccepted"
              :disabled="isSubmitting"
              class="checkout__checkbox"
              terms
            />
          </div>
        </div>

        <div class="checkout__block">
          <div class="checkout__subtitle _l">
            {{ $t('Payment method:') }}
          </div>

          <div v-if="submitError" class="checkout__error _text-error">
            {{ submitError }}
          </div>

          <div v-if="topupStore.error" class="checkout__error _text-error">
            {{ topupStore.error }}
          </div>

          <div class="checkout__methods">
            <div
              v-for="(method, index) in paymentMethods"
              :key="method.code"
              class="checkout__method"
            >
              <BaseButton
                type="button"
                :variant="index < 2 ? 'white' : 'white-bordered'"
                :class="[
                  'checkout__submit',
                  { checkout__submit_image: method.image },
                ]"
                :loading="isSubmitting && selectedPaymentMethod === method.code"
                :disabled="isSubmitting || !canSubmit"
                @click="submitWithMethod(method.code)"
              >
                <span
                  v-if="method.image"
                  class="checkout__submit-image _ibg-contain"
                >
                  <img :src="method.image" :alt="method.title" />
                </span>

                <span v-else>
                  {{ method.title }}
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { ChevronDownIcon } from '@/components/icons/index.js'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const props = defineProps({
  selectedAmount: { type: [String, Number], required: true, default: '' },
})

const emit = defineEmits(['back', 'success-close'])

const { t } = useI18n()
const { ensurePages } = useStaticPages()

const topupStore = useTopUpStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

const submitError = ref('')
const selectedPaymentMethod = ref(null)

const form = reactive({
  tradeLink: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  termsAccepted: false,
})

const errors = reactive({
  tradeLink: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  termsAccepted: '',
})

const norm = value => String(value ?? '').trim()
const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const savedFields = ['country', 'city', 'address', 'postCode', 'tradeLink']

const isSubmitting = computed(() => topupStore.isLoading)

const currency = computed(() => currencyStore.currentCurrency || {})

const currencyCode = computed(() => {
  return currency.value?.code || currencyStore.currentCurrencyCode || 'EUR'
})

const selectedCurrencyValue = computed(() => {
  return Number(currency.value?.value) || 1
})

const localFiatAmount = computed(() => Number(props.selectedAmount || 0))

const receiveCredits = computed(() => {
  const amount = Number(props.selectedAmount || 0)
  const currencyValue = Number(currency.value?.value || 1)

  return Number(amount / currencyValue).toFixed(2)
})

const countries = computed(() =>
  (countriesStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  })),
)

const getCheckoutStorageData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutStorageData = () => {
  const data = getCheckoutStorageData()

  savedFields.forEach(field => {
    data[field] = form[field]
  })

  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data))
}

const getProfileValue = (user, field) => {
  if (!user) return ''

  const map = {
    tradeLink: user.steam_trade_link || user.tradeLink || user.trade_url,
    country: user.country || user.country_id || user.country?.id,
    city: user.city,
    address: user.address,
    postCode: user.zip || user.post_code,
  }

  return map[field] ?? ''
}

const getUserOrSavedValue = (user, field) => {
  const profileValue = getProfileValue(user, field)

  if (norm(profileValue)) return profileValue

  const savedData = getCheckoutStorageData()
  return savedData[field] ?? ''
}

const isPlaceholderValue = (value, key) => {
  const v = norm(value).toLowerCase()
  const ph = norm(t(key)).toLowerCase()

  return !!v && v === ph
}

const isLegacyPlaceholder = (value, type) => {
  const v = norm(value).toLowerCase()

  if (type === 'name') return v === 'name'
  if (type === 'surname') return v === 'surname'

  return false
}

const sanitizeName = value =>
  isPlaceholderValue(value, 'Name') || isLegacyPlaceholder(value, 'name')
    ? ''
    : norm(value)

const sanitizeSurname = value =>
  isPlaceholderValue(value, 'Surname') || isLegacyPlaceholder(value, 'surname')
    ? ''
    : norm(value)

const normCode = code =>
  String(code || '')
    .toLowerCase()
    .trim()

const isApplePay = code => {
  const c = normCode(code)
  return ['apple_pay', 'apple-pay', 'applepay'].includes(c)
}

const isGooglePay = code => {
  const c = normCode(code)
  return ['google_pay', 'google-pay', 'googlepay'].includes(c)
}

const isCard = code => {
  return normCode(code) === 'creditdebit-card'
}

const paymentMethods = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  const currentCurrency = currencyCode.value

  const filtered = methods.filter(method => {
    if (!method.currencies || method.currencies.length === 0) return true
    return method.currencies.includes(currentCurrency)
  })

  const google = filtered.filter(method => isGooglePay(method.code))
  const apple = filtered.filter(method => isApplePay(method.code))
  const card = filtered.filter(method => isCard(method.code))

  const rest = filtered.filter(method => {
    const code = normCode(method.code)

    return ![
      'balance',
      'creditdebit-card',
      'google-pay',
      'google_pay',
      'googlepay',
      'apple-pay',
      'apple_pay',
      'applepay',
    ].includes(code)
  })

  return [...card, ...google, ...apple, ...rest]
})

const isValidPhone = phone => {
  const p = norm(phone)
  const digits = p.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) return false
  if (!/^[+0-9()\-\s]+$/.test(p)) return false

  return true
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'tradeLink') {
    if (!norm(form.tradeLink)) {
      errors.tradeLink = t('Steam trade link is required')
    }

    return
  }

  if (field === 'name') {
    if (!norm(form.name)) errors.name = t('Name is required')
    else if (!nameRe.test(norm(form.name))) errors.name = t('Invalid name')
    return
  }

  if (field === 'surname') {
    if (!norm(form.surname)) errors.surname = t('Surname is required')
    else if (!nameRe.test(norm(form.surname))) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    if (!form.email) errors.email = t('Email is required')
    else if (!emailRe.test(form.email)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!form.phone) errors.phone = t('Phone number is required')
    else if (!isValidPhone(form.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !form.country) {
    errors.country = t('Country is required')
  }

  if (field === 'city' && !form.city) {
    errors.city = t('City is required')
  }

  if (field === 'address' && !form.address) {
    errors.address = t('Address is required')
  }

  if (field === 'postCode' && !form.postCode) {
    errors.postCode = t('Post Code is required')
  }

  if (field === 'termsAccepted' && !form.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
  }
}

const validateForm = () => {
  clearErrors()

  validateField('tradeLink')
  validateField('name')
  validateField('surname')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('termsAccepted')

  const hasErrors = Object.values(errors).some(Boolean)

  if (!localFiatAmount.value || localFiatAmount.value <= 0) {
    submitError.value = t('Invalid top up amount')
    return false
  }

  if (hasErrors) {
    submitError.value = t('Please fill in all required fields correctly.')
    return false
  }

  return true
}

const canSubmit = computed(() => {
  return (
    localFiatAmount.value > 0 &&
    norm(form.tradeLink) &&
    norm(form.name) &&
    norm(form.surname) &&
    emailRe.test(form.email) &&
    isValidPhone(form.phone) &&
    form.country &&
    form.city &&
    form.address &&
    form.postCode &&
    form.termsAccepted
  )
})

const prefillForm = () => {
  const user = userStore.user || {}
  const savedData = getCheckoutStorageData()

  form.name = sanitizeName(user.name || savedData.name || '')
  form.surname = sanitizeSurname(user.surname || savedData.surname || '')
  form.email = user.email || savedData.email || ''
  form.phone = user.phone || savedData.phone || ''

  form.tradeLink = getUserOrSavedValue(user, 'tradeLink')
  form.country = getUserOrSavedValue(user, 'country')
  form.city = getUserOrSavedValue(user, 'city')
  form.address = getUserOrSavedValue(user, 'address')
  form.postCode = getUserOrSavedValue(user, 'postCode')

  form.termsAccepted = false

  clearErrors()
}

const submitWithMethod = async methodCode => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  selectedPaymentMethod.value = methodCode

  saveCheckoutStorageData()

  topupStore.clearError?.()
  topupStore.setAmount?.(receiveCredits.value)
  topupStore.setPaymentType?.(methodCode)

  try {
    const response = await topupStore.checkout({
      steamTradeLink: norm(form.tradeLink),
      tradeLink: norm(form.tradeLink),
      tradeUrl: norm(form.tradeLink),
      name: norm(form.name),
      surname: norm(form.surname),
      email: form.email,
      phone: form.phone,
      country: form.country,
      city: form.city,
      address: form.address,
      postCode: form.postCode,
      currency: currencyCode.value,
      amount: localFiatAmount.value,
      paymentType: methodCode,
    })

    if (response?.redirect_url) {
      window.location.href = response.redirect_url
      return
    }

    emit('success-close')
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to create top up payment')
  } finally {
    selectedPaymentMethod.value = null
  }
}

const initTopUp = async () => {
  await Promise.all([
    ensurePages(),
    settingsStore.fetchSettings?.(),
    countriesStore.fetchCountries?.(),
    userStore.fetchProfile?.(),
  ])

  prefillForm()
  selectedPaymentMethod.value = null
}

watch(() => savedFields.map(field => form[field]), saveCheckoutStorageData)

watch(
  () => form.termsAccepted,
  () => validateField('termsAccepted'),
)

watch(
  () => form.country,
  () => validateField('country'),
)

onMounted(async () => {
  await initTopUp()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.balance {
  @media (min-width: $md2) {
    display: flex;
    @include adaptiveValue('gap', 14, 10, 1400, 992, 1);
  }
  @media (max-width: $md2) {
    display: block !important;
  }
  &__back {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__inner {
    flex: 1 1 auto;
    width: 100%;
  }

  &__block {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__item {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    align-items: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__title {
  }

  &__rate {
    display: flex;
    gap: 12px;
    color: var(--primary-color) !important;
  }

  &__label {
    white-space: nowrap;
  }

  &__prices {
  }

  &__coin {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 10);
    }
  }

  &__fiat {
    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--secondary-color);
    }
  }

  &__form {
  }
}

.back {
  min-width: 62px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 4px;
  background-color: var(--bg-secondary-color);
  color: var(--primary-color);

  padding: 4px 6px;
  cursor: pointer;

  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:hover {
      color: var(--hint-primary-color);

      .balance__back-text {
        color: var(--hint-primary-color);
      }
    }
  }

  &__icon {
    min-width: 10px;
    height: 9px;
    transform: rotate(-180deg);
  }

  &__text {
    color: var(--secondary-color);
    transition: color 0.3s ease 0s;
  }
}

.checkout {
  &__block {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__box {
  }

  &__subtitle {
    line-height: 30px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 20);
    }
  }

  &__row {
    display: flex;
    gap: 14px;

    @media (max-width: $md6) {
      display: block;
    }
  }

  &__input {
    flex: 1 1 auto;

    &:not(:last-child) {
      margin-bottom: 14px;
    }

    &_small {
      max-width: 148px;
      min-width: 100px;

      @media (max-width: $md6) {
        max-width: none;
      }
    }
  }

  &__checkbox {
  }

  &__error {
    margin-bottom: 8px;
  }

  &__methods {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('margin-left', -12, -2);
    @include adaptiveValue('margin-right', -12, -2);
    @include adaptiveValue('row-gap', 24, 4);
  }

  &__method {
    flex: 0 1 50%;
    @include adaptiveValue('padding-left', 12, 2);
    @include adaptiveValue('padding-right', 12, 2);

    @media (max-width: $md7) {
      flex: 1 1 100%;
    }
  }

  &__submit {
    display: flex;
    gap: 10px;
    min-height: 52px;
    width: 100%;

    :deep(.btn__text) {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    &_image {
      position: relative;
      :deep(.btn__text) {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
      .checkout__submit-image {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }
}
</style>
