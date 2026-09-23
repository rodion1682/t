<template>
  <BaseModal
    :show="show"
    @close="handleClose"
    :wrapperClasses="['checkout__inner']"
  >
    <div class="checkout">
      <div class="checkout__title _l">
        {{ $t('Checkout') }}
      </div>

      <div class="checkout__body">
        <div class="checkout__form">
          <div class="checkout__form-title">
            {{ $t('Payment details') }}
          </div>

          <BaseInput
            v-model="localForm.tradeLink"
            :label="$t('Trade Link:')"
            :error="errors.tradeLink"
            class="checkout__input checkout__input_steam"
            :disabled="isSubmitting"
            @blur="validateField('tradeLink')"
            steam
          />

          <div class="checkout__row">
            <BaseInput
              v-model="localForm.name"
              :label="$t('Name:')"
              :error="errors.name"
              class="checkout__input"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="localForm.surname"
              :label="$t('Surname:')"
              :error="errors.surname"
              class="checkout__input"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />
          </div>

          <BaseInput
            v-model="localForm.email"
            :label="$t('Email:')"
            type="email"
            :error="errors.email"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="localForm.phone"
            :label="$t('Phone:')"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            :error="errors.phone"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />

          <BaseSelect
            v-model="localForm.country"
            :label="$t('Country:')"
            :options="countries"
            option-label="name"
            option-value="value"
            :error="errors.country"
            class="checkout__input"
            :disabled="isSubmitting"
          />

          <div class="checkout__row">
            <BaseInput
              v-model="localForm.city"
              :label="$t('City:')"
              :error="errors.city"
              class="checkout__input"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />

            <BaseInput
              v-model="localForm.postCode"
              :label="$t('Post code:')"
              :error="errors.postCode"
              class="checkout__input"
              :disabled="isSubmitting"
              @blur="validateField('postCode')"
            />
          </div>

          <BaseInput
            v-model="localForm.address"
            :label="$t('Address:')"
            :error="errors.address"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseCheckbox
            v-model="localForm.acceptTerms"
            :error="errors.acceptTerms"
            class="checkout__checkbox"
            :disabled="isSubmitting"
            terms
          />
        </div>

        <div class="checkout__side">
          <div class="checkout__total">
            <div class="checkout__side-title">
              {{ $t('Total to pay') }}
            </div>

            <PriceFormatter
              class="checkout__total-value"
              :price="cartTotalInternalCurrency"
              size="size-20"
            />

            <PriceFormatter
              class="checkout__total-fiat"
              :price="cartTotalInternalCurrency"
              rawFiat
              isCurrency
            />
          </div>

          <div class="checkout__payment">
            <div class="checkout__side-title">
              {{ $t('Payment method') }}
            </div>

            <div v-if="submitError" class="checkout__error _text-error">
              {{ submitError }}
            </div>

            <div class="checkout__methods">
              <BaseButton
                v-for="method in availablePaymentMethods"
                :key="method.code"
                type="button"
                variant="bordered"
                class="checkout__submit"
                :loading="isSubmitting && selectedPaymentMethod === method.code"
                :disabled="isSubmitting || !isFormComplete"
                @click="submit(method.code)"
              >
                <span v-if="method.image" class="checkout__submit-image">
                  <span>{{ $t('Pay with') }}</span>
                  <img :src="method.image" :alt="method.title" />
                </span>

                <span v-else>
                  {{ method.title }}
                </span>
              </BaseButton>

              <BaseButton
                type="button"
                variant="bordered"
                class="checkout__submit"
                :disabled="isSubmitting || !isFormComplete || !hasEnoughBalance"
                @click="submit('balance')"
              >
                <span>{{ $t('Pay by balance') }}</span>
                <span>{{ userBalance }}</span>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

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

const PAYMENT_DETAILS_STORAGE_KEY = 'top_up_payment_details'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

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

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)
const submitError = ref('')

const localForm = reactive({
  tradeLink: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptTerms: false,
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
  acceptTerms: '',
})

const norm = value => String(value ?? '').trim()
const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const getStoredPaymentDetails = () => {
  try {
    return JSON.parse(localStorage.getItem(PAYMENT_DETAILS_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const savePaymentDetailsToStorage = () => {
  const previous = getStoredPaymentDetails()

  localStorage.setItem(
    PAYMENT_DETAILS_STORAGE_KEY,
    JSON.stringify({
      ...previous,
      tradeLink: localForm.tradeLink,
      country: localForm.country,
      city: localForm.city,
      postCode: localForm.postCode,
      address: localForm.address,
    }),
  )
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

const isValidPhone = phone => {
  const p = norm(phone)
  const digits = p.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return false
  return /^[+0-9()\-\s]+$/.test(p)
}

const normCode = code =>
  String(code || '')
    .toLowerCase()
    .trim()

const isBalance = code => normCode(code) === 'balance'

const isApplePay = code => {
  const c = normCode(code)
  return ['apple_pay', 'apple-pay', 'applepay'].includes(c)
}

const isGooglePay = code => {
  const c = normCode(code)
  return ['google_pay', 'google-pay', 'googlepay'].includes(c)
}

const getDisplayImage = method => {
  if (isApplePay(method.code)) return method.image
  if (isGooglePay(method.code)) return method.image
  return method.image || null
}

const countries = computed(() =>
  (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  })),
)

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const currentCurrency = currencyStore.currentCurrencyCode

  const filtered = methods.filter(method => {
    if (!method.currencies || method.currencies.length === 0) return true
    return method.currencies.includes(currentCurrency)
  })

  const code = method => String(method?.code || '').toLowerCase()

  const card = filtered.filter(method => code(method) === 'creditdebit-card')

  const google = filtered.filter(method =>
    ['google-pay', 'google_pay', 'googlepay'].includes(code(method)),
  )

  const apple = filtered.filter(method =>
    ['apple-pay', 'apple_pay', 'applepay'].includes(code(method)),
  )

  const rest = filtered.filter(
    method =>
      ![
        'balance',
        'creditdebit-card',
        'google-pay',
        'google_pay',
        'googlepay',
        'apple-pay',
        'apple_pay',
        'applepay',
      ].includes(code(method)),
  )

  return [...google, ...apple, ...card, ...rest]
    .filter(method => !isBalance(method.code))
    .map(method => ({
      ...method,
      image: getDisplayImage(method),
    }))
})

const userBalance = computed(() => Number(userStore.user?.balance ?? 0))

const cartTotalInternalCurrency = computed(() => {
  const total = (cartStore.items || []).reduce((sum, row) => {
    return sum + Number(row.item?.price ?? 0) * Number(row.count ?? 1)
  }, 0)

  if (promoCodeStore.hasActivePromo) {
    const discountAmount = Number(promoCodeStore.discount?.amount ?? 0)
    return Math.max(0, total - discountAmount)
  }

  return total
})

const hasEnoughBalance = computed(() => {
  return userBalance.value >= Number(cartTotalInternalCurrency.value ?? 0)
})

const prefillFromUser = user => {
  const storedDetails = getStoredPaymentDetails()

  localForm.name = sanitizeName(user?.name || '')
  localForm.surname = sanitizeSurname(user?.surname || '')
  localForm.email = user?.email || ''
  localForm.phone = user?.phone || ''

  localForm.tradeLink =
    user?.steam_trade_link ||
    user?.trade_link ||
    user?.tradeLink ||
    storedDetails.tradeLink ||
    ''

  localForm.country =
    user?.country_id ||
    user?.country?.id ||
    user?.country ||
    storedDetails.country ||
    ''

  localForm.city = user?.city || storedDetails.city || ''
  localForm.address = user?.address || storedDetails.address || ''
  localForm.postCode =
    user?.post_code || user?.zip || storedDetails.postCode || ''
  localForm.acceptTerms = false
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'tradeLink' && !norm(localForm.tradeLink)) {
    errors.tradeLink = t('Steam trade link is required')
  }

  if (field === 'name') {
    if (!norm(localForm.name)) errors.name = t('First name is required')
    else if (!nameRe.test(norm(localForm.name))) errors.name = t('Invalid name')
  }

  if (field === 'surname') {
    if (!norm(localForm.surname)) errors.surname = t('Last name is required')
    else if (!nameRe.test(norm(localForm.surname))) {
      errors.surname = t('Invalid surname')
    }
  }

  if (field === 'email') {
    if (!localForm.email) errors.email = t('Email is required')
    else if (!emailRe.test(localForm.email)) {
      errors.email = t('Invalid email format')
    }
  }

  if (field === 'phone') {
    if (!localForm.phone) errors.phone = t('Phone is required')
    else if (!isValidPhone(localForm.phone)) {
      errors.phone = t('Invalid phone number')
    }
  }

  if (field === 'country' && !localForm.country) {
    errors.country = t('Country is required')
  }

  if (field === 'city' && !localForm.city) {
    errors.city = t('City is required')
  }

  if (field === 'address' && !localForm.address) {
    errors.address = t('Address line is required')
  }

  if (field === 'postCode' && !localForm.postCode) {
    errors.postCode = t('Post Code is required')
  }

  if (field === 'acceptTerms' && !localForm.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateForm = () => {
  clearErrors()
  Object.keys(errors).forEach(validateField)

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )
    return false
  }

  return true
}

const isFormComplete = computed(() => {
  return (
    norm(localForm.tradeLink) &&
    norm(localForm.name) &&
    norm(localForm.surname) &&
    localForm.email &&
    emailRe.test(localForm.email) &&
    isValidPhone(localForm.phone) &&
    localForm.country &&
    localForm.city &&
    localForm.address &&
    localForm.postCode &&
    localForm.acceptTerms
  )
})

const syncServerCartQty = async () => {
  const rows = cartStore.items || []

  for (const row of rows) {
    const itemId = row.item_id
    const qty = cartStore.getQty
      ? cartStore.getQty(itemId, row.count ?? 1)
      : Number(row.count ?? 1)

    const res = await cartStore.updateQuantity(itemId, qty)

    if (!res?.success) {
      await cartStore.fetchCartContent()
      throw new Error(res?.error || 'Failed to sync cart quantities')
    }
  }
}

const submit = async methodCode => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  selectedPaymentMethod.value = methodCode

  if (isBalance(methodCode) && !hasEnoughBalance.value) {
    const msg = t('Not enough funds')
    submitError.value = msg
    toast.error(msg)
    return
  }

  try {
    isSubmitting.value = true
    clearErrors()
    savePaymentDetailsToStorage()

    await syncServerCartQty()

    const purchaseData = {
      steamId: userStore.user?.steamid,
      tradeUrl: norm(localForm.tradeLink),
      name: sanitizeName(localForm.name),
      surname: sanitizeSurname(localForm.surname),
      email: localForm.email,
      phone: localForm.phone,
      country: localForm.country,
      city: localForm.city,
      address: localForm.address,
      postCode: localForm.postCode,
      paymentMethod: methodCode,
      paymentType: methodCode,
      directPayment: !isBalance(methodCode),
      promocode: promoCodeStore.currentPromo?.code || null,
    }

    const response = await purchaseStore.purchaseCartItems(purchaseData)

    if (response.success) {
      if (response.redirect_url) {
        window.location.href = response.redirect_url
        return
      }

      emit('close')
      router.push({ name: 'SuccessPaymentPage' })
      return
    }

    const errorMsg = response.error || t('An error occurred during checkout')
    submitError.value = errorMsg
    toast.error(errorMsg)
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      t('An error occurred during checkout')

    submitError.value = errorMsg
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (isSubmitting.value) return
  emit('close')
}

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) return

    await Promise.all([
      ensurePages(),
      settingsStore.fetchSettings(),
      countryStore.fetchCountries(),
      cartStore.fetchCartContent(),
      userStore.fetchProfile?.(),
    ])

    prefillFromUser(authStore.isAuthenticated ? userStore.user : null)

    clearErrors()
    selectedPaymentMethod.value = null
  },
)

watch(() => localForm.tradeLink, savePaymentDetailsToStorage)

watch(
  () => localForm.country,
  () => {
    validateField('country')
    savePaymentDetailsToStorage()
  },
)

watch(() => localForm.city, savePaymentDetailsToStorage)
watch(() => localForm.postCode, savePaymentDetailsToStorage)
watch(() => localForm.address, savePaymentDetailsToStorage)

watch(
  () => localForm.acceptTerms,
  () => validateField('acceptTerms'),
)

watch(
  () => userStore.user,
  user => {
    if (!props.show) return
    prefillFromUser(authStore.isAuthenticated ? user : null)
  },
  { deep: true },
)

onMounted(async () => {
  if (props.show) {
    if (authStore.isAuthenticated) {
      await userStore.fetchProfile?.()
    }

    prefillFromUser(authStore.isAuthenticated ? userStore.user : null)
  }
})
</script>
<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.checkout {
  width: 100%;

  &__title {
    text-align: center;
    font-family: var(--font-arimo);
    font-size: 20px;
    font-weight: 700;
    line-height: 120%;
    text-transform: uppercase;
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 38px;
    }
  }

  &__body {
    display: flex;
    align-items: stretch;
    gap: 40px;
  }

  &__form {
    flex: 0 1 58%;
    padding: 40px 28px 36px;
    border-radius: 6px;
    background-color: var(--bg-primary-color);
  }

  &__form-title,
  &__side-title {
    text-align: center;
    font-family: var(--font-arimo);
    font-size: 20px;
    font-weight: 700;
    line-height: 120%;
    text-transform: uppercase;
    color: var(--primary-color);
  }

  &__form-title {
    &:not(:last-child) {
      margin-bottom: 28px;
    }
  }

  &__row {
    display: flex;
    gap: 14px;
  }

  &__input {
    flex: 1 1 100%;

    &:not(:last-child) {
      margin-bottom: 14px;
    }

    :deep(.base-input),
    :deep(.base-select__button) {
      min-height: 44px;
      border-color: var(--border-color);
      background-color: var(--bg-secondary-color);
    }

    :deep(.base-input__label),
    :deep(.base-select__label) {
      font-family: var(--font-roboto);
      font-size: 12px;
      line-height: 120%;
      color: var(--secondary-color);
    }
  }

  &__checkbox {
    margin-top: 22px;
  }

  &__side {
    flex: 0 1 42%;
    display: flex;
    flex-direction: column;
    padding-top: 40px;
  }

  &__total {
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 110px;
    }
  }

  &__side-title {
    &:not(:last-child) {
      margin-bottom: 36px;
    }
  }

  &__total-value {
    justify-content: center;

    &:not(:last-child) {
      margin-bottom: 6px;
    }

    :deep(.price) {
      justify-content: center;
      gap: 10px;
    }

    :deep(.price__currency),
    :deep(.price__value) {
      font-family: var(--font-arimo);
      font-size: 22px;
      font-weight: 700;
      line-height: 120%;
      color: var(--primary-color);
    }

    :deep(.price__icon) {
      min-width: 20px;
      height: 20px;
    }
  }

  &__total-fiat {
    justify-content: center;
    opacity: 0.7;

    :deep(.price__currency),
    :deep(.price__value) {
      font-family: var(--font-roboto);
      font-size: 14px;
      font-weight: 400;
      color: var(--secondary-color);
    }
  }

  &__payment {
    margin-top: auto;
  }

  &__error {
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__submit {
    width: 100%;
    min-height: 44px;
    border-radius: 5px;
    font-family: var(--font-arimo);
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__submit-image {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    img {
      max-height: 22px;
      width: auto;
    }
  }

  @media (max-width: $md3) {
    &__body {
      flex-direction: column;
      gap: 24px;
    }

    &__form,
    &__side {
      flex: 0 1 auto;
      width: 100%;
    }

    &__side {
      padding-top: 0;
    }

    &__total {
      &:not(:last-child) {
        margin-bottom: 36px;
      }
    }
  }

  @media (max-width: $md5) {
    &__form {
      padding: 15px 10px;
      margin-left: -10px;
      margin-right: -10px;
      width: auto;
    }

    &__row {
      flex-direction: column;
      gap: 0;
    }
  }
}
</style>
