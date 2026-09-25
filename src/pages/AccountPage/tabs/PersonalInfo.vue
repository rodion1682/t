<template>
  <form class="personal-info" @submit.prevent="submit">
    <section class="personal-info__section">
      <h2 class="personal-info__subtitle">
        {{ $t('Personal information') }}
      </h2>

      <div class="personal-info__grid">
        <BaseInput
          v-model="form.name"
          :label="$t('Name')"
          :placeholder="$t('Name')"
          :error="errors.name"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.surname"
          :label="$t('Surname')"
          :placeholder="$t('Surname')"
          :error="errors.surname"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          :label="$t('E-Mail')"
          :placeholder="$t('E-Mail')"
          :error="errors.email"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          :label="$t('Phone')"
          :placeholder="$t('Phone')"
          :error="errors.phone"
          :disabled="isSubmitting"
        />
      </div>
    </section>

    <div class="personal-info__divider" />

    <section class="personal-info__section">
      <h2 class="personal-info__subtitle">
        {{ $t('Billing information') }}
      </h2>

      <div class="personal-info__grid">
        <BaseSelect
          v-model="form.country"
          :options="countryOptions"
          option-label="title"
          option-value="id"
          :label="$t('Country')"
          :placeholder="$t('Country')"
          :error="errors.country"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.address"
          autocomplete="street-address"
          :label="$t('Address line')"
          :placeholder="$t('Address line')"
          :error="errors.address"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.city"
          autocomplete="address-level2"
          :label="$t('City')"
          :placeholder="$t('City')"
          :error="errors.city"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.postCode"
          autocomplete="postal-code"
          :label="$t('ZIP-code')"
          :placeholder="$t('ZIP-code')"
          :error="errors.postCode"
          :disabled="isSubmitting"
        />
      </div>
    </section>

    <div class="personal-info__actions">
      <BaseButton
        class="personal-info__save"
        type="submit"
        variant="primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? $t('Saving') + '...' : $t('Save') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'

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

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  address: '',
  city: '',
  postCode: '',
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  address: '',
  city: '',
  postCode: '',
})

const isSubmitting = computed(() => userStore.isUpdating)

const countryOptions = computed(() => countriesStore.countries || [])

const normalize = value => {
  return String(value ?? '').trim()
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const fillForm = user => {
  if (!user) {
    return
  }

  form.name = user.name || ''

  form.surname = user.surname || ''

  form.email = user.email || ''

  form.phone = user.phone || ''

  form.country = user.country?.id ?? user.country ?? ''

  form.address = user.address || ''

  form.city = user.city || ''

  form.postCode = user.zip || user.post_code || ''
}

const validate = () => {
  clearErrors()

  if (!normalize(form.name)) {
    errors.name = t('Name is required')
  }

  if (!normalize(form.surname)) {
    errors.surname = t('Surname is required')
  }

  if (!normalize(form.email)) {
    errors.email = t('Email is required')
  } else if (!/^\S+@\S+\.\S+$/.test(normalize(form.email))) {
    errors.email = t('Invalid email format')
  }

  if (
    normalize(form.phone) &&
    !/^\+?[0-9\s]{8,15}$/.test(normalize(form.phone))
  ) {
    errors.phone = t('Please enter a valid phone number')
  }

  if (normalize(form.address) && normalize(form.address).length < 2) {
    errors.address = t('Address is too short')
  }

  if (normalize(form.city) && normalize(form.city).length < 2) {
    errors.city = t('City is too short')
  }

  if (normalize(form.postCode) && normalize(form.postCode).length < 2) {
    errors.postCode = t('ZIP-code is too short')
  }

  return !Object.values(errors).some(Boolean)
}

const buildPayload = () => {
  return {
    name: normalize(form.name),
    surname: normalize(form.surname),
    email: normalize(form.email),
    phone: normalize(form.phone) || null,
    country: form.country || null,
    address: normalize(form.address) || null,
    city: normalize(form.city) || null,
    postCode: normalize(form.postCode) || null,
  }
}

const submit = async () => {
  if (isSubmitting.value || !validate()) {
    return
  }

  try {
    await userStore.updateProfile(buildPayload())

    fillForm(userStore.user)

    toast.success(t('Profile updated successfully'))
  } catch (error) {
    const responseErrors = error?.response?.data?.errors

    if (responseErrors) {
      Object.entries(responseErrors).forEach(([key, messages]) => {
        if (key in errors && Array.isArray(messages)) {
          errors[key] = messages[0] || ''
        }
      })
    }

    toast.error(
      error?.response?.data?.message ||
        userStore.error ||
        t('Failed to update profile'),
    )
  }
}

onMounted(async () => {
  try {
    if (!countriesStore.countries?.length) {
      await countriesStore.fetchCountries()
    }

    if (!userStore.user) {
      await userStore.fetchProfile()
    }

    fillForm(userStore.user)
  } catch {
    toast.error(t('Failed to load profile data'))
  }
})

watch(
  () => userStore.user,
  user => {
    fillForm(user)
  },
  {
    deep: true,
  },
)

Object.keys(form).forEach(field => {
  watch(
    () => form[field],
    () => {
      if (field in errors) {
        errors[field] = ''
      }
    },
  )
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.personal-info {
  width: 100%;

  @include adaptiveValue('padding', 30, 15);

  @include adaptiveValue('border-radius', 38, 20);

  background: var(--double-spanish-white);

  &__section {
    width: 100%;
  }

  &__subtitle {
    @include ibm-16-700;

    color: var(--kelp);

    letter-spacing: 0.96px;
    text-transform: uppercase;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 19, 18);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    column-gap: 20px;
    row-gap: 18px;
  }

  &__divider {
    width: 100%;
    height: 2px;

    @include adaptiveValue('margin-top', 30, 18);
    @include adaptiveValue('margin-bottom', 30, 18);

    background: var(--sisal);
  }

  &__actions {
    display: flex;
    justify-content: center;

    @include adaptiveValue('margin-top', 36, 20);
  }

  &__save {
    min-width: 200px;
    width: fit-content;
    @include adaptiveValue('min-height', 50, 40);
  }

  :deep(.base-input),
  :deep(.base-select) {
    min-width: 0;
  }

  :deep(input),
  :deep(.base-select__control) {
    min-height: 44px;

    border-radius: 999px;
  }
}

@media (max-width: $md4) {
  .personal-info {
    border-radius: 24px;

    &__grid {
      grid-template-columns: 1fr;
    }

    &__subtitle {
      margin-bottom: 20px;
    }

    &__divider {
      margin: 24px 0;
    }

    &__save {
      width: 100%;
    }
  }
}
</style>
