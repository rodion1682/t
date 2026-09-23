<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'
import { useTopUpStore } from '@/stores/topup'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const topupStore = useTopUpStore()

const isPolling = ref(false)
const statusMessage = ref('')

const depositId = computed(
  () => route.query.order || route.query.order_id || null,
)

const checkStatus = async () => {
  if (!depositId.value) return

  isPolling.value = true

  try {
    const status = await topupStore.checkDepositStatus(depositId.value)

    if (status === null || status === 'Error') {
      router.replace({
        path: '/fail-payment',
        query: { type: 'topup', error: 'Payment processing failed' },
      })
      return
    }

    if (status === 'Success') {
      router.replace({
        path: '/success-payment',
        query: { type: 'topup' },
      })
      return
    }

    statusMessage.value = `Payment is being processed. Status: ${status || 'Pending'}`
  } catch (e) {
    console.error('Error checking payment status:', e)
  } finally {
    isPolling.value = false
  }
}

const goToAccount = () => router.push({ name: 'account-profile' })
const goHome = () => router.push('/')

onMounted(() => {
  if (!depositId.value) {
    router.replace({
      path: '/fail-payment',
      query: { type: 'topup', error: 'Payment processing failed' },
    })
    return
  }

  checkStatus()
  topupStore.startStatusPolling(depositId.value)
})

onUnmounted(() => {
  topupStore.stopStatusPolling()
})
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="$t('Payment Processing')"
      :text="
        statusMessage || $t('Your payment is being processed. Please wait...')
      "
      :subtext="
        $t('This page will automatically update when the payment is complete.')
      "
      tone="pending"
      :showLoader="true"
    >
      <template #actions>
        <BaseButton variant="primary" @click="goToAccount">
          {{ $t('Go to Account') }}
        </BaseButton>

        <BaseButton variant="bordered" @click="goHome">
          {{ $t('Return to Home') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
