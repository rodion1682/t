<script setup>
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  placeholder: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'filter', // 'filter' (gray) or 'sort' (blue)
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const isOpen = ref(false)
const selectRef = ref(null)

onClickOutside(selectRef, () => {
  isOpen.value = false
})

const selectedOption = computed(() => {
  if (!props.modelValue) return null

  return props.options.find(
    option => String(option[props.optionValue]) === String(props.modelValue),
  )
})

const displayValue = computed(() => {
  return selectedOption.value
    ? selectedOption.value[props.optionLabel]
    : props.placeholder
})

const triggerClasses = computed(() => {
  if (props.variant === 'sort') {
    return `flex items-center gap-[10px] justify-between w-full h-[47px] rounded-[6px] px-[20px] text-[16px] 
            font-bold bg-accent text-white cursor-pointer transition
            ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}`
  }

  // filter (gray)
  return `flex items-center justify-between w-full h-[48px] rounded-[8px] px-[18px] text-[16px] 
          font-bold bg-[#F7F7F7] text-[rgba(3,0,27,0.5)] border border-[rgba(3,0,27,0.1)] cursor-pointer transition
          ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}`
})

const arrowColor = computed(() => {
  return props.variant === 'sort' ? '#fff' : 'rgba(3,0,27,0.5)'
})

const optionClasses = option => {
  const isSelected =
    String(option[props.optionValue]) === String(props.modelValue)

  const baseClasses =
    'px-[18px] py-[12px] text-[14px] cursor-pointer transition'

  if (isSelected) {
    return props.variant === 'sort'
      ? `${baseClasses} bg-accent text-white font-bold`
      : `${baseClasses} bg-[#E6EAF5] text-accent/70 font-bold`
  }

  return props.variant === 'sort'
    ? `${baseClasses} text-[#03001B] hover:bg-accent/70 hover:text-white`
    : `${baseClasses} text-[#03001B] hover:bg-[#F0F0F0]`
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = option => {
  emit('update:modelValue', option[props.optionValue])
  isOpen.value = false
}
</script>

<template>
  <div :class="['relative', props.fullWidth ? 'w-full' : '']">
    <div ref="selectRef">
      <div
        :class="triggerClasses"
        tabindex="0"
        @click="toggleDropdown"
        :aria-expanded="isOpen"
        role="combobox"
      >
        <span class="truncate">{{ displayValue }}</span>
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="[isOpen ? 'rotate-180' : '', 'transition-transform']"
        >
          <path
            d="M6 7c-.22 0-.44-.08-.6-.24L.24 1.6A.85.85 0 0 1 .24.6C.4.24.9.24 1.2.6L6 5.4 10.8.6c.3-.36.8-.36 1.04 0 .16.36.16.96 0 1.2l-5.16 5.16A.85.85 0 0 1 6 7z"
            :fill="arrowColor"
          />
        </svg>
      </div>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute left-0 right-0 z-50 mt-1 max-h-[260px] overflow-auto rounded-[8px] border border-[rgba(3,0,27,0.1)] bg-accent shadow-lg"
        >
          <div
            v-for="option in props.options"
            :key="option[props.optionValue]"
            :class="optionClasses(option)"
            @click="selectOption(option)"
          >
            {{ option[optionLabel] }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
