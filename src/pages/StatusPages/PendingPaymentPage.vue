<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

import AuthLayout from '@/layouts/AuthLayout.vue'

import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'

import { usePurchaseStore } from '@/stores/purchase'
import { useTopUpStore } from '@/stores/topup'

const route = useRoute()
const router = useRouter()

const topupStore =
  useTopUpStore()

const purchaseStore =
  usePurchaseStore()

const statusMessage = ref('')
const pollingInterval = ref(null)

const isTopUp = computed(() => {
  return route.query.type === 'topup'
})

const paymentId = computed(() => {
  return (
    route.query.order ||
    route.query.order_id ||
    route.query.id ||
    null
  )
})

const stopPolling = () => {
  if (!pollingInterval.value) {
    return
  }

  clearInterval(
    pollingInterval.value,
  )

  pollingInterval.value = null
}

const goToSuccess = () => {
  stopPolling()

  router.replace({
    path: '/success-payment',
    query: isTopUp.value
      ? {
          type: 'topup',
        }
      : {},
  })
}

const goToFail = message => {
  stopPolling()

  router.replace({
    path: '/fail-payment',
    query: {
      ...(isTopUp.value
        ? {
            type: 'topup',
          }
        : {}),
      error:
        message ||
        'Payment processing failed',
    },
  })
}

const checkTopUpStatus =
  async () => {
    const status =
      await topupStore.checkDepositStatus(
        paymentId.value,
      )

    if (
      status === 'Error' ||
      status === 'Cancelled'
    ) {
      goToFail(
        'Payment processing failed',
      )

      return
    }

    if (status === 'Success') {
      goToSuccess()

      return
    }

    statusMessage.value =
      `Payment is being processed. Status: ${
        status || 'Pending'
      }`
  }

const checkPurchaseStatus =
  async () => {
    const result =
      await purchaseStore.checkPaymentStatus(
        paymentId.value,
      )

    if (!result) {
      return
    }

    if (result.success) {
      goToSuccess()

      return
    }

    if (result.failed) {
      goToFail(
        result.order_status_title ||
          'Payment processing failed',
      )

      return
    }

    statusMessage.value =
      result.order_status_title ||
      'Payment is being processed.'
  }

const checkStatus = async () => {
  if (!paymentId.value) {
    goToFail(
      'Payment information was not found',
    )

    return
  }

  if (isTopUp.value) {
    await checkTopUpStatus()

    return
  }

  await checkPurchaseStatus()
}

const startPolling = () => {
  stopPolling()

  pollingInterval.value =
    setInterval(
      checkStatus,
      5000,
    )
}

const goToAccount = () => {
  router.push({
    name: 'account-profile',
  })
}

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  if (!paymentId.value) {
    goToFail(
      'Payment information was not found',
    )

    return
  }

  await checkStatus()

  if (
    router.currentRoute.value.path ===
    '/pending-payment'
  ) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="$t('Payment Processing')"
      :text="
        statusMessage ||
        $t(
          'Your payment is being processed. Please wait...',
        )
      "
      :subtext="
        $t(
          'This page will automatically update when the payment is complete.',
        )
      "
      tone="pending"
      show-loader
    >
      <template #actions>
        <BaseButton
          variant="primary"
          @click="goToAccount"
        >
          {{ $t('Go to Account') }}
        </BaseButton>

        <BaseButton
          variant="bordered"
          @click="goHome"
        >
          {{ $t('Return to Home') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
