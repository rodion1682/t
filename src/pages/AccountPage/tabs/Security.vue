<template>
  <div class="security">
    <div class="security__title _md">
      {{ $t('Security') }}
    </div>
    <div class="security__block">
      <div class="security__subtitle _md">
        {{ $t('Temporarily block my account') }}
      </div>
      <div class="security__text _text-primary">
        {{
          $t(
            'If you believe that your account has been compromised you can temporarily block it. We will unblock your account contacting our support.',
          )
        }}
      </div>

      <BaseButton
        class="security__btn"
        variant="reset"
        :disabled="userStore.isLoading"
        @click="onBlockAccount"
      >
        {{ $t('Block my account') }}
      </BaseButton>
    </div>

    <div class="security__block">
      <div class="security__subtitle _md">
        {{ $t('Delete account') }}
      </div>
      <BaseButton
        class="security__btn"
        variant="reset"
        :disabled="userStore.isLoading"
        @click="onDeleteAccount"
      >
        {{ $t('Delete my account') }}
      </BaseButton>
    </div>
    <div class="security__block">
      <div class="security__subtitle _md">
        {{ $t('Active sessions') }}
      </div>
      <div class="security__text _text-primary">
        {{ $t('You have 1 active sessions') }}
      </div>
      <BaseButton class="security__btn" variant="reset" @click="onLogout">
        {{ $t('Log out') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const onLogout = async () => {
  await authStore.logout()
  router.push({ name: 'HomePage' })
}

const onBlockAccount = async () => {
  const ok = confirm(t('Are you sure you want to block your account?'))
  if (!ok) return

  try {
    await userStore.blockAccount()
    toast.success(t('Your account has been blocked'))
    await onLogout()
  } catch (e) {
    toast.error(userStore.error || t('Failed to block account'))
  }
}

const onDeleteAccount = async () => {
  const ok = confirm(
    t(
      'This action is irreversible. Do you really want to delete your account?',
    ),
  )
  if (!ok) return

  try {
    await userStore.deleteAccount()
    toast.success(t('Your account has been deleted'))
    await onLogout()
  } catch (e) {
    toast.error(userStore.error || t('Failed to delete account'))
  }
}
</script>
