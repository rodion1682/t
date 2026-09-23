<template>
  <div class="profile-info">
    <div class="profile-info__block">
      <div class="profile-info__subtitle _h4">
        {{ $t('Personal information') }}
      </div>
      <div class="profile-info__content">
        <div class="profile-info__row">
          <BaseInput
            v-model="form.name"
            :label="t('Name')"
            class="profile-info__input"
            :error="errors.name"
            :disabled="isAnySubmitting"
          />
          <BaseInput
            v-model="form.surname"
            :label="t('Surname')"
            class="profile-info__input"
            :error="errors.surname"
            :disabled="isAnySubmitting"
          />
        </div>
        <BaseInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          :label="t('E-mail')"
          class="profile-info__input"
          :error="errors.email"
          :disabled="isAnySubmitting"
        />
        <BaseInput
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          :label="t('Phone')"
          class="profile-info__input"
          :error="errors.phone"
          :disabled="isAnySubmitting"
        />
      </div>
      <BaseButton
        class="profile-info__save"
        variant="bordered"
        @click="submitPersonalInfo"
        :disabled="isAnySubmitting"
      >
        <span v-if="isSubmittingPersonal">{{ $t('Saving') }}...</span>
        <span v-else>{{ $t('Save') }}</span>
      </BaseButton>
    </div>
    <div class="profile-info__block">
      <div class="profile-info__subtitle _h4">
        {{ $t('Address information') }}
      </div>
      <div class="profile-info__content">
        <BaseSelect
          v-model="form.countryId"
          :options="countryOptions"
          optionLabel="title"
          optionValue="id"
          :label="$t('Country')"
          :error="errors.countryId"
          :disabled="isAnySubmitting"
          class="profile-info__input"
        />
        <BaseInput
          v-model="form.city"
          :label="t('City')"
          class="profile-info__input"
          :error="errors.city"
          :disabled="isAnySubmitting"
        />
        <BaseInput
          v-model="form.address"
          :label="t('Address')"
          class="profile-info__input"
          :error="errors.address"
          :disabled="isAnySubmitting"
        />
        <BaseInput
          v-model="form.postCode"
          :label="t('Postcode')"
          class="profile-info__input profile-info__input_small"
          :error="errors.postCode"
          :disabled="isAnySubmitting"
        />
      </div>
      <BaseButton
        class="profile-info__save"
        variant="bordered"
        @click="submitBillingInfo"
        :disabled="isAnySubmitting"
      >
        <span v-if="isSubmittingBilling">{{ $t('Saving') }}...</span>
        <span v-else>{{ $t('Save') }}</span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useToast } from '@/composables/useToast'
import { useCountriesStore } from '@/stores/countries'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

const isSubmittingPersonal = ref(false)
const isSubmittingBilling = ref(false)
const isSubmittingPassword = ref(false)

const isAnySubmitting = computed(() => {
  return (
    isSubmittingPersonal.value ||
    isSubmittingBilling.value ||
    isSubmittingPassword.value
  )
})

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  countryId: '',
  city: '',
  postCode: '',
  address: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  countryId: '',
  city: '',
  postCode: '',
  address: '',
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const countryOptions = computed(() => countriesStore.countries || [])

const normalize = value => String(value ?? '').trim()

const clearErrors = fields => {
  fields.forEach(field => {
    errors[field] = ''
  })
}

const clearPasswordErrors = () => {
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  clearPasswordErrors()
}

const isPlaceholderValue = (value, placeholderKey) => {
  const v = normalize(value).toLowerCase()
  const ph = normalize(t(placeholderKey)).toLowerCase()

  return !!v && v === ph
}

const isLegacyPlaceholderValue = value => {
  const v = normalize(value).toLowerCase()

  return v === 'name' || v === 'surname'
}

const getProfilePayload = user => {
  return user?.payload || user?.data || user || null
}

const fillFromUser = rawUser => {
  const user = getProfilePayload(rawUser)

  if (!user) return

  const name = user?.name || ''
  const surname = user?.surname || ''

  form.name =
    isPlaceholderValue(name, 'Name') || isLegacyPlaceholderValue(name)
      ? ''
      : name

  form.surname =
    isPlaceholderValue(surname, 'Surname') || isLegacyPlaceholderValue(surname)
      ? ''
      : surname

  form.email = user?.email || ''
  form.phone = user?.phone || ''

  form.countryId = user?.country_id || user?.country?.id || user?.country || ''
  form.postCode = user?.post_code || user?.zip || ''
  form.city = user?.city || ''
  form.address = user?.address || ''

  resetPasswordForm()
}

const validatePersonalInfo = () => {
  clearErrors(['name', 'surname', 'email', 'phone'])

  if (!normalize(form.name)) {
    errors.name = t('Please enter name')
  } else if (
    isPlaceholderValue(form.name, 'Name') ||
    isLegacyPlaceholderValue(form.name)
  ) {
    errors.name = t('Please enter a real name')
  }

  if (!normalize(form.surname)) {
    errors.surname = t('Please enter surname')
  } else if (
    isPlaceholderValue(form.surname, 'Surname') ||
    isLegacyPlaceholderValue(form.surname)
  ) {
    errors.surname = t('Please enter a real surname')
  }

  if (!normalize(form.email)) {
    errors.email = t('Email is required')
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('Invalid email format')
  }

  if (!normalize(form.phone)) {
    errors.phone = t('Phone number is required')
  }

  return !errors.name && !errors.surname && !errors.email && !errors.phone
}

const validateBillingInfo = () => {
  clearErrors(['countryId', 'city', 'address', 'postCode'])

  if (!form.countryId) errors.countryId = t('Country is required')
  if (!normalize(form.city)) errors.city = t('City is required')
  if (!normalize(form.address)) errors.address = t('Address is required')
  if (!normalize(form.postCode)) errors.postCode = t('Post Code is required')

  return (
    !errors.countryId && !errors.city && !errors.address && !errors.postCode
  )
}

const validatePassword = () => {
  clearPasswordErrors()

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = t('Current password is required')
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = t('New password is required')
  } else if (String(passwordForm.newPassword).length < 6) {
    passwordErrors.newPassword = t('Password is too short')
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = t('Please confirm new password')
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = t('Passwords do not match')
  }

  return (
    !passwordErrors.currentPassword &&
    !passwordErrors.newPassword &&
    !passwordErrors.confirmPassword
  )
}

const buildPersonalPayload = () => ({
  name: normalize(form.name),
  surname: normalize(form.surname),
  email: normalize(form.email),
  phone: normalize(form.phone),
})

const buildBillingPayload = () => ({
  country: form.countryId || null,
  city: normalize(form.city),
  address: normalize(form.address),
  postCode: normalize(form.postCode),
})

const submitPersonalInfo = async () => {
  if (isAnySubmitting.value) return
  if (!validatePersonalInfo()) return

  userStore.clearError?.()

  try {
    isSubmittingPersonal.value = true

    await userStore.updateProfile(buildPersonalPayload())
    toast.success(t('Personal information updated successfully'))

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      t('Failed to update personal information')

    toast.error(msg)
  } finally {
    isSubmittingPersonal.value = false
  }
}

const submitBillingInfo = async () => {
  if (isAnySubmitting.value) return
  if (!validateBillingInfo()) return

  userStore.clearError?.()

  try {
    isSubmittingBilling.value = true

    await userStore.updateProfile(buildBillingPayload())
    toast.success(t('Address information updated successfully'))

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      t('Failed to update address information')

    toast.error(msg)
  } finally {
    isSubmittingBilling.value = false
  }
}

const submitPassword = async () => {
  if (isAnySubmitting.value) return
  if (!validatePassword()) return

  userStore.clearError?.()

  try {
    isSubmittingPassword.value = true

    await userStore.updatePassword({
      cur_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
      repeat_password: passwordForm.confirmPassword,
    })

    toast.success(t('Password changed successfully'))
    resetPasswordForm()
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      userStore.error ||
      t('Failed to update password')

    toast.error(msg)
  } finally {
    isSubmittingPassword.value = false
  }
}

onMounted(async () => {
  try {
    if (!countriesStore.countries?.length) {
      await countriesStore.fetchCountries?.()
    }

    await userStore.fetchProfile?.()
    fillFromUser(userStore.user)
  } catch {
    toast.error(t('Failed to load profile data'))
  }
})

watch(
  () => userStore.user,
  user => {
    if (user) fillFromUser(user)
  },
  { deep: true },
)

watch(
  () => form.name,
  () => (errors.name = ''),
)
watch(
  () => form.surname,
  () => (errors.surname = ''),
)
watch(
  () => form.email,
  () => (errors.email = ''),
)
watch(
  () => form.phone,
  () => (errors.phone = ''),
)
watch(
  () => form.countryId,
  () => (errors.countryId = ''),
)
watch(
  () => form.city,
  () => (errors.city = ''),
)
watch(
  () => form.address,
  () => (errors.address = ''),
)
watch(
  () => form.postCode,
  () => (errors.postCode = ''),
)

watch(
  () => passwordForm.currentPassword,
  () => {
    passwordErrors.currentPassword = ''
  },
)

watch(
  () => passwordForm.newPassword,
  () => {
    passwordErrors.newPassword = ''
  },
)

watch(
  () => passwordForm.confirmPassword,
  () => {
    passwordErrors.confirmPassword = ''
  },
)
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-info {
  @media (min-width: $md4) {
    display: flex;
    justify-content: center;
    @include adaptiveValue('gap', 20, 10);
  }
  &_single {
    @include adaptiveValue('padding', 30, 10);
    @include adaptiveValue('border-radius', 20, 4);
    background-color: var(--bg-secondary-color);
  }
  &__block {
    flex: 0 1 50%;
    @include adaptiveValue('padding', 40, 10);
    @include adaptiveValue('border-radius', 20, 10);
    background-color: var(--bg-primary-color);
    border: 1px solid var(--border-primary-color);
  }

  &__subtitle {
    text-transform: uppercase;
    line-height: 120%;
    color: var(--secondary-color) !important;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__content {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__row {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__input {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }
  &__error {
    margin-bottom: 8px;
  }
  &__save {
  }
}
</style>
