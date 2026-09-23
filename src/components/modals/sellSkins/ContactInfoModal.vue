<template>
  <BaseModal
    :show="show"
    :wrapper-classes="['withdraw-modal__inner']"
    @close="handleClose"
  >
    <div class="withdraw">
      <div class="withdraw__title _h3">
        {{ $t('Withdraw') }}
      </div>

      <div v-if="!isBalanceMode" class="withdraw__total">
        <div class="withdraw__total-label">
          {{ $t('Total to pay:') }}
        </div>

        <PriceFormatter
          is-currency
          raw-fiat
          skip-conversion
          :price="selectedAmount"
          :currency-code="selectedCurrency"
          class="withdraw__total-price"
        />
      </div>

      <div v-else class="withdraw__balance">
        <BaseInput
          v-model="withdrawAmount"
          :label="$t('Withdrawal amount')"
          :error="errors.amount"
          inputmode="decimal"
          class="withdraw__amount"
          :disabled="isLoading"
          @blur="validateField('amount')"
        >
          <template #suffix>
            {{ currentCurrencySymbol }}
          </template>
        </BaseInput>

        <div class="withdraw__available">
          <span> {{ $t('Available balance') }}: </span>

          <PriceFormatter skip-conversion :price="userBalance" />
        </div>
      </div>

      <div class="withdraw__inputs">
        <div class="withdraw__box">
          <BaseInput
            v-if="IS_COMBINED_NAME_AND_SURNAME"
            v-model="form.fullName"
            :label="$t('Full name')"
            :error="errors.fullName"
            class="withdraw__input withdraw__input_full"
            name="fullName"
            autocomplete="name"
            :disabled="isLoading"
            @blur="validateField('fullName')"
          />

          <template v-else>
            <BaseInput
              v-model="form.firstName"
              :label="$t('Name')"
              :error="errors.firstName"
              class="withdraw__input"
              name="firstName"
              autocomplete="given-name"
              :disabled="isLoading"
              @blur="validateField('firstName')"
            />

            <BaseInput
              v-model="form.lastName"
              :label="$t('Surname')"
              :error="errors.lastName"
              class="withdraw__input"
              name="lastName"
              autocomplete="family-name"
              :disabled="isLoading"
              @blur="validateField('lastName')"
            />
          </template>
        </div>

        <div class="withdraw__box">
          <BaseInput
            v-model="form.email"
            :label="$t('E-Mail')"
            type="email"
            name="email"
            autocomplete="email"
            :error="errors.email"
            :disabled="isLoading"
            class="withdraw__input"
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
            :disabled="isLoading"
            class="withdraw__input"
            @blur="validateField('phone')"
          />
        </div>

        <div class="withdraw__box">
          <BaseSelect
            v-model="form.country"
            :options="countryOptions"
            option-label="title"
            option-value="id"
            :label="$t('Country')"
            :error="errors.country"
            :disabled="isLoading"
            class="withdraw__input"
          />

          <BaseInput
            v-model="form.city"
            :label="$t('City')"
            :error="errors.city"
            :disabled="isLoading"
            class="withdraw__input"
            @blur="validateField('city')"
          />
        </div>

        <div class="withdraw__box">
          <BaseInput
            v-model="form.address"
            :label="$t('Address line')"
            :error="errors.address"
            :disabled="isLoading"
            class="withdraw__input"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.postCode"
            :label="$t('Postcode')"
            :error="errors.postCode"
            :disabled="isLoading"
            class="withdraw__input"
            @blur="validateField('postCode')"
          />
        </div>
      </div>

      <div
        class="withdraw__info"
        :class="{
          withdraw__info_single: !showRequisites,
        }"
      >
        <BaseCheckbox
          v-model="form.termsAccepted"
          :error="errors.termsAccepted"
          :disabled="isLoading"
          class="withdraw__checkbox"
          terms
        />

        <div
          v-if="showRequisites && formattedRequisites"
          class="withdraw__requisites"
          v-html="formattedRequisites"
        />
      </div>
      <div v-if="errors.general" class="withdraw__error _text-error">
        {{ errors.general }}
      </div>
      <div
        v-if="availablePayoutMethods.length"
        class="withdraw__methods"
        :class="{
          withdraw__methods_single: availablePayoutMethods.length === 1,
        }"
      >
        <div
          v-for="method in availablePayoutMethods"
          :key="method.code"
          class="withdraw__method"
        >
          <BaseButton
            type="button"
            :variant="method.code === 'sepa' ? 'bordered' : 'primary'"
            class="withdraw__submit"
            :loading="isLoading && selectedPayoutMethod === method.code"
            :disabled="isLoading"
            @click="handlePayout(method.code)"
          >
            {{ $t(method.label) }}
          </BaseButton>
        </div>
      </div>

      <div v-else class="withdraw__empty">
        {{ $t('No payout methods available') }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { usePayoutStore } from '@/stores/payout'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const IS_COMBINED_NAME_AND_SURNAME = false
const SHOW_REQUISITES = false
const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  mode: {
    type: String,
    default: 'offer',
    validator: value => ['offer', 'balance'].includes(value),
  },
})

const emit = defineEmits(['close', 'update:show'])

const { t } = useI18n()

const countriesStore = useCountriesStore()
const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const payoutStore = usePayoutStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()

const { userBalance } = storeToRefs(userStore)
const { currentCurrencySymbol } = storeToRefs(currencyStore)

const isLoading = ref(false)
const selectedPayoutMethod = ref(null)
const withdrawAmount = ref('')

const showRequisites = computed(() => {
  return SHOW_REQUISITES
})

const form = reactive({
  fullName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  termsAccepted: false,
})

const errors = reactive({
  amount: '',
  fullName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  termsAccepted: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]*$/u

const isBalanceMode = computed(() => {
  return props.mode === 'balance'
})

const selectedOffer = computed(() => {
  return offerFlowStore.selectedOffer || offerFlowStore.getSelectedOffer || null
})

const balanceAmount = computed(() => {
  const normalized = String(withdrawAmount.value ?? '')
    .replace(',', '.')
    .trim()

  const value = Number(normalized)

  return Number.isFinite(value) ? value : 0
})

const offerAmount = computed(() => {
  const value = Number(
    selectedOffer.value?.fiat_price ??
      selectedOffer.value?.service_price ??
      selectedOffer.value?.user_fiat_price ??
      selectedOffer.value?.user_price ??
      selectedOffer.value?.price ??
      0,
  )

  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0
})

const selectedAmount = computed(() => {
  if (isBalanceMode.value) {
    return balanceAmount.value
  }

  return offerAmount.value
})

const selectedCurrency = computed(() => {
  if (isBalanceMode.value) {
    return (
      currencyStore.currentCurrencyCode || currencyStore.currencyCode || 'EUR'
    )
  }

  return (
    selectedOffer.value?.fiat_currency || selectedOffer.value?.currency || 'EUR'
  )
})

const countryOptions = computed(() => {
  return countriesStore.countries || []
})

const selectedCountry = computed(() => {
  return countryOptions.value.find(country => {
    return String(country.id) === String(form.country)
  })
})

const selectedCountryTitle = computed(() => {
  return selectedCountry.value?.title || ''
})

const formattedRequisites = computed(() => {
  return settingsStore.requisites
    ? settingsStore.requisites.replace(/\n/g, '<br>')
    : ''
})

const payoutMethods = computed(() => {
  return settingsStore.settings?.payout_methods || {}
})

const availablePayoutMethods = computed(() => {
  const methods = []

  if (isBalanceMode.value) {
    if (payoutMethods.value.sepa) {
      methods.push({
        code: 'sepa',
        label: 'SEPA',
      })
    }

    return methods
  }

  if (payoutMethods.value.card) {
    methods.push({
      code: 'card',
      label: 'Credit / Debit Card',
    })
  }

  if (payoutMethods.value.sepa) {
    methods.push({
      code: 'sepa',
      label: 'SEPA',
    })
  }

  return methods
})

const splitFullName = fullName => {
  const parts = norm(fullName).split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

const getNameData = () => {
  if (IS_COMBINED_NAME_AND_SURNAME) {
    return splitFullName(form.fullName)
  }

  return {
    firstName: norm(form.firstName),
    lastName: norm(form.lastName),
  }
}

const isValidPhone = phone => {
  const normalizedPhone = norm(phone)
  const digits = normalizedPhone.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) {
    return false
  }

  return /^[+0-9()\-\s]+$/.test(normalizedPhone)
}

const isNameComplete = computed(() => {
  if (IS_COMBINED_NAME_AND_SURNAME) {
    const { firstName, lastName } = splitFullName(form.fullName)

    return Boolean(
      firstName && lastName && nameRe.test(firstName) && nameRe.test(lastName),
    )
  }

  return Boolean(
    nameRe.test(norm(form.firstName)) && nameRe.test(norm(form.lastName)),
  )
})

const isBalanceAmountValid = computed(() => {
  if (!isBalanceMode.value) {
    return true
  }

  if (balanceAmount.value <= 0) {
    return false
  }

  if (balanceAmount.value > Number(userBalance.value || 0)) {
    return false
  }

  return true
})

const isFormComplete = computed(() => {
  return Boolean(
    isBalanceAmountValid.value &&
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

const getCheckoutStorageData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutStorageData = () => {
  const previous = getCheckoutStorageData()
  const { firstName, lastName } = getNameData()

  localStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify({
      ...previous,
      name: firstName,
      surname: lastName,
      email: form.email,
      phone: form.phone,
      country: form.country,
      city: form.city,
      address: form.address,
      postCode: form.postCode,
    }),
  )
}

const getProfileValue = (user, field) => {
  if (!user) {
    return ''
  }

  const map = {
    name: user.name,
    surname: user.surname || user.surename,
    email: user.email || user.mail,
    phone: user.phone,
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

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const validateField = field => {
  errors[field] = ''
  errors.general = ''

  if (field === 'amount') {
    if (!norm(withdrawAmount.value)) {
      errors.amount = t('Withdrawal amount is required')

      return
    }

    if (balanceAmount.value <= 0) {
      errors.amount = t('Withdrawal amount must be greater than 0')

      return
    }

    if (balanceAmount.value > Number(userBalance.value || 0)) {
      errors.amount = t('Withdrawal amount cannot exceed your balance')
    }

    return
  }

  if (field === 'fullName') {
    const { firstName, lastName } = splitFullName(form.fullName)

    if (!firstName || !lastName) {
      errors.fullName = t('Please enter your full name')

      return
    }

    if (!nameRe.test(firstName) || !nameRe.test(lastName)) {
      errors.fullName = t('Invalid full name')
    }

    return
  }

  if (field === 'firstName') {
    const value = norm(form.firstName)

    if (!value) {
      errors.firstName = t('First name is required')

      return
    }

    if (!nameRe.test(value)) {
      errors.firstName = t('Invalid name')
    }

    return
  }

  if (field === 'lastName') {
    const value = norm(form.lastName)

    if (!value) {
      errors.lastName = t('Last name is required')

      return
    }

    if (!nameRe.test(value)) {
      errors.lastName = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    const value = norm(form.email)

    if (!value) {
      errors.email = t('Email is required')

      return
    }

    if (!emailRe.test(value)) {
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

  if (isBalanceMode.value) {
    validateField('amount')
  }

  if (IS_COMBINED_NAME_AND_SURNAME) {
    validateField('fullName')
  } else {
    validateField('firstName')
    validateField('lastName')
  }

  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('termsAccepted')

  if (isBalanceMode.value && !isBalanceAmountValid.value) {
    if (!errors.amount) {
      errors.general = t('Invalid withdrawal amount')
    }

    return false
  }

  const hasFieldErrors = Object.entries(errors).some(([key, value]) => {
    return key !== 'general' && Boolean(value)
  })

  if (hasFieldErrors) {
    errors.general = t('Please fill all required fields')

    return false
  }

  return true
}

const prefillForm = () => {
  const user = userStore.user || {}

  const firstName = getUserOrSavedValue(user, 'name')

  const lastName = getUserOrSavedValue(user, 'surname')

  form.firstName = firstName
  form.lastName = lastName

  form.fullName = [firstName, lastName].filter(Boolean).join(' ')

  form.email = getUserOrSavedValue(user, 'email')

  form.phone = getUserOrSavedValue(user, 'phone')

  form.country = getUserOrSavedValue(user, 'country')

  form.city = getUserOrSavedValue(user, 'city')

  form.address = getUserOrSavedValue(user, 'address')

  form.postCode = getUserOrSavedValue(user, 'postCode')

  form.termsAccepted = false
  withdrawAmount.value = ''

  clearErrors()
}

const saveContactInfoToStore = () => {
  const { firstName, lastName } = getNameData()

  const data = {
    firstName: norm(firstName),
    lastName: norm(lastName),
    name: norm(firstName),
    surname: norm(lastName),
    email: norm(form.email),
    phone: norm(form.phone),
    country: form.country,
    city: norm(form.city),
    address: norm(form.address),
    postCode: norm(form.postCode),
  }

  if (isBalanceMode.value) {
    payoutStore.updateContactInfo(data)

    payoutStore.setAmount(selectedAmount.value)

    return
  }

  offerFlowStore.updateContactInfo?.({
    ...data,
    country: selectedCountryTitle.value,
  })
}

const openPaymentModal = (methodCode, result = {}) => {
  emit('close')
  emit('update:show', false)

  modalStore.open('payment', {
    mode: isBalanceMode.value ? 'balance' : 'offer',

    paymentMethod: methodCode,

    redirectUrl: result.redirectUrl || result.redirect_url || '',

    amount: selectedAmount.value,

    currency: selectedCurrency.value,
  })
}

const handleBalancePayout = async methodCode => {
  if (methodCode !== 'sepa') {
    errors.general = t('This payout method is not available')

    return
  }

  if (!payoutMethods.value.sepa) {
    errors.general = t('This payout method is not available')

    return
  }

  saveCheckoutStorageData()
  saveContactInfoToStore()

  payoutStore.setPaymentMethod('sepa-manual')

  openPaymentModal('sepa')
}

const handleOfferPayout = async methodCode => {
  const offerId = selectedOffer.value?.id

  if (!offerId) {
    errors.general = t('No offer selected')

    return
  }

  if (methodCode === 'card' && !payoutMethods.value.card) {
    errors.general = t('This payout method is not available')

    return
  }

  if (methodCode === 'sepa' && !payoutMethods.value.sepa) {
    errors.general = t('This payout method is not available')

    return
  }

  saveCheckoutStorageData()
  saveContactInfoToStore()

  if (methodCode === 'sepa') {
    openPaymentModal('sepa')

    return
  }

  const result = await offerFlowStore.requestPayout(offerId, 'card-form')

  if (!result?.success) {
    errors.general =
      result?.messages?.join('\n') ||
      result?.message ||
      t('Failed to request payout')

    return
  }

  openPaymentModal(methodCode, result)
}

const handlePayout = async methodCode => {
  if (isLoading.value) {
    return
  }

  if (isBalanceMode.value && methodCode !== 'sepa') {
    errors.general = t('This payout method is not available')

    return
  }

  if (isBalanceMode.value && !payoutMethods.value.sepa) {
    errors.general = t('Balance withdrawal is not available')

    return
  }

  if (!validateForm()) {
    return
  }

  selectedPayoutMethod.value = methodCode

  try {
    isLoading.value = true

    if (isBalanceMode.value) {
      await handleBalancePayout(methodCode)

      return
    }

    await handleOfferPayout(methodCode)
  } catch (error) {
    errors.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to request payout')
  } finally {
    isLoading.value = false
    selectedPayoutMethod.value = null
  }
}

const handleClose = () => {
  if (isLoading.value) {
    return
  }

  clearErrors()

  selectedPayoutMethod.value = null
  withdrawAmount.value = ''

  emit('close')
  emit('update:show', false)
}

watch(
  () => props.show,
  async show => {
    if (!show) {
      return
    }

    await Promise.all([
      userStore.fetchProfile?.(),
      countriesStore.fetchCountries?.(),
      settingsStore.fetchSettings?.(),
    ])

    prefillForm()
  },
  {
    immediate: true,
  },
)

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
  value => {
    if (value) {
      errors.termsAccepted = ''
    }
  },
)

watch(withdrawAmount, () => {
  errors.amount = ''
  errors.general = ''
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.withdraw {
  width: 100%;

  &__title {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    color: var(--secondary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__total-price {
    color: var(--secondary-color);
  }

  &__balance {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__amount {
    width: 100%;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__available {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    color: var(--secondary-color);
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__box {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 18);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }

    @media (max-width: $md5) {
      grid-template-columns: 1fr;
    }
  }

  &__input {
    min-width: 0;

    &_full {
      grid-column: 1 / -1;
    }
  }

  &__info {
    display: grid;

    // Checkbox + requisites.
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }

    // When requisites are hidden,
    // checkbox takes one grid column.
    &_single {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    @media (max-width: $md5) {
      grid-template-columns: 1fr;
    }
  }

  &__checkbox {
    min-width: 0;
  }

  &__requisites {
    min-width: 0;

    color: var(--third-color);

    line-height: 170%;
  }

  &__error {
    white-space: pre-line;

    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__methods {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 10);

    &_single {
      grid-template-columns: minmax(0, 1fr);
    }

    @media (max-width: $md5) {
      grid-template-columns: 1fr;
    }
  }

  &__method,
  &__submit {
    width: 100%;
  }

  &__empty {
    color: var(--secondary-color);

    text-align: center;
  }
}
</style>
