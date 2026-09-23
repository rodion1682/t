<template>
  <div class="sign-in">
    <div class="sign-in__title _h3">
      {{ $t('Log in') }}
    </div>

    <form class="sign-in__form" @submit.prevent="handleSignIn">
      <div class="sign-in__inputs">
        <BaseInput
          v-model="form.email"
          class="sign-in__input"
          type="email"
          autocomplete="email"
          :label="$t('Email')"
        />

        <BaseInput
          v-model="form.password"
          class="sign-in__input"
          type="password"
          autocomplete="current-password"
          :label="$t('Password')"
        />
      </div>

      <button
        class="sign-in__forgot _link"
        type="button"
        @click="handleForgotPassword"
      >
        {{ $t('Forgot password?') }}
      </button>

      <div v-if="error" class="sign-in__error _text-error">
        {{ error }}
      </div>

      <div class="sign-in__actions">
        <BaseButton type="submit" :disabled="isLoading" class="sign-in__submit">
          <span v-if="isLoading"> {{ $t('Logging in') }}... </span>

          <span v-else>
            {{ $t('Log In') }}
          </span>
        </BaseButton>
      </div>
    </form>

    <div class="sign-in__bottom">
      <div class="sign-in__text">
        {{ $t('Don’t have an account?') }}
      </div>

      <BaseButton
        variant="bordered"
        class="sign-in__switch"
        @click="router.push({ name: 'RegisterPage' })"
      >
        {{ $t('Register') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['open-sign-up', 'open-reset-password'])

const router = useRouter()
const { t } = useI18n()

const IS_RESET_MODAL_ACTIVE = true

const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
})

const handleForgotPassword = () => {
  if (IS_RESET_MODAL_ACTIVE) {
    emit('open-reset-password')
    return
  }

  router.push({
    name: 'ForgotPasswordPage',
  })
}

const validateForm = () => {
  if (!form.email || !form.password) {
    error.value = t('Email and password are required')
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    error.value = t('Invalid email format')
    return false
  }

  return true
}

const handleSignIn = async () => {
  error.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await authStore.login(form.email, form.password)

    const redirectTo = router.currentRoute.value.query.redirect

    if (redirectTo) {
      router.push(redirectTo)
      return
    }

    router.replace({
      path: '/account',
    })
  } catch (err) {
    if (err?.errors && Object.keys(err.errors).length > 0) {
      error.value = Object.values(err.errors)[0][0]
    } else {
      error.value = err?.message || err || t('An error occurred')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sign-in {
  position: relative;
  z-index: 1;
  &_rest {
    text-align: center;
  }
  &__reset {
    display: none !important;
  }

  &__title {
    text-shadow: 1px 1px 1px var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__subtitle {
    text-shadow: 1px 1px 1px var(--bg-primary-color);
    line-height: 120%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__form {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 100, 20);
    }
  }

  &__inputs {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__row {
    display: flex;
    gap: 14px;
  }

  &__input {
    width: 100%;
    flex: 0 1 50%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__terms {
    text-shadow: 1px 1px 1px var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__forgot {
    margin-right: auto;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__error {
    text-shadow: 1px 1px 1px var(--bg-primary-color);
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 20, 10);
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    @media (max-width: $md7) {
      flex-wrap: wrap;
      gap: 18px;
    }
  }

  &__text {
    text-shadow: 1px 1px 1px var(--bg-primary-color);

    @media (min-width: $md7) {
      white-space: nowrap;
    }

    @media (max-width: $md7) {
      text-align: center;
    }
  }

  &__switch {
    @media (min-width: $md7) {
      max-width: 250px;
    }

    &_full {
      max-width: 100%;
    }
  }
}
</style>
