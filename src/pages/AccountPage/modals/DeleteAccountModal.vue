<template>
  <BaseModal
    v-model:show="isOpen"
    modal-container-class="delete-account-modal__inner"
    :persistent="isDeleting"
    @close="handleClose"
  >
    <div class="delete-account-modal">
      <h2 class="delete-account-modal__title">
        {{ $t('Are you sure you want to delete your account?') }}
      </h2>

      <p class="delete-account-modal__text">
        {{ $t('This action cannot be undone.') }}
      </p>

      <div class="delete-account-modal__actions">
        <BaseButton
          class="delete-account-modal__button"
          type="button"
          variant="bordered"
          :disabled="isDeleting"
          @click="handleClose"
        >
          {{ $t('Cancel') }}
        </BaseButton>

        <BaseButton
          class="delete-account-modal__button"
          type="button"
          variant="primary"
          :disabled="isDeleting"
          @click="handleDelete"
        >
          {{ isDeleting ? $t('Deleting') + '...' : $t('Delete') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useToast } from '@/composables/useToast'

import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:show', 'close', 'success'])

const { t } = useI18n()

const router = useRouter()
const toast = useToast()

const userStore = useUserStore()

const isDeleting = ref(false)

const isOpen = computed({
  get() {
    return props.show
  },

  set(value) {
    emit('update:show', value)
  },
})

const handleClose = () => {
  if (isDeleting.value) {
    return
  }

  emit('update:show', false)
  emit('close')
}

const handleDelete = async () => {
  if (isDeleting.value) {
    return
  }

  try {
    isDeleting.value = true

    await userStore.deleteAccount()

    emit('update:show', false)
    emit('success')

    toast.success(t('Account deleted successfully'))

    await router.push({
      name: 'HomePage',
    })
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        userStore.error ||
        t('Failed to delete account'),
    )
  } finally {
    isDeleting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.delete-account-modal {
  width: 100%;

  text-align: center;

  &__title {
    max-width: 420px;

    margin: 0 auto 14px;

    @include sg-26-700;

    color: var(--cod-gray);
  }

  &__text {
    max-width: 360px;

    margin: 0 auto;

    @include ibm-14-400;

    color: var(--makara);
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 14px;

    max-width: 380px;

    margin: 30px auto 0;
  }

  &__button {
    width: 100%;

    min-height: 46px;
  }
}

:global(.delete-account-modal__inner) {
  max-width: 520px;
}

@media (max-width: $md5) {
  .delete-account-modal {
    &__actions {
      grid-template-columns: 1fr;
    }
  }
}
</style>
