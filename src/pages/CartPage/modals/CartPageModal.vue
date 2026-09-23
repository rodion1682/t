<template>
  <BaseModal
    :show="show"
    @close="handleClose"
    :wrapperClasses="['cart-page-modal__inner']"
  >
    <CartPage @top-up-click="handleClose" />
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'
import CartPage from '../CartPage.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'update:show'])

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}
</script>
