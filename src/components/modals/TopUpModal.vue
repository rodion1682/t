<template>
  <BaseModal
    :show="show"
    :wrapper-classes="['top-up-modal__inner']"
    @close="handleClose"
  >
    <div class="top-up">
      <div class="top-up__title _h3">
        {{ $t('Top up balance') }}
      </div>

      <div class="top-up__inputs">
        <div class="top-up__box">
          <BaseInput
            v-if="IS_COMBINED_NAME_AND_SURNAME"
            v-model="form.fullName"
            :label="$t('Full name')"
            :error="errors.fullName"
            class="top-up__input"
            name="fullName"
            autocomplete="name"
            :disabled="isSubmitting"
            @blur="validateField('fullName')"
          />

          <template v-else>
            <BaseInput
              v-model="form.name"
              :label="$t('Name')"
              :error="errors.name"
              class="top-up__input"
              name="name"
              autocomplete="given-name"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="form.surname"
              :label="$t('Surname')"
              :error="errors.surname"
              class="top-up__input"
              name="surname"
              autocomplete="family-name"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />
          </template>

          <BaseInput
            v-model="form.email"
            :label="$t('E-mail')"
            type="email"
            name="email"
            autocomplete="email"
            :error="errors.email"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="form.phone"
            :label="$t('Phone')"
            type="tel"
            name="phone"
            inputmode="tel"
            autocomplete="tel"
            :error="errors.phone"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />
        </div>

        <div class="top-up__box">
          <BaseSelect
            v-model="form.country"
            :options="countryOptions"
            option-label="title"
            option-value="id"
            :label="$t('Country')"
            :error="errors.country"
            :disabled="isSubmitting"
            class="top-up__input"
          />

          <BaseInput
            v-model="form.city"
            :label="$t('City')"
            :error="errors.city"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="form.address"
            :label="$t('Address')"
            :error="errors.address"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.postCode"
            :label="$t('Postcode')"
            :error="errors.postCode"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </div>
      </div>
      <div class="top-up__info">
        <BaseCheckbox
          v-model="form.termsAccepted"
          :error="errors.termsAccepted"
          :disabled="isSubmitting"
          class="top-up__checkbox"
          terms
        />
        <div
          v-if="formattedRequisites"
          class="top-up__requisites"
          v-html="formattedRequisites"
        />
      </div>

      <div v-if="submitError" class="top-up__error _text-error">
        {{ submitError }}
      </div>

      <div v-if="topupStore.error" class="top-up__error _text-error">
        {{ topupStore.error }}
      </div>

      <div class="top-up__total">
        <div class="top-up__total-label">{{ $t('Total to pay:') }}</div>
        <div class="top-up__prices">
          <PriceFormatter
            :price="receiveCredits"
            skip-conversion
            reverse
            class="top-up__coin"
          />
          <PriceFormatter
            is-currency
            raw-fiat
            reverse
            skip-conversion
            :price="localFiatAmount"
            :currency-code="currencyCode"
            class="top-up__fiat"
          />
        </div>
      </div>

      <div class="top-up__methods">
        <div
          v-for="(method, index) in paymentMethods"
          :key="method.code"
          class="top-up__method"
          :class="{
            'top-up__method_full': index === 0,
            'top-up__method_image': Boolean(method.image),
          }"
        >
          <BaseButton
            type="button"
            :variant="index === 0 ? 'white-bordered' : 'white'"
            class="top-up__submit"
            :loading="isSubmitting && selectedPaymentMethod === method.code"
            :disabled="isSubmitting || !canSubmit"
            @click="submitWithMethod(method.code)"
          >
            <span v-if="method.image" class="top-up__submit-image _ibg-contain">
              <img :src="method.image" :alt="method.title" />
            </span>

            <span v-else>
              {{ method.title }}
            </span>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const IS_COMBINED_NAME_AND_SURNAME = false

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  selectedAmount: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['close'])

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
  fullName: '',
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
  fullName: '',
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
const nameRe = /^[\p{L}][\p{L}\p{M}' -]*$/u

const savedFields = ['country', 'city', 'address', 'postCode']

const isSubmitting = computed(() => {
  return topupStore.isLoading
})

const formattedRequisites = computed(() => {
  return settingsStore.requisites
    ? settingsStore.requisites.replace(/\n/g, '<br>')
    : ''
})

const currency = computed(() => {
  return currencyStore.currentCurrency || {}
})

const currencyCode = computed(() => {
  return currency.value?.code || currencyStore.currentCurrencyCode || 'EUR'
})

const localFiatAmount = computed(() => {
  const value = Number(props.selectedAmount || 0)

  return Number.isFinite(value) ? value : 0
})

const receiveCredits = computed(() => {
  const amount = localFiatAmount.value
  const currencyValue = Number(currency.value?.value || 1)

  if (!Number.isFinite(currencyValue) || currencyValue <= 0) {
    return 0
  }

  return Number((amount / currencyValue).toFixed(2))
})

const countryOptions = computed(() => {
  return countriesStore.countries || []
})

const splitFullName = fullName => {
  const parts = norm(fullName).split(/\s+/).filter(Boolean)

  return {
    name: parts[0] || '',
    surname: parts.slice(1).join(' ') || '',
  }
}

const getNameData = () => {
  if (IS_COMBINED_NAME_AND_SURNAME) {
    return splitFullName(form.fullName)
  }

  return {
    name: norm(form.name),
    surname: norm(form.surname),
  }
}

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
    country: user.country?.id || user.country_id || user.country,

    city: user.city,
    address: user.address,

    postCode: user.zip || user.post_code || user.postCode,
  }

  return map[field] ?? ''
}

const getUserOrSavedValue = (user, field) => {
  const profileValue = getProfileValue(user, field)

  if (norm(profileValue)) {
    return profileValue
  }

  const savedData = getCheckoutStorageData()

  return savedData[field] ?? ''
}

const isPlaceholderValue = (value, key) => {
  const currentValue = norm(value).toLowerCase()
  const placeholder = norm(t(key)).toLowerCase()

  return Boolean(currentValue && currentValue === placeholder)
}

const isLegacyPlaceholder = (value, type) => {
  const currentValue = norm(value).toLowerCase()

  if (type === 'name') {
    return currentValue === 'name'
  }

  if (type === 'surname') {
    return currentValue === 'surname'
  }

  return false
}

const sanitizeName = value => {
  if (isPlaceholderValue(value, 'Name') || isLegacyPlaceholder(value, 'name')) {
    return ''
  }

  return norm(value)
}

const sanitizeSurname = value => {
  if (
    isPlaceholderValue(value, 'Surname') ||
    isLegacyPlaceholder(value, 'surname')
  ) {
    return ''
  }

  return norm(value)
}

const normCode = code => {
  return String(code || '')
    .toLowerCase()
    .trim()
}

const isApplePay = code => {
  return ['apple_pay', 'apple-pay', 'applepay'].includes(normCode(code))
}

const isGooglePay = code => {
  return ['google_pay', 'google-pay', 'googlepay'].includes(normCode(code))
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
    if (!method.currencies?.length) {
      return true
    }

    return method.currencies.includes(currentCurrency)
  })

  const card = filtered.filter(method => {
    return isCard(method.code)
  })

  const apple = filtered.filter(method => {
    return isApplePay(method.code)
  })

  const google = filtered.filter(method => {
    return isGooglePay(method.code)
  })

  const rest = filtered.filter(method => {
    return ![
      'balance',
      'creditdebit-card',
      'google-pay',
      'google_pay',
      'googlepay',
      'apple-pay',
      'apple_pay',
      'applepay',
    ].includes(normCode(method.code))
  })

  return [...card, ...apple, ...google, ...rest]
})

const isValidPhone = phone => {
  const normalizedPhone = norm(phone)
  const digits = normalizedPhone.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) {
    return false
  }

  return /^[+0-9()\-\s]+$/.test(normalizedPhone)
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'fullName') {
    const { name, surname } = splitFullName(form.fullName)

    if (!name || !surname) {
      errors.fullName = t('Please enter your full name')

      return
    }

    if (!nameRe.test(name) || !nameRe.test(surname)) {
      errors.fullName = t('Invalid full name')
    }

    return
  }

  if (field === 'name') {
    const name = norm(form.name)

    if (!name) {
      errors.name = t('First name is required')
      return
    }

    if (!nameRe.test(name)) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'surname') {
    const surname = norm(form.surname)

    if (!surname) {
      errors.surname = t('Last name is required')
      return
    }

    if (!nameRe.test(surname)) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    const email = norm(form.email)

    if (!email) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRe.test(email)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!norm(form.phone)) {
      errors.phone = t('Phone number is required')

      return
    }

    if (!isValidPhone(form.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !form.country) {
    errors.country = t('Country is required')
  }

  if (field === 'city' && !norm(form.city)) {
    errors.city = t('City is required')
  }

  if (field === 'address' && !norm(form.address)) {
    errors.address = t('Address is required')
  }

  if (field === 'postCode' && !norm(form.postCode)) {
    errors.postCode = t('Post Code is required')
  }

  if (field === 'termsAccepted' && !form.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
  }
}

const validateForm = () => {
  clearErrors()

  if (IS_COMBINED_NAME_AND_SURNAME) {
    validateField('fullName')
  } else {
    validateField('name')
    validateField('surname')
  }

  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('termsAccepted')

  if (!localFiatAmount.value || localFiatAmount.value <= 0) {
    submitError.value = t('Invalid top up amount')

    return false
  }

  const hasErrors = Object.values(errors).some(Boolean)

  if (hasErrors) {
    submitError.value = t('Please fill in all required fields correctly.')

    return false
  }

  return true
}

const isNameComplete = computed(() => {
  if (IS_COMBINED_NAME_AND_SURNAME) {
    const { name, surname } = splitFullName(form.fullName)

    return Boolean(name && surname && nameRe.test(name) && nameRe.test(surname))
  }

  return Boolean(
    nameRe.test(norm(form.name)) && nameRe.test(norm(form.surname)),
  )
})

const canSubmit = computed(() => {
  return Boolean(
    localFiatAmount.value > 0 &&
    isNameComplete.value &&
    emailRe.test(norm(form.email)) &&
    isValidPhone(form.phone) &&
    form.country &&
    norm(form.city) &&
    norm(form.address) &&
    norm(form.postCode) &&
    form.termsAccepted,
  )
})

const prefillForm = () => {
  const user = userStore.user || {}
  const savedData = getCheckoutStorageData()

  const name = sanitizeName(user.name || savedData.name || '')

  const surname = sanitizeSurname(user.surname || savedData.surname || '')

  form.name = name
  form.surname = surname

  form.fullName = [name, surname].filter(Boolean).join(' ')

  form.email = user.email || savedData.email || ''

  form.phone = user.phone || savedData.phone || ''

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

  const { name, surname } = getNameData()

  try {
    const response = await topupStore.checkout({
      name: sanitizeName(name),
      surname: sanitizeSurname(surname),

      email: norm(form.email),
      phone: norm(form.phone),

      country: form.country,
      city: norm(form.city),
      address: norm(form.address),
      postCode: norm(form.postCode),

      currency: currencyCode.value,
      amount: localFiatAmount.value,
      paymentType: methodCode,
    })

    if (response?.redirect_url) {
      window.location.href = response.redirect_url

      return
    }

    emit('close')
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

const handleClose = () => {
  if (isSubmitting.value) return

  emit('close')
}

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) return

    await initTopUp()
  },
)

watch(() => savedFields.map(field => form[field]), saveCheckoutStorageData)

watch(
  () => form.country,
  () => {
    if (form.country) {
      errors.country = ''
    }
  },
)

watch(
  () => form.termsAccepted,
  () => {
    validateField('termsAccepted')
  },
)

onMounted(async () => {
  if (props.show) {
    await initTopUp()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.top-up {
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__box {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    @include adaptiveValue('gap', 20, 18);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__input {
  }

  &__info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    @include adaptiveValue('gap', 20, 10);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__checkbox {
  }

  &__requisites {
    line-height: 170%;
    color: var(--third-color);
  }

  &__error {
    margin-bottom: 8px;
  }

  &__total {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
    &-label {
    }
  }

  &__prices {
    line-height: 120% !important;
  }

  &__coin {
    color: var(--primary-color);
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__fiat {
  }

  &__methods {
    width: 100%;

    display: flex;
    flex-wrap: wrap;

    @include adaptiveValue('row-gap', 20, 10);
    @include adaptiveValue('margin-left', -10, -5);
    @include adaptiveValue('margin-right', -10, -5);
  }

  &__method {
    position: relative;

    flex: 0 1 33.333%;

    width: 100%;
    height: fit-content;

    @include adaptiveValue('padding-left', 10, 5);
    @include adaptiveValue('padding-right', 10, 5);

    &_full {
    }
    @media (max-width: $md3) {
      flex: 0 1 50%;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }

    &_image {
      :deep(.top-up__submit) {
        position: relative;
        overflow: hidden;
      }

      :deep(.top-up__submit .btn__text) {
        position: absolute;

        inset: 0;

        width: 100%;
        height: 100%;
      }
    }

    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__submit {
    width: 100%;

    &-image {
      position: absolute;

      inset: 0;

      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;

        object-fit: contain;
      }
    }
  }
}
</style>
