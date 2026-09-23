<template>
  <BaseModal
    v-model:show="show"
    :persistent="persistent"
    :wrapperClasses="['sign-up__inner']"
    @close="handleClose"
  >
    <SignUpForm @success="handleSuccess" @open-sign-in="handleSwitchToSignIn" />
  </BaseModal>
</template>

<script setup>
import SignUpForm from '@/components/auth/SignUpForm.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useAuthStore } from '@/stores/auth'
import { computed, ref, watch } from 'vue'

const authStore = useAuthStore()

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

const handleSuccess = () => {
  emit('update:modelValue', false)
}

const handleSwitchToSignIn = () => {
  emit('update:modelValue', false)
  emit('switch-to-sign-in')
}
watch(
  () => authStore.isAuthenticated,
  v => {
    if (v) {
      emit('update:modelValue', false)
    }
  },
)
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.sign-up-modal {
  &__container {
    @include adaptiveValue('max-width', 480, 320, 1920);
  }
}
</style>
