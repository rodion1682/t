<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue'
import EmailLayout from '@/pages/Email/components/EmailLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAccount = () => {
  router.push({ name: 'account-profile' })
}
</script>

<template>
  <AuthLayout>
    <EmailLayout
      :title="$t('Email Verified Successfully!')"
      :text="
        $t('Your email has been verified. You can now access all features.')
      "
      titleColor="var(--success-color)"
      :buttonText="$t('Go to My Account')"
      @button-click="goToAccount"
    />
  </AuthLayout>
</template>
