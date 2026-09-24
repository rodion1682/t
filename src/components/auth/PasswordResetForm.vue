<template>
  <div class="sign-in">
    <div class="sign-in__info info">
      <div class="info__label">
        {{ $t('Account recovery') }}
      </div>

      <div class="info__title">
        {{ $t('Recover access to your account') }}
      </div>

      <div class="info__items">
        <div class="info__item">
          <div class="info__number">01</div>

          <div class="info__meta">
            <div class="info__subtitle">
              {{ $t('Enter your email') }}
            </div>

            <div class="info__text">
              {{ $t('Enter the email address connected to your account.') }}
            </div>
          </div>
        </div>

        <div class="info__item">
          <div class="info__number">02</div>

          <div class="info__meta">
            <div class="info__subtitle">
              {{ $t('Check your inbox') }}
            </div>

            <div class="info__text">
              {{
                $t('We will generate a new password and send it to your email.')
              }}
            </div>
          </div>
        </div>

        <div class="info__item">
          <div class="info__number info__number_last">03</div>

          <div class="info__meta">
            <div class="info__subtitle">
              {{ $t('Sign in with your new password') }}
            </div>

            <div class="info__text">
              {{
                $t(
                  'Use the password from the email to sign in to your account.',
                )
              }}
            </div>
          </div>
        </div>
      </div>

      <div class="info__bottom">
        <div class="info__text">
          {{ $t('Remember your password?') }}
        </div>

        <BaseButton
          variant="white-bordered"
          class="info__switch"
          type="button"
          @click="goToSignIn"
        >
          {{ $t('Sign In') }}
        </BaseButton>
      </div>
    </div>

    <div class="sign-in__body">
      <div class="sign-in__title">
        {{ $t('Forgot your password?') }}
      </div>

      <div class="sign-in__subtitle">
        {{ $t('Enter your E-Mail and we will send you a new password.') }}
      </div>

      <form class="sign-in__form" @submit.prevent="handlePasswordReset">
        <div class="sign-in__inputs">
          <BaseInput
            v-model="email"
            class="sign-in__input"
            type="email"
            name="email"
            autocomplete="email"
            :label="$t('E-Mail')"
            :placeholder="$t('person@gmail.com')"
            :error="errorMessage"
          />
        </div>

        <div v-if="serverMessage" class="sign-in__success _text-success">
          {{ serverMessage }}
        </div>

        <div v-if="errorMessage" class="sign-in__error _text-error">
          {{ errorMessage }}
        </div>

        <div class="sign-in__actions">
          <BaseButton
            type="submit"
            :disabled="isLoading"
            class="sign-in__submit"
          >
            <span v-if="isLoading"> {{ $t('Sending') }}... </span>

            <span v-else>
              {{ $t('Send new password') }}
            </span>
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['back-to-sign-in'])

const { t } = useI18n()
const router = useRouter()

const toast = useToast()
const userStore = useUserStore()

const email = ref('')

const isLoading = ref(false)

const errorMessage = ref('')
const serverMessage = ref('')

const normalizeEmail = value => {
  return String(value || '')
    .trim()
    .toLowerCase()
}

const validateEmail = () => {
  const value = normalizeEmail(email.value)

  if (!value) {
    errorMessage.value = t('Email is required')

    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    errorMessage.value = t('Please enter a valid email address')

    return false
  }

  return true
}

const goToSignIn = () => {
  emit('back-to-sign-in')

  if (router.currentRoute.value.name !== 'LoginPage') {
    router.push({
      name: 'LoginPage',
    })
  }
}

const handlePasswordReset = async () => {
  if (isLoading.value) {
    return
  }

  errorMessage.value = ''
  serverMessage.value = ''

  if (!validateEmail()) {
    return
  }

  isLoading.value = true

  try {
    const normalizedEmail = normalizeEmail(email.value)

    await userStore.resetPassword(normalizedEmail)

    serverMessage.value = t(
      'A new password has been sent to your email. Use it to sign in.',
    )

    toast.success(serverMessage.value)
  } catch (error) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to send new password')

    errorMessage.value = apiMessage

    toast.error(apiMessage)
  } finally {
    isLoading.value = false
  }
}
</script>
