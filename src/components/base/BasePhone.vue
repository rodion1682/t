<template>
  <div v-if="isLoaded" class="base-phone-wrap" :class="attrs.class">
    <div class="base-input" :class="containerClasses">
      <vue-tel-input
        ref="phoneRef"
        v-bind="attrsExceptClass"
        :model-value="modelValue"
        :default-country="computedDefaultCountry"
        :only-countries="allowedCountries"
        mode="international"
        :auto-format="true"
        :valid-characters-only="true"
        :disabled="disabled || !isLoaded"
        :dropdown-options="{
          showDialCodeInList: true,
          showDialCodeInSelection: false,
          showFlags: true,
          showSearchBox: false,
          tabindex: 0,
        }"
        :input-options="inputOptions"
        :input-id="id"
        @on-input="onInput"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />

      <!-- Fake placeholder -->
      <div class="base-input__placeholder" :class="{ 'is-raised': isFilled }">
        {{ placeholder }}
      </div>

      <!-- suffix slot (optional) -->
      <div v-if="$slots.suffix" class="base-input__suffix">
        <slot name="suffix" />
      </div>
    </div>

    <div v-if="error" class="base-input__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { useCountriesStore } from '@/stores/countries'
import { useThrottleFn } from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { VueTelInput } from 'vue-tel-input'
import { toast } from 'vue3-toastify'

const props = defineProps({
  modelValue: { type: String, default: '' },

  placeholder: { type: String, default: 'Phone' },

  defaultCountry: { type: String, default: null },

  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false }, // vue-tel-input doesn't truly support readonly well
  required: { type: Boolean, default: false },
  regular: { type: Boolean, default: false },
  error: { type: String, default: '' },

  id: {
    type: String,
    default: () => `phone-${Math.random().toString(36).substring(2, 9)}`,
  },

  // aligns text (same API as BaseInput)
  variant: {
    type: String,
    default: 'left',
    validator: v => ['left', 'center'].includes(v),
  },
})

const emit = defineEmits(['update:modelValue', 'phone-data'])

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const countriesStore = useCountriesStore()

const phoneRef = ref(null)
const isFocused = ref(false)
const isDropdownOpen = ref(false)

const attrsExceptClass = computed(() => {
  const { class: _c, ...rest } = attrs
  return rest
})

const allowedCountries = computed(() => {
  return countriesStore.countries.length
    ? countriesStore.countries.map(c => c.iso.toLowerCase())
    : []
})

const computedDefaultCountry = ref(null)

watch(
  () => allowedCountries.value,
  list => {
    if (list.length && !computedDefaultCountry.value) {
      computedDefaultCountry.value = props.defaultCountry
        ? props.defaultCountry.toLowerCase()
        : list[0]
    }
  },
  { immediate: true },
)

watch(
  () => props.defaultCountry,
  v => {
    if (!allowedCountries.value.length) return
    computedDefaultCountry.value = v
      ? v.toLowerCase()
      : allowedCountries.value[0]
  },
)

const isLoaded = computed(() => allowedCountries.value.length > 0)

const inputOptions = computed(() => ({
  placeholder: '', // IMPORTANT: keep real placeholder empty, we use fake placeholder
  required: props.required,
  disabled: props.disabled || !isLoaded.value,
}))

const hasValue = computed(() => !!props.modelValue?.trim())

const isFilled = computed(
  () => isFocused.value || isDropdownOpen.value || hasValue.value,
)

const containerClasses = computed(() => ({
  'is-focused': isFocused.value || isDropdownOpen.value,
  'is-filled': isFilled.value,
  'has-error': !!props.error,
  'is-disabled': props.disabled || !isLoaded.value,
  regular: props.regular,
}))

const throttledToast = useThrottleFn(message => toast.error(message), 500)

const onInput = (number, phoneObject) => {
  emit('update:modelValue', number || '')

  if (!phoneObject || !phoneObject.countryCode) {
    emit('phone-data', null)
    return
  }

  // block unsupported countries (if you need it)
  const code = phoneObject.countryCode?.toLowerCase()
  if (
    allowedCountries.value.length &&
    code &&
    !allowedCountries.value.includes(code)
  ) {
    throttledToast('This country is not supported')
    emit('update:modelValue', '')
    emit('phone-data', null)
    return
  }

  emit('phone-data', {
    phone: phoneObject.number || '',
    phoneCountryCode: phoneObject.countryCallingCode || '',
    nationalNumber: phoneObject.nationalNumber?.replace(/\s+/g, '') || '',
    isValid: !!phoneObject.valid,
  })
}

// Dropdown positioning (your existing logic, cleaned a bit)
const fixDropdownPosition = () => {
  const dropdownList = document.querySelector('.vti__dropdown-list')
  const rootEl = phoneRef.value?.$el
  if (!dropdownList || !rootEl) return

  dropdownList.style.position = 'fixed'
  dropdownList.style.zIndex = '9999'

  const rect = rootEl.getBoundingClientRect()
  dropdownList.style.top = `${rect.bottom + 2}px`
  dropdownList.style.left = `${rect.left}px`
  dropdownList.style.width = `${rect.width}px`

  dropdownList.style.opacity = '1'
  dropdownList.style.transition = 'opacity 0.15s ease-in-out'
}

const onDropdownOpen = () => {
  isDropdownOpen.value = true
  setTimeout(fixDropdownPosition, 10)
  document.addEventListener('mousedown', handleClickOutside)
}

const onDropdownClose = () => {
  isDropdownOpen.value = false
  document.removeEventListener('mousedown', handleClickOutside)
}

const handleClickOutside = e => {
  const rootEl = phoneRef.value?.$el
  const dropdown = document.querySelector('.vti__dropdown-list')
  if (!rootEl || !dropdown) return

  if (!rootEl.contains(e.target) && !dropdown.contains(e.target)) {
    const trigger = rootEl.querySelector('.vti__dropdown')
    if (trigger?.classList.contains('open')) trigger.click()
  }
}

const focusInternalInput = () => {
  const rootEl = phoneRef.value?.$el
  const input = rootEl?.querySelector('input')
  input?.focus()
}

onMounted(async () => {
  if (!countriesStore.countries.length) {
    try {
      await countriesStore.fetchCountries()
    } catch (e) {
      console.error('Error fetching countries:', e)
    }
  }

  // track focus on inner input
  const rootEl = phoneRef.value?.$el
  const input = rootEl?.querySelector('input')
  if (input) {
    input.addEventListener('focus', () => (isFocused.value = true))
    input.addEventListener('blur', () => (isFocused.value = false))
  }

  window.addEventListener('resize', onViewportMove)
  window.addEventListener('scroll', onViewportMove, true)
})

const onViewportMove = () => {
  if (document.querySelector('.vti__dropdown.open')) fixDropdownPosition()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportMove)
  window.removeEventListener('scroll', onViewportMove, true)
  document.removeEventListener('mousedown', handleClickOutside)
})

defineExpose({ focus: focusInternalInput })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-phone-wrap {
  width: 100%;
}

.base-input {
  @include adaptiveValue('min-height', 44, 40);
  @include adaptiveValue('border-radius', 12, 10);
  position: relative;
  display: flex;
  align-items: center;
  border-color: var(--border-color);
  border-style: solid;
  border-width: 1px;
  transition: all 0.3s ease;
  background-color: var(--bg-primary-color);

  &.is-focused {
    border-color: var(--hint-color);
  }

  &.has-error {
    border-color: var(--error-color);
  }
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &.regular {
    gap: 20px;
    flex-direction: row-reverse;
    justify-content: space-between;

    background: none !important;
    @media (max-width: $md2) {
      flex-direction: column-reverse;
      gap: 6px;
    }
    &.is-focused {
      :deep(.vue-tel-input) {
        background:
          linear-gradient(#13161f, #13161f) padding-box,
          linear-gradient(180deg, #2d3552 0%, #0957ff 100%) border-box;
      }
    }
    &.has-error {
      :deep(.vue-tel-input) {
        background:
          linear-gradient(#13161f, #13161f) padding-box,
          linear-gradient(0deg, #ef4444 0%, #1e2338 100%) border-box;
      }
    }
    &.is-disabled {
      opacity: 1;
      pointer-events: none;
    }
    .base-input__placeholder {
      font-style: 14px;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.5);
      position: relative;
      display: block;
      text-align: left;
      margin-right: auto;
      line-height: 130%;
      top: 0 !important;
      transform: translate(0px, 0px) !important;
      margin-right: auto !important;
      left: 0 !important;
    }
    :deep(.vue-tel-input) {
      border-radius: 6px;
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      border-color: transparent;
      border-style: solid;
      background:
        linear-gradient(#13161f, #13161f) padding-box,
        linear-gradient(180deg, #2d3552 0%, #1e2338 100%) border-box;
      transition: all 0.3s ease;
      @media (min-width: $md2) {
        @include adaptiveValue('min-width', 368, 300);
        @include adaptiveValue('max-width', 368, 300);
      }
    }
  }
  &__suffix {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    @include adaptiveValue('right', 14, 10);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 2;
  }

  &__placeholder {
    position: absolute;
    pointer-events: none;
    left: 60px;
    top: 50%;
    transform: translateY(-50%);
    font-style: 12px;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    z-index: 1;

    &.is-raised {
      color: rgba(255, 255, 255, 0.5);
      top: 5px;
      transform: translateY(0);
      font-style: 12px;
    }
  }

  &__error {
    margin-top: 8px;
  }
}

.base-input :deep(.vue-tel-input) {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  box-shadow: none;
}

.base-input :deep(.vti__dropdown) {
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;

  @include adaptiveValue('padding-left', 14, 10);
  padding-right: 8px;
}

.base-input :deep(.vti__input) {
  background: transparent;
  border: none !important;
  outline: none;
  width: 100%;
  height: 100%;
  box-shadow: none !important;
  font-family: var(--font-open-sans);
  font-weight: 400;
  font-style: 14px;
  color: var(--primary-color);
  @include adaptiveValue('padding-left', 20, 10);
  @include adaptiveValue('padding-right', 20, 10);
  @include adaptiveValue('padding-top', 16, 140);
  padding-bottom: 0px;

  padding-left: 0px;

  &::placeholder {
    color: transparent;
  }
}

.base-input.is-centered :deep(.vti__input) {
  text-align: center;
}

.base-input :deep(.vti__input) {
  @include adaptiveValue('padding-right', 48, 40);
}
.base-input :deep(.vti__phone) {
  padding-top: 20px;
}

.base-input :deep(.vti__dropdown-list) {
  overflow-y: auto;
  border-radius: 6px;
  background: var(--bg-primary-color);
  opacity: 0;
  transition: all 0.3s ease 0s;
  height: 300px;
}

.base-input :deep(.vti__dropdown-item) {
  color: var(--primary-color);
  background: transparent;
  transition: background-color 0.2s ease;
  padding: 11px;
}

.base-input :deep(.vti__dropdown-item.highlighted),
.base-input :deep(.vti__dropdown-item:hover) {
  background: rgba(9, 87, 255, 0.18);
}

/* autofill */
.base-input :deep(input:-webkit-autofill),
.base-input :deep(input:-webkit-autofill:hover),
.base-input :deep(input:-webkit-autofill:focus),
.base-input :deep(input:-webkit-autofill:active) {
  -webkit-text-fill-color: var(--primary-color);
  -webkit-box-shadow: 0 0 0 1000px transparent inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
