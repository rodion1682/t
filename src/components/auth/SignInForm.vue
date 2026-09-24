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
          {{ $t('Don’t have an account?') }}
        </div>

        <BaseButton
          variant="white-bordered"
          class="info__switch"
          @click="router.push({ name: 'RegisterPage' })"
        >
          {{ $t('Register') }}
        </BaseButton>
      </div>
    </div>
    <div class="sign-in__body">
      <div class="sign-in__title">
        {{ $t('Sign In') }}
      </div>

      <form class="sign-in__form" @submit.prevent="handleSignIn">
        <div class="sign-in__inputs">
          <BaseInput
            v-model="form.email"
            class="sign-in__input"
            type="email"
            autocomplete="email"
            :label="$t('E-Mail')"
          />

          <BaseInput
            v-model="form.password"
            class="sign-in__input"
            type="password"
            autocomplete="current-password"
            :label="$t('Password')"
          />
        </div>
        <div v-if="error" class="sign-in__error _text-error">
          {{ error }}
        </div>

        <div class="sign-in__actions">
          <BaseButton
            type="submit"
            :disabled="isLoading"
            class="sign-in__submit"
          >
            <span v-if="isLoading"> {{ $t('Signing in') }}... </span>

            <span v-else>
              {{ $t('Sign In') }}
            </span>
          </BaseButton>
        </div>
        <button
          class="sign-in__forgot _link"
          type="button"
          @click="handleForgotPassword"
        >
          {{ $t('Forgot password?') }}
        </button>
      </form>
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

const IS_RESET_MODAL_ACTIVE = false

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
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.sign-in {
  position: relative;
  z-index: 1;
  display: flex;
  @include adaptiveValue('border-radius', 38, 20);
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  overflow: hidden;
  width: 100%;
  @media (max-width: $md2) {
    flex-direction: column-reverse;
  }
  &__info {
    @include adaptiveValue('padding', 56, 15);
    background-color: var(--green-kelp);
    @media (min-width: $md2) {
      flex: 0 1 58%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  &__body {
    @include adaptiveValue('padding', 56, 15);
    background-color: var(--double-spanish-white);
    @media (min-width: $md2) {
      flex: 0 1 42%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  &__title {
    @include sg-42-700;
    color: var(--cod-gray);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
  }

  &__subtitle {
    @include ibm-15-400;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 10);
    }
  }

  &__form {
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__input {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 17, 18);
    }
  }

  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__actions {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 27, 18);
    }
  }

  &__submit {
    text-transform: uppercase;
  }

  &__forgot {
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }
}

.info {
  &__label {
    @include ibm-12-700;
    color: var(--flesh);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10, 5);
    }
  }

  &__title {
    @include sg-36-700;
    color: var(--janna);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 27, 18);
    }
  }

  &__items {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 95, 18);
    }
  }

  &__item {
    display: flex;
    gap: 16px;
    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__number {
    width: fit-content;
    @include adaptiveValue('min-width', 44, 40);
    @include adaptiveValue('height', 44, 40);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #8fa073;
    @include sg-15-400;
    color: var(--janna);
    &_last {
      background-color: var(--copper);
    }
  }

  &__meta {
    flex: 1 1 auto;
  }

  &__subtitle {
    @include sg-18-400;
    line-height: 21.6px;
    &:not(:last-child) {
      margin-bottom: 3px;
    }
  }

  &__text {
    @include ibm-14-400;
    color: var(--sprout);
  }

  &__bottom {
    border-top: 1px solid var(--hemlock);
    @include adaptiveValue('padding-top', 28, 18);
    display: flex;
    gap: 20px;
    justify-content: space-between;
    align-items: center;
  }

  &__switch {
    max-width: 128px;
  }
}
</style>
