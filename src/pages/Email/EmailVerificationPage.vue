<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import EmailLayout from '@/pages/Email/components/EmailLayout.vue'
import axios from '@/plugins/axios'
import { ref } from 'vue'

const isLoading = ref(false)
const message = ref('')
const status = ref('')

const resendVerification = async () => {
  isLoading.value = true
  message.value = ''
  status.value = ''

  try {
    const response = await axios.post('/email/verify/resend')
    message.value = response.data.message
    status.value = response.data.status
  } catch (error) {
    message.value =
      error.response?.data?.message || 'Failed to send verification email'
    status.value = 'ERROR'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <EmailLayout
      :hint="$t('Verification Required')"
      :title="$t('Email Verification')"
      :text="
        $t('Please verify your email address to continue using your account.')
      "
    >
      <BaseButton
        class="verify-email__button"
        @click="resendVerification"
        :disabled="isLoading"
      >
        <span v-if="isLoading">{{ $t('Sending...') }}</span>
        <span v-else>{{ $t('Resend Verification Email') }}</span>
      </BaseButton>

      <div
        v-if="message"
        class="verify-email__message"
        :class="{
          'is-success': status === 'OK',
          'is-error': status === 'ERROR',
        }"
      >
        {{ message }}
      </div>

      <template #bottom>
        <BaseButton variant="bordered">
          <RouterLink to="/" class="verify-email__link">
            {{ $t('Back to Home') }}
          </RouterLink>
        </BaseButton>
      </template>
    </EmailLayout>
  </AuthLayout>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.verify-email {
  &__button {
    width: 100%;
  }

  &__message {
    font-size: 16px;
    margin-top: 10px;

    &.is-success {
      color: var(--hint-third-color);
    }

    &.is-error {
      color: var(--error-color);
    }
  }

  &__link {
  }
}
</style>
