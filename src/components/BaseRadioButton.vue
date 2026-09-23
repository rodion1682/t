<template>
  <div :class="attrs.class">
    <div :class="containerClasses" @click="select">
      <div :class="radioClasses">
        <transition name="fade">
          <div
            v-if="isSelected"
            class="absolute inset-[3px] rounded-full bg-accent"
          ></div>
        </transition>
      </div>
      <label :class="labelClasses">
        <slot></slot>
      </label>
    </div>
  </div>
</template>

<script setup>
import { twMerge } from 'tailwind-merge'
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  value: {
    type: [String, Number, Boolean],
    required: true,
  },
  containerClasses: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const isSelected = computed(() => props.modelValue === props.value)

const containerClasses = computed(() =>
  twMerge('flex cursor-pointer items-center gap-3', props.containerClasses),
)

const radioClasses = computed(() => {
  const base =
    'relative h-6 w-6 min-w-6 cursor-pointer rounded-full border transition-all flex-shrink-0'

  const stateClasses = isSelected.value
    ? 'border-accent bg-transparent'
    : 'border-white bg-transparent'

  return twMerge(base, stateClasses)
})

const labelClasses = computed(() =>
  twMerge('cursor-pointer text-sm text-primary', attrs.labelClasses),
)

const select = () => {
  // This custom logic allows toggling the radio button off, which is useful for filters.
  if (isSelected.value) {
    emit('update:modelValue', '') // Emit empty value to clear the filter
  } else {
    emit('update:modelValue', props.value)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
