<template>
  <div class="checkout">
    <div class="checkout__title _h4">
      {{ $t('Checkout') }}
    </div>
    <div class="checkout__item">
      <div class="checkout__label">{{ $t('Total to pay:') }}</div>
      <div class="checkout__prices">
        <PriceFormatter
          skip-conversion
          size="size-16"
          reverse
          class="checkout__coin"
          :price="cartTotalInternal"
        />
        <PriceFormatter
          size="size-16"
          is-currency
          reverse
          raw-fiat
          skip-conversion
          class="checkout__fiat"
          :price="cartTotalFiat"
          :currency-code="cartFiatCurrency"
        />
      </div>
    </div>
    <div v-if="false" class="checkout__item">
      <div class="checkout__label">{{ $t('Items:') }}</div>
      <div class="checkout__value">{{ cartItemsCount }}</div>
    </div>
    <div class="checkout__inputs">
      <div class="checkout__box">
        <BaseInput
          v-if="IS_COMBINED_NAME_AND_SURNAME"
          v-model="localForm.fullName"
          :label="$t('Full name')"
          :error="errors.fullName"
          class="checkout__input"
          name="fullName"
          autocomplete="name"
          :disabled="isSubmitting"
          @blur="validateField('fullName')"
        />

        <template v-else>
          <BaseInput
            v-model="localForm.name"
            :label="$t('Name')"
            :error="errors.name"
            class="checkout__input"
            name="name"
            autocomplete="given-name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />
          <BaseInput
            v-model="localForm.surname"
            :label="$t('Surname')"
            :error="errors.surname"
            class="checkout__input"
            name="surname"
            autocomplete="family-name"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />
        </template>
        <BaseInput
          v-model="localForm.email"
          :label="$t('E-mail')"
          type="email"
          name="email"
          autocomplete="email"
          :error="errors.email"
          class="checkout__input"
          :disabled="isSubmitting"
          @blur="validateField('email')"
        />

        <BaseInput
          v-model="localForm.phone"
          :label="$t('Phone')"
          type="tel"
          name="phone"
          inputmode="tel"
          autocomplete="tel"
          :error="errors.phone"
          class="checkout__input"
          :disabled="isSubmitting"
          @blur="validateField('phone')"
        />
      </div>
      <BaseInput
        v-model="localForm.tradeLink"
        :label="$t('Steam Trade URL')"
        :error="errors.tradeLink"
        class="checkout__input checkout__input_trade"
        :disabled="isSubmitting"
        @blur="validateField('tradeLink')"
      />
      <div class="checkout__box">
        <BaseSelect
          v-model="localForm.country"
          :options="countries"
          option-label="name"
          option-value="value"
          :label="$t('Country')"
          :error="errors.country"
          class="checkout__input"
          :disabled="isSubmitting"
        />
        <BaseInput
          v-model="localForm.city"
          :label="$t('City')"
          :error="errors.city"
          class="checkout__input"
          :disabled="isSubmitting"
          @blur="validateField('city')"
        />
        <BaseInput
          v-model="localForm.address"
          :label="$t('Address line')"
          :error="errors.address"
          class="checkout__input"
          :disabled="isSubmitting"
          @blur="validateField('address')"
        />
        <BaseInput
          v-model="localForm.postCode"
          :label="$t('Postcode')"
          :error="errors.postCode"
          class="checkout__input checkout__input_small"
          :disabled="isSubmitting"
          @blur="validateField('postCode')"
        />
      </div>
    </div>
    <!-- <BaseCheckbox

      v-model="localForm.acceptWithdrawalWaiver"
      :error="errors.acceptWithdrawalWaiver"
      class="checkout__checkbox"
      :disabled="isSubmitting"
    >
      {{
        $t(
          'I agree to immediate delivery and accept that I lose my 14-day right of withdrawal once delivery starts.',
        )
      }}
    </BaseCheckbox> -->
    <div class="checkout__bottom">
      <BaseCheckbox
        v-model="localForm.acceptTerms"
        :error="errors.acceptTerms"
        class="checkout__checkbox"
        :disabled="isSubmitting"
        terms
      />
      <div
        v-if="formattedRequisites"
        class="checkout__requisites"
        v-html="formattedRequisites"
      />
    </div>
    <div v-if="submitError" class="checkout__error _text-error">
      {{ submitError }}
    </div>
    <div v-if="balanceError" class="checkout__error _text-error">
      {{ balanceError }}
    </div>

    <div class="checkout__methods">
      <div class="checkout__method">
        <BaseButton
          type="button"
          variant="primary"
          class="checkout__submit"
          :loading="isSubmitting && selectedPaymentMethod === 'balance'"
          :disabled="isSubmitting || !isFormComplete || !hasEnoughBalance"
          @click="submitBalancePayment"
        >
          <template v-if="isSubmitting && selectedPaymentMethod === 'balance'">
            {{ $t('Paying') }}...
          </template>
          <template v-else>
            <PriceFormatter
              v-if="false"
              :price="userBalance"
              class="checkout__method-balance"
            />

            <span class="checkout__text">
              {{ $t('Pay with Balance') }}
            </span>
          </template>
        </BaseButton>
        <template
          v-if="authStore.isAuthenticated && !hasEnoughBalance && false"
        >
          <div class="checkout__warn warn">
            <div class="warn__image _ibg-contain">
              <img src="@/assets/img/icons/warn.svg" alt="" />
            </div>

            <span class="warn__text">
              {{ $t('Not enough balance funds. Please') }}

              <RouterLink
                class="warn__link _link"
                :to="{ name: 'account-balance' }"
                @click="goToTopUp"
              >
                {{ $t('top up') }}
              </RouterLink>
            </span>
          </div>
        </template>
      </div>
      <div
        v-for="(method, index) in availablePaymentMethods"
        :key="method.code"
        class="checkout__method"
        :class="{
          checkout__method_full: index === 0,
          checkout__method_image: !!method.image,
        }"
      >
        <BaseButton
          type="button"
          :variant="index < 2 ? 'white-bordered' : 'white'"
          class="checkout__submit"
          :loading="isSubmitting && selectedPaymentMethod === method.code"
          :disabled="isSubmitting || !isFormComplete"
          @click="submit(method.code)"
        >
          <span v-if="method.image" class="checkout__submit-image _ibg-contain">
            <img :src="method.image" :alt="method.title" />
          </span>
          <span v-else>
            {{ method.title }}
          </span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const IS_COMBINED_NAME_AND_SURNAME = false

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const emit = defineEmits(['success-close', 'back', 'top-up-click'])

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { ensurePages } = useStaticPages()

const authStore = useAuthStore()
const cartStore = useCartStore()
const countryStore = useCountriesStore()
const purchaseStore = usePurchaseStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const promoCodeStore = usePromoCodeStore()
const userStore = useUserStore()

const { userBalance } = storeToRefs(userStore)
const { cartItemsCount } = storeToRefs(cartStore)

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)
const submitError = ref('')
const balanceError = ref('')

const localForm = reactive({
  tradeLink: '',
  fullName: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  // acceptWithdrawalWaiver: false,
  acceptTerms: false,
})

const errors = reactive({
  tradeLink: '',
  fullName: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  // acceptWithdrawalWaiver: '',
  acceptTerms: '',
})

const norm = value => String(value ?? '').trim()

const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const savedFields = ['country', 'city', 'address', 'postCode', 'tradeLink']

const goToTopUp = () => {
  emit('top-up-click')
}

const formattedRequisites = computed(() => {
  return settingsStore.requisites
    ? settingsStore.requisites.replace(/\n/g, '<br>')
    : ''
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
    return splitFullName(localForm.fullName)
  }

  return {
    name: norm(localForm.name),
    surname: norm(localForm.surname),
  }
}

const getSavedCheckoutData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutData = () => {
  const data = getSavedCheckoutData()

  savedFields.forEach(field => {
    data[field] = localForm[field]
  })

  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data))
}

const getProfileValue = (user, field) => {
  if (!user) return ''

  const map = {
    tradeLink: user.steam_trade_link || user.tradeLink || user.trade_url,

    country: user.country?.id || user.country_id || user.country,

    city: user.city,
    address: user.address,
    postCode: user.zip || user.post_code,
  }

  return map[field] ?? ''
}

const getUserOrSavedValue = (user, field) => {
  const profileValue = getProfileValue(user, field)

  if (norm(profileValue)) {
    return profileValue
  }

  const savedData = getSavedCheckoutData()

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

const isValidPhone = phone => {
  const normalizedPhone = norm(phone)
  const digits = normalizedPhone.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) {
    return false
  }

  return /^[+0-9()\-\s]+$/.test(normalizedPhone)
}

const normCode = code => {
  return String(code || '')
    .toLowerCase()
    .trim()
}

const isBalance = code => normCode(code) === 'balance'

const isApplePay = code => {
  const normalizedCode = normCode(code)

  return ['apple_pay', 'apple-pay', 'applepay'].includes(normalizedCode)
}

const isGooglePay = code => {
  const normalizedCode = normCode(code)

  return ['google_pay', 'google-pay', 'googlepay'].includes(normalizedCode)
}

const getDisplayImage = method => {
  return method?.image || null
}

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const availablePaymentMethods = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  const currentCurrency = currencyStore.currentCurrencyCode

  const filtered = methods.filter(method => {
    if (!method.currencies?.length) {
      return true
    }

    return method.currencies.includes(currentCurrency)
  })

  const card = filtered.filter(method => {
    return normCode(method.code) === 'creditdebit-card'
  })

  const google = filtered.filter(method => {
    return isGooglePay(method.code)
  })

  const apple = filtered.filter(method => {
    return isApplePay(method.code)
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

  return [...card, ...google, ...apple, ...rest]
    .filter(method => !isBalance(method.code))
    .map(method => ({
      ...method,
      image: getDisplayImage(method),
    }))
})

const cartResponse = computed(() => {
  return cartStore.cartData || cartStore.cart || cartStore.cartContent || {}
})

const cartFiatCurrency = computed(() => {
  return (
    cartResponse.value?.fiat_currency ||
    cartResponse.value?.currency ||
    currencyStore.currentCurrencyCode ||
    'EUR'
  )
})

const cartTotalFiat = computed(() => {
  const serverTotal = Number(
    cartResponse.value?.total_fiat ?? cartResponse.value?.total,
  )

  if (Number.isFinite(serverTotal)) {
    return serverTotal
  }

  return (cartStore.items || []).reduce((sum, row) => {
    const price = Number(row.item?.fiat_price ?? row.item?.price ?? 0)

    const count = Number(row.count ?? 1)

    return sum + price * count
  }, 0)
})

const cartTotalInternal = computed(() => {
  const serverTotal = Number(cartResponse.value?.total_internal)

  if (Number.isFinite(serverTotal)) {
    return Number(serverTotal.toFixed(2))
  }

  const total = (cartStore.items || []).reduce((sum, row) => {
    const internalPrice = Number(row.item?.internal_price ?? 0)
    const count = Number(row.count ?? 1)

    return sum + internalPrice * count
  }, 0)

  return Number(total.toFixed(2))
})

const hasEnoughBalance = computed(() => {
  return Number(userBalance.value ?? 0) >= Number(cartTotalInternal.value ?? 0)
})

const prefillFromUser = user => {
  const savedData = getSavedCheckoutData()

  const name = sanitizeName(user?.name || savedData.name || '')

  const surname = sanitizeSurname(user?.surname || savedData.surname || '')

  localForm.name = name
  localForm.surname = surname
  localForm.fullName = [name, surname].filter(Boolean).join(' ')

  localForm.email = user?.email || savedData.email || ''

  localForm.phone = user?.phone || savedData.phone || ''

  localForm.tradeLink = getUserOrSavedValue(user, 'tradeLink')

  localForm.country = getUserOrSavedValue(user, 'country')

  localForm.city = getUserOrSavedValue(user, 'city')

  localForm.address = getUserOrSavedValue(user, 'address')

  localForm.postCode = getUserOrSavedValue(user, 'postCode')

  localForm.acceptTerms = false
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
  balanceError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'tradeLink') {
    if (!norm(localForm.tradeLink)) {
      errors.tradeLink = t('Steam trade link is required')
    }

    return
  }

  if (field === 'fullName') {
    const { name, surname } = splitFullName(localForm.fullName)

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
    if (!norm(localForm.name)) {
      errors.name = t('First name is required')
      return
    }

    if (!nameRe.test(norm(localForm.name))) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'surname') {
    if (!norm(localForm.surname)) {
      errors.surname = t('Last name is required')
      return
    }

    if (!nameRe.test(norm(localForm.surname))) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    if (!norm(localForm.email)) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRe.test(norm(localForm.email))) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!norm(localForm.phone)) {
      errors.phone = t('Phone is required')
      return
    }

    if (!isValidPhone(localForm.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !localForm.country) {
    errors.country = t('Country is required')
  }

  if (field === 'city' && !norm(localForm.city)) {
    errors.city = t('City is required')
  }

  if (field === 'address' && !norm(localForm.address)) {
    errors.address = t('Address line is required')
  }

  if (field === 'postCode' && !norm(localForm.postCode)) {
    errors.postCode = t('Post Code is required')
  }

  // if (field === 'acceptWithdrawalWaiver' && !localForm.acceptWithdrawalWaiver) {
  //   errors.acceptWithdrawalWaiver = t(
  //     'You must agree to immediate delivery and acknowledge the loss of your 14-day right of withdrawal',
  //   )
  // }

  if (field === 'acceptTerms' && !localForm.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateForm = () => {
  clearErrors()

  validateField('tradeLink')

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
  // validateField('acceptWithdrawalWaiver')
  validateField('acceptTerms')

  const hasErrors = Object.values(errors).some(Boolean)

  if (hasErrors) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept the required confirmations.',
    )

    return false
  }

  return true
}

const isNameComplete = computed(() => {
  if (IS_COMBINED_NAME_AND_SURNAME) {
    const { name, surname } = splitFullName(localForm.fullName)

    return nameRe.test(name) && nameRe.test(surname)
  }

  return (
    nameRe.test(norm(localForm.name)) && nameRe.test(norm(localForm.surname))
  )
})

const isFormComplete = computed(() => {
  return Boolean(
    norm(localForm.tradeLink) &&
    isNameComplete.value &&
    emailRe.test(norm(localForm.email)) &&
    isValidPhone(localForm.phone) &&
    localForm.country &&
    norm(localForm.city) &&
    norm(localForm.address) &&
    norm(localForm.postCode) &&
    localForm.acceptTerms,
    // localForm.acceptWithdrawalWaiver &&
  )
})

const syncServerCartQty = async () => {
  const rows = cartStore.items || []

  for (const row of rows) {
    const itemId = row.item_id

    const quantity = cartStore.getQty
      ? cartStore.getQty(itemId, row.count ?? 1)
      : Number(row.count ?? 1)

    const response = await cartStore.updateQuantity(itemId, quantity)

    if (!response?.success) {
      await cartStore.fetchCartContent()

      throw new Error(response?.error || 'Failed to sync cart quantities')
    }
  }
}

const createPurchaseData = methodCode => {
  const { name, surname } = getNameData()

  return {
    steamId: userStore.user?.steamid,
    tradeUrl: norm(localForm.tradeLink),

    name: sanitizeName(name),
    surname: sanitizeSurname(surname),

    email: norm(localForm.email),
    phone: norm(localForm.phone),
    country: localForm.country,
    city: norm(localForm.city),
    address: norm(localForm.address),
    postCode: norm(localForm.postCode),

    paymentMethod: methodCode,
    paymentType: methodCode,
    directPayment: !isBalance(methodCode),

    promocode: promoCodeStore.currentPromo?.code || null,
  }
}

const handleSuccessfulPayment = response => {
  saveCheckoutData()

  if (response?.redirect_url) {
    window.location.href = response.redirect_url
    return
  }

  emit('success-close')

  router.push({
    name: 'SuccessPaymentPage',
  })
}

const submitBalancePayment = async () => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  if (!hasEnoughBalance.value) {
    const message = t('Not enough funds')

    balanceError.value = message
    toast.error(message)

    return
  }

  try {
    isSubmitting.value = true
    selectedPaymentMethod.value = 'balance'

    clearErrors()

    await syncServerCartQty()

    const response = await purchaseStore.purchaseCartItems(
      createPurchaseData('balance'),
    )

    if (response.success) {
      handleSuccessfulPayment(response)
      return
    }

    const message = response.error || t('An error occurred during checkout')

    balanceError.value = message
    toast.error(message)
  } catch (error) {
    console.error('Balance checkout error:', error)

    const message =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during checkout')

    balanceError.value = message
    toast.error(message)
  } finally {
    isSubmitting.value = false
    selectedPaymentMethod.value = null
  }
}

const submit = async methodCode => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    selectedPaymentMethod.value = methodCode

    clearErrors()

    await syncServerCartQty()

    const response = await purchaseStore.purchaseCartItems(
      createPurchaseData(methodCode),
    )

    if (response.success) {
      handleSuccessfulPayment(response)
      return
    }

    const message = response.error || t('An error occurred during checkout')

    submitError.value = message
    toast.error(message)
  } catch (error) {
    console.error('Checkout error:', error)

    const message =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during checkout')

    submitError.value = message
    toast.error(message)
  } finally {
    isSubmitting.value = false
    selectedPaymentMethod.value = null
  }
}

const initCheckout = async () => {
  await Promise.all([
    ensurePages(),
    settingsStore.fetchSettings(),
    countryStore.fetchCountries(),

    authStore.isAuthenticated ? userStore.fetchProfile?.() : Promise.resolve(),
  ])

  prefillFromUser(authStore.isAuthenticated ? userStore.user : null)

  clearErrors()
  selectedPaymentMethod.value = null
}

onMounted(async () => {
  await initCheckout()
})

watch(
  () => localForm.country,
  () => validateField('country'),
)

// watch(
//   () => localForm.acceptWithdrawalWaiver,
//   () => validateField('acceptWithdrawalWaiver'),
// )

watch(
  () => localForm.acceptTerms,
  () => validateField('acceptTerms'),
)

watch(() => savedFields.map(field => localForm[field]), saveCheckoutData)

watch(
  () => userStore.user,
  user => {
    if (!authStore.isAuthenticated) return

    prefillFromUser(user)
  },
  {
    deep: true,
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.checkout {
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-primary-color);
  @include adaptiveValue('border-radius', 20, 10);
  @include adaptiveValue('padding', 40, 10);
  &__title {
    text-transform: uppercase;
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__item {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__label {
  }

  &__prices {
  }

  &__coin {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__fiat {
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__box {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    @include adaptiveValue('column-gap', 20, 10);
    @include adaptiveValue('row-gap', 20, 18);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
    @media (max-width: $md2) {
      grid-template-columns: repeat(1, 1fr);
    }
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__input {
    &_small {
    }
    &_trade {
      width: 100%;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 20, 18);
      }
    }
  }

  &__bottom {
    display: grid;

    grid-template-columns: repeat(2, 1fr);
    @include adaptiveValue('column-gap', 20, 10);
    @include adaptiveValue('row-gap', 20, 18);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
    @media (max-width: $md2) {
      grid-template-columns: repeat(1, 1fr);
    }
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
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

  &__methods {
    flex: 1 1 100%;
    justify-content: flex-end;
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('row-gap', 20, 4);
    @include adaptiveValue('margin-left', -10, 2);
    @include adaptiveValue('margin-right', -10, 2);
  }

  &__method {
    position: relative;
    flex: 0 1 50%;
    width: 100%;

    @include adaptiveValue('padding-left', 10, 2);
    @include adaptiveValue('padding-right', 10, 2);
    height: fit-content;
    white-space: nowrap !important;
    @media (max-width: 1099.98px) {
      flex: 1 1 100%;
    }
    @media (max-width: $md2) {
      flex: 0 1 50%;
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
    &_image {
      position: relative;

      :deep(.checkout__submit) {
        position: relative;
        overflow: hidden;
      }

      :deep(.checkout__submit .btn__text) {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
  &__submit {
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
  &__text {
  }
}

.warn {
  display: flex;
  gap: 9px;
  margin-top: 10px;

  &__image {
    min-width: 16px;
    height: 16px;
  }

  &__text {
    display: block;
    min-width: 0;

    overflow-wrap: anywhere;
    word-break: break-word;

    font-size: 12px;
    line-height: 150%;
    color: var(--secondary-color);
  }

  &__link {
    display: inline;

    color: var(--link-color);
    border-bottom: 1px solid inherit;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }
}
</style>
