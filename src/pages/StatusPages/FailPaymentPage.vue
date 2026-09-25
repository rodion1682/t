<script setup>
import { computed } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

import AuthLayout from '@/layouts/AuthLayout.vue'

import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'

const route = useRoute()
const router = useRouter()

const isTopUp = computed(() => {
  return route.query.type === 'topup'
})

const errorMessage = computed(() => {
  return String(
    route.query.error ||
      'We could not complete your payment. Please try again.',
  )
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="isTopUp ? $t('Top up Failed') : $t('Payment Failed')"
      :text="errorMessage"
      tone="error"
    >
      <template #actions>
        <BaseButton variant="bordered" @click="goHome">
          {{ $t('Return to Home') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
