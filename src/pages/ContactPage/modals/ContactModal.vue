<template>
  <BaseModal
    :show="modelValue"
    wrapperClasses="contact__inner"
    @close="close"
    @update:show="$emit('update:modelValue', $event)"
  >
    <div class="contact">
      <div class="contact__top">
        <div class="contact__title _l">
          {{ $t('Contact Us?') }}
        </div>
      </div>

      <form class="contact__form" @submit.prevent="handleSubmit">
        <div class="contact__block contact__block_margin">
          <div class="contact__subtitle _l">
            <span>{{ $t('Contact information') }}</span>
          </div>

          <div class="contact__content">
            <div class="contact__row">
              <BaseInput
                v-model="formData.name"
                :placeholder="$t('Name')"
                :error="errors.name"
                required
                class="contact__input"
                :disabled="isLoading"
                @blur="validateField('name')"
              />

              <BaseInput
                v-model="formData.email"
                type="email"
                :placeholder="$t('Email')"
                :error="errors.email"
                required
                class="contact__input"
                :disabled="isLoading"
                @blur="validateField('email')"
              />
            </div>

            <BaseTextarea
              v-model="formData.message"
              :placeholder="$t('Your message')"
              :rows="6"
              :maxLength="500"
              :error="errors.message"
              showCounter
              required
              class="contact__input"
              :disabled="isLoading"
              @blur="validateField('message')"
            />
          </div>
        </div>

        <div class="contact__block contact__block_margin">
          <div class="contact__subtitle"></div>

          <div class="contact__content">
            <BaseCheckbox
              v-model="formData.acceptTerms"
              class="contact__terms"
              :disabled="isLoading"
              :error="errors.acceptTerms"
              terms
            />
          </div>
        </div>

        <div class="contact__block">
          <div class="contact__subtitle _l">
            <span>{{ $t('Submit request') }}</span>
          </div>

          <div class="contact__content">
            <div v-if="submitError" class="contact__error _text-error">
              {{ submitError }}
            </div>

            <BaseButton
              class="contact__submit"
              type="submit"
              variant="primary"
              :disabled="isLoading || !isFormComplete"
            >
              {{ isLoading ? $t('Submitting') : $t('Submit') }}
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useToast } from '@/composables/useToast'
import api from '@/plugins/axios'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const toast = useToast()

const isLoading = ref(false)
const submitError = ref('')

const formData = reactive({
  name: '',
  email: '',
  message: '',
  acceptTerms: false,
})

const errors = reactive({
  name: '',
  email: '',
  message: '',
  acceptTerms: '',
})

const norm = value => String(value ?? '').trim()
const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.message = ''
  errors.acceptTerms = ''
  submitError.value = ''
}

const clearForm = () => {
  formData.name = ''
  formData.email = ''
  formData.message = ''
  formData.acceptTerms = false
}

const close = () => {
  clearErrors()
  clearForm()
  emit('update:modelValue', false)
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name') {
    const value = norm(formData.name)

    if (!value) {
      errors.name = t('Name is required')
      return
    }

    if (value.length < 2) {
      errors.name = t('Name must be at least 2 characters')
      return
    }

    if (!nameRe.test(value)) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'email') {
    const value = norm(formData.email)

    if (!value) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRe.test(value)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'message') {
    const value = norm(formData.message)

    if (!value) {
      errors.message = t('Message is required')
      return
    }

    if (value.length < 10) {
      errors.message = t('Message must be at least 10 characters')
    }

    return
  }

  if (field === 'acceptTerms') {
    if (!formData.acceptTerms) {
      errors.acceptTerms = t('You must accept the Terms of Use')
    }
  }
}

const validateForm = () => {
  clearErrors()

  validateField('name')
  validateField('email')
  validateField('message')
  validateField('acceptTerms')

  const hasErrors = Object.values(errors).some(Boolean)

  if (hasErrors) {
    submitError.value = t('Please fill in all fields correctly.')
    return false
  }

  return true
}

const isFormComplete = computed(() => {
  const name = norm(formData.name)
  const email = norm(formData.email)
  const message = norm(formData.message)

  return (
    name.length >= 2 &&
    nameRe.test(name) &&
    emailRe.test(email) &&
    message.length >= 10 &&
    formData.acceptTerms
  )
})

const handleSubmit = async () => {
  if (isLoading.value) return
  if (!validateForm()) return

  try {
    isLoading.value = true
    submitError.value = ''

    await api.post('/send-question', {
      name: norm(formData.name),
      email: norm(formData.email),
      message: norm(formData.message),
      transaction_id: 'transaction_id',
    })

    toast.success(t('Message sent successfully!'))
    clearForm()
    clearErrors()
    emit('update:modelValue', false)
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      t('Something went wrong')

    submitError.value = errorMessage
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => formData.name,
  () => {
    errors.name = ''
  },
)

watch(
  () => formData.email,
  () => {
    errors.email = ''
  },
)

watch(
  () => formData.message,
  () => {
    errors.message = ''
  },
)

watch(
  () => formData.acceptTerms,
  () => {
    validateField('acceptTerms')
  },
)

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      clearErrors()
      return
    }

    clearErrors()
    clearForm()
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.contact {
  width: 100%;
  margin: 0 auto;
  max-width: 652px;

  &__top {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    background-color: var(--bg-primary-color);
    @include adaptiveValue('border-radius', 12, 10);
    @include adaptiveValue('padding', 15, 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 10);
    }
  }

  &__title {
    text-align: center;
  }

  &__form {
  }

  &__block {
    &_margin {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 43, 25);
      }
    }

    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 70, 20, 1820, 768, 1);
    }
  }

  &__subtitle {
    flex: 0 1 32%;

    span {
      text-align: left;
      display: block;
      font-weight: 700;
      font-size: 14px;
      line-height: 19px;

      @media (min-width: $md5) {
        @include adaptiveValue('padding-bottom', 23, 15);
        border-bottom: 1px solid var(--bg-secondary-color);
      }

      @media (max-width: $md5) {
        margin-bottom: 10px;
      }
    }
  }

  &__content {
    flex: 0 1 68%;
    margin-left: auto;
  }

  &__row {
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 14, 10);
    }

    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }
  }

  &__input {
    :deep(.base-textarea),
    :deep(.base-input) {
      border: 1px solid var(--bg-secondary-color);

      &:focus,
      &:focus-within {
        border: 1px solid var(--hint-color);
      }
    }

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__terms {
  }

  &__error {
    white-space: pre-line;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__submit {
    width: 100%;
    position: relative;
    z-index: 1;
    @include adaptiveValue('min-height', 46, 45);
  }
}
</style>
