<template>
  <div class="relative mx-auto mt-12 max-w-[1344px] flex-col px-8">
    <!-- Back button -->
    <BackButton
      @click="handleBack"
      class="absolute -top-8 left-8 z-[1] sm:top-0"
    >
      {{ $t(`Back`) }}
    </BackButton>

    <!-- Centered Form -->
    <div
      class="relative mb-20 flex items-start justify-center sm:relative sm:mt-0"
    >
      <div
        class="w-full rounded-[20px] bg-[#2E303B] p-6 md:max-w-[514px] md:p-[48px_52px]"
      >
        <h2 class="mb-6 text-2xl text-primary md:mb-10 md:text-3xl">
          {{ $t(`Reset Password`) }}
        </h2>

        <form @submit.prevent="handleReset" class="w-full">
          <div class="space-y-[10px]">
            <!-- Password Input -->
            <BaseInput
              v-model="password"
              type="password"
              name="password"
              :placeholder="$t('New Password')"
              required
            />

            <!-- Password Confirmation Input -->
            <BaseInput
              v-model="passwordConfirmation"
              type="password"
              name="password_confirmation"
              :placeholder="$t('Confirm New Password')"
              required
            />
          </div>

          <!-- Error Message -->
          <p v-if="errorMessage" class="mt-4 text-red-500">
            {{ errorMessage }}
          </p>

          <div class="mt-[42px]">
            <!-- Reset Password Button -->
            <BaseButton type="submit" :disabled="isLoading">
              <span v-if="isLoading">{{ $t(`Resetting...`) }}</span>
              <span v-else>{{ $t(`Reset Password`) }}</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import BackButton from '@/components/BackButton.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useUserStore } from '@/stores/user'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Get the token and email from the URL
const token = ref(route.query.token)
const email = ref(route.query.email)

onMounted(() => {
  if (!token.value || !email.value) {
    errorMessage.value = 'Invalid password reset link.'
  }
})

const handleReset = async () => {
  errorMessage.value = ''
  isLoading.value = true

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match.'
    isLoading.value = false
    return
  }

  try {
    await userStore.reset(token.value, email.value, password.value)
    toast.success('Your password has been reset successfully.')
    router.push({ name: 'LoginPage' }) // Redirect to login
  } catch (error) {
    errorMessage.value = error
  } finally {
    isLoading.value = false
  }
}

// Handle back navigation
const handleBack = () => {
  router.push({ name: 'LoginPage' })
}
</script>
