<template>
  <BaseModal :show="isVisible" @close="cancelPurchase">
    <div class="text-center text-white">
      <h2 class="mb-4 font-secondary text-2xl font-semibold">
        {{ $t(`Confirm Purchase`) }}
      </h2>
      <p class="mb-8">
        {{ $t(`Are you sure you want to proceed with this purchase?`) }}
      </p>
      <div class="modal-actions flex items-center justify-center gap-5">
        <BaseButton @click="confirmPurchase" variant="secondary">{{
          $t(`Yes`)
        }}</BaseButton>
        <BaseButton @click="cancelPurchase" variant="outlined">{{
          $t(`No`)
        }}</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  onConfirm: {
    type: Function,
    required: true,
  },
  onCancel: {
    type: Function,
    required: true,
  },
})

const confirmPurchase = () => {
  props.onConfirm()
  props.onCancel() // Close modal after confirmation
}

const cancelPurchase = () => {
  props.onCancel()
}
</script>
