<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isTopUp = computed(() => route.query.type === 'topup')
const errorMessage = computed(() => String(route.query.error || ''))

const goHome = () => router.push('/')
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
