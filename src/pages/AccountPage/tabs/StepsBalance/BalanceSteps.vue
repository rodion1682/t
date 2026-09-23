<template>
  <div class="balance" v-bind="attrs">
    <div class="balance__balance">
      <div class="balance__title _l">{{ $t('My balance') }}</div>
      <PriceFormatter
        class="balance__coin"
        :price="userBalance"
        size="size-40"
        skip-conversion
      />
    </div>
    <div class="balance__column">
      <BalanceStepOptions
        v-if="currentStep === 1"
        v-model="selectedAmount"
        @next="currentStep = 2"
      />

      <BalanceStepPayment
        v-else
        :selected-amount="Number(selectedAmount)"
        @back="goToOptionsStep"
        @success-close="goToOptionsStep"
      />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, useAttrs } from 'vue'

import PriceFormatter from '@/components/PriceFormatter.vue'
import { useUserStore } from '@/stores/user'

import BalanceStepOptions from './BalanceStepOptions.vue'
import BalanceStepPayment from './BalanceStepPayment.vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const userStore = useUserStore()
const { userBalance } = storeToRefs(userStore)

const currentStep = ref(1)
const selectedAmount = ref('')

const goToPaymentStep = amount => {
  selectedAmount.value = amount
  currentStep.value = 2
}

const goToOptionsStep = () => {
  currentStep.value = 1
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.balance {
  @media (min-width: $md4) {
    display: flex;
    @include adaptiveValue('gap', 32, 10, 1400, 992, 1);
  }
  &__balance,
  &__column {
    @include adaptiveValue('padding-top', 42, 15);
    @include adaptiveValue('padding-bottom', 42, 15);
    @include adaptiveValue('padding-left', 32, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 32, 10, 1400, 992, 1);
    @include adaptiveValue('border-radius', 30, 8);
    @include bg-border-gradient;
  }
  &__balance {
    flex: 0 1 35%;
    @media (min-width: $md4) {
      @include adaptiveValue('min-height', 374, 100);
      height: fit-content;
    }
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__title {
    line-height: 30px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__coin {
    justify-content: flex-end;
  }

  &__column {
    @media (min-width: $md2) {
      min-width: 650px;
    }
    flex: 0 1 65%;
  }
}
</style>
