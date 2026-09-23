<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'
import { useCartStore } from '@/stores/cart'
import { useTopUpStore } from '@/stores/topup'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const topupStore = useTopUpStore()

const isTopUp = computed(() => route.query.type === 'topup')

const goToOrders = () => router.push({ name: 'account-order-history' })
const goToTransactions = () => router.push({ name: 'account-payment-history' })
const goHome = () => router.push('/')
const goToProducts = () => router.push({ name: 'ProductListPage' })

onMounted(() => {
  if (!isTopUp.value) cartStore.resetState()
  if (isTopUp.value) topupStore.reset()
})
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="isTopUp ? $t('Payment Successful!') : $t('Purchase Successful!')"
      :text="
        isTopUp
          ? $t('Thank you for your payment. Your account has been topped up.')
          : $t('Thank you for your purchase. Your payment was successful.')
      "
      :subtext="
        isTopUp
          ? $t('You can view your transaction in your account.')
          : $t('You can view your purchased items in your order history.')
      "
      tone="success"
    >
      <template #actions>
        <template v-if="isTopUp">
          <BaseButton variant="primary" @click="goToTransactions">
            {{ $t('Transaction History') }}
          </BaseButton>

          <BaseButton variant="bordered" @click="goHome">
            {{ $t('Return to Home') }}
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton variant="primary" @click="goToOrders">
            {{ $t('Order history') }}
          </BaseButton>

          <BaseButton variant="bordered" @click="goToProducts">
            {{ $t('Continue Shopping') }}
          </BaseButton>
        </template>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
