<template>
  <BaseModal
    v-model:show="show"
    :persistent="persistent"
    :wrapperClasses="['reset__inner']"
    @close="handleClose"
  >
    <PasswordResetForm @back-to-sign-in="handleSwitchToSignIn" />
  </BaseModal>
</template>

<script setup>
import PasswordResetForm from '@/components/auth/PasswordResetForm.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  persistent: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close', 'switch-to-sign-in'])

const show = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const handleClose = () => {
  emit('close')
  emit('update:modelValue', false)
}

const handleSwitchToSignIn = () => {
  emit('update:modelValue', false)
  emit('switch-to-sign-in')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.password-reset__inner {
  @include adaptiveValue('max-width', 420, 320, 1920);
}
</style>
