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
      :title="$t('Email Already Verified')"
      :text="
        $t('Your email was already verified. No further action is needed.')
      "
      titleColor="success"
      :buttonText="$t('Go to My Account')"
      @button-click="goToAccount"
    />
  </AuthLayout>
</template>
