<template>
  <BaseModal
    v-model:show="show"
    :persistent="persistent"
    :wrapperClasses="['sign-in__inner']"
    @close="handleClose"
  >
    <SignInForm
      @success="handleSuccess"
      @open-sign-up="handleSwitchToSignUp"
      @open-reset-password="handleSwitchToReset"
    />
  </BaseModal>
</template>

<script setup>
import SignInForm from '@/components/auth/SignInForm.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  persistent: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'switch-to-sign-up',
  'switch-to-reset-password',
])

const authStore = useAuthStore()

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

const handleSwitchToSignUp = () => {
  emit('update:modelValue', false)
  emit('switch-to-sign-up')
}

const handleSwitchToReset = () => {
  emit('update:modelValue', false)
  emit('switch-to-reset-password')
}

watch(
  () => authStore.isAuthenticated,
  isAuth => {
    if (isAuth) {
      emit('update:modelValue', false)
    }
  },
)
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.sign-in-modal {
  &__container {
    @include adaptiveValue('max-width', 420, 320, 1920);
  }
}
</style>
