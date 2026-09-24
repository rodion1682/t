<template>
  <div class="sign-in">
    <div class="sign-in__info info">
      <div class="info__label">
        {{ $t('How it works') }}
      </div>

      <div class="info__title">
        {{ $t('No bots. A person checks every trade') }}
      </div>

      <div class="info__items">
        <div class="info__item">
          <div class="info__number">01</div>

          <div class="info__meta">
            <div class="info__subtitle">
              {{ $t('Create an account') }}
            </div>

            <div class="info__text">
              {{
                $t(
                  'Email and password, nothing else. Paste your Steam trade link into your profile whenever you are ready to buy.',
                )
              }}
            </div>
          </div>
        </div>

        <div class="info__item">
          <div class="info__number">02</div>

          <div class="info__meta">
            <div class="info__subtitle">
              {{ $t('Pick the exact item') }}
            </div>

            <div class="info__text">
              {{
                $t(
                  'Filter by float, pattern and price history. What you see on the card is the item you get.',
                )
              }}
            </div>
          </div>
        </div>

        <div class="info__item">
          <div class="info__number info__number_last">03</div>

          <div class="info__meta">
            <div class="info__subtitle">
              {{ $t('We check it and send the offer') }}
            </div>

            <div class="info__text">
              {{
                $t(
                  'A person confirms the item is in stock and matches the listing, then sends the trade offer to your link.',
                )
              }}
            </div>
          </div>
        </div>
      </div>

      <div class="info__bottom">
        <div class="info__text">
          {{ $t('Already have an account?') }}
        </div>

        <BaseButton
          variant="white-bordered"
          class="info__switch"
          @click="
            router.push({
              name: 'LoginPage',
            })
          "
        >
          {{ $t('Sign In') }}
        </BaseButton>
      </div>
    </div>

    <div class="sign-in__body">
      <div class="sign-in__title">
        {{ $t('Create account') }}
      </div>

      <form class="sign-in__form" @submit.prevent="handleSignUp">
        <div class="sign-in__inputs">
          <BaseInput
            v-if="IS_COMBINED_NAME_AND_SURNAME"
            v-model="form.fullName"
            class="sign-in__input"
            name="fullName"
            autocomplete="name"
            :label="$t('Full name')"
            :error="fieldErrors.fullName"
          />

          <template v-else>
            <BaseInput
              v-model="form.firstName"
              class="sign-in__input"
              name="firstName"
              autocomplete="given-name"
              :label="$t('Name')"
              :error="fieldErrors.firstName"
            />

            <BaseInput
              v-model="form.lastName"
              class="sign-in__input"
              name="lastName"
              autocomplete="family-name"
              :label="$t('Surname')"
              :error="fieldErrors.lastName"
            />
          </template>

          <BaseInput
            v-model="form.email"
            class="sign-in__input"
            type="email"
            name="email"
            autocomplete="email"
            :label="$t('E-Mail')"
            :error="fieldErrors.email"
          />

          <BaseInput
            v-if="SHOW_PHONE"
            v-model="form.phone"
            class="sign-in__input"
            type="tel"
            name="phone"
            autocomplete="tel"
            :label="$t('Phone')"
            :error="fieldErrors.phone"
          />

          <BaseInput
            v-model="form.password"
            class="sign-in__input"
            type="password"
            name="password"
            autocomplete="new-password"
            :label="$t('Create Password')"
            :error="fieldErrors.password"
          />

          <BaseInput
            v-model="form.confirmPassword"
            class="sign-in__input"
            type="password"
            name="confirmPassword"
            autocomplete="new-password"
            :label="$t('Confirm password')"
            :error="fieldErrors.confirmPassword"
          />
        </div>

        <div class="sign-in__terms">
          <BaseCheckbox
            v-model="form.termsAccepted"
            :error="fieldErrors.termsAccepted"
            terms
          />
        </div>

        <div v-if="error && !hasFieldErrors" class="sign-in__error _text-error">
          {{ error }}
        </div>

        <div class="sign-in__actions">
          <BaseButton
            type="submit"
            :disabled="isLoading"
            class="sign-in__submit"
          >
            <span v-if="isLoading"> {{ $t('Creating account') }}... </span>

            <span v-else>
              {{ $t('Create account') }}
            </span>
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

defineEmits(['open-sign-in'])

const IS_COMBINED_NAME_AND_SURNAME = false

const SHOW_PHONE = false

const { t } = useI18n()
const router = useRouter()

const authStore = useAuthStore()
const toast = useToast()

const { ensurePages } = useStaticPages()

const isLoading = ref(false)
const error = ref('')

const fieldErrors = ref({
  fullName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  termsAccepted: '',
})

const form = reactive({
  fullName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})

let isSubmitting = false

const norm = value => {
  return String(value ?? '').trim()
}

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
    name: norm(form.firstName),

    surname: norm(form.lastName),
  }
}

const clearFieldErrors = () => {
  Object.keys(fieldErrors.value).forEach(key => {
    fieldErrors.value[key] = ''
  })
}

const validateForm = () => {
  clearFieldErrors()

  error.value = ''

  if (IS_COMBINED_NAME_AND_SURNAME) {
    const { name, surname } = splitFullName(form.fullName)

    if (!name || !surname) {
      fieldErrors.value.fullName = t('Please enter your full name')

      error.value = fieldErrors.value.fullName

      return false
    }
  } else {
    if (!norm(form.firstName)) {
      fieldErrors.value.firstName = t('First name is required')

      error.value = fieldErrors.value.firstName

      return false
    }

    if (!norm(form.lastName)) {
      fieldErrors.value.lastName = t('Last name is required')

      error.value = fieldErrors.value.lastName

      return false
    }
  }

  if (!norm(form.email)) {
    fieldErrors.value.email = t('Email is required')

    error.value = fieldErrors.value.email

    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(norm(form.email))) {
    fieldErrors.value.email = t('Please enter a valid email address')

    error.value = fieldErrors.value.email

    return false
  }

  if (SHOW_PHONE) {
    const phone = norm(form.phone)

    if (!phone) {
      fieldErrors.value.phone = t('Phone number is required')

      error.value = fieldErrors.value.phone

      return false
    }

    const normalizedPhone = phone.replace(/\s+/g, '')

    const phoneRegex = /^\+?\d{8,15}$/

    if (!phoneRegex.test(normalizedPhone)) {
      fieldErrors.value.phone = t('Please enter a valid phone number')

      error.value = fieldErrors.value.phone

      return false
    }
  }

  if (!form.password) {
    fieldErrors.value.password = t('Password is required')

    error.value = fieldErrors.value.password

    return false
  }

  if (form.password.length < 5) {
    fieldErrors.value.password = t('Password must be at least 5 characters')

    error.value = fieldErrors.value.password

    return false
  }

  if (!form.confirmPassword) {
    fieldErrors.value.confirmPassword = t('Please confirm your password')

    error.value = fieldErrors.value.confirmPassword

    return false
  }

  if (form.password !== form.confirmPassword) {
    const message = t('Passwords do not match')

    fieldErrors.value.password = message

    fieldErrors.value.confirmPassword = message

    error.value = message

    return false
  }

  if (!form.termsAccepted) {
    fieldErrors.value.termsAccepted = t(
      'Please accept the terms and Privacy Notice',
    )

    error.value = fieldErrors.value.termsAccepted

    return false
  }

  return true
}

const hasFieldErrors = computed(() => {
  return Object.values(fieldErrors.value).some(value => {
    return Boolean(value?.length)
  })
})

const buildRegisterPayload = () => {
  const { name, surname } = getNameData()

  const payload = {
    name,

    surname,

    email: norm(form.email),

    password: form.password,

    passConfirm: form.confirmPassword,
  }

  if (SHOW_PHONE) {
    payload.phone = norm(form.phone)
  }

  return payload
}

const handleBackendErrors = backendErrors => {
  const map = {
    name: IS_COMBINED_NAME_AND_SURNAME ? 'fullName' : 'firstName',

    surname: IS_COMBINED_NAME_AND_SURNAME ? 'fullName' : 'lastName',

    email: 'email',

    password: 'password',

    passConfirm: 'confirmPassword',
  }

  if (SHOW_PHONE) {
    map.phone = 'phone'
    map.phoneE164 = 'phone'
  }

  Object.entries(backendErrors || {}).forEach(([field, messages]) => {
    const key = map[field]

    if (!key) {
      return
    }

    if (!(key in fieldErrors.value)) {
      return
    }

    const message = Array.isArray(messages) ? messages[0] : messages

    fieldErrors.value[key] = message || ''
  })
}

const handleSignUp = async () => {
  if (isSubmitting) {
    return
  }

  isSubmitting = true

  try {
    if (!validateForm()) {
      toast.error(error.value || t('Please fill in all required fields'))

      return
    }

    isLoading.value = true

    const payload = buildRegisterPayload()

    await authStore.register(payload)

    const redirectTo = router.currentRoute.value.query.redirect

    if (redirectTo) {
      await router.push(redirectTo)

      return
    }

    await router.push({
      name: 'account',
    })
  } catch (err) {
    const backendErrors = err?.response?.data?.errors

    const backendMessage = err?.response?.data?.message

    if (backendErrors && Object.keys(backendErrors).length) {
      handleBackendErrors(backendErrors)

      if (backendMessage) {
        error.value = backendMessage

        toast.error(error.value)
      } else {
        const firstFieldError = Object.values(fieldErrors.value).find(Boolean)

        if (firstFieldError) {
          error.value = firstFieldError

          toast.error(firstFieldError)
        }
      }

      return
    }

    error.value =
      backendMessage || err?.message || err || t('Registration failed')

    toast.error(error.value)
  } finally {
    isLoading.value = false

    setTimeout(() => {
      isSubmitting = false
    }, 500)
  }
}

onMounted(async () => {
  await ensurePages()
})
</script>
