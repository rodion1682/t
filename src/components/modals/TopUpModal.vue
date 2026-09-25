<template>
  <BaseModal
    :show="show"
    :wrapper-classes="['top-up-modal__inner']"
    @close="handleClose"
  >
    <div class="top-up">
      <div class="top-up__head">
        <h2 class="top-up__title">
          {{ $t('Top Up Balance') }}
        </h2>
      </div>

      <div class="top-up__amount">
        <BaseInput
          v-model="amountInput"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          :label="$t('Amount')"
          :placeholder="`0.00 ${currencyCode}`"
          :error="amountError"
          :disabled="isSubmitting"
          @input="handleAmountInput"
          @blur="validateAmount"
        />

        <div v-if="minTopUpAmount > 0" class="top-up__minimum">
          {{ $t('Minimum top up') }}: {{ formatAmount(minTopUpAmount) }}
          {{ currencySymbol }}
        </div>
      </div>

      <div class="top-up__divider"></div>

      <div class="top-up__details">
        <div class="top-up__details-title">
          {{ $t('Billing information') }}
        </div>

        <div class="top-up__grid">
          <BaseInput
            v-model="form.name"
            :label="$t('Name')"
            :error="errors.name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />

          <BaseInput
            v-model="form.surname"
            :label="$t('Surname')"
            :error="errors.surname"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />

          <BaseInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            :label="$t('E-mail')"
            :error="errors.email"
            :disabled="isSubmitting"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            :label="$t('Phone')"
            :error="errors.phone"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />

          <BaseSelect
            v-model="form.country"
            :options="countryOptions"
            option-label="title"
            option-value="id"
            :label="$t('Country')"
            :error="errors.country"
            :disabled="isSubmitting"
            @blur="validateField('country')"
          />

          <BaseInput
            v-model="form.address"
            :label="$t('Address')"
            :error="errors.address"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.city"
            :label="$t('City')"
            :error="errors.city"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="form.postCode"
            :label="$t('ZIP-code')"
            :error="errors.postCode"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </div>
      </div>

      <BaseCheckbox
        class="top-up__terms"
        v-model="form.termsAccepted"
        :error="errors.termsAccepted"
        :disabled="isSubmitting"
        terms
      >
      </BaseCheckbox>

      <div v-if="submitError || topupStore.error" class="top-up__error">
        {{ submitError || topupStore.error }}
      </div>

      <div class="top-up__summary">
        <div class="top-up__summary-label">
          {{ $t('Total to pay') }}
        </div>

        <div class="top-up__summary-value">
          {{ formatAmount(fiatAmount) }} {{ currencySymbol }}
        </div>
      </div>

      <div class="top-up__actions">
        <BaseButton
          type="button"
          variant="white"
          class="top-up__cancel"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          {{ $t('Cancel') }}
        </BaseButton>

        <BaseButton
          type="button"
          variant="primary"
          class="top-up__submit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ $t('Pay with Card') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:show', 'close'])

const { t } = useI18n()

const topupStore = useTopUpStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const countriesStore = useCountriesStore()
const userStore = useUserStore()

const amountInput = ref('')
const amountError = ref('')
const submitError = ref('')

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
const nameRe = /^[\p{L}][\p{L}\p{M}' -]*$/u

const norm = value => String(value ?? '').trim()

const isSubmitting = computed(() => {
  return topupStore.isLoading
})

const currency = computed(() => {
  return currencyStore.currentCurrency || {}
})

const currencyCode = computed(() => {
  return currency.value?.code || currencyStore.currentCurrencyCode || 'EUR'
})

const currencySymbol = computed(() => {
  return currency.value?.symbol || currencyStore.currentCurrencySymbol || '€'
})

const fiatAmount = computed(() => {
  const value = Number(
    String(amountInput.value || '')
      .replace(',', '.')
      .replace(/[^\d.]/g, ''),
  )

  return Number.isFinite(value) ? value : 0
})

const minTopUpAmount = computed(() => {
  return Number(
    settingsStore.minTopUpAmount ||
      settingsStore.settings?.min_top_up_amount ||
      0,
  )
})

const countryOptions = computed(() => {
  return countriesStore.countries || []
})

const formattedRequisites = computed(() => {
  if (!settingsStore.requisites) {
    return ''
  }

  return settingsStore.requisites.replace(/\n/g, '<br>')
})

const isValidPhone = value => {
  const phone = norm(value)

  if (!phone) {
    return false
  }

  const digits = phone.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) {
    return false
  }

  return /^[+0-9()\-\s]+$/.test(phone)
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  amountError.value = ''
  submitError.value = ''

  topupStore.clearError?.()
}

const validateAmount = () => {
  amountError.value = ''

  if (!fiatAmount.value || fiatAmount.value <= 0) {
    amountError.value = t('Please enter a valid amount')

    return false
  }

  if (minTopUpAmount.value > 0 && fiatAmount.value < minTopUpAmount.value) {
    amountError.value = `${t('Minimum top up')} ${formatAmount(
      minTopUpAmount.value,
    )} ${currencySymbol.value}`

    return false
  }

  return true
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name') {
    if (!norm(form.name)) {
      errors.name = t('First name is required')

      return
    }

    if (!nameRe.test(norm(form.name))) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'surname') {
    if (!norm(form.surname)) {
      errors.surname = t('Last name is required')

      return
    }

    if (!nameRe.test(norm(form.surname))) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    if (!norm(form.email)) {
      errors.email = t('Email is required')

      return
    }

    if (!emailRe.test(norm(form.email))) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!isValidPhone(form.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !form.country) {
    errors.country = t('Country is required')

    return
  }

  if (field === 'city' && !norm(form.city)) {
    errors.city = t('City is required')

    return
  }

  if (field === 'address' && !norm(form.address)) {
    errors.address = t('Address is required')

    return
  }

  if (field === 'postCode' && !norm(form.postCode)) {
    errors.postCode = t('Post Code is required')

    return
  }

  if (field === 'termsAccepted' && !form.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
  }
}

const validateForm = () => {
  clearErrors()

  const validAmount = validateAmount()

  validateField('name')
  validateField('surname')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('termsAccepted')

  return Boolean(validAmount && !Object.values(errors).some(Boolean))
}

const canSubmit = computed(() => {
  return Boolean(
    !isSubmitting.value &&
    fiatAmount.value > 0 &&
    (!minTopUpAmount.value || fiatAmount.value >= minTopUpAmount.value) &&
    nameRe.test(norm(form.name)) &&
    nameRe.test(norm(form.surname)) &&
    emailRe.test(norm(form.email)) &&
    isValidPhone(form.phone) &&
    form.country &&
    norm(form.city) &&
    norm(form.address) &&
    norm(form.postCode) &&
    form.termsAccepted,
  )
})

const formatAmount = value => {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const handleAmountInput = event => {
  let value = String(event?.target?.value ?? amountInput.value ?? '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')

  const parts = value.split('.')

  if (parts.length > 2) {
    value = `${parts.shift()}.${parts.join('')}`
  }

  if (value.includes('.')) {
    const [integer, decimal] = value.split('.')

    value = `${integer}.${String(decimal || '').slice(0, 2)}`
  }

  amountInput.value = value
  amountError.value = ''
}

const prefillForm = () => {
  const user = userStore.user || {}

  form.name = user.name || ''
  form.surname = user.surname || ''
  form.email = user.email || ''
  form.phone = user.phone || ''

  form.country = user.country?.id || user.country_id || user.country || ''

  form.city = user.city || ''
  form.address = user.address || ''

  form.postCode = user.zip || user.post_code || user.postCode || ''

  form.termsAccepted = false
}

const initModal = async () => {
  clearErrors()

  await Promise.all([
    settingsStore.fetchSettings?.(),
    countriesStore.fetchCountries?.(),
    userStore.fetchProfile?.(),
  ])

  prefillForm()
}

const handleSubmit = async () => {
  if (isSubmitting.value || !validateForm()) {
    return
  }

  topupStore.setAmount?.(fiatAmount.value)
  topupStore.setPaymentType?.('card')

  try {
    const response = await topupStore.checkout({
      name: norm(form.name),
      surname: norm(form.surname),
      email: norm(form.email),
      phone: norm(form.phone),
      country: form.country,
      city: norm(form.city),
      address: norm(form.address),
      postCode: norm(form.postCode),
      currency: currencyCode.value,
      amount: fiatAmount.value,
      paymentType: 'card',
    })

    const redirectUrl = response?.redirect_url || response?.redirectUrl

    if (redirectUrl) {
      window.location.href = redirectUrl

      return
    }

    submitError.value = t('Payment redirect URL was not returned')
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      topupStore.error ||
      t('Failed to create top up payment')
  }
}

const handleClose = () => {
  if (isSubmitting.value) {
    return
  }

  emit('update:show', false)
  emit('close')
}

watch(
  () => props.show,
  async show => {
    if (!show) {
      return
    }

    await initModal()
  },
)

watch(
  () => form.country,
  value => {
    if (value) {
      errors.country = ''
    }
  },
)

watch(
  () => form.termsAccepted,
  value => {
    if (value) {
      errors.termsAccepted = ''
    }
  },
)

onMounted(async () => {
  if (props.show) {
    await initModal()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.top-up {
  width: 100%;
  max-width: 650px;

  @include adaptiveValue('padding', 12, 0);

  color: var(--cod-gray);

  &__head {
    text-align: center;

    @include adaptiveValue('margin-bottom', 30, 22);
  }

  &__eyebrow {
    margin-bottom: 8px;

    @include ibm-12-700;

    color: var(--makara);

    text-transform: uppercase;
  }

  &__title {
    margin: 0 0 10px;

    @include sg-36-700;

    color: var(--cod-gray);

    text-transform: uppercase;
  }

  &__description {
    max-width: 440px;

    margin: 0 auto;

    @include ibm-14-400;

    color: var(--soya-bean);
  }

  &__amount {
    margin-bottom: 0;
  }

  &__minimum {
    margin-top: 8px;

    @include ibm-12-400;

    color: var(--makara);
  }

  &__divider {
    width: 100%;
    height: 1px;

    @include adaptiveValue('margin-top', 28, 20);
    @include adaptiveValue('margin-bottom', 28, 20);

    background: var(--cod-gray-16);
  }

  &__details-title {
    margin-bottom: 14px;

    @include ibm-12-700;

    color: var(--hemlock);

    text-transform: uppercase;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 14px;
  }

  &__terms {
    @include adaptiveValue('margin-top', 24, 18);
    :deep(.base-checkbox__box) {
      border: 1px solid var(--copper);
    }
  }

  &__error {
    margin-top: 14px;

    padding: 12px 14px;

    border-radius: 12px;

    background: rgb(237 0 6 / 7%);

    @include ibm-12-400;

    color: var(--error-color);
  }

  &__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    @include adaptiveValue('margin-top', 28, 20);
    @include adaptiveValue('padding-top', 24, 18);

    border-top: 1px solid var(--cod-gray-16);
  }

  &__summary-label {
    @include ibm-14-700;

    color: var(--makara);
  }

  &__summary-value {
    @include sg-26-700;

    color: var(--cod-gray);
  }

  &__actions {
    display: grid;
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);

    gap: 10px;

    @include adaptiveValue('margin-top', 26, 20);
  }

  &__cancel,
  &__submit {
    width: 100%;

    min-height: 50px;

    border-radius: 999px;
  }
}

@media (max-width: $md5) {
  .top-up {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__actions {
      grid-template-columns: 1fr;
    }

    &__submit {
      order: -1;
    }
  }
}
</style>
