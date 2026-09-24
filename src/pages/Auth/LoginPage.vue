<template>
  <AuthLayout show-info>
    <SignInForm @open-reset-password="openResetPassword" />

    <PasswordResetModal
      v-model="isResetPasswordOpen"
      @switch-to-sign-in="closeResetPassword"
    />
  </AuthLayout>
</template>

<script setup>
import SignInForm from '@/components/auth/SignInForm.vue'
import PasswordResetModal from '@/components/modals/auth/PasswordResetModal.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ref } from 'vue'

const isResetPasswordOpen = ref(false)

const openResetPassword = () => {
  isResetPasswordOpen.value = true
}

const closeResetPassword = () => {
  isResetPasswordOpen.value = false
}
</script>
