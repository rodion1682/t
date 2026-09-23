<template>
  <BaseModal :show="show" @close="close" :wrapperClasses="['withdraw__inner']">
    <div class="withdraw">
      <div class="withdraw__title _h2">
        {{ $t('Withdraw') }}
      </div>

      <template v-if="step === 1">
        <div class="withdraw__amount">
          <BaseInput
            v-model="form.amount"
            type="number"
            :empty="true"
            :currency="true"
            :error="errors.amount"
            :disabled="isLoading"
            class="withdraw__input"
          >
            <template #suffix>
              {{ currencySymbol }}
            </template>
          </BaseInput>
        </div>

        <div v-if="form.amount" class="withdraw__result">
          {{ form.amount }} {{ currencySymbol }}
        </div>

        <div v-if="errors.general" class="withdraw__error _text-error">
          {{ errors.general }}
        </div>

        <div class="withdraw__actions">
          <BaseButton
            type="button"
            variant="bordered"
            class="withdraw__submit withdraw__submit_full"
            :disabled="isLoading"
            @click="goNext"
          >
            {{ $t('Continue') }}
          </BaseButton>
        </div>
        <div class="withdraw__warn">
          {{ $t('We use 3D secure methods to protect transactions.') }}
        </div>
      </template>

      <template v-else>
        <div class="withdraw__methods">
          <div class="withdraw__label">{{ $t('Payment method') }}</div>

          <div class="withdraw__method-buttons">
            <BaseButton
              type="button"
              variant="grey"
              :class="{ selected: form.method === 'card-direct' }"
              @click="form.method = 'card-direct'"
              :disabled="isLoading"
              class="withdraw__method"
            >
              {{ $t('Card') }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="grey"
              :class="{ selected: form.method === 'sepa-manual' }"
              @click="form.method = 'sepa-manual'"
              :disabled="isLoading"
              class="withdraw__method"
            >
              {{ $t('SEPA') }}
            </BaseButton>
          </div>

          <div v-if="errors.method" class="withdraw__error _text-error">
            {{ errors.method }}
          </div>
        </div>

        <BaseInput
          v-model="form.firstName"
          :placeholder="$t('First Name')"
          :error="errors.firstName"
          :disabled="isLoading"
          class="withdraw__input"
        />

        <BaseInput
          v-model="form.lastName"
          :placeholder="$t('Last Name')"
          :error="errors.lastName"
          :disabled="isLoading"
          class="withdraw__input"
        />

        <BaseInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          :placeholder="$t('Email')"
          :error="errors.email"
          :disabled="isLoading"
          class="withdraw__input"
        />

        <BaseInput
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          :placeholder="$t('Phone number')"
          :error="errors.phone"
          :disabled="isLoading"
          class="withdraw__input"
        />

        <BaseSelect
          v-model="form.country"
          :options="countryOptions"
          optionLabel="title"
          optionValue="id"
          :placeholder="$t('Country')"
          :error="errors.country"
          :disabled="isLoading"
          class="withdraw__input"
        />

        <div class="withdraw__row">
          <BaseInput
            v-model="form.city"
            :placeholder="$t('City')"
            :error="errors.city"
            :disabled="isLoading"
            class="withdraw__input withdraw__input_large"
          />

          <BaseInput
            v-model="form.postCode"
            :placeholder="$t('ZIP-code')"
            :error="errors.postCode"
            :disabled="isLoading"
            class="withdraw__input withdraw__input_small"
          />
        </div>

        <BaseInput
          v-model="form.address"
          :placeholder="$t('Address')"
          :error="errors.address"
          :disabled="isLoading"
          class="withdraw__input"
        />

        <template v-if="form.method === 'card-direct'">
          <BaseInput
            v-model="form.cardHolderName"
            :placeholder="$t('Card holder name')"
            :error="errors.cardHolderName"
            :disabled="isLoading"
            class="withdraw__input"
          />

          <BaseInput
            v-model="form.cardNumber"
            :placeholder="$t('Card number')"
            :error="errors.cardNumber"
            :disabled="isLoading"
            class="withdraw__input"
          />

          <BaseInput
            v-model="form.expirationDate"
            :placeholder="$t('MM/YY')"
            :error="errors.expirationDate"
            :disabled="isLoading"
            class="withdraw__input"
          />
        </template>

        <template v-else-if="form.method === 'sepa-manual'">
          <BaseInput
            v-model="form.accountHolderFirstName"
            :placeholder="$t('Account holder first name')"
            :error="errors.accountHolderFirstName"
            :disabled="isLoading"
            class="withdraw__input"
          />

          <BaseInput
            v-model="form.accountHolderLastName"
            :placeholder="$t('Account holder last name')"
            :error="errors.accountHolderLastName"
            :disabled="isLoading"
            class="withdraw__input"
          />

          <BaseInput
            v-model="form.iban"
            :placeholder="$t('IBAN')"
            :error="errors.iban"
            :disabled="isLoading"
            class="withdraw__input"
          />
        </template>

        <div class="withdraw__terms">
          <BaseCheckbox
            v-model="form.termsAccepted"
            :error="errors.termsAccepted"
            :disabled="isLoading"
            secondary
          >
            {{ $t('I agree with ') }}
            <router-link :to="getPageUrl(privacyPage)" target="_blank">
              {{ $t('privacy policy') }}
            </router-link>
            {{ $t('and terms and') }}
            <router-link :to="getPageUrl(termsPage)" target="_blank">
              {{ $t('conditions') }}
            </router-link>
          </BaseCheckbox>
        </div>

        <div v-if="errors.general" class="withdraw__error _text-error">
          {{ errors.general }}
        </div>

        <div class="withdraw__actions">
          <BaseButton
            type="button"
            variant="transparent"
            class="withdraw__back"
            :disabled="isLoading"
            @click="step = 1"
          >
            {{ $t('Back') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="hint"
            class="withdraw__submit"
            :disabled="isLoading || !canSubmit"
            @click="handleSubmit"
          >
            <span v-if="isLoading">{{ $t('Submitting') }}...</span>
            <span v-else>{{ $t('Withdraw') }}</span>
          </BaseButton>
        </div>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import { useStaticPages } from '@/composables/useStaticPages'
import { useAppStore } from '@/stores/app'
import { useCountriesStore } from '@/stores/countries'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: { type: Boolean, required: true },
  balance: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'submit'])

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'
const savedFields = ['country', 'city', 'address', 'postCode']

const { t } = useI18n()
const countriesStore = useCountriesStore()
const userStore = useUserStore()
const appStore = useAppStore()
const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

const isLoading = ref(false)
const step = ref(1)

const currencySymbol = computed(() => appStore.currencySymbol || '€')
const countryOptions = computed(() => countriesStore.countries || [])

const norm = v => String(v ?? '').trim()

const toId = v => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : ''
}

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

const getUserOrSavedValue = (user, field) => {
  const storage = getCheckoutStorage()

  const map = {
    firstName: user?.name,
    lastName: user?.surname,
    email: user?.email,
    phone: user?.phone,
    country: user?.country_id || user?.country,
    city: user?.city,
    address: user?.address,
    postCode: user?.zip || user?.post_code,
  }

  const userValue = map[field]

  if (field === 'country') {
    const countryId = toId(userValue)
    if (countryId) return countryId
  }

  if (norm(userValue)) return userValue

  if (savedFields.includes(field)) {
    return storage[field] || ''
  }

  return ''
}

const savePrefillForm = () => {
  saveCheckoutStorage({
    country: form.value.country,
    city: form.value.city,
    address: form.value.address,
    postCode: form.value.postCode,
  })
}

const form = ref({
  amount: '',
  method: '',

  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  postCode: '',
  address: '',

  cardHolderName: '',
  cardNumber: '',
  expirationDate: '',

  accountHolderFirstName: '',
  accountHolderLastName: '',
  iban: '',

  termsAccepted: false,
})

const errors = ref({})

const resetErrors = () => {
  errors.value = {
    amount: '',
    method: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    postCode: '',
    address: '',
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
    accountHolderFirstName: '',
    accountHolderLastName: '',
    iban: '',
    termsAccepted: '',
    general: '',
  }
}

const close = () => {
  resetErrors()
  emit('close')
}

const fillFromUser = () => {
  const u = userStore.user || {}

  const firstName = getUserOrSavedValue(u, 'firstName')
  const lastName = getUserOrSavedValue(u, 'lastName')

  form.value = {
    amount: '',
    method: '',

    firstName,
    lastName,
    email: getUserOrSavedValue(u, 'email'),
    phone: getUserOrSavedValue(u, 'phone'),
    country: getUserOrSavedValue(u, 'country'),
    city: getUserOrSavedValue(u, 'city'),
    postCode: getUserOrSavedValue(u, 'postCode'),
    address: getUserOrSavedValue(u, 'address'),

    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',

    accountHolderFirstName: firstName,
    accountHolderLastName: lastName,
    iban: '',

    termsAccepted: false,
  }
}

const validateStepOne = () => {
  resetErrors()

  const amount = Number(form.value.amount)

  if (!form.value.amount) {
    errors.value.amount = t('Amount is required')
    return false
  }

  if (Number.isNaN(amount) || amount <= 0) {
    errors.value.amount = t('Please enter a valid amount')
    return false
  }

  if (amount > Number(props.balance || 0)) {
    errors.value.amount = t('Amount exceeds available balance')
    return false
  }

  return true
}

const validateStepTwo = () => {
  let ok = true

  if (!form.value.method) {
    errors.value.method = t('Please select payment method')
    ok = false
  }

  if (!form.value.firstName) {
    errors.value.firstName = t('First name is required')
    ok = false
  }

  if (!form.value.lastName) {
    errors.value.lastName = t('Last name is required')
    ok = false
  }

  if (!form.value.email) {
    errors.value.email = t('Email is required')
    ok = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
    errors.value.email = t('Invalid email format')
    ok = false
  }

  if (!form.value.phone) {
    errors.value.phone = t('Phone number is required')
    ok = false
  }

  if (!form.value.country) {
    errors.value.country = t('Country is required')
    ok = false
  }

  if (!form.value.city) {
    errors.value.city = t('City is required')
    ok = false
  }

  if (!form.value.postCode) {
    errors.value.postCode = t('Post code is required')
    ok = false
  }

  if (!form.value.address) {
    errors.value.address = t('Address is required')
    ok = false
  }

  if (form.value.method === 'card-direct') {
    if (!form.value.cardHolderName) {
      errors.value.cardHolderName = t('Card holder name is required')
      ok = false
    }

    if (!form.value.cardNumber) {
      errors.value.cardNumber = t('Card number is required')
      ok = false
    }

    if (!form.value.expirationDate) {
      errors.value.expirationDate = t('Expiration date is required')
      ok = false
    }
  }

  if (form.value.method === 'sepa-manual') {
    if (!form.value.accountHolderFirstName) {
      errors.value.accountHolderFirstName = t('First name is required')
      ok = false
    }

    if (!form.value.accountHolderLastName) {
      errors.value.accountHolderLastName = t('Last name is required')
      ok = false
    }

    if (!form.value.iban) {
      errors.value.iban = t('IBAN is required')
      ok = false
    }
  }

  if (!form.value.termsAccepted) {
    errors.value.termsAccepted = t('You must accept the terms')
    ok = false
  }

  return ok
}

const canSubmit = computed(() => {
  return (
    !!form.value.amount &&
    !!form.value.method &&
    !!form.value.firstName &&
    !!form.value.lastName &&
    !!form.value.email &&
    !!form.value.phone &&
    !!form.value.country &&
    !!form.value.city &&
    !!form.value.postCode &&
    !!form.value.address &&
    !!form.value.termsAccepted
  )
})

const goNext = () => {
  if (!validateStepOne()) {
    errors.value.general = t('Please enter a valid amount')
    return
  }

  errors.value.general = ''
  step.value = 2
}

const handleSubmit = () => {
  resetErrors()

  if (!validateStepOne() || !validateStepTwo()) {
    errors.value.general = t('Please fill all required fields')
    return
  }

  savePrefillForm()

  emit('submit', {
    amount: Number(form.value.amount),
    withdrawType: form.value.method,

    name: form.value.firstName,
    surname: form.value.lastName,
    email: form.value.email,
    phone: form.value.phone,
    country: form.value.country,
    city: form.value.city,
    postCode: form.value.postCode,
    address: form.value.address,

    card_holder_name: form.value.cardHolderName,
    card_number: form.value.cardNumber,
    expirationDate: form.value.expirationDate,

    first_name: form.value.accountHolderFirstName,
    last_name: form.value.accountHolderLastName,
    account_number: form.value.iban,
  })
}

watch(() => savedFields.map(field => form.value[field]), savePrefillForm)

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) return

    await ensurePages()

    if (!countriesStore.countries?.length) {
      try {
        await countriesStore.fetchCountries()
      } catch (e) {
        console.error('Failed to fetch countries:', e)
      }
    }

    await userStore.fetchProfile?.()

    fillFromUser()
    resetErrors()
    step.value = 1
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.withdraw {
  max-width: 520px;
  margin: 0 auto;

  &__title {
    text-align: center;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__label {
    opacity: 0.7;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__amount,
  &__methods {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__input {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 10);
    }
  }
  &__result {
    text-align: center;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 10);
    }
  }

  &__row {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 10);
    }

    @media (min-width: $md6) {
      display: flex;
      @include adaptiveValue('gap', 20, 10);

      .withdraw__input {
        &:not(:last-child) {
          margin-bottom: 0;
        }
      }
    }
  }

  &__method-buttons {
    display: flex;
    gap: 10px;
  }

  &__method {
    flex: 1 1 50%;

    &.selected {
      pointer-events: none;
      background-color: var(--hint-color);
    }
  }

  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 10);
    }
  }

  &__error {
    text-align: center;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    @include adaptiveValue('gap', 20, 10);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__back,
  &__submit {
    flex: 0 1 50%;
    &_full {
      flex: 1 1 100%;
    }
  }
  &__warn {
    text-align: center;
    opacity: 0.5;
  }
}
</style>
