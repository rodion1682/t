<template>
  <div class="topup-form">
    <div class="topup-form__inner">
      <div class="topup-form__block">
        <div class="topup-form__subtitle _l">
          <span>{{ $t('Payment information') }}</span>
        </div>

        <div class="topup-form__content">
          <div class="topup-form__row">
            <BaseInput
              v-model="form.name"
              :placeholder="$t('Name')"
              :error="errors.name"
              :disabled="topupStore.isLoading"
              class="topup-form__input"
              @blur="validateField('name')"
            />
            <BaseInput
              v-model="form.surname"
              :placeholder="$t('Surname')"
              :error="errors.surname"
              :disabled="topupStore.isLoading"
              class="topup-form__input"
              @blur="validateField('surname')"
            />
          </div>

          <BaseInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            :placeholder="$t('Email')"
            :error="errors.email"
            :disabled="topupStore.isLoading"
            class="topup-form__input"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            :placeholder="$t('Phone')"
            :error="errors.phone"
            :disabled="topupStore.isLoading"
            class="topup-form__input"
            @blur="validateField('phone')"
          />

          <BaseSelect
            v-model="form.country"
            :options="countryOptions"
            optionLabel="title"
            optionValue="id"
            :placeholder="$t('Country')"
            :error="errors.country"
            :disabled="topupStore.isLoading"
            class="topup-form__input"
            @blur="validateField('country')"
          />

          <div class="topup-form__row">
            <BaseInput
              v-model="form.city"
              :placeholder="$t('City')"
              :error="errors.city"
              :disabled="topupStore.isLoading"
              class="topup-form__input"
              @blur="validateField('city')"
            />
            <BaseInput
              v-model="form.postCode"
              :placeholder="$t('Post Code')"
              :error="errors.postCode"
              :disabled="topupStore.isLoading"
              class="topup-form__input"
              @blur="validateField('postCode')"
            />
          </div>

          <BaseInput
            v-model="form.address"
            :placeholder="$t('Address')"
            :error="errors.address"
            :disabled="topupStore.isLoading"
            class="topup-form__input"
            @blur="validateField('address')"
          />
        </div>
      </div>

      <div class="topup-form__block">
        <div class="topup-form__subtitle"></div>

        <div class="topup-form__content">
          <BaseCheckbox
            class="topup-form__terms"
            v-model="form.termsAccepted"
            :error="errors.termsAccepted"
            :disabled="topupStore.isLoading"
            terms
          />
        </div>
      </div>

      <div class="topup-form__block">
        <div class="topup-form__subtitle _l">
          <span>{{ $t('Payment Method') }}</span>
        </div>

        <div class="topup-form__content">
          <div v-if="submitError" class="topup-form__error _text-error">
            {{ submitError }}
          </div>

          <div v-if="topupStore.error" class="topup-form__error _text-error">
            {{ topupStore.error }}
          </div>

          <div class="topup-form__methods">
            <div
              class="topup-form__method"
              v-for="(m, index) in paymentMethods"
              :key="m.code"
            >
              <BaseButton
                type="button"
                :variant="
                  index === paymentMethods.length - 1 ? 'primary' : 'white'
                "
                class="topup-form__submit"
                :disabled="topupStore.isLoading || !canSubmit"
                @click="submitWithMethod(m.code)"
              >
                <span
                  v-if="m.image"
                  class="topup-form__submit-image _ibg-contain"
                >
                  <img :src="m.image" :alt="m.title" />
                </span>
                <span v-else class="topup-form__submit-name">
                  {{ m.title }}
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

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  selectedAmount: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['back', 'success'])

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'
const savedFields = ['country', 'city', 'address', 'postCode']

const { t } = useI18n()

const topupStore = useTopUpStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()
const { ensurePages } = useStaticPages()

const norm = v => String(v ?? '').trim()

const getCheckoutStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutStorage = data => {
  const current = getCheckoutStorage()

  localStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify({
      ...current,
      ...data,
    }),
  )
}

const isPlaceholderValue = (value, placeholderKey) => {
  const v = norm(value).toLowerCase()
  const ph = norm(t(placeholderKey)).toLowerCase()
  return !!v && v === ph
}

const isLegacyPlaceholder = value => {
  const v = norm(value).toLowerCase()
  return v === 'name' || v === 'surname'
}

const sanitizeName = v =>
  isPlaceholderValue(v, 'Name') || isLegacyPlaceholder(v) ? '' : norm(v)

const sanitizeSurname = v =>
  isPlaceholderValue(v, 'Surname') || isLegacyPlaceholder(v) ? '' : norm(v)

const currency = computed(() => currencyStore.currentCurrency || {})
const currencyCode = computed(
  () => currency.value?.code || currencyStore.currentCurrencyCode || '',
)
const currencySymbol = computed(
  () => currency.value?.symbol || currencyStore.currentCurrencySymbol || '',
)

const localFiatAmount = ref(0)
const submitError = ref('')
const amountError = ref('')

const normalizeAmount = v => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isNaN(n) ? 0 : n
}

const minFiatAmount = computed(() => Number(settingsStore.minTopUpAmount || 0))
const maxFiatAmount = computed(() => Number(settingsStore.maxTopUpAmount || 0))

const receiveCredits = computed(() => {
  const credits = currencyStore.fiatToCredits(localFiatAmount.value)
  return Number(credits) || 0
})

const hasValidAmount = computed(() => {
  const v = Number(localFiatAmount.value) || 0
  if (!v || v <= 0) return false
  if (minFiatAmount.value && v < minFiatAmount.value) return false
  if (maxFiatAmount.value && v > maxFiatAmount.value) return false
  return true
})

const currencyMatch = (m, cur) => {
  if (!m?.currencies || m.currencies.length === 0) return true
  return m.currencies.includes(cur)
}

const paymentMethods = computed(() => {
  const list = settingsStore.settings?.payment_methods || []
  const cur = currencyCode.value

  return list
    .filter(m => currencyMatch(m, cur))
    .map(m => ({
      code: m.code,
      title: m.title,
      image: m.image,
    }))
})

const countryOptions = computed(() => countriesStore.countries || [])

const form = reactive({
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

const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const getUserOrSavedValue = (user, field) => {
  const storage = getCheckoutStorage()

  const map = {
    name: sanitizeName(user?.name || ''),
    surname: sanitizeSurname(user?.surname || ''),
    email: user?.email,
    phone: user?.phone,
    country: user?.country_id || user?.country,
    city: user?.city,
    address: user?.address,
    postCode: user?.zip || user?.post_code,
  }

  const userValue = map[field]

  if (norm(userValue)) return userValue

  if (savedFields.includes(field)) {
    return storage[field] || ''
  }

  return ''
}

const prefillForm = () => {
  const u = userStore.user || {}

  form.name = getUserOrSavedValue(u, 'name')
  form.surname = getUserOrSavedValue(u, 'surname')
  form.email = getUserOrSavedValue(u, 'email')
  form.phone = getUserOrSavedValue(u, 'phone')
  form.country = getUserOrSavedValue(u, 'country')
  form.city = getUserOrSavedValue(u, 'city')
  form.address = getUserOrSavedValue(u, 'address')
  form.postCode = getUserOrSavedValue(u, 'postCode')
  form.termsAccepted = false

  Object.keys(errors).forEach(k => {
    errors[k] = ''
  })

  submitError.value = ''
}

const savePrefillForm = () => {
  saveCheckoutStorage({
    country: form.country,
    city: form.city,
    address: form.address,
    postCode: form.postCode,
  })
}

const validateAmount = value => {
  const amount = Number(value)
  const min = Number(minFiatAmount.value || 0)
  const max = Number(maxFiatAmount.value || 0)
  const cur = currencySymbol.value

  if (!value && value !== 0) {
    amountError.value = ''
    return false
  }

  if (Number.isNaN(amount)) {
    amountError.value = t('Amount must be a number')
    return false
  }

  if (min && amount < min) {
    amountError.value =
      t('Amount must be higher then') + ` ${min.toFixed(2)}${cur}`
    return false
  }

  if (max && amount > max) {
    amountError.value =
      t('Amount must be lower then') + ` ${max.toFixed(2)}${cur}`
    return false
  }

  amountError.value = ''
  return true
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name') {
    const v = sanitizeName(form.name)
    if (!v) return (errors.name = t('Name is required'))
    if (!nameRe.test(v)) return (errors.name = t('Invalid name'))
    return
  }

  if (field === 'surname') {
    const v = sanitizeSurname(form.surname)
    if (!v) return (errors.surname = t('Surname is required'))
    if (!nameRe.test(v)) return (errors.surname = t('Invalid surname'))
    return
  }

  if (field === 'email') {
    if (!form.email) return (errors.email = t('Email is required'))
    if (!emailRe.test(form.email)) {
      return (errors.email = t('Invalid email format'))
    }
    return
  }

  if (field === 'phone') {
    if (!form.phone) return (errors.phone = t('Phone number is required'))
    return
  }

  if (field === 'country') {
    if (!form.country) return (errors.country = t('Country is required'))
    return
  }

  if (field === 'city') {
    if (!form.city) return (errors.city = t('City is required'))
    return
  }

  if (field === 'address') {
    if (!form.address) return (errors.address = t('Address is required'))
    return
  }

  if (field === 'postCode') {
    if (!form.postCode) return (errors.postCode = t('Post Code is required'))
    return
  }

  if (field === 'termsAccepted') {
    if (!form.termsAccepted) {
      return (errors.termsAccepted = t('You must accept the terms'))
    }
  }
}

const validateForm = () => {
  submitError.value = ''

  validateField('name')
  validateField('surname')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('termsAccepted')
  validateAmount(localFiatAmount.value)

  const hasFieldErrors = Object.values(errors).some(Boolean)

  if (hasFieldErrors || amountError.value) {
    submitError.value = t('Please fix form errors')
    return false
  }

  return true
}

const isFormComplete = computed(() => {
  const nameOk = !!sanitizeName(form.name) && !errors.name
  const surnameOk = !!sanitizeSurname(form.surname) && !errors.surname
  const emailOk = !!form.email && emailRe.test(form.email) && !errors.email
  const phoneOk = !!form.phone && !errors.phone

  return (
    hasValidAmount.value &&
    nameOk &&
    surnameOk &&
    emailOk &&
    phoneOk &&
    !!form.country &&
    !!form.city &&
    !!form.address &&
    !!form.postCode &&
    !!form.termsAccepted
  )
})

const canSubmit = computed(() => hasValidAmount.value && isFormComplete.value)

const submitWithMethod = async methodCode => {
  submitError.value = ''
  topupStore.clearError?.()

  if (!validateForm()) return

  topupStore.setPaymentType(methodCode)

  try {
    const amount = Number(props.selectedAmount)

    const res = await topupStore.checkout({
      name: sanitizeName(form.name),
      surname: sanitizeSurname(form.surname),
      email: form.email,
      phone: form.phone,
      country: form.country,
      city: form.city,
      address: form.address,
      postCode: form.postCode,
      currency: currencyCode.value,
      amount,
      paymentType: methodCode,
    })

    savePrefillForm()

    if (res?.redirect_url) {
      window.location.href = res.redirect_url
      return
    }

    emit('success')
  } catch {}
}

watch(
  () => props.selectedAmount,
  value => {
    localFiatAmount.value = normalizeAmount(value)
    validateAmount(localFiatAmount.value)
  },
  { immediate: true },
)

watch(() => savedFields.map(field => form[field]), savePrefillForm)

watch(
  () => form.name,
  () => validateField('name'),
)
watch(
  () => form.surname,
  () => validateField('surname'),
)
watch(
  () => form.email,
  () => validateField('email'),
)
watch(
  () => form.phone,
  () => validateField('phone'),
)
watch(
  () => form.country,
  () => validateField('country'),
)
watch(
  () => form.city,
  () => validateField('city'),
)
watch(
  () => form.address,
  () => validateField('address'),
)
watch(
  () => form.postCode,
  () => validateField('postCode'),
)
watch(
  () => form.termsAccepted,
  () => validateField('termsAccepted'),
)

watch(
  () => localFiatAmount.value,
  value => validateAmount(value),
)

watch(
  () => userStore.user,
  () => {
    prefillForm()
  },
  { deep: true },
)

onMounted(async () => {
  if (!settingsStore.settings) await settingsStore.fetchSettings?.()
  if (!countriesStore.countries?.length) await countriesStore.fetchCountries?.()
  await userStore.fetchProfile?.()
  await ensurePages()

  prefillForm()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.topup-form {
  @include adaptiveValue('margin-top', 43, 20);
  @include adaptiveValue('padding-bottom', 140, 35);

  &__top {
    display: flex;
    @include adaptiveValue('gap', 32, 20);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 45, 20);
    }
  }

  &__back {
    border-radius: 50%;
    min-width: 40px;
    max-width: 40px;
    height: 40px;

    &-icon {
      min-width: 19px;
      height: 19px;
      transform: rotate(-180deg);
    }
  }

  &__title {
    align-self: center;
  }

  &__inner {
    max-width: 1006px;
    margin: 0 auto;
    overflow: hidden;
    @include adaptiveValue('border-radius', 12, 10);
    position: relative;
    @include adaptiveValue('padding-top', 43, 15);
    @include adaptiveValue('padding-bottom', 43, 15);
    @include adaptiveValue('padding-left', 48, 10, 1280, 768, 1);
    @include adaptiveValue('padding-right', 48, 10, 1280, 768, 1);

    &::after {
      content: '';
      position: absolute;
      inset: 1px;
      z-index: -1;
      border-radius: inherit;
      backdrop-filter: blur(26.8px);
      -webkit-backdrop-filter: blur(26.8px);
      opacity: 0.6;
      background: linear-gradient(180deg, #2a2a2a 0%, #131313 100%);
    }

    @media (max-width: $md3) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__block {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 43, 25);
    }

    @media (min-width: $md6) {
      display: flex;
      @include adaptiveValue('gap', 70, 20, 1820, 768, 1);
    }
  }

  &__subtitle {
    flex: 0 1 52%;

    span {
      text-align: right;
      display: block;
      font-weight: 700;
      font-size: 14px;
      line-height: 19px;
      @include adaptiveValue('padding-bottom', 23, 15);
      @media (min-width: $md6) {
        border-bottom: 1px solid var(--bg-secondary-color);
      }
    }

    @media (max-width: $md4) {
      flex: 0 1 40%;
      min-width: 180px;
    }

    @media (max-width: $md6) {
      span {
        padding-bottom: 10px;
        text-align: left;
      }
    }
  }

  &__content {
    flex: 0 1 48%;
    margin-left: auto;

    @media (max-width: $md4) {
      flex: 0 1 60%;
    }
  }

  &__row {
    @media (min-width: $md4) or (max-width: $md6) {
      display: flex;
      @include adaptiveValue('gap', 14, 10);
    }
  }

  &__input {
    :deep(.base-select),
    :deep(.base-input) {
      border: 1px solid var(--bg-secondary-color);

      &:focus,
      &:focus-within {
        border: 1px solid var(--hint-color);
      }
    }

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__terms {
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__methods {
    @media (min-width: $md3) or ((max-width: $md6) and (min-width: $md7)) {
      display: flex;
      flex-wrap: wrap;
      @include adaptiveValue('margin-left', -10, -2, 1280, 768, 1);
      @include adaptiveValue('margin-right', -10, -2, 1280, 768, 1);
      @include adaptiveValue('row-gap', 18, 4, 1280, 768, 1);
    }
  }

  &__method {
    @media (min-width: $md3) or ((max-width: $md6) and (min-width: $md7)) {
      flex: 0 1 50%;
      width: 100%;
      @include adaptiveValue('padding-left', 10, 2, 1280, 768, 1);
      @include adaptiveValue('padding-right', 10, 2, 1280, 768, 1);
    }

    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }
  }

  &__submit {
    position: relative;
    z-index: 1;
    width: 100%;
    @include adaptiveValue('min-height', 46, 45);

    &-image {
      width: fit-content;
      min-width: 55px;
      height: 22px;
    }
  }
}
</style>
