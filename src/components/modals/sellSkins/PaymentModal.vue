<template>
  <BaseModal
    :show="show"
    :wrapper-classes="['payment-modal__inner']"
    @close="handleClose"
  >
    <div class="payment">
      <div class="payment__title _h3">
        {{ $t('Payment details') }}
      </div>

      <div class="payment__subtitle">
        {{ $t('Bank / SEPA') }}
      </div>

      <div class="payment__inputs">
        <BaseInput
          v-model="formData.fullName"
          :label="$t('Name')"
          :error="formErrors.fullName"
          :disabled="isLoading"
          class="payment__input"
          name="fullName"
          autocomplete="name"
          @blur="validateField('fullName')"
        />

        <BaseInput
          v-model="formData.iban"
          :label="$t('IBAN')"
          :error="formErrors.iban"
          :disabled="isLoading"
          class="payment__input"
          name="iban"
          autocomplete="off"
          @input="handleIbanInput"
          @blur="validateField('iban')"
        />
      </div>

      <div v-if="formErrors.general" class="payment__error _text-error">
        {{ formErrors.general }}
      </div>

      <BaseButton
        type="button"
        variant="bordered"
        class="payment__submit"
        :disabled="isLoading || !isFormComplete"
        :loading="isLoading"
        @click="handleConfirm"
      >
        {{ $t('Save') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const toast = useToast()
const offerFlowStore = useOfferFlowStore()
const currencyStore = useCurrencyStore()

const isLoading = ref(false)

const formData = ref({
  fullName: '',
  iban: '',
})

const formErrors = ref({
  fullName: '',
  iban: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const selectedOffer = computed(() => {
  return offerFlowStore.selectedOffer || offerFlowStore.getSelectedOffer || null
})

const selectedCurrency = computed(() => {
  return (
    selectedOffer.value?.fiat_currency ||
    selectedOffer.value?.currency ||
    currencyStore.currentCurrencyCode ||
    'EUR'
  )
})

const splitFullName = fullName => {
  const parts = norm(fullName).split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

const normalizeIban = value => {
  return String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

const formatIban = value => {
  return normalizeIban(value).replace(/(.{4})(?=.)/g, '$1 ')
}

const isValidFullName = computed(() => {
  const { firstName, lastName } = splitFullName(formData.value.fullName)

  return Boolean(firstName && lastName)
})

const isValidIban = computed(() => {
  const iban = normalizeIban(formData.value.iban)

  return /^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)
})

const isFormComplete = computed(() => {
  return isValidFullName.value && isValidIban.value
})

const clearErrors = () => {
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = ''
  })
}

const clearFieldError = field => {
  formErrors.value[field] = ''
  formErrors.value.general = ''
}

const validateField = field => {
  clearFieldError(field)

  if (field === 'fullName') {
    if (!norm(formData.value.fullName)) {
      formErrors.value.fullName = t('Name is required')

      return
    }

    if (!isValidFullName.value) {
      formErrors.value.fullName = t('Please enter your name and surname')
    }

    return
  }

  if (field === 'iban') {
    if (!normalizeIban(formData.value.iban)) {
      formErrors.value.iban = t('IBAN is required')

      return
    }

    if (!isValidIban.value) {
      formErrors.value.iban = t('Please enter a valid IBAN')
    }
  }
}

const validateForm = () => {
  clearErrors()

  validateField('fullName')
  validateField('iban')

  return !Object.values(formErrors.value).some(Boolean)
}

const handleIbanInput = event => {
  const sourceValue = event?.target?.value ?? formData.value.iban

  formData.value.iban = formatIban(sourceValue)

  clearFieldError('iban')
}

const handleClose = () => {
  if (isLoading.value) return

  clearErrors()
  emit('close')
}

const handleConfirm = async () => {
  if (isLoading.value) return
  if (!validateForm()) return

  const offerId = selectedOffer.value?.id || offerFlowStore.selectedOffer?.id

  if (!offerId) {
    formErrors.value.general = t('Offer ID not found')

    return
  }

  const contactInfo = offerFlowStore.contactInfo || {}
  const { firstName, lastName } = splitFullName(formData.value.fullName)

  const payload = {
    id: offerId,

    name: firstName,
    surname: lastName,

    first_name: firstName,
    last_name: lastName,

    account_number: normalizeIban(formData.value.iban),

    currency: selectedCurrency.value,

    address: contactInfo.address || '',
    city: contactInfo.city || '',
    country: contactInfo.country || '',
    email: contactInfo.email || '',
    phone: contactInfo.phone || '',
    postCode: contactInfo.postCode || contactInfo.post_code || '',
  }

  try {
    isLoading.value = true
    formErrors.value.general = ''

    const result = await offerFlowStore.completeOffer({
      offerId,
      paymentMethod: 'sepa',
      payload,
    })

    if (result === true || result?.success) {
      toast.success(t('Payment submitted successfully'))

      emit('close')

      await offerFlowStore.fetchOffers?.()

      return
    }

    formErrors.value.general =
      result?.error || result?.message || t('Failed to process payment')
  } catch (error) {
    formErrors.value.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to process payment')
  } finally {
    isLoading.value = false
  }
}

const initFormData = async () => {
  await currencyStore.initializeCurrencies?.()

  const contactInfo = offerFlowStore.contactInfo || {}

  const firstName = contactInfo.firstName || contactInfo.name || ''
  const lastName = contactInfo.lastName || contactInfo.surname || ''

  formData.value.fullName = [firstName, lastName].filter(Boolean).join(' ')

  formData.value.iban = ''

  clearErrors()
}

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) return

    await initFormData()
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.payment {
  width: 100%;

  &__title {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__subtitle {
    color: var(--secondary-color);
    text-align: center;
    font-size: 16px;
    line-height: 150%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__input {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__error {
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__submit {
    width: 100%;
  }
}
</style>
