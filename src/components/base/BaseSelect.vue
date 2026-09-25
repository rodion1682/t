<template>
  <div
    ref="rootRef"
    class="base-select-wrap"
    :class="{
      'is-disabled': disabled || loading,
    }"
  >
    <div
      v-if="label"
      class="base-select__field-label"
      :class="{ 'has-error': !!error }"
    >
      {{ label }}
    </div>

    <div
      :id="id"
      class="base-select"
      :class="containerClasses"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled || loading"
      :aria-controls="`${id}-listbox`"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="base-select__value">
        <template v-if="hasValue">
          <span v-if="selectedOption?.icon" class="base-select__icon-wrapper">
            <SvgIcon :icon="selectedOption.icon" class="base-select__icon" />
          </span>

          <span class="base-select__value-text">
            {{ displayValue }}
          </span>
        </template>

        <span v-else class="base-select__placeholder">
          {{ placeholder }}
        </span>
      </div>

      <span class="base-select__caret">
        <span v-if="loading" class="base-select__spinner" />

        <SvgIcon
          v-else
          :icon="ChevronDownIcon"
          class="base-select__caret-icon"
          :class="{ 'is-open': isOpen }"
        />
      </span>
    </div>

    <Transition name="select-dropdown">
      <div v-if="isOpen" ref="dropdownRef" class="base-select__dropdown">
        <div
          :id="`${id}-listbox`"
          ref="listRef"
          class="base-select__options"
          role="listbox"
        >
          <button
            v-for="(option, index) in options"
            :key="getOptionKey(option, index)"
            type="button"
            class="base-select__option"
            :class="{
              'is-active': index === selectedIndex,
              'is-selected': isSelected(option),
            }"
            :data-index="index"
            role="option"
            :aria-selected="isSelected(option)"
            @mouseenter="selectedIndex = index"
            @click.stop="selectOption(option)"
          >
            <span v-if="option?.icon" class="base-select__option-icon-wrap">
              <SvgIcon :icon="option.icon" class="base-select__option-icon" />
            </span>

            <span class="base-select__option-label">
              {{ getOptionLabel(option) }}
            </span>

            <span v-if="isSelected(option)" class="base-select__selected-mark">
              ✓
            </span>
          </button>

          <div v-if="!options.length" class="base-select__empty">
            {{ $t('No options available') }}
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="error" class="base-select__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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

  disabled: {
    type: Boolean,
    default: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  label: {
    type: String,
    default: '',
  },

  error: {
    type: String,
    default: '',
  },

  regular: {
    type: Boolean,
    default: false,
  },

  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const rootRef = ref(null)
const dropdownRef = ref(null)
const listRef = ref(null)

const isOpen = ref(false)
const selectedIndex = ref(-1)

const selectedOption = computed(() => {
  if (
    props.modelValue === '' ||
    props.modelValue === null ||
    props.modelValue === undefined
  ) {
    return null
  }

  return props.options.find(option => isSelected(option)) || null
})

const hasValue = computed(() => {
  return selectedOption.value !== null
})

const displayValue = computed(() => {
  if (!selectedOption.value) {
    return ''
  }

  return getOptionLabel(selectedOption.value)
})

const containerClasses = computed(() => ({
  'is-open': isOpen.value,
  'is-filled': hasValue.value,
  'has-error': !!props.error,
  'is-disabled': props.disabled || props.loading,
  regular: props.regular,
}))

const getOptionValue = option => {
  if (option === null || option === undefined) {
    return ''
  }

  if (typeof option !== 'object') {
    return option
  }

  return option[props.optionValue]
}

const getOptionLabel = option => {
  if (option === null || option === undefined) {
    return ''
  }

  if (typeof option !== 'object') {
    return String(option)
  }

  return String(option[props.optionLabel] ?? '')
}

const getOptionKey = (option, index) => {
  const value = getOptionValue(option)

  if (value === '' || value === null || value === undefined) {
    return index
  }

  return String(value)
}

const isSelected = option => {
  return String(getOptionValue(option)) === String(props.modelValue)
}

const scrollActiveIntoView = async () => {
  await nextTick()

  if (!listRef.value || selectedIndex.value < 0) {
    return
  }

  const element = listRef.value.querySelector(
    `[data-index="${selectedIndex.value}"]`,
  )

  element?.scrollIntoView({
    block: 'nearest',
  })
}

const open = async () => {
  if (props.disabled || props.loading || !props.options.length) {
    return
  }

  isOpen.value = true

  const index = props.options.findIndex(option => isSelected(option))

  selectedIndex.value = index >= 0 ? index : 0

  await scrollActiveIntoView()
}

const close = () => {
  isOpen.value = false
  selectedIndex.value = -1
}

const toggle = async () => {
  if (props.disabled || props.loading) {
    return
  }

  if (isOpen.value) {
    close()
    return
  }

  await open()
}

const selectOption = option => {
  if (option === null || option === undefined) {
    return
  }

  const value = getOptionValue(option)

  emit('update:modelValue', value)

  emit('change', value)

  close()
}

const moveSelection = async direction => {
  if (!props.options.length) {
    return
  }

  if (!isOpen.value) {
    await open()
    return
  }

  const nextIndex = selectedIndex.value + direction

  selectedIndex.value = Math.max(
    0,
    Math.min(nextIndex, props.options.length - 1),
  )

  await scrollActiveIntoView()
}

const onKeydown = async event => {
  if (props.disabled || props.loading) {
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    if (!isOpen.value) {
      await open()
      return
    }

    if (selectedIndex.value >= 0 && props.options[selectedIndex.value]) {
      selectOption(props.options[selectedIndex.value])
    }

    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    await moveSelection(1)

    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    await moveSelection(-1)

    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()

    close()

    return
  }

  if (event.key === 'Tab') {
    close()
  }
}

const onClickOutside = event => {
  if (rootRef.value && !rootRef.value.contains(event.target)) {
    close()
  }
}

const onGlobalKeydown = event => {
  if (isOpen.value && event.key === 'Escape') {
    close()
  }
}

watch(
  () => props.disabled,
  value => {
    if (value) {
      close()
    }
  },
)

watch(
  () => props.loading,
  value => {
    if (value) {
      close()
    }
  },
)

watch(
  () => props.options,
  () => {
    if (isOpen.value && !props.options.length) {
      close()
    }
  },
  {
    deep: true,
  },
)

watch(
  () => props.modelValue,
  async () => {
    if (!isOpen.value) {
      return
    }

    const index = props.options.findIndex(option => isSelected(option))

    if (index >= 0) {
      selectedIndex.value = index

      await scrollActiveIntoView()
    }
  },
)

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)

  document.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)

  document.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-select-wrap {
  position: relative;

  width: 100%;

  &.is-disabled {
    opacity: 0.5;
  }
}

.base-select {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  gap: 12px;

  @include adaptiveValue('min-height', 50, 40);

  @include adaptiveValue('padding-left', 18, 15);

  @include adaptiveValue('padding-right', 18, 15);

  @include adaptiveValue('border-radius', 28, 20);

  border: 1px solid transparent;

  background-color: var(--merino);

  box-shadow: inset 0 0 0 2px #dcd3c4;

  outline: none;

  cursor: pointer;

  transition:
    box-shadow 0.3s ease,
    background-color 0.3s ease,
    opacity 0.3s ease;

  &.is-open,
  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--copper);
  }

  &.has-error {
    box-shadow: inset 0 0 0 2px var(--hairy-heath);
  }

  &.is-disabled {
    pointer-events: none;
    cursor: not-allowed;
  }

  @media (any-hover: hover) {
    &:hover:not(.is-disabled) {
      box-shadow: inset 0 0 0 2px var(--copper);
    }
  }

  &__field-label {
    margin-bottom: 8.7px;

    font-family: var(--font-ibm-plex);

    font-size: 14px;
    font-weight: 400;
    line-height: 21.7px;

    color: var(--soya-bean);

    transition: color 0.3s ease;

    &.has-error {
      color: var(--hairy-heath);
    }
  }

  &__value {
    display: flex;
    flex: 1 1 auto;
    align-items: center;

    min-width: 0;

    gap: 9px;

    overflow: hidden;

    font-family: var(--font-ibm-plex);

    font-size: 15px;
    font-weight: 400;
    line-height: 1.25;

    color: var(--cod-gray);
  }

  &__value-text,
  &__placeholder {
    display: block;

    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__placeholder {
    font-size: 16px;

    color: var(--zorba);
  }

  &__icon-wrapper {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;
  }

  &__icon {
    width: 18px;
    height: 18px;

    color: var(--kelp);
  }

  &__caret {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;

    pointer-events: none;

    color: var(--kelp);
  }

  &__caret-icon {
    width: 14px;
    height: 8px;

    color: inherit;

    transition:
      transform 0.3s ease,
      color 0.3s ease;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }

    :deep(path) {
      stroke: currentColor;
    }

    &.is-open {
      transform: rotate(180deg);

      color: var(--copper);
    }
  }

  &__spinner {
    width: 16px;
    height: 16px;

    border: 2px solid var(--cod-gray-16);

    border-top-color: var(--copper);

    border-radius: 50%;

    animation: select-spin 0.8s linear infinite;
  }

  &__dropdown {
    position: absolute;
    z-index: 30;

    top: calc(100% + 8px);
    left: 0;

    width: 100%;
    min-width: 100%;
    max-height: 280px;

    padding: 7px;

    border: 1px solid var(--double-spanish-white);

    border-radius: 20px;

    background: var(--merino);

    box-shadow:
      0 16px 40px rgba(32, 30, 29, 0.14),
      0 4px 12px rgba(32, 30, 29, 0.07);

    overflow-x: hidden;
    overflow-y: auto;

    transform-origin: top;

    scrollbar-width: thin;
    scrollbar-color: var(--copper) var(--janna);

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--janna);

      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--copper);

      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--tuscany);
    }
  }

  &__options {
    display: flex;
    flex-direction: column;

    gap: 3px;
  }

  &__option {
    display: flex;
    align-items: center;

    width: 100%;
    min-height: 42px;

    gap: 10px;

    padding: 9px 12px;

    border: 1px solid transparent;

    border-radius: 14px;

    background: transparent;

    font-family: var(--font-ibm-plex);

    font-size: 14px;
    font-weight: 400;
    line-height: 1.25;

    color: var(--cod-gray);

    text-align: left;

    cursor: pointer;

    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;

    &.is-active:not(.is-selected) {
      background: var(--copper-10);

      border-color: rgba(198, 113, 57, 0.18);
    }

    &.is-selected {
      background: var(--feta);

      border-color: rgba(114, 129, 87, 0.25);

      color: var(--kelp);
    }

    @media (any-hover: hover) {
      &:hover {
        background: var(--copper-10);

        border-color: rgba(198, 113, 57, 0.18);
      }

      &.is-selected:hover {
        background: var(--feta);

        border-color: var(--limed-ash);
      }
    }
  }

  &__option-icon-wrap {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;
  }

  &__option-icon {
    width: 17px;
    height: 17px;

    color: var(--kelp);
  }

  &__option-label {
    flex: 1 1 auto;

    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__selected-mark {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;

    border-radius: 50%;

    background: var(--limed-ash);

    font-family: var(--font-ibm-plex);

    font-size: 11px;
    font-weight: 700;

    color: var(--feta);
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 50px;

    padding: 10px 12px;

    font-family: var(--font-ibm-plex);

    font-size: 14px;
    font-weight: 400;

    color: var(--makara);

    text-align: center;
  }

  &__error {
    margin-top: 8px;
  }
}

.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;

  transform: translateY(-6px) scale(0.985);
}

.select-dropdown-enter-to,
.select-dropdown-leave-from {
  opacity: 1;

  transform: translateY(0) scale(1);
}

@keyframes select-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
