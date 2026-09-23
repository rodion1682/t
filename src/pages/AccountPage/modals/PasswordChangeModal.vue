<template>
  <BaseModal
    :show="show"
    :wrapper-classes="['password-change-modal__inner']"
    @close="handleClose"
  >
    <div class="password-change-modal">
      <PasswordChange @success="handleSuccess" />
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'
import PasswordChange from '@/pages/AccountPage/tabs/PasswordChange.vue'

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

const handleSuccess = () => {
  handleClose()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

</style>
